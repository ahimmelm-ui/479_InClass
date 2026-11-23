"""Validate and package public static assets for GitHub Pages."""

import json
from datetime import UTC, datetime
from pathlib import Path
from shutil import copy2

from question_bank import load_questions

ASSETS = ("index.html", "style.css", "app.mjs", "game.mjs", "questions.json")


def build(output: Path = Path("dist")) -> None:
    questions = load_questions()
    output.mkdir(parents=True, exist_ok=True)
    source = Path(__file__).parent / "web"
    for name in ASSETS:
        copy2(source / name, output / name)
    (output / ".nojekyll").touch()
    (output / "build.json").write_text(
        json.dumps(
            {
                "built_at": datetime.now(UTC).isoformat(),
                "question_count": len(questions),
            }
        )
        + "\n"
    )


if __name__ == "__main__":
    build()
    print("Validated and built dist/ for GitHub Pages.")
