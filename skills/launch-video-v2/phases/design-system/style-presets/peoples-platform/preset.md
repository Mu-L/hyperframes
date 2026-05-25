```preset-meta
{
  "name": "peoples-platform",
  "label": "People's Platform",
  "fingerprint": {
    "depth": "stacked-offset-shadow",
    "border": "6px-ink-block",
    "type": "slab-uppercase-plus-brush-interrupt",
    "atmosphere": "paper-grain-overlay",
    "voice": "protest-poster"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.25 },
    { "kind": "high_sat_accent", "weight": 0.2 },
    { "kind": "condensed_display", "weight": 0.1 }
  ],
  "best_for": ["manifestos", "founder visions", "mission statements", "civic / campaign decks", "design talks"],
  "avoid_for": ["institutional restraint", "finance", "healthcare", "corporate compliance", "regulated disclosures"]
}
```

## §A Director's intent

Activist-poster energy: WPA placard meets political campaign, screen-printed onto warm paper. Every display word is a heavy slab in strict uppercase, anchored by a stacked offset shadow that gives type a quasi-3D letterpress thickness. Heavy 6px ink borders carve the canvas into block-sized regions; cream inset frames sit inside blue surfaces like a poster-within-a-poster. A grain overlay (CSS pseudo-element) sits on every scene so flat digital surfaces read as physically printed, not rendered. Motion is hit-and-stick: stamps slam in with a small over-rotation, headlines crack into place with their shadows trailing one frame behind, and a single Caveat Brush "human interrupt" word breaks the geometry every few scenes. Best for: manifestos, founder visions, mission statements, civic / campaign decks, design talks — anything that should feel honest, loud, and graphic. Avoid for: institutional restraint, finance, healthcare — the saturated political-poster palette commits hard to expressive energy. Class prefix is `pp-`.

## §B Decoration tokens

```css
/* ── Stacked offset shadows (preset signature) ───────────────────── */
/* Three tiers; scale shadow distance with font size. Red is shadow-only. */
--shadow-stamp-sm: 3px 3px 0 var(--brand-secondary);
--shadow-stamp-md: 6px 6px 0 var(--brand-secondary);
--shadow-stamp-lg: 10px 10px 0 var(--brand-secondary), 20px 20px 0 var(--brand-accent);
--shadow-stamp-jumbo: 12px 12px 0 var(--brand-secondary), 24px 24px 0 var(--brand-accent);

/* Box-shadow versions (stamps, buttons, KPI tiles) */
--shadow-block-md: 6px 6px 0 var(--brand-secondary);
--shadow-block-lg: 8px 8px 0 var(--brand-secondary);

/* ── Border weights (printed-matter aesthetic) ───────────────────── */
/* 6px is the load-bearing structural weight; 3-4px are fine dividers. */
--border-structural: 6px solid var(--ink);
--border-structural-inverse: 6px solid var(--canvas);
--border-stamp: 5px solid var(--canvas);
--border-divider: 4px solid var(--ink);
--border-hairline: 3px solid var(--ink);

/* ── Geometry ───────────────────────────────────────────────────── */
--radius-square: 0px; /* default for cards, frames, ribbons */
--radius-pill: 999px; /* meta-pills only */
--radius-disc: 50%; /* avatars, stamps, dots */
--radius-diamond: 4px; /* on a 45deg rotated square — diamond bullet */

/* ── Tilt vocabulary ────────────────────────────────────────────── */
/* Rotations are deliberate, never accidental. Stamps tilt; type does not. */
--tilt-stamp-rect: -3deg;
--tilt-stamp-circle: -9deg;
--tilt-script: -3deg;
--tilt-diamond: 45deg;

/* ── Spacing ────────────────────────────────────────────────────── */
--gap-slide: 90px; /* edge padding */
--gap-content: 120px; /* inner content padding on framed scenes */
--frame-inset: 48px; /* inset-frame offset from edge */
--topbar-height: 90px; /* blue topbar band */
--ribbon-height: 60px; /* orange marquee strip */

/* ── Grain overlay (atmospheric texture) ─────────────────────────── */
/* Applied via ::before on the scene root. Always present. */
--grain-image:
  radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
  radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
--grain-size: 3px 3px, 5px 5px;
--grain-offset: 0 0, 1px 2px;
--grain-opacity: 0.5;
```

