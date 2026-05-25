#!/usr/bin/env node
// check-compositions.mjs — Step 7 finalize 预飞 harness
// launch-video-v2 port of skills/product-launch-video/scripts/check-compositions.mjs.
//
// 跑在 Step 6 worker 全部返回后、Step 7 finalize 开始拼 index.html 之前。
// 拦 4 类历史 worker bug（finalize 平均花 13 分钟 edit-and-retry 排查）+ v2
// 新增的 blueprint 软引用检查：
//
//   1. CSS scope mismatch —— selector 用 `#root` / `#<scene-id>-root` 但实际
//      root div 是 `<div id="root" class="<scene-id>-root">`。结果 scene 渲
//      成无样式裸文本。
//   2. JS selector `#root` / `#scene_N-root` —— 同根因，断 GSAP / DOM lookup。
//   3. Root contract 缺 —— 没 `id="root"`、没 `class="<scene-id>-root"`、没
//      `data-composition-id`、没 `data-duration`、没 `window.__timelines[...]`。
//   4. Asset 引用了 hyperframes/public/ 里不存在的文件 —— worker 编造或拼写错
//      了 basename。
//   5. （v2 新增）blueprint 引用了 hyperframes-animation/blueprints/ 下不存在
//      的 id —— anomaly，不 fatal（blueprint 是 soft 引用，worker 应该已经按
//      composed 回退）。
//
// Usage:
//   node check-compositions.mjs --hyperframes ./hyperframes --group-spec ./group_spec.json \
//                               [--blueprints-dir <abs>]
//
// 退出码：
//   0 = 所有 composition 过检（blueprint anomaly 不影响）。stdout 给汇总。
//   1 = ≥1 fatal 违规。stderr 列 per-scene per-rule 失败项；编排器应该重派受
//       影响的 worker，不在 finalize 里 patch。

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};

const hyperframesDir = resolve(flag("hyperframes", "./hyperframes"));
const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
const compositionsDir = join(hyperframesDir, "compositions");
const publicDir = join(hyperframesDir, "public");

// blueprints 目录可显式指定；否则按 skill 默认布局推断（launch-video-v2/scripts/
// 旁边的 ../../hyperframes-animation/blueprints/）。推断失败也无所谓，blueprint
// 校验是 soft，路径不存在直接跳过该检查。
const scriptDir = dirname(fileURLToPath(import.meta.url));
const defaultBlueprintsDir = resolve(scriptDir, "..", "..", "hyperframes-animation", "blueprints");
const blueprintsDir = flag("blueprints-dir") ? resolve(flag("blueprints-dir")) : defaultBlueprintsDir;

if (!existsSync(groupSpecPath)) {
  console.error(`✗ group_spec.json not found at ${groupSpecPath}`);
  process.exit(1);
}
if (!existsSync(compositionsDir)) {
  console.error(`✗ compositions dir not found at ${compositionsDir}`);
  process.exit(1);
}

const groupSpec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
const sceneIds = (groupSpec.groups || []).flatMap((g) => g.scene_ids || []);

if (sceneIds.length === 0) {
  console.error(`✗ no scene_ids found in group_spec.json`);
  process.exit(1);
}

// scene_id → group entry (for blueprint lookup)
const sceneEntries = new Map();
for (const g of groupSpec.groups || []) {
  for (const sid of g.scene_ids || []) {
    sceneEntries.set(sid, g.scenes?.[sid] || {});
  }
}

const errors = []; // fatal: { sceneId, rule, detail }
const anomalies = []; // non-fatal: { sceneId, rule, detail }

