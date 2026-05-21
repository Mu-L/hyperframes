---
id: problem-mockup-overwhelm
role: problem
duration_seconds: [4, 6]
phases: 4
visual_arc: mockups-appear → icons-scatter → morph-to-avatar → bubbles-overwhelm
uses_rules: [card-morph-anchor, sine-wave-loop, svg-icon-enrichment]
element_roles:
  mockups: 3 product / platform mockups establishing the familiar context
  icons: Platform / social icons scattered around mockups for density
  morph_container: Center mockup that scales down + crossfades into the avatar
  avatar: Character that represents the viewer / user
  bubbles: Task / problem text bubbles surrounding the avatar
when_to_use:
  - Frame a problem by showing familiar complexity (too many platforms / tasks)
  - Transition from "tools" to "person" — products → user experience
  - Problem should feel physically overwhelming (surrounded by tasks)
when_not_to_use:
  - Problem is abstract, can't be shown with mockups
  - No character / avatar representation needed
  - Scene should stay product-focused
triggers: [too many platforms, overwhelmed creator, complex workflow, surrounded by tasks]
---

# Problem · Mockup Overwhelm (HyperFrames)

Product mockups appear → platform icons scatter → center mockup scales down and crossfades into the avatar → task bubbles surround and overwhelm.

<!--
  Choreography (4 phases) — phase windows expressed against the blueprint's
  named constants. The example assigns concrete seconds.
    MOCKUPS_APPEAR → +mockup entries settled
        Three workflow mockups spring-in (center → left → right)
    ICONS_APPEAR → +icon entries settled
        Scattered tool icons stagger in around the cluster
    MORPH_TRIGGER → +MORPH_DUR
        MORPH:
          center mockup compositor-scale down to the avatar footprint
          borderRadius repaint (card-corner → 50% = reads as circle)
          content fades out during first CONTENT_FADE_FRAC of morph
          non-center mockups + icons exit concurrently (EXIT_DUR_FRAC of morph)
          avatar pop (scale 0 → 1) starts at MORPH_TRIGGER
          avatar layer opacity fades in at AVATAR_LAYER_IN_FRAC of morph
          during the HANDOFF_TAIL_FRAC tail, mockup-center fades to 0 → avatar revealed underneath
    BUBBLES_START → +bubble entries settled
        Task bubbles stagger-enter in a radial pattern around the avatar
    bubble-entry-end → composition end
        Idle: bubble micro-float + avatar orbit dots + avatar breath
-->

The visual arc is identical; the implementation runs on a single paused GSAP timeline driven by HyperFrames' seek loop. Because HyperFrames forbids tweening `width` / `height` (they cause layout reflows), the center mockup's "shape morph" is rendered as **uniform `scale` + `borderRadius` repaint + opacity hand-off to the real avatar underneath** — visually indistinguishable from a width/height interpolation, but allowlist-clean.

## When to Use

- Problem-framing scene showing "too many tools / too complex"
- Need narrative shift from product view to user view
- The reveal of "overwhelm" should build progressively

## Phase Pipeline

All phase boundaries are expressed in **seconds**, not frames. HyperFrames operates on continuous time; GSAP tween `duration` and `start` carry the choreography.

| Phase | Time window (s)                | What Happens                                                                       | Skill Reference                                             |
| ----- | ------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1     | `0 – ICONS_APPEAR`             | 3 stacked mockups spring-in with subtle floating                                   | inline entry + [sine-wave-loop](../rules/sine-wave-loop.md) |
| 2     | `ICONS_APPEAR – MORPH_TRIGGER` | Platform icons pop in around mockups (staggered)                                   | [svg-icon-enrichment](../rules/svg-icon-enrichment.md)      |
| 3     | `MORPH_TRIGGER – +MORPH_DUR`   | Center mockup scales down + borderRadius rounds + fades; avatar reveals underneath | [card-morph-anchor](../rules/card-morph-anchor.md)          |
| 4     | `BUBBLES_START – end`          | Task bubbles enter in radial pattern around avatar                                 | inline staggered entry                                      |

## Layout

In the source, the source uses `{showMockups && <MockupCluster />}` / `{showAvatar && <AvatarWithBubbles />}` for conditional rendering. **HyperFrames must keep both layers in the DOM** (seek can move time backward or forward arbitrarily); opacity tweens drive visibility instead.

