# 子代理提示词：hyperframes-scene（Step 6 worker）

**INPUT:** Dispatch 上下文里你拥有的 scene 切片（`worker_id` / `scene_ids` + 每个 scene 的 `effects` / `rule_paths` / `assetCandidates` / `estimatedDuration_s` / `voicePath` / `blueprint` / `design_chunks` / `creative_brief`）
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
6. **`design_chunks` 字段（替代旧的 `design.html` 通读）**：
   - `tokens_file` —— 绝对路径，必读，~1 KB。整段 `:root { ... }` 改写为 `[data-composition-id="<scene-id>"] { ... }` 粘进 scene `<style>`
   - `easings_file` —— 绝对路径，必读，~0.5 KB。整段 `const EASE = { ... }; const DUR = { ... }` 粘进 scene `<script>` 顶部
   - `voice_file` —— 绝对路径，必读，~0.5 KB。DOM 里**所有可见文字**（headline / chip / button / stat label）按这份 register 写：照 recipe（strip articles、UPPERCASE、句号断行等）改写 creative_brief 里出现的英文短句。**不要**改 `<audio>` 关联的 narrator script（Phase 2 已把它定型给 TTS，大写会毁掉语音节奏）
   - `components[]` —— 0-N 个绝对路径（Phase 3 给本 scene 挑选的 design-system 组件 HTML 片段）。**全部 Read**（每份 0.3-1.5 KB），按 §3 token + §5 effect→asset 映射在 DOM 中粘贴并把所有 class 加 `s<N>-` 前缀避免 sibling 串扰
   - **不要读** `./design-system/design.html` —— 已被 chunks 取代；如果 `design_chunks` 为 null（chunks 缺失），回退去读 `./design-system/design.html` 并自报一个 anomaly

**不要加载**：`hyperframes-cli` / `hyperframes-creative` / `hyperframes-registry`（不在你的范围）。**不要读** `section_plan.md`（dispatch 已经嵌了对应 scene 的 `creative_brief`）。**不要打开** rule_paths / design_chunks 之外的 rule / 其他 component 文件 / sibling worker 的 scene 文件。

## Blueprint 字段

| 取值            | 行为                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| `composed`      | 无 blueprint 引用，按 `effects` 列表自由组合                                          |
| `based-on <id>` | 照搬 blueprint 骨架（DOM 结构、phase 切分、timing 节奏），把 `effects` 嵌入对应 phase |
| `extended <id>` | 同上，允许末尾追加 1-2 个 phase 或替换其中一个 phase                                  |

blueprint 是软引用：文件缺失/不适用 → 回退为 `composed`。但绝不忽略 —— 必须先读再决定。

## v2 特有约束（hyperframes-core 没单独讲的）

这些约束 worker 必须照搬执行；hyperframes-core 已经覆盖的（`<template>` 必须、`Math.random` / `Date.now` / `repeat:-1` / `display`/`visibility` 禁、同步构 timeline）这里不重复，相信你 Read 了 SKILL.md。

1. **CSS / JS selector —— 命名空间靠 class 前缀，selector 本身永远不带 root 祖先**
   - 历史 bug：producer 渲染管线会**剥掉** sub-comp 最外层那个 `<div class="<scene-id>-root">` wrapper（只有 preview / snapshot 保留它）。任何写成 `.<scene-id>-root .foo` / `.<scene-id>-root #foo` 的 selector，渲染时祖先消失 → 全部失配 → scene 渲成黑屏或裸 DOM。preview 看着完美，`render` 出来全坏。
   - 正确写法：所有 class / id 用 **`s<N>-` 前缀**做命名空间（scene_1 用 `s1-foo`，scene_2 用 `s2-foo`…），selector 写**裸的** `.s1-foo` / `#s1-foo`，**不挂任何祖先**。runtime 会在每个 scene 的 host 上挂 `[data-composition-id="<scene-id>"]`，CSS scoper 自动把裸选择器编译成 `[data-composition-id="<scene-id>"] .s1-foo`，scene 之间天然不串扰。
   - root 元素的样式（`background`、CSS 变量、`font-family` 等）写成 `[data-composition-id="<scene-id>"] { ... }`（CSS scoper 看到已经匹配自己就不再重复加 scope），不要再写 `.<scene-id>-root { ... }`。
   - 同理 **永不** 写 `#root` / `#<scene-id>-root` / `:root` / 裸 `body` / 裸 `.card`（未带前缀的通用 class）/ `getElementById("root")`。
   - JS 也一样：`document.querySelector(".s1-foo")` / `document.getElementById("s1-foo")` / `tl.from(".s1-foo", ...)`。runtime 的 scoped-document proxy 会自动把这些 query 限定在当前 scene 的 host 子树。
   - root div 仍然写 `<div id="root" class="<scene-id>-root" ...>`（`id="root"` 是 runtime 挂载锚点；class 留着方便 preview/dev 时看），**只是没有任何 CSS / JS 依赖这个 class**。
