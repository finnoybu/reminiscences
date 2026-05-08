"""
Propagate spelling/edit fixes from the corrected -print.docx back to the
source markdown.

Aligns paragraphs in the docx against paragraphs in:
  - content/print/00-front-matter.md
  - content/en/*.md  (ordered by id)

For each aligned pair that differs at word level, applies the docx version
to the source markdown, preserving markdown wrappers like `_italic_`,
`[text](url)`, `**bold**` around the corrected words.

Usage:
    python apply-print-fixes.py                 # dry-run, log to console + file
    python apply-print-fixes.py --apply         # actually write changes

Logs every proposed change to output/spelling-fixes.log.
"""

import os
import re
import sys
import difflib
import yaml
from docx import Document

ROOT = os.path.dirname(os.path.abspath(__file__))
DOCX_PATH = os.path.join(ROOT, "output", "a-sailors-reminiscences-print.docx")
EN_DIR = os.path.join(ROOT, "content", "en")
FRONT_MATTER_FILE = os.path.join(ROOT, "content", "print", "00-front-matter.md")
LOG_PATH = os.path.join(ROOT, "output", "spelling-fixes.log")

SIMILARITY_THRESHOLD = 0.7  # below this, treat docx para as docx-only and skip

# Manual exclusions: docx edits that look like Word autocorrect mistakes.
# Pairs of (old_word_in_md, new_word_in_docx) — skip these substitutions.
EXCLUDE_CHANGES = {
    ("aggreable", "aggregable"),  # should be 'agreeable'; Word autocorrect quirk
}


def docx_paragraphs(path):
    doc = Document(path)
    return [p.text.strip() for p in doc.paragraphs if p.text.strip()]


def normalize_md(text):
    """Flatten markdown to plain text for similarity matching: strip
    heading hashes, link syntax, bold/italic markers."""
    text = re.sub(r"^\s*#+\s+", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"_([^_\s][^_]*[^_\s]|[^_\s])_", r"\1", text)
    text = re.sub(r"\*([^*\s][^*]*[^*\s]|[^*\s])\*", r"\1", text)
    return text


def alpha_signature(text):
    """Letters and digits only, lowercased. Used to decide whether a
    diff is a real spelling fix vs. typography autocorrect noise (curly
    quotes, em-dashes, non-breaking spaces, whitespace collapsing)."""
    return re.sub(r"[^\w]", "", text, flags=re.UNICODE).lower()


def is_meaningful_change(old, new):
    return alpha_signature(old) != alpha_signature(new)


def split_paragraphs(text):
    return [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]


def build_md_paragraphs():
    """Returns ordered list of (filepath, raw_paragraph, normalized_paragraph)
    matching the build pipeline's assembly order."""
    out = []

    if os.path.exists(FRONT_MATTER_FILE):
        with open(FRONT_MATTER_FILE, encoding="utf-8") as f:
            for para in split_paragraphs(f.read()):
                out.append((FRONT_MATTER_FILE, para, normalize_md(para)))

    chapters = []
    for fname in sorted(os.listdir(EN_DIR)):
        if not fname.endswith(".md"):
            continue
        path = os.path.join(EN_DIR, fname)
        with open(path, encoding="utf-8") as f:
            text = f.read()
        m = re.match(r"^---\n(.*?)\n---\s*", text, re.DOTALL)
        if not m:
            continue
        meta = yaml.safe_load(m.group(1))
        body = text[m.end():]
        chapters.append((meta.get("id", 999), path, body))
    chapters.sort(key=lambda x: x[0])

    for _, path, body in chapters:
        for para in split_paragraphs(body):
            if re.match(r"^!\[[^\]]*\]\([^)]+\)\s*$", para):
                continue  # body image — stripped by build
            out.append((path, para, normalize_md(para)))

    return out


def align(docx_paras, md_paras, lookahead=30):
    """For each docx paragraph, search md[md_i .. md_i+lookahead] for the
    best match above SIMILARITY_THRESHOLD. If found, advance md_i past it
    (consumes any md-only orphans in between, e.g. TOC placeholder). If
    no match in window, treat docx para as docx-only and skip.

    Lookahead also guards against md-only inserts (rare). docx-only inserts
    (title page lines, chapter headings, Word-generated TOC entries) flow
    through naturally as no-match skips."""
    matches = []
    md_i = 0
    skipped_docx = 0

    for d_text in docx_paras:
        best_idx = -1
        best_ratio = SIMILARITY_THRESHOLD
        window = min(lookahead, len(md_paras) - md_i)
        for k in range(window):
            _, _, md_norm = md_paras[md_i + k]
            ratio = difflib.SequenceMatcher(None, md_norm, d_text).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_idx = md_i + k
                if ratio == 1.0:
                    break

        if best_idx >= 0:
            matches.append((best_idx, d_text, best_ratio))
            md_i = best_idx + 1
        else:
            skipped_docx += 1

    return matches, skipped_docx, len(md_paras) - md_i


def tokenize(text):
    """Split on any unicode whitespace (including NBSP that Word's
    autocorrect inserts after periods like 'St. Helena'). str.split()
    misses NBSP and produces glued multi-word tokens."""
    return re.findall(r"\S+", text)


