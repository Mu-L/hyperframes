---
id: takeover-ticker-displace
role: takeover
duration_seconds: [5, 8]
phases: 4
visual_arc: text-assembly → ticker-cycle → hero-displacement → idle
uses_rules: [vertical-spring-ticker, reactive-displacement, sine-wave-loop]
element_roles:
  text_group: Combined typewriter + ticker that builds textual context, then gets displaced as a unit
  hero: Visual element (logo, icon, product) that enters from off-screen and takes over by pushing text away
when_to_use:
  - Text cycles through multiple options before a hero takes over
  - Hero feels like it has physical "weight" — it pushes content aside
  - Transition from text to visual should be a physical collision, not a fade
when_not_to_use:
  - Text and hero coexist throughout — see brand-reveal-assemble-zoom
  - Camera zoom required (this uses entry translation)
  - Multiple hero elements enter simultaneously
  - Text should exit voluntarily (fade / slide)
triggers:
  [rolling text then logo, push text away, slot machine, text cycles, logo enters forcefully]
---

# Takeover · Ticker Displace (HyperFrames)

Text builds context (typewriter + ticker) → hero enters from off-screen → hero physically pushes text out → hero settles into breathing.

Same four-phase arc; one paused GSAP timeline; the displacement maps to [reactive-displacement](../rules/reactive-displacement.md) and the breathing uses the multiplicative form of [sine-wave-loop](../rules/sine-wave-loop.md) (because the hero lands at a non-1 scale).

## When to Use

- Scene has a text-building phase with cycling/rolling words
- A visual hero element should dramatically replace the text
- The transition should feel physical (collision/push), not smooth (fade/zoom)
- Final state is the hero element alone with subtle idle motion

## Phase Pipeline

All boundaries are in **seconds**.

| Phase | Time window (s)                 | What Happens                                       | Skill Reference                                                             |
| ----- | ------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| 1     | `0 – typeEnd`                   | Static text reveals via typewriter (smooth slice)  | Simple typewriter — continuous `Math.floor(progress)` slice                 |
| 2     | `ticker1 – ticker2 – tickerEnd` | Accent word cycles via vertical ticker             | [vertical-spring-ticker](../rules/vertical-spring-ticker.md)                |
| 3     | `displaceStart – displaceEnd`   | Hero enters off-screen, physically pushes text out | [reactive-displacement](../rules/reactive-displacement.md)                  |
| 4     | `idleStart – end`               | Hero breathes                                      | [sine-wave-loop](../rules/sine-wave-loop.md) (multiplicative onUpdate form) |

## Layout Strategy

Unlike shared-flex layouts (see [brand-reveal-assemble-zoom](brand-reveal-assemble-zoom.md)), this pattern uses **absolute stacking** — text group and hero occupy the same centered space; `z-index` controls layering during the overlap window.

```html
<div
  class="stage"
  style="position: absolute; inset: 0;
     display: flex; align-items: center; justify-content: center;
     overflow: hidden;"
>
  <!-- Text group: typewriter + ticker, displaced as a single unit -->
  <div
    class="text-group"
    style="position: absolute; display: flex;
       flex-direction: row; align-items: center; gap: 20px;"
  >
    <div class="typewriter">
      <span class="typewriter-text"></span>
    </div>
    <div class="ticker-window">
      <div class="ticker-stack">
        <!-- N ticker items, one per cycled word -->
        <div class="ticker-item">{w1}</div>
        <div class="ticker-item">{w2}</div>
        <div class="ticker-item">{w3}</div>
      </div>
    </div>
  </div>

  <!-- Hero: enters off-screen, ends up centered. z-index above text during overlap. -->
  <div
    class="hero"
    style="position: absolute; z-index: 20;
       width: 400px; height: 400px;
       display: flex; align-items: center; justify-content: center;"
  >
    <img src="{heroAsset}" alt="{Brand}" />
  </div>
</div>
```

The text group is a flex row containing typewriter (static) and ticker (rolling) side by side. They animate together as a unit during Phase 3 — both inherit the `text-group` parent's transform.

## Phase 1: Typewriter Text Reveal

Continuous per-character typing using the **smooth slice** variation from [discrete-text-sequence](../rules/discrete-text-sequence.md). The displayed text is a _function_ of progress, not a lookup table.

```js
const FULL_TEXT = "{phrase}"; // the static lead-in phrase
const textEl = document.querySelector(".typewriter-text");
const typeProxy = { progress: TYPE_START_LEN };

tl.to(
  typeProxy,
  {
    progress: FULL_TEXT.length,
    duration: TYPE_DUR,
    ease: "none",
    onUpdate: () => {
      const len = Math.floor(typeProxy.progress);
      const next = FULL_TEXT.slice(0, len);
      if (textEl.textContent !== next) textEl.textContent = next;
    },
  },
  TYPE_START,
);
```