2. **`@font-face` 绝不复制到 scene** —— 全局 CSS 规则，Step 7 在 `index.html` `<head>` 统一声明。直接按 family 名引用即可
3. **Token / 组件来自 `design_chunks`，逐字粘贴**
   - `tokens_file`（`chunks/tokens.css`）的整段 `:root { ... }` 改写成 `[data-composition-id="<scene-id>"] { ... }` 粘进 scene `<style>`（host 元素 ≡ scope ancestor，CSS 变量挂在它上面 scene 内部所有节点都能继承）
   - `easings_file`（`chunks/easings.js`）的 `EASE` / `DUR` const 整段粘进 scene `<script>` 顶部
   - `components[]` 里每份 HTML 片段：粘 DOM + 内嵌 `<style>`，把所有 class 重命名加 `s<N>-` 前缀（避免 sibling scene 同名 class 串扰），selector **不要**挂任何祖先；component 的 CSS 变量引用（`var(--brand-primary)` 等）自然解析到 host 上的 `:root` token
   - **不要去 grep `design.html`** —— chunks 已经把可粘的内容切碎并装好；不需要的 component 不在 `design_chunks.components` 里，强行去找 = 浪费 token
   - 不要自己发明 palette hex / 字体名 / easing 值
4. **Track lane**：scene 内部用 `data-track-index="0"`–`"9"`；`10` / `11` 归 `index.html`（voice / BGM），**不要**在 scene 里发 `<audio>`
5. **Asset src 无前导斜杠** —— `public/hero.png`，不是 `/public/hero.png`
6. **GSAP transform alias 限白名单**：`x` / `y` / `scale` / `rotation` / `opacity`。永不 tween `width` / `height` / `top` / `left`
7. **`voicePath` 非空的 scene** —— Step 7 会在顶层挂 `<audio>` 配合这个 scene 的时长。你不发 `<audio>`，但 timing 设计要给旁白留呼吸空间
8. **注释 / 字符串字面量里不要出现字面 HTML 开标签**
   - 禁止：`<!-- ... <template> ... -->`、`<!-- ... <style> ... -->`、`<!-- ... <script> ... -->`
   - 原因：linter / parser 几乎都用正则做粗扫，会把注释里的标签当成真的，下游 `npx hyperframes lint` 会误报结构错，浪费 1-2 分钟 debug
   - 替代写法：把尖括号转义成 `&lt;template&gt;`，或者写成 "template tag" 的纯文本描述

## 范围

只写 `hyperframes/compositions/<scene-id>.html`。**不要**动 `index.html` / 拷 asset / 跑 `npx hyperframes lint|validate|inspect|snapshot|render` / 增删 effect（rule 跑不通 → STOP 报告，不静默 drop）。

`effects` 列表里每个 id 都必须在 timeline 上出现一次（4-7 个 effect 一个不少）；具体 fire 时刻、驱动的 asset / 文本、所属 phase 全部由 `creative_brief` 散文（§3 effect→asset 映射 + §5 多阶段编排）指定 —— 你的工作是把 brief 翻译成 GSAP 调用，不是重新设计编排。

## 流程

1. 并行 Read 必读资源（上面 6 条）
2. 对每个 scene 写 `hyperframes/compositions/<scene-id>.html`（骨架见下）
3. 自检（`bash grep` 块见下），失败先修
4. 单行汇报

## 骨架

下面用 `scene_1` 举例（其他 scene 把 `scene_1` / `s1-` 换成自己的编号即可）：

