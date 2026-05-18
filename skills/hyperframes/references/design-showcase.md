# Design System Showcase

Turn an existing design system spec (a `design.md`, an `index.json` entry, or a paste) into a single HTML showcase page that's beautiful enough to be the system's own portfolio piece — and parseable enough that a downstream agent can lift its tokens and slide CSS verbatim.

The point isn't to _document_ the system. The point is to _be_ the system.

---

## 1. Read the source. Don't write yet.

Before any CSS, extract these in order:

1. **One-sentence character.** Write a single plain-English sentence describing the system's character. Patterns that work:
   - _"loud editorial newspaper with bilingual type and a single fire-orange environment"_
   - _"scholarly literary journal in navy with italic serifs and a warm gold marginalia"_
   - _"Y2K modular lifestyle brand with pill-shaped cards and a pastel pop"_
   - _"Windows 95 application chrome played straight, with bevels doing all the lift"_

   If you can't write this sentence in one shot, you don't understand the system yet. Re-read the source.

2. **Four palette tokens.** Pick exactly:
   - `--primary` (the paper / lightest tone — body text on dark, full-card surfaces on dark canvas)
   - `--secondary` (the canvas / darkest tone — often body text on light)
   - `--tertiary` (the chrome — mid-tone for labels, muted text, dividers)
   - `--accent` (the signal — used once per slide, never as a tint)

   If the system has decorative extras (pastel pops, ribbon colors, multi-hue cards), treat those as a _costume layer_ on top of the four sacred tokens. Don't expand the core past four.

3. **Three fonts.** Display, body, mono. Use the source's named fonts if they're strong; substitute when they're overused or weak. Avoid Inter, Roboto, Arial, Fraunces, system fonts as the _featured display face_ — they make the showcase look generic.

4. **Motion philosophy.** Read for keywords: "confident," "bouncy," "patient," "stamped," "instant." Translate to a `cubic-bezier` + duration value.

5. **Slide vocabulary.** What variants does the source describe? Cover, chapter, statement, stats, list, quote, split, chart, end are common defaults. Add system-specific ones (e.g. `fadelist`, `treatise`, `dialog`, `ledger`, `board`) when the source names them.

---

## 2. Place the system on six character axes

This decides almost every subsequent choice. Locate the source on each axis before writing chrome:

| Axis             | One end                                                           | Other end                                                                   |
| ---------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Volume**       | **Loud** — dominant headlines, saturated accent, full-bleed color | **Quiet** — generous margins, hairlines, single muted accent                |
| **Edge**         | **Hard** — solid borders, offset solid shadows, zero radius       | **Soft** — 18–32px corners, dashed borders, tilted cards                    |
| **Era**          | **Modern** — tight grotesque, hairlines, technical mono           | **Retro** — costume chrome (bevels, scanlines, ribbons, misregister stamps) |
| **Type voice**   | **Sans grotesque** — heavy condensed display, tight tracking      | **Italic serif** — display in italic, mono labels for chrome                |
| **Accent count** | **Single signal** — one accent token used once per slide          | **Multi-color** — 3–4 saturated blocks used as full card fills              |
| **Mood**         | **Editorial / literary** — page reads like a book or magazine     | **Industrial / product** — page reads like software or specs                |

Most systems live on three or four of these axes simultaneously. The combination is what makes the showcase unique — committing to all of them at once is what makes the page feel deliberate.

---

## 3. Font decision tree

Pick by character, not by what the source nominates. The source's font is a hint; the showcase's job is to be memorable.

**Display face — pick by character:**

- **Loud editorial newspaper, brutal headlines** → Barlow 900, Anton 400, Big Shoulders Stencil 900
- **Modern condensed grotesque, design-led** → Bricolage Grotesque 800, Outfit 900, Archivo Black, Space Grotesk 700
- **Chunky playful display** → Shrikhand, Alfa Slab One, DM Serif Display
- **Italic literary serif** (the workhorse for quiet systems) → Cormorant Garamond italic, Playfair Display italic, EB Garamond italic, Lora italic, Newsreader italic, Spectral italic, Source Serif 4 italic, Crimson Pro italic, Instrument Serif italic
- **Pixel / retro display** → Press Start 2P, Pixelify Sans, Bebas Neue (oversized magazine cover)
- **Clean modern utility** → Geist 700

**Body face — pair by contrast:**

