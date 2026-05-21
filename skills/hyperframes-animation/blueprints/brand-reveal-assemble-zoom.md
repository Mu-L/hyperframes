---
id: brand-reveal-assemble-zoom
role: brand-reveal
duration_seconds: [4, 6]
phases: 5
visual_arc: wide-composition → companion-exit → tight-focus → idle
uses_rules: [discrete-text-sequence, coordinate-target-zoom, sine-wave-loop]
element_roles:
  companion: Supporting element (tagline, slogan, intro text) that provides context then exits
  hero: Focal element (logo, icon, product image) that remains and receives camera focus
when_to_use:
  - Brand / logo / product reveal needs context-then-focus flow
  - Wide-shot → close-up cinematic narrowing
  - Two elements share screen, one dominates the final frame
when_not_to_use:
  - All elements remain throughout (no exit phase)
  - Scene is purely text-based, no visual hero
  - Multiple elements need equal focus
  - Interactive elements required — see cta-morph-press
triggers: [brand reveal, zoom into logo, text leads to, wide to close-up, hero focus]
---

# Brand Reveal · Assemble & Zoom (HyperFrames)

Multiple elements share screen → supporting element exits → layout recenters on hero → camera zooms into hero → idle breathing.

Same five-phase narrative arc; single paused GSAP timeline; the coordinate-zoom and breathing patterns map directly to the corresponding HF rules.

## When to Use

- Scene builds toward a single hero element (logo, icon, product)
- Supporting text appears first to provide context, then yields focus
- Final state is a close-up of the hero with subtle ambient motion
- Need progressive narrowing from wide composition to tight focus

## Phase Pipeline

All boundaries are in **seconds**.

| Phase | Time window (s)           | What Happens                                            | Skill Reference                                              |
| ----- | ------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| 1     | `TEXT_START – TEXT_END`   | Companion text assembles (discrete sequence with holds) | [discrete-text-sequence](../rules/discrete-text-sequence.md) |
| 2     | `POP_START – POP_END`     | Hero element pops in with elastic spring                | inline `back.out(${BOUNCE_FACTOR})` tween                    |
| 3     | `SLIDE_START – SLIDE_END` | Companion exits, layout recenters around hero           | See "Phase 3" below                                          |
| 4     | `ZOOM_START – ZOOM_END`   | Camera zooms into hero (scale + counter-translate)      | [coordinate-target-zoom](../rules/coordinate-target-zoom.md) |
| 5     | `BREATH_START – end`      | Hero breathes (sine onUpdate, multiplicative)           | [sine-wave-loop](../rules/sine-wave-loop.md)                 |

## Initial Layout

Two elements side-by-side in a flex row. Companion uses a fixed-width container to prevent jitter during text assembly (Phase 1) — the container width must be ≥ the maximum rendered text width. If the text overflows, `justify-content: flex-end` pushes the overflow off the _left_ edge of the container, past the viewport edge.

Hero text uses a heavier `font-weight` than the companion text — the brand name is the focal element and must read as dominant even before the companion exits.

