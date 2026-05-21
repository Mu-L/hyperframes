---
id: comparison-split-cards
role: comparison
duration_seconds: [4, 6]
phases: 3
visual_arc: title-entry → cards-split-enter → badges-attach
uses_rules: [split-tilt-cards, sine-wave-loop]
element_roles:
  title: Scene heading with accent keyword establishing the concept
  left_card: Left feature card with positive rotateY tilt (faces right)
  right_card: Right feature card with negative rotateY tilt (faces left)
  badges: Floating pill badges that attach near each card with supporting context
when_to_use:
  - Two complementary features shown side-by-side
  - Comparison or A/B presentation of related capabilities
  - Message is "X + Y together" (paired concepts of equal weight)
  - Need visual balance with 3D depth on both sides
when_not_to_use:
  - More than 2 items to compare (use a different layout)
  - Items are sequential, not parallel (use step indicators)
  - Cards contain interactive elements (use workflow-approve-press)
triggers: [two features, side by side, comparison, dual capabilities, paired concepts]
---

# Comparison · Split Cards (HyperFrames)

Title drops in from top → two cards enter from opposite sides with opposing 3D tilts → floating pill badges attach near each card.

Same three-phase "concept → dual proof" arc; one paused GSAP timeline; constituent patterns map to [split-tilt-cards](../rules/split-tilt-cards.md) and [sine-wave-loop](../rules/sine-wave-loop.md).

## When to Use

- Paired features or capabilities shown simultaneously
- Visual balance important — both features have equal weight
- 3D tilt creates a premium "book-open" depth effect
- Supporting context (badges, labels) attaches near each card

## Phase Pipeline

All boundaries are in **seconds**.

| Phase | Time window (s)        | What Happens                                                         | Skill Reference                                  |
| ----- | ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| 1     | `TITLE_AT – TITLE_END` | Title slides down from top with accent keyword                       | inline `power3.out` entry                        |
| 2     | `LEFT_AT – CARDS_END`  | Left card enters from left, right from right; opposing 3D tilts      | [split-tilt-cards](../rules/split-tilt-cards.md) |
| 3     | `BADGE_LEFT_AT – end`  | Pill badges pop in near each card with bouncy spring + floating idle | [sine-wave-loop](../rules/sine-wave-loop.md)     |

## Layout

Title is absolutely positioned near the top. Cards row is absolutely centered with a flex layout and gap between cards. Badges are absolutely positioned near the cards' inner edges. Ambient dual-glow + vignette overlay the scene.

```html
<div class="stage" style="position: absolute; inset: 0;">
  <div class="bg"></div>

  <!-- Title -->
  <div
    class="title"
    id="title"
    style="position: absolute; top: 60px;
       left: 50%; transform: translateX(-50%);"
  >
    {titlePrefix} <span class="accent">{titleAccent}</span>
  </div>

  <!-- Cards row -->
  <div
    class="cards-row"
    style="position: absolute; top: 50%; left: 50%;
       transform: translate(-50%, -50%);
       display: flex; gap: 60px;
       padding-top: 40px;
       perspective: 1200px;"
  >
    <div class="card card-left">
      <div class="card-pos">
        <div class="card-tilt" style="transform-style: preserve-3d;">
          <div class="card-image"></div>
          <div class="card-label">{leftLabel}</div>
          <div class="card-subtitle">{leftSubtitle}</div>
        </div>
      </div>
    </div>

    <div class="card card-right">
      <div class="card-pos">
        <div class="card-tilt" style="transform-style: preserve-3d;">
          <div class="card-image"></div>
          <div class="card-label">{rightLabel}</div>
          <div class="card-subtitle">{rightSubtitle}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Floating badges -->
  <div
    class="badge badge-left"
    id="badge-left"
    style="position: absolute; left: {badgeLeftX}; top: {badgeLeftY};"
  >
    <svg class="badge-icon">...</svg>
    <span>{leftBadge}</span>
  </div>

  <div
    class="badge badge-right"
    id="badge-right"
    style="position: absolute; left: {badgeRightX}; top: {badgeRightY};"
  >
    <svg class="badge-icon">...</svg>
    <span>{rightBadge}</span>
  </div>

  <div class="ambient-glow"></div>
  <div class="vignette"></div>
</div>
```

