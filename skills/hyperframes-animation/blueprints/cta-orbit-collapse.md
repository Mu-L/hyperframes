---
id: cta-orbit-collapse
role: cta
duration_seconds: [5, 8]
phases: 5
visual_arc: icons-orbit → cursor-click → collapse → demo-appears → demo-floats
uses_rules: [orbit-3d-entry, cursor-click-ripple, center-outward-expansion, sine-wave-loop]
element_roles:
  orbit_icons: 3D-entry icons representing categories / use-cases, orbiting the centerpiece
  center_cta: Central CTA element (input bar, button) that receives the click
  cursor: Animated cursor that moves to the CTA and clicks with ripple feedback
  demo: Product demo (video / image) that appears from the collapse point and floats
when_to_use:
  - Show product versatility (works for many categories / use-cases)
  - Icons represent different content types, genres, modes, or technology surfaces
  - User-click metaphor triggers transformation from categories → result
  - "Many options → one action → one result" narrative compression
when_not_to_use:
  - Categories have no distinct iconography (use a text list)
  - No user-action metaphor — product works automatically
  - Scene is purely informational
triggers: [works for any genre, multiple categories, click to generate, versatile tool, one click result]
---

# CTA · Orbit Collapse (HyperFrames)

Category icons enter with a 3D flip → orbit a central CTA → cursor moves to CTA and clicks → icons collapse inward toward the click point → product demo springs out from the collapse point → demo floats on a breathing idle.

Same five-phase arc; one paused GSAP timeline; constituent patterns map to [orbit-3d-entry](../rules/orbit-3d-entry.md), [cursor-click-ripple](../rules/cursor-click-ripple.md), [center-outward-expansion](../rules/center-outward-expansion.md) (used as the reversed driver for the collapse), and [sine-wave-loop](../rules/sine-wave-loop.md) (single-yoyo idle form).

> The collapse and orbit cannot live on independent tweens — orbit angle must keep advancing while the radius shrinks. Both are folded into a single master `onUpdate` that reads `tl.time()` and an eased collapse proxy (built via `gsap.parseEase`). No per-frame conditionals on `frame`; HyperFrames forbids them.

## When to Use

