#!/usr/bin/env node
// Phase 4a — prep + group plan (deterministic; no subagent).
// launch-video port of skills/product-launch-video/scripts/prep.mjs.
//
// Reads:  section_plan.md (Phase 3), narrator_scripts.json (Phase 2),
//         audio_meta.json (Phase 2.5, optional), research/ assets (Phase 1),
//         design-system/fonts/ (Phase 1b, optional — silently skipped if
//         download-fonts.mjs hasn't been ported to v2 yet),
//         hyperframes-animation/rules/*.md (existence only).
// Writes: hyperframes/public/<assets>, hyperframes/public/fonts/<woff2>,
//         ./group_spec.json.
//         If hyperframes/ is missing, scaffolds it via `npx hyperframes init`.
//
// section_plan.md anchors recognised:
//   **Effects:**     — required, 4-7 backtick-wrapped rule ids
//   **Duration:**    — required, positive float seconds
//   **Continuity:**  — required, "break" | "continue" (scene 1 must be break)
//   **Blueprint:**   — optional (soft), "based-on <id>" | "extended <id>" |
//                      "composed" | absent (→ "composed"). Passed through to
//                      group_spec.json so Phase 4b workers can consult the
//                      blueprint when wiring effects.
//   **Components:**  — optional (soft), backtick-wrapped component ids that
//                      reference design-system/chunks/components/<id>.html.
//                      Resolved against design-system/chunks/index.json; each
//                      scene's design_chunks.components[] in group_spec.json
//                      becomes the absolute paths the Phase 4b worker reads.
//                      Empty / absent → worker still gets tokens.css + easings.js
//                      but no component paste-snippets.
//
// Usage:
//   node prep.mjs --section-plan <path> --narrator-scripts <path> \
//                 --rules-dir <abs> --research <path> --hyperframes <path> \
//                 --out <path> [--audio-meta <path>] [--design-system <path>] \
//                 [--scenes-per-group <int>]
//
// Exit 0 = group_spec.json written + summary on stdout.
// Exit 1 = structural failure (missing anchor / missing rule / bad value) on stderr.

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";

// ---------- argv ----------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
function die(msg) {
  console.error(`✗ prep.mjs: ${msg}`);
  process.exit(1);
}

const sectionPlanPath = resolve(flag("section-plan", "./section_plan.md"));
const narratorScriptsPath = resolve(flag("narrator-scripts", "./narrator_scripts.json"));
const audioMetaPath = flag("audio-meta") ? resolve(flag("audio-meta")) : null;
const rulesDirArg = flag("rules-dir");
if (!rulesDirArg) die("Missing required --rules-dir");
const rulesDir = resolve(rulesDirArg);
const researchDir = resolve(flag("research", "./research"));
const designSystemDir = resolve(flag("design-system", "./design-system"));
const hyperframesDir = resolve(flag("hyperframes", "./hyperframes"));
const outPath = resolve(flag("out", "./group_spec.json"));
const scenesPerGroupMax = parseInt(flag("scenes-per-group", "2"), 10);
if (!isFinite(scenesPerGroupMax) || scenesPerGroupMax < 1) {
  die(`--scenes-per-group must be a positive integer (got "${flag("scenes-per-group")}")`);
}

// ---------- Step 1: bootstrap hyperframes/ ----------
if (!existsSync(hyperframesDir)) {
  console.log(`hyperframes/ missing → npx hyperframes init ${hyperframesDir}`);
  const r = spawnSync(
    "npx",
    [
      "hyperframes",
      "init",
      hyperframesDir,
      "--example",
      "blank",
      "--non-interactive",
      "--skip-skills",
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) die("npx hyperframes init failed");
}

// ---------- Step 2: copy research assets → hyperframes/public/ ----------
const publicDir = join(hyperframesDir, "public");
mkdirSync(publicDir, { recursive: true });

// `.bin` 是 web-research 阶段对未识别 MIME 的图片的兜底命名（典型为 image/* 但 Content-Type
// 缺失或被 CDN 改写）。下游 Phase 4b worker 把它们当 <img src> 引用 —— 浏览器会按 magic bytes
// 渲染，绝大多数能正常显示。把它纳入白名单避免文件被孤立在 research/ 里。
const ASSET_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".bin"]);
const collisions = [];
let copied = 0;

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && ASSET_EXTS.has(extname(ent.name).toLowerCase())) {
      const target = join(publicDir, ent.name);
      if (existsSync(target)) {
        collisions.push({ kept: target, skipped: p });
      } else {
        copyFileSync(p, target);
        copied++;
      }
    }
  }
}
walk(researchDir);

