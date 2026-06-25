import torch
import numpy as np
from triage_engine import calculate_triage, test_worked_scenario

# Mock output class for ViT prediction testing
class MockViTOutput:
    def __init__(self, logits):
        self.logits = logits

def run_all_tests():
    print("=" * 60)
    print("RUNNING SKIN DISEASE MODEL & TRIAGE TEST SUITE")
    print("=" * 60)
    
    # Test 1: Worked Triage Scenario
    test_worked_scenario()
    
    # Test 2: Skin Model Overlap Scenario
    print("Test 2: Skin Model overlapping classification test...")
    
    # Normal labels mapping
    id2label = {
        0: "nv",     # Melanocytic nevus
        1: "mel",    # Melanoma
        2: "bkl",    # Seborrheic keratosis
        3: "bcc",    # Basal cell carcinoma
        4: "akiec",  # Actinic keratosis
        5: "vasc",   # Vascular lesion
        6: "df"      # Dermatofibroma
    }
    
    # Create fake logits where Melanoma (idx 1) and Melanocytic nevus (idx 0) are close
    fake_logits = torch.zeros(1, 7)
    fake_logits[0, 1] = 2.5 # Melanoma
    fake_logits[0, 0] = 2.3 # Melanocytic nevus
    
    # Softmax check
    probs = torch.softmax(fake_logits, dim=1).squeeze().numpy()
    
    SKIN_CLASSES_MAP = {
        "mel": "Melanoma",
        "nv": "Melanocytic nevus",
        "bkl": "Seborrheic keratosis",
        "bcc": "Basal cell carcinoma",
        "akiec": "Actinic keratosis",
        "vasc": "Vascular lesion",
        "df": "Dermatofibroma"
    }
    
    raw_predictions = {}
    for idx, prob in enumerate(probs):
        label_code = id2label[idx].lower()
        readable_label = SKIN_CLASSES_MAP.get(label_code, label_code)
        raw_predictions[readable_label] = float(prob) * 100
        
    sorted_preds = sorted(raw_predictions.items(), key=lambda x: x[1], reverse=True)
    above_floor = [(label, round(score, 2)) for label, score in sorted_preds if score >= 30.0]
    
    is_uncertain = False
    status_message = ""
    
    if len(above_floor) >= 2:
        top_1_label, top_1_score = above_floor[0]
        top_2_label, top_2_score = above_floor[1]
        
        if (top_1_score - top_2_score) <= 15.0:
            is_uncertain = True
            status_message = f"possible {top_1_label} or {top_2_label} — uncertain, recommend in-person exam"
            
    print("\nOverlap test outputs:")
    for cls, val in raw_predictions.items():
        print(f"  {cls}: {val:.2f}%")
        
    print(f"\nFindings above 30% floor: {above_floor}")
    print(f"Uncertainty flag: {is_uncertain}")
    print(f"Outcome Message: {status_message}")
    print("=" * 60)
    
    # Test 3: Multi-condition Override Triage
    print("Test 3: Testing multi-condition urgent triage override (>= 2 crossed)")
    multi_scores = {
        "xray": 88.0,      # Threshold 75 -> Crossed
        "diabetes": 92.0,  # Threshold 90 -> Crossed
        "mentalHealth": 73.0, # Threshold 70 -> Crossed
        "skin": 10.0       # Threshold 85 -> OK
    }
    multi_res = calculate_triage(multi_scores)
    print(f"Outcome Level: {multi_res['riskLevel']}")
    print(f"Outcome Message: {multi_res['findings']}")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
