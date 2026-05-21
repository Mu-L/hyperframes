---
id: demo-page-scroll-spotlight
role: demo
duration_seconds: [5, 9]
phases: 4
visual_arc: page-entry → scroll-to-feature → keyword-highlight → pop-out-emphasis
uses_rules: [3d-page-scroll, asr-keyword-glow]
element_roles:
  page_card: Full webpage recreation rendered as a tilted 3D card
  scroll_content: Page content that scrolls within the clipped card
  highlight_elements: Specific page elements that glow and scale when mentioned in voiceover
  spotlight: Radial gradient overlay that dims non-highlighted areas
when_to_use:
  - Demonstrate a specific feature within its natural UI context
  - Voiceover names features that should highlight in sync
  - Show the product "in action" without a screen recording
  - 3D perspective adds premium feel
when_not_to_use:
  - Product has no webpage or UI to recreate
  - Feature is best shown via actual screen recording
  - Scene only needs a single static product image
triggers: [show the feature, product demo, highlight on page, webpage in 3D, scroll to feature]
---

# Demo · Page Scroll Spotlight (HyperFrames)

3D tilted webpage card enters → scrolls to relevant section → elements highlight synced to voiceover → key element pops forward in 3D with a spotlight.

Same four-phase narrative arc; one paused GSAP timeline; the constituent patterns map to [3d-page-scroll](../rules/3d-page-scroll.md) and [asr-keyword-glow](../rules/asr-keyword-glow.md).

## When to Use

- Feature demo scene where voiceover walks through product capabilities
- Product has a DOM-recreated webpage component available
- Multiple elements on the page need sequential highlighting synced to ASR
- The demo should feel premium (3D depth), not flat (screenshot)

## Phase Pipeline

All boundaries are in **seconds** (local — subtract any scene start offset).

| Phase | Time window (s)               | What Happens                                                                      | Skill Reference                                             |
| ----- | ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1     | `0 – entryEnd`                | 3D page card scales in; navbar / title / CTA fade up                              | inline entry + [3d-page-scroll](../rules/3d-page-scroll.md) |
| 2     | `keywordsStart – keywordsEnd` | Title keywords glow synced to ASR words                                           | [asr-keyword-glow](../rules/asr-keyword-glow.md)            |
| 3     | `scrollStart – scrollEnd`     | Page content scrolls up to reveal the feature section                             | [3d-page-scroll](../rules/3d-page-scroll.md)                |
| 4     | `popStart – end`              | Key element pops forward in 3D (translateZ + scale) + spotlight dims surroundings | inline 3D pop + radial-gradient overlay                     |

## Layout

```html
<div class="bg"></div>
<div class="perspective-wrap">
  <div class="page-card">
    <div class="scroll-content">
      <!-- Recreated {Brand} webpage DOM: navbar, hero, features, carousel -->
      <header class="page-navbar">{navbarContents}</header>
      <section class="page-hero">
        <h1 class="hero-title">
          <!-- One <span class="kw"> per glowable word in {headlinePhrase}.
               data-glow-start / data-glow-end are the word's ASR timestamps
               in local scene seconds. Non-glowable connective words go
               between spans as plain text. -->
          <span class="kw" data-glow-start="{w1Start}" data-glow-end="{w1End}">{w1}</span>
          <span class="kw" data-glow-start="{w2Start}" data-glow-end="{w2End}">{w2}</span>
          <!-- … -->
        </h1>
        <p class="hero-sub">{subhead}</p>
        <div class="cta-row">{ctaContents}</div>
      </section>
      <section class="page-features">{featuresContents}</section>
      <section class="page-carousel">
        <div class="carousel-main pop-target">{heroAsset}</div>
        <!-- Phase 4 pop-out target -->
        <div class="carousel-side">{sideAsset}</div>
      </section>
    </div>
    <div class="spotlight"></div>
  </div>
</div>
<div class="vignette"></div>
```

```css
.perspective-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}
.page-card {
  width: 92%;
  height: 88%;
  overflow: hidden;
  border-radius: 20px;
  background: {pageBackgroundColor};
  transform-style: preserve-3d; /* required for child translateZ */
  /* tilt + initial scale set in GSAP gsap.set() so subsequent scale tweens
     preserve rotation (see Critical Constraints) */
  box-shadow:
    -30px 30px 60px rgba(0, 0, 0, 0.4),
    …;
}
.pop-target {
  --glow: 0; /* Phase 4 GSAP tweens this */
  transform-style: preserve-3d;
  transform:
    translateZ(calc(var(--glow) * var(--pop-translate-z)))
    scale(calc(1 + var(--glow) * var(--pop-scale-boost)));
}
.spotlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 850px 550px at 40% 60%,
    transparent 0%,
    transparent 50%,
    {spotlightDimColor} 100%
  );
  opacity: 0; /* GSAP fades in during Phase 4 */
  z-index: 150;
}
```

