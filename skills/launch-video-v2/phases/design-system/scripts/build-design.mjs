#!/usr/bin/env node
/**
 * build-design.mjs
 *
 * Merges site brand DNA (from designlang output) with a style preset into
 * a single design.html. design.html is the only artifact downstream phases
 * read.
 *
 * Usage:
 *   node build-design.mjs <design-system-dir> [--style <preset-name>] [--prefix <site-prefix>]
 *                                              [--out <file>] [--out-scores <file>] [--no-emit]
 *
 * --style:      force a preset (e.g. neo-brutalism, editorial). If omitted, auto-infers.
 * --prefix:     override site prefix (auto-detects <prefix>-design-tokens.json otherwise).
 * --out:        override design.html output path (default: <dir>/design.html).
 * --out-scores: where to write inference.json (default: <dir>/inference.json). Always written.
 * --no-emit:    run inference + write inference.json, but skip design.html / component rendering.
 *               Used by the design-system subagent for the "review before commit" pass:
 *               first run with --no-emit, read inference.json + designlang JSON, decide
 *               whether to override the baseline winner, then re-run with --style <X> to emit.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRESETS_DIR = path.resolve(__dirname, "..", "style-presets");

// ═══════════════════ CLI ═════════════════════════════════
const argv = process.argv.slice(2);
const outDir = path.resolve(argv[0] || ".");
let cliPrefix = null,
  cliOut = null,
  cliStyle = null,
  cliOutScores = null,
  cliNoEmit = false;
for (let i = 1; i < argv.length; i++) {
  if (argv[i] === "--prefix" && argv[i + 1]) cliPrefix = argv[++i];
  else if (argv[i] === "--out" && argv[i + 1]) cliOut = argv[++i];
  else if (argv[i] === "--style" && argv[i + 1]) cliStyle = argv[++i];
  else if (argv[i] === "--out-scores" && argv[i + 1]) cliOutScores = argv[++i];
  else if (argv[i] === "--no-emit") cliNoEmit = true;
}
if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
  console.error(`✗ ${outDir} is not a directory`);
  process.exit(1);
}

// ═══════════════════ Discover site prefix ════════════════
let prefix = cliPrefix;
if (!prefix) {
  const match = fs.readdirSync(outDir).find((f) => /-design-tokens\.json$/.test(f));
  if (!match) {
    console.error(`✗ No <prefix>-design-tokens.json in ${outDir}.`);
    process.exit(1);
  }
  prefix = match.replace(/-design-tokens\.json$/, "");
}
const outFile = cliOut ? path.resolve(cliOut) : path.join(outDir, "design.html");
const outScoresFile = cliOutScores ? path.resolve(cliOutScores) : path.join(outDir, "inference.json");

// ═══════════════════ Load designlang artifacts ═════════
function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(outDir, file), "utf8"));
  } catch {
    return fallback;
  }
}
function readText(file) {
  try {
    return fs.readFileSync(path.join(outDir, file), "utf8");
  } catch {
    return "";
  }
}
const tokens = readJSON(`${prefix}-design-tokens.json`, null);
const motion = readJSON(`${prefix}-motion-tokens.json`, { duration: {}, easing: {} });
const dna = readJSON(`${prefix}-visual-dna.json`, null);
const voice = readJSON(`${prefix}-voice.json`, null);
// intent.json holds pageIntent.type + sectionRoles.counts. Read separately —
// the old dna?.pageIntent?.type lookup silently fell back to "unknown" because
// pageIntent lives in intent.json, not visual-dna.json.
const intent = readJSON(`${prefix}-intent.json`, null);
// brand.html: designlang's canonical brand guidelines (already-classified
// primary/secondary/accent). Authoritative when present.
const brandHtml = readText(`${prefix}.brand.html`);

if (!tokens) {
  console.error(`✗ ${prefix}-design-tokens.json is required.`);
  process.exit(1);
}

// ═══════════════════ Extract brand DNA ═══════════════════
// designlang token schema (verified against figma.com output):
//   $metadata.{source, generator, generatedAt, version}
//   primitive.color.{brand|neutral|background|text}.<key>.$value = "#hex"
//   primitive.fontFamily.f0.$value = "..."
//   primitive.shadow.shN.$value = "rgba(...) Npx Npx Npx Npx"
//   primitive.radius.rN.$value = "Npx"
//   semantic.color.{action,surface,text}.<key>.$value (may be a {color} ref)

function valueOf(node) {
  if (!node) return null;
  if (typeof node === "string") return node;
  if (node.$value !== undefined) return node.$value;
  if (node.value !== undefined) return node.value;
  return null;
}
const meta = tokens.$metadata || {};
const sourceUrl = meta.source || "";

const prim = tokens.primitive || {};
const primColors = prim.color || {};
const fontFamilies = Object.values(prim.fontFamily || {})
  .map(valueOf)
  .filter(Boolean);

// Pull all color hexes (across brand/neutral/background/text) into a flat list
function gatherColors(node) {
  const out = [];
  for (const v of Object.values(node || {})) {
    const val = valueOf(v);
    if (typeof val === "string" && /^#[0-9a-f]{3,6}$/i.test(val)) out.push(val);
    else if (typeof v === "object" && v !== null && !v.$value) {
      out.push(...gatherColors(v));
    }
  }
  return out;
}
const allColors = gatherColors(primColors);

function isLight(hex) {
  const m = String(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!m) return true;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

// HSV saturation of a hex color, 0..1.
function saturation(hex) {
  const m = String(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!m) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

// Brand triplet source priority:
//   1. brand.html (designlang's canonical classification — most authoritative)
//   2. tokens primitive.color.brand.{primary,secondary} (no accent here)
//   3. saturation-based heuristic over allColors (last resort)
function brandFromBrandHtml(html) {
  if (!html) return null;
  const get = (cls) => {
    // <article class="brand-color brand-color-<role>"> ... <span class="big-swatch-hex">#XXXXXX</span>
    const re = new RegExp(
      `brand-color-${cls}[\\s\\S]*?big-swatch-hex"[^>]*>\\s*(#[0-9a-fA-F]{3,6})`,
    );
    const m = html.match(re);
    return m ? m[1].toLowerCase() : null;
  };
  const primary = get("primary");
  const secondary = get("secondary");
  const accent = get("accent");
  if (!primary && !secondary && !accent) return null;
  return { primary, secondary, accent };
}
const brandFromHtml = brandFromBrandHtml(brandHtml);

const primaryHex =
  brandFromHtml?.primary || valueOf(primColors.brand?.primary) || allColors[0] || "#000000";
const secondaryHex =
  brandFromHtml?.secondary ||
  valueOf(primColors.brand?.secondary) ||
  allColors.find((c) => c !== primaryHex) ||
  primaryHex;

const accentHex =
  brandFromHtml?.accent ||
  (() => {
    // Fallback algorithm: highest-saturation color distinct from primary/secondary
    const taken = new Set([primaryHex.toLowerCase(), secondaryHex.toLowerCase()]);
    const candidates = allColors
      .filter((c) => !taken.has(c.toLowerCase()))
      .map((c) => ({ c, s: saturation(c) }))
      .filter((o) => o.s > 0.5)
      .sort((a, b) => b.s - a.s);
    return candidates[0]?.c || secondaryHex;
  })();

// Background and text: prefer first entry of those buckets if present
const bgList = gatherColors(primColors.background || {});
const txList = gatherColors(primColors.text || {});
const canvasHex = bgList[0] || (isLight(primaryHex) ? "#ffffff" : "#0f0f0f");
const inkHex = txList[0] || (isLight(canvasHex) ? "#111111" : "#ffffff");

// ─── Decoration colors (used by brutalism + maximalist presets) ──────
// Auto-pick 4 vibrant colors from the site's full palette, with hue diversity.
// Fall back to brutalism canonical 4-color set if site is too monochrome.
function hue(hex) {
  const m = String(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!m) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}
const decoColors = (() => {
  const FALLBACK = ["#F7CB46", "#99E885", "#C0F7FE", "#FE90E8"]; // yellow / green / blue / pink
  const taken = new Set(
    [primaryHex, secondaryHex, accentHex, canvasHex, inkHex].map((c) => c.toLowerCase()),
  );
  const candidates = allColors
    .filter((c) => !taken.has(c.toLowerCase()))
    .map((c) => ({ c, s: saturation(c), h: hue(c) }))
    .filter((o) => o.s > 0.4)
    .sort((a, b) => b.s - a.s);
  // Hue-diverse pick: bucket by 90deg quadrants (warm / lime / cool / magenta).
  const buckets = [[], [], [], []];
  for (const { c, h } of candidates) {
    const bucket = Math.floor((h % 360) / 90);
    if (buckets[bucket].length < 1) buckets[bucket].push(c);
  }
  const picked = buckets.flat();
  while (picked.length < 4) picked.push(FALLBACK[picked.length]);
  return picked.slice(0, 4);
})();

const brandName = (() => {
  const host = sourceUrl
    .replace(/^https?:\/\//, "")
    .replace(/\/.*/, "")
    .replace(/^www\./, "");
  return host ? host.split(".")[0].replace(/\b\w/g, (c) => c.toUpperCase()) : prefix;
})();
const tagline = dna?.tagline || meta.title || "";
const description = dna?.description || meta.description || "";
const materialLabel = dna?.materialLanguage?.label || "unknown";
const intentLabel = dna?.pageIntent?.type || "unknown";

