---
id: metric-video-text-pivot
role: metric
duration_seconds: [5, 8]
phases: 4
visual_arc: video-center → video-slides-aside → text-typing → stat-reveal
uses_rules: [3d-text-depth-layers, sine-wave-loop]
element_roles:
  video: Product demo video that starts centered, then slides to make room for the stat
  typing_text: Character-by-character typed lines, with accent-colored keywords
  stat: Giant metric label rendered with 3D depth layers
  pill: Gradient background pill that scales in behind a closing phrase
when_to_use:
  - Scene transitions from showing a feature to stating its impact
  - Metric needs dramatic typographic treatment, not just a number overlay
  - Video provides context, text provides the "so what" payoff
  - Pivot from visual demonstration to textual impact statement
when_not_to_use:
  - Video should remain the focal point throughout
  - Stat is secondary information (use overlay)
  - Scene is purely typographic with no video
triggers:
  [
    accuracy rate,
    engagement increase,
    show feature then stat,
    video moves aside,
    big number reveal,
    metric emphasis,
  ]
---

# Metric · Video Text Pivot

Product video centered → video slides aside → giant stat appears in the freed space → both exit → kinetic text types in the center → gradient pill scales in behind a closing phrase.

Four-phase "show → tell with impact" arc; one paused GSAP timeline; constituent patterns map to [3d-text-depth-layers](../rules/3d-text-depth-layers.md) and [sine-wave-loop](../rules/sine-wave-loop.md) (for the video's idle float and the stat's breath). Accent words use a static CSS color (no per-frame glow envelope).

## When to Use

- Scene has two narrative beats: "see the feature" then "see the impact"
- A product video should establish context before yielding to text
- The stat / metric needs dramatic, frame-filling typographic treatment
- The video doesn't disappear permanently — it slides aside to maintain context, then exits when the stat takes over

## Phase Pipeline

All boundaries are in **seconds** (typically ASR-driven; convert frame indices to seconds via `frames / fps`).

| Phase | Time window (s)             | What Happens                                                                                              | Skill Reference                                                                                        |
| ----- | --------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1     | `VIDEO_ENTRY_AT – SLIDE_AT` | Video enters centered with 3D tilt and floats gently                                                      | inline tilt + [sine-wave-loop](../rules/sine-wave-loop.md)                                             |
| 2     | `SLIDE_AT – PIVOT_AT`       | Video slides aside; stat appears in the freed space with 3D depth layers + breathing                      | [3d-text-depth-layers](../rules/3d-text-depth-layers.md), [sine-wave-loop](../rules/sine-wave-loop.md) |
| 3     | `PIVOT_AT – PILL_AT`        | Both video and stat exit; kinetic text types center-screen with accent-colored keywords + blinking cursor | inline typing with static CSS accent classes                                                           |
| 4     | `PILL_AT – end`             | Gradient pill scales in behind the closing line with a glow halo                                          | inline pill scale                                                                                      |

When timings are anchored to spoken-word timestamps, bake each anchor as a `const` converted from frame indices.

## Initial Layout

Four zones share an absolute-fill stage:

```html
<div class="stage" style="position: absolute; inset: 0;">
  <div class="bg"></div>
  <div class="ambient-glow"></div>
  <!-- soft radial behind everything -->
  <div class="badge">{Brand}</div>
  <!-- top label -->

  <!-- Phase 1+2: Video card. Three nested wrappers separate concerns. -->
  <div class="video-pos">
    <!-- GSAP: x (entry/slide/exit), scale, opacity -->
    <div class="video-float">
      <!-- onUpdate: y (float) -->
      <div class="video-tilt">
        <!-- CSS: rotateY(VIDEO_TILT_Y) rotateX(VIDEO_TILT_X) -->
        <div class="video-content">
          <video src="{videoAsset}" muted playsinline></video>
        </div>
      </div>
    </div>
  </div>

  <!-- Phase 2: Stat. Three nested wrappers, same pattern. -->
  <div class="stat-pos">
    <!-- GSAP: x (entry/exit), y (entry), scale, opacity -->
    <div class="stat-breath">
      <!-- onUpdate: scale (breathing) -->
      <div class="stat-tilt">
        <!-- CSS: rotateY(STAT_TILT_Y) rotateX(STAT_TILT_X) -->
        <div class="depth-stack" data-text="{statLabel}"></div>
      </div>
    </div>
  </div>

  <!-- Phase 3+4: Typing + pill. -->
  <div class="typing-stage">
    <!-- GSAP: opacity, scale entry -->
    <div class="typing-tilt">
      <!-- CSS: rotateY(TYPING_TILT_Y) rotateX(TYPING_TILT_X) -->
      <div class="line1">
        <span class="seg main"></span>
        <span class="seg accent"></span>
        <span class="seg suffix"></span>
        <span class="seg accent2"></span>
        <span class="cursor cursor1"></span>
      </div>
      <div class="line2-wrap">
        <div class="pill-bg"></div>
        <!-- GSAP: scaleX, scaleY, opacity -->
        <div class="pill-glow"></div>
        <!-- GSAP: opacity -->
        <div class="line2-content">
          <span class="seg line2"></span>
          <span class="cursor cursor2"></span>
        </div>
      </div>
    </div>
  </div>

  <div class="vignette"></div>
</div>
```

