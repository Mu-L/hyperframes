# Section 08 — SVG and Path

SVG-driven compositions: stroke-dasharray draw-on, MotionPath, shape morph, particle-field SVG, multi-path orchestration. SVG is HyperFrames' best vector format for crisp infinite-zoom visuals — these scenes show what's possible.

**When to study this section:** any beat with a logo reveal, illustrative diagram, line drawing, or icon system. Also when you need crisp vector motion that scales to 4K.

---

## Scenes

| Scene | Duration | Technique | Why study |
|-------|----------|-----------|-----------|
| [`scene-01-vinyl-record/`](scene-01-vinyl-record/) | 3s | SVG vinyl record with 7 concentric groove circles, orange label, spindle hole, shine ellipse + tonearm pivot/shaft/headshell/cartridge/stylus stack. Record spins, tonearm descends into play position. Warm orange radial-gradient stage. | Multi-layer SVG composition with rotation + cohesive object animation. Demonstrates how `transform-origin` + GSAP rotation creates a believable physical object. |
| [`scene-02-logo-stroke-draw/`](scene-02-logo-stroke-draw/) | 7s | **Logo built from SVG paths that draw themselves on.** Outer ring → M monogram (left stem → left diagonal → right diagonal → right stem) → serif notches → accent dot → arc text labels ("MONOGRAM · EST 2026 · HAND-DRAWN" + "STUDIO · BRAND-MARK · 2026") → italic Fraunces caption + mono sub-caption. Cream parchment background with grain overlay. | **The canonical brand-mark reveal.** Pattern: each path has `pathLength="1000"` + `stroke-dasharray="1000"` + `stroke-dashoffset="1000"`, animated to 0 via `tl.to()` (fully seekable). Use for logo intros, brand openers, and any "the mark draws itself" beat. |
| [`scene-03-icon-morph/`](scene-03-icon-morph/) | 8s | **Single SVG path morphs through 5 shapes:** SQUARE → CIRCLE → DIAMOND → STAR → WAVE (bezier blob). Each transition uses a scale-pulse (squash + d-attribute swap + expand) so the morph reads as deliberate, not abrupt. Phase dots below the icon light up to mark progress; state-name + caption swap in sync. | **The reference for icon state-machine UIs.** Pattern: single path element with `d` attribute swapped via `tl.set(el, { attr: { d: "..." } }, t)` at fixed timestamps — fully seekable, no MorphSVGPlugin dependency. Use for any UI showing multiple states of the same icon (a settings cog that fans into a wave, a play button that splits into a pause, etc.). |

---

## QC log

- scene-01: **PASS** — 6 frames; empty stage → record + tonearm enter back.out → continuous spin (~360° over 3s) → tonearm holds in play position. SVG concentric grooves visible; orange "SIDE A / 33 RPM" label rotates with the record. Lifted from `launch-video/compositions/flex-music.html`; duration extended from 0.58s to 3s so the spin is visibly continuous across snapshot intervals.
- scene-02: **PASS** — 6 frames; frame 1 blank cream paper → frame 2 ring drawing in progress → frame 3 ring complete + M structurally complete → frame 4 full logo with serifs + accent dot + arc text → frame 5 logo + italic Fraunces caption → frame 6 final breathing hold. Authored from scratch (not lifted) — fills the section-08 gap with the canonical logo-reveal pattern.
- scene-03: **PASS** — 6 frames showing the icon at distinct shape states (SQUARE → CIRCLE → STAR → WAVE captured in snapshot; DIAMOND lives in the t=3.4-4.6s window that the snapshot interval skips). Phase dots cycle correctly, state-name + caption swap in sync with `d`-attribute changes. Authored from scratch.
