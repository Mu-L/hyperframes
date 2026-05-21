---
id: proof-logo-chain
role: social-proof
duration_seconds: [6, 10]
phases: 5
visual_arc: brand-decode → text-swap → logo-centers → avatars-network → brand-logos
uses_rules: [hacker-flip-3d, vertical-spring-ticker, coordinate-target-zoom, avatar-cloud-network]
element_roles:
  anchor: Logo that threads across all shots, repositioning as the visual link
  decode_text: Brand name revealed via hacker-flip alongside the anchor
  swap_text: Replacement text sliding in after the decode (the claim phrase)
  counter: Numeric/short label appearing with the avatar cloud
  avatars: User avatars on an elliptical ring around the anchor
  endorsement_logos: Partner / brand logos scrolling at the bottom
when_to_use:
  - Brand authority via multiple progressive proof points
  - Logo threads multiple shots as the visual link
  - 3-4 distinct claims packed in one continuous sequence
when_not_to_use:
  - Single-beat scene, no progression
  - No persistent brand element available
  - Authority from a single source only
triggers: [brand reveal, social proof, "#1 tool", million users, trusted by]
---

# Proof · Logo Chain (HyperFrames)

Logo + hacker-flip text → text swaps to claim → logo repositions center → avatar cloud builds around logo → brand endorsement logos appear.

Single paused GSAP timeline driven by HyperFrames' seek loop; the four referenced rules slot in as phase implementations.

## When to Use

- Authority/credibility scene with progressive proof stacking
- A brand logo should anchor the viewer's attention across multiple content changes
- Scene packs 3-4 distinct claims into one continuous sequence

## Phase Pipeline

All phase boundaries are expressed in **seconds**, not frames. HyperFrames operates on continuous time; GSAP tween durations carry the choreography.

| Phase | Time window (s)                   | What Happens                                                               | Skill Reference                                                             |
| ----- | --------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1     | `0 – DECODE_END`                  | Logo pops in + brand name decodes via hacker-flip                          | [hacker-flip-3d](../rules/hacker-flip-3d.md)                                |
| 2     | `SWAP_TRIGGER – SWAP_END`         | Brand name slides out, claim text slides in; logo + container shift left   | [vertical-spring-ticker](../rules/vertical-spring-ticker.md) (claim ticker) |
| 3     | `RECENTER_TRIGGER – RECENTER_END` | Claim text exits, logo shifts to screen center + optional vertical adjust  | [coordinate-target-zoom](../rules/coordinate-target-zoom.md) (shift only)   |
| 4     | `AVATARS_TRIGGER – AVATARS_END`   | Counter appears top, avatar cloud builds around logo with connection lines | [avatar-cloud-network](../rules/avatar-cloud-network.md)                    |
| 5     | `LOGOS_TRIGGER – end`             | Partner brand logos stagger-enter at bottom with horizontal scroll         | inline                                                                      |

## Initial Layout

Logo and text in a centered flex row. Logo is the persistent element; text container is the swappable element. Both wrapped in a translation container for recentering. **All transforms use GSAP transform aliases (`x`, `y`, `scale`)**, never CSS `left` / `top` — the HyperFrames allowlist forbids layout-property tweens.

```html
<div
  class="anchor-stage"
  style="position: absolute; inset: 0;
     display: flex; align-items: center; justify-content: center;"
>
  <!-- shift container: GSAP tweens .x on this element for recentering -->
  <div class="anchor-shift" style="display: flex; align-items: center; gap: ANCHOR_GAP;">
    <!-- Anchor: logo — persists across all phases, z-index above everything else -->
    <div
      class="anchor-logo"
      style="
         position: relative;
         width: LOGO_SIZE; height: LOGO_SIZE;
         z-index: 100;
         transform: scale(0);"
    >
      <img
        src="{heroAsset}"
        style="width:100%; height:100%; object-fit:contain;
           filter: drop-shadow(0 4px 24px rgba(0,0,0,0.4));"
      />
    </div>

    <!-- Swappable text zone — fades out in Phase 3 -->
    <div class="anchor-text" style="position: relative; display: flex; align-items: center;">
      <!-- Phase 1: hacker-flip {Brand} (see hacker-flip-3d.md) -->
      <div class="phase1-text" style="display: flex; perspective: 800px; white-space: nowrap;">
        <!-- one .flip-glyph per character of {Brand} -->
      </div>

      <!-- Phase 2: claim text — absolutely positioned at phase1-text's origin -->
      <div
        class="phase2-claim"
        style="position: absolute; left: 0; top: 50%;
           transform: translateY(-50%); opacity: 0; white-space: nowrap;
           display: flex; align-items: center; gap: 0.25em;
           font-family: {font}; color: {textColor};"
      >
        <span class="claim-lead">{claimLead}</span>
        <span class="claim-mid">{claimMid}</span>
        <!-- vertical-spring-ticker swaps {tickerWord1} ↔ {tickerWord2} -->
        <div class="claim-ticker"><!-- ticker structure here --></div>
      </div>
    </div>
  </div>
</div>
```