- With loud sans display → Manrope 500, IBM Plex Sans, DM Sans, Source Sans 3, Sora, Geist
- With italic serif display → same family at body weight (Cormorant 400, EB Garamond 400, Lora 400, etc.) **OR** a clean grotesque body
- With handwritten/playful display → Quicksand 500, Zilla Slab 500, PT Sans 400 (warmer, slightly slab to ground)

**Mono face — labels, chrome, code:**

- JetBrains Mono 500 — default
- IBM Plex Mono 500 — when display/body is IBM Plex
- Geist Mono 500 — when display is Geist
- VT323 — terminal feel (CRT / Win95 / arcade systems)

**Handwritten accent (optional):**

- Caveat 700 — for any system that needs a human aside. Always tilted `-2deg` to `-3deg`. One handwritten phrase per section, never throughout.

**Tracking by face type:**

- Heavy sans display: `-0.03em` to `-0.06em` (tighter the heavier)
- Condensed sans (Anton, Bebas): `0.005em` to `0.01em` — they pack themselves
- Italic serif display: `-0.012em` to `-0.025em`
- Roman serif display: `-0.018em` to `-0.025em`
- Body text: default or `-0.005em`
- Mono labels: `0.06em` (technical) or `0.14em–0.22em` (editorial uppercase)

---

## 4. Color discipline

**Always four tokens.** Even if the source gives six, collapse to four. Decorative extras live inside `.ds-slide-frame` as named CSS vars (`--pink`, `--yellow`, `--green`), not as core tokens. The four are the contract with the downstream agent.

**Derive secondary values via `color-mix`:**

```css
--ink-dim: color-mix(in srgb, var(--primary) 55%, var(--secondary));
--ink-fade: color-mix(in srgb, var(--primary) 28%, var(--secondary));
--hairline: color-mix(in srgb, var(--primary) 12%, transparent);
```

Re-skinning the entire page becomes a four-token swap. Never hard-code derived shades.

**Tint your neutrals.** Never `#000` for canvas, never `#FFF` for paper. Lean toward the system's accent:

- Warm system (fire orange, rust, ochre) → paper warmer (`#F0ECE5`, `#EDE6D2`), canvas warmer (`#111111`, `#1A1815`)
- Cool system (navy, cobalt, sage) → paper slightly cooler (`#FCFAF1`, `#F5F4F0`), canvas truly dark (`#0F1A2E`, `#0E1116`)
- Yellow / volt system → paper a hair warm, canvas near-pure (`#050505`)

**Contrast.** Accent must clear 4.5:1 against the canvas it appears on. If the spec's accent is washed out, darken/saturate it until it earns its place.

**Inverse blocks for emphasis.** The signature move: highlight one word inside a headline with the accent as background, inverting the text:

```html
<h1>SLIDE <em>HEADLINES</em>.</h1>
```

```css
.h1 em {
  background: var(--accent);
  color: var(--secondary);
  padding: 0 0.06em;
  display: inline-block;
  line-height: 0.9;
}
```

This single CSS pattern is one of the strongest moves available. Use it on the cover, manifesto, type specimen, and select template slides.

---

## 5. Surface vocabulary by character

The chrome of the showcase IS the system's chrome. Match these patterns:

**Hard / industrial / neo-brutalist:**

- 2–4px solid borders, zero radius
- Offset solid shadows: `4px 4px 0`, `6px 6px 0`, `8px 8px 0` — never blur
- Cards may tilt `±0.5°` to `±2°` for energy
- Optional background grid (`linear-gradient` 1px lines at 48–96px)

**Soft / pastel / playful:**

- Rounded corners 18–32px
- 2px ink borders
- Cards tilt `±1°` to `±1.5°`
- No drop shadows; the corner radius is the lift
- Pastel block fills, hairline dashed separators

**Quiet editorial / scholarly:**

- 1px hairlines only
- No shadows, no fills (or one cream surface inside a dark canvas)
- Generous page margins (144–168px)
- Italic serif everywhere, mono labels with `0.18–0.22em` tracking
- A single 1–2px accent rule (tick, underline) for chapter markers

**Industrial product / B2B:**

- 1px hairline borders
- 8–12px corners on cards
- Subtle 4% opacity shadow `0 4 24 rgba(0,0,0,0.04)`
- Mono labels with tight `0.06em` technical tracking
- Filled accent only on primary actions

**Retro / costume:**

