#!/usr/bin/env python3
"""Cloud publisher for Primo Fisico's Saber por Saber collection."""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import mimetypes
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PUBLISHER_DIR = ROOT / "saber" / "publisher"
CONFIG_PATH = PUBLISHER_DIR / "config.json"
REGISTRY_PATH = PUBLISHER_DIR / "posts.json"
EDITORIAL_PATH = PUBLISHER_DIR / "editorial.md"
HUB_PATH = ROOT / "saber" / "index.html"
SITEMAP_PATH = ROOT / "sitemap.xml"
LANGS = ("en", "es", "de", "zh")
USER_AGENT = "PrimoFisico-SaberPublisher/1.0 (+https://www.primofisico.com/saber/)"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def localized_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {lang: {"type": "string", "minLength": 2} for lang in LANGS},
        "required": list(LANGS),
        "additionalProperties": False,
    }


def article_schema(minimum_references: int) -> dict[str, Any]:
    localized = localized_schema()
    return {
        "type": "object",
        "properties": {
            "slug": {
                "type": "string",
                "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                "minLength": 5,
                "maxLength": 72,
            },
            "topic_fingerprint": {"type": "string", "minLength": 12, "maxLength": 180},
            "title": localized,
            "deck": localized,
            "eyebrow": localized,
            "category": localized,
            "reading_minutes": {"type": "integer", "minimum": 7, "maximum": 30},
            "image_query": {"type": "string", "minLength": 4, "maxLength": 120},
            "image_caption": localized,
            "image_alt": localized,
            "sections": {
                "type": "array",
                "minItems": 5,
                "maxItems": 8,
                "items": {
                    "type": "object",
                    "properties": {
                        "heading": localized,
                        "paragraphs": {
                            "type": "array",
                            "minItems": 2,
                            "maxItems": 5,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "text": localized,
                                    "references": {
                                        "type": "array",
                                        "items": {"type": "integer", "minimum": 1},
                                        "minItems": 1,
                                        "maxItems": 5,
                                    },
                                },
                                "required": ["text", "references"],
                                "additionalProperties": False,
                            },
                        },
                    },
                    "required": ["heading", "paragraphs"],
                    "additionalProperties": False,
                },
            },
            "references": {
                "type": "array",
                "minItems": minimum_references,
                "maxItems": 16,
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "minLength": 3},
                        "publisher": {"type": "string", "minLength": 2},
                        "url": {"type": "string", "pattern": "^https://"},
                    },
                    "required": ["title", "publisher", "url"],
                    "additionalProperties": False,
                },
            },
        },
        "required": [
            "slug",
            "topic_fingerprint",
            "title",
            "deck",
            "eyebrow",
            "category",
            "reading_minutes",
            "image_query",
            "image_caption",
            "image_alt",
            "sections",
            "references",
        ],
        "additionalProperties": False,
    }


def normalize_url(value: str) -> str:
    parsed = urllib.parse.urlsplit(value.strip())
    path = re.sub(r"/+$", "", parsed.path) or "/"
    return urllib.parse.urlunsplit(
        (parsed.scheme.lower(), parsed.netloc.lower(), path, parsed.query, "")
    )


def collect_response_urls(node: Any) -> set[str]:
    found: set[str] = set()
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "url" and isinstance(value, str) and value.startswith("https://"):
                found.add(normalize_url(value))
            else:
                found.update(collect_response_urls(value))
    elif isinstance(node, list):
        for value in node:
            found.update(collect_response_urls(value))
    return found


