import sys

# 1. Weights configuration (severity-based)
WEIGHTS = {
    "xray": 1.4,
    "mentalHealth": 1.2,
    "diabetes": 1.0,
    "skin": 0.9
}

# 2. Urgent override thresholds per disease
THRESHOLDS = {
    "xray": 75.0,
    "skin": 85.0,
    "diabetes": 90.0,
    "mentalHealth": 70.0
}

# Labels mapping for logs and display
DISEASE_LABELS = {
    "xray": "Chest X-Ray anomaly",
    "skin": "Skin Lesion condition",
    "diabetes": "Diabetes Risk",
    "mentalHealth": "Mental Health crisis signal"
}

def calculate_triage(scores):
    """
    Evaluates triage classification using the exact weighted logic and overrides:
    - scores: dict containing optional scores for assessed modules:
      e.g. {"xray": 82.2, "diabetes": 28.5, "mentalHealth": 56.3}
    """
    # Step 1: Identify assessed models and verify inputs
    assessed_scores = {}
    for key, value in scores.items():
        if value is not None:
            assessed_scores[key] = float(value)

    if not assessed_scores:
        return {
            "riskLevel": "Low",
            "compositeScore": 0.0,
            "recommendations": ["No clinical assessment performed."],
            "referral": "Routine check-up"
        }

    # Step 2: Override Check (Section 4.2 & 4.3)
    crossed_diseases = []
    for key, score in assessed_scores.items():
        if key in THRESHOLDS and score >= THRESHOLDS[key]:
            crossed_diseases.append(key)

    count = len(crossed_diseases)

    # Three-Way Branch Routing based on count
    if count == 1:
        # Single-disease override
        flagged_disease = crossed_diseases[0]
        label = DISEASE_LABELS[flagged_disease]
        return {
            "riskLevel": "High",
            "compositeScore": None,
            "findings": f"Urgent care — {label} finding requires immediate attention.",
            "recommendations": [f"Follow-up with a specialist for {label} urgently."],
            "referral": f"Immediate {label} referral"
        }
    
    elif count >= 2:
        # Multi-condition emergency
        flagged_labels = [DISEASE_LABELS[key] for key in crossed_diseases]
        sorted_labels = sorted(flagged_labels) # Ranked/stable list
        return {
            "riskLevel": "Critical",
            "compositeScore": None,
            "findings": f"Multi-condition emergency. Flagged concerns: {', '.join(sorted_labels)} require immediate attention.",
            "recommendations": [f"Expedited multi-specialty evaluations for: {', '.join(sorted_labels)}"],
            "referral": "Emergency Department / Urgent Care Clinic"
        }
    
    # Step 3: Weighted Composite Score Path (count == 0)
    weighted_sum = 0.0
    weight_sum = 0.0
    for key, score in assessed_scores.items():
        if key in WEIGHTS:
            weighted_sum += score * WEIGHTS[key]
            weight_sum += WEIGHTS[key]

    composite_score = weighted_sum / weight_sum if weight_sum > 0 else 0.0

    # Decision Bands
    if composite_score >= 55.0:
        risk_level = "High"
        findings = f"Urgent care — Moderate composite clinical indicators (Score: {composite_score:.2f})."
        recommendations = ["Schedule an urgent appointment with your primary care provider."]
        referral = "Urgent Care Clinic"
    elif composite_score >= 25.0:
        risk_level = "Moderate"
        findings = f"Routine care — Mild composite clinical indicators (Score: {composite_score:.2f})."
        recommendations = ["Schedule a routine clinical consultation."]
        referral = "General Practitioner"
    else:
        risk_level = "Low"
        findings = f"No care needed — Healthy composite indicators (Score: {composite_score:.2f})."
        recommendations = ["Continue standard health maintenance and lifestyle guidelines."]
        referral = "Routine follow-up"

    return {
        "riskLevel": risk_level,
        "compositeScore": round(composite_score, 2),
        "findings": findings,
        "recommendations": recommendations,
        "referral": referral
    }

# 4. Scenario Validation (Section 4.5 Worked Scenario)
def test_worked_scenario():
    print("Running Worked Scenario Validation:")
    patient_scores = {
        "xray": 82.2,
        "diabetes": 28.5,
        "mentalHealth": 56.3,
        "skin": None # Skin photo skipped
    }
    
    result = calculate_triage(patient_scores)
    print(f"X-ray (pneumonia): 82.2 (Threshold >= 75) -> Crossed? YES")
    print(f"Diabetes: 28.5 (Threshold >= 90) -> Crossed? No")
    print(f"Mental Health: 56.3 (Threshold >= 70) -> Crossed? No")
    print(f"Skin: Not Assessed")
    print(f"Expected: Single-condition urgent (Driven by Chest X-Ray)")
    print(f"Actual Risk Level: {result['riskLevel']}")
    print(f"Actual Outcome: {result['findings']}")
    print("-" * 50)

if __name__ == "__main__":
    import json
    if len(sys.argv) > 1:
        try:
            scores = json.loads(sys.argv[1])
            result = calculate_triage(scores)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        test_worked_scenario()