- Versatility / use-case scene showing the product handles many categories
- The transformation from "options" to "result" should feel **physical** — a click pulls the icons inward
- A cursor click drives the narrative pivot (versus a fade or zoom)
- Total duration sits in the 5–8 s range (any shorter and the orbit doesn't register as ambient motion)

## Phase Pipeline

All boundaries are in **seconds**. Named constants live in the Constants block; concrete values for the golden sample are in How to Choose Values.

| Phase | Time window                          | What Happens                                                    | Skill Reference                                                                    |
| ----- | ------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1     | `0 → CURSOR_AT`                      | Icons enter with 3D flip, staggered; orbit motion runs from t=0 | [orbit-3d-entry](../rules/orbit-3d-entry.md)                                       |
| 2     | `CURSOR_AT → CLICK_AT`               | Cursor enters off-screen, moves to CTA, clicks with ripple      | [cursor-click-ripple](../rules/cursor-click-ripple.md)                             |
| 3     | `CLICK_AT → CLICK_AT + COLLAPSE_DUR` | Icons collapse toward the click point; CTA pulses               | [center-outward-expansion](../rules/center-outward-expansion.md) (reversed driver) |
| 4     | `DEMO_AT → DEMO_AT + DEMO_DUR`       | Product demo springs out of the collapse point                  | inline                                                                             |
| 5     | `IDLE_START → TOTAL`                 | Demo floats with a breathing yoyo                               | [sine-wave-loop](../rules/sine-wave-loop.md) (finite-yoyo form)                    |

Phase 3 and Phase 4 **overlap by `COLLAPSE_OVERLAP`** — the demo entry begins just before the collapse fully completes, so the click reads as energy transfer rather than two separate moments.

## Initial Layout

Each icon uses **three nested wrappers** so the orbit position, the collapse scale/opacity, and the 3D entry rotation each tween on their own element and never overwrite each other:

```
.icon-pos        ← outermost — gets x/y from the master onUpdate (orbit + collapse)
  .icon-collapse ← middle    — gets scale/opacity from the master onUpdate (collapse only)
    .icon-entry  ← innermost — gets rotateX/rotateY/scale/opacity from the entry tween
      <svg>...</svg>
```

`perspective` is applied to `.icon-pos` so the inner 3D rotation has depth. The orbit's elliptical radii (`RADIUS_X`, `RADIUS_Y`) are baked into the `onUpdate` math, not into per-icon CSS.

```html
<div class="stage" style="position: absolute; inset: 0; overflow: hidden;">
  <div class="bg"></div>

  <!-- Orbit ring — N icons spaced evenly around 2π (typically 6) -->
  <div class="orbit-stage" style="position: absolute; inset: 0;">
    <!-- Repeat .icon-pos for each category. The CSS class on the outer wrapper
         (e.g. .icon-{categoryKey}) lets the master onUpdate target a single
         icon's orbit position by selector. -->
    <div class="icon-pos icon-{categoryKey}" style="perspective: 800px;">
      <div class="icon-collapse">
        <div class="icon-entry">
          <svg class="icon-svg"><!-- {categoryGlyph} --></svg>
          <span class="icon-label">{categoryLabel}</span>
        </div>
      </div>
    </div>
    <!-- … one .icon-pos per category, distributed at angle = i * 2π / N -->
  </div>

  <!-- Center CTA — fixed at viewport center; click target lives here -->
  <div class="cta" style="position: absolute; left: 50%; top: 50%; z-index: 5;">
    <span class="cta-placeholder">{ctaCopy}</span>
    <div class="cta-button">{ctaButtonLabel}</div>
  </div>

  <!-- Ripple ring(s) — render from CTA-button center on click -->
  <div class="ripple"></div>

  <!-- Cursor — sits above everything during move + click -->
  <div class="cursor" style="z-index: 999; pointer-events: none; opacity: 0;">
    <svg width="28" height="28" viewBox="0 0 24 24">
      <path
        d="M5 3L19 12L12 13L9 20L5 3Z"
        fill="{cursorFill}"
        stroke="{cursorStroke}"
        stroke-width="1.5"
      />
    </svg>
  </div>

  <!-- Demo — sits at viewport center, scaled to 0 until Phase 4 -->
  <div
    class="demo"
    style="position: absolute; left: 50%; top: 50%; z-index: 10;
       transform: scale(0); opacity: 0;
       border-radius: 16px; overflow: hidden; background: {demoBg};"
  >
    <!-- {heroAsset} — video / image / play-card -->
  </div>
</div>
```

CSS sets the CTA, ripple and demo at viewport center via `left/top + margin` (or GSAP `xPercent: -50, yPercent: -50` when the same element also receives a transform tween). GSAP only ever tweens transform aliases (`x`, `y`, `scale`, `rotation`, `opacity`) — never `left/top/width/height`. Fonts come from project tokens (`{font}` / `{monoFont}`); colors are `{accentColor}` / `{accentGlow}` / `{bgDark}` / `{textPrimary}` and resolve to real values in the example.

## Constants

All constants are named only; concrete values are documented in How to Choose Values below. The example resolves them to concrete numbers.

```js
// Frame
const W, H; // composition width/height in px
const CENTER_X = W / 2;
const CENTER_Y = H / 2;

// Orbit geometry
const RADIUS_X; // elliptical horizontal radius
const RADIUS_Y; // elliptical vertical radius (perspective-flattened)
const ORBIT_SPEED; // radians per second

// Icons — N entries distributed evenly around 2π
const ICONS = [
  // { sel: ".icon-<key>", initialAngle: (i * 2 * Math.PI) / N, entryDelay: i * ENTRY_STAGGER },
];

// Phase durations / boundaries
const ENTRY_DUR; // per-icon 3D flip
const ENTRY_STAGGER; // delay between consecutive icon entries
const CURSOR_AT; // cursor fades in and starts moving
const CURSOR_MOVE; // duration of the cursor move
const CLICK_AT; // click instant — collapse pivot
const COLLAPSE_DUR; // icons converge to center
const COLLAPSE_OVERLAP; // demo begins this many seconds before collapse finishes
const DEMO_AT = CLICK_AT + COLLAPSE_DUR - COLLAPSE_OVERLAP;
const DEMO_DUR; // demo spring-out
const IDLE_TAIL; // gap between demo entry end and breath start
const IDLE_START = DEMO_AT + DEMO_DUR + IDLE_TAIL;
const TOTAL; // matches data-duration on the composition root

// Ease coefficients
const ENTRY_BACK; // icon flip-in back.out coefficient
const CURSOR_BACK; // cursor move back.out coefficient
const COLLAPSE_BACK; // collapse driver back.out coefficient
const DEMO_BACK; // demo spring back.out coefficient
const RECOVER_BACK; // press-recover back.out coefficient
```

## Phase 1: 3D Flip Entry + Orbit (Core Glue, Part A)

Each icon enters with a single `tl.fromTo` on `.icon-entry` that performs the 3D flip. The orbit motion lives in a master `onUpdate` (see Phase 3) that writes `x` / `y` to `.icon-pos` every frame from t=0 onward, so internal motion is already running when each icon's `.icon-entry` becomes visible.

```js
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });

ICONS.forEach(({ sel, entryDelay }) => {
  tl.fromTo(
    `${sel} .icon-entry`,
    { rotateX: 90, rotateY: -45, z: -100, scale: 0, opacity: 0 },
    {
      rotateX: 0,
      rotateY: 0,
      z: 0,
      scale: 1,
      opacity: 1,
      duration: ENTRY_DUR,
      ease: `back.out(${ENTRY_BACK})`,
    },
    entryDelay,
  );
});
```

### Why a mild `back.out` and not a stiffer ease

The entry should feel like the icon _arriving_, not _snapping into place_. A milder overshoot coefficient (low end of `ENTRY_BACK`'s range) keeps the cascade calm enough that the eye treats it as ambient. The collapse spring in Phase 3 (`COLLAPSE_BACK`) is the snappier one — the contrast carries the narrative pivot.

### Internal SVG enrichment

Each icon's internal motion (any per-glyph living detail like a sway, a phase-shifted scale pulse, etc.) runs on its own finite yoyo from t=0. Do **not** gate the enrichment behind the entry delay — the user should see a living icon appear, not a static icon that starts moving on landing.

## Phase 2: Cursor + Click + Ripple

The cursor enters off-screen, slides to the CTA's click centroid, depresses on click, and recovers. The CTA (or specifically the CTA button) depresses concurrently for physical feedback. One ripple ring expands from the click point.

```js
// CURSOR_START_X / Y position the cursor at an off-screen entry point.
// CURSOR_TARGET_X / Y align with the visual centroid of the click target
// (typically the CTA button center, not the CTA card center).
gsap.set(".cursor", { x: CURSOR_START_X, y: CURSOR_START_Y, opacity: 0 });

// (a) Fade in
tl.to(".cursor", { opacity: 1, duration: CURSOR_FADE_DUR, ease: "none" }, CURSOR_AT);

// (b) Move to CTA — calm settle, mild overshoot
tl.to(
  ".cursor",
  {
    x: CURSOR_TARGET_X,
    y: CURSOR_TARGET_Y,
    duration: CURSOR_MOVE,
    ease: `back.out(${CURSOR_BACK})`,
  },
  CURSOR_AT,
);

// (c) Click depression — cursor + click target both compress, then recover
tl.to(".cursor", { scale: CURSOR_PRESS_SCALE, duration: PRESS_DUR, ease: "power2.out" }, CLICK_AT);
tl.to(
  ".cursor",
  { scale: 1, duration: RECOVER_DUR, ease: `back.out(${RECOVER_BACK})` },
  CLICK_AT + PRESS_DUR,
);

tl.to(
  ".cta-button",
  { scale: TARGET_PRESS_SCALE, duration: PRESS_DUR, ease: "power2.out" },
  CLICK_AT,
);
tl.to(
  ".cta-button",
  { scale: 1, duration: RECOVER_DUR, ease: `back.out(${RECOVER_BACK})` },
  CLICK_AT + PRESS_DUR,
);

// (d) Ripple — single ring expands and fades. Keyframes give the
// 0 → peak → 0 opacity envelope that reads as a pulse rather than a
// linear fade.
tl.to(
  ".ripple",
  {
    duration: RIPPLE_DUR,
    keyframes: {
      "0%": { scale: RIPPLE_START_SCALE, opacity: 0 },
      "20%": { opacity: RIPPLE_PEAK_OPACITY },
      "100%": { scale: RIPPLE_END_SCALE, opacity: 0 },
      easeEach: "power2.out",
    },
  },
  CLICK_AT,
);
```

For multiple staggered rings, repeat the ripple tween at `CLICK_AT + RIPPLE_STAGGER`, `CLICK_AT + 2*RIPPLE_STAGGER`, … on `.ripple-2` / `.ripple-3` elements. One ring usually reads enough.

## Phase 3: Collapse (Core Glue, Part B)

This is the single most important tween in the blueprint. **The orbit must keep advancing while the radius shrinks** — otherwise the icons "snap" inward in a way that doesn't read as collapse. So orbit angle and collapse radius are computed in the _same_ `onUpdate` that runs continuously from t=0 to the end of Phase 3.

```js
// Pre-compute the spring-like ease curve so we can call it as a pure
// function inside onUpdate.
const COLLAPSE_EASE = gsap.parseEase(`back.out(${COLLAPSE_BACK})`);
const ORBIT_END = DEMO_AT; // stop the engine once icons are gone

// Master orbit + collapse engine — single onUpdate writes
// x/y/scale/opacity for all icons.
tl.to(
  { tick: 0 },
  {
    tick: 1, // unused; this is just a clock
    duration: ORBIT_END, // covers Phase 1 + Phase 3
    ease: "none",
    onUpdate: () => {
      const t = tl.time();
      const collapseLinear = Math.max(0, Math.min(1, (t - CLICK_AT) / COLLAPSE_DUR));
      const collapseEased = COLLAPSE_EASE(collapseLinear);
      const radiusFactor = 1 - collapseEased; // 1 → 0 over Phase 3
      const collapseScale = 1 - collapseEased * COLLAPSE_SCALE_DEPTH; // 1 → (1 - depth)

      // Two-segment opacity envelope: 1 at 0, OPACITY_KNEE at OPACITY_KNEE_T, 0 at 1
      // — gives the inward motion an "energy converging" feel instead of a pop-vanish.
      const o = collapseEased;
      const collapseOpacity =
        o < OPACITY_KNEE_T
          ? 1 - o * ((1 - OPACITY_KNEE) / OPACITY_KNEE_T)
          : (OPACITY_KNEE * (1 - o)) / (1 - OPACITY_KNEE_T);

      ICONS.forEach(({ sel, initialAngle, entryDelay }) => {
        const localT = Math.max(0, t - entryDelay); // local time since this icon entered
        const angle = initialAngle + localT * ORBIT_SPEED;
        const x = Math.cos(angle) * RADIUS_X * radiusFactor;
        const y = Math.sin(angle) * RADIUS_Y * radiusFactor;

        gsap.set(`${sel}.icon-pos`, { x, y });
        gsap.set(`${sel} .icon-collapse`, { scale: collapseScale, opacity: collapseOpacity });
      });
    },
  },
  0,
);
```

### Why one `onUpdate` and not per-icon tweens

[center-outward-expansion](../rules/center-outward-expansion.md) prefers per-element tweens for _static_ targets — GSAP batches them cheaply. Here the target itself is a function of two simultaneously evolving variables (orbit angle, collapse driver), so a single `onUpdate` that reads both and writes all icons is the simpler model. N `gsap.set()` calls per frame (for N icons in the 4–12 range) are cheap; the compositor batches the resulting transform writes.

### Why `gsap.parseEase` instead of a proxy tween

A proxy tween (`tl.to(collapseProxy, { v: 1, ease: 'back.out(...)' })`) and `gsap.parseEase('back.out(...)')(progress)` produce _identical_ values for the same progress fraction. `parseEase` is preferred when the eased value is consumed inside another tween's `onUpdate` — one fewer engine tween, and the timing is anchored to `tl.time()` rather than to a sibling tween that could drift after seek.

## Phase 4: Demo Appears

The demo springs out of the collapse point with scale overshoot. It overlaps the tail of Phase 3 by `COLLAPSE_OVERLAP` so the click reads as energy transferring into the demo.

```js
tl.fromTo(
  ".demo",
  { scale: 0, opacity: 0 },
  {
    scale: 1,
    opacity: 1,
    duration: DEMO_DUR,
    ease: `back.out(${DEMO_BACK})`,
  },
  DEMO_AT,
);

// Optional: short opacity attack so the demo isn't visible at scale 0
tl.fromTo(".demo", { opacity: 0 }, { opacity: 1, duration: DEMO_FADE_DUR, ease: "none" }, DEMO_AT);
```

The demo's CSS centering (`left: 50%; top: 50%; margin: …` or GSAP `xPercent/yPercent`) anchors it to the same viewport-center point the icons collapsed toward. **This match must be exact** — the eye notices a few-pixel misalignment between the collapse point and the demo entry point as a teleport.

## Phase 5: Demo Floats (Breathing)

The single-yoyo idle form from [sine-wave-loop](../rules/sine-wave-loop.md) — finite repeat count, computed so the breath ends _before_ the composition ends. Simplest and cheapest idle.

```js
const remaining = TOTAL - IDLE_START;
const halfCycles = Math.max(0, Math.floor(remaining / HALF_CYCLE) - 1);

tl.fromTo(
  ".demo",
  { y: 0, rotation: 0 },
  {
    y: FLOAT_Y,
    rotation: FLOAT_ROT,
    duration: HALF_CYCLE,
    ease: "sine.inOut",
    yoyo: true,
    repeat: halfCycles,
  },
  IDLE_START,
);
```

**Do not** add `repeat: -1` — HyperFrames forbids infinite repeats. The `Math.floor(remaining / HALF_CYCLE) - 1` formula guarantees the breath ends before the composition ends, so the last visible frame doesn't catch the demo mid-cycle.

If the demo lands at a non-1 scale (e.g. the spring overshoot leaves it at 1.05), use the multiplicative idle form from sine-wave-loop instead. The simple yoyo above assumes the demo settled at scale 1.

## Final Setup

```js
window.__timelines["main"] = tl;
```

The composition root's `data-duration` must be ≥ `TOTAL`. Anything less and the breath repeats stop early.

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Last icon entry begins at (N-1) * ENTRY_STAGGER and finishes at
  (N-1) * ENTRY_STAGGER + ENTRY_DUR.
  CURSOR_AT must be ≥ that finish time + a "settle gap" so the eye
  sees the orbit stabilize before the cursor enters.

Phase 2 → Phase 3:
  Cursor settles at CURSOR_AT + CURSOR_MOVE.
  CLICK_AT = settle + a small "decision pause" — the brief hold reads
  as the user deciding to click.

Phase 3 → Phase 4:
  Collapse completes at CLICK_AT + COLLAPSE_DUR.
  DEMO_AT = collapse end − COLLAPSE_OVERLAP — intentional overlap so the
  click's energy visibly flows into the demo emerging. Larger overlaps
  let icons appear to pass through the demo; smaller and the moment
  feels broken.

Phase 4 → Phase 5:
  Demo entry ends at DEMO_AT + DEMO_DUR.
  IDLE_START = entry end + IDLE_TAIL — the spring tail dissipates
  before the breath takes over.
```

## How to Choose Values

- **RADIUS_X / RADIUS_Y** — elliptical orbit radii, in px
  - Range: `RADIUS_X` 300–900; `RADIUS_Y / RADIUS_X` ≈ 0.4–0.7 (perspective flattening)
  - Effects: small radii read as a tight cluster; large radii spread the ring across the frame
  - Constraints: must clear the CTA card horizontally at every angle (see orbit-3d-entry "Center label clearance")
  - Reference: examples/cta-orbit-collapse.html uses 480 / 280

- **ORBIT_SPEED** — angular velocity, in radians per second
  - Range: 0.1–0.6 rad/s (one revolution in ~10–60 s)
  - Effects: slow speeds read as ambient drift; fast speeds read as a "system spinning up"
  - Constraints: collapse must dominate the eye in Phase 3 — keep ORBIT_SPEED low enough that the angular change during `COLLAPSE_DUR` is small relative to the radius shrink
  - Reference: examples/cta-orbit-collapse.html uses 0.25

- **N (icon count)** — number of orbit elements
  - Range: 4–12; ICONS array is N entries with `initialAngle = i * 2π / N`
  - Effects: fewer feels empty; more crowds the center CTA
  - Constraints: choose N so the angular gap between adjacent icons (`2π / N`) leaves room for icon glyphs to be legible
  - Reference: examples/cta-orbit-collapse.html uses 6

- **ENTRY_DUR** — per-icon flip-in duration
  - Range: 0.4–0.8 s
  - Effects: short feels punchy; long feels stately
  - Constraints: must satisfy `(N-1) * ENTRY_STAGGER + ENTRY_DUR ≤ CURSOR_AT − settle_gap`
  - Reference: examples/cta-orbit-collapse.html uses 0.55

- **ENTRY_STAGGER** — delay between consecutive icon entries
  - Range: 0.06–0.15 s
  - Effects: below ~0.06 s reads as popcorn; above ~0.15 s plodding
  - Reference: examples/cta-orbit-collapse.html uses 0.10

- **CURSOR_AT** — when cursor enters, in seconds
  - Range: must exceed last-icon-entry-finish + a settle gap of ≥ 0.3 s
  - Reference: examples/cta-orbit-collapse.html uses 1.50

- **CURSOR_MOVE** — cursor travel time
  - Range: 0.4–1.0 s
  - Reference: examples/cta-orbit-collapse.html uses 0.50

- **CLICK_AT** — click instant
  - Range: `CURSOR_AT + CURSOR_MOVE + 0.0–0.3 s` decision pause
  - Reference: examples/cta-orbit-collapse.html uses 2.20

- **COLLAPSE_DUR** — collapse duration
  - Range: 0.6–1.2 s
  - Effects: short feels like a snap-in; long feels like a vacuum draw
  - Reference: examples/cta-orbit-collapse.html uses 0.85

- **COLLAPSE_OVERLAP** — seconds the demo entry starts before the collapse finishes
  - Range: 0.05–0.20 s
  - Effects: too small reads as two disconnected events; too large lets icons appear to pass through the demo
  - Reference: examples/cta-orbit-collapse.html uses 0.10

- **DEMO_DUR** — demo spring-out duration
  - Range: 0.6–1.0 s
  - Reference: examples/cta-orbit-collapse.html uses 0.80

- **IDLE_TAIL** — gap between demo entry end and breath start
  - Range: 0.15–0.30 s
  - Reference: examples/cta-orbit-collapse.html uses 0.20

- **TOTAL** — total composition duration; must equal `data-duration`
  - Constraints: must be ≥ `IDLE_START + HALF_CYCLE` so at least one half-breath plays
  - Reference: examples/cta-orbit-collapse.html uses 6.5

- **ENTRY_BACK / CURSOR_BACK / COLLAPSE_BACK / DEMO_BACK / RECOVER_BACK** — `back.out(<n>)` overshoot coefficients
  - Range: 1.2–2.0 (see Spring → Ease Cheatsheet below for the intended feel of each)
  - Effects: low end is a calm arrive; high end snaps with visible overshoot
  - Constraints: COLLAPSE_BACK > ENTRY_BACK (collapse must feel snappier than entry — otherwise the click feels uncaused)
  - Reference: examples/cta-orbit-collapse.html uses 1.4 / 1.3 / 1.6 / 1.6 / 1.6

- **COLLAPSE_SCALE_DEPTH** — how far icons shrink during collapse (`1 → 1 - depth`)
  - Range: 0.3–0.7
  - Effects: low values keep icons visible at the moment of impact; high values let them disappear into the click point
  - Reference: examples/cta-orbit-collapse.html uses 0.5

- **OPACITY_KNEE / OPACITY_KNEE_T** — break point in the two-segment opacity envelope `[1 → OPACITY_KNEE → 0]` at fractional time `[0, OPACITY_KNEE_T, 1]` of the collapse
  - Range: knee 0.3–0.6; knee_t 0.7–0.9
  - Effects: a high knee_t with a moderate knee keeps icons mostly opaque until the very end, then drops sharply — reads as "energy converging then released"
  - Reference: examples/cta-orbit-collapse.html uses knee 0.5 / knee_t 0.8

- **PRESS_DUR / RECOVER_DUR / CURSOR_PRESS_SCALE / TARGET_PRESS_SCALE** — click-depression timing & depth
  - Per [cursor-click-ripple](../rules/cursor-click-ripple.md) "How to Choose Values"
  - Reference: examples/cta-orbit-collapse.html uses 0.08 / 0.18 / 0.85 / 0.95

- **RIPPLE_DUR / RIPPLE_START_SCALE / RIPPLE_END_SCALE / RIPPLE_PEAK_OPACITY** — ripple ring expand-fade envelope
  - Per [cursor-click-ripple](../rules/cursor-click-ripple.md) "How to Choose Values"; for the keyframed envelope used here, peak opacity is the 20% keyframe value
  - Reference: examples/cta-orbit-collapse.html uses 0.7 / 0.3 / 5.0 / 0.7

- **HALF_CYCLE** — half a breath cycle in Phase 5
  - Range: 0.8–1.6 s
  - Effects: short reads as anxious breathing; long reads as relaxed
  - Reference: examples/cta-orbit-collapse.html uses 1.10

- **FLOAT_Y / FLOAT_ROT** — float amplitude per half-cycle
  - Range: y ±4 to ±12 px; rot ±0.5° to ±2°
  - Effects: subtle values keep the demo "alive"; large values make it look unstable
  - Reference: examples/cta-orbit-collapse.html uses −8 px / +1°

## Critical Constraints

- **Orbit speed is constant before and during collapse** — only the radius shrinks. Slowing the orbit during collapse breaks the "snappy contraction" feel; speeding it up looks like the icons spin into a drain.
- **Collapse ease is snappier than entry ease** — `COLLAPSE_BACK > ENTRY_BACK`. The collapse should feel decisive, the entry should feel arriving.
- **Demo origin matches the collapse center exactly** — the demo's centering offsets must align with the icons' viewport-center collapse point. Mismatch reads as a teleport.
- **Cursor `z-index: 999`** — above everything during move and click. The cursor must always be visible; it cannot be occluded by an icon passing in front during the orbit.
- **Ripple `z-index` between CTA and cursor** — typically z-index ≈ 6: above the CTA card, below the cursor.
- **Click target visibly depresses during the click** — the press-scale tween on `.cta-button` is the causal trigger; without it, the collapse feels uncaused.
- **Three nested wrappers per icon** — `.icon-pos` (orbit x/y), `.icon-collapse` (collapse scale/opacity), `.icon-entry` (3D flip). Tweening the same property on the same element from two sources is undefined behavior in GSAP.
- **Icons fade during collapse, not pop-vanish** — the two-segment opacity envelope `[1, OPACITY_KNEE, 0]` is what gives the inward motion its "energy converging" feel.
- **One master onUpdate, gated by `tl.time()`** — both orbit angle and collapse driver are pure functions of `tl.time()`. No `Math.random()`, no `Date.now()`, no `performance.now()`.
- **Single paused timeline** — all five phases on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.
- **GSAP transform aliases only** — `x`, `y`, `scale`, `rotation`, `rotateX`, `rotateY`, `z`, `opacity`. Never `left`/`top`/`width`/`height`.
- **No infinite repeats** — Phase 5's `repeat` is computed from `TOTAL - IDLE_START`.

## Spring → Ease Cheatsheet

The blueprint maps four spring-shaped motions to `back.out` eases. Coefficient values live in How to Choose Values.

| Spring intent                             | Maps to                                                          |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Calm-arrive — icon 3D flip entry          | `back.out(ENTRY_BACK)`                                           |
| Calm-settle — cursor move                 | `back.out(CURSOR_BACK)`                                          |
| Snappy-contract — collapse driver         | `back.out(COLLAPSE_BACK)` (via `gsap.parseEase` inside onUpdate) |
| Snappy-arrive with overshoot — demo entry | `back.out(DEMO_BACK)`                                            |
| Continuous float                          | `sine.inOut` yoyo with finite `repeat`                           |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [cta-orbit-collapse.html](../examples/cta-orbit-collapse.html) — runnable instance of this blueprint. Demonstrates the three-wrapper icon anatomy and the `gsap.parseEase` pattern for spring-shaped collapse driven from inside a master `onUpdate`.
