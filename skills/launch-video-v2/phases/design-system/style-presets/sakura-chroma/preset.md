```preset-meta
{
  "name": "sakura-chroma",
  "label": "Sakura Chroma",
  "fingerprint": {
    "shadow": "hard-offset-zero-blur",
    "border": "ink-1.5px",
    "motion": "considered-paper-snap",
    "density": "catalogue-medium-high",
    "voice": "cassette-package-editorial",
    "palette-mode": "rainbow-anchored"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "medium_solid_border", "weight": 0.2 },
    { "kind": "condensed_display", "weight": 0.25 },
    { "kind": "high_sat_accent", "weight": 0.15 }
  ],
  "best_for": ["indie hardware", "music labels", "creative studios", "kawaii-tech", "magazine / zine launches", "analog product catalogues"],
  "avoid_for": ["restrained corporate", "quiet monochrome palettes", "institutional finance", "regulated industries"]
}
```

## §A Director's intent

Vintage Japanese cassette-package editorial on warm cream paper. Big Shoulders Display 900 with negative tracking carries every display moment; Albert Sans handles body; JetBrains Mono carries spec rows, chips, page-data. The aesthetic is hand-curated industrial — warm but disciplined, playful but tightly typeset, with the cassette product page as the visual metaphor.

Depth comes from **hard 8px ink-offset shadows** (zero blur), 1.5px ink borders, and **color-block layering** — diagonal multi-color ribbon bands sweeping at ±22°, petal-cluster blobs (4-5 overlapping perfect circles), 32-point starburst seals, red rectangular stamps. No blurred shadows anywhere.

**Brand DNA tints the rainbow; the rainbow is the preset's identity.** Sakura Chroma owns a six-color anchor palette (red, pink, orange, yellow, green, blue) — declared in §B as `color-mix()` anchors so brand DNA shifts the saturation/warmth without collapsing the catalogue color story. Warm cream paper (`--anchor-paper`) and warm-brown ink (`--anchor-ink`) are technical prerequisites: the 4px halftone paper-grain texture and 8px hard ink-shadow only read on this base. Without the warm-cream blackpoint, the system stops looking like a printed cassette page.

**Color role contract**: one scene = one dominant rainbow color carrying the lockup bar or stamp / topstrip / chip; ink-brown carries every headline, border, body, and shadow. Red is reserved for inline `<em>` emphasis inside display headlines and for hero numerals. Borders are always ink — colored borders do not exist.

Motion is **considered paper-snap**: power2.out entries, no overshoot (a cassette package doesn't bounce). Ambient: petal scatter drift, ribbon parallax. Type emphasis: subtle scale + opacity, never elastic. Scene transitions favor 280ms ease cross-blends (matching the template's intrinsic opacity transition) over hard cuts.

**Best for** brands with warm/medium-saturation palettes that can carry rainbow accents — indie hardware, music labels, creative studios, kawaii-tech, magazine/zine launches, analog product catalogues. Restrained corporate or quiet palettes still render but lose the catalogue-page playfulness.

**Class prefix**: `sk-` (initialism of sakura, 3 chars).

## §B Decoration tokens (merge into design.html `:root`)

Sakura Chroma declares **structural** tokens (pixel unit, shadow stack, paper-grain texture, frame insets) AND a **six-color rainbow anchor palette** as a §8.2 hue-anchor exception. The rainbow is the preset's identity — without anchored hues, dark or muted brand DNA produces muddy ribbons that break the cassette-package character. Each anchor is mixed with `var(--brand-primary)` at 30-40% so brand DNA still tints the palette toward the site's voice.

Warm-cream paper (`--anchor-paper`) and warm-brown ink (`--anchor-ink`) are technical prerequisites: the 4px halftone paper-grain (`--paper-grain`) and the 8px hard ink shadow only register on this warm base. Same precedent as liquid-glass `--liquid-bg-deep` and 8-bit-orbit `--canvas-void`.

