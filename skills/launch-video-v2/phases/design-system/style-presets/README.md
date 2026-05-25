# style-presets/ — how to write a new preset

A preset is a **directory** under `style-presets/`. `build-design.mjs` scans this directory for subdirectories, parses each one as a preset, merges site DNA with it, and emits `design.html`. `emit-chunks.mjs` then slices `design.html` into `chunks/*` that downstream phases consume.

This README is the **only** contract — if it doesn't appear here, it's not load-bearing. Read top-to-bottom before adding a preset.

> Stray flat `.md` files in `style-presets/` (e.g. translations like `<name>.zh.md`, the README itself) are ignored by the parser — only subdirectories are scanned. You may keep them as archives, but they take no part in builds.

---

## 1. File anatomy

```
style-presets/<preset-name>/
├── preset.md                       ← required; contains preset-meta + §A/§B/§D/§E/§G/§H/§I
└── components/                     ← required; ≥1 *.md file
    ├── <id>.md                     ← raw HTML+CSS body, no <!-- COMPONENT --> markers
    └── ...
```

`preset.md` structure:

````
```preset-meta { JSON } ```         ← machine-read; required
## §A Director's intent             ← required
## §B Decoration tokens             ← required
## §D Font pairing fallback         ← required
## §E Motion (GSAP consts)          ← required
## §G Voice transform recipe        ← required
## §H Scene composition hints       ← required
## §I Page-level CSS                ← optional
````

Parser rules:

- The `preset-meta` block MUST be the first thing in `preset.md`. Format: <code>\`\`\`preset-meta</code> + newline + `{ ... JSON ... }` + newline + <code>\`\`\`</code> + newline.
- Section headings MUST match `^##\s+§([A-Z])\s+(.+)$` (single uppercase letter, space, title). `§E.5` etc. WILL NOT be parsed as a distinct section — they fall under §E body.
- §C is unused. Do not declare it.
- §F MUST NOT appear in `preset.md` — it is synthesized from `components/*.md` at load time. The parser will error if you declare an inline `## §F` heading.
- Section order matters for human readers only; the parser keys by letter.

Component file rules:

- Filename `<id>.md` IS the component id. The id MUST match `[a-z0-9-]+`.
- File body is **raw HTML + optional `<style>` block**, typically wrapped in a single ` ```html ` fence. **Do NOT** add `<!-- COMPONENT: ... -->` / `<!-- /COMPONENT -->` markers — the parser adds them.
- Components are loaded in **alphabetical order by filename**. This determines the order they appear in design.html §6 and `chunks/index.json.components[]`. The id Phase 3 plan agent cites in `**Components:**` anchors is the filename with `.md` stripped — so **digit-prefix changes the id**: `01-hero.md` registers as id `01-hero`, NOT `hero`, which breaks the shared-id table in §F naming-convention (plan agents looking for `hero` will not find it). **Do not prefix shared-id filenames with digits.** Apply digit prefixes only to original (preset-specific) ids where you control all references, or skip ordering entirely — design.html §6 order is for human review, not pipeline correctness. Alphabetical is rarely wrong in practice.
- Empty component files error out at build time.

---

## 2. `preset-meta` JSON contract

```json
{
  "name": "neo-brutalism",
  "label": "Neo-Brutalism",
  "fingerprint": { "shadow": "hard-offset", "motion": "hit-and-stick" },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.25 }
  ]
}
```

| Field           | Required              | Used by                                                   | Notes                                                                                                   |
| --------------- | --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `name`          | yes                   | `--style <name>` flag, `chunks/index.json.preset`, stdout | kebab-case; must be unique across files in this directory                                               |
| `label`         | yes                   | design.html title card, §6 heading                        | Title-cased human label                                                                                 |
| `fingerprint`   | no                    | stdout report only                                        | Free-form key/value vocabulary; documentation, not matched                                              |
| `match_signals` | yes (but may be `[]`) | auto-inference scoring                                    | `kind` must be in the **detector whitelist** (§4); empty array = opt out of auto-inference (force-only) |

**Common mistake:** putting matching criteria in `fingerprint`. `fingerprint` is documentation only. The matcher reads `match_signals[].kind` exclusively.

---

## 3. Section contracts

### §A Director's intent

**What:** 3-6 lines of prose stating the directorial mood (edges, weight, voice, motion vocabulary, scene grammar).
**Consumed by:** `build-design.mjs` embeds it verbatim in design.html §4 as an "intent" callout.
**Format:** plain markdown. No code fences.
**Failure mode:** none — empty §A degrades to an empty paragraph, no fatal.

### §B Decoration tokens (merge into `:root`)

**What:** one ` ```css ` block declaring CSS custom properties.
**Consumed by:**

1. `build-design.mjs` extracts the block, merges with site-derived brand tokens (`--brand-primary`, `--canvas`, etc.), and writes the merged `:root { ... }` between `<!-- ROOT-START -->` / `<!-- ROOT-END -->` in design.html.
2. `emit-chunks.mjs` extracts that merged block → `chunks/tokens.css`.
3. Phase 4b scene workers paste it verbatim into each scene's `[data-composition-id="<scene-id>"] { ... }`.

**Hard rules:**

- Declare only style-specific decoration vars (shadows, borders, radii, gap units, tilts). Do NOT redeclare brand colors — those come from site DNA.
- Pixel values for visual signatures (shadow offsets, border widths). `vw` only for spacing that should scale.
- Every var name MUST start with `--` and be lowercase-with-dashes.

**Example (neo-brutalism):**

