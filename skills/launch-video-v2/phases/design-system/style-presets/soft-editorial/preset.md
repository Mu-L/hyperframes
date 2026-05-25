```preset-meta
{
  "name": "soft-editorial",
  "label": "Soft Editorial",
  "fingerprint": {
    "edges": "soft-rounded",
    "shadow": "none",
    "rules": "1px-dashed-warm-ink",
    "surfaces": "translucent-white-and-pastel-cards",
    "ornament": "drop-cap-and-roman-numerals",
    "type": "old-style-serif-mixed-roman-italic",
    "voice": "literary-considered-unhurried",
    "register": "small-press-quarterly"
  },
  "match_signals": [
    { "kind": "serif_display",       "weight": 0.28 },
    { "kind": "hairline_border",     "weight": 0.18 },
    { "kind": "low_saturation",      "weight": 0.22 },
    { "kind": "minimal_decoration",  "weight": 0.20 }
  ]
}
```

## §A Director's intent

A warm small-press literary quarterly. Cream paper field, Cormorant Garamond carrying every headline and ornamental moment, Work Sans receding into body. Generous rounded cards (24–36px radius) float as translucent white over the cream — depth is implied by translucency and form, never by shadow.

**Distinct from `editorial` — softer in every register.** Where `editorial` (Swiss) commits to hairline solid rules, ragged-right asymmetry, and ink-on-white restraint, Soft Editorial commits to **rounded translucent cards, dashed warm hairlines, and a quartet of pastel candy accents** (pink, lemon, blush, sage, lilac) as interchangeable card fills. Where editorial is "printed essay set in lead type", soft-editorial is "Sunday-supplement magazine spread with riso-print color". Both are calm and serif-driven — but pick soft-editorial when the brand wants Sunday warmth, not Swiss discipline.

**Typographic signal: mixed weight inside the headline.** A serif headline at weight 500 carries an `<em>` that drops to weight 400 italic — the italic phrase is a _lighter_ weight of the same family. The weight drop is a softening, not bold emphasis. This is opposite the magazine convention of italic-for-bold; here italic is the more intimate tone.

**Color philosophy: cream plus five pastels.** The cream paper field (`--paper-anchor`, a warm aged cream) is the constant under every surface — pastels appear only as card fills, never as the slide background. Pastel slots are interchangeable card paints: none carries a fixed semantic role outside matrix layouts. Text stays in `--ink` on every surface — soft-editorial never inverts to white on pastel.

**Best for** sites whose brand DNA reads literary, unhurried, considered — founder essays, gallery/museum, advisory, longform brand stories, lifestyle media, research notebooks. Equally good for tech / business decks that want Sunday-supplement warmth instead of corporate polish. **Avoid for** sites that need visual heat or declarative punch — the cream palette and Cormorant serif are intentionally quiet.

Motion is unhurried: soft `power2.out` arrivals, no overshoot, no bounce. Stagger budgets stretch toward the editorial upper band (200–280ms between siblings); even snap durations are slow by other-preset standards. Class prefix: `se-`.

## §B Decoration tokens (merge into design.html `:root`)

Spacing in `vw` so ratios scale identically across the design.html preview and the 1920×1080 video canvas. Card radii in px — soft-editorial's identity _is_ the radius value, not a relative softness.

