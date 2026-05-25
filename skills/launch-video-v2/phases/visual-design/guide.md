# Visual Design (Phase 3)

输入故事（Phase 2 — `narrator_scripts.json`）+ 品牌设计系统（Phase 1b — `design-system/design.html`），为每个场景设计视觉处理与动画编排，输出 `section_plan.md`。

本指南讲**创意意图**，不写代码。下游 build agent（`/hyperframes-core` + `/hyperframes-animation`）会把它翻成 HTML composition + GSAP timeline。

## 流程一览

1. 并行 Read：`narrator_scripts.json` · `design-system/design.html` · 全部 4 个 `rules/*.md`
2. 每个场景：选 4-7 个 effects（从 Dispatch 上下文里的 catalog）、决定 Continuity、写 3-anchor block + 散文 8 条
3. 运行 validator 至 exit 0

---

## 1. 输入

### `narrator_scripts.json`

- 场景级：`sceneNumber`、`sceneName`、`narrativeIntent.{type, narrativeRole, keyMessage, persuasion, emotionalBeat}`、`transition.{type, description}`、`assetCandidates[]`（每项含 `path` + `description`）、`estimatedDuration`（去掉末尾 `"s"` → float）
- 顶层：`narrativeArchetype` + `emotionalArc`，影响全片节奏

### `./design-system/design.html` —— 品牌输入

**路径固定**：`./design-system/design.html`（cwd 相对路径）。不要 `ls design-system/` 也不要 `find` —— 路径就是这个，design.html 一定在。**不读** sidecar JSON 文件、不读 `design-system/fonts/`。

design.html 是品牌值的源头：调色板 hex、字体名、`EASE` / `DUR` 常量、border-radius、组件片段。**Plan 不抄它的内容** —— build agent 在写 HTML/CSS 时会自己 grep `<!-- ROOT-START -->`、`<!-- MOTION-START -->`、`<!-- COMPONENT: <name> -->` 块。

**Plan 对 design.html 只做 3 件事，不通读**：

1. 读顶部 `<!-- AGENT NOTE -->` 注释 → 识别 preset 名（editorial / brutalism / saas / …）—— 决定是否套预设颜色纪律
2. Read 一次 design.html（一个 chunk 就够，不要先 grep 行号再读）→ 记下哪些 token 角色存在（特别是 `--surface` / `--paper-warm` / `[data-theme="dark"]`）—— 决定 30% 中间层 / 痛点场景的写法
3. 扫一遍 §Typography 区块 → 确认 display / body / mono 哪些有 / 哪些缺 —— 决定散文能引用哪些字体角色

**不读**：§Color 的具体 hex / §Typography 的具体字体名 / §Motion 的 `EASE` 曲线值 / §Components 的内部 `<style>` 块 / §Page-level CSS —— 这些是 build agent 的事。

**Plan 的工作是按角色 / 用途 / 意图引用，不是按字面值复述。** 见下方 §3 的指导原则：

| 你要点名                                    | 不要抄                           |
| ------------------------------------------- | -------------------------------- |
| **角色**（canvas / surface / accent / ink） | 具体 hex（`#e4ff97`）            |
| **用途**（display / body / mono）           | 具体字体名（`Instrument Serif`） |
| **意图**（`EASE.entry` / `DUR.med`）        | 具体曲线（`power3.out`）         |

### 不读

- `research/`（Phase 2 领地；素材通过 `assetCandidates` 传递）
- `effects-catalog.md`（已嵌入 Dispatch 上下文）
- `blueprints-index.md`（已嵌入 Dispatch 上下文）
- blueprint 全文（`blueprints/<id>.md`，是 build agent 的事）
- `design-system/` 下的 sidecar JSON / fonts/ 目录

---

## 2. 硬契约（machine-checked）

`section_plan.md` 每个场景一段，顺序与 `narrator_scripts.json` 一致：