## §D Font pairing fallback

- **display**: `'Alfa Slab One'` · `'Ultra'` · `'Archivo Black'` wght 400
- **body**: `'Archivo Narrow'` · `'Barlow Condensed'` · `'Oswald'` wght 500
- **mono**: `'DM Mono'` · `'Space Mono'` · `'JetBrains Mono'` wght 400

The preset additionally wants `'Caveat Brush'` for the script-interrupt component, but it is consumed by the `pp-script-*` class directly (not via the body/display/mono role resolver). If `Caveat Brush` is not on Google Fonts in the target environment, fall back to `'Caveat'` then `'Permanent Marker'`.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  // RULE: hit-and-stick — stamps land with a small overshoot, then lock.
  entry: "back.out(1.6)",
  // RULE: emphasis is a hard "snap into focus" — power3.out, never ease-in-out.
  emphasis: "power3.out",
  // RULE: exit is fast and clean. Never crossfade — cut or whip.
  exit: "power2.in",
  // RULE: drift = grain shimmer + ribbon scroll only. Never on display type.
  drift: "sine.inOut",
};

const DUR = {
  // RULE: snap = stamp lock, shadow catch-up, diamond bullet pop.
  snap: 0.16,
  // RULE: med = headline crack-in, column reveal, list-item stagger.
  med: 0.5,
  // RULE: slow = full-scene establish, ribbon marquee loop.
  slow: 0.9,
};

