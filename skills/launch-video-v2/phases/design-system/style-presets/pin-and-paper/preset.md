```preset-meta
{
  "name": "pin-and-paper",
  "label": "Pin & Paper",
  "fingerprint": {
    "surface": "yellow-paper-with-grain",
    "shadow": "hard-offset-ink-zero-blur",
    "border": "hairline-ink",
    "voice": "field-notebook-handwritten",
    "motion": "quiet-considered",
    "density": "populated-card-grid"
  },
  "match_signals": [
    { "kind": "hairline_border", "weight": 0.3 },
    { "kind": "shadow_zero_blur", "weight": 0.25 },
    { "kind": "low_saturation", "weight": 0.1 }
  ],
  "best_for": ["qualitative research", "founder reflections", "longform brand stories", "hand-crafted decks", "literary brands"],
  "avoid_for": ["digital-native polished", "rigorously data-driven", "corporate fintech", "high-energy launches"]
}
```

## §A Director's intent

Field notebook pinned to a corkboard, not a polished deck. Every surface is **yellow legal-pad paper** with a non-optional fractal-noise grain — without the texture the system collapses into flat cartoon-yellow. Cards are **cream paper pinned to the page** with a 1.5px hairline ink border, 4px micro-radius, and a hard ink-blue offset shadow (5–8px, zero blur). The shadow is the only depth language.

Three editorial voices, each in its own face: **Space Grotesk 700** carries every printed headline (negative letter-spacing, mixed case); **Caveat** carries every handwritten moment — marginal notes, step numerals, "me" voice annotations; **DM Mono uppercase** carries every archival tag — top-chrome lockup, footer meta, date strips. Switching a voice's face collapses the register.

**Brand DNA drives the chrome color, preset drives the structure.** `--brand-primary` maps to the ink-blue role (text, borders, dividers, pin illustrations, hard offset shadow). `--brand-accent` maps to the cinnabar-red stamp role (used in exactly two places: the rotated rubber stamp and the negative pill). The yellow paper base is a **technical signature anchor** — without it the layered radial gradients, grain overlay, and cream-on-yellow card contrast all fail; declared once in §B as `--anchor-paper-yellow` / `--anchor-cream` so brand DNA can tint via `color-mix()` without losing the paper reading.

Motion is **quiet and considered** — short fades, no overshoot, no bounce. The hand-pinned aesthetic doesn't want kinetic theatrics; the camera holds and the eye reads. Ambient pin rotations drift on `sine.inOut` like paper settling.

**Best for** decks that should feel hand-crafted, warm, literary — qualitative research findings, founder reflections, longform brand stories. Avoid for digital-native polished or rigorously data-driven contexts; the handwritten Caveat is intentionally informal.

**Density philosophy: populated, not sparse.** Pin & Paper reads as authoritative when 3–6 cards are pinned across the page, each carrying a heading + body + marginal note. A scene with one centered headline and otherwise empty space reads as broken.

## §B Decoration tokens (merge into design.html `:root`)

Pin & Paper declares **structural** tokens here (hairline border, hard offset shadow, micro-radius, pin/paper anchors). The brand-aware contract: ink-blue surfaces flow from `var(--brand-primary)`; the cinnabar-red stamp flows from `var(--brand-accent)`. The two paper-anchor hexes below are §8.2 exceptions — declared because the yellow-paper + cream-card contrast is the preset's structural signature, not a palette choice; brand DNA tints these anchors via `color-mix()` so the warm-paper register survives every brand palette.

