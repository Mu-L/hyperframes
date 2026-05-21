---
id: cta-morph-press
role: cta
duration_seconds: [4, 6]
phases: 4
visual_arc: hero-entrance → morph-swap → cursor-approach → press-react
uses_rules: [sine-wave-loop, scale-swap-transition, physics-press-reaction]
element_roles:
  hero: Initial focal element (logo, brand lockup, product) that establishes presence then exits via shrink-fade
  cta: Interactive target (button, card, link) that enters via bouncy scale-swap at the hero's position
  cursor: Pointer that enters from off-screen along a spring path, then performs a physical click
when_to_use:
  - Scene transitions from brand presence to a call-to-action
  - Two elements occupy the same screen position sequentially (morph illusion)
  - Simulated user interaction (cursor click) on the final element
  - Hero should feel "alive" before transforming (breathing idle)
when_not_to_use:
  - Hero and CTA coexist on screen — see brand-reveal-assemble-zoom
  - CTA enters from off-screen — see takeover-ticker-displace
  - No click interaction — use scale-swap-transition alone
  - Multiple CTAs need sequential interaction
triggers:
  [logo morphs into button, CTA animation, cursor clicks button, brand to action, morph transition]
---

# CTA · Morph & Press (HyperFrames)

Hero enters with breathing idle → morphs into CTA via scale-swap → cursor approaches → physics-based click reaction.

Same four-phase "presence → action" arc; one paused GSAP timeline; constituent patterns map to [sine-wave-loop](../rules/sine-wave-loop.md), [scale-swap-transition](../rules/scale-swap-transition.md), and [physics-press-reaction](../rules/physics-press-reaction.md).

## When to Use

- Scene arc moves from brand identity to user action
- Two elements share the same screen center but appear sequentially (morph)
- Final beat is a simulated click interaction with physical feedback
- Hero needs subtle ambient motion before transformation

## Phase Pipeline

All boundaries are in **seconds**.

| Phase | Time window                                  | What Happens                                                              | Skill Reference                                                                 |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1     | `INTRO_START – MORPH_AT`                     | Hero enters (y rise + fade) + ambient rotation idle                       | [sine-wave-loop](../rules/sine-wave-loop.md) (onUpdate form, reads `tl.time()`) |
| 2     | `MORPH_AT – CURSOR_ENTER_AT`                 | Hero shrinks/fades; CTA pops in with overshoot; text reveals after a beat | [scale-swap-transition](../rules/scale-swap-transition.md)                      |
| 3     | `CURSOR_ENTER_AT – CLICK_DOWN_AT`            | Cursor enters from off-screen bottom-right via spring path                | inline spring tween                                                             |
| 4     | `CLICK_DOWN_AT – CLICK_UP_AT + CLICK_UP_DUR` | Cursor and CTA scale-dip together, then recover                           | [physics-press-reaction](../rules/physics-press-reaction.md)                    |

## Element Sizing

All dimensions derive from `data-height` (composition height). Proportional sizing keeps the morph illusion consistent across resolutions.

### Hero Element

The hero dominates Phase 1 — it must command the viewport. Text-based heroes use oversized typography. All sizes derive from `data-height`; see "How to Choose Values" for `HERO_FONT_RATIO`, `HERO_LETTER_SPACING_EM`, and `HERO_ICON_RATIO`.

Hero elements should fill ~60–80% of viewport width. Too small and the morph reads as a UI transition, not a cinematic beat.

### CTA Button

CTA sizing derives from `data-height` via `CTA_FONT_RATIO`, with padding and border-radius derived from font size (see How to Choose Values for ratios).

CTA total width should be ~30–50% of viewport width. The **CTA must be smaller than the hero** — the morph reads as "condensing" into a focused action element. If `ctaTotalWidth > heroGroupWidth × CTA_MAX_REL_HERO`, the morph reads as expansion, which is wrong for this blueprint.

### Cursor

Cursor sizing derives from `ctaFontSize` via `CURSOR_REL_CTA`. Use inline SVG with `viewBox` for resolution-independent rendering. Add a drop-shadow filter (`stdDeviation`, `floodOpacity` per How to Choose) for depth.

## Layout

Hero and CTA share the same screen center sequentially. Both are absolutely positioned and centered via flex. Cursor is positioned independently — its motion path lands offset from center (where a human would naturally aim).

