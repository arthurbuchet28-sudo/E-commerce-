#!/usr/bin/env python3
"""Insert non-breaking spaces required by French typography in UI strings.

Rewrites, in the given .ts/.tsx files, the text of string literals, JSX text and
pure-text lines: " :" " ;" " !" " ?" " »" and "« " get a U+00A0 instead of a space.
Code (ternaries, types) is left untouched. Usage: scripts/fix-typography.py FILE...
"""
import re
import sys

NBSP = " "
PUNCT = re.compile(r"(?<=[^\s ]) ([:;!?»])(?=[\s\"`<{.,)]|$)")
OPEN = re.compile(r"« ")
PURE_TEXT = re.compile(r"^[\s\w’'«»,.;:!?()…\-–—€%/]+$")


def fix_text(s: str) -> str:
    return OPEN.sub("«" + NBSP, PUNCT.sub(NBSP + r"\1", s))


def fix_line(line: str) -> str:
    stripped = line.strip()
    if stripped.startswith(("//", "*", "/*", "import ")):
        return line
    if PURE_TEXT.match(line) and re.search(r"[^\W\d_]", line):
        return fix_text(line)
    line = re.sub(r'"[^"\n]*"', lambda m: fix_text(m.group(0)), line)
    line = re.sub(r"`[^`\n]*`", lambda m: fix_text(m.group(0)), line)
    line = re.sub(r">([^<>=()]*)<", lambda m: ">" + fix_text(m.group(1)) + "<", line)
    return line


for path in sys.argv[1:]:
    with open(path, encoding="utf-8") as f:
        src = f.read()
    out = "".join(fix_line(l) for l in src.splitlines(keepends=True))
    if out != src:
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        print("fixed", path)
