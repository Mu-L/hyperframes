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
  "match_signals": []
}
```

> `match_signals: []` is intentional — liquid-glass requires a WebGPU runtime
> and the bundled `liquid-glass.iife.js` shipped by registry blocks. The
> auto-inferencer in `build-design.mjs` will never pick it (every preset scores
> 0 against an empty signal list). Select with `--style liquid-glass`.

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

These map 1:1 onto the `--lg-*` custom properties read by `liquid-glass.iife.js`.
Three archetypes — pick the right one per panel by size/role:

```css
/* Aurora canvas — overwrites brutalism/editorial canvas. */
--liquid-bg-deep: #0a0218; /* mandatory dark base — aurora needs blackpoint */
--liquid-bg-fallback: linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%);

/* Glass archetype 1 — WIDGET (stat cards, showcase, pill chips) */
--lg-widget-blur: 0.42;
--lg-widget-refraction: 0.82;
--lg-widget-specular: 0.34;
--lg-widget-fresnel: 1.25;
--lg-widget-edge-highlight: 0.26;
--lg-widget-chrom-aberration: 0.08;
--lg-widget-saturation: 0.38;
--lg-widget-corner: 28;
--lg-widget-z: 46;

/* Glass archetype 2 — NOTIFICATION / OVERLAY (toast, banner — needs cast shadow) */
--lg-notif-blur: 0.22;
--lg-notif-refraction: 0.6;
--lg-notif-specular: 0.2;
--lg-notif-fresnel: 0.9;
--lg-notif-edge-highlight: 0.1;
--lg-notif-chrom-aberration: 0.05;
--lg-notif-saturation: 0.25;
--lg-notif-corner: 36;
--lg-notif-z: 38;
--lg-notif-shadow-opacity: 0.35;
--lg-notif-shadow-spread: 14;
--lg-notif-shadow-offset-y: 4;

/* Glass archetype 3 — MENU / DENSE CONTENT (context menu, popover with text) */
--lg-menu-blur: 0.56;
--lg-menu-refraction: 0.52;
--lg-menu-specular: 0.26;
--lg-menu-fresnel: 1;
--lg-menu-edge-highlight: 0.2;
--lg-menu-chrom-aberration: 0.035;
--lg-menu-saturation: -0.24; /* desaturate so dark text on glass stays legible */
--lg-menu-tint: 0.88;
--lg-menu-brightness: 0.54;
--lg-menu-corner: 30;
--lg-menu-z: 48;

/* Type colors on glass */
--ink-on-glass: rgba(255, 255, 255, 0.96);
--ink-on-glass-soft: rgba(255, 255, 255, 0.74);
--ink-on-light-glass: rgb(0, 7, 14); /* for menu/light-tinted glass */
--text-shadow-glass: 0 2px 12px rgba(0, 0, 0, 0.42);
```

**Picking the right archetype.** Panel diameter is the deciding factor, not content:

- ≤ 280px (chip, button, small stat) → **widget**
- 280-600px floating over content (toast, alert) → **notification** (needs shadow)
- ≥ 350px containing text rows / list / dense UI → **menu** (desaturate + tint up)

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

## §F Components (paste-ready, use brand vars from §B)

> Every component below assumes the page has loaded
> `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js`,
> `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`,
> and a local `lib/liquid-glass.iife.js` (installed by `hyperframes add
liquid-glass-widgets` — see §H). Without these the panels render as empty
> divs.

<!-- COMPONENT: liquid-stage -->

```html
<!--
  Mandatory wrapper. EVERY liquid-glass scene starts with this. It sets up
  the two canvases the IIFE needs (#three-canvas for aurora, #glass-canvas
  for the refraction pass) and the text-overlay layer. Put your glass panels
  inside #glass-canvas (with class="liquid-glass") and your text inside
  .text-overlay (positioned absolutely to match the panel underneath).

  The sample widget/notification/pill below are PREVIEW SAMPLES — delete
  them when authoring a real scene and replace with the panels you actually
  need. They exist so design.html shows what a populated stage looks like.
