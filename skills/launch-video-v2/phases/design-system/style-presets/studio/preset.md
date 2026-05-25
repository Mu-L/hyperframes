```preset-meta
{
  "name": "studio",
  "label": "Studio",
  "fingerprint": {
    "type": "graphic-mass-grotesque",
    "weight": "max-only-900",
    "case": "uppercase-non-negotiable",
    "palette": "binary-plus-opacity",
    "depth": "flat-severe",
    "rule": "hairline-and-2px-only"
  },
  "match_signals": [
    { "kind": "condensed_display", "weight": 0.25 },
    { "kind": "hairline_border", "weight": 0.2 },
    { "kind": "minimal_decoration", "weight": 0.2 },
    { "kind": "low_saturation", "weight": 0.05 }
  ],
  "best_for": ["creative agencies", "fashion brands", "studios", "manifesto pages", "art-directed declarative product launches"],
  "avoid_for": ["quiet institutional registers", "decoration-expecting contexts", "warm consumer", "soft lifestyle"]
}
```

## §A Director's intent

Type-as-graphic-mass agency manifesto. One typeface (Barlow), one weight (900), strict uppercase, at scales so large that letterforms stop reading as type and start reading as geometric blocks. The headline IS the design — there are no decorative elements, no ornaments, no third color.

**Binary surface system.** Every scene is either a dark canvas (`var(--canvas)`) with brand-color type, or a brand-color canvas (`var(--brand-primary)`) with dark type. Same brand color, two roles: foreground on dark, environment on light. No third color, no greys — secondary text is the surface accent at 58–62% opacity.

**Brand DNA drives the accent, preset drives the structure.** The single brand color (`--brand-primary`) does double duty as type on dark and ground on light. Other brand colors (`--brand-secondary` / `--brand-accent`) are kept out of the main type system — at most they appear as a single chart-highlight bar or a divider rule. Dilution kills the binary register.

Depth is severely flat: zero shadows, zero rounded corners, zero gradients. Only two rule weights exist — 1px hairlines for chrome separation, 2px solid for anchors (stat-card tops, compare dividers, chart baselines). Body bullets are em-dashes in the surface accent — never dots.

