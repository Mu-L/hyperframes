#!/usr/bin/env python3
"""Capture a webpage into a compact context pack for agent analysis.

This script intentionally does no model calls. It gathers rendered-page facts
that Claude can read directly: visible text, section candidates, style tokens,
asset inventory, screenshot, raw HTML, and optional downloaded assets.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import mimetypes
import re
import sys
import urllib.request
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright


ASSET_EXTENSIONS = (
    ".apng",
    ".avif",
    ".gif",
    ".glb",
    ".gltf",
    ".jpeg",
    ".jpg",
    ".json",
    ".lottie",
    ".m4v",
    ".mov",
    ".mp4",
    ".png",
    ".riv",
    ".svg",
    ".webm",
    ".webp",
    ".woff",
    ".woff2",
)


@dataclass(frozen=True)
class CaptureOptions:
    url: str
    out_dir: Path
    wait: float
    viewport_width: int
    viewport_height: int
    screenshot: bool
    download_assets: bool
    max_assets: int


def parse_viewport(value: str) -> tuple[int, int]:
    match = re.fullmatch(r"(\d+)x(\d+)", value.strip())
    if not match:
        raise argparse.ArgumentTypeError("viewport must look like 1440x1200")
    return int(match.group(1)), int(match.group(2))


def clean_text(value: str, limit: int | None = None) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "..."
    return text


def safe_filename(url: str, index: int) -> str:
    parsed = urlparse(url)
    name = Path(parsed.path).name or f"asset-{index}"
    name = re.sub(r"[^a-zA-Z0-9._-]+", "-", name).strip(".-")
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:10]
    suffix = Path(name).suffix
    stem = Path(name).stem[:70] or "asset"
    if not suffix:
        guessed = mimetypes.guess_extension(mimetypes.guess_type(url)[0] or "")
        suffix = guessed or ".bin"
    return f"{index:03d}-{stem}-{digest}{suffix}"


def is_probable_asset(url: str) -> bool:
    parsed = urlparse(url)
    path = parsed.path.lower()
    return path.endswith(ASSET_EXTENSIONS) or "image" in path or "video" in path


def download_url(url: str, path: Path) -> tuple[bool, str | None]:
    try:
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
                )
            },
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            path.write_bytes(response.read())
        return True, None
    except Exception as exc:  # noqa: BLE001 - CLI should report and continue.
        return False, str(exc)


async def collect_page_data(options: CaptureOptions) -> dict[str, Any]:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": options.viewport_width, "height": options.viewport_height},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
            ),
        )

        await page.goto(options.url, wait_until="domcontentloaded", timeout=60_000)
        await page.wait_for_timeout(int(options.wait * 1000))

        # Trigger common lazy-loaded content without sampling every scroll stop.
        await page.evaluate(
            """async () => {
                const height = document.documentElement.scrollHeight || document.body.scrollHeight;
                for (const y of [0, height * 0.25, height * 0.5, height * 0.75, height]) {
                    window.scrollTo(0, y);
                    await new Promise(resolve => setTimeout(resolve, 250));
                }
                window.scrollTo(0, 0);
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            }"""
        )

        data = await page.evaluate(
            """() => {
                const clean = (text, limit = 400) => {
                    const value = (text || '').replace(/\\s+/g, ' ').trim();
                    return value.length > limit ? value.slice(0, limit - 1).trim() + '...' : value;
                };
                const abs = (url) => {
                    try { return new URL(url, location.href).href; } catch { return null; }
                };
                const rectFor = (el) => {
                    const r = el.getBoundingClientRect();
                    return {
                        x: Math.round(r.x + window.scrollX),
                        y: Math.round(r.y + window.scrollY),
                        width: Math.round(r.width),
                        height: Math.round(r.height)
                    };
                };
                const visible = (el) => {
                    const r = el.getBoundingClientRect();
                    const cs = window.getComputedStyle(el);
                    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
                };
                const selectorFor = (el) => {
                    const tag = el.tagName.toLowerCase();
                    if (el.id) return `${tag}#${el.id}`;
                    const cls = typeof el.className === 'string'
                        ? el.className.split(/\\s+/).filter(Boolean).slice(0, 3).join('.')
                        : '';
                    return cls ? `${tag}.${cls}` : tag;
                };
                const backgroundUrl = (el) => {
                    const bg = window.getComputedStyle(el).backgroundImage;
                    if (!bg || bg === 'none') return null;
                    const match = bg.match(/url\\(["']?([^"')]+)["']?\\)/);
                    return match ? abs(match[1]) : null;
                };
                const assetMap = new Map();
                const pushAsset = (asset) => {
                    if (!asset.url) return;
                    const key = asset.url.split('#')[0];
                    if (!key || key.startsWith('data:') || assetMap.has(key)) return;
                    assetMap.set(key, { ...asset, url: key });
                };

                document.querySelectorAll('img').forEach((el) => {
                    const r = rectFor(el);
                    pushAsset({
                        kind: 'image',
                        url: abs(el.currentSrc || el.src || el.getAttribute('data-src') || ''),
                        alt: el.alt || '',
                        selector: selectorFor(el),
                        rect: r,
                        nearbyText: clean(el.closest('section, header, main, article, div')?.textContent || '', 260)
                    });
                    const srcset = el.getAttribute('srcset') || '';
                    srcset.split(',').map(s => s.trim().split(/\\s+/)[0]).filter(Boolean).forEach((src) => {
                        pushAsset({ kind: 'image-srcset', url: abs(src), alt: el.alt || '', selector: selectorFor(el), rect: r });
                    });
                });

                document.querySelectorAll('video, source').forEach((el) => {
                    const r = rectFor(el);
                    pushAsset({
                        kind: el.tagName.toLowerCase() === 'video' ? 'video' : 'source',
                        url: abs(el.currentSrc || el.src || el.getAttribute('src') || el.getAttribute('data-src') || ''),
                        poster: abs(el.getAttribute('poster') || ''),
                        selector: selectorFor(el),
                        rect: r,
                        nearbyText: clean(el.closest('section, header, main, article, div')?.textContent || '', 260)
                    });
                    if (el.getAttribute('poster')) {
                        pushAsset({ kind: 'video-poster', url: abs(el.getAttribute('poster')), selector: selectorFor(el), rect: r });
                    }
                });

                document.querySelectorAll('[style], section, header, main, div').forEach((el) => {
                    const bg = backgroundUrl(el);
                    if (bg) {
                        pushAsset({
                            kind: 'background-image',
                            url: bg,
                            selector: selectorFor(el),
                            rect: rectFor(el),
                            nearbyText: clean(el.textContent || '', 220)
                        });
                    }
                });

                document.querySelectorAll('link[href], script[src], lottie-player[src], canvas[data-rive-url]').forEach((el) => {
                    const url = abs(el.getAttribute('href') || el.getAttribute('src') || el.getAttribute('data-rive-url') || '');
                    pushAsset({ kind: el.tagName.toLowerCase(), url, selector: selectorFor(el), rect: rectFor(el) });
                });

                // CSSOM walk for @font-face src URLs. Sites typically declare
                // brand fonts via <style>@font-face{src:url(...)}</style>, not
                // as <link rel="preload" as="font"> tags, so the DOM-only scan
                // above misses them. Iterate stylesheets that are same-origin
                // (cross-origin sheets throw on .cssRules access and are skipped).
                for (const sheet of Array.from(document.styleSheets)) {
                    let rules;
                    try { rules = sheet.cssRules; } catch { continue; }
                    if (!rules) continue;
                    for (const rule of Array.from(rules)) {
                        if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
                        const family = (rule.style.getPropertyValue('font-family') || '').replace(/^['"]|['"]$/g, '');
                        const src = rule.style.getPropertyValue('src') || '';
                        // src can carry multiple url(...) entries (woff2 + woff fallback); pull all.
                        const urlMatches = [...src.matchAll(/url\\(\\s*["']?([^"')]+)["']?\\s*\\)/g)];
                        for (const m of urlMatches) {
                            pushAsset({
                                kind: 'font-face',
                                url: abs(m[1]),
                                family,
                                selector: '@font-face'
                            });
                        }
                    }
                }

                document.querySelectorAll('meta[property], meta[name]').forEach((el) => {
                    const key = el.getAttribute('property') || el.getAttribute('name') || '';
                    const content = el.getAttribute('content') || '';
                    if (/image|video/i.test(key)) {
                        pushAsset({ kind: `meta:${key}`, url: abs(content), selector: 'meta' });
                    }
                });

                const sectionCandidates = Array.from(document.querySelectorAll('header, main, section, article, footer, [role="banner"], [role="main"], [role="contentinfo"], body > div'))
                    .filter(visible)
                    .map((el, index) => {
                        const cs = window.getComputedStyle(el);
                        const headings = Array.from(el.querySelectorAll('h1,h2,h3')).slice(0, 5).map(h => clean(h.textContent, 140));
                        const buttons = Array.from(el.querySelectorAll('a,button')).filter(visible).slice(0, 8).map(a => clean(a.textContent, 80)).filter(Boolean);
                        return {
                            index,
                            selector: selectorFor(el),
                            tag: el.tagName.toLowerCase(),
                            role: el.getAttribute('role') || null,
                            rect: rectFor(el),
                            backgroundColor: cs.backgroundColor,
                            color: cs.color,
                            headings,
                            callsToAction: buttons,
                            text: clean(el.textContent, 700),
                            assetUrls: Array.from(assetMap.values())
                                .filter(asset => asset.rect && asset.rect.y >= rectFor(el).y - 20 && asset.rect.y <= rectFor(el).y + rectFor(el).height + 20)
                                .slice(0, 20)
                                .map(asset => asset.url)
                        };
                    })
                    .filter(s => s.rect.height >= 120 && s.rect.width >= 320);

                const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
                    .filter(visible)
                    .slice(0, 80)
                    .map((el) => ({ level: el.tagName.toLowerCase(), text: clean(el.textContent, 180), rect: rectFor(el) }));

                const links = Array.from(document.querySelectorAll('a[href]'))
                    .filter(visible)
                    .slice(0, 120)
                    .map((el) => ({ text: clean(el.textContent, 100), href: abs(el.getAttribute('href')), rect: rectFor(el) }))
                    .filter(link => link.text || link.href);

                const meta = {};
                document.querySelectorAll('meta[property], meta[name]').forEach((el) => {
                    const key = el.getAttribute('property') || el.getAttribute('name');
                    if (key) meta[key] = el.getAttribute('content') || '';
                });

                const colors = new Map();
                document.querySelectorAll('body, main, section, header, footer, h1, h2, h3, p, a, button').forEach((el) => {
                    if (!visible(el)) return;
                    const cs = window.getComputedStyle(el);
                    [cs.color, cs.backgroundColor, cs.borderColor].forEach((color) => {
                        if (color && color !== 'rgba(0, 0, 0, 0)') colors.set(color, (colors.get(color) || 0) + 1);
                    });
                });

                return {
                    capturedAt: new Date().toISOString(),
                    url: location.href,
                    title: document.title || '',
                    meta,
                    viewport: { width: window.innerWidth, height: window.innerHeight },
                    page: {
                        width: document.documentElement.scrollWidth,
                        height: document.documentElement.scrollHeight,
                        language: document.documentElement.lang || ''
                    },
                    visibleText: clean(document.body.innerText || '', 12000),
                    headings,
                    links,
                    sections: sectionCandidates,
                    assets: Array.from(assetMap.values()),
                    styleTokens: {
                        colors: Array.from(colors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24)
                    }
                };
            }"""
        )

        html = await page.content()
        if options.screenshot:
            await page.screenshot(path=options.out_dir / "screenshot_full.png", full_page=True)
        await browser.close()

    data["requestedUrl"] = options.url
    data["htmlLength"] = len(html)
    data["htmlPath"] = "page.html"
    (options.out_dir / "page.html").write_text(html, encoding="utf-8")
    return data


def write_context_pack(out_dir: Path, data: dict[str, Any], downloaded: list[dict[str, Any]]) -> None:
    meta = data.get("meta", {})
    product_signals = [
        ("title", data.get("title", "")),
        ("description", meta.get("description") or meta.get("og:description") or ""),
        ("og:title", meta.get("og:title", "")),
        ("og:site_name", meta.get("og:site_name", "")),
    ]

    lines: list[str] = [
        "# Web Context Pack",
        "",
        "## Source",
        "",
        f"- Requested URL: {data.get('requestedUrl', '')}",
        f"- Final URL: {data.get('url', '')}",
        f"- Captured at: {data.get('capturedAt', '')}",
        f"- Title: {data.get('title', '')}",
        f"- Page size: {data.get('page', {}).get('width')}x{data.get('page', {}).get('height')}",
        "",
        "## Product Signals",
        "",
    ]

    for key, value in product_signals:
        if value:
            lines.append(f"- {key}: {clean_text(str(value), 300)}")

    lines.extend(["", "## Headings", ""])
    for item in data.get("headings", [])[:40]:
        rect = item.get("rect", {})
        lines.append(f"- {item.get('level', '')} y={rect.get('y')}: {item.get('text', '')}")

    local_by_url = {item["url"]: item.get("local_path", "") for item in downloaded}

    lines.extend(["", "## Section Candidates", ""])
    for section in data.get("sections", [])[:40]:
        rect = section.get("rect", {})
        headings = "; ".join([h for h in section.get("headings", []) if h])
        ctas = "; ".join([c for c in section.get("callsToAction", []) if c])
        lines.append(
            f"### Section {section.get('index')} - {section.get('selector')} "
            f"(y={rect.get('y')}, h={rect.get('height')})"
        )
        if headings:
            lines.append(f"- Headings: {headings}")
        if ctas:
            lines.append(f"- CTAs: {ctas}")
        if section.get("backgroundColor"):
            lines.append(f"- Background: {section.get('backgroundColor')}")
        if section.get("assetUrls"):
            seen = set()
            section_assets = []
            for url in section.get("assetUrls", []):
                local = local_by_url.get(url)
                if not local:
                    continue
                if local not in seen:
                    seen.add(local)
                    section_assets.append(local)
                if len(section_assets) >= 4:
                    break
            if section_assets:
                lines.append("- Assets:")
                for entry in section_assets:
                    lines.append(f"  - {entry}")
        if section.get("text"):
            lines.append(f"- Text: {section.get('text')}")
        lines.append("")

    lines.extend(["## Asset Inventory", ""])
    assets = data.get("assets", [])
    downloaded_index = 0
    for asset in assets:
        local = local_by_url.get(asset.get("url", ""))
        if not local:
            continue
        downloaded_index += 1
        rect = asset.get("rect") or {}
        lines.append(
            f"- {downloaded_index}. [{asset.get('kind')}] {local} "
            f"(y={rect.get('y')}, {rect.get('width')}x{rect.get('height')})"
        )
        if asset.get("alt"):
            lines.append(f"  alt: {clean_text(asset.get('alt', ''), 160)}")
        if asset.get("nearbyText"):
            lines.append(f"  nearby: {clean_text(asset.get('nearbyText', ''), 220)}")

    lines.extend(["", "## Visible Text Excerpt", "", clean_text(data.get("visibleText", ""), 6000)])
    (out_dir / "context_pack.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def download_assets(out_dir: Path, data: dict[str, Any], max_assets: int) -> list[dict[str, Any]]:
    assets_dir = out_dir / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    downloaded: list[dict[str, Any]] = []
    candidates = [asset for asset in data.get("assets", []) if is_probable_asset(asset.get("url", ""))]

    # Fonts are critical for matching site brand identity downstream
    # (build-design.mjs greps research/assets/ for woff/woff2). They are also
    # rare (typically 1-6 per site) and often listed late in the asset map
    # (after every image and srcset), so the default max_assets=80 truncation
    # silently drops them. Hoist them to the front so they always download.
    def is_font(url: str) -> bool:
        return any(url.lower().split("?", 1)[0].endswith(ext) for ext in (".woff2", ".woff", ".otf", ".ttf"))

    fonts = [a for a in candidates if is_font(a.get("url", ""))]
    non_fonts = [a for a in candidates if not is_font(a.get("url", ""))]
    candidates = fonts + non_fonts[: max(0, max_assets - len(fonts))]

    for index, asset in enumerate(candidates, start=1):
        url = asset["url"]
        filename = safe_filename(url, index)
        path = assets_dir / filename
        ok, error = download_url(url, path)
        record = {
            "url": url,
            "kind": asset.get("kind"),
            "local_path": str(path.relative_to(out_dir)) if ok else "",
            "success": ok,
            "error": error,
        }
        downloaded.append(record)

    (assets_dir / "index.json").write_text(
        json.dumps(downloaded, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return downloaded


async def run(options: CaptureOptions) -> None:
    options.out_dir.mkdir(parents=True, exist_ok=True)
    data = await collect_page_data(options)
    downloaded: list[dict[str, Any]] = []
    if options.download_assets:
        downloaded = download_assets(options.out_dir, data, options.max_assets)
    else:
        assets_dir = options.out_dir / "assets"
        assets_dir.mkdir(parents=True, exist_ok=True)
        (assets_dir / "index.json").write_text("[]\n", encoding="utf-8")

    data["downloadedAssets"] = downloaded
    (options.out_dir / "extraction.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    write_context_pack(options.out_dir, data, downloaded)

    print(f"Captured: {data.get('url')}")
    print(f"Context pack: {options.out_dir / 'context_pack.md'}")
    print(f"Extraction JSON: {options.out_dir / 'extraction.json'}")
    if options.screenshot:
        print(f"Screenshot: {options.out_dir / 'screenshot_full.png'}")
    print(f"Assets listed: {len(data.get('assets', []))}; downloaded: {sum(1 for item in downloaded if item.get('success'))}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Capture webpage context for Claude analysis")
    parser.add_argument("url", help="Webpage URL to capture")
    parser.add_argument("--out", "-o", default="web_context_output", help="Output directory")
    parser.add_argument("--wait", type=float, default=3.0, help="Seconds to wait after page load")
    parser.add_argument("--viewport", type=parse_viewport, default=(1440, 1200), help="Viewport like 1440x1200")
    parser.add_argument("--no-screenshot", action="store_true", help="Skip full-page screenshot")
    parser.add_argument("--download-assets", action="store_true", help="Download probable image/video/font assets")
    parser.add_argument("--max-assets", type=int, default=80, help="Maximum assets to download")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    width, height = args.viewport
    options = CaptureOptions(
        url=args.url,
        out_dir=Path(args.out),
        wait=args.wait,
        viewport_width=width,
        viewport_height=height,
        screenshot=not args.no_screenshot,
        download_assets=args.download_assets,
        max_assets=args.max_assets,
    )
    try:
        asyncio.run(run(options))
    except Exception as exc:  # noqa: BLE001 - CLI should be direct.
        print(f"capture failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