```css
.seg.accent,
.seg.accent2 {
  color: {accentColor};
}
.pill-bg {
  background: linear-gradient(90deg, {pillStartColor} 0%, {accentColor} 100%);
  transform-origin: center center;
}
```

**Three nested wrappers per moving element** is the recurring pattern:

- Outermost (`-pos`) handles GSAP entry / slide / exit
- Middle (`-float` or `-breath`) handles onUpdate-driven continuous motion
- Innermost (`-tilt`) holds the static 3D rotation via CSS

This isolation prevents the float onUpdate from overwriting the slide tween's `x`, and prevents the slide tween from overwriting the float's `y`. Each wrapper owns one concern.

## Phase 1: Video Entry + Float

Editorial intent: open on the product video at full attention. A small scale-up and fade-in let the viewer parse the frame before any motion off the static tilt; the gentle float keeps it "alive" while it's the only element on screen.

```js
gsap.set(".video-pos", { x: W / 2, y: H / 2, scale: VIDEO_ENTRY_SCALE, opacity: 0 });

tl.to(
  ".video-pos",
  {
    scale: 1,
    opacity: 1,
    duration: VIDEO_ENTRY_DUR,
    ease: "power3.out",
  },
  VIDEO_ENTRY_AT,
);
```

The 3D tilt is set once in CSS on `.video-tilt`. The float (small `y` sine) runs continuously from `t=0` in the shared scene-ticker onUpdate — see [sine-wave-loop](../rules/sine-wave-loop.md) for the breathing pattern.

## Phase 2: Video Slide + Stat Reveal

