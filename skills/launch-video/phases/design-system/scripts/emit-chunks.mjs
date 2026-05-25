#!/usr/bin/env node
/**
 * emit-chunks.mjs
 *
 * Parse a finished design.html (from build-design.mjs) and emit paste-ready
 * chunks under <dir>/chunks/. Downstream phases (visual-design plan, scene
 * workers) read these chunks instead of grepping the monolithic design.html,
 * cutting their must-read load from ~12 KB to ~1-3 KB per file consumed.
 *
 * Usage:
 *   node emit-chunks.mjs <design-system-dir>
 *
 * Inputs:
 *   <dir>/design.html       — must exist (produced by build-design.mjs)
 *
 * Outputs:
 *   <dir>/chunks/tokens.css                     — :root { ... } from §ROOT block
 *   <dir>/chunks/easings.js                     — EASE / DUR const from §MOTION block
 *   <dir>/chunks/voice.md                       — DOM-copy register from §VOICE block
 *   <dir>/chunks/components/<id>.html           — one file per §COMPONENT block
 *   <dir>/chunks/index.json                     — manifest (preset, paths, component list)
 *
 * Exit 0 on success; 1 if design.html or required ROOT/MOTION/VOICE markers are missing.
 */

import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.argv[2] || "./design-system");
const designHtmlPath = path.join(outDir, "design.html");
const chunksDir = path.join(outDir, "chunks");
const componentsDir = path.join(chunksDir, "components");

if (!fs.existsSync(designHtmlPath)) {
  console.error(`✗ emit-chunks: ${designHtmlPath} not found — run build-design.mjs first`);
  process.exit(1);
}

const html = fs.readFileSync(designHtmlPath, "utf8");

fs.mkdirSync(chunksDir, { recursive: true });
fs.mkdirSync(componentsDir, { recursive: true });