- The chrome IS the costume:
  - **Win95**: 2–3px outset/inset bevels (`inset -2px -2px 0 var(--grey-dark), inset 2px 2px 0 var(--primary)`), navy gradient title bars, system status bars
  - **CRT arcade**: scanline overlay (`repeating-linear-gradient` 2/3px dark stripes), pixel borders, neon text-shadow glow
  - **Riso print**: 4–8px offset stamps in the accent color (no blur — solid block behind), halftone radial-gradient grain background, 1Hz `steps(2)` blink animations
  - **Pixel grid**: dotted radial gradient backgrounds at 24px

---

## 6. Cover headline scale — by character

The cover headline is the single most important decision on the page. Get it right and the whole showcase reads as confident.

| Character              | Scale                      | Notes                                        |
| ---------------------- | -------------------------- | -------------------------------------------- |
| Loud sans display      | `clamp(96px, 21vw, 360px)` | line-height `.85`, letter-spacing `-0.04em`  |
| Modern grotesque tight | `clamp(80px, 17vw, 280px)` | line-height `.88`, letter-spacing `-0.045em` |
| Italic serif scholarly | `clamp(80px, 15vw, 260px)` | line-height `.92`, letter-spacing `-0.018em` |
| Heavy display chunky   | `clamp(72px, 13vw, 220px)` | line-height `.88`, letter-spacing variable   |
| Quiet thesis           | `clamp(64px, 12vw, 200px)` | line-height `.95`, letter-spacing `-0.022em` |

If the cover headline doesn't dominate the page, the showcase has already failed. The cover sets the contract.

**Inverse one syllable.** The cover's strongest single move is to invert one part of the title using the accent. Examples of the shape:

- `[name]` in canvas color + `[suffix]` outlined-only or accent-block
- `[Big]` standard + `[WORD]` reversed on accent
- `[name]` standard + `.` (the dot) in accent

This is the system's character in one shape.

---

## 7. Section-by-section recipe

Build in this order. Each section has a job; don't blur them.

### Sticky nav rail (44–52px tall)

- Brand mark — a 9–14px geometric shape (square, dot, leaf, pin, diamond) in the accent — plus system name in the display font
- Section nav (mono, uppercase, `0.14em` tracking) — abbreviate to numerals/Roman if names are long
- Version meta on the right (mono or display italic)
- `backdrop-filter: blur(14px)` over translucent canvas

### Cover (`min-height: 100vh`)

<HARD-GATE>
The cover communicates the FEEL of the design system, not the story of the product. No user counts, no feature claims, no product copy, no mockup UI. The hero shows the system's visual character at maximum intensity — the accent color, the type at scale, the surface treatment, the shape language.

- **Brand name** as the headline — not a product tagline
- **Subtitle** describes the system's character ("Dark canvas, yellow voltage, flat elevation" / "Photography-led marketplace, soft shapes, single accent") — not what the product does
- **CTAs** are generic system labels ("Primary Action" / "Secondary") — not product actions ("Sign Up" / "Buy Now")
- **Decorative gesture** comes from the system's signature shape language, not from product UI components. A pill search bar IS a shape-language gesture. A markets table is NOT.
  </HARD-GATE>

**The cover must be UNFORGETTABLE.** Ask: what is the ONE visual moment someone will remember after closing this page? That moment is the cover. If the cover could belong to any brand, it belongs to none.

**Anti-convergence rule:** NEVER produce the same cover structure twice. If you catch yourself writing headline + subtitle + 2 CTAs + metadata footer grid — STOP. That's the default. Break it. Every brand gets a unique spatial composition derived from its character axes.

**Standard elements** (arrange these however the character demands — they are NOT a fixed layout):

- Brand name at the scale from §6
- One sentence describing the visual system's character (not the product)
- Primary + secondary button chrome
- 3-4 metadata labels (discipline, display font, accent, canvas)
- The brand's signature decorative gesture

**Design thinking for the cover:**

- **What's the extreme?** Commit to the character axis fully. Soft → EXTREMELY soft (overlapping rounded cards, generous whitespace, no hard lines). Dark → EXTREMELY dark (the accent is the only light). Warm → EXTREMELY warm (cream/olive/amber tones, textbook feel).
- **What's unexpected?** Asymmetry, overlap, diagonal flow, grid-breaking elements, generous negative space OR controlled density. NOT centered headline + subtitle + buttons.
- **What's the atmosphere?** Solid flat backgrounds are the default. Add depth through the system's own vocabulary — overlapping card surfaces, accent-tinted regions, the decorative gesture at architectural scale.
- **What will they remember?** One visual moment: Airbnb's pill search bar with the Rausch orb. Binance's yellow-on-near-black voltage. PostHog's hedgehog on cream. HP's skewed blue chevrons. That gesture drives the entire cover composition.

