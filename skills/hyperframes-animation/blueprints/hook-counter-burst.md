---
id: hook-counter-burst
role: opening-hook
duration_seconds: [3, 5]
phases: 4
visual_arc: empty → icons-cluster → count-and-expand → camera-push
uses_rules:
  [counting-dynamic-scale, center-outward-expansion, multi-phase-camera, svg-icon-enrichment]
element_roles:
  counter: Central number counts 0 → target while growing in font size
  icons: 3-5 enriched SVG icons expand outward from center
  camera: Multi-phase zoom (pull-back → focus → push) wraps the scene
  background: Video or animated gradient with dark overlay for contrast
when_to_use:
  - Opening hook needs a single dramatic statistic
  - Statistic reinforced by 3-5 thematic icons
  - Scene must feel kinetic from frame 1
when_not_to_use:
  - Hook is text-driven, no numeric statistic
  - Product UI / demo footage is the focal point
  - Multiple numbers shown simultaneously
triggers: [opening hook, statistic, counting number, dramatic number, attention grabber]
---

# Hook · Counter Burst

Background → thematic icons enter clustered at center → number counts up while icons expand outward → camera pushes in for closing emphasis.

Four-phase opening-hook arc on a single paused GSAP timeline. Constituent patterns: [svg-icon-enrichment](../rules/svg-icon-enrichment.md), [center-outward-expansion](../rules/center-outward-expansion.md), [counting-dynamic-scale](../rules/counting-dynamic-scale.md), [multi-phase-camera](../rules/multi-phase-camera.md).

## When to Use

- Opening scene needs a single dramatic statistic as the hook
- The statistic is reinforced by 3-5 thematic icons (e.g. clock, scissors, video, play)
- Scene must feel kinetic from frame 1 — no static moments
- Total duration short enough that the hook does not start to read as the main scene

## Phase Pipeline

All boundaries are in **seconds**.

| Phase | Time window                              | What Happens                                                           | Skill Reference                                                                                                                 |
| ----- | ---------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `0 – ICON_ENTRY_AT_1`                    | Background visible with dark overlay; nothing else                     | inline                                                                                                                          |
| 2     | staggered entry beat                     | Icons enter staggered, clustered at `START_OFFSET`                     | [svg-icon-enrichment](../rules/svg-icon-enrichment.md) entry pattern                                                            |
| 3     | `COUNT_AT` + `COUNT_DUR`                 | Counter counts up; icons expand from `START_OFFSET` to final positions | [counting-dynamic-scale](../rules/counting-dynamic-scale.md) + [center-outward-expansion](../rules/center-outward-expansion.md) |
| 4     | `CAMERA_FOCUS_AT` → `CAMERA_PUSH_AT` end | Multi-phase camera: focus-in then push                                 | [multi-phase-camera](../rules/multi-phase-camera.md)                                                                            |

Phase 2 and Phase 3 intentionally overlap so the eye sees motion continuously — no static gap between icon arrival and the count starting.

## Initial Layout

Counter is absolutely centered. Each icon's target position is set in CSS (or via `gsap.set()`) once; a GSAP `x` / `y` tween shifts it from the inverse-lerped `START_OFFSET` position to target.

```html
<div class="stage">
  <div class="bg"></div>
  <!-- background video or animated gradient -->

  <div class="camera">
    <!-- GSAP-managed scale phases -->

    <div class="icons-stage">
      <div class="icon-pos icon-a">
        <div class="icon-entry"><svg class="icon-svg">{iconA}</svg></div>
      </div>
      <div class="icon-pos icon-b">
        <div class="icon-entry"><svg class="icon-svg">{iconB}</svg></div>
      </div>
      <div class="icon-pos icon-c">
        <div class="icon-entry"><svg class="icon-svg">{iconC}</svg></div>
      </div>
      <div class="icon-pos icon-d">
        <div class="icon-entry"><svg class="icon-svg">{iconD}</svg></div>
      </div>
    </div>

    <div class="counter-stage">
      <div class="counter-3d">
        <span class="counter-number">0</span><span class="counter-suffix">{suffix}</span>
      </div>
    </div>
  </div>

  <div class="vignette"></div>
</div>
```

