```preset-meta
{
  "name": "creative-mode",
  "label": "Creative Mode",
  "fingerprint": {
    "canvas": "warm-cream-paper",
    "borders": "thick-ink-square",
    "shadow": "hard-offset-color-then-ink",
    "type": "archivo-black-uppercase-tight",
    "voice": "editorial-zine"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.32 },
    { "kind": "thick_solid_border", "weight": 0.28 },
    { "kind": "condensed_display", "weight": 0.20 },
    { "kind": "high_sat_accent", "weight": 0.15 }
  ]
}
```

## §A Director's intent

Creative Mode is a **neo-brutalist editorial poster system** on a warm cream canvas. Edges are square, borders are heavy 4px ink, depth comes from hard offset color shadows (no blur, ever), and the type is Archivo Black uppercase pushed to extreme sizes with tight 0.92 line-height. Three accents collide per scene — never blended, never gradiented — sitting on flat color-blocks that screen-print across each other. Voice is part Bauhaus grid, part punk zine, part Swiss editorial: short imperative fragments in caps, mono labels carrying the "technical artifact" register.

**Best for:** creative-agency / design-studio sites, brand-led launches, editorial-confident product stories. **Avoid for:** institutional restraint or quiet authority — the multi-accent palette reads expressive, not formal.

**Brand-aware color contract.** The four template accents (forest green, hot pink, burnt orange, sunshine yellow) are mapped to brand DNA: `--brand-primary` (hero accent / closing canvas), `--brand-secondary` (offset-shadow color on featured blocks), `--brand-accent` (third hit / stat block), `--ink` (borders + text), `--canvas` (cream base). No literal hex appears in component CSS — the cream/ink defaults come from site DNA when present. **Class prefix is `cm-`** (creative-mode initialism, 3 chars).

## §B Decoration tokens

```css
/* Borders — 4px structural, 3px internal sub-rules, 2px chip */
--border-structural: 4px solid var(--ink);
--border-internal: 3px solid var(--ink);
--border-chip: 2px solid var(--ink);
--border-dashed-rule: 3px dashed var(--ink);

/* Hard offset shadows — color first, ink halo second. Never blur. */
--shadow-hard-lg: 24px 24px 0 var(--brand-secondary), 24px 24px 0 4px var(--ink);
--shadow-hard-md: 18px 18px 0 var(--ink);
--shadow-hard-sm: 8px 8px 0 var(--ink);

/* Spacing — scene-scaled */
--gap-grid: 1.45vw; /* ~28px @ 1920w */
--gap-cell-pad: 1.65vw; /* ~32px @ 1920w */
--gap-content: 5vw; /* 96px content gutter */
--gap-chrome: 3.33vw; /* 64px chrome gutter */

/* Rotation — deliberate imperfection signals */
--tilt-badge: -4deg;
--tilt-stamp: -6deg;

/* Type rhythm */
--display-track: -0.01em;
--mono-track-tight: 0.06em;
--mono-track-mid: 0.1em;
--mono-track-loose: 0.14em;
--display-leading: 0.92;

/* Surfaces — cream-2 is one step darker cream for recessed tables.
   color-mix keeps it brand-portable. */
--surface-recess: color-mix(in srgb, var(--canvas) 88%, var(--ink) 6%);
```

## §D Font pairing fallback

- **display**: `'Archivo Black'` · `'Anton'` · `'Space Grotesk'` wght 800
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'Space Mono'` · `'IBM Plex Mono'` wght 500

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Creative Mode motion: editorial poster register.
// Source deck is keyboard-cut between static slides — no native @keyframes.
// We translate "slam down a printed page" feel: snap entries, hold, no float.
// RULE: never ease-in-out on primary motion — feels SaaS, breaks the zine voice.
// RULE: rotated elements (badge -4deg, stamp -6deg) animate from 0 → final tilt;
//       do NOT tween the angle past the final value (no overshoot rotation).
// RULE: hard-offset shadows must arrive AFTER the surface, not with it — fake the
//       screen-print registration error by lagging --shadow-* paint by DUR.snap.
// RULE: type-in-motion is per-line (not per-char) — Archivo Black uppercase reads
//       as a poster slab; splitting glyphs breaks the editorial integrity.
const EASE = {
  entry: "expo.out", // slam-down poster placement
  emphasis: "power3.out", // numeral counts, badge snap
  exit: "power2.in", // brisk departure, no lingering
  drift: "sine.inOut", // ambient only — never on primary type
  print: "back.out(1.4)", // optional registration-offset arrival
};
const DUR = {
  snap: 0.18, // chip / badge / corner appearance
  med: 0.45, // surface block placement, type slab arrival
  slow: 0.9, // hero headline + stamp full reveal
};
```

### §E.5 Motion choreography

**Allowed primitives.**