```html
<template id="scene_1-template">
  <div
    id="root"
    class="scene_1-root"
    data-composition-id="scene_1"
    data-width="1920"
    data-height="1080"
    data-duration="<estimatedDuration_s>"
    style="position:relative; width:1920px; height:1080px; overflow:hidden;"
  >
    <style>
      /* root 元素自身的样式（CSS 变量 / 背景 / 字体）—— 挂在 host 的 data-composition-id 上，
         不要写 .scene_1-root，因为渲染时这层 wrapper 会被剥掉。 */
      [data-composition-id="scene_1"] {
        /* design.html §2/§3/§4 的 :root token，粘过来 */
        --canvas: #f6f3ec;
        background: var(--canvas);
        font-family: "Inter", system-ui, sans-serif;
        /* --r-md, ... */
      }
      [data-composition-id="scene_1"] *,
      [data-composition-id="scene_1"] *::before,
      [data-composition-id="scene_1"] *::after {
        box-sizing: border-box;
      }

      /* scene 专属规则 —— 全部裸 class，CSS scoper 会自动加 scope。
         class 名带 s1- 前缀，让 sibling scene 不冲突。 */
      .s1-grid {
        /* ... */
      }
      .s1-word {
        /* ... */
      }
    </style>

    <!-- DOM 按 creative_brief 的 effect→asset mapping 搭，blueprint 非 composed 时优先沿用 blueprint DOM 骨架。
         所有 class 都用 s1- 前缀；id 也用 s1- 前缀（例：id="s1-headline"）。 -->

    <script>
      // design.html §5 的 EASE / DUR const，粘过来
      const EASE = { entry: "power2.out" /* ... */ };
      const DUR = { med: 0.55 /* ... */ };
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // effects 列表顺序 = 视觉层叠顺序（背景 → 主入场 → 持续 → 强调 → 过渡），不是严格时间顺序；
      // 每个 effect 在 timeline 上的 fire 时刻由 creative_brief 散文 §3 / §5 指定。
      // selector 都写裸的 .s1-foo / #s1-foo，不挂祖先。runtime 的 scoped-document
      // proxy 会自动把 query 限定在当前 scene 的 host 子树。
      const headlineEl = document.querySelector("#s1-headline");
      tl.fromTo(
        ".s1-word",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: DUR.med, ease: EASE.entry },
        0,
      );
      window.__timelines["scene_1"] = tl;
    </script>
  </div>
</template>
```

## 自检（每个 scene 都跑，失败先修再报）

把下面 `<scene-id>` 和 `<N>` 替换成真值（如 `scene_1` / `1`）后跑：

```bash
F=hyperframes/compositions/<scene-id>.html
SID=<scene-id>; N=<N>

# 文件存在
[ -s "$F" ] || echo "FAIL: empty/missing $F"

# Root 5 属性一次写齐（最常见漏写：data-duration / id="root"）—— 任一缺失就让 finalize 兜底，浪费 round-trip
for ATTR in 'id="root"' "class=\"${SID}-root\"" "data-composition-id=\"${SID}\"" 'data-width="1920"' 'data-height="1080"' 'data-duration="'; do
  grep -q "$ATTR" "$F" || echo "FAIL: root 缺 $ATTR — 5 个属性必须一次写齐"
done

# 注释里禁止字面 HTML 开标签（lint 用正则扫，会把注释里的 <template>/<style>/<script> 当真标签 → 误报 1-2 分钟 debug）
grep -nE '<!--[^>]*<(template|style|script)[> ][^>]*-->' "$F" && \
  echo "FAIL: 注释里有字面 <template>/<style>/<script> — 转义成 &lt;…&gt; 或改成纯文本"

# 必为 0 —— bug 形态
# 1) `.<scene-id>-root` 当祖先选择器（producer 渲染时这层 wrapper 会被剥掉，selector 全部失配 → scene 渲成黑屏）
grep -nE "\\.${SID}-root[[:space:]]" "$F" && echo "FAIL: 不要用 .${SID}-root 作祖先 selector — 写裸的 .s${N}-foo 即可"
# 2) #root / 没前缀的 #foo 容易和 sibling scene 串扰；selector 必须是 #s<N>-foo
grep -nE '#root[^-]|getElementById\("root"\)' "$F" && echo "FAIL: 不要用 #root"
# 3) 老规矩：composition contract 禁的非确定性 / CSS animation / @font-face
grep -nE '@font-face|transition:|animation:|Date\.now|Math\.random|performance\.now|fetch\(|repeat:\s*-1' "$F"

# 必 ≥ 1 —— 结构证据
grep -c "class=\"${SID}-root\"" "$F"                                   # root div 仍带 class，方便 dev 时看
grep -c "data-composition-id=\"${SID}\"" "$F"                          # host 契约
grep -c "\\[data-composition-id=\"${SID}\"\\]" "$F"                    # root 自身样式（CSS 变量、bg、font）挂在 host
grep -c "window\\.__timelines\\[\"${SID}\"\\]" "$F"                    # timeline 注册

# scene 专属 class / id 必须带 s<N>- 前缀（粗匹配：至少出现过一次 .s<N>- 或 #s<N>-）
grep -cE "[.#]s${N}-[a-z]" "$F"

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
