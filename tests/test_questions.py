import json
from collections import Counter

import pytest

from build import ASSETS, build
from question_bank import load_questions


def test_bank_has_thirty_balanced_questions():
    bank = load_questions()
    assert len(bank) == 30
    assert Counter(q["category"] for q in bank) == {"GitHub": 15, "Python": 15}


def test_build_packages_only_public_assets(tmp_path):
    build(tmp_path)
    assert {p.name for p in tmp_path.iterdir()} == {*ASSETS, ".nojekyll", "build.json"}
    assert json.loads((tmp_path / "build.json").read_text())["question_count"] == 30


@pytest.mark.parametrize(
    "change",
    [
        {"correct_index": True},
        {"correct_index": 4},
        {"options": ["a"]},
        {"options": ["a", "a", "b", "c"]},
        {"prompt": ""},
        {"category": "unknown"},
    ],
)
def test_malformed_bank_is_rejected(tmp_path, change):
    question = {**load_questions()[0], **change}
    path = tmp_path / "bank.json"
    path.write_text(json.dumps([question]))
    with pytest.raises(ValueError):
        load_questions(path)


def test_duplicate_ids_are_rejected(tmp_path):
    question = load_questions()[0]
    path = tmp_path / "bank.json"
    path.write_text(json.dumps([question, question]))
    with pytest.raises(ValueError, match="unique"):
        load_questions(path)
