```preset-meta
{
  "name": "playful",
  "label": "Playful",
  "fingerprint": {
    "depth": "double-stroke-offset-border",
    "shape": "asymmetric-organic-blob",
    "motion": "back-overshoot-hand-placed",
    "decoration": "scribbled-svg-doodles",
    "rotation": "micro-tilt-alternating",
    "palette-character": "warm-paper-ink"
  },
  "match_signals": [
    { "kind": "thick_solid_border", "weight": 0.3 },
    { "kind": "bouncy_easing", "weight": 0.2 },
    { "kind": "minimal_decoration", "weight": 0.1 }
  ]
}
```

## §A Director's intent

Hand-crafted studio editorial on warm paper. Syne display (700-800 weight, negative tracking -0.01 to -0.03em) carries every headline, statement, and numeral; Space Grotesk runs body and labels. The voice is independent studio, not corporate — confident but warm, structured but loose.

Depth is **double-stroke offset borders** — a 3px charcoal outline plus a 6-8px offset ghost border via `::before`. No `box-shadow` blur, no `drop-shadow`. Cards, blocks, and statistics carry small ±0.5deg to ±3deg rotations that alternate across neighbors so nothing reads as snapped to a grid.

**Warm-paper-on-ink contract via hue-anchor tokens (§8.2 exception).** Playful's character is "ink on warm paper" — collapses to mud if brand DNA is cool-toned (blue/green/violet). Three hex anchors (`--anchor-peach`, `--anchor-peach-alt`, `--anchor-cream`) are declared in §B so warm surfaces mix brand-primary at low % with the anchor, preserving the studio register across any brand palette. Brand DNA still flows through for hero text, chip fills, focal accents — the anchors only stabilize the canvas, surface, and image-placeholder slots.

Decoration vocabulary: **asymmetric organic blobs** (border-radius like `40% 60% 70% 30% / 40% 50% 60% 50%`), **pebble shapes** (alternating long/short radii), **inline 2px-stroke SVG scribbles** (squiggle, star, circle, arrow) with rounded line-caps, **doodle circles and rectangles** anchored to slide corners. Every scene gets at least one scribble mark in a corner — punctuation, not content.

Motion is **back-overshoot** — `back.out(1.4)` on entry, `back.out(1.7)` on emphasis. Hand-placed, not gliding. Ambient layers (ghost-blob drift, scribble pen-on drift) use `sine.inOut`. Scene transitions cross-fade gently (0.6s opacity) — never blur, never slide.

**Best for** indie product launches, creator portfolios, lifestyle / community brands, friendly research or tech that wants human warmth. **Avoid for** contexts where institutional credibility outweighs warmth — the warm-paper register is intentionally informal.

**Density philosophy: medium-low.** One dominant element per scene plus one or two scribbles. Crowding the canvas with simultaneous cards, doodles, and copy collapses the hand-touched feeling into clutter.

**Class prefix: `pf-`** (initialism of "playful", 3 chars). Every component CSS class uses this prefix.

## §B Decoration tokens (merge into design.html `:root`)

Playful declares **structural** tokens here (border weights, offset distances, rotation budget, anchor palette). Brand DNA drives hero text, chip fills, focal accents through `--brand-*` vars. The hue-anchor hex set is the **§8.2 exception**: warm-paper character collapses without anchored peach tones when brand DNA is cool-toned.

