```preset-meta
{
  "name": "neo-brutalism",
  "label": "Neo-Brutalism",
  "fingerprint": {
    "shadow": "hard-offset",
    "border": "solid-thick",
    "motion": "hit-and-stick",
    "density": "high",
    "contrast": "high"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur",    "weight": 0.30 },
    { "kind": "thick_solid_border",  "weight": 0.25 },
    { "kind": "condensed_display",   "weight": 0.15 },
    { "kind": "high_sat_accent",     "weight": 0.15 },
    { "kind": "rotated_transform",   "weight": 0.10 },
    { "kind": "bouncy_easing",       "weight": 0.05 }
  ]
}
```

## §A Director's intent

Hard edges. Declarative typography. Shadow is **weight**, not depth.
Manifesto voice. Hit-and-stick motion. No glide, no fade, no apology.
One huge thing per scene. Cut, don't crossfade.

## §B Decoration tokens (merge into design.html `:root`)

Shadow offsets and border widths stay in **px** — they're visual signatures,
not proportional spacing. A 4px border that scales would vanish on small
viewports. Only the spacing variable uses `vw`.

```css
--shadow-hard: 8px 8px 0 var(--ink);
--shadow-hover: 11px 11px 0 var(--ink);
--border-bold: 4px solid var(--ink);
--border-loud: 6px solid var(--ink);
--tilt-l: -1deg;
--tilt-r: 1deg;
--gap-loud: 1.7vw; /* ~32px on a 1920 canvas */
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

- **display**: `'Anton'` · `'Archivo Black'` · `'Space Grotesk'` wght 800
- **body**: `'Inter'` · `'IBM Plex Sans'` wght 500
- **mono**: `'Space Mono'` · `'JetBrains Mono'` wght 700

If brand fonts ARE on Google Fonts, keep brand fonts — preset only overrides weight/tracking via §C.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(2.4)", // bouncy slam-pop
  emphasis: "expo.out", // hard arrival
  exit: "power4.in", // dive off
  drift: "sine.inOut", // only for ambient breathing
};
const DUR = {
  snap: 0.18,
  med: 0.45,
  slow: 0.9,
};
// RULE: never ease-in-out for primary motion. Hit-and-stick.
// RULE: every entry has a percussive sound-design cue (see §H).
```

## §F Components (paste-ready, use brand vars from §B)

<!-- COMPONENT: hero -->