Placeholder tokens:

- `{Brand}` — brand wordmark revealed by the hacker-flip in Phase 1
- `{heroAsset}` — logo image / SVG that anchors every phase
- `{claimLead}` / `{claimMid}` — static segments of the Phase-2 claim (e.g. ranking + category)
- `{tickerWord1}` / `{tickerWord2}` — the two states the vertical-spring-ticker rolls between
- `{font}` — typography stack; brand text and claim share a single weight/family
- `{textColor}` / `{accentColor}` — primary copy color; accent reserved for the lead segment of the claim

## Phase 2: Text Swap (Core Glue)

Three concurrent tweens at the same timeline position: old text slides out, container shifts left, new text fades in. The "single spring" becomes **multiple GSAP tweens started at the same timeline position**, which is the GSAP idiom for parallel motion.

```js
// All three tweens at the same timeline position → fire in parallel.
tl.to(
  ".phase1-text",
  {
    x: SLIDE_DIST,
    opacity: 0,
    duration: SWAP_DUR * EXIT_RATIO,
    ease: "power3.out",
  },
  SWAP_TRIGGER,
);

tl.to(
  ".anchor-shift",
  {
    x: RECENTER_OFFSET,
    duration: SWAP_DUR,
    ease: "power3.out",
  },
  SWAP_TRIGGER,
);

tl.fromTo(
  ".phase2-claim",
  { opacity: 0 },
  { opacity: 1, duration: SWAP_DUR * FADE_RATIO, ease: "power2.out" },
  SWAP_TRIGGER + SWAP_DUR * FADE_DELAY_RATIO,
);
```

**`RECENTER_OFFSET` must be a pre-calculated constant.** Dynamic calculation (e.g. `phase2.offsetWidth - phase1.offsetWidth`) drifts sub-pixels between renders and causes a visible jitter when the camera scales the wrapping shift container. Measure once at design time, bake in.

## Phase 3: Logo Recenters

The text zone fades out completely. The logo translates from its left-offset position to true screen center and lifts slightly to make room for the counter and avatars about to enter. This is the moment the logo becomes the sole focal point.

```js
// Text fades out.
tl.to(
  ".anchor-text",
  {
    opacity: 0,
    duration: TEXT_FADE_DUR,
    ease: "power2.out",
  },
  RECENTER_TRIGGER,
);

// Logo glides to center + lifts up. Two tweens, same start, longer duration.
tl.to(
  ".anchor-logo",
  {
    x: CENTER_OFFSET,
    y: VERTICAL_ADJUST,
    duration: RECENTER_DUR,
    ease: "power2.out",
  },
  RECENTER_TRIGGER,
);
```

`VERTICAL_ADJUST` is small and upward — it lifts the logo so the avatar cloud (centered above the canvas midline) lands around the logo, not below it.

## Phase 4: Avatar Cloud

The logo is now at center. Counter appears above. Avatars build on the elliptical ring around the logo. Connection lines draw from logo to each avatar.

See [avatar-cloud-network](../rules/avatar-cloud-network.md) for the full pattern. The **logo (anchor) serves as the network center point** — its post-Phase-3 position must match the cloud's `CENTER_X / CENTER_Y` constants exactly. This is the single most-likely-to-drift coordinate in the whole blueprint; bake both numbers from the same source.

Counter sits above the cloud (a short numeric label like `{counterValue}{counterSuffix}`) with a brief scale pulse on entry.

## Phase 5: Brand Endorsement

Partner logos enter at the bottom with a staggered scale tween and a finite horizontal scroll.

```js
// Stagger entry — same pattern as avatar cloud.
tl.to(
  ".brand-logo",
  {
    scale: 1,
    opacity: LOGO_OPACITY,
    duration: LOGO_ENTRY_DUR,
    ease: `back.out(${BOUNCE_FACTOR})`,
    stagger: { each: LOGO_STAGGER, from: "start" },
  },
  LOGOS_TRIGGER,
);

// Finite horizontal scroll. NOT repeat: -1 — compute distance from remaining time.
tl.to(
  ".brand-logo-strip",
  {
    x: SCROLL_DIST,
    duration: SCROLL_DUR,
    ease: "none",
  },
  LOGOS_TRIGGER,
);
```

## Inter-Phase State Handoff