```css
/* §8.2 exception: warm-paper palette anchors. Declared once so every canvas-
   adjacent surface mixes consistently against brand DNA. Without these anchors,
   cool-toned brands (blue/green/violet) would produce muddy paper surfaces —
   breaking the studio character. Pattern matches storybook precedent in §8.2. */
--anchor-peach: #f0c8a0; /* base warm canvas */
--anchor-peach-alt: #e8b88e; /* slightly darker, image-placeholder surface */
--anchor-cream: #f7dec6; /* slightly lighter, gentle layering */

/* Warm surfaces — brand-primary mixes low into the anchor so brand DNA influences
   temperature without overwriting the paper register. */
--surface-paper: color-mix(in srgb, var(--brand-primary) 18%, var(--anchor-peach));
--surface-paper-alt: color-mix(in srgb, var(--brand-primary) 22%, var(--anchor-peach-alt));
--surface-cream: color-mix(in srgb, var(--brand-primary) 12%, var(--anchor-cream));

/* Border weights — the signature is 3px solid, doubled via offset ghost border */
--border-stroke: 3px solid var(--ink);
--border-stroke-thin: 2px solid var(--ink);
--offset-ghost: 6px; /* distance the ::before ghost border offsets down-right */
--offset-ghost-lg: 8px; /* larger offset for hero / contact-block cards */

/* Rotation budget — adjacent elements alternate sign, never exceed ±3deg */
--tilt-xs: 0.5deg;
--tilt-sm: 1deg;
--tilt-md: 2deg;
--tilt-lg: 3deg;

/* Spacing — slide / card padding scale, in rem */
--pad-card: 1.5rem;
--pad-card-lg: 2rem 3rem;
--gap-sm: 1.5rem;
--gap-md: 2rem;
--gap-lg: 3rem;

/* Decoration — asymmetric organic radii reused across blobs and frames */
--radius-blob-organic: 40% 60% 70% 30% / 40% 50% 60% 50%;
--radius-blob-fill: 60% 40% 30% 70% / 60% 30% 70% 40%;
--radius-blob-pebble: 255px 15px 225px 15px / 15px 225px 15px 255px;
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Playful forces Syne display + Space Grotesk body regardless of site DNA — the studio register depends on Syne's quirky humanist proportions and negative tracking. Fallbacks below trigger only if the primary face fails to load.

- **display**: `'Syne'` · `'Fraunces'` · `'Recoleta'` wght 800
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'Space Mono'` · `'JetBrains Mono'` wght 500

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(1.4)", // hand-placed arrival with mild overshoot — studio register
  emphasis: "back.out(1.7)", // pronounced overshoot on focal beats (stat reveal, hero pop)
  exit: "power2.in", // gentle accelerate-off, no overshoot
  drift: "sine.inOut", // ghost-blob drift, scribble pen-on, ambient sway
};
const DUR = {
  snap: 0.18,
  med: 0.5,
  slow: 0.9,
};
// RULE: alternate rotation sign across adjacent elements. If card A enters with
//       rotation +0.8deg, the next card enters with -0.5deg (or +0.3deg).
//       Same-sign neighbors read as a tilted canvas, not as hand-placement.
// RULE: never tween beyond ±3deg. The hand-placed feeling tips into wonky past
//       3 degrees. Rest pose should sit within ±0.5 to ±3deg.
// RULE: never use blur / drop-shadow / backdrop-filter on entry. Depth comes
//       from offset ghost borders + rotation. Blurs break the hand-drawn aesthetic.
// RULE: scribble SVG pen-on uses strokeDashoffset tween with EASE.drift
//       over DUR.slow — never EASE.entry (back.out makes pen lines feel mechanical).
```

### §E.5 Motion choreography

**Allowed primitives**

- Back-overshoot snap-in on cards, blocks, stats, and step nodes (back.out 1.4 entry, back.out 1.7 emphasis). Short overshoot, hand-placed final pose.
- Cross-fade scene transitions (0.6s opacity) — soft, never blur, never slide.
- Scribble pen-on: stroke-dashoffset 1 → 0 over DUR.slow with EASE.drift. Use on hero-tier scenes only; secondary scribbles snap visible with the card they accompany.
- Ghost-blob drift: 12-20s sine.inOut on translate + rotate (max ±1deg over the loop, max ±20px translate).
- Rotation rest pose: every card/block/stat enters with a fixed micro-tilt (±0.5deg to ±3deg), randomized per-instance but alternating sign across neighbors.

**Forbidden**

- box-shadow blur on entry or rest (system has no blurred shadows).
- drop-shadow / filter: drop-shadow() at any time.
- Rotation beyond ±3deg on content; vertical-spine label is the only exception (it's anchored at 90deg).
- Slide / dissolve / blur scene transitions. Stick to cross-fade.
- Italic tweens on text emphasis. Switch face or weight instead.
- Uniform same-sign rotation across more than two consecutive elements (reads as tilted canvas).
- Smooth `ease-in-out` on numerics — use EASE.emphasis (back.out 1.7) for stat reveals so the numeral pops with overshoot.

**Stagger budget**

180-260ms between elements (deliberate, studio-paced). Slower than 8-bit-orbit's 80-120ms, faster than editorial's 200-280ms. Total scene-in stagger ≤ 700ms.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Keep imperative verbs and proper nouns; drop filler ("really", "very", "just"), drop articles when the line can read as a fragment.
2. Hero headlines: 4-8 words, sentence case (NOT uppercase — uppercase belongs to eyebrow labels only). Syne 800 with negative tracking carries the voice.
3. Eyebrow labels / chips: UPPERCASE with 0.15em tracking (Space Grotesk 600 treatment). Short — 1-3 words.
4. Body copy: sentence case, conversational. Pretend you're writing in a studio sketchbook to a friend, not pitching a board.
5. Stats: bare numeral (Syne 800) + a one-sentence supporting label in sentence case. Never UPPERCASE the label.
6. CTAs: 2-3 word sentence-case verb phrase ("Let us talk", "Start the work", "Say hello"). Charcoal text on outlined card, peach text on filled card.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`Teams design together, in real time.` / chip=`REAL-TIME COLLAB` / cta=`Start the work`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default scene: `--surface-paper` (brand-tinted peach) full-bleed background. Most scenes sit here.
- Variant scene: `filled-block` inverted (charcoal ground + peach text on top) for emphasis — reserve for ONE scene per video, the anchor moment.
- Variant scene: `--surface-cream` (slightly lighter) for gentle layering when a region needs to lift one tonal step without introducing white.
- Never introduce white as a surface. The warm canvas is foundational.
- Alternate paper → paper-alt → cream across scenes if all scenes are outlined; insert the single filled-block scene as the anchor beat.

**Hero text**

- One Syne 800 hero moment per scene. Negative letter-spacing (-0.02em to -0.03em). Always `var(--ink)` color on warm surfaces, `var(--canvas)` on filled-block scenes.
- Hero takes ≥ 50% canvas width. Never two hero-tier elements per scene.
- Headlines NEVER tinted with brand color — they stay ink. Brand color appears in accent moments (scribbles tinted to brand-primary if narrative beat justifies, stat numerals can flex to brand-primary on the focal stat).

**Brand color placement (role contract)**

- Default: ink-on-paper. Brand colors do NOT replace ink for body / headline / border / scribble. The system is anchored monochrome.
- Brand-primary may appear as: focal stat numeral fill (one per scene max), scribble stroke (one per scene max as accent), chip text on a filled chip, or as the tint that warms `--surface-paper` via the §B mixes.
- Brand-secondary / brand-accent appear only via the §B surface mixes — they tint the paper, never appear as standalone fills.
- One scene = ink-dominant, brand-primary as accent. Two brand colors in the foreground at once breaks the monochrome discipline.

**Rotation discipline**

- Every card / block / stat / step-node carries a rotation in ±0.5deg to ±3deg.
- Adjacent elements alternate sign. Sequence: -0.5, +0.8, -0.3, +0.5, -0.7 (never +0.5, +0.3, +0.8 in a row).
- The vertical-spine label is the only exception — it's anchored at exactly 90deg.
- Charts, timelines, and grid containers themselves do NOT rotate; only their cells / nodes / bars.

**Decoration vocabulary (every scene picks 1-2, never 4+)**

- Scribble SVG mark in a corner (squiggle, star, circle, arrow). 2px stroke, rounded line-caps, ink color.
- Doodle circle or rect anchored in a corner (3px outlined, rotated).
- Blob-frame with solid blob-fill inside (portrait stand-in for hero / contact scenes).
- Ghost-blob (0.08 opacity oversized organic) as atmospheric wallpaper when negative space feels heavy. Max one per scene, in a corner the content does not occupy.
- Vertical-spine label on the right edge — magazine spine register, reserve for hero / chapter scenes.

**Border + shape discipline**

- Border radius is sharp 0px (cards / blocks / tags), 50% (avatars / step-nodes / doodle-circles), or asymmetric organic (blobs only). Never 4px / 8px / 12px — middle radii read as generic web app.
- Border weight is 3px on outlined cards and blob frames; 2px on offset ghost borders, nav chrome, and timeline tracks; 2px stroke on SVG scribbles. No 1px hairlines.

**Transitions between scenes**

- Cross-fade 0.6s opacity. Never slide, blur, dissolve, or hard-cut.
- A single scribble pen-on at the start of the scene can serve as the "we arrived" beat.

**Ambient motion**

- Ghost-blob slow drift (12-20s sine.inOut) on heavy-negative-space scenes.
- Scribble pen-on (strokeDashoffset over DUR.slow with sine.inOut) on hero scenes.
- Cards / blocks / stats DO NOT drift after entry — they snap to their rotated rest pose and stay.

**Sound design (passed to audio phase)**

- Soft mark / pencil-stroke sample on scribble pen-on.
- Paper-rustle on card entry; gentle thud on filled-block entry.
- Cross-fade between scenes — no percussive cut.

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as playful)

```css
body {
  background: var(--anchor-peach);
  color: var(--ink);
  font-family: "Space Grotesk", sans-serif;
}
.title-card {
  background: var(--anchor-peach);
  border-bottom: 3px solid var(--ink);
  padding: 88px 0 72px;
}
.title-display {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.brand-name {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  color: var(--ink);
}
.style-name {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.ds-section {
  border-top: 3px solid var(--ink);
  padding: 72px 0;
}
h2 {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.eyebrow {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.7;
}
.type-card,
.voice-pair,
.comp-card {
  border: 3px solid var(--ink) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: var(--anchor-peach) !important;
  position: relative;
}
/* dna-swatch keeps inline brand color; only border + ghost stay */
.dna-swatch {
  border: 3px solid var(--ink) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  position: relative;
}
.dna-swatch::before,
.type-card::before,
.voice-pair::before,
.comp-card::before {
  /* Double-stroke offset ghost border — the system's signature elevation. */
  content: "";
  position: absolute;
  top: 6px;
  left: 6px;
  right: -6px;
  bottom: -6px;
  border: 2px solid var(--ink);
  z-index: -1;
  pointer-events: none;
}
.comp-head {
  background: var(--ink) !important;
  color: var(--anchor-peach) !important;
  border-bottom: 3px solid var(--ink) !important;
  font-family: "Syne", sans-serif;
  font-weight: 700;
}
.ds-code {
  background: var(--anchor-cream) !important;
  border: 3px solid var(--ink);
  border-radius: 0 !important;
  color: var(--ink) !important;
  font-family: "Space Mono", monospace;
}
```
