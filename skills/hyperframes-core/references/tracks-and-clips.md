# Tracks and Clips

Clips are timed children of the composition root. Tracks are a temporal-overlap concept, not a visual-stacking concept.

## What is a Clip

A clip is any DOM element with `data-start`, `data-duration` (where required), and `data-track-index`. Common kinds:

- **Visual `<div>` clips** — scenes, cards, overlays. Always require `data-duration`.
- **Sub-composition hosts** — `<div>` with `data-composition-src`. Always require `data-duration`.
- **Video clips** — `<video>` with `muted` and `playsinline`. Duration can default to media length.
- **Audio clips** — `<audio>`. Duration can default to media length.
- **Image clips** — `<img>`. Always require `data-duration`.

Add `class="clip"` to authored visual clips so tooling and examples can find them.

## Tracks Are Temporal, Not Visual

`data-track-index` controls **temporal overlap**, not paint order:

- **Two clips on the same `data-track-index`** must NOT overlap in time. `hyperframes lint` flags this.
- **Visual layering (front/back)** is controlled by CSS `z-index`, not by track index.

A clip on track `5` is not "above" a clip on track `1` — it's just on a different audio/visual lane in time. Use CSS for layering, tracks for sequencing.

## Picking a Track Index

There's no fixed convention, but common patterns:

- **Track 0** — base video (e.g. an A-roll).
- **Track 1+** — visual scenes, overlays, captions.
- **Higher tracks (e.g. 10+)** — audio clips, separated from visual tracks to keep linting clear.

When adding a new clip to an existing composition:

1. Find an existing track that has no overlap with your new clip's `[data-start, data-start + data-duration)` range.
2. Or pick a fresh track index.
3. Never overlap two clips on the same track — the linter will fail and the render is undefined.

## Clip Time Inside the Composition

`data-start` is in seconds, measured from the start of the _composition_. For sub-compositions, the sub-composition's internal timeline (its own `data-duration` and child clips) runs from `data-start` to `data-start + data-duration` of the host.

`data-media-start` (on `<video>`/`<audio>`) is an offset _into the source media_. Use it to skip the first few seconds of a media file without trimming the file itself.
