# Design Picker

Two-phase visual picker: mood boards first (pick a complete direction), then fine-tune individual categories.

## Prerequisites

Read these before generating options — they define the rules your options must follow:

- [typography.md](typography.md)
- [../house-style.md](../house-style.md)
- [video-composition.md](video-composition.md)
- [../visual-styles.md](../visual-styles.md)
- [beat-direction.md](beat-direction.md)

## Creative process (do this BEFORE writing any data)

<HARD-GATE>
Do NOT skip to the data format section. Do NOT start generating architecture HTML. Complete the creative thinking below FIRST. If you jump straight to code, every project will look the same.
</HARD-GATE>

### Step 1: What is unique about THIS prompt?

Before generating anything, answer these questions about the specific brief:

- **What does this subject LOOK like?** Not generically — specifically. A Santorini travel video has white walls, blue domes, caldera cliffs. A hantavirus PSA has clinical sterility, warning signage, laboratory imagery. A rocket promo has exhaust plumes, mission control grids, countdown typography. The visual vocabulary of the subject should drive the layouts.
- **What does the target emotion FEEL like as a frame?** Wanderlust is longing — empty space the viewer wants to fill. Urgency is compression — information crowding the viewer. Awe is scale — one element so large it overwhelms.
- **What does the surface context demand?** A lobby screen is ambient and glanced-at. A YouTube pre-roll is competing for attention. A social story is vertical and fast. The same content looks different in each context.
- **What does every other video for this subject look like?** That's what you must NOT produce for at least 3 of your 9 boards. If every travel video is a hero image with text overlay, your rare boards shouldn't be hero images with text overlay.

### Step 2: Verbalized sampling

Generate 9 video concepts for the brief using chain-of-thought reasoning.

First, produce a single `reasoning` field — a string containing your step-by-step thought process through five genuinely different paths:

1. **From the subject** — what is the visual world of this specific thing?
2. **From the emotion** — what does the target feeling look like as a layout?
3. **From the audience** — what does this viewer expect? What would surprise them?
4. **From the anti-pattern** — what does every competitor do? Do the opposite.
5. **From an unusual format** — a letter, a recipe, a countdown, a newspaper, a Q&A, a map, a poem. What non-video format could this content take?

Then return the concepts as JSON:

```json
{
  "reasoning": "Step-by-step thought process through all 5 paths, generating 9 concepts from them...",
  "responses": [
    {
      "text": "Video concept with layout wireframe description and silhouette of major elements",
      "probability": 0.35
    },
    {
      "text": "...",
      "probability": 0.07
    }
  ]
}
```

9 entries in `responses`. Each `text` describes the video concept including layout wireframe and silhouette of major elements. No extra explanation.

Each `probability` is the estimated probability (0.0–1.0) of this response given the input prompt, relative to the full distribution.

**Sample from the tails:** at least 3 of the 9 concepts MUST have probability < 0.10. These are the rare, unexpected directions that prevent mode collapse. If all 9 score above 0.10, you're reproducing the median — start over.

**Anti-mode-collapse check:** verify no two concepts share the same layout silhouette. Draw the bounding boxes of major elements mentally — if two produce the same shape, replace one.

### Step 3: Generate the data

Now — and only now — expand the 5 concepts into architectures, palettes, type pairings, and mood boards.

**Mood boards** (9) — one per concept. Each tells a different STORY, not a different color scheme on the same layout.

**Architectures** (9) — one per mood board, each a different structural shape. See the structural diversity section below for layout shapes.

**Palettes** (6-9) — named after the subject's world. A Santorini picker has "Aegean Blue", "Caldera Pink", "Oia Cream" — not "Dark Premium" or "Warm Editorial." Mix light + dark + tinted.

**Type pairings** (6-9) — **RUN the font discovery script from typography.md FIRST.** Match the subject's energy.

**Backgrounds** (one per architecture) — each mood board can have an animated 3D gradient background rendered with Three.js. The picker includes built-in presets PLUS 3 prompt-contextual options you generate.

#### Built-in presets

These are baked into the picker template. The user selects one and tweaks its controls:

| Preset       | Geometry   | Shader   | Feel                                      |
| ------------ | ---------- | -------- | ----------------------------------------- |
| None         | —          | —        | Flat color, no animation                  |
| Halo         | plane      | defaults | Warm flowing gradient, organic undulation |
| Mint         | waterPlane | defaults | Cool water surface, gentle waves          |
| Cosmic       | sphere     | cosmic   | Holographic nebula, iridescent shimmer    |
| Nighty Night | waterPlane | defaults | Dark moody waves, deep atmosphere         |
| Sunset       | sphere     | defaults | Warm sphere glow, gentle color blend      |
| Cotton Candy | waterPlane | defaults | Pastel soft waves, light and airy         |
| Glass        | waterPlane | glass    | Refractive surface, specular highlights   |
| Blob         | sphere     | defaults | Wiggly organic shape, high displacement   |

Each preset has contextual controls (speed, wave height, wobble, etc.) that the user adjusts live.

#### Prompt-contextual backgrounds (generate 3)

In addition to the built-in presets, generate **3 entirely new background styles** — new fragment shaders, new configurations, new control sets. The built-in presets (`defaults`, `cosmic`, `glass`) are templates showing how the Three.js pipeline works. Your 3 backgrounds should be original visual effects that match the prompt's world.

##### How the pipeline works

Each background is a Three.js scene with:

