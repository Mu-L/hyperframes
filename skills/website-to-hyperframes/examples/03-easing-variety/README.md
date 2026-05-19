# Section 03 — Easing Variety

CSS animation and easing variety reference. The 7 production easings live in [`_shared/easing-glossary.md`](../_shared/easing-glossary.md); this section's scenes are the visual proof of what each easing FEELS like.

**When to study this section:** any time you find yourself defaulting to `power2.out` on every tween. Open these scenes to see what 17+ pure-CSS animations + GSAP easings look like side-by-side.

---

## Scenes

| Scene | Duration | Technique | Why study |
|-------|----------|-----------|-----------|
| [`scene-01-css-animation-grid/`](scene-01-css-animation-grid/) | 3.5s | 6×3 grid of pure-CSS animations (spinners, pulses, morphs, waves, orbits, gradient cycles, flip cards, bars, bounces) on warm cream paper background. Each cell runs independently. | Demonstrates what CSS alone can do without GSAP. Shows 17 distinct motion types in one frame so you can pattern-match easing to intent. |
| [`scene-02-easing-race/`](scene-02-easing-race/) | 6s | **7-lane easing race**: 7 colored balls travel the same horizontal track over the same 2s duration, each driven by a different GSAP easing — `power4.out` (snap), `back.out(1.7)` (whip), `expo.out` (soft), `power1.out` (mechanical), `elastic.out(1, 0.5)` (bounce), `expo.inOut` (dramatic), `none` (drift). Lane labels include the intent name + a "use for" hint. | **The teaching scene for easing variety.** When an agent or developer asks "what does back.out actually feel like vs expo.out", point them at this race. The fact that all balls finish at the same time but spend the journey at very different positions is the entire pedagogical payload. Pair with `_shared/easing-glossary.md` for the spec; this scene is the visual proof. |

---

## QC log

- scene-01: **PASS** — 6 frames; cells in distinctly different states across frames (morph cycles red → green → blue → orange → teal, flip card flipping, orbit dots in 4 angular configurations, pulse rings expanding, scale grid mid-ripple). Extended source's 1.71s timeline to 3.5s so snapshot intervals land on visibly different motion states. Lifted from `launch-video/compositions/flex-css.html`.
- scene-02: **PASS** — 5 frames; frame 3 (mid-race at 3.0s) catches the balls spread across the track at distinctly different positions, making the easing differences visceral. Each lane has a labeled intent name + use-case hint. Authored from scratch (not lifted) to fill the section-03 gap.