## Phase 2: Vertical Ticker

Slot-machine scrolling with one tween per transition. For N items (the ticker cycles through N words sequentially), use N-1 tweens that each translate the stack up by one `ITEM_HEIGHT`. The set is a short list of conceptually-parallel words that build context before the takeover.

Each `tl.to(.ticker-stack, { y: "-=ITEM_HEIGHT", ease: "back.out(${BOUNCE_FACTOR})" })` is a single step in the ticker. See [vertical-spring-ticker](../rules/vertical-spring-ticker.md) for the full pattern.

```js
tl.to(
  ".ticker-stack",
  {
    y: `-=${ITEM_HEIGHT}`,
    duration: STEP_DUR,
    ease: `back.out(${BOUNCE_FACTOR})`,
  },
  TICKER1_AT,
);

tl.to(
  ".ticker-stack",
  {
    y: `-=${ITEM_HEIGHT}`,
    duration: STEP_DUR,
    ease: `back.out(${BOUNCE_FACTOR})`,
  },
  TICKER2_AT,
);
```

Accent words use a distinct `font-weight` and `color` (e.g. `{accentColor}` token) to visually separate from the typewriter text.

## Phase 3: Reactive Displacement (Core Glue)

Three concurrent tweens at the same timeline position, with carefully-tuned durations. The source pattern achieved the causal link via a single `spring()` read three times; in GSAP we achieve it with three tweens that **start at the same position** and **end at fractional multiples of the intruder's duration**.

```js
// (1) Hero enters with rotation + scale impact. Lands at HERO_FINAL_SCALE (overshoot).
tl.fromTo(
  ".hero",
  { x: OFFSCREEN_X, scale: HERO_START_SCALE, rotation: HERO_START_ROT, opacity: 0 },
  {
    x: 0,
    scale: HERO_FINAL_SCALE,
    rotation: 0,
    opacity: 1,
    duration: HERO_DUR,
    ease: "power2.out", // heavy-spring equivalent (gentle ease over longer duration)
  },
  DISPLACE_AT,
);

// (2) Text group pushed opposite the intruder's entry. Completes at PUSH_FRACTION of hero duration.
tl.to(
  ".text-group",
  { x: PUSH_DIST, duration: HERO_DUR * PUSH_FRACTION, ease: "power2.out" },
  DISPLACE_AT,
);

// (3) Text group fades. Completes at FADE_FRACTION — slightly before the push lands.
tl.to(
  ".text-group",
  { opacity: 0, duration: HERO_DUR * FADE_FRACTION, ease: "power2.out" },
  DISPLACE_AT,
);
```

### Why heavy-spring inertia matters in the source

A higher-mass spring in the source adds inertia — the hero feels heavy and "lands" rather than zips in. In GSAP this is recreated by using a **longer duration** with a gentle ease (`power2.out`). The numerical config differs but the perceptual result is identical.

### Why the victim completes at a fraction of the driver

The eye reads collision as "instant impact, then push residue." If both the hero and text moved over the same duration, the push would feel like a parallel motion — not a consequence of the collision. Shortening the text's timeline to roughly half (or less) of the hero's makes the push feel like a _reaction_, not a coincidence. See `PUSH_FRACTION` / `FADE_FRACTION` in How to Choose Values.

### Directional Logic

Hero enters from positive X → text is displaced in negative X direction (momentum transfer). Reversing this breaks the physical metaphor. For a hero entering from the top, push the text down.

## Phase 4: Breathing

The hero lands at a non-1 scale (`HERO_FINAL_SCALE` from the impact overshoot). The breath must **multiply** onto that final scale; it cannot just yoyo around 1 or it will fight the impact landing.

Use **dual frequencies** on scale and rotation so the breath feels organic, not mechanical. See [sine-wave-loop](../rules/sine-wave-loop.md) (multiplicative onUpdate form).

```js
const heroEl = document.querySelector(".hero");

tl.to(
  { tick: 0 },
  {
    tick: 1,
    duration: TOTAL - IDLE_START,
    ease: "none",
    onUpdate: function () {
      const idleTime = Math.max(0, tl.time() - IDLE_START);
      const omegaS = (idleTime / SCALE_PERIOD) * Math.PI * 2;
      const omegaR = (idleTime / ROTATE_PERIOD) * Math.PI * 2;
      gsap.set(heroEl, {
        scale: HERO_FINAL_SCALE * (1 + Math.sin(omegaS) * SCALE_AMP),
        rotation: HERO_FINAL_ROTATION + Math.sin(omegaR) * ROTATE_AMP,
      });
    },
  },
  IDLE_START,
);
```