```css
/* §8.2 exception: warm-cream + warm-brown base. Required for the paper-grain
   halftone texture and 8px hard ink-shadow to register — cool greys or pure
   blacks collapse the print-on-paper warmth that defines the system. */
--anchor-paper: #f1e6cb; /* warm cream paper canvas */
--anchor-paper-dk: #e5d6b0; /* slightly darker tonal sibling for layered surfaces */
--anchor-ink: #3a2516; /* deep warm-brown ink — borders, type, hard shadows */

/* §8.2 exception: six-color rainbow anchors. The cassette-package register
   depends on the full red/pink/orange/yellow/green/blue ladder appearing as
   petals, ribbons, topstrips, chips. Brand DNA tints these via color-mix()
   so the rainbow shifts with the site without losing its categorical hue
   identity. Saturation must stay high — muted anchors produce dishwater. */
--anchor-red: #e5392a;
--anchor-pink: #e54489;
--anchor-orange: #f09131;
--anchor-yellow: #f0bc2a;
--anchor-green: #3d9f47;
--anchor-blue: #3f8bc4;

/* Brand-tinted rainbow — each anchor pulled toward brand-primary at 30%.
   Components reference these (not the raw anchors) so brand DNA influences
   warmth/saturation. Reduce the brand-mix percentage for cooler/darker
   brands if the rainbow flattens; raise it to 40-50% for high-sat brands
   that should bleed into the rainbow more aggressively. */
--sk-red: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-red));
--sk-pink: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-pink));
--sk-orange: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-orange));
--sk-yellow: color-mix(in srgb, var(--brand-primary) 25%, var(--anchor-yellow));
--sk-green: color-mix(in srgb, var(--brand-primary) 25%, var(--anchor-green));
--sk-blue: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-blue));

/* Paper-grain halftone texture — 4px-period radial-gradient at 16% opacity.
   Required atmosphere on every scene; removing it makes the deck look like
   a flat web template. */
--paper-grain: radial-gradient(circle at 1px 1px, rgba(58, 37, 22, 0.55) 1px, transparent 1.6px);
--paper-grain-size: 4px 4px;
--paper-grain-opacity: 0.16;

/* Signature hard ink shadow — single value, zero blur. Reserved for quote
   callouts and elevated paper-on-ribbons elements. Overuse degrades it. */
--shadow-ink-hard: 8px 8px 0 var(--anchor-ink);

/* Border weights — 1.5px ink default; 2px on spec-checklist boxes; 1px
   ink-alpha hairline on ledger row body dividers. */
--border-ink: 1.5px solid var(--anchor-ink);
--border-ink-heavy: 2px solid var(--anchor-ink);
--border-ink-hairline: 1px solid color-mix(in srgb, var(--anchor-ink) 22%, transparent);
--border-ink-dashed: 1px dashed var(--anchor-ink);

/* Spacing — frame inset, card padding, grid gaps. Pixel values for fixed
   chrome, clamp() for fluid scaling. */
--frame-inset: clamp(36px, 3.6vw, 72px);
--frame-inset-bottom: clamp(72px, 7vh, 110px);
--gap-card-x: clamp(14px, 1.4vw, 20px);
--gap-card-y: clamp(16px, 1.7vw, 24px);
--gap-grid: clamp(16px, 1.6vw, 26px);
--gap-col: clamp(28px, 3vw, 56px);

/* Ribbon-band geometry — used by the diagonal ribbon-band component. */
--ribbon-band-h: clamp(40px, 6vh, 96px);
--ribbon-band-rotate: -22deg; /* +22deg variant available on .reverse */

/* 32-point starburst clip-path polygon. Hardcoded — variations in point
   count break visual cohesion across the seal-recognition signal. */
--starburst-clip: polygon(
  50% 0%,
  60% 8%,
  73% 4%,
  76% 17%,
  89% 18%,
  87% 31%,
  100% 35%,
  92% 47%,
  100% 60%,
  87% 64%,
  90% 77%,
  76% 78%,
  75% 91%,
  62% 88%,
  53% 100%,
  42% 90%,
  30% 96%,
  25% 84%,
  12% 86%,
  13% 73%,
  0% 70%,
  7% 58%,
  0% 47%,
  11% 39%,
  4% 27%,
  17% 25%,
  13% 12%,
  27% 14%,
  25% 1%,
  38% 7%
);
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Sakura Chroma's typographic identity depends on a four-face stack — condensed industrial display, neutral humanist body, monospaced data, optional Japanese accent. Fallbacks below are used only if the primary face fails to load on Google Fonts.

- **display**: `'Big Shoulders Display'` · `'Archivo Black'` · `'Oswald'` wght 900
- **body**: `'Albert Sans'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'IBM Plex Mono'` · `'Space Mono'` wght 400

## §E Motion (GSAP consts — REPLACES site ease)

Sakura Chroma's source template ships **zero content @keyframes** — only a 280ms ease opacity slide-fade for navigation chrome. EASE/DUR are therefore derived from the design.md voice register: "warm but disciplined", "playful but tightly typeset", "hand-curated industrial". That register is calm-considered, not bouncy — power2.out / power3.out for primary motion, no back-overshoot. The single 280ms ease cross-blend the template inherits maps to the scene-transition default.

```js
const EASE = {
  entry: "power2.out", // considered paper-snap — no overshoot, no bounce
  emphasis: "power3.out", // a bit more authority for hero numerals + lockup reveals
  exit: "power2.in", // accelerate off the page like a flipped catalogue spread
  drift: "sine.inOut", // petal scatter + ribbon parallax ambient
};
const DUR = {
  snap: 0.18, // chip / micro-label / stamp drop-ins
  med: 0.5, // hero text / lockup / card reveal — calm not snappy
  slow: 1.0, // ribbon sweep, petal scatter, hero numeral count-up
};
// RULE: never use back.out / elastic on display type. The cassette-package
//       voice is hand-curated industrial, not playful-bouncy.
// RULE: red emphasis-color reveal on <em> spans MUST animate color, not
//       trigger after the headline lands. The color shift IS the emphasis.
// RULE: scene transitions default to 280ms opacity cross-blend (matches the
//       template's intrinsic .slide transition). Hard cuts only on hero
//       numeral / stat-counter beats where the impact is wanted.
// RULE: petal blobs and ribbon bands drift on sine.inOut amplitude ±8-16px,
//       period 6-10s. Never tween rotation > 4deg — ribbons stay at ±22°.
```

### §E.5 Motion choreography

**Allowed primitives**

- Cross-blend (280ms opacity) between scenes; hard cut only on stat-counter beats.
- Hero entry: y +24px → 0, opacity 0 → 1, scale 0.98 → 1 on power2.out @ DUR.med.
- Inline `<em>` emphasis: animate the red color shift (not delayed reveal). Stagger 80-160ms after the parent headline lands.
- Stamp / seal: drop-in with rotate(-3deg) preserved; opacity 0 → 1 + scale 0.92 → 1 on power3.out @ DUR.snap.
- Lockup bar (pink/rainbow background): width 0 → 100% reveal on power3.out @ DUR.med, then text fades in on top.
- Petal-cluster: stagger 40-80ms per petal; each petal scales 0.6 → 1 on power2.out @ DUR.snap.
- Ribbon-band sweep: x -10% → 0 with rotate preserved on power2.out @ DUR.slow.
- Equalizer bar fill: per-column stagger 60ms; each "on" segment scaleY 0 → 1 with `transform-origin: bottom` on power3.out @ DUR.snap.
- Hero stat counter: animated count-up (0 → target) on power3.out @ DUR.slow.
- Ambient petal / ribbon drift: sine.inOut, period 6-10s, amplitude ±8-16px.

**Forbidden**

- Back / elastic / bounce eases on display type or hero numerals (breaks catalogue voice).
- Rotation animations beyond preserving the source ±3° (stamp) / ±22° (ribbon). No spinning.
- Blurred shadow tweens or filter: blur() (sakura uses zero-blur exclusively).
- Italic on emphasis — the red `<em>` color shift IS the emphasis, never `font-style: italic`.
- Slide-in transitions (translateX 100%) — use cross-blend or paper-flip register only.
- More than 5 rainbow colors on a single scene at hero size. Pick one dominant; subordinate the rest.

**Stagger budget**

160-220ms between elements (slower than 8-bit-orbit's 80-120ms — sakura is considered, not arcade). Total scene-in stagger ≤ 700ms. Hero / lockup land first; petals + ribbons last (atmosphere drops in after the focal beat).

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip filler ("really", "very", "just"); keep verbs imperative.
2. Hero display headlines: 2-5 words, **sentence case OR uppercase** depending on register — Big Shoulders Display works at both with negative tracking. Sentence case for cover/quote spreads; uppercase for manifesto / loud catalogue beats.
3. Inline emphasis inside display: wrap one keyword in `<em>` for red color shift (blue on quote spreads where red is overloaded). One emphasis per headline maximum.
4. Tracked-caps micro-labels (eyebrows, chips, meta labels): UPPERCASE with 0.16em tracking standard, 0.2em for eyebrows, 0.32em for manifesto kickers.
5. Stat numerals: bare numeric + smaller inline unit (`26K`, `61%`), unit at ~34% the numeral size in `var(--ink)`. Primary stat in red; pair with blue if a second stat appears.
6. Mono spec rows: `KEY → VALUE` lines, JetBrains Mono 400, key opacity 0.7. Treat as catalogue spec sheet, not body copy.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`Teams design <em>together</em>` / eyebrow=`REAL-TIME COLLABORATION` / stat=`4M<sub>+</sub>` (in red) / spec-row=`MODE → MULTIPLAYER`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default: warm-cream paper (`--anchor-paper`) ground with `--paper-grain` halftone overlay at 16% opacity. **Required on every scene** — removing the grain breaks the print register immediately.
- Variant: `--anchor-paper-dk` (slightly darker tonal cream) for layered half-regions or secondary panel grounds within a cream scene.
- One ink-inverted scene allowed per 6-scene video (manifesto / closing colophon): `--anchor-ink` ground with cream type. Use sparingly — the rainbow stops working on dark grounds.
- Diagonal ribbon-band scenes serve as the "atmospheric ambition" beat: cover, mid-stretch quote, closing colophon. Avoid back-to-back ribbon scenes.

**Hero text**

- Big Shoulders Display weight 900 with negative letter-spacing -0.012em to -0.025em on every display moment. Lighter tracking breaks the catalogue-front density signature.
- Hero takes ≥ 50% canvas width; pair with petal-cluster anchor or ribbon-band atmosphere, never both at hero weight.
- Inline `<em>` switches color to red (default) or blue (quote spreads where red is overloaded). Never italic.
- Hero numerals (stat-counter): 110-240px Big Shoulders 900 in `--sk-red`; inline sub-unit at 34% size in `--anchor-ink`.

**Brand color placement (role contract)**

- Borders are **always** ink (`--anchor-ink`). Colored borders do not exist.
- Body text is **always** ink (`--anchor-ink`) at 0.85-1.0 opacity. Rainbow colors never carry body copy.
- Rainbow colors appear as: petal-cluster fills, ribbon-band strips, card topstrip tabs, chip backgrounds, lockup-bar background, red-stamp body, equalizer bar fills.
- One scene = **one dominant rainbow color** carrying the lockup or topstrip; other rainbow colors appear only as petal/ribbon supporting cast.
- Red (`--sk-red`) is doubly reserved: inline `<em>` emphasis inside display + primary hero numeral. Don't dilute it as a card-topstrip on a scene that also carries a red stat.

**Paper-grain is sacred**

- The 4px-period halftone-dot texture (`--paper-grain`) at 16% opacity sits over every scene. Required.
- Period is fixed at 4px regardless of viewport. Scaling the texture period breaks the print register.

**Transitions between scenes**

- Default 280ms ease opacity cross-blend (matches the template's intrinsic `.slide` transition).
- Hard cut allowed only on stat-counter / hero-numeral beat where the impact is wanted.
- Never slide / push / blur-fade between scenes — the catalogue is page-flip register, not scroll.

**Ambient motion**

- Petal-cluster drift: sine.inOut, period 6-10s, amplitude ±8-16px on the cluster container (not per-petal). Per-petal drift breaks the overlap geometry.
- Ribbon-band parallax: sine.inOut, period 8-12s, amplitude ±12-20px on x-axis. Rotate stays locked at ±22°.
- Paper-grain stays static. Animating the grain reveals the deterministic radial-gradient tile and looks broken.

**Density philosophy**

- Catalogue register depends on visual richness — pair hero with petal anchor + spec checklist + footer micro-label, OR hero with ribbon atmosphere + stamp + page number. A scene with only a centered headline reads as manifesto (deliberate sparsity); every other scene should feel like a packed catalogue page.
- One manifesto / sparsity scene per 6-scene video. The rest carry concurrent hero + atmosphere + tabular/data + decorative marks.

**Sound design (audio phase note)**

- Soft paper-flip / shutter click on scene cross-blend.
- Small "snap" on stamp drop-in (rotated -3° lands with a tactile beat).
- Soft analog click on chip/spec reveal.
- Hero numeral count-up paired with a slow swell, not a kick.

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as sakura-chroma)

```css
body {
  background: var(--anchor-paper);
  position: relative;
}
body::before {
  /* Paper-grain halftone on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  background-image: var(--paper-grain);
  background-size: var(--paper-grain-size);
  opacity: var(--paper-grain-opacity);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: multiply;
}
.title-card {
  background: var(--anchor-paper);
  border-bottom: var(--border-ink);
  padding: 96px 0 80px;
}
.title-display {
  font-family: "Big Shoulders Display", sans-serif;
  font-weight: 900;
  letter-spacing: -0.022em;
  color: var(--anchor-ink);
}
.brand-name {
  color: var(--sk-red);
  font-weight: 900;
}
.style-name {
  color: var(--sk-blue);
  font-weight: 900;
}
.ds-section {
  border-top: var(--border-ink);
  padding: 80px 0;
}
h2 {
  font-family: "Big Shoulders Display", sans-serif;
  font-weight: 900;
  letter-spacing: -0.018em;
  color: var(--anchor-ink);
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--sk-red);
  font-weight: 700;
}
.type-card,
.voice-pair,
.comp-card {
  border: var(--border-ink) !important;
  border-radius: 0 !important;
  background: var(--anchor-paper) !important;
  box-shadow: var(--shadow-ink-hard) !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border: var(--border-ink) !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-ink-hard) !important;
}
.comp-head {
  background: var(--anchor-ink) !important;
  color: var(--anchor-paper) !important;
  border-bottom: var(--border-ink) !important;
}
.ds-code {
  background: var(--anchor-paper-dk) !important;
  border: var(--border-ink);
  border-radius: 0 !important;
  color: var(--anchor-ink) !important;
}
```
