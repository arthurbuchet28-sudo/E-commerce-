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
    # `) : user ? (` looks like text but is a JSX ternary: never touch such lines.
    is_ternary = stripped.startswith((")", "?", ":")) or re.search(r"\s\?\s*\($", stripped)
    if PURE_TEXT.match(line) and re.search(r"[^\W\d_]", line) and not is_ternary:
        return fix_text(line)
    # JSX text with expressions, e.g. `Étape suivante : {next.title}`: fix outside braces.
    if (
        not stripped.startswith(("<", "{", ")", "}", "?", ":"))
        and not re.search(r"[=;\"`]|=>|\breturn\b|\bconst\b|\s\?\s", line)
        and re.search(r"[^\W\d_]{2,}", line)
    ):
        return re.sub(r"(^|\})([^{}]*)", lambda m: m.group(1) + fix_text(m.group(2)), line)
    line = re.sub(r"(^\s*[^\W\d_][^<>{}=\"`]*?) ([?!:;])(?=\{)", lambda m: m.group(1) + NBSP + m.group(2), line)
    line = re.sub(r'"[^"\n]*"', lambda m: fix_text(m.group(0)), line)
    line = re.sub(r"`[^`\n]*`", lambda m: fix_text(m.group(0)), line)
    # JSX text between tags, only when it contains no expression (braces may hold code).
    if "{" not in line and "}" not in line:
        line = re.sub(r">([^<>=()]*)<", lambda m: ">" + fix_text(m.group(1)) + "<", line)
    return line


YAML_LINE = re.compile(r"^(\s*(?:- )?[A-Za-z_]+: )(.*)$")


def fix_markdown(src: str) -> str:
    """Markdown/MDX: fix frontmatter values (quoting them when needed) and prose."""
    lines = src.splitlines(keepends=True)
    out, in_front, in_fence = [], False, False
    for i, line in enumerate(lines):
        if line.strip() == "---" and (i == 0 or in_front):
            in_front = i == 0
            out.append(line)
            continue
        if line.strip().startswith("```"):
            in_fence = not in_fence
        if in_fence:
            out.append(line)
            continue
        if in_front:
            m = YAML_LINE.match(line.rstrip("\n"))
            if m and m.group(2) and not m.group(2).startswith(('"', "'", "[", "|", ">")):
                value = fix_text(m.group(2))
                if ": " in value or " #" in value:
                    value = '"' + value.replace('"', '\\"') + '"'
                line = m.group(1) + value + "\n"
            out.append(line)
            continue
        out.append(fix_text(line))
    return "".join(out)


for path in sys.argv[1:]:
    with open(path, encoding="utf-8") as f:
        src = f.read()
    if path.endswith((".md", ".mdx")):
        out = fix_markdown(src)
    else:
        out = "".join(fix_line(l) for l in src.splitlines(keepends=True))
    if out != src:
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        print("fixed", path)
