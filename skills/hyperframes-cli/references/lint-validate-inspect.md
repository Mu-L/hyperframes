# lint, validate, inspect, snapshot

The correctness pipeline. Run in this order: `lint` (static, fast) → `validate` (runtime, headless Chrome) → `inspect` (layout sweep). `snapshot` is a separate utility for capturing still frames.

## Discipline (motion-heavy work)

When the composition is animation-driven, run the checks before you reach for `preview` or `render`:

- Run `lint` after the first HTML pass — earlier, not later.
- Capture `snapshot` at meaningful timeline states; look at the PNGs.
- Inspect snapshots _before_ tuning automated warnings — your eye catches what the auditor misses.
- Treat layout warnings as defects unless a snapshot proves the overflow is intentional, in which case mark it with `data-layout-allow-overflow`.

## lint

```bash
npx hyperframes lint                  # current directory
npx hyperframes lint ./my-project     # specific project
npx hyperframes lint --verbose        # info-level findings
npx hyperframes lint --json           # machine-readable
```

Lints `index.html` and all files in `compositions/`. Reports errors (must fix), warnings (should fix), and info (with `--verbose`). Catches missing `data-composition-id`, overlapping tracks on the same `data-track-index`, and unregistered timelines.

## validate

```bash
npx hyperframes validate              # current directory
npx hyperframes validate ./my-project # specific project
npx hyperframes validate --json       # agent-readable findings
npx hyperframes validate --timeout 5000  # ms to wait for scripts (default 3000)
npx hyperframes validate --no-contrast   # skip WCAG contrast audit while iterating
```

Static lint is fast but blind to runtime failures. `validate` loads the composition in headless Chrome, plays through it, and reports:

- JavaScript console errors and unhandled exceptions
- Failed network requests (media-file `ERR_ABORTED` filtered out)
- WCAG AA contrast violations on visible text — sampled at 5 timestamps across the timeline. Disable with `--no-contrast`.

Run `validate` before `inspect` when an animation has scripts, fetched data, or theming. Combine with `render --strict` in CI.

## inspect

```bash
npx hyperframes inspect                 # inspect rendered layout over the timeline
npx hyperframes inspect ./my-project    # specific project
npx hyperframes inspect --json          # agent-readable findings (schemaVersion, samples, issues, bboxes)
npx hyperframes inspect --samples 15    # denser timeline sweep (default 9)
npx hyperframes inspect --at 1.5,4,7.25 # explicit hero-frame timestamps
npx hyperframes inspect --tolerance 4   # allowed overflow in px before reporting (default 2)
npx hyperframes inspect --strict        # exit non-zero on warnings too (default: only errors)
```

Use this after `lint` and `validate`, especially for compositions with speech bubbles, cards, captions, or tight typography. It reports:

- Text extending outside the nearest visual container or bubble
- Text clipped by its own fixed-width/fixed-height box
- Text extending outside the composition canvas
- Children escaping clipping containers

Errors should be fixed before rendering. Warnings are surfaced for agent review; add `--strict` to fail on warnings too. Repeated static issues are collapsed by default so JSON output stays compact for LLM context windows.

**Escape hatches:**

- `data-layout-allow-overflow` — mark an element or ancestor when overflow is intentional for an entrance/exit animation.
- `data-layout-ignore` — mark a decorative element that should never be audited.

`npx hyperframes layout` remains available as a compatibility alias for the same visual inspection pass.

## snapshot

```bash
npx hyperframes snapshot                       # 5 key frames as PNG
npx hyperframes snapshot ./my-project          # specific project
npx hyperframes snapshot --frames 10           # evenly-spaced N frames
```

Captures still PNGs from the composition for visual diffing, thumbnails, or attaching to a PR. Faster than rendering a video when you only need a few hero frames. Output lands in the project's snapshots directory.