## Phase 1: Card Entry

```js
// Page card scales up from CARD_ENTRY_FROM_SCALE (already set in CSS) to 1.0.
tl.fromTo(
  ".page-card",
  { scale: CARD_ENTRY_FROM_SCALE },
  { scale: 1.0, duration: CARD_ENTRY_DUR, ease: "power2.out" },
  0,
);

// Internal elements fade in with small offsets so navbar lands first, title second, CTA last.
tl.fromTo(
  ".page-navbar",
  { opacity: 0 },
  { opacity: 1, duration: NAVBAR_FADE_DUR, ease: "power2.out" },
  0,
);
tl.fromTo(
  ".hero-title",
  { opacity: 0 },
  { opacity: 1, duration: TITLE_FADE_DUR, ease: "power2.out" },
  TITLE_FADE_AT,
);
tl.fromTo(
  ".cta-row",
  { opacity: 0 },
  { opacity: 1, duration: CTA_FADE_DUR, ease: "power2.out" },
  CTA_FADE_AT,
);
```

## Phase 2: ASR-Synced Keyword Highlighting

Each `.kw` span carries `data-glow-start` / `data-glow-end` attributes — its ASR timestamps for one word. A per-word pair of tweens drives the `--glow` custom property through the attack-sustain-release envelope. See [asr-keyword-glow](../rules/asr-keyword-glow.md) for the full pattern.

The set of glowable words is determined by the voiceover content. The blueprint assumes a phrase shape where 4-8 words within a single headline carry `data-glow-start` / `data-glow-end`; non-glowable connective words (articles, punctuation) render as plain text.

```js
document.querySelectorAll(".kw").forEach((kw) => {
  const start = +kw.dataset.glowStart;
  const end = +kw.dataset.glowEnd;
  const peak = start + (end - start) / 2;
  const restAt = end + KEYWORD_SUSTAIN;

  // Attack (0 → 1) and decay (1 → KEYWORD_REST_LEVEL).
  tl.fromTo(
    kw,
    { "--glow": 0 },
    { "--glow": 1, duration: peak - start, ease: "power2.out" },
    start,
  );
  tl.to(kw, { "--glow": KEYWORD_REST_LEVEL, duration: restAt - peak, ease: "power2.out" }, peak);
});
```

Once a word reaches `KEYWORD_REST_LEVEL`, GSAP holds the value — the "breadcrumb trail" of glow accumulates as the voiceover proceeds.

## Phase 3: Scroll

```js
tl.fromTo(
  ".scroll-content",
  { y: 0 },
  { y: -SCROLL_DISTANCE, duration: SCROLL_DUR, ease: "power2.inOut" }, // programmatic-scroll feel
  SCROLL_AT,
);
```

**Scroll distance must be precise.** Don't estimate — measure once at design time by laying out the page and reading the offset to the target section, then bake the value as a constant.

## Phase 4: 3D Pop-Out + Spotlight

The pop-out target's `--glow` rises from 0 → 1 over a short window; CSS `calc()` on the same element derives `translateZ` and `scale`. The spotlight's `opacity` tweens up in parallel.

```js
// Attack the pop-target glow to 1, then decay to POP_REST_LEVEL near the end of the window.
tl.fromTo(
  ".pop-target",
  { "--glow": 0 },
  { "--glow": 1, duration: POP_ATTACK_DUR, ease: "power2.out" },
  POP_AT,
);
tl.to(
  ".pop-target",
  { "--glow": POP_REST_LEVEL, duration: POP_DECAY_DUR, ease: "power2.out" },
  POP_END - POP_DECAY_DUR,
);

// Spotlight fades in immediately, holds, fades out slightly at end (optional).
tl.to(".spotlight", { opacity: 1, duration: SPOTLIGHT_FADE_DUR, ease: "power2.out" }, POP_AT);
```

Because `--glow` drives `translateZ + scale` via CSS calc, the pop motion lands deterministically:

