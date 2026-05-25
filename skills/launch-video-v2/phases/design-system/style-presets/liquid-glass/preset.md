```preset-meta
{
  "name": "liquid-glass",
  "label": "Liquid Glass",
  "fingerprint": {
    "shadow": "inset-highlight",
    "border": "hairline-translucent",
    "motion": "rise-and-settle",
    "density": "low",
    "contrast": "high-on-aurora"
  },
  "match_signals": [
    { "kind": "hairline_border",    "weight": 0.20 },
    { "kind": "minimal_decoration", "weight": 0.15 },
    { "kind": "shadow_zero_blur",   "weight": 0.10 }
  ],
  "requires_capabilities": [
    {
      "kind": "block_installed",
      "block": "liquid-glass-widgets",
      "verify_file": "hyperframes/compositions/liquid-glass-widgets.html",
      "verify_lib": "hyperframes/compositions/lib/liquid-glass.iife.js",
      "auto_install": "npx hyperframes add liquid-glass-widgets",
      "alternates": ["liquid-glass-notification", "liquid-glass-context-menu", "liquid-glass-media-controls", "ios26-liquid-glass", "macos-tahoe-liquid-glass", "vfx-liquid-glass"]
    },
    {
      "kind": "env_var_set",
      "var": "PRODUCER_HEADLESS_SHELL_PATH",
      "reason": "WebGPU-capable browser (Brave / Chrome Canary). Cannot auto-install — varies by OS / user environment.",
      "auto_install": null
    }
  ],
  "best_for": ["premium SaaS", "AI products", "hardware launches", "futuristic tech", "consumer apps with depth"],
  "avoid_for": ["print-feel brands", "low-power render targets", "warm hand-crafted registers"]
}
```

> Liquid-glass auto-infers normally now (its `match_signals` light up on
> hairline-border + minimal-decoration sites), **but** `requires_capabilities`
> in the preset-meta gates auto-selection: build-design.mjs sets `combined=0`
>
> - `capabilities_missing=[...]` when (a) `lib/liquid-glass.iife.js` is absent
>   or (b) `$PRODUCER_HEADLESS_SHELL_PATH` is unset. The design-system subagent
>   auto-runs `npx hyperframes add liquid-glass-widgets` when liquid-glass wins
>   review and the block is missing; the env var is OS-specific and falls to
>   the user — agent reports it as an anomaly in the completion summary.

## §A Director's intent

Frosted glass over moving color. Surfaces are weightless — light passes
**through** them, not off them. Type sits on glass; glass sits on aurora;
aurora carries the brand. No element is the canvas; depth is the canvas.

**One reading layer at a time.** A scene has glass surfaces (panels, pills,
cards) floating over an animated color field. The eye reads what's on the
glass, not the glass itself. Decoration is reserved for the aurora — the
surfaces stay neutral, just specular highlight + edge-light + chromatic
fringe at the rim.

**Surfaces rise; they don't pop.** Entry is a soft upward translate from
below the frame + scale 0.86→1.0 with `back.out(1.04)` — the back overshoot
is tiny on purpose. Hard cuts and bouncy springs break the wetness.

## §B Decoration tokens (merge into design.html `:root`)

**Wiring contract.** The `liquid-glass.iife.js` shader reads exactly these
raw `--lg-*` properties per panel: `--lg-blur`, `--lg-refraction`,
`--lg-corner-radius`, `--lg-z-radius`, `--lg-specular`, `--lg-fresnel`,
`--lg-edge-highlight`, `--lg-chrom-aberration`, `--lg-saturation`,
`--lg-tint`, `--lg-brightness`, `--lg-shadow-opacity`, `--lg-shadow-spread`,
`--lg-shadow-offset-y`, `--lg-opacity`, `--lg-distortion`, `--lg-bevel-mode`.

Three archetypes are declared here with archetype-namespaced keys
(`--lg-widget-*`, `--lg-notif-*`, `--lg-menu-*`). Each component selects
its archetype by aliasing the raw keys, e.g. `--lg-blur: var(--lg-widget-blur)`.
Tune a knob here → all panels of that archetype move together. Brand-DNA
联动 (e.g. saturation tracking brand vibrancy) goes here too — anchored
on `--brand-*` and resolved once, consumed by every component.