```css
/* §8.2 exception: paper-anchor tokens. The yellow legal-pad surface and the
   cream card fill are the structural signature — without them the layered
   radial gradients, grain overlay, and cream-on-yellow card contrast all
   fail. Brand DNA tints these via color-mix() so the paper register survives
   every brand palette (dark / muted / pastel). Declared once here, never
   scattered into component CSS. */
--anchor-paper-yellow: #efe56a; /* saturated cadmium yellow — the page */
--anchor-cream: #f8f1d6; /* off-white ivory — the cards */

/* Paper surfaces — brand-tinted from the anchor so they shift with the site
   without losing the warm-paper reading. */
--surface-paper: color-mix(in srgb, var(--brand-primary) 6%, var(--anchor-paper-yellow));
--surface-paper-2: color-mix(
  in srgb,
  var(--brand-primary) 4%,
  color-mix(in srgb, var(--anchor-paper-yellow) 70%, white)
);
--surface-paper-3: color-mix(
  in srgb,
  var(--brand-primary) 8%,
  color-mix(in srgb, var(--anchor-paper-yellow) 85%, black 8%)
);
--surface-cream: color-mix(in srgb, var(--brand-primary) 4%, var(--anchor-cream));

/* The signature hard offset shadow — solid ink, zero blur. Three sizes for
   compact / standard / hero cards. Color flows from brand-primary. */
--shadow-pin-compact: 4px 5px 0 0 var(--brand-primary);
--shadow-pin-standard: 5px 6px 0 0 var(--brand-primary);
--shadow-pin-hero: 8px 9px 0 0 var(--brand-primary);

/* Hairline + dashed borders */
--border-hairline: 1.5px solid var(--brand-primary);
--border-dashed: 1.5px dashed color-mix(in srgb, var(--brand-primary) 45%, transparent);
--border-stamp: 3px solid var(--brand-accent);

/* Micro-radius — the printed-corner signal. Larger values collapse into UI. */
--radius-card: 4px;
--radius-pill: 999px;

/* Edge / card padding */
--pad-edge: 64px;
--pad-top: 110px;
--pad-bottom: 90px;
--card-pad: 28px;
--card-pad-lg: 36px 28px 28px;

/* Grid gaps */
--gap-card-sm: 22px;
--gap-card-md: 28px;
--gap-card-lg: 32px;

/* Off-axis tilts — the pinned-askew signal. Used on alternate cards, pins,
   scribbles, stamp. Never apply more than one tilt to a single element. */
--tilt-pin: -10deg;
--tilt-pin-alt: 14deg;
--tilt-card-askew: 0.9deg;
--tilt-scribble: -2deg;
--tilt-stamp: -4deg;

/* Paper-grain overlay — fractal noise data-URI, multiply blend. Non-optional
   on every scene. The blend mode flips to screen on ink-blue surfaces. */
--paper-grain: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.2  0 0 0 .25 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Pin & Paper depends on the three-voice editorial pairing (printed display / handwritten / archival). Fallbacks below are only used if the brand-derived face fails to load.

- **display**: `'Space Grotesk'` · `'Inter Tight'` · `'Manrope'` wght 700
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'DM Mono'` · `'JetBrains Mono'` · `'IBM Plex Mono'` wght 500