**Character-driven cover examples:**

- **Airbnb** (soft, photography-led, quiet): split layout — pill search bar as decorative gesture on left, 2×2 card grid showing card chrome vocabulary on right
- **Binance** (dark, bold, financial): full-bleed dark canvas — massive headline with accent period, yellow CTA pair, metadata on elevated card surface
- **PostHog** (warm, engineering-sketchbook): single-column on cream — weight-ladder headline, yellow pill + soft secondary CTAs, hedgehog mascot, code specimen block as the "cinematic moment"
- **HP** (commercial, angular): split — headline on left, accent-colored skewed chevron decorations flanking swatch grid on right
- **Meta** (flat, pill-shaped, confident): centered headline with pill CTAs, minimal decoration — the flatness IS the gesture

### Manifesto

- Distinct background color (usually accent or canvas-inverted)
- Same `11em / 1fr` grid as section heads — small section number left, manifesto sentence right
- Italic display at `clamp(28px, 4vw, 60px)`, `max-width: 22–30ch`
- 2–3 italicized emphasis words in the accent color
- **One sentence, three clauses max.** If you can't write one short enough, the system isn't clear enough yet.

### Palette

- 4 swatches in a row, equal width, `aspect-ratio: 3/4`
- Each swatch shows: role label (mono uppercase), name in display italic, hex in mono, one-line usage in italic body
- 1px hairline gap between swatches — they read as a single object

### Type

- 6 rows: display / h1 / h2 / lead / body / label
- Each row: 12em mono meta column on the left (face name, weight, spec), full-size live specimen on the right
- Specimen text is short and characterful: `hello world.`, `chapter one`, `the lead carries the argument...`
- The label row shows actual chrome text with the system's signature tracking

### Surface

- Two-column: demo card on the left, token list on the right
- Demo card shows: a tag, a small headline, a paragraph, a big number stat, optionally a button — _built using the system's own card chrome_
- Token list: 4–6 surface metrics (border, radius, shadow, padding, density, grid) as a striped or hairlined list with values in display italic in the accent

### Motion

- Two panels, side by side
- Left: easing name + `<pre>` with the `cubic-bezier`
- Right: duration philosophy + `<pre>` with `--dur-*` custom property declarations
- Panel chrome matches the system: offset shadows for brutalist, hairlines for quiet, etc.

### Guidelines

- Two-column do/don't
- Each column has a 56–80px italic display heading (`sic.` / `non.`, `yes.` / `no.`, `OK.` / `NO.`, whatever fits)
- 5 list items per column, each with a glyph (`§` `¶` `+` `×` `✓` `▪` `☑` `❀`) in accent or fade
- Items are concrete commitments: "Use accent for one element per slide" — not "Be intentional with color"

### Templates

- 3-column grid of 16:9 cards
- Each card: a real 1920×1080 slide rendered with placeholders, CSS-scaled into thumbnail
- Foot of each card: slide variant name in display + index chip in mono
- Use a slight contrast background so the gallery reads as its own zone

### Endcap

- Cover's mirror: single big word at maximum scale, on accent or inverted canvas
- 3 lines of right-aligned mono metadata: `<b>Name</b> · v 1.0`, font stack, build date
- End the page in the accent — leave the reader with the system's loudest note

---

## 8. The agent contract (non-negotiable)

These three blocks must be present and clearly labeled:

```html
<style id="ds-tokens">
  :root {
    --primary: #...;
    --secondary: #...;
    --tertiary: #...;
    --accent: #...;
    --f-disp: "...", serif;
    --f-body: "...", sans-serif;
    --f-mono: "...", monospace;
    /* ...derived --ink-dim, --hairline, --pad-x, --pad-y... */
  }
</style>
```

```html
<style id="template-css">
  .ds-slide-frame {
    width: 1920px; height: 1080px; position: relative; overflow: hidden;
    --c-bg: var(--secondary); --c-fg: var(--primary); /* internal aliases */
    /* ...font aliases, color aliases, dimensions... */
  }
  .ds-slide-frame .slide { width:1920px; height:1080px; ... }
  .ds-slide-frame .slide--cover { ... }
  .ds-slide-frame .slide--chapter { ... }
  /* one block per slide variant, complete enough to copy-paste */
</style>
```

