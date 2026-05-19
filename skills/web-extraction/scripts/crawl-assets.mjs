#!/usr/bin/env node
/**
 * crawl-assets.mjs — Asset crawler with inventory-first workflow.
 *
 * Modes:
 *   --inventory   Scan pages, list all discoverable assets with metadata (no download)
 *   --manifest F  Download only URLs listed in manifest file F
 *   (default)     Download everything (legacy behavior)
 *
 * Usage:
 *   node crawl-assets.mjs --inventory <output-dir> <url1> [url2] ...
 *   node crawl-assets.mjs --manifest extraction/manifest.json <output-dir> <url1> [url2] ...
 *   node crawl-assets.mjs <output-dir> <url1> [url2] ...
 */

import { launch } from "puppeteer-core";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, extname, basename } from "path";
import { URL } from "url";
import { createHash } from "crypto";
import { parseImageDimensions } from "./parse-image-dims.mjs";

// --- Config ---
const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const FONT_EXTS = new Set([".woff2", ".woff", ".ttf", ".otf", ".eot"]);
const SVG_EXT = ".svg";
const SKIP_PATTERNS = ["pixel", "tracking", "analytics", "beacon", "spacer", "data:"];
const VIEWPORT = { width: 1920, height: 1080 };

// --- Parse args ---
let mode = "default"; // 'inventory' | 'manifest' | 'default'
let manifestPath = null;
const filteredArgs = [];

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--inventory") {
    mode = "inventory";
  } else if (process.argv[i] === "--manifest") {
    mode = "manifest";
    manifestPath = process.argv[++i];
  } else {
    filteredArgs.push(process.argv[i]);
  }
}

if (filteredArgs.length < 2) {
  console.error(
    "Usage: node crawl-assets.mjs [--inventory | --manifest <file>] <output-dir> <url1> [url2] ...",
  );
  process.exit(1);
}

const outputDir = filteredArgs[0];
const urls = filteredArgs.slice(1);

