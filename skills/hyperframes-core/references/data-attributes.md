# Data Attributes Reference

Every HyperFrames composition uses `data-*` attributes to declare timing and structure to the framework. This is the full attribute table — pair with `tracks-and-clips.md` for the rules behind `data-track-index`.

## Composition Root

Every renderable composition needs one root element:

| Attribute                    | Required | Meaning                                                                          |
| ---------------------------- | -------- | -------------------------------------------------------------------------------- |
| `data-composition-id`        | Yes      | Unique ID. Must match the animation registry key on `window.__timelines`.        |
| `data-width` / `data-height` | Yes      | Pixel frame size. Common values: `1920x1080`, `1080x1920`, `1080x1080`.          |
| `data-duration`              | Yes      | Duration in seconds. This is the render duration, not the GSAP timeline length.  |
| `data-fps`                   | No       | Optional frame rate hint. CLI render flags can override output fps.              |
| `data-composition-variables` | No       | JSON array of variable declarations (on `<html>`). See `variables-and-media.md`. |

The root should be `position: relative`, have explicit pixel dimensions, and hide overflow unless intentionally composing outside the frame.

## Clip Attributes

Timed child elements are clips. Add `class="clip"` for authored visual clips so tooling and examples can identify them consistently.

| Attribute          | Required                                        | Meaning                                                                    |
| ------------------ | ----------------------------------------------- | -------------------------------------------------------------------------- |
| `id`               | Yes                                             | Stable DOM ID for linting, timeline targets, and debugging.                |
| `data-start`       | Yes                                             | Start time in seconds, or a supported clip-time reference.                 |
| `data-duration`    | Required for `div`, `img`, and sub-compositions | Duration in seconds. Video/audio can default to media duration when known. |
| `data-track-index` | Yes                                             | Timeline track. Clips on the same track must not overlap.                  |
| `data-media-start` | No                                              | Offset into the media source, in seconds.                                  |
| `data-volume`      | No                                              | Audio volume, `0` to `1`, default `1`.                                     |

## Sub-Composition Host Attributes

When a clip is a sub-composition host (loads another composition file):

| Attribute                    | Required | Meaning                                                                |
| ---------------------------- | -------- | ---------------------------------------------------------------------- |
| `data-composition-id`        | Yes      | The internal composition ID of the loaded file.                        |
| `data-composition-src`       | Yes      | Path to the sub-composition HTML file.                                 |
| `data-width` / `data-height` | Yes      | Render dimensions for the sub-composition instance.                    |
| `data-variable-values`       | No       | Per-instance variable overrides as JSON. See `variables-and-media.md`. |

See `sub-compositions.md` for the full wiring pattern.

## Authoring Hints

- `id="root"` — template convention used by scaffolds and the transition catalog so CSS can target the composition root with `#root` instead of `[data-composition-id="main"]`. Not required by the runtime, but consistent with the rest of the ecosystem.
- `class="clip"` — semantic marker for tooling. Not required by the runtime.
- `data-layout-allow-overflow` — tells `hyperframes inspect` that overflow on this element (or its descendants) is intentional.
- `data-layout-ignore` — exclude this element from layout audits entirely.
