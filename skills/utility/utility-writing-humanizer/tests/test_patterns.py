"""
Regression tests for writing-humanizer pattern catalog.

Tests validate that each fixture's trigger_regex:
  1. Matches the 'before' text (pattern is detectable)
  2. Does NOT match the 'after' text (pattern is removed in clean output)

Run: source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && pytest tests/ -v
"""

import json
import re
from pathlib import Path

FIXTURES_DIR = Path(__file__).parent / "fixtures"
FIXTURE_FILES = ["lexical.json", "structural.json", "rhetorical.json"]


def load_all_fixtures():
    """Load all fixture entries from all category files."""
    fixtures = []
    for filename in FIXTURE_FILES:
        path = FIXTURES_DIR / filename
        with open(path, encoding="utf-8") as f:
            entries = json.load(f)
        fixtures.extend(entries)
    return fixtures


def pytest_generate_tests(metafunc):
    """Parametrize tests dynamically from fixture files."""
    if "fixture_entry" in metafunc.fixturenames:
        fixtures = load_all_fixtures()
        ids = [f"{e['category']}/{e['pattern_id']}" for e in fixtures]
        metafunc.parametrize("fixture_entry", fixtures, ids=ids)


def test_trigger_regex_matches_before(fixture_entry):
    """trigger_regex must match the 'before' text (pattern is present)."""
    pattern = re.compile(fixture_entry["trigger_regex"])
    before = fixture_entry["before"]
    assert pattern.search(before), (
        f"[{fixture_entry['pattern_id']}] {fixture_entry['description']}\n"
        f"  trigger_regex '{fixture_entry['trigger_regex']}' did NOT match 'before':\n"
        f"  {before!r}"
    )


def test_trigger_regex_absent_from_after(fixture_entry):
    """trigger_regex must NOT match the 'after' text (pattern is removed in clean output)."""
    pattern = re.compile(fixture_entry["trigger_regex"])
    after = fixture_entry["after"]
    assert not pattern.search(after), (
        f"[{fixture_entry['pattern_id']}] {fixture_entry['description']}\n"
        f"  trigger_regex '{fixture_entry['trigger_regex']}' STILL matches 'after':\n"
        f"  {after!r}\n"
        f"  The 'after' fixture does not demonstrate the pattern being removed."
    )


def test_all_patterns_have_unique_ids():
    """Every pattern_id is unique across all fixture files (no duplicate registrations)."""
    fixtures = load_all_fixtures()
    ids = [f["pattern_id"] for f in fixtures]
    duplicates = [pid for pid in ids if ids.count(pid) > 1]
    assert not duplicates, f"Duplicate pattern_ids found: {list(set(duplicates))}"


def test_fixture_schema(fixture_entry):
    """Every fixture has all required fields with non-empty string values."""
    required = ["pattern_id", "category", "description", "before", "after", "trigger_regex"]
    for field in required:
        assert field in fixture_entry, f"Missing field '{field}' in fixture {fixture_entry.get('pattern_id', '?')}"
        assert isinstance(fixture_entry[field], str), f"Field '{field}' must be a string"
        assert fixture_entry[field].strip(), f"Field '{field}' must not be empty"


def test_category_values(fixture_entry):
    """Every fixture's category must be one of the three valid categories."""
    valid = {"lexical", "structural", "rhetorical"}
    assert fixture_entry["category"] in valid, (
        f"[{fixture_entry['pattern_id']}] Invalid category '{fixture_entry['category']}'. "
        f"Must be one of: {valid}"
    )