-->
<div class="liquid-stage">
  <canvas id="three-canvas" width="1920" height="1080"></canvas>
  <div class="aurora-bg-preview"></div>
  <canvas id="glass-canvas" layoutsubtree width="1920" height="1080">
    <div class="glass-panel widget-card liquid-glass" style="top: 320px; left: 240px;"></div>
    <div class="glass-panel notif-panel liquid-glass" style="top: 200px; left: 1140px;"></div>
    <div class="glass-panel pill-chip liquid-glass" style="top: 760px; left: 340px;"></div>
    <div class="glass-panel pill-chip liquid-glass" style="top: 760px; left: 510px;"></div>
    <div class="glass-panel pill-chip liquid-glass" style="top: 760px; left: 680px;"></div>
  </canvas>
  <div class="text-overlay-root">
    <div class="text-overlay stat-text" style="top: 320px; left: 240px;">
      <span class="stat-label">SAMPLE</span>
      <span class="stat-value">42</span>
    </div>
    <div class="text-overlay notif-card" style="top: 200px; left: 1140px;">
      <div class="notif-avatar" style="background: var(--brand-primary);">H</div>
      <div class="notif-body">
        <div class="notif-title">Glass surfaces</div>
        <div class="notif-msg">Float above the aurora field.</div>
      </div>
    </div>
    <div class="text-overlay pill-text" style="top: 760px; left: 340px;">
      <span class="pill-dot" style="background: var(--brand-accent);"></span>
      <span class="pill-label">Live</span>
    </div>
    <div class="text-overlay pill-text" style="top: 760px; left: 510px;">
      <span class="pill-dot" style="background: var(--brand-secondary);"></span>
      <span class="pill-label">Synced</span>
    </div>
    <div class="text-overlay pill-text" style="top: 760px; left: 680px;">
      <span class="pill-dot" style="background: var(--brand-primary);"></span>
      <span class="pill-label">Ready</span>
    </div>
  </div>
</div>
<style>
  .liquid-stage {
    position: relative;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background: var(--liquid-bg-deep);
    /* Preview-only: scale down so the 1920x1080 stage fits inside the
       design.html .comp-preview container. When the stage is used in a real
       scene the parent isn't .comp-preview, so this rule won't apply. */
  }
  .comp-preview .liquid-stage {
    transform: scale(0.32);
    transform-origin: top left;
    margin-bottom: -733px; /* = 1080 * (1 - 0.32) to reclaim space */
    margin-right: -1305px;
  }
  #three-canvas,
  #glass-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
  }
  #three-canvas {
    z-index: 0;
  }
  #glass-canvas {
    z-index: 1;
  }
  .text-overlay-root {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }
  /* Preview-only: a CSS aurora to stand in for the Three.js shader that
     paints #three-canvas in production. The real shader gets pasted from
     registry — see §H. */
  .aurora-bg-preview {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 60% 50% at 22% 28%,
        color-mix(in oklab, var(--brand-primary) 65%, transparent),
        transparent 65%
      ),
      radial-gradient(
        ellipse 55% 45% at 78% 72%,
        color-mix(in oklab, var(--brand-secondary) 55%, transparent),
        transparent 65%
      ),
      radial-gradient(
        ellipse 45% 40% at 58% 22%,
        color-mix(in oklab, var(--brand-accent) 45%, transparent),
        transparent 65%
      ),
      linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%);
    filter: blur(60px) saturate(1.2);
  }
  /*
   * .glass-panel WITH IIFE runtime: the div is overwritten by the
   * liquid-glass.iife.js draw pass — these styles are invisible.
   *
   * WITHOUT runtime (e.g. this design.html preview, or a fallback render):
   * the rules below produce a "frosted-card" approximation so the layout
   * is still legible. Not a true refraction, but readable.
   */
  .glass-panel {
    position: absolute;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(28px) saturate(1.4);
    -webkit-backdrop-filter: blur(28px) saturate(1.4);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 28px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.34),
      inset 0 -1px 0 rgba(255, 255, 255, 0.06),
      0 18px 48px rgba(0, 0, 0, 0.32);
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: glass-widget-card -->