**Why two periods?** Synchronized scale + rotation reads as a single "tilt-pulse" beat and feels mechanical. Different periods (not a simple ratio) keep the scale and rotation cycles interfering rather than locking, producing organic motion.

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Typewriter completes at TYPE_START + TYPE_DUR.
  TICKER1_AT ≥ typewriter end + READ_BEAT (gives the eye time to read the static text).

Phase 2 → Phase 3:
  Last ticker step ends at TICKER2_AT + STEP_DUR.
  DISPLACE_AT ≥ that end + SETTLE_BEAT (lets the final ticker word settle and read).

Phase 3 → Phase 4:
  Hero entry ends at DISPLACE_AT + HERO_DUR.
  IDLE_START ≥ entry_end + SPRING_TAIL_BUFFER (spring tail dissipates).
  Breathing onUpdate is gated by IDLE_START — it doesn't start before then because
  the dummy tick tween itself is scheduled at IDLE_START.
```

## How to Choose Values

- **TYPE_START** — when the typewriter begins (phase 1 anchor)
  - Range: usually `0`
  - Effects: any non-zero value adds dead air at the front of the composition
  - Constraints: must leave room for the full typewriter before TICKER1_AT
  - Reference: example starts at 0

- **TYPE_DUR** — typewriter total duration
  - Range: 0.5-1.0 s for a short phrase; scale with character count
  - Effects: short = staccato; long = readable but slow
  - Constraints: should resolve well before TICKER1_AT
  - Reference: example uses a sub-second duration for a short phrase

- **TYPE_START_LEN** — characters already showing when typing begins
  - Range: 0-5 characters
  - Effects: 0 = empty line that suddenly grows; higher = stable head, partial reveal
  - Constraints: < FULL_TEXT.length; > 0 prevents a 1-character pop on first frame
  - Reference: example uses a small positive value

- **ITEM_HEIGHT** — ticker item box height in pixels (must match CSS)
  - Range: `FONT_SIZE × line-height` (≈ font-size × 1.2)
  - Effects: must equal the rendered text line height, or items show partially
  - Constraints: container height, item height, and translate-Y step all use this exact value
  - Reference: example uses font-size × 1.2

- **TICKER1_AT / TICKER2_AT** — ticker step anchors
  - Range: phase-dependent; spacing typically 1.5-2.0 s apart
  - Effects: too tight = words blur together; too loose = ticker stalls
  - Constraints: TICKER1_AT ≥ TYPE_START + TYPE_DUR + READ_BEAT (≈ 1 s)
  - Reference: example schedules two ticker steps with comfortable reading gaps

- **STEP_DUR** — duration of one ticker translate
  - Range: 0.4-0.7 s
  - Effects: short = snappy slot machine; long = lazy roll
  - Constraints: shorter than the gap between consecutive ticker anchors
  - Reference: example sits mid-range

- **BOUNCE_FACTOR** — `back.out()` coefficient on ticker steps
  - Range: 1.2-1.8 (discrete choice within `back.out` family)
  - Effects: low = firm stop; high = overshoot/spring
  - Constraints: keep consistent across ticker steps
  - Reference: example uses a moderate overshoot

- **DISPLACE_AT** — when phase 3 begins
  - Range: phase-dependent
  - Effects: too early cuts off the ticker; too late stalls the comp
  - Constraints: DISPLACE_AT ≥ TICKER2_AT + STEP_DUR + SETTLE_BEAT (≈ 0.8 s)
  - Reference: example schedules after the last ticker word settles

- **HERO_DUR** — full hero entry duration
  - Range: 0.6-1.2 s
  - Effects: short = zippy; long = heavy/landed (recreates `mass > 1` springs in source)
  - Constraints: ease stays `power2.out` for this "heavy land" feel
  - Reference: example uses a long-side duration for inertia

- **OFFSCREEN_X** — hero's starting X offset (off-stage)
  - Range: enough that the hero is fully outside the frame at scale = HERO_START_SCALE
  - Effects: smaller values leak the hero into view at start; very large values waste motion budget
  - Constraints: sign sets entry direction (positive = enters from right)
  - Reference: example uses several hundred px

- **HERO_START_SCALE / HERO_START_ROT** — hero's initial transform
  - Range: scale 0.4-0.7; rotation ±20-60°
  - Effects: lower scale + larger rotation = more violent impact arc
  - Constraints: must land at HERO_FINAL_SCALE / 0° rotation by end of entry
  - Reference: example uses moderate values

- **HERO_FINAL_SCALE** — landing scale after impact overshoot
  - Range: 1.0-1.4
  - Effects: 1.0 = no overshoot (feels light); > 1 = visible "presence" at rest
  - Constraints: phase 4 breathing MUST multiply on this (not yoyo around 1) or impact undoes itself
  - Reference: example lands above 1.0

- **HERO_FINAL_ROTATION** — landing rotation (degrees)
  - Range: usually 0
  - Effects: nonzero values make the hero rest tilted; rarely desired
  - Constraints: phase 4 breathing oscillates around this value
  - Reference: example uses 0

- **PUSH_DIST** — text translate distance during displacement
  - Range: 100-300 px (sign opposite the hero's entry direction)
  - Effects: small = barely-shoved; large = aggressive push
  - Constraints: sign must be opposite OFFSCREEN_X for momentum transfer
  - Reference: example uses a moderate push opposite the hero's direction

- **PUSH_FRACTION** — fraction of HERO_DUR for the text push
  - Range: 0.4-0.5
  - Effects: < 0.4 = push reads instantaneous; > 0.5 = parallel motion, not a reaction
  - Constraints: hard ceiling ~0.6 before causality reads break
  - Reference: example sits at 0.5

- **FADE_FRACTION** — fraction of HERO_DUR for the text opacity fade
  - Range: 0.3-0.5 (typically ≤ PUSH_FRACTION so fade leads push by a hair)
  - Effects: lower = text vanishes first then push completes empty space; higher = text rides the push longer
  - Constraints: ≤ PUSH_FRACTION
  - Reference: example uses ~0.4

- **IDLE_START** — when phase 4 breathing begins
  - Range: DISPLACE_AT + HERO_DUR + SPRING_TAIL_BUFFER (≥ ~1 s of buffer)
  - Effects: too early = breathing fights the spring tail; too late = static dead air
  - Constraints: buffer should allow the perceived spring to dissipate
  - Reference: example begins after a ~1 s buffer

- **TOTAL** — composition total duration (matches `data-duration`)
  - Range: 5-8 s for this blueprint
  - Effects: longer extends the breathing tail; shorter cuts it
  - Constraints: must equal root `data-duration`
  - Reference: see example's `data-duration`

- **SCALE_PERIOD / ROTATE_PERIOD** — breathing cycle lengths
  - Range: 0.8-2.0 s each
  - Effects: short = fast pulse; long = slow drift
  - Constraints: must NOT be a simple integer ratio (1:1, 2:1) — pick incommensurate values so cycles interfere
  - Reference: example uses two close-but-unrelated periods near 1 s

- **SCALE_AMP** — breathing scale amplitude (multiplicative)
  - Range: 0.02-0.08 (final scale oscillates by ±SCALE_AMP × HERO_FINAL_SCALE)
  - Effects: small = subtle breath; large = pulsing
  - Constraints: keep small; this is idle motion, not animation
  - Reference: example uses a low-single-digit percent

- **ROTATE_AMP** — breathing rotation amplitude (degrees)
  - Range: 1-5°
  - Effects: small = barely visible sway; large = wobble
  - Constraints: pair with rotation period that doesn't lock with scale period
  - Reference: example uses a few degrees

## Critical Constraints

- **Three concurrent tweens, same timeline position**: This is the causal link. Drift the start times and the displacement feels like two separate animations playing in parallel, not collision-and-reaction.
- **Victim duration < driver duration**: Push completes at PUSH_FRACTION × driver duration (~0.4-0.5). Anything ≥ 0.7 loses the "impact" feel.
- **Z-index layering**: Hero `z-index: 20`, text-group no z-index. Without this, the text's fading edges peek through the hero.
- **Hero lands at non-1 scale**: The impact overshoots to HERO_FINAL_SCALE. The breathing must **multiply** onto this; using a `fromTo` yoyo with `scale: 1` would overwrite HERO_FINAL_SCALE and undo the impact.
- **Ticker height triangle**: Container height, item height, and translateY all use the same `ITEM_HEIGHT` value. Mismatch = items half-visible at rest.
- **Directional consistency**: Hero entry direction (sign of OFFSCREEN_X) and text push direction (sign of PUSH_DIST) must be opposite — momentum transfer.
- **Dual breathing periods**: Use incommensurate periods for scale vs rotation. Equal or simple-ratio periods sync up and look mechanical.
- **Single paused timeline**: All four phases on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.
- **GSAP transform aliases only**: `x`, `y`, `scale`, `rotation`. Never `left`/`top`/`width`/`height`.

## Spring → GSAP Ease Cheatsheet (this blueprint)

| Source spring                                             | This blueprint uses                      |
| --------------------------------------------------------- | ---------------------------------------- |
| Snappy spring on ticker step                              | `back.out(${BOUNCE_FACTOR})`             |
| Heavy spring on hero impact (high mass)                   | `power2.out` over longer `HERO_DUR`      |
| Continuous breath with different scale / rotation periods | Two `Math.sin()` calls in one `onUpdate` |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [takeover-ticker-displace.html](../examples/takeover-ticker-displace.html) — typewriter phrase + three-word ticker → hero logo enters from off-screen right with rotation + scale impact → text pushed left and fades → logo breathes with dual-frequency sine. Single paused GSAP timeline drives all four phases.