```css
--shadow-hard: 8px 8px 0 var(--ink);
--border-bold: 4px solid var(--ink);
--tilt-l: -1deg;
--gap-loud: 1.7vw;
```

### §D Font pairing fallback

**What:** three lines naming display / body / mono fallback families when brand fonts aren't on Google Fonts.
**Consumed by:** `resolveFont()` in build-design.mjs — if the brand-derived font isn't on Google Fonts, the first preset fallback that IS becomes the substitute.
**Format:** exactly three bullets in this shape:

```markdown
- **display**: `'Anton'` · `'Archivo Black'` · `'Space Grotesk'` wght 800
- **body**: `'Inter'` · `'IBM Plex Sans'` wght 500
- **mono**: `'Space Mono'` · `'JetBrains Mono'` wght 700
```

Backtick-wrapped names, separated by `·`, optional trailing `wght <num>`. The parser walks each name and accepts the first Google-Fonts-available one.

### §E Motion (GSAP consts — REPLACES site ease)

**What:** one ` ```js ` block declaring `const EASE` and `const DUR`.
**Consumed by:**

1. `build-design.mjs` writes the block verbatim between `<!-- MOTION-START -->` / `<!-- MOTION-END -->` in design.html §4.
2. `emit-chunks.mjs` → `chunks/easings.js`.
3. Phase 4b worker pastes both consts at the top of every scene's `<script>`.

**Hard rules:**

- Both `EASE` and `DUR` MUST be declared. Worker code assumes they exist.
- `EASE` MUST have keys: `entry`, `emphasis`, `exit`, `drift`. Extra keys allowed but the four roles above are referenced by the plan layer.
- `DUR` MUST have keys: `snap`, `med`, `slow`. Same rationale.
- Comment-rules in this block (e.g. `// RULE: never ease-in-out for primary motion`) are preserved into `chunks/easings.js` and read by workers — use them as inline guards.

You may optionally include a §E.5 "Motion choreography" subsection of plain prose after the code block (allowed primitives, forbidden gestures, transition defaults, type-in-motion rules). The parser keeps this under §E.content — agents read it when they read §E.

### §F Components (sourced from `components/*.md`)