```html
<!-- 220×220 stat card. Use up to 3 in a row. Pair each with a .stat-text overlay. -->
<div id="glass-stat1" class="glass-panel widget-card liquid-glass"></div>
<div class="text-overlay stat-text" style="top: 300px; left: 200px;">
  <span class="stat-label">{LABEL}</span>
  <span class="stat-value">{NUM}</span>
</div>
<style>
  .widget-card {
    width: 220px;
    height: 220px;
    --lg-blur: 0.42;
    --lg-refraction: 0.82;
    --lg-corner-radius: 28;
    --lg-z-radius: 46;
    --lg-specular: 0.34;
    --lg-fresnel: 1.25;
    --lg-edge-highlight: 0.26;
    --lg-chrom-aberration: 0.08;
    --lg-shadow-opacity: 0;
    --lg-saturation: 0.38;
  }
  .stat-text {
    width: 220px;
    height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 22px;
    border-radius: 28px;
    background:
      linear-gradient(
        150deg,
        rgba(255, 255, 255, 0.28),
        rgba(255, 255, 255, 0.06) 46%,
        rgba(255, 255, 255, 0.16)
      ),
      linear-gradient(180deg, rgba(9, 18, 31, 0.2), rgba(255, 255, 255, 0.04));
    border: 1px solid rgba(255, 255, 255, 0.36);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 -18px 38px rgba(255, 255, 255, 0.08);
    overflow: hidden;
    text-shadow: var(--text-shadow-glass);
  }
  .stat-label {
    font-size: 14px;
    font-weight: 650;
    color: var(--ink-on-glass);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .stat-value {
    font-size: 52px;
    font-weight: 700;
    color: var(--ink-on-glass);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: glass-pill-chip -->

```html
<!-- 130×36 status pill. Stack 3-5 in a row for "system state" beats. -->
<div id="glass-pill1" class="glass-panel pill-chip liquid-glass"></div>
<div class="text-overlay pill-text" style="top: 720px; left: 300px;">
  <span class="pill-dot" style="background: var(--brand-accent);"></span>
  <span class="pill-label">{LABEL}</span>
</div>
<style>
  .pill-chip {
    width: 130px;
    height: 36px;
    --lg-blur: 0.42;
    --lg-refraction: 0.82;
    --lg-corner-radius: 40;
    --lg-z-radius: 46;
    --lg-specular: 0.34;
    --lg-fresnel: 1.25;
    --lg-edge-highlight: 0.26;
    --lg-saturation: 0.38;
  }
  .pill-text {
    width: 130px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 40px;
    background: linear-gradient(130deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.1));
    border: 1px solid rgba(255, 255, 255, 0.34);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48);
  }
  .pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .pill-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-on-glass);
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: glass-notification -->

```html
<!-- 520×118 floating toast. Slides in top-right. Pair with .notif-card text overlay. -->
<div id="glass-notif1" class="glass-panel notif-panel liquid-glass"></div>
<div class="text-overlay notif-card" style="top: 60px; left: 1340px;">
  <div class="notif-avatar" style="background: var(--brand-primary);">{INITIAL}</div>
  <div class="notif-body">
    <div class="notif-title">{TITLE}</div>
    <div class="notif-msg">{MESSAGE}</div>
  </div>
</div>
<style>
  .notif-panel {
    width: 520px;
    height: 118px;
    --lg-blur: 0.22;
    --lg-refraction: 0.6;
    --lg-corner-radius: 36;
    --lg-z-radius: 38;
    --lg-specular: 0.2;
    --lg-fresnel: 0.9;
    --lg-edge-highlight: 0.1;
    --lg-chrom-aberration: 0.05;
    --lg-shadow-opacity: 0.35;
    --lg-shadow-spread: 14;
    --lg-shadow-offset-y: 4;
    --lg-saturation: 0.25;
  }
  .notif-card {
    width: 520px;
    height: 118px;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--ink-on-glass);
    text-shadow: var(--text-shadow-glass);
  }
  .notif-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 18px;
    flex-shrink: 0;
  }
  .notif-body {
    flex: 1;
    min-width: 0;
  }
  .notif-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink-on-glass);
  }
  .notif-msg {
    font-size: 14px;
    font-weight: 550;
    color: var(--ink-on-glass-soft);
    margin-top: 2px;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: glass-menu -->

```html
<!--
  390×506 vertical menu, light-tinted glass (text reads dark). For dense
  popovers — context menus, settings panes, command palettes.
