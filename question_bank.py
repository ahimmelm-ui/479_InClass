"""Validate the static question bank before publishing."""

import json
from pathlib import Path

BANK_PATH = Path(__file__).parent / "web" / "questions.json"


def load_questions(path: Path = BANK_PATH) -> list[dict]:
    """Load the bank, rejecting malformed content before it reaches a page."""
    questions = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(questions, list) or not questions:
        raise ValueError("Question bank must be a nonempty list.")
    seen = set()
    for question in questions:
        if not isinstance(question, dict):
            raise ValueError("Each question must be an object.")
        identifier = question.get("id")
        options = question.get("options")
        answer = question.get("correct_index")
        if not isinstance(identifier, str) or not identifier or identifier in seen:
            raise ValueError("Question IDs must be unique, nonempty strings.")
        if question.get("category") not in {"GitHub", "Python"}:
            raise ValueError(f"Invalid category for {identifier}.")
        if any(
            not isinstance(question.get(key), str) or not question[key].strip()
            for key in ("prompt", "explanation")
        ):
            raise ValueError(f"Missing prompt or explanation for {identifier}.")
        if (
            not isinstance(options, list)
            or len(options) != 4
            or any(not isinstance(option, str) or not option.strip() for option in options)
            or len(set(options)) != 4
        ):
            raise ValueError(f"Question {identifier} needs four distinct choices.")
        if type(answer) is not int or not 0 <= answer < 4:
            raise ValueError(f"Invalid answer index for {identifier}.")
        seen.add(identifier)
    return questions
