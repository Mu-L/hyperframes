```preset-meta
{
  "name": "long-table",
  "label": "Long Table",
  "fingerprint": {
    "ink": "single-color",
    "surface": "paper-texture",
    "borders": "1.5px-outlined",
    "type": "bricolage-uppercase + fraunces-italic",
    "depth": "flat-no-shadow",
    "anchor": "jumbo-italic-numeral"
  },
  "match_signals": [
    { "kind": "serif_display", "weight": 0.25 },
    { "kind": "hairline_border", "weight": 0.25 },
    { "kind": "minimal_decoration", "weight": 0.2 },
    { "kind": "low_saturation", "weight": 0.05 }
  ],
  "best_for": ["hospitality", "community brands", "lifestyle", "editorial", "magazine-friendly brands", "small-press / riso"],
  "avoid_for": ["technical", "corporate", "cold-minimal sites", "enterprise SaaS"]
}
```

## §A Director's intent

Long Table is a **single-ink editorial system** in the register of a supper-club poster, a Risograph zine, or a small-press dinner program. Every mark — text, border, rule, pill outline, page number — is rendered in **one brand ink** on a cream paper ground; opacity variants (78% / 32%) are the only chromatic variation. Depth is flat and printed: no shadows, no gradients, no fills — only 1.5px solid outlines and 1px solid/dashed internal dividers at 32% opacity. A subtle 4px radial-dot **paper texture** sits on every scene, invisible at distance, present up close.

Type carries the system: **Bricolage Grotesque weight 800 in strict uppercase** for every display moment (negative letter-spacing), paired with **Fraunces italic** as the default body voice — paragraphs, metadata, pills, page numbers. A massive **italic Fraunces jumbo numeral** (up to 480px) is the system's signature typographic anchor on cover-class scenes.

Class prefix: `lt-`. Best for warm, hospitality, community, lifestyle, editorial, magazine-friendly brands. Avoid for technical / corporate / cold-minimal sites — the warmth depends on serif italic + outlined shapes + paper texture.

**Brand-aware color contract:** the rust terracotta in the source template is discarded; the site's `--brand-primary` becomes "the ink." Three opacity tokens (78% / 50% / 32%) are synthesized via `color-mix()` so every brand re-colors cleanly. The "paper" surface is the site's `--canvas`.

## §B Decoration tokens

```css
/* Single-ink discipline — ink references brand-primary; opacities synthesized via color-mix */
--lt-ink-78: color-mix(in srgb, var(--brand-primary) 78%, transparent);
--lt-ink-50: color-mix(in srgb, var(--brand-primary) 50%, transparent);
--lt-ink-32: color-mix(in srgb, var(--brand-primary) 32%, transparent);

/* Structural borders — 1.5px is the only structural weight; never thicker */
--lt-border-structural: 1.5px solid var(--brand-primary);
--lt-divider-solid: 1px solid var(--lt-ink-32);
--lt-divider-dashed: 1px dashed var(--lt-ink-32);

/* Radii — only three values exist: pill, badge, or zero */
--lt-radius-pill: 999px;
--lt-radius-badge: 50%;
--lt-radius-flat: 0;

/* Paper-texture overlay — 4px radial dot @ 10% opacity ink, applied via pseudo-element */
--lt-paper-texture: radial-gradient(circle at 1px 1px, var(--lt-ink-50) 0.5px, transparent 1px);
--lt-paper-texture-size: 4px 4px;
--lt-paper-texture-opacity: 0.1;

/* Spacing — clamped fluid units mirroring the template's scale */
--lt-gap-tight: clamp(10px, 1.2vh, 18px);
--lt-gap-row: clamp(14px, 1.6vh, 24px);
--lt-gap-content: clamp(18px, 2vh, 32px);
--lt-gap-section: clamp(28px, 3vh, 50px);
--lt-pad-h: clamp(60px, 5vw, 110px);
--lt-pad-h-wide: clamp(80px, 7vw, 160px);
--lt-pad-h-narrow: clamp(120px, 12vw, 280px);

/* Tracking constants — Bricolage display always tight, Fraunces info-key always wide */
--lt-track-display: -0.012em;
--lt-track-tight: -0.005em;
--lt-track-wide: 0.16em;
--lt-track-wider: 0.18em;
```

