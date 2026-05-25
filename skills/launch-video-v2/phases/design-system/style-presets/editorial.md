```preset-meta
{
  "name": "editorial",
  "label": "Editorial / Swiss",
  "fingerprint": {
    "shadow": "none-or-hairline",
    "border": "hairline",
    "motion": "refined-glide",
    "density": "low",
    "contrast": "medium"
  },
  "match_signals": [
    { "kind": "hairline_border",     "weight": 0.25 },
    { "kind": "serif_display",       "weight": 0.25 },
    { "kind": "low_saturation",      "weight": 0.20 },
    { "kind": "generous_padding",    "weight": 0.15 },
    { "kind": "minimal_decoration",  "weight": 0.15 }
  ]
}
```

## §A Director's intent

Restraint. Hierarchy through size and space, not color or weight.
Long-form sentences. Generous whitespace. Subtle motion.
The page should feel like a printed essay set in lead type.

**Asymmetry over symmetry.** Composition follows a modular grid (Müller-Brockmann).
Prefer 1/3 + 2/3 splits over 1/2 + 1/2. Anchor strong elements to grid intersections;
let the negative space carry equal weight. Center alignment is forbidden; ragged-right
left alignment is the default.

## §B Decoration tokens (merge into design.html `:root`)

Spacing / measure units are in `vw` so the same ratios scale identically across
the design.html preview (~1440px) and the final video canvas (1920×1080).
Hairline thickness stays in px — line weights shouldn't scale.

```css
--rule-hairline: 1px solid var(--ink);
--paper-warm: #f6f3ec; /* fallback if canvas is pure white */
--gap-quiet: 5vw; /* ~96px on a 1920 canvas */
--gap-page: 8.3vw; /* ~160px on a 1920 canvas */
--measure-narrow: 32vw; /* ~614px on a 1920 canvas (≈ 65ch) */
--measure-wide: 43vw; /* ~826px on a 1920 canvas */

/* Modular grid (Swiss). All layout snaps to these tracks. */
--grid-cols: 12;
--grid-gutter: 1.25vw; /* ~24px on 1920 */
--grid-margin: 8.3vw; /* outer side margin, matches --gap-page */
--baseline: 8px; /* vertical rhythm unit — round line-heights / margins to multiples */
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

- **display**: `'Instrument Serif'` · `'Fraunces'` · `'Newsreader'` · `'Spectral'`
- **body**: `'Inter'` · `'Source Sans 3'` · `'Public Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'IBM Plex Mono'` wght 400

Prefer keeping site fonts if they exist on Google Fonts. Preset only enforces weight (light/regular) and tracking.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "power3.out", // soft arrival, no bounce
  emphasis: "power2.inOut", // refined transitions
  exit: "power2.in", // gentle dismissal
  drift: "sine.inOut",
};
const DUR = {
  snap: 0.32, // even "fast" is unhurried
  med: 0.65,
  slow: 1.1,
};
// RULE: motion is subtle. If you can hear the entry, it's wrong.
// RULE: prefer fade + tiny y-translate over scale or rotation.
```

## §E.5 Motion choreography

**Allowed primitives**

- Crossfade (320–650ms).
- Slow upward translate, max 24px.
- Opacity hold + delayed exit on outgoing element (overlap, never cut).
- Single element revealed at a time; stagger 200–280ms between sibling elements.

**Forbidden**

- `bounce`, `elastic`, `back.out` — anything with overshoot.
- `scale` in/out beyond 0.98 → 1.0. No "zoom" reveals.
- `rotate` on any content element. (Rotation breaks Swiss orthogonality.)
- Parallax. Camera moves. Mask wipes.
- Letter-by-letter typewriter unless the scene is _about_ type.

**Transitions between scenes**

Default is a 320–500ms crossfade with a 16–24px upward drift on the incoming
content. Never hard-cut. Never directional swipes. If two adjacent scenes share
a rule line or chapter label, hold that element across the transition (match-cut
on the rule).

**Typography in motion**

Words enter as a single block, not glyph-by-glyph. The baseline does not move
during a sentence read. Numbers (stat counters) tween linearly, never with ease.

## §F Components (paste-ready, use brand vars)

<!-- COMPONENT: hero -->

```html
<div class="ed-hero">
  <span class="ed-kicker">{KICKER}</span>
  <h1 class="ed-display">{HEADLINE}</h1>
  <p class="ed-lede">{LEDE}</p>