Editorial intent: the video remains visible (context) but yields screen real estate to the stat. Both motions land on the same timeline anchor (`SLIDE_AT`, typically the stat label's spoken-word timestamp) so the slide _creates_ the empty space the stat _fills_.

```js
/* Video slides aside and shrinks slightly to make room for the stat. */
tl.to(
  ".video-pos",
  {
    x: VIDEO_SLIDE_X,
    scale: VIDEO_SLIDE_SCALE,
    duration: VIDEO_SLIDE_DUR,
    ease: "power3.out",
  },
  SLIDE_AT,
);

/* Stat appears in the freed space with a bouncy entry. */
gsap.set(".stat-pos", {
  x: STAT_ENTRY_X,
  y: STAT_ENTRY_Y_OFFSET,
  scale: STAT_ENTRY_SCALE,
  opacity: 0,
});

tl.to(
  ".stat-pos",
  {
    y: 0,
    scale: 1,
    opacity: 1,
    duration: STAT_ENTRY_DUR,
    ease: `back.out(${STAT_BOUNCE_FACTOR})`,
  },
  SLIDE_AT,
);
```

The 3D depth stack inside `.stat-tilt` is built once at composition setup time — see [3d-text-depth-layers](../rules/3d-text-depth-layers.md). The breath multiplies onto the stat's final scale of 1.0 via the shared scene-ticker (onUpdate / multiplicative form of [sine-wave-loop](../rules/sine-wave-loop.md)):

```js
onUpdate: function () {
  const t = tl.time();
  if (t > STAT_BREATH_START && t < PIVOT_AT) {
    const breath = 1 + Math.sin((t - STAT_BREATH_START) * STAT_BREATH_FREQ) * STAT_BREATH_AMP;
    gsap.set(".stat-breath", { scale: breath });
  }
  // ... other continuous motions
}
```

## Phase 3: Pivot — Both Exit + Typing Begins

Editorial intent: the pivot. The video and stat both leave together so the empty stage cues a new beat; the typing fades in on the same anchor so the viewer's attention transfers without a gap.

```js
tl.to(
  ".video-pos",
  {
    x: VIDEO_EXIT_X,
    scale: EXIT_SCALE,
    opacity: 0,
    duration: EXIT_DUR,
    ease: "power3.out",
  },
  PIVOT_AT,
);

tl.to(
  ".stat-pos",
  {
    x: STAT_EXIT_X,
    scale: EXIT_SCALE,
    opacity: 0,
    duration: EXIT_DUR,
    ease: "power3.out",
  },
  PIVOT_AT,
);

/* Typing stage fades + scales in. */
gsap.set(".typing-stage", { scale: TYPING_ENTRY_SCALE, opacity: 0 });
tl.to(
  ".typing-stage",
  {
    scale: 1,
    opacity: 1,
    duration: TYPING_STAGE_DUR,
    ease: "power3.out",
  },
  PIVOT_AT,
);
```

## Phase 3 (continued): Character-by-Character Typing

A single proxy tween drives the character index `0 → totalChars`. Inside `onUpdate`, slice the full text into the correct sub-spans based on segment boundaries and current index. Accent spans are pre-styled in CSS; no per-frame color tween.

The line structure is two lines: line 1 alternates between neutral and accent segments (4 segments here), line 2 is the closing phrase that sits inside the pill.

```js
const SEG = {
  main: "{lineMainBefore}", // neutral lead-in on line 1
  accent: "{lineMainAccent}", // accent keyword
  suffix: "{lineMainBetween}", // neutral connector
  accent2: "{lineMainAccent2}", // accent keyword
  line2: "{lineClosing}", // closing phrase inside the pill
};

// Boundaries computed from segment lengths (do NOT hard-code character counts).
const BOUNDS = {
  mainEnd: SEG.main.length,
  accentEnd: SEG.main.length + SEG.accent.length,
  suffixEnd: SEG.main.length + SEG.accent.length + SEG.suffix.length,
  accent2End: SEG.main.length + SEG.accent.length + SEG.suffix.length + SEG.accent2.length,
  line2End:
    SEG.main.length + SEG.accent.length + SEG.suffix.length + SEG.accent2.length + SEG.line2.length,
};

const typeProxy = { idx: 0 };
const TYPE_DUR = BOUNDS.line2End / TYPE_RATE;

tl.to(
  typeProxy,
  {
    idx: BOUNDS.line2End,
    duration: TYPE_DUR,
    ease: "none",
    onUpdate: () => {
      const i = Math.floor(typeProxy.idx);
      segMain.textContent = SEG.main.slice(0, Math.min(i, BOUNDS.mainEnd));
      segAccent.textContent = SEG.accent.slice(
        0,
        Math.max(0, Math.min(i - BOUNDS.mainEnd, SEG.accent.length)),
      );
      segSuffix.textContent = SEG.suffix.slice(
        0,
        Math.max(0, Math.min(i - BOUNDS.accentEnd, SEG.suffix.length)),
      );
      segAccent2.textContent = SEG.accent2.slice(
        0,
        Math.max(0, Math.min(i - BOUNDS.suffixEnd, SEG.accent2.length)),
      );
      segLine2.textContent = SEG.line2.slice(
        0,
        Math.max(0, Math.min(i - BOUNDS.accent2End, SEG.line2.length)),
      );
    },
  },
  TYPING_START_AT,
);
```

Accent-colored spans (`.seg.accent`, `.seg.accent2`) get their color from a static CSS rule referencing `{accentColor}` — no per-frame color tween or glow envelope. The cursor blinks via a separate onUpdate (next section), and switches between neutral and accent color based on which segment is currently typing.

## Phase 4: Gradient Pill Reveal Behind Line 2

Editorial intent: stamp of impact. The pill snaps into shape around the closing line right as line 2 starts typing, so the audience experiences "phrase + frame" as a single graphic. The glow halo arrives slightly slower so the silhouette resolves before the bloom registers.

```js
const PILL_AT = TYPING_START_AT + BOUNDS.accent2End / TYPE_RATE; // line 2 typing begins

gsap.set(".pill-bg", { scaleX: 0, scaleY: PILL_INITIAL_SCALE_Y, opacity: 0 });
gsap.set(".pill-glow", { opacity: 0 });

/* Pill scaleX 0 → 1 + scaleY ramps to 1 + opacity → PILL_OPACITY in one ease. */
tl.to(
  ".pill-bg",
  {
    scaleX: 1,
    scaleY: 1,
    opacity: PILL_OPACITY,
    duration: PILL_DUR,
    ease: "power3.out",
  },
  PILL_AT,
);

/* Soft glow halo behind the pill — fades in slightly slower. */
tl.to(
  ".pill-glow",
  {
    opacity: PILL_GLOW_OPACITY,
    duration: PILL_GLOW_DUR,
    ease: "power2.out",
  },
  PILL_AT,
);
```

The pill background is a horizontal gradient between `{pillStartColor}` and `{accentColor}`; the glow is a blurred radial gradient further behind. Both use `transform-origin: center center` so they scale outward from the phrase center.

## Blinking Cursor

Derive deterministically from `tl.time()` so the blink is a pure function of seek position (no `Date.now`, no `Math.random`, no CSS animation):

```js
onUpdate: function () {
  const t = tl.time();
  const cursorVisible = (Math.floor(t * CURSOR_BLINK_HZ * 2) % 2 === 0) ? 1 : 0;
  // Show cursor1 only while typing line1 (idx < accent2End)
  cursor1.style.opacity = (i < BOUNDS.accent2End) ? cursorVisible : 0;
  // Show cursor2 only while typing line2
  cursor2.style.opacity = (i >= BOUNDS.accent2End && i < BOUNDS.line2End) ? cursorVisible : 0;
}
```

`Math.floor(t * CURSOR_BLINK_HZ * 2) % 2 === 0` produces a 50% duty-cycle blink at `CURSOR_BLINK_HZ` blinks/sec.

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Video entry completes by VIDEO_ENTRY_AT + VIDEO_ENTRY_DUR.
  SLIDE_AT must leave enough breathing room (≥ ~1 s) for the float to read as
  "alive" before the layout is disturbed.

Phase 2 → Phase 3:
  Stat entry completes by SLIDE_AT + STAT_ENTRY_DUR.
  Stat breath activates at STAT_BREATH_START (≥ stat entry end + small buffer).
  PIVOT_AT cuts breathing short — the exit tween's scale overrides the breath's onUpdate
  for the stat once t > PIVOT_AT (gated inside the scene-ticker).

Phase 3 typing:
  Typing starts at TYPING_START_AT (= PIVOT_AT + TYPING_STAGE_DUR) so the stage has
  scaled / faded in before characters appear.
  Total typing duration: BOUNDS.line2End / TYPE_RATE.

Phase 3 → Phase 4:
  PILL_AT = TYPING_START_AT + (BOUNDS.accent2End / TYPE_RATE) — the moment line 2 starts.
  Pill scale finishes by PILL_AT + PILL_DUR, ideally before line 2 finishes typing so
  the pill frames the phrase as it lands.

Continuous (from t = 0):
  Shared scene-ticker onUpdate drives the video float (Phase 1+2), the stat breath
  (Phase 2 only), and the cursor blink (Phase 3+4). Each motion gates itself by time
  windows so it doesn't fire outside its visibility.
```

## How to Choose Values

### Stage geometry / placeholders

- **{Brand}** — top badge label
- **{statLabel}** — the metric label rendered inside the depth stack (1-4 chars reads best at heroic font sizes)
- **{lineMainBefore} / {lineMainAccent} / {lineMainBetween} / {lineMainAccent2}** — line 1 segments alternating neutral / accent / neutral / accent
- **{lineClosing}** — short closing phrase that fits inside the pill
- **{accentColor}** — single accent hue shared by the stat, the line-1 accent spans, the line-2 cursor, and the pill's end stop
- **{pillStartColor}** — pill gradient start hue (typically a complementary brand tone)
- **{videoAsset}** — product demo MP4 path
- **{font} / {monoFont}** — primary typeface and (if any) cursor/mono fallback
- **VIDEO_TILT_X / VIDEO_TILT_Y / STAT_TILT_X / STAT_TILT_Y / TYPING_TILT_X / TYPING_TILT_Y** — static CSS 3D rotations.
  - Range: 3-8° on X (slight pitch); 10-18° on Y (clear yaw)
  - Effects: opposite-sign Y between video and stat reads as "two surfaces angled toward camera"

### Phase 1 — video entry + float

- **VIDEO_ENTRY_AT** — timeline offset where the video enters.
  - Constraints: typically `≥ 0`; if a badge precedes, ≥ that beat's end
- **VIDEO_ENTRY_DUR** — entry tween duration.
  - Range: 0.5-1.0 s
- **VIDEO_ENTRY_SCALE** — initial scale before scale-up.
  - Range: 0.5-0.75. Smaller reads as "popping forward"; larger reads as a gentle fade
- **Float amplitude / frequency** — see [sine-wave-loop](../rules/sine-wave-loop.md) (`Y_AMP_PX` 2-6 px, ~0.7-1.0 rad/s)

### Phase 2 — slide + stat reveal

- **SLIDE_AT** — when the video slides and the stat appears.
  - Constraints: `≥ VIDEO_ENTRY_AT + VIDEO_ENTRY_DUR + ~1.0 s` so the float reads before the layout changes
- **VIDEO_SLIDE_DUR** — duration of the slide tween.
  - Range: 0.6-1.0 s — slower than the entry so the motion reads as "yielding," not "fleeing"
- **VIDEO_SLIDE_X** — video's new x-center after the slide.
  - Range: 0.25-0.35 × viewport width. Smaller crowds the stat; larger leaves a hole between video and stat
- **VIDEO_SLIDE_SCALE** — video's new scale during Phase 2.
  - Range: 0.80-0.92. Smaller shrinkage reads as "demoted"; near-1 reads as "still a peer"
- **STAT_ENTRY_X / STAT_ENTRY_Y_OFFSET** — stat's initial position before pop.
  - Range: `STAT_ENTRY_X` ≈ 0.55-0.65 × viewport width; `STAT_ENTRY_Y_OFFSET` 40-80 px below final to give the bounce something to overcome
- **STAT_ENTRY_SCALE** — stat's initial scale.
  - Range: 0.25-0.45. Lower scale + back.out gives the "thrown into place" feel
- **STAT_ENTRY_DUR** — stat entry duration.
  - Range: 0.5-0.7 s
- **STAT_BOUNCE_FACTOR** — `back.out(STAT_BOUNCE_FACTOR)` overshoot strength.
  - Range: 1.4 (soft) → 2.0 (firm) → 2.8 (cartoony). The stat usually wants firm-to-cartoony so the entry feels like a "stamp"
- **STAT_BREATH_START** — when breathing activates.
  - Constraints: `≥ SLIDE_AT + STAT_ENTRY_DUR + ~0.1 s` so the breath doesn't fight the bounce's settle
- **STAT_BREATH_FREQ / STAT_BREATH_AMP** — sine frequency (rad/s) and amplitude (fractional scale).
  - Range: `STAT_BREATH_FREQ` 1.0-1.5 rad/s; `STAT_BREATH_AMP` 0.015-0.03. See [sine-wave-loop](../rules/sine-wave-loop.md)

### Phase 3 — pivot + typing

- **PIVOT_AT** — when both video and stat exit and typing starts to fade in.
  - Constraints: `≥ STAT_BREATH_START + ~0.5 s` so at least a few breath cycles are visible
- **EXIT_DUR** — exit tween duration for both video and stat.
  - Range: 0.5-0.8 s
- **VIDEO_EXIT_X / STAT_EXIT_X** — final positions during the exit (off-screen).
  - Range: ≤ −0.5 × viewport width for the video; ≤ −0.7 × viewport width for the stat (further so the stat clears past the video)
- **EXIT_SCALE** — final scale during exit (small reduction).
  - Range: 0.75-0.85
- **TYPING_ENTRY_SCALE** — typing stage's initial scale before fade-in.
  - Range: 0.85-0.95
- **TYPING_STAGE_DUR** — typing-stage entry duration.
  - Range: 0.4-0.6 s
- **TYPING_START_AT** — when characters start appearing.
  - Constraints: `= PIVOT_AT + TYPING_STAGE_DUR` so the stage has settled before characters appear
- **TYPE_RATE** — typing speed, in characters/sec.
  - Range: 20-40 chars/sec. ~30 chars/sec matches "1 char/frame at 30 fps." Faster reads as machine-gun output; slower reads as deliberate / dramatic
  - Constraints: total typing duration `= BOUNDS.line2End / TYPE_RATE` must fit inside `end − TYPING_START_AT − PILL_DUR` (the pill needs time after line 2 starts)

### Phase 4 — pill

- **PILL_INITIAL_SCALE_Y** — pill's pre-reveal vertical squash.
  - Range: 0.4-0.6. Smaller reads as a horizontal line snapping outward; larger pre-empts the climax
- **PILL_DUR** — pill scale tween duration.
  - Range: 0.5-0.7 s
- **PILL_OPACITY** — final pill background opacity.
  - Range: 0.8-0.95 — slightly translucent so the glow halo bleeds through the edges
- **PILL_GLOW_DUR** — glow halo fade duration.
  - Range: `≈ PILL_DUR + 0.1-0.3 s` so the glow lags slightly behind the silhouette
- **PILL_GLOW_OPACITY** — final glow halo opacity.
  - Range: 0.4-0.6

### Cursor blink

- **CURSOR_BLINK_HZ** — blinks per second.
  - Range: 1-2 Hz. 1 Hz reads as natural cursor; 2 Hz feels manic; below 0.5 Hz feels lazy

## Critical Constraints

- **Video stays visible during Phase 2**: it slides aside but does not exit until Phase 3. This maintains context while the stat takes focus.
- **ASR-driven timing**: when timings are anchored to spoken-word timestamps (`SLIDE_AT`, `PIVOT_AT`, segment boundaries), bake them as constants converted from `frames / fps`. No runtime ASR lookups.
- **Three nested wrappers per moving element**: `-pos` / `-float` (or `-breath`) / `-tilt`. Each owns one concern; the float onUpdate never overwrites the slide tween's `x`.
- **Pill scales from center**: `transform-origin: center center` on the pill background.
- **3D depth layers — see the rule**: layer count, offsets, alpha falloff all governed by [3d-text-depth-layers](../rules/3d-text-depth-layers.md).
- **Conditional rendering replaced by opacity + gating**: do not conditionally mount / unmount elements. Render permanently; GSAP tweens opacity to 0 to hide. Gates inside the scene-ticker prevent breath / float from firing outside their visibility windows.
- **GSAP transform aliases only**: `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `rotationY`, `rotationX`. Never `width` / `height` / `left` / `top`.
- **No `Math.random` / `Date.now` / `performance.now`**: all motion is a pure function of `tl.time()`.
- **No infinite repeats**: all continuous motions in the scene-ticker run over a finite `duration: TOTAL_DUR`. No `repeat: -1`.
- **Single paused timeline**: all four phases on one `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`.

## Spring → GSAP Ease Cheatsheet (this blueprint)

| Source spring                                               | This blueprint uses                                                   |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `spring({ stiffness: 80, damping: 15 })` — video entry      | `power3.out` over `VIDEO_ENTRY_DUR`                                   |
| `spring({ stiffness: 100, damping: 18 })` — video slide     | `power3.out` over `VIDEO_SLIDE_DUR`                                   |
| `spring({ stiffness: 120, damping: 20 })` — video/stat exit | `power3.out` over `EXIT_DUR`                                          |
| `spring({ stiffness: 150, damping: 12 })` — stat entry      | `back.out(${STAT_BOUNCE_FACTOR})` over `STAT_ENTRY_DUR`               |
| `spring({ stiffness: 80, damping: 15 })` — pill scale       | `power3.out` over `PILL_DUR`                                          |
| `spring({ stiffness: 100, damping: 15 })` — typing stage    | `power3.out` over `TYPING_STAGE_DUR`                                  |
| `sin(frame * 0.04) * 0.02` — stat breath                    | `Math.sin(t * STAT_BREATH_FREQ) * STAT_BREATH_AMP` in onUpdate        |
| `sin(frame * 0.03) * 6` — video float                       | `Math.sin(t * floatFreq) * Y_AMP_PX` in onUpdate (see sine-wave-loop) |
| `frame % 30 < 15` — cursor blink                            | `Math.floor(t * CURSOR_BLINK_HZ * 2) % 2 === 0` in onUpdate           |

See [hyperframes-animation/SKILL.md](../SKILL.md) for the full spring → ease mapping table.

## Golden Sample

- [metric-video-text-pivot.html](../examples/metric-video-text-pivot.html) — concrete instance with all placeholders filled in: timings, copy, colors, fonts, and the chosen video asset. Use it to verify the orchestration end-to-end (lint + render).
