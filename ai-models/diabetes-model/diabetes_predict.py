
import joblib
import json
import pandas as pd

def predict_diabetes_risk(patient_data: dict) -> dict:
    """
    patient_data: dict with keys exactly matching:
    Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI,
    DiabetesPedigreeFunction, Age

    Returns: dict with risk percentage and flag decision

    Requires these 3 files in the same folder:
    diabetes_model.pkl, diabetes_scaler.pkl, diabetes_config.json
    """
    model = joblib.load("diabetes_model.pkl")
    scaler = joblib.load("diabetes_scaler.pkl")
    with open("diabetes_config.json") as f:
        config = json.load(f)

    feature_order = config["feature_order"]
    threshold = config["threshold"]

    input_df = pd.DataFrame([patient_data], columns=feature_order)
    input_scaled = scaler.transform(input_df)

    probability = model.predict_proba(input_scaled)[0][1]
    risk_percent = round(float(probability) * 100, 1)
    flagged = bool(probability >= threshold)

    return {
        "risk_percent": risk_percent,
        "flagged": flagged,
        "threshold_used": threshold
    }


if __name__ == "__main__":
    # Example usage
    test_patient = {
        "Pregnancies": 2,
        "Glucose": 130,
        "BloodPressure": 70,
        "SkinThickness": 25,
        "Insulin": 80,
        "BMI": 31.5,
        "DiabetesPedigreeFunction": 0.5,
        "Age": 35
    }
    result = predict_diabetes_risk(test_patient)
    print(result)