1. **Geometry** — `sphere` (SphereGeometry), `water` or `plane` (PlaneGeometry with subdivisions)
2. **Vertex shader** — shared across all backgrounds. Applies 3D Perlin noise displacement to vertices. Controlled by `uDensity` (noise scale), `uSpeed` (animation rate), `uStrength` (displacement magnitude).
3. **Fragment shader** — this is where you create the visual effect. Receives `vPos` (displaced vertex position), `vNormal`, `vViewPos`, `uColor1/2/3` (3 palette colors), `uTime`, `uSpeed`. Must output `gl_FragColor`.
4. **Camera** — positioned via spherical coordinates (`camAz`, `camPol`, `camDist`). Spheres always use distance 14 with `zoom` controlling magnification. Planes/water use `camDist` directly.
5. **Controls** — 2-3 sliders the user adjusts live. Each maps to a uniform or mesh property.

##### Writing a custom fragment shader

The fragment shader receives these varyings/uniforms:

```glsl
varying vec3 vPos;      // displaced vertex position in model space
varying vec3 vNormal;   // surface normal (for lighting)
varying vec3 vViewPos;  // view-space position (for fresnel/specular)
uniform vec3 uColor1, uColor2, uColor3;  // 3 palette colors
uniform float uTime, uSpeed;             // animation time + speed
```

Use `vPos` for spatial color mapping — the gradient pattern comes from mapping colors to vertex positions. Use `vNormal` and `vViewPos` for lighting (diffuse, specular, fresnel). Add custom visual effects: interference patterns, noise-based distortion, view-dependent color shifts, rim glow, etc.

Example — a "coral reef" fragment shader for a tropical video:

```glsl
void main() {
  vec3 base = mix(mix(uColor1, uColor2, smoothstep(-3.0, 3.0, vPos.x)),
                  uColor3, smoothstep(-2.0, 2.0, vPos.z));
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  // Subsurface scattering — warm glow through the surface
  float sss = pow(max(0.0, dot(-n, v)), 2.0) * 0.3;
  vec3 sssColor = mix(uColor2, uColor1, 0.5);
  // Caustic ripples on the surface
  float t = uTime * uSpeed;
  float caustic = abs(sin(vPos.x * 15.0 + t * 2.0) * cos(vPos.y * 12.0 + t * 1.5)) * 0.15;
  // Lighting
  vec3 l = normalize(vec3(1, 1, 0.5));
  float diff = max(dot(n, l), 0.0) * 0.25;
  float spec = pow(max(dot(n, normalize(l + v)), 0.0), 64.0) * 0.2;
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 4.0);
  vec3 col = base * (0.65 + diff) + vec3(spec) + sssColor * sss + vec3(caustic);
  col += mix(base, vec3(1), 0.3) * fresnel * 0.15;
  gl_FragColor = vec4(col, 1.0);
}
```

##### Custom preset format

```json
{
  "name": "Coral Reef",
  "desc": "Warm underwater glow with caustic ripples",
  "type": "water",
  "shader": "coral_reef",
  "fragmentShader": "void main() { ... }",
  "density": 1.4,
  "speed": 0.15,
  "strength": 2.8,
  "rotX": 40,
  "rotY": 0,
  "rotZ": 10,
  "camDist": 4.0,
  "camAz": 175,
  "camPol": 75,
  "zoom": 1,
  "posX": 0,
  "posY": 0.5,
  "posZ": 0,
  "controls": [
    { "label": "Speed", "key": "speed", "min": 0.05, "max": 0.5, "step": 0.05 },
    { "label": "Wave height", "key": "strength", "min": 0.5, "max": 5.0, "step": 0.2 },
    { "label": "Caustic intensity", "key": "density", "min": 0.5, "max": 3.0, "step": 0.1 }
  ]
}
```

When `fragmentShader` is present, the picker uses it directly instead of looking up `shader` in the built-in library. The `shader` field is still set for the design.md export (agents use it as a label).

##### Guidelines

- **Write new GLSL, don't just reconfigure existing presets.** The visual effect should be unique to the prompt. A PSA video gets a "biohazard pulse" shader with expanding rings and scan lines. A food video gets an "oil shimmer" shader with heat-distorted refraction. A music video gets a "frequency" shader with audio-reactive bands.
- **Match the subject's physical world.** The shader should feel like looking at the subject's environment at a microscopic or atmospheric level.
- **Pick geometry by metaphor.** `sphere` = contained, focused. `water` = expansive, environmental. `plane` = flat, graphic.
- **Name after the prompt's world**, not the technique.
- **2-3 controls per preset** that expose the parameters most relevant to the visual effect.

Camera rules:

- **sphere**: `camDist` ignored (always 14). `zoom` controls magnification (1 = full sphere, 15+ = surface detail). Higher zoom needs lower `strength`.
- **water/plane**: `camDist` controls distance. `zoom` always 1. `posY` shifts the mesh vertically.

Append the 3 custom backgrounds to the `BG_PRESETS` array via `BG_PRESETS.push(...)` after the built-in presets. If the preset has a `fragmentShader` field, register it in `window._sgShaders` so the Three.js module can use it.

**Injection point:** `BG_PRESETS` is declared AFTER the placeholder variables (`__ARCHITECTURES_JSON__` etc.) in the template. Insert `BG_PRESETS.push(...)` calls and `window._sgShaders[key] = '...'` assignments immediately AFTER the `BG_PRESETS` closing `];` — the marker for this is the line `var seControls = document.getElementById("se-controls");` which directly follows. Do NOT inject before `var CORNERS` or any other variable declared before `BG_PRESETS` — the array doesn't exist yet at that point and you'll get `Cannot read properties of undefined (reading 'push')`.

## Alternative: Template-based picker

Use this flow instead of generated moodboards when the user wants to browse pre-built visual directions. The templates come from the `beautiful-html-templates` library (34 HTML slide decks with diverse visual identities).

### When to use

