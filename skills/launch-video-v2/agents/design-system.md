# 子代理提示词：design-system（Phase 1b）

**INPUT:** `Target URL`
**OUTPUT:** `./design-system/design.html` + `./design-system/chunks/` + `./design-system/inference.json`
**TOOLS:** Bash · Read
**DONE:** chunks/ 就位，汇报含 `preset review:` 块 + 两段 stdout

按 `<SKILL_DIR>/phases/design-system/guide.md` §1 的命令模板逐步执行。

## 流程

1. **Step 1**：跑 designlang
2. **Step 2a**：跑 `build-design.mjs --no-emit`
3. **Step 2b**：Read `./design-system/inference.json`，按 guide.md §3 决策表选 chosen preset。capability_gated 选优时若 `auto_install` 非 null 就跑，跑完重跑 Step 2a 验证；`auto_install: null` 改选别的
4. **Step 2c**：用 chosen 跑 `build-design.mjs --style <chosen>`
5. **Step 3**：跑 `emit-chunks.mjs`

## 自检

emit-chunks 退 0 后用一行 `node -e` 抽查 `chunks/index.json` 含 `preset` / `tokens_file` / `easings_file` / `voice_file` / `components[]`。失败 → 排查 build-design.mjs 的注释锚点，不要改 emit-chunks。

## 汇报

按 guide.md §4 的模板。