```html
<div class="bn-hero">
  <span class="bn-eyebrow">{EYEBROW}</span>
  <h1 class="bn-display">{HEADLINE}</h1>
  <p class="bn-body">{SUBHEAD}</p>
</div>
<style>
  .bn-hero {
    background: var(--canvas);
    border: var(--border-bold);
    box-shadow: var(--shadow-hard);
    padding: clamp(48px, 6vw, 96px);
    transform: rotate(var(--tilt-l));
  }
  .bn-eyebrow {
    font-size: clamp(14px, 1.4vw, 30px);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .bn-display {
    font-size: clamp(200px, 24vw, 340px);
    letter-spacing: -0.04em;
    font-weight: 800;
    line-height: 0.95;
  }
  .bn-body {
    font-size: clamp(18px, 1.8vw, 28px);
    margin-top: 24px;
    max-width: 50ch;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: chip -->

```html
<span class="bn-chip">{LABEL}</span>
<style>
  .bn-chip {
    display: inline-block;
    padding: 6px 14px;
    background: var(--brand-primary);
    color: var(--ink);
    border: var(--border-bold);
    box-shadow: 4px 4px 0 var(--ink);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: button -->

```html
<button class="bn-button">{LABEL}</button>
<style>
  .bn-button {
    background: var(--brand-accent);
    color: var(--ink);
    border: var(--border-bold);
    box-shadow: var(--shadow-hard);
    padding: 16px 32px;
    font-size: clamp(16px, 1.6vw, 22px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .bn-button:hover {
    transform: translate(-3px, -3px);
    box-shadow: var(--shadow-hover);
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: stat-counter -->

```html
<div class="bn-stat">
  <div class="bn-stat-num">{NUM}</div>
  <div class="bn-stat-label">{LABEL}</div>
</div>
<style>
  .bn-stat {
    background: var(--canvas);
    border: var(--border-bold);
    padding: 32px 24px;
    text-align: left;
  }
  .bn-stat-num {
    font-size: clamp(96px, 12vw, 180px);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }
  .bn-stat-label {
    font-size: clamp(13px, 1.3vw, 18px);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    margin-top: 12px;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: corner-pins -->

```html
<div class="bn-frame">
  <span class="bn-corner bn-tl"></span>
  <span class="bn-corner bn-tr"></span>
  <span class="bn-corner bn-bl"></span>
  <span class="bn-corner bn-br"></span>
  <!-- content goes here -->
</div>
<style>
  .bn-frame {
    position: relative;
    padding: 32px;
  }
  .bn-corner {
    position: absolute;
    width: 24px;
    height: 24px;
    background: var(--ink);
  }
  .bn-tl {
    top: 0;
    left: 0;
  }
  .bn-tr {
    top: 0;
    right: 0;
  }
  .bn-bl {
    bottom: 0;
    left: 0;
  }
  .bn-br {
    bottom: 0;
    right: 0;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: divider-loud -->

```html
<hr class="bn-divider" />
<style>
  .bn-divider {
    border: none;
    height: 6px;
    background: var(--ink);
    margin: 48px 0;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: dot-grid-bg -->

```html
<div class="bn-grid-bg"><!-- content --></div>
<style>
  .bn-grid-bg {
    background-color: var(--canvas);
    background-image: radial-gradient(var(--ink) 1.5px, transparent 1.5px);
    background-size: 32px 32px;
    min-height: 160px; /* preview only — remove or override when used full-bleed */
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: gradient-mesh-bg -->

```html
<div class="bn-mesh">
  <div class="bn-mesh-blob bn-mesh-blob-1"></div>
  <div class="bn-mesh-blob bn-mesh-blob-2"></div>
  <div class="bn-mesh-blob bn-mesh-blob-3"></div>
  <div class="bn-mesh-fg">{FOREGROUND_CONTENT}</div>
</div>
<style>
  /* Brand-color blobs blurred behind solid black foreground frame.
   Brutalism keeps blur moderate so the brand colors still punch. */
  .bn-mesh {
    position: relative;
    overflow: hidden;
    background: var(--canvas);
    border: var(--border-bold);
    box-shadow: var(--shadow-hard);
    min-height: 320px; /* preview only — drop when used full-bleed in scene */
  }
  .bn-mesh-blob {
    position: absolute;
    width: 60%;
    height: 70%;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .bn-mesh-blob-1 {
    background: var(--brand-primary);
    top: -10%;
    left: -10%;
  }
  .bn-mesh-blob-2 {
    background: var(--brand-secondary);
    bottom: -15%;
    right: -10%;
  }
  .bn-mesh-blob-3 {
    background: var(--brand-accent);
    top: 30%;
    left: 35%;
    width: 40%;
    height: 50%;
  }
  .bn-mesh-fg {
    position: relative;
    z-index: 1;
    padding: clamp(48px, 6vw, 96px);
    color: var(--ink);
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: manifesto -->

```html
<div class="bn-manifesto">
  <span class="bn-manifesto-num">— MANIFESTO</span>
  <p class="bn-manifesto-text">{HEADLINE_WITH_EM}</p>
</div>
<style>
  /* Big declarative pull-quote. Wrap key words in <em> tags to get the
   inverse-block highlight (black bg + accent color). */
  .bn-manifesto {
    background: var(--brand-accent);
    border: var(--border-bold);
    border-top: var(--border-loud);
    border-bottom: var(--border-loud);
    padding: clamp(40px, 6vw, 80px) clamp(32px, 5vw, 64px);
    display: grid;
    grid-template-columns: 10em 1fr;
    gap: clamp(24px, 4vw, 48px);
    align-items: start;
  }
  .bn-manifesto-num {
    display: inline-block;
    border: var(--border-bold);
    background: var(--canvas);
    padding: 6px 14px;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
    box-shadow: 4px 4px 0 var(--ink);
  }
  .bn-manifesto-text {
    margin: 0;
    font-weight: 800;
    font-size: clamp(28px, 4vw, 60px);
    line-height: 1.05;
    letter-spacing: -0.025em;
    text-transform: uppercase;
    max-width: 22ch;
  }
  .bn-manifesto-text em {
    font-style: normal;
    background: var(--ink);
    color: var(--brand-accent);
    padding: 0 0.15em;
  }
  @media (max-width: 720px) {
    .bn-manifesto {
      grid-template-columns: 1fr;
    }
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: rules-do-dont -->

```html
<div class="bn-rules">
  <div class="bn-rules-col bn-rules-do">
    <h3>DO.</h3>
    <ul>
      <li>{DO_1}</li>
      <li>{DO_2}</li>
      <li>{DO_3}</li>
    </ul>
  </div>
  <div class="bn-rules-col bn-rules-dont">
    <h3>DON'T.</h3>
    <ul>
      <li>{DONT_1}</li>
      <li>{DONT_2}</li>
      <li>{DONT_3}</li>
    </ul>
  </div>
</div>
<style>
  .bn-rules {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(16px, 2vw, 32px);
  }
  .bn-rules-col {
    border: var(--border-bold);
    box-shadow: var(--shadow-hard);
    padding: clamp(24px, 3vw, 32px);
  }
  .bn-rules-do {
    background: var(--deco-2);
    transform: rotate(var(--tilt-l));
  }
  .bn-rules-dont {
    background: var(--canvas);
    transform: rotate(var(--tilt-r));
  }
  .bn-rules-col h3 {
    font-size: clamp(36px, 5vw, 64px);
    margin: 0 0 20px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .bn-rules-col ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bn-rules-col li {
    display: grid;
    grid-template-columns: 2em 1fr;
    gap: 10px;
    padding: 12px 14px;
    background: var(--canvas);
    border: 3px solid var(--ink);
    box-shadow: 4px 4px 0 var(--ink);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 500;
  }
  .bn-rules-dont li {
    background: var(--brand-primary);
  }
  .bn-rules-col li::before {
    font-size: 22px;
    font-weight: 900;
    align-self: center;
    text-align: center;
    width: 1.6em;
    height: 1.6em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--ink);
  }
  .bn-rules-do li::before {
    content: "✓";
    background: var(--brand-accent);
  }
  .bn-rules-dont li::before {
    content: "✗";
    background: var(--deco-4);
  }
  @media (max-width: 720px) {
    .bn-rules {
      grid-template-columns: 1fr;
    }
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: deco-pink-block -->

```html
<!-- Default (no data-anchor): renders inline; preview-friendly.
     With data-anchor="tl|tr|bl|br": becomes absolute-positioned sticker.
     Drop into any container with position: relative when using anchor. -->
<div class="bn-deco-pink-block"></div>
<style>
  .bn-deco-pink-block {
    width: 110px;
    height: 110px;
    background: var(--deco-4);
    border: var(--border-bold);
    box-shadow: 4px 4px 0 var(--ink);
    transform: rotate(11deg);
    display: inline-block;
  }
  .bn-deco-pink-block[data-anchor] {
    position: absolute;
  }
  .bn-deco-pink-block[data-anchor="tl"] {
    top: -34px;
    left: 80px;
  }
  .bn-deco-pink-block[data-anchor="tr"] {
    top: -34px;
    right: 80px;
  }
  .bn-deco-pink-block[data-anchor="bl"] {
    bottom: -34px;
    left: 80px;
  }
  .bn-deco-pink-block[data-anchor="br"] {
    bottom: -34px;
    right: 80px;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: deco-yellow-bar -->

```html
<!-- Inline by default; add data-anchor to pin as billboard strip. -->
<div class="bn-deco-yellow-bar">▶ {LABEL}</div>
<style>
  .bn-deco-yellow-bar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 180px;
    height: 44px;
    background: var(--deco-1);
    border: var(--border-bold);
    box-shadow: 4px 4px 0 var(--ink);
    transform: rotate(-3deg);
    font-family: ui-monospace, monospace;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    z-index: 5;
  }
  .bn-deco-yellow-bar[data-anchor] {
    position: absolute;
  }
  .bn-deco-yellow-bar[data-anchor="tl"] {
    top: -22px;
    left: 80px;
  }
  .bn-deco-yellow-bar[data-anchor="tr"] {
    top: -22px;
    right: 80px;
  }
  .bn-deco-yellow-bar[data-anchor="bl"] {
    bottom: -22px;
    left: 80px;
  }
  .bn-deco-yellow-bar[data-anchor="br"] {
    bottom: -22px;
    right: 80px;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: deco-green-circle -->

```html
<!-- Inline by default; add data-anchor to pin as corner accent. -->
<div class="bn-deco-green-circle"></div>
<style>
  .bn-deco-green-circle {
    display: inline-block;
    width: 68px;
    height: 68px;
    background: var(--deco-2);
    border: var(--border-bold);
    border-radius: 50%;
  }
  .bn-deco-green-circle[data-anchor] {
    position: absolute;
  }
  .bn-deco-green-circle[data-anchor="tl"] {
    top: 60px;
    left: 110px;
  }
  .bn-deco-green-circle[data-anchor="tr"] {
    top: 60px;
    right: 110px;
  }
  .bn-deco-green-circle[data-anchor="bl"] {
    bottom: 60px;
    left: 110px;
  }
  .bn-deco-green-circle[data-anchor="br"] {
    bottom: 60px;
    right: 110px;
  }
</style>
```

<!-- /COMPONENT -->

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip articles + connectives (the / a / of / and / with / to)
2. Break into noun-verb-noun fragments OR single dominant nouns
3. UPPERCASE all
4. Join with `.` + linebreak, OR em-dash for emphasis
5. End with brand name as one-word punchline

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `TEAMS. DESIGN. TOGETHER. — REAL-TIME. — FIGMA.`

## §H Scene composition hints (Phase 4b layout guidance)

- **One huge thing per scene**. Display size 200-340px dominates frame.
- **Use corner-pins on framed scenes** (`<!-- COMPONENT: corner-pins -->`). They give brutalist signature in one element.
- **Background**: solid brand canvas OR dot-grid (`<!-- COMPONENT: dot-grid-bg -->`). Never gradient (gradient is glass territory).
- **Transitions between scenes**: hard cut. No crossfade, no slide, no blur.
- **Sound design**: every entry has a percussive hit (kick or snare). No swells, no pads.
- **Stagger**: 100-150ms between elements. Tight, not languid.

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself brutalist)

```css
/* Brutalist page chrome — applied to design.html itself */
body {
  background: var(--canvas);
}
.title-card {
  background: var(--canvas);
  border-bottom: var(--border-loud);
  padding: 96px 0 80px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: -0.04em;
}
.brand-name,
.style-name {
  font-weight: 800;
}

.ds-section {
  border-top: var(--border-loud);
  padding: 80px 0;
}

/* Cards / panels get the brutalist treatment */
.dna-swatch,
.type-card,
.voice-pair {
  border: var(--border-bold) !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-hard);
}

.comp-card {
  border: var(--border-bold) !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-hard);
  margin: 32px 0 !important;
  overflow: visible !important; /* don't crop shadows */
}
.comp-head {
  background: var(--ink) !important;
  color: var(--canvas);
  border-bottom: var(--border-bold) !important;
}
.comp-head .comp-name,
.comp-head .comp-marker {
  color: var(--canvas);
}

.ds-code {
  border: var(--border-bold);
  border-radius: 0 !important;
  box-shadow: var(--shadow-hard);
}

h2 {
  text-transform: uppercase;
  letter-spacing: -0.03em;
}
.eyebrow {
  color: var(--ink);
  font-weight: 700;
}
```