```html
<div
  id="root"
  data-composition-id="main"
  data-start="0"
  data-duration="6"
  data-width="1920"
  data-height="1080"
  style="position: relative; width: 1920px; height: 1080px; overflow: hidden;"
>
  <!-- Background -->
  <div class="bg" style="position: absolute; inset: 0;"><!-- gradient / blobs --></div>

  <!-- Phase 1-2: Mockup cluster + scattered icons (visible 0 → MORPH_TRIGGER + 0.4s) -->
  <div class="mockup-cluster" style="position: absolute; inset: 0;">
    <div class="mockup-left" style="position: absolute; left: 12%;  top: 50%; z-index: 10;">
      <!-- {mockupLabel1} content -->
    </div>
    <div class="mockup-right" style="position: absolute; right: 12%; top: 45%; z-index: 12;">
      <!-- {mockupLabel2} content -->
    </div>
    <div
      class="mockup-center"
      style="position: absolute; left: 50%; top: 50%; z-index: 25;
                                       width: {MOCKUP_W}px; height: {MOCKUP_H}px; border-radius: {MOCKUP_RADIUS}px;
                                       overflow: hidden;"
    >
      <div class="mockup-center-content">
        <!-- {mockupLabelCenter} content (the morph subject) -->
      </div>
    </div>

    <!-- Platform icons (positions pre-baked via CSS variables or inline left/top) -->
    <div class="platform-icon" style="position: absolute; left: 22%; top: 20%; z-index: 30;">
      <img src="{platformIcon}" />
    </div>
    <!-- ...more .platform-icon elements... -->
  </div>

  <!-- Phase 3-4: Avatar + bubbles (rendered from start, opacity: 0 until morph hands off) -->
  <div class="avatar-with-bubbles" style="position: absolute; inset: 0; opacity: 0;">
    <div
      class="avatar"
      style="position: absolute; left: 50%; top: 50%; z-index: 20;
                                width: 220px; height: 220px; border-radius: 50%;
                                overflow: hidden;"
    >
      <video
        src="{avatarAsset}"
        muted
        playsinline
        style="width: 100%; height: 100%; object-fit: cover;"
      ></video>
    </div>
    <!-- task bubbles are appended by the setup script (see below) -->
  </div>

  <!-- Vignette overlay -->
  <div class="vignette" style="position: absolute; inset: 0; pointer-events: none;"></div>
</div>
```

The morph container (`.mockup-center`) sits **above** the avatar (`z-index: 25 > z-index: 20`). The avatar becomes visible the moment `.mockup-center` opacity reaches 0.

## Mockup Cluster Initial State

Three mockups: center (largest, highest z-index, intrinsic size matches `MOCKUP_W × MOCKUP_H`), left and right (smaller, slightly rotated, lower z-index). Static `rotation` and `scale` go through GSAP `set()` rather than CSS `transform:`, because GSAP owns the transform once it touches the element.

```js
// Composition constants — assign in your example only. See "How to Choose Values".
const COMP_W; // px — composition width (matches data-width)
const COMP_H; // px — composition height (matches data-height)

const MOCKUP_W; // px — center mockup intrinsic width
const MOCKUP_H; // px — center mockup intrinsic height
const AVATAR_SIZE; // px — final avatar diameter
const MORPH_END_SCALE = AVATAR_SIZE / MOCKUP_W; // derived — uniform scale at morph end

const MOCKUP_REST_SCALE; // 0..1 — non-center mockup base scale
const ENTRY_TILT; // deg — small static rotation on side mockups

// Initial states (set once at script load — GSAP owns the transform from now on)
gsap.set(".mockup-left", {
  xPercent: 0,
  yPercent: -50,
  rotation: -ENTRY_TILT,
  scale: MOCKUP_REST_SCALE,
  opacity: 0,
});
gsap.set(".mockup-right", {
  xPercent: 0,
  yPercent: -50,
  rotation: ENTRY_TILT,
  scale: MOCKUP_REST_SCALE,
  opacity: 0,
});
gsap.set(".mockup-center", { xPercent: -50, yPercent: -50, scale: 1, opacity: 0 });
gsap.set(".platform-icon", { scale: 0, opacity: 0 });
```

## Phase 1: Mockups Appear

Three near-simultaneous spring-in entries with small inter-element delays. The "subtle floating" component is a finite `sine.inOut` yoyo (see [sine-wave-loop](../rules/sine-wave-loop.md)) — **not** a frame-driven `Math.sin(frame * ...)` like in

