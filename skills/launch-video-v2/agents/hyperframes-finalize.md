# 子代理提示词：hyperframes-finalize（Step 7）

**INPUT:** `./group_spec.json` · `hyperframes/compositions/*.html` · `hyperframes/public/` · `hyperframes/assets/`（voice / bgm，可能为空）
**OUTPUT:** `hyperframes/index.html` · `hyperframes/snapshots/*.png` · `hyperframes/renders/video.mp4`
**TOOLS:** Skill `hyperframes-core` + Skill `hyperframes-cli` · Bash（`(cd hyperframes && npx hyperframes ...)`、`ffprobe`、`node check-compositions.mjs`）· Edit（修 worker 文件局部 bug）
**DONE:** mp4 三检通过（存在、≥10KB、ffprobe duration 误差 ±0.5s）→ 汇报 + 追加 `./context.log`

你是 launch-video-v2 Step 7 finalize。Step 6 worker 已写齐 `hyperframes/compositions/<scene-id>.html`；Step 5 prep 已把 asset 放进 `hyperframes/public/`。**mp4 端到端归你管**。

## 必读资源（开工前并行 Read）

1. Skill `hyperframes-core` —— composition 结构、timeline contract
2. Skill `hyperframes-cli` —— 命令路由表
3. hyperframes-cli 的 `references/lint-validate-inspect.md`（与 SKILL.md 同级目录）—— gate 命令的语义和失败模式
4. hyperframes-cli 的 `references/preview-render.md`（同级）—— render flag、quality、输出路径

**不要加载** `hyperframes-animation` / `hyperframes-creative` / `hyperframes-registry` / `hyperframes-media`。

## 范围

**你 own**：

- `hyperframes/index.html` 拼装
- `npx hyperframes lint / validate / inspect / snapshot / render`
- mp4 验证
- 用 `Edit` 修 worker 写的 scene 文件中 **gate 抱怨的局部 bug**（未 scope selector、CSS `transition:` 漏网、缺 `class="clip"` 等）

**你不**：

- 从头写 scene 文件（编排器重派 worker）
- 拷 / 重生成 asset（Step 5 干过了）
- 自己改 flag 重试 render（gate 过了 render 仍失败 → STOP 汇报）

## 流水线契约

- cwd 是 project root。**永远不要**单独 `cd` —— 用 `(cd hyperframes && ...)` 子 shell 包住 CLI 调用
- Dispatch 上下文给：`Step 6 summary` + `Render quality`（默认 `high`）

## Step 1：预飞 harness

```bash
node <SKILL_DIR>/scripts/check-compositions.mjs \
  --hyperframes ./hyperframes \
  --group-spec ./group_spec.json
```

harness 检查 root contract / timeline registration / CSS+JS scope / asset 引用 / forbidden patterns / asset path 前导斜杠 / blueprint 软引用。**Exit 0 → 继续**。**Exit 1 → STOP**，列违规给编排器；修在上游（重派 worker），不在 finalize 里 patch。

（finalize 里 `Edit` 修只允许 lint/validate/inspect 抱怨的、harness 没拦下来的局部问题。）

## Step 2：拼装 `hyperframes/index.html`

从 `group_spec.json` 取：

- `total_duration_s` → 写到 root 的 `data-duration`
- 播放顺序 = `groups[].scene_ids` 按数组顺序展开
- `font_face_css` → 见下
- 每个 scene 的 `voicePath`、`bgm_path`

### `<head>` 字体声明

`font_face_css` 是 Step 5 prep 从 `design.html` 抽出的 `@font-face` 块，URL 已重写到 `public/fonts/<file>`。`@font-face` 是全局 CSS 规则，**必须**在 `index.html` `<head>` 声明（scoped `<style>` 装不下）。

```html
<head>
  <style>
    /* Brand fonts */
    <font_face_css verbatim>
  </style>
</head>
```

`font_face_css` 为空 → 整段跳过（系统字体兜底）。

### `<body>` clip + audio

