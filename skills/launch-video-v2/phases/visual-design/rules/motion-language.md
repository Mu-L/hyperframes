---
name: video-motion-language
description: "Motion design decisions for HyperFrames videos — spring intents, beat structure, hold times, stillness-before-climax, transition vocabulary. GSAP eases, exact ms/frames, ease curves, and JS code live in build agent territory (/hyperframes-animation)."
category: visual-design
---

# 视频运动语言 —— 设计判断层

好的宣传视频感觉像一个连续整体，不是一堆毫无关联动画的幻灯片。这需要一致的运动语言：相同的缓动曲线意图、相同的节奏时序、相同的弹簧手感。

**本文件只负责 plan 层的设计判断** —— 弹簧意图、节拍结构、停留、静默节拍、过渡词汇。具体 GSAP ease 名称（`back.out(1.4)`）、ms / 帧映射、stagger 公式、cut-the-curve 精确 JS 代码、乘性 breathing 公式都属于 build agent 在写 timeline 时查 `/hyperframes-animation` 与 design.html 的事；plan 不写代码。

> **`EASE` / `DUR` 的 JS 常量来自 design.html。** Plan 按**意图角色**引用（`EASE.entry` / `EASE.emphasis` / `EASE.exit`、`DUR.fast` / `DUR.med` / `DUR.slow`，但典型预设里的实际键名可能略不同 —— 比如 editorial 预设用 `DUR.snap` 代替 `DUR.fast`）。Plan 写"用 entry 弹簧"或"参考 `EASE.entry`"，build agent 自己映射到具体曲线。

## 弹簧意图（按角色，不按曲线）

HyperFrames 基于 GSAP。下表是 plan 用的**意图**；build agent 用 `/hyperframes-animation` 把意图翻成具体 GSAP ease + duration：

| Intent     | 手感                   | 适用场景                  |
| ---------- | ---------------------- | ------------------------- |
| **entry**  | 自信轻微过冲，迅速归位 | 主要元素入场（默认）      |
| **gentle** | 柔和滑入，无过冲       | 背景元素、细微动作        |
| **snappy** | 紧凑过冲，近乎瞬时     | UI 元素、小图标、按钮     |
| **heavy**  | 带重量的减速           | 大图、原型截图、hero 视觉 |
| **slam**   | 弹跳过冲，刻意感强     | Logo / 钟声等冲击瞬间     |

**一致性规则**：相似元素共享同一意图。一个场景里所有图标都 `snappy`，所有 hero 图都 `heavy`。**不要**为每个元素发明独有的 ease + duration。

## 禁用项

- **`bounce.out` / `elastic.out`** —— 显得过时，把注意力从内容转移到动画。真实物体平滑减速，不反弹。`entry` 意图的低过冲（archive 典型 back.out 1.4-1.7 范围）是 OK 的；更高过冲只保留给明确"俏皮感"瞬间
- **每个元素一个独有 ease + duration** —— 视觉噪声

## 时长意图（100 / 300 / 500 / 800 概念）

Plan 按**意图档位**引用（"瞬时反馈"、"状态变化"、"布局变化"、"入场动画"）；具体 ms / 帧由 build agent 在 30fps 下按 `/hyperframes-animation` 落数。

- **瞬时反馈** —— 微交互、状态闪动
- **状态变化** —— 元素入场、图标切换
- **布局变化** —— 场景入场、主要过渡
- **入场动画** —— Hero 揭幕、开场序列

**单个入场不超过 ~800ms**。需要更长铺陈 → 用多元素 stagger，不要延单元素时长。

## 退出 = 入场的 75%

退出动画约为入场的 75%（不是 50%、不是 100%）。到达审慎，离场迅捷但不突兀。

- 退出太快 → 闪屏
- 退出 = 入场 → 迟钝，阻塞下一场景

这是 plan 知道并能在散文里点名的规则；build agent 自己算具体帧数。

> Cut-the-curve 的入场 / 退出比是**刻意反转**（入场约 127% 退出长度）—— 入场要花更长清掉 blur。这是过渡的招牌例外，plan 引用过渡名称即可。

## Stagger 总上限

N 个元素 stagger 时，**总 stagger 时长 ≤ 500ms**（远超就显得拖）。具体公式（`(N-1) × per-item delay`）和"前 6-8 个 stagger，其余与最后一个一起入场"的策略是 build 的事；plan 只需知道：

- **3-7 个元素** —— 正常 stagger，总在 300-700ms 内
- **8+ 个元素** —— 收紧单项延迟，或只 stagger 前几个
- **永远不要让 stagger 超过 500ms 还在继续展开**

## 节拍结构（plan 核心工具）

节奏好的视频有节拍：紧张 → 释放 → 紧张 → 释放。Archive 最干净的参考是 playground-launch 的 46 秒方案：

| 阶段           | 时长   | 节奏       | 场景类型                     |
| -------------- | ------ | ---------- | ---------------------------- |
| **缓慢铺垫**   | 6-10s  | 慢速建立   | Hero 建立，VO 还未出现       |
| **快速蒙太奇** | 6-10s  | 每段约 2s  | 每 1.5-2s 一次 cut-the-curve |
| **过程展示**   | 12-18s | 持续无切   | 屏幕录制、真实工作流         |
| **收束**       | 3-5s   | 静止可呼吸 | Logo、URL、CTA               |