```js
const MOCKUPS_APPEAR; // s — phase 1 anchor
const MOCKUP_ENTRY_DUR; // s — single mockup spring-in
const MOCKUP_ENTRY_STAGGER; // s — gap between left / right / center entries
const ENTRY_BOUNCE; // ease coefficient for back.out
// spring(stiffness:70, damping:14) → back.out(${ENTRY_BOUNCE}) is close enough for sub-second tweens.

tl.to(
  ".mockup-left",
  {
    opacity: 1,
    scale: MOCKUP_REST_SCALE,
    duration: MOCKUP_ENTRY_DUR,
    ease: `back.out(${ENTRY_BOUNCE})`,
  },
  MOCKUPS_APPEAR,
);
tl.to(
  ".mockup-right",
  {
    opacity: 1,
    scale: MOCKUP_REST_SCALE,
    duration: MOCKUP_ENTRY_DUR,
    ease: `back.out(${ENTRY_BOUNCE})`,
  },
  MOCKUPS_APPEAR + MOCKUP_ENTRY_STAGGER,
);
tl.to(
  ".mockup-center",
  { opacity: 1, scale: 1, duration: MOCKUP_ENTRY_DUR, ease: `back.out(${ENTRY_BOUNCE})` },
  MOCKUPS_APPEAR + 2 * MOCKUP_ENTRY_STAGGER,
);
```

Floating idle (Phase 1 → all phases): see the [sine-wave-loop](../rules/sine-wave-loop.md) rule. Keep translation amplitude small (single-digit px) and scale amplitude sub-2%, otherwise the float reads as a glitch.

## Phase 2: Icons Scatter

Platform icons enter staggered. Each icon's `left`/`top` is **pre-baked into CSS** (deterministic positions); GSAP tweens only `scale` and `opacity`. This is critical: HyperFrames forbids tweening `left` / `top`.

```js
const ICONS_APPEAR; // s — phase 2 anchor; ≥ last mockup entry + small settle
const ICON_ENTRY_DUR; // s — per-icon spring-in
const ICON_STAGGER; // s — gap between successive icon entries
const ICON_BOUNCE; // ease coefficient — slightly snappier than ENTRY_BOUNCE

// stagger across all icons; spring(stiffness:180, damping:14) → back.out(${ICON_BOUNCE})
tl.to(
  ".platform-icon",
  {
    scale: 1,
    opacity: 1,
    duration: ICON_ENTRY_DUR,
    ease: `back.out(${ICON_BOUNCE})`,
    stagger: { each: ICON_STAGGER, from: "start" },
  },
  ICONS_APPEAR,
);
```