```markdown
## Scene <N>: <sceneName>

**Effects:** [`<rule-id>`, `<rule-id>`, ...]
**Duration:** <X.XXs>
**Continuity:** break | continue
**Blueprint:** based-on `<id>` | extended `<id>` | composed ← 可选（soft），见下方

<散文正文 —— 见 §4>
```

`validate-section-plan.mjs` 强制（hard）：

- **Effects**：4-7 个反引号包裹的 rule id，逗号分隔在方括号内；每个 id 必须出现在 Dispatch 上下文的 `## Effects catalog` 里；顺序是 timeline-layering 顺序
- **Duration**：浮点秒数（来源见 §1）
- **Continuity**：`break` 或 `continue`；**Scene 1 永远是 `break`**
- 三行各自独立，前后无其他文字；缺任一锚点 → Phase 4a `prep.mjs` exit 1 → 重派 Phase 3

**Blueprint 锚点（soft —— validator 不强制，但强烈建议写）**：

- `based-on <id>` —— 完整采纳某 blueprint（`Effects` 列表 = 该 blueprint `uses` 的全部 id，可能调换顺序）
- `extended <id>` —— 采纳某 blueprint 但补了 effect（`Effects` 包含该 blueprint `uses` 的全部 id + 1-3 个额外 effect）
- `composed` —— 不基于任何 blueprint，从 effects catalog 自由组合
- **省略整行 = 等同于 `composed`**

写 Blueprint 锚点的价值：(1) 强制 plan agent 对"用 / 不用 blueprint"做出明确承诺，避免"既不想用又模糊使用"；(2) 审视 plan 时一眼能看出整片对 blueprint 的依赖程度；(3) build agent 看到 `based-on` / `extended` 时**可以**去读对应 blueprint 全文（plan 不让读，build 让读）。

**Continuity 怎么判**：根据散文第 8 条的 transition 词汇 ——

- `hard cut` / `jump cut` → `break`
- 同一素材上的 `cut-the-curve` / `morph` / `scale+fade` → `continue`

Phase 4a 用这个把连续 `continue` 打包到同一 worker（cap = 2 场景/worker），`break` 永远开新 worker。

> 需要的 effect 不在 catalog 里：先尝试组合现有 effects。仍不够 → **不要编造名字**，在 phase report 标 `needed effect missing: <description>`。

---

## 3. 设计原则（按需加载）

四个 rule 文件覆盖 plan 层的设计判断 —— 全部按**角色 / 意图 / 决策**组织，不含 hex / px / ms / 代码。具体数值是 build agent 在 `/hyperframes-core` + `/hyperframes-animation` + design.html 里自己查的，**plan 不抄**。

<rules>
<typography path="rules/typography.md">字号 7 级角色阶梯（mega / hero / display / heading / body / eyebrow / data）、多维度层级叠加（size / weight / color / spacing / case / style mix）、字体搭配逻辑（单字体族 + 极端字重 vs 三声部系统）、禁用字体配对、CJK 提示。**Plan 按用途引用字体角色，不抄字体名 / px / em。**</typography>
<color-system path="rules/color-system.md">7 个调色板角色（canvas / surface / ink / accent / secondary / restrained-third / semantic）、60-30-10 视觉权重逻辑、跨场景一致性规则、危险组合（白底浅灰、紫蓝 AI 渐变、`#000` 上霓虹）、背景分层概念（基底 / 径向膨胀 / 环境纹理 / 网格 / 粒子）。**Plan 按角色引用 token，不抄 hex / opacity / saturation。**</color-system>
<composition path="rules/composition.md">画布四区概念（top chrome / safe margin / primary content / caption zone）、7 套 composition 模板（centered / thirds / split / layered / asymmetric / triptych / strip，整片至少 3 套）、密度规则（主视觉 ≥40%、3 层视觉层、充盈测试 / 海报暂停测试）、层级多维度叠加、深度技术（尺寸 / 模糊 / opacity / 重叠 / 阴影 / 视差 / 反向 scale）。**Plan 选模板 + 点名层数，不抄 px / scale 数 / shadow 配方。**</composition>
<motion-language path="rules/motion-language.md">5 个弹簧意图（entry / gentle / snappy / heavy / slam）、时长意图档（瞬时 / 状态 / 布局 / 入场）、退出 = 入场 75%、stagger 总上限 500ms、节拍结构（缓慢铺垫 → 蒙太奇 → 过程展示 → 收束）、停留时间表、**stillness-before-climax 招牌节拍**、持续运动 7 种模式、过渡词汇 5 种（cut-the-curve / scale+fade / slide / morph / hard cut，整片只用 2-3 种）。**Plan 按意图角色引用，不抄 GSAP ease 名 / ms / 公式 / 代码。**</motion-language>
</rules>