```css
.pop-target {
  --glow: 0;
  transform-style: preserve-3d;
  transform:
    translateZ(calc(var(--glow) * var(--pop-translate-z, 80px)))
    scale(calc(1 + var(--glow) * var(--pop-scale-boost, 0.15)));
  box-shadow:
    0 0 calc(var(--glow) * 25px) {accentColorRgba},
    0 calc(20px + var(--glow) * 40px) 60px rgba(0, 0, 0, 0.6);
  border: 3px solid {accentColorBorderRgba};
}
```

`--pop-translate-z` and `--pop-scale-boost` are named constants — `POP_TRANSLATE_Z` and `POP_SCALE_BOOST` in `How to Choose Values` below. `{accentColorRgba}` is the brand accent color with `var(--glow)`-modulated alpha.

The card's parent must have `transform-style: preserve-3d` for `translateZ` to read as depth (the `.page-card` already sets this — same chain).

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Title fade-in completes at TITLE_FADE_AT + TITLE_FADE_DUR.
  Phase 2's first keyword glow ramps from its ASR start.
  Slight overlap is fine — title opacity is already past readable
  before the first keyword peaks.

Phase 2 → Phase 3:
  Last keyword's KEYWORD_REST_LEVEL is set; GSAP holds it.
  SCROLL_AT can begin before that rest level is reached — the keywords stay
  visibly glowing through the scroll because their tweens have already
  set KEYWORD_REST_LEVEL by then.

Phase 3 → Phase 4:
  Scroll completes at SCROLL_AT + SCROLL_DUR.
  POP_AT starts BEFORE the scroll completes (POP_AT < SCROLL_AT + SCROLL_DUR)
  — pop and scroll overlap. This is intentional: the pop draws the eye
  to where the scroll will land.

Throughout:
  The page's tilt (CARD_TILT_Y, CARD_TILT_X) is STATIC. Never tween it.
  Animating the tilt makes the card feel like a UI flip, not a camera setup.
