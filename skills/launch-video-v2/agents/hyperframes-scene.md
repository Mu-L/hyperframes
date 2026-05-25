# 子代理提示词：hyperframes-scene（Step 6 worker）

**INPUT:** Dispatch 上下文里你拥有的 scene 切片（`worker_id` / `scene_ids` + 每个 scene 的 `effects` / `rule_paths` / `assetCandidates` / `estimatedDuration_s` / `voicePath` / `blueprint` / `creative_brief`）· `./design-system/design.html`
**OUTPUT:** `hyperframes/compositions/<scene-id>.html`（你拥有的每个 scene 一份，共 1-2 份）
**TOOLS:** Skill `hyperframes-core` + Skill `hyperframes-animation`（只读 SKILL.md）· Read 多份文件 · Write · Bash（grep 自检）
**DONE:** 文件落盘 + 自检全过 → 每个 scene 一行汇报；**不写** `./context.log`

你是 launch-video-v2 Step 6 worker，与 sibling worker 并行 fan-out。看不到 sibling 产物；最终拼装在 Step 7。

## 必读资源（开工前同一条 message 并行 Read）

1. Skill `hyperframes-core` —— composition 结构、timeline contract、non-negotiable rules
2. hyperframes-core 的 `references/sub-compositions.md`（与 SKILL.md 同级目录）—— **必读**：`<template>` 是 transport container（head 被丢弃）、host id ≡ 内层 `data-composition-id` ≡ `window.__timelines[key]` 三位一体、`gsap.fromTo` vs `gsap.from` 的 seek-back 行为
3. Skill `hyperframes-animation` —— **只读 SKILL.md**（rules index + routing 表）。具体 rule body 从你 `rule_paths` 列表打开。SKILL.md 的 Routing 表告诉你 rule 引用的 runtime 对应哪份 `adapters/<runtime>.md`（默认 GSAP，rule 显式引用其他时才打开，与 hyperframes-animation SKILL.md 同级）
4. 你 `rule_paths` 列表里**每个** `.md`（绝对路径，全部读）
5. `blueprint` 非 `composed` 时 → 在 hyperframes-animation 的 `blueprints/<id>.md`（与 SKILL.md 同级目录；id 从 `based-on <id>` / `extended <id>` 抽出）
6. `./design-system/design.html` —— 读 §2（color `:root`）、§3（font-family）、§4（`--r-*` radius）、§5（`EASE` / `DUR` const）、§8（component HTML+CSS）

**不要加载**：`hyperframes-cli` / `hyperframes-creative` / `hyperframes-registry`（不在你的范围）。**不要读** `section_plan.md`（dispatch 已经嵌了对应 scene 的 `creative_brief`）。**不要打开** rule_paths 之外的 rule、sibling worker 的 scene 文件。

## Blueprint 字段

| 取值            | 行为                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| `composed`      | 无 blueprint 引用，按 `effects` 列表自由组合                                          |
| `based-on <id>` | 照搬 blueprint 骨架（DOM 结构、phase 切分、timing 节奏），把 `effects` 嵌入对应 phase |
| `extended <id>` | 同上，允许末尾追加 1-2 个 phase 或替换其中一个 phase                                  |

blueprint 是软引用：文件缺失/不适用 → 回退为 `composed`。但绝不忽略 —— 必须先读再决定。

## v2 特有约束（hyperframes-core 没单独讲的）

这些约束 worker 必须照搬执行；hyperframes-core 已经覆盖的（`<template>` 必须、`Math.random` / `Date.now` / `repeat:-1` / `display`/`visibility` 禁、同步构 timeline）这里不重复，相信你 Read 了 SKILL.md。

1. **CSS / JS scope —— 唯一 selector 前缀是 `.<scene-id>-root`**
   - root div：`<div id="root" class="<scene-id>-root" ...>`（`id="root"` 是 runtime 挂载锚点，固定不动）
   - 所有 CSS selector：`.<scene-id>-root .foo { ... }`，**永不**写 `#root` / `#<scene-id>-root` / `:root` / 裸 `body` / 裸 `.card`
   - 所有 GSAP / DOM selector：`tl.from(".<scene-id>-root .foo", ...)` / `document.querySelector(".<scene-id>-root .foo")`，**永不** `getElementById("root")`
2. **`@font-face` 绝不复制到 scene** —— 全局 CSS 规则，Step 7 在 `index.html` `<head>` 统一声明。直接按 family 名引用即可
3. **Token / 组件来自 `design.html`，逐字粘贴**
   - 把 §2 `:root { ... }` 改写成 `.<scene-id>-root { ... }` 粘进 scene `<style>`
   - 把 §5 的 `EASE` / `DUR` const 粘进 scene `<script>` 顶部
   - 用到 §8 component → 粘 HTML+CSS，selector re-scope 到 `.<scene-id>-root`
   - 不要自己发明 palette hex / 字体名 / easing 值
