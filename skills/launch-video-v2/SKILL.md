---
name: launch-video-v2
description: product-launch video v2 workflow — URL → narrator_scripts.json + audio（voice + BGM）+ section_plan.md。
metadata:
  tags: orchestrator, pipeline, product-launch, v2
---

# launch-video-v2 — dispatch entry

| Phase                | 执行方式                            | Primary artifact                        | 详细流程                              |
| -------------------- | ----------------------------------- | --------------------------------------- | ------------------------------------- |
| web-research         | 主 agent 直跑                       | `research/context_pack.md`              | `phases/web-research/guide.md`        |
| design-system        | subagent（general-purpose）         | `design-system/design.html`             | `agents/design-system.md`             |
| story-design         | subagent（general-purpose）         | `narrator_scripts.json`                 | `agents/story-design.md`              |
| audio                | Bash 直跑 audio.mjs                 | `audio_meta.json`                       | `phases/audio/guide.md`（脚本即流程） |
| visual-design        | subagent（general-purpose）         | `section_plan.md`                       | `agents/visual-design.md`             |
| prep                 | Bash 直跑 prep.mjs                  | `group_spec.json`                       | `scripts/prep.mjs`（脚本即流程）      |
| hyperframes-scene    | N×subagent（general-purpose，并行） | `hyperframes/compositions/scene_*.html` | `agents/hyperframes-scene.md`         |
| hyperframes-finalize | subagent（general-purpose）         | `hyperframes/renders/video.mp4`         | `agents/hyperframes-finalize.md`      |

## 前置依赖（首次运行必装）

macOS Apple Silicon 或 Linux x64。系统工具：

```bash
brew install python@3.11 node ffmpeg uv         # Linux 用 apt/dnf 等价命令
uv run --with playwright playwright install chromium   # 一次性，Phase 1 capture 用
```

- `python@3.11`（**用 homebrew python，别用系统 `/usr/bin/python3`**，否则 `pip install` 会被 PEP-668 拦）
- `node ≥ 18` —— `npx hyperframes` / `npx designlang` 用
- `ffmpeg` —— audio.mjs 用 `ffprobe` 取 voice duration
- `uv` —— Phase 1 web-research 用 `uv run --with playwright …` 启 capture
- `playwright chromium` —— Phase 1 capture 头一次跑会缺，按上面那条预装

可选环境变量：

- `$ELEVENLABS_API_KEY` —— 用 ElevenLabs TTS 替代默认 Kokoro
- `$GOOGLE_API_KEY` —— 启用 Lyria 云端 BGM（云端，质量更高）

如果没设 `$GOOGLE_API_KEY`，BGM 走本地 MusicGen 兜底（`pip install transformers torch soundfile`，脚本自动装；首次跑会拉 ~300MB HF 模型权重）。

## 流程

### Step 1 — 并行抓取（Phase 1 ‖ Phase 1b）

1. 解析 `SKILL_DIR` 和 `TARGET_URL`。
2. 读 `./context.log`（若存在），按下方 Resume 表跳过已完成 phase。
3. **同一条 message 里并行启动**：
   - web-research：`Bash` + `run_in_background: true`，按 `phases/web-research/guide.md` 执行。
   - design-system：`Agent` + `run_in_background: true`，prompt = `agents/design-system.md` 内容 + `## Dispatch context`（含 `SKILL_DIR`、`Target URL`）。

### Step 2 — 故事设计（Phase 2）

两个 phase 都返回后，验证 primary artifacts 存在，再启动：

- story-design：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/story-design.md` 内容 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  Schema validator: <SKILL_DIR>/scripts/validate-narrator-scripts.mjs
  Scene limit: 最多 4 个 scene
  Script style: 每个 scene 的 script 保持简短——1-2 句话，不超过 20 个词
  ```

### Step 3 — 音频（Phase 2.5）

story-design 返回且 `narrator_scripts.json` 存在后，启动：

```bash
node <SKILL_DIR>/scripts/audio.mjs \
  --narrator-scripts ./narrator_scripts.json \
  --hyperframes ./hyperframes \
  --out ./audio_meta.json \
  --lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py
```

**BGM 前置条件**（满足其一即可，否则 BGM 静默跳过，voice 照常生成）：

