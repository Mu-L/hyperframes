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
