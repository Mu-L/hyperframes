# Design System (Phase 1b)

合成 `design.html` + 切碎为 `chunks/`。三步确定性脚本，preset 选择是 agent 唯一的决策点。

## 1. 命令模板

```bash
mkdir -p design-system

# Step 1 — 抓站点 DNA
npx designlang <url> --out ./design-system --header "Accept-Language:en-US,en;q=0.9,*;q=0.5"

# Step 2a — baseline 推断，写 inference.json，不落 design.html
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --no-emit

# Step 2b — 见 §3 决策规则

# Step 2c — 用 chosen preset 落 design.html
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --style <chosen>

# Step 3 — 切碎为 chunks/
node <SKILL_DIR>/phases/design-system/scripts/emit-chunks.mjs ./design-system
```

可选 flag：

- `designlang --wait 2000` — JS-heavy 站点 hero 未注入时
- `build-design --prefix <name>` — auto-detection 失败时
- `build-design --out-scores <file>` — 改 inference.json 落盘路径（默认 `<dir>/inference.json`）

## 2. inference.json 字段（agent 读这些）

```jsonc
{
  "confidence": "high" | "medium" | "low" | "forced",
  "baseline_winner": { "name": "...", "combined": 0.XX },
  "top_candidates": [           // 已满足 capability 的候选，按 combined 降序
    {
      "name": "...",
      "combined": 0.XX,
      "delta_from_winner": 0.XX,
      "matched_signals": [...],
      "best_for": [...],
      "avoid_for": [...],
      "sectionA_excerpt": "..."
    }
  ],
  "site_dna": {
    "material": "flat|paper|glass|...",
    "imagery": "photography|flat-illustration|...",
    "page_intent": "landing|pricing|blog|...",
    "section_role_counts": { "feature-grid": N, ... },
    "voice_tone": "neutral|warm|formal|...",
    "voice_heading_style": "Title Case|UPPERCASE|...",
    "voice_heading_length": "tight|loose"
  },
  "capability_gated_presets": [ // 因 runtime / env 缺失被 0 分；可在装齐 capability 后升回 top_candidates
    {
      "name": "liquid-glass",
      "combined_pre_capability": 0.42,
      "capabilities_missing": [
        {
          "kind": "block_installed",
          "auto_install": "npx hyperframes add liquid-glass-widgets" // 非 null 时 agent 可跑
        },
        {
          "kind": "env_var_set",
          "var": "PRODUCER_HEADLESS_SHELL_PATH",
          "auto_install": null // null = 不能自动装
        }
      ]
    }
  ]
}
```

## 3. 决策规则（Step 2b）

按 `confidence` 决定：

| confidence       | 动作                                 |
| ---------------- | ------------------------------------ |
| `high`           | 用 `baseline_winner.name` 跑 Step 2c |
| `medium` / `low` | 进入下面的 override 判据             |
| `forced`         | 已传 `--style`，跳过 review          |

**override 判据**（按优先级）：

1. **避坑**：top_candidates 中任一 preset 的 `avoid_for` 命中 `site_dna` 关键词 → 从候选剔除
2. **best_for 命中**：剩下的里挑 `best_for` 与 `site_dna` 关键词重合最多的
3. **capability_gated 选优**：如果某个 gated preset 的 `combined_pre_capability` 已能进 top-3 且 `site_dna` 明显契合（典型 `material: "glass"` → liquid-glass），处理 `capabilities_missing[]`：
   - `auto_install` 非 null → 跑这条命令 → 重跑 `build-design.mjs --no-emit` 验证它已进 top_candidates → 用 `--style` 选它
   - `auto_install: null` → 写进 anomaly 汇报，**改选别的 preset**
4. **无明显赢家** → 保留 baseline_winner

**禁止**：选择必须出自 `top_candidates[]` 或 `capability_gated_presets[]`，不能发明新名字。

## 4. 汇报模板

```
preset review:
  baseline: <name> (combined=<X>, confidence=<...>)
  chosen:   <name>
  reason:   <一句话，引用 site_dna / best_for / avoid_for 的具体关键词>
  alternates_considered: [<name1>, <name2>]
  capability_actions: [<装了什么 block / 哪个 env var 没设>]  # 没动作就写 none
```

外加 build-design 和 emit-chunks 两段 stdout 原样贴。

## 5. 硬契约

- **`chunks/` 与 `design.html` 同源** — Step 2c 重跑后必须重跑 Step 3，否则下游读旧 chunk
- **Read 范围**：`./design-system/inference.json` + `./design-system/<prefix>-{intent,visual-dna,voice}.json` + 验合成结果时 `./design-system/design.html`。其他 designlang 中间产物（`brand.html` / `palette.json` / `gradients.json` 等）不读
- **不要自己设计 palette / typography / 字体 / decoration** — 全部由 build-design 写定
- `--style` 是 deliberate override，agent 必须在跑它之前满足 capability；build-design 在 forced mode 下不再 gate

## 6. 排查

| 现象                                  | 修法                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 抓回非英语 hero                       | 自查 `--header` 拼写（默认已带 Accept-Language）                                                               |
| 抓回空 hero / 占位文字                | 加 `designlang --wait 2000`                                                                                    |
| Step 3 报缺锚点                       | 重跑 Step 2c，确认 design.html 含 ROOT-START / MOTION-START / VOICE-START / COMPONENT 注释；不要修 emit-chunks |
| `chunks/index.json` 缺 `components[]` | 看 build-design stdout `components: N paste-ready`；N=0 可接受（下游退化为 tokens + easings）                  |
