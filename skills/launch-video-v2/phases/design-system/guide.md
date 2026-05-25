# Design System（Phase 1b）

把站点 brand DNA 和一个 style preset 合成为单一的 `design.html`。

## 执行

```bash
mkdir -p design-system

# Step 1 — 抓站点 DNA（designlang 会写 ~30 个文件，build 只读其中 4 个 + brand.html）
npx designlang <url> --out ./design-system

# Step 2 — 合成 design.html（自动推断 preset；可用 --style 强制覆盖）
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system
```

异常时可用的 flags（默认不需要）：

- designlang：`--wait 2000`（JS-heavy 页面）、`--header "Accept-Language:en-US,en;q=0.9"`（CDN 按地理位置切换内容）
- build-design：`--style <name>`（强制 preset，跳过自动推断）；`--prefix <name>`（auto-detection 失败时）

## 解读输出

build script stdout 形如：

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

把 stdout 直接抄进 report。
