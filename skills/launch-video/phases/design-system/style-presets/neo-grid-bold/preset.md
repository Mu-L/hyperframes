```preset-meta
{
  "name": "neo-grid-bold",
  "label": "Neo-Grid Bold",
  "fingerprint": {
    "structure": "12x8-css-grid",
    "border": "1.5px-hairline-ink",
    "shadow": "none",
    "accent": "single-electric-signal",
    "type": "uppercase-display-mixed-body-mono-label",
    "motion": "panel-slam-mono-tick"
  },
  "match_signals": [
    { "kind": "hairline_border", "weight": 0.3 },
    { "kind": "condensed_display", "weight": 0.2 },
    { "kind": "high_sat_accent", "weight": 0.25 },
    { "kind": "minimal_decoration", "weight": 0.15 }
  ]
}
```

## §A Director's intent

Editorial poster on a strict 12-column × 8-row grid, inset 40px, with 12-18px gutters revealing a putty frame around every composition. Three working colors only — paper (canvas), ink (structure), and one electric signal (the brand accent stands in for the template's neon yellow). Depth is panel adjacency, never shadow. Every display moment is uppercase Space-Grotesk-class with negative letter-spacing scaled to size; body is mixed-case at weight 400; every label is mono uppercase with 0.08-0.12em tracking. Motion is brief and structural — panels slam in on a beat, mono labels tick on after, the grid never breaks. The class-prefix `ng-` is used on every component CSS so design.html previews compose cleanly.

Best for: design-led pitches, brand decks, founder talks, stat-heavy slides, comparison matrices. Avoid for: warm, traditional, or quiet brand voices — the accent and the uppercase commit to an editorial-graphic register.

## §B Decoration tokens

```css
/* Structural ink hairlines — the only border weights this system uses. */
--border-hairline: 1.5px solid var(--ink);
--border-axis: 2px solid var(--ink);
--border-dash-internal: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);

/* Grid system — every scene wraps a 12x8 CSS grid inset from the frame. */
--grid-inset: 40px;
--grid-gap: 12px;
--grid-gap-lg: 18px;
--grid-cols: repeat(12, 1fr);
--grid-rows: repeat(8, 1fr);

/* Panel padding scale (compact / standard / large / hero). */
--pad-compact: 24px 28px;
--pad-standard: 28px 32px;
--pad-large: 36px 32px;
--pad-hero: 40px 44px;

/* The signal accent — brand-primary stands in for the template's neon. */
--signal-fill: var(--brand-primary);
--signal-ink: var(--ink);

/* Highlight swatch padding (yellow <mark> behind one or more headline words). */
--mark-pad: 0 6px;
--mark-pad-lg: 0 8px;

/* Mono tracking presets — labels MUST land in this range. */
--track-mono: 0.08em;
--track-mono-tight: 0.04em;
--track-mono-wide: 0.12em;

/* Display tracking presets — uppercase, negative, scales with size. */
--track-display-tight: -0.005em;
--track-display: -0.015em;
--track-display-loose: -0.02em;
--track-display-mega: -0.05em;

/* Block stamp + corner mark — 2x2 grid, diagonal squares filled. */
--blockmark-gap: 4px;
--blockmark-size: 56px;
--corner-mark-size: 36px;

/* All radii forced to 0 — strict rectangles. */
--radius: 0;

/* No shadows — declared as none so component CSS can reference a single var. */
--shadow-panel: none;
```

## §D Font pairing fallback

- **display**: `'Space Grotesk'` · `'Archivo'` · `'Inter'` wght 700
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'Space Mono'` · `'IBM Plex Mono'` wght 400

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Neo-Grid Bold motion: structural, brief, never bouncy.
// Panels slam into grid cells; labels tick on after; ambient drift is sine on
// the mono digits only.
const EASE = {
  entry: "power2.out", // panels arriving into grid cells
  emphasis: "expo.out", // mark swatch sweep, big stat reveal
  exit: "power2.in", // panels leaving (rare — usually a hard cut)
  drift: "sine.inOut", // ambient mono-counter tick, page-number pulse
};

const DUR = {
  snap: 0.14, // mono label tick-on, pagenum swap
  med: 0.45, // panel slam-in
  slow: 0.9, // section divider reveal, large stat count-up
};

// RULE: NEVER add back/elastic — this system has no overshoot. Use power/expo.
// RULE: Panels arrive with x-or-y translate ≤ 24px + opacity, never scale.
// RULE: The <mark> yellow swatch reveals by scaleX from 0 to 1 with transform-origin: left, EASE.emphasis, DUR.med — width sweeps, not fades.
// RULE: Mono labels tick on AFTER the panel they sit in (stagger 0.06-0.10s).
// RULE: stat-counter numerals count up with a number tween, not by replacing text — keep deterministic at frame rate.
// RULE: page-number swap (paper/ink/lemon variant change) is a hard 1-frame cut, never a fade.
```

### §E.5 Motion choreography

- **Allowed primitives**: opacity + translate (≤24px) for panel entries; scaleX(0→1) with left transform-origin for the `<mark>` highlighter swatch; numeric tween for stat counters; mono-character stagger for mono labels (0.06-0.10s per char).
- **Forbidden gestures**: no rotation, no skew, no scale on panels (they are grid-sized rectangles — scaling them mis-aligns the grid), no crossfades between scenes (use a hard cut), no parallax, no spring/elastic.
- **Transition defaults**: scene-to-scene is a hard cut on the panel that carries the loudest signal (the yellow / brand-primary panel). Within a scene, panels enter in z-order by visual weight: ink panels first, paper panels second, signal panel last.
- **Type-in-motion**: display headlines arrive as a single block (no per-word stagger); only the `<mark>`-wrapped words sweep in via scaleX after the headline lands.

## §G Voice transform recipe

1. Drop articles and connectives (`the`, `a`, `of`, `and`, `with`, `to`) on display headlines only — body copy keeps its native voice.
2. Compress display copy into 1-3 line stacks of UPPERCASE Space-Grotesk-class words; each line breaks at a natural beat.
3. Promote one key word or phrase per headline to be the `<mark>` highlight — wrap it inline so the reveal sweeps the yellow swatch across it. Choose the loudest, most product-truthful noun, never an adjective.
4. Mono labels: ALL CAPS, 0.08-0.12em tracking, format `01 / 12` for counters, `Section · Vision` for section tags, `Q1 2026` for time tags. Always start with a digit when there is one.
5. Body copy stays mixed case at weight 400. Never UPPERCASE body — it reads as shouting and breaks the editorial register.

**Example:**

- IN: `The platform helps teams make data-driven financial decisions in real time across markets.`
- OUT: `BUILD<br/>THE ENGINE OF<br/><mark>MODERN&nbsp;MONEY.</mark>` (display) + `The platform helps teams decide in real time across every market it touches.` (body)

## §H Scene composition hints

- **Universal frame**: every scene composes inside a 12-column × 8-row CSS grid inset 40px from the canvas edge, gap `var(--grid-gap)` (12px) or `var(--grid-gap-lg)` (18px) for breathing room. The 40px putty surround is the system's identity — never let a panel bleed through it.
- **Surface alternation**: per scene, fill the grid corner-to-corner with 4-8 panels. Default panel is paper; alternate one or two ink panels for contrast weight; add exactly **one** signal panel (brand-primary fill) to draw the eye. Three signal panels reads as aggressive editorial; one reads as confident.
- **Focal sizing**: stat numerals scale to 156-240px, section ordinals to 320px. Type is allowed to dominate an entire panel. Display headlines run 88-132px, card headlines 30-44px.
- **Brand-color role contract**:
  - `var(--brand-primary)` — the signal fill (template's neon yellow). One panel per scene. Also: `<mark>` background, affirmative pill fill, second chart series.
  - `var(--brand-secondary)` — reserved for the signal panel's ink stroke when added to a chart bar (1.5px ink border). Use sparingly.
  - `var(--brand-accent)` — alternate signal hue for charts/data series only when a second accent is unavoidable (rare — prefer to stay on one accent).
  - `var(--ink)` — every text on paper/signal surfaces; inverted panel fill; every divider, table cell, pill outline.
  - `var(--canvas)` — the putty surround behind the 40px inset.
- **Transition vocabulary**: hard cuts only between scenes. Within a scene, panels enter on a brief beat (ink first, paper next, signal last). Mono labels tick on AFTER their parent panel arrives.
- **Decoration budget**: max one block-stamp + one corner-mark per scene. Never both in the same panel.
- **Page-number tag**: anchor `pagenum` component bottom-left of every scene. Pick the variant (paper / ink / signal) that contrasts with the lower-left panel.
- **Do**: fill the grid corner-to-corner; allow stat numerals to dominate; wrap one headline word in `<mark>` for the yellow sweep; use mono uppercase tracking ≥0.08em for every label.
- **Don't**: add shadows, round any corner, put display in mixed case, put body in UPPERCASE, introduce a second accent color, leave more than two cells empty in a row, use italic letterforms (the `<em>` tag is repurposed as a color switch — stays upright).

## §I Page-level CSS

```css
/* Make design.html itself read as Neo-Grid Bold — putty surround, strict
   rectangles, paper sections, hairline ink dividers, mono labels. */
body {
  background: var(--canvas, #ecece8);
}
.ds-section {
  border-top: 1.5px solid var(--ink, #0a0a0a) !important;
  background: var(--canvas, #ecece8);
}
.ds-section:first-of-type {
  border-top: none !important;
}
.eyebrow {
  letter-spacing: 0.12em !important;
  font-weight: 400;
  text-transform: uppercase;
}
h1,
h2,
h3 {
  text-transform: uppercase;
  letter-spacing: -0.015em !important;
  font-weight: 700 !important;
}
.ds-prose code,
code {
  border-radius: 0 !important;
}
.ds-code {
  border-radius: 0 !important;
}
```