```css
html, body {
  font-family: {font};
  color: {textColor};
  background: {bgColor};
}
.bg-overlay { background: {overlayColor}; }     /* dark overlay over bg */
.counter-number { color: {textColor}; font-variant-numeric: tabular-nums; }
.counter-suffix { color: {accentColor}; }
```

Each `.icon-pos`'s `left` / `top` are the **target** coordinates. GSAP `x` / `y` shift it back toward center. `.icon-entry` is a nested wrapper so the entry scale/opacity/rotation tweens never overwrite the position tweens.

## Phase 1: Cold Open

Background and dark overlay are visible from t=0. No element animates yet; this opens a beat of compositional quiet before the burst starts. The icons are present in the DOM but invisible (scale 0, opacity 0) and pre-positioned at `START_OFFSET` via `gsap.set()`.

## Phase 2: Icon Entries

Each icon enters with its own spring (scale 0 → 1 + opacity 0 → 1 + rotation), staggered by `ICON_STAGGER`. Internal SVG animations (rotating hands, oscillating blades, pulsing dots, dash flows) run **from t=0** — they are invisible during Phase 1 but already in motion when each icon appears, so the icon feels alive on landing.

```js
ICONS.forEach(({ name, delay }) => {
  tl.fromTo(
    `.${name} .icon-entry`,
    { scale: 0, opacity: 0, rotation: ENTRY_ROTATION },
    {
      scale: 1,
      opacity: ENTRY_OPACITY,
      rotation: 0,
      duration: ENTRY_DUR,
      ease: `back.out(${BOUNCE_FACTOR})`,
    },
    delay,
  );
});
```

See [svg-icon-enrichment](../rules/svg-icon-enrichment.md) for the four internal-motion patterns (rotation, oscillation, pulse, dash flow).

## Phase 3: Count + Expansion (Core Glue)

A shared ease and duration drive **both** the counter and the icon expansion. Because GSAP tweens with identical `duration` + `ease` advance their progress in lockstep, the counter's display number and the icons' positions stay mathematically synchronized — no shared driver needed.

```js
// (a) Counter — proxy tween. onUpdate writes text + font size to one element.
const counterProxy = { p: 0 };

tl.to(
  counterProxy,
  {
    p: 1,
    duration: COUNT_DUR,
    ease: COUNT_EASE,
    onUpdate: () => {
      counterEl.textContent = Math.round(counterProxy.p * COUNT_TARGET);
      counterEl.style.fontSize =
        W *
          (COUNT_START_FONT_RATIO +
            counterProxy.p * (COUNT_END_FONT_RATIO - COUNT_START_FONT_RATIO)) +
        "px";
    },
  },
  COUNT_AT,
);

// (b) Icons — per-icon tween to (x: 0, y: 0). gsap.set() positioned them at
// START_OFFSET before the timeline; this tween moves them the rest of the way.
ICONS.forEach(({ sel, targetX, targetY }) => {
  // Pre-position at START_OFFSET
  gsap.set(`${sel}.icon-pos`, {
    x: (CENTER_X - targetX) * (1 - START_OFFSET),
    y: (CENTER_Y - targetY) * (1 - START_OFFSET),
  });

  // Expansion tween — same start, dur, ease as the counter
  tl.to(`${sel}.icon-pos`, { x: 0, y: 0, duration: COUNT_DUR, ease: COUNT_EASE }, COUNT_AT);
});
```

**Why a separate tween per icon instead of one `onUpdate`?** GSAP runs many simultaneous tweens cheaply — the compositor batches the transform writes. Separate tweens are easier to inspect in DevTools and don't share `onUpdate` overhead. For 3–5 icons, performance is a wash and readability wins.

## Phase 4: Multi-Phase Camera

The wrapper `.camera` element scales through three values: `CAMERA_SCALE_START` (initial) → `CAMERA_SCALE_FOCUS` (settle) → `CAMERA_SCALE_PUSH` (closing emphasis). The two transition tweens are sequenced at scripted timeline positions; GSAP overwrite handles the merging on `scale`.

```js
gsap.set(".camera", { scale: CAMERA_SCALE_START });

tl.to(
  ".camera",
  { scale: CAMERA_SCALE_FOCUS, duration: CAMERA_FOCUS_DUR, ease: CAMERA_EASE },
  CAMERA_FOCUS_AT,
);
tl.to(
  ".camera",
  { scale: CAMERA_SCALE_PUSH, duration: CAMERA_PUSH_DUR, ease: CAMERA_EASE },
  CAMERA_PUSH_AT,
);
```

