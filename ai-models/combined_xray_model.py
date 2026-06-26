import torch
import torchxrayvision as xrv
import torchvision.transforms
from transformers import ViTImageProcessor, ViTForImageClassification, CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np

# ---------- GATEKEEPER: CLIP - confirms the image is a valid chest X-ray ----------
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

CANDIDATE_LABELS = [
    "a chest x-ray image",
    "a normal photo of an object, person, or scene"
]

def is_valid_xray(image, confidence_threshold=60):
    inputs = clip_processor(text=CANDIDATE_LABELS, images=image, return_tensors="pt", padding=True)
    outputs = clip_model(**inputs)
    probs = outputs.logits_per_image.softmax(dim=1)[0]
    xray_score = probs[0].item() * 100
    return {
        "is_valid_xray": xray_score >= confidence_threshold,
        "xray_confidence": round(xray_score, 2)
    }


# ---------- CROP STEP: focuses the model on the lung region ----------
def crop_to_lung_region(image):
    img_pil = image.convert("L")
    img_array = np.array(img_pil)
    img_array = xrv.datasets.normalize(img_array, 255)
    img_array = img_array[None, :, :]
    crop_transform = torchvision.transforms.Compose([xrv.datasets.XRayCenterCrop()])
    return crop_transform(img_array)


# ---------- MODEL 1: Pneumonia binary classifier ----------
pneumonia_model_name = "nickmuchi/vit-finetuned-chest-xray-pneumonia"
pneumonia_processor = ViTImageProcessor.from_pretrained(pneumonia_model_name)
pneumonia_model = ViTForImageClassification.from_pretrained(pneumonia_model_name)

# ---------- MODEL 2: torchxrayvision multi-disease model ----------
xrv_model = xrv.models.DenseNet(weights="densenet121-res224-chex")
xrv_model.eval()

print("All models loaded successfully")


# ---------- TIER 1: validated diseases shown to user, feeds triage ----------
TIER1_THRESHOLDS = {
    "Pneumonia": 75,
    "Atelectasis": 75,
    "Consolidation": 75,
    "Edema": 75,
    "Effusion": 75,
    "Cardiomegaly": 75,
}

TIER2_DISEASES = [
    "Pneumothorax", "Lung Lesion", "Fracture", "Lung Opacity", "Enlarged Cardiomediastinum"
]

WARNING_ZONE_MIN = 50  # below this = clearly clean; above this but under threshold = worth noting


def get_xray_results(combined_result):
    """Returns Tier 1 results with three zones: crossed, warning, clean."""
    user_facing = []
    for disease, score in combined_result.items():
        if disease in TIER1_THRESHOLDS:
            threshold = TIER1_THRESHOLDS[disease]
            if score >= threshold:
                zone = "crossed"
            elif score >= WARNING_ZONE_MIN:
                zone = "warning"
            else:
                zone = "clean"
            user_facing.append({
                "disease": disease,
                "score": round(score, 2),
                "threshold": threshold,
                "crossed": score >= threshold,
                "zone": zone
            })
    return user_facing


def get_xray_summary(combined_result):
    tier1_results = get_xray_results(combined_result)
    crossed = [r for r in tier1_results if r["crossed"]]
    count_crossed = len(crossed)

    if count_crossed == 0:
        max_entry = max(tier1_results, key=lambda r: r["score"])
        return {
            "status": "send_to_triage",
            "composite_input": max_entry["score"],
            "source_disease": max_entry["disease"],
            "all_scores": tier1_results
        }
    elif count_crossed == 1:
        return {
            "status": "xray_single_urgent",
            "urgent_disease": crossed[0],
            "all_scores": tier1_results
        }
    else:
        return {
            "status": "xray_multi_emergency",
            "urgent_diseases": crossed,
            "all_scores": tier1_results
        }


def build_dashboard_message(summary):
    status = summary["status"]

    if status == "invalid_image":
        return summary["message"]

    if status == "send_to_triage":
        disease = summary["source_disease"]
        score = summary["composite_input"]
        return (f"X-ray screening complete. No single condition crossed the urgent threshold "
                f"(highest signal: {disease} at {score}%). This result is being sent to the "
                f"overall triage system, which will combine it with your other screening "
                f"results to determine the final recommendation.")

    if status == "xray_single_urgent":
        disease = summary["urgent_disease"]["disease"]
        score = summary["urgent_disease"]["score"]
        return (f"X-ray screening detected {disease} at {score}%, crossing the urgent threshold. "
                f"This result is shown directly on your dashboard as Urgent Care — please seek "
                f"medical attention. This bypasses the triage system since a single confirmed "
                f"finding takes priority on its own.")

    if status == "xray_multi_emergency":
        names = ", ".join(f"{d['disease']} ({d['score']}%)" for d in summary["urgent_diseases"])
        return (f"X-ray screening detected multiple conditions crossing the urgent threshold: "
                f"{names}. This is flagged as a Multi-Condition Emergency directly on your "
                f"dashboard, bypassing the triage system, since multiple confirmed findings "
                f"require immediate attention.")

    return "Screening complete."


# ---------- FULL PIPELINE: gate -> crop -> both models -> summary ----------
def run_full_xray_pipeline(image_path):
    image = Image.open(image_path).convert("RGB")

    gate_result = is_valid_xray(image)
    if not gate_result["is_valid_xray"]:
        return {
            "status": "invalid_image",
            "message": "This doesn't appear to be a chest X-ray. Please upload a valid X-ray image.",
            "details": gate_result
        }

    cropped_array = crop_to_lung_region(image)

    inputs = pneumonia_processor(images=image, return_tensors="pt")
    outputs = pneumonia_model(**inputs)
    pneumonia_probs = torch.softmax(outputs.logits, dim=1)
    pneumonia_score = pneumonia_probs[0][1].item() * 100

    resize_transform = torchvision.transforms.Compose([xrv.datasets.XRayResizer(224)])
    resized_array = resize_transform(cropped_array)
    img_tensor = torch.from_numpy(resized_array).unsqueeze(0).float()

    with torch.no_grad():
        xrv_outputs = xrv_model(img_tensor)

    xrv_pathologies = xrv_model.pathologies
    xrv_scores = {name: float(score) * 100 for name, score in zip(xrv_pathologies, xrv_outputs[0])}
    trusted_scores = {k: round(v, 2) for k, v in xrv_scores.items() if k in TIER2_DISEASES or k in TIER1_THRESHOLDS}

    combined_result = {"Pneumonia": round(pneumonia_score, 2)}
    combined_result.update(trusted_scores)

    summary = get_xray_summary(combined_result)
    summary["gate_check"] = gate_result
    summary["dashboard_message"] = build_dashboard_message(summary)
    return summary


if __name__ == "__main__":
    result = run_full_xray_pipeline("test_xray.jpg")
    print(result["dashboard_message"])