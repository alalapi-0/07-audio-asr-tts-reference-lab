#!/usr/bin/env python3
"""Lightweight repository governance check.

This script intentionally uses only the Python standard library. It checks the
Round 00 governance surface and data-safety boundaries without touching real
audio or generated datasets.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


REQUIRED_FILES = [
    "README.md",
    "AGENTS.md",
    "PROJECT_STATE.md",
    ".gitignore",
    "docs/ROADMAP_40_ROUNDS.md",
    "docs/governance/current_repo_audit.md",
    "docs/governance/update_log.md",
    "docs/governance/repo_protocol_standard.yaml",
    "docs/governance/file_role_map.yaml",
    "docs/reference_absorption/07_audio_asr_tts_reference_synthesis.md",
    "docs/reference_absorption/migration_matrix.md",
    "docs/architecture/PIPELINE_ARCHITECTURE.md",
    "docs/architecture/ASR_ADAPTER_ARCHITECTURE.md",
    "docs/architecture/TEXT_NORMALIZATION_ARCHITECTURE.md",
    "docs/architecture/ALIGNMENT_AND_SPLITTING_ARCHITECTURE.md",
    "docs/architecture/QUALITY_GATE_ARCHITECTURE.md",
    "docs/architecture/TTS_DATASET_EXPORT_ARCHITECTURE.md",
    "docs/architecture/HUMAN_REVIEW_ARCHITECTURE.md",
    "docs/architecture/CACHE_AND_PARTIAL_REDO_ARCHITECTURE.md",
]


REQUIRED_DIRS = [
    "docs/governance",
    "docs/reference_absorption",
    "docs/architecture",
    "scripts",
]


GITIGNORE_PATTERNS = [
    "data/",
    "cache/",
    "datasets/",
    "exports/",
    ".env",
    "*.wav",
    "*.mp3",
    "*.flac",
    "*.m4a",
    "*.aac",
    "*.ogg",
    "*.opus",
    "*.key",
    "*.pem",
]


REFERENCE_DIRS = [
    "easyaligner",
    "tts-dataset-pipeline",
    "whisper",
    "whisper-timestamped",
    "whisperX",
]


def ok(message: str) -> None:
    print(f"[OK] {message}")


def fail(message: str, failures: list[str]) -> None:
    print(f"[FAIL] {message}")
    failures.append(message)


def check_required_paths(failures: list[str]) -> None:
    for rel in REQUIRED_DIRS:
        path = ROOT / rel
        if path.is_dir():
            ok(f"directory exists: {rel}")
        else:
            fail(f"missing directory: {rel}", failures)

    for rel in REQUIRED_FILES:
        path = ROOT / rel
        if path.is_file() and path.stat().st_size > 0:
            ok(f"file exists: {rel}")
        else:
            fail(f"missing or empty file: {rel}", failures)


def check_gitignore(failures: list[str]) -> None:
    gitignore = ROOT / ".gitignore"
    if not gitignore.is_file():
        fail("missing .gitignore", failures)
        return

    content = gitignore.read_text(encoding="utf-8")
    for pattern in GITIGNORE_PATTERNS:
        if pattern in content:
            ok(f".gitignore covers: {pattern}")
        else:
            fail(f".gitignore missing pattern: {pattern}", failures)


def check_roadmap_rounds(failures: list[str]) -> None:
    roadmap = ROOT / "docs/ROADMAP_40_ROUNDS.md"
    if not roadmap.is_file():
        fail("missing docs/ROADMAP_40_ROUNDS.md", failures)
        return

    content = roadmap.read_text(encoding="utf-8")
    missing_rounds = []
    for index in range(40):
        marker = f"Round {index:02d}"
        if marker not in content:
            missing_rounds.append(marker)

    if missing_rounds:
        fail(f"roadmap missing rounds: {', '.join(missing_rounds)}", failures)
    else:
        ok("roadmap contains Round 00 through Round 39")

    headings = re.findall(r"^## Round \d{2}：", content, flags=re.MULTILINE)
    if len(headings) == 40:
        ok("roadmap has 40 Round headings")
    else:
        fail(f"roadmap has {len(headings)} Round headings, expected 40", failures)


def check_reference_dirs(failures: list[str]) -> None:
    for rel in REFERENCE_DIRS:
        path = ROOT / rel
        if path.is_dir():
            ok(f"reference directory present: {rel}")
        else:
            fail(f"missing reference directory: {rel}", failures)


def check_project_positioning(failures: list[str]) -> None:
    readme = ROOT / "README.md"
    state = ROOT / "PROJECT_STATE.md"
    required_terms = ["TTS", "ASR", "中文有声书", "数据集"]

    for path in [readme, state]:
        if not path.is_file():
            continue
        content = path.read_text(encoding="utf-8")
        for term in required_terms:
            if term in content:
                ok(f"{path.name} mentions {term}")
            else:
                fail(f"{path.name} missing positioning term: {term}", failures)


def main() -> int:
    failures: list[str] = []

    print(f"Checking repository governance at: {ROOT}")
    check_required_paths(failures)
    check_gitignore(failures)
    check_roadmap_rounds(failures)
    check_reference_dirs(failures)
    check_project_positioning(failures)

    if failures:
        print("\nRepository check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("\nRepository check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