```
Phase 1 → Phase 2:
  Hacker-flip decode must settle before swap triggers.
  SWAP_TRIGGER ≥ last-character-decode-end + small buffer (~0.3s) so the
  flip's settle frames don't compete with the slide-out.

Phase 2 → Phase 3:
  RECENTER_OFFSET (Phase 2 shift) feeds CENTER_OFFSET in Phase 3.
  Both are pre-calculated constants, not derived at render time.
  RECENTER_TRIGGER ≥ SWAP_TRIGGER + SWAP_DUR + claim-dwell so the viewer
  reads the claim before the logo lifts away.

Phase 3 → Phase 4:
  Logo final position (CENTER_OFFSET applied to .anchor-logo) defines the
  cloud center. Bake those coordinates into the cloud constants:
    cloud CENTER_X = composition_width / 2  + (shift result)
    cloud CENTER_Y = composition_height / 2 + VERTICAL_ADJUST
  AVATARS_TRIGGER ≥ RECENTER_TRIGGER + RECENTER_DUR (recenter ease settles).

Phase 4 → Phase 5:
  Avatars + counter remain visible (no exit tween).
  Brand logos enter independently at bottom. No value dependency.
```

## How to Choose Values

### Layout constants

- **LOGO_SIZE** — pixel size of the anchor logo (square).
  - Range: 5-12% of viewport min-dimension; under 5% loses presence, over 12% crowds the text zone
  - Constraints: must remain readable after the Phase-3 recenter (no per-frame scale change)
  - Reference: examples/proof-logo-chain.html uses `192px` at 1920×1080
- **ANCHOR_GAP** — flex gap between logo and text zone.
  - Range: ~15-25% of `LOGO_SIZE`; pairs visually with logo's optical weight
  - Reference: examples/proof-logo-chain.html uses `35px`

### Phase 1 — decode

- **DECODE_END** — last-character flip settles.
  - Constraints: must equal `flipStart + (charCount − 1) × flipStagger + flipDuration` (see hacker-flip-3d How to Choose Values for the per-glyph timing)
  - Reference: examples/proof-logo-chain.html settles around `1.05s`

### Phase 2 — swap

- **SWAP_TRIGGER** — when the swap-out begins.
  - Constraints: `≥ DECODE_END + ~0.3s` so the flip settles before the slide
  - Reference: examples/proof-logo-chain.html uses `1.38s`
- **SWAP_DUR** — wrapper duration for the three concurrent tweens.
  - Range: 0.4-0.8s; under 0.4 reads as a hard cut, over 0.8 drags
  - Constraints: same value drives the exit + container shift + claim fade — never split into separate durations
  - Reference: examples/proof-logo-chain.html uses `0.55s`
- **SLIDE_DIST** — px the old `{Brand}` text slides right as it exits.
  - Range: 100-300 px; large enough to read as "leaving frame"
  - Reference: examples/proof-logo-chain.html uses `200px`
- **RECENTER_OFFSET** — pre-calculated x-shift on `.anchor-shift` (negative = left).
  - Range: derive once from `-(swapInTextWidth − swapOutTextWidth) / 2`; tune by eye, then bake as a constant
  - Constraints: **must be a constant** — see Critical Constraints
  - Reference: examples/proof-logo-chain.html uses `-W * 0.12` (≈ `-230.4px`) at 1920 wide
- **EXIT_RATIO** — fraction of `SWAP_DUR` over which the old text exits.
  - Range: 0.4-0.6; exit completes by mid-swap so the new text doesn't visibly stack on the old
  - Reference: examples/proof-logo-chain.html uses `0.5`
- **FADE_RATIO** — fraction of `SWAP_DUR` over which the claim fades in.
  - Range: 0.4-0.7
  - Reference: examples/proof-logo-chain.html uses `~0.49` (`claimFadeDur / swapDuration`)
- **FADE_DELAY_RATIO** — start delay for the claim fade as a fraction of `SWAP_DUR`.
  - Range: 0.15-0.3 so the claim begins arriving while the old text is still clearing
  - Reference: examples/proof-logo-chain.html uses `~0.49` (claim fade starts at `swapTrigger + 0.27s`)

### Phase 3 — recenter

- **RECENTER_TRIGGER** — when the logo glides to center.
  - Constraints: `≥ SWAP_TRIGGER + SWAP_DUR + claim-dwell`; allow at least ~1s for the viewer to read the claim
  - Reference: examples/proof-logo-chain.html uses `3.87s`
- **RECENTER_DUR** — duration of the logo's glide.
  - Range: 0.7-1.2s; matches the cinematic feel of a coordinate-target shift
  - Reference: examples/proof-logo-chain.html uses `0.9s`
- **TEXT_FADE_DUR** — duration of the `.anchor-text` opacity tween.
  - Range: 0.2-0.5s; shorter than `RECENTER_DUR` so the text is gone before the logo arrives
  - Reference: examples/proof-logo-chain.html uses `0.3s`