## Phase 1: Title Slides Down

Standard entry: opacity 0 → 1, y rise from `-TITLE_RISE` to 0 (slide down from top). Use `power3.out` for a clean settle.

```js
gsap.set("#title", { opacity: 0, y: -TITLE_RISE });

tl.to(
  "#title",
  {
    opacity: 1,
    y: 0,
    duration: TITLE_DUR,
    ease: "power3.out", // spring(stiffness:100, damping:16)
  },
  TITLE_AT,
);
```

## Phase 2: Split Tilt Cards (Core Pattern)

Two cards slide inward from their respective sides with `scale ENTRY_SCALE → 1` + `opacity 0 → 1`. Static tilts: left `+BASE_TILT°`, right `-BASE_TILT°` rotationY. Continuous floating (y + tiny rotation) runs from t=0 with phase offset π between the two cards.

```js
/* Initial states */
gsap.set(".card-left  .card-pos", { x: -SLIDE_DIST, scale: ENTRY_SCALE, opacity: 0, y: 0 });
gsap.set(".card-right .card-pos", { x: SLIDE_DIST, scale: ENTRY_SCALE, opacity: 0, y: 0 });
gsap.set(".card-left  .card-tilt", { rotationY: BASE_TILT });
gsap.set(".card-right .card-tilt", { rotationY: -BASE_TILT });

/* Entry tweens */
tl.to(
  ".card-left .card-pos",
  { x: 0, scale: 1, opacity: 1, duration: ENTRY_DUR, ease: "power3.out" },
  LEFT_AT,
);
tl.to(
  ".card-right .card-pos",
  { x: 0, scale: 1, opacity: 1, duration: ENTRY_DUR, ease: "power3.out" },
  RIGHT_AT,
);
```

See [split-tilt-cards](../rules/split-tilt-cards.md) for the floating onUpdate that runs continuously over the whole composition. The `Math.PI` phase offset between left and right is what produces the "breathing in opposition" feel.

## Phase 3: Badge Attachment + Floating

Badges pop in with a bouncy spring (`back.out(${BOUNCE_FACTOR})`) near each card's inner edge. After entry, both badges float gently with a slow sine y-offset.

```js
gsap.set(["#badge-left", "#badge-right"], { scale: 0, opacity: 0, y: 0 });

tl.to(
  "#badge-left",
  { scale: 1, opacity: 1, duration: BADGE_ENTRY_DUR, ease: `back.out(${BOUNCE_FACTOR})` },
  BADGE_LEFT_AT,
);

tl.to(
  "#badge-right",
  { scale: 1, opacity: 1, duration: BADGE_ENTRY_DUR, ease: `back.out(${BOUNCE_FACTOR})` },
  BADGE_RIGHT_AT,
);

/* Floating handled in shared scene-ticker onUpdate (next section). */
```

Badges should be **inside the cards' visual footprint**, not floating in empty viewport space. Position them at each card's inner edge (between the card and the gap), so the eye reads them as "attached to" their card rather than orbiting somewhere in the void.

## Shared Scene-Ticker (Continuous Floating)

A single `onUpdate` over the whole composition handles all continuous sine motion: card y/rotation float + badge y float. Consolidating keeps DOM-mutation cost predictable.