```html
<div class="zoom-scale">
  <!-- outermost: Phase 4 scale -->
  <div class="zoom-translate">
    <!-- middle: Phase 4 counter-translation -->
    <div class="recenter-shift">
      <!-- inner: Phase 3 recenter offset -->
      <div class="layout-row">
        <div class="companion">
          <!-- fixed width, right-aligned text -->
          <span class="companion-text">{firstChar}</span>
        </div>
        <div class="brand-group">
          <span class="brand-text">{Brand}</span>
          <div class="hero">
            <!-- the icon/logo — Phase 2 pop target -->
            <img src="{heroAsset}" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

```css
.layout-row {
  display: flex;
  align-items: center;
}
.companion {
  width: COMPANION_WIDTH; /* MUST be ≥ max rendered text width */
  display: flex;
  justify-content: flex-end;
  margin-right: COMPANION_GAP;
  font-weight: COMPANION_WEIGHT; /* lighter than brand */
  white-space: nowrap;
}
.brand-group {
  display: flex;
  align-items: center;
  gap: HERO_GAP;
}
.brand-text {
  font-weight: BRAND_WEIGHT; /* heavier than companion */
}
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0);
}
```

Validate at design time: `COMPANION_WIDTH + COMPANION_GAP + brandTextWidth + HERO_GAP + HERO_SIZE < viewportWidth`. Overflow doesn't error — it just clips, often invisibly until the zoom phase makes it obvious.

## Phase 1: Companion Text Assembly

Use [discrete-text-sequence](../rules/discrete-text-sequence.md) for text typing with intentional holds. Keep the companion in a fixed-width right-aligned container so the layout doesn't shift as characters arrive.

This blueprint's sequence is monotonic (no typos, no backspaces), so a series of `tl.set` calls suffices — each entry registers a discrete state at its timestamp and GSAP applies the latest one when seeking. For sequences with edits or backspaces, use the onUpdate reverse-search form shown in the rule.

Shape: a short monotonic build-out of the companion phrase across `TEXT_START → TEXT_END`. Typical cadence — fast keystrokes (~0.06-0.13s apart), at least one pacing hold around the natural mid-pause (e.g. after the first complete word), and a final landing on the full phrase. The example file shows one concrete realization.

```js
// SEQUENCE: [{ t, text }, ...] — t in seconds, monotonically increasing,
// final entry's t === TEXT_END. See example for a concrete realization.
const textEl = document.querySelector(".companion-text");
for (const entry of SEQUENCE) {
  tl.set(textEl, { textContent: entry.text }, entry.t);
}
```

## Phase 2: Hero Pop-In

Elastic spring. Scale from 0 → 1 with a perceptible overshoot. Use a `back.out` ease for a controlled bounce that settles cleanly; for a more pronounced rubbery feel switch to `elastic.out`. See the spring → ease cheatsheet below for the family-to-feel mapping.

```js
tl.fromTo(
  ".hero",
  { scale: 0 },
  {
    scale: 1,
    duration: POP_DUR,
    ease: `back.out(${BOUNCE_FACTOR})`,
  },
  POP_START,
);
```

## Phase 3: Companion Exit & Recenter (Core Glue)

Three concurrent tweens at the same timeline position. The source pattern used a single spring read three times; the GSAP idiom is three tweens started at the same position parameter.

```js
// FINAL_RECENTER_OFFSET is a PRE-CALCULATED constant baked at author time.
// See "Recenter Offset Calculation" + How to Choose Values for derivation + range.

// (1) Companion slides out + fades.
tl.to(
  ".companion",
  {
    opacity: 0,
    x: COMPANION_EXIT_X,
    duration: SLIDE_DUR,
    ease: "power3.out",
  },
  SLIDE_START,
);

// (2) Container shifts to recenter the hero group.
tl.to(
  ".recenter-shift",
  {
    x: FINAL_RECENTER_OFFSET,
    duration: SLIDE_DUR,
    ease: "power3.out",
  },
  SLIDE_START,
);
```

### Recenter Offset Calculation

When the companion disappears, the brand group must land in the viewport center. The shift compensates for the (companion + gap) space the brand group occupied to the right of center:

```
FINAL_RECENTER_OFFSET ≈ -(COMPANION_WIDTH + COMPANION_GAP) / 2     (theoretical baseline)
                      → tune by eye for visual feel (typically smaller magnitude)
```

The tuned value often differs from the theoretical — small visual adjustments matter. Tune by eye, then **bake as a constant**. Do NOT compute dynamically per frame — sub-pixel drift accumulates across the zoom phase (which can be 5×+ magnification) and becomes a visible jitter.

## Phase 4: Camera Zoom Into Hero

Three transforms nested outside → inside:

1. **Outer (`.zoom-scale`)**: handles `scale` for the zoom magnification
2. **Middle (`.zoom-translate`)**: handles `x` / `y` counter-translation so the off-center hero ends at screen center
3. **Inner (`.recenter-shift`)**: already set by Phase 3, stays put during zoom

See [coordinate-target-zoom](../rules/coordinate-target-zoom.md) for the full pattern. Scale **must** wrap translation, never the reverse.

```js
// Hero's offset from viewport center AFTER Phase 3 recenter.
// Computed ONCE at setup (after fonts.ready, see below), then baked as const
// before any tween runs. The values feed directly into the counter-translate
// tween — never recomputed per frame.
//   baseHeroOffset = (COMPANION_WIDTH + COMPANION_GAP + brandTextWidth + HERO_GAP) / 2
//   HERO_FINAL_OFFSET_X = baseHeroOffset + FINAL_RECENTER_OFFSET
const baseHeroOffset = (COMPANION_WIDTH + COMPANION_GAP + brandTextWidth + HERO_GAP) / 2;
const HERO_FINAL_OFFSET_X = baseHeroOffset + FINAL_RECENTER_OFFSET;
// HERO_FINAL_OFFSET_Y is a baked const (companion and brand share a horizontal baseline,
// so for the symmetric layout above this is 0; adjust if the hero sits off-axis vertically).

