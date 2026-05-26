# `/launch-video` — Quick Start

Skill 在 `hyperframes` CC plugin 内,完整调用形式 `/hyperframes:launch-video`(plugin namespace 自动添加)。

URL → 60-90s product-launch / SaaS explainer / promo 视频。整个 pipeline LLM dispatcher + 7 阶段,每阶段产物落到当前 cwd。

---

## Install / Update

**通过 CC plugin 管道**(推荐,自动带上 hyperframes 全部 11 个 skill):

```text
/plugin install hyperframes@<marketplace>
```

升级时:

```text
/plugin update hyperframes
```

**或者通过 vercel-labs/skills CLI**(单 repo 多文件 copy 到 `.claude/skills/`):

```bash
npx skills add heygen-com/hyperframes
# 或 local repo:
npx skills add /path/to/hyperframes --skill '*' --agent claude-code --yes
```

跟着 plugin 同步过来的还有 10 个 sibling skill:`hyperframes-core`、`hyperframes-animation`、`hyperframes-creative`、`hyperframes-cli`、`hyperframes-media`、`hyperframes-registry`、`product-launch-video`、`video-workflows`、等。它们之间已经互相 cross-link,Phase 4 worker 会主动 read 对应的 rules/blueprints。

---

## 基本用法

```text
/hyperframes:launch-video <url>
```

默认 auto-infer style preset(从目标网站的视觉 DNA 推断)。

强制某个 preset(推荐显式给,可控性最高):

```text
/hyperframes:launch-video <url> with the design system style preset set to 'liquid-glass'
```

或者(等价的 prompt 给法):

```text
use the /launch-video skill to make a launch video for <url>. Force the design system style preset to 'liquid-glass' — when running build-design.mjs in Phase 1b, pass --style liquid-glass.
```

---

## 22 个 design.html style presets

每个 preset 是一套 director's-intent + decoration tokens + font pairing + motion language + voice transform + scene composition hints。`build-design.mjs --style <name>` 会把它合并进 site DNA,生成下游 phase 消费的 `design-system/design.html`。

完整 preset 源代码: `phases/design-system/style-presets/<name>/preset.md`(可以直接 `cat` 看)。

| `--style` 值        | 标签              | 视觉关键词                                        |
| ------------------- | ----------------- | ------------------------------------------------- |
| `editorial`         | Editorial / Swiss | 极简 · hairline border · serif display · 大量留白 |
| `editorial-forest`  | Editorial Forest  | 编辑型 + 森林系深绿暖调                           |
| `soft-editorial`    | Soft Editorial    | 编辑型 + 柔和粉米色                               |
| `emerald-editorial` | Emerald Editorial | 编辑型 + 翡翠绿 + 商务感                          |
| `studio`            | Studio            | 现代杂志 · 高对比 · 大字 hero                     |
| `liquid-glass`      | Liquid Glass      | Apple 风 · 毛玻璃 · WebGPU prereq                 |
| `neo-brutalism`     | Neo-Brutalism     | 厚黑边框 · 高饱和 · 工业字体                      |
| `neo-grid-bold`     | Neo-Grid Bold     | 粗网格 · 黑白 + 单色 accent                       |
| `block-frame`       | Block Frame       | 方块框 · 厚重 · stat-heavy                        |
| `raw-grid`          | Raw Grid          | 裸网格 · 极少装饰 · 数据型                        |
| `stencil-tablet`    | Stencil & Tablet  | 模板 + 平板 · 印刷感                              |
| `long-table`        | Long Table        | 长表格型 · 期刊感                                 |
| `8-bit-orbit`       | 8-Bit Orbit       | 像素 · CRT 扫描线 · 复古                          |
| `retro-zine`        | Retro Zine        | 80s zine · 偏色 + 胶带                            |
| `playful`           | Playful           | doodle · blob · 涂鸦                              |
| `scatterbrain`      | Scatterbrain      | 笔记拼贴 · post-it · cork                         |
| `pin-and-paper`     | Pin & Paper       | 手工拼贴 · 大头针 · 手写                          |
| `daisy-days`        | Daisy Days        | 雏菊系 · 花卉 · 柔和粉黄                          |
| `sakura-chroma`     | Sakura Chroma     | 樱花调 · 浮世绘 · 朱印                            |
| `capsule`           | Capsule           | 胶囊形 · 浅色 · 轻量                              |
| `creative-mode`     | Creative Mode     | 表达性 · 粗黑体 · 戏剧化                          |
| `peoples-platform`  | People's Platform | 选民 · 海报感 · 高对比                            |

