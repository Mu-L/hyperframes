```preset-meta
{
  "name": "editorial-forest",
  "label": "Editorial Forest",
  "fingerprint": {
    "voice": "literary-quarterly",
    "type": "serif-500-with-opsz",
    "chrome": "mono-uppercase-tracked",
    "depth": "flat-paper-no-shadow",
    "palette": "tri-tone-forest-pink-cream",
    "motion": "quiet-committed"
  },
  "match_signals": [
    { "kind": "serif_display", "weight": 0.35 },
    { "kind": "minimal_decoration", "weight": 0.2 },
    { "kind": "low_saturation", "weight": 0.15 },
    { "kind": "medium_solid_border", "weight": 0.15 }
  ]
}
```

## §A Director's intent

Editorial Forest reads like a Penguin classic or a quiet annual report — a serif voice committed to one face (Source Serif 4 at weight 500, with the optical-size axis engaged) and a mono chrome that frames every page (JetBrains Mono UPPERCASE with 0.14em–0.18em tracking). Depth is flat: no drop shadows, no glows, no gradients, ever. Elevation is communicated by color-block contrast, 2px hairline rules, and the difference between a filled tile and a bordered one. The palette is a tight tri-tone — deep forest green, dusty rose pink, oat cream paper — and the brand colors map onto those roles via `--brand-primary` / `--brand-secondary` / `--canvas`. Every scene carries a topbar (mono label + monogram or counter) as the editorial spine. Motion is quiet and committed: nothing bounces, nothing snaps; entries glide, emphasis settles, ambient layers breathe. Best for: warm, unhurried product stories, research recaps, studio updates. Avoid for: urgent, sales-driven, or punchy registers — the rhythm is intentionally slow. **Class prefix: `ef-`.**

## §B Decoration tokens

```css
/* Editorial Forest: flat, paper-based. No shadows. Rules + color blocks only. */
--ef-rule-weight: 2px;
--ef-rule-weight-card: 2.5px;
--ef-radius-tile: 6px;
--ef-radius-step: 8px;
--ef-radius-bar: 3px 3px 0 0;
--ef-radius-swatch: 2px;
--ef-monogram-size: 130px;
--ef-pad-default: 96px 120px;
--ef-pad-wide: 100px 140px;
--ef-pad-statement: 130px 160px;
--ef-gap-grid: 1.5vw;
--ef-gap-stack: 1.6vw;
--ef-track-label: 0.18em;
--ef-track-caption: 0.14em;
--ef-track-axis: 0.08em;

/* Brand-aware palette derivatives (no raw hex — all roles come from brand DNA) */
--ef-green-deep: color-mix(in srgb, var(--brand-primary) 88%, #000 12%);
--ef-green-lite: color-mix(in srgb, var(--brand-primary) 78%, #fff 22%);
--ef-pink-deep: color-mix(in srgb, var(--brand-secondary) 85%, #000 15%);
--ef-cream-2: color-mix(in srgb, var(--canvas) 92%, var(--brand-primary) 8%);
--ef-ink-soft: color-mix(in srgb, var(--ink) 92%, transparent);

/* Region-accent rule color (used by .ef-rule-thin) — green on cream, pink on green */
--ef-rule-accent: var(--brand-primary);
```

## §D Font pairing fallback

- **display**: `'Source Serif 4'` · `'Source Serif Pro'` · `'Fraunces'` · `'Spectral'` wght 500
- **body**: `'Source Serif 4'` · `'Source Serif Pro'` · `'Spectral'` · `'Newsreader'` wght 400
- **mono**: `'JetBrains Mono'` · `'IBM Plex Mono'` · `'Space Mono'` wght 500

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Editorial Forest motion: quiet, committed, unhurried.
// The system reads as paper-on-projector; motion must match that register.
const EASE = {
  entry: "power3.out", // glide in, no overshoot — a page settling onto the desk
  emphasis: "expo.out", // decisive but smooth — a numeral landing
  exit: "power2.in", // quiet leave, no snap
  drift: "sine.inOut", // ambient breath for the monogram circle / hairline rule
};

const DUR = {
  snap: 0.18, // mono labels, topbar entry, hairline rule reveal
  med: 0.5, // serif headline mass-in, tile fill-up
  slow: 0.9, // hero display headline, stat numeral count-up
};

