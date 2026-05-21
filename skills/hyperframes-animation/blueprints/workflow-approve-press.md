---
id: workflow-approve-press
role: workflow
duration_seconds: [4, 6]
phases: 4
visual_arc: headline-entry → steps-progress → video-demo → button-press-confirm
uses_rules: [press-release-spring]
element_roles:
  headline: Top concept statement with one emphasized accent word
  video_demo: Center product video / animation showing the feature
  step_indicators: Left-flank 3D-tilted step list with pending → active → complete states
  action_button: Right-flank 3D-tilted button that receives the press and changes state
when_to_use:
  - Scene emphasizes user control over an automated process
  - Multi-step workflow needs visualization (e.g. generate → review → approve)
  - Button press is the narrative climax (user confirms / approves)
  - Left-right 3D symmetry flanks a center demo
when_not_to_use:
  - Workflow has more than 3-4 steps (cannot read in a ~5s scene)
  - No user-action metaphor needed (fully automated)
  - Scene is purely informational without interaction
triggers:
  [review and approve, step-by-step workflow, user control, approve button, with-you metaphor]
---

# Workflow · Approve & Press (HyperFrames)

Headline enters top → center video/animation plays → 3D-tilted step indicators progress left → action button pressed right → state change confirms.

A single paused GSAP timeline drives everything. State transitions that would be frame-windowed in an imperative renderer (`if (frame < N) state = 1; else …`) become discrete `tl.set({ attr })` toggles at concrete timeline positions, so seeking lands on a deterministic state every time.

## When to Use

- Feature scene that emphasizes user agency ("AI works with you, not just for you")
- The workflow can be shown in 2-3 steps
- A button press serves as the narrative payoff

## Phase Pipeline