```js
const leftPos = document.querySelector(".card-left .card-pos");
const rightPos = document.querySelector(".card-right .card-pos");
const leftTilt = document.querySelector(".card-left .card-tilt");
const rightTilt = document.querySelector(".card-right .card-tilt");
const badgeLeft = document.querySelector("#badge-left");
const badgeRight = document.querySelector("#badge-right");

tl.to(
  { tick: 0 },
  {
    tick: 1,
    duration: TOTAL_DUR,
    ease: "none",
    onUpdate: function () {
      const t = tl.time();
      // Cards float in opposition (phase π apart).
      const lY = Math.sin(t * FLOAT_Y_SPEED) * FLOAT_Y_AMP;
      const lR = Math.sin(t * FLOAT_R_SPEED) * FLOAT_R_AMP;
      const rY = Math.sin(t * FLOAT_Y_SPEED + Math.PI) * FLOAT_Y_AMP;
      const rR = Math.sin(t * FLOAT_R_SPEED + Math.PI) * FLOAT_R_AMP;
      gsap.set(leftPos, { y: lY });
      gsap.set(rightPos, { y: rY });
      gsap.set(leftTilt, { rotationY: BASE_TILT + lR });
      gsap.set(rightTilt, { rotationY: -BASE_TILT + rR });

      // Badges — small shared y oscillation (both badges in same phase here;
      // can be opposed if you prefer extra differentiation).
      const bY = Math.sin(t * BADGE_Y_SPEED) * BADGE_Y_AMP;
      gsap.set(badgeLeft, { y: bY });
      gsap.set(badgeRight, { y: bY });
    },
  },
  0,
);
```

**Why one onUpdate and not three?** Six `gsap.set` calls inside one onUpdate is cheaper than three independent onUpdate tweens, which would each fire per frame. The browser batches transform writes across the calls.

## Ambient Dual-Glow

Two radial gradients in the background — one centered on each card's side, using `{leftGlowColor}` and `{rightGlowColor}` (the two brand accents in the comparison). Reinforces the left/right identity.

```css
.ambient-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: GLOW_OPACITY;
  background:
    radial-gradient(ellipse at 30% 50%, {leftGlowColor} 0%, transparent 35%),
    radial-gradient(ellipse at 70% 50%, {rightGlowColor} 0%, transparent 35%);
}
```

`GLOW_OPACITY` keeps the glow subtle — it tints the background without competing with the cards.

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Title fade-in ends at TITLE_AT + TITLE_DUR. LEFT_AT starts BEFORE the title
  fully settles — slight overlap is intentional. The eye reads the title's tail
  and the cards' beginnings as two simultaneous arrivals.
  Constraint: LEFT_AT < TITLE_AT + TITLE_DUR (overlap), but
              LEFT_AT > TITLE_AT + TITLE_DUR * 0.5 (title is past midpoint).

Phase 2 → Phase 3:
  Right card entry ends at RIGHT_AT + ENTRY_DUR.
  BADGE_LEFT_AT lands a short BADGE_GAP later — gives the cards a beat to
  settle visually before the badges punctuate them.
  Constraint: BADGE_LEFT_AT ≥ RIGHT_AT + ENTRY_DUR + BADGE_GAP.

Continuous (Phase 1+):
  Scene-ticker onUpdate runs from t=0 across the whole TOTAL_DUR. Card and
  badge floating values are 0 at t=0 (sin(0)=0), so the float is invisible
  during entry and gradually becomes visible as elements fade in.