- User says "show me templates", "browse options", or "what styles are available"
- User brings an existing brand/design.md and wants to see it applied across templates
- User wants to skip the creative brainstorming and pick from proven designs
- The prompt is for a presentation deck rather than a video composition

### When design.md exists: agent-crafted DESIGN.html + picker fine-tuning

When the project has a `design.md`, the agent WRITES a bespoke DESIGN.html first (via [design-showcase.md](design-showcase.md)), then the picker loads it for fine-tuning. The DESIGN.html is NOT generated from a generic template — it's crafted to embody the brand's visual personality.

**Flow:**

1. Agent reads design.md + [design-showcase.md](design-showcase.md)
2. Agent writes `DESIGN.html` — bespoke hero, sections styled to the brand's character axes
3. Build script parses design.md for colors/fonts, generates Phase 1 preview slides, builds picker HTML
4. Picker loads with "Your Design" as first card, auto-advances to Phase 2
5. Phase 2 loads the agent-crafted DESIGN.html in the iframe preview
6. User fine-tunes palette, typography, corners, density, depth, shader
7. User exports final DESIGN.html

**The build script still handles mechanical parts:**

- Parsing design.md for colors/fonts (for palette chips and NATIVE_PALETTES)
- Generating Phase 1 template.html preview slides (6 video-frame archetypes)
- Injecting `var DESIGN_MD = {...}` for auto-advance
- Prepending `user-design` to `ALL_TEMPLATES` with `_provided: true`

**But the DESIGN.html itself is agent-crafted, not template-generated.** An HP design.md produces angular chevrons, 4px button corners, and soft-lift shadows. A Meta design.md produces pill-shaped elements, 32px card radius, and flat elevation. Same 7 sections, completely different visual treatment.

**Color extraction for the build script:**

| design.md concept                          | Picker role            | Extraction pattern                  |
| ------------------------------------------ | ---------------------- | ----------------------------------- |
| `{colors.ink}` / text color                | `primary` (text on bg) | `ink` + hex                         |
| `{colors.canvas}` / background             | `secondary` (canvas)   | `canvas` + hex                      |
| `{colors.charcoal}` or `{colors.graphite}` | `tertiary` (muted)     | `charcoal`/`graphite`/`muted` + hex |
| `{colors.primary}` / brand accent          | `accent`               | `colors.primary` + hex              |

**Font resolution (priority order):**

1. **Check `fonts/` directory** in the project for `.woff2` files matching the design.md font family. Match by filename: `BinanceNova-Regular.woff2` → "BinanceNova". If found, use `@font-face` declarations pointing to local files.
2. **Check Google Fonts availability.** If the font is open-source and hosted (IBM Plex Sans, Inter, Montserrat), use the `<link>` tag directly — no substitute.
3. **Fall back to substitute** from design.md's "Font Substitutes" section — first `**FontName** at weights` bullet.

| design.md concept   | Extraction                                                          |
| ------------------- | ------------------------------------------------------------------- |
| Primary font family | `single-family: **FontName**` or `**FontName** is the system's` pat |
| Local font files    | `fonts/*.woff2` filename matching the family name                   |
| Google Fonts        | Font name exists in Google Fonts catalog → use directly             |
| Usable substitute   | First `**FontName** at weights` in substitute bullet list           |

**Phase 1 preview slides (minimum 6) — generated by build script, NOT the DESIGN.html:**

These are the slides shown in the Phase 1 template card and Phase 2 specimen grid. They're generated mechanically by the build script from design.md colors/fonts. They are NOT the DESIGN.html content — that's crafted by the agent separately.

These slides are VIDEO FRAMES, not website components. Each renders at 1920×1080 and should look like a paused frame from a real composition. Cinematic scale, hero typography, deliberate whitespace.

| #   | Slide              | Frame type   | Key elements                                                                                                                                                                                                         |
| --- | ------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Hero**           | Hook frame   | Split layout: brand name at 130px with accent period + accent-colored skewed decorative slashes flanking swatches on right. CTAs. This IS the first impression — it must have visual weight and a signature gesture. |
| 2   | **Feature reveal** | Proof frame  | Split: product photo placeholder (left) with accent "New" badge, specs + copy (right). Shows how product/announcement frames compose. NOT a palette swatch page.                                                     |
| 3   | **Data grid**      | Proof frame  | 3 stat cards with large accent numbers, progress bars, supporting copy. Shows how metrics render in the design system. NOT a type specimen.                                                                          |
| 4   | **Split content**  | Action frame | Split frame: content left (heading + body + CTAs), data right (2 large accent-colored stat numbers stacked). Shows the workhorse layout for proof-point scenes.                                                      |
| 5   | **Quote**          | Hold frame   | Centered pull-quote with oversized accent quotation mark, attribution, accent rule. The contemplative beat.                                                                                                          |
| 6   | **Dark close**     | Close frame  | Inverted surface (primary becomes bg, secondary becomes text). Centered headline, subtitle, dual CTAs. Every video ends here.                                                                                        |

**These are VIDEO FRAMES, not design reference pages.** Palette swatches and type specimens belong in the design.html page (the fine-tune preview), not in the template slides. Each slide should look like a paused frame from an actual composition the agent would build.

<HARD-GATE>

### CSS token contract — NON-NEGOTIABLE

The picker sidebar has 6 config controls: palette, typography, corners, density, depth, and shader background. ALL of them must visually affect BOTH the design.html page AND the slide thumbnails. This only works if every CSS value that should respond to config uses `var()` refs instead of hardcoded values.

**The rule:** NEVER write a hardcoded `border-radius`, `padding`, `gap`, `box-shadow`, or color hex in any design template CSS. Use the token vars.