Per-icon subtle float (small x/y amplitude) is a finite `sine.inOut` yoyo on each icon, started shortly after `ICONS_APPEAR` once the entry settles. For more than a handful of icons, consolidate the float into a single `onUpdate` (see [svg-icon-enrichment § shared scene-ticker](../rules/svg-icon-enrichment.md#shared-scene-ticker-for-multiple-sine-motions)).

## Phase 3: Morph (Core Glue)

The morph in the source asset tweens `width`, `height`, and `borderRadius` in lockstep. HyperFrames cannot tween `width` / `height` — they trigger layout reflows and are blocked by the allowlist.

**HyperFrames substitution**: tween `scale` (uniform, intrinsic dimensions stay fixed) + `borderRadius` (paint-only, allowed). The content fades during the first slice of the morph, and near the end the entire morph container fades to 0, revealing the real avatar circle rendered underneath. The viewer reads this exactly as "rect morphs to circle" — the hand-off is the trick. See [card-morph-anchor](../rules/card-morph-anchor.md) for the atomic rule.

```js
const MORPH_TRIGGER; // s — phase 3 anchor
const MORPH_DUR; // s — full morph length
const CONTENT_FADE_FRAC; // 0..0.5 — fraction of MORPH_DUR for content fade-out
const HANDOFF_TAIL_FRAC; // 0..0.3 — fraction of MORPH_DUR for final container fade
const EXITING_MOCKUP_SCALE; // <1 — scale that non-center mockups shrink to on exit
const EXITING_ICON_SCALE; // <1 — scale that icons shrink to on exit
const EXIT_DUR_FRAC; // 0..1 — fraction of MORPH_DUR for concurrent exits
const ICON_EXIT_STAGGER; // s — tight stagger for edge-out icon exits
const AVATAR_LAYER_IN_FRAC; // 0..1 — when avatar layer opacity starts (× MORPH_DUR)
const AVATAR_LAYER_IN_DUR; // s — avatar layer fade-in length
const AVATAR_POP_DUR; // s — avatar scale-in spring length
const AVATAR_BOUNCE; // ease coefficient for avatar pop
// spring(stiffness:80, damping:18) ≈ power3.out (morph driver)
// spring(stiffness:120, damping:14) → back.out(${AVATAR_BOUNCE}) (avatar pop)

// 1. Center mockup uniform scale-down toward avatar footprint.
//    MORPH_END_SCALE = AVATAR_SIZE / MOCKUP_W — close enough to the avatar target
//    after the final fade-out finishes (the avatar at scale 1 takes over the visual).
tl.to(
  ".mockup-center",
  {
    scale: MORPH_END_SCALE,
    duration: MORPH_DUR,
    ease: "power3.out",
  },
  MORPH_TRIGGER,
);

// 2. borderRadius repaints to half-of-post-scale-size in parallel.
//    Final value reads as a circle even before the fade.
tl.to(
  ".mockup-center",
  {
    borderRadius: (MOCKUP_W * MORPH_END_SCALE) / 2 + "px",
    duration: MORPH_DUR,
    ease: "power3.out",
  },
  MORPH_TRIGGER,
);

// 3. Content fades out during the first CONTENT_FADE_FRAC of the morph —
//    hides the rectangular layout before its aspect-ratio mismatch shows.
tl.to(
  ".mockup-center-content",
  {
    opacity: 0,
    duration: MORPH_DUR * CONTENT_FADE_FRAC,
    ease: "power2.out",
  },
  MORPH_TRIGGER,
);

// 4. Final HANDOFF_TAIL_FRAC: morph container fades out → avatar takes over.
tl.to(
  ".mockup-center",
  {
    opacity: 0,
    duration: MORPH_DUR * HANDOFF_TAIL_FRAC,
    ease: "none",
  },
  MORPH_TRIGGER + MORPH_DUR * (1 - HANDOFF_TAIL_FRAC),
);

// 5. Concurrent exits — non-center mockups + icons must exit DURING the morph,
//    not before (would feel premature) or after (would feel detached).
tl.to(
  [".mockup-left", ".mockup-right"],
  {
    opacity: 0,
    scale: EXITING_MOCKUP_SCALE,
    duration: MORPH_DUR * EXIT_DUR_FRAC,
    ease: "power2.out",
  },
  MORPH_TRIGGER,
);

tl.to(
  ".platform-icon",
  {
    opacity: 0,
    scale: EXITING_ICON_SCALE,
    duration: MORPH_DUR * EXIT_DUR_FRAC,
    ease: "power2.out",
    stagger: { each: ICON_EXIT_STAGGER, from: "edges" },
  },
  MORPH_TRIGGER,
);

// 6. Avatar layer fades in concurrently. Avatar entry pop (scale 0 → 1) starts at
//    MORPH_TRIGGER so it's already at full scale by the time the morph container
//    fades to 0 at the handoff tail.
tl.to(
  ".avatar-with-bubbles",
  {
    opacity: 1,
    duration: AVATAR_LAYER_IN_DUR,
    ease: "power2.out",
  },
  MORPH_TRIGGER + MORPH_DUR * AVATAR_LAYER_IN_FRAC,
);

tl.fromTo(
  ".avatar",
  { scale: 0 },
  { scale: 1, duration: AVATAR_POP_DUR, ease: `back.out(${AVATAR_BOUNCE})` },
  MORPH_TRIGGER,
);
```

Why this works visually: at the moment the morph container reaches `opacity: 0`, both objects (morph + avatar) occupy the same screen footprint at the same center coordinates. The viewer's eye doesn't register a swap — it registers a continuous morph. See [card-morph-anchor](../rules/card-morph-anchor.md) for the standalone rule on this hand-off pattern.

## Phase 4: Overwhelm Bubbles

Task bubbles enter in radial positions around the avatar. In the the source source, JSX iterates over `POSITIONS` and renders `<TaskBubble />` components. In HyperFrames, the DOM is **generated once at script load** (deterministic, position-pre-baked), then GSAP tweens scale + opacity for staggered entry.

```js
// Bubble positions — pre-baked, deterministic. The SEQUENCE here is a radial
// arrangement of 6-8 short task labels around the avatar; pick angles so they
// surround the center (top, NE, E, SE, S, SW, W, NW) for visual closure.
const BUBBLE_TASKS = [
  { label: "{task1}", angle: 270 }, // top
  { label: "{task2}", angle: 315 }, // top-right
  { label: "{task3}", angle: 0 }, // right
  { label: "{task4}", angle: 45 }, // bottom-right
  { label: "{task5}", angle: 90 }, // bottom
  { label: "{task6}", angle: 135 }, // bottom-left
  { label: "{task7}", angle: 180 }, // left
  { label: "{task8}", angle: 225 }, // top-left
];

const BUBBLE_CENTER_X = COMP_W / 2;
const BUBBLE_CENTER_Y = COMP_H / 2;
const BUBBLE_RADIUS; // px — distance from avatar center to bubble center

const BUBBLES_START_FRAC; // 0..1 — when bubbles begin entering, as fraction of MORPH_DUR past MORPH_TRIGGER
const BUBBLE_DUR; // s — per-bubble spring-in
const BUBBLE_STAGGER; // s — gap between successive bubble entries
const BUBBLE_BOUNCE; // ease coefficient
const BUBBLE_FINAL_OPACITY; // 0.85-1.0 — settled opacity
const BUBBLE_RADIUS_CSS; // px — bubble corner radius
const BUBBLE_BORDER_PX; // px — bubble border thickness
const BUBBLE_PAD_Y; // px — vertical padding
const BUBBLE_PAD_X; // px — horizontal padding
const BUBBLE_FONT_PX; // px — label size

const stage = document.querySelector(".avatar-with-bubbles");
BUBBLE_TASKS.forEach((task, i) => {
  const rad = (task.angle * Math.PI) / 180;
  const x = BUBBLE_CENTER_X + Math.cos(rad) * BUBBLE_RADIUS;
  const y = BUBBLE_CENTER_Y + Math.sin(rad) * BUBBLE_RADIUS;

  const el = document.createElement("div");
  el.className = "task-bubble";
  el.textContent = task.label;
  el.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    z-index: 30;
    /* visual styling — high contrast against dark scene */
    background: {bubbleSurface};
    border: ${BUBBLE_BORDER_PX}px solid {bubbleBorder};
    border-radius: ${BUBBLE_RADIUS_CSS}px;
    padding: ${BUBBLE_PAD_Y}px ${BUBBLE_PAD_X}px;
    box-shadow: 0 12px 35px {bubbleShadowColor};
    font: 600 ${BUBBLE_FONT_PX}px/1.4 {font};
    color: {bubbleTextColor};
    white-space: nowrap;
  `;
  stage.appendChild(el);

  // GSAP-owned centering + initial hidden state.
  gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
});

