---
name: web-extraction
description: Extract structured design data (visual assets, brand tokens, page structure) from a live website using Puppeteer headless Chrome. Use when you need to crawl a site for video creative work, design analysis, or any task that needs the site's images, SVGs, fonts, color palette, and section layout in a structured form.
metadata:
  tags: extraction, puppeteer, assets, design-tokens, website-analysis
---

# Web Extraction

Extract assets, design tokens, and page structure from a target URL using `puppeteer-core` headless Chrome. Output is a structured `extraction/` tree consumable by downstream creative tooling (e.g. the `/product-launch-video` orchestrator).

## Tool

All extraction uses Puppeteer headless Chrome — no MCP tools needed. Write Node.js scripts using `puppeteer-core` to navigate pages, intercept network resources, and extract DOM data.

`puppeteer-core` is expected to be installed at project level (no npm install needed). Chrome is at:

- macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Linux: `/usr/bin/chromium`

## Output structure

```
extraction/
├── shared/                         # Site-wide assets
│   ├── tokens.json                 # Brand colors, font families
│   ├── logos/                      # Brand logo(s)
│   └── fonts/                      # Font files
├── pages/{page}/                   # Per-page assets
│   ├── tokens.json                 # Page-specific colors, accents
│   ├── sections.json               # Page structure and content
│   ├── images/                     # Page images
│   └── svgs/                       # Page-specific icons
├── screenshots/{page}/             # Reference only (1-2 per page)
├── inventory.json                  # All discoverable assets (step 2)
├── manifest.json                   # Selected URLs (step 3)
└── report.json                     # Coverage report (step 8)
```

## Procedure

### Step 1: Discover pages

Write a Puppeteer script that opens the target URL and collects internal navigation links:

```js
const links = await page.evaluate(() => {
  return [...document.querySelectorAll("nav a, footer a, header a")]
    .map((a) => ({ text: a.textContent.trim(), href: a.href }))
    .filter((l) => l.href.startsWith(window.location.origin) && l.text.length > 0);
});
```

Select pages with strong visual content (homepage, product pages, feature pages). Skip legal/auth/utility pages.

### Step 2: Inventory — scan assets WITHOUT downloading

Run the bundled crawler in inventory mode:

```bash
node scripts/crawl-assets.mjs --inventory extraction <url1> [url2] ...
```

Produces `extraction/inventory.json` — every image, SVG, and font the browser loaded, with `url` / `filename` / `contentType` / `width` / `height` / `size` / `alt` / `classification` (`logo` | `image` | `svg` | `font` | `inline-svg`).

Then auto-filter obvious junk:

```bash
node scripts/filter-inventory.mjs extraction/inventory.json
```

Removes images < 200px in either dimension, tracking pixels, `.ico` files, and placeholder/spacer/spinner filenames. Logos and fonts are always kept. Overwrites in place.

### Step 3: Review filtered inventory and select assets

Read `extraction/inventory.json` (already filtered). Do content-based selection by filename / URL / alt:

- **KEEP** hero images, product shots, feature illustrations (high-res preferred)
- **KEEP** brand logos and fonts (filter already preserved them)
- **SKIP** social media icons, badges, rating stars (generic)
- **SKIP** duplicates at different resolutions — keep the largest
- When unsure, **KEEP**

Write selected URLs to `extraction/manifest.json`:

```json
{
  "urls": ["https://...", "https://..."]
}
```

### Step 4: Download selected assets

```bash
node scripts/crawl-assets.mjs --manifest extraction/manifest.json extraction <url1> [url2] ...
```

Downloads only the chosen assets, extracts tokens/sections/screenshots, and writes `extraction/report.json`.

### Step 5: Extract design tokens

For each page, use `page.evaluate()` to extract computed colors, fonts, and spacing:

```js
const tokens = await page.evaluate(() => {
  const colors = new Set();
  const fonts = new Map();
  document.querySelectorAll("h1,h2,h3,p,a,button,section,header").forEach((el) => {
    const s = getComputedStyle(el);
    colors.add(s.color);
    colors.add(s.backgroundColor);
    // ... collect font families, weights, sizes
  });
  return { colors: [...colors], fonts: [...fonts.values()] };
});
```

- Site-wide tokens → `extraction/shared/tokens.json`
- Page-specific tokens → `extraction/pages/{page}/tokens.json`

### Step 6: Extract sections

```js
const sections = await page.evaluate(() => {
  return [...document.querySelectorAll('section, [class*="hero"], main > div')]
    .map((el) => ({
      id: el.id,
      heading: el.querySelector("h1,h2,h3")?.textContent?.trim(),
      body: el.querySelector("p")?.textContent?.trim(),
      images: [...el.querySelectorAll("img")].map((img) => img.src),
      background: getComputedStyle(el).backgroundColor,
    }))
    .filter((s) => s.heading || s.images.length > 0);
});
```

Save to `extraction/pages/{page}/sections.json`.

### Step 7: Screenshots (minimal)

1-2 per page is enough. Reference only.

```js
await page.screenshot({ path: `extraction/screenshots/${slug}/full-page.png`, fullPage: true });
```

### Step 8: Write report.json

```json
{
  "url": "...",
  "pages": ["home", "iphone"],
  "shared": {
    "logos": {"count": N, "files": [{"name": "...", "path": "shared/logos/..."}]},
    "fonts": {"count": N, "files": [...]}
  },
  "pageAssets": {
    "home": {
      "images": {"count": N, "files": [...]},
      "svgs": {"count": N, "files": [...]}
    }
  }
}
```

## Sample script

A complete working crawler is at [`scripts/crawl-assets.mjs`](./scripts/crawl-assets.mjs). It supports three modes:

- `--inventory` — scan all assets with metadata without downloading
- `--manifest <file>` — download only URLs listed in the manifest
- (default) — download everything (legacy)

Use it as reference. For targeted work (re-crawl one page, download specific assets), write a focused script based on the same Puppeteer patterns.

## Retry / targeted download

If some assets failed on first run, write a small script to re-crawl just that page:

```js
const page = await browser.newPage();
await page.goto("https://www.apple.com/iphone/", { waitUntil: "networkidle2" });
// intercept and save only what's missing
```

Much faster than re-running the full extraction.

## See also

- `/product-launch-video` — orchestrator that consumes `extraction/` as Phase 1 of a launch-video pipeline.