// Outer scale
tl.to(
  ".zoom-scale",
  {
    scale: TARGET_SCALE,
    duration: ZOOM_DUR,
    ease: "power2.out",
  },
  ZOOM_START,
);

// Middle counter-translation — pulls hero from its offset position to center
tl.to(
  ".zoom-translate",
  {
    x: -HERO_FINAL_OFFSET_X,
    y: -HERO_FINAL_OFFSET_Y,
    duration: ZOOM_DUR,
    ease: "power2.out",
  },
  ZOOM_START,
);

// Brand text exits during the zoom — we don't want it filling the entire frame.
tl.to(
  ".brand-text",
  {
    opacity: 0,
    x: BRAND_EXIT_X,
    duration: ZOOM_DUR * BRAND_FADE_RATIO,
    ease: "power2.out",
  },
  ZOOM_START,
);
```

### Why `baseHeroOffset` doesn't include `heroSize`

```
Total flex width  T = C + G + B + L + S
Icon center         = C + G + B + L + S/2
Layout center       = T / 2

Offset = (C + G + B + L + S/2) − T/2
       = C/2 + G/2 + B/2 + L/2
       = (C + G + B + L) / 2
```

Where C = companionWidth, G = gap, B = brandTextWidth, L = heroGap, S = heroSize. `S` cancels. Including `S` causes the counter-translation to overshoot, landing the icon left of center.

### Measuring `brandTextWidth`

After `document.fonts.ready`, measure the brand text with a hidden DOM probe:

```js
await document.fonts.ready;
const probe = document.createElement("span");
probe.style.cssText =
  "position:absolute; left:-99999px; white-space:pre; " +
  `font: ${BRAND_WEIGHT} ${BRAND_FONT_SIZE}px ${BRAND_FONT_STACK};`;
probe.textContent = BRAND_TEXT; // must match the EXACT casing of <span class="brand-text">
document.body.appendChild(probe);
const brandTextWidth = probe.getBoundingClientRect().width;
probe.remove();
```

Then derive `HERO_FINAL_OFFSET_X` from `brandTextWidth`. Bake it as `const` before the timeline tweens are scheduled — never inside an `onUpdate`.

## Phase 5: Breathing Idle

Use the onUpdate (multiplicative) form from [sine-wave-loop](../rules/sine-wave-loop.md) — the breath **multiplies** onto the hero's pop-in scale. A `fromTo` + yoyo would overwrite the pop scale instead of adding to it, undoing the pop.

```js
// HERO_FINAL_SCALE = the scale the hero landed at after Phase 2 pop (typically 1.0).
// The breath multiplies onto this — never overwrites it.

const heroEl = document.querySelector(".hero");
const breathDur = TOTAL_DURATION - BREATH_START;

tl.to(
  { tick: 0 },
  {
    tick: 1,
    duration: breathDur,
    ease: "none",
    onUpdate: function () {
      const idleTime = Math.max(0, tl.time() - BREATH_START);
      const omega = (idleTime / SCALE_PERIOD) * Math.PI * 2;
      gsap.set(heroEl, {
        scale: HERO_FINAL_SCALE * (1 + Math.sin(omega) * SCALE_AMP),
        rotation: Math.sin(omega) * ROTATE_AMP,
      });
    },
  },
  BREATH_START,
);
```

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Companion sequence completes at TEXT_END.
  POP_START ≥ TEXT_END + small breath (~0.06s) so the two beats don't collide.

Phase 2 → Phase 3:
  Hero pop ends at POP_START + POP_DUR.
  SLIDE_START ≥ POP_START + POP_DUR + small buffer for the spring's tail to settle
  (~0.2s; the back.out overshoot needs visible settling before the next beat starts).

Phase 3 → Phase 4:
  FINAL_RECENTER_OFFSET (baked const) feeds HERO_FINAL_OFFSET_X.
  Both are pre-calculated constants — this is the critical handoff.
  ZOOM_START ≥ SLIDE_START + SLIDE_DUR + small buffer (~0.3s) so the recenter
  has visually landed before the zoom begins.

Phase 4 → Phase 5:
  Zoom ends at ZOOM_START + ZOOM_DUR.
  BREATH_START ≥ ZOOM_END + small buffer (~0.1s) — gate the breath behind the
  zoom settle so the sine doesn't fight the zoom spring's tail.
```