Motion is editorial-sharp: agency urgency, not editorial grace. Short, decisive `power3.out` / `expo.out` entries; never overshoot, never bounce. The type is already loud — motion stays subordinate. Scene transitions are clean reveals (`clip-path` reveal-right matches the template's signature).

**Best for** sites that want to feel art-directed, design-led, declarative — creative agencies, fashion brands, studios, manifesto pages. **Avoid for** quiet/institutional registers and anything where decoration is expected; Studio refuses to decorate.

Class prefix: `sd-` (Studio Design, 3 chars).

## §B Decoration tokens (merge into design.html `:root`)

Studio declares **structural** tokens only — rule weights, padding scale, opacity tiers, type scale anchors. Color is sourced from site brand DNA: `--brand-primary` plays the dual surface/accent role, `--canvas` is the dark base, `--ink` is reserved for body text on the wrong-contrast surface. No hex literals required — Studio's identity is structural, not chromatic.

```css
/* ── Rule weights ─────────────────────────────────────────── */
/* The system has exactly two: hairline (chrome separation) and heavy (anchor) */
--rule-hairline: 1px;
--rule-heavy: 2px;

/* ── Opacity tiers ────────────────────────────────────────── */
/* Studio has no greys — muting is opacity-only on the surface accent. */
--tier-2: 0.58; /* secondary text on dark (yellow at 58%) */
--tier-3: 0.32; /* tertiary text on dark */
--tier-2-light: 0.62; /* secondary text on light (near-black at 62%) */
--tier-3-light: 0.35; /* tertiary text on light */
--border-dark-opacity: 0.18; /* hairline borders on dark surfaces */
--border-light-opacity: 0.18; /* hairline borders on light surfaces */

/* ── Spacing ──────────────────────────────────────────────── */
/* Studio pads tighter than editorial — type runs to the edge. */
--pad-x: 5vw;
--pad-y: 5vh;
--gap-lg: 3.5vh;
--gap-md: 2vh;
--gap-sm: 1vh;

/* ── Type scale anchors ───────────────────────────────────── */
/* Scene workers reference these via clamp(); never hard-code px at display scale. */
--sz-display: 12vw; /* cover hero */
--sz-h1: 7.5vw; /* chapter / statement */
--sz-h2: 4.8vw; /* section headline */
--sz-h3: 2.8vw; /* sub-headline */
--sz-quote: 3.8vw; /* uppercase pull-quote */
--sz-stat: 5.5vw; /* stat numeral */
--sz-lead: 1.6vw;
--sz-body: 1.15vw;
--sz-caption: 0.85vw;
--sz-label: 0.72vw; /* mono chrome */

/* ── Display tracking ─────────────────────────────────────── */
/* Negative tracking on display weights is what compresses Barlow 900 into a block. */
--track-display: -0.02em;
--track-h2: -0.01em;
--track-stat: -0.03em;
--track-label: 0.06em; /* mono labels — positive tracking */

/* ── Surface-aware ink mixes ──────────────────────────────── */
/* Muted text uses opacity on the surface accent, not a separate grey. */
--ink-dark-2: color-mix(in srgb, var(--brand-primary) 58%, transparent);
--ink-dark-3: color-mix(in srgb, var(--brand-primary) 32%, transparent);
--ink-light-2: color-mix(in srgb, var(--canvas) 62%, transparent);
--ink-light-3: color-mix(in srgb, var(--canvas) 35%, transparent);

/* Hairline border tints — dark border on light, light border on dark. */
--border-on-dark: color-mix(in srgb, var(--brand-primary) 18%, transparent);
--border-on-light: color-mix(in srgb, var(--canvas) 18%, transparent);
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Studio's identity depends on a heavy grotesque at weight 900. If the brand-derived display font isn't on Google Fonts, the fallback walks heavy contemporary grotesques. Mono is reserved exclusively for metadata chrome — never headlines, never body.

- **display**: `'Barlow'` · `'Archivo'` · `'Inter'` wght 900
- **body**: `'Barlow'` · `'Archivo'` · `'Inter'` wght 400
- **mono**: `'IBM Plex Mono'` · `'JetBrains Mono'` · `'Space Mono'` wght 500

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "expo.out", // sharp deceleration — agency urgency, never overshoot
  emphasis: "power3.out", // declarative emphasis without bounce
  exit: "power2.in", // accelerate off — clean exits
  drift: "sine.inOut", // reserved for ambient only (Studio rarely uses ambient)
};
const DUR = {
  snap: 0.18,
  med: 0.45,
  slow: 0.85,
};
// RULE: NEVER use back / elastic / bounce eases. Studio's voice is declarative,
//       not playful — overshoot reads as undisciplined.
// RULE: clip-path reveal-right / reveal-left is the signature entry for headlines.
//       Animate inset(0 100% 0 0) → inset(0 0% 0 0) with EASE.entry over DUR.med.
// RULE: stagger budget 80–180ms between elements (template's 0.08s / 0.18s /
//       0.30s / 0.44s ladder). Total scene-in stagger ≤ 600ms.
// RULE: scene transitions stay clean — short fade or hard cut. NEVER zoom, blur,
//       slide-between-scenes. Editorial discipline.
// RULE: no rotation on hero text. Barlow 900 is a graphic block; rotating it
//       breaks the block-as-shape reading.
```

### §E.5 Motion choreography

**Allowed primitives**

- `fade-up` (opacity 0 + translateY 28px → 0 / opacity 1) on headlines + body.
- `fade-in` (opacity 0 → 1) on chrome labels + metadata + image placeholders.
- `reveal-right` / `reveal-left` (clip-path inset reveal) on display headlines + heavy rules — Studio's signature.
- `scale-in` from 0.94 → 1 on stat-card numerals (subtle; never below 0.9).
- Brief settle on stat numerals — counter up with `power3.out`, no spring.

**Forbidden**

- back / elastic / bounce — any overshoot. Period.
- Rotation on type (Barlow 900 is a graphic block; rotation breaks the reading).
- Blur, glow, drop-shadow filters. Studio is severely flat.
- Crossfade between scenes longer than 200ms — agencies cut hard.
- Animating padding / margin — destabilises the type-edge tension. Animate transform / opacity / clip-path only.
- Staggers > 200ms between siblings — drags pacing past "agency urgency".

**Stagger budget**

80–180ms between siblings. Total scene-in stagger ≤ 600ms. Faster than 8-bit-orbit, faster than editorial.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Studio's typographic identity is uppercase Barlow 900. Take the brand's product description / value prop and transform with:

1. Strip articles, connectives, hedges ("the", "a", "of", "really", "just", "very").
2. UPPERCASE every headline, chapter label, stat label, quote, button. No exceptions.
3. Hero / statement headlines: 3–7 words, one strong sentence ending without punctuation, or a question ending with `?`. Never a period at end of display type.
4. Chapter / section labels: `NN / TITLE` format — two-digit chapter number, slash, uppercase title (mono).
5. Stat numerals: bare numeric + optional `+` / `M` / `%` suffix (e.g. `200+`, `4M`, `99%`). Stat label below in sentence-case Barlow 500.
6. Body / lead paragraphs: sentence case, terse, max 2 sentences. Studio is sparse — body never carries more than one idea.
7. Quote bodies: UPPERCASE, no quote marks, end with period or em-dash. Attribution in mono uppercase below.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`TEAMS BUILD TOGETHER` / chapter-label=`01 / DESIGN` / stat=`4M / TEAMS` / cta-label=`START`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Two surfaces only: `dark` (canvas-based) and `light` (brand-primary-based). Alternate freely; both are first-class. Two consecutive dark scenes = quiet section, then a single light scene as punctuation.
- Dark scene: `background: var(--canvas)`, headlines in `var(--brand-primary)`.
- Light scene: `background: var(--brand-primary)`, headlines in `var(--canvas)`.
- Never mix the two on one scene (no two-tone splits, no diagonal). The whole canvas is one surface.

**Hero / display text**

- One display-tier headline per scene (4.8vw and above). Display takes 60–95% canvas width.
- Display headline ALWAYS uses Barlow 900, uppercase, negative tracking ≥ -0.01em. Weight 800 or 700 at display scale breaks the type-as-graphic-mass effect.
- Display headlines are always in the surface accent — never muted, never a third color.

**Brand color placement (role contract)**

- `--brand-primary` is the **dual-role color** — type on dark, surface on light. This is the binary.
- `--brand-secondary` and `--brand-accent` are **kept off the main type system**. Use them only for chart-highlight bars or as the single accent rule on a divider — and only once per scene.
- Body / lead text uses the surface accent at 58–62% opacity (`--ink-dark-2` / `--ink-light-2`). Never a separate grey color.
- The em-dash bullet marker carries the surface accent at full opacity — never muted.

**Rule weights**

- 1px hairline (`--rule-hairline`) — chrome separation, foot bar, compare panel cross-rules, hairline borders.
- 2px solid (`--rule-heavy`) — stat-card top rules, compare-panel vertical divider, chart baseline, divider-loud. The 2px rule is the system's "anchor" weight — reserve it for elements that should read as structural, not decorative.
- No dashed, no dotted. No widths between 1px and 2px.

**Density philosophy**

- Sparse by design. A statement scene = one headline filling 80% width, 50–60% empty surface above. A chapter scene = small mono label + one massive title.
- Don't fill more than ~60% of any scene with content. Empty surface IS structural — Studio reads as broken when crowded.
- Padding: `5vw` horizontal, `5vh` vertical. Tighter than editorial. Display type runs near the edge; do not pad it generously.

**Mono metadata role**

- IBM Plex Mono is used ONLY for: chrome labels, slide counters (if shown), chapter numbers, stat notes, cover-meta lockup, captions on image placeholders. Tracking 0.06em, uppercase.
- Barlow in metadata roles = wrong. Mono in headline roles = wrong. The face split is absolute.

**Transitions between scenes**

- Clean short fade (≤ 200ms) or hard cut. NEVER zoom-between-scenes, NEVER slide horizontal (the source template's deck-strip slide is navigation chrome, not scene-to-scene transition for video).
- Reveal-right / reveal-left clip-path is for intra-scene element entry, not scene-to-scene.

**Sound design (passed to audio phase)**

- Subtle low-end thud on display headline arrival (paper-slam, not bass-drop).
- Tick on chapter-label / chip reveal — short, dry, no reverb.
- No music swells, no whooshes. Studio's audio register matches its type register: declarative, terse.

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as Studio)

```css
body {
  background: var(--canvas);
  color: var(--brand-primary);
  font-family: "Barlow", "Inter", sans-serif;
}
.title-card {
  background: var(--canvas);
  border-bottom: 2px solid var(--brand-primary);
  padding: 80px 0 64px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: -0.02em;
  font-weight: 900;
  color: var(--brand-primary);
}
.brand-name,
.style-name {
  color: var(--brand-primary);
  font-weight: 900;
  text-transform: uppercase;
}
.ds-section {
  border-top: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  padding: 64px 0;
}
h2 {
  text-transform: uppercase;
  letter-spacing: -0.01em;
  font-weight: 900;
  color: var(--brand-primary);
}
.eyebrow {
  font-family: "IBM Plex Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--brand-primary) 58%, transparent);
  font-weight: 500;
}
.type-card,
.voice-pair,
.comp-card {
  background: var(--canvas) !important;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.comp-head {
  background: var(--canvas) !important;
  color: var(--brand-primary) !important;
  border-bottom: 2px solid var(--brand-primary) !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: "IBM Plex Mono", monospace;
}
.ds-code {
  background: var(--canvas) !important;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 32%, transparent);
  border-radius: 0 !important;
  color: var(--brand-primary) !important;
}
```