**Where:** one file per component under `<preset-name>/components/`. Filename `<id>.md` IS the component id.
**Body:** raw HTML + optional `<style>` block, wrapped in a single ` ```html ` fence. **No** `<!-- COMPONENT: ... -->` markers — the parser adds them when synthesizing the in-memory §F.
**Consumed by:**

1. `build-design.mjs` concatenates all components in alphabetical order, wraps each in `<!-- COMPONENT: <id> -->` / `<!-- /COMPONENT -->`, and renders each as a live preview in design.html §6.
2. `emit-chunks.mjs` extracts each wrapped block → `chunks/components/<id>.html` and registers it in `chunks/index.json.components[]`.
3. Phase 3 plan agent references components by id in `**Components:** [\`<id>\`, ...]` anchors.
4. `prep.mjs` resolves each cited id to an absolute path → `group_spec.json.scenes[<sid>].design_chunks.components[]`.
5. Phase 4b worker pastes the chosen components' DOM + `<style>` into the scene HTML, prefixing all class names with `s<N>-` to avoid sibling collisions.

**Hard rules:**

- Filename id MUST match `[a-z0-9-]+`. Underscores and uppercase are rejected.
- ≥1 component file per preset.
- Every CSS class inside a component MUST be prefixed with a **preset-unique** namespace (`ed-`, `bn-`, `liquid-`, etc.) — picked by the preset author. The Phase 4b worker re-prefixes with `s<N>-` on top of this, but only the inner class body; the preset's prefix prevents collisions between preset components that share an id (e.g. `hero` exists in three presets, each with different CSS).
- Component CSS MUST reference brand vars (`var(--brand-primary)`, `var(--canvas)`) instead of hex literals so workers inherit the site palette.
- The `{PLACEHOLDER}` vocabulary is closed — see §5 below.

**Component file skeleton (e.g. `components/hero.md`):**

````markdown
```html
<div class="<prefix>-hero">
  <span class="<prefix>-eyebrow">{EYEBROW}</span>
  <h1 class="<prefix>-display">{HEADLINE}</h1>
  <p class="<prefix>-body">{SUBHEAD}</p>
</div>

<style>
  .<prefix > -hero {
    background: var(--canvas);
    padding: var(--gap-loud);
  }
  /* ... */
</style>
```
````

**Naming convention — when to share an id vs. invent one:**

There is no required baseline of component ids. Plan agent reads `chunks/index.json.components[]` per run and uses whatever it finds; it never assumes `hero` / `chip` / `button` exist. Sharing an id across presets is purely a hint to help cross-preset reasoning, not a contract.

| Component plays a...                                                                               | Use a shared id when...                                                               | Use an original id when...                                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **structural role** (entry-point heading, small label, action button, divider, decorative corners) | the role is identifiable across visual systems and your component fills the same slot | rarely — only when your preset literally doesn't have this role                                  |
| **visual signature** (preset-specific decoration, atmosphere layer, specialty card)                | rarely — only when another preset has the exact same role                             | always — let the id name the signature so plan/build agents see at a glance it's preset-specific |

Cross-preset id overlaps today (use these if your component fills the same role):

- `hero` — entry-point display heading
- `chip` — small inline label / tag
- `button` — primary action element
- `stat-counter` — numeric stat block
- `gradient-mesh-bg` — soft brand-color background layer
- `corner-pins` — right-angle decorations bracketing a region
- `divider-loud` — heavy section separator
- `dot-grid-bg` — repeating dot/grid wallpaper

If your component's visual is too far from the shared role (e.g. 8-Bit Orbit's "stat-block" is a cyan glass tile with L-brackets, very different from editorial's `stat-counter`), invent a new id. The id name is itself documentation: a different name signals different usage to downstream agents.

`liquid-glass` is a worked example — it shares zero ids with the other presets, because its components (`liquid-stage`, `glass-menu`, `aurora-bg-fallback`, etc.) are signature pieces with no analog elsewhere.

### §G Voice transform recipe

**What:** numbered recipe for transforming brand prose into the preset's on-screen copy register.
**Consumed by:**

1. `build-design.mjs` embeds the recipe in design.html §5 (human view) AND writes a paste-ready block bracketed by `<!-- VOICE-START -->` / `<!-- VOICE-END -->`.
2. `emit-chunks.mjs` → `chunks/voice.md`.
3. Phase 4b worker reads `chunks/voice.md` and applies the recipe to DOM text (headlines, chips, buttons) but NOT to narrator scripts (TTS-bound).

**Format:** numbered list, followed by a bolded `**Example:**` block with `IN:` and `OUT:` lines in backticks.

```markdown
1. Strip articles + connectives (the / a / of / and / with / to)
2. Break into noun-verb-noun fragments OR single dominant nouns
3. UPPERCASE all
4. Join with `.` + linebreak, OR em-dash for emphasis
5. End with brand name as one-word punchline

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `TEAMS. DESIGN. TOGETHER. — REAL-TIME. — FIGMA.`
```

**Hard rule:** the recipe applies to **on-screen text** only. Don't include guidance like "make narrator scripts shorter" — narrator scripts are Phase 2 territory and never read §G.

### §H Scene composition hints (Phase 4b layout guidance)

**What:** bullet rules for how a scene of this preset should be laid out (focal element scale, allowed backgrounds, transition defaults, sound-design hooks, stagger budgets).
**Currently consumed by:** nobody — §H is a known orphan section. It's preserved because (a) human reviewers read it, (b) it will eventually be sliced into `chunks/layout.md` and fed to Phase 4b workers (same pattern as §G → voice.md).
**Format:** plain markdown bullets. No code fences required.

**Recommendation:** write it anyway. When the §H → `chunks/layout.md` pipeline lands, every preset that already has §H starts working without re-authoring.

### §I Page-level CSS (optional)

**What:** one or more ` ```css ` blocks that style design.html **itself** (NOT the scenes).
**Consumed by:** `extractPagePresetCss()` in build-design.mjs concatenates all css blocks under §I and injects them into the design.html `<head>`.
**Purpose:** make the human-facing design.html visually consistent with the preset (e.g. neo-brutalism's design.html itself has thick borders and hard shadows).
**Hard rule:** these styles apply to design.html only. They are NOT exported to chunks and never reach scene HTML.

---

## 4. `match_signals` detector whitelist

`build-design.mjs` exposes exactly these features for matching. Any `kind` not on this list silently scores 0.

| Kind                  | What triggers it                                                                             | Currently stubbed? |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| `shadow_zero_blur`    | site shadow has non-inset offset ≥3px with blur=0                                            | live               |
| `thick_solid_border`  | site border ≥3px solid                                                                       | live               |
| `medium_solid_border` | site border = 2px solid (between hairline and thick — editorial-medium register)             | live               |
| `hairline_border`     | site border = 1px solid                                                                      | live               |
| `condensed_display`   | site display font matches `Anton\|Archivo Black\|Bebas\|Oswald\|Space Grotesk`               | live               |
| `serif_display`       | site display font matches `Serif\|Fraunces\|Spectral\|Newsreader\|Playfair\|Garamond\|Times` | live               |
| `high_sat_accent`     | accent + primary both saturation > 0.7                                                       | live               |
| `low_saturation`      | accent + primary both saturation < 0.5                                                       | live               |
| `bouncy_easing`       | site CSS easing contains `back \| elastic \| bounce`                                         | live               |
| `minimal_decoration`  | site exposes <2 shadow tokens                                                                | live               |
| `rotated_transform`   | always false — stub, hard to detect from tokens                                              | stub               |
| `generous_padding`    | always false — stub, no padding scale exposed                                                | stub               |

If you need a new detector, add it to `detectSiteFeatures()` in build-design.mjs first, then cite it in your preset.

**Weight policy:** weights need not sum to 1. The scorer computes `total / maxPossibleTotal` per preset, so what matters is the _ratio_ of matched signals to total declared. Typical weights: 0.25-0.35 for strong signals, 0.05-0.15 for tiebreakers.

**Opt-out:** `"match_signals": []` means "never auto-infer me; require `--style <name>`". Use for presets with runtime dependencies (e.g. liquid-glass needs WebGPU).

---

## 5. `{PLACEHOLDER}` whitelist

`build-design.mjs::placeholderFor()` knows exactly these tokens. Any `{UNKNOWN}` in §F renders literally as `{UNKNOWN}` — broken preview AND broken downstream paste.

| Token                                                                                                | Substituted with                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `{EYEBROW}`                                                                                          | `"Build faster"`                                                                                             |
| `{HEADLINE}`                                                                                         | site brand name                                                                                              |
| `{SUBHEAD}`                                                                                          | site tagline (truncated 80 chars) or fallback                                                                |
| `{LABEL}`                                                                                            | `"Get started"`                                                                                              |
| `{LEDE}`                                                                                             | site description (truncated 120 chars) or fallback                                                           |
| `{KICKER}`                                                                                           | `"Issue 01"`                                                                                                 |
| `{NUM}`                                                                                              | `"4M"`                                                                                                       |
| `{QUOTE}`                                                                                            | first site sample heading or fallback                                                                        |
| `{AUTHOR}`                                                                                           | `"Customer Quote"`                                                                                           |
| `{LEFT}` / `{RIGHT}`                                                                                 | column placeholder strings                                                                                   |
| `{HEADLINE_WITH_EM}`                                                                                 | preset-specific HTML with `<em>` highlights — passes through raw                                             |
| `{DO_1}` / `{DO_2}` / `{DO_3}`                                                                       | "Do" rule strings                                                                                            |
| `{DONT_1}` / `{DONT_2}` / `{DONT_3}`                                                                 | "Don't" rule strings                                                                                         |
| `{FOREGROUND_CONTENT}`                                                                               | brand-name + tagline rendered inline as raw HTML                                                             |
| `{TITLE}` / `{SUBTITLE}` / `{MESSAGE}` / `{NAME}` / `{INITIAL}` / `{LETTER}` / `{REST_OF_PARAGRAPH}` | currently fall through to literal key — if you use them, add a real substitution in `placeholderFor()` first |

If you need a new placeholder: add it to the `map` object inside `placeholderFor()` in build-design.mjs first, then cite it in §F.

---

## 6. Self-check before committing a new preset

Run from project root with a `design-system/` already prepared by `npx designlang <url>`:

```bash
# 1. Build forces your preset
node phases/design-system/scripts/build-design.mjs ./design-system --style <your-preset-name>
# 2. Verify all four anchors exist. Expected counts (verified against current
#    builds): ROOT/MOTION/VOICE = 2 each, COMPONENT = 1.
#      - ROOT/MOTION/VOICE: once in the AGENT NOTE preamble at the top of
#        design.html as documentation, once in the actual <pre class="ds-code">
#        block emit-chunks parses.
#      - COMPONENT: only the preamble line matches the LITERAL `<!-- COMPONENT:`
#        string. The actual component markers inside <pre> blocks are
#        HTML-entity-encoded as `&lt;!-- COMPONENT:` (so the markup renders as
#        visible text). emit-chunks anchors on the encoded form, NOT the raw
#        grep target — so a count of 1 here is correct, not a missing component.
#    To verify component count instead, check chunks/index.json (step 3 below).
grep -c "<!-- ROOT-START"   ./design-system/design.html   # expect 2 (≥1 required)
grep -c "<!-- MOTION-START" ./design-system/design.html   # expect 2 (≥1 required)
grep -c "<!-- VOICE-START"  ./design-system/design.html   # expect 2 (≥1 required)
grep -c "<!-- COMPONENT:"   ./design-system/design.html   # expect 1 (preamble only — components are entity-encoded inside <pre>)
# 3. Slice and verify chunks
node phases/design-system/scripts/emit-chunks.mjs ./design-system
node -e 'const i=require("./design-system/chunks/index.json"); for (const k of ["preset","tokens_file","easings_file","voice_file","components"]) if (i[k]==null) { console.error("missing",k); process.exit(1); } console.log("ok")'
# 4. Eyeball the preview (open design.html in a browser); §6 components should render, NOT show literal {PLACEHOLDER} text
```

Failure-mode quick map:

- Build errors `missing preset.md` → you wrote a flat `<name>.md` instead of `<name>/preset.md`. Move it.
- Build errors `preset.md declares §F inline` → delete the `## §F` heading from preset.md and put each component in its own `components/<id>.md` file.
- Build errors `has no components` → add at least one `components/<id>.md`.
- Build errors `component id must match [a-z0-9-]+` → rename the file to lowercase-dashed.
- Step 2 fails on any anchor → fix the corresponding § in `preset.md` (don't touch the chunker).
- Step 4 shows literal `{TOKEN}` → that token isn't in `placeholderFor()`; add it first.

---

## 7. Quick "should I add this as a new preset?" filter

- The site shows a **distinct visual vocabulary** (shadow shape, border weight, font register, motion feel) that none of the existing presets capture? → yes, add a preset.
- The site is "more saturated editorial" or "neo-brutalism with serif"? → no, ship `--style editorial` or `--style neo-brutalism` and let the brand DNA carry the difference. Presets are styles, not brands.
- The preset needs a runtime that may not be present (WebGPU, WASM, custom GSAP plugin)? → yes, but declare `"match_signals": []` and document the runtime requirement at the top of §A.

---

## 8. Migrating from `tmp/templates/<name>/`

This codebase ships ~30 slide-deck templates under `tmp/templates/<name>/`, each containing `design.md` + `template.html` + `template.json`. They are NOT presets — they're authored for static slide decks — but the design DNA inside them maps cleanly into preset shape. Use this section when the user asks "turn template X into a preset". If you're writing a preset from scratch (no template source), §1-§7 above are sufficient; skip this section.

### 8.1 File mapping (what goes where)

| Source                                     | Destination                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `template.json.slug`                       | `preset-meta.name` (already kebab-case; reuse as-is)                                         |
| `template.json.name`                       | `preset-meta.label`                                                                          |
| `template.json.mood / occasion / tone`     | `preset-meta.fingerprint` (free-form documentation vocabulary, NOT matched)                  |
| `template.json.scheme` (`dark` / `light`)  | inform §A "Best for" framing; informs whether dark base is technical (§8.2)                  |
| `design.md` frontmatter `colors`           | **discard** (site brand DNA provides colors; see §8.2 for the rare exception)                |
| `design.md` frontmatter `shadows`          | §B as `--shadow-*` tokens, **aliased to brand vars** not literal hex (§8.2)                  |
| `design.md` frontmatter `typography`       | §D font names; type-role notes flow into §A and §H                                           |
| `design.md` frontmatter `spacing`          | §B as `--gap-*` / `--pixel-unit` tokens                                                      |
| `design.md` frontmatter `canvas`           | **discard** (video is fixed 1920×1080; preset doesn't manage viewport)                       |
| `design.md` frontmatter `components`       | one file each in `components/<id>.md` after id mapping (§8.3)                                |
| `design.md` body `## Overview`             | §A Director's intent (compress to 4-6 lines, surface 1-2 signature techniques)               |
| `design.md` body `## Colors`               | mostly **discard** — keep only role-assignment logic that informs §H "Brand color placement" |
| `design.md` body `## Typography`           | §A (one line on type roles) + §H (use rules)                                                 |
| `design.md` body `## Layout`               | §H Scene composition hints                                                                   |
| `design.md` body `## Depth and Elevation`  | §A (one line) + §B (the actual shadow tokens)                                                |
| `design.md` body `## Shapes and Treatment` | §B (`--border-*` tokens) + §H (forbidden shapes)                                             |
| `design.md` body `## Do's and Don'ts`      | §H Scene composition hints (translate "do" → allowed, "don't" → forbidden)                   |
| `design.md` body `## Responsive Behavior`  | **discard** (video is fixed 1920×1080)                                                       |
| `design.md` body `## CJK & International`  | **discard** (preset doesn't manage CJK; Phase 4b worker handles locale)                      |
| `design.md` body `## Iteration Guide`      | **discard** (meta-documentation about the template, not the style)                           |
| `design.md` body `## Known Gaps`           | **discard**                                                                                  |
| `template.html` `<style>` selectors        | reference only — each `.bo-*` / `.ed-*` block in your `components/<id>.md` adapts these      |
| `template.html` `@keyframes` + transitions | §E motion (translate per §8.4)                                                               |
| `template.html` per-slide DOM              | reference for component DOM shape only — slides are not exported                             |

### 8.2 Color migration — the brand-aware contract

Templates declare specific hex colors in their frontmatter (e.g. `neon-cyan: #5edcf4`). The site brand DNA pipeline injects these vars into the merged `:root` at build time, available to every component CSS:

| Var (provided by build) | Source                        | Use when...                                             |
| ----------------------- | ----------------------------- | ------------------------------------------------------- |
| `--brand-primary`       | site brand classification     | hero text fill, primary CTA, focal element              |
| `--brand-secondary`     | site brand classification     | shadow halos, divider rules, focal stat numeral         |
| `--brand-accent`        | site brand classification     | stat blocks, secondary buttons, particle / chip accents |
| `--ink`                 | site or fallback (white/dark) | body text on the wrong-contrast surface                 |
| `--canvas`              | site or fallback canvas       | full-bleed background when no preset-base is needed     |
| `--brand-gradient`      | synthesized 3-color linear    | optional gradient backdrops                             |

**Default rule:** all colors in component CSS reference these vars, never hex. Map the template's palette to **roles**, not to literal hexes:

| Template's role (common naming)                    | Map to                                        |
| -------------------------------------------------- | --------------------------------------------- |
| "primary neon" / "hero color" / "brand color 1"    | `var(--brand-primary)`                        |
| "secondary halo" / "accent rule" / "brand color 2" | `var(--brand-secondary)`                      |
| "stat color" / "data color" / "brand color 3"      | `var(--brand-accent)`                         |
| "body text" / "supporting text"                    | `var(--ink)` (with `opacity: 0.85` if needed) |

**Exceptions (rare; declare in §B with a comment justifying the reason):** declare a literal hex in §B only when the color is a **technical prerequisite**, not a visual preference. Existing precedents:

- liquid-glass `--liquid-bg-deep: #0a0218` — aurora WebGPU shader needs a true blackpoint to render iridescence
- 8-bit-orbit `--canvas-void: #0a0e27`, `--canvas-navy: #0f1b3d` — scanline and CRT vignette overlays are visually invisible on light bases

If a color feels "important to the preset's identity" but is not technically required, drop it. Let brand DNA carry it. A preset that hardcodes its palette is no longer a style — it's a theme; presets are styles, not themes.

**Pattern: alias shadow stacks to brand vars.** When a template uses specific colors inside box-shadow stacks (e.g. `8px 8px 0 yellow`), define the shadow as a token in §B that references `var(--brand-*)`, then have components reference the token by name:

```css
/* §B */
--shadow-pixel-stack-primary:
  4px 0 0 var(--canvas-navy), 0 4px 0 var(--canvas-navy), 4px 4px 0 var(--canvas-navy),
  8px 4px 0 var(--brand-secondary), 4px 8px 0 var(--brand-secondary),
  8px 8px 0 var(--brand-secondary);

/* components/button.md */
.bo-button {
  box-shadow: var(--shadow-pixel-stack-primary);
}
```

This keeps each component CSS short, makes the preset's structural shadow logic explicit at the §B level, and lets the same shadow re-color cleanly across brand palettes.

**Pattern: `color-mix()` for low-opacity brand fills.** When a template uses low-opacity rgba of a specific color (e.g. `rgba(94, 220, 244, 0.08)` as glass tint), translate to `color-mix(in srgb, var(--brand-primary) 8%, transparent)` so the tint follows the brand:

```css
background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
border: 2px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
```

**Pattern: `color-mix()` for brand-tinted shades.** Also valid for full-saturation shade derivatives where you want a calmer or warmer version of a brand color. Mix toward `var(--canvas)` to lighten, toward `var(--ink)` to darken, or toward a documented hue-anchor (see next pattern):

```css
/* 70% brand-primary + 30% canvas — softer pastel variant */
--surface-soft: color-mix(in srgb, var(--brand-primary) 70%, var(--canvas));
/* 50% brand-secondary + 50% ink — deeper editorial shade */
--surface-deep: color-mix(in srgb, var(--brand-secondary) 50%, var(--ink));
```

**Pattern: hue-anchor tokens for preset-character colors.** When the preset's identity depends on a specific hue family (storybook pastels, butter-and-blush, etc.) that brand DNA shouldn't fully override, declare named hue-anchor tokens in §B as the second argument to `color-mix()`. This is the only case where literal hex in §B is acceptable beyond technical prerequisites — and the rationale must be documented in a comment:

```css
/* §8.2 exception: storybook palette anchors. Declared once so every
   surface/sticker mix produces a consistent register regardless of brand DNA.
   Without these anchors, dark/saturated brands would produce muddy pastels —
   breaking the storybook character. */
--anchor-cream: #fffaf0;
--anchor-butter: #fde68a;
--anchor-blush: #f7c8d4;

--surface-cream: color-mix(in srgb, var(--brand-primary) 32%, var(--anchor-cream));
--sticker-warm: color-mix(in srgb, var(--brand-primary) 50%, var(--anchor-butter));
```

Use anchor tokens (not inline hex) so the preset's anchor palette is auditable in one place. **Do not** scatter the same anchor hex across multiple component files — declare it once in §B, reference via `var()`.

**Puppeteer renders modern Chrome, so `color-mix()` is available.**

### 8.3 Component id mapping

Templates use template-native names (`label-pill`, `pixel-button`, `feature-card`, `stat-block`, `nav-dot`, `timeline-node`). Map them by **structural role** — see the shared-id list under §F "Naming convention" — not by name match. Examples observed in this codebase:

| Template name (typical)                                                                     | Map to (shared id) | Or keep original if...                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label-pill`, `tag`, `pill`, `badge`                                                        | `chip`             | shape is wildly different (e.g. notched pill)                                                                                                                                                                                                             |
| `pixel-button`, `cta`, `action-button`                                                      | `button`           | has multi-shadow stack visual that differs from other presets' buttons — but the id stays `button` since the role is identical                                                                                                                            |
| `pixel-corners`, `corner-marks`, `bracket-corners`                                          | `corner-pins`      | —                                                                                                                                                                                                                                                         |
| `quote-line`, `divider-loud`, `rule`                                                        | `divider-loud`     | —                                                                                                                                                                                                                                                         |
| `hero`, `hero-headline`                                                                     | `hero`             | —                                                                                                                                                                                                                                                         |
| `stat-counter` (offset-shadow numeral)                                                      | `stat-counter`     | —                                                                                                                                                                                                                                                         |
| `stat-block` (glass tile with L-brackets)                                                   | —                  | keep `stat-block` — visual is too different from other presets' `stat-counter`                                                                                                                                                                            |
| `bg-grid` (square grid)                                                                     | —                  | keep `bg-grid` — `dot-grid-bg` implies dots, not a 40px square grid                                                                                                                                                                                       |
| `dot-grid-bg` (dot pattern)                                                                 | `dot-grid-bg`      | —                                                                                                                                                                                                                                                         |
| `aurora-bg`, `crt-overlay`, `mesh-bg`, `glass-stage`                                        | —                  | always original — these are the preset's visual signature                                                                                                                                                                                                 |
| `feature-card`, `widget-card`, `glass-card`                                                 | —                  | varies enough across presets; original name is clearer                                                                                                                                                                                                    |
| `timeline-step`, `process-step`, `roadmap-card`                                             | —                  | **keep** as original — this is a step card that carries narrative beat ("step 1 / step 2 / step 3"), scene-level usable                                                                                                                                   |
| `timeline-rail`, `timeline-node`, `nav-dot`, `slide-counter`, `date-chip`, `page-indicator` | **drop**           | UI chrome / rails between cards — no scene-level use. The distinction from `timeline-step` above: rails and dots are _connector_ visuals that only make sense in a multi-slide deck navigation; step cards are the _content_ of each beat and carry copy. |

**Selection rule:** keep 7-15 components per preset. Drop UI affordances that only make sense in slide decks (timeline rails, nav dots, slide counters, page-flip controls) unless they translate naturally to scene-level visuals. The video has no navigation chrome.

**Tie-breaker (when 2 templates conflict on the same id):** the shared id stays with the version that's closest to "structural role"; the more decorated one renames. Example: `editorial.stat-counter` is the canonical "stat-counter" (numeral + small caption); 8-bit-orbit's glass-tile version becomes `stat-block`.

### 8.4 Motion migration — CSS transition to GSAP EASE

Templates declare CSS `cubic-bezier()` or `@keyframes`; presets need GSAP `EASE` + `DUR` consts. Translate:

| CSS pattern in template                                         | GSAP equivalent (preset)                             |
| --------------------------------------------------------------- | ---------------------------------------------------- |
| `cubic-bezier(0.22, 1, 0.36, 1)` (out-expo-ish)                 | `EASE.entry = "expo.out"`                            |
| `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)              | `EASE.entry = "power2.out"`                          |
| `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (back-overshoot)       | `EASE.entry = "back.out(1.7)"`                       |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` (mild overshoot)            | `EASE.entry = "back.out(1.4)"`                       |
| linear / `ease-in-out` on ambient layers (twinkle/breath/pulse) | `EASE.drift = "sine.inOut"`                          |
| stepped / staircase visual (pixel-grid presets)                 | `EASE.emphasis = "steps(4)"` — rare; comment-rule it |
| `ease-in` on exit motion                                        | `EASE.exit = "power2.in"`                            |
| `ease` (default smooth) on emphasis tweens                      | `EASE.emphasis = "power3.out"` or `expo.out`         |

Then map durations:

| Template transition duration | DUR key | Suggested value |
| ---------------------------- | ------- | --------------- |
| `< 0.2s`                     | `snap`  | 0.12-0.18       |
| `0.3s-0.6s`                  | `med`   | 0.4-0.5         |
| `0.8s-1.2s`                  | `slow`  | 0.8-1.0         |

**Required keys.** `EASE` MUST declare `entry`, `emphasis`, `exit`, `drift`. `DUR` MUST declare `snap`, `med`, `slow`. Extra keys are allowed and ignored by validators, but missing required keys cause runtime errors in Phase 4b workers.

**Inline guard comments.** Use `// RULE:` comments inside the block to capture template-specific motion rules — `chunks/easings.js` preserves them and workers read them as inline guards:

```js
// RULE: never tween sub-pixel positions — pixel grid breaks
// RULE: emphasis="steps(4)" applies only to opacity / numeric counters, never to position
```

**Static-source decks — no @keyframes / no transitions to translate.** Many templates ship only `deck-stage.js` (slide-navigation chrome) and have **zero content motion** on the slides themselves. Examples in this codebase: `creative-mode`, `daisy-days`, `editorial-forest`, `neo-grid-bold`. In that case there's no CSS pattern to translate; **derive EASE from the template's voice register in `design.md` body prose**:

| Register adjective in `design.md` body       | Likely `EASE.entry` / `EASE.emphasis`      |
| -------------------------------------------- | ------------------------------------------ |
| quiet / considered / unhurried / calm        | `power2.out` / `power3.out` (no overshoot) |
| bold / poster-slam / declarative             | `expo.out` / `power4.out`                  |
| bouncy / playful / storybook / hit-and-stick | `back.out(1.4)` / `back.out(1.7)`          |
| pixel / 8-bit / staircase / step             | `steps(4)` for emphasis only               |
| editorial / serif / paper / printed          | `power2.out` (subtle); avoid back/elastic  |

For `EASE.drift`, default to `sine.inOut` regardless of register — ambient layers don't carry the brand's emotional tone.

For `DUR`, pair durations to the register: terse/punchy presets stay in the lower band (snap 0.12-0.16, med 0.35-0.45); calm/editorial presets stretch toward the upper band (snap 0.18, med 0.5, slow 0.9-1.0). Do not exceed `DUR.slow = 1.0`; if the register really needs longer, document the choice with an inline `// RULE:` justifying the deviation.

`deck-stage.js` itself is **navigation chrome**, not content motion. Read it only to confirm "the deck has no content @keyframes"; do NOT translate its slide-transition curves into preset EASE (they're for inter-slide navigation, which a video doesn't have).

### 8.5 Placeholder selection

Templates have real copy in `template.html` (`<h3>Modular Blocks</h3>`). Replace with `{PLACEHOLDER}` per the slot's semantic role:

| Slot role in the component                   | Use placeholder                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| primary big text (page entry / hero text)    | `{HEADLINE}`                                                                                 |
| line above headline (eyebrow / kicker)       | `{EYEBROW}`                                                                                  |
| supporting line under big text               | `{SUBHEAD}`                                                                                  |
| small inline tag / category / chip body      | `{LABEL}`                                                                                    |
| long descriptive paragraph (lede / story)    | `{LEDE}`                                                                                     |
| stat numeral (big number)                    | `{NUM}`                                                                                      |
| pull-quote body                              | `{QUOTE}`                                                                                    |
| author / attribution under quote             | `{AUTHOR}`                                                                                   |
| two-column body (left / right halves)        | `{LEFT}` / `{RIGHT}`                                                                         |
| do/don't bullet (max 3 each)                 | `{DO_1}`-`{DO_3}` / `{DONT_1}`-`{DONT_3}`                                                    |
| issue / chapter number                       | `{KICKER}`                                                                                   |
| headline that needs `<em>` highlighted spans | `{HEADLINE_WITH_EM}` (passes through raw HTML, design.html injects preset-specific emphasis) |

**If a slot doesn't map to a whitelisted placeholder:** either rewrite the slot to fit one of the above, or add a new placeholder to `placeholderFor()` in `build-design.mjs` first. Citing an unknown `{TOKEN}` in §F will render literal `{TOKEN}` text in design.html previews AND in downstream chunks — a silent failure that's hard to debug.

**Fall-through placeholders are unsafe.** §5 lists `{TITLE}` / `{SUBTITLE}` / `{MESSAGE}` / `{NAME}` / `{INITIAL}` / `{LETTER}` / `{REST_OF_PARAGRAPH}` as "fall through to literal key". **Do not cite them in `components/*.md` without first adding a substitution to `placeholderFor()`** — they render the literal token string in design.html (e.g. `{LETTER}` appears as the text `{LETTER}`), then propagate into `chunks/components/<id>.html`, then into rendered scenes. Workers won't know to fix them.

Three escape hatches when you need a slot that fall-through tokens would have covered:

1. **Hardcode a meaningful literal.** For decorative slots like a feature-card icon-letter, write a literal `A` / `B` / `C` directly in the component body — different on each variant if you want variety. Add a TODO comment **inside the ` ```html ` fence** (see "Comment placement" below).
2. **Extend `placeholderFor()`.** If the slot is going to be reused across presets, add the new token + substitution in `build-design.mjs::placeholderFor()` (and document it in §5 of this README). This is in-scope for preset authoring when justified.
3. **Promote to a real semantic slot.** If you're tempted by `{TITLE}`, ask whether you actually mean `{HEADLINE}` or `{KICKER}`. Most "title-like" copy fits one of the whitelisted roles already.

**Comment placement (TODO / NOTE / explanation).** Put any comment inside the ` ```html ` fence as an HTML comment, not as markdown commentary outside the fence:

````markdown
✓ correct — comment lives inside the fence:

```html
<!-- TODO: cycle the bf-feature-icon-* class per instance -->
<div class="bf-feature-card">...</div>
```

✗ wrong — comment outside the fence leaks into the chunk as raw markdown,
including the fence delimiter itself:

<!-- TODO: ... -->

```html
<div class="bf-feature-card">...</div>
```
````

Why: `emit-chunks.mjs::stripCodeFence` removes only the outermost ` ``` ` markers from the body. Anything outside the fence survives into `chunks/components/<id>.html` verbatim, including the literal ` ```html ` line — which then breaks the chunk as paste-ready HTML. HTML comments inside the fence are valid HTML, survive cleanly into chunks, AND double as inline guidance for Phase 4b workers reading the chunk.

### 8.6 Class prefix naming

Pick a 2-4 char lowercase-dash prefix that won't clash with brand DNA vars (`--brand-*`), scene-worker prefixes (`s<N>-`), or other preset prefixes. Existing precedents:

| Preset name     | Prefix                                                | Rationale                                                                                              |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `editorial`     | `ed-`                                                 | initialism, 3 chars                                                                                    |
| `neo-brutalism` | `bn-`                                                 | initialism (brutal-neo or brutalism-n), 3 chars                                                        |
| `liquid-glass`  | `liquid-` (CSS classes), `lg-` (decoration vars only) | "lg-" reserved for `--lg-*` decoration vars; full word for classes                                     |
| `8-bit-orbit`   | `bo-`                                                 | initialism of "bit-orbit"; digit dropped (CSS class names should not start with a digit by convention) |

**Rule:** ≤4 chars when possible. If the preset name starts with a digit, drop it from the prefix. Document the choice in §A or in a comment in the first component file so future maintainers know the prefix.

### 8.7 Section content sourcing — what to write in each §X

| Section | Source from template                                                                             | What to add (not in template)                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| §A      | `design.md` `## Overview` (compress to 4-6 lines), `## Depth and Elevation` (one signature line) | "Best for / avoid for" framing; brand-aware color contract; any technical-color exceptions                                                         |
| §B      | `design.md` frontmatter `shadows` + `spacing` (signature ones only)                              | Brand-aware aliasing (§8.2); ≤2 hex tokens if technically required (with comment)                                                                  |
| §D      | `design.md` frontmatter `typography.{display, body, mono}` font names                            | 2-3 Google Fonts fallbacks per role, in `wght <num>` format                                                                                        |
| §E      | `template.html` `@keyframes` + transitions, translated per §8.4                                  | EASE.{entry, emphasis, exit, drift} + DUR.{snap, med, slow} as required keys; `// RULE:` inline guards                                             |
| §G      | **nothing** — templates don't ship voice recipes                                                 | Write a 3-6 step numbered recipe + 1 IN/OUT example. Derive from typography rules (UPPERCASE label vs sentence body, mono labels, tracking values) |
| §H      | `design.md` `## Layout`, `## Do's and Don'ts`, `## Shapes and Treatment`                         | Per-scene composition rules (surface alternation, hero focal sizing, brand-color role contract, transition vocabulary)                             |
| §I      | inferred from `template.html` aesthetic chrome (optional)                                        | CSS that styles design.html itself — only if you want the doc preview to read as the preset                                                        |

### 8.8 Final migration checklist

Copy this when migrating; tick as you go:

- [ ] `template.json` → `preset-meta.{ name, label, fingerprint }`
- [ ] `template.json.scheme` informs `match_signals` choice: closed-base presets (dark scheme that requires technical dark base) → `[]`; otherwise pick 2-4 detector kinds from §4 with weights 0.05-0.35
- [ ] `design.md.frontmatter.colors` discarded; ≤2 hex declarations in §B if technically required (with comment explaining why)
- [ ] `design.md.frontmatter.shadows` → §B as `--shadow-*` tokens aliased to `var(--brand-*)`
- [ ] `design.md.frontmatter.spacing` → §B `--gap-*` / `--pixel-unit`
- [ ] `design.md.frontmatter.typography` display/body/mono → §D with fallbacks; role hints captured in §A
- [ ] `design.md.frontmatter.components` → 7-15 `components/<id>.md` files, with template names mapped per §8.3
- [ ] Every component CSS uses `var(--brand-*)` / `var(--ink)` / `var(--canvas)` / preset's own §B tokens — never raw hex (except inside §B's exception hexes)
- [ ] Class prefix chosen per §8.6
- [ ] Placeholders cited per §8.5; all match the whitelist in §5
- [ ] §E EASE has required keys `entry/emphasis/exit/drift`; DUR has required keys `snap/med/slow`; `// RULE:` guards capture template-specific motion rules
- [ ] §G written (3-6 step recipe + IN/OUT example), derived from template's typography rules
- [ ] §H written (surface alternation, focal sizing, brand-color role contract, transition vocabulary)
- [ ] §I optional but recommended if the preset has strong page-chrome character
- [ ] Self-check command sequence in §6 passes (all 4 anchors present, `chunks/index.json` has all required keys)
- [ ] design.html preview eyeball-checks: §6 components render with brand colors flowing through, no literal `{TOKEN}` text