**Files this applies to:**

1. `presentations/<slug>/design.html` — the fine-tune preview page
2. `presentations/<slug>/summary.html` — the slide card content rendered inside `.ds-slide-frame`
3. `build-design-picker.py` → `generate_user_design()` → `template.html` CSS — the Phase 1 card + Phase 2 specimen slides

**Token var mapping:**

| Config control    | CSS var                                                                                        | What it affects                                                 | Fallback                             |
| ----------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| Palette           | `--bg`, `--fg`, `--mt`, `--ac` (or `--primary/--secondary/--tertiary/--accent` in design.html) | All colors                                                      | N/A — always set                     |
| Palette (derived) | `--hair`, `--surf`, `--dim`                                                                    | Hairline borders, surface tints, dimmed text                    | `color-mix()` from primary+secondary |
| Typography        | `--f-disp`, `--f-body` (in design.html), font injection via `<link>` + JS in slides            | Font families                                                   | Inter                                |
| Corners           | `var(--cr)`                                                                                    | `border-radius` on every card, swatch, panel, badge, button     | `12px`                               |
| Density           | `var(--pad)`, `var(--gap)`                                                                     | `padding` on cards/panels/cells, `gap` on grids                 | `20px`, `16px`                       |
| Depth             | `var(--shadow)`                                                                                | `box-shadow` on every container (card, panel, swatch, specimen) | `none`                               |

**Where vars must appear:**

In **design.html** `:root`:

```css
:root {
  --cr: __CORNER_RADIUS__;
  --pad: __PADDING__;
  --gap: __GAP__;
  --shadow: __SHADOW__;
}
```

In **summary.html** CSS (with fallbacks since it loads inside `.ds-slide-frame`):

```css
.card {
  border-radius: var(--cr, 12px);
  padding: var(--pad, 28px);
  gap: var(--gap, 12px);
  box-shadow: var(--shadow, none);
}
.swatch {
  border-radius: var(--cr, 12px);
  padding: var(--pad, 20px);
  box-shadow: var(--shadow, none);
}
.row {
  gap: var(--gap, 24px);
}
```

In **template.html** CSS (generated by build script):

```css
:root {
  --cr: 12px;
  --pad: 20px;
  --gap: 16px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.card {
  border-radius: var(--cr);
  box-shadow: var(--shadow);
  padding: var(--pad);
}
```

**Inline style attributes MUST use var() refs, not literal hex:**

```html
<!-- WRONG — picker can't change this -->
<div style="background:#1a1a1a;border-radius:12px">
  <!-- RIGHT — responds to config changes -->
  <div style="background:var(--fg);border-radius:var(--cr)"></div>
</div>
```

**How the picker updates each file type:**

- `design.html`: rebuilt from scratch via `renderDesignIframe()` — fetches HTML, does `__TOKEN__` replacement, writes blob URL to iframe. All tokens get fresh values every render.
- `summary.html` slides inside design.html: scoped under `.ds-slide-frame` with `--cr`/`--pad`/`--gap`/`--shadow` set on the scope. CSS vars cascade into the slides.
- `template.html` slides (Phase 1 cards + Phase 2 specimen): `updateSlideIframes()` rewrites the `:root` block inside the iframe's `<style>` tag via `contentDocument`.

**After generating or editing any design template file, run the lint:**

```bash
python3 skills/hyperframes/scripts/lint-design-html.py presentations/<slug>/design.html
```

This catches: hardcoded `border-radius` (use `var(--cr)`), hardcoded colors in CSS (use `var()`), missing `var(--shadow)` on containers, missing `var(--gap)` on grids, missing token sentinels. Fix every warning before serving.

</HARD-GATE>

**Design principles for video frame slides:**

- Every slide uses only `var()` refs to palette + surface tokens — no hardcoded colors, radii, padding, or shadows
- Accent color appears on exactly ONE focal element per frame (the stat number, the quotation mark, the period after the headline)
- Hero must have a decorative gesture using the accent color (skewed rectangles, geometric accents) — not just text on a flat background
- Typography at VIDEO scale: hero 130px, section 48px, body 20px, labels 13px. Nothing under 10px.
- Font is the substitute extracted from design.md's font section

The substitute font is used because proprietary fonts (e.g., Forma DJR Micro) won't load from Google Fonts.

### Step 1: Generate contextual data from the prompt

Generate a JSON object with three keys. This is the creative work — match everything to the prompt's subject and energy.

**`palettes`** — 6 color palettes themed to the prompt. Always include `{"name":"Default", "bg":"__DEFAULT__"}` as the first entry (preserves original template colors). Each non-default palette has: `name`, `bg`, `fg`, `ac` (accent), `mt` (muted). Name palettes after the prompt's world, not generic labels.

When generating `pick-design.html` for the fine-tune step, also include a "Template Original" palette as the first entry in the `PALETTES` array. Extract the template's native colors from its `:root` CSS variables so the user can revert after trying other palettes.

**`prompt_text`** — text pools for injecting into templates. Every template gets its placeholder text replaced with prompt-contextual content. The pools:

