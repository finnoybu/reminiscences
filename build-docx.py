"""
Build DOCX for "A Sailor's Reminiscences from the Days of the Sailships"
Assembles markdown chapters in order, strips frontmatter, adds chapter headings,
replaces image references with placeholders, and runs Pandoc.
"""

import os
import re
import subprocess
import yaml

CONTENT_DIR = r"D:\dev\sea-reader\content\en"
OUTPUT_DIR = r"D:\dev\sea-reader\output"
IMAGES_BW_DIR = r"D:\dev\sea-reader\output\images-bw"
OUTPUT_FILE = "a-sailors-reminiscences.docx"
BOOK_TITLE = "A Sailor's Reminiscences from the Days of the Sailships"
AUTHOR = "Olavus Vullum Bjørnson Vestbø"


def load_chapters():
    """Load and sort all chapters by their frontmatter id."""
    chapters = []
    for fname in os.listdir(CONTENT_DIR):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(CONTENT_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()

        # Parse YAML frontmatter
        m = re.match(r"^---\n(.*?)\n---\s*", text, re.DOTALL)
        if not m:
            continue
        meta = yaml.safe_load(m.group(1))
        body = text[m.end():]

        # Extract hero image path from frontmatter
        hero = meta.get("hero", {})
        hero_image = hero.get("image", "") if isinstance(hero, dict) else ""

        chapters.append({
            "id": meta.get("id", 999),
            "title": meta.get("title", fname.replace(".md", "").replace("-", " ").title()),
            "body": body,
            "fname": fname,
            "hero_image": hero_image,
        })

    chapters.sort(key=lambda x: x["id"])
    return chapters


def replace_images_with_placeholders(text):
    """Replace markdown image references with placeholder text."""
    # Match ![alt](path) patterns
    def replace_img(m):
        alt = m.group(1) or "Illustration"
        return f"\n\n*[Image placeholder: {alt}]*\n\n"
    text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", replace_img, text)

    # Also handle any HTML img tags
    text = re.sub(r'<img[^>]*alt="([^"]*)"[^>]*/?>',
                  lambda m: f"\n\n*[Image placeholder: {m.group(1)}]*\n\n", text)
    text = re.sub(r'<img[^>]*/?>',
                  "\n\n*[Image placeholder]*\n\n", text)
    return text


def build_combined_markdown(chapters):
    """Combine all chapters into a single markdown string."""
    parts = []

    for ch in chapters:
        # Add chapter heading
        if ch["id"] == 0:
            # Introduction gets h1
            heading = f"# {ch['title']}"
        else:
            heading = f"# Chapter {ch['id']}: {ch['title']}"

        body = ch["body"].strip()
        body = replace_images_with_placeholders(body)

        # Insert hero image or placeholder after heading
        hero_line = ""
        if ch["hero_image"]:
            img_name = os.path.basename(ch["hero_image"])
            img_name = re.sub(r"\.jpg$", ".png", img_name)
            bw_path = os.path.join(IMAGES_BW_DIR, img_name)
            if os.path.exists(bw_path):
                hero_line = f"\n\n![{ch['title']}]({bw_path})\n"
            else:
                hero_line = f"\n\n*[Image placeholder: {img_name}]*\n"

        parts.append(f"{heading}{hero_line}\n\n{body}")

    return "\n\n\\newpage\n\n".join(parts)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Loading chapters from {CONTENT_DIR}...")
    chapters = load_chapters()
    print(f"  Found {len(chapters)} chapters")

    print("Assembling markdown...")
    combined = build_combined_markdown(chapters)

    combined_md_path = os.path.join(OUTPUT_DIR, "combined.md")
    with open(combined_md_path, "w", encoding="utf-8") as f:
        f.write(combined)
    print(f"  Written to {combined_md_path}")

    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)

    pandoc_cmd = [
        "pandoc",
        combined_md_path,
        "-o", output_path,
        "--from", "markdown",
        "--to", "docx",
        "--toc",
        "--toc-depth=1",
        "--standalone",
        f"--metadata=title:{BOOK_TITLE}",
    ]

    if AUTHOR:
        pandoc_cmd.append(f"--metadata=author:{AUTHOR}")

    print("Running Pandoc...")
    result = subprocess.run(pandoc_cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"  Pandoc STDERR: {result.stderr[:500]}")

    if os.path.exists(output_path):
        size_kb = os.path.getsize(output_path) / 1024
        print(f"  SUCCESS: {output_path} ({size_kb:.0f} KB)")
    else:
        print("  ERROR: DOCX not created")


if __name__ == "__main__":
    main()
