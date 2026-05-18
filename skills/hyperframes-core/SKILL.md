---
name: hyperframes-core
description: Author core HyperFrames HTML compositions. Use for HyperFrames HTML composition structure, data attributes, clips, tracks, sub-compositions, variables, media playback, deterministic render rules, and validation of minimal renderable projects.
---

# HyperFrames Core

HyperFrames renders video from HTML. A composition is an HTML file whose DOM declares timing with `data-*` attributes, whose animation runtime is seekable, and whose media playback is owned by the framework.

Use this skill for the technical contract. For brand direction, visual style, transitions, and creative recipes use `hyperframes-creative`. For captions use `hyperframes-captions`. For CLI commands use `hyperframes-cli`. For GSAP API details use `hyperframes-gsap`.

## Minimal Composition

The smallest renderable composition — a standalone (top-level) root with one clip and one tween:

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
      #root {
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
    <div
      id="root"
      data-composition-id="main"
      data-width="1920"
      data-height="1080"
      data-duration="5"
    >
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

## Composition Structure

Two root forms; they are **not** interchangeable.

- **Standalone** (the top-level `index.html`) — root `<div data-composition-id="…">` sits directly in `<body>`. **No `<template>` wrapper.** Wrapping a standalone root in `<template>` hides all content from the browser and breaks rendering.
- **Sub-composition** (a file loaded via `data-composition-src`) — root `<div data-composition-id="…">` **must** be wrapped in `<template>`. Without the wrapper the runtime cannot extract and mount it.

See `references/sub-compositions.md` for the sub-composition file shape and host wiring.

## Choosing an Animation Runtime

HyperFrames seeks 7 animation runtimes natively via its frame-adapter pattern (`packages/core/src/runtime/adapters/`). They are **substitutable siblings** — pick by your library or task. Many compositions combine two (e.g., GSAP timeline + Lottie sub-clip).

| Use case                                      | Skill                        | Trigger surface                       |
| --------------------------------------------- | ---------------------------- | ------------------------------------- |
| Tweens / timelines / general motion (default) | `hyperframes-gsap`           | `gsap.to()`, `window.__timelines`     |
| After Effects exports (`.json` / `.lottie`)   | `hyperframes-lottie`         | `lottie-web`, `window.__hfLottie`     |
| 3D scenes, WebGL, `AnimationMixer`            | `hyperframes-three`          | `THREE.*`, `hf-seek` event            |
| GPU compute / WGSL shaders                    | `hyperframes-typegpu`        | `navigator.gpu`, WGSL, `hf-seek`      |
| Native browser keyframes                      | `hyperframes-waapi`          | `element.animate()`, `KeyframeEffect` |
| CSS-only motion (no JS)                       | `hyperframes-css-animations` | `@keyframes`, `animation-play-state`  |
| Anime.js library                              | `hyperframes-animejs`        | `anime` / `animate()`, `__hfAnime`    |

Each runtime exposes its own contract for HyperFrames to seek it deterministically. The **Timeline Contract** below is the GSAP path (default and most common). For other runtimes, the equivalent contract lives in that runtime's skill.

## Timeline Contract

Every composition registers exactly one GSAP timeline.

- Create with `gsap.timeline({ paused: true })` — the player owns playback.
- Register at `window.__timelines["<composition-id>"]`; the key **must exactly match** the root's `data-composition-id`.
- Build the timeline **synchronously** during page load — not inside `async`, `setTimeout`, `Promise`, or event handlers.
- Render duration comes from `data-duration` on the root, **not** from GSAP timeline length. Do not pad the timeline with empty tweens to set duration.
- For sub-compositions, do **not** manually nest sub-timelines into the host (`master.add(sub)`); the framework drives them independently.

See `references/determinism-rules.md` for the full Animation Runtime Contract.

## Non-Negotiable Rules

These break the renderer. Routing below points to the full explanations.

1. No `Math.random()` / `Date.now()` / `performance.now()` driving visuals — use a seeded PRNG.
2. No `repeat: -1`. Use `repeat: Math.ceil(duration / cycleDuration) - 1`.
3. No `video.play()` / `audio.play()` / `currentTime = …`. The framework owns media playback.
4. No `gsap.set()` on clip elements from later scenes (they are not in the DOM yet). Use `tl.set(selector, vars, time)` at or after the clip's `data-start`.
5. No animating `display` / `visibility`. Animate `opacity` / transforms; the clip lifecycle handles show/hide.
6. No `<br>` in body text. Let text wrap via `max-width`; forced breaks misbehave when text already wraps.
7. No timeline construction inside `async` / `setTimeout` / `Promise`. The renderer samples after page load, synchronously.

## Routing

| Want to…                                                                                   | Read                                |
| ------------------------------------------------------------------------------------------ | ----------------------------------- |
| Look up a `data-*` attribute (root, clip, sub-comp host, legacy aliases)                   | `references/data-attributes.md`     |
| Use `class="clip"` correctly (when runtime visibility management requires it)              | `references/data-attributes.md`     |
| Pick a `data-track-index`; same-track overlap; track-index vs CSS `z-index`                | `references/tracks-and-clips.md`    |
| Time a clip relative to another (`data-start="intro + 2"`, crossfade overlap, chains)      | `references/tracks-and-clips.md`    |
| Wire a sub-composition (host attributes, `<template>` wrapper, per-instance variables)     | `references/sub-compositions.md`    |
| Animate inside a sub-composition (`gsap.fromTo` over `gsap.from`, seek-back behavior)      | `references/sub-compositions.md`    |
| Declare variables (types, extra options, defaults, `--strict-variables` in CI)             | `references/variables-and-media.md` |
| Place `<video>` / `<audio>`, set volume, trim with `data-media-start`                      | `references/variables-and-media.md` |
| Build a seekable timeline (paused, sync construction, `gsap.set` later-scene trap)         | `references/determinism-rules.md`   |
| Avoid non-deterministic state (clocks, `Math.random`, `repeat: -1`, finite repeat formula) | `references/determinism-rules.md`   |
| Know what can / cannot be animated (visual-property allowlist; not `display`/`visibility`) | `references/determinism-rules.md`   |
| Fit text and prevent overflow (`fitTextFontSize` signature, `<br>` rule, layout contract)  | `references/determinism-rules.md`   |
| Author full-frame motion with shared backgrounds                                           | `references/full-screen-motion.md`  |

For GSAP API details (tween syntax, timelines, easing, performance) use the `hyperframes-gsap` skill.

## Editing Existing Compositions

- Read the actual files before editing.
- Preserve unrelated timing, tracks, IDs, variables, and media paths.
- Match existing composition IDs and timeline registry keys.
- When adding a clip, choose a non-overlapping `data-track-index` or intentionally adjust surrounding timing.
- When adding a sub-composition, verify its internal `data-composition-id` before wiring the host.

## Validation

Use `hyperframes-cli` for command details. Two phases:

**Fast (run immediately, block on results):**

- [ ] `npx hyperframes lint` passes (0 errors)
- [ ] `npx hyperframes validate` passes (0 console errors)

**Slow (run while inspecting the preview):**

- [ ] `npx hyperframes inspect` passes, or every reported overflow is intentionally marked with `data-layout-allow-overflow` / `data-layout-ignore`
- [ ] No unregistered timelines, same-track overlaps, missing assets, or unintended text overflow remain
