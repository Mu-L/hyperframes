---
name: video-color-system
description: "Color design decisions for HyperFrames videos — palette roles, 60-30-10 allocation logic, cross-scene consistency, dangerous combos. Hex values and contrast math live in build agent territory."
category: visual-design
---

# 视频色彩系统 —— 设计判断层

**本文件只负责 plan 层的设计判断** —— 角色、60-30-10 分配逻辑、跨场景一致性、危险组合。具体 hex 值、对比度 4.5:1 计算、暗场 saturation 补偿、双层 glow 配方都属于 build agent 在写 CSS 时查 design.html 与 `/hyperframes-core` 的事；plan 不抄。

## 调色板来源

**Hex 值来自 design.html**（`:root` 里的命名 token，按品牌不同会有 `--brand-primary` / `--brand-accent` / `--canvas` / `--ink` 等）。Plan 里按**角色**引用，**不要**抄具体 hex —— build agent 自己会从 design.html grep。

> **预设规范优先于本文件的通用规则**。design.html 的 preset（editorial / neo-brutalism / 等）会定义自己的颜色纪律 —— 例如 editorial 明确"accent ≤ 5% frame area、primary 不做背景填充、canvas is the hero"。如果通用规则（如"背景用 dual-radial swell"）与预设的 §H 颜色纪律冲突，**预设胜出**。Plan 阶段读 design.html 时连同 preset 名一起识别（`title` 标签或 §1 eyebrow），并以预设的规范约束本片调色板使用。

### 痛点 / 凝重场景

如果某场景的 `emotionalBeat` 需要刻意的调色板转换：

- design.html **有** `[data-theme="dark"]` 块 → 用它（反转 canvas / ink），不引入外来调色板
- design.html **没有**暗主题块（editorial 等亮色预设常见）→ **不要**自创暗色。改用：accent 灰化（去饱和）+ 低对比（用 `--paper-warm` 替代 `--canvas` 把场景压暗一档）+ 收紧留白 + 静止节拍承担凝重感

### 当 `--ink` / `--canvas` 是纯黑 / 纯白

某些预设（editorial / Swiss / brutalist / 报刊风）的 `--ink: #000` / `--canvas: #fff` 是**风格选择**，不是缺陷 —— "印在白纸上的黑墨"是这些预设的核心美学。

- **`--ink: #000`** —— 这些预设里 OK，保留作为 ink 使用
- **`--canvas: #fff`** —— 视频远观时纯白会"开花"，**优先用预设提供的 `--paper-warm`**（editorial 预设主动注释了 "fallback if canvas is pure white"）；如果没有 fallback token，build agent 自己合成一档暖白
- 其他预设（saas / material 等）若出现纯黑纯白，按通用规则处理（用 off-black / off-white）

判定路径：先读 preset 名 → 若是 editorial / brutalist 系列接受纯黑作 ink + 优先 `--paper-warm` 作 canvas；其他预设遵循 off-black/off-white 通用规则。

## 角色映射

每个 token 在 60-30-10 里扮演一个角色：

| 角色                    | 典型 token 名（按品牌而异）                                                 | 视觉权重                                   |
| ----------------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| **中性背景（canvas）**  | `--canvas` / `--paper` / 最浅 neutral                                       | **60%** —— 占主导，不与内容争注意力        |
| **中性表面（surface）** | `--paper-2` / `--surface` / 次浅 neutral；**不存在则用 hairline rule 分层** | **~20%** —— 面板、卡片、边界               |
| **前景文本（ink）**     | `--ink` / `--ink-soft` / off-black 或 off-white                             | **~10%**                                   |
| **主强调（accent）**    | `--brand-primary` / `--brand-accent`                                        | **~10%** —— **只用在每个节拍的焦点元素上** |
| **次强调**              | `--brand-secondary`（若存在）                                               | **~5%** —— 与主强调绑不同语义              |
| **克制第三色**          | 中性或纸调                                                                  | **<2%** —— 偶尔出现                        |
| **语义色**              | 成功/错误/警告（从品牌色相派生）                                            | 节制使用                                   |

> **当 design.html 缺 `--surface` 这一档** —— 这份预设用 hairline rule 分层而非 surface 色 —— plan 应明确说"30% 用 hairline + canvas 重复"，而不是编一个假的中间色。

## 60-30-10 是**视觉权重**，不是像素数量

- 60% canvas —— 占主导，不抢戏
- 30% surface + 文本 —— 面板、边框、辅助文案
- 10% accent —— 只用在**当下的焦点元素**上

