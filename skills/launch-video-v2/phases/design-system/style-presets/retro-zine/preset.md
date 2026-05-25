```preset-meta
{
  "name": "retro-zine",
  "label": "Retro Zine",
  "fingerprint": {
    "shadow": "paper-on-paper-offset-slab",
    "border": "3px-solid-ink",
    "motion": "soft-paper-shuffle",
    "density": "editorial-medium-high",
    "contrast": "warm-paper-on-forest",
    "palette-mode": "anchored-pastel"
  },
  "match_signals": [
    { "kind": "condensed_display", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.25 },
    { "kind": "minimal_decoration", "weight": 0.15 },
    { "kind": "low_saturation", "weight": 0.1 }
  ]
}
```

## §A Director's intent

Risograph-printed zine page in motion. Bebas Neue runs tall, condensed, all-caps with positive tracking for every display moment; Space Grotesk sits at editorial small body (13-16px); Caveat hand-script lands attributions and side notes. Three-face contrast IS the rhythm — one-face slides read as monotonous.

Depth is **paper-on-paper offset slabs**, not blurred shadows. Hero cards carry a forest-green `::before` sitting 12px down-and-right behind a cream card. Stamps and collage pieces tilt -8°/+6°/-5°-to-+5° to read as hand-placed. A subtle SVG fractal-noise grain at 0.07 opacity sits over every scene — the texture that anchors the deck to printed-paper register.

**Brand DNA drives accent, anchors carry the paper.** The site brand colors light up headlines, drop caps, ribbon bars, stamp text, offset slabs, and inline accents. The warm khaki canvas (`--anchor-paper`) and soft cream (`--anchor-cream`) are §8.2 anchor hexes — without them dark or saturated brand DNA muddies the printed-paper identity. Body text and structural borders use `var(--ink)`.

**Color role contract**: green-on-khaki = emphasis (drop cap, ribbon bar, hero headline); ink-on-khaki = structure (borders, body, body-paired headlines); cream cards layer on khaki as paper-on-paper. The brand-primary takes the green role. Never reverse it — ink-as-emphasis flips the zine voice.

Motion is soft paper-shuffle: gentle opacity + translateY entries, no overshoot, no glide. Decorative elements pop in with a single light tilt; nothing bounces. Three-face typography never animates a face-swap.

**Class prefix `rz-`** is documented here so future maintainers know to use it on every component selector.

**Best for** sites with editorial / craft / indie / earthy palettes (publishers, music + arts brands, small-batch / craft launches, creator portfolios, community decks). Pairs naturally with high-saturation single-hue brands (forest, oxblood, ochre). High-tech neon palettes still render but the warm-paper register softens the brand voice — use a different preset if "polished digital" is the brief.

**Density is non-negotiable.** A scene that holds only one centered headline reads as underdesigned; the zine register expects supporting moves (eyebrow, drop cap, hand-script, stamp, ribbon, divider stub). Reserve true sparseness for statement / quote beats.

## §B Decoration tokens (merge into design.html `:root`)

Retro Zine declares **structural** tokens here (borders, paper offsets, grain overlay, tape footprint, rotation set) plus **two anchor hexes** that carry the warm-paper identity. Brand DNA flows in via `--brand-primary` / `--brand-secondary` / `--brand-accent` and lights up headlines, drop caps, ribbon bars, and offset slabs.