```css
/* §8.2 hue-anchor exception: warm cream paper.
   Soft Editorial's identity is the cream paper field — without this anchor,
   dark or saturated brand DNA would override the surface entirely and erase
   the "magazine paper" register. Mixed with brand-accent for surface tints;
   referenced directly when a literal cream field is required. */
--paper-anchor: #f2eedf;

/* Surfaces — translucent white floats on the cream field; the cream shows
   through, which is how soft-editorial signals "lifted" without a shadow. */
--surface-card: rgba(255, 255, 255, 0.55);
--surface-paper: color-mix(in srgb, var(--brand-accent) 8%, var(--paper-anchor));

/* Hairlines — 1px dashed warm ink at low opacity. The notebook-margin feel.
   1.5px solid for slightly heavier dividers (matrix head-rows, column rules). */
--rule-dashed: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
--rule-solid: 1.5px solid color-mix(in srgb, var(--ink) 35%, transparent);

/* Border-radius scale — soft-editorial has NO square corners. */
--radius-card-lg: 36px; /* large insight / closer / stat cards */
--radius-card: 28px; /* default cards, items, process nodes */
--radius-card-sm: 24px; /* compact panels, action bars */
--radius-tile: 16px; /* swatch tiles */
--radius-chip: 14px; /* small decorative chips */
--radius-pill: 999px; /* status pills, swatch discs */

/* Spacing — generous between cards, comfortable inside. */
--gap-outer: 4.2vw; /* ~80px on 1920 — outer slide padding */
--gap-cards: 1.5vw; /* ~28px between cards in a row */
--gap-cards-lg: 1.9vw; /* ~36px between major panels */
--gap-stack: 1.9vw; /* vertical between stacked text */
--pad-card-lg: 64px 48px;
--pad-card-md: 48px 52px;
--pad-card-sm: 28px 30px;

/* Measure — body line length cap (paragraph-of-an-essay width) */
--measure-body: 32vw; /* ~614px ≈ 65ch at body size */
--measure-display: 43vw; /* ~826px ≈ display headline cap */
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

- **display**: `'Cormorant Garamond'` · `'Cormorant'` · `'EB Garamond'` · `'Fraunces'` wght 500
- **body**: `'Work Sans'` · `'Inter'` · `'Source Sans 3'` wght 400
- **mono**: `'JetBrains Mono'` · `'IBM Plex Mono'` wght 400

Mono is declared for completeness; soft-editorial does not use monospace in any component — labels are sans or italic serif. If brand DNA forces a mono, demote it to a single technical caption use.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "power2.out", // soft arrival, no overshoot — "considered, unhurried"
  emphasis: "power2.inOut", // gentle inflection on emphasis beats
  exit: "power2.in", // gentle dismissal
  drift: "sine.inOut", // ambient breath on translucent cards
};
const DUR = {
  snap: 0.18, // even "fast" is unhurried — upper-band snap
  med: 0.5,
  slow: 1.0,
};
// RULE: no overshoot anywhere. back.out / elastic / bounce break the editorial calm.
// RULE: italic-em phrases inside a headline fade in *after* the roman headline lands
//       (DUR.snap delay) — the weight drop is a softening, not an entry beat.
// RULE: drop caps enter on a separate beat from their paragraph (DUR.med delay)
//       so the 132px serif glyph reads as a deliberate ornament, not a stutter.
// RULE: pastel card fills cross-fade between scenes, never hard-cut. Color is a
//       slow tonal shift, not a flash.
// RULE: roman-numeral step ordinals (i. ii. iii.) tween linearly on counter reveals.
//       Eased numerals read as "animated" not "printed".
```

### §E.5 Motion choreography

**Allowed primitives**

- Crossfade between scenes: 400–600ms, with a 16–24px upward drift on the incoming
  cards. Never hard-cut. Never directional swipe.
- Translucent card entry: opacity 0 → 0.55 with a small `y: 12px → 0` lift.
- Drop cap reveals on a delayed beat (after the paragraph body settles).
- Italic `<em>` phrases inside a headline fade in _after_ the roman headline,
  offset by DUR.snap.
- Ambient drift on translucent cards: ±2px y on a 6–8s sine loop, very subtle.
- Pastel swatch-row dots: stagger entry (DUR.snap apart), scale 0.92 → 1.0 with
  `power2.out`. No spin, no rotation.

**Forbidden**

- `back`, `elastic`, `bounce` — anything with overshoot. Soft-editorial is calm.
- Any `scale` beyond 0.92 → 1.0 (no "zoom" reveals).
- Any rotation on content elements. Pastel cards are not stickers.
- Letter-by-letter typewriter on serif. Cormorant doesn't typewrite.
- Sub-pixel drift on cards — round transforms to whole px to keep the rounded
  corners crisp.
- Hard cuts between scenes.

**Stagger budget**

200–280ms between sibling elements. Matches editorial's calm cadence. Total scene-in
stagger ≤ 800ms — soft-editorial is unhurried, but not glacial.

**Typography in motion**

Words enter as a single block, not glyph-by-glyph. Italic `<em>` phrases are the
exception — they cross-fade _into_ the existing roman headline after the roman
lands, which makes the weight-drop reveal feel like a turning of the page.

## §G Voice transform recipe

Take the brand's product description / value prop. Transform with:

1. Keep complete sentences. Sentence case throughout — no UPPERCASE outside the rare
   small label (≤11px).
2. Prefer one warm noun phrase over a list of features. The mood is "essayist's
   summary", not "product spec".
3. Drop hyperbole and superlatives (`best`, `most`, `revolutionary`). Replace with
   measured adjectives (`considered`, `quiet`, `careful`).
4. Use italic `<em>` inside a headline to highlight a single warm phrase — usually
   2–4 words mid-sentence. The italic is the system's emphasis.
5. End scenes with a quiet declarative — no exclamation, no question mark.
6. Cite proofs (years, customers, awards) as factual asides in italic serif at
   marker size, not as boastful pull-out stats.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `A canvas where teams design <em>together</em>, in real time. — Trusted by four million, quietly.`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface & elevation**

