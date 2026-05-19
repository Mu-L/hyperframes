# Section 13 — Anti-Patterns

The 4 failure modes that EVERY prior pipeline-eval run defaulted to. Each scene demonstrates a failure mode visually AND annotates itself with on-screen red banners + inline `// THE PROBLEM:` source comments so the viewer (or agent reading the file) immediately understands what's wrong.

**When to study this section:** before writing your own composition. If your beat resembles any of these scenes, redesign it. The counter-reference for each is the matching scene in `04-composed-ui/`, `01-typography/`, etc.

**Each scene is intentionally "bad" but renders correctly** — the failure is in the AUTHORING choices, not in technical breakage. The scenes function (lint clean, snapshot clean); they just demonstrate what NOT to do.

---

## Scenes

| Scene | Duration | Failure mode | Counter-reference |
|-------|----------|--------------|-------------------|
| [`scene-01-slideshow-trap/`](scene-01-slideshow-trap/) | 12s (intentionally too long) | 3 simulated "screenshot" panels with Ken Burns slow zoom + crossfade. No events, no continuous motion, identical structure across the 3 panels. The textbook PowerPoint reel. | [`04-composed-ui/scene-01-kanban-board`](../04-composed-ui/scene-01-kanban-board/) — compose UI from divs with 12+ distinct timeline events. [`04-composed-ui/scene-02-chat-with-typing`](../04-composed-ui/scene-02-chat-with-typing/) — narration-anchored events. |
| [`scene-02-static-after-entrance/`](scene-02-static-after-entrance/) | 9s | All elements enter the frame in the first 1.5s. Then NOTHING moves for the remaining 7.5s. Includes on-screen countdown "Static for X seconds →" to make the duration of staticness viscerally obvious. Frames 3-8 are visually identical. | [`01-typography/scene-01-soft-blur-in`](../01-typography/scene-01-soft-blur-in/) — continuous motion done right: grain drift, scale pulse, breathing during holds. |
| [`scene-03-power2-everywhere/`](scene-03-power2-everywhere/) | 7s | Side-by-side: LEFT half runs all `power2.out` on every tween; RIGHT half runs the SAME elements with varied easings (`power4.out`, `back.out(1.7)`, `expo.out`, `elastic.out(1, 0.5)`, etc.) so the viewer can directly compare. Banner reads "BORING → VARIED". | [`_shared/easing-glossary.md`](../_shared/easing-glossary.md) — the 7 production easings and when to use each. |
| [`scene-04-screenshot-ken-burns/`](scene-04-screenshot-ken-burns/) | 8s | A single fake-screenshot rectangle filling 80% of the frame with a slow linear Ken Burns drift. Looks like marketing-site B-roll. Banner: "ANTI-PATTERN: SCREENSHOT + KEN BURNS. Across 11 pipeline-eval runs, 11/11 defaulted to this. 0/11 used HTML-in-canvas, SVG draw, counters, or kinetic typography. Stop." | [`04-composed-ui/scene-01-kanban-board`](../04-composed-ui/scene-01-kanban-board/) + [`04-composed-ui/scene-05-dashboard-counters`](../04-composed-ui/scene-05-dashboard-counters/) — build the UI from divs. |

---

## QC log

- scene-01: **PASS** — 8 frames; red ANTI-PATTERN banner + "BAD EXAMPLE" diagonal watermark + "DON'T DO THIS" callout all visible. Three panels (01 blue / 02 red / 03 green) crossfade with Ken Burns zoom over 12s. Frames 2-3 and 4-5 and 7-8 are nearly identical pairs — that's the point.
- scene-02: **PASS** — 8 frames; entrance complete by frame 2, then frames 3-8 show pixel-identical demo content with only the countdown overlay advancing. 6 consecutive identical frames covering 6.4 seconds.
- scene-03: **PASS** — 7 frames; banner "BORING → VARIED" + side-by-side rendering. Left column elements visibly mushier ("everything moves the same way"), right column has bouncy badge, snapping headline, elastic counter, drifting glow, mechanical icon row — five distinct motion behaviors at once.
- scene-04: **PASS** — 8 frames; "PRETEND THIS IS A REAL CAPTURED SCREENSHOT" stamp on the fake rectangle. Visible Ken Burns drift (scale 1.0→1.08, +30/-16 translate) across frames. Yellow arrow + side caption + "0 / 11 runs used real composition" stat pill all visible.