## §D Font pairing fallback

- **display**: `'Bricolage Grotesque'` · `'Archivo Black'` · `'Anton'` wght 800
- **body**: `'Fraunces'` · `'Spectral'` · `'Newsreader'` wght 400
- **mono**: `'JetBrains Mono'` · `'Space Mono'` wght 400

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Long Table motion — calm, considered, supper-club pace.
// Type and outlined shapes settle into place; no overshoot, no bounce.
const EASE = {
  entry: "power2.out", // type + cards fade-rise into place
  emphasis: "expo.out", // jumbo numeral + headlines arriving with weight
  exit: "power2.in", // marks lift off paper, no snap
  drift: "sine.inOut", // paper-texture breath, candlelight flicker
  // RULE: never back/elastic/bounce — printed paper does not overshoot.
  // RULE: never "steps()" — the system has no pixel-grid, no staircase aesthetic.
};
const DUR = {
  snap: 0.18, // pill border-draw, tag arrivals
  med: 0.45, // headline rise, card fade-in
  slow: 0.95, // jumbo numeral entrance, scene crossfade
  // RULE: scene transitions are opacity crossfades, ~280-380ms; never slide or wipe.
};
```

### §E.5 Motion choreography

- **Allowed gestures:** opacity fade, gentle y-translate (12-24px), letter-by-letter type-in (Bricolage display, EASE.emphasis, 35-55ms stagger), border-length draw (1.5px outlines stroking on from one edge), Fraunces italic numeral scale-in from ~0.94 to 1.0 with EASE.emphasis + DUR.slow.
- **Forbidden gestures:** any back/elastic/bounce ease, any rotation > 1deg, any scale-in from below 0.85, any blur transition, any slide/wipe scene change, any color-shift (single-ink discipline).
- **Type-in motion:** Bricolage uppercase headlines stagger letter-by-letter or word-by-word, not character-rotation. Fraunces body fades in as a single block with EASE.entry (italic letterforms self-decorate; per-letter stagger breaks the flow).
- **Edition badge + label** are one animated unit — they enter together with EASE.entry + DUR.med. Never animate the badge before the label.
- **Paper-texture overlay** has its own DUR.slow opacity drift (0.08 ↔ 0.12) on EASE.drift for living-paper feel, but the overlay itself never enters or exits — it's a stage-level constant.
- **Scene transitions:** default is a 320ms opacity crossfade (EASE.entry on incoming, EASE.exit on outgoing). Hard cuts are reserved for kicker beats (e.g., "EDITION NO. 05" reveal); slide/wipe transitions are forbidden.

## §G Voice transform recipe

1. **Bricolage display lines (headlines, card titles, course names, info values):** UPPERCASE the source string; strip articles + connectives sparingly (keep "of / and" if they read as part of the title); apply -0.012em tracking implicitly via §B.
2. **Fraunces body lines (lede, tagline, pill text, page numbers, edition labels):** lowercase or sentence case; italic by default; **never UPPERCASE** a body line (uppercase is reserved for Bricolage).
3. **Edition / chapter markers:** rendered as `EDITION NO. <N>` in Bricolage tracked uppercase, or as a numeral inside a circular badge plus an italic Fraunces label like `december edition`.
4. **Stats and metadata:** short Fraunces italic phrases — `22 seats only`, `Twice a month`, `By application`. Avoid bullet symbols; use line breaks or middle-dot separators (`·`).
5. **Punchline:** brand name as the final mark, in either Bricolage display (cover) or Fraunces italic (closing).

**Example:**

- IN: `Long Table is an intimate supper-club bringing strangers together over a shared meal in a different city each month`
- OUT: `LONG TABLE — twenty-two seats, one cook, one long evening. *by application, a different city each month.*`

(Headline portion is Bricolage uppercase; the italicised continuation is Fraunces body voice — the recipe writes both styles into one line where appropriate.)

## §H Scene composition hints

- **Surface:** always the brand canvas as paper; the paper-texture overlay (`paper-texture` component or `--lt-paper-texture` token) sits on every scene at 10% opacity. Never solid flat color — always textured.
- **Focal density:** rich-but-curated — one major Bricolage display moment + 2-4 supporting groups (cards, pills, ledger rows, info pairs). Single-element scenes feel underweight; 8-element scenes feel broken.
- **Brand-color role contract:** `--brand-primary` is "the ink" — every text run, every border, every pill outline, every page number is this color. The opacity tokens (`--lt-ink-78`, `--lt-ink-32`) are the _only_ chromatic variation. Do not use `--brand-secondary` or `--brand-accent` — a second hue shatters the printed-program register.
- **Padding rhythm:** wide horizontal padding (`--lt-pad-h-narrow`) for quote / menu scenes that need a tall vertical column; default `--lt-pad-h` for cover / index; `--lt-pad-h-wide` for featured / calendar.
- **Type pairing:** every display element is Bricolage 800 uppercase with `--lt-track-display`. Every body element is Fraunces italic 400. Roman Fraunces appears _only_ for `info-key` labels (tracked uppercase) and card-body descriptions (small-size legibility).
- **Edition badge unit:** the circular badge and the italic "EDITION N." label are inseparable. Always render together.
- **Outlined shape discipline:** pills (`--lt-radius-pill`), badges (`--lt-radius-badge`), and every other container (`--lt-radius-flat`) — only those three radii. No 4px / 8px / 12px medium radii.
- **Internal divider rhythm:** inside cards, 1px solid @ 32% above the title, 1px dashed @ 32% below the body — the solid/dashed pairing is the system's signature card rhythm.
- **Cover-class hero anchor:** when a scene is a cover moment, reach for the `jumbo-numeral` component (italic Fraunces up to 480px) instead of a hero image. The numeral is the visual centerpiece.
- **Scene transition default:** 320ms opacity crossfade. No slide / wipe / push transitions — these break the printed-paper feel.
- **Allowed backgrounds:** the canvas + paper-texture overlay only. No gradients, no mesh, no full-bleed photography (decorative photo can sit inside an outlined card as a contained element, but the scene background itself is always cream paper).
- **Forbidden:** filled rectangles in ink color (outline-only); any box-shadow; any second hue; any non-italic body Fraunces (except info-keys and card-body); any sentence-case Bricolage.
- **Page-number marker:** italic Fraunces at the bottom-right of every scene. The marker is the system's spine — its presence ties otherwise-different scenes into one coherent program.

## §I Page-level CSS

```css
/* Style design.html itself in the Long Table register so the human-facing
   preview reads as a supper-club program preview, not a generic dump. */
:root {
  --lt-design-paper: var(--canvas);
  --lt-design-ink: var(--brand-primary);
}

body {
  background: var(--lt-design-paper);
  color: var(--lt-design-ink);
  font-family: "Fraunces", Georgia, serif;
  font-style: italic;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: var(--lt-paper-texture-opacity);
  background-image: var(--lt-paper-texture);
  background-size: var(--lt-paper-texture-size);
}

h1,
h2,
h3,
h4 {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: var(--lt-track-display);
  font-style: normal;
}

.ds-section {
  border-top: var(--lt-border-structural);
  position: relative;
  z-index: 1;
}

.ds-code {
  border: var(--lt-border-structural);
  border-radius: var(--lt-radius-flat);
  background: var(--canvas);
}
```