// RULE: never tween line-height or letter-spacing on Alfa Slab — glyph collision at large sizes.
// RULE: the stacked text-shadow can be animated by tweening each shadow's offset independently
//       to a 1-frame lag — creates the "type lands first, shadow catches up" beat.
// RULE: rotation is part of the stamp's identity. Tween scale + opacity on entry; leave the
//       --tilt-stamp-* value as the final resting rotation.
// RULE: grain overlay opacity is static (0.5). Do not pulse it.
```

### §E.5 Motion choreography

- **Allowed primitives:** stamp-land (scale 0.6→1 + opacity + tilt held), headline-crack (y -20→0 + opacity), shadow-lag (text-shadow offset tweened with 1-frame delay behind the type), bullet-pop (scale 0→1 on `back.out(2)`), ribbon-scroll (translateX linear loop on the orange ribbon), grain-static (no animation — texture is always-on).
- **Forbidden gestures:** crossfade between scenes (cut or whip-pan only); blur on shadows (they are hard offset only); easing on `transform: rotate()` for stamps (the tilt is a final state, not a tween); animating mix-blend-mode or grain opacity; sentence-case display text (uppercase is invariant).
- **Transition defaults:** scenes cut at full opacity. If transition is required, whip horizontally across the 6px ink border (the border carries the eye between scenes).
- **Type-in-motion:** Alfa Slab cracks in word-by-word at `DUR.med` with `EASE.emphasis`. Caveat Brush enters with a hand-written feel — y-offset + opacity, `EASE.entry`, `DUR.snap`, never staggered (it lands as one gesture, not character-by-character). DM Mono labels fade up linearly, no stagger.

## §G Voice transform recipe

1. Strip articles + connectives (the / a / of / and / with / to / for) from headlines and chip text.
2. UPPERCASE all on-screen Alfa Slab content. Caveat Brush stays lowercase. DM Mono stays uppercase but with em-dash decorators (`— LABEL —`).
3. Cut prose into short declarative fragments. End fragments on nouns, not adjectives.
4. Add one Caveat Brush "human interrupt" word per scene-cluster — informal, lowercase, connective ("yes", "really", "a", "more", "now"). It is the voice that whispers between the shouts.
5. Wrap metadata in em-dashes (`— FOCUS —`, `— V. 01 —`, `— SOURCE NPS Q1 —`).
6. End decks / scene-clusters with a brand-name punchline in Alfa Slab, no period.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `TEAMS DESIGN PRODUCTS. real-time. — FIGMA —`

(`real-time.` is the Caveat Brush interrupt; everything else is Alfa Slab uppercase except the bracketed mono tag.)

## §H Scene composition hints

- **Surface alternation.** Alternate scene backgrounds: `var(--canvas)` (paper) for content-first scenes, `var(--brand-primary)` (blue) for high-emphasis / conclusive scenes. Two paper scenes in a row read fine; two blue scenes in a row need a visual break (a stamp, a script interrupt, or a 6px cream inset frame).
- **Inset frame rule.** Every blue-background scene MUST carry a `pp-inset-frame` (6px `var(--canvas)` border at `inset: 48px`). This is the "framed-not-merely-filled" signal that distinguishes a blue scene from background-flood.
- **Grain overlay.** Every scene carries `pp-grain-overlay` as a structural pseudo-element. It is not decorative — it is the surface that the scene is printed on. Workers must not omit it.
- **Hero focal sizing.** The largest type on a scene gets the jumbo shadow stack (`var(--shadow-stamp-jumbo)`); secondary display gets `--shadow-stamp-lg`; chip / label sized type gets `--shadow-stamp-sm` or no shadow at all (DM Mono is flat by rule).
- **Brand-color role contract.** `var(--brand-primary)` (blue) = primary structural fills + headline color on paper. `var(--brand-secondary)` (red, the shadow color) = box-shadow / text-shadow ONLY — NEVER a surface or text fill. `var(--brand-accent)` (orange) = stat numerals, accent text inside blue surfaces, button fill, ribbon background. `var(--ink)` = body text + structural borders. `var(--canvas)` = paper background + text on blue surfaces.
- **Caveat Brush is an interrupt.** Use the `pp-script-interrupt` component at most once per scene. Never use it for body text. It always carries a tilt between -2deg and -5deg.
- **Diamond bullets.** List items use the `pp-pillar-card` bullet style (24px rotated square `var(--brand-secondary)` on paper / `var(--brand-accent)` on blue surfaces). Upright squares are forbidden — the diamond rotation is signal, not decoration.
- **Stagger budgets.** Three columns / nodes / stats stagger at 0.08-0.12s. Eight-item dense lists stagger at 0.05s. Do not stagger more than 12 elements — beyond that, fade the whole block in as one gesture.
- **Sound-design hooks.** Stamp-lands invite a paper-thud or rubber-stamp SFX. Headline-cracks invite a single bass-thwack. Ribbon-scroll wants a low loop hum. Grain-overlay carries no sound — it is texture.
- **Forbidden shapes.** Rounded card corners (except meta-pills); soft-blur shadows; thin borders below 3px; sentence-case Alfa Slab; red as a fill color.

## §I Page-level CSS

```css
/* Make design.html itself read as a People's Platform poster. */
body {
  background: var(--canvas);
  position: relative;
}
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size:
    3px 3px,
    5px 5px;
  background-position:
    0 0,
    1px 2px;
  mix-blend-mode: multiply;
  opacity: 0.5;
  z-index: 0;
}
.wrap {
  position: relative;
  z-index: 1;
}
.ds-section {
  border-top: 6px solid var(--ink, #0e0e14);
}
.ds-section:first-of-type {
  border-top: none;
}
h1,
h2 {
  text-transform: uppercase;
  letter-spacing: 0.005em;
  color: var(--brand-primary, #2c2cdc);
  text-shadow: 5px 5px 0 var(--brand-secondary, #e83a2a);
}
.eyebrow {
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--brand-secondary, #e83a2a);
}
```
