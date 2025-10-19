# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-19
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

import re
import subprocess
import sys
from datetime import date
from pathlib import Path

REQUIRED_HEADER_LINES = [
    "Modified: See CHANGELOG.md for complete modification history",
    "Last Updated:",
    "Modified By:",
]

# Patterns for different file types
HEADER_PATTERNS = {
    ".py": re.compile(r"^#\s*===|^#\s*Modified:|^#\s*Last Updated:|^#\s*Modified By:", re.IGNORECASE),
    ".md": re.compile(r"^<!--|^Modified:|^Last Updated:|^Modified By:|^============================================================", re.IGNORECASE),
    ".yml": re.compile(r"^#|^Modified:|^Last Updated:|^Modified By:", re.IGNORECASE),
    ".yaml": re.compile(r"^#|^Modified:|^Last Updated:|^Modified By:", re.IGNORECASE),
    ".json": re.compile(r"^\{|^_metadata|^\s*\{", re.IGNORECASE),
}

DATE_FMT = "%Y-%m-%d"


def get_git_identity() -> str:
    name = subprocess.check_output(["git", "config", "user.name"]).decode().strip()
    email = subprocess.check_output(["git", "config", "user.email"]).decode().strip()
    return f"{name}<{email}>"


def staged_files() -> list[str]:
    output = subprocess.check_output(["git", "diff", "--cached", "--name-only"]).decode()
    return [line.strip() for line in output.splitlines() if line.strip()]


def read_first_lines(path: Path, n: int = 10) -> list[str]:
    try:
        with path.open("r", encoding="utf-8") as f:
            return [next(f) for _ in range(n)]
    except StopIteration:
        return []
    except Exception:
        return []


def header_block_ok(lines: list[str], suffix: str) -> tuple[bool, str]:
    text = "".join(lines)

    # must include 3 required markers
    for marker in REQUIRED_HEADER_LINES:
        if marker not in text:
            return False, f"missing header marker: {marker}"

    # Last Updated must be today
    today = date.today().strftime(DATE_FMT)
    match = re.search(r"Last Updated:\s*(\d{4}-\d{2}-\d{2})", text)
    if match:
        found = match.group(1)
        if found != today:
            return False, f"Last Updated not today: {found} != {today}"
    else:
        return False, "Last Updated field missing or malformed"

    # Modified By must equal git identity (name<email>)
    mb_match = re.search(r"Modified By:\s*(.+)", text)
    if not mb_match or not mb_match.group(1).strip():
        return False, "Modified By field missing or empty"
    identity = get_git_identity()
    if mb_match.group(1).strip() != identity:
        return False, f"Modified By must equal git identity: {identity}"

    # Basic allowance per file type (comment prefix present near top)
    if suffix in (".py", ".yml", ".yaml"):
        if not any(line.strip().startswith("#") for line in lines[:3]):
            return False, "Header comment block not found at top"
    elif suffix == ".md":
        if not any("<!--" in line for line in lines[:3]):
            return False, "Markdown header comment block not found at top"
    elif suffix == ".json":
        # We only check presence of _metadata in the first 50 lines
        first50 = lines + []
        if "_metadata" not in "".join(first50):
            return False, "JSON files must include _metadata header block"

    return True, ""


EXEMPT_DIRS = {".git", ".idea", ".cursor", "venv", ".venv", "__pycache__"}
EXEMPT_FILES = {"CHANGELOG.md", "LICENSE", "README.md", ".pre-commit-config.yaml"}


def require_changelog(files: list[str]) -> tuple[bool, str]:
    # If any non-exempt, known-type file is staged, CHANGELOG.md must also be staged
    must_doc = []
    for file in files:
        p = Path(file)
        if any(part in EXEMPT_DIRS for part in p.parts):
            continue
        if p.name in EXEMPT_FILES:
            continue
        if p.suffix.lower() in HEADER_PATTERNS:
            must_doc.append(file)
    if must_doc and "CHANGELOG.md" not in {Path(f).name for f in files}:
        return False, "CHANGELOG.md must be updated and staged with this commit"
    return True, ""


def main() -> int:
    files = staged_files()
    if not files:
        return 0

    failures: list[str] = []

    for file in files:
        p = Path(file)
        if not p.exists():
            continue
        if any(part in EXEMPT_DIRS for part in p.parts):
            continue
        if p.name in EXEMPT_FILES:
            continue

        suffix = p.suffix.lower()
        if suffix not in HEADER_PATTERNS:
            # skip unknown types
            continue

        lines = read_first_lines(p, 20)
        ok, reason = header_block_ok(lines, suffix)
        if not ok:
            failures.append(f"{file}: {reason}")

    ok, reason = require_changelog(files)
    if not ok:
        failures.append(reason)

    if failures:
        sys.stderr.write("Header/CHANGELOG validation failed:\n")
        for f in failures:
            sys.stderr.write(f" - {f}\n")
        sys.stderr.write("\nPlease update file headers per AGENTS.md/CRUSH.md and add CHANGELOG entry.\n")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
