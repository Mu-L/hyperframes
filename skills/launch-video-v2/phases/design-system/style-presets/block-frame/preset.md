```preset-meta
{
  "name": "block-frame",
  "label": "Block Frame",
  "fingerprint": {
    "shadow": "hard-offset-black",
    "border": "4px-solid-ink",
    "palette": "saturated-pastel-cycle",
    "motion": "tilt-and-snap",
    "decoration": "tilted-puncture"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.3 },
    { "kind": "high_sat_accent", "weight": 0.15 },
    { "kind": "minimal_decoration", "weight": 0.05 }
  ]
}
```

## §A Director's intent

Block Frame is maximalist neobrutalism: every region wears a 4px solid ink
border, every elevated card carries an 8px hard offset shadow (zero blur,
solid ink), every corner is square, and the canvas cycles through five
saturated pastels — pink, blue, green, yellow, cream — plus off-white and
ink. Display is heavy uppercase Inter with negative tracking; chrome is
wide-tracked Space Grotesk in caps. Decorative tilts (±2° to ±12°),
star-bursts, stripe blocks, and dot grids puncture the grid intentionally.
The system reads as confident, joyful, slightly chaotic — zine layout meets
toy packaging. Density is the rule, not the exception: empty surfaces feel
timid. Best for: indie SaaS launch, agency credentials, creative reviews,
brand redesigns. Avoid for: regulated disclosures, formal legal briefs.