```css
/* Aurora canvas — overwrites brutalism/editorial canvas. */
--liquid-bg-deep: #0a0218; /* mandatory dark base — aurora needs blackpoint */
--liquid-bg-fallback: linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%);

/* ── Archetype 1: WIDGET ────────────────────────────────────────
   ≤ 280px panels: stat cards, pill chips, small toggles. */
--lg-widget-blur: 0.42;
--lg-widget-refraction: 0.82;
--lg-widget-specular: 0.34;
--lg-widget-fresnel: 1.25;
--lg-widget-edge-highlight: 0.26;
--lg-widget-chrom-aberration: 0.08;
--lg-widget-saturation: 0.38;
--lg-widget-corner-radius: 28;
--lg-widget-z-radius: 46;

/* ── Archetype 2: NOTIFICATION / OVERLAY ────────────────────────
   280-600px floating panels needing cast shadow: toasts, banners,
   media bars, sliders. */
--lg-notif-blur: 0.22;
--lg-notif-refraction: 0.6;
--lg-notif-specular: 0.2;
--lg-notif-fresnel: 0.9;
--lg-notif-edge-highlight: 0.1;
--lg-notif-chrom-aberration: 0.05;
--lg-notif-saturation: 0.25;
--lg-notif-corner-radius: 36;
--lg-notif-z-radius: 38;
--lg-notif-shadow-opacity: 0.35;
--lg-notif-shadow-spread: 14;
--lg-notif-shadow-offset-y: 4;

/* ── Archetype 3: MENU / DENSE CONTENT ──────────────────────────
   ≥ 350px panels with text rows / list / dense UI. Desaturate +
   tint up so near-black ink stays legible on the lightened glass. */
--lg-menu-blur: 0.56;
--lg-menu-refraction: 0.52;
--lg-menu-specular: 0.26;
--lg-menu-fresnel: 1;
--lg-menu-edge-highlight: 0.2;
--lg-menu-chrom-aberration: 0.035;
--lg-menu-saturation: -0.24;
--lg-menu-tint: 0.88;
--lg-menu-brightness: 0.54;
--lg-menu-corner-radius: 30;
--lg-menu-z-radius: 48;

/* Type colors on glass */
--ink-on-glass: rgba(255, 255, 255, 0.96);
--ink-on-glass-soft: rgba(255, 255, 255, 0.74);
--ink-on-light-glass: rgb(0, 7, 14); /* for menu/light-tinted glass */
--text-shadow-glass: 0 2px 12px rgba(0, 0, 0, 0.42);
```

**Picking the right archetype.** Panel diameter is the deciding factor, not content:

- ≤ 280px (chip, button, small stat, toggle) → **widget**
- 280-600px floating over content (toast, alert, media-bar, slider) → **notification** (needs shadow)
- ≥ 350px containing text rows / list / dense UI (menu, popover) → **menu** (desaturate + tint up)

## §D Font pairing fallback (if brand fonts not on Google Fonts)

- **display**: `'Inter'` wght 800 · `'SF Pro Display'` (system) · `'Geist'`
- **body**: `'Inter'` wght 500-650 · `'Public Sans'` · `'DM Sans'`
- **mono**: `'JetBrains Mono'` · `'Geist Mono'`