// Staggered entry. spring(stiffness:180, damping:12) → back.out(${BUBBLE_BOUNCE}).
const BUBBLES_START = MORPH_TRIGGER + MORPH_DUR * BUBBLES_START_FRAC;

tl.to(
  ".task-bubble",
  {
    scale: 1,
    opacity: BUBBLE_FINAL_OPACITY,
    duration: BUBBLE_DUR,
    ease: `back.out(${BUBBLE_BOUNCE})`,
    stagger: { each: BUBBLE_STAGGER, from: "start" },
  },
  BUBBLES_START,
);
```

Bubble micro-motion (small x/y floating amplitude) is a finite `sine.inOut` yoyo per bubble, started shortly after the bubble entry settles. For 6-8 bubbles, prefer the shared `onUpdate` form in [svg-icon-enrichment](../rules/svg-icon-enrichment.md#shared-scene-ticker-for-multiple-sine-motions) — many independent yoyo tweens are wasteful.

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Mockups settled before icons appear.
  ICONS_APPEAR ≥ (MOCKUPS_APPEAR + 2 * MOCKUP_ENTRY_STAGGER) + MOCKUP_SETTLE
  where MOCKUP_SETTLE is the brief gap that lets the last spring-in resolve
  before the icons distract from it.

Phase 2 → Phase 3:
  Icons must be visible long enough for the viewer to register platform density
  before it dissolves.
  MORPH_TRIGGER ≥ ICONS_APPEAR
                + ICON_ENTRY_DUR
                + (numIcons - 1) * ICON_STAGGER
                + ICON_READ_TIME       // dwell so density registers

Phase 3 → Phase 4:
  Avatar layer opacity begins at MORPH_TRIGGER + AVATAR_LAYER_IN_FRAC * MORPH_DUR.
  Avatar pop (scale 0→1) starts at MORPH_TRIGGER and must be fully scaled-up
  before the morph container fades to 0 (at MORPH_TRIGGER + (1 - HANDOFF_TAIL_FRAC) * MORPH_DUR).
  Constraint: AVATAR_POP_DUR < (1 - HANDOFF_TAIL_FRAC) * MORPH_DUR.

  BUBBLES_START ≥ MORPH_TRIGGER + BUBBLES_START_FRAC * MORPH_DUR
  Constraint: BUBBLES_START_FRAC > AVATAR_LAYER_IN_FRAC so the avatar layer is
  already revealing when bubbles begin entering.
```

