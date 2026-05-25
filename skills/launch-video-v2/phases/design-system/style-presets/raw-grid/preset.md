```preset-meta
{
  "name": "raw-grid",
  "label": "Raw Grid",
  "fingerprint": {
    "shadow": "hard-offset-zero-blur",
    "border": "hairline-3px-mono",
    "motion": "direct-no-overshoot",
    "density": "medium",
    "contrast": "high-with-pastel-warmth",
    "type": "system-sans-uppercase",
    "palette-mode": "open"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur",    "weight": 0.30 },
    { "kind": "thick_solid_border",  "weight": 0.20 },
    { "kind": "low_saturation",      "weight": 0.20 },
    { "kind": "minimal_decoration",  "weight": 0.10 }
  ]
}
```

## §A Director's intent

Border-as-layout neobrutalism. 3px solid ink lines wall off every region with **zero gaps** — borders meet edge-to-edge and the line itself is the grid system. Cards, tables, stats, bars all share the same hairline frame; the rhythm is "rectangle next to rectangle, separated by a black hair."

Display type is **system sans (Segoe UI / system-ui)** at weight 900 uppercase with negative tracking. Body is the same family at weight 500 sentence case. The weight ladder (900 / 800 / 700 / 500) is the only typographic tool — no italics, no underlines, no decorative faces. The class prefix is `rg-` (raw-grid initialism, 3 chars).

Depth is **hard offset shadow** — `6px 6px 0 var(--ink)` or `4px 4px 0 var(--ink)`, solid ink, zero blur, fixed bottom-right offset. Soft shadows do not exist here.

**Brand DNA drives accent surfaces, preset drives structure.** Two muted pastel accents (`--brand-primary` / `--brand-secondary`) are region fills only — never text. `--ink` (black) carries all headlines, body text, borders, label fills, and shadows. `--canvas` (white) is the default background. Text never inverts over accent surfaces; only over the ink-black surface does white text appear.

**Signature moves**: black-pill `chip` labels with white uppercase text, `→`-arrow prefix on CTAs and interactive rows, oversized decorative numerals at 0.15-0.35 opacity sitting behind card content as wallpaper, bordered horizontal bar meters with pink/sage/black fills, zebra-striped comparison tables with ink-black headers.

**Best for** sites with muted or pastel palettes that want to read as scrappy-confident — startup pitches, accelerator demos, indie launches, brand decks, creator portfolios. The aesthetic survives saturated brand DNA but loses some of its pastel warmth; very dark brand palettes will struggle against the white canvas default.

**Atmosphere is the absence of atmosphere.** No scanlines, no grain, no gradients, no glows. The borders carry the whole visual identity. Adding ambient decoration reads as broken.

## §B Decoration tokens (merge into design.html `:root`)

Raw Grid declares **structural** tokens here (hairline border, hard offset shadows, fixed gap scale, decorative numeral opacity). Color is sourced from site brand DNA — `--brand-primary` / `--brand-secondary` flow through component CSS as accent surface fills; `--ink` and `--canvas` carry structure and ground.

No literal hex declarations are required — the muted-pastel character is delegated to brand DNA. If brand DNA arrives saturated, the system still reads as Raw Grid because the borders, shadows, and uppercase weight-900 type carry the identity regardless of accent hue.