**头号错误**：因为品牌色是"品牌的标识"就到处涂。Accent 之所以有效，是因为它**稀有**。Archive 中最强示例（codex-plugin）把每个 accent 绑定到一个**语义**：cyan = HyperFrames moment、lime = render、amber = Codex —— 三种 accent，每种只在自己负责的节拍出现，从不重叠。

更极致：vercel-intro 整片只用一种品牌红 + 一次 RGB 色差，立刻切回干净黑底白字。**一种颜色，一次效果，极致克制。**

## 带色调的中性色

纯灰没有个性。中性色必须向品牌色调偏移：

- 暖品牌（红 / 橙 / 黄）→ 灰加微妙暖铸调
- 冷品牌（蓝 / 紫 / 绿 / 青）→ 灰加微妙冷铸调

色调要几乎不可察觉，但在潜意识层创造一致性。这通常已经在 design.html 的 `--canvas` / `--paper-2` token 里编码好了；plan 只需引用角色，不需要算 OKLCH。

## 调色板四层结构

完整视频调色板有四层（不需要的可跳过，**不要**多加）：

1. **主强调** —— 1-2 种，绑定语义，10-15% 权重
2. **中性阶梯** —— canvas → surface → surface-raised 三档（亮色或暗色皆然），60% + 20%
3. **前景** —— 1-2 个 off-white 或 off-ink 用于文本，10%
4. **语义色** —— 成功 / 错误 / 警告，从品牌色相派生

**逐节拍隔离调色板也是合法的**（fadeglow-v4 在 Beat 2 / 4 / 7 用完全不同的色感）—— 由情感弧线决定，不强求一致。

## 跨场景一致性

视频每个场景必须感觉属于同一视觉系统（除非明确做"每场一个宇宙"的模式）。

- 背景调色板在项目级定义一次（`:root` / 共享 `<style>`），不要逐场景临时写死 hex
- 各场景可在**明度**上变化（暗 → 亮形成节奏），但共享相同**色相家族**
- Accent 用途必须一致：场景 1 的 cyan 是 HyperFrames moment 颜色 → 场景 5 它就不能变成背景渐变
- 数据可视化颜色从品牌调色板派生，不要任意选

**限度内变化 OK**：暗/亮交替做节奏、去饱和（平静）↔ 饱和（强调）、品牌相近色之间渐变。

## 永远不要纯黑 / 纯白

纯 `#000` / `#fff` 在自然界不存在 —— 对比刺眼、显合成、压缩破细节。永远用 design.html 提供的 off-black / off-white token（典型名 `--ink` / `--canvas`）。

例外：强调时刻的纯白 `text-shadow` / `drop-shadow` 光环（点击涟漪峰值）是 OK 的 —— 用 build agent 的低不透明度叠加，不直接当文本色。

## 危险组合（禁用模式）

- **白底浅灰文字** —— 对比塌陷，小屏幕崩
- **彩色背景上的灰色** —— 读起来像褪色 / 脏污；应改用**背景色相的更深色调**
- **图像上的细体浅色文本** —— 即使加阴影也不可靠；上遮罩 + 加重字重，或两者并用
- **`#000` 上的纯饱和霓虹** —— AI 默认套娃外观。改用 off-black + 强调色降到 0.20-0.35 glow 不透明度（这是 build 的事；plan 只需点名"避免霓虹"）
- **紫到蓝的 AI 渐变** —— codex-plugin / hermes 都明确禁过 ("no generic purple-blue AI gradients")。需要深度感时用品牌色调的径向膨胀替代

## 背景：brand-color mesh background 是项目默认

**本项目级决策（覆盖所有预设的默认背景规则）**：

- **每个场景默认背景 = brand-color mesh background**（多个 brand 色 blob + 高斯模糊 + canvas veil 的氛围底盘）
- **Veil 重 —— mesh 作为"背景里隐约的品牌色氛围"**，远观仍读作克制底盘，前景文字清晰可读；不喧宾夺主
- **Mesh 是单一背景层** —— 不再叠 dual-radial swell、scanline、半色调、建筑感网格。**只有粒子层**（品牌色稀疏浮粒）可与 mesh 共存
- **前景 accent 不受预设约束** —— 走标准 60-30-10，editorial 的"accent ≤ 5%"纪律**已被明确放开**：前景文字、CTA、卡片可以更自由地使用品牌色

> **关于 component 实现**：多数预设把它实现为 `gradient-mesh-bg` component（editorial.md 已注册）—— build agent 优先复用该 component；预设未提供同名 component 时，build agent 按"brand 色 blob + 高斯模糊 + canvas veil"功能描述合成同等效果。Plan **不需要**知道具体哪个预设有这个 component —— 写功能名即可。

### 与预设规范的关系

本项目级 mesh 默认**覆盖以下 preset 的 §H 背景纪律**（"canvas is the hero"、"accent ≤ 5%"、"primary 不做背景填充"等），把它们的印刷克制感偏向品牌化 marketing 视频方向：

**走 mesh 默认（D 类，9 个）**：
`editorial` · `capsule` · `soft-editorial` · `daisy-days` · `block-frame` · `playful` · `studio` · `neo-grid-bold` · `emerald-editorial`

> 命中以上 preset 时，plan agent **必须**在每个 scene 散文里写出 mesh 句式（见下方"Plan 引用样例"），不要因为 preset §H 写了 "canvas is the hero" 就退回纯 canvas。

**不走 mesh 默认（保留 preset 自带背景设计）**：

- 显式反对渐变 / 网格 / 软光晕：`long-table` · `neo-brutalism` · `editorial-forest` · `raw-grid`
- 自带核心背景介质：`liquid-glass`（aurora 着色器）· `8-bit-orbit`（CRT 显象管）· `sakura-chroma`（半色调暖纸）· `scatterbrain`（cork / paper / warm 三变体）
- Paper-grain 系（mesh 与 grain 美学冲突）：`pin-and-paper` · `retro-zine` · `peoples-platform` · `creative-mode` · `stencil-tablet`

以上 14 个 preset 命中时，plan agent **保留 preset 自己的背景设计**——按 preset §H 写。

> 若未来要回归严格 editorial：把 mesh 仅保留给 1-2 个高潮节拍、其他场景换回纯 canvas + hairline + 12-col 网格暗示、前景 accent ≤ 5%。**当前 D 类默认是放开的。**

### 例外场景

少数场景可以离开 mesh 默认（plan 必须明说为什么）：

- **纯工作区演示**（屏幕录制、UI 截图）—— 改用 `--canvas` + 建筑感网格，避免 mesh 与 UI 截图的色彩竞争
- **暗场氛围 / 痛点节拍** —— mesh 降饱和、blob 用 neutral 替代 brand 色；或直接换 off-black 底
- **品牌揭幕高潮** —— mesh veil 临时调轻，让品牌色饱和释放，配合 hero 词的双层 glow

Plan 写："默认 brand-color mesh 背景（veil 重，brand-primary + secondary + accent 三 blob，氛围底盘）"；或例外："本场景换 canvas + 12-col 网格暗示 —— 屏幕录制不要 mesh 干扰"。**不要**写 `opacity: 0.7` / `blur(140px)` —— 这是 build 的事。

## 暗场景规则（plan 层）

暗场景不只是反转：

- 用带色调的 off-black（design.html 的 dark token），**不要**纯 `#000`
- 文字字重比亮场降一级（这是 build 的事，plan 知道存在即可）
- 强调色去饱和（build 处理；plan 只说"暗场氛围"）
- Hero 词上的 glow 通常**双层**（紧 + 广）—— plan 点名"hero 加双层 glow"

## Plan 引用样例

**标准场景（mesh 默认背景，适用于 D 类全部 9 个 preset：editorial / capsule / soft-editorial / daisy-days / block-frame / playful / studio / neo-grid-bold / emerald-editorial）**：

> "Background: brand-color mesh 默认（veil 重，brand-primary + secondary + accent 三 blob 作为隐约氛围，远观仍读作克制底盘）。Palette 60-30-10：60% canvas（mesh veil 之上仍读作 canvas）+ 30% hairline + chapter-label rule 分层（无 surface token）+ 10% accent 用在 hero 词与 CTA underline。`--ink` 纯黑保留作为印刷感墨色。"

**例外：工作区演示场景**：

> "本场景跳出 mesh 默认 —— 屏幕录制 + UI 截图占帧 60%，mesh 会与 UI 色彩竞争。改用 `--paper-warm` 60% + 12-col 建筑感网格暗示 30% + `--brand-primary` underline 标章节 10%。下一场景回归 mesh 默认。"

**例外：品牌揭幕高潮**：

> "Beat 6 hero 揭幕：mesh veil 临时调轻让品牌色饱和释放，hero 词加双层 glow（紧 + 广）。这是整片唯一让 mesh 强度释放的节拍。下一场景回归默认重 veil。"

不写具体 hex / opacity / saturation 百分比 —— 那是 build 的事。
