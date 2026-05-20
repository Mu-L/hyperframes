---
name: hyperframes-captions
description: Author captions, subtitles, lyrics, and karaoke for HyperFrames compositions. Use when transcript-timed text must appear on screen — word-level karaoke, per-word styling, dynamic caption motion, transcript JSON/SRT/VTT import, audio-reactive lyrics, or caption timing from `transcript.json`. Generating the transcript itself lives in `hyperframes-media`.
---

# HyperFrames Captions

Bind transcript-timed text to a HyperFrames composition. Transcript generation (`npx hyperframes transcribe`, voice/model selection) lives in `hyperframes-media`; the GSAP API itself lives in `hyperframes-gsap`; marker-highlight effects live in `hyperframes-creative`.

## Decide First: Install Or Author

| Condition                                                        | Path                                 |
| ---------------------------------------------------------------- | ------------------------------------ |
| A registry component matches content tone **and** per-word logic | Install (selection table below)      |
| Per-word logic is custom, or no preset fits                      | Author from scratch (workflow below) |

### Registry Selection

Run `npx hyperframes catalog --tag captions` to confirm versions, then `npx hyperframes add <name>`. Wiring (host element, slot IDs, variable overrides) lives in `hyperframes-registry`. Pick deterministically from content type, not aesthetic preference:

| Component                    | Pick when                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| `caption-pill-karaoke`       | Podcast / social clip; per-word color sweep inside a pill chip          |
| `caption-highlight`          | TikTok-style red background sweep behind each active word               |
| `caption-kinetic-slam`       | One-word-per-frame hype edit; alternating slam-in directions            |
| `caption-clip-wipe`          | Minimal left-to-right clip-path reveal per word                         |
| `caption-gradient-fill`      | Bold gradient text with elastic bounce; product hero / brand reveal     |
| `caption-neon-glow`          | Dark scene, cyan + magenta neon, keyword accent colors                  |
| `caption-neon-accent`        | Multi-color neon highlight across several keywords with wiggle drift    |
| `caption-glitch-rgb`         | RGB chromatic aberration + CRT scanlines; tech / cyberpunk tone         |
| `caption-matrix-decode`      | Character-scramble decode before each word resolves                     |
| `caption-particle-burst`     | Keyword words trigger colored particle explosions; high-energy hype     |
| `caption-emoji-pop`          | Captions mixing text + emoji with stroked outlines                      |
| `caption-editorial-emphasis` | Long-form / documentary; dual-font with dramatic size contrast          |
| `caption-parallax-layers`    | Behind-subject 3D text layering (requires subject cutout, see media)    |
| `caption-texture`            | Large uppercase headline captions with material textures (lava, metal…) |
| `caption-weight-shift`       | Calm editorial; line-to-line font-weight crossfade                      |

## Author-From-Scratch Workflow

1. **Locate the transcript.** Check project root for `transcript.json` / `.srt` / `.vtt`. If absent, generate via `hyperframes-media` — never rely on the CLI default model; pass `--model` per Hard Rule 1.
2. **Quality-check the transcript.** `references/transcript-guide.md` is mandatory. Reject runs where >20 % of entries are `♪` / `�` tokens or contain garbled non-words. Retry with a larger model or fall back to manual SRT / external API.
3. **Detect tone, group words.** `references/captions.md` — Script-to-Style Mapping (Hype / Corporate / Tutorial / Storytelling / Social), word grouping (2-3 / 3-5 / 4-6 words by energy), break on sentence boundaries or 150 ms+ pauses.
4. **Build caption DOM with stable IDs.** One container per group (`cg-<i>`), one span per word (`w-<i>`). Stable IDs are the contract for per-word writes, marker overrides, and the exit-lint.
5. **Register one GSAP timeline synchronously** at `window.__timelines["<composition-id>"]`. Entrance via `gsap.from()`; **no exit tweens except the hard kill** (Hard Rule 4).
6. **If the source is music, attach audio-reactive modulation** at build time using pre-extracted bands (`hyperframes-creative/scripts/extract-audio-data.py`). See `references/dynamic-techniques.md` — mandatory for any musical content.
7. **Embed the exit self-lint** before `window.__timelines[id] = tl` (snippet in `references/captions.md` § Caption Exit Guarantee). It runs at composition init and warns if any group is still visible at `group.end + 0.01s`.
8. **Validate** — see Validation.

## Hard Rules

1. **Language model.** Never pass a `*.en` model for non-English audio — `.en` models translate, not transcribe. CLI default is `small.en`; always pass `--model` explicitly. Known English → `small.en` (or `medium.en` for music/noise); known non-English → `small --language <iso>`; unknown → `small` (auto-detect).
2. **Deterministic build.** No `Math.random()`, `Date.now()`, `performance.now()`, `setTimeout`, `Promise`, or `fetch` during timeline construction. Audio data and transcript JSON must be inlined or loaded synchronously at page load.
3. **One group visible at any time.** Two `cg-*` groups must never have overlapping `[start, end]` intervals.
4. **Hard exit kill on every group.** After the exit tween, emit `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, group.end)`. Without it, captions linger into the next scene.
5. **`overflow: visible` on every caption container.** `overflow: hidden` clips scale-pop emphasis words and glow effects.
6. **No `left: 50%; transform: translateX(-50%)` for centering.** Use a full-width absolute container; the translate pattern clips at composition edges.
7. **Audio-reactive is mandatory for music sources.** Modulate scale and glow from pre-extracted bands at build time, not via per-frame callbacks or `tl.call`.
8. **Marker effects layer on karaoke.** Karaoke is the baseline reveal; sweep / circle / burst / scribble apply only to emphasis words. Implementation: `hyperframes-creative/references/css-patterns.md`.
9. **No `<br>` in caption text.** Wrap via `max-width`; forced breaks compound with natural wrap and cause overlap.

## Routing

| Want to…                                                                    | Read                                                 |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| Pick a Whisper model, clean transcript, handle music tokens, retry rules    | `references/transcript-guide.md`                     |
| Choose tone → font / animation / palette; group words; prevent overflow     | `references/captions.md`                             |
| Build karaoke, clip-path reveal, slam, scatter, elastic, 3D, audio-reactive | `references/dynamic-techniques.md`                   |
| Author the exit self-lint snippet                                           | `references/captions.md` § Caption Exit Guarantee    |
| Add marker highlight (sweep / circle / burst / scribble)                    | `hyperframes-creative/references/css-patterns.md`    |
| Extract per-frame audio bands for reactive lyrics                           | `hyperframes-creative/scripts/extract-audio-data.py` |
| Generate the transcript itself (`transcribe` CLI, voice/model selection)    | `hyperframes-media`                                  |
| Wire a registry caption component (host element, slots, variables)          | `hyperframes-registry`                               |
| GSAP tween syntax, easing, timeline API                                     | `hyperframes-gsap`                                   |

## Validation

**Fast (block on results):**

- [ ] `npx hyperframes lint` passes (0 errors)
- [ ] `npx hyperframes validate` passes (0 console errors)
- [ ] The composition's embedded exit self-lint emits no `[caption-lint] group N still visible…` warnings in `validate` output

**Slow (run while previewing):**

- [ ] `npx hyperframes inspect --at <widest-or-fastest-group-times>` reports no unmarked overflow
- [ ] At every group's `end + 0.01s`, computed `opacity === "0"` and `visibility === "hidden"`
- [ ] No two caption groups visible in the same frame
- [ ] For music sources: scale / glow modulation tracks the audio envelope visibly across the timeline