```html
<div
  class="stage"
  style="position: absolute; inset: 0;
     display: flex; align-items: center; justify-content: center;
     background: {sceneBg};"
>
  <!-- Phase 1+2: Hero (will exit during morph) -->
  <div class="hero" id="hero">
    <h1 class="hero-text">{Brand}</h1>
    <div class="hero-logo">
      <svg class="logo-svg">...</svg>
    </div>
  </div>

  <!-- Phase 2+: CTA (initially scale 0, pops in during morph) -->
  <div class="cta" id="cta" style="position: absolute; z-index: 10;">
    <span class="cta-text">{ctaCopy}</span>
  </div>

  <!-- Phase 3+: Cursor (initially opacity 0, hard-cuts in) -->
  <div class="cursor" id="cursor" style="position: absolute; z-index: 100; opacity: 0;">
    <svg class="cursor-svg">...</svg>
  </div>
</div>
```

## Phase 1: Hero Entrance + Breathing Idle

Two layered animations on the hero:

1. **Spring entrance** — `opacity` 0 → 1 and `y` from `+INTRO_Y_PX` to 0
2. **Breathing rotation** on the logo only — onUpdate sine, ±`LOGO_ROT_AMP_DEG` amplitude

The breathing rotation runs continuously from `t = 0`; it's invisible until the entrance fades the hero in.

```js
tl.fromTo(
  ".hero",
  { opacity: 0, y: INTRO_Y_PX },
  { opacity: 1, y: 0, duration: INTRO_DUR, ease: "power3.out" },
  INTRO_START,
);

// Subtle breathing rotation on the logo only (onUpdate form, reads tl.time()).
// Sized so the comp shows just under one full cycle — alive but barely perceptible.
const logoEl = document.querySelector(".hero-logo");
tl.to(
  { tick: 0 },
  {
    tick: 1,
    duration: TOTAL_DUR,
    ease: "none",
    onUpdate: function () {
      const t = tl.time();
      gsap.set(logoEl, { rotation: Math.sin(t * LOGO_ROT_FREQ) * LOGO_ROT_AMP_DEG });
    },
  },
  0,
);
```

