# Beat Builder Guide

You are building ONE beat of a multi-beat video composition. This file tells you what to read, how to build, how to verify, and how to report back.

## Step 1: Read and understand

**Required for EVERY beat, in this order:**

1. **The matching example scene from [`examples/`](../examples/)** — the beat spec tells you which one (e.g. `examples/04-composed-ui/scene-01-kanban-board/index.html`). **Read its full source end-to-end** — markup, CSS, GSAP timeline, comments. Then COPY its `index.html` into your `compositions/beat-N-name.html` and mutate it to your beat's content. **Do not write from scratch — there is always a closer example.** If the beat spec didn't cite a scene, escalate back to the main agent: the storyboard is incomplete.
2. **Load the `hyperframes` skill** — composition rules, data attributes, timeline contract, deterministic rendering. Read the whole skill.
3. **[capabilities.md](capabilities.md)** — full inventory of HyperFrames capabilities (24 sections). Read the Table of Contents first, then deep-dive sections your beat needs.
4. **The beat spec** the main agent gave you — concept, choreography, assets, brand values, timing.

**Why the example scene comes first:** every prior eval round showed sub-agents writing from-scratch compositions that defaulted to "static screenshot + Ken Burns + fade-in headline." The example scenes are calibrated to demonstrate the techniques that work. Copy first, mutate second.

**Pattern-match the timeline, replace the content.** What you keep from the example scene: the markup scaffold, the CSS structure, the GSAP timeline shape, the easing variety, the continuous-motion sub-tweens during holds, the per-frame snapshot determinism (pre-built DOM + CSS-locked initial state). What you mutate: the words, the brand colors (pull from DESIGN.md), the specific element content (your beat's data, not the example's), the duration if the beat is longer/shorter than the example.

**If your beat has narration**, also study [`examples/04-composed-ui/scene-02-chat-with-typing/index.html`](../examples/04-composed-ui/scene-02-chat-with-typing/index.html) — it's the canonical narration-sync pattern. Every meaningful narration phrase from `transcript.json` should land at a timeline event at the same timestamp.

**Read based on what your beat needs (pick relevant ones):**

| Resource                                                                    | What it covers                                                                                                                | Read when                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [techniques.md](../../hyperframes/references/techniques.md)                 | 20 visual techniques with code: SVG path drawing, Canvas 2D, CSS 3D, kinetic type, variable fonts, MotionPath, counters       | Beat uses any of these techniques                 |
| [text-effects.md](../../hyperframes/references/text-effects.md)             | 24 named text animations: soft-blur-in, typewriter, kinetic-center-build, line-reveal, stagger, crossfade, shared-axis        | Beat has text animation                           |
| [html-in-canvas-patterns.md](html-in-canvas-patterns.md)                    | HTML-in-Canvas: iPhone/MacBook mockups, liquid glass, magnetic, portal, shatter, text cursor                                  | Beat uses device mockups or WebGL effects on HTML |
| [transitions.md](../../hyperframes/references/transitions.md)               | Shader transition API, HyperShader.init() pattern, all 14 WebGL shaders                                                       | Beat has shader transitions                       |
| [transitions/](../../hyperframes/references/transitions/)                   | 14 CSS transition category files: push, scale, dissolve, blur, 3D flip, light leak, distortion, grid, mechanical, destruction | Beat uses CSS transitions                         |
| [css-patterns.md](../../hyperframes/references/css-patterns.md)             | Text markers: highlight sweeps, hand-drawn circles, burst lines, scribble, sketchout                                          | Beat uses text emphasis/markers                   |
| [audio-reactive.md](../../hyperframes/references/audio-reactive.md)         | Bass→scale, mid→shape, treble→glow mappings                                                                                   | Beat reacts to music/audio                        |
| [captions.md](../../hyperframes/references/captions.md)                     | Per-word karaoke, tone-adaptive styling, positioning                                                                          | Beat includes captions                            |
| [typography.md](../../hyperframes/references/typography.md)                 | Font hierarchy, variable fonts, responsive type scaling                                                                       | Beat has complex typography                       |
| [motion-principles.md](../../hyperframes/references/motion-principles.md)   | Velocity matching, easing philosophy, motion continuity                                                                       | Beat needs polished motion design                 |
| [dynamic-techniques.md](../../hyperframes/references/dynamic-techniques.md) | Counter animations, data-driven visuals, dynamic content                                                                      | Beat has counters or data visualization           |
| [video-composition.md](../../hyperframes/references/video-composition.md)   | Frame composition, color presence, scale, density rules                                                                       | General composition quality                       |

**Other skills you can load if needed:**

- `/gsap` or `/gsap-core`, `/gsap-timeline`, `/gsap-plugins` — deeper GSAP reference
- `/animate-text` — curated text animation catalog with exact JSON specs
- `/hyperframes-registry` — if you need to install and wire registry blocks
- `/hyperframes-contrast` — audit color contrast (WCAG)
- `/lottie`, `/three`, `/waapi`, `/animejs`, `/css-animations` — if beat uses these engines

**Always view before using:**

- Captured assets from `capture/assets/` — VIEW the image before placing text on it. Check safe zones, contrast, actual content.

## Step 2: Build the composition

Save to the path the main agent specified (usually `compositions/beat-N-name.html`).

```html
<template>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    /* your styles */
  </style>

  <div
    id="beat-N-name"
    data-composition-id="beat-N-name"
    data-width="1920"
    data-height="1080"
    style="width:1920px; height:1080px; position:relative; overflow:hidden; background:#YOUR_BG;"
  >
    <!-- your elements -->
  </div>

  <script>
    (function () {
      var BEAT = 5.5; // MUST match data-duration on the host div in index.html
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused: true });

      // your GSAP animations

      window.__timelines["beat-N-name"] = tl;
    })();
  </script>
</template>
```

