---
name: hyperframes-core
description: Author core HyperFrames HTML compositions. Use for HyperFrames HTML composition structure, data attributes, clips, tracks, sub-compositions, variables, media playback, deterministic render rules, and validation of minimal renderable projects.
---

# HyperFrames Core

HyperFrames renders video from HTML. A composition is an HTML file whose DOM declares timing with `data-*` attributes, whose animation runtime is seekable, and whose media playback is owned by the framework.

Use this skill for the technical contract. For brand direction, visual style, transitions, and creative recipes use `hyperframes-creative`. For captions use `hyperframes-captions`. For CLI commands use `hyperframes-cli`. For GSAP API details use `gsap`.

## Minimal Composition

Standalone compositions put the composition root directly in `<body>`. Do not wrap the root in `<template>`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Minimal HyperFrames Composition</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      body {
        margin: 0;
        background: #0b0f14;
        color: white;
        font-family: Inter, system-ui, sans-serif;
      }
      [data-composition-id="main"] {
        position: relative;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
      }
      .clip {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
      }
      h1 {
        margin: 0;
        font-size: 96px;
      }
    </style>
  </head>
  <body>
    <div data-composition-id="main" data-width="1920" data-height="1080" data-duration="5">
      <section id="title-card" class="clip" data-start="0" data-duration="5" data-track-index="1">
        <h1 id="title">Hello HyperFrames</h1>
      </section>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from("#title", { y: 48, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.2);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
```

## Composition Root

Every renderable composition needs one root element:

| Attribute | Required | Meaning |
| --- | --- | --- |
| `data-composition-id` | Yes | Unique ID. Must match the animation registry key. |
| `data-width` / `data-height` | Yes | Pixel frame size. Common values: `1920x1080`, `1080x1920`, `1080x1080`. |
| `data-duration` | Yes | Duration in seconds. This is the render duration, not the GSAP timeline length. |
| `data-fps` | No | Optional frame rate hint. CLI render flags can override output fps. |

The root should be `position: relative`, have explicit pixel dimensions, and hide overflow unless intentionally composing outside the frame.

## Clips and Tracks

Timed child elements are clips. Add `class="clip"` for authored visual clips so tooling and examples can identify them consistently.

| Attribute | Required | Meaning |
| --- | --- | --- |
| `id` | Yes | Stable DOM ID for linting, timeline targets, and debugging. |
| `data-start` | Yes | Start time in seconds, or a supported clip-time reference. |
| `data-duration` | Required for `div`, `img`, and sub-compositions | Duration in seconds. Video/audio can default to media duration when known. |
| `data-track-index` | Yes | Timeline track. Clips on the same track must not overlap. |
| `data-media-start` | No | Offset into the media source, in seconds. |
| `data-volume` | No | Audio volume, `0` to `1`, default `1`. |

`data-track-index` is for temporal overlap rules, not visual stacking. Use CSS `z-index` for front/back visual layering.

## Sub-Compositions

Use `data-composition-src` when the host composition loads another composition file.

```html
<div
  id="chart"
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-start="2"
  data-duration="8"
  data-track-index="2"
  data-width="1920"
  data-height="1080"
></div>
```

Sub-composition files use a `<template>` wrapper because they are loaded into a host.

```html
<template id="data-chart-template">
  <div data-composition-id="data-chart" data-width="1920" data-height="1080">
    <!-- sub-composition content -->
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      window.__timelines["data-chart"] = tl;
    </script>
  </div>
</template>
```

Do not manually nest sub-composition timelines in the host timeline. HyperFrames loads and seeks them from `data-start`.

## Variables

Declare variables on the `<html>` element with `data-composition-variables`. Each declaration needs `id`, `type`, `label`, and `default`.

```html
<html
  data-composition-variables='[
    {"id":"title","type":"string","label":"Title","default":"Hello"},
    {"id":"accent","type":"color","label":"Accent","default":"#66d9ef"}
  ]'
