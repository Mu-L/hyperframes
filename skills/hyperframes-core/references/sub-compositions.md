# Sub-Compositions

A sub-composition is a separate HTML file embedded in a host composition. HyperFrames loads it, seeks it independently, and composites the result into the host at `data-start`.

## Host Wiring

In the host composition, the sub-composition appears as a clip with `data-composition-src`:

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

- `data-composition-id` on the host must match the internal `data-composition-id` of the file at `data-composition-src`.
- The host clip needs its own `data-start`, `data-duration`, `data-track-index`, `data-width`, `data-height`.

## Sub-Composition File Structure

Sub-composition files use a `<template>` wrapper because they are loaded into a host, not standalone-rendered:

```html
<template id="data-chart-template">
  <div data-composition-id="data-chart" data-width="1920" data-height="1080">
    <!-- sub-composition content -->
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // ... build timeline ...
      window.__timelines["data-chart"] = tl;
    </script>
  </div>
</template>
```

Contrast with **standalone** compositions, which put the root directly in `<body>` with no `<template>` wrapper.

## What HyperFrames Does With the Sub-Composition

- Loads the file and registers its timeline under its internal `data-composition-id`.
- Seeks the sub-composition's timeline independently from the host's playhead.
- Plays the sub-composition's content from `data-start` of the host clip, for `data-duration` seconds.

**Do not** manually `master.add(child)` a sub-composition timeline into the host timeline. HyperFrames already drives them independently — nesting them in GSAP causes double-seeks.

## Per-Instance Variables

If the sub-composition declares variables on its `<html>` element (`data-composition-variables`), the host can override values per instance:

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-variable-values='{"title":"Q4 Revenue","accent":"#66d9ef"}'
  data-start="2"
  data-duration="8"
  data-track-index="2"
  data-width="1920"
  data-height="1080"
></div>
```

The host can render the same sub-composition multiple times with different `data-variable-values` to produce per-instance variations. See `variables-and-media.md` for variable declaration syntax.
