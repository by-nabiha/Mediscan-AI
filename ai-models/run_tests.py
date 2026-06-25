import torch
from skin_model import SkinLesionCNN, predict_skin_lesion
from triage_engine import calculate_triage, test_worked_scenario

def run_all_tests():
    print("=" * 60)
    print("RUNNING SKIN DISEASE MODEL & TRIAGE TEST SUITE")
    print("=" * 60)
    
    # Test 1: Worked Triage Scenario
    test_worked_scenario()
    
    # Test 2: Skin Model Multi-Diagnosis Logic (Overlap Scenario)
    print("Test 2: Skin Model overlapping classification test...")
    # Load model instance
    model = SkinLesionCNN(num_classes=7)
    
    # Create fake logits where Psoriasis (idx 2) and Fungal (idx 3) are very close
    # Normal (0), Eczema (1), Psoriasis (2), Fungal (3), Melanoma (4), Nevus (5), Keratosis (6)
    fake_logits = torch.zeros(1, 7)
    fake_logits[0, 2] = 2.5 # Psoriasis
    fake_logits[0, 3] = 2.3 # Fungal Infection
    
    # Mock model forward pass by setting its forward method temporarily
    model.forward = lambda x: fake_logits
    
    prediction = predict_skin_lesion(model, torch.randn(1, 3, 64, 64))
    
    print("\nOverlap test outputs:")
    for cls, val in prediction["all_probabilities"].items():
        print(f"  {cls}: {val*100:.1f}%")
        
    print(f"\nFindings above 30% floor:")
    for item in prediction["findings_above_floor"]:
        print(f"  {item[0]}: {item[1]*100:.1f}%")
        
    print(f"\nUncertainty flag: {prediction['is_uncertain']}")
    print(f"Outcome Message: {prediction['status_message']}")
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