// RULE: never use back/elastic/bounce — overshoot breaks the editorial register
// RULE: do not animate box-shadow (system is shadow-free; tweening shadow adds shadow)
// RULE: serif headlines reveal by mass-in (opacity + y: 12px → 0), not by char/word stagger
// RULE: mono labels enter via clip-path reveal (left-to-right wipe) at DUR.snap
// RULE: hairline rules draw left-to-right via scaleX 0→1 with transform-origin: left
// RULE: monogram circle uses EASE.drift for a slow 4s breath (scale 1 → 1.03 → 1, loop)
// RULE: stat numerals count-up with EASE.emphasis over DUR.slow; no character-stagger
```

### §E.5 Motion choreography

- **Allowed primitives**: opacity fade-up (y: 12–20px), clip-path wipe (mono labels, hairline rules), scale-breath (monogram only), numeric count-up (stat figures).
- **Forbidden gestures**: tilt/rotate (the page is paper, not a card), bounce/elastic, snap-in with overshoot, char-by-char letter scrambles, color-shift on entry (the palette is committed; entries don't recolor).
- **Transition defaults**: scenes cross-fade at DUR.med with no spatial motion — the page changes, the camera doesn't. Only exception: cover → first content scene may use a 1.2s vertical lift on the hero headline (translateY -8px).
- **Type-in-motion**: serif display headlines enter as a single block (opacity 0 → 1, y: 16 → 0) at DUR.slow with EASE.entry. Mono labels enter at DUR.snap as a left-to-right wipe (`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`). Body paragraphs enter at DUR.med, simple opacity, no y-offset.
- **Stagger budget**: stagger between topbar elements is 0.04s; between tile grid items is 0.08s; between KPI row items is 0.15s. Never stagger characters within a word.

## §G Voice transform recipe

1. Strip filler ("really", "actually", "very") but keep articles ("the", "a") — editorial voice keeps sentence flow.
2. Prefer noun-phrase headlines over verb-led clauses; end with a period or em-dash, never an exclamation.
3. For mono labels (eyebrow / kicker / foot / caption): UPPERCASE, max 4 words, no terminal punctuation, use `·` (middle dot) or `&middot;` between meta items.
4. For serif display headlines: sentence case, drop terminal period when ≤ 8 words.
5. Use em-dash `—` for editorial pause, not double hyphens.
6. Brand name belongs in the mono topbar label or footline — never in the display headline. The headline carries the idea; the chrome carries the byline.

**Example:**

- IN: `Acme is a really fast way for teams to ship products together in real time, with AI in the loop.`
- OUT (display headline, serif sentence case): `Ship faster — together, with AI in the loop`
- OUT (mono topbar label): `ACME &middot; PRODUCT NOTE 01`
- OUT (mono footline): `ACME 2026 &middot; PRESENTED BY THE STUDIO`

## §H Scene composition hints

- **One subject per scene.** Cramming two competing content blocks reads as broken. If you have two ideas, split the scene.
- **Surface alternation.** Pick a single dominant surface per scene from { `var(--canvas)`, `var(--brand-primary)`, `var(--brand-secondary)` }. Two surface colors per scene maximum; three is loud. Default: `var(--canvas)` for content-heavy scenes, `var(--brand-primary)` for cover / statement / KPI / summary.
- **Brand-color role contract.**
  - On `var(--canvas)` surface: headline color = `var(--brand-primary)`; body = `var(--ink)`; mono label = `var(--brand-primary)`.
  - On `var(--brand-primary)` surface: primary headline = `var(--canvas)`; hero-scale headline = `var(--brand-secondary)`; body = `var(--canvas)`; mono label = `var(--brand-secondary)`.
  - On `var(--brand-secondary)` surface: headline = `var(--ef-green-deep)`; body = `var(--ef-green-deep)`; mono label = `var(--ef-green-deep)`.
- **Topbar is the spine.** Every scene carries a topbar at the top edge (mono label on the left, monogram or counter on the right). Without it, the scene loses its editorial anchor.
- **Footline is reserved.** Cover, statement, KPI, and summary scenes get a footline; routine content scenes don't.
- **Padding ladder.** Use `--ef-pad-default` (96px 120px) for most scenes; `--ef-pad-wide` (100px 140px) for cover / summary; `--ef-pad-statement` (130px 160px) for the pull-quote moment.
- **Hairline rules.** 2px solid in the region's accent color. Section separators above KPI rows and meta-dls always use a hairline. Never 1px (reads web-app), never 3px+ (reads poster).
- **Card radii.** 6px for topic tiles, 8px for step tiles, 50% for the monogram circle. Do not introduce a fourth radius.
- **Display type ladder.** Hero / cover / closing = 220px serif. Pull-quote = 140px serif. Primary section headline = 96px on cream, 84px on green. Stat figure = 220px (with 110px unit). Card title = 56–84px depending on tile prominence. Body = 26–32px serif weight 400. Never invent a size between rungs.
- **Sound-design hooks.** Quiet — soft page-turn paper rustle on scene transitions, low piano single-note on KPI numeral landing, no synth or impact stings.
- **Forbidden shapes.** No drop shadow, no inner shadow, no gradient surface, no glass blur, no italics, no underline. Emphasis is communicated through size, color, and the negative space around the subject.

## §I Page-level CSS

```css
/* design.html itself reads as an editorial spread: cream paper, serif body, mono chrome.
   These styles never reach exported chunks — they style the design preview only. */
body {
  background: #efe7d4;
  color: #1a1a17;
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
}
h1,
h2,
h3,
h4 {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: #2e4a2a;
}
code,
pre,
.ds-code {
  font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
  font-size: 13px;
}
.ds-section {
  border-top: 2px solid #2e4a2a;
  padding-top: 28px;
  margin-top: 36px;
}
.ds-component-preview {
  background: #efe7d4;
  border: 2px solid #2e4a2a;
  border-radius: 6px;
  padding: 24px;
}
```