## How to Choose Values

Composition layout

- **COMP_W / COMP_H** — composition canvas size
  - Range: must equal `data-width` / `data-height` on the root
  - Reference: examples/problem-mockup-overwhelm.html uses 1920 × 1080
- **MOCKUP_W / MOCKUP_H** — center mockup intrinsic dimensions (CSS-fixed)
  - Range: aspect ratio ≈ phone (9:16) or card (3:5); 250-360 px wide
  - Constraints: `AVATAR_SIZE / MOCKUP_W` must yield a `MORPH_END_SCALE` in 0.3-0.8 (uniform scale ratio reads as "shrinks to circle")
- **AVATAR_SIZE** — final avatar diameter
  - Range: 180-280 px
  - Constraints: must match the actual `.avatar` element's CSS dimensions exactly, otherwise the morph-to-avatar handoff pops
- **MOCKUP_REST_SCALE** — base scale for side mockups (slightly smaller than center)
  - Range: 0.86-0.95
  - Effects: low end exaggerates depth; high end reduces hierarchy
- **ENTRY_TILT** — static rotation on side mockups
  - Range: 0-3 deg
  - Effects: > 3 deg starts reading as a fan-out card stack instead of a tight cluster

Phase timing anchors

- **MOCKUPS_APPEAR** — phase 1 anchor
  - Range: 0-0.2 s (usually 0)
- **MOCKUP_ENTRY_DUR** — single mockup spring-in length
  - Range: 0.45-0.7 s
- **MOCKUP_ENTRY_STAGGER** — gap between successive mockup entries
  - Range: 0.08-0.2 s
- **ICONS_APPEAR** — phase 2 anchor
  - Range: depends; see Inter-Phase State Handoff constraint
- **ICON_ENTRY_DUR** — per-icon spring-in
  - Range: 0.35-0.55 s
- **ICON_STAGGER** — gap between icon entries
  - Range: 0.05-0.09 s (tighter than mockup stagger so the cluster reads as one event)
- **MORPH_TRIGGER** — phase 3 anchor
  - Range: depends; see Inter-Phase State Handoff
  - Constraints: must leave > 1 s post-morph for bubble entries + dwell
- **MORPH_DUR** — full morph length
  - Range: 0.5-0.9 s
  - Effects: < 0.5s reads as a snap; > 0.9s loses momentum
- **BUBBLES_START_FRAC** — fraction of MORPH_DUR after MORPH_TRIGGER when bubbles begin
  - Range: 0.5-0.7
  - Constraints: must be > AVATAR_LAYER_IN_FRAC

Morph internals

- **CONTENT_FADE_FRAC** — fraction of MORPH_DUR for content fade-out
  - Range: 0.3-0.5
  - Effects: low end leaves rectangular content visible too long; high end fades before the morph shape change registers
- **HANDOFF_TAIL_FRAC** — fraction of MORPH_DUR for final container fade
  - Range: 0.1-0.2
  - Constraints: AVATAR_POP_DUR < (1 - HANDOFF_TAIL_FRAC) \* MORPH_DUR
- **EXIT_DUR_FRAC** — fraction of MORPH_DUR for non-center mockup / icon exits
  - Range: 0.4-0.6
  - Effects: shorter feels premature; longer overlaps with avatar reveal
- **EXITING_MOCKUP_SCALE / EXITING_ICON_SCALE** — shrink target on exit
  - Range: 0.8-0.9
  - Effects: < 0.8 reads as crushed; ≥ 1.0 wastes the cue
- **ICON_EXIT_STAGGER** — gap between successive icon exits (edges-first)
  - Range: 0.01-0.04 s — tight, so they read as a single coordinated dissolve