All boundaries are in **seconds**. Each named constant is documented in [How to Choose Values](#how-to-choose-values).

| Phase | Time window                     | What Happens                                                                              | Skill Reference                                          |
| ----- | ------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1     | `HEADLINE_START – HEADLINE_END` | Headline slides down from top with accent keyword                                         | inline `back.out(${HEADLINE_BOUNCE})` entry              |
| 2     | `VIDEO_START – VIDEO_END`       | Center product video / animation enters with scale                                        | inline scale-in                                          |
| 3     | `STEPS_START – PRESS_FRAME`     | Step indicators stagger-enter left, progress pending → active → complete via attr toggles | inline staggered entry + `tl.set()` state machine        |
| 4     | `PRESS_FRAME – end`             | Action button depresses (linear) → color shifts → checkmark pops (spring)                 | [press-release-spring](../rules/press-release-spring.md) |

## Initial Layout

Three columns. Center holds the demo. Left and right flanks are 3D-tilted inward (opposing `rotateY`), creating a "cockpit" depth effect. **Perspective lives on the flank element itself, not on a distant parent** — perspective from far up the tree distorts depth proportions on the inner content.

```html
<div
  id="root"
  data-composition-id="{compositionId}"
  data-start="0"
  data-duration="SCENE_END"
  data-width="1920"
  data-height="1080"
  style="position: relative; width: 1920px; height: 1080px; overflow: hidden;"
>
  <!-- Frosted-glass / ambient background -->
  <div class="bg"></div>

  <!-- Top: Headline -->
  <div class="headline-wrap">
    <div class="headline">
      {headlinePrefix}
      <span class="accent">{accentWord}</span>
      {headlineSuffix}
    </div>
  </div>

  <!-- Center: Video / Animation Demo -->
  <div class="demo-wrap">
    <div class="demo-frame">
      <video src="{demoAsset}" muted></video>
    </div>
  </div>

  <!-- Left: Step Indicators (3D tilted +FLANK_TILT_DEG) -->
  <div class="steps-flank">
    <div class="step step-1" data-step="1" data-state="pending">
      <div class="step-circle">
        <span class="step-num">1</span>
        <svg class="step-check" viewBox="0 0 24 24"><path d="M20 6L9 17L4 12" /></svg>
      </div>
      <span class="step-label">{step1Label}</span>
    </div>
    <div class="step step-2" data-step="2" data-state="pending">
      <!-- … same shape as step-1 with {step2Label} … -->
    </div>
    <div class="step step-3" data-step="3" data-state="pending">
      <!-- … same shape as step-1 with {step3Label} … -->
    </div>
  </div>

  <!-- Right: Action Button (3D tilted -FLANK_TILT_DEG) -->
  <div class="button-flank">
    <div class="btn-press">
      <!-- --btn-glow-blur is what the pulsing-yoyo tween mutates; box-shadow reads it. -->
      <div class="btn">
        <span class="btn-check">
          <svg viewBox="0 0 24 24"><path d="M20 6L9 17L4 12" /></svg>
        </span>
        <span class="btn-label">{buttonLabel}</span>
      </div>
    </div>
  </div>

  <!-- Ambient glow + vignette overlays (pointer-events: none) -->
  <div class="ambient"></div>
  <div class="vignette"></div>
</div>
```

```css
.bg {
  position: absolute; inset: 0;
  background: {bgGradient};
}
.headline-wrap {
  position: absolute; top: HEADLINE_TOP; left: 50%;
  transform: translateX(-50%);
  opacity: 0; /* GSAP fades in */
  text-align: center; white-space: nowrap;
}
.headline {
  font-size: HEADLINE_FONT_SIZE;
  font-weight: 800;
  color: {textColor};
  line-height: 1.2;
  font-family: {font};
}
.headline .accent {
  color: {accentColor};
  text-shadow: 0 0 30px {accentGlow};
}
.demo-wrap {
  position: absolute; left: 50%; top: 60%;
  opacity: 0;
}
.demo-frame {
  width: DEMO_WIDTH; height: DEMO_HEIGHT;
  border-radius: 16px; overflow: hidden;
  border: 2px solid {panelStroke};
  box-shadow: 0 0 40px {accentGlow}, 0 20px 60px {hardShadow};
}
.steps-flank {
  position: absolute; left: FLANK_INSET; top: 55%;
  transform: translateY(-50%) perspective(FLANK_PERSPECTIVE) rotateY(FLANK_TILT_DEG);
  display: flex; flex-direction: column; gap: STEP_GAP;
}
.button-flank {
  position: absolute; right: FLANK_INSET; top: 55%;
  transform: translateY(-50%) perspective(FLANK_PERSPECTIVE) rotateY(-FLANK_TILT_DEG);
}
.btn {
  --btn-glow-blur: GLOW_BLUR_REST;
  padding: BTN_PAD_Y BTN_PAD_X;
  border-radius: 12px;
  background-color: {accentColor};
  box-shadow: 0 0 var(--btn-glow-blur) {accentGlow};
  color: {textColor};
  font-size: BTN_FONT_SIZE;
  font-weight: 700;
  font-family: {font};
}
```

## Timeline Construction

One paused timeline. Constants live at the top so phase boundaries are obvious and tweakable.

```js
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });

// ── Phase boundaries (seconds) — see How to Choose Values ─────────
// HEADLINE_START, HEADLINE_END, VIDEO_START, VIDEO_DUR, STEPS_START,
// STEP_STAGGER, STEP_ACTIVE_T2, STEP_ACTIVE_T3, BUTTON_ENTER,
// PRESS_FRAME, PRESS_DUR, SCENE_END
const CHECK_POP = PRESS_FRAME + PRESS_DUR;

// ── Initial transform state (so seek-to-0 is well-defined) ────────
gsap.set(".demo-wrap", { xPercent: -50, yPercent: -50, scale: DEMO_ENTRY_SCALE, opacity: 0 });
gsap.set(".step", { x: STEP_ENTRY_X, opacity: 0 });
gsap.set(".btn-press", { scale: 0, opacity: 0 });
gsap.set(".btn-check", { scale: 0 });

// ── Phase 1: Headline ─────────────────────────────────────────────
tl.fromTo(
  ".headline-wrap",
  { y: HEADLINE_ENTRY_Y, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: HEADLINE_END - HEADLINE_START,
    ease: `back.out(${HEADLINE_BOUNCE})`,
  },
  HEADLINE_START,
);

// ── Phase 2: Center video / animation ─────────────────────────────
tl.to(".demo-wrap", { scale: 1, opacity: 1, duration: VIDEO_DUR, ease: "power3.out" }, VIDEO_START);

// ── Phase 3a: Step stagger entry ──────────────────────────────────
tl.to(
  ".step",
  {
    x: 0,
    opacity: 1,
    duration: STEP_ENTRY_DUR,
    ease: "power3.out",
    stagger: { each: STEP_STAGGER, from: "start" },
  },
  STEPS_START,
);

// ── Phase 3b: Step state machine (snap-toggled via tl.set) ────────
// Steps start in their HTML-default "pending" state. The timeline only
// toggles state transitions; step state is *snap*, never animated.
tl.set(".step-1", { attr: { "data-state": "active" } }, STEPS_START);
tl.set(".step-1", { attr: { "data-state": "complete" } }, STEP_ACTIVE_T2);
tl.set(".step-2", { attr: { "data-state": "active" } }, STEP_ACTIVE_T2);
tl.set(".step-2", { attr: { "data-state": "complete" } }, STEP_ACTIVE_T3);
tl.set(".step-3", { attr: { "data-state": "active" } }, STEP_ACTIVE_T3);

// ── Phase 4a: Button entry (bouncy) ───────────────────────────────
tl.to(
  ".btn-press",
  { scale: 1, opacity: 1, duration: BTN_ENTRY_DUR, ease: `back.out(${BTN_ENTRY_BOUNCE})` },
  BUTTON_ENTER,
);

// ── Phase 4b: Press (linear depression → linear return) ───────────
// Two adjacent tweens. End value of (1) = start value of (2) — see
// press-release-spring's state-continuity principle.
tl.to(
  ".btn-press",
  { scale: PRESS_SCALE, duration: PRESS_DIP_DUR, ease: "power1.out" },
  PRESS_FRAME,
);
tl.to(
  ".btn-press",
  { scale: 1.0, duration: PRESS_DUR - PRESS_DIP_DUR, ease: "power1.in" },
  PRESS_FRAME + PRESS_DIP_DUR,
);

// ── Phase 4c: Color shift + label swap (snap at press end) ────────
tl.to(
  ".btn",
  {
    backgroundColor: "{successColor}",
    boxShadow: "0 0 25px {successGlow}",
    duration: COLOR_SHIFT_DUR,
    ease: "power2.out",
  },
  CHECK_POP,
);
tl.set(".btn-label", { textContent: "{confirmedLabel}" }, CHECK_POP);

// ── Phase 4d: Checkmark pop (spring) ──────────────────────────────
tl.to(
  ".btn-check",
  { scale: 1, duration: CHECK_POP_DUR, ease: `back.out(${CHECK_BOUNCE})` },
  CHECK_POP,
);

// ── Ambient pulsing glow on the button (finite yoyo) ──────────────
// boxShadow string is not GSAP-tweenable — drive a CSS custom property
// `--btn-glow-blur` that the button's `box-shadow` declaration reads.
// `repeat: -1` is forbidden by the HF render contract, so derive a finite
// count from remaining scene time.
const PULSE_HALVES = Math.max(2, Math.floor((SCENE_END - BUTTON_ENTER) / (PULSE_PERIOD / 2)));
tl.fromTo(
  ".btn",
  { "--btn-glow-blur": GLOW_BLUR_MIN },
  {
    "--btn-glow-blur": GLOW_BLUR_MAX,
    duration: PULSE_PERIOD / 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: PULSE_HALVES - 1,
  },
  BUTTON_ENTER,
);

window.__timelines[compositionId] = tl;
```

## Step Indicator States (CSS-driven)

Step state is a discrete attribute, never animated. The CSS maps `[data-state]` to a visual treatment; the timeline only flips the attribute.

```css
.step .step-circle {
  border: 2px solid {mutedColor}; /* pending */
  background-color: transparent;
  box-shadow: none;
}
.step[data-state="active"] .step-circle {
  border-color: {accentColor};
  box-shadow: 0 0 15px {accentGlow};
}
.step[data-state="active"] .step-label { color: {textColor}; font-weight: 700; }
.step[data-state="complete"] .step-circle {
  border-color: {successColor};
  background-color: {successColor};
}
.step[data-state="complete"] .step-num { display: none; }
.step[data-state="complete"] .step-check { display: inline-flex; }
```

| State        | Circle                      | Label             | Shadow      |
| ------------ | --------------------------- | ----------------- | ----------- |
| **Pending**  | Number, muted border        | Muted text        | None        |
| **Active**   | Number, accent-color border | Bold primary text | Accent glow |
| **Complete** | Filled success + checkmark  | Normal text       | None        |

## Phase 4 Detail: Button Press Sequence (Core Glue)

The press splits into four sub-events at three timeline positions. Order and overlap come from the position argument to each `tl.to()`; see [press-release-spring](../rules/press-release-spring.md) for the underlying state-continuity principle.

1. **Depression** (`PRESS_FRAME → PRESS_FRAME + PRESS_DIP_DUR`): linear `scale 1 → PRESS_SCALE`. Linear, not spring — the dip must read as "instant," not squishy.
2. **Return** (`PRESS_FRAME + PRESS_DIP_DUR → CHECK_POP`): linear `scale PRESS_SCALE → 1`. Press and return are split because state continuity matters (end value of press = start value of return, exactly).
3. **Color shift + label swap** (at `CHECK_POP`): `backgroundColor` and `boxShadow` tween from accent to success in `COLOR_SHIFT_DUR`. Label text snaps via `tl.set()` to avoid mid-tween typography flicker.
4. **Checkmark pop** (at `CHECK_POP`): SVG springs from `scale: 0 → 1` with `back.out(${CHECK_BOUNCE})`.

The ambient pulsing glow uses a finite yoyo whose repeat count is computed from remaining scene duration — never `repeat: -1`.

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Headline settled before the demo dominates.
  VIDEO_START can overlap the tail of the headline tween by a small breath
  (~0.05-0.1s) so the two beats read as flow, not as a hard cut.

Phase 2 → Phase 3:
  Demo visible before steps begin staggering in.
  STEPS_START ≥ VIDEO_START + small reveal buffer (~0.15s).

Phase 3 → Phase 4:
  All step states should resolve before the press is the focus.
  PRESS_FRAME ≥ STEP_ACTIVE_T3 + buffer (~0.30s).
  The press is the scene's climax — it should be the last visual event.

Step state machine timing:
  Step N becomes "active" at STEP_ACTIVE_T(N), "complete" at STEP_ACTIVE_T(N+1).
  The final step stays "active" until the press confirmation; there is no
  STEP_ACTIVE_T(N+1) for the last step — the press itself implies completion.

Phase 4 internal handoffs:
  CHECK_POP = PRESS_FRAME + PRESS_DUR (derived — do not assign independently).
  The depression tween's end scale (PRESS_SCALE) MUST equal the return tween's
  start scale, or the spring snaps. Adjacency on the same property at
  PRESS_FRAME + PRESS_DIP_DUR is what makes this automatic in GSAP.
```

## How to Choose Values

### Phase 1 — headline

- **HEADLINE_START** — headline begins sliding down.
  - Range: 0.1-0.3 s; small offset gives a beat of empty frame before content
- **HEADLINE_END** — headline lands.
  - Constraints: `HEADLINE_END > HEADLINE_START`; tween duration = `HEADLINE_END − HEADLINE_START` should be 0.4-0.7 s
- **HEADLINE_ENTRY_Y** — initial vertical offset of the headline before sliding in (px).
  - Range: −30 to −80; smaller feels gentle, larger feels punchy
- **HEADLINE_BOUNCE** — `back.out(HEADLINE_BOUNCE)` for the entry settle.
  - Range: 1.0 (soft) → 1.4 (firm); above ~1.6 the title oscillates more than feels editorial

### Phase 2 — center demo

- **VIDEO_START** — demo begins scaling in.
  - Constraints: can overlap the tail of the headline tween by ~0.05-0.1 s
- **VIDEO_DUR** — scale-in duration.
  - Range: 0.4-0.8 s
- **DEMO_ENTRY_SCALE** — starting scale of the demo before it pops to 1.
  - Range: 0.7-0.9; smaller reads as a more pronounced entrance
- **DEMO_WIDTH / DEMO_HEIGHT** — demo frame footprint (px).
  - Constraints: must fit between the left and right flanks with comfortable padding

### Phase 3 — step indicators

- **STEPS_START** — first step begins stagger-entering.
  - Constraints: `≥ VIDEO_START + ~0.15s`
- **STEP_ENTRY_DUR** — per-step fade/slide-in duration.
  - Range: 0.3-0.5 s
- **STEP_STAGGER** — gap between consecutive step entries.
  - Range: 0.3-0.7 s; calibrated so all `N` steps finish before `STEP_ACTIVE_T2`
- **STEP_ENTRY_X** — initial horizontal offset of each step before sliding in (px).
  - Range: −20 to −50; negative because steps enter from the left
- **STEP_ACTIVE_T2** — step 1 → complete, step 2 → active (simultaneous).
  - Constraints: `≥ STEPS_START + (numSteps × STEP_STAGGER)` so all steps are visible before transitions begin
- **STEP_ACTIVE_T3** — step 2 → complete, step 3 → active.
  - Constraints: `≥ STEP_ACTIVE_T2 + readDwell`; `readDwell` is 1.0-1.5 s so the viewer can register the active state before it changes
- **STEP_GAP** — vertical gap between step rows (px).
  - Range: 20-40

### Phase 4 — button + press

- **BUTTON_ENTER** — button bouncy entrance.
  - Constraints: typically tied to when the final step becomes active — `≈ STEP_ACTIVE_T(last) + small breath`
- **BTN_ENTRY_DUR** — button scale-in duration.
  - Range: 0.4-0.6 s
- **BTN_ENTRY_BOUNCE** — `back.out(BTN_ENTRY_BOUNCE)` overshoot on the button entry.
  - Range: 1.2-1.6
- **PRESS_FRAME** — press starts.
  - Constraints: `≥ STEP_ACTIVE_T(last) + ~0.30s`; `≥ BUTTON_ENTER + BTN_ENTRY_DUR + ~0.2s` so the button has settled
- **PRESS_DUR** — total press cycle (depression + return).
  - Range: 0.3-0.7 s
- **PRESS_DIP_DUR** — duration of the depression half of the press.
  - Range: 0.08-0.15 s; intentionally shorter than the return half so the dip feels instant
  - Constraints: `PRESS_DIP_DUR < PRESS_DUR`
- **PRESS_SCALE** — compression depth (matches `PRESS_SCALE` from the press-release-spring rule).
  - Range: 0.88-0.96; this blueprint defaults to the subtle end (~0.95) since the climax is the color shift + checkmark, not the dip
- **COLOR_SHIFT_DUR** — accent → success color tween duration.
  - Range: 0.2-0.4 s
- **CHECK_POP_DUR** — checkmark scale-up duration.
  - Range: 0.4-0.7 s
- **CHECK_BOUNCE** — `back.out(CHECK_BOUNCE)` overshoot on the checkmark.
  - Range: 1.4-2.0; this is the "punctuation" of the scene — go firm

### Pulsing glow

- **PULSE_PERIOD** — full sine cycle of the button glow (seconds).
  - Range: 0.8-1.5 s; faster reads as urgent, slower as ambient
- **GLOW_BLUR_REST / GLOW_BLUR_MIN / GLOW_BLUR_MAX** — `--btn-glow-blur` CSS variable bounds (px).
  - Range: rest ~20; min and max bracket the rest symmetrically (e.g. 10 / 30 around 20)

### Layout / scene

- **SCENE_END** — matches the root `data-duration`.
  - Range: 4-6 s (per blueprint `duration_seconds`)
  - Constraints: ≥ `CHECK_POP + dwell` where dwell ≥ ~0.5-1.0 s so the success state holds before fade
- **HEADLINE_TOP** — vertical position of the headline (px from top).
  - Range: 60-120
- **HEADLINE_FONT_SIZE / BTN_FONT_SIZE** — typographic weights.
  - Constraints: `BTN_FONT_SIZE < HEADLINE_FONT_SIZE` (headline is the title; button label is the call-to-action)
- **BTN_PAD_Y / BTN_PAD_X** — button padding; together with font size determines button footprint
- **FLANK_INSET** — distance from canvas edge to each flank container (px).
  - Range: 60-120
- **FLANK_TILT_DEG** — 3D tilt in degrees. Left = `+FLANK_TILT_DEG`, right = `-FLANK_TILT_DEG`.
  - Range: 12-18°; opposing rotations create inward-facing symmetry. Above ~20° the inner content distorts unreadably.
- **FLANK_PERSPECTIVE** — perspective distance on each flank (px).
  - Range: 600-1000; smaller = stronger depth, larger = subtler
  - Constraints: perspective MUST live on the flank element, not a distant parent (see Critical Constraints)

### Tokens

- **{bgGradient}** — composition background, typically a dark radial fading to near-black
- **{accentColor}** — primary brand / interactive color; used on `.accent`, `.btn` resting state, active step border
- **{accentGlow}** — semi-transparent form of `{accentColor}` for shadows / glows
- **{successColor}** — confirmation color (typically a saturated green) for the completed step and the post-press button
- **{successGlow}** — semi-transparent form of `{successColor}`
- **{textColor} / {mutedColor}** — primary text and muted/pending text colors
- **{panelStroke} / {hardShadow}** — thin border on the demo frame; deep drop shadow under it
- **{font}** — primary sans-serif stack used across headline / steps / button

## Critical Constraints

- **3D tilt is perspective-anchored on the flank**: `perspective(${FLANK_PERSPECTIVE})` belongs on the flank element directly. Perspective from far up the tree distorts depth proportions on the inner content.
- **Step state is snap-toggled, not animated**: steps jump to states via `tl.set({ attr: "data-state": "…" })`. Any visual change (checkmark reveal, color shift) is driven by CSS responding to the attribute — never by a CSS `transition`, which would interpolate independently of HF seek.
- **Button depression is linear, not spring**: the press dip uses `power1.out` / `power1.in`, not `back.out`. An elastic dip reads as squishy rather than tactile.
- **Press = two adjacent tweens, exact state continuity**: end value of the depression tween must equal the start value of the return tween. GSAP threads this automatically because both target `scale` on the same element at sequential positions — but never start the return tween before the depression finishes.
- **Video out-survives the press**: the center demo plays throughout. It must be long enough (or looped via a sub-composition that itself doesn't end). `SCENE_END` is the upper bound on what the video has to cover.
- **2-3 steps maximum**: more steps cannot be read in a ~5 s scene. Use a longer scene or split into two compositions if you genuinely need 4+ steps.
- **GSAP transform aliases only**: `x`, `y`, `scale`, `rotation`. Never tween `left`, `top`, `width`, `height` — they're forbidden by the HF animated-property allowlist and trigger layout reflows.
- **No infinite repeats**: the button glow pulse uses a finite `repeat` computed from remaining scene time, never `repeat: -1`.
- **Single paused timeline**: one `gsap.timeline({ paused: true })`, registered to `window.__timelines[compositionId]`. HyperFrames seeks it.
- **`data-duration` on the root** governs render length, not the GSAP timeline's intrinsic length.

## Spring → GSAP Ease Cheatsheet (this blueprint)

| Spring feel                               | Ease family used here           |
| ----------------------------------------- | ------------------------------- |
| Soft settle — headline entry              | `back.out(${HEADLINE_BOUNCE})`  |
| Cinematic ease-out — demo scale-in        | `power3.out`                    |
| Tight enter — steps stagger               | `power3.out`                    |
| Firm pop — button entry                   | `back.out(${BTN_ENTRY_BOUNCE})` |
| Mechanical / tactile — press dip + return | `power1.out` then `power1.in`   |
| Punctuating "stamp" — checkmark           | `back.out(${CHECK_BOUNCE})`     |
| Ambient breathing — pulsing glow          | `sine.inOut` finite-yoyo        |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [workflow-approve-press.html](../examples/workflow-approve-press.html) — runnable composition that realizes every named constant in this blueprint with concrete values. Single paused GSAP timeline drives all four phases.