function htmlDecode(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

// Strip an optional ```<lang> ... ``` markdown code fence — build-design wraps
// component bodies in fences for the design.html UI; chunks need raw HTML.
function stripCodeFence(s) {
  let t = s;
  t = t.replace(/^\s*```[a-z]*\s*\n?/i, "");
  t = t.replace(/\n?\s*```\s*$/i, "");
  return t;
}

// design.html's AGENT NOTE comment + <p class="ds-prose"> docs blocks contain
// literal references to these markers (e.g. `grep <!-- ROOT-START -->`) which
// would false-positive a naive whole-file regex. Anchor every match to a
// <pre class="ds-code"> opener — that's where the paste-ready blocks live.
const PRE_OPEN = `<pre[^>]*class=["']ds-code["'][^>]*>\\s*`;

// ─── 1. tokens.css ────────────────────────────────────────────────
const rootMatch = html.match(
  new RegExp(`${PRE_OPEN}<!--\\s*ROOT-START\\s*-->([\\s\\S]*?)<!--\\s*ROOT-END\\s*-->`),
);
if (!rootMatch) {
  console.error(
    '✗ emit-chunks: missing <pre class="ds-code"><!-- ROOT-START --> ... <!-- ROOT-END --> block in design.html',
  );
  process.exit(1);
}
const tokensCss = htmlDecode(rootMatch[1]).trim();
fs.writeFileSync(path.join(chunksDir, "tokens.css"), tokensCss + "\n");

// ─── 2. easings.js ────────────────────────────────────────────────
const motionMatch = html.match(
  new RegExp(`${PRE_OPEN}<!--\\s*MOTION-START\\s*-->([\\s\\S]*?)<!--\\s*MOTION-END\\s*-->`),
);
if (!motionMatch) {
  console.error(
    '✗ emit-chunks: missing <pre class="ds-code"><!-- MOTION-START --> ... <!-- MOTION-END --> block in design.html',
  );
  process.exit(1);
}
const easingsJs = htmlDecode(motionMatch[1]).trim();
fs.writeFileSync(path.join(chunksDir, "easings.js"), easingsJs + "\n");

// ─── 3. voice.md ──────────────────────────────────────────────────
// §5 ships a paste-ready register for Phase 4b workers writing on-screen copy
// (headline / chip / button text). Narrator scripts are TTS-bound and stay in
// Phase 2 — voice.md never enters that path.
const voiceMatch = html.match(
  new RegExp(`${PRE_OPEN}<!--\\s*VOICE-START\\s*-->([\\s\\S]*?)<!--\\s*VOICE-END\\s*-->`),
);
if (!voiceMatch) {
  console.error(
    '✗ emit-chunks: missing <pre class="ds-code"><!-- VOICE-START --> ... <!-- VOICE-END --> block in design.html',
  );
  process.exit(1);
}
const voiceMd = htmlDecode(voiceMatch[1]).trim();
fs.writeFileSync(path.join(chunksDir, "voice.md"), voiceMd + "\n");

// ─── 4. components ────────────────────────────────────────────────
// Component blocks live inside <pre class="ds-code">...</pre> with HTML-entity-
// escaped markers (so design.html renders the markers as visible text for human
// readers). Match only when anchored to a ds-code <pre> opener to avoid the
// docs paragraph that explains the marker convention with a literal placeholder.
const compRe = new RegExp(
  `${PRE_OPEN}&lt;!--\\s*COMPONENT:\\s*([a-z0-9-]+)\\s*--&gt;([\\s\\S]*?)&lt;!--\\s*\\/COMPONENT\\s*--&gt;`,
  "g",
);
const components = [];
let cm;
while ((cm = compRe.exec(html)) !== null) {
  const id = cm[1];
  let body = htmlDecode(cm[2]);
  body = stripCodeFence(body).trim();
  fs.writeFileSync(path.join(componentsDir, `${id}.html`), body + "\n");
  components.push({ id, file: `chunks/components/${id}.html`, size: Buffer.byteLength(body) });
}

if (components.length === 0) {
  console.error("✗ emit-chunks: no COMPONENT blocks found — design.html may be malformed or empty");
  process.exit(1);
}

// ─── 5. index.json (manifest) ─────────────────────────────────────
// Parse the AGENT NOTE comment for preset / source URL so downstream phases
// can route on preset without re-parsing the HTML themselves.
let preset = null;
let source_url = null;
const agentNote = html.match(/<!--[^>]*AGENT NOTE[\s\S]*?-->/);
if (agentNote) {
  const note = agentNote[0];
  const ps = note.match(/Style preset:\s*([^\n(]+?)\s*(?:\([^)]+\))?\s*$/m);
  const su = note.match(/Brand DNA from:\s*(\S+)/);
  if (ps) preset = ps[1].trim();
  if (su) source_url = su[1].trim();
}

const index = {
  generated_at: new Date().toISOString(),
  source_url,
  preset,
  tokens_file: "chunks/tokens.css",
  easings_file: "chunks/easings.js",
  voice_file: "chunks/voice.md",
  components: components.map(({ id, file }) => ({ id, file })),
};
fs.writeFileSync(path.join(chunksDir, "index.json"), JSON.stringify(index, null, 2) + "\n");

// ─── 6. report ────────────────────────────────────────────────────
const fmt = (b) => (b / 1024).toFixed(1);
const tokenBytes = Buffer.byteLength(tokensCss);
const easingBytes = Buffer.byteLength(easingsJs);
const voiceBytes = Buffer.byteLength(voiceMd);
const compBytes = components.reduce((sum, c) => sum + c.size, 0);
const designBytes = Buffer.byteLength(html);
const chunksBytes = tokenBytes + easingBytes + voiceBytes + compBytes;

console.log(`✓ ${path.relative(process.cwd(), chunksDir)}/`);
console.log(`  tokens.css         ${fmt(tokenBytes)} KB`);
console.log(`  easings.js         ${fmt(easingBytes)} KB`);
console.log(`  voice.md           ${fmt(voiceBytes)} KB`);
console.log(`  components/        ${components.length} files`);
for (const c of components) {
  console.log(`    ${c.id}.html  (${fmt(c.size)} KB)`);
}
console.log(`  index.json         lists ${components.length} components (preset=${preset || "?"})`);
console.log(
  `  totals             chunks ${fmt(chunksBytes)} KB vs design.html ${fmt(designBytes)} KB (~${Math.round((chunksBytes / designBytes) * 100)}% of source)`,
);
