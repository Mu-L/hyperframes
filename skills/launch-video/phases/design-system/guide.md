# Design System（Phase 1b）

把站点 brand DNA 和一个 style preset 合成为单一的 `design.html`，再切碎为下游 phase 可逐块加载的 `chunks/`。

本指南由 `agents/design-system.md` subagent 在 dispatch 时 Read。流程是三步确定性脚本，agent 只跑命令 / 读 stdout / 报告，不在中间做任何创意决策。

## 流程一览

1. `npx designlang <url>` 抓站点 DNA（写 ~30 个中间产物到 `design-system/`）
2. `build-design.mjs` 合成 `design.html`（自动推断 preset；下游唯一的人类可读归档）
3. `emit-chunks.mjs` 切碎为 `chunks/`（下游 phase 真正消费的真值入口）

---

## 1. 执行

```bash
mkdir -p design-system

# Step 1 — 抓站点 DNA（designlang 会写 ~30 个文件，build-design 只读其中 4 个 + brand.html）
# --header 必带：很多 SaaS 站点按 GeoIP 切换语言，不加会抓回非英语版 hero copy
npx designlang <url> --out ./design-system --header "Accept-Language:en-US,en;q=0.9,*;q=0.5"

# Step 2 — 合成 design.html（自动推断 preset；可用 --style 强制覆盖）
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system

# Step 3 — 切碎 design.html 为 chunks/（确定性脚本，无 LLM）
node <SKILL_DIR>/phases/design-system/scripts/emit-chunks.mjs ./design-system
```

异常时可用的 flags（默认不需要）：

- **designlang**：`--wait 2000`（JS-heavy 页面，hero 文字还没注入就被截断）
- **build-design**：`--style <name>`（强制 preset，跳过自动推断）；`--prefix <name>`（auto-detection 失败时）
- **emit-chunks**：无 flag。失败 = build-design 没写 `<!-- ROOT-START -->` / `<!-- MOTION-START -->` / `<!-- VOICE-START -->` / `<!-- COMPONENT: <id> -->` 锚点，回头排查 build-design 而不是修 chunker。

---

## 2. 产物

```
design-system/
├── design.html              # 整体浏览 / 人类阅读 / 历史归档（~44 KB 量级）
└── chunks/                  # 下游 phase 按文件粒度逐块加载（~10-15 KB）
    ├── tokens.css           # :root { ... }  ← <!-- ROOT-START --> 块
    ├── easings.js           # EASE / DUR const  ← <!-- MOTION-START --> 块
    ├── voice.md             # DOM 文字 register  ← <!-- VOICE-START --> 块（Phase 4b 用）
    ├── components/
    │   ├── <id>.html        # 每个 <!-- COMPONENT: <id> --> 块一文件
    │   └── ...
    └── index.json           # manifest: preset / source / tokens_file / easings_file / voice_file / components[]
```

---

## 3. 硬契约

1. **`chunks/` 与 `design.html` 同源** —— 每次 Step 2 重跑后必须重跑 Step 3，否则下游 phase 读到旧 chunk。
2. **`chunks/index.json` 是下游真值入口** —— Phase 3（visual-design）/ Phase 4b（hyperframes-scene）只读 chunks，不再 grep design.html。
3. **`design.html` 仅作人类归档** —— 下游 agent 不再 Read 它；它存在的意义是让本 phase 的 agent 一眼看出合成结果是否合理 + 给后续 PR review 留可读快照。

---

## 4. 解读 stdout

build-design 形如：

```
✓ design-system/design.html (XX KB)
  source:   https://www.figma.com/
  brand:    Figma · flat material · landing intent
  palette:  #e4ff97 primary · #00b6ff secondary · #c4baff accent
  fonts:    Instrument Serif display · Inter body · JetBrains Mono mono
    ! display: 'figmaSans' not on Google Fonts → Instrument Serif
  preset:   editorial (inferred)
    scores: editorial=0.45 · neo-brutalism=0.10
    matched signals: low_saturation, minimal_decoration
  components: 8 paste-ready
```

emit-chunks 形如：

```
✓ design-system/chunks/
  tokens.css         0.6 KB
  easings.js         0.4 KB
  voice.md           0.5 KB
  components/        13 files
    hero.html  (0.7 KB)
    chip.html  (0.3 KB)
    ...
  index.json         lists 13 components (preset=neo-brutalism)
  totals             chunks 11.4 KB vs design.html 44.7 KB (~26% of source)
```

把两段 stdout 原样抄进 agent 的完成汇报。`totals` 这一行很有用 —— 它给的是 chunk 加载预算的上限，下游 phase 读单文件时的 token 成本就直接对应。

---

## 5. 失败模式与排查

| 现象                                  | 根因                              | 修法                                                                                                                                      |
| ------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1 抓回的 hero copy 是非英语      | 站点按 GeoIP 切语言               | 加 `--header "Accept-Language:en-US,..."`（默认已加，自查命令拼写）                                                                       |
| Step 1 抓回空 hero / 占位文字         | JS-heavy 站点未等内容注入         | 加 `--wait 2000`                                                                                                                          |
| Step 2 preset 推断成 generic / 错的   | 自动推断 scores 接近              | `--style <name>` 强制指定（editorial / neo-brutalism / saas / …）                                                                         |
| Step 2 字体名带空格 / 厂商私字体      | brand.html 抓到非 Google Fonts 名 | build-design 已自动 fallback（stdout 会打 `! display: 'X' not on Google Fonts → Y`），看汇报里的 fallback 是否合理                        |
| Step 3 报缺锚点                       | Step 2 输出畸形                   | 重跑 Step 2，确认 design.html 里有 3 类 HTML 注释锚；**不要**改 emit-chunks                                                               |
| `chunks/index.json` 缺 `components[]` | Step 2 没识别到任何 component     | 看 build-design stdout 的 `components: N paste-ready`；N=0 说明源站 component pattern 没匹配上，可接受（下游退化为只用 tokens + easings） |