Liquid glass is **type-on-glass, not type-as-hero**. Body weight runs heavier
than usual (550-700) because anti-aliasing fights with refraction — thin
weights smear. Letterspacing 0 to -0.01em; never tight.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(1.04)", // soft overshoot — tiny "settle"
  emphasis: "power3.inOut", // viscous, liquid acceleration
  exit: "power2.in", // sink, don't fly
  drift: "sine.inOut", // ambient float on idle panels
};
const DUR = {
  snap: 0.28,
  med: 0.5,
  slow: 1.1, // aurora cycles use longer than this
};
// RULE: every glass panel entry is a translate + scale, never opacity-only.
// RULE: never crossfade two glass panels — the lower one will look murky.
// RULE: panels are continuous — never "blink in". Move them onstage from off-canvas.
```

## §E.5 Motion choreography

**Allowed primitives**

- Upward translate from `top: 1160px` (below frame) → final position with `back.out(1.04)`.
- Scale 0.86 → 1.0 paired with the translate (separate `transformOrigin` per panel).
- Stagger 100-140ms between sibling panels (widgets), 30-60ms for menu items.
- Aurora time uniform `uTime` advances linearly over scene duration (driver tween).
- Idle drift on long-held panels: ±6-8px Y, 3-4s sine cycle, very subtle.

**Forbidden**

- Opacity-only entry. Panels must move; otherwise the refraction reveals no parallax.
- Rotation on glass. (Refraction maths assumes axis-aligned.)
- Crossfade between panels in the same canvas. Stack visually with z-index, not opacity.
- Sharp edges in the aurora — no hard shapes or text on the bg layer. It must
  stay diffuse so refraction has something to bend.
- Backdrop-filter shortcuts. `--lg-blur` is **not** CSS `backdrop-filter`; it's
  a uniform read by the IIFE shader. Don't substitute.

**Transitions between scenes**

Default is a held aurora (uniform shader across scenes) with panels lifting
out (`top: +=760, ease: power2.in`) on the outgoing scene and rising in on
the incoming. Aurora carries continuity — never reset `uTime` between scenes
in the same composition.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. **Present tense, declarative, no hedging.** "Ships in seconds" not "can ship in seconds".
2. **Surface > capability.** Talk about what the user sees and touches, not what runs underneath. "Tap and hold" beats "leverages the new context API".
3. **Numbers as nouns.** "Forty-eight milliseconds." (Period.) — not "as fast as 48ms".
4. **One verb, one object, one beat per panel.** Captions sit on glass; long sentences won't.
5. **No exclamation, no all-caps.** The medium is dramatic enough.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `Design together. In real time. On glass.`

## §H Scene composition hints (Phase 4b layout guidance)

**Runtime prerequisites — read first**

Liquid glass scenes will NOT render in a default Puppeteer/Chrome stable. Before
authoring or rendering a liquid-glass composition you must:

1. **Install one of the liquid-glass runtime blocks** to get
   `lib/liquid-glass.iife.js` and the three.js dependencies wired:

   ```bash
   npx hyperframes add liquid-glass-widgets
   # OR pick another:  liquid-glass-notification | liquid-glass-context-menu
   #                   liquid-glass-media-controls | ios26-liquid-glass
   #                   macos-tahoe-liquid-glass    | vfx-liquid-glass
   ```

   You only need one — they all ship the same `lib/liquid-glass.iife.js`.

2. **Use a WebGPU-capable browser for rendering**: Brave or Chrome Canary
   with WebGPU enabled. Set:

   ```bash
   export PRODUCER_HEADLESS_SHELL_PATH=/path/to/brave-or-canary
   ```

   The engine auto-passes `--enable-unsafe-webgpu`. See
   `/hyperframes-animation` → `adapters/typegpu.md` for the full setup.

3. **Verify before authoring**: `npx hyperframes doctor` should report
   `webgpu: ok`. If it says `unsupported`, fall back to a different preset
   — liquid-glass will silently render as blank panels otherwise.

**Stage structure**

- Every scene starts with the `liquid-stage` component (§F). The two canvases
  - text-overlay layer are non-negotiable; the IIFE looks for them by id.
- Glass panels go inside `#glass-canvas` as empty `<div class="glass-panel ... liquid-glass">`.
  The `liquid-glass` class is the IIFE hook — without it the panel won't be
  picked up. **Don't put text inside the glass div** — text lives in a sibling
  `.text-overlay` div absolutely positioned to overlap the panel.
- The text-overlay div itself MUST stay transparent (no background, no border,
  no box-shadow). The glass card visuals come from the IIFE pass underneath;
  the overlay only carries text + small icons + gradient pills. Adding a
  background to the overlay creates a visible rectangle that breaks the
  illusion the moment IIFE renders. (The `.stat-text` / `.showcase-text`
  inset highlights in §F are an intentional exception — they fake the **inner
  rim** of the glass card itself, not the body.)

**Aurora shader — copy verbatim from registry**