// ---------- Step 2b: copy design-system/fonts → hyperframes/public/fonts/ ----------
// Phase 1b's download-fonts.mjs writes self-hosted brand fonts into
// design-system/fonts/. Copy them into hyperframes/public/fonts/ so the
// renderer resolves the @font-face rules that index.html declares.
const fontsSrcDir = join(designSystemDir, "fonts");
let fontsCopied = 0;
const FONT_EXTS = new Set([".woff2", ".woff", ".ttf", ".otf"]);
if (existsSync(fontsSrcDir)) {
  const fontsDestDir = join(publicDir, "fonts");
  mkdirSync(fontsDestDir, { recursive: true });
  for (const ent of readdirSync(fontsSrcDir, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    if (!FONT_EXTS.has(extname(ent.name).toLowerCase())) continue;
    const src = join(fontsSrcDir, ent.name);
    const dest = join(fontsDestDir, ent.name);
    if (!existsSync(dest)) {
      copyFileSync(src, dest);
      fontsCopied++;
    }
  }
}

// ---------- Step 2c: extract @font-face block from design.html ----------
// download-fonts.mjs wraps its injection with two comment anchors. Pull the
// block out, rewrite url('fonts/<file>') → url('public/fonts/<file>') so the
// paths resolve against hyperframes/, and emit into group_spec.font_face_css
// so Phase 4c can paste it into index.html's <head>. @font-face is global by
// spec and cannot be class-scoped — declaring it once at the document root is
// the only way it actually loads.
let fontFaceCss = "";
const designHtmlPath = join(designSystemDir, "design.html");
if (existsSync(designHtmlPath)) {
  const designHtml = readFileSync(designHtmlPath, "utf8");
  const m = designHtml.match(
    /\/\*\s*===\s*auto-injected by download-fonts\.mjs\s*===\s*\*\/([\s\S]*?)\/\*\s*===\s*end download-fonts\.mjs block\s*===\s*\*\//,
  );
  if (m) {
    fontFaceCss = m[1].trim().replace(/url\(\s*(['"]?)fonts\//g, "url($1public/fonts/");
  }
}

// ---------- Step 3: parse section_plan.md ----------
if (!existsSync(sectionPlanPath)) die(`section_plan.md not found at ${sectionPlanPath}`);
const planText = readFileSync(sectionPlanPath, "utf8");

const sceneHeadRe = /^## Scene\s+(\d+)\s*:\s*(.+?)\s*$/gm;
const heads = [...planText.matchAll(sceneHeadRe)];
if (heads.length === 0) die("no '## Scene N: <name>' headings found in section_plan.md");

const ANCHORS = ["Effects", "Duration", "Continuity"];
const OPTIONAL_ANCHORS = ["Blueprint", "Components"];

function anchorRe(name) {
  return new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.*)$`, "m");
}

function parseSceneBlock(body, sceneId, isFirst) {
  const raw = {};
  let lastAnchorEnd = 0;
  for (const a of ANCHORS) {
    const m = body.match(anchorRe(a));
    if (!m) die(`${sceneId}: missing **${a}:** anchor in section_plan.md`);
    raw[a] = m[1].trim();
    const end = m.index + m[0].length;
    if (end > lastAnchorEnd) lastAnchorEnd = end;
  }
  // Optional anchors — 出现则纳入 lastAnchorEnd（防泄漏到 creative_brief），缺失不报错
  for (const a of OPTIONAL_ANCHORS) {
    const m = body.match(anchorRe(a));
    if (m) {
      raw[a] = m[1].trim();
      const end = m.index + m[0].length;
      if (end > lastAnchorEnd) lastAnchorEnd = end;
    }
  }

  // Effects: ordered backtick-wrapped ids inside [...]
  const effects = [...raw.Effects.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (effects.length === 0) die(`${sceneId}: **Effects:** has no backtick-wrapped ids`);

  // Duration: leading float
  const durM = raw.Duration.match(/[\d.]+/);
  if (!durM) die(`${sceneId}: **Duration:** could not parse float from "${raw.Duration}"`);
  const estimatedDuration_s = parseFloat(durM[0]);
  if (!isFinite(estimatedDuration_s) || estimatedDuration_s <= 0)
    die(`${sceneId}: **Duration:** ${estimatedDuration_s} is not a positive float`);

  // Continuity: break | continue (scene 1 must be break)
  const cont = raw.Continuity.toLowerCase();
  if (cont !== "break" && cont !== "continue")
    die(`${sceneId}: **Continuity:** must be "break" or "continue" (got "${raw.Continuity}")`);
  if (isFirst && cont !== "break") die(`${sceneId}: scene 1 must be **Continuity:** break`);

  // Blueprint (soft): "based-on <id>" | "extended <id>" | "composed" | (absent → "composed")
  // 不做格式校验 —— validator 可后补；id 引用是松绑定，build agent 自行处理
  const blueprint = raw.Blueprint || "composed";

  // Components (soft): backtick-wrapped ids referencing
  // design-system/chunks/components/<id>.html. Existence is checked later
  // against design-system/chunks/index.json. Absent → empty list.
  const componentIds = raw.Components
    ? [...raw.Components.matchAll(/`([^`]+)`/g)].map((m) => m[1])
    : [];

  // creative_brief = everything after the LAST anchor line, verbatim
  const brief = body.slice(lastAnchorEnd).replace(/^\s*\n+/, "");

  return {
    effects,
    estimatedDuration_s,
    continuity: cont,
    blueprint,
    componentIds,
    creative_brief: brief,
  };
}

const scenes = [];
for (let i = 0; i < heads.length; i++) {
  const m = heads[i];
  const sceneNumber = parseInt(m[1], 10);
  const sceneName = m[2].trim();
  const start = m.index + m[0].length;
  const end = i + 1 < heads.length ? heads[i + 1].index : planText.length;
  const body = planText.slice(start, end);
  const sceneId = `scene_${sceneNumber}`;
  const parsed = parseSceneBlock(body, sceneId, i === 0);
  scenes.push({ sceneNumber, sceneId, sceneName, ...parsed });
}

// ---------- Step 4: resolve rule_paths ----------
const ruleStatCache = new Map();
function statRule(p) {
  if (ruleStatCache.has(p)) return ruleStatCache.get(p);
  let st;
  try {
    st = statSync(p);
  } catch {
    st = null;
  }
  ruleStatCache.set(p, st);
  return st;
}
for (const s of scenes) {
  s.rule_paths = s.effects.map((id) => {
    const p = join(rulesDir, `${id}.md`);
    const st = statRule(p);
    if (!st || !st.isFile() || st.size === 0) die(`${s.sceneId}: rule file empty or missing: ${p}`);
    return p;
  });
}

// anomalies collected throughout the rest of the script (non-fatal mismatches:
// chunks missing → fallback, audio duration drift, voice file dropped, asset
// candidate not on disk, BGM still rendering). Declared up-front so Step 4b
// can append to it.
const anomalies = [];

// ---------- Step 4b: resolve design_chunks ----------
// Phase 1b's emit-chunks.mjs writes design-system/chunks/{tokens.css, easings.js,
// components/<id>.html, index.json}. Downstream Phase 4b workers read only the
// chunks listed in their dispatch — never design.html — cutting per-worker
// must-read load by ~4× (12 KB design.html → 1-3 KB per chunk file).
//
// Resolution policy:
//   - chunks/index.json missing       → degrade gracefully: design_chunks = null
//                                       for every scene, log an anomaly, and let
//                                       the worker fall back to reading design.html.
//   - index.json present              → every scene gets tokens_file + easings_file.
//   - scene cites unknown component id → fatal (typo in section_plan that prep
//                                        can catch up-front beats finalize rounding
//                                        back to Phase 3 13 minutes later).
const chunksDir = join(designSystemDir, "chunks");
const chunksIndexPath = join(chunksDir, "index.json");
let chunksIndex = null;
if (existsSync(chunksIndexPath)) {
  try {
    chunksIndex = JSON.parse(readFileSync(chunksIndexPath, "utf8"));
  } catch (e) {
    anomalies.push(
      `design-system/chunks/index.json present but unreadable (${e.message}) — workers will fall back to design.html`,
    );
  }
} else {
  anomalies.push(
    `design-system/chunks/ missing — Phase 1b's emit-chunks.mjs was not run. Workers will fall back to reading design.html (slower).`,
  );
}

let availableComponents = null;
if (chunksIndex) {
  availableComponents = new Map(
    (chunksIndex.components || []).map((c) => [c.id, join(designSystemDir, c.file)]),
  );
}

for (const s of scenes) {
  if (!chunksIndex) {
    s.design_chunks = null;
    continue;
  }
  const tokensAbs = join(designSystemDir, chunksIndex.tokens_file || "chunks/tokens.css");
  const easingsAbs = join(designSystemDir, chunksIndex.easings_file || "chunks/easings.js");
  const voiceAbs = join(designSystemDir, chunksIndex.voice_file || "chunks/voice.md");
  if (!existsSync(tokensAbs))
    die(`design_chunks: tokens_file "${tokensAbs}" referenced by index.json but missing on disk`);
  if (!existsSync(easingsAbs))
    die(`design_chunks: easings_file "${easingsAbs}" referenced by index.json but missing on disk`);
  if (!existsSync(voiceAbs))
    die(`design_chunks: voice_file "${voiceAbs}" referenced by index.json but missing on disk`);

  const componentPaths = [];
  for (const cid of s.componentIds) {
    const abs = availableComponents.get(cid);
    if (!abs)
      die(
        `${s.sceneId}: **Components:** id "${cid}" not in design-system/chunks/index.json. Known: [${[...availableComponents.keys()].join(", ")}]`,
      );
    if (!existsSync(abs))
      die(`${s.sceneId}: component "${cid}" listed in index.json but file missing at ${abs}`);
    componentPaths.push(abs);
  }
  s.design_chunks = {
    tokens_file: tokensAbs,
    easings_file: easingsAbs,
    voice_file: voiceAbs,
    components: componentPaths,
  };
}

// ---------- Step 5: cross-check narrator + audio merge ----------
if (!existsSync(narratorScriptsPath))
  die(`narrator_scripts.json not found at ${narratorScriptsPath}`);
const narratorScripts = JSON.parse(readFileSync(narratorScriptsPath, "utf8"));
const narratorByNumber = new Map((narratorScripts.scenes || []).map((s) => [s.sceneNumber, s]));

let audioMeta = null;
if (audioMetaPath) {
  if (existsSync(audioMetaPath)) {
    audioMeta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
  } else {
    console.log(`audio-meta path given but file missing — proceeding without audio`);
  }
}

// Duration truth ladder (highest → lowest):
//   audio_meta.scenes[sceneId].voiceDuration   ← TTS wav 实测 = TRUE TRUTH
//   section_plan.md "**Duration:** Xs"          ← plan agent decision (already
//                                                  reconciled with audio per guide)
//   narrator_scripts.json estimatedDuration    ← earliest estimate
//
// Final s.estimatedDuration_s = highest-priority source that exists.
// Mismatch anomalies surface upstream inconsistencies but do NOT block.

for (const s of scenes) {
  const planDur = s.estimatedDuration_s; // value as parsed from section_plan
  const narrator = narratorByNumber.get(s.sceneNumber);
  let narratorDur = NaN;
  if (narrator?.estimatedDuration != null) {
    const m = String(narrator.estimatedDuration).match(/[\d.]+/);
    narratorDur = m ? parseFloat(m[0]) : NaN;
  }
  let audioDur = NaN;
  let audioScene = null;
  if (audioMeta) {
    audioScene = audioMeta.scenes?.[s.sceneId] || null;
    if (audioScene && isFinite(audioScene.voiceDuration) && audioScene.voiceDuration > 0) {
      audioDur = audioScene.voiceDuration;
    }
  }

  // Pick final value by truth ladder.
  let finalDur = planDur;
  let source = "section_plan";
  if (isFinite(audioDur)) {
    finalDur = audioDur;
    source = "audio_meta";
  }
  s.estimatedDuration_s = finalDur;

  // Anomalies: surface cross-stage inconsistencies. audio_meta is truth when
  // present; plan and narrator are estimates that may legitimately differ within
  // small tolerances (guide.md §1 lets plan agent keep narrator when audio diff
  // <10%). Report divergence but don't moralize about it.
  const pct = (a, b) => (b > 0 ? (Math.abs(a - b) / b) * 100 : 0);
  if (source === "audio_meta") {
    if (Math.abs(audioDur - planDur) > 0.01) {
      const p = pct(audioDur, planDur).toFixed(1);
      anomalies.push(
        `${s.sceneId}: audio_meta ${audioDur}s (truth) overrides section_plan ${planDur}s (${p}% diff)`,
      );
    }
    if (isFinite(narratorDur) && Math.abs(audioDur - narratorDur) / audioDur > 0.1) {
      const p = pct(audioDur, narratorDur).toFixed(1);
      anomalies.push(
        `${s.sceneId}: narrator estimate ${narratorDur}s off by ${p}% vs audio_meta ${audioDur}s (truth)`,
      );
    }
  } else if (isFinite(narratorDur) && Math.abs(narratorDur - planDur) > 0.01) {
    const p = pct(narratorDur, planDur).toFixed(1);
    anomalies.push(
      `${s.sceneId}: section_plan ${planDur}s vs narrator ${narratorDur}s (${p}% — no audio_meta available; using section_plan)`,
    );
  }

  // audio merge: voice + words paths (independent of duration)
  s.voicePath = audioScene?.voicePath || "";
  s.wordsPath = audioScene?.wordsPath || "";

  // disk checks (drop missing voice/words paths to empty + record anomaly)
  if (s.voicePath && !existsSync(join(hyperframesDir, s.voicePath))) {
    anomalies.push(`${s.sceneId}: voicePath "${s.voicePath}" not on disk — dropping to ""`);
    s.voicePath = "";
  }
  if (s.wordsPath && !existsSync(join(hyperframesDir, s.wordsPath))) {
    anomalies.push(`${s.sceneId}: wordsPath "${s.wordsPath}" not on disk — dropping to ""`);
    s.wordsPath = "";
  }
  // Check assetCandidates[] — worker may reference any of them as
  // assets in the scene HTML. Missing assets caused 50s+ of finalize
  // "hunt-and-cp" debugging in past runs.
  const narratorScene = narratorByNumber.get(s.sceneNumber);
  const candidates = Array.isArray(narratorScene?.assetCandidates)
    ? narratorScene.assetCandidates
    : [];
  for (const cand of candidates) {
    if (
      cand?.path &&
      typeof cand.path === "string" &&
      cand.path.startsWith("public/") &&
      !existsSync(join(hyperframesDir, cand.path))
    ) {
      anomalies.push(
        `${s.sceneId}: assetCandidate "${cand.path}" listed in narrator_scripts.json but not in hyperframes/public/ — Phase 4b worker may fail`,
      );
    }
  }
  s.assetCandidates = candidates;
}

// ---------- Step 6: group by continuity, cap=N ----------
const groups = [];
let cur = null;
for (const s of scenes) {
  const startNew = s.continuity === "break" || !cur || cur.scene_ids.length >= scenesPerGroupMax;
  if (startNew) {
    if (cur) groups.push(cur);
    cur = {
      worker_id: `w${groups.length + 1}`,
      scene_ids: [],
      scenes: {},
    };
  }
  cur.scene_ids.push(s.sceneId);
  cur.scenes[s.sceneId] = {
    effects: s.effects,
    rule_paths: s.rule_paths,
    assetCandidates: s.assetCandidates,
    estimatedDuration_s: s.estimatedDuration_s,
    voicePath: s.voicePath,
    wordsPath: s.wordsPath,
    blueprint: s.blueprint,
    design_chunks: s.design_chunks,
    creative_brief: s.creative_brief,
  };
}
if (cur) groups.push(cur);

// ---------- Step 7: emit group_spec.json ----------
const total_duration_s = scenes.reduce((sum, s) => sum + s.estimatedDuration_s, 0);
// BGM may still be rendering (audio.mjs spawns Lyria detached and exits before
// it finishes). Trust audio_meta.bgm_path; Phase 4c does the final on-disk
// check before emitting the <audio> element.
let bgm_path = "";
if (audioMeta?.bgm_path) {
  bgm_path = audioMeta.bgm_path;
  if (!existsSync(join(hyperframesDir, audioMeta.bgm_path))) {
    if (audioMeta.bgm_pending) {
      anomalies.push(
        `bgm "${audioMeta.bgm_path}" still rendering (bgm_pending=true) — Phase 4c will re-check before emitting <audio>`,
      );
    } else {
      anomalies.push(
        `bgm "${audioMeta.bgm_path}" listed in audio_meta but missing — Phase 4c will skip if still absent`,
      );
    }
  }
}

const spec = {
  scenes_per_group_max: scenesPerGroupMax,
  total_scenes: scenes.length,
  total_duration_s: Number(total_duration_s.toFixed(3)),
  bgm_path,
  font_face_css: fontFaceCss,
  groups,
};

writeFileSync(outPath, JSON.stringify(spec, null, 2));

// ---------- Step 8: summary ----------
console.log(`✓ wrote ${outPath}`);
console.log(
  `  scenes: ${spec.total_scenes}, groups: ${groups.length}, total: ${spec.total_duration_s}s`,
);
console.log(`  bgm: ${bgm_path || "(none)"}`);
console.log(`  assets copied: ${copied} (collisions skipped: ${collisions.length})`);
console.log(`  fonts copied:  ${fontsCopied}`);
console.log(
  `  @font-face block: ${fontFaceCss ? `${fontFaceCss.length}B extracted (Phase 4c will inject into index.html <head>)` : "(none — design.html has no auto-injected block)"}`,
);
if (chunksIndex) {
  const totalCompCitations = scenes.reduce(
    (sum, s) => sum + (s.design_chunks?.components.length || 0),
    0,
  );
  const uniqueComps = new Set();
  for (const s of scenes) {
    for (const p of s.design_chunks?.components || []) uniqueComps.add(basename(p, ".html"));
  }
  console.log(
    `  design-chunks:    ${chunksIndex.components?.length || 0} components available, ${totalCompCitations} citation(s) across scenes (unique: ${[...uniqueComps].join(", ") || "none"})`,
  );
} else {
  console.log(`  design-chunks:    none (workers will fall back to design.html)`);
}
for (const g of groups) {
  const items = g.scene_ids.map((id) => `${id}(${g.scenes[id].estimatedDuration_s}s)`).join(", ");
  console.log(`  ${g.worker_id}: ${items}`);
}
if (collisions.length) {
  console.log(`\nasset collisions (first-wins, skipped duplicates):`);
  for (const c of collisions.slice(0, 5))
    console.log(`  ${basename(c.kept)} ← skipped ${c.skipped}`);
  if (collisions.length > 5) console.log(`  …and ${collisions.length - 5} more`);
}
if (anomalies.length) {
  console.log(`\nanomalies (non-fatal):`);
  for (const a of anomalies) console.log(`  - ${a}`);
}
