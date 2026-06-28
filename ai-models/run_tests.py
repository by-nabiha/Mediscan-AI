from triage_engine import calculate_triage, test_worked_scenario
from skin_model import _format_results

def run_all_tests():
    print("=" * 60)
    print("RUNNING SKIN DISEASE MODEL & TRIAGE TEST SUITE")
    print("=" * 60)
    
    # Test 1: Worked Triage Scenario
    test_worked_scenario()
    
    # Test 2: Skin Model Overlap Scenario
    print("Test 2: Skin Model overlapping classification formatting test...")
    
    # Mock output results from HuggingFace pipeline format
    mock_raw_results = [
        {"label": "melanoma", "score": 0.48},
        {"label": "melanocytic_nevus", "score": 0.41},
        {"label": "seborrheic_keratosis", "score": 0.05},
        {"label": "normal", "score": 0.06}
    ]
    
    result = _format_results(mock_raw_results)
    
    print("\nOverlap test outputs:")
    print(f"  Top condition    : {result['top_condition']}")
    print(f"  Confidence       : {result['confidence_score']}%")
    print(f"  Uncertain result : {'Yes' if result['is_uncertain'] else 'No'}")
    print(f"  Clinical note    : {result['clinical_note']}")
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