Each successive phase should feel softer than the previous one (longer duration OR more out-easing). See [multi-phase-camera](../rules/multi-phase-camera.md) for the optional drift overlay (often omitted on short hook scenes — drift is barely perceptible in a few-second comp).

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Background renders immediately. Icons stay at START_OFFSET positions
  (set via gsap.set before the timeline). No value dependency.

Phase 2 → Phase 3:
  Last icon's entry delay + ENTRY_DUR must complete near, but no later
  than, COUNT_AT + COUNT_DUR. Constraint: last_icon_delay + ENTRY_DUR
  ≤ COUNT_AT + COUNT_DUR. Slight overlap (last entry still settling
  while count starts) is intentional — no static gap.

Phase 3 → Phase 4:
  Camera push (CAMERA_PUSH_AT) must trigger AFTER the count completes
  (COUNT_AT + COUNT_DUR). The gap gives the eye time to read the final
  number before the camera adds emphasis.

Continuous (Phase 1+):
  Internal SVG animations (rotating hands, oscillating blades, pulses,
  dash flows) run from t=0 on a shared scene-ticker onUpdate. Icons
  enter visible at their delays but the internal motion has already
  been turning. See svg-icon-enrichment for patterns.
```

## How to Choose Values

- **ICON_COUNT** — how many enriched icons in the burst
  - Range: 3–5
  - Effects: 3 = sparse, deliberate; 5 = busy but still legible
  - Constraints: > 5 causes center clustering to read as collision even at high `START_OFFSET`
  - Reference: examples/hook-counter-burst.html uses 4

- **START_OFFSET** — fraction of the path from center to target where icons begin
  - Range: 0.3–0.5
  - Effects: low end = tighter cluster, more dramatic expansion; high end = looser cluster, gentler expansion
  - Constraints: exact center (`0`) reads as an explosion debris field; > 0.5 makes the expansion vanish
  - Reference: examples/hook-counter-burst.html uses 0.4

- **ICON_STAGGER** — gap between successive icon entry delays
  - Range: 0.10–0.18 s
  - Effects: low end = burst feels simultaneous (chord); high end = burst feels paced (arpeggio)
  - Constraints: ICON_COUNT × ICON_STAGGER must complete before COUNT_AT + COUNT_DUR
  - Reference: examples/hook-counter-burst.html uses ≈ 0.13 s

- **ENTRY_DUR** — duration of each icon's scale/opacity/rotation spring
  - Range: 0.45–0.7 s
  - Effects: shorter = snappier pop; longer = floatier landing
  - Constraints: must finish before or overlapping with COUNT_AT + COUNT_DUR
  - Reference: examples/hook-counter-burst.html uses 0.55 s

- **ENTRY_OPACITY** — final opacity of icons after entry
  - Range: 0.75–1.0
  - Effects: < 1 keeps icons supporting (not competing with) the counter
  - Reference: examples/hook-counter-burst.html uses 0.85

- **ENTRY_ROTATION** — initial rotation per icon (each can differ)
  - Range: −180° to 180°
  - Effects: matched signs = wave; mixed signs = burst
  - Reference: examples/hook-counter-burst.html mixes per icon

- **BOUNCE_FACTOR** — back.out coefficient on icon entries
  - Range: 1.2–1.8
  - Effects: 1.2 = minimal overshoot; 1.8 = pronounced pop
  - Reference: examples/hook-counter-burst.html uses 1.4–1.5

- **COUNT_AT** — when the count + expansion begins
  - Range: 0.4–0.7 s (depends on first icon delay)
  - Constraints: must overlap with the icon entries (no static gap)
  - Reference: examples/hook-counter-burst.html uses 0.47 s

- **COUNT_DUR** — duration of the count + expansion
  - Range: 0.8–1.5 s
  - Effects: shorter = aggressive; longer = settles, gives reading time
  - Reference: examples/hook-counter-burst.html uses 1.0 s

- **COUNT_EASE** — shared ease for counter proxy AND icon expansion
  - Discrete choice: `power2.out`, `power3.out`, `expo.out`
  - Selection: `power2.out` ≈ `1 - (1-x)^2.5`; `power3.out` for stronger settle; `expo.out` for very dramatic decel
  - Constraint: must be identical across counter and all icon expansion tweens
  - Reference: examples/hook-counter-burst.html uses `power2.out`

- **COUNT_TARGET** — final value the counter lands on
  - Effects: pick a number that the headline statistic needs; 2–3 digits reads best at this scale
  - Reference: examples/hook-counter-burst.html uses 90

- **COUNT_START_FONT_RATIO / COUNT_END_FONT_RATIO** — font size as fraction of stage width
  - Range: start 0.15–0.25; end 0.35–0.5
  - Effects: ratio gap is the "growth" amount; bigger gap = more dramatic
  - Constraints: end ratio × digit count must fit horizontally with the suffix
  - Reference: examples/hook-counter-burst.html uses 0.20 → 0.42

- **CAMERA_SCALE_START / FOCUS / PUSH** — three-step zoom values
  - Range: start 0.88–0.96; focus 0.98–1.02; push 1.04–1.12
  - Effects: tighter spread = subtler camera; wider = more cinematic
  - Reference: examples/hook-counter-burst.html uses 0.92 / 1.00 / 1.08

- **CAMERA_FOCUS_AT / CAMERA_FOCUS_DUR** — when and how long the focus phase lasts
  - Constraints: should be running as the count completes (the focus settles the count)
  - Reference: examples/hook-counter-burst.html uses 0.5 / 1.83

- **CAMERA_PUSH_AT / CAMERA_PUSH_DUR** — when and how long the push phase lasts
  - Constraints: CAMERA_PUSH_AT > COUNT_AT + COUNT_DUR (push after count lands)
  - Reference: examples/hook-counter-burst.html uses 2.33 / 1.17

- **CAMERA_EASE** — ease for both camera transitions
  - Discrete choice: `power2.out` (uniform), `power3.out` (push deeper than focus)
  - Reference: examples/hook-counter-burst.html uses `power2.out` for both

## Critical Constraints

- **Single progress source for count + expansion**: identical `COUNT_AT`, `COUNT_DUR`, `COUNT_EASE` on the counter proxy and each icon's x/y tween. Drift in any of these breaks the synchronization.
- **`font-variant-numeric: tabular-nums`** on the counter element — prevents layout shift as digit count changes (single → double → triple digits).
- **Icon entry overlaps or precedes count**: icons should be visible (entry spring well underway) before the expansion they participate in begins.
- **3–5 icons maximum** in the cluster. More than 5 reads as collision even with high `START_OFFSET`.
- **`START_OFFSET` ≥ 0.3** — icons must begin partially spread. Exact center reads as debris field.
- **Dark overlay on background** — counter text needs contrast against any video / gradient backdrop.
- **`left` / `top` set once, never tweened** — icon target positions in CSS or via `gsap.set()` before the timeline. GSAP only tweens `x` / `y` (transform aliases).
- **Two nested wrappers per icon**: `.icon-pos` (expansion x/y) wraps `.icon-entry` (scale/opacity/rotation). Their tweens never compete.
- **Internal SVG motion from t=0** — don't gate enrichment behind icon entry. Users should see a living icon appear, not a static icon that starts moving on landing.
- **No `Math.random` / `Date.now`** — all motion pure functions of `tl.time()`.
- **No infinite repeats** — camera, breathing, internal pulses all use finite values computed from `data-duration`.
- **Single paused timeline** — all phases on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.

## Spring → Ease Cheatsheet

| Source spring                               | Ease family used in this blueprint          |
| ------------------------------------------- | ------------------------------------------- |
| Stiff icon entry (high stiffness, low damp) | `back.out(${BOUNCE_FACTOR})` over ENTRY_DUR |
| Counter 3D entry (mid stiff, mid damp)      | `power3.out`                                |
| Camera focus (low stiff, high damp)         | `power2.out` over CAMERA_FOCUS_DUR          |
| Camera push (lower stiff, higher damp)      | `power2.out` over CAMERA_PUSH_DUR           |
| Counter + expansion shared (`1 - (1-x)^k`)  | `power2.out` (k≈2.5) or `power3.out` (k≈3)  |
| Internal SVG sine motion                    | `sine.inOut` yoyo, or onUpdate Math.sin     |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [hook-counter-burst.html](../examples/hook-counter-burst.html)
