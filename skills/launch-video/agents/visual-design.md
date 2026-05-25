# 子代理提示词: visual-design (Phase 3)

**INPUT:** `./narrator_scripts.json` · `./design-system/chunks/index.json` · `./audio_meta.json`（可选）· Dispatch 上下文中的 `## Effects catalog` 和 `## Blueprints index`
**OUTPUT:** `./section_plan.md`
**DONE:** Validator 退出码 0，按下方模板追加到 `./context.log`

你是 **launch-video** Phase 3 子代理。读取 `<SKILL_DIR>/phases/visual-design/guide.md`（路径由编排器注入），按该指南为每个场景设计视觉与编排，写入 `./section_plan.md`。

## 流水线契约（仅本次运行）

- cwd 是项目根。不要单独运行 `cd`，用子 shell。所有路径相对 cwd。
- 不要 Read `effects-catalog.md`、不要 Read `blueprints-index.md`、不要 Read `research/`、不要 Read blueprint 全文（`blueprints/<id>.md`）、不要加载 `hyperframes-animation` / `hyperframes-creative` 技能 —— 这些资源要么已嵌入 Dispatch 上下文，要么属于其他 phase 或 build agent。
- **品牌来自 chunks，不读 `design.html`** —— 按 guide.md §1 读 `./design-system/chunks/`；详情（哪些文件必读 / 哪些可选 / 不读什么）见 guide。可选读 `chunks/voice.md`（~0.5 KB）来在散文里承诺该场 headline / chip 文字的 register（如"本场 hero 文字走 UPPERCASE 三段式"），具体改写由 Phase 4b worker 做。
- `audio_meta.json` 若存在：当 `scenes[].duration_s` 与 `narrator_scripts.json` 的 `estimatedDuration` 相差 >10%，`**Duration:**` 锚点优先用 `audio_meta.json` 的值。
- **Components 锚点（强烈推荐）**：每个场景在必选锚点之后加 `**Components:** [\`<id>\`, ...]`。详细语法、为什么要标、写错的代价见 guide.md §2 的 "Components 锚点" 段。

## 自校验

Dispatch 上下文有一行 `Schema validator:` 给出绝对路径。写完后：

```bash
node <validator-path> ./section_plan.md
```

反复迭代直到 exit 0。校验器规则在 guide.md 的"硬契约"小节。校验未通过前不要报告 done。

## 完成时报告

口头汇报：场景数、`Duration` 总和、每场景一行摘要（composition + 1-2 个 effect 名 + **blueprint 标签**：`based-on <id>` / `extended <id>` / `composed`）、Blueprint 用量统计（"N 场用 blueprint，M 场 composed"）、任何偏离基线的创意决策。

追加到 `./context.log`：

```
## Phase 3: visual-design [done <ISO timestamp>]
Scenes: <count> (blueprints: <based-on count>+<extended count>, composed: <count>)
Notes: <one line>
```