Brand-aware color contract: `--brand-primary` is the dominant pastel
ground, `--brand-secondary` is the colored-shadow accent (replaces the
template's signature yellow shadow on the close-frame), `--brand-accent`
is the CTA fill. Class prefix is `bf-` (block-frame initials).

## §B Decoration tokens

```css
/* Border ladder — 4px primary, 3px secondary, 2px atomic chrome */
--bf-border-bold: 4px solid var(--ink);
--bf-border-mid: 3px solid var(--ink);
--bf-border-thin: 2px solid var(--ink);

/* Hard offset shadow stack — solid ink, zero blur, bottom-right */
--bf-shadow: 8px 8px 0 var(--ink);
--bf-shadow-sm: 4px 4px 0 var(--ink);
--bf-shadow-hover: 6px 6px 0 var(--ink);

/* Inverted close-surface depth — only colored shadow in the system,
   aliased to brand-secondary so it follows the site palette instead
   of the template's locked yellow. */
--bf-shadow-close: 12px 12px 0 var(--brand-secondary);
--bf-shadow-close-btn: 6px 6px 0 var(--canvas);

/* Tilt vocabulary — stat cards alternate small, decorations tilt loud */
--bf-tilt-sm-l: -2deg;
--bf-tilt-sm-r: 2deg;
--bf-tilt-md-l: -8deg;
--bf-tilt-md-r: 8deg;
--bf-tilt-loud: 12deg;

/* Spacing — template's px scale, kept px for structural fidelity */
--bf-pad-card: 36px;
--bf-pad-card-sm: 28px;
--bf-pad-card-xs: 22px;
--bf-pad-card-lg: 60px;
--bf-gap-lg: 48px;
--bf-gap-md: 32px;
--bf-gap-sm: 24px;
--bf-gap-xs: 16px;

/* Decorative dot-grid pattern unit */
--bf-dot-size: 24px;
--bf-dot-radius: 1.2px;
```

## §D Font pairing fallback

- **display**: `'Inter'` · `'Archivo Black'` · `'Space Grotesk'` wght 900
- **body**: `'Inter'` · `'IBM Plex Sans'` wght 500
- **mono**: `'Space Grotesk'` · `'JetBrains Mono'` · `'IBM Plex Mono'` wght 600

## §E Motion (GSAP consts — REPLACES site ease)

```js
// RULE: motion is snap-and-hit, never slow ease-in-out for primary entrances.
// RULE: cards "punch in" — translate from -8/-8 offset with shadow growing
//       from 0 to var(--bf-shadow). Mirrors the hover lift-up signature.
// RULE: tilts are baked at rest; do NOT tween rotation during entry.
//       Tilt-then-pop reads as wobble; tilt-at-rest reads as deliberate.
// RULE: emphasis on chrome (label-pills, buttons) uses back.out(1.6) to
//       echo the hard-shadow "stamp" feel.
// RULE: never blur shadows during motion — toggle box-shadow values, do
//       not interpolate filter() or use shadow-blur tweens.

const EASE = {
  entry: "expo.out", // cards hit and stick — template uses 0.15s ease but punchier on video scale
  emphasis: "back.out(1.6)", // chrome pops (pills, buttons, stat cards) — echoes the brutalist stamp
  exit: "power2.in", // sharp exits — never linger
  drift: "sine.inOut", // ambient (dot-grid fade-in, tilt micro-sway) only
};

const DUR = {
  snap: 0.16, // chrome hover, label-pill in, button settle — mirrors template's 0.15s
  med: 0.42, // card entry, headline reveal
  slow: 0.9, // hero entry, close-frame reveal — the loudest moments
};
```

### §E.5 Motion choreography

- **Allowed primitives:** snap-translate (-8/-8 → 0/0 with shadow grow),
  punch-scale (0.92 → 1.0 with back.out), stagger-reveal (children appear
  at 0.06s offset), shadow-grow (0/0 → 8/8 in DUR.med), tilt-rest (tilt
  applied at rest, not tweened).
- **Forbidden gestures:** rotation tweens, blur interpolation, ease-in-out
  on primary motion (only on `drift`), cross-fade between cards (use
  punch-translate or hard cut).
- **Transition defaults:** hard cut between scenes is the spiritual default
  (the template has no slide transitions). If a transition is needed,
  punch-translate the incoming hero element with DUR.med + EASE.emphasis.
- **Type-in-motion:** display headlines reveal as a single unit (no per-
  character split). Sub-headline reveals at +0.12s with `power2.out` +
  DUR.snap. Label-pills always emphasis-pop, never linear-fade.
- **Stagger budget:** ≤6 elements in a single stagger; beyond that, group
  visually (timeline-step row, stat-grid) and animate the group as one.

## §G Voice transform recipe

1. Strip articles and connectives (the / a / of / and / with / to).
2. Break into 2-4 word noun-verb-noun fragments or single dominant nouns.
3. UPPERCASE all on-screen text that lands in display, chip, or button
   slots — sentence body stays sentence case.
4. Join fragments with `.` + linebreak for stacked impact, or em-dash
   `—` for a single beat of emphasis.
5. End headlines on a noun, not a verb — the brutalist stamp lands on the
   thing, not the action.
6. Brand name appears as the final clause, punctuated standalone.

**Example:**

- IN: `Higgsfield is the AI platform that helps creators generate stunning visuals in seconds`
- OUT: `CREATORS. GENERATE. STUNNING VISUALS — IN SECONDS. HIGGSFIELD.`

## §H Scene composition hints

- **Surface alternation:** cycle scene grounds through off-white →
  `--brand-primary` pastel → off-white → `--brand-accent` pastel → ink
  close. Staying on one ground for >2 consecutive scenes flattens the
  system. The cycle is the rhythm.
- **Brand-color role contract:** `--brand-primary` is the dominant ground
  pastel and the icon-square fill; `--brand-secondary` is the colored
  shadow on the close-frame and the stat-deco-dot fill; `--brand-accent`
  is the CTA (button) and list-number / feature-deco fill.
- **Focal element sizing:** hero headline reaches 6-8vw at minimum; never
  shrink display Inter below 4vw or its character collapses. Stat
  numerals at 4-6vw with line-height 1.
- **Card-on-ground structure:** every scene's primary content sits inside
  a bordered card (4px ink, 8px ink shadow) on a pastel ground. Secondary
  cells inside the card use 3px border + 4px shadow.
- **Required decorative disruption:** every scene carries at least one
  decorative element — a tilted rectangle, a star-burst, a stripe-block,
  a dot-grid corner, or a corner-bracket frame. Empty surface reads as
  broken.
- **Tilt rules:** stat cards alternate `var(--bf-tilt-sm-l)` /
  `var(--bf-tilt-sm-r)`. Decorative rectangles and stars use
  `var(--bf-tilt-md-l/r)` to `var(--bf-tilt-loud)`. Never tilt primary
  cards more than ±2°; never leave decoration un-tilted.
- **Forbidden shapes:** no rounded corners on cards / buttons / pills /
  icon-squares / avatars. The only circle in the system is the 12px
  stat-deco dot.
- **Border discipline:** borders are always solid ink (or solid canvas on
  the inverted close-frame). No colored borders. No 1px or 5px+ borders;
  the ladder is 2 / 3 / 4 only.
- **Shadow discipline:** all shadows zero-blur, solid color, offset
  bottom-right. The only colored shadow is `--bf-shadow-close` on the
  closing surface; everywhere else, shadow is solid ink.
- **Close-frame:** final scene uses ink ground, canvas-color text,
  canvas-bordered close-frame, and `--bf-shadow-close` (12px offset in
  brand-secondary). This is the loudest depth statement in the deck.
- **Sound-design hooks:** snap-translate entrances pair with a low
  knock/snap; emphasis pops (chrome, stats) pair with a paper-stamp
  thunk. Avoid sustained pads — the brutalist register is percussive.

## §I Page-level CSS

```css
/* design.html chrome — borrows the preset's visual register */
body {
  background: var(--canvas, #fffdf5);
  font-family: "Inter", sans-serif;
  color: var(--ink, #000);
}

h1,
h2,
h3 {
  font-family: "Inter", sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

h2 {
  border-bottom: var(--bf-border-bold, 4px solid #000);
  padding-bottom: 0.4em;
  margin-top: 1.4em;
}

code,
pre {
  font-family: "Space Grotesk", monospace;
  background: color-mix(in srgb, var(--brand-primary, #fe90e8) 12%, transparent);
  border: var(--bf-border-mid, 3px solid #000);
  padding: 0.1em 0.4em;
}

pre {
  padding: 1em;
  box-shadow: var(--bf-shadow-sm, 4px 4px 0 #000);
}
```
