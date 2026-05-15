---
name: hyperframes-cli
description: HyperFrames CLI dev loop. Use when running npx hyperframes init, capture, lint, validate, inspect, snapshot, preview, play, render, publish, doctor, browser, info, upgrade, skills, compositions, docs, benchmark, or telemetry, or when troubleshooting the HyperFrames build/render environment.
---

# HyperFrames CLI

Everything runs through `npx hyperframes`. Requires Node.js >= 22 and FFmpeg.

## Workflow

1. **Scaffold** — `npx hyperframes init my-video` (or `capture` from a URL)
2. **Write** — author HTML composition (see the `hyperframes-core` skill)
3. **Lint** — `npx hyperframes lint`
4. **Validate** — `npx hyperframes validate` (runtime errors + contrast)
5. **Visual inspect** — `npx hyperframes inspect`
6. **Preview** — `npx hyperframes preview`
7. **Render** — `npx hyperframes render`

Run lint, validate, and inspect before preview. `lint` catches missing `data-composition-id`, overlapping tracks, and unregistered timelines. `validate` loads the composition in headless Chrome and reports runtime console errors plus WCAG contrast issues. `inspect` seeks through the timeline and reports text spilling out of bubbles/containers or off the canvas.

## Routing

| Want to…                                                                                                   | Read                                  |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Scaffold a project (`init`, `capture`, `skills`)                                                           | `references/init-and-scaffold.md`     |
| Check correctness (`lint`, `validate`, `inspect`, `snapshot`)                                              | `references/lint-validate-inspect.md` |
| Preview or render (`preview`, `play`, `render`, `publish`)                                                 | `references/preview-render.md`        |
| Diagnose the environment (`doctor`, `browser`)                                                             | `references/doctor-browser.md`        |
| Everything else (`info`, `upgrade`, `compositions`, `docs`, `benchmark`, `telemetry`, asset preprocessing) | `references/upgrade-info-misc.md`     |

## Cross-Skill Hand-Offs

- **Tailwind projects** (`init --tailwind`) → use `hyperframes-tailwind` before editing classes or theme tokens.
- **Registry blocks/components** (`hyperframes add`, `hyperframes catalog`) → use `hyperframes-registry` for install paths, sub-composition wiring, and snippet merging.
- **Asset preprocessing** (`tts`, `transcribe`, `remove-background`) → use `hyperframes-media` for voice selection, Whisper model rules, and TTS-to-captions chain.
- **Parametrized renders** (`--variables`) → declared via `data-composition-variables` on `<html>`; see `hyperframes-core` for the full schema.

## Minimum Completion Gate

```bash
npx hyperframes lint
npx hyperframes validate
```

Add `inspect` for layout-sensitive work and `render --strict` in CI to fail on lint errors.