// Load manifest allowlist if in manifest mode
let allowedUrls = null;
if (mode === "manifest") {
  if (!manifestPath || !existsSync(manifestPath)) {
    console.error(`Manifest file not found: ${manifestPath}`);
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  allowedUrls = new Set(manifest.urls || []);
  console.log(`Manifest: ${allowedUrls.size} URLs to download`);
}

// --- Helpers ---
function findChrome() {
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  throw new Error("Chrome not found. Install Chrome or set CHROME_BIN env var.");
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function sanitizeFilename(url, fallback) {
  try {
    const parsed = new URL(url);
    let name = basename(parsed.pathname).split("?")[0];
    if (!name || name === "/" || name === "") return fallback;
    return name.replace(/[^a-zA-Z0-9._-]/g, "-");
  } catch {
    return fallback;
  }
}

function pageSlug(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/|\/$/g, "");
    if (!path) return "home";
    return path.replace(/\//g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  } catch {
    return "unknown";
  }
}

function isLogoHint(url) {
  const lower = url.toLowerCase();
  return lower.includes("logo") || lower.includes("brand") || lower.includes("favicon");
}

function classify(type, url) {
  if (type === "font") return "font";
  if (isLogoHint(url)) return "logo";
  if (type === "svg") return "svg";
  return "image";
}

// --- Main ---
const chromePath = process.env.CHROME_BIN || findChrome();
console.log(`Mode: ${mode}`);
console.log(`Chrome: ${chromePath}`);
console.log(`Output: ${outputDir}`);
console.log(`Pages: ${urls.length}`);

if (mode !== "inventory") {
  ensureDir(join(outputDir, "shared", "logos"));
  ensureDir(join(outputDir, "shared", "fonts"));
  ensureDir(join(outputDir, "screenshots"));
}

const browser = await launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const allAssets = { shared: { logos: [], fonts: [] }, pages: {} };
const inventory = []; // for inventory mode
const seenUrls = new Set();

for (const url of urls) {
  const slug = pageSlug(url);
  console.log(`\n--- Page: ${slug} (${url}) ---`);

  if (mode !== "inventory") {
    const pageDir = join(outputDir, "pages", slug);
    ensureDir(join(pageDir, "images"));
    ensureDir(join(pageDir, "svgs"));
  }

  const pageAssets = { images: [], svgs: [], fonts: [] };
  const saveQueue = [];

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Intercept network responses
  page.on("response", async (response) => {
    try {
      const resUrl = response.url();
      if (seenUrls.has(resUrl)) return;

      const contentType = response.headers()["content-type"] || "";
      const status = response.status();
      if (status < 200 || status >= 400) return;

      const ext = extname(new URL(resUrl).pathname.split("?")[0]).toLowerCase();
      let type = null;

      if (IMAGE_EXTS.has(ext) || contentType.startsWith("image/")) {
        if (SKIP_PATTERNS.some((p) => resUrl.includes(p))) return;
        type = "image";
      } else if (ext === SVG_EXT || contentType.includes("svg")) {
        type = "svg";
      } else if (FONT_EXTS.has(ext) || contentType.includes("font")) {
        type = "font";
      }
      if (!type) return;

      seenUrls.add(resUrl);

      const finalExt = ext || (type === "font" ? ".woff2" : type === "svg" ? ".svg" : ".jpg");
      const name = sanitizeFilename(
        resUrl,
        `asset-${createHash("md5").update(resUrl).digest("hex").slice(0, 8)}${finalExt}`,
      );
      const finalName = extname(name) ? name : `${name}${finalExt}`;
      const contentLength = parseInt(response.headers()["content-length"] || "0", 10);

      if (mode === "inventory") {
        // Read buffer to get real pixel dimensions (only reads header bytes)
        let width = null;
        let height = null;
        let actualSize = contentLength;
        if (type === "image") {
          try {
            const buffer = await response.buffer();
            actualSize = buffer.length;
            const dims = parseImageDimensions(buffer);
            if (dims) {
              width = dims.width;
              height = dims.height;
            }
          } catch {
            // response.buffer() can fail for redirects/aborted requests
          }
        }
        inventory.push({
          url: resUrl,
          page: slug,
          type,
          classification: classify(type, resUrl),
          filename: finalName,
          contentType,
          size: actualSize,
          width,
          height,
        });
      } else {
        // Download mode — check manifest if applicable
        if (allowedUrls && !allowedUrls.has(resUrl)) return;

        const buffer = await response.buffer().catch(() => null);
        if (!buffer || buffer.length === 0) return;
        if (buffer.length < 200 && type === "image") return;

        saveQueue.push({ type, url: resUrl, buffer, finalName });
      }
    } catch {
      // Skip failed responses
    }
  });

  // Navigate and scroll
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
  await page.evaluate(async () => {
    for (let i = 0; i < document.body.scrollHeight; i += 500) {
      window.scrollTo(0, i);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 2000));

  if (mode === "inventory") {
    // DOM dimensions as fallback for images that failed buffer parsing
    const domImages = await page.evaluate(() => {
      return [...document.querySelectorAll("img")]
        .map((img) => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          alt: img.alt || "",
        }))
        .filter((i) => i.src && i.naturalWidth > 0);
    });

    const dimMap = new Map(domImages.map((i) => [i.src, i]));
    for (const item of inventory) {
      if (item.page === slug && item.type === "image") {
        const domInfo = dimMap.get(item.url);
        // Only use DOM dims as fallback when buffer parsing failed
        if (!item.width && domInfo) {
          item.width = domInfo.naturalWidth;
          item.height = domInfo.naturalHeight;
        }
        // Always add alt text if available (helps agent judge content)
        if (domInfo?.alt) {
          item.alt = domInfo.alt;
        }
      }
    }

    // Also inventory inline SVGs
    const inlineSvgs = await page.evaluate(() => {
      return [...document.querySelectorAll("svg")]
        .filter((svg) => svg.getBoundingClientRect().width >= 5)
        .map((svg, i) => {
          const hint = (
            (svg.closest("[class]")?.className || "") +
            " " +
            (svg.getAttribute("aria-label") || "")
          ).trim();
          const rect = svg.getBoundingClientRect();
          return {
            hint: hint.slice(0, 60),
            index: i,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        });
    });

    for (const svg of inlineSvgs) {
      const name = svg.hint
        ? `${svg.hint.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.svg`
        : `inline-svg-${svg.index}.svg`;
      inventory.push({
        url: `inline://${slug}/svg/${svg.index}`,
        page: slug,
        type: "svg",
        classification: "inline-svg",
        filename: name,
        contentType: "image/svg+xml",
        size: 0,
        width: svg.width,
        height: svg.height,
      });
    }

    console.log(`  discovered: ${inventory.filter((i) => i.page === slug).length} assets`);
  } else {
    // Save captured resources
    const pageDir = join(outputDir, "pages", slug);
    for (const res of saveQueue) {
      if (res.type === "font") {
        const dest = join(outputDir, "shared", "fonts", res.finalName);
        writeFileSync(dest, res.buffer);
        allAssets.shared.fonts.push({ name: res.finalName, path: `shared/fonts/${res.finalName}` });
        console.log(`  font: ${res.finalName}`);
      } else if (isLogoHint(res.url)) {
        const dest = join(outputDir, "shared", "logos", res.finalName);
        writeFileSync(dest, res.buffer);
        allAssets.shared.logos.push({ name: res.finalName, path: `shared/logos/${res.finalName}` });
        console.log(`  logo: ${res.finalName}`);
      } else if (res.type === "svg") {
        const dest = join(pageDir, "svgs", res.finalName);
        writeFileSync(dest, res.buffer);
        pageAssets.svgs.push({ name: res.finalName, path: `pages/${slug}/svgs/${res.finalName}` });
        console.log(`  svg: ${res.finalName}`);
      } else {
        const dest = join(pageDir, "images", res.finalName);
        writeFileSync(dest, res.buffer);
        pageAssets.images.push({
          name: res.finalName,
          path: `pages/${slug}/images/${res.finalName}`,
        });
        console.log(`  image: ${res.finalName}`);
      }
    }

    // Download inline SVGs (in download modes only)
    const inlineSvgs = await page.evaluate(() => {
      return [...document.querySelectorAll("svg")]
        .filter((svg) => svg.getBoundingClientRect().width >= 5)
        .map((svg, i) => {
          const hint = (
            (svg.closest("[class]")?.className || "") +
            " " +
            (svg.getAttribute("aria-label") || "")
          ).trim();
          return { html: svg.outerHTML, hint: hint.slice(0, 60), index: i };
        });
    });

    for (const svg of inlineSvgs) {
      const name = svg.hint
        ? `${svg.hint.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.svg`
        : `inline-svg-${svg.index}.svg`;
      const dest = join(pageDir, "svgs", name);
      if (!existsSync(dest)) {
        writeFileSync(dest, svg.html);
        pageAssets.svgs.push({ name, path: `pages/${slug}/svgs/${name}` });
        console.log(`  inline-svg: ${name}`);
      }
    }

    // Extract design tokens
    const tokens = await page.evaluate(() => {
      const colors = new Set();
      const fonts = new Map();
      document.querySelectorAll("h1,h2,h3,h4,p,a,button,section,header,footer").forEach((el) => {
        const s = getComputedStyle(el);
        if (s.color !== "rgb(0, 0, 0)") colors.add(s.color);
        if (s.backgroundColor !== "rgba(0, 0, 0, 0)") colors.add(s.backgroundColor);
        const key = s.fontFamily;
        if (!fonts.has(key)) fonts.set(key, { family: key, weights: new Set(), sizes: new Set() });
        fonts.get(key).weights.add(s.fontWeight);
        fonts.get(key).sizes.add(s.fontSize);
      });
      return {
        colors: [...colors],
        fonts: [...fonts.values()].map((f) => ({
          ...f,
          weights: [...f.weights],
          sizes: [...f.sizes],
        })),
      };
    });

    writeFileSync(join(pageDir, "tokens.json"), JSON.stringify(tokens, null, 2));
    console.log(`  tokens: ${tokens.colors.length} colors, ${tokens.fonts.length} font families`);

    // Extract sections
    const sections = await page.evaluate(() => {
      const results = [];
      document
        .querySelectorAll('section, [class*="hero"], [class*="feature"], main > div')
        .forEach((el, i) => {
          const heading = el.querySelector("h1,h2,h3");
          const body = el.querySelector("p");
          const cta = el.querySelector('a[class*="btn"], a[class*="cta"], button');
          const imgs = [...el.querySelectorAll("img")].map((img) => img.src).filter(Boolean);
          if (!heading && !body && imgs.length === 0) return;
          results.push({
            id: el.id || `section-${i}`,
            tag: el.className?.split(" ")[0] || "section",
            heading: heading?.textContent?.trim() || "",
            subheading: "",
            body: body?.textContent?.trim()?.slice(0, 500) || "",
            cta: cta ? [cta.textContent?.trim()] : [],
            images: imgs
              .map((src) => {
                try {
                  return new URL(src).pathname.split("/").pop();
                } catch {
                  return "";
                }
              })
              .filter(Boolean),
            layout: getComputedStyle(el).display,
            background: getComputedStyle(el).backgroundColor,
          });
        });
      return results;
    });

    writeFileSync(join(pageDir, "sections.json"), JSON.stringify(sections, null, 2));
    console.log(`  sections: ${sections.length}`);

    // Screenshot
    ensureDir(join(outputDir, "screenshots", slug));
    await page.screenshot({
      path: join(outputDir, "screenshots", slug, "full-page.png"),
      fullPage: true,
    });
    console.log(`  screenshot: full-page.png`);

    allAssets.pages[slug] = {
      images: { count: pageAssets.images.length, files: pageAssets.images },
      svgs: { count: pageAssets.svgs.length, files: pageAssets.svgs },
    };
  }

  await page.close();
}

await browser.close();

if (mode === "inventory") {
  // Write inventory.json
  ensureDir(outputDir);
  writeFileSync(join(outputDir, "inventory.json"), JSON.stringify(inventory, null, 2));
  const images = inventory.filter((i) => i.type === "image");
  const withDims = images.filter((i) => i.width);
  console.log(`\n=== Inventory ===`);
  console.log(`Total assets: ${inventory.length}`);
  console.log(`Images: ${images.length} (${withDims.length} with dimensions)`);
  console.log(`SVGs: ${inventory.filter((i) => i.type === "svg").length}`);
  console.log(`Fonts: ${inventory.filter((i) => i.type === "font").length}`);
  console.log(`Written to: ${join(outputDir, "inventory.json")}`);
} else {
  // Shared tokens
  const firstPageSlug = pageSlug(urls[0]);
  const firstTokensPath = join(outputDir, "pages", firstPageSlug, "tokens.json");
  if (existsSync(firstTokensPath)) {
    writeFileSync(join(outputDir, "shared", "tokens.json"), readFileSync(firstTokensPath));
  }

  // Report
  const report = {
    url: urls[0],
    pages: urls.map((u) => pageSlug(u)),
    shared: {
      logos: { count: allAssets.shared.logos.length, files: allAssets.shared.logos },
      fonts: { count: allAssets.shared.fonts.length, files: allAssets.shared.fonts },
    },
    pageAssets: allAssets.pages,
    checklist: {
      sharedTokens: { ok: existsSync(join(outputDir, "shared", "tokens.json")) },
      assets: { ok: true, total: seenUrls.size },
    },
  };
  writeFileSync(join(outputDir, "report.json"), JSON.stringify(report, null, 2));

  const totalImages = Object.values(allAssets.pages).reduce((s, p) => s + p.images.count, 0);
  const totalSvgs = Object.values(allAssets.pages).reduce((s, p) => s + p.svgs.count, 0);
  console.log(`\n=== Done ===`);
  console.log(`Pages: ${urls.length}`);
  console.log(`Logos: ${allAssets.shared.logos.length}`);
  console.log(`Fonts: ${allAssets.shared.fonts.length}`);
  console.log(`Images: ${totalImages}`);
  console.log(`SVGs: ${totalSvgs}`);
  console.log(`Total unique resources: ${seenUrls.size}`);
}
