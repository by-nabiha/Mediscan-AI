from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True
)

print("Mental health model loaded successfully\n")

QUESTIONS = [
    "How are you feeling today? (e.g. happy, sad, anxious, angry, hopeless, fine)",
    "How was your sleep last night? (e.g. good, bad, couldn't sleep, very tired)",
    "How is your energy level? (e.g. energetic, very tired, exhausted, normal)",
    "Are you enjoying things you usually like? (e.g. yes, no, not really, nothing interests me)",
    "How are your stress levels? (e.g. relaxed, stressed, very stressed, overwhelmed)",
    "Any other feelings you want to share? (describe in your own words)"
]

RISK_EMOTIONS = {
    "sadness": 70,
    "fear": 65,
    "anger": 70,
    "disgust": 65,
}


def collect_user_responses():
    print("Please answer these short questions:\n")
    responses = []
    for i, question in enumerate(QUESTIONS, 1):
        print(f"Q{i}: {question}")
        answer = input("Your answer: ").strip()
        responses.append(answer)
        print()
    return " ".join(responses)


def get_mental_health_result(text):
    raw = classifier(text[:512], truncation=True)

    if isinstance(raw[0], list):
        items = raw[0]
    else:
        items = raw

    scores = {}
    for item in items:
        scores[item["label"]] = round(item["score"] * 100, 2)

    crossed = []
    for emotion, threshold in RISK_EMOTIONS.items():
        if scores.get(emotion, 0) >= threshold:
            crossed.append({
                "emotion": emotion,
                "score": scores[emotion],
                "threshold": threshold
            })

    count_crossed = len(crossed)

    risk_score = round(
        scores.get("sadness", 0) * 0.35 +
        scores.get("fear", 0) * 0.30 +
        scores.get("anger", 0) * 0.20 +
        scores.get("disgust", 0) * 0.15,
        2
    )

    if count_crossed == 0:
        status = "send_to_triage"
    elif count_crossed == 1:
        status = "mental_health_single_urgent"
    else:
        status = "mental_health_multi_emergency"

    return {
        "status": status,
        "risk_score": risk_score,
        "crossed": crossed,
        "all_scores": scores
    }


def print_result(result):
    print("\n" + "=" * 50)
    print("       MENTAL HEALTH ANALYSIS RESULT")
    print("=" * 50)

    print("\n--- Emotion Scores ---")
    for emotion, score in result["all_scores"].items():
        bar = "█" * int(score / 5)
        print(f"  {emotion:<12}: {score:>6.2f}%  {bar}")

    print(f"\n--- Risk Score: {result['risk_score']}% ---")

    if result["crossed"]:
        print("\n⚠️  Emotions that crossed threshold:")
        for c in result["crossed"]:
            print(f"  → {c['emotion']} : {c['score']}% (threshold: {c['threshold']}%)")
    else:
        print("\n✅  No emotions crossed the risk threshold")

    print(f"\n--- Status: {result['status']} ---")

    if result["status"] == "send_to_triage":
        print("  → Mental state looks relatively stable.")
        print("  → Score will be sent to overall triage system.")
    elif result["status"] == "mental_health_single_urgent":
        print("  → One risk emotion detected at high level.")
        print("  → Recommend monitoring and possible support.")
    else:
        print("  → Multiple risk emotions detected!")
        print("  → Urgent: Please seek professional mental health support.")

    print("=" * 50 + "\n")


if __name__ == "__main__":
    user_text = collect_user_responses()
    print("Analyzing your responses...\n")
    result = get_mental_health_result(user_text)
    print_result(result)