- `$GOOGLE_API_KEY` 已设置 + `--lyria-recipe` 路径存在 → Lyria 云端生成（detached，后台运行）
- `pip install transformers torch soundfile` 已装（本地，免费）→ MusicGen via HuggingFace transformers 本地生成（首次运行下载 ~300MB 模型）。脚本会在 TTS 跑的同时后台 pip-install 缺失的包。

可选 flags（默认不需要）：

- `--voice <id>` — 默认 Kokoro `am_michael` / ElevenLabs `21m00Tcm4TlvDq8ikWAM`
- `--provider kokoro|elevenlabs` — 强制 TTS provider
- `--no-bgm` — 跳过 BGM
- `--bgm-prompt "<text>"` — 覆盖自动推断的 BGM mood

exit 0 → voice + transcribe 完成（BGM 可能仍在后台渲染），继续。
exit 1 → 零场景拿到 voice，报告错误，停止。

### Step 4 — 视觉设计（Phase 3）

audio 完成且 `audio_meta.json` 存在后，读取 effects-catalog 与 blueprints-index：

```bash
cat <SKILL_DIR>/phases/visual-design/effects-catalog.md
cat <SKILL_DIR>/phases/visual-design/blueprints-index.md
```

然后启动 visual-design subagent：

- visual-design：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/visual-design.md` 内容 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  Schema validator: <SKILL_DIR>/scripts/validate-section-plan.mjs
  ## Effects catalog
  <effects-catalog.md 全文>
  ## Blueprints index
  <blueprints-index.md 全文>
  ```

### Step 5 — Phase 4a prep（deterministic script，NO subagent）

Phase 3 visual-design 退出且 `section_plan.md` 存在后，跑 `prep.mjs` 合并所有上游产物为 `group_spec.json`（Phase 4b/4c 移植后由它们消费；当前 v2 暂未实现 4b/4c）：

```bash
node <SKILL_DIR>/scripts/prep.mjs \
  --section-plan ./section_plan.md \
  --narrator-scripts ./narrator_scripts.json \
  $( [ -f audio_meta.json ] && echo "--audio-meta ./audio_meta.json" ) \
  --rules-dir <SKILL_DIR>/../hyperframes-animation/rules \
  --research ./research \
  --design-system ./design-system \
  --hyperframes ./hyperframes \
  --out ./group_spec.json
```

脚本做什么：

1. 如果 `hyperframes/` 不存在 → `npx hyperframes init` scaffold
2. 复制 `research/**/*.{png,jpg,jpeg,webp,svg}` 到 `hyperframes/public/`
3. 复制 `design-system/fonts/*` 到 `hyperframes/public/fonts/`（v2 暂无 download-fonts 时静默跳过）
4. 解析 `section_plan.md` 的 4 个 anchors（Effects / Duration / Continuity / 可选 Blueprint）
5. 校验每个 effect id 都对应 `hyperframes-animation/rules/<id>.md` 存在
6. 合并 `audio_meta.json` —— `voiceDuration` 覆盖 section_plan duration（差 >10% 时）
7. 按 `Continuity` 分组（`break` 开新 worker、`continue` 续到 cap=2）
8. 写 `./group_spec.json` + stdout summary

退出码：

- 0 → 读 stdout（scenes / groups / total duration / 每组 breakdown），追加到 `./context.log`
- 1 → stderr 给出失败的 scene + anchor，回退到 Step 4 重派 visual-design

### Step 6 — 场景 worker 并行 fan-out（Phase 4b）

prep 退出 0 后，读 `group_spec.json.groups[]`，得到 worker 数 N。**同一条 message** 里并行启动 N 个 subagent：

- N 个 `Agent`（`subagent_type: "general-purpose"`，每个 `run_in_background: true`），prompt = `agents/hyperframes-scene.md` 全文 + `## Dispatch context`：

  ```
  SKILL_DIR: <绝对路径>
  Worker ID: <w1 / w2 / ...>
  Design system: ./design-system/design.html
  Scenes:
    - scene_id: scene_<N>
      effects: [...]
      rule_paths:
        - <abs path 1>
        - <abs path 2>
      assetCandidates:
        - { path: "public/...", description: "..." }
      estimatedDuration_s: <float>
      voicePath: assets/voice/scene_<N>.wav (空字符串就略)
      blueprint: composed | based-on <id> | extended <id>
      creative_brief: |
        <Phase 3 该 scene 的 prose body verbatim>
  ```

  每个 worker 的 Scenes 列表只放 group_spec.groups[i].scene_ids 对应的 scene（1-2 个）；字段从 `group_spec.json.groups[i].scenes[<sid>]` verbatim 抄。