The Three.js aurora shader is byte-identical across all 8 registry liquid-glass
blocks. **Do not let an LLM rewrite it.** When authoring a scene:

1. Copy the entire `<script>` block (vs string + fs string + Three.js
   renderer/scene/camera/uniforms/quad setup + the `requestGlassRender` /
   `lg.waitForInit()` block) from:
   `registry/blocks/liquid-glass-widgets/liquid-glass-widgets.html` lines 485-601.
2. Keep `uTime` driven by your GSAP timeline (`tl.eventCallback("onUpdate",
() => requestGlassRender(tl.time()))`) — already wired in the source.
3. The `vec3 base = mix(vec3(0.10, 0.02, 0.22), vec3(0.04, 0.10, 0.25), …)`
   line is the only place to retint the aurora toward a brand color — replace
   those two vec3 stops with desaturated versions of `--brand-primary` /
   `--brand-secondary` if you want brand-tinted aurora. Don't touch the snoise
   functions or the ridge math.

**Density & focus**

- **2-4 glass surfaces per scene maximum.** More than that and the refraction
  passes start to mush each other.
- **Surfaces don't overlap.** A small chip _next to_ a card is fine; a chip
  _on_ a card produces a refraction double-bounce that reads as broken.
- **Brand color lives in the aurora and the accent strokes**, not the glass
  tint. Glass stays neutral (white at low opacity). To bring brand color
  forward, push the aurora warm/cool stops toward `--brand-primary` /
  `--brand-secondary` in the shader — don't paint the glass.

**Typography on glass**

- **Body weight ≥ 550.** Thinner reads as smudge through the refraction.
- **Always include `text-shadow: var(--text-shadow-glass)`** on labels —
  the glass refracts and softens edges, the shadow restores legibility.
- **Min text size 14px**, ideally 16-22px. Anything smaller disappears.
- For light-tinted glass (menu archetype): use `--ink-on-light-glass`
  (near-black with a subtle white text-shadow). The IIFE shader inverts
  the perceived contrast on menu panels.

**Color discipline**

- Canvas is the **aurora**, not a flat fill. Never set `body { background: var(--canvas); }`
  in a liquid-glass scene — the canvas variable is overridden to the deep
  base purple that the aurora needs as a blackpoint.
- Brand accent appears as: aurora hot zone tint, pill dots, button gradients,
  album-art conic gradients. Never as a glass panel fill.

**Atmosphere**

- **Transitions between scenes**: hold the aurora across scenes (single
  composition-wide `uTime` driver). Panels slide off the bottom on scene N,
  rise from the bottom on scene N+1. The aurora doesn't blink.
- **Sound design**: low pad, occasional hi-hat, soft whoosh on panel entries
  (~80-200Hz lift). No drums. No risers.
- **Stagger**: 100-140ms between sibling panels, 30-60ms between menu items.

## §I Page-level CSS (makes design.html itself read as liquid glass)

```css
body {
  background:
    radial-gradient(
      ellipse 90% 60% at 22% 28%,
      color-mix(in oklab, var(--brand-primary) 60%, transparent),
      transparent 60%
    ),
    radial-gradient(
      ellipse 80% 60% at 82% 78%,
      color-mix(in oklab, var(--brand-secondary) 50%, transparent),
      transparent 60%
    ),
    linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%) !important;
  background-attachment: fixed !important;
  color: rgba(255, 255, 255, 0.94) !important;
}

.title-card {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.title-display {
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
}

.ds-section {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.eyebrow {
  color: rgba(255, 255, 255, 0.7);
}

/* Frosted swatches + frosted component cards for preview legibility */
.dna-swatch {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 12px 32px rgba(0, 0, 0, 0.32) !important;
}

.comp-card {
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 18px 48px rgba(0, 0, 0, 0.4) !important;
}
.comp-head {
  background: rgba(255, 255, 255, 0.06) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.comp-name,
.comp-marker {
  color: rgba(255, 255, 255, 0.92);
}
.comp-preview {
  background: linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%) !important;
}

.type-card {
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.ds-code {
  background: rgba(7, 10, 18, 0.7) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.voice-pair {
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

h2 {
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}
```