- **Slab-in:** opacity 0→1 + y +32px → 0 on full color-blocks (cells, panels, step cards) using `EASE.entry` + `DUR.med`. Stagger siblings by 0.06s.
- **Hard-shadow lag:** the colored shadow layer (`box-shadow` first stop) animates `opacity 0→1` 0.12s AFTER its surface lands. Fakes screen-print registration.
- **Number tick:** numerals (stat-counter, step-num, bar values) GSAP-animate via `{ textContent }` plugin, `DUR.med`, `EASE.emphasis`. Never tween font-size or letter-spacing.
- **Rotate-into-place:** badges and stamps animate `rotate: 0deg → var(--tilt-badge)`, `scale: 0.92 → 1`, `EASE.entry`, `DUR.med`. Single landing — no wobble.
- **Dashed rule reveal:** clip-path inset from right to 0 (`DUR.slow`, `EASE.entry`).

**Forbidden gestures.**

- No blur transitions, no glow, no soft fade between scenes.
- No parallax — the canvas is a flat page, not a 3D stage.
- No per-character splits on Archivo Black headlines (lines yes, glyphs no).
- No tween-back on rotated elements (overshoot betrays the "stamped" intent).

**Transition defaults between scenes.** Hard cut on a single ink frame (3-4 frames black with a cream wipe). `EASE.entry` for the incoming surface block. Never crossfade.

**Sound-design hooks.** Slab placements should land on percussive beats (paper slap, rubber stamp, marker squeak). Match the literal `EASE.entry` impact frame.

## §G Voice transform recipe

1. Strip articles + connectives (`the` / `a` / `of` / `and` / `to` / `with`).
2. Reduce to imperative fragments or single dominant nouns; favor verb-noun pairs.
3. UPPERCASE every on-screen string (display + label + chip).
4. Join with `.` line-break or em-dash `—` for emphasis between fragments.
5. End decisive — period or single-word punchline. No question marks, no ellipsis.
6. Mono labels (kicker, chip, axis ticks) carry chapter / index / unit copy in the form `SECTION 01`, `FIG. 01`, `VOL. 01 / EDITION 2026`.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time.`
- OUT: `TEAMS. DESIGN. TOGETHER. — REAL-TIME. FIGMA.`

## §H Scene composition hints

**Canvas + frame.**

- Canvas is always `var(--canvas)` (cream). The closing scene is the single exception — full-bleed `var(--brand-primary)` (green role).
- Content lives inside 96px (≈5vw) left/right gutter; chrome rails (top label / bottom meta) sit at 64px (3.33vw).
- The topbar pill is the **only** rounded element per scene. Everything else is square.

**Focal sizing.**

- Hero scenes: display headline 140-220px (`8.3vw - 11.5vw`), line-height 0.92, max 3 lines.
- Section scenes: display 84-100px (`4.4vw - 5.2vw`), paired with a mono kicker (24px) above.
- Stat scenes: numerals 96px, max 4 cells in a 2×2 grid.
- Step / process scenes: 4 cards in a row, step numeral 140px dominates the card.

**Brand color role contract.**

- `--brand-primary` (green role): closing canvas fill; one major stat cell or process step; iso-stack panel base.
- `--brand-secondary` (pink role): featured marker block, stamp surface, stat cell #2.
- `--brand-accent` (orange role): hard-shadow color on featured blocks; bar-chart hot series; table column accent.
- Yellow (`color-mix` tint of `--brand-accent` if no 4th brand color) → decorative circle, rotated badge, step card #3.
- Use 2-3 accents per scene. Never all four simultaneously. Save the `--brand-primary` full-bleed for the deck's closing beat.

**Surface alternation.**

- Stat grid (4 cells): cream → pink → cream → green (or rotate to taste, but always include one cream cell so the grid breathes).
- Process row (4 cards): cream → pink → yellow → green. Final card is always the brand-primary anchor.
- Table: ink header row, cream label column, pink/green/orange data columns.

**Transition vocabulary.**

- Between scenes: hard cut + brief ink frame, no crossfade.
- Within a scene: slab-in for surfaces (DUR.med), then shadow-lag (DUR.snap), then numeral / type fill, then mono label tick-in.

**Forbidden shapes.**

- Rounded card corners outside the topbar pill (999px) and the decorative circle (50%).
- Gradient fills (the four-accent palette is solid-only).
- Drop-shadow blur, glow, neon — every shadow is hard offset.
- Center-aligned body text (grid discipline = left-aligned).

## §I Page-level CSS

```css
/* Make design.html itself read as Creative Mode. */
body {
  background: var(--canvas, #efe9d9);
  color: var(--ink, #0f0f0f);
  font-family: "Space Grotesk", system-ui, sans-serif;
}
h1,
h2,
h3 {
  font-family: "Archivo Black", "Anton", sans-serif;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 0.92;
}
.ds-section-heading,
.ds-h2 {
  border-bottom: 4px solid var(--ink, #0f0f0f);
  padding-bottom: 0.4em;
}
.ds-callout,
.ds-intent {
  background: var(--canvas, #efe9d9);
  border: 4px solid var(--ink, #0f0f0f);
  box-shadow:
    12px 12px 0 var(--brand-secondary, #f06ca8),
    12px 12px 0 4px var(--ink, #0f0f0f);
  padding: 1.5em;
}
.ds-code {
  background: #fff;
  border: 3px solid var(--ink, #0f0f0f);
  font-family: "JetBrains Mono", monospace;
}
```