## How to Choose Values

### Layout constants

- **COMPANION_WIDTH** — fixed width of the companion-text container.
  - Range: must satisfy `COMPANION_WIDTH ≥ widthOf(longest SEQUENCE state)`; typically 30-50% of viewport width
  - Effects: too small → text overflows past the left edge; too large → recenter offset balloons and Phase 3 feels sluggish
  - Constraints: `COMPANION_WIDTH + COMPANION_GAP + brandTextWidth + HERO_GAP + HERO_SIZE < viewportWidth`
  - Reference: examples/brand-reveal-assemble-zoom.html uses `600px` at 1920×1080
- **COMPANION_GAP** — `margin-right` between companion and brand group.
  - Range: 0.5-1× the companion's `font-size` reads as a comfortable visual gap
  - Reference: examples uses `30px` against a 140px font size
- **HERO_GAP** — flex `gap` between brand text and hero element.
  - Range: typically smaller than `COMPANION_GAP` (the hero belongs with the brand text; the companion is a separate phrase)
  - Reference: examples uses `20px`
- **HERO_SIZE / BRAND_FONT_SIZE** — measured in viewport pixels; choose so brand text and hero read as the same weight.
  - Reference: examples uses `140px` for both
- **COMPANION_WEIGHT / BRAND_WEIGHT** — companion lighter than brand so the hero side reads as dominant even before companion exits.
  - Reference: examples uses `400` / `700`

### Phase 1 — companion assembly

- **TEXT_START** — companion begins assembling.
  - Constraints: typically 0; if you precede with another beat, ≥ that beat's end
- **TEXT_END** — companion lands on its full phrase.
  - Range: 0.4-1.0s for a ~5-10 character phrase; pick by character count × per-keystroke cadence (0.06-0.13s) + at least one pacing hold
  - Constraints: `TEXT_END < POP_START`
  - Reference: examples uses `0.67s`

### Phase 2 — hero pop

- **POP_START** — hero enters.
  - Constraints: `≥ TEXT_END + ~0.06s` (small breath after companion lands)
  - Reference: examples uses `0.73s`
- **POP_DUR** — pop tween duration.
  - Range: 0.4-0.7s; under 0.4s the bounce reads as a jolt, over 0.7s it feels lethargic
  - Reference: examples uses `0.5s`
- **BOUNCE_FACTOR** — `back.out(BOUNCE_FACTOR)` overshoot strength.
  - Range: 1.4 (soft) → 2.0 (firm pop) → 2.8 (cartoony)
  - Alternative: switch to `elastic.out(amplitude, period)` for a rubbery oscillation instead of a single overshoot
  - Reference: examples uses `2`

### Phase 3 — slide + recenter

- **SLIDE_START** — companion begins to leave.
  - Constraints: `≥ POP_START + POP_DUR + ~0.2s` (let pop spring settle before pulling the layout)
  - Reference: examples uses `1.5s`
- **SLIDE_DUR** — duration of both the companion fade and the recenter shift.
  - Range: 0.5-1.0s; both tweens MUST share this duration + ease
  - Reference: examples uses `0.7s`
- **COMPANION_EXIT_X** — how far the companion slides left as it fades.
  - Range: ~10-15% of viewport width — large enough to read as "out of frame," small enough that the motion feels intentional, not panicked
  - Reference: examples uses `-80px`