</div>
<style>
  .ed-hero {
    padding: var(--gap-quiet) 0;
    max-width: var(--measure-wide);
  }
  .ed-kicker {
    font-size: clamp(11px, 1.1vw, 14px);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--ink-soft, var(--ink));
  }
  .ed-display {
    font-size: clamp(120px, 14vw, 220px);
    letter-spacing: -0.02em;
    font-weight: 400;
    line-height: 1.02;
    margin-top: 24px;
  }
  .ed-lede {
    font-size: clamp(18px, 1.8vw, 26px);
    line-height: 1.55;
    max-width: var(--measure-narrow);
    margin-top: 36px;
    color: var(--ink-soft, var(--ink));
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: chip -->

```html
<span class="ed-chip">{LABEL}</span>
<style>
  .ed-chip {
    display: inline-block;
    padding: 4px 12px;
    border: var(--rule-hairline);
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-soft, var(--ink));
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: button -->

```html
<button class="ed-button">{LABEL} <span class="ed-arrow">→</span></button>
<style>
  .ed-button {
    background: transparent;
    color: var(--ink);
    border: none;
    border-bottom: var(--rule-hairline);
    padding: 8px 0;
    font-size: clamp(15px, 1.4vw, 18px);
    font-weight: 500;
    cursor: pointer;
  }
  .ed-button:hover {
    border-bottom-color: var(--brand-accent, var(--ink));
  }
  .ed-arrow {
    display: inline-block;
    margin-left: 8px;
    transition: transform 0.32s;
  }
  .ed-button:hover .ed-arrow {
    transform: translateX(4px);
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: stat-counter -->

```html
<div class="ed-stat">
  <div class="ed-stat-num">{NUM}</div>
  <div class="ed-stat-label">{LABEL}</div>
</div>
<style>
  .ed-stat {
    padding: 24px 0;
    border-top: var(--rule-hairline);
  }
  .ed-stat-num {
    font-size: clamp(64px, 9vw, 140px);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .ed-stat-label {
    font-size: clamp(11px, 1.1vw, 14px);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-top: 12px;
    color: var(--ink-soft, var(--ink));
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: pull-quote -->

```html
<blockquote class="ed-quote">
  <p>{QUOTE}</p>
  <cite>— {AUTHOR}</cite>
</blockquote>
<style>
  .ed-quote {
    padding: 48px 0;
    max-width: var(--measure-narrow);
  }
  .ed-quote p {
    font-size: clamp(28px, 3vw, 44px);
    line-height: 1.25;
    font-style: italic;
    font-weight: 400;
  }
  .ed-quote cite {
    display: block;
    margin-top: 24px;
    font-size: 13px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-style: normal;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: divider-rule -->

```html
<hr class="ed-rule" />
<style>
  .ed-rule {
    border: none;
    border-top: var(--rule-hairline);
    margin: var(--gap-quiet) 0;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: chapter-label -->

```html
<div class="ed-chapter">
  <span class="ed-chapter-num">{NUM}</span>
  <span class="ed-chapter-rule"></span>
  <span class="ed-chapter-name">{NAME}</span>
</div>
<style>
  /* "01 — Foundations" — used as a scene anchor or section opener.
     Snaps to baseline; full hairline rule fills the remaining track. */
  .ed-chapter {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    font-size: clamp(11px, 1.1vw, 14px);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-soft, var(--ink));
  }
  .ed-chapter-num {
    font-variant-numeric: tabular-nums;
  }
  .ed-chapter-rule {
    height: 1px;
    background: var(--ink);
    opacity: 0.5;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: drop-cap -->

```html
<p class="ed-dropcap"><span class="ed-dropcap-letter">{LETTER}</span>{REST_OF_PARAGRAPH}</p>
<style>
  /* Editorial opener — first letter set 4x body, hanging into the margin.
     Use once per scene at most. */
  .ed-dropcap {
    font-size: clamp(18px, 1.8vw, 26px);
    line-height: 1.55;
    max-width: var(--measure-narrow);
    color: var(--ink);
  }
  .ed-dropcap-letter {
    float: left;
    font-family: var(--font-display, inherit);
    font-size: 5.2em;
    line-height: 0.92;
    padding: 6px 12px 0 0;
    font-weight: 400;
    font-style: italic;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: two-column -->

```html
<div class="ed-cols">
  <div>{LEFT}</div>
  <div>{RIGHT}</div>
</div>
<style>
  .ed-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .ed-cols {
      grid-template-columns: 1fr;
    }
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: gradient-mesh-bg -->

```html
<div class="ed-mesh">
  <div class="ed-mesh-blob ed-mesh-blob-1"></div>
  <div class="ed-mesh-blob ed-mesh-blob-2"></div>
  <div class="ed-mesh-blob ed-mesh-blob-3"></div>
  <div class="ed-mesh-veil"></div>
  <div class="ed-mesh-fg">{FOREGROUND_CONTENT}</div>
</div>
<style>
  /* Soft brand-color blobs heavily blurred. A near-white veil keeps the
   foreground text legible by knocking down chroma intensity. */
  .ed-mesh {
    position: relative;
    overflow: hidden;
    background: var(--canvas);
    border-radius: 4px;
    min-height: 320px; /* preview only — drop when used full-bleed in scene */
  }
  .ed-mesh-blob {
    position: absolute;
    width: 65%;
    height: 75%;
    border-radius: 50%;
    filter: blur(140px);
    pointer-events: none;
    opacity: 0.85;
  }
  .ed-mesh-blob-1 {
    background: var(--brand-primary);
    top: -15%;
    left: -10%;
  }
  .ed-mesh-blob-2 {
    background: var(--brand-secondary);
    bottom: -20%;
    right: -10%;
  }
  .ed-mesh-blob-3 {
    background: var(--brand-accent);
    top: 25%;
    left: 30%;
    width: 45%;
    height: 55%;
    opacity: 0.55;
  }
  .ed-mesh-veil {
    position: absolute;
    inset: 0;
    background: var(--canvas);
    opacity: 0.55; /* tune 0.4-0.7 to balance brand presence vs legibility */
    pointer-events: none;
  }
  .ed-mesh-fg {
    position: relative;
    z-index: 1;
    padding: var(--gap-quiet);
    color: var(--ink);
    max-width: var(--measure-wide);
  }
</style>
```

<!-- /COMPONENT -->

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Keep complete sentences. Use semicolons and em-dashes for rhythm.
2. Prefer one strong noun phrase over a list.
3. Title-case section labels, not UPPERCASE.
4. End scenes with a quiet declarative — no exclamation.
5. Cite numbers and proofs (years, customers, awards) as factual asides.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `A canvas for teams — designing together, in real time. Trusted by 4 million.`

## §H Scene composition hints (Phase 4b layout guidance)

**Grid & balance**

- Compose on a **12-column modular grid** with `--grid-margin` outer side margins.
- **Asymmetric split is the default**: 1/3 + 2/3, or 2/5 + 3/5. Never 1/2 + 1/2.
- Anchor display headlines and stat counters to a single grid line; let the
  remaining tracks stay empty.
- Vertical rhythm snaps to `--baseline` (8px). Round padding, margins, and
  line-heights to multiples — drifting off the baseline reads as sloppy.

**Typography discipline**

- **Left-align by default**, ragged right.
- **Never `text-align: justify`** (rivers and uneven word spacing kill the rhythm).
- **Never `text-align: center`** for body or display, except a single deliberate
  symbol/numeral on a scene. Centered editorial typography reads as wedding invite.
- One typeface family per scene. Mix weight and size, not faces.

**Color discipline**

- Canvas is the hero — solid warm paper (use brand canvas; fall back to
  `--paper-warm` if canvas is pure white).
- **Brand accent ≤ 5% of frame area.** One small chip, one underline, one numeral
  — never an entire panel. The page should still read as monochrome at a squint.
- Primary brand color is reserved for emphasis (a single quote, a single number).
  Do not use it as a background fill.

**Density & focus**

- **Two strong things per scene maximum**. Hierarchy through size, not stacking.
- **Whitespace is the primary design element**. Side margins > 8% of frame.
- One scene = one idea. If you can't name it in three words, split the scene.

**Atmosphere**

- **Transitions between scenes**: crossfade 320–500ms with a 16–24px upward
  drift. No hard cut. No swipe.
- **Sound design**: ambient pad, low pulse, occasional single piano note.
  No percussion. No risers.
- **Stagger**: 200–280ms between elements. Unhurried.

## §I Page-level CSS (makes design.html itself read as editorial)

```css
body {
  background: var(--canvas);
}
.title-card {
  padding: 120px 0 80px;
  border-bottom: var(--rule-hairline);
}
.title-display {
  font-style: italic;
  max-width: var(--measure-wide);
}

.ds-section {
  border-top: var(--rule-hairline);
  padding: 96px 0;
}

.dna-swatch {
  border-radius: 4px !important;
  border: var(--rule-hairline) !important;
  box-shadow: none !important;
}

.comp-card {
  border: var(--rule-hairline) !important;
  border-radius: 4px !important;
  box-shadow: none !important;
  margin: 24px 0 !important;
}
.comp-head {
  background: transparent !important;
  border-bottom: var(--rule-hairline) !important;
}

.ds-code {
  border: var(--rule-hairline);
  border-radius: 4px !important;
}

h2 {
  font-style: italic;
}
```