```css
/* §8.2 exception: paper anchors. Declared once so every khaki/cream surface
   reads as printed paper regardless of brand DNA. Without these anchors, dark
   or high-saturation brands would mute the warm-paper register — breaking the
   zine identity. All other colors source from brand DNA or var(--ink). */
--anchor-paper: #c8b99a; /* warm khaki canvas — default slide surface */
--anchor-paper-dark: #b8a98a; /* tonal sibling for layered surfaces / split halves */
--anchor-cream: #f4efe6; /* soft paper-cream for cards (never pure white) */

/* Structural border weights — black-on-paper. Always var(--ink), no exceptions. */
--border-thick: 3px solid var(--ink); /* card outer, region divider, collage piece */
--border-medium: 2px solid var(--ink); /* column rule, RSVP underline */
--border-fine: 1.5px solid var(--ink); /* grid cell sub-border, ledger header */
--border-hairline: 1px solid color-mix(in srgb, var(--ink) 22%, transparent); /* ledger row divider */

/* Paper-on-paper offset — signature depth move. Slab sits 12px down-right of card. */
--offset-slab: 12px;
--offset-slab-color: var(
  --brand-primary
); /* the green slab; brand-primary carries the emphasis role */

/* Padding scale */
--pad-card-lg: 48px;
--pad-card-md: 32px;
--pad-card-sm: 24px;
--gap-lg: 60px;
--gap-md: 40px;
--gap-sm: 24px;

/* Rotation vocabulary — intentional, never accidental tilt. */
--rot-stamp: -8deg;
--rot-stamp-alt: 6deg;
--rot-collage-a: -3deg;
--rot-collage-b: 4deg;
--rot-collage-c: 2deg;
--rot-collage-d: -5deg;

/* Grain overlay — SVG fractal noise, 0.07 opacity. Required on every scene. */
--grain-svg: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
--grain-opacity: 0.07;
--grain-tile: 200px 200px;
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Retro Zine forces its display / body / hand-script trio regardless of site DNA — the three-face contrast is the system's typographic argument. Fallbacks below are only used if the primary face fails to load.

- **display**: `'Bebas Neue'` · `'Oswald'` · `'Anton'` wght 400
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'Caveat'` · `'Kalam'` · `'Shadows Into Light'` wght 600

