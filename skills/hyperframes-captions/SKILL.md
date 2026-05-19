---
name: hyperframes-captions
description: Caption and transcript authoring for HyperFrames. Use when adding subtitles, captions, lyrics, karaoke, per-word styling, dynamic caption motion, transcript cleanup, transcript JSON/SRT/VTT import, or caption timing from audio.
---

# HyperFrames Captions

Use this skill for caption authoring after the composition structure is understood. For generating the transcript asset with `npx hyperframes transcribe`, use `hyperframes-media`; this skill covers how to consume and animate transcript data in HTML.

## Two Paths

Pick before authoring:

1. **Install a pre-built style** — the registry has 15 caption components ready to drop in: `caption-pill-karaoke`, `caption-highlight`, `caption-kinetic-slam`, `caption-glitch-rgb`, `caption-gradient-fill`, `caption-neon-glow`, `caption-matrix-decode`, `caption-clip-wipe`, `caption-emoji-pop`, `caption-editorial-emphasis`, `caption-neon-accent`, `caption-parallax-layers`, `caption-particle-burst`, `caption-texture`, `caption-weight-shift`. Run `npx hyperframes catalog --tag captions` to browse, then `npx hyperframes add <name>`. Wiring details live in the `hyperframes-registry` skill.
2. **Author from scratch** — when no pre-built style fits or per-word logic is custom. Follow the Workflow below.

## Workflow

1. Identify the transcript source:
   - Existing `transcript.json`, SRT, VTT, or OpenAI/Groq response.
   - No transcript yet: use `hyperframes-media` to generate one.
2. Read `references/transcript-guide.md` for input format, cleaning, and mandatory quality checks.
3. Read `references/captions.md` for word grouping, positioning, overflow prevention, and exit guarantees.
4. For dynamic/karaoke styles, read `references/dynamic-techniques.md`.
5. Build caption DOM with stable word IDs, register GSAP timeline changes synchronously, and run validation.

## References

- `references/transcript-guide.md`: supported transcript formats, quality checks, cleaning, external API import, and no-transcript flow.
- `references/captions.md`: caption language rule, transcript source, style detection, grouping, positioning, per-word styling, and hard exit guarantees.
- `references/dynamic-techniques.md`: karaoke, clip-path, slam, scatter, elastic, 3D, and audio-reactive caption techniques.

## Contract

- Keep captions deterministic and seekable.
- Do not depend on CSS animations that cannot be seeked for word-accurate timing.
- Use `window.__hyperframes.fitTextFontSize()` or equivalent layout checks for dynamic groups.
- Give each group and word a stable ID so timeline calls and overrides remain debuggable.
- Hard-hide each caption group at its end time so old text cannot linger.

## Validation

After caption changes:

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect
```

Use `inspect --at` for timestamps where groups are widest or fastest.
