# Section 04 — Composed UI

The most-important section in this entire library. Every scene here is a **product UI built from divs** — kanban board, chat, terminal, command palette, dashboard, file tree, code editor, calendar. Zero screenshots. Zero captured assets. All HTML/CSS/GSAP.

**Why this section matters:** In the 11 isolated pipeline-eval runs, EVERY video used screenshots as the primary visual when showing product UI. None of the 11 composed a kanban board from columns + cards, chat from bubbles + typing dots, or a dashboard from animated counters. This section gives agents the canonical "you build these — you don't screenshot them" reference.

**When to study this section:** any beat where the storyboard says "show the kanban / show the chat / show the dashboard / show the terminal / show the command palette / show the calendar." Open the matching scene FIRST. Copy its structure. Mutate the content.

---

## Scenes

| Scene | Duration | Technique | Why study |
|-------|----------|-----------|-----------|
| [`scene-01-kanban-board/`](scene-01-kanban-board/) | 9s | 3-column kanban with cards. Cards enter staggered into columns. One card animates a drag-and-drop across columns (Todo → In Progress) with shadow ramp and rotation. New column counter pulses. | Most-requested UI demo. Build kanban from `<div class="column">` + `<div class="card">`, not screenshots. |
| [`scene-02-chat-with-typing/`](scene-02-chat-with-typing/) | 8s | Chat panel with 3 messages, typing indicator (3 animated dots), reaction emoji burst on one message, reply slides in. Every message and event is narration-synced. | THE canonical chat-beat — lifted structure from `videos/v9/huly-launch/compositions/beat-4-chat.html` which was the only beat the user rated highly across 9 rounds. Every meaningful narration phrase = a visual event. |
| [`scene-03-terminal-typeon/`](scene-03-terminal-typeon/) | 7s | Terminal window. Multi-line command types in (steps(1) ease), output prints below in monospace green, exit code badge animates in. Window chrome with traffic-light dots. | Demonstrates terminal/command output without screenshotting a real terminal. |
| [`scene-04-command-palette/`](scene-04-command-palette/) | 7s | Cmd+K palette overlay. Search input gets keystrokes typed, results filter in real-time (rows fade in/out as the search term narrows), top result highlights, then `↵` lands it. | Command palette is everywhere in modern dev tools (Raycast, VS Code, Linear). Build it from divs, animate the filter, never screenshot it. |
| [`scene-05-dashboard-counters/`](scene-05-dashboard-counters/) | 10s | 4 KPI cards: counter (0→128K), sparkline drawing, pie/donut fill, percentage gauge. Cards enter staggered, counters and lines animate inside each card, status pulses (green dot blinking) for "live data" feel. | The "stats / numbers" beat. Animate `textContent` via `tl.set()` at evenly-spaced timestamps; draw sparkline with stroke-dasharray. |
| [`scene-06-file-tree-reveal/`](scene-06-file-tree-reveal/) | 8s | Folder tree (like VS Code sidebar). Folders expand sequentially, files slide in with monospace icons. Selected file highlights, a "Recent" badge animates. | Useful for "explore the project" beats. Indented divs + animated `max-height` for the expand. |
| [`scene-07-code-editor-typing/`](scene-07-code-editor-typing/) | 8s | Code editor pane. Syntax-colored code types in line-by-line, cursor moves between lines, an error squiggle appears and then disappears as a fix is typed. Line numbers fade in alongside each line. | "Show the code" beats. Demonstrates syntax-colored text via per-span color classes, NOT a screenshot of a real editor. |
| [`scene-08-calendar-events/`](scene-08-calendar-events/) | 8s | Weekly calendar grid (7 cols × hour rows). Today's column highlights. Events slide in at their slots — one is "happening now" with a pulse, one is upcoming, one is past. A meeting popover slides up from one event. | Calendar / schedule beats. Pure CSS grid + animated cards. |

---

## What to study, in priority order

1. **`scene-02-chat-with-typing/`** — first. This is THE narration-sync gold standard. Study how every visual event lands at the timestamp where a narration phrase would say something. The same pattern works for ANY beat where you have transcript.json word timestamps.

2. **`scene-01-kanban-board/`** — second. Demonstrates the core "compose UI from divs" practice. After studying this, you'll never reach for a kanban screenshot again.

3. **`scene-05-dashboard-counters/`** — third. Counter animation is the most-requested "show a stat" technique and every agent currently skips it.

The rest are variations on the same principle: build the UI element from HTML primitives, animate it with GSAP, never screenshot the real thing.

---

## QC log

- scene-01: **PASS** — 9 frames show kanban window scaling in → Todo/Done/InProg cards staggered into columns → Live pill pulse → drag card lifts (rotation + shadow ramp) → flies from Todo to In Progress (frame 5 captures mid-flight) → drops with elastic settle → column counts update with chip pulse → window subtle drift through hold. 7 distinct easings. Built entirely from divs.
- scene-02: **PASS** — 8 frames; panel scales in → msg-1 "Heads up @design review" → msg-2 "Skimmed it" → reactions burst with elastic settle → typing indicator with 3 bouncing dots → self message "Perfect — staging's already deploying. ✨" → r2 count updates 3→4 → continuous breathing. 6 distinct events tied to narration anchor timestamps. Composed entirely from divs. THE narration-sync gold standard.
- scene-03: **PASS** — 7 frames; terminal window with traffic lights → `$ npm run build` types in (steps(1)) → output lines print one by one in green monospace → "✓ Build complete · artifacts in dist/" → green exit badge "Built in 2.4s · exit 0" with elastic settle and floor glow. 7 distinct easings.
- scene-04: **PASS** — 7 frames; app dashboard backdrop visible → palette overlays with blurred backdrop → "deploy" types in → non-matching commands dim out → top "Deploy to staging" highlighted with focus ring → palette dismisses → "Deploying to staging" toast slides in → progress bar fills + new activity row appears. 7 distinct easings, full Cmd+K flow demonstrated.
- scene-05: **PASS** — 10 frames; 4-card KPI dashboard. Counters tick 0→128K, sparkline draws on, donut fills 0→87%, multi-stat 0,0,0 → 24,312,1.2k. After landing: live ticks (128K → 128.5K → 128.7K), status dot pulses, +12.4% growth pill. All counters use deterministic `tl.set()` pattern. 8 distinct easings.
- scene-06: **PASS** — 8 frames; VS Code-style file tree slides in from left → root/src expand → src children (components/, utils/, index.ts) cascade in → utils/ expands → parse.ts gets selection bar → editor pane opens with syntax-colored parse.ts code → tests/ folder expands → final hold with cursor blink + git modified badges. 6 distinct easings.
- scene-07: **PASS** — 8 frames; code editor with traffic lights and tab bar → comment line types in green → function signature types with syntax colors (blue keywords, yellow names, teal types, orange strings) → typo `usre.` typed → RED squiggle + error tooltip "Cannot find name 'usre'" + status bar flips red → fix typed via tl.set(textContent) → squiggle clears + status back to blue + green highlight pulse on fixed line. 5 distinct easings.
- scene-08: **PASS** — 8 frames; weekly calendar grid (7 cols × 9 hour rows) fades in → today's column (Wed 20) highlighted with blue → 6 events slide in staggered (Stand-up, 1:1, Coffee, Design review, Sprint planning, Demo prep) → Design review pulses with violet glow (happening now) → popover slides up from event with attendees + Join button → red "now" time-indicator line drifts down. 5 distinct easings.