-->
<div id="glass-menu" class="glass-panel menu-panel liquid-glass"></div>
<div class="text-overlay menu-text" style="top: 270px; left: 800px;">
  <div class="menu-item"><span>{ITEM_1}</span><span class="menu-kbd">{KBD_1}</span></div>
  <div class="menu-item"><span>{ITEM_2}</span><span class="menu-kbd">{KBD_2}</span></div>
  <div class="menu-sep"></div>
  <div class="menu-item"><span>{ITEM_3}</span><span class="menu-kbd">{KBD_3}</span></div>
</div>
<style>
  .menu-panel {
    width: 390px;
    height: 506px;
    background: rgba(255, 255, 255, 0.15);
    --lg-blur: 0.56;
    --lg-refraction: 0.52;
    --lg-corner-radius: 30;
    --lg-z-radius: 48;
    --lg-specular: 0.26;
    --lg-fresnel: 1;
    --lg-edge-highlight: 0.2;
    --lg-chrom-aberration: 0.035;
    --lg-tint: 0.88;
    --lg-brightness: 0.54;
    --lg-saturation: -0.24;
  }
  .menu-text {
    width: 390px;
    height: 506px;
    display: flex;
    flex-direction: column;
    padding: 18px 0;
    border-radius: 30px;
    overflow: hidden;
  }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 28px;
    font-size: 18px;
    font-weight: 650;
    color: var(--ink-on-light-glass);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.26);
  }
  .menu-kbd {
    margin-left: auto;
    font-size: 14px;
    font-weight: 650;
    color: rgba(0, 7, 14, 0.82);
    font-variant-numeric: tabular-nums;
  }
  .menu-sep {
    height: 1px;
    margin: 10px 28px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.24), transparent);
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: glass-media-bar -->

```html
<!-- 640×116 horizontal media/now-playing bar. High saturation glass; full-bleed feel. -->
<div id="glass-media" class="glass-panel media-panel liquid-glass"></div>
<div class="text-overlay media-text" style="top: 476px; left: 640px;">
  <div class="album-art" style="background: var(--brand-gradient);"></div>
  <div class="media-info">
    <div class="media-title">{TITLE}</div>
    <div class="media-artist">{SUBTITLE}</div>
  </div>
</div>
<style>
  .media-panel {
    width: 640px;
    height: 116px;
    background: rgba(255, 255, 255, 0.055);
    --lg-blur: 0.42;
    --lg-refraction: 0.92;
    --lg-corner-radius: 44;
    --lg-z-radius: 58;
    --lg-specular: 0.46;
    --lg-fresnel: 1.15;
    --lg-edge-highlight: 0.34;
    --lg-chrom-aberration: 0.08;
    --lg-saturation: 1.1;
  }
  .media-text {
    width: 640px;
    height: 116px;
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 0 24px;
    text-shadow: var(--text-shadow-glass);
  }
  .album-art {
    width: 78px;
    height: 78px;
    border-radius: 20px;
    flex-shrink: 0;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.28),
      0 12px 26px rgba(0, 0, 0, 0.24);
  }
  .media-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--ink-on-glass);
  }
  .media-artist {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink-on-glass-soft);
    margin-top: 2px;
  }
</style>
```

<!-- /COMPONENT -->

<!-- COMPONENT: aurora-bg-fallback -->

```html
<!--
  CSS-only aurora fallback. Use ONLY when:
    (a) the runtime does not support WebGPU, or
    (b) you want a still preview thumbnail of the scene.
  When the IIFE runtime IS active, this is invisible (z-index: 0 covers it).
  In the full pipeline, the aurora shader inside <canvas id="three-canvas">
  takes over — see <SKILL_DIR>/phases/design-system/style-presets/liquid-glass.md
  §F:liquid-stage for how the canvases stack.
-->
<div class="aurora-bg"></div>
<style>
  .aurora-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 90% 60% at 22% 28%,
        color-mix(in oklab, var(--brand-primary) 70%, transparent),
        transparent 60%
      ),
      radial-gradient(
        ellipse 80% 60% at 82% 78%,
        color-mix(in oklab, var(--brand-secondary) 60%, transparent),
        transparent 60%
      ),
      radial-gradient(
        ellipse 70% 50% at 58% 18%,
        color-mix(in oklab, var(--brand-accent) 50%, transparent),
        transparent 60%
      ),
      linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%);
    filter: blur(80px) saturate(1.15);
  }
</style>
```

<!-- /COMPONENT -->

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