Avatar

- **AVATAR_LAYER_IN_FRAC** — fraction of MORPH_DUR after MORPH_TRIGGER when avatar layer opacity starts
  - Range: 0.4-0.6
- **AVATAR_LAYER_IN_DUR** — avatar layer fade-in length
  - Range: 0.2-0.4 s
- **AVATAR_POP_DUR** — avatar scale-in spring length
  - Range: 0.45-0.7 s
  - Constraints: AVATAR_POP_DUR + MORPH_TRIGGER ≤ MORPH_TRIGGER + (1 - HANDOFF_TAIL_FRAC) \* MORPH_DUR

Bubbles

- **BUBBLE_RADIUS** — distance from avatar center to each bubble center
  - Range: depends on avatar + bubble size; keep all bubbles inside the safe area (≥ 60 px from canvas edges)
- **BUBBLE_DUR** — per-bubble spring-in
  - Range: 0.35-0.55 s
- **BUBBLE_STAGGER** — gap between successive bubble entries
  - Range: 0.05-0.1 s
- **BUBBLE_FINAL_OPACITY** — settled opacity
  - Range: 0.85-1.0
- **BUBBLE_RADIUS_CSS / BUBBLE_BORDER_PX / BUBBLE_PAD_Y / BUBBLE_PAD_X / BUBBLE_FONT_PX** — bubble visual sizing
  - Range: pick so labels fit on one line at the chosen font size; bubble width should not exceed the radial gap to neighbors

Ease coefficients (`back.out(coef)`)

- **ENTRY_BOUNCE** — mockup entry bounce intensity
  - Range: 1.2-1.6; lower = subtler overshoot, higher = playful
- **ICON_BOUNCE** — icon entry bounce
  - Range: 1.4-1.8 (snappier than mockups so the cluster feels alive)
- **AVATAR_BOUNCE** — avatar pop bounce
  - Range: 1.2-1.6
- **BUBBLE_BOUNCE** — bubble entry bounce
  - Range: 1.2-1.6

Placeholder content (replace in the example)

- **{mockupLabel1} / {mockupLabel2} / {mockupLabelCenter}** — short product / workflow labels for the three mockups; center one is the morph subject
- **{platformIcon}** — icon assets in `assets/icons/`
- **{avatarAsset}** — looping muted video, or substitute a CSS gradient circle
- **{task1}…{task8}** — 6-8 short overwhelming-action labels (3-6 words each)
- **{bubbleSurface} / {bubbleBorder} / {bubbleShadowColor} / {bubbleTextColor}** — color tokens chosen for high contrast against the background
- **{font}** — primary UI font stack

## Critical Constraints

- **Single paused GSAP timeline**: One `gsap.timeline({ paused: true })` per composition, registered to `window.__timelines["problem-mockup-overwhelm"]`. HyperFrames seeks it. Don't fork into multiple timelines.
- **DOM-permanent layers**: Both the mockup cluster and the avatar-with-bubbles layer stay in the DOM the entire scene. Seek can move time backward — conditional rendering would create flicker. Use `opacity` to gate visibility, not React conditionals.
- **No `width` / `height` / `left` / `top` tweens**: Forbidden by the HyperFrames animated-property allowlist (they trigger layout reflows). The morph uses `scale` + `borderRadius` instead.
- **`borderRadius` tween is OK**: Paint-only, no reflow. GSAP can tween it as a CSS property with a unit string.
- **Morph z-index > avatar z-index**: `.mockup-center` at z:25, `.avatar` at z:20. The avatar becomes visible only when the morph fades to 0 — preserves the "single morphing object" illusion.
- **Concurrent exits, not sequential**: Non-center mockups and platform icons exit _during_ the morph (same trigger, ~50% of morph duration). Exiting before feels premature; exiting after feels detached from the morph.
- **6-8 bubbles maximum**: More creates unreadable clutter; fewer doesn't convey "overwhelming". The radial pattern needs visual closure.
- **Bubble text concise**: 3-6 words each. These are labels, not sentences. Long text breaks the radial composition.
- **Avatar needs micro-motion**: A static avatar in the middle of moving bubbles reads as a placeholder. Use a `<video muted playsinline>` source, or add orbiting dots / breathing scale via a finite yoyo. See [sine-wave-loop](../rules/sine-wave-loop.md) (multiplicative-breath variant) for the pattern when the avatar already has a pop scale.
- **Pre-baked positions**: Bubble `left` / `top` and icon `left` / `top` are computed once at script load and written as CSS. GSAP tweens only `scale` / `opacity` / `x` / `y`. Never call `getBoundingClientRect()` at tween time.
- **No infinite repeats**: All breathing / floating yoyos use a computed finite `repeat` derived from `data-duration`. `repeat: -1` is forbidden.
- **No nondeterministic state**: No `Math.random()`, no `Date.now()`, no `performance.now()`. All bubble positions, icon positions, and stagger orders are pure functions of the script's constants.
- **`data-duration` on the root governs render length**, not the GSAP timeline's intrinsic length. If you author 6 seconds of motion but want a 4-second render, set `data-duration="4"`.