<blueprints>
13 个 multi-phase 场景骨架（role 覆盖：opening-hook / social-proof / brand-reveal / cta / demo / comparison / metric / messaging / takeover / workflow / concept-demo / problem）。每个 blueprint 给 role + triggers + phases + uses rules + ~2 句情感弧描述。

**用法**：扫 Dispatch 上下文里 `## Blueprints index` 段的 triggers / role 字段，匹配本场景 narrativeIntent 的 narrativeRole 与 keyMessage。命中后**仅用 index 里的信息**——`uses` 列表直接填 `**Effects:**` 锚点、phases 概述启发散文第 5 条（多阶段编排）、情感弧描述启发散文第 1 条（情感与节奏脚注）。**不要 Read blueprint 全文**（`blueprints/<id>.md`）—— 那含 GSAP 代码、DOM 拓扑、精确 timing 表，是 build agent 的事。

**采纳后必须标 `**Blueprint:**` 锚点**（见 §2）：用了就写 `based-on <id>` 或 `extended <id>`，没用就写 `composed` 或省略。这是 plan agent 对自己决策的明确承诺，避免"既不想用又模糊使用"。

**匹配硬阈值**：`role` + `triggers` + 情感弧三项必须**自然贴合**才采纳。任一项需要"创造性弯曲"才能匹配 → **拒绝该 blueprint，回退到 effects catalog 自由组合**。自由组合不是 fallback 次等选择 —— 非典型场景（痛点叙述 / 概念解释 / list reveal / quote / pricing / FAQ）的正确路径就是自由组合。Archive 最强方案 playground-launch 在 8 个节拍里跑 5+ 个视觉宇宙、全自由组合 + 共享 cut-the-curve 粘合。

**改良**：blueprint `uses` 通常 3-4 个 effect，少于 4-7 下限时按下方"补什么"清单补。Duration / palette / asset / phase 时长比例全部按本片实际情况调整，**不抄 blueprint 的具体 timing 数值**。

**补什么**（当 blueprint `uses` < 4 时）：

- 默认先补 `sine-wave-loop`（持续运动 / 环境层）—— 几乎每场都该加，多数 blueprint 没显式列
- 仍不够按情感节拍补：过渡衔接 `scale-swap-transition` / `card-morph-anchor`、SVG 生气 `svg-icon-enrichment` / `svg-path-draw`、数据节拍 `counting-dynamic-scale` / `asr-keyword-glow`、景深补强 `3d-text-depth-layers` / `split-tilt-cards`
- 最终 4-7 个 effect 顺序按 timeline 层叠语义排序：背景 → 主入场 → 持续 → 强调 → 过渡
  </blueprints>

---

## 4. 撰写散文（在三行 anchor 之后）

按以下 8 条顺序写一段自由散文。Phase 4a 会把整段**原样**拷贝到 `group_spec.json` 的 `creative_brief` —— 把自己当成在向一位没见过本品牌的资深动画师做 brief。