Why not scale-breath too? Sub-`SCALE_BREATH_THRESHOLD` scale modulation is below the visual threshold for most viewers, and including it complicates the morph exit (the exit tween's `scale: EXIT_SCALE` has to overwrite the breath). Skip it; rotation alone reads as alive.

## Phase 2: Scale-Swap Morph (Core Transition)

Single trigger `MORPH_AT`. Three tween clusters fire concurrently:

1. **Hero shrinks** (`scale 1 → EXIT_SCALE`)
2. **Hero opacity** (`1 → 0`) — completes faster than the shrink (`MORPH_FADE_DUR` ≈ a small fraction of `MORPH_EXIT_DUR`) so the fade lands before the shrink finishes
3. **CTA pops in** (`scale 0 → 1`, `opacity 0 → 1`) with `back.out(${BOUNCE_FACTOR})` overshoot

```js
// CTA initial state — set before the timeline runs so it's invisible pre-morph.
gsap.set("#cta", { scale: 0, opacity: 0 });
gsap.set(".cta-text", { opacity: 0, y: TEXT_REVEAL_Y_PX });

// (1) Hero shrinks
tl.to("#hero", { scale: EXIT_SCALE, duration: MORPH_EXIT_DUR, ease: "power3.out" }, MORPH_AT);

// (2) Hero fades fast (small fraction of MORPH_EXIT_DUR)
tl.to("#hero", { opacity: 0, duration: MORPH_FADE_DUR, ease: "power2.out" }, MORPH_AT);

// (3) CTA pops in with overshoot
tl.to(
  "#cta",
  { scale: 1, opacity: 1, duration: MORPH_ENT_DUR, ease: `back.out(${BOUNCE_FACTOR})` },
  MORPH_AT,
);

// (4) CTA text reveals slightly after the container reaches recognizable scale.
tl.to(
  ".cta-text",
  { opacity: 1, y: 0, duration: TEXT_REVEAL_DUR, ease: "power2.out" },
  TEXT_REVEAL_AT,
);
```

See [scale-swap-transition](../rules/scale-swap-transition.md) for the full pattern and ease mapping.

## Phase 3: Cursor Motion Path

The cursor enters from beyond the viewport's bottom-right and follows a spring path toward a target slightly offset from center (where a human would naturally aim — not dead-center on the button, but a hair right and below).

```js
// W and H are the composition's data-width / data-height (real numbers in the example).
const CURSOR_START_X = W + CURSOR_OFFSCREEN_X_PX;
const CURSOR_START_Y = H + CURSOR_OFFSCREEN_Y_PX;
const CURSOR_TARGET_X = W / 2 + CURSOR_TARGET_OFFSET_X_PX; // slightly right of center
const CURSOR_TARGET_Y = H / 2 + CURSOR_TARGET_OFFSET_Y_PX; // slightly below center

// Cursor initial position (off-screen) + scale 1 (no entrance scale).
gsap.set("#cursor", {
  x: CURSOR_START_X,
  y: CURSOR_START_Y,
  scale: 1,
});

// HARD-CUT opacity. Cursors appear instantly — they don't fade in.
// A near-zero-duration tween creates a step change that scrubs correctly.
tl.fromTo(
  "#cursor",
  { opacity: 0 },
  { opacity: 1, duration: HARD_CUT_DUR, ease: "none" },
  CURSOR_ENTER_AT,
);

// Spring-driven approach path.
tl.to(
  "#cursor",
  { x: CURSOR_TARGET_X, y: CURSOR_TARGET_Y, duration: CURSOR_PATH_DUR, ease: "power2.out" },
  CURSOR_ENTER_AT,
);
```

**Why hard-cut opacity, not a fade?** Real cursors don't fade in — they instantly appear at their last known position. A fade-in cursor looks like a ghost. Use a `fromTo` with a near-zero `HARD_CUT_DUR` to create a step change rather than a smooth transition.

**Why offset target, not dead-center?** Click targets are typically off-center by a small handful of pixels when a user clicks — the cursor lands where the eye + hand coordinate to, which has a slight bias toward the visible center of mass of the button. Dead-center lands too perfectly and reads as scripted.

## Phase 4: Physics-Based Press (Core Interaction)

Two scale tweens applied to **both** the CTA and the cursor simultaneously. The synchronized deformation is what sells the contact — the cursor "pushes into" the button.

```js
// Press DOWN — both elements compress to (1 - PRESS_INTENSITY).
tl.to(
  ["#cta", "#cursor"],
  {
    scale: 1 - PRESS_INTENSITY,
    duration: CLICK_DOWN_DUR,
    ease: "power3.out",
  },
  CLICK_DOWN_AT,
);

// RELEASE — back to 1.0.
tl.to(
  ["#cta", "#cursor"],
  {
    scale: 1.0,
    duration: CLICK_UP_DUR,
    ease: "power2.out",
  },
  CLICK_UP_AT,
);
```

The single targets array `["#cta", "#cursor"]` is what makes this tactile. Don't split into separate per-element tweens with subtly different eases — the slightest desync breaks the "they're touching" illusion.

See [physics-press-reaction](../rules/physics-press-reaction.md) for press intensity recommendations and the optional inner-glow variation.

### Press composes with entrance via GSAP overwrite

By the time the click arrives at `CLICK_DOWN_AT`, the CTA's entrance tween settled long ago (at `MORPH_AT + MORPH_ENT_DUR`). The press tween's `scale: 1 - PRESS_INTENSITY` overwrites cleanly, then `scale: 1.0` overwrites back. No math composition needed — GSAP's `overwrite: "auto"` handles it.

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Hero entry spring settles at INTRO_START + INTRO_DUR. MORPH_AT is well later —
  enough time for the breathing rotation to be visible and read as "alive."

Phase 2 → Phase 3:
  CTA entrance settles at MORPH_AT + MORPH_ENT_DUR. CURSOR_ENTER_AT lands shortly
  after, with TEXT_REVEAL_AT + TEXT_REVEAL_DUR completing before the cursor arrives.

Phase 3 → Phase 4:
  Cursor path ends at CURSOR_ENTER_AT + CURSOR_PATH_DUR.
  CLICK_DOWN_AT MUST equal CURSOR_ENTER_AT + CURSOR_PATH_DUR — the press fires
  at the exact moment the cursor lands. This synchronization is intentional:
  the eye sees the cursor land AND the button compress as one event.

Phase 4 → end:
  Release tween ends at CLICK_UP_AT + CLICK_UP_DUR.
  Composition continues to TOTAL_DUR (≥ CLICK_UP_AT + CLICK_UP_DUR + climax-dwell)
  to let the recoil read clearly.
```

## How to Choose Values

### Sizing ratios (CSS, derived from `data-height`)

- **HERO_FONT_RATIO** — hero text size as a fraction of `data-height`.
  - Range: 0.24-0.34 (smaller = more headroom; larger = stronger morph contrast)
  - Constraints: hero group width should fill 60-80% of viewport width
  - Reference: examples/cta-morph-press.html uses ~0.20 (220 px at 1080)
- **HERO_LETTER_SPACING_EM** — tracking on the hero text.
  - Range: -0.05em to 0em (tighter at larger sizes)
- **HERO_ICON_RATIO** — logo/icon size as a multiple of hero font size.
  - Range: 1.0-2.5 (1.0 = icon-sized to lowercase x-height; 2.5 = oversized accent)
- **CTA_FONT_RATIO** — CTA text size as a fraction of `data-height`.
  - Range: 0.08-0.12
  - Reference: examples/cta-morph-press.html uses ~0.10 (110 px at 1080)
- **CTA_PADDING_V_RATIO / CTA_PADDING_H_RATIO** — padding multiples of `ctaFontSize`.
  - Range: V 0.5-0.8, H 1.5-2.2 (wider ratios produce pill shape)
- **CTA_MAX_REL_HERO** — max CTA width as a fraction of hero group width.
  - Range: 0.5-0.8; values above 0.8 invert the morph illusion (expansion, not condensation)
- **CURSOR_REL_CTA** — cursor SVG size as a multiple of CTA font size.
  - Range: 1.0-1.3
- **Cursor drop-shadow** — `stdDeviation` and `floodOpacity` on the `feDropShadow` filter.
  - Range: stdDeviation 2-5; floodOpacity 0.25-0.5

### Phase timing (seconds, on the timeline)

- **INTRO_START** — when the hero entrance begins.
  - Range: 0.1-0.4 s (small lead-in keeps the open frame clean)
- **INTRO_DUR** — hero fade/rise spring settle.
  - Range: 0.35-0.7 s
- **MORPH_AT** — when the hero-to-CTA swap fires.
  - Constraints: must be ≥ `INTRO_START + INTRO_DUR + presence-dwell` (presence-dwell 1-2 s so the hero "lands" before transforming)
- **MORPH_EXIT_DUR** — hero shrink duration.
  - Range: 0.35-0.7 s
- **MORPH_FADE_DUR** — hero opacity fade duration.
  - Constraints: ~25-40% of `MORPH_EXIT_DUR` — fade must complete well before the shrink ends so the hero is gone before it lands at small scale
- **MORPH_ENT_DUR** — CTA pop-in duration.
  - Range: 0.35-0.6 s; matched roughly to `MORPH_EXIT_DUR` for overlap symmetry
- **TEXT_REVEAL_AT** — when CTA inner text fades in.
  - Constraints: must be > `MORPH_AT + (MORPH_ENT_DUR × 0.3)` so the container is past micro-scale frames before text appears
- **TEXT_REVEAL_DUR** — CTA text fade-in.
  - Range: 0.2-0.45 s
- **CURSOR_ENTER_AT** — when the cursor hard-cuts onto stage.
  - Constraints: must be > `MORPH_AT + MORPH_ENT_DUR` so the CTA is fully present before the cursor arrives
- **CURSOR_PATH_DUR** — cursor approach duration.
  - Range: 0.7-1.4 s; faster reads as urgent, slower reads as deliberate
- **CLICK_DOWN_AT** — when the press fires.
  - Constraints: MUST equal `CURSOR_ENTER_AT + CURSOR_PATH_DUR` — the cursor must arrive exactly when the press begins, or the eye perceives the cursor "tapping air"
- **CLICK_DOWN_DUR** — compression duration.
  - Range: 0.08-0.2 s
- **CLICK_UP_AT** — when the release fires.
  - Constraints: must be > `CLICK_DOWN_AT + CLICK_DOWN_DUR`, with an optional brief hold (0.05-0.4 s) for "thinking" presses
- **CLICK_UP_DUR** — release duration.
  - Range: 0.2-0.4 s
- **TOTAL_DUR** — composition length.
  - Constraints: ≥ `CLICK_UP_AT + CLICK_UP_DUR + 1 s` (climax dwell after the release)

### Physics

- **EXIT_SCALE** — hero target scale during morph exit.
  - Range: 0.5-0.75; smaller values condense more dramatically but risk reading as "shrink to nothing" before the fade catches up
- **PRESS_INTENSITY** — how deep the press compression goes.
  - Range: 0.05 (subtle) - 0.10 (standard) - 0.15 (heavy)
  - Constraints: applied as `scale: 1 - PRESS_INTENSITY`
- **BOUNCE_FACTOR** — `back.out(${BOUNCE_FACTOR})` overshoot on the CTA pop-in.
  - Range: 1.4 (soft) - 2.0 (firm) - 2.8 (cartoony)

### Entry / cursor positioning

- **INTRO_Y_PX** — initial y offset for the hero rise (positive = comes from below).
  - Range: 24-60 px
- **TEXT_REVEAL_Y_PX** — initial y offset for the CTA text reveal.
  - Range: 6-16 px
- **CURSOR_OFFSCREEN_X_PX / CURSOR_OFFSCREEN_Y_PX** — how far beyond the viewport the cursor starts (added to `W` / `H`).
  - Range: 50-300 px each; larger values make the approach path more dramatic
- **CURSOR_TARGET_OFFSET_X_PX / CURSOR_TARGET_OFFSET_Y_PX** — how far the click lands off viewport center (positive X = right of center; positive Y = below).
  - Range: ±30-150 px; small non-zero offsets avoid "scripted" dead-center landings
- **HARD_CUT_DUR** — near-zero duration for cursor opacity step.
  - Range: 0.001-0.01 s; must be small enough to read as instant under HF's frame-stepped seeking

### Idle breathing

- **LOGO_ROT_AMP_DEG** — peak rotation amplitude on the logo (degrees).
  - Range: 2-6°; bigger reads as a "wobble", smaller below the perception threshold
- **LOGO_ROT_FREQ** — sine argument coefficient (`Math.sin(t * LOGO_ROT_FREQ)`).
  - Range: 0.5-1.5; lower = slower breath
- **SCALE_BREATH_THRESHOLD** — minimum scale amplitude that's perceptible; used to justify omitting scale breath.
  - Reference: ~0.012 (anything smaller is below the visual threshold for most viewers)

### Tokens

- **{Brand}** — brand text content for the hero
- **{ctaCopy}** — CTA button copy
- **{sceneBg}** — scene background (solid color or gradient)
- **{font}** / **{monoFont}** — typographic stack(s) used across hero and CTA

## Critical Constraints

- **Z-index on CTA** above the hero (`z-index: 10`) — hides exit residue during the brief overlap window.
- **Z-index on cursor** above everything (`z-index: 100`) — must visibly sit on top of the CTA during the click.
- **Same transform origin**: Hero and CTA both centered at the viewport center via flex. Different origins reveal the swap as "shrink + pop somewhere else."
- **Synchronized press**: `["#cta", "#cursor"]` as a single GSAP target array, not two separate tweens. Same ease, same duration, same start time.
- **Cursor hard-cut opacity**: `fromTo(... duration: 0.001 ...)` — a near-zero tween creates a step change. Don't fade in cursors.
- **Click timing order**: `CLICK_UP_AT > CLICK_DOWN_AT`, always. Reversed values invert the press (scale up first, then down) which reads as a misplay.
- **GSAP `set()` for initial states**: `gsap.set("#cta", { scale: 0, opacity: 0 })` and `gsap.set("#cursor", { x: …, y: …, scale: 1, opacity: 0 })` before the timeline tweens. This makes pre-phase invisibility explicit and seek-safe.
- **Text reveal after container**: CTA inner text fades in at `MORPH_AT + 0.17 s`, after the container reaches recognizable scale. Otherwise the text pops in at micro-scale during the spring's early frames.
- **Breathing rotation on logo only**: Not on the whole hero — the hero's scale is later overwritten by the morph exit. Limiting breath to the logo prevents conflicts.
- **GSAP transform aliases only**: `scale`, `x`, `y`, `rotation`. Never `width` / `height` / `left` / `top`.
- **No `Math.random` / `Date.now`**: All timing is hard-coded; the breathing onUpdate reads only `tl.time()`.
- **Single paused timeline**: All four phases on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.

## Spring → GSAP Ease Cheatsheet (this blueprint)

| Source spring                                    | This blueprint uses                                              |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| Spring, low overshoot — hero entrance            | `power3.out` over `INTRO_DUR`                                    |
| Spring, low overshoot — hero morph exit          | `power3.out` over `MORPH_EXIT_DUR`                               |
| Spring, light mass with overshoot — CTA entrance | `back.out(${BOUNCE_FACTOR})` over `MORPH_ENT_DUR`                |
| Spring, heavily damped — cursor approach path    | `power2.out` over `CURSOR_PATH_DUR`                              |
| Spring, high stiffness short — click down        | `power3.out` over `CLICK_DOWN_DUR`                               |
| Spring, medium stiffness — click up              | `power2.out` over `CLICK_UP_DUR`                                 |
| Continuous sine — logo rotation breath           | `onUpdate` with `Math.sin(t * LOGO_ROT_FREQ) * LOGO_ROT_AMP_DEG` |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [cta-morph-press.html](../examples/cta-morph-press.html) — concrete realization of this four-phase arc on a single paused GSAP timeline. See the file for the brand, copy, asset, color, font, and timing values it instantiates.