Note: the `mono` slot carries the **hand-script** voice (Caveat / Kalam / Shadows Into Light) — Retro Zine has no machine-mono moment. `resolveFont()` reads the slot by name, not by role; using `mono` as the script slot keeps the three-slot contract while binding the system's signature handwritten face.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "power2.out", // soft paper-shuffle — the template uses cubic-bezier(0.22, 1, 0.36, 1), Material-ish; we map to power2.out for a calm editorial arrival
  emphasis: "power3.out", // statement / quote / stamp punch — slightly firmer than entry, still no overshoot
  exit: "power2.in", // accelerate off the page
  drift: "sine.inOut", // ambient grain-tile drift / hand-script settle
};
const DUR = {
  snap: 0.18,
  med: 0.5,
  slow: 0.9,
};
// RULE: never use back/elastic/bounce. The zine register is "considered editorial" —
//       overshoot reads as digital flourish and breaks the printed-paper voice.
// RULE: stamps and collage pieces enter with a soft fade + slight scale (0.94 → 1),
//       NOT a rotation tween. Rotation is the static signature — animating it
//       turns a hand-placed stamp into a spinning gif. Set the rotation as the
//       starting AND ending value.
// RULE: hand-script (Caveat) elements animate with a write-on or simple fade.
//       Never tween letter-spacing on Caveat — the ballpoint voice depends on
//       fixed kerning.
// RULE: grain overlay never animates. It is a static texture; movement turns it
//       into TV static.
```

### §E.5 Motion choreography

**Allowed primitives**

- Soft fade + 20px translateY entry on the primary scene moment (matches template's `.slide` enter).
- Drop cap pop: 0 → 1 opacity + 0.94 → 1 scale on `EASE.emphasis`, no overshoot.
- Ribbon bar wipe-in: scaleX 0 → 1 with `transform-origin: left`, on `EASE.entry`.
- Collage piece settle: each piece fades in with a 80-120ms stagger; rotation stays fixed throughout.
- Tape settle: short fade-in only — taped pieces don't slide into place.
- Hand-script attribution: opacity fade-in 100-200ms after the headline lands. Never type-on with a cursor (mismatched register).
- Stamp-mark arrival: scale 1.1 → 1 + opacity 0 → 1 on `EASE.emphasis` — a single "thunk" feel.

**Forbidden**

- back / elastic / bounce eases on any element.
- Crossfading between scenes (the template's slide opacity 0.6s is acceptable, but for scene-level transitions in the video, use a clean fade — never blur, slide, or zoom).
- Animating rotation on stamps / collage pieces. Rotation is a static signature.
- Tweening Caveat letter-spacing or `font-weight`.
- More than ±8° tilt on any element. Beyond that, hand-placed becomes broken.
- Modern blurred `box-shadow` reveals. All depth is paper-offset / rotation / grain.
- Pure white (#ffffff) anywhere. Use `--anchor-cream` for "white" surfaces.

**Stagger budget**

120-200ms between elements. Slower than 8-bit-orbit (80-120ms), in line with editorial pacing. Total scene-in stagger ≤ 700ms.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Keep editorial sentence-case for body copy (the zine register IS small body type at 13-16px) — do not UPPERCASE paragraphs.
2. Hero headlines: 2-4 words MAX, UPPERCASE, tracked 0.04em (Bebas Neue treatment). Break across two lines when a phrase has a natural pivot.
3. Eyebrow labels / chips / kicker: UPPERCASE, tracked 0.2-0.25em (Bebas Neue or Space Grotesk weight 600).
4. Stats / numerals: bare numeric in Bebas Neue (`340%`, `$12.4M ARR`), paired with a Caveat hand-script label below ("year-over-year growth").
5. Hand-script lines = personal / attributional: bylines, asides, "filled-by-hand" form values. Sentence case, em-dash openers OK ("— Our founding principle since day one").
6. CTAs / stamp text: 1-3 words UPPERCASE on the stamp-mark (`CONTACT US`, `SHIP IT`, `JOIN US`); tracked 0.1em.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`DESIGN. TOGETHER.` / eyebrow=`REAL-TIME` / hand-script=`— for the teams that ship` / stamp=`JOIN US`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default scene: warm-khaki canvas (`--anchor-paper`) + grain overlay + 3px ink structural borders. ~70% of scenes.
- Statement scene: full-bleed `--brand-primary` ground + cream divider stubs + Bebas Neue quote in cream + Caveat byline. Use once per video as the manifesto beat.
- Editorial scene: khaki canvas with a single 2px ink column rule splitting two body columns; drop cap leads the left column. For dense narrative moments.
- Closing scene: ink (`var(--ink)`) ground + khaki text + brand-primary divider stub + Caveat sign-off. Mirror of the statement beat; pair them at scene 1 + last.
- Never two consecutive statement scenes — the brand-primary full-bleed loses impact if back-to-back.

**Hero text**

- One Bebas Neue headline per scene. Default color: `var(--brand-primary)` on khaki; `var(--anchor-cream)` on brand-primary / ink grounds; `var(--ink)` on column-paired layouts where the headline reads as a label rather than emphasis.
- Hero takes ≥ 50% canvas width on hero scenes. Tracking 0.02-0.04em mandatory; Bebas without positive tracking reads as cramped.
- Never two hero-tier Bebas headlines per scene.
- Pair hero with eyebrow (Bebas tracked 0.2em) or hand-script (Caveat) below — never both above; the eyebrow goes above, hand-script below.

**Brand color placement (role contract)**

- `--brand-primary` carries the **emphasis** role — headlines, drop caps, ribbon bars, offset slab behind cards, stamp borders, divider stubs.
- `--brand-secondary` is the hover / slightly-brighter sibling — secondary CTAs, alternate ribbon bars, accent rule under an eyebrow. Use sparingly (≤1 per scene).
- `--brand-accent` carries the **tag** role — chip fills inside ledger rows, categorical badges. Never as a headline color.
- `var(--ink)` is structure — borders, body text, label fills (when inverted). Never as emphasis (ink-as-emphasis flips the green-as-emphasis contract).
- One scene = one brand color carrying emphasis. Splitting emphasis across two brand colors dilutes the zine voice.

**Paper anchors are sacred**

- Every "white" surface uses `--anchor-cream`, never `#ffffff`.
- Every khaki surface uses `--anchor-paper` or `--anchor-paper-dark`. The split-screen pattern uses both halves with a 3px ink rule between.
- Pure black (`#000`) is wrong — use `var(--ink)` (the brand-derived dark ink, defaults to `#1A1A1A`-ish).