1. **情感与节奏脚注** —— 一句话，点名本节拍的*感觉*和*节奏*（"frustrated, slightly-off comma"、"luminous launch-film slow build"）。**这是真 plan 与通用 AI 输出的分水岭。**
2. **空间关系** —— composition 模板（centered / thirds / split / layered / asymmetric / triptych / strip）、主素材的画布占比（≥40%）、留白意图
3. **Effect → asset 映射** —— 对 `**Effects:**` 中的每个 id，命名驱动它的素材（`public/<basename>`，来自本场景 `assetCandidates`）或文本标签，以及在场景 phase timeline 内*触发的时刻*
4. **品牌样式覆盖层（按角色，不按值）** —— Palette：点名 60% canvas / 30% surface（这份预设若无 surface token，用 hairline + canvas 重复并明确说出来）/ 10% accent，accent 绑定到哪个焦点元素；Type：display 用于什么、body 用于什么、是否有 mono eyebrow；Motion：引用 `EASE.entry` / `EASE.emphasis` 等**角色键名**（即使 design.html 里的实际键名略不同，build agent 会做映射）。**完全不抄 hex / 字体名 / ease 曲线 / px / em / ms。** 如果 design.html 缺某 token（如 mono 字体未提取），点明并说预期 fallback
5. **多阶段编排** —— 阶段序列 `entry → ambient drift → major transition → stillness → emphasis → exit` 及粗略时长比例；明确点出 `stillness-before-climax` 节拍；每阶段命名弹簧意图（`entry` / `gentle` / `snappy` / `heavy` / `slam`）。若已通过 §3 选中某个 blueprint，phase 序列沿用该 blueprint index 描述里的 phase 骨架；本场景的情感节拍决定每阶段的时长比例与 ease 意图，**不必逐字复制 blueprint 的 timing 数值**（那是 build 的事）
6. **持续 / 环境运动** —— entry 落定后是什么让场景持续活着：hero 乘性 breathing（±2-5% scale）、卡片正弦 drift（±6-8px 反相）、icon orbit、halftone 密度形变、CTA glow pulse
7. **一条否定句** —— 本场景**不能**做什么，用 codex-plugin 的语气（"no halo behind the bell — Jake killed those"、"no neon glow, this is a workspace"）
8. **到下一场景的 transition** —— 命名 transition 词汇（cut-the-curve LEFT / scale+fade / slide-up / morph / hard cut）

**不要**写像素值、GSAP timeline 代码、composition HTML、具体 hex / 字体名 / ease 曲线 —— 那是 build agent 的活。但要给足约束让结果一眼识别为*本场景*而非通用解读：具体的意图角色、按比例的具体时长、按用途的字体引用、按角色的调色板分配、具体的 phase 顺序。

### 完整场景块样例（含 anchor）

```markdown
## Scene 4: the-spiral

**Effects:** [`discrete-text-sequence`, `cursor-click-ripple`, `context-sensitive-cursor`, `sine-wave-loop`]
**Duration:** 6.20s
**Continuity:** continue
**Blueprint:** composed

Beat 2b — the spiral (frustrated, slightly-off comma). Centered chat-app composition: ...
```

`**Blueprint:** composed` 表示本场景**没用任何 blueprint**（自由组合）。若改用 blueprint：

```markdown
**Effects:** [`counting-dynamic-scale`, `center-outward-expansion`, `multi-phase-camera`, `svg-icon-enrichment`, `sine-wave-loop`]
**Blueprint:** extended `hook-counter-burst`
```

—— `extended` 表示采纳了 `hook-counter-burst` 的全部 4 个 `uses`（前 4 个 effect），并额外补了 `sine-wave-loop` 加强持续运动。

### 散文样例（先读这个再动笔）