| Key          | What it is                                                                           | Count needed | Example (for a coffee brand)                                                |
| ------------ | ------------------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------- |
| `headline`   | Brand/product name for display slots                                                 | 1 string     | `"ROASTHAUS"`                                                               |
| `sub`        | One-line descriptor                                                                  | 1 string     | `"Specialty Coffee Roasters"`                                               |
| `taglines`   | Object with 6 tone keys: `bold`, `editorial`, `playful`, `dark`, `technical`, `warm` | 6 strings    | `{bold: "WAKE UP DIFFERENT", editorial: "The Art of the Morning Cup", ...}` |
| `headlines`  | Slide-level headlines                                                                | 10+ strings  | `"Single Origin. Zero Compromise."`                                         |
| `body`       | Paragraph-length descriptions                                                        | 8+ strings   | `"We source from 12 farms across 3 continents..."`                          |
| `stats`      | Short metrics with units                                                             | 10+ strings  | `"12M+", "47°C", "98.6%"`                                                   |
| `statLabels` | Labels for the stats                                                                 | 10+ strings  | `"Cups Served", "Optimal Temp", "Satisfaction"`                             |
| `labels`     | ALL-CAPS chip/tag labels                                                             | 12+ strings  | `"ESPRESSO", "COLD BREW", "SUBSCRIPTION"`                                   |
| `smalls`     | CTAs, links, small UI text                                                           | 12+ strings  | `"Shop Now →", "Free Shipping", "Our Story"`                                |

**Vary word counts within each pool.** The template picker matches replacement text to the original's word count to preserve layout. If every headline is 5 words, a template with a 2-word heading slot has no good match. Include a range:

- `headlines`: mix of 2-word (`"Zero Compromise."`), 4-word (`"From Farm to Cup"`), and 6+ word entries
- `body`: mix of 1-sentence (10-15 words) and 2-sentence (20-30 words) entries
- `smalls`: mix of 1-word (`"Subscribe"`), 2-word (`"Shop Now"`), and 3-word (`"See the Farms"`) entries
- `labels`: keep these 1-2 words each (they replace chip/tag text)

The `taglines` object controls the display-level text per template. Each template gets assigned a tone based on its metadata:

- `dark` — templates with `scheme: "dark"`
- `warm` — templates with `density: "low"`
- `technical` — templates with `density: "high"`
- `playful` — templates whose tagline matches playful/cheerful/friendly/fun
- `editorial` — templates whose tagline matches editorial/serif/literary/magazine
- `bold` — everything else (default)

**`prompt_desc`** — one-line description shown in the picker header. Example: `"Exciting promo video for HeyGen"`.

### Step 2: Ensure templates are available

```bash
if [ ! -d /tmp/beautiful-html-templates ]; then
  git clone --depth 1 https://github.com/zarazhangrui/beautiful-html-templates.git /tmp/beautiful-html-templates
fi
```

### Step 3: Build and serve the picker

```bash
mkdir -p .hyperframes

# Symlink templates into the project for iframe access
ln -sf /tmp/beautiful-html-templates/templates templates

# Symlink design.html + summary.html into each template dir (Phase 2 fetches from templates/<slug>/design.html)
for slug in $(ls skills/hyperframes/templates/presentations/); do
  for f in design.html summary.html; do
    src="skills/hyperframes/templates/presentations/$slug/$f"
    [ -f "$src" ] && [ -d "templates/$slug" ] && ln -sf "$(pwd)/$src" "templates/$slug/$f"
  done
done

# Write data.json via Python (don't hand-escape in sed)
# Then generate the picker HTML
cat data.json | python3 skills/hyperframes/scripts/build-template-picker.py \
  --template skills/hyperframes/templates/template-picker.html \
  --templates-dir /tmp/beautiful-html-templates/templates \
  --output .hyperframes/template-picker.html
```

**For the unified design picker (Phase 1 template grid + Phase 2 fine-tune):**

Write a `build-picker.py` that:

1. Reads `picker-data.json` (architectures, palettes, typepairs, moodboards, prompt, prompt_text)
2. Extracts template data from `build-template-picker.py`'s `extract_preview()` and `extract_color_vars()`
3. If `design.md` exists, parses it and generates `templates/user-design/{template,design}.html`
4. Replaces all `__*_JSON__` placeholders in `skills/hyperframes/templates/design-picker.html`
5. Injects `var DESIGN_MD = {...}` when design.md is present
6. Writes to `.hyperframes/pick-design.html`

```bash
python3 build-picker.py
```