```html
<template id="tmpl-source">
  <div class="tmpl" data-idx="01">
    <div class="tmpl-thumb">
      <div class="scale-wrap">
        <div class="ds-slide-frame">
          <section class="slide slide--cover">
            <h1 class="display">{{headline}}</h1>
            <p class="lead">{{body}}</p>
          </section>
        </div>
      </div>
    </div>
    <div class="tmpl-foot"><span class="name">cover</span><span class="idx">01 / N</span></div>
  </div>
  <!-- ...one per variant, all using {{placeholder}} syntax... -->
</template>
```

**Placeholders only.** Use `{{label}}`, `{{headline}}`, `{{body}}`, `{{number}}`, `{{text}}` — never real example copy. Real copy adds 5–10kb of bloat per template and confuses the downstream agent.

The runtime script that injects + scales the gallery should be the last thing in `<body>`:

```html
<script>
  (function () {
    document
      .getElementById("templates-grid")
      .appendChild(document.getElementById("tmpl-source").content.cloneNode(true));
    function rescale() {
      document.querySelectorAll(".tmpl-thumb").forEach((t) => {
        const w = t.querySelector(".scale-wrap");
        if (w) w.style.transform = "scale(" + t.clientWidth / 1920 + ")";
      });
    }
    addEventListener("load", rescale);
    addEventListener("resize", rescale);
    requestAnimationFrame(rescale);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rescale);
  })();
</script>
```

The `.tmpl-thumb` has `aspect-ratio: 16/9` and `overflow: hidden`. The `.scale-wrap` is exactly `1920px × 1080px` with `transform-origin: top left`. The script reads each thumb's width and applies the matching scale.

If the system has a shader background (Three.js + GLSL), keep the GLSL in collapsible `<details><summary>` + `<pre id="vtx-src">` / `<pre id="frg-src">` blocks. The runtime reads them at startup — the GLSL is documentation AND code.

---

## 9. Voice — write like the system speaks

Most failed showcases are technically correct but mute. The voice of every visible string — section numbers, manifesto, do/don't bullets, endcap — must sound like the system's character.

| Character       | Section numbers          | Manifesto tone                                              | Endcap                           |
| --------------- | ------------------------ | ----------------------------------------------------------- | -------------------------------- |
| Loud editorial  | `01 — palette`           | "type is _image_. accent is _environment_."                 | "end." (huge, lowercase, accent) |
| Scholarly       | `i — Palette`            | "the page is _record_. type is _voice_."                    | "_fin._" (italic, on paper)      |
| Brutalist       | `▶ 01 / PALETTE`         | "borders are _structural_. shadows are _weight_."           | "END OF FILE." (caps, accent)    |
| Playful         | `~ palette ~`            | "_yes please._ / _no thank you._" (with handwritten asides) | "thanks everyone!" (handwritten) |
| Industrial B2B  | `01 — Palette`           | "the page is a _document_. type is _precise_."              | "Thank you." (small, restrained) |
| Win95 retro     | `Palette.exe — 01 of 06` | "Surfaces are _3D_. Chrome is _structural_."                | "Shut Down." (in a window)       |
| 8-bit arcade    | `01 // PALETTE`          | "type is _display_. color is _signal_."                     | "GAME OVER." (blinking)          |
| Activist poster | `★ 01 / PALETTE`         | "the page is a _protest_. type is _volume_."                | "JOIN US." (caps, accent)        |

The mono labels everywhere should also speak in voice. A scholarly system writes `// folio · pp. 04 / 16`. A brutalist system writes `▶ CARD · EXAMPLE`. An arcade writes `▸ PRESS START`. The mono is the system's footnote voice — let it carry character too.

---

## 10. Concrete failure modes and fixes