- **FINAL_RECENTER_OFFSET** — pre-calculated baked const that pulls the brand group to center.
  - Range: theoretical baseline `≈ -(COMPANION_WIDTH + COMPANION_GAP) / 2`, then tune by eye (often smaller magnitude than the baseline because brand text isn't truly point-mass at its center)
  - Constraints: must be a **constant**, not computed per frame — see Critical Constraints
  - Reference: examples uses `-180` against a `-315` theoretical baseline

### Phase 4 — zoom

- **ZOOM_START** — zoom begins.
  - Constraints: `≥ SLIDE_START + SLIDE_DUR + ~0.3s` (let recenter visually land)
  - Reference: examples uses `2.67s`
- **ZOOM_DUR** — zoom tween duration.
  - Range: 0.7-1.2s for a cinematic push; under 0.5s feels like a hard cut, over 1.5s drags
  - Reference: examples uses `0.9s`
- **TARGET_SCALE** — final zoom magnification.
  - Range: 3× (modest emphasis) → 8× (extreme close-up); hero must remain crisp at this scale (raster source: ensure source resolution ≥ `HERO_SIZE × TARGET_SCALE`)
  - Reference: examples uses `5.5×`
- **BRAND_EXIT_X** — how far the brand text slides off-screen during the zoom.
  - Range: ≥ half viewport width in magnitude so the text fully clears before zoom climaxes
  - Reference: examples uses `-600px`
- **BRAND_FADE_RATIO** — fraction of `ZOOM_DUR` over which the brand text fades.
  - Range: 0.3-0.5; fades early so the zoom climax frames only the hero
  - Reference: examples uses `0.4`

### Phase 5 — breathing idle

- **BREATH_START** — breath activates.
  - Constraints: `≥ ZOOM_START + ZOOM_DUR + ~0.1s` (avoid fighting the zoom spring's tail)
  - Reference: examples uses `3.67s`
- **HERO_FINAL_SCALE** — the scale the hero landed at after Phase 2.
  - Constraints: must match Phase 2's final scale value (typically `1.0`); the breath multiplies onto this
- **SCALE_PERIOD** — seconds per full breath cycle.
  - Range: 1.0-3.0s; ~1.5-2.0s reads as natural breathing, under 1s feels jittery, over 3s lifeless
  - Reference: examples uses `1.5s`
- **SCALE_AMP** — sine amplitude on scale (multiplicative).
  - Range: 0.02-0.06; smaller for product photography, larger for stylized logos
  - Reference: examples uses `0.04`
- **ROTATE_AMP** — sine amplitude on rotation, in degrees.
  - Range: 0-3°; pair with the scale amplitude for a subtle organic wobble (set to 0 for icons that shouldn't tilt)
  - Reference: examples uses `2`

## Critical Constraints

- **Pre-calculated offset constants**: `FINAL_RECENTER_OFFSET`, `HERO_FINAL_OFFSET_X`, `HERO_FINAL_OFFSET_Y` are constants. Computing them per frame causes sub-pixel drift that becomes a visible jitter when multiplied by the 5×+ zoom scale.
- **Scale wraps translation**: `.zoom-scale` (outer) handles `scale`; `.zoom-translate` (inner) handles `x` / `y`. Reversed nesting causes accelerated movement (translations scale with the outer scale).
- **Companion width ≥ max text width**: The fixed-width container must hold the fully-assembled companion text. Overflow is invisible during assembly but spills past the viewport edge.
- **`baseHeroOffset = (C + G + B + L) / 2`**: `heroSize` cancels out — including it makes the icon land left of center.
- **Breathing form**: Use the onUpdate (multiplicative) form so the breath layers on top of the hero's existing scale. A `fromTo` + yoyo overwrites the pop scale.
- **Breathing activation gate**: `BREATH_START ≥ zoom end + 0.1s`. Activating too early makes the breath fight the zoom spring's tail.
- **Measure text after `document.fonts.ready`**: Otherwise `getBoundingClientRect()` uses fallback font metrics and the hero offset is off by ~10–30 px.
- **GSAP transform aliases only**: `x`, `y`, `scale`, `rotation` on the three nested wrappers. Never tween `width` / `height` / `left` / `top`.
- **Single paused timeline**: All five phases live on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.

## Spring → GSAP Ease Cheatsheet (this blueprint)

| Spring feel (low damping → high damping)        | Ease family used here                                   |
| ----------------------------------------------- | ------------------------------------------------------- |
| Bouncy overshoot — elastic pop                  | `back.out(${BOUNCE_FACTOR})` or `elastic.out(amp, per)` |
| Tight, no overshoot — companion exit + recenter | `power3.out`                                            |
| Cinematic, slow settle — zoom                   | `power2.out`                                            |
| Continuous oscillation — breath                 | `sine.inOut` finite-yoyo, or onUpdate `Math.sin`        |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [brand-reveal-assemble-zoom.html](../examples/brand-reveal-assemble-zoom.html) — runnable 5-second composition that realizes every named constant in this blueprint with concrete values. Single paused GSAP timeline drives all five phases.