Serve: `cd <project-dir> && python3 -m http.server 8723 &` (use port 8723 or any unused port above 8000). Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8723/.hyperframes/pick-design.html` — only share the link if it returns 200.

### Step 4: User selects a template

The user browses templates, applies palette re-theming, cycles through slides, then clicks a template. The picker stores the selection in `sessionStorage` and navigates to `pick-design.html` for Phase 2 fine-tuning.

For the bridge to work, `pick-design.html` must exist in `.hyperframes/` with the standard design-picker data (generate it using the normal moodboard flow with 1 architecture). The bridge code reads `sessionStorage.templatePick` and auto-advances to Phase 2.

### Phase 2 bridge setup

The template picker posts this message when a template is selected:

```json
{
  "type": "templatePick",
  "slug": "studio",
  "name": "Studio",
  "tagline": "Black canvas with electric-yellow type...",
  "scheme": "dark",
  "palette": { "bg": "#0F0A1A", "fg": "#FFFFFF", "accent": "#7C3AED", "muted": "#9CA3AF" }
}
```

Add this bridge code at the end of `pick-design.html`'s main `<script>` block:

```js
function handleTemplatePick(pick) {
  if (!pick || !pick.slug) return;
  PROMPT.title = pick.name;
  PROMPT.headline = pick.name.toUpperCase();
  PROMPT.subline = pick.tagline;
  if (ARCHITECTURES[0]) {
    ARCHITECTURES[0].name = pick.name;
    ARCHITECTURES[0].description = pick.tagline;
    ARCHITECTURES[0].tag = pick.slug;
    ARCHITECTURES[0].mood =
      (pick.scheme === "dark" ? "Dark" : "Light") + " template — " + pick.tagline;
  }
  if (pick.palette) {
    var bestIdx = 0,
      bestDist = Infinity;
    PALETTES.forEach(function (p, i) {
      var d =
        Math.abs(
          parseInt(p.background.slice(1, 3), 16) - parseInt(pick.palette.bg.slice(1, 3), 16),
        ) +
        Math.abs(
          parseInt(p.foreground.slice(1, 3), 16) - parseInt(pick.palette.fg.slice(1, 3), 16),
        ) +
        Math.abs(
          parseInt(p.accent.slice(1, 3), 16) - parseInt(pick.palette.accent.slice(1, 3), 16),
        );
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    overridePalette = bestIdx;
  }
  selectedMood = 0;
  setTimeout(function () {
    goToTune();
  }, 300);
}
window.addEventListener("message", function (e) {
  if (e.data && e.data.type === "templatePick") handleTemplatePick(e.data);
});
(function () {
  var raw = sessionStorage.getItem("templatePick");
  if (!raw) return;
  sessionStorage.removeItem("templatePick");
  try {
    handleTemplatePick(JSON.parse(raw));
  } catch (e) {}
})();
```

**Important:** Guard all Phase 1 element references in `pick-design.html` since they may not exist when template picker replaces Phase 1:

```js
var moodGrid = document.getElementById("mood-grid") || document.createElement("div");
var palBar = document.getElementById("pal-bar") || document.createElement("div");
// Guard getElementById("mood-next-btn") and ("mood-title") similarly
```

2. `mkdir -p .hyperframes` then copy [../templates/design-picker.html](../templates/design-picker.html) to `.hyperframes/pick-design.html`.
3. Replace these placeholders using Python (don't hand-escape quotes in sed):
   - `__ARCHITECTURES_JSON__` — array of architecture objects
   - `__PALETTES_JSON__` — array of palette objects
   - `__TYPEPAIRS_JSON__` — array of type pairing objects
   - `__MOODBOARDS_JSON__` — array of mood board objects (see format below)
   - `__PROMPT_JSON__` — object with prompt context (see format below)
   - `__TEMPLATES_JSON__` — array of template objects (from `build-template-picker.py` extraction)
   - `__PROMPT_TEXT_JSON__` — object with prompt text pools (headline, body, stats, etc.)
   - `__PROMPT_DESC__` — one-line description shown in picker header
   - Also inject `var DESIGN_MD = {...}` after `ALL_TEMPLATES` when design.md exists (see "When design.md exists" above)

### Architecture data format

Each architecture object must include a `preview_frames` field — an array of 4 HTML strings, one per beat (hook, proof, action, close). Each frame renders in the mood board card carousel and in the fine-tune scene grid. The template falls back to `[preview_html]` if `preview_frames` is missing, but this produces a single-frame card with no carousel — always provide 4 frames.

Use token placeholders that the template replaces at runtime: `{{bg}}`, `{{fg}}`, `{{ac}}`, `{{mt}}`, `{{hf}}`, `{{hw}}`, `{{bf}}`, `{{bw}}`, `{{cr}}` (corner radius), `{{pad}}`, `{{gap}}`, `{{shadow}}`, `{{g}}` (grid line color), `{{fg3}}`/`{{fg6}}`/`{{fg8}}`/`{{fg15}}` (fg at opacity), `{{ac3}}`/`{{ac5}}`/`{{ac25}}` (accent at opacity).

**Use tokens everywhere — never hardcode colors, fonts, spacing, or radii.** The preview updates live as the user changes options in Phase 2. If you write `padding: 80px` instead of `padding: {{pad}}`, changing the density option does nothing. If you write `color: #CC2200` instead of `color: {{ac}}`, changing the palette does nothing. Every color, font-family, font-weight, padding, gap, border-radius, and shadow MUST use tokens. The only exception is structural values like `width: 1920px` or `flex: 1`.

**Density matches the concept.** The preview should look like a real frame from the actual video — not a UI component showcase. A single-stat direction has 2-3 elements. A data-grid direction has 12+. Match the architecture's intent.

**Build preview frames like real compositions.** Read [video-composition.md](video-composition.md), [../house-style.md](../house-style.md), and [motion-principles.md](motion-principles.md) when generating preview frame HTML. The frames are static but should look like they were paused mid-animation:

- Apply accent color to exactly the focal element per frame
- Use video-scale typography (80-140px heroes, 24-36px body, 14-20px labels)
- Respect the density philosophy — high-energy frames earn more elements, contemplative frames earn fewer
- Each of the 4 frames should represent a distinct beat: hook (grab attention), proof (deliver the message), action (what to do), close (final frame)
- Use real content from the prompt, not "Headline Goes Here" placeholders

The user judges the entire video based on these 4 frames. If they look generic, the user assumes the video will too.

Optionally include `components` and `dos` as strings — these appear in the generated design.md.

**Layout constraint:** Each frame is 1920×1080px. Content can use flex, grid, absolute positioning — any CSS that works in inline styles. Avoid `max-width: 100%` on frame content (the frame IS 1920px).

**Security:** Architecture `preview_html` must not contain `<script>` tags, event handlers (`onclick`, `onerror`, etc.), or `javascript:` URLs. It is injected via `innerHTML`.

**Image URLs:** When using background images in `preview_html`, use `url(path/to/image.jpg)` WITHOUT quotes around the path. Single quotes like `url('path.jpg')` break because `preview_html` is inside a `style='...'` attribute — the inner single quotes terminate the outer attribute.

**Palette variety:** Always include a mix of light, dark, and tinted backgrounds across the 6 palettes — even for calm/wellness prompts.

### Strict data schemas

The template will crash if these shapes are wrong. Do not deviate.

**Palette object — EXACT field names required:**

For `design-picker.html` (unified template+fine-tune picker):

```json
{
  "name": "Palette Name",
  "primary": "#hex",
  "secondary": "#hex",
  "tertiary": "#hex",
  "accent": "#hex",
  "desc": "One-line description"
}
```

Fields are `primary` (text), `secondary` (background), `tertiary` (muted), `accent`. The picker reads `p.primary`, `p.secondary`, etc. — wrong names will render as `undefined` and crash palette matching.

For `template-picker.html` (standalone Phase 1 only — legacy):

```json
{
  "name": "Palette Name",
  "background": "#hex",
  "foreground": "#hex",
  "accent": "#hex",
  "muted": "#hex",
  "desc": "One-line description"
}
```

Fields are `background`, `foreground`, `accent`, `muted`. NOT `bg`/`fg`/`ac`/`mt`.

**Type pair object — EXACT field names required:**

```json
{
  "name": "Pair Name",
  "headline": { "family": "Font Name", "weight": 700 },
  "body": { "family": "Font Name", "weight": 400 },
  "preview": "The Island Awaits",
  "body_preview": "Wake with the sun, sleep with the stars.",
  "desc": "One-line description"
}
```

Fields are nested: `headline.family`, `headline.weight`, `body.family`, `body.weight`. NOT `headFont`/`bodyFont`/`headWeight`/`bodyWeight`. The template reads `tp.headline.family` — flat keys will crash.

`preview` is the headline specimen text shown in the type card. `body_preview` is the body specimen text. Both are REQUIRED — without them the cards show "undefined". Use real content from the prompt, not generic lorem ipsum.

**Architecture object — MUST have 4 frames:**

```json
{
  "name": "...",
  "description": "...",
  "tag": "...",
  "mood": "...",
  "bg_preset": "Halo",
  "preview_frames": [
    "<div style='...'>Hook frame — grab attention</div>",
    "<div style='...'>Proof frame — deliver the message</div>",
    "<div style='...'>Action frame — what to do</div>",
    "<div style='...'>Close frame — final frame</div>"
  ]
}
```

Field is `preview_frames` (array of 4 HTML strings), NOT `preview_html` (single string). The template renders these as a carousel in Phase 1 and a scene grid in Phase 2. Using `preview_html` produces a single-frame card with no carousel — the user cannot evaluate the video's arc from one frame.

`bg_preset` (optional) is the name of a background preset to pre-select when this mood board is chosen. Must match a name in `BG_PRESETS` (either built-in or custom). Omit for no background.

**Mood board object:**

```json
{
  "name": "...",
  "description": "...",
  "theme": "dark|light",
  "arch_index": 0,
  "palette_index": 0,
  "type_index": 0,
  "corners_index": 0,
  "density_index": 0,
  "depth_index": 0,
  "easing_index": 0,
  "corners": "4px",
  "padding": "24px",
  "gap": "16px",
  "shadow": "0 2px 12px rgba(0,0,0,0.08)"
}
```

All `*_index` fields are zero-based indices into their respective arrays (ARCHITECTURES, PALETTES, TYPEPAIRS, CORNERS, DENSITIES, DEPTHS, EASINGS).

**Prompt context object:**

```json
{
  "title": "...",
  "headline": "...",
  "subline": "...",
  "section_desc": "..."
}
```

### Example architecture object

```json
{
  "name": "Editorial Stack",
  "description": "Vertical rhythm with large type, pull quotes, and data callouts",
  "tag": "editorial / longform / narrative",
  "mood": "Confident, unhurried, typographically driven",
  "preview_html": "<div style='background:{{bg}};color:{{fg}};padding:{{pad}};min-height:100vh;font-family:\"{{bf}}\",sans-serif;font-weight:{{bw}};'><div style='max-width:100%;display:flex;flex-direction:column;gap:{{gap}};'><div style='font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:{{mt}};'>Overline Label</div><div style='font-family:\"{{hf}}\",serif;font-weight:{{hw}};font-size:48px;line-height:1.1;letter-spacing:-0.02em;'>The Headline Goes Here</div><div style='font-size:20px;color:{{mt}};max-width:70%;line-height:1.5;'>Subheading text that introduces the narrative arc of this composition with enough words to fill two lines.</div><div style='font-size:15px;line-height:1.7;color:{{fg}};max-width:65%;'>Body paragraph with real sentences. The quick brown fox jumps over the lazy dog. This gives a sense of text density and reading rhythm at the chosen type size.</div><div style='display:flex;gap:{{gap}};flex-wrap:wrap;'><div style='background:{{fg6}};border-radius:{{cr}};padding:{{pad}};flex:1;min-width:200px;box-shadow:{{shadow}};'><div style='font-size:36px;font-family:\"{{hf}}\",serif;font-weight:{{hw}};color:{{ac}};'>2.4M</div><div style='font-size:12px;color:{{mt}};margin-top:4px;'>Primary Stat</div></div><div style='background:{{fg6}};border-radius:{{cr}};padding:{{pad}};flex:1;min-width:200px;box-shadow:{{shadow}};'><div style='font-size:36px;font-family:\"{{hf}}\",serif;font-weight:{{hw}};color:{{fg}};'>87%</div><div style='font-size:12px;color:{{mt}};margin-top:4px;'>Secondary Stat</div></div></div><div style='border-left:3px solid {{ac}};padding:12px {{pad}};background:{{ac3}};border-radius:0 {{cr}} {{cr}} 0;'><div style='font-size:18px;font-style:italic;color:{{fg}};line-height:1.5;'>\"A pull quote that captures the key insight of the piece.\"</div><div style='font-size:12px;color:{{mt}};margin-top:8px;'>— Attribution Name</div></div><div style='background:{{fg3}};border-radius:{{cr}};padding:{{pad}};box-shadow:{{shadow}};'><div style='font-size:14px;font-weight:{{hw}};margin-bottom:8px;'>Card Title</div><div style='font-size:13px;color:{{mt}};line-height:1.5;'>Card body text with a different treatment than the main content area.</div></div><div style='background:{{ac5}};border:1px solid {{ac25}};border-radius:{{cr}};padding:{{pad}};box-shadow:{{shadow}};'><div style='font-size:14px;font-weight:{{hw}};color:{{ac}};margin-bottom:8px;'>Accent Card</div><div style='font-size:13px;color:{{fg}};line-height:1.5;'>Second card with a tinted accent treatment for variety.</div></div><div style='font-family:monospace;font-size:13px;background:{{fg8}};border-radius:{{cr}};padding:{{pad}};color:{{fg15}};box-shadow:{{shadow}};'>$ hyperframes render --output video.mp4</div><div style='display:flex;gap:12px;flex-wrap:wrap;'><button style='background:{{ac}};color:{{bg}};border:none;padding:10px 24px;border-radius:{{cr}};font-size:14px;font-weight:600;box-shadow:{{shadow}};cursor:pointer;'>Primary Action</button><button style='background:transparent;color:{{fg}};border:1px solid {{fg15}};padding:10px 24px;border-radius:{{cr}};font-size:14px;cursor:pointer;'>Secondary</button></div><div style='display:flex;gap:8px;flex-wrap:wrap;'><span style='background:{{fg6}};border-radius:100px;padding:4px 12px;font-size:11px;color:{{mt}};'>Tag One</span><span style='background:{{fg6}};border-radius:100px;padding:4px 12px;font-size:11px;color:{{mt}};'>Tag Two</span><span style='background:{{ac5}};border-radius:100px;padding:4px 12px;font-size:11px;color:{{ac}};'>Accent Tag</span></div><div style='height:1px;background:linear-gradient(to right,{{ac25}},{{fg6}},{{ac25}});'></div><div style='display:flex;justify-content:space-between;font-size:12px;color:{{mt}};border-bottom:1px solid {{g}};padding:8px 0;'><span>Data row label</span><span style='color:{{fg}};font-weight:600;'>1,234</span></div></div></div>"
}
```

### Mood board data format

Each mood board pre-selects one option from each category. The user picks a mood board in Phase 1, then fine-tunes in Phase 2 with those selections pre-filled.

```json
{
  "name": "Terminal Precision",
  "description": "Code-forward, data-dense, CLI energy. Dark canvas, monospace body, sharp corners.",
  "theme": "dark",
  "arch_index": 0,
  "palette_index": 0,
  "type_index": 0,
  "corners_index": 0,
  "density_index": 0,
  "depth_index": 1,
  "easing_index": 0,
  "corners": "0px",
  "padding": "12px",
  "gap": "8px",
  "shadow": "0 2px 16px rgba(0,230,255,0.15)"
}
```

Indices reference into the ARCHITECTURES, PALETTES, and TYPEPAIRS arrays. The template renders a mini preview of each mood board using its architecture's `preview_html` with the mood board's palette/type applied.

### Prompt context data format

```json
{
  "title": "AI Coding Assistant",
  "headline": "Your Code, Understood.",
  "subline": "An AI coding assistant that reads your entire codebase.",
  "section_desc": "Layout options for your product launch"
}
```

`title` appears in the Phase 1 header. `headline` and `subline` replace `{{prompt_headline}}` and `{{prompt_sub}}` in architecture preview_html so previews show real content.

### Content tokens in preview_html

In addition to the standard design tokens (`{{bg}}`, `{{fg}}`, `{{ac}}`, etc.), architecture `preview_html` can use:

- `{{prompt_headline}}` — the user's actual headline text
- `{{prompt_sub}}` — the user's actual subline text

This makes previews contextual — the user sees their own content styled, not generic placeholders.

## Serving and user selection

4. Serve the file: `cd <project-dir> && python3 -m http.server 8723 &` (use port 8723 or any unused port above 8000; if the curl check fails, try the next port). Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8723/.hyperframes/pick-design.html` — only share the link if it returns 200. Do NOT use `npx hyperframes preview` for the picker — it blocks. Only start the HTTP server from the main conversation thread. If you are running as a dispatched task or subagent, return the file path and let the caller serve it.
5. Once the user picks, tell them: "Copy the design.md from the picker and paste it here." The user pastes the markdown back into the conversation. Save it verbatim to `design.md` in the project root — it's already in spec format (YAML frontmatter + prose sections). After the user pastes, kill the background server: `kill %1` or `kill $(lsof -ti:8723)`. Then proceed with construction.

The picker outputs a video-specific design.md — a director's lookbook, not a web component library. YAML frontmatter carries tokens (colors, typography, rounded, spacing, motion). Prose sections cover:

- **Overview** — one paragraph establishing the visual identity
- **Palette** — every color with its exact role in video (canvas, text, accent, muted) + accent discipline rules
- **Typography** — role-based table (hero/slam, section, body, label, data) with video-scale sizes (80-140px heroes, 24-36px body)
- **Surface & Depth** — elevation philosophy, corner radius, background layer treatment, container style
- **Motion** — entry easing signature, energy level, stagger philosophy, ambient motion rules, number presentation style
- **Transitions** — primary transition type (60-70% of cuts), accent transition for peak moments, rhythm guidance
- **Composition** — structure, density philosophy, text-per-second pacing rule, accent placement
- **Do's and Don'ts** — explicit accent discipline, font rules, size floors, forbidden patterns
