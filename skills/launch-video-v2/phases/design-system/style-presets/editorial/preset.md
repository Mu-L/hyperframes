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
  ],
  "best_for": ["longform essays", "research recaps", "restrained editorial", "swiss-style brand decks", "academic / advisory"],
  "avoid_for": ["sales-driven punch", "expressive maximalism", "decoration-heavy briefs", "high-energy promo"]
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
