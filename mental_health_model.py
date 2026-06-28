from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

print("Mental health model loaded successfully\n")

# Each question now has its own valid set of accepted answers
QUESTIONS = [
    {
        "text": "How are you feeling today?",
        "options": ["happy", "sad", "anxious", "angry", "hopeless", "fine"]
    },
    {
        "text": "How was your sleep last night?",
        "options": ["good", "bad", "couldn't sleep", "very tired"]
    },
    {
        "text": "How is your energy level?",
        "options": ["energetic", "very tired", "exhausted", "normal"]
    },
    {
        "text": "Are you enjoying things you usually like?",
        "options": ["yes", "no", "not really", "nothing interests me"]
    },
    {
        "text": "How are your stress levels?",
        "options": ["relaxed", "stressed", "very stressed", "overwhelmed"]
    },
]

# Q6 is the only free-text question - no restrictions
FREE_TEXT_QUESTION = "Any other feelings you want to share? (describe in your own words)"


RISK_EMOTIONS = {
    "sadness": 35,
    "fear": 30,
    "anger": 35,
    "disgust": 30,
}

def ask_multiple_choice(question_data, q_num):
    """Forces the user to pick one of the listed options - no other words allowed."""
    print(f"Q{q_num}: {question_data['text']}")
    options = question_data["options"]
    print("Choose one: " + " | ".join(options))

    while True:
        answer = input("Your answer: ").strip().lower()
        if answer in [opt.lower() for opt in options]:
            print()
            return answer
        print(f"  Invalid input. Please type exactly one of: {', '.join(options)}\n")


def ask_free_text(question_text, q_num):
    """Free text - user can write anything."""
    print(f"Q{q_num}: {question_text}")
    answer = input("Your answer: ").strip()
    print()
    return answer


def collect_user_responses():
    print("Please answer these questions:\n")
    responses = []

    for i, question_data in enumerate(QUESTIONS, 1):
        answer = ask_multiple_choice(question_data, i)
        responses.append(answer)

    free_answer = ask_free_text(FREE_TEXT_QUESTION, len(QUESTIONS) + 1)
    responses.append(free_answer)

    return responses


def analyze_single_answer(text):
    if not text:
        return None
    raw = classifier(text[:512], truncation=True)
    items = raw[0] if isinstance(raw[0], list) else raw
    return {item["label"]: round(item["score"] * 100, 2) for item in items}


def get_mental_health_result(responses):
    per_answer_scores = []
    for answer in responses:
        scores = analyze_single_answer(answer)
        if scores:
            per_answer_scores.append(scores)

    if not per_answer_scores:
        raise ValueError("No valid answers to analyze")

    all_emotions = per_answer_scores[0].keys()
    combined_scores = {}
    for emotion in all_emotions:
        values = [s[emotion] for s in per_answer_scores]
        combined_scores[emotion] = round(sum(values) / len(values), 2)

    crossed = []
    for emotion, threshold in RISK_EMOTIONS.items():
        if combined_scores.get(emotion, 0) >= threshold:
            crossed.append({
                "emotion": emotion,
                "score": combined_scores[emotion],
                "threshold": threshold
            })

    count_crossed = len(crossed)

    risk_score = round(
        combined_scores.get("sadness", 0) * 0.35 +
        combined_scores.get("fear", 0) * 0.30 +
        combined_scores.get("anger", 0) * 0.20 +
        combined_scores.get("disgust", 0) * 0.15,
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
        "all_scores": combined_scores,
        "per_question_breakdown": per_answer_scores
    }


def print_result(result):
    print("\n" + "=" * 50)
    print("       MENTAL HEALTH ANALYSIS RESULT")
    print("=" * 50)

    print("\n--- Averaged Emotion Scores (across all answers) ---")
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
    import sys
    import json

    if len(sys.argv) > 1:
        try:
            # Expecting JSON string of array responses: ["happy", "good", "normal", "yes", "relaxed", "no extra details"]
            responses = json.loads(sys.argv[1])
            result = get_mental_health_result(responses)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        responses = collect_user_responses()
        print("Analyzing your responses...\n")
        result = get_mental_health_result(responses)
        print_result(result)