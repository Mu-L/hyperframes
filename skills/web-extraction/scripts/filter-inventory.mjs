#!/usr/bin/env node
/**
 * filter-inventory.mjs — Remove assets that fail hard criteria from inventory.
 *
 * Reads inventory.json, applies deterministic filters, writes back.
 * The agent then only reviews the filtered list for content-based selection.
 *
 * Usage: node filter-inventory.mjs <inventory.json>
 */

import { readFileSync, writeFileSync } from "fs";

const SKIP_FILENAMES = ["placeholder", "spacer", "pixel", "blank", "loading", "spinner"];
const MIN_DIM = 200;

const path = process.argv[2];
if (!path) {
  console.error("Usage: node filter-inventory.mjs <inventory.json>");
  process.exit(1);
}

const inventory = JSON.parse(readFileSync(path, "utf-8"));
const kept = [];
const skipped = { smallDims: 0, skipFilename: 0, ico: 0, tinyTracker: 0 };

for (const item of inventory) {
  // Fonts and SVGs always pass through
  if (item.type !== "image") {
    kept.push(item);
    continue;
  }

  // Logos/brand assets always kept regardless of size
  if (item.classification === "logo") {
    kept.push(item);
    continue;
  }

  const fname = item.filename.toLowerCase();

  // .ico files — useless for video
  if (fname.endsWith(".ico")) {
    skipped.ico++;
    continue;
  }

  // Tiny tracking pixels (1x1, 2x2, etc.)
  if (item.width && item.height && item.width <= 4 && item.height <= 4) {
    skipped.tinyTracker++;
    continue;
  }

  // Skip filenames that suggest non-visual content
  if (SKIP_FILENAMES.some((p) => fname.includes(p))) {
    skipped.skipFilename++;
    continue;
  }

  // Dimension filter: either dimension < MIN_DIM (when dimensions are known)
  if (item.width && item.height) {
    if (item.width < MIN_DIM || item.height < MIN_DIM) {
      skipped.smallDims++;
      continue;
    }
  }

  kept.push(item);
}

writeFileSync(path, JSON.stringify(kept, null, 2));

const totalSkipped = Object.values(skipped).reduce((a, b) => a + b, 0);
const images = inventory.filter((i) => i.type === "image").length;
const keptImages = kept.filter((i) => i.type === "image").length;

console.log(`Filtered: ${inventory.length} → ${kept.length} assets`);
console.log(`Images: ${images} → ${keptImages} (removed ${totalSkipped})`);
if (skipped.smallDims) console.log(`  - ${skipped.smallDims} below ${MIN_DIM}px`);
if (skipped.tinyTracker) console.log(`  - ${skipped.tinyTracker} tracking pixels`);
if (skipped.skipFilename)
  console.log(`  - ${skipped.skipFilename} by filename (${SKIP_FILENAMES.join(", ")})`);
if (skipped.ico) console.log(`  - ${skipped.ico} .ico files`);