- **CENTER_OFFSET** — px to the right; undoes `RECENTER_OFFSET` and overshoots toward the cloud center.
  - Constraints: derived once from the layout: `compositionWidth / 2 + (-RECENTER_OFFSET) + logoHalfWidth`; bake as a constant
  - Reference: examples/proof-logo-chain.html uses `800px`
- **VERTICAL_ADJUST** — upward lift so the logo sits at the cloud center, not the canvas center.
  - Range: typically `-(compositionHeight × 0.03)` to `-(compositionHeight × 0.08)`
  - Constraints: must equal the cloud-network's `CLOUD_CENTER_Y − compositionHeight/2` exactly
  - Reference: examples/proof-logo-chain.html uses the equivalent of `H * 0.47 − H/2` (≈ `-32.4px`)

### Phase 5 — brand strip

- **LOGOS_TRIGGER** — when the partner logos enter.
  - Constraints: `< compositionDuration − SCROLL_DUR`; ensure the scroll finishes within the comp
  - Reference: examples/proof-logo-chain.html uses `6.5s` in an 8s comp
- **SCROLL_DUR** — duration of the horizontal scroll.
  - Range: fill the remaining composition window minus a small tail buffer (~0.1s)
  - Reference: examples/proof-logo-chain.html uses `1.4s`
- **LOGO_ENTRY_DUR** — per-logo scale-up duration.
  - Range: 0.4-0.7s
  - Reference: examples/proof-logo-chain.html uses `0.5s`
- **LOGO_STAGGER** — delay between consecutive logo entries.
  - Range: 0.06-0.15s
  - Reference: examples/proof-logo-chain.html uses `0.1s`
- **LOGO_OPACITY** — final opacity of each partner logo (subdued so the cloud still owns the frame).
  - Range: 0.5-0.85
  - Reference: examples/proof-logo-chain.html uses `0.7`
- **BOUNCE_FACTOR** — `back.out(BOUNCE_FACTOR)` coefficient for the logo entry pop.
  - Range: 1.2 (subtle) → 1.7 (firm) → 2.4 (cartoony)
  - Reference: examples/proof-logo-chain.html uses `1.4`
- **SCROLL_DIST** — px the strip travels (negative = leftward).
  - Range: derive from `−(speedPxPerSec × SCROLL_DUR)`; speeds around 90-150 px/s read as a gentle "the list continues" hint
  - Reference: examples/proof-logo-chain.html uses `-135px`

### Color and typography tokens

- **{font}** — base font stack for brand wordmark, claim, and counter; sized so brand text and claim are the same optical weight
- **{textColor}** — primary copy color (the bulk of the claim)
- **{accentColor}** — reserved for the lead segment of the claim (e.g. ranking number) and the counter; pops against the dark stage
- **{bgColor}** — stage background (typically a dark gradient — the viewer's eye must land on the logo)

## Critical Constraints

- **Logo z-index highest**: `z-index: 100`. Logo must always sit above connection lines (z:1), avatars (z:10), and text (no z).
- **Pre-calculated offsets**: `RECENTER_OFFSET`, `CENTER_OFFSET`, `VERTICAL_ADJUST` are constants. **Never** derive from `getBoundingClientRect()` at tween time — sub-pixel drift compounds across the camera scale and produces visible jitter.
- **Camera wrap**: All phases share a single `data-composition-id` root so the optional camera drift/scale tween wraps everything coherently. Don't split phases across sub-compositions unless you also share the camera transform.
- **Avatar cloud center = logo position**: After Phase 3, the cloud center coordinates must match the logo's final position exactly. The number is computed once and used in both places.
- **Text swap is position-fixed**: `.phase2-claim` renders at `.phase1-text`'s origin (absolute within the flex row), not at a new location. This is what makes the swap read as "in place."
- **GSAP transform aliases only**: `x`, `y`, `scale`, `rotation`. Never tween `left`, `top`, `width`, `height` — they trigger layout reflows and are forbidden by the HyperFrames animated-property allowlist.
- **Single paused timeline**: One `gsap.timeline({ paused: true })`, registered to `window.__timelines[data-composition-id]`. HyperFrames seeks it.
- **No infinite repeats**: Brand logo scroll uses a finite `duration`. If you want continuous-looking scroll, oversize the strip and tween it the visible distance.
- **`data-duration` on the root** governs total render time. The GSAP timeline's intrinsic length is irrelevant to the renderer.

## Golden Sample

- [proof-logo-chain.html](../examples/proof-logo-chain.html) — runnable composition realizing every named constant in this blueprint with concrete values. Single paused GSAP timeline drives all five phases.