**Critical:** `data-composition-id`, `data-width`, `data-height` on the root div MUST match the host div in index.html.

## Step 3: Lint

```bash
npx hyperframes lint .
```

Fix ALL errors. Zero errors required.

## Step 4: Snapshot and verify

```bash
npx tsx packages/cli/src/cli.ts snapshot . --frames 3
```

**READ the contact sheet** (`snapshots/contact-sheet.jpg`). For each frame:

- Is content visible? (not black, blank, or loading)
- Is text readable, properly positioned, correct font/color?
- Are assets at the right size and position?
- Does the animation state match the beat spec at this timestamp?

**If anything is wrong:** fix, re-snapshot, re-check. You are done ONLY when every frame matches the spec.

## Step 5: Report back

Tell the main agent:

1. **File:** path to saved composition
2. **Lint:** pass/fail + error count
3. **What each snapshot frame shows** — be specific: "Frame 1 at 0.5s: dark bg, blue glow center, headline 'Everything App' in white Inter 120px, subtitle fading in below." Not "looks good."
4. **Issues found and fixed** during snapshot review
5. **Issues you couldn't fix** (if any)

---

## Continuous motion — the most important rule

A beat is a SCENE, not a single entrance animation. Your GSAP timeline should have events spread across the ENTIRE beat duration — not just entrance tweens in the first 1-2 seconds followed by nothing. If an element is on screen, it should be doing something: drifting, breathing, parallaxing, revealing new details, transforming. Nothing sits unchanged for more than ~2 seconds. After elements enter, add continuous hold motion: Ken Burns drift on images, subtle y/scale breathing on text, parallax layers moving at different speeds, secondary elements appearing mid-beat.

## Rules

- SCRIPT PLACEMENT: scripts inside `<template>`, never after `</template>`. Scripts outside see no DOM.
- GSAP FROM TRAP: never `gsap.from(el, {opacity:0})` with CSS `opacity:0`. It animates 0→0. Use `tl.fromTo()`.
- STYLE: avoid CSS `opacity:0` on GSAP-animated elements. Use GSAP fromTo for initial states.
- ASSET PATHS: project-root-relative. `capture/assets/file.png` ✅ `../capture/assets/file.png` ❌
- SVG VIA IMG: `<img src="logo.svg">` can't inherit CSS color. Inline SVG or `filter: brightness(0) invert(1)`.
- CSS CENTERING: no `transform: translate(-50%, -50%)` with GSAP transforms. Use flexbox or `xPercent/yPercent`.
- QUERYSELECTOR: `document.getElementById("id")` with null guards. No method calls without null check.
- CHARACTER SPANS: `display:inline-block` on spaces collapses them. Use `&nbsp;` or per-word spans.
- COUNTERS: no `onUpdate` callbacks. Discrete `tl.set(el, {textContent: "42"}, 2.5)` at timestamps. For a 0→128K counter over 2s, that means 20–30 `tl.set()` calls along the duration — easier than it sounds, and fully seekable. See `examples/04-composed-ui/scene-05-dashboard-counters/index.html` for the canonical pattern.
- CANVAS RENDER LOOPS: do NOT drive canvas rendering via `tl.to(proxy, {onUpdate: render})`. That pattern works during live playback but does NOT fire during `tl.seek()` (which the snapshot/render CLI uses to scrub the timeline). Result: black frames in the rendered video. Instead, use `gsap.ticker.add()` and read `tl.time()` each frame to call your render function. See `examples/07-html-in-canvas/scene-02-canvas-ascii/index.html` for the working pattern.
- DOM MUTATION IN TIMELINE: do NOT use `tl.call(function() { /* createElement, appendChild, etc */ })` to build DOM during the timeline. Callbacks don't fire during `tl.seek()`. Build ALL DOM upfront (pre-split text spans, pre-rendered phrase wrappers stacked with `position:absolute`), then toggle visibility via opacity/display in the timeline. See `examples/01-typography/scene-01-soft-blur-in/index.html` for the multi-phrase pattern.
- TIMELINE: `window.__timelines["beat-N-name"] = tl` synchronously. Key = `data-composition-id`.
- DETERMINISTIC: no `Math.random()`, `Date.now()`, `requestAnimationFrame`, `repeat:-1`.
- Always `tl.fromTo()` not `tl.from()` for entrances.
- Never stack two transform tweens on same element at same time.
- FONTS: brand fonts with `capture/assets/fonts/` path need `@font-face` in `<style>`.

## Easing — pick per intent

Do NOT default to `power2.out` on everything.

| Intent          | GSAP Ease             | Use for                              |
| --------------- | --------------------- | ------------------------------------ |
| Snap (iOS feel) | `power4.out`          | Hero text, UI elements               |
| Whip overshoot  | `back.out(1.7)`       | Numbers, badges, impact              |
| Soft land       | `expo.out`            | Per-word reveals, gentle entrances   |
| Mechanical      | `power1.out`          | Terminal text, code typing           |
| Bounce settle   | `elastic.out(1, 0.5)` | Counters, CTA buttons                |
| Dramatic        | `expo.inOut`          | Full-screen statements, hero reveals |
| Drift           | `"none"`              | Parallax, Ken Burns, camera drift    |

Staggered items: `power4.out` with `stagger: 0.08` to `0.15`.