所有 worker 都返回后，跑预飞 harness：

```bash
node <SKILL_DIR>/scripts/check-compositions.mjs \
  --hyperframes ./hyperframes \
  --group-spec ./group_spec.json
```

退出码：

- 0 → 所有 composition 过检（blueprint anomaly 不阻塞），继续 Step 7
- 1 → stderr 给出违规 scene + rule 类别，**回退到 Step 6 重派受影响的 worker**（不要在主 agent 里 Edit 修 —— 修在上游）

### Step 7 — finalize 拼装 + 渲染（Phase 4c）

预飞 0 后，启动 finalize subagent：

- `Agent`（`subagent_type: "general-purpose"`），prompt = `agents/hyperframes-finalize.md` 全文 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  Step 6 summary: <scene 数> scenes / <worker 数> workers
  Render quality: high  # 或编排器决定 draft / standard
  ```

退出码 / 行为：

- finalize 报告 mp4 路径 + size + duration + quality + lint/validate/inspect/snapshot 各 gate 状态 → 完成
- finalize STOP（预飞 OK 但 lint/validate/inspect/snapshot/render 失败）→ 按 finalize 报告里的根因决定：
  - lint/validate/inspect 结构性 → 重派对应 worker（Step 6 单 scene 重跑）
  - snapshot 显错 scene / 空白 → 改 `index.html` 播放顺序或 worker 资源引用
  - render stderr → 看是否 quality 设错 / asset 缺，必要时再跑

### 完成报告

汇总给用户：

- web-research：Final URL、page title、section 数、asset 数
- design-system：build-design.mjs stdout（palette、fonts、preset、components 数）
- story-design：archetype、scene 数、total duration、per-scene 一行摘要
- audio：TTS provider、voice id、BGM enabled/pending、total_duration_s
- visual-design：scene 数、total duration、per-scene 一行摘要
- prep（Phase 4a）：scenes、groups（worker 数）、total_duration_s、每组 scene_ids、assets 复制数、anomalies
- scene workers（Step 6）：worker 数、每个 worker 写的 scene_ids + effects + blueprint 标签、check-compositions 通过/违规/anomaly 计数
- finalize（Step 7）：mp4 路径、字节数、ffprobe duration、quality、lint/validate/inspect/snapshot 状态、任何 `Edit` 修过的 worker 文件

---

## Resume 表

读 `./context.log`，按以下状态决定从哪里继续：

| 状态                                                                      | 从这里继续                                   |
| ------------------------------------------------------------------------- | -------------------------------------------- |
| log 不存在或为空                                                          | 完整 pipeline                                |
| `research/context_pack.md` 缺失                                           | 重跑 web-research                            |
| `design-system/design.html` 缺失                                          | 重跑 design-system                           |
| 两个都有，`narrator_scripts.json` 缺失                                    | Step 2（story-design）                       |
| `narrator_scripts.json` 有，`audio_meta.json` 缺失                        | Step 3（audio）                              |
| `audio_meta.json` 有，`section_plan.md` 缺失                              | Step 4（visual-design）                      |
| `section_plan.md` 有，`group_spec.json` 缺失                              | Step 5（prep）                               |
| `group_spec.json` 有，`hyperframes/compositions/` 空或缺 scene            | Step 6（scene workers，缺哪个 scene 派哪个） |
| 所有 `compositions/scene_*.html` 齐，`hyperframes/renders/video.mp4` 缺失 | Step 7（finalize）                           |
| `renders/video.mp4` 有                                                    | 报告已完成，停止                             |

---

> ❌ Step 1 的两个 branch、Step 6 的 N 个 worker，**都**必须同一条 message 里 fan-out，每个 `run_in_background: true`。先起一个等完成再起另一个 = 串行化反模式（GitHub issue #29181 的默认行为，请刻意对抗）。
