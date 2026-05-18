---
name: hyperframes-core
description: Author core HyperFrames HTML compositions. Use for HyperFrames HTML composition structure, data attributes, clips, tracks, sub-compositions, variables, media playback, deterministic render rules, and validation of minimal renderable projects.
---

# HyperFrames Core

HyperFrames renders video from HTML. A composition is an HTML file whose DOM declares timing with `data-*` attributes, whose animation runtime is seekable, and whose media playback is owned by the framework.

Use this skill for the technical contract. For brand direction, visual style, transitions, and creative recipes use `hyperframes-creative`. For captions use `hyperframes-captions`. For CLI commands use `hyperframes-cli`. For GSAP API details use `hyperframes-gsap`.

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

## Routing

| Want to…                                          | Read                                |
| ------------------------------------------------- | ----------------------------------- |
| Look up a `data-*` attribute (root + clip tables) | `references/data-attributes.md`     |
| Understand track-index, overlap, and z-index      | `references/tracks-and-clips.md`    |
| Wire a sub-composition into a host                | `references/sub-compositions.md`    |
| Declare variables or place video/audio            | `references/variables-and-media.md` |
| Make the composition render deterministically     | `references/determinism-rules.md`   |
| Author full-frame motion with shared backgrounds  | `references/full-screen-motion.md`  |

For GSAP API details (tween syntax, timelines, easing, performance) use the `hyperframes-gsap` skill.

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
