# web-research — how-to

抓 marketing/landing page → 写 `./research/`。纯 capture，不调 LLM。

## 启动

```bash
uv run --with playwright \
  <SKILL_DIR>/phases/web-research/scripts/capture_web_context.py \
  "<TARGET_URL>" --out ./research --download-assets
```

首次缺 Chromium → 先 `uv run --with playwright playwright install chromium`，再重跑。

异常时可加（默认不需要）：`--wait <sec>` / `--viewport 1440x1200` / `--max-assets 80` / `--no-screenshot`。

## 产物

```
research/
├── context_pack.md      # LLM-friendly summary (~50KB)
├── extraction.json      # raw: sections/assets/colors/fonts/rects (~175KB)
├── page.html
├── screenshot_full.png  # 1440px
└── assets/              # png/jpg/svg/webp/mp4/woff2 + index.json
```

## 验证

```bash
[ -s ./research/context_pack.md ] && [ -s ./research/extraction.json ] \
  && [ -s ./research/screenshot_full.png ] && [ -d ./research/assets ] \
  && echo ok || echo missing
```

缺任一 → 报缺失项，停止。

## 报告（回给用户）

- Final URL ← `extraction.json` `.source.final_url`
- Page title ← `.source.title`
- Section candidates：数量 + `context_pack.md` 里的简短列表
- Assets：`ls research/assets | wc -l`，按扩展名拆分
- Hero candidate、font families（在 `context_pack.md`）
- 异常（timeout / no assets / blank screenshot）

## 写日志

追加到 `./context.log`：

```
## web-research [done <ISO timestamp>]
URL: <final url>
Assets: <count>
Notes: <one line>
```

## 约束

- cwd = 项目根。**绝不** 单独 `cd`；用子 shell（`(cd research && ls)`）。
- 只写 `./research/`，不碰 `./design-system/`。