def request_article(
    config: dict[str, Any],
    registry: list[dict[str, Any]],
    requested_topic: str,
) -> dict[str, Any]:
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("The openai package is required") from exc

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    recent = [
        {
            "title": post["title"]["es"],
            "fingerprint": post["topic_fingerprint"],
            "published_at": post["published_at"],
        }
        for post in registry[-int(config["recent_topic_window"]) :]
    ]
    seed = requested_topic.strip()
    topic_instruction = (
        f'El tema obligatorio de esta ejecución es: "{seed}". Desarróllalo con un '
        "enfoque histórico y conceptual original."
        if seed
        else "Elige un tema distinto de todos los incluidos en el registro reciente."
    )
    editorial = EDITORIAL_PATH.read_text(encoding="utf-8")
    today = dt.datetime.now(dt.timezone.utc).date().isoformat()
    prompt = f"""
Fecha de investigación: {today}.

{topic_instruction}

Registro reciente, que no debe repetirse:
{json.dumps(recent, ensure_ascii=False)}

Investiga primero con la herramienta de búsqueda web. Usa preferentemente fuentes
primarias, organismos oficiales, archivos, museos, universidades y publicaciones
académicas. Copia en references solamente URL exactas que hayan aparecido en los
resultados de búsqueda de esta misma respuesta. No inventes ni reconstruyas enlaces.

Después redacta una sola lectura conforme a este criterio editorial:
{editorial}

Requisitos verificables:
- La versión española debe superar {config["minimum_spanish_words"]} palabras.
- Debe haber entre cinco y ocho secciones, con párrafos sustanciosos.
- Evita párrafos españoles menores de 70 palabras.
- Cada párrafo debe incluir los números, comenzando en 1, de las referencias que lo
  respaldan. Los números deben apuntar a la lista final.
- Las cuatro versiones deben contener exactamente las mismas ideas y estructura.
- image_query debe ser una consulta factual breve en inglés adecuada para Wikimedia
  Commons; no debe pedir una ilustración generada.
- No uses Markdown ni HTML dentro de los campos de texto.
- El slug debe ser breve, descriptivo y estable.
"""
    model = os.environ.get("OPENAI_MODEL", "gpt-5.4").strip() or "gpt-5.4"
    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=model,
        tools=[{"type": "web_search"}],
        include=["web_search_call.action.sources"],
        input=prompt,
        text={
            "format": {
                "type": "json_schema",
                "name": "saber_article",
                "strict": True,
                "schema": article_schema(int(config["minimum_references"])),
            }
        },
        max_output_tokens=30000,
    )
    if not response.output_text:
        raise RuntimeError("The model returned no article")
    article = json.loads(response.output_text)
    response_urls = collect_response_urls(response.model_dump())
    if not response_urls:
        raise RuntimeError("Web search returned no inspectable source URLs")
    article["_searched_urls"] = sorted(response_urls)
    return article


def validate_localized(value: Any, label: str) -> None:
    if not isinstance(value, dict):
        raise ValueError(f"{label} is not multilingual")
    for lang in LANGS:
        if not isinstance(value.get(lang), str) or not value[lang].strip():
            raise ValueError(f"{label}.{lang} is empty")


def validate_article(
    article: dict[str, Any],
    config: dict[str, Any],
    registry: list[dict[str, Any]],
) -> None:
    slug = article.get("slug", "")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError("Invalid slug")
    if any(post["slug"] == slug for post in registry):
        raise ValueError(f"Slug already published: {slug}")

    fingerprint = article.get("topic_fingerprint", "").strip().casefold()
    if any(post["topic_fingerprint"].strip().casefold() == fingerprint for post in registry):
        raise ValueError("Topic fingerprint duplicates an existing post")

    for field in ("title", "deck", "eyebrow", "category", "image_caption", "image_alt"):
        validate_localized(article.get(field), field)

    sections = article.get("sections")
    if not isinstance(sections, list) or not 5 <= len(sections) <= 8:
        raise ValueError("The article must contain five to eight sections")

    spanish_paragraphs: list[str] = []
    for section_index, section in enumerate(sections, start=1):
        validate_localized(section.get("heading"), f"sections[{section_index}].heading")
        paragraphs = section.get("paragraphs")
        if not isinstance(paragraphs, list) or len(paragraphs) < 2:
            raise ValueError(f"Section {section_index} has too few paragraphs")
        for paragraph_index, paragraph in enumerate(paragraphs, start=1):
            validate_localized(
                paragraph.get("text"),
                f"sections[{section_index}].paragraphs[{paragraph_index}].text",
            )
            spanish = paragraph["text"]["es"].strip()
            spanish_paragraphs.append(spanish)
            if len(re.findall(r"\b[\wÁÉÍÓÚÜÑáéíóúüñ'-]+\b", spanish)) < 70:
                raise ValueError(
                    f"Spanish paragraph {section_index}.{paragraph_index} is too short"
                )

    word_count = len(
        re.findall(
            r"\b[\wÁÉÍÓÚÜÑáéíóúüñ'-]+\b",
            article["deck"]["es"] + " " + " ".join(spanish_paragraphs),
        )
    )
    if word_count < int(config["minimum_spanish_words"]):
        raise ValueError(
            f"Spanish article has {word_count} words; "
            f"{config['minimum_spanish_words']} are required"
        )

    references = article.get("references")
    if not isinstance(references, list) or len(references) < int(
        config["minimum_references"]
    ):
        raise ValueError("Not enough references")
    searched_urls = set(article.pop("_searched_urls", []))
    seen: set[str] = set()
    for index, reference in enumerate(references, start=1):
        url = reference.get("url", "")
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"Reference {index} does not use a valid HTTPS URL")
        normalized = normalize_url(url)
        if normalized in seen:
            raise ValueError(f"Duplicate reference URL: {url}")
        if normalized not in searched_urls:
            raise ValueError(
                f"Reference {index} was not returned by the web search tool: {url}"
            )
        seen.add(normalized)

    for section in sections:
        for paragraph in section["paragraphs"]:
            refs = paragraph.get("references")
            if not isinstance(refs, list) or not refs:
                raise ValueError("Every paragraph requires at least one reference")
            if any(not isinstance(value, int) or not 1 <= value <= len(references) for value in refs):
                raise ValueError("A paragraph contains an invalid reference number")


