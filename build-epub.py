"""
Build ePub for "A Sailor's Reminiscences from the Days of the Sailships"
Assembles markdown chapters in order, compresses illustrations, and runs Pandoc.
"""

import os
import re
import subprocess
import yaml
from PIL import Image

CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content", "en")
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "public", "images")
EPUB_IMAGES_DIR = os.path.join(os.path.dirname(__file__), "output", "images-epub")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
OUTPUT_FILE = "a-sailors-reminiscences.epub"
COVER_IMAGE = os.path.join(IMAGES_DIR, "amazon_kdp_hardcover.jpg")
BOOK_TITLE = "A Sailor's Reminiscences from the Days of the Sailships"
AUTHOR = "Olavus Vullum Bjørnson Vestbø"
TRANSLATOR = "B.C. Berge"
EDITOR = "Ken Tannenbaum"
LANGUAGE = "en"
PUBLISHER = "Finnoybu Press"
DATE = "2026"

IMAGE_MAX_WIDTH = 800
IMAGE_QUALITY = 80


def compress_images():
    """Resize PNGs to JPEG at epub-friendly dimensions."""
    os.makedirs(EPUB_IMAGES_DIR, exist_ok=True)
    count = 0
    for fname in sorted(os.listdir(IMAGES_DIR)):
        if not fname.lower().endswith(".png"):
            continue
        src = os.path.join(IMAGES_DIR, fname)
        dst = os.path.join(EPUB_IMAGES_DIR, os.path.splitext(fname)[0] + ".jpg")
        if os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(src):
            count += 1
            continue
        img = Image.open(src)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        if img.width > IMAGE_MAX_WIDTH:
            ratio = IMAGE_MAX_WIDTH / img.width
            img = img.resize((IMAGE_MAX_WIDTH, int(img.height * ratio)), Image.LANCZOS)
        img.save(dst, "JPEG", quality=IMAGE_QUALITY, optimize=True)
        count += 1
    return count


def load_chapters():
    chapters = []
    for fname in os.listdir(CONTENT_DIR):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(CONTENT_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()

        m = re.match(r"^---\n(.*?)\n---\s*", text, re.DOTALL)
        if not m:
            continue
        meta = yaml.safe_load(m.group(1))
        body = text[m.end():]

        hero = meta.get("hero", {})
        hero_image = hero.get("image", "") if isinstance(hero, dict) else ""

        chapters.append({
            "id": meta.get("id", 999),
            "title": meta.get("title", fname.replace(".md", "").replace("-", " ").title()),
            "slug": meta.get("slug", fname.replace(".md", "")),
            "body": body,
            "hero_image": hero_image,
        })

    chapters.sort(key=lambda x: x["id"])
    return chapters


def resolve_hero_image(hero_path):
    if not hero_path:
        return None
    img_name = os.path.basename(hero_path)
    img_name = os.path.splitext(img_name)[0] + ".jpg"
    full_path = os.path.join(EPUB_IMAGES_DIR, img_name)
    if os.path.exists(full_path):
        return full_path
    return None


def build_combined_markdown(chapters):
    parts = []

    for ch in chapters:
        if ch["id"] == 0:
            heading = f"# {ch['title']}"
        else:
            heading = f"# Chapter {ch['id']}: {ch['title']}"

        body = ch["body"].strip()

        hero_line = ""
        img_path = resolve_hero_image(ch["hero_image"])
        if img_path:
            hero_line = f"\n\n![{ch['title']}]({img_path})\n"

        parts.append(f"{heading}{hero_line}\n\n{body}")

    return "\n\n\n".join(parts)


def write_metadata_yaml(path):
    # Pandoc's default EPUB title-page template lists each creator by
    # `text` value with no role label. To get "Translated by ..." and
    # "Transcribed by ..." on the rendered title page, the labels are
    # prefixed into the text values directly.
    meta = {
        "title": BOOK_TITLE,
        "creator": [
            {"role": "author", "text": AUTHOR},
            {"role": "translator", "text": f"Translated from Norwegian by {TRANSLATOR}"},
        ],
        "contributor": [
            {"role": "trc", "text": f"Transcribed by {EDITOR}"},
        ],
        "publisher": f"Published by {PUBLISHER}",
        "lang": LANGUAGE,
        "date": DATE,
        "rights": f"© {DATE} {PUBLISHER}. All rights reserved.",
    }
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(meta, f, default_flow_style=False, allow_unicode=True)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Compressing illustrations...")
    count = compress_images()
    epub_size = sum(
        os.path.getsize(os.path.join(EPUB_IMAGES_DIR, f))
        for f in os.listdir(EPUB_IMAGES_DIR)
    ) / (1024 * 1024)
    print(f"  {count} images -> {epub_size:.1f} MB (800px wide, JPEG q{IMAGE_QUALITY})")

    print(f"Loading chapters from {CONTENT_DIR}...")
    chapters = load_chapters()
    print(f"  Found {len(chapters)} chapters")

    print("Assembling markdown...")
    combined = build_combined_markdown(chapters)

    combined_md_path = os.path.join(OUTPUT_DIR, "combined-epub.md")
    with open(combined_md_path, "w", encoding="utf-8") as f:
        f.write(combined)

    metadata_path = os.path.join(OUTPUT_DIR, "epub-metadata.yaml")
    write_metadata_yaml(metadata_path)

    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)

    pandoc_cmd = [
        "pandoc",
        combined_md_path,
        "-o", output_path,
        "--from", "markdown",
        "--to", "epub3",
        "--toc",
        "--toc-depth=1",
        "--split-level=1",
        f"--metadata-file={metadata_path}",
        "--epub-chapter-level=1",
    ]

    if os.path.exists(COVER_IMAGE):
        pandoc_cmd.append(f"--epub-cover-image={COVER_IMAGE}")
        print(f"  Cover: {COVER_IMAGE}")

    print("Running Pandoc...")
    result = subprocess.run(pandoc_cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"  Pandoc STDERR: {result.stderr[:500]}")

    if os.path.exists(output_path):
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"  SUCCESS: {output_path} ({size_mb:.1f} MB)")
    else:
        print("  ERROR: ePub not created")


if __name__ == "__main__":
    main()