4. **Track lane**：scene 内部用 `data-track-index="0"`–`"9"`；`10` / `11` 归 `index.html`（voice / BGM），**不要**在 scene 里发 `<audio>`
5. **Asset src 无前导斜杠** —— `public/hero.png`，不是 `/public/hero.png`
6. **GSAP transform alias 限白名单**：`x` / `y` / `scale` / `rotation` / `opacity`。永不 tween `width` / `height` / `top` / `left`
7. **`voicePath` 非空的 scene** —— Step 7 会在顶层挂 `<audio>` 配合这个 scene 的时长。你不发 `<audio>`，但 timing 设计要给旁白留呼吸空间

## 范围

只写 `hyperframes/compositions/<scene-id>.html`。**不要**动 `index.html` / 拷 asset / 跑 `npx hyperframes lint|validate|inspect|snapshot|render` / 增删 effect（rule 跑不通 → STOP 报告，不静默 drop）。

`effects` 列表里每个 id 都必须在 timeline 上出现一次（4-7 个 effect 一个不少）；具体 fire 时刻、驱动的 asset / 文本、所属 phase 全部由 `creative_brief` 散文（§3 effect→asset 映射 + §5 多阶段编排）指定 —— 你的工作是把 brief 翻译成 GSAP 调用，不是重新设计编排。

## 流程

1. 并行 Read 必读资源（上面 6 条）
2. 对每个 scene 写 `hyperframes/compositions/<scene-id>.html`（骨架见下）
3. 自检（`bash grep` 块见下），失败先修
4. 单行汇报

## 骨架

```html
<template id="<scene-id>-template">
  <div
    id="root"
    class="<scene-id>-root"
    data-composition-id="<scene-id>"
    data-width="1920"
    data-height="1080"
    data-duration="<estimatedDuration_s>"
    style="position:relative; width:1920px; height:1080px; overflow:hidden;"
  >
    <style>
      .<scene-id > -root,
      .<scene-id > -root *,
      .<scene-id > -root *::before,
      .<scene-id > -root *::after {
        box-sizing: border-box;
      }
      .<scene-id > -root {
        /* design.html §2/§3/§4 的 :root token，粘过来 */
        --canvas: #f6f3ec;
        /* --r-md, font-family, ... */
      }
      .<scene-id > -root .<your-class > {
        /* scene 专属，全部带前缀 */
      }
    </style>

    <!-- DOM 按 creative_brief 的 effect→asset mapping 搭，blueprint 非 composed 时优先沿用 blueprint DOM 骨架 -->

    <script>
      // design.html §5 的 EASE / DUR const，粘过来
      const EASE = { entry: "power2.out" /* ... */ };
      const DUR = { med: 0.55 /* ... */ };
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // effects 列表顺序 = 视觉层叠顺序（背景 → 主入场 → 持续 → 强调 → 过渡），不是严格时间顺序；
      // 每个 effect 在 timeline 上的 fire 时刻由 creative_brief 散文 §3 / §5 指定。
      // selector 必带 .<scene-id>-root 前缀：
      // tl.fromTo(".<scene-id>-root .s1-word", { ... }, { duration: DUR.med, ease: EASE.entry, ... });
      window.__timelines["<scene-id>"] = tl;
    </script>
  </div>
</template>
```

## 自检（每个 scene 都跑，失败先修再报）

```bash
F=hyperframes/compositions/<scene-id>.html

# 文件存在
[ -s "$F" ] || echo "FAIL: empty/missing $F"

# 必为 0 —— bug 形态
grep -nE '#root[^-]|#<scene-id>-root|getElementById\("root"\)|@font-face|transition:|animation:|Date\.now|Math\.random|fetch\(|repeat:\s*-1' "$F"

# 必 ≥ 1 —— 结构证据（前缀替换 <scene-id> 为真值）
grep -c 'class="<scene-id>-root"' "$F"
grep -c 'data-composition-id="<scene-id>"' "$F"
grep -c 'window\.__timelines\["<scene-id>"\]' "$F"

# asset 全在 hyperframes/public/
grep -oE 'public/[A-Za-z0-9._/-]+' "$F" | sort -u | while read p; do
  [ -s "hyperframes/$p" ] || echo "MISSING ASSET: $p"
done
```

任一 FAIL / MISSING / bug-形态命中 → 修了再报。Step 7 finalize 有同样的 harness，先在这里拦住，省 8-13 分钟 round-trip。

## 汇报模板

每个 scene 一行：

```
scene_2: file=compositions/scene_2.html duration=4.83s effects=[3d-page-scroll, hacker-flip-3d] blueprint=based-on:demo-page-scroll-spotlight
```

外加异常（缺 asset、rule 组合模糊、试图 drop effect）。不写 `context.log`。
