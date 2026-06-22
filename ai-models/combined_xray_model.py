import torch
import torchxrayvision as xrv
import torchvision.transforms
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import numpy as np

# ---------- MODEL 1: Pneumonia binary classifier ----------
pneumonia_model_name = "nickmuchi/vit-finetuned-chest-xray-pneumonia"
pneumonia_processor = ViTImageProcessor.from_pretrained(pneumonia_model_name)
pneumonia_model = ViTForImageClassification.from_pretrained(pneumonia_model_name)

# ---------- MODEL 2: torchxrayvision 5-disease model ----------
xrv_model = xrv.models.DenseNet(weights="densenet121-res224-chex")
xrv_model.eval()

print("Both models loaded successfully")



import torch.nn.functional as F

# ---------- Run pneumonia model ----------
image = Image.open("test_xray.jpg").convert("RGB")
inputs = pneumonia_processor(images=image, return_tensors="pt")
outputs = pneumonia_model(**inputs)
pneumonia_probs = torch.softmax(outputs.logits, dim=1)
pneumonia_score = pneumonia_probs[0][1].item() * 100  # index 1 = PNEUMONIA

# ---------- Run torchxrayvision 5-disease model ----------
img = xrv.utils.load_image_as_grayscale("test_xray.jpg") if hasattr(xrv.utils, "load_image_as_grayscale") else None
img_pil = Image.open("test_xray.jpg").convert("L")  # grayscale
img_array = np.array(img_pil)
img_array = xrv.datasets.normalize(img_array, 255)
img_array = img_array[None, :, :]  # add channel dimension

transform = torchvision.transforms.Compose([
    xrv.datasets.XRayCenterCrop(),
    xrv.datasets.XRayResizer(224)
])
img_array = transform(img_array)
img_tensor = torch.from_numpy(img_array).unsqueeze(0).float()

with torch.no_grad():
    xrv_outputs = xrv_model(img_tensor)

xrv_pathologies = xrv_model.pathologies
xrv_scores = {name: float(score) * 100 for name, score in zip(xrv_pathologies, xrv_outputs[0])}

# Only keep the 5 diseases we trust (validated, high-AUC ones)
TRUSTED_DISEASES = [
    "Atelectasis", "Cardiomegaly", "Consolidation", "Edema", "Effusion",
    "Pneumothorax", "Lung Lesion", "Fracture", "Lung Opacity", "Enlarged Cardiomediastinum"
]
trusted_scores = {k: round(v, 2) for k, v in xrv_scores.items() if k in TRUSTED_DISEASES}

# ---------- Combine both results ----------
combined_result = {"Pneumonia": round(pneumonia_score, 2)}
combined_result.update(trusted_scores)

print(combined_result)

# ---------- TIER 1: Validated diseases — shown to user, feeds triage ----------
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


def get_xray_results(combined_result):
    """Returns ONLY Tier 1 — shown on dashboard, used by triage."""
    user_facing = []
    for disease, score in combined_result.items():
        if disease in TIER1_THRESHOLDS:
            threshold = TIER1_THRESHOLDS[disease]
            user_facing.append({
                "disease": disease,
                "score": round(score, 2),
                "threshold": threshold,
                "crossed": score >= threshold
            })
    return user_facing


def get_xray_summary(combined_result):
    """The one function your teammate's backend calls. Always returns all 6
    Tier 1 scores (for dashboard display) PLUS a status telling triage what to do."""
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


if __name__ == "__main__":
    xray_summary = get_xray_summary(combined_result)
    print("X-RAY FINAL SUMMARY:")
    print(xray_summary)