> auto-infer 模式靠 `preset-meta.match_signals` 评分。某些 preset(`liquid-glass` 需要 WebGPU,`8-bit-orbit` 需要像素字体)**没有 match_signals**,必须显式 `--style` 强制。

---

## Pipeline 一览(在 `<cwd>` 落产物)

```
research/context_pack.md            ← Phase 1 web-research
design-system/design.html + chunks/ ← Phase 1b
narrator_scripts.json               ← Phase 2 story-design
audio_meta.json + assets/voice/*    ← Phase 2.5 audio
section_plan.md                     ← Phase 3 visual-design
group_spec.json                     ← Phase 4a prep
hyperframes/compositions/scene_*.html  ← Phase 4b workers (parallel)
hyperframes/renders/video.mp4       ← Phase 4c finalize
```

每个 phase 完成会在 `./context.log` 写一行 `## <phase> [done <iso>]`。中途断了重跑会按 Resume 表(SKILL.md 底部)自动跳过已完成的 phase。

---

## 看板:已知 baseline

| run                                     | model  | effort  | 总时长    | mp4 大小 | gates                                   |
| --------------------------------------- | ------ | ------- | --------- | -------- | --------------------------------------- |
| editorial · Opus default                | opus   | default | 40:51     | 1.14 MB  | 80 contrast / 22 text overflow warnings |
| liquid-glass · Opus default             | opus   | default | 48:04     | 1.07 MB  | 类似 warnings                           |
| neo-brutalism · Opus default(Miao)      | opus   | default | ~25:00    | 9.5 MB   | 80 + 22 + 7 warnings                    |
| neo-brutalism · Sonnet `--effort low`   | sonnet | low     | **22:01** | 5.88 MB  | **全绿**                                |
| neo-brutalism · Opus `--effort low`     | opus   | low     | **18:01** | 11.8 MB  | **全绿**                                |
| liquid-glass · Opus default(post-merge) | opus   | default | 26:02     | 16.2 MB  | 1-frame tween 重叠(可忽略)              |

经验法则:

- **`--effort low` 比 default 快 30-50% 且 gate 更干净**(不要钻牛角尖)。
- **`--model sonnet` 适合保守审美 + 快速 iter**;`--model opus` 适合复杂动效。
- **不要无脑用 default effort 跑 Opus**——finalize yo-yo 容易让总时长翻倍。
- **第一次跑某个 preset 时**先用 `--effort low` 跑一遍探水温,看 quality OK 再用 default 跑 production。

---

## Troubleshooting

| 症状                                                          | 检查                                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Phase 1 第一次跑卡在 `playwright install chromium`            | 先在 shell 跑 `uv run --with playwright playwright install chromium`                                                 |
| `python@3.11` 报 PEP-668                                      | 用 `brew install python@3.11`,**别用** `/usr/bin/python3`                                                            |
| Lyria BGM 没生成                                              | 没设 `$GOOGLE_API_KEY` 时自动 fallback 本地 MusicGen,首次会下载 ~300MB 模型权重                                      |
| `lint OK / validate OK / inspect OK / snapshot OK` 但视频黑屏 | 历史 audit 5/20 有过类似 silent failure;再跑一次新 project dir,or 检查 finalize 的 ffprobe 输出                      |
| run.log 突然出现 `You've hit your session limit`              | 5h/7d Anthropic rate cap 撞墙;查 `resets <time>` 等。trace 内已 author 完的 scene\_\*.html 是有效产物,可以拼装出 mp4 |

---

## 一句话总结

```text
/hyperframes:launch-video https://your-product.com  with style 'neo-brutalism' and effort low
```

跑 ~20min,出一个 60-90s 1920×1080 30fps h264 + aac mp4,落在 `./hyperframes/renders/video.mp4`。