- Slide background is always cream — `var(--brand-canvas, var(--paper-anchor))`.
  Pastel fills appear only as card fills, never as a slide background. The single
  exception is a full-bleed closer scene (one per video at most) that may fill with
  `var(--brand-primary)` for a single quiet "moment".
- Default card fill is `var(--surface-card)` (translucent white at 55%). The cream
  bleeds through and _is_ the depth signal — no shadow, no border. Reach for a
  pastel fill (any of `--brand-primary` / `--brand-secondary` / `--brand-accent`)
  only when a card needs color or status.
- No drop shadows. No glow. No blur halos. Depth comes from translucency and the
  generous rounded form.
- Cards never stack on cards. If a layout needs visual hierarchy, use size and
  color — never z-stacking.

**Brand color placement (role contract)**

- All three brand colors are interchangeable card fills — soft-editorial does not
  assign a fixed `primary→hero` role. The brand-primary is the warmest moment, the
  brand-secondary is the brightest, the brand-accent is the most neutral; but any
  scene may rotate them as needed. The system's voice is "we have a palette of
  pastels", not "we have a hero color".
- **Text stays in `var(--ink)` on every surface, including all pastel cards.**
  Never invert to white on pastel. This is non-negotiable — inverted text breaks
  the editorial calm.
- Two-color limit per scene: at most two of the three brand colors visible at
  once. Three brand colors on one scene reads as a color-wheel demo, not as
  composition.

**Typography discipline**

- One typeface family per headline. Mix weight (500 → 400) and style (roman →
  italic) inside the headline, not faces. Italic `<em>` is the system's emphasis.
- **Left-align by default**, ragged right. Centered headlines are reserved for
  the full-bleed closer and the pull-quote — the system's two "moment" scenes.
- Drop caps appear at most once per scene, only on long-form opener paragraphs
  (132px Cormorant Garamond medium, line-height 0.85). A scene with two drop caps
  is broken.
- Roman-numeral step ordinals (`i.`, `ii.`, `iii.`, `iv.`, `v.`) — lowercase
  italic serif. Arabic step numbers break the editorial register.
- The 11px Work Sans uppercase swatch label is the only uppercase element in the
  system. Everything else is sentence case.

**Layout & density**

- Card grids: 28–36px gaps between cards, 80px outer slide padding. The cream
  field around and between cards is load-bearing — a layout that crowds cards
  edge-to-edge reads as broken.
- Two strong things per scene maximum. Hierarchy through size and surface color,
  not stacking.
- Card body density inside cards may be medium-high (matrices, dense step grids,
  lengthy quoted text) — the cream-field margin between cards carries the
  breathing.

**Transitions between scenes**

- Default: 400–600ms crossfade with 16–24px upward drift on incoming cards.
- Hold cream as the background across the cut — the cards swap, the field is
  constant. The cream field is the deck's "spine".
- The full-bleed closer scene fades _to_ full-pastel from cream, holds for the
  closer's duration, fades back to cream on exit.

**Sound design (passed to audio phase, not 4b worker — note here for completeness)**

- Soft paper / page-turn foley on scene transitions.
- Low ambient pad, no percussion.
- Single piano note on drop-cap reveal or stat-counter peak. No risers, no
  swells, no woodwinds — the register is "essay read aloud at a kitchen table".

## §I Page-level CSS (makes design.html itself read as soft-editorial)

```css
body {
  background: var(--paper-anchor);
  color: var(--ink);
}
.title-card {
  padding: 120px 0 80px;
  border-bottom: var(--rule-dashed);
}
.title-display {
  font-style: italic;
  max-width: var(--measure-display);
  font-weight: 500;
}
.ds-section {
  border-top: var(--rule-dashed);
  padding: 96px 0;
}
.type-card,
.voice-pair,
.comp-card {
  background: var(--surface-card) !important;
  border: none !important;
  border-radius: var(--radius-card-sm) !important;
  box-shadow: none !important;
  margin: 24px 0 !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border: none !important;
  border-radius: var(--radius-card-sm) !important;
  box-shadow: none !important;
}
.comp-head {
  background: transparent !important;
  border-bottom: var(--rule-dashed) !important;
}
.ds-code {
  background: rgba(255, 255, 255, 0.65);
  border: var(--rule-dashed);
  border-radius: var(--radius-card-sm) !important;
}
h2 {
  font-style: italic;
  font-weight: 500;
}
.eyebrow {
  font-family: "Work Sans", sans-serif;
  text-transform: none;
  letter-spacing: -0.005em;
}
```
