#!/usr/bin/env python3
"""Static checks for the public Primo Físico site."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
html_files = sorted(ROOT.rglob("*.html"))

for path in html_files:
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(ROOT)
    opens = len(re.findall(r"<div\b", text, re.I))
    closes = len(re.findall(r"</div>", text, re.I))
    if opens != closes:
        errors.append(f"{rel}: div balance {opens}/{closes}")

    language_counts = [text.count(f"lang-{lang}") for lang in ("en", "es", "de", "zh")]
    if len(set(language_counts)) != 1:
        errors.append(f"{rel}: language spans {language_counts}")

    if 'http-equiv="Content-Security-Policy"' not in text:
        errors.append(f"{rel}: missing CSP meta")
    if re.search(r"\bonclick\s*=", text, re.I):
        errors.append(f"{rel}: inline onclick handler")
    for opening, body in re.findall(r"(<script\b[^>]*>)(.*?)</script>", text, re.I | re.S):
        if not re.search(r"\bsrc\s*=", opening, re.I) and body.strip():
            errors.append(f"{rel}: inline script")
        if "cdn.jsdelivr.net/npm/@supabase/supabase-js@" in opening and "integrity=" not in opening:
            errors.append(f"{rel}: Supabase CDN script without SRI")

    for anchor in re.findall(r"<a\b[^>]*>", text, re.I | re.S):
        if re.search(r"\btarget\s*=\s*['\"]_blank['\"]", anchor, re.I):
            rel_match = re.search(r"\brel\s*=\s*['\"]([^'\"]*)['\"]", anchor, re.I)
            rel_tokens = set((rel_match.group(1).lower().split() if rel_match else []))
            if "noopener" not in rel_tokens:
                errors.append(f"{rel}: target=_blank without rel=noopener")

    for marker in ("service_role", "-----BEGIN PRIVATE KEY-----", "ghp_", "github_pat_", "sk_live_"):
        if marker.lower() in text.lower():
            errors.append(f"{rel}: possible private credential marker {marker}")

for path in ROOT.rglob("*"):
    if path.is_file() and any(part == ".git" for part in path.parts):
        continue
    lowered = str(path.relative_to(ROOT)).lower()
    if any(token in lowered for token in ("borrador", ".draft.", "_borrador")):
        errors.append(f"draft-like path tracked: {path.relative_to(ROOT)}")

for path in ROOT.glob("*.css"):
    text = path.read_text(encoding="utf-8")
    if text.count("{") != text.count("}"):
        errors.append(f"{path.name}: CSS brace balance")

if not (ROOT / "CNAME").is_file():
    errors.append("CNAME missing")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    sys.exit(1)
print(f"OK: checked {len(html_files)} HTML files, CSS balances, external links and credential markers")