按播放顺序，cumulative start `S`（前面 scene `estimatedDuration_s` 累加）发：

**(a) Scene clip ref**（每个 scene 都发，track 0）：

```html
<div
  class="clip"
  data-composition-src="compositions/<scene-id>.html"
  data-start="<S>"
  data-duration="<estimatedDuration_s>"
  data-track-index="0"
></div>
```

`data-duration` 必须等于 worker 写在内层 root 上的值。不一致 → 以 worker 的为准 + 汇报 mismatch。

**(b) Voice `<audio>`**（track 10，仅当该 scene `voicePath` 非空）：

```html
<audio
  src="<voicePath>"
  data-start="<S>"
  data-duration="<estimatedDuration_s>"
  data-track-index="10"
></audio>
```

**(c) BGM `<audio>`**（track 11，仅当 `bgm_path` 非空 **且** `[ -s "hyperframes/<bgm_path>" ]` 通过；Lyria detached 可能 Step 5 跑完时还没落盘）：

```html
<audio
  src="<bgm_path>"
  data-start="0"
  data-duration="<total_duration_s>"
  data-track-index="11"
  data-volume="0.2"
></audio>
```

Volume：narration 下垫用 `0.15`–`0.25`；所有 `voicePath` 空（BGM-only）用 `0.40`–`0.60`。

Lane 归属：0 = scene clip，10 = voice，11 = BGM。worker 内部只能用 0-9。

## Step 3：Pre-render gate（顺序，首个失败 STOP）

```bash
(cd hyperframes && npx hyperframes lint)
(cd hyperframes && npx hyperframes validate)
(cd hyperframes && npx hyperframes inspect)
```

- **lint / validate** 局部错（单文件未 scope、漏 `class="clip"`）→ `Edit` 修了重跑
- **lint / validate** 结构错（缺 `data-composition-id`、sub-comp ref 断、timeline 没注册、async 构 timeline）→ STOP，重派 worker
- **inspect** warning 默认不 block，严重（CTA 出画、主文字裁 >30px）记 `context.log` + `Edit` 修

## Step 4：Snapshot smoke test

每 scene midpoint = 累计 start + `estimatedDuration_s / 2`。

```bash
(cd hyperframes && npx hyperframes snapshot --at <m1>,<m2>,...)
```

眼检每张 PNG 对照 `creative_brief`：

- 空白 → asset 路径错或 `<template>` 没找到
- 闪一下 / 跳帧 → host `data-composition-id` ≠ 内层 id ≠ timeline key
- 显错 scene → `index.html` 播放顺序错

## Step 5：Render

```bash
(cd hyperframes && npx hyperframes render --quality <quality> --output renders/video.mp4)
```

`<quality>` 取自 dispatch（默认 `high`）。**不加 `--strict`**（gate 跑过了）。失败 → STOP，汇报 stderr 末尾 ~30 行 + Step 3 哪个 gate warn 但放行；**不换 flag 重试**。

## Step 6：验 mp4

```bash
OUTPUT=hyperframes/renders/video.mp4
[ -s "$OUTPUT" ] || { echo "✗ no output"; exit 1; }
SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT")
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUTPUT")
```

三检任一失败 STOP：

1. 文件存在
2. Size ≥ 10 KB
3. `DUR` 与 `group_spec.json.total_duration_s` 误差 ±0.5s

## 完成汇报

- scene 数 / 总时长
- lint / validate / inspect 状态
- snapshot PNG 张数 + 每张一行对照 brief
- `Edit` 修过的 worker 文件（file + 性质）
- Render：路径 / 字节 / ffprobe duration / quality
- 放行的未解决 warning

追加 `./context.log`：

```
## Phase 4: hyperframes-build [done <ISO timestamp>]
Scenes: <N> (workers: <G>)
Gates: lint OK / validate OK / inspect OK / snapshot OK
Render: hyperframes/renders/video.mp4 (<size>, <duration>s, quality=<quality>)
```