>
```

Read resolved values once during initialization:

```js
const { title, accent } = window.__hyperframes.getVariables();
document.getElementById("title").textContent = title;
document.documentElement.style.setProperty("--accent", accent);
```

Variable rules:

- Supported types: `string`, `number`, `color`, `boolean`, `enum`.
- Enum declarations also need `options: [{ "value": "...", "label": "..." }]`.
- Always provide useful defaults so preview works without CLI overrides.
- Use `data-variable-values='{"title":"Pro"}'` on sub-composition hosts for per-instance overrides.
- Use `npx hyperframes render --variables '{"title":"Q4 Report"}'` or `--variables-file` for render-time overrides.

## Media

Video elements must be muted and inline. Audio must be a separate `<audio>` element, even when it uses the same source file.

```html
<video
  id="a-roll"
  class="clip"
  src="assets/demo.mp4"
  data-start="0"
  data-duration="12"
  data-track-index="0"
  muted
  playsinline
></video>

<audio
  id="a-roll-audio"
  src="assets/demo.mp4"
  data-start="0"
  data-duration="12"
  data-track-index="10"
  data-volume="1"
></audio>
```

Media rules:

- Do not call `video.play()`, `audio.play()`, pause, or seek in composition code.
- Do not animate timed media element dimensions; animate a non-timed wrapper.
- Do not nest video inside a timed wrapper. Put timing on the media element or keep the wrapper untimed.
- Add `crossorigin="anonymous"` for external media that needs canvas capture or pixel inspection.

## Animation Runtime Contract

GSAP is the primary runtime. The core requirement is generic: animation state must be seekable from HyperFrames time.

For GSAP:

- Create the timeline synchronously during page initialization.
- Use `gsap.timeline({ paused: true })`.
- Register it on `window.__timelines["<composition-id>"]`.
- The key must match `data-composition-id`.
- Do not call `tl.play()` for render-critical motion.
- Do not build timelines inside `async`, `Promise`, `setTimeout`, or event handlers.
- Do not create empty tweens only to set duration; use `data-duration`.

Use the `gsap` skill for tween syntax, position parameters, eases, and performance rules.

## Determinism

Rendered frames must be reproducible from the requested time:

- No `Date.now()`, `performance.now()`, or render-time clocks for visual state.
- No unseeded `Math.random()`. Use a seeded PRNG if random-looking placement is needed.
- No render-time network fetches for required assets.
- No hover, scroll, pointer, or focus state for render-critical visuals.
- No infinite loops such as `repeat: -1`; compute a finite repeat count from visible duration.
- Do not animate `display` or `visibility`; use opacity/transforms and timed clip visibility.
- Do not animate the same property on the same element from multiple timelines at the same time.

## Layout Contract

Build the visible end-state in static HTML and CSS first, then animate from/to that state.

- The composition root has fixed frame dimensions.
- Scene containers should fill the scene with `width: 100%; height: 100%; box-sizing: border-box`.
- Use padding, flex, grid, and max-width for layout. Avoid positioning main content by hardcoded `top/left` offsets when a layout container can do it.
- Use `position: absolute` for layers and decorative elements, not as the default content layout strategy.
- Prefer transforms and opacity for animation.
- Keep text inside its intended container. For dynamic text, use max-width, wrapping, or `window.__hyperframes.fitTextFontSize(...)`.

## Editing Existing Compositions

- Read the actual files before editing.
- Preserve unrelated timing, tracks, IDs, variables, and media paths.
- Match existing composition IDs and timeline registry keys.
- When adding a clip, choose a non-overlapping `data-track-index` or intentionally adjust surrounding timing.
- When adding a sub-composition, verify its internal `data-composition-id` before wiring the host.

## Validation

Use `hyperframes-cli` for command details. Minimum completion gate:

```bash
npx hyperframes lint
npx hyperframes validate
```

For layout-sensitive work, also run:

```bash
npx hyperframes inspect
```

Fix lint errors, runtime validation errors, unregistered timelines, same-track overlaps, missing assets, and unintended text overflow before considering the composition complete.
