import json
import sys
from pathlib import Path

import requests


API_URL = "http://127.0.0.1:8000/security/analyze"

BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / "evaluation_cases.json", "r", encoding="utf-8") as file:
    cases = json.load(file)


def run_case(case):
    payload = {
        "call_id": case["id"],
        "caller_id": f"TEST-{case['id']}",
        "transcript": case["transcript"],
        "requested_action": case["requested_action"],
        "user_role": case["user_role"],
        "previous_risk": case["previous_risk"]
    }

    try:
        response = requests.post(
            API_URL,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        actual = result.get("decision")
        expected = case["expected_decision"]

        return actual, expected, result, None

    except Exception as error:
        return None, case["expected_decision"], None, str(error)


def main():

    print("=" * 70)
    print("VoiceShield Security Evaluation")
    print("=" * 70)

    correct = 0
    total = len(cases)

    category_stats = {}

    for case in cases:

        actual, expected, result, error = run_case(case)

        category = case["category"]

        if category not in category_stats:
            category_stats[category] = {
                "total": 0,
                "correct": 0
            }

        category_stats[category]["total"] += 1

        if actual == expected:
            correct += 1
            category_stats[category]["correct"] += 1
            status = "PASS"
        else:
            status = "FAIL"

        print(
            f"{status:4} | "
            f"{case['id']:8} | "
            f"{category:24} | "
            f"Expected: {expected:6} | "
            f"Actual: {actual}"
        )

        if error:
            print(f"      Error: {error}")

    accuracy = (correct / total) * 100

    print()
    print("=" * 70)
    print("OVERALL RESULTS")
    print("=" * 70)

    print(f"Total cases:     {total}")
    print(f"Correct cases:   {correct}")
    print(f"Incorrect cases: {total - correct}")
    print(f"Accuracy:        {accuracy:.2f}%")

    print()
    print("CATEGORY RESULTS")
    print("-" * 70)

    for category, stats in category_stats.items():

        category_accuracy = (
            stats["correct"] / stats["total"]
        ) * 100

        print(
            f"{category:24} "
            f"{stats['correct']}/{stats['total']} "
            f"({category_accuracy:.2f}%)"
        )

    print("=" * 70)


if __name__ == "__main__":
    main()