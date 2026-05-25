---
name: video-typography
description: "Typography design decisions for HyperFrames videos — roles, hierarchy intent, pairing logic. Implementation values (px, letter-spacing em, CJK fallback chains, OpenType CSS) live in build agent territory."
category: visual-design
---

# 视频排版 —— 设计判断层

视频排版与网页排版不同。没有滚动，没有响应式重排。每个文本元素必须在 1-5 秒可见窗口内**一眼可读**，并且承担情感工作 —— 在好的发布视频里，文字几乎不是装饰，而是场景的情感锚点。

**本文件只负责 plan 层的设计判断** —— 角色、层级意图、搭配逻辑、否定句。具体数值（字号 px、letter-spacing em、CJK fallback、`tabular-nums` 等 CSS）是 build agent 在写 HTML/CSS 时查 `/hyperframes-core` 与 design.html 的事；plan 不抄。

## 字体来源

**字体族来自 design.html**（按用途的 display / body / mono 角色名，或具体字体名如 "Instrument Serif"）。Plan 里按**用途**点名："display 用于 hero 标题"、"body 用于支撑文字"、"mono 用于 eyebrow / 元数据"。**不要**编造字体名，也**不要**在 plan 里把具体字体名抄一遍——build agent 自己会从 design.html grep。

如果场景用了**第二种字体**做对比（serif italic 重音、mono 标签），plan 必须点名这是设计决策；同质字体（两种几何 sans）不允许 —— 视觉张力而无层次收益。

## 字号阶梯（按角色，不按 px）

视频字号远大于网页。Plan 按**角色**引用，build agent 根据本节的范围去落具体 px（这些范围来自 archive 校准，build 侧细化）：

| 角色               | 用途                     | 相对感觉                             |
| ------------------ | ------------------------ | ------------------------------------ |
| **Mega / 高潮**    | 单词级 hero、计数器峰值  | 占画布高度 50%+                      |
| **Hero / display** | 主标题、场景核心词       | 占画布高度 25-40%                    |
| **Display**        | 次级标题、分段标         | 占画布高度 10-20%                    |
| **Heading**        | 段落标题                 | 占画布高度 5-10%                     |
| **Body**           | 支撑文字、字幕           | 视频远观可读最小尺度                 |
| **Eyebrow / UI**   | 元数据、章节标、命令面板 | body 的 ~50-70%，常做大写 + tracking |
| **Data / counter** | 单独的数字陈述           | 跨度极大，从 body 到 mega            |

Plan 写法："hero 词用 display 级，eyebrow 用 mono 大写"；**不要**写"hero 220px"——具体 px 是 build 的事。

**避免角色档位过近**：48 / 52 / 56 这种小跳跃读不出层次。Archive 趋向 2-3 倍跳跃（display 220 → heading 92 → eyebrow 30 是 7.3 倍）—— 层次要能在 <1 秒内读出。

## 通过多维度建立层级

只靠字号是不够的。每个场景至少叠 2-3 个维度：

| 维度          | 强对比                            | 决策点                                                       |
| ------------- | --------------------------------- | ------------------------------------------------------------ |
| **Size**      | 3:1 或更大                        | hero 词必须远大于周围                                        |
| **Weight**    | 800-900 vs 300-400                | 同字体族的极端字重对比比两种字体更干净                       |
| **Color**     | 与背景高对比                      | 见 `color-system.md`                                         |
| **Spacing**   | display 紧 + eyebrow 宽           | display 紧字距 = 自信；eyebrow 大写 + 宽 tracking = 元数据感 |
| **Case**      | eyebrow UPPERCASE + body Sentence | 全同 case = 单调                                             |
| **Style mix** | italic serif 嵌入 重 sans         | 单词级强调（archive 招牌）                                   |

Plan 写"hero 用 display 紧字距，eyebrow 用 mono 大写宽 tracking"；**不要**写 `-0.045em` / `0.08em` —— 具体 em 值是 build 的事。

## 字体搭配原则

- **一个字体族 + 多字重**通常够了 —— 比两种竞争字体更干净
- **真正的对比才加第二种字体**：serif display + sans body、sans hero + mono 标签
- **三声部系统**（archive 最强方案）：display + body + mono，每种声部承担明确的语义（mono 标记元数据 → "真实工具感"，不是"营销视频感"）
- **逐场景切换字体宇宙是合法的**（playground-launch 在 8 个 beat 用 5 套搭配）—— 当情感弧线说"切换宇宙"时，不要强行统一

## 禁用模式

- **作为 display 用 Inter / Roboto / Open Sans / Lato / Montserrat 的常规字重** —— AI 输出的 tell。要用 Inter 就用 900 紧字距，要么干脆别拿它做 display
- **相似但不相同的字体配对** —— 两种几何 sans、两种人文 serif → 视觉噪声无层次
- **正文长句用宽 letter-spacing** —— 破坏可读性
- **Mono 代码用紧 tracking** —— 失去节奏
- **display 用 0 letter-spacing（默认值）** —— 200px 标题会显得软绵绵、企业范

## CJK 注意

如果旁白脚本含中文，plan 必须显式点出："本场景含 CJK 文字"。build agent 会处理 fallback 链（这是渲染环境配置，不在 plan 层）。CJK 与拉丁混排时，CJK 视觉重量更密 → display 级 CJK 通常比拉丁小一档。

## Plan 引用样例

> "Hero word 用 display 级 + 紧字距，eyebrow 用 mono 大写宽 tracking 标 'BEAT 02'，body 用支撑文字。Hero 与 eyebrow 形成 size + weight + case + style 四维对比。"

不写具体 px / em / 字体名。