def strip_markup(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value or "")).strip()


def commons_license_allowed(value: str) -> bool:
    compact = strip_markup(value).lower().replace("_", " ").replace("-", " ")
    if "public domain" in compact or "cc0" in compact:
        return True
    if "cc by" in compact and " nc" not in compact and " nd" not in compact:
        return True
    return False


def fetch_commons_image(query: str, slug: str) -> dict[str, str] | None:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"file:{query}",
            "gsrnamespace": "6",
            "gsrlimit": "24",
            "prop": "imageinfo",
            "iiprop": "url|mime|extmetadata",
            "iiurlwidth": "1600",
            "origin": "*",
        }
    )
    request = urllib.request.Request(
        "https://commons.wikimedia.org/w/api.php?" + params,
        headers={"User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)

    pages = list(payload.get("query", {}).get("pages", {}).values())
    pages.sort(key=lambda page: int(page.get("index", 9999)))
    for page in pages:
        info_list = page.get("imageinfo") or []
        if not info_list:
            continue
        info = info_list[0]
        metadata = info.get("extmetadata") or {}
        license_name = strip_markup(
            (metadata.get("LicenseShortName") or {}).get("value", "")
        )
        if not commons_license_allowed(license_name):
            continue
        mime = info.get("mime", "")
        if mime not in {"image/jpeg", "image/png", "image/webp"}:
            continue
        image_url = info.get("thumburl") or info.get("url")
        source_url = info.get("descriptionurl")
        if not image_url or not source_url:
            continue

        extension = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }[mime]
        relative_path = Path("assets") / "saber" / slug / ("hero" + extension)
        target = ROOT / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        download = urllib.request.Request(image_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(download, timeout=45) as response:
            data = response.read(12 * 1024 * 1024 + 1)
        if not data or len(data) > 12 * 1024 * 1024:
            continue
        target.write_bytes(data)
        author = strip_markup((metadata.get("Artist") or {}).get("value", ""))
        credit = strip_markup((metadata.get("Credit") or {}).get("value", ""))
        return {
            "path": "/" + relative_path.as_posix(),
            "source_url": source_url,
            "license": license_name,
            "author": author or credit or "Wikimedia Commons contributor",
            "source_title": page.get("title", "Wikimedia Commons"),
            "kind": "commons",
        }
    return None


def fallback_svg(slug: str, title: str) -> dict[str, str]:
    relative_path = Path("assets") / "saber" / slug / "hero.svg"
    target = ROOT / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    words = title.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        if len(candidate) > 27 and current:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    lines = lines[:3]
    text_nodes = "\n".join(
        f'<text x="80" y="{330 + index * 62}" class="title">{html.escape(line)}</text>'
        for index, line in enumerate(lines)
    )
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200" role="img" aria-label="{html.escape(title)}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#160a38"/><stop offset=".58" stop-color="#34277c"/><stop offset="1" stop-color="#0c5865"/></linearGradient><radialGradient id="r"><stop stop-color="#86fff1" stop-opacity=".65"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="1200" fill="url(#g)"/>
<circle cx="1260" cy="240" r="390" fill="url(#r)"/><circle cx="1320" cy="920" r="520" fill="none" stroke="#63dfe7" stroke-opacity=".18" stroke-width="3"/><circle cx="1320" cy="920" r="360" fill="none" stroke="#a78bfa" stroke-opacity=".22" stroke-width="2"/>
<path d="M80 230H720" stroke="#63dfe7" stroke-opacity=".72" stroke-width="5"/>
<style>.label{{font:700 30px system-ui;letter-spacing:9px;fill:#9af2ed}}.title{{font:700 56px Georgia,serif;fill:#f4efff}}</style>
<text x="80" y="190" class="label">SABER POR SABER</text>
{text_nodes}
</svg>
"""
    write_text(target, svg)
    return {
        "path": "/" + relative_path.as_posix(),
        "source_url": "https://www.primofisico.com/saber/",
        "license": "Original illustration",
        "author": "Primo Físico cloud publisher",
        "source_title": "Abstract cover",
        "kind": "generated",
    }


def acquire_image(article: dict[str, Any]) -> dict[str, str]:
    try:
        image = fetch_commons_image(article["image_query"], article["slug"])
    except Exception as exc:
        print(f"Wikimedia Commons image lookup failed: {exc}", file=sys.stderr)
        image = None
    return image or fallback_svg(article["slug"], article["title"]["es"])


def mlang(value: dict[str, str], tag: str = "span") -> str:
    return "".join(
        f'<{tag} class="lang-{lang}">{html.escape(value[lang].strip())}</{tag}>'
        for lang in LANGS
    )


def citation_marks(values: list[int]) -> str:
    unique = list(dict.fromkeys(values))
    return "".join(
        f'<sup class="pf-saber-cite"><a href="#ref-{value}">[{value}]</a></sup>'
        for value in unique
    )


def render_article(
    article: dict[str, Any],
    image: dict[str, str],
    published_at: str,
) -> str:
    title_es = article["title"]["es"]
    description = article["deck"]["es"]
    canonical = f"https://www.primofisico.com/saber/{article['slug']}/"
    sections_html: list[str] = []
    for section in article["sections"]:
        paragraphs = "\n".join(
            f'      <p>{mlang(paragraph["text"])}{citation_marks(paragraph["references"])}</p>'
            for paragraph in section["paragraphs"]
        )
        sections_html.append(
            f"""    <section>
      <h2>{mlang(section["heading"])}</h2>
{paragraphs}
    </section>"""
        )

    references_html = "\n".join(
        f'      <li id="ref-{index}"><a href="{html.escape(reference["url"], quote=True)}" target="_blank" rel="noopener">{html.escape(reference["title"])}</a> — {html.escape(reference["publisher"])}</li>'
        for index, reference in enumerate(article["references"], start=1)
    )
    image_credit = (
        f'{html.escape(image["source_title"])} — {html.escape(image["author"])} · '
        f'{html.escape(image["license"])} · '
        f'<a href="{html.escape(image["source_url"], quote=True)}" target="_blank" rel="noopener">'
        f'{mlang({"en":"source","es":"fuente","de":"Quelle","zh":"来源"})}</a>'
    )
    note = {
        "en": "Generated and published automatically with AI assistance. Sources and reusable-image metadata are validated before publication.",
        "es": "Generado y publicado automáticamente con asistencia de IA. Las fuentes y los metadatos de reutilización de la imagen se validan antes de publicar.",
        "de": "Mit KI-Unterstützung automatisch erstellt und veröffentlicht. Quellen und Metadaten zur Bildnutzung werden vor der Veröffentlichung geprüft.",
        "zh": "在人工智能协助下自动生成并发布。发布前会核验来源以及图片再利用元数据。",
    }
    reading = {
        "en": f'{article["reading_minutes"]} min read',
        "es": f'{article["reading_minutes"]} min de lectura',
        "de": f'{article["reading_minutes"]} Min. Lesezeit',
        "zh": f'阅读约 {article["reading_minutes"]} 分钟',
    }
    return f"""<!DOCTYPE html>
<html lang="es" data-lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#080715" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:; upgrade-insecure-requests" />
<title>{html.escape(title_es)} — Primo Físico</title>
<meta name="description" content="{html.escape(description, quote=True)}" />
<link rel="canonical" href="{canonical}" />
<link rel="icon" type="image/png" href="/assets/primo-fisico-logo.png?v=2" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Primo Físico" />
<meta property="og:title" content="{html.escape(title_es, quote=True)}" />
<meta property="og:description" content="{html.escape(description, quote=True)}" />
<meta property="og:url" content="{canonical}" />
<meta property="og:image" content="https://www.primofisico.com{html.escape(image["path"], quote=True)}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="stylesheet" href="/styles.css?v=13" />
<link rel="stylesheet" href="/primo-fisico.css?v=59" />
<link rel="stylesheet" href="/saber-post.css?v=2" />
<link rel="stylesheet" href="/saber-auto.css?v=1" />
</head>
<body class="pf-saber-post">
<div class="bg-glow"></div>
<canvas id="energy"></canvas>
<nav>
  <a href="/" class="brand"><span class="pf-brand-mark"><img class="pf-brand-logo" src="/assets/primo-fisico-logo.png?v=2" alt="" /></span><span>Primo Físico</span></a>
  <div class="nav-right">
    <div class="nav-links"><a href="/saber/"><span class="lang-en">Collection</span><span class="lang-es">Colección</span><span class="lang-de">Sammlung</span><span class="lang-zh">合集</span></a><a href="/?open-search=1"><span class="lang-en">Search</span><span class="lang-es">Buscar</span><span class="lang-de">Suchen</span><span class="lang-zh">搜索</span></a></div>
    <button class="theme-toggle" aria-label="Toggle light/dark theme" data-pf-action="toggle-theme"><span class="icon-sun">&#9788;</span><span class="icon-moon">&#9790;</span></button>
    <div class="lang-dd"><button class="lang-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Change language" data-pf-action="toggle-lang-menu"><span class="lang-cur"></span><span class="caret">&#9662;</span></button><ul class="lang-menu" role="listbox"><li role="option" data-lang="en" data-pf-action="pick-lang">EN</li><li role="option" data-lang="es" data-pf-action="pick-lang">ES</li><li role="option" data-lang="de" data-pf-action="pick-lang">DE</li><li role="option" data-lang="zh" data-pf-action="pick-lang">中文</li></ul></div>
    <button class="nav-burger" aria-label="Menu" data-pf-action="toggle-nav">&#9776;</button>
  </div>
</nav>
<div class="backbar"><a class="btn btn-ghost" href="/saber/">&larr; <span class="lang-en">Back to the collection</span><span class="lang-es">Volver a la colección</span><span class="lang-de">Zurück zur Sammlung</span><span class="lang-zh">返回合集</span></a></div>
<main class="pf-saber-article">
  <header class="pf-saber-article-hero reveal">
    <div>
      <span class="eyebrow">{mlang(article["eyebrow"])}</span>
      <h1 class="section-title pf-saber-article-title">{mlang(article["title"])}</h1>
      <p class="pf-saber-deck">{mlang(article["deck"])}</p>
      <div class="pf-saber-byline"><time datetime="{published_at}">{published_at}</time><span>{mlang(reading)}</span></div>
    </div>
    <figure class="pf-saber-hero-figure">
      <img src="{html.escape(image["path"], quote=True)}" alt="{html.escape(article["image_alt"]["es"], quote=True)}" />
      <figcaption>{mlang(article["image_caption"])}<br />{image_credit}</figcaption>
    </figure>
  </header>
  <article class="pf-saber-copy">
{chr(10).join(sections_html)}
  </article>
  <section class="pf-saber-references" aria-labelledby="references-title">
    <h2 id="references-title">{mlang({"en":"References","es":"Referencias","de":"Quellen","zh":"参考资料"})}</h2>
    <ol>
{references_html}
    </ol>
  </section>
  <p class="pf-saber-note">{mlang(note)}</p>
</main>
<div class="backbar"><a class="btn btn-ghost" href="/saber/">&larr; <span class="lang-en">Back to the collection</span><span class="lang-es">Volver a la colección</span><span class="lang-de">Zurück zur Sammlung</span><span class="lang-zh">返回合集</span></a></div>
<footer><p>Primo Físico · Saber por Saber</p><p><a href="/">Primo Físico</a> · <span id="yr"></span></p></footer>
<script src="/app.js?v=14"></script>
<script src="/saber-post.js?v=2"></script>
</body>
</html>
"""


def registry_entry(
    article: dict[str, Any],
    image: dict[str, str],
    published_at: str,
    slot: str,
) -> dict[str, Any]:
    return {
        "slug": article["slug"],
        "topic_fingerprint": article["topic_fingerprint"],
        "published_at": published_at,
        "slot": slot,
        "title": article["title"],
        "deck": article["deck"],
        "category": article["category"],
        "reading_minutes": article["reading_minutes"],
        "image": image,
        "references": article["references"],
    }


def render_card(post: dict[str, Any], first: bool) -> str:
    card_title_id = ' id="collection-title"' if first else ""
    reading = {
        "en": f'{post["reading_minutes"]} min',
        "es": f'{post["reading_minutes"]} min',
        "de": f'{post["reading_minutes"]} Min.',
        "zh": f'{post["reading_minutes"]} 分钟',
    }
    return f"""        <article class="pf-saber-card">
          <a href="/saber/{html.escape(post["slug"], quote=True)}/">
            <div class="pf-saber-card-media"><img src="{html.escape(post["image"]["path"], quote=True)}" alt="" loading="lazy" /></div>
            <div class="pf-saber-card-copy">
              <span class="pf-saber-card-kicker">{mlang(post["category"])}</span>
              <h2{card_title_id}>{mlang(post["title"])}</h2>
              <p>{mlang(post["deck"])}</p>
              <div class="pf-saber-card-meta"><time datetime="{post["published_at"]}">{post["published_at"]}</time><span>{mlang(reading)}</span></div>
            </div>
          </a>
        </article>"""


def update_hub(registry: list[dict[str, Any]]) -> None:
    content = HUB_PATH.read_text(encoding="utf-8")
    start_marker = "        <!-- SABER_POSTS_START -->"
    end_marker = "        <!-- SABER_POSTS_END -->"
    start = content.find(start_marker)
    end = content.find(end_marker)
    if start < 0 or end < 0 or end <= start:
        raise RuntimeError("Saber index markers are missing")
    cards = "\n".join(
        render_card(post, index == 0)
        for index, post in enumerate(reversed(registry))
    )
    replacement = start_marker + "\n" + cards + "\n" + end_marker
    write_text(HUB_PATH, content[:start] + replacement + content[end + len(end_marker) :])


def update_sitemap(slug: str) -> None:
    content = SITEMAP_PATH.read_text(encoding="utf-8")
    url = f"https://www.primofisico.com/saber/{slug}/"
    if url in content:
        return
    entry = (
        "  <url>\n"
        f"    <loc>{html.escape(url)}</loc>\n"
        "    <changefreq>monthly</changefreq>\n"
        "    <priority>0.75</priority>\n"
        "  </url>\n"
    )
    if "</urlset>" not in content:
        raise RuntimeError("sitemap.xml has no closing urlset")
    write_text(SITEMAP_PATH, content.replace("</urlset>", entry + "</urlset>"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", default=os.environ.get("SABER_TOPIC", ""))
    parser.add_argument("--slot", default=os.environ.get("SABER_SLOT", "manual"))
    args = parser.parse_args()

    config = read_json(CONFIG_PATH)
    registry = read_json(REGISTRY_PATH)
    if not isinstance(registry, list):
        raise ValueError("Post registry must be a JSON array")
    if any(post.get("slot") == args.slot for post in registry):
        print(f"Slot {args.slot} is already published; no changes.")
        return 0

    selected_topic = args.topic.strip()
    if not selected_topic and not registry:
        selected_topic = str(config.get("first_topic", "")).strip()
    article = request_article(config, registry, selected_topic)
    validate_article(article, config, registry)
    image = acquire_image(article)
    published_at = dt.datetime.now(dt.timezone.utc).date().isoformat()
    post_path = ROOT / "saber" / article["slug"] / "index.html"
    if post_path.exists():
        raise RuntimeError(f"Post path already exists: {post_path}")

    write_text(post_path, render_article(article, image, published_at))
    registry.append(registry_entry(article, image, published_at, args.slot))
    write_text(REGISTRY_PATH, json.dumps(registry, ensure_ascii=False, indent=2) + "\n")
    update_hub(registry)
    update_sitemap(article["slug"])
    print(
        json.dumps(
            {
                "slug": article["slug"],
                "title": article["title"]["es"],
                "url": f"https://www.primofisico.com/saber/{article['slug']}/",
                "slot": args.slot,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