```css
/* Hairline border — the entire layout system is 3px solid ink */
--rg-border: 3px solid var(--ink);

/* Hard offset shadows — solid ink, zero blur, fixed bottom-right */
--rg-shadow: 6px 6px 0 var(--ink);
--rg-shadow-sm: 4px 4px 0 var(--ink);

/* Fixed gap scale — borders separate regions, gaps live inside cells only */
--rg-pad-lg: clamp(32px, 4vw, 64px);
--rg-pad-md: clamp(20px, 2.5vw, 40px);
--rg-pad-sm: clamp(12px, 1.5vw, 20px);
--rg-gap-lg: clamp(24px, 3vw, 48px);
--rg-gap-md: clamp(16px, 2vw, 32px);
--rg-gap-sm: clamp(8px, 1vw, 16px);

/* Decorative-numeral wallpaper opacity range */
--rg-numeral-opacity: 0.2;
--rg-quote-opacity: 0.15;
--rg-ordinal-opacity: 0.35;

/* Decorative rule-stub dimensions */
--rg-rule-len: 60px;
--rg-rule-thick: 4px;

/* Gray tertiary fill — derived from canvas, not from brand DNA */
--rg-gray: color-mix(in srgb, var(--ink) 4%, var(--canvas));
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Raw Grid's aesthetic argument is "this is the user's actual system font." If brand DNA ships a Google Font, keep it — preset only enforces the weight ladder (900 / 800 / 700 / 500) and uppercase rule via §C. If brand fonts fail, fall back to the system sans stack below; do NOT load a display face just to fill the slot.

- **display**: `'system-ui'` · `'Segoe UI'` · `'Inter'` wght 900
- **body**: `'system-ui'` · `'Segoe UI'` · `'Inter'` wght 500
- **mono**: `'ui-monospace'` · `'SF Mono'` · `'JetBrains Mono'` wght 700

## §E Motion (GSAP consts — REPLACES site ease)

Template ships **zero @keyframes** — slides themselves are static; only the inline keyboard navigator transitions between them. EASE/DUR are derived from the template's voice register per §8.4: "direct, modern, no-nonsense, graphic" → `power3.out` / `power4.out` family, no overshoot, no bounce.

```js
const EASE = {
  entry: "power3.out", // direct arrival, no overshoot — borders don't bounce
  emphasis: "expo.out", // hard hit for stat reveals, bar fills, numeral wallpaper
  exit: "power2.in", // accelerate off
  drift: "sine.inOut", // only for the rare ambient layer (bar-fill width tween)
};
const DUR = {
  snap: 0.16,
  med: 0.42,
  slow: 0.85,
};
// RULE: never back.out / elastic / bounce on primary motion. Raw Grid is graphic-confident,
//       not playful — overshoot reads as a different system.
// RULE: bar-meter width fills use power3.out at DUR.med; the bar is data, not personality.
// RULE: decorative wallpaper numerals fade in at DUR.snap on opacity only — never tween
//       position, scale, or rotation on the wallpaper layer.
// RULE: transitions between scenes are hard cuts. No crossfade, no slide.
```

### §E.5 Motion choreography

**Allowed primitives**

- Hard cut between scenes (no crossfade, no slide, no blur).
- Direct arrival on hero text (power3.out at DUR.med) — no overshoot, no glide.
- Hard-hit emphasis on stat numerals (expo.out at DUR.snap).
- Bar-meter width fill (power3.out at DUR.med, 0% → target width).
- Decorative-numeral wallpaper fade-in (opacity 0 → 0.2-0.35 at DUR.snap, opacity only).
- Arrow-prefix translateX nudge on CTA emphasis (±2px at DUR.snap, optional beat accent).

**Forbidden**

- Crossfade, dissolve, blur transitions.
- back.out, elastic, bounce easing — at all.
- Soft / blurred drop shadows — only hard offset 4px/6px.
- Border-radius animations (corners stay square, period).
- Gradient fills on accent surfaces — pink and sage are flat color blocks.
- Rotation on any element. Strict orthogonality is the system.

**Stagger budget**

100-150ms between elements. Faster than editorial (200-280ms), slower than 8-bit-orbit (80-120ms). Total scene-in stagger ≤ 600ms.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip filler ("really", "very", "just"), keep declarative verbs and concrete nouns
2. Hero headlines: 1-3 words MAX, UPPERCASE, period-separated for emphasis (`CITIES. STARTUPS.`)
3. Chip / label / pill text: UPPERCASE with 0.08em tracking, weight 800 — short noun phrases (max 4 words)
4. Body copy: sentence case, weight 500, one or two declarative sentences — no exclamation, no hedging
5. Stats: bare numeric + UPPERCASE caption (e.g. `+47%` / `YEAR OVER YEAR GROWTH`), no full sentences
6. CTAs: arrow-prefixed (`→ GET STARTED NOW`), UPPERCASE, verb-first imperative

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`TEAMS. SHIP.` / chip=`REAL-TIME` / cta=`→ START FREE` / body=`Design together, ship faster.`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- White canvas + ink-bordered cells is the default ground — most scenes anchor here.
- Accent-surface scenes use a single pastel (`--brand-primary` OR `--brand-secondary`) as the dominant region fill, paired with white as the contrasting region.
- Ink-black surface scenes are rare and high-impact — use for image-paired scenes or single closing-statement beats. Text inverts to white on ink only.
- Alternate white → accent → white across the video. Two consecutive accent-heavy scenes desaturate the brutalist contrast.

**Border-as-layout principle (non-negotiable)**

- Every structural division uses `var(--rg-border)` (3px solid ink).
- Regions meet **edge-to-edge** at the border. No `gap` between bordered cells. No margin between adjacent regions. The 3px line itself is the separator.
- Internal padding (`--rg-pad-*`) provides breathing room **inside** a cell. Outside, the border does the work.
- Border weight is fixed: 3px for structural, 4px only for the decorative line-stub (`divider-loud`) and for inverted borders on ink-black surfaces. Never colored, never dashed, never thinner.

**Hero text and headlines**

- One headline tier per scene. Either a `display` (cover scenes) OR a `headline` (interior scenes) — never both.
- Hero color is `var(--ink)` on white/accent surfaces, `var(--canvas)` on ink-black surfaces. Headlines NEVER appear in brand-primary or brand-secondary — pastels are surfaces, not text.
- Hero takes ≥ 45% canvas width on cover scenes, ≥ 35% on interior scenes.
- Display gets period-separated word fragments (`CITIES.<br>STARTUPS.`) for the brutalist staccato cadence.

**Brand color placement (role contract)**

- `--brand-primary` and `--brand-secondary` are **accent surface fills only** — region backgrounds, bar-meter fills, alternating cards. Never used as text color.
- `--ink` carries all text, borders, label fills, shadows. `--canvas` is the ground.
- When two accent regions appear adjacent, pair primary with secondary (warm/cool balance) rather than doubling on one. A scene with two primary-fill cells reads as monotonal.
- `--rg-gray` (4% ink tint of canvas) is the tertiary neutral fill — use for table zebra rows and de-emphasized cards.

**Decorative-numeral wallpaper (signature)**

- Cards that carry a numerical identity (step ordinal, section number, opening quote-mark) get an oversized weight-900 numeral at 0.15-0.35 opacity behind the content.
- The wallpaper numeral fills the upper portion of the card; the actual title sits in front at full opacity. No z-index trickery — DOM order is enough.
- Use `--rg-ordinal-opacity` (0.35) for card-ordinal style, `--rg-numeral-opacity` (0.20) for step numbers, `--rg-quote-opacity` (0.15) for the giant opening-quote mark.

**Transitions between scenes**

- Hard cut. Pair with a single percussive hit on the cut frame if you need a beat between scenes.
- NEVER crossfade, slide, blur, or zoom-between-scenes. The brutalist identity dies in a crossfade.

**Sound design (passed to audio phase)**

- Single percussive hit (kick or wood-block) on hero entry.
- Soft tick on chip / stat reveal.
- Hard cut between scenes = single hit on the cut frame, then silence into the next scene's hero.
- No swells, no pads, no ambient drones.

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as raw-grid)

```css
/* Raw Grid page chrome — applied to design.html itself */
body {
  background: var(--canvas);
}
.title-card {
  background: var(--canvas);
  border-bottom: var(--rg-border);
  padding: 96px 0 80px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.brand-name,
.style-name {
  font-weight: 900;
}
.ds-section {
  border-top: var(--rg-border);
  padding: 80px 0;
}
h2 {
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.eyebrow {
  color: var(--ink);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
/* Cards / panels get the bordered-rectangle treatment */
.dna-swatch,
.type-card,
.voice-pair,
.comp-card {
  border: var(--rg-border) !important;
  border-radius: 0 !important;
  box-shadow: var(--rg-shadow);
}
.comp-card {
  margin: 32px 0 !important;
  overflow: visible !important;
}
.comp-head {
  background: var(--ink) !important;
  color: var(--canvas) !important;
  border-bottom: var(--rg-border) !important;
}
.comp-head .comp-name,
.comp-head .comp-marker {
  color: var(--canvas) !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ds-code {
  background: var(--canvas) !important;
  border: var(--rg-border);
  border-radius: 0 !important;
  color: var(--ink) !important;
}
```