```

## Critical Constraints

- **Page must be a DOM recreation**: Screenshots can't have individually highlighted elements. Recreate the layout with real HTML.
- **`transform-style: preserve-3d` chain**: From `.perspective-wrap` (perspective set) down to `.page-card` (preserve-3d) down to `.pop-target` — every link in the chain. Otherwise `translateZ` on `.pop-target` collapses to no depth.
- **Pre-calculated scroll distance**: `SCROLL_DISTANCE` must be measured once at design time from the actual page layout. Don't derive it per-frame from `getBoundingClientRect()` (sub-pixel drift).
- **Static tilt**: `CARD_TILT_Y` / `CARD_TILT_X` are set once via `gsap.set()`. Don't tween them — the page is a camera setup, not a flip card.
- **Tilt set via `gsap.set()`, not CSS `transform`**: Subsequent `scale` tweens overwrite the full transform matrix and would lose CSS-declared rotation. Owning the transform state in GSAP avoids this.
- **Shadow direction matches tilt**: When `CARD_TILT_Y` is negative (card leans left) the box-shadow's X offset must be **positive** (shadow falls to the right). Mismatched shadow reads as a flat layer with a fake drop shadow.
- **`overflow: hidden` on `.page-card`**: Scrolling content clips at card boundaries.
- **`--glow` is the single source of truth per glowable element**: All visual effects (text-shadow, color, scale, translateZ) derive from this CSS variable via `calc()`. Don't run multiple GSAP tweens per word for each effect.
- **Spotlight is a separate overlay**: Don't try to dim by tinting the page-card's background — the surrounding non-highlighted content needs to read at full saturation but with the radial mask covering it.
- **No `Math.random` / `Date.now`**: All envelopes are pure functions of `tl.time()`.
- **Single paused timeline**: All phases on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.

## How to Choose Values

Phase 1 — entry

- **CARD_ENTRY_FROM_SCALE** — starting scale of the page card before it settles to 1.0.
  - Range: 0.90-0.98
  - Effects: lower (≤0.92) reads as a punchier "zoom-in" entrance; higher (≥0.96) reads as a gentle "settle".
  - Constraints: must be < 1.0 so the entry tweens up, not down.
- **CARD_ENTRY_DUR** — entry tween duration.
  - Range: 0.6-1.2 s
  - Effects: shorter feels snappy and tech-y; longer feels cinematic.
- **CARD_TILT_Y** — static Y rotation in degrees.
  - Range: -12 to -4 (or 4 to 12 for right-leaning).
  - Effects: more negative = more dramatic perspective; near 0 = nearly flat.
  - Constraints: sign must match the shadow X-offset sign.
- **CARD_TILT_X** — static X rotation in degrees.
  - Range: 0-6
  - Effects: positive tilts the top edge away from the viewer (page lays back slightly).
- **NAVBAR_FADE_DUR / TITLE_FADE_DUR / CTA_FADE_DUR** — element fade-in durations.
  - Range: 0.4-0.8 s each
- **TITLE_FADE_AT / CTA_FADE_AT** — offsets from scene start at which title / CTA begin fading in.
  - Constraints: must be ordered `0 ≤ NAVBAR_FADE_AT < TITLE_FADE_AT < CTA_FADE_AT < SCROLL_AT`. Stagger about 0.15-0.35 s between each.

Phase 2 — keyword glow (also see [asr-keyword-glow](../rules/asr-keyword-glow.md))

- **KEYWORD_REST_LEVEL** — held `--glow` value per word after decay.
  - Range: 0.1-0.3
  - Effects: lower = quieter breadcrumb trail; higher = many lit words competing.
- **KEYWORD_SUSTAIN** — seconds after a word's ASR end before its decay completes.
  - Range: 0.3-0.8 s

Phase 3 — scroll

- **SCROLL_AT** — timeline offset at which the scroll begins.
  - Constraints: must be ≥ end of Phase 2's last keyword attack, so the scroll doesn't cut off mid-attack.
- **SCROLL_DUR** — scroll tween duration.
  - Range: 0.8-1.6 s
  - Effects: shorter feels like a hard cut; longer feels like a programmatic scroll.
- **SCROLL_DISTANCE** — pixels of content translation.
  - Constraints: measured once at design time as the offset from `.scroll-content` origin to the target section's center. NOT a tunable — it's a measured geometric fact.

Phase 4 — pop-out + spotlight

- **POP_AT** — timeline offset at which the pop-out attack begins.
  - Constraints: `POP_AT < SCROLL_AT + SCROLL_DUR` so the pop overlaps the scroll's tail (intentional handoff).
- **POP_ATTACK_DUR** — duration of the 0 → 1 glow attack.
  - Range: 0.4-0.9 s
- **POP_END** — timeline second at which the decay completes.
  - Constraints: must satisfy `POP_END ≤ data-duration` and `POP_END > POP_AT + POP_ATTACK_DUR`.
- **POP_DECAY_DUR** — duration of the 1 → POP_REST_LEVEL decay just before POP_END.
  - Range: 0.2-0.6 s
- **POP_REST_LEVEL** — held `--glow` on `.pop-target` after decay.
  - Range: 0.3-0.7 — higher than KEYWORD_REST_LEVEL because the pop target stays in focus.
- **POP_TRANSLATE_Z** — max Z translation at peak glow (px).
  - Range: 40-120 px
  - Effects: lower = subtle pop; higher (>100) starts to feel like the element is detaching.
  - Constraints: requires `transform-style: preserve-3d` on the chain.
- **POP_SCALE_BOOST** — additive scale at peak glow (e.g. 0.15 ⇒ 1.0 → 1.15).
  - Range: 0.05-0.25
- **SPOTLIGHT_FADE_DUR** — opacity fade-in duration on `.spotlight`.
  - Range: 0.3-0.7 s

Ease families used (discrete choice, not numeric):

- Card entry / fades: `power2.out` — settling motion.
- Scroll: `power2.inOut` — symmetrical programmatic scroll.
- Glow attack/decay: `power2.out` — fast onset, slow settle.

## Spring → GSAP Ease Cheatsheet (this blueprint)

| Source spring                                          | This blueprint uses                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| `spring({ stiffness: 70, damping: 14 })` — card entry  | `power2.out` over CARD_ENTRY_DUR                                    |
| `spring({ stiffness: 60, damping: 20 })` — page scroll | `power2.inOut` over SCROLL_DUR (programmatic-scroll feel)           |
| `interpolate(...)` per-frame envelope                  | `--glow` CSS variable + two GSAP `power2.out` tweens per word       |
| Pulsing glow (sine)                                    | Optional second tween on a separate `--pulse` variable, finite yoyo |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [demo-page-scroll-spotlight.html](../examples/demo-page-scroll-spotlight.html) — 4-phase, 9-second scene applying this blueprint to a concrete brand and page. See the file for the resolved values of every constant listed above.