**场景内部按能量分配运动**：

- **高能场景**（hook、CTA）—— 更快入场、更紧 stagger、`snappy` 弹簧
- **可呼吸场景**（品牌揭示、情感节拍）—— 较慢入场、`gentle` 弹簧、较长停留
- **数据场景**（统计、特性）—— 中等节奏、干净 stagger、count-up

## 停留时间（Hold time）

元素入场后必须停留足够长才被读到。Plan 按**内容类型**引用最小停留（build 落具体帧数）：

| 内容                     | 最小停留意图 |
| ------------------------ | ------------ |
| 展示性文字（1-3 词）     | ~1s          |
| 短句                     | ~1.5s        |
| 数据 / 统计              | ~1.5s        |
| 产品截图                 | ~2s          |
| 复杂视觉（示意图、对比） | ~2.5s        |
| Hero / 高潮词            | ~1-1.4s      |

旁白时长 < 所需停留 → 扩展场景填充时间。

## "高潮前静默"节拍 ⭐

Archive 反复出现的招牌：主要动作和确认/结果之间留一段 **0.3-0.75s 的停顿**。这段静默在落点前营造叙事张力。

- 图标在 2.2s 收拢，但 demo 直到 2.95s 才弹出（0.75s 间隙）
- 步骤 3 在 3.33s 激活，按钮在 3.52s 进入（0.19s 缓冲）
- "在最后一个挫败节拍上停住：光标静止，聊天框塞满，SFX 仍然有点对不上节奏"

**Plan 必须明确规划这个节拍** —— 在散文的"多阶段编排"里点名 `stillness-before-climax`。一个直接从动作跳到结果的场景会失去那个戏剧性的逗号。

## 持续运动 —— 入场后元素必须保持运动

静止元素 = 死视频。Plan 必须为每个元素点名"入场后用什么持续运动"（具体公式和代码是 build 的事）：

| 模式               | 适用场景                                                         |
| ------------------ | ---------------------------------------------------------------- |
| **慢速漂移**       | 所有元素（默认）                                                 |
| **Sine 浮动**      | 图标、装饰元素（反相浮动避免同步）                               |
| **乘性 breathing** | Hero 图、背景（在最终 scale 上做轻微 ±2-5% 呼吸，**不是 yoyo**） |
| **旋转漂移**       | 3D 卡片、hero logo                                               |
| **轨道**           | 环绕图标                                                         |
| **光晕脉冲**       | CTA、点击目标                                                    |
| **Halftone 呼吸**  | 氛围场景（按节拍变形密度）                                       |

**乘性 breathing 是被重复最多、也被忽略最多的技巧** —— plan 默认每个 hero 都点名"乘性 breathing"。**禁用** yoyo tween（覆盖入场 scale）。具体公式（`scale = final * (1 + Math.sin(t * freq) * amp)`、`onUpdate` 读 `tl.time()`）是 build 的事。

**最小振幅 ±6px 或 ±2-5% scale** —— 3px 微浮 = 不算运动。

## 过渡词汇 —— 整片只用 2-3 种

场景间过渡遵循有限词汇。整片只挑 2-3 种反复用 —— 过渡类型的重复创造专业整体感。Archive 中最干净参考：playground-launch 在 8 个截然不同视觉宇宙中**只用 cut-the-curve**，正是这一点让整片凝聚。

### Cut-the-curve（archive 招牌，多数情况默认）

当前场景 blur + 滑出 → 下一场景 blur + 滑入。两侧用相同 blur 量级、方向逐缝交替（右→左→上→下）、背景比前景内容提前少许触发、内部 reveal 等舞台落定后才动。Plan 点名方向（"cut-the-curve LEFT"）即可，具体 0.33s / 0.42s / 8-10px blur 是 build 的事。

### Scale + fade（zoom-through）

一边淡出一边向画面中心拉近，相机向前推进到下一句标题。

### Slide

方向性滑动（匹配叙事流向），可配合视差。

### Morph（最强叙事衔接）

共享元素在场景间变换（手机簇 → 圆形头像 = 同时 scale + borderRadius tween）。

### Hard cut

瞬时 opacity 翻转，用于高能瞬间（网格完全填满地出现、无 build-in）。**慎用** —— cut-the-curve 是默认；硬切保留给类型 / 调性的切换。

**Plan 必须为每场点名 transition** —— 决定下一场景的 Continuity（见 guide.md "硬契约"小节）：

- `hard cut` / `jump cut` → Continuity `break`
- 同素材上的 `cut-the-curve` / `morph` / `scale+fade` → Continuity `continue`

## Plan 引用样例

> "Multi-phase: entry 用 `EASE.entry` 弹簧（heavy 意图，hero 图）→ ambient drift（乘性 breathing ±3%）→ major transition: 图标 snappy stagger 入场（5 个，总 stagger ~400ms）→ **stillness-before-climax 0.6s**（光标静止，背景仍呼吸）→ result emphasis: 文字 gentle 入场 + 双层 glow → idle breathing → exit cut-the-curve LEFT 进入下一场景。"

不写具体 ease 曲线名 / ms 数 / stagger 公式 / JS 代码。