| Failure                                                 | Fix                                                                                                                                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neutral grey-on-white page chrome                       | Re-skin every section in the system's palette. The body background isn't neutral — it's `--secondary` or `--primary`.                                       |
| Cover headline at 48–64px                               | Push to `clamp(80px, 15vw, 280px)` minimum. The cover dominates or fails.                                                                                   |
| Accent used as a 12% background wash everywhere         | Reserve accent for solid hits: one swatch, one section-head highlight, one cover-foot cell, one stat. Power comes from repetition + restraint, not opacity. |
| Filled example copy inside slide gallery                | Replace with `{{placeholders}}`.                                                                                                                            |
| Same section-head treatment six times in a row          | Vary: cover huge, manifesto on a slab, palette normal, type paired with a label. Pulse the rhythm.                                                          |
| More than 4 palette tokens at the top                   | Compress to 4. Move extras into `.ds-slide-frame` as `--c-pink`, `--c-yellow` costume vars.                                                                 |
| Reveal-on-scroll animations bolted on                   | Cut them. They bloat the file.                                                                                                                              |
| Identical 12-section showcase regardless of system      | Match section count to system density. Loud poster system needs 5 sections; scholarly system uses all 9.                                                    |
| Display font is Inter or Helvetica or system-ui         | Pick a memorable display face from §3.                                                                                                                      |
| All cards drop-shadowed identically                     | Brutalist: offset solid. Quiet: none. Modern B2B: 4% opacity. Don't mix philosophies.                                                                       |
| Manifesto reads like marketing                          | Rewrite in the system's voice. Three clauses, two italicized emphasis words, fits in 22–30ch.                                                               |
| Endcap is a meta block with the same chrome as the rest | Make it a single huge word at maximum scale, on accent or inverted canvas. Mirror the cover.                                                                |

---

## 11. Process (the actual sequence)

1. **Read the source completely.** Don't skim. Note palette, fonts, mood words, slide variants.
2. **Write the one-sentence character.** If hazy, re-read.
3. **Place on the six axes.** Loud/quiet, hard/soft, modern/retro, sans/serif, single/multi, editorial/industrial.
4. **Pick three fonts.** Display by character (§3), body to pair, mono usually JetBrains.
5. **Write the `:root` block.** Four palette tokens, three fonts, derived `--ink-dim`/`--hairline`, padding clamps.
6. **Write the `template-css` block.** All slide variants with internal alias vars (`--c-bg`, `--c-fg`, `--c-accent`) so slides re-skin cleanly.
7. **Build the outer chrome — embodying the system at every step.** Sticky rail → cover → manifesto → palette → type → surface → motion → guidelines → templates → endcap.
8. **Re-read the cover.** If you only saw the cover, would you keep going? If no, the cover is too quiet.
9. **Re-read the manifesto.** Could this sentence work as a slide in a real deck made with this system? If no, the voice is wrong.
10. **Mental squint test.** Imagine this showcase next to a generic startup landing page. Are they unmistakably different objects? If they look the same, the chrome isn't committing.

---

## 12. The three tests that catch failures

Before delivering, apply these three:

1. **Cover test.** Could a stranger glance at the cover and describe the system in one sentence? If they'd only see "design system," your cover is mute.
2. **Voice test.** Read the manifesto out loud. Does it sound like a sentence the system itself would speak? Or does it sound like generic design-system copy?
3. **Squint test.** Squint at the page so type blurs. The shapes and colors alone should communicate the system's character — loud color blocks, quiet hairlines, soft tilted cards, hard grid lines. If squinting reveals a generic page structure, the chrome isn't committing to the system.

A showcase that passes all three feels like a portfolio piece. A showcase that fails any of them feels like a spec sheet.

---

## 13. Mining the source for slide templates — the BMW M test

The default 7-template set (cover, chapter, statement, stats, quote, list, end) is a _floor_. A great showcase mines the source document for system-specific components and turns each one into its own slide variant. If the source mentions a `spec-cell`, the slide gallery has a `slide--spec` template. If it mentions a `motorsport-photo-card`, the gallery has a `slide--photo-band` template. **One signature component in the source = one slide variant in the gallery.**

Common system-specific components that must become slide variants:

| Source component pattern                            | Slide variant                                                                        | Why                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| "Photo band" / "hero photo" / "full-bleed image"    | `slide--photo-band`                                                                  | A 16:9 placeholder block + overlay caption. Full-bleed inside the 1920×1080 canvas. |
| "Spec cell" / "spec table" / numbered metrics grid  | `slide--spec`                                                                        | 3 or 4-up grid of large numbers (`{{value}}` at 96px+) with mono labels below       |
| "Model card" / "product card" / 3-up image cards    | `slide--lineup`                                                                      | Three columns of photo placeholder + name + caption + accent link                   |
| "Magazine grid" / "article cards" / editorial cards | `slide--magazine`                                                                    | Photo + category tag + title + excerpt, 2- or 3-up                                  |
| "Configurator" / "comparison" / option pickers      | `slide--compare`                                                                     | Two-column with swatches/options on left, summary on right                          |
| "Motorsport / racing / hero feature"                | `slide--feature`                                                                     | Large photo placeholder with single overlay headline                                |
| "Ledger" / "spec table rows" / 2-column data        | `slide--ledger`                                                                      | Hairline-divided rows with key/value pairs                                          |
| "CTA band" / pre-footer photo CTA                   | `slide--cta`                                                                         | Photo placeholder + centered headline + outlined button                             |
| Tricolor stripe / signature divider                 | Used **inside** other slides, not its own variant — a structural marker at slide top |

