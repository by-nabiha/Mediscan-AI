import torch
import torch.nn.functional as F
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import numpy as np

# ---------- Pretrained HAM10000 Skin Lesion Model ----------
# Using a ViT model trained on ISIC / HAM10000 skin lesions
SKIN_MODEL_NAME = "marmal88/vit-skin-cancer"

print("Loading HuggingFace Skin Cancer ViT Model...")
processor = ViTImageProcessor.from_pretrained(SKIN_MODEL_NAME)
model = ViTForImageClassification.from_pretrained(SKIN_MODEL_NAME)
model.eval()
print("Skin classification model loaded successfully")

# Model class labels map (matching marmal88/vit-skin-cancer or general HAM10000 format)
# Index mapping typical for HAM10000 datasets:
# nv: Melanocytic nevi, mel: Melanoma, bkl: Seborrheic keratosis, bcc: Basal cell carcinoma,
# akiec: Actinic keratoses, vasc: Vascular lesions, df: Dermatofibroma
SKIN_CLASSES_MAP = {
    "mel": "Melanoma",
    "nv": "Melanocytic nevus",
    "bkl": "Seborrheic keratosis",
    "bcc": "Basal cell carcinoma",
    "akiec": "Actinic keratosis",
    "vasc": "Vascular lesion",
    "df": "Dermatofibroma"
}

def predict_skin_lesion(image_path, confidence_floor=30.0):
    """
    Runs inference on the skin image using pretrained ViT:
    - Normalizes outputs using Softmax (sums to 100%).
    - Filters categories above 30% floor.
    - Adds uncertainty message if top two predictions are within 15% margin.
    """
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).squeeze().numpy()
    
    # Map predictions to human readable labels
    id2label = model.config.id2label
    raw_predictions = {}
    for idx, prob in enumerate(probs):
        label_code = id2label[idx].lower()
        readable_label = SKIN_CLASSES_MAP.get(label_code, label_code)
        raw_predictions[readable_label] = float(prob) * 100 # convert to percentage
        
    # Sort predictions
    sorted_preds = sorted(raw_predictions.items(), key=lambda x: x[1], reverse=True)
    
    # Filter above 30% confidence floor
    above_floor = [(label, round(score, 2)) for label, score in sorted_preds if score >= confidence_floor]
    
    is_uncertain = False
    status_message = ""
    
    # Handle multiple overlapping skin conditions
    if len(above_floor) >= 2:
        top_1_label, top_1_score = above_floor[0]
        top_2_label, top_2_score = above_floor[1]
        
        # If difference between top 2 is <= 15%, mark as uncertain
        if (top_1_score - top_2_score) <= 15.0:
            is_uncertain = True
            status_message = f"possible {top_1_label} or {top_2_label} — uncertain, recommend in-person exam"
            
    if not status_message:
        if len(above_floor) > 0:
            status_message = f"Dominant finding: {above_floor[0][0]} ({above_floor[0][1]:.1f}%)"
        else:
            status_message = "Normal / No specific anomalies detected"
            
    return {
        "status_message": status_message,
        "is_uncertain": is_uncertain,
        "findings_above_floor": above_floor,
        "all_scores": {k: round(v, 2) for k, v in raw_predictions.items()}
    }

if __name__ == "__main__":
    # Test execution if an image is provided
    import sys
    if len(sys.argv) > 1:
        res = predict_skin_lesion(sys.argv[1])
        print("PREDICTION RESULT:")
        print(res)
    else:
        print("Please provide an image path to test skin prediction (e.g. python skin_model.py test_lesion.jpg)")