for (const sceneId of sceneIds) {
  const filePath = join(compositionsDir, `${sceneId}.html`);

  // Rule 0: 文件存在且非空
  if (!existsSync(filePath) || statSync(filePath).size === 0) {
    errors.push({
      sceneId,
      rule: "file",
      detail: `compositions/${sceneId}.html missing or empty`,
    });
    continue; // 这个 scene 后面规则跳过
  }

  const html = readFileSync(filePath, "utf8");

  // Rule 1: root div 契约
  // 必须有且仅有一个 root div，同时带 id="root" 和 class="<scene-id>-root"
  const rootDivRe = new RegExp(
    `<div\\b[^>]*\\bid=["']root["'][^>]*\\bclass=["'][^"']*\\b${sceneId}-root\\b[^"']*["']`,
    "i",
  );
  const rootDivAltRe = new RegExp(
    `<div\\b[^>]*\\bclass=["'][^"']*\\b${sceneId}-root\\b[^"']*["'][^>]*\\bid=["']root["']`,
    "i",
  );
  if (!rootDivRe.test(html) && !rootDivAltRe.test(html)) {
    errors.push({
      sceneId,
      rule: "root-contract",
      detail: `no <div id="root" class="${sceneId}-root" ...> found — 必须同 div 上同时有这两个属性`,
    });
  }

  // Rule 1b: root 上的 data-composition-id 和 data-duration
  const hostIdRe = new RegExp(`data-composition-id=["']${sceneId}["']`);
  if (!hostIdRe.test(html)) {
    errors.push({
      sceneId,
      rule: "data-composition-id",
      detail: `no data-composition-id="${sceneId}" found`,
    });
  }
  if (!/data-duration=["'][\d.]+["']/.test(html)) {
    errors.push({
      sceneId,
      rule: "data-duration",
      detail: `no data-duration="<float>" found on root`,
    });
  }

  // Rule 1c: window.__timelines["<scene-id>"] 注册
  const tlKeyRe = new RegExp(`window\\.__timelines\\s*\\[\\s*["']${sceneId}["']\\s*\\]\\s*=`);
  if (!tlKeyRe.test(html)) {
    errors.push({
      sceneId,
      rule: "timeline-registration",
      detail: `no window.__timelines["${sceneId}"] = ... line found (scene id 必须原文)`,
    });
  }

  // Rule 2: CSS scope —— <style> 里不能有 #root 或 #<scene-id>-root selector
  //
  // 抽出每个 <style>...</style> 块，找 id-based selector。`<style>` 里出现任何
  // id selector 都是 bug：运行时 sub-comp mount 会让 host 页面上有多个 #root
  // 节点，id selector 全局生效，互相污染。
  const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  for (const m of styleBlocks) {
    const css = m[1];
    // 先剥 CSS 注释
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
    // selector 开头的 #identifier（粗匹配，足够抓 bug pattern）
    const idSelectors = [...stripped.matchAll(/(^|[\s,>+~])#([a-zA-Z][\w-]*)/gm)];
    const banned = idSelectors
      .map((sm) => sm[2])
      .filter((id) => id === "root" || id === `${sceneId}-root`);
    if (banned.length > 0) {
      errors.push({
        sceneId,
        rule: "css-scope",
        detail: `<style> 用了禁用的 id selector：${[...new Set(banned)].map((b) => `#${b}`).join(", ")} — 改写为 .${sceneId}-root class selector`,
      });
    }
  }

  // Rule 3: JS selector —— <script> 里不能有 #root 或 #<scene-id>-root
  //
  // 同 Rule 2 根因：querySelector("#root .foo") 在多 sub-comp 共享 id="root"
  // 的情况下找错 root 或找不到。
  const scriptBlocks = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of scriptBlocks) {
    const js = m[1];
    const stripped = js.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    // selector 字符串里含 #root 或 #<scene-id>-root
    const bannedJsRe = new RegExp(`["'\`][^"'\`]*#(?:root|${sceneId}-root)\\b[^"'\`]*["'\`]`, "g");
    const matches = [...stripped.matchAll(bannedJsRe)];
    if (matches.length > 0) {
      errors.push({
        sceneId,
        rule: "js-scope",
        detail: `<script> 含禁用 selector：${matches
          .slice(0, 3)
          .map((mm) => mm[0])
          .join(", ")}${matches.length > 3 ? ` (+${matches.length - 3} more)` : ""} — 改写为 .${sceneId}-root class selector`,
      });
    }
    // getElementById("root") / getElementById("<scene-id>-root")
    const banGEI = new RegExp(
      `getElementById\\(\\s*["'\`](?:root|${sceneId}-root)["'\`]\\s*\\)`,
      "g",
    );
    const geiMatches = [...stripped.matchAll(banGEI)];
    if (geiMatches.length > 0) {
      errors.push({
        sceneId,
        rule: "js-scope",
        detail: `<script> 用了 ${geiMatches[0][0]} — 运行时可能有多个 #root，改用 document.querySelector(".${sceneId}-root")`,
      });
    }
  }

  // Rule 4: 引用的 public/ asset 必须真存在
  const assetRefs = new Set();
  for (const m of html.matchAll(/\bpublic\/[A-Za-z0-9._/-]+/g)) {
    assetRefs.add(m[0]);
  }
  for (const ref of assetRefs) {
    if (!existsSync(join(hyperframesDir, ref))) {
      errors.push({
        sceneId,
        rule: "asset",
        detail: `引用了 "${ref}" 但 hyperframes/public/ 里没这个文件`,
      });
    }
  }

  // Rule 5: forbidden pattern（CSS animation、Date.now() 等）
  const forbidden = [
    { re: /\btransition\s*:/i, name: "CSS transition:", scope: "style" },
    { re: /\banimation\s*:/i, name: "CSS animation:", scope: "style" },
    { re: /@font-face\b/i, name: "@font-face（在 index.html 声明，不在 scene 里）", scope: "style" },
    { re: /\bDate\.now\b/, name: "Date.now()", scope: "script" },
    { re: /\bMath\.random\b/, name: "Math.random()", scope: "script" },
    { re: /\bperformance\.now\b/, name: "performance.now()", scope: "script" },
    { re: /\brepeat\s*:\s*-1\b/, name: "repeat: -1", scope: "script" },
    { re: /\bfetch\s*\(/, name: "fetch(", scope: "script" },
  ];

  for (const f of forbidden) {
    const blocks = f.scope === "style" ? styleBlocks : scriptBlocks;
    for (const m of blocks) {
      if (f.re.test(m[1])) {
        errors.push({
          sceneId,
          rule: "forbidden",
          detail: `<${f.scope}> 里出现 ${f.name} — 违反 composition contract`,
        });
        break;
      }
    }
  }

  // Rule 6: asset 路径不能有前导斜杠
  if (/\bsrc=["']\/public\//.test(html) || /\burl\(["']?\/public\//.test(html)) {
    errors.push({
      sceneId,
      rule: "asset-path",
      detail: `asset 引用用了前导斜杠 "/public/..." — 必须 "public/..."（无前导斜杠）`,
    });
  }

  // Rule 7（v2 新增，soft）：blueprint 引用
  //
  // group_spec.json.groups[].scenes[<sid>].blueprint 取值：
  //   "composed"            → 无 blueprint 引用，跳过
  //   "based-on <id>"       → <id>.md 应在 blueprints/ 下存在
  //   "extended <id>"       → 同上
  // 缺失 → anomaly（worker 应该已经按 composed 回退）；不阻塞 finalize。
  const entry = sceneEntries.get(sceneId) || {};
  const bp = String(entry.blueprint || "").trim();
  if (bp && bp !== "composed") {
    const m = bp.match(/^(?:based-on|extended)\s+([\w-]+)/);
    if (m) {
      const bpId = m[1];
      const bpPath = join(blueprintsDir, `${bpId}.md`);
      if (!existsSync(bpPath)) {
        anomalies.push({
          sceneId,
          rule: "blueprint",
          detail: `blueprint "${bp}" 引用的 ${bpId}.md 在 ${blueprintsDir} 不存在 — worker 应该已按 composed 回退`,
        });
      }
    } else {
      anomalies.push({
        sceneId,
        rule: "blueprint",
        detail: `blueprint 字段 "${bp}" 格式异常（既非 "composed" 也非 "based-on <id>" / "extended <id>"）`,
      });
    }
  }
}

// ---------- 汇报 ----------
const anomalyByScene = new Map();
for (const a of anomalies) {
  if (!anomalyByScene.has(a.sceneId)) anomalyByScene.set(a.sceneId, []);
  anomalyByScene.get(a.sceneId).push(a);
}

if (errors.length === 0) {
  console.log(`✓ all ${sceneIds.length} compositions pass pre-finalize checks`);
  if (anomalies.length > 0) {
    console.log(`\nanomalies (non-fatal):`);
    for (const [sid, list] of anomalyByScene) {
      console.log(`  ${sid}:`);
      for (const a of list) console.log(`    [${a.rule}] ${a.detail}`);
    }
  }
  process.exit(0);
}

// 按 sceneId 分组方便看
const bySceneId = new Map();
for (const e of errors) {
  if (!bySceneId.has(e.sceneId)) bySceneId.set(e.sceneId, []);
  bySceneId.get(e.sceneId).push(e);
}

console.error(`✗ ${errors.length} 个 fatal 违规 跨 ${bySceneId.size} 个 scene：\n`);
for (const [sceneId, list] of bySceneId) {
  console.error(`  ${sceneId}:`);
  for (const e of list) {
    console.error(`    [${e.rule}] ${e.detail}`);
  }
}
if (anomalies.length > 0) {
  console.error(`\nanomalies (non-fatal)：`);
  for (const [sid, list] of anomalyByScene) {
    console.error(`  ${sid}:`);
    for (const a of list) console.error(`    [${a.rule}] ${a.detail}`);
  }
}
console.error(
  `\n  修对应 scene HTML（或让编排器重派 worker）后再跑 finalize。`,
);
process.exit(1);