For the BMW M source: `cover`, `statement`, `spec`, `stat`, `quote`, `ledger`, `split`, `end` is good — but it should also include `photo-band` (full-bleed car image), `lineup` (3-up model cards), and `motorsport-feature` (full-bleed photo with overlay caption). Eight slides is the floor for a system this rich; ten to twelve is the target.

### Photography-led systems get photo placeholders

When the source says "photography is the brand voice" / "full-bleed automotive photography fills entire bands" / "cars are the visual subject," **every slide except the pure-statement slide gets a photo placeholder zone.** Render the placeholder as a styled empty block:

```css
.photo-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, var(--c-surface-elevated), var(--c-surface-card));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.photo-placeholder::before {
  content: "// PHOTOGRAPHY";
  font-family: var(--c-f-mono);
  font-size: 14px;
  letter-spacing: 0.18em;
  color: var(--c-dim);
  opacity: 0.5;
}
.photo-placeholder::after {
  content: "";
  position: absolute;
  inset: 24px;
  border: 1px solid var(--c-dim);
  opacity: 0.3;
}
```

This signals to the downstream agent: _replace this block with a real photo when filling slides._ Without it, the gallery reads as content-light and the system's photographic voice is invisible.

### Placeholder content must match the system's domain

Generic `+42%` is wrong for an automotive system. Mine the source for what the system actually talks about and use that as the placeholder text. For BMW M:

| Slide variant | Domain-appropriate `{{placeholder}}`                    |
| ------------- | ------------------------------------------------------- |
| Stat          | `{{number}}` = `523HP` / `3.2s` / `305KM/H` / `1,470KG` |
| Spec cell     | label = `0–100 KM/H`, value = `3.2s`                    |
| Ledger        | rows like `ENGINE → 4.4L V8 TWINPOWER`                  |
| Quote         | `"M IS NOT A LETTER. IT'S A LANGUAGE."`                 |
| Cover         | `BMW M.` / `THE ULTIMATE DRIVING MACHINE.`              |
| Photo caption | `// M4 CSL · NÜRBURGRING · 2024`                        |

For Vellum (scholarly journal): `{{number}}` becomes `42 folios` not `42%`. For Studio (design agency): `{{number}}` becomes `2003` (founded year) or `12 awards`. For 8-Bit Orbit (arcade): `{{number}}` becomes `999,999` or `LEVEL 7`.

The skill should explicitly read the source's example copy + glossary and reuse those phrases as placeholder text in the slide gallery. Generic numbers signal that the agent didn't actually read the source.

---

## 14. Surface ladder — 4 tokens is the contract, but the system needs more

The four sacred palette tokens (paper / canvas / chrome / accent) are the contract. But many systems — especially industrial, automotive, luxury, financial — have a _surface ladder_ of 3–5 dark/light surfaces that step up from canvas. The skill should extract these from the source and put them in `template-css` under `--c-surface-*` aliases:

```css
.ds-slide-frame {
  --c-bg: var(--secondary); /* canvas — true black or true white */
  --c-surface-soft: #0d0d0d; /* one notch above canvas */
  --c-surface-card: #1a1a1a; /* card surface */
  --c-surface-elevated: #262626; /* one more notch */
  --c-carbon: #2b2b2b; /* domain-specific (BMW: carbon-fiber) */
  --c-hairline: #3c3c3c; /* divider tone */
  --c-fg: var(--primary);
  --c-fg-2: #bbbbbb; /* body text */
  --c-fg-3: #7e7e7e; /* muted, captions */
  --c-accent: var(--accent);
}
```

The four `--primary/--secondary/--tertiary/--accent` at the `:root` level stay sacred for the downstream agent's re-skinning. The surface ladder lives inside `.ds-slide-frame` as costume — the agent reading template CSS gets the full vocabulary, but a simple re-theming only needs to touch the four root tokens.