**Structural borders**

- Card outer / collage piece / region divider: `var(--border-thick)` (3px).
- Column rule / RSVP underline / stamp-mark border: `var(--border-medium)` (2px).
- Grid cell sub-border / ledger header: `var(--border-fine)` (1.5px).
- Ledger row divider: `var(--border-hairline)` (1px @ 22% ink). NEVER use as a primary divider.
- Borders are always ink. The stamp-mark green border is the single colored-border exception.

**Rotation vocabulary**

- Stamps: `-8deg` (default) or `+6deg` (alt). Reserve for "stamped" elements — badges, approval callouts.
- Collage pieces: cycle `-3deg / +4deg / +2deg / -5deg` across 4 pieces in a single composition. Never two adjacent pieces at the same angle.
- Tape: sharp angles `-40deg` to `+35deg`. Always semi-transparent white.
- No element exceeds ±8° tilt outside the tape vocabulary.

**Density**

- Editorial medium-high. Every scene carries 3-5 supporting moves: eyebrow + hero + hand-script + drop-cap + stamp / ribbon. A scene with just a centered headline reads as broken zine.
- Exception: statement scene runs sparser — one large Bebas quote + Caveat byline + two cream divider stubs framing the quote.

**Transitions between scenes**

- Soft fade. The template uses 0.6s opacity + 20px translateY; for the video, hold to a clean opacity fade between scenes (no slide, no zoom).
- NEVER blur / crossfade with motion / dissolve through a third state.

**Ambient texture (non-negotiable)**

- Grain overlay (`grain-overlay` component) on every single scene, at 0.07 opacity, fixed full-viewport, pointer-events disabled, z-index 9999. Without it, the print register evaporates.

**Sound design (passed to audio phase, not 4b worker — note for completeness)**

- Soft paper-shuffle (acoustic sample) on scene-in.
- Pen / marker scratch sample on drop-cap and inline-highlight reveal.
- "Thunk" stamp sound on stamp-mark arrival.
- Hand-script byline = no sound (silent personal voice).

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as retro-zine)

```css
body {
  background: var(--anchor-paper);
  position: relative;
}
body::after {
  /* Grain overlay on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  background-image: var(--grain-svg);
  background-size: var(--grain-tile);
  opacity: var(--grain-opacity);
  pointer-events: none;
  z-index: 9999;
}
.title-card {
  background: var(--anchor-paper);
  border-bottom: var(--border-thick);
  padding: 96px 0 80px;
}
.title-display {
  font-family: "Bebas Neue", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
}
.brand-name {
  color: var(--brand-primary);
  font-weight: 400;
}
.style-name {
  color: var(--ink);
  font-weight: 400;
}
.ds-section {
  border-top: var(--border-thick);
  padding: 80px 0;
}
h2 {
  font-family: "Bebas Neue", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--brand-primary);
}
.eyebrow {
  font-family: "Bebas Neue", sans-serif;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.type-card,
.voice-pair,
.comp-card {
  background: var(--anchor-cream) !important;
  border: var(--border-thick) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border: var(--border-thick) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.comp-head {
  background: var(--ink) !important;
  color: var(--anchor-paper) !important;
  border-bottom: var(--border-thick) !important;
  font-family: "Bebas Neue", sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ds-code {
  background: var(--anchor-cream) !important;
  border: var(--border-medium);
  border-radius: 0 !important;
  color: var(--ink) !important;
}
```
