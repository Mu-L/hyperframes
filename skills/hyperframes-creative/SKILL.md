---
name: hyperframes-creative
description: Creative direction and recipes for HyperFrames videos. Use for design.md handling, visual styles, palettes, motion principles, typography, scene transitions, beat planning, narration, audio-reactive visuals, marker effects, title cards, data-in-motion, and advanced composition techniques.
---

# HyperFrames Creative

Use this skill after the technical composition contract is clear. For minimal renderable HTML and framework rules, use `hyperframes-core`. This skill adds brand, pacing, style, transitions, and recipe-level guidance.

## Workflow

1. If a project has `design.md` or `DESIGN.md`, treat it as brand truth: colors, fonts, spacing, tone, and constraints.
2. If no design file exists and the user asks for visual direction, choose a route:
   - Named style or mood: read `visual-styles.md`.
   - Fast defaults: read `house-style.md`.
   - Interactive selection: read `references/design-picker.md`.
3. For multi-scene work, plan beats and rhythm before writing HTML. Read `references/beat-direction.md` and `references/transitions.md`.
4. For motion-heavy work, read `references/motion-principles.md` and the relevant recipe reference.
5. After authoring significant animation, run the animation map script and inspect its flags.

## References

- `house-style.md`: default palettes, motion, typography, and lazy defaults to question.
- `visual-styles.md`: named style presets and mood-to-style routing.
- `palettes/*.md`: palette-specific color tokens.
- `patterns.md`: PiP, text-behind-subject, title card, slide show, and top-level examples.
- `data-in-motion.md`: stats and infographic presentation rules.
- `references/prompt-expansion.md`: structured expansion for open-ended prompts.
- `references/video-composition.md`: video-medium density, scale, color, and frame-composition guidance.
- `references/beat-direction.md`: per-beat direction, rhythm planning, and transition timing.
- `references/transitions.md`: scene transition selection and implementation guidance.
- `references/transitions/catalog.md`: transition implementation catalog.
- `references/motion-principles.md`: motion guardrails and GSAP rules that affect visual quality.
- `references/typography.md`: font selection, pairings, and rendered-video type guardrails.
- `references/narration.md`: script pacing, tone, openings, and number pronunciation.
- `references/audio-reactive.md`: precomputed audio data mapped to motion.
- `references/css-patterns.md`: marker highlight, circle, burst, scribble, and sketchout effects.
- `references/techniques.md`: SVG, Canvas 2D, CSS 3D, kinetic type, Lottie, compositing, variable fonts, and other advanced techniques.
- `references/gsap-effects.md`: typewriter and audio visualizer recipes moved out of the core GSAP API skill.

## Scripts

- `scripts/animation-map.mjs`: analyze GSAP choreography, dead zones, stagger, lifecycle, and flags.
- `scripts/contrast-report.mjs`: inspect contrast warnings from rendered frames.
- `scripts/extract-audio-data.py`: pre-extract audio bands for audio-reactive compositions.
- `scripts/package-loader.mjs`: support script for bundled creative tooling.

Run scripts from the repo root with explicit paths, for example:

```bash
node skills/hyperframes-creative/scripts/animation-map.mjs <composition-dir> \
  --out <composition-dir>/.hyperframes/anim-map
```

## Boundaries

- Do not override `hyperframes-core` technical rules.
- Do not require a design system for a minimal technical composition.
- Do not add extra scenes, narration, music, captions, or transitions unless the request calls for them or you first propose the expansion.
- Keep creative recipe references task-specific; do not read every reference for simple edits.