// Signature gradient: synthesize a 3-color linear gradient from the brand
// triplet. Conic / radial site gradients are too busy for video bg, so we
// compose a fresh linear one here for downstream use.
const signatureGradient = `linear-gradient(135deg, ${primaryHex} 0%, ${secondaryHex} 50%, ${accentHex} 100%)`;

// Voice signals (used both in §5 and for auto-inference)
const voiceTone = voice?.tone || "";
const voiceHeading = voice?.headingStyle || "";
const voiceCtaVerbs = (voice?.ctaVerbs || []).map((v) => v.value || v).slice(0, 8);
const sampleHeadings = (voice?.sampleHeadings || []).slice(0, 6);

// ═══════════════════ Load all presets ════════════════════
// Each preset is a directory under style-presets/:
//   style-presets/<name>/
//   ├── preset.md              ← preset-meta + §A/§B/§D/§E/§G/§H/§I
//   └── components/<id>.md     ← one paste-ready component per file (raw body, no markers)
// The parser synthesizes §F by concatenating every components/*.md file in alphabetical
// order and wrapping each in <!-- COMPONENT: <id> --> markers, so downstream code
// (design.html render, emit-chunks anchor scan) sees the same structure as before.
const presets = (() => {
  if (!fs.existsSync(PRESETS_DIR)) {
    console.error(`✗ No style-presets/ directory at ${PRESETS_DIR}`);
    process.exit(1);
  }
  return fs
    .readdirSync(PRESETS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => parsePreset(path.join(PRESETS_DIR, e.name)));
})();

if (presets.length === 0) {
  console.error(
    `✗ No presets found in ${PRESETS_DIR}. Each preset must be a directory containing preset.md + components/<id>.md files.`,
  );
  process.exit(1);
}

// ═══════════════════ Preset parser ═══════════════════════
function parsePreset(presetDir) {
  const presetMd = path.join(presetDir, "preset.md");
  if (!fs.existsSync(presetMd)) {
    console.error(`✗ ${presetDir} missing preset.md`);
    process.exit(1);
  }
  const raw = fs.readFileSync(presetMd, "utf8");
  // Frontmatter is a fenced ```preset-meta { JSON } ``` block at top of file.
  const fmMatch = raw.match(/```preset-meta\n([\s\S]+?)\n```\n([\s\S]*)$/);
  if (!fmMatch) {
    console.error(`✗ ${presetMd} missing \`\`\`preset-meta block`);
    process.exit(1);
  }
  let meta;
  try {
    meta = JSON.parse(fmMatch[1]);
  } catch (e) {
    console.error(`✗ ${presetMd} preset-meta is invalid JSON: ${e.message}`);
    process.exit(1);
  }
  const body = fmMatch[2];

  // Parse §A-§I sections by heading (preset.md never contains §F; we synthesize it below).
  const sections = {};
  const headingRe = /^##\s+§([A-Z])\s+(.+?)$/gm;
  const positions = [];
  let m;
  while ((m = headingRe.exec(body))) {
    positions.push({ key: m[1], title: m[2], start: m.index, headerLen: m[0].length });
  }
  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i];
    const next = positions[i + 1];
    const content = body.slice(cur.start + cur.headerLen, next ? next.start : body.length).trim();
    sections[cur.key] = { title: cur.title, content };
  }
  if (sections.F) {
    console.error(
      `✗ ${presetMd} declares §F inline — §F is now sourced from ${presetDir}/components/<id>.md files. Move components out and remove the §F heading.`,
    );
    process.exit(1);
  }

  // Components: one file per id, filename (sans .md) IS the id. Body is raw HTML.
  // Order is alphabetical by filename so design.html and chunks are deterministic.
  const componentsDir = path.join(presetDir, "components");
  const components = [];
  if (fs.existsSync(componentsDir)) {
    const files = fs
      .readdirSync(componentsDir)
      .filter((f) => f.endsWith(".md"))
      .sort();
    for (const f of files) {
      const id = f.replace(/\.md$/, "");
      if (!/^[a-z0-9-]+$/.test(id)) {
        console.error(`✗ ${componentsDir}/${f}: component id must match [a-z0-9-]+`);
        process.exit(1);
      }
      const block = fs.readFileSync(path.join(componentsDir, f), "utf8").trim();
      if (!block) {
        console.error(`✗ ${componentsDir}/${f}: empty component file`);
        process.exit(1);
      }
      components.push({ name: id, block });
    }
  }
  if (components.length === 0) {
    console.error(`✗ ${presetDir} has no components — add at least one components/<id>.md file`);
    process.exit(1);
  }
  // Synthesize §F so downstream rendering code (renderComponents, emit-chunks anchor scan)
  // sees the same shape as the legacy single-file format.
  sections.F = {
    title: "Components (paste-ready, use brand vars from §B)",
    content: components
      .map((c) => `<!-- COMPONENT: ${c.name} -->\n\n${c.block}\n\n<!-- /COMPONENT -->`)
      .join("\n\n"),
  };

  return {
    name: meta.name,
    label: meta.label || meta.name,
    fingerprint: meta.fingerprint || {},
    matchSignals: meta.match_signals || [],
    // Semantic hints for the LLM-review pass. Empty arrays = preset hasn't
    // declared them yet (parser-tolerant; build still works).
    bestFor: Array.isArray(meta.best_for) ? meta.best_for : [],
    avoidFor: Array.isArray(meta.avoid_for) ? meta.avoid_for : [],
    // Hard runtime / environment requirements. Each entry is checked at
    // pickPreset() time; any missing requirement zeroes the preset's combined
    // score and surfaces a capabilities_missing[] list in inference.json so
    // the subagent can auto-install or report. See checkCapabilities() below.
    requiresCapabilities: Array.isArray(meta.requires_capabilities) ? meta.requires_capabilities : [],
    sections,
    components,
    rawBody: body,
  };
}

// ═══════════════════ Capability detection ═════════════════
// A capability requirement is satisfied when its kind-specific check passes:
//   block_installed: BOTH `verify_file` AND `verify_lib` exist on disk.
//                    `verify_file` alone is not enough — `hyperframes add` writes
//                    the block HTML but the lib/*.iife.js is shipped separately
//                    by some blocks, so we check both. Missing → subagent should
//                    run `auto_install` command (if non-null) to materialise it.
//   env_var_set:     process.env[var] is set + non-empty.
// Paths in verify_* are resolved relative to process.cwd() — that's the project
// root for the v2 pipeline. build-design.mjs is invoked from project root, not
// from the design-system/ dir, so relative paths Just Work.
function checkCapabilities(preset) {
  const missing = [];
  for (const req of preset.requiresCapabilities) {
    if (req.kind === "block_installed") {
      const fileOk = req.verify_file ? fs.existsSync(path.resolve(req.verify_file)) : true;
      const libOk = req.verify_lib ? fs.existsSync(path.resolve(req.verify_lib)) : true;
      if (!fileOk || !libOk) {
        missing.push({
          kind: req.kind,
          block: req.block,
          missing_files: [
            !fileOk ? req.verify_file : null,
            !libOk ? req.verify_lib : null,
          ].filter(Boolean),
          auto_install: req.auto_install || null,
          alternates: req.alternates || [],
        });
      }
    } else if (req.kind === "env_var_set") {
      const val = process.env[req.var];
      if (!val || !val.trim()) {
        missing.push({
          kind: req.kind,
          var: req.var,
          reason: req.reason || null,
          auto_install: req.auto_install || null,
        });
      }
    } else {
      // Unknown capability kind — surface but don't gate (forward-compatible).
      missing.push({ kind: req.kind, unknown: true, raw: req });
    }
  }
  return missing;
}