```

## How to Choose Values

### Phase 1 — Title

- **TITLE_AT** — when the title begins sliding in.
  - Range: 0.1-0.3 s
  - Effects: lower starts the scene faster; higher gives a moment of empty stage tension first
  - Constraints: must leave room for `TITLE_AT + TITLE_DUR < LEFT_AT + ENTRY_DUR` so the title isn't still moving when the cards finish settling
  - Reference: examples/comparison-split-cards.html uses `0.17`
- **TITLE_DUR** — title slide-down duration.
  - Range: 0.5-1.0 s
  - Effects: low end is snappy/urgent; high end is editorial/cinematic
  - Reference: examples/comparison-split-cards.html uses `0.67`
- **TITLE_RISE** — pixels above resting position that the title starts from.
  - Range: 24-64 px
  - Effects: low end barely registers as motion; high end reads as "dropped from offscreen"
  - Reference: examples/comparison-split-cards.html uses `40`

### Phase 2 — Cards

- **LEFT_AT** — when the left card begins sliding in.
  - Range: 0.4-0.7 s
  - Constraints: see Inter-Phase State Handoff overlap with title
  - Reference: examples/comparison-split-cards.html uses `0.5`
- **RIGHT_AT** — when the right card begins. Stagger from `LEFT_AT`.
  - Range: `LEFT_AT + 0.1` to `LEFT_AT + 0.4` s (≈3-12 frame stagger at 30 fps)
  - Effects: small stagger makes the pair feel coordinated but lively; zero stagger looks mechanical; large stagger fragments the comparison
  - Reference: examples/comparison-split-cards.html uses `0.83`
- **ENTRY_DUR** — per-card slide-in duration.
  - Range: 0.6-1.0 s
  - Effects: short reads as snappy; long reads as luxurious / heavy
  - Reference: examples/comparison-split-cards.html uses `0.7`
- **SLIDE_DIST** — pixels each card slides from off-axis.
  - Range: 60-200 px
  - Effects: small reads as a subtle reveal; large reads as "thrown in from the wings"
  - Reference: examples/comparison-split-cards.html uses `100`
- **ENTRY_SCALE** — initial scale of each card before settling to 1.
  - Range: 0.7-0.95
  - Effects: lower combined with slide reads as "popping into focus"; higher is a near-flat slide
  - Reference: examples/comparison-split-cards.html uses `0.8`
- **BASE_TILT** — static `rotationY` magnitude in degrees (left `+`, right `−`).
  - Range: 10-20° (see split-tilt-cards rule for the readability ceiling)
  - Effects: low end is a slight perspective offset; high end folds the cards toward closed
  - Reference: examples/comparison-split-cards.html uses `18`

### Phase 3 — Badges

- **BADGE_LEFT_AT** — when the left badge pops in.
  - Constraints: `≥ RIGHT_AT + ENTRY_DUR + BADGE_GAP`
  - Reference: examples/comparison-split-cards.html uses `1.67`
- **BADGE_RIGHT_AT** — when the right badge pops in.
  - Range: `BADGE_LEFT_AT + 0.2` to `BADGE_LEFT_AT + 0.4` s (matches card stagger feel)
  - Reference: examples/comparison-split-cards.html uses `2.0`
- **BADGE_GAP** — minimum settle beat between cards finishing entry and badges starting.
  - Range: 0.1-0.3 s
  - Effects: low end reads as one continuous gesture; high end gives the cards a clear "and… badges!" punctuation
- **BADGE_ENTRY_DUR** — badge pop duration.
  - Range: 0.4-0.7 s
  - Reference: examples/comparison-split-cards.html uses `0.5`
- **BOUNCE_FACTOR** — `back.out(BOUNCE_FACTOR)` overshoot strength on the badge pop.
  - Range: 1.4 (soft) → 2.0 (firm) → 2.8 (cartoony)
  - Reference: examples/comparison-split-cards.html uses `1.7`

### Continuous floating

- **TOTAL_DUR** — total composition length the scene-ticker tween covers.
  - Constraints: equals `data-duration` on the composition root
  - Reference: examples/comparison-split-cards.html uses `5.0`
- **FLOAT_Y_SPEED** — angular speed of card y bob in rad/s (`Math.sin(t * FLOAT_Y_SPEED)`).
  - Range: 0.4-0.9 rad/s (cycle period 7-16 s — slow enough to feel like breathing, not bobbing)
  - Reference: examples/comparison-split-cards.html uses `0.6` (≈10.5 s period)
- **FLOAT_Y_AMP** — card y bob amplitude in px.
  - Range: 3-8 px (see sine-wave-loop rule — subtle is the point)
  - Reference: examples/comparison-split-cards.html uses `6`
- **FLOAT_R_SPEED** — angular speed of card rotation float.
  - Range: 0.3-0.6 rad/s, slightly slower than `FLOAT_Y_SPEED` so y/rotation aren't visibly synced
  - Reference: examples/comparison-split-cards.html uses `0.45`
- **FLOAT_R_AMP** — card rotation float amplitude in degrees, added to `BASE_TILT`.
  - Range: 0.5-2°
  - Effects: above 2° the tilt visibly wobbles instead of "breathing"
  - Reference: examples/comparison-split-cards.html uses `1`
- **BADGE_Y_SPEED** — angular speed of badge y bob.
  - Range: 0.5-1.0 rad/s; faster than card y so the badges feel like lighter satellites
  - Reference: examples/comparison-split-cards.html uses `0.75`
- **BADGE_Y_AMP** — badge y bob amplitude in px.
  - Range: 3-7 px; should not exceed `FLOAT_Y_AMP` (the badge is a smaller element, should not out-bob the card)
  - Reference: examples/comparison-split-cards.html uses `5`

### Ambient + text tokens

- **GLOW_OPACITY** — opacity of the ambient dual-glow overlay.
  - Range: 0.08-0.18
  - Effects: lower nearly invisible; higher competes with the cards
  - Reference: examples/comparison-split-cards.html uses `0.13`
- **{titlePrefix} / {titleAccent}** — non-accent and accent portions of the title (e.g. `"<setup phrase> <accent payoff>"`).
- **{leftLabel} / {rightLabel}** — short feature names on each card (1-3 words each).
- **{leftSubtitle} / {rightSubtitle}** — one-line elaboration under each label.
- **{leftBadge} / {rightBadge}** — pill copy summarizing each card in 1-3 words.
- **{leftGlowColor} / {rightGlowColor}** — full-opacity rgba/hex of each side's brand accent; the ambient overlay re-attenuates via `GLOW_OPACITY`.

## Critical Constraints

- **Opposing `rotationY`**: Left positive, right negative. Same-direction tilt destroys balance.
- **Shadow matches tilt**: Left card shadow falls right (`-x offset`), right card shadow falls left (`+x offset`). Mismatched shadow reveals the trick.
- **Equal card widths**: Both cards have the same `width`. Different sizes break symmetric balance.
- **Two cards only**: This pattern doesn't extend to 3+ cards. Use a different layout for three.
- **Badge position at inner edges**: Not floating in empty viewport space. The eye must read the badge as attached to its card.
- **Phase opposition on cards (`Math.PI`)**: For both y and rotation. Synchronized phase makes cards rock together — looks mechanical.
- **Single `perspective` parent** on the cards-row: Both cards share one `perspective` value. Per-card perspective produces inconsistent depth.
- **`transform-style: preserve-3d` on `.card-tilt`**: Required for the rotated card's children to render in 3D space.
- **Floating onUpdate isolates aliases**: Only sets `y` on `.card-pos` and `rotationY` on `.card-tilt`. Don't include `x` / `scale` / `opacity` — those are owned by the entry tween.
- **GSAP transform aliases only**: `x`, `y`, `scale`, `rotationY`. Never `width` / `height` / `left` / `top`.
- **No `Math.random` / `Date.now`**: All motion is a pure function of `tl.time()`.
- **No infinite repeats**: The floating onUpdate runs over a finite `duration: TOTAL_DUR`. No `repeat: -1`.
- **Single paused timeline**: All three phases on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.

## Spring → GSAP Ease Cheatsheet (this blueprint)

| Source spring                                                      | This blueprint uses                                 |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| `spring({ stiffness: 100, damping: 16 })` — title + cards entry    | `power3.out` over `TITLE_DUR` / `ENTRY_DUR`         |
| `spring(...)` (entranceBouncy, ~stiffness:180 damping:14) — badges | `back.out(${BOUNCE_FACTOR})` over `BADGE_ENTRY_DUR` |
| `sin(frame * 0.02)` — card y float                                 | `Math.sin(t * FLOAT_Y_SPEED)` in onUpdate           |
| `sin(frame * 0.015)` — card rotation float                         | `Math.sin(t * FLOAT_R_SPEED)` in onUpdate           |
| `sin(frame * 0.025)` — badge y float                               | `Math.sin(t * BADGE_Y_SPEED)` in onUpdate           |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [comparison-split-cards.html](../examples/comparison-split-cards.html) — paired-feature split-card scene with title, two opposed-tilt cards (left `+BASE_TILT°`, right `-BASE_TILT°`), and floating pill badges at the cards' inner edges. Cards and badges float continuously with phase-opposed sines. Ambient dual-glow tints the background with the two brand accents. Single paused GSAP timeline drives all three phases over `TOTAL_DUR` seconds.