def apply_word_changes(md_full, md_norm, docx_text):
    """Compute a word-level diff between md_norm and docx_text and apply
    it to md_full while preserving markdown wrappers (`_word_`, `**word**`)
    and md's typography (straight quotes, single spaces, hyphens) when
    the only docx-side difference is autocorrect noise.

    Skips pure inserts and pure deletes — Ken's spelling fixes are
    replacements; structural changes (added/removed words) need manual
    review and a chapter heading bleeding into a match shouldn't be
    auto-applied."""
    md_full_words = tokenize(md_full)
    md_norm_words = tokenize(md_norm)
    docx_words = tokenize(docx_text)

    if len(md_full_words) != len(md_norm_words):
        return None, []

    sm = difflib.SequenceMatcher(None, md_norm_words, docx_words)
    new_full_words = []
    changes = []

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            new_full_words.extend(md_full_words[i1:i2])
        elif tag == "delete":
            new_full_words.extend(md_full_words[i1:i2])  # ignore docx-side deletion
        elif tag == "insert":
            pass  # ignore docx-side insertion (chapter heading bleed, etc.)
        elif tag == "replace":
            old_full = md_full_words[i1:i2]
            old_norm = md_norm_words[i1:i2]
            new_norm = docx_words[j1:j2]
            old_chunk = " ".join(old_norm)
            new_chunk = " ".join(new_norm)
            if not is_meaningful_change(old_chunk, new_chunk):
                new_full_words.extend(old_full)  # typography-only — keep md
                continue
            if len(old_full) == len(new_norm):
                # 1:1 substitution — preserve markdown wrappers, skip
                # typography-only swaps, and skip explicit exclusions.
                for of, on, n in zip(old_full, old_norm, new_norm):
                    if not is_meaningful_change(on, n):
                        new_full_words.append(of)
                        continue
                    if (on, n) in EXCLUDE_CHANGES:
                        new_full_words.append(of)  # skip Word autocorrect mistakes
                        continue
                    if on and on in of:
                        new_full_words.append(of.replace(on, n, 1))
                    else:
                        new_full_words.append(n)
                    changes.append((on, n))
            else:
                # word-count change in chunk — emit plain new words; rare
                new_full_words.extend(new_norm)
                changes.append((old_chunk, new_chunk))

    return " ".join(new_full_words), changes


def main():
    apply = "--apply" in sys.argv

    print(f"Reading docx: {DOCX_PATH}")
    docx_paras = docx_paragraphs(DOCX_PATH)

    print(f"Reading md sources...")
    md_paras = build_md_paragraphs()
    file_set = sorted({p[0] for p in md_paras})

    print(f"  docx paragraphs: {len(docx_paras)}")
    print(f"  md paragraphs:   {len(md_paras)} across {len(file_set)} files")

    matches, skipped, unmatched_md = align(docx_paras, md_paras)
    print(f"  aligned pairs: {len(matches)}")
    print(f"  docx-only paragraphs (skipped): {skipped}")
    print(f"  md paragraphs without docx match (tail): {unmatched_md}")
    print()

    # Group fixes per file so we can write each file once
    fixes_per_file = {}  # path -> list of (raw_old_para, raw_new_para, word_changes)

    for md_i, docx_text, _ in matches:
        md_path, md_full, md_norm = md_paras[md_i]
        if alpha_signature(md_norm) == alpha_signature(docx_text):
            continue  # identical letters — only typography/whitespace differs
        new_full, changes = apply_word_changes(md_full, md_norm, docx_text)
        if new_full is None:
            print(f"  [SKIP] {os.path.basename(md_path)}: split-length mismatch (markdown quirk)")
            print(f"         md: {md_norm[:120]}")
            print(f"       docx: {docx_text[:120]}")
            continue
        if not changes:
            continue  # all diffs were typography-only
        fixes_per_file.setdefault(md_path, []).append((md_full, new_full, changes))

    total_changes = sum(len(c) for fixes in fixes_per_file.values() for _, _, c in fixes)
    total_paras = sum(len(fixes) for fixes in fixes_per_file.values())
    print(f"Paragraphs with changes: {total_paras}")
    print(f"Word-level changes: {total_changes}")
    print()

    log_lines = []
    log_lines.append(f"Source: {DOCX_PATH}")
    log_lines.append(f"Mode:   {'APPLY' if apply else 'DRY-RUN'}")
    log_lines.append(f"Paragraphs changed: {total_paras}")
    log_lines.append(f"Word changes:       {total_changes}")
    log_lines.append("=" * 70)

    for path in sorted(fixes_per_file):
        log_lines.append("")
        log_lines.append(f"--- {os.path.relpath(path, ROOT)} ---")
        for old_para, new_para, changes in fixes_per_file[path]:
            for old, new in changes:
                log_lines.append(f"  '{old}' -> '{new}'")

    log_text = "\n".join(log_lines)
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, "w", encoding="utf-8") as f:
        f.write(log_text)
    print(f"Log written to {LOG_PATH}")

    if not apply:
        print()
        print("DRY-RUN: no files modified. Re-run with --apply to write changes.")
        return

    # Apply — for each file, do single string replacements per paragraph
    for path, fixes in fixes_per_file.items():
        with open(path, encoding="utf-8") as f:
            content = f.read()
        applied_in_file = 0
        for old_para, new_para, _ in fixes:
            if old_para in content:
                content = content.replace(old_para, new_para, 1)
                applied_in_file += 1
            else:
                print(f"  [WARN {os.path.basename(path)}] paragraph anchor not found in source")
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  {os.path.basename(path)}: {applied_in_file} paragraph(s) updated")

    print()
    print(f"Applied. Run `git diff content/` to verify.")


if __name__ == "__main__":
    main()
