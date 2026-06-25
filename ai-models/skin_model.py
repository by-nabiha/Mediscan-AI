import base64
import io
from PIL import Image
from transformers import pipeline

MODEL_NAME = "imfarzanansari/skintelligent-25"

CONFIDENCE_FLOOR = 0.30
UNCERTAINTY_GAP = 0.15

_classifier = None


def load_model():
    global _classifier
    if _classifier is None:
        print(f"Loading skin disease model: {MODEL_NAME}")
        _classifier = pipeline(
            "image-classification",
            model=MODEL_NAME,
            top_k=None,
        )
        print("Skin disease model loaded successfully")
    return _classifier


def predict_from_path(image_path: str) -> dict:
    """
    Run skin disease classification on an image file.

    Args:
        image_path: Path to the image file (JPG, PNG, etc.)

    Returns:
        See _format_results() for full output schema.
    """
    classifier = load_model()
    image = Image.open(image_path).convert("RGB")
    raw = classifier(image)
    return _format_results(raw)


def predict_from_base64(base64_str: str) -> dict:
    """
    Run skin disease classification on a base64-encoded image string.
    Pass only the raw base64 data — no 'data:image/...;base64,' prefix.

    Args:
        base64_str: Raw base64-encoded image bytes

    Returns:
        See _format_results() for full output schema.
    """
    classifier = load_model()
    image_bytes = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    raw = classifier(image)
    return _format_results(raw)


def _format_results(raw_results: list) -> dict:
    """
    Convert HuggingFace pipeline output to a structured clinical response.

    All classes are evaluated. Only those at or above CONFIDENCE_FLOOR (30%)
    are surfaced as 'flagged_conditions'. When two or more flagged conditions
    are within UNCERTAINTY_GAP (15%) of each other, the result is marked
    uncertain and a clinical note is added recommending an in-person exam.

    Output schema:
    {
        "confidence_score": float,          # top condition probability × 100
        "top_condition": str,               # highest-probability class
        "conditions": [...],                # all classes, sorted by probability desc
        "flagged_conditions": [...],        # only classes >= 30% confidence floor
        "is_uncertain": bool,               # True when 2+ flagged classes are close
        "clinical_note": str                # human-readable interpretation
    }
    """
    all_conditions = sorted(
        [
            {
                "condition": item["label"].replace("_", " ").title(),
                "probability": round(float(item["score"]), 4),
            }
            for item in raw_results
        ],
        key=lambda x: x["probability"],
        reverse=True,
    )

    top = all_conditions[0] if all_conditions else {"condition": "Unknown", "probability": 0.0}
    confidence_score = round(top["probability"] * 100, 1)

    flagged = [c for c in all_conditions if c["probability"] >= CONFIDENCE_FLOOR]

    is_uncertain = False
    clinical_note = ""

    if len(flagged) == 0:
        clinical_note = (
            f"No condition reached the {int(CONFIDENCE_FLOOR * 100)}% confidence "
            "threshold. Image quality may be insufficient or the presentation may "
            "not match training data. Recommend in-person clinical evaluation."
        )
    elif len(flagged) == 1:
        cond = flagged[0]["condition"]
        pct = round(flagged[0]["probability"] * 100, 1)
        clinical_note = (
            f"Model is {pct}% confident in {cond}. "
            "Consult a dermatologist for confirmation."
        )
    else:
        top_prob = flagged[0]["probability"]
        second_prob = flagged[1]["probability"]
        gap = top_prob - second_prob

        if gap <= UNCERTAINTY_GAP:
            is_uncertain = True
            names = " or ".join(c["condition"] for c in flagged)
            clinical_note = (
                f"Possible {names} — uncertain. "
                "Two or more conditions appear with similar confidence, which may "
                "indicate overlapping or co-occurring conditions. "
                "Recommend in-person dermatological exam for accurate diagnosis."
            )
        else:
            cond = flagged[0]["condition"]
            pct = round(top_prob * 100, 1)
            others = ", ".join(c["condition"] for c in flagged[1:])
            clinical_note = (
                f"Primary finding: {cond} ({pct}%). "
                f"Secondary possibilities above threshold: {others}. "
                "Consult a dermatologist for confirmation."
            )

    return {
        "confidence_score": confidence_score,
        "top_condition": top["condition"],
        "conditions": all_conditions,
        "flagged_conditions": flagged,
        "is_uncertain": is_uncertain,
        "clinical_note": clinical_note,
    }


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python skin_model.py <image_path>")
        print("\nNo image provided — running with a synthetic test image.")
        img = Image.new("RGB", (224, 224), color=(180, 120, 90))
        img.save("test_skin.jpg")
        result = predict_from_path("test_skin.jpg")
    else:
        result = predict_from_path(sys.argv[1])

    print("\nSkin Disease Analysis")
    print("=" * 50)
    print(f"  Top condition    : {result['top_condition']}")
    print(f"  Confidence       : {result['confidence_score']}%")
    print(f"  Uncertain result : {'Yes' if result['is_uncertain'] else 'No'}")
    print(f"\n  Clinical note:\n  {result['clinical_note']}")

    print(f"\n  Flagged conditions (>= {int(CONFIDENCE_FLOOR * 100)}% threshold):")
    if result["flagged_conditions"]:
        for c in result["flagged_conditions"]:
            bar = "#" * int(c["probability"] * 40)
            print(f"    {c['condition']:<35} {c['probability']*100:5.1f}%  {bar}")
    else:
        print("    None reached the confidence floor.")

    print("\n  Full softmax output:")
    for c in result["conditions"]:
        bar = "#" * int(c["probability"] * 40)
        print(f"    {c['condition']:<35} {c['probability']*100:5.1f}%  {bar}")