// ═══════════════════ Style auto-inference ════════════════
// Score each preset's match_signals against detected site features.
// Each signal contributes 0..1 * its weight when matched.
function detectSiteFeatures() {
  // Collect raw CSS-like strings to grep against
  const shadowStrings = Object.values(prim.shadow || {})
    .map(valueOf)
    .filter(Boolean);
  const borderStrings = Object.values(prim.border || {})
    .map(valueOf)
    .filter(Boolean);
  const easingStrings = Object.values(motion.easing || {})
    .map(valueOf)
    .filter(Boolean);

  // Detection helpers
  const accent = accentHex;
  const sat = (hex) => {
    const m = String(hex).match(/^#?([0-9a-f]{6})$/i);
    if (!m) return 0;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    if (max === 0) return 0;
    return (max - min) / max;
  };

  return {
    // Brutalism signature: NON-inset offset shadow whose 3rd value (blur) is 0
    // AND at least one of X/Y offset is ≥3px. We must parse all length tokens
    // from each comma-segment, not regex-grep — figma.com's "0px 24px 70px 0px"
    // (4-value form: X Y blur spread) fooled greedy regexes.
    shadow_zero_blur: shadowStrings.some((s) => {
      // Split multi-layer shadows (commas separate layers, but commas also exist in rgb())
      const segments = s.split(/,(?![^()]*\))/);
      return segments.some((seg) => {
        if (/inset/.test(seg)) return false;
        // Pull each "<num>px" token in order — they are X Y blur spread.
        const lens = [...seg.matchAll(/(-?\d+)px/g)].map((m) => parseInt(m[1]));
        if (lens.length < 3) return false;
        const [x, y, blur] = lens;
        if (blur !== 0) return false;
        return Math.abs(x) >= 3 || Math.abs(y) >= 3;
      });
    }),
    thick_solid_border: borderStrings.some((s) => /^\s*[3-9]px\s+solid/.test(s)),
    medium_solid_border: borderStrings.some((s) => /^\s*2px\s+solid/.test(s)),
    hairline_border: borderStrings.some((s) => /^\s*1px\s+solid/.test(s)),
    condensed_display: /Anton|Archivo Black|Bebas|Oswald|Space Grotesk/i.test(
      fontFamilies.join(" "),
    ),
    serif_display: /Serif|Fraunces|Spectral|Newsreader|Playfair|Garamond|Times/i.test(
      fontFamilies.join(" "),
    ),
    // Brutalism uses high-saturation accent AND high-sat primary together.
    // Figma's #e4ff97 + #00b6ff are both high-sat but the overall page is calm.
    // So require both colors to be saturated AND warm/clashing for true brutalism.
    high_sat_accent: sat(accent) > 0.7 && sat(primaryHex) > 0.7,
    low_saturation: sat(accent) < 0.5 && sat(primaryHex) < 0.5,
    rotated_transform: false, // hard to detect from tokens alone
    bouncy_easing: easingStrings.some((s) => /back|elastic|bounce/i.test(s)),
    generous_padding: false, // no padding scale exposed in tokens
    minimal_decoration: Object.keys(prim.shadow || {}).length < 2,
  };
}

function scorePreset(preset, features) {
  let total = 0,
    maxTotal = 0;
  for (const sig of preset.matchSignals) {
    const weight = sig.weight || 0;
    maxTotal += weight;
    if (features[sig.kind]) total += weight;
  }
  return { raw: total, normalized: maxTotal ? total / maxTotal : 0 };
}

// Hybrid score: 0.7 * normalized + 0.3 * raw.
// Pure-raw sort penalises presets that declare few signals (e.g. scatterbrain
// at total weight 0.45 can never beat editorial at 1.00 even with perfect
// hits). Pure-normalised lets a 1-signal preset edge out a 5-signal one by
// matching its only signal. Hybrid: normalised dominates (precision), raw
// breaks ties toward "broadly-aware" presets.
function combinedScore(s) {
  return 0.7 * s.normalized + 0.3 * s.raw;
}

function pickPreset() {
  // Always compute features so inference.json can report them, even on --style.
  const features = detectSiteFeatures();
  // Presets with no match_signals fully opt out of auto-inference (no preset
  // currently does this — both prior opt-outs, 8-bit-orbit and liquid-glass,
  // now declare match_signals and gate via requires_capabilities instead).
  const inferablePresets = presets.filter((p) => p.matchSignals.length > 0);
  const scores = inferablePresets.map((p) => {
    const s = scorePreset(p, features);
    const matched = p.matchSignals.filter((sig) => features[sig.kind]).map((sig) => sig.kind);
    const capabilitiesMissing = checkCapabilities(p);
    // Hard rule: any unmet capability zeroes the auto-pick score. The preset
    // still appears in inference.json so the subagent / user can see what would
    // need to be installed to enable it (and auto_install command is surfaced).
    const baseCombined = combinedScore(s);
    const combined = capabilitiesMissing.length > 0 ? 0 : baseCombined;
    return {
      name: p.name,
      raw: s.raw,
      normalized: s.normalized,
      combined,
      combined_pre_capability: baseCombined,
      matched,
      capabilities_missing: capabilitiesMissing,
    };
  });
  scores.sort((a, b) => b.combined - a.combined);

  if (cliStyle) {
    const forced = presets.find((p) => p.name === cliStyle);
    if (!forced) {
      console.error(
        `✗ unknown --style '${cliStyle}'. available: ${presets.map((p) => p.name).join(", ")}`,
      );
      process.exit(1);
    }
    // --style is a deliberate override — the subagent is responsible for having
    // already satisfied the capabilities (e.g. installed the block). We don't
    // re-gate here, but we do surface what's still missing so the agent can act.
    return { preset: forced, mode: "forced", scores, features };
  }
  if (inferablePresets.length === 0) {
    console.error(`✗ No presets are eligible for auto-inference. Use --style <name>.`);
    process.exit(1);
  }
  const winner = presets.find((p) => p.name === scores[0].name);
  return { preset: winner, mode: "inferred", scores, features };
}

const { preset, mode, scores, features } = pickPreset();

// ═══════════════════ Font resolution (Google Fonts) ══════
const GFONTS = new Set(
  [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Manrope",
    "Montserrat",
    "Poppins",
    "Work Sans",
    "Plus Jakarta Sans",
    "Outfit",
    "DM Sans",
    "IBM Plex Sans",
    "Karla",
    "Mulish",
    "Rubik",
    "Urbanist",
    "Figtree",
    "Space Grotesk",
    "Source Sans 3",
    "Public Sans",
    "Albert Sans",
    "Geist",
    "Heebo",
    "Barlow",
    "Hind",
    "Nunito",
    "Nunito Sans",
    "Raleway",
    "Cabin",
    "Onest",
    "Instrument Serif",
    "Playfair Display",
    "Merriweather",
    "Lora",
    "EB Garamond",
    "Fraunces",
    "Newsreader",
    "Source Serif 4",
    "PT Serif",
    "Spectral",
    "Crimson Text",
    "JetBrains Mono",
    "Fira Code",
    "IBM Plex Mono",
    "Roboto Mono",
    "Source Code Pro",
    "Space Mono",
    "Geist Mono",
    "DM Mono",
    "Inconsolata",
    "Anton",
    "Archivo Black",
    "Bebas Neue",
  ].map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, "")),
);

// Final-fallback families if a preset's §D can't be parsed or names nothing on
// Google Fonts. Used when both site DNA and the preset's own §D fall through.
const FINAL_FONT_FALLBACK = {
  display: "Instrument Serif",
  body: "Inter",
  mono: "JetBrains Mono",
};

