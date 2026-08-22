#!/usr/bin/env python3
"""Validate generated Saber por Saber entries without network access."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "saber/publisher/config.json").read_text(encoding="utf-8"))
POSTS = json.loads((ROOT / "saber/publisher/posts.json").read_text(encoding="utf-8"))
HUB = (ROOT / "saber/index.html").read_text(encoding="utf-8")
SITEMAP = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
LANGS = ("en", "es", "de", "zh")


def fail(message: str) -> None:
    raise SystemExit(f"Saber validation failed: {message}")


if not isinstance(POSTS, list):
    fail("posts.json is not an array")
if "<!-- SABER_POSTS_START -->" not in HUB or "<!-- SABER_POSTS_END -->" not in HUB:
    fail("the index render markers are missing")

slugs: set[str] = set()
slots: set[str] = set()
fingerprints: set[str] = set()
for post in POSTS:
    slug = post.get("slug", "")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        fail(f"invalid slug {slug!r}")
    if slug in slugs:
        fail(f"duplicate slug {slug}")
    slugs.add(slug)

    slot = post.get("slot", "")
    if not slot or slot in slots:
        fail(f"missing or duplicate slot {slot!r}")
    slots.add(slot)

    fingerprint = post.get("topic_fingerprint", "").strip().casefold()
    if not fingerprint or fingerprint in fingerprints:
        fail(f"missing or duplicate topic fingerprint for {slug}")
    fingerprints.add(fingerprint)

    for field in ("title", "deck", "category"):
        value = post.get(field)
        if not isinstance(value, dict) or any(not value.get(lang, "").strip() for lang in LANGS):
            fail(f"{slug} has an incomplete multilingual {field}")

    page_path = ROOT / "saber" / slug / "index.html"
    if not page_path.is_file():
        fail(f"missing page {page_path.relative_to(ROOT)}")
    page = page_path.read_text(encoding="utf-8")
    counts = [page.count(f'class="lang-{lang}"') for lang in LANGS]
    if len(set(counts)) != 1 or counts[0] == 0:
        fail(f"{slug} has unbalanced language surfaces: {counts}")

    spanish_segments = re.findall(
        r'<span class="lang-es">(.*?)</span>', page, flags=re.DOTALL
    )
    spanish_text = " ".join(
        html.unescape(re.sub(r"<[^>]+>", " ", segment)) for segment in spanish_segments
    )
    spanish_words = len(
        re.findall(r"\b[\wÁÉÍÓÚÜÑáéíóúüñ'-]+\b", spanish_text)
    )
    if spanish_words < int(CONFIG["minimum_spanish_words"]):
        fail(f"{slug} contains only {spanish_words} Spanish words")

    references = post.get("references")
    if not isinstance(references, list) or len(references) < int(CONFIG["minimum_references"]):
        fail(f"{slug} has too few references")
    reference_urls: set[str] = set()
    for reference in references:
        url = reference.get("url", "")
        parsed = urlsplit(url)
        if parsed.scheme != "https" or not parsed.netloc:
            fail(f"{slug} has an invalid reference URL")
        if url in reference_urls:
            fail(f"{slug} has a duplicate reference URL")
        reference_urls.add(url)
        if html.escape(url, quote=True) not in page:
            fail(f"{slug} omits a registry reference from its page")

    image = post.get("image") or {}
    image_path = image.get("path", "")
    if not image_path.startswith("/") or not (ROOT / image_path.lstrip("/")).is_file():
        fail(f"{slug} has no local hero image")
    license_name = image.get("license", "").lower()
    if not (
        "public domain" in license_name
        or "cc0" in license_name
        or "cc by" in license_name
        or license_name == "original illustration"
    ):
        fail(f"{slug} has a disallowed image license: {image.get('license')}")

    public_url = f"https://www.primofisico.com/saber/{slug}/"
    if f'href="/saber/{slug}/"' not in HUB:
        fail(f"{slug} is missing from the Saber index")
    if public_url not in SITEMAP:
        fail(f"{slug} is missing from sitemap.xml")

print(f"Saber validation passed for {len(POSTS)} post(s).")