> "Beat 2b — the spiral (frustrated, slightly-off comma). Centered chat-app composition: message stack scrolls up at accelerating pace, cursor sits anchored at the bottom-right, never moves. ~5-7 follow-up prompts flash through, each punctuated by a button click + a late SFX tick — pace tightens, tension builds. Hold on a final frustrated beat: cursor still, chat full, SFX _slightly_ off. **Palette: canvas + ink default + single accent on the cursor only — no halo, no glow.** Type: display in chat bubbles, body for supporting text. **Multi-phase: setup hold ~0.5s → accelerating montage ~4.8s → final still beat ~0.9s (stillness-before-climax) → cut-the-curve LEFT into Act 3.** Hero cursor does multiplicative breathing on its glow only, not position. No neon."

**顺序**：情感语气 → composition → 按角色给调色板 → 按用途给字体 → 带按比例时长 + 意图角色的 phase 序列 → 否定句 → transition。**没有 hex / 字体名 / ease 曲线 / GSAP 代码；每个词都在做事。**

---

## 5. 软指南（taste-level，影响 plan 质量但不被 validator 强制）

### 场景质量底线 —— 三层运动模型

每个场景必须有：

1. **Macro Motion** —— 摄像机漂移：整帧缓慢 zoom + 位移（背景与相机的反向 scale 是 archive 招牌技巧；具体数值是 build 的事）
2. **Element Motion** —— 内容入场后持续 drift / rotate / scale（绝不静止 —— 在最终 scale 上做乘性 breathing，不是 yoyo）
3. **Micro Motion** —— 环境细节：流动 gradient、breathing glow、循环粒子、halftone 密度形变

### 场景质量底线 —— 环境层

每个场景在核心内容之外都要有：

1. **Camera drift** —— 整帧持续而微妙的 zoom + pan
2. **Background swell** —— 品牌相近色相 dual-radial overlay；或工作区场景用建筑感网格
3. **Ambient particles / scanline / halftone** —— 品牌色浮粒、低不透明度 scanline、或随节拍形变的 halftone field
4. **Emphasis moment** —— 至少一个 impact 节拍（ripple / glow burst / impact lines / screen-shatter）

### 多阶段编排

```
entry → ambient drift → major transition (morph / pivot / collapse) → stillness-before-climax (~0.3-0.75s) → result / emphasis → idle breathing → exit
```

元素 spring 进入后就坐在原地 = 幻灯片，不是视频。

### 禁用模式（最常翻车的清单）

- 连续运动覆盖场景时长 <50%
- 把 3px 微浮当作唯一"运动"（archive 最小振幅 ±6px 或 ±2-5% scale）
- 把逐字弹出文本当*主要*视觉（除非有编排好的视觉主导）
- 所有元素同时入场（必须 stagger；总 ≤500ms）
- 只有环境层而无主要内容（剩粒子 + 字幕）
- 每场景都同一种 composition（每片至少 3 套不同模板）
- 主视觉元素 <40% 画布
- 通用 AI 烂俗：纯 `#000` 上的霓虹满饱和、紫蓝 AI 渐变背景、装饰性悬浮 bokeh 球
- 纯色背景无 swell / grid / scanline / particle
- 从动作直接跳到 payoff，无 `stillness-before-climax` 的逗号
- **在散文里抄 design.html 的具体 hex / 字体名 / ease 曲线** —— 那是 build agent 的事
- **强行套用不匹配的 blueprint** —— blueprint 是工具不是义务；`role` / `triggers` / 情感弧任一项需要"创造性弯曲"才能匹配 → 回退到 effects catalog 自由组合
- **Read blueprint 全文**（`blueprints/<id>.md`）—— 含 GSAP 代码与 DOM 拓扑，是 build agent 的事；Plan 只用 `## Blueprints index` 段的信息

### 多样性

跨所有场景至少 3 种不同 composition 安排。Archive 中最强的 plan（playground-launch）在 8 个节拍里跑 5+ 个视觉宇宙，用一套共享 transition 词汇（cut-the-curve）+ 一套共享调色板语法粘合。**视觉世界多样、接缝处理一致** —— 这就是原则。