// ═══════════════════ Local font discovery ════════════════
// Phase 1 (web-research) downloads site-served woff/woff2/otf/ttf into
// research/assets/. If a site font is not on Google Fonts but a matching
// binary exists locally, we self-host it via @font-face so the real brand
// face renders instead of falling back to the preset's §D suggestion.
//
// Heuristic for matching a designlang family name to a downloaded file:
//   - Normalize both sides (lowercase, strip non-alphanum)
//   - File name's leading "<NNN>-" hash prefix and trailing weight/style
//     suffixes (-Regular, -Bold, -Italic, -700, etc.) are stripped before
//     compare. A trailing "-<hex8>" content hash from capture_web_context.py
//     is also stripped.
const FONT_FILE_EXTS = new Set([".woff2", ".woff", ".otf", ".ttf"]);
function normalizeFamily(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
// designlang sometimes emits a family name that has been mashed together
// without separators (e.g. "GeistVF" → "Geistvf", "DM Serif Display" →
// "Dmserifdisplay"). The local-font filename usually does NOT have those
// axis-suffix letters. Strip a small set of trailing axis tags from a
// normalized key so getComputedStyle('Geistvf') still matches a downloaded
// "Geist-Regular.woff2".
function normalizeFamilyLoose(s) {
  return normalizeFamily(s)
    .replace(/(variablefont|variable|vf)$/i, "")
    .replace(/(wght|opsz|slnt|ital)$/i, "");
}
function splitCamelToWords(s) {
  // "DMSerifDisplay" → "DM Serif Display"; "GeistVF" → "Geist VF"; "Poppins" → "Poppins".
  // Two rules in order: insert a space between a lower→upper transition
  // ("Geist|VF"), and between two uppers followed by a lower ("DM|Serif").
  return String(s || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}
function fileBaseToFamily(fileName) {
  // Strip extension
  let base = fileName.replace(/\.(woff2?|otf|ttf)$/i, "");
  // Strip leading "NNN-" capture index prefix (capture_web_context.py format)
  base = base.replace(/^\d{3}-/, "");
  // Strip trailing "-<hex 8-10 chars>" content digest (capture_web_context.py
  // adds this to dedupe asset URLs; not part of the family name).
  base = base.replace(/-[0-9a-f]{8,10}$/i, "");
  // Webflow / CMS asset hosts prefix files with a "<24-hex-id>_" resource ID.
  // Example: 657d6bc6bcb648163fa2c02b_Poppins-Regular.woff2. Pull anything
  // up to and including the underscore so we end up with "Poppins-Regular".
  base = base.replace(/^[0-9a-f]{16,32}_/i, "");
  // Same pattern can appear without trailing underscore but with a separating
  // dash — e.g. "657d6bc6bcb648163fa2c02b-Poppins". Less common, but cheap to handle.
  base = base.replace(/^[0-9a-f]{16,32}-/i, "");
  // Strip Google Fonts static-host variable-axis suffix conventions.
  // Examples: "Oswald-VariableFont_wght", "Inter-VariableFont_opsz,wght".
  base = base.replace(/[-_]VariableFont[_,a-zA-Z]*$/i, "");
  // Strip common font-weight/style suffixes. We loop because foundries chain
  // multiple suffixes (e.g. "AnthropicSans-Roman-Web", "Inter-Bold-Italic")
  // and a single pass would leave the inner one behind.
  const SUFFIX_RES = [
    /[-_](Thin|ExtraLight|Light|Regular|Book|Roman|Upright|Medium|SemiBold|DemiBold|Bold|ExtraBold|Heavy|Black)$/i,
    /[-_](Italic|Oblique)$/i,
    /[-_](Web|Desktop|Print|Display|Text)$/i,
    /[-_](100|200|300|400|500|600|700|800|900)$/i,
    /[-_]?VF$/i,
    /[-_]?Variable$/i,
  ];
  let prev;
  do {
    prev = base;
    for (const re of SUFFIX_RES) base = base.replace(re, "");
  } while (base !== prev);
  return base;
}
function discoverLocalFonts(researchAssetsDir) {
  // Returns Map<normalized-family, { family: <display-cased>, files: [abs-path...] }>.
  // Each font is indexed under BOTH its strict normalized key and its loose
  // key (axis suffixes stripped), so lookups by either form hit the same entry.
  const found = new Map();
  if (!fs.existsSync(researchAssetsDir)) return found;
  for (const ent of fs.readdirSync(researchAssetsDir, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (!FONT_FILE_EXTS.has(ext)) continue;
    const familyRaw = fileBaseToFamily(ent.name);
    // "DMSerifDisplay" → "DM Serif Display" so it survives as a valid CSS
    // font-family identifier; one-word names ("Poppins") are left alone.
    const familyDisplay = splitCamelToWords(familyRaw);
    const norm = normalizeFamily(familyDisplay);
    if (!norm) continue;
    const abs = path.join(researchAssetsDir, ent.name);
    if (!found.has(norm)) {
      found.set(norm, { family: familyDisplay, files: [] });
    }
    found.get(norm).files.push(abs);
    // Alias the loose key (strip "VF" / "Variable" / axis tags) to the same
    // entry so designlang's mashed "Geistvf" lookup finds the "Geist" files.
    const looseNorm = normalizeFamilyLoose(familyDisplay);
    if (looseNorm && looseNorm !== norm && !found.has(looseNorm)) {
      found.set(looseNorm, found.get(norm));
    }
  }
  return found;
}
const researchAssetsDir = path.resolve(outDir, "..", "research", "assets");
const localFonts = discoverLocalFonts(researchAssetsDir);

// Pick the first Google-Fonts-available name from a preset's §D bullet for one
// role. Bullet format (per README §D): `- **<role>**: \`'Name1'\` · \`'Name2'\` · ...`
function parsePresetFontFallback(presetSections) {
  const dContent = presetSections.D?.content || "";
  const roles = { display: null, body: null, mono: null };
  for (const role of Object.keys(roles)) {
    // Match the bullet line for this role; capture everything after the colon.
    const lineRe = new RegExp(`^\\s*-\\s*\\*\\*${role}\\*\\*\\s*:\\s*(.+)$`, "mi");
    const lineMatch = dContent.match(lineRe);
    if (!lineMatch) continue;
    // Extract each backtick-wrapped name; quotes inside are optional.
    const names = [...lineMatch[1].matchAll(/`['"]?([^'"`]+?)['"]?`/g)].map((m) => m[1].trim());
    // Pick the first name that's on Google Fonts.
    const pick = names.find((n) => GFONTS.has(n.toLowerCase().replace(/[^a-z0-9]/g, "")));
    if (pick) roles[role] = pick;
  }
  return roles;
}

function resolveFont(siteName, role, presetFontFallback) {
  const norm = normalizeFamily(siteName);
  const looseNorm = normalizeFamilyLoose(siteName);
  // 1. Site family is a known Google Font → load from fonts.googleapis.com
  if (norm && GFONTS.has(norm)) {
    return { name: siteCanonicalName(siteName), source: "site" };
  }
  // 2. Site family has a matching woff/woff2 in research/assets/ → self-host.
  // Try strict normalized key first, then the loose key (which lets
  // designlang's "Geistvf" match a downloaded "Geist-Regular.woff2"). The
  // canonical display name comes from the discovered file's parsed family,
  // not designlang's mashed string — so "Geistvf" renders as "Geist".
  const localHit = (norm && localFonts.get(norm)) || (looseNorm && localFonts.get(looseNorm));
  if (localHit) {
    return {
      name: localHit.family,
      source: "site-local",
      localFiles: localHit.files,
    };
  }
  // 3. Preset §D bullet → first Google-Fonts-available name
  // 4. Final hard-coded fallback
  const fallback = presetFontFallback[role] || FINAL_FONT_FALLBACK[role];
  return { name: fallback, source: "preset", originalName: siteName };
}
function siteCanonicalName(s) {
  // Title-case each word, keep canonical names like "JetBrains Mono" intact
  return String(s)
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// designlang sometimes ships only one family; split display/body/mono heuristically.
// Heuristic: first non-mono family is body, second/mono-named is the alternate.
// If the site has NO mono family, leave rawMono empty so resolveFont() routes
// to the preset fallback path (which honestly reports "preset fallback" in the
// type-roles card) instead of pretending "JetBrains Mono" came from the site.
const monoFromList = fontFamilies.find((f) => /mono|code/i.test(f));
const nonMono = fontFamilies.filter((f) => !/mono|code/i.test(f));
const rawDisplay = nonMono[1] || nonMono[0] || "";
const rawBody = nonMono[0] || "";
const rawMono = monoFromList || "";

const presetFontFallback = parsePresetFontFallback(preset.sections);
const display = resolveFont(rawDisplay, "display", presetFontFallback);
const body = resolveFont(rawBody, "body", presetFontFallback);
const mono = resolveFont(rawMono, "mono", presetFontFallback);

function gfontsUrl() {
  // Only Google-Fonts and preset-fallback families go through fonts.googleapis.
  // site-local families are loaded via the @font-face block built below.
  const remoteRoles = [display, body, mono].filter((r) => r.source !== "site-local");
  if (remoteRoles.length === 0) return null;
  const fams = [];
  const seen = new Set();
  for (const role of remoteRoles) {
    const f = role.name;
    if (seen.has(f)) continue;
    seen.add(f);
    const wts =
      f === mono.name ? "400;500" : f === display.name ? "400;700;800" : "400;500;600;700";
    fams.push(`family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@${wts}`);
  }
  return `https://fonts.googleapis.com/css2?${fams.join("&")}&display=swap`;
}

// ═══════════════════ Self-hosted @font-face block ════════
// For each site-local font role, copy its woff/woff2/otf/ttf binaries from
// research/assets/ into <outDir>/fonts/ (where prep.mjs Step 2b expects them),
// then emit one @font-face declaration per file. The block is wrapped in the
// exact comment anchors prep.mjs Step 2c greps for, so the path-rewrite +
// inject-into-index.html flow lights up without any changes downstream.
function buildLocalFontFaceBlock() {
  const localRoles = [display, body, mono].filter((r) => r.source === "site-local");
  if (localRoles.length === 0) return { block: "", copiedFiles: [] };
  const fontsDestDir = path.join(outDir, "fonts");
  fs.mkdirSync(fontsDestDir, { recursive: true });
  const copiedFiles = [];
  const seenRoles = new Set();
  const faces = [];
  for (const role of localRoles) {
    // Deduplicate: if display + body resolve to the same site-local family,
    // emit @font-face declarations once.
    if (seenRoles.has(role.name)) continue;
    seenRoles.add(role.name);
    for (const src of role.localFiles) {
      const fileName = path.basename(src);
      const dest = path.join(fontsDestDir, fileName);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
      copiedFiles.push(fileName);
      const ext = path.extname(fileName).toLowerCase().slice(1);
      const formatMap = { woff2: "woff2", woff: "woff", otf: "opentype", ttf: "truetype" };
      const format = formatMap[ext] || ext;
      faces.push(
        `@font-face {\n  font-family: '${role.name}';\n  src: url('fonts/${fileName}') format('${format}');\n  font-display: swap;\n}`,
      );
    }
  }
  // The wrapper anchors are NOT cosmetic — prep.mjs:159 greps for this exact
  // comment pair to extract the block and inject it into index.html <head>.
  // Do not rename without updating prep.mjs in lockstep.
  const block = `/* === auto-injected by download-fonts.mjs === */\n${faces.join("\n")}\n/* === end download-fonts.mjs block === */`;
  return { block, copiedFiles };
}
const { block: localFontFaceBlock, copiedFiles: copiedFontFiles } = buildLocalFontFaceBlock();

// ═══════════════════ Voice transform demo ════════════════
// Run the preset's voice recipe against a sample brand sentence so the human
// reader can see "Figma's voice rewritten through brutalism". This is rendered
// in §5 as IN→OUT pairs. The recipe text is left raw; we don't actually execute
// it (LLM does that in Phase 2). We just show 2 examples derived from voice.json
// content if available, else fall back to the canned example in the preset.
function pickVoiceSamples() {
  const candidates = [];
  if (description) candidates.push(description);
  for (const h of sampleHeadings) if (h && h.length > 10) candidates.push(h);
  return candidates.slice(0, 2);
}
const voiceSamples = pickVoiceSamples();

// ═══════════════════ HTML escape ═════════════════════════
function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}
function mdInlineToHtml(md) {
  // Very small: code spans, **bold**, *italic*. Used only on preset prose.
  return esc(md)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

// ═══════════════════ Render: §0 Title card ═══════════════
function renderTitleCard() {
  return `
<section class="title-card">
  <div class="title-card-inner">
    <div class="brand-row">
      <span class="brand-name">${esc(brandName)}</span>
      <span class="brand-x">×</span>
      <span class="style-name">${esc(preset.label)}</span>
    </div>
    <h1 class="title-display">${esc(tagline || `${brandName} promo`)}</h1>
    <p class="title-meta">
      <strong>Source</strong> ${esc(sourceUrl) || "—"}
      &nbsp;·&nbsp;
      <strong>Material</strong> ${esc(materialLabel)}
      &nbsp;·&nbsp;
      <strong>Intent</strong> ${esc(intentLabel)}
      &nbsp;·&nbsp;
      <strong>Style</strong> ${esc(preset.label)} ${mode === "forced" ? "(forced)" : "(auto-inferred)"}
    </p>
  </div>
</section>`;
}

// ═══════════════════ Render: §1 Brand DNA ════════════════
function renderBrandDNA() {
  const swatch = (label, hex, extraStyle = "") => `
    <div class="dna-swatch" style="background: ${hex}; color: ${isLight(hex) ? "#000" : "#fff"}; ${extraStyle}">
      <div class="dna-label">${label}</div>
      <div class="dna-hex">${hex}</div>
    </div>`;
  return `
<section id="brand-dna" class="ds-section">
  <div class="eyebrow">§1 · Brand DNA (from site)</div>
  <h2>${esc(brandName)} in one glance</h2>
  <div class="dna-grid dna-grid-5">
    ${swatch("Primary", primaryHex)}
    ${swatch("Secondary", secondaryHex)}
    ${swatch("Accent", accentHex)}
    ${swatch("Canvas", canvasHex, "border: 1px solid #eee;")}
    ${swatch("Ink", inkHex)}
  </div>

  <div class="dna-gradient">
    <div class="dna-gradient-label">Signature gradient</div>
    <div class="dna-gradient-bar" style="background: ${signatureGradient};"></div>
    <code class="dna-gradient-code">${esc(signatureGradient)}</code>
  </div>

  ${description ? `<p class="dna-desc">${esc(description)}</p>` : ""}
</section>`;
}

// ═══════════════════ Render: §2 Color × Style ════════════
function renderColorAndTokens() {
  const decorationTokens = preset.sections.B?.content || "";
  // Extract CSS variable declarations. A declaration starts with a line whose
  // first non-whitespace tokens are `--`, and continues across lines until
  // every opening paren has been closed AND a `;` terminator is seen.
  //
  // This supports multi-line values like:
  //
  //   --grain-image: radial-gradient(
  //     rgba(0,0,0,0.04) 1px,
  //     transparent 1px
  //   );
  //
  // Stray non-declaration lines (`}`, comments, blanks, the opening `:root {`
  // brace, fenced ```css markers) are skipped between declarations.
  const tokenLines = [];
  const rawLines = decorationTokens.split("\n");
  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i];
    if (!/^\s*--/.test(line)) {
      i++;
      continue;
    }
    // Start of a declaration. Accumulate until paren depth is 0 and line ends with `;`.
    const buffer = [line];
    let depth = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
    let terminated = depth === 0 && /;\s*(\/\*.*\*\/)?\s*$/.test(line);
    while (!terminated && i + 1 < rawLines.length) {
      i++;
      const cont = rawLines[i];
      buffer.push(cont);
      depth += (cont.match(/\(/g) || []).length - (cont.match(/\)/g) || []).length;
      if (depth === 0 && /;\s*(\/\*.*\*\/)?\s*$/.test(cont)) {
        terminated = true;
      }
    }
    // Re-emit the declaration with the original indentation of subsequent lines
    // (preserve formatting; the renderColorAndTokens output later re-indents the
    // first line uniformly with "  " — keep continuation lines untouched).
    const first = buffer[0].trim();
    const rest = buffer.slice(1);
    tokenLines.push(rest.length ? first + "\n" + rest.join("\n") : first);
    i++;
  }
  // Font role tokens. The unquoted name lets components reference `var(--font-display)`
  // and CSS will look up the @font-face declaration in <head>. The fallback chain
  // covers (a) Google Fonts hadn't finished loading, (b) self-hosted woff failed.
  // serif vs sans-serif vs monospace are chosen per role; the role's resolved
  // name lives in `display.name` / `body.name` / `mono.name`.
  const fontDisplayStack = `'${display.name}', ${preset.name === "neo-brutalism" || /Mono/i.test(display.name) ? "ui-monospace, monospace" : /Serif|Playfair|Lora|Garamond|Fraunces|Newsreader|Spectral|Times/i.test(display.name) ? "Georgia, serif" : "system-ui, sans-serif"}`;
  const fontBodyStack = `'${body.name}', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
  const fontMonoStack = `'${mono.name}', ui-monospace, SFMono-Regular, Menlo, monospace`;
  const rootBody = `
  --brand-primary:   ${primaryHex};
  --brand-secondary: ${secondaryHex};
  --brand-accent:    ${accentHex};
  --ink:             ${inkHex};
  --canvas:          ${canvasHex};
  --brand-gradient:  ${signatureGradient};
  --deco-1:          ${decoColors[0]};
  --deco-2:          ${decoColors[1]};
  --deco-3:          ${decoColors[2]};
  --deco-4:          ${decoColors[3]};
  --font-display:    ${fontDisplayStack};
  --font-body:       ${fontBodyStack};
  --font-mono:       ${fontMonoStack};
${tokenLines.map((l) => "  " + l).join("\n")}`;
  return `
<section id="color-tokens" class="ds-section">
  <div class="eyebrow">§2 · Color × Style overlay</div>
  <h2>Color tokens + ${esc(preset.label)} decoration vars</h2>
  <p class="ds-prose">Brand colors come from the site. Decoration variables come from the <strong>${esc(preset.label)}</strong> preset. Below is the <code>:root</code> block — it is live on this page (so §6 component previews render properly) and also copy-paste-ready for scene <code>&lt;style&gt;</code> blocks.</p>
  <style>:root {${rootBody}
  }</style>
  <pre class="ds-code"><!-- ROOT-START -->:root {${rootBody}
}<!-- ROOT-END --></pre>
</section>`;
}

// ═══════════════════ Render: §3 Typography ═══════════════
function renderTypography() {
  const recipe = preset.sections.D?.content || "";
  return `
<section id="typography" class="ds-section">
  <div class="eyebrow">§3 · Typography</div>
  <h2>Type roles</h2>
  <p class="ds-prose">Font families resolved by 4-step lookup: site name on Google Fonts → self-host local woff2 → preset §D fallback → final hard-coded fallback. Each card shows which step landed.</p>

  <div class="type-grid">
    ${[["Display", display, "serif", `font-size: 72px; font-weight: ${preset.name === "neo-brutalism" ? 800 : 400}; letter-spacing: ${preset.name === "neo-brutalism" ? "-0.04em" : "-0.02em"}; line-height: 1;`, brandName],
       ["Body", body, "sans-serif", "font-size: 22px; line-height: 1.5;", "The quick brown fox jumps over the lazy dog."],
       ["Mono", mono, "ui-monospace, monospace", "font-size: 18px;", `font: ${mono.name}`]].map(([roleLabel, role, fallbackChain, specimenStyle, specimenText]) => {
      let note;
      if (role.source === "site") {
        note = `<div class="type-note">✓ from site (Google Fonts CDN)</div>`;
      } else if (role.source === "site-local") {
        const fileCount = role.localFiles.length;
        note = `<div class="type-note">✓ from site (self-hosted, ${fileCount} woff/woff2 file${fileCount > 1 ? "s" : ""})</div>`;
      } else if (role.originalName) {
        note = `<div class="type-note">site '${esc(role.originalName)}' not resolvable → preset fallback</div>`;
      } else {
        note = `<div class="type-note">site has no ${roleLabel.toLowerCase()} face → preset fallback</div>`;
      }
      return `
    <div class="type-card">
      <div class="type-role">${roleLabel}</div>
      <div class="type-name">${esc(role.name)}</div>
      ${note}
      <div class="type-specimen" style="font-family: '${esc(role.name)}', ${fallbackChain}; ${specimenStyle}">${esc(specimenText)}</div>
    </div>`;
    }).join("")}
  </div>

  <details>
    <summary class="ds-summary">Font pairing recipe (preset §D)</summary>
    <div class="ds-prose">${mdInlineToHtml(recipe).replace(/\n/g, "<br>")}</div>
  </details>
</section>`;
}

// ═══════════════════ Render: §4 Motion ═══════════════════
function renderMotion() {
  const motionContent = preset.sections.E?.content || "";
  const intent = preset.sections.A?.content || "";
  // Pull out the JS block
  const jsMatch = motionContent.match(/```js\n([\s\S]*?)```/);
  const motionJs = jsMatch ? jsMatch[1].trim() : motionContent;
  return `
<section id="motion" class="ds-section">
  <div class="eyebrow">§4 · Motion (preset)</div>
  <h2>${esc(preset.label)} motion language</h2>
  <p class="ds-prose">${mdInlineToHtml(intent)}</p>
  <p class="ds-prose"><strong>Paste these consts at the top of every scene's <code>&lt;script&gt;</code>:</strong></p>
  <pre class="ds-code"><!-- MOTION-START -->
${esc(motionJs)}
<!-- MOTION-END --></pre>
</section>`;
}

// ═══════════════════ Render: §5 Voice ════════════════════
// Two artifacts live in this section:
//   1. Human-readable cards (DNA dl + recipe prose) — for design.html browsers.
//   2. <pre class="ds-code"><!-- VOICE-START --> ... <!-- VOICE-END --></pre>
//      — the paste-ready block that emit-chunks.mjs extracts to chunks/voice.md.
//      Phase 4b scene workers consume this when writing on-screen copy
//      (headlines, chips, buttons) so the brand register hits the DOM text.
//      Narrator scripts (TTS-bound) are NOT in scope — Phase 2 ignores it.
function renderVoice() {
  const recipe = (preset.sections.G?.content || "").trim();
  const dnaLines = [
    voiceTone && `- Tone: ${voiceTone}`,
    voiceHeading && `- Heading style: ${voiceHeading}`,
    sampleHeadings.length &&
      "- Sample headings:\n" + sampleHeadings.map((s) => `  - ${s}`).join("\n"),
  ].filter(Boolean);
  const voiceMd = `# Voice register: ${preset.name}

## From the site (DNA)
${dnaLines.join("\n")}

## Transform recipe

${recipe}

> Phase 4b scene workers: apply to DOM text only (headline / chip / button copy).
> Phase 2 narrator scripts are TTS-bound — do NOT uppercase or strip articles.`;

  return `
<section id="voice" class="ds-section">
  <div class="eyebrow">§5 · Voice (site × style transform)</div>
  <h2>How to write on-screen copy in ${esc(preset.label)} register</h2>

  <div class="voice-grid">
    <div>
      <h3 class="ds-h3">From the site (DNA)</h3>
      <dl class="voice-dl">
        ${voiceTone ? `<dt>Tone</dt><dd>${esc(voiceTone)}</dd>` : ""}
        ${voiceHeading ? `<dt>Heading style</dt><dd>${esc(voiceHeading)}</dd>` : ""}
        ${voiceCtaVerbs?.length ? `<dt>CTA verbs</dt><dd>${voiceCtaVerbs.map((c) => `<span class="voice-cta">${esc(c)}</span>`).join(" ")}</dd>` : ""}
        ${sampleHeadings.length ? `<dt>Sample headings</dt><dd>${sampleHeadings.map((s) => `<div class="voice-sample">${esc(s)}</div>`).join("")}</dd>` : ""}
      </dl>
    </div>
    <div>
      <h3 class="ds-h3">Transform recipe (preset §G)</h3>
      <div class="ds-prose">${mdInlineToHtml(recipe).replace(/\n/g, "<br>")}</div>
    </div>
  </div>

  ${
    voiceSamples.length
      ? `<h3 class="ds-h3" style="margin-top: 32px;">Try it on this site's voice</h3>
  ${voiceSamples
    .map(
      (s) => `
  <div class="voice-pair">
    <div class="voice-in"><span class="voice-tag">IN (site)</span> ${esc(s)}</div>
    <div class="voice-out"><span class="voice-tag">OUT (Phase 4b applies recipe to DOM copy)</span> <em>worker writes register-shaped HTML text</em></div>
  </div>`,
    )
    .join("")}`
      : ""
  }

  <h3 class="ds-h3" style="margin-top: 32px;">Paste-ready (Phase 4b reads chunks/voice.md)</h3>
  <pre class="ds-code"><!-- VOICE-START -->
${esc(voiceMd)}
<!-- VOICE-END --></pre>
</section>`;
}

// ═══════════════════ Render: §6 Components ═══════════════
// Rewrite hardcoded font-family declarations in preset component CSS into
// var(--font-*) token references. Preset MD files were written with literal
// font names ("Bodoni Moda", "Manrope") as design-time hints — at composition
// time we want them flowing through the brand-resolved tokens (which may be
// site-local woff2, Google Fonts CDN, or preset fallback).
//
// Classification:
//   - Any family list containing a serif name → --font-display (display roles
//     in editorial / capsule / Bodoni-class presets are the prominent serifs)
//   - Any family list containing a mono name → --font-mono
//   - Everything else (sans-serif body fonts: Manrope/Inter/Geist/etc) → --font-body
//
// We rewrite a font-family line as a whole; once stripped down to a token
// reference we drop the original fallback chain (the token itself carries
// system-ui / serif / monospace fallbacks).
// "serif" must not be preceded by "sans-" (the generic family "sans-serif" is
// a sans, not a serif). We test for "serif" only when no "sans-" appears just
// before it. Other serif family names match by literal word.
const SERIF_NAME_RE = /(?<!sans-)\bserif\b|\b(Bodoni|Playfair|Garamond|Fraunces|Newsreader|Spectral|Times|Lora|Source Serif|Crimson|Merriweather|PT Serif|DM Serif)\b/i;
const MONO_NAME_RE = /\b(monospace|JetBrains Mono|Fira Code|IBM Plex Mono|Roboto Mono|Source Code|Space Mono|Geist Mono|DM Mono|Inconsolata|SFMono|Menlo|Consolas|ui-monospace)\b/i;
function rewriteComponentFontFamilies(block) {
  // Replace each `font-family: <chain>;` with the right token. Skip values
  // that already reference var(--font-*) so re-running is a no-op.
  return block.replace(/font-family:\s*([^;\n}]+);/g, (full, chain) => {
    if (/var\(--font-/.test(chain)) return full;
    let token;
    if (MONO_NAME_RE.test(chain)) token = "var(--font-mono)";
    else if (SERIF_NAME_RE.test(chain)) token = "var(--font-display)";
    else token = "var(--font-body)";
    return `font-family: ${token};`;
  });
}

function renderComponents() {
  if (!preset.components.length) return "";
  return `
<section id="components" class="ds-section">
  <div class="eyebrow">§6 · Components (paste-ready)</div>
  <h2>${esc(preset.label)} component library</h2>
  <p class="ds-prose">Each component below is wrapped with <code>&lt;!-- COMPONENT: name --&gt;</code> markers. Phase 4b workers can <code>grep</code> by name and paste verbatim. CSS variables (<code>--brand-primary</code>, <code>--canvas</code>, etc.) come from §2. Font families have been rewritten to <code>var(--font-display/body/mono)</code> tokens so they resolve to the brand's actual typefaces.</p>

  ${preset.components
    .map((rawC) => {
      const c = { ...rawC, block: rewriteComponentFontFamilies(rawC.block) };
      // Live preview = render the HTML inside the component block (it's already a working snippet)
      // For safety we extract first ```html ... ``` and first ```...``` style blocks if present.
      const htmlMatch = c.block.match(/```html\n([\s\S]*?)```/);
      const cssMatch = c.block.match(/```html[\s\S]*?<style>([\s\S]*?)<\/style>/);
      const htmlSnippet = htmlMatch ? htmlMatch[1].trim() : "";
      // Strip <style> from the html before live-rendering
      const htmlForPreview = htmlSnippet.replace(/<style[\s\S]*?<\/style>/g, "").trim();
      return `
  <div class="comp-card">
    <div class="comp-head">
      <span class="comp-name">${esc(c.name)}</span>
      <span class="comp-marker">&lt;!-- COMPONENT: ${esc(c.name)} --&gt;</span>
    </div>
    <div class="comp-preview">
      <style>${cssMatch ? cssMatch[1] : ""}</style>
      ${htmlForPreview.replace(/\{(\w+)\}/g, (_, key) => placeholderFor(key))}
    </div>
    <details>
      <summary class="ds-summary">Source</summary>
      <pre class="ds-code">&lt;!-- COMPONENT: ${esc(c.name)} --&gt;
${esc(c.block)}
&lt;!-- /COMPONENT --&gt;</pre>
    </details>
  </div>`;
    })
    .join("")}
</section>`;
}

// Keys whose values are HTML and should NOT be HTML-escaped before injection.
const RAW_HTML_KEYS = new Set(["FOREGROUND_CONTENT", "HEADLINE_WITH_EM"]);
function placeholderFor(key) {
  const map = {
    EYEBROW: "Build faster",
    HEADLINE: brandName,
    SUBHEAD: tagline || description.slice(0, 80) || "A bold new way to work",
    LABEL: "Get started",
    LEDE: description.slice(0, 120) || `A canvas for ${brandName}.`,
    KICKER: "Issue 01",
    NUM: "4M",
    QUOTE: sampleHeadings[0] || "This changes how teams work.",
    AUTHOR: "Customer Quote",
    LEFT: "Column one content",
    RIGHT: "Column two content",
    HEADLINE_WITH_EM:
      "borders are <em>structural</em>. shadows are <em>weight</em>. tilt is <em>intent</em>.",
    DO_1: "Use accent on exactly one element per scene",
    DO_2: "Keep display weight at 800, body at 500",
    DO_3: "Cut between scenes — never crossfade",
    DONT_1: "Don't add a second accent color",
    DONT_2: "Don't use body text under 24px in video",
    DONT_3: "Don't blur shadows — offset only",
    FOREGROUND_CONTENT: `<div style="font-family: '${display.name}', serif; font-size: clamp(40px, 5vw, 88px); line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 16px;">${brandName}</div><div style="font-family: '${body.name}', sans-serif; font-size: clamp(16px, 1.4vw, 20px); opacity: 0.85; max-width: 38ch;">${esc(tagline || description.slice(0, 80) || "A canvas for teams")}</div>`,
  };
  const value = map[key] ?? key;
  return RAW_HTML_KEYS.has(key) ? value : esc(value);
}

// ═══════════════════ Page styles ═════════════════════════
// Pull preset §I "Page-level CSS" — the styling that should drive design.html
// itself (hero, section borders, dividers, decorations). Falls back gracefully
// if preset doesn't define §I.
function extractPagePresetCss() {
  const raw = preset.sections.I?.content || "";
  // Pull all fenced ```css blocks (a preset may have multiple)
  const blocks = [...raw.matchAll(/```css\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (blocks.length === 0) return "";
  return `\n/* ── Preset §I page styling (from ${esc(preset.name)}.md) ── */\n${blocks.join("\n\n")}`;
}

function renderPageStyles() {
  return `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: '${esc(body.name)}', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: ${inkHex};
    background: ${canvasHex};
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
  .ds-section { padding: 80px 0; border-top: 1px solid ${isLight(canvasHex) ? "#e5e5e5" : "#222"}; }
  .ds-section:first-of-type { border-top: none; }
  .eyebrow { font-family: '${esc(mono.name)}', ui-monospace, monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.6; margin-bottom: 12px; }
  h1, h2, h3 { font-family: '${esc(display.name)}', serif; font-weight: ${preset.name === "neo-brutalism" ? 800 : 400}; letter-spacing: ${preset.name === "neo-brutalism" ? "-0.03em" : "-0.015em"}; line-height: 1.05; }
  h2 { font-size: clamp(36px, 4vw, 56px); margin-bottom: 16px; }
  h3.ds-h3 { font-size: 18px; font-family: '${esc(body.name)}', sans-serif; font-weight: 600; margin: 20px 0 12px; opacity: 0.85; }
  .ds-prose { font-size: 16px; max-width: 62ch; margin: 12px 0; opacity: 0.85; }
  .ds-prose code, code { font-family: '${esc(mono.name)}', monospace; background: ${isLight(canvasHex) ? "#f0f0f0" : "#1a1a1a"}; padding: 2px 6px; border-radius: 3px; font-size: 0.92em; }
  .ds-code { font-family: '${esc(mono.name)}', monospace; background: ${isLight(canvasHex) ? "#0f1419" : "#0a0a0a"}; color: #e6edf3; padding: 20px 24px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.6; margin: 16px 0; white-space: pre; }
  .ds-summary { cursor: pointer; padding: 8px 0; font-family: '${esc(mono.name)}', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; }
  details[open] .ds-summary { opacity: 1; }

  /* ── Title card */
  .title-card { padding: 80px 0 64px; border-bottom: 1px solid ${isLight(canvasHex) ? "#e5e5e5" : "#222"}; }
  .title-card-inner { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
  .brand-row { display: flex; gap: 12px; align-items: baseline; font-family: '${esc(mono.name)}', monospace; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 24px; }
  .brand-name { color: ${primaryHex}; font-weight: 700; }
  .brand-x { opacity: 0.4; }
  .style-name { color: ${accentHex}; font-weight: 700; }
  .title-display { font-size: clamp(48px, 7vw, 96px); margin: 0; }
  .title-meta { margin-top: 32px; font-family: '${esc(mono.name)}', monospace; font-size: 12px; opacity: 0.7; }
  .title-meta strong { font-weight: 700; opacity: 0.9; }

  /* ── §1 Brand DNA */
  .dna-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
  .dna-grid-5 { grid-template-columns: repeat(5, 1fr); }
  .dna-swatch { padding: 24px 20px; border-radius: 8px; min-height: 120px; display: flex; flex-direction: column; justify-content: space-between; }
  .dna-label { font-family: '${esc(mono.name)}', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.8; }
  .dna-hex { font-family: '${esc(mono.name)}', monospace; font-size: 18px; font-weight: 700; }
  .dna-desc { margin-top: 24px; font-size: 18px; line-height: 1.55; max-width: 60ch; opacity: 0.85; }
  .dna-gradient { margin: 32px 0 0; }
  .dna-gradient-label { font-family: '${esc(mono.name)}', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.6; margin-bottom: 10px; }
  .dna-gradient-bar { height: 96px; border-radius: 8px; }
  .dna-gradient-code { display: block; margin-top: 10px; font-family: '${esc(mono.name)}', monospace; font-size: 12px; opacity: 0.7; word-break: break-all; }
  @media (max-width: 900px) { .dna-grid-5 { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 720px) { .dna-grid { grid-template-columns: repeat(2, 1fr); } .dna-grid-5 { grid-template-columns: repeat(2, 1fr); } }

  /* ── §3 Typography */
  .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
  .type-card { padding: 24px; border: 1px solid ${isLight(canvasHex) ? "#e5e5e5" : "#222"}; border-radius: 8px; }
  .type-role { font-family: '${esc(mono.name)}', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.6; }
  .type-name { font-size: 18px; font-weight: 600; margin: 4px 0; }
  .type-note { font-family: '${esc(mono.name)}', monospace; font-size: 11px; opacity: 0.5; margin-bottom: 16px; }
  .type-specimen { margin-top: 16px; }
  @media (max-width: 720px) { .type-grid { grid-template-columns: 1fr; } }

  /* ── §5 Voice */
  .voice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 24px 0; }
  .voice-dl dt { font-family: '${esc(mono.name)}', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.6; margin-top: 16px; }
  .voice-dl dd { font-size: 15px; margin-top: 4px; }
  .voice-cta { display: inline-block; padding: 2px 10px; border: 1px solid ${isLight(canvasHex) ? "#ddd" : "#333"}; border-radius: 999px; font-size: 13px; margin: 2px 4px 2px 0; }
  .voice-sample { font-size: 15px; opacity: 0.85; margin: 4px 0; }
  .voice-pair { padding: 16px; border: 1px solid ${isLight(canvasHex) ? "#e5e5e5" : "#222"}; border-radius: 8px; margin: 12px 0; }
  .voice-tag { font-family: '${esc(mono.name)}', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.6; margin-right: 8px; }
  .voice-in { margin-bottom: 8px; }
  .voice-out { opacity: 0.7; }
  @media (max-width: 720px) { .voice-grid { grid-template-columns: 1fr; } }

  /* ── §6 Components */
  .comp-card { padding: 0; border: 1px solid ${isLight(canvasHex) ? "#e5e5e5" : "#222"}; border-radius: 8px; margin: 16px 0; overflow: hidden; }
  .comp-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: ${isLight(canvasHex) ? "#fafafa" : "#181818"}; border-bottom: 1px solid ${isLight(canvasHex) ? "#e5e5e5" : "#222"}; }
  .comp-name { font-family: '${esc(mono.name)}', monospace; font-size: 13px; font-weight: 700; }
  .comp-marker { font-family: '${esc(mono.name)}', monospace; font-size: 11px; opacity: 0.6; }
  .comp-preview { padding: 32px; background: ${canvasHex}; }
  `;
}

// ═══════════════════ Assemble ════════════════════════════
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(brandName)} × ${esc(preset.label)} — design.html</title>
<!--
  AGENT NOTE — design.html (launch-video-v2 Phase 1b output)
  Brand DNA from: ${esc(sourceUrl)}
  Style preset:   ${esc(preset.name)} (${mode})
  Generated:      ${new Date().toISOString()}

  Downstream usage (Phase 4b scene workers):
    - §2: grep <!-- ROOT-START --> .. <!-- ROOT-END --> → paste into scene <style>
    - §4: grep <!-- MOTION-START --> .. <!-- MOTION-END --> → paste into <script>
    - §5: grep <!-- VOICE-START --> .. <!-- VOICE-END --> → register for DOM text copy
    - §6: grep <!-- COMPONENT: <name> --> .. <!-- /COMPONENT --> → paste by name
-->
${(() => {
  const url = gfontsUrl();
  if (!url) return "<!-- (all type roles self-hosted; no Google Fonts request) -->";
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`;
})()}
<style>
${localFontFaceBlock}
${renderPageStyles()}
${extractPagePresetCss()}
</style>
</head>
<body>

${renderTitleCard()}

<main class="wrap">
${renderBrandDNA()}
${renderColorAndTokens()}
${renderTypography()}
${renderMotion()}
${renderVoice()}
${renderComponents()}
</main>

</body>
</html>
`;

// ═══════════════════ Write inference.json ════════════════
// Always written — even on --no-emit and --style — so the design-system
// subagent (Phase 1b) can review the ranked candidate pool, the matched
// signals, and the site DNA in one structured file before deciding whether
// to override the baseline winner.
function summariseCandidate(s) {
  const p = presets.find((pp) => pp.name === s.name);
  return {
    name: s.name,
    label: p?.label || s.name,
    raw: Number(s.raw.toFixed(3)),
    normalized: Number(s.normalized.toFixed(3)),
    combined: Number(s.combined.toFixed(3)),
    combined_pre_capability: Number((s.combined_pre_capability ?? s.combined).toFixed(3)),
    matched_signals: s.matched,
    capabilities_missing: s.capabilities_missing || [],
    fingerprint: p?.fingerprint || {},
    best_for: p?.bestFor || [],
    avoid_for: p?.avoidFor || [],
    sectionA_excerpt: (p?.sections?.A?.content || "").slice(0, 800),
  };
}
function summariseTopCandidates(n) {
  if (!scores) return [];
  // Only include eligible (capability-satisfied) candidates in top_candidates.
  const winnerScore = scores[0]?.combined || 0;
  return scores
    .filter((s) => s.combined > 0)
    .slice(0, n)
    .map((s) => ({
      ...summariseCandidate(s),
      delta_from_winner: Number((winnerScore - s.combined).toFixed(3)),
    }));
}
// Capability-gated: would have scored well but is missing runtime / env reqs.
// Subagent reads this to know "if I install X, this preset becomes available".
function summariseCapabilityGated() {
  if (!scores) return [];
  return scores
    .filter((s) => s.capabilities_missing && s.capabilities_missing.length > 0)
    .map(summariseCandidate);
}
// confidence: high if winner clearly ahead, low if next candidate is within 0.05.
// Only considers eligible (combined > 0) candidates.
function inferConfidence() {
  const eligible = (scores || []).filter((s) => s.combined > 0);
  if (eligible.length < 2) return "high";
  const delta = eligible[0].combined - eligible[1].combined;
  if (delta < 0.05) return "low";
  if (delta < 0.12) return "medium";
  return "high";
}
const inferenceReport = {
  mode,
  selected: { name: preset.name, label: preset.label },
  confidence: mode === "forced" ? "forced" : inferConfidence(),
  baseline_winner:
    scores && scores.find((s) => s.combined > 0)
      ? {
          name: scores.find((s) => s.combined > 0).name,
          combined: Number(scores.find((s) => s.combined > 0).combined.toFixed(3)),
        }
      : null,
  top_candidates: summariseTopCandidates(5),
  // Presets whose match_signals would put them in the top-N but a runtime /
  // environment requirement is unmet. Each entry includes `capabilities_missing`
  // with `auto_install` commands the subagent can run to materialise the dep.
  // If empty, no preset is currently gated — all eligible candidates compete.
  capability_gated_presets: summariseCapabilityGated(),
  site_features: features || {},
  site_dna: {
    source: sourceUrl || null,
    brand_name: brandName,
    material: dna?.materialLanguage?.label || null,
    imagery: dna?.imageryStyle?.label || null,
    background_patterns: dna?.backgroundPatterns?.labels || [],
    page_intent: intent?.pageIntent?.type || null,
    section_role_counts: intent?.sectionRoles?.counts || {},
    voice_tone: voice?.tone || null,
    voice_heading_style: voice?.headingStyle || null,
    voice_heading_length: voice?.headingLengthClass || null,
  },
  generated_at: new Date().toISOString(),
};
fs.mkdirSync(path.dirname(outScoresFile), { recursive: true });
fs.writeFileSync(outScoresFile, JSON.stringify(inferenceReport, null, 2));

// ═══════════════════ Write design.html + report ══════════
if (cliNoEmit) {
  console.log(`✓ ${path.relative(process.cwd(), outScoresFile)} (inference only; --no-emit, design.html skipped)`);
  console.log(`  preset:   ${preset.name} (${mode}, confidence=${inferenceReport.confidence})`);
  if (mode === "inferred" && scores) {
    console.log(`    top-5:  ${scores.slice(0, 5).map((s) => `${s.name}=${s.combined.toFixed(2)}`).join(" · ")}`);
  }
  process.exit(0);
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html);
const sizeKb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`✓ ${path.relative(process.cwd(), outFile)} (${sizeKb}KB)`);
console.log(`✓ ${path.relative(process.cwd(), outScoresFile)} (inference report)`);
console.log(`  source:   ${sourceUrl || "(no source)"}`);
console.log(`  brand:    ${brandName} · ${materialLabel} material · ${intentLabel} intent`);
console.log(`  palette:  ${primaryHex} primary · ${secondaryHex} secondary · ${accentHex} accent`);
console.log(`  deco:     ${decoColors.join(" · ")}`);
console.log(`  fonts:    ${display.name} display · ${body.name} body · ${mono.name} mono`);
for (const [roleName, role] of [["display", display], ["body", body], ["mono", mono]]) {
  if (role.source === "preset") {
    if (role.originalName) {
      console.log(`    ! ${roleName.padEnd(7)}: '${role.originalName}' not resolvable → ${role.name}`);
    } else {
      console.log(`    ! ${roleName.padEnd(7)}: site has no ${roleName} face → ${role.name} (preset fallback)`);
    }
  } else if (role.source === "site-local") {
    const fileList = role.localFiles.map((f) => path.basename(f)).join(", ");
    console.log(`    ✓ ${roleName.padEnd(7)}: '${role.name}' self-hosted (${fileList})`);
  }
}
if (copiedFontFiles.length > 0) {
  console.log(`  fonts/:   ${copiedFontFiles.length} file(s) copied to ${path.relative(process.cwd(), path.join(outDir, "fonts"))}/`);
}
console.log(`  preset:   ${preset.name} (${mode}, confidence=${inferenceReport.confidence})`);
if (scores && scores.length) {
  console.log(`    scores: ${scores.slice(0, 5).map((s) => `${s.name}=${s.combined.toFixed(2)}`).join(" · ")}`);
  const trueFeatures = Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (trueFeatures.length) console.log(`    matched signals: ${trueFeatures.join(", ")}`);
}
console.log(`  components: ${preset.components.length} paste-ready`);