The handwritten layer (Caveat) is non-substitutable — if Caveat fails to load it falls through to `cursive`, which varies by OS. Component CSS forces Caveat directly; brand DNA does not override it.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "power2.out", // soft arrival, no overshoot — paper settling onto the page
  emphasis: "power3.out", // a touch more authority on pin-reveal / stamp-slam beats
  exit: "power2.in", // calm departure, no acceleration spike
  drift: "sine.inOut", // ambient pin / scribble tilt drift
};
const DUR = {
  snap: 0.18,
  med: 0.5,
  slow: 0.95,
};
// RULE: never back.out / elastic / bounce — the field-notebook register is
//       quiet and considered. Overshoot breaks the "paper settling" feel.
// RULE: pin illustrations and stamps may rotate within ±2° on entry — never
//       counter-rotate to 0°. The off-axis tilt is the system's identity.
// RULE: scene transitions are short cross-dissolves (DUR.med). NEVER slide,
//       wipe, or zoom — they read as digital chrome and break the paper aesthetic.
// RULE: scribble entries should write-on (clip-path reveal left→right) at
//       DUR.med with EASE.entry. Don't fade — fade is for printed type.
```

### §E.5 Motion choreography

**Allowed primitives**

- Soft fade-in + 8–12px y-drift on cards (DUR.med, EASE.entry).
- Pin-rotate-in: pin illustration arrives from −20° / +25° tilt and settles to its rest tilt at DUR.med, EASE.entry.
- Stamp-slam: stamp scales 1.08 → 1 with rotation locked at −4° (DUR.snap, EASE.emphasis) — single percussive beat.
- Scribble write-on: clip-path inset(0 100% 0 0) → inset(0 0 0 0) at DUR.med, EASE.entry.
- Stat-counter numeric tween at DUR.slow with EASE.emphasis. Caveat `<small>` suffix fades in at the end of the count.
- Ambient pin drift: rotation oscillation ±1.5° on a 4–6s sine.inOut loop. Subtle, not theatrical.

**Forbidden**

- Slide-in / wipe / zoom-between-scenes (reads as digital chrome).
- Bounce / overshoot / elastic on any primary motion.
- Sub-pixel positions — keep transforms on integer pixel offsets.
- Rotating a pin or scribble back to 0° on rest. The off-axis tilt is the identity.
- Counter-rotating the rubber stamp away from −4°.
- Particle systems / sparkles / glow filters — paper doesn't emit light.

**Stagger budget**

200–280ms between elements (slower than 8-bit-orbit's 80–120ms, faster than literary editorial). Total scene-in stagger ≤ 700ms. The eye should have time to read each card's pin → heading → body → margin-note rhythm before the next one arrives.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Hero headlines: 2–5 words, mixed case (NOT uppercase), Space Grotesk 700 with negative letter-spacing. Period optional — the cover behaves like a book title.
2. Top-chrome lockups, dates, source attributions: DM Mono UPPERCASE with 0.12–0.18em tracking. Terse, indexical — pretend it's a catalog-card tag.
3. Stamps: UPPERCASE DM Mono, 1–2 words ("CONFIDENTIAL", "RECEIVED", "DRAFT 04"). Always rotated −4°.
4. Marginal notes (Caveat scribble): sentence case, 4–10 words, conversational. This is the "me" voice — write as if annotating someone else's document. Use `<span class="pp-underline">word</span>` for hand-drawn underline emphasis.
5. Step numerals: Caveat hand-script (1, 2, 3 — not "Step 1"). The script numeral is the system's ordering voice; never substitute a numeric font.
6. Card bodies: Space Grotesk sentence case, terse, full sentences. Never set body in Caveat — the script is for marginal notes, never paragraphs.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`Designed together.` / chip=`FIELD REPORT 04` / stamp=`RECEIVED` / margin-note=`finally — one canvas, everyone home`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default surface: `paper-surface` (yellow paper + layered radial gradients + grain overlay at opacity 0.35 with multiply blend).
- Cream variant: `cream-surface` for quieter scenes (quote panels, notice slides).
- Ink-blue variant: section dividers and high-contrast moments. Background flips to `var(--brand-primary)`, text flips to `var(--surface-paper)`, grain overlay opacity drops to 0.25 with screen blend mode (multiply on ink turns the slide muddy).
- Alternate paper → cream → paper → ink across the video. Two consecutive ink slides = broken pacing.

**Hero text**

- Cover scene: Space Grotesk 700 at ~196px, max-width ~14ch, mixed case, ink color. One pin illustration at 320–420px in the upper-right (rotated −8° to +14°), one Caveat marginal note in the lower-right (~38px, rotated −3°, right-aligned).
- Section-divider scene (ink): Space Grotesk 700 at ~168px in paper color, large pin illustration (up to 640px) at +14° to +20° on the opposite corner. One Caveat scribble in the bottom margin.
- Hero takes 50–60% of canvas width. Never two hero-tier elements per scene.

**Card grids**

- Notecard grid: 3 columns × 1 row, 32px gap, each card 36/28/28 padding, pin overlapping the top edge.
- Process flow: 5 columns, 22px gap, pin centered on the top edge of each card.
- Stats grid: 3 columns, 28px gap, Caveat `<small>` unit suffix on each big numeral.
- Alternate card fills (`cream` / `paper-2` / `paper-extra`) to break adjacent same-tone cards.
- Apply `--tilt-card-askew` to exactly **one** card per row for the pinned-askew effect — never to every card.

**Brand color placement (role contract)**

- `--brand-primary` carries the ink role: every text fill on yellow / cream surfaces, every border, every divider, every pin illustration, every hard offset shadow. It is the system's structural color.
- `--brand-accent` carries the stamp / negative-pill role only. **Two roles, no others.** Never as general text, never as a card fill, never on a chip.
- `--brand-secondary` is intentionally unused at the structural level — reserved for optional accent layers (kraft / olive / orange tertiaries from the source palette) when a scene calls for a third tone (rare).
- Body text on ink surfaces flips to `var(--surface-paper)` at 0.85 opacity for muted lead.

**Pin illustrations are non-optional decoration**

- Every card carries a `safety-pin` overlay at the top edge (typical: width 96–120px, top −14 to −22px, left 28–90px, rotated −6° to −12°).
- Cover and section-divider scenes carry an oversized pin (320–640px wide) as composition, not decoration.
- Every pin is rotated off-axis. A pin at 0° reads as a UI icon, not a pinned object.

**Stamp placement**

- Status stamp in the upper area of one card per scene (max). Always at −4° rotation, always 3px solid red border + red mono uppercase. Never use red anywhere else.

**Hairline + dashed borders are the universal frame**

- 1.5px solid `var(--brand-primary)` on every card, every panel, every table container.
- 1.5px dashed `color-mix(in srgb, var(--brand-primary) 45%, transparent)` for inter-row separators (agenda rows, CTA steps, in-card source notes).
- Border widths never exceed 1.5px on cards, 3px on the stamp, 2px on the Caveat `.underline` span. No other border weights exist.

**Transitions between scenes**

- Short cross-dissolve at DUR.med (0.5s) with EASE.entry. Optional: a single pin-drop or stamp-slam beat on the inbound scene.
- NEVER slide / wipe / zoom / page-flip — those read as digital chrome.

**Sound design (passed to audio phase, not 4b worker — note here for completeness)**

- Pencil-scratch on scribble write-ons.
- Soft thud on pin-drop entries.
- Single rubber-stamp slam on stamp reveal beats.
- Page-turn susurrus on scene cross-dissolves (low-volume bed).

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as pin-and-paper)

```css
body {
  background: var(--surface-paper);
  position: relative;
  color: var(--brand-primary);
  font-family: "Space Grotesk", "Inter", sans-serif;
}
body::before {
  /* Paper grain on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  background-image: var(--paper-grain);
  opacity: 0.35;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 9999;
}
.title-card {
  background: var(--surface-paper);
  border-bottom: var(--border-hairline);
  padding: 96px 0 80px;
}
.title-display {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--brand-primary);
}
.brand-name {
  color: var(--brand-primary);
  font-weight: 700;
}
.style-name {
  font-family: "Caveat", cursive;
  font-weight: 700;
  color: var(--brand-primary);
  transform: rotate(-2deg);
  display: inline-block;
}
.ds-section {
  border-top: var(--border-dashed);
  padding: 80px 0;
}
h2 {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--brand-primary);
}
.eyebrow {
  font-family: "DM Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--brand-primary);
  opacity: 0.7;
  font-weight: 500;
}
.type-card,
.voice-pair,
.comp-card {
  background: var(--surface-cream) !important;
  border: var(--border-hairline) !important;
  border-radius: var(--radius-card) !important;
  box-shadow: var(--shadow-pin-standard) !important;
}
/* dna-swatch keeps its inline brand-color background — only restyle border/shadow */
.dna-swatch {
  border: var(--border-hairline) !important;
  border-radius: var(--radius-card) !important;
  box-shadow: var(--shadow-pin-standard) !important;
}
.comp-head {
  background: var(--surface-paper-2) !important;
  color: var(--brand-primary) !important;
  border-bottom: var(--border-hairline) !important;
  font-family: "DM Mono", monospace !important;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.ds-code {
  background: var(--surface-cream) !important;
  border: var(--border-hairline) !important;
  border-radius: var(--radius-card) !important;
  color: var(--brand-primary) !important;
  font-family: "DM Mono", monospace !important;
}
```