## the source → HyperFrames Mapping (this blueprint)

| Source pattern (frame-driven Remotion-style scene)                             | HyperFrames equivalent                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `frame = useCurrentFrame()`                                                    | Implicit — GSAP timeline carries time                                                                   |
| `useVideoConfig().fps`                                                         | Not needed; everything is in seconds                                                                    |
| `useVideoConfig().width / height`                                              | `COMP_W` / `COMP_H` constants matching `data-width` / `data-height`                                     |
| `toFrame(seconds)` (relative-to-scene frame)                                   | seconds, relative to composition start                                                                  |
| `spring({ stiffness:70, damping:14 })` (mockup entry)                          | `ease: "back.out(${ENTRY_BOUNCE})"`, `duration: MOCKUP_ENTRY_DUR`                                       |
| `spring({ stiffness:80, damping:18 })` (morph driver)                          | `ease: "power3.out"`, `duration: MORPH_DUR`                                                             |
| `spring({ stiffness:120, damping:14 })` (avatar pop)                           | `ease: "back.out(${AVATAR_BOUNCE})"`, `duration: AVATAR_POP_DUR`                                        |
| `spring({ stiffness:180, damping:12 })` (bubble pop)                           | `ease: "back.out(${BUBBLE_BOUNCE})"`, `duration: BUBBLE_DUR`                                            |
| `interpolate(morphProgress, [0,1], [MOCKUP_W, AVATAR_SIZE])` (`width`)         | `scale: MORPH_END_SCALE` tween                                                                          |
| `interpolate(morphProgress, [0,1], [MOCKUP_H, AVATAR_SIZE])` (`height`)        | covered by uniform `scale` + content fade-out                                                           |
| `interpolate(morphProgress, [0,1], [cornerStart, cornerEnd])` (`borderRadius`) | `borderRadius: (MOCKUP_W * MORPH_END_SCALE / 2) + "px"` tween                                           |
| `interpolate(morphProgress, [0,CONTENT_FADE_FRAC], [1,0])` (content opacity)   | `duration: MORPH_DUR * CONTENT_FADE_FRAC` opacity tween                                                 |
| `interpolate(morphProgress, [1-HANDOFF_TAIL_FRAC, 1], [1,0])` (final fade)     | tween at `MORPH_TRIGGER + (1-HANDOFF_TAIL_FRAC) * MORPH_DUR`, `duration: HANDOFF_TAIL_FRAC * MORPH_DUR` |
| `Math.sin(frame * ...)` (icon float)                                           | Per-icon finite `sine.inOut` yoyo, or shared `onUpdate`                                                 |
| `frame < TIMING.avatarAppear + N` (showMockups gate)                           | Opacity tween — both layers stay in DOM                                                                 |
| `<AbsoluteFill>`                                                               | `<div style="position: absolute; inset: 0;">`                                                           |
| `<OffthreadVideo src={staticFile(...)} volume={0}>`                            | `<video src="{avatarAsset}" muted playsinline>`                                                         |
| `<Img src={staticFile(ICONS.foo)}>`                                            | `<img src="{platformIcon}">`                                                                            |
| `POSITIONS.map(...)` JSX                                                       | `forEach` that builds DOM at script load                                                                |

## Golden Sample

- [problem-mockup-overwhelm.html](../examples/problem-mockup-overwhelm.html) — three workflow-tool mockups (left / center / right phone shells), nine scattered platform icons around the cluster, morph of the center phone card into a cyan-teal-blue avatar circle, then eight short task-label bubbles overwhelm the avatar in a radial layout. Single paused GSAP timeline; one shared scene-ticker `onUpdate` drives mockup floating, orbit dots, avatar breath, and bubble micro-float.