**When to extract a surface ladder:** any time the source mentions more than two dark or two light surface colors (e.g., `canvas` + `surface-soft` + `surface-card` + `surface-elevated`). Industrial / luxury / automotive systems almost always have this. Editorial / scholarly systems often don't.

### Body text ladder

Same principle for type colors. The source likely names `ink` + `body` + `body-strong` + `muted`. Map these to `--c-fg` / `--c-fg-2` / `--c-fg-3` inside the slide frame. Use them in slide CSS:

- `.headline` uses `--c-fg` (pure white/black)
- `.lead` / body uses `--c-fg-2` (slightly muted)
- `.caption` / metadata uses `--c-fg-3` (very muted)

This is what makes slides feel hierarchically considered rather than flat.

---

## 15. Signature elements — find the one decorative thing

Every system has one decorative element that isn't type or palette. The skill must hunt for it explicitly:

- **Broadside**: nothing decorative — type IS the decoration
- **BlockFrame**: chunky offset shadows
- **Vellum**: drop caps + `§` marginalia glyphs
- **Daisy Days**: hand-drawn daisy SVGs scattered as decoration
- **8-Bit Orbit**: CRT scanlines + pixel glow
- **Retro Windows**: bevels + title bars
- **Sakura Chroma**: diagonal ribbon stripes
- **Pin & Paper**: tilted safety-pin SVGs
- **Scatterbrain**: sticky-note tilt + offset shadow
- **BMW M**: the M tricolor stripe (`#0066b1 → #1c69d4 → #e22718`)

The signature element appears in 3 places in the showcase, at minimum:

1. Inside the brand mark on the nav rail (small)
2. As a divider between major sections — replacing or accompanying the hairline `border-top` on `.section-head`
3. As a structural marker inside relevant slide templates (e.g., a 4px stripe at the top of the cover slide, a hairline accent rule on chapter slides)

For BMW M specifically: the M tricolor stripe must appear:

- Below the brand mark in the nav rail
- As a 4px-tall divider between the cover and the manifesto, and between the manifesto and palette
- At the top of every slide in the template gallery (`.m-stripe-slide`)

Without the signature element, the showcase looks like a generic dark system. With it consistently placed, the showcase reads as unmistakably BMW M.

### How to encode signature elements

Inline as a tiny reusable HTML pattern + CSS class. The BMW stripe is six lines of CSS and one `<div class="m-stripe"></div>` element that can be dropped anywhere:

```css
.m-stripe {
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--m-blue-light) 0% 33%,
    var(--m-blue-dark) 33% 66%,
    var(--m-red) 66% 100%
  );
}
```

Then place it three times in the page. Cheap to add, identity-defining.

---

## 16. The BMW M case — what was missing and how to fix

Looking at a typical first-pass BMW M showcase:

- ✅ Black canvas, white type, M red accent — correct
- ✅ Saira Condensed for display, Inter Light for body — correct
- ✅ M tricolor stripe present — correct
- ✅ Zero radius, hairline borders — correct
- ❌ Slide gallery uses generic stat (`+42%`) instead of automotive (`523HP`, `3.2s`)
- ❌ No `slide--photo-band` template even though "photography is the brand voice"
- ❌ No `slide--lineup` for the 3-up model card grid
- ❌ Surface ladder collapsed to 4 tokens; `surface-soft` / `surface-card` / `surface-elevated` missing from `template-css`
- ❌ Body color ladder collapsed; everything uses `--c-fg`, no `--c-fg-2` / `--c-fg-3`
- ❌ Heritage BMW blue (`#1c69d4`) missing — should be in `--c-bmw-blue` inside `.ds-slide-frame`
- ❌ Photo placeholders missing on cover, spec, split, and (added) photo-band templates
- ❌ Placeholder copy in templates is generic instead of automotive

A great BMW M showcase has all six of those failures fixed. The skill should drive the agent to actively look for each.

---

## 17. The four-test gauntlet — run before delivering

Before declaring a showcase done, run these four tests in order:

1. **Cover test** (§12.1) — can a stranger glance at the cover and describe the system in one sentence?
2. **Voice test** (§12.2) — does the manifesto sound like the system speaks, or like generic design-system copy?
3. **Squint test** (§12.3) — does the page shape alone communicate the system's character?
4. **Mine test** (§13) — has every signature component from the source become a slide variant? Has every placeholder been replaced with domain-appropriate copy? Has the signature element been placed at least three times?

A showcase that passes 4/4 is portfolio-worthy. 3/4 is good. 2/4 or fewer is a spec sheet.
