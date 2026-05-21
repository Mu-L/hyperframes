---
id: messaging-multi-phrase
role: messaging
duration_seconds: [7, 8]
phases: 3
visual_arc: phrase-type → phrase-type → phrase-type (hard-cut between)
uses_rules: [dynamic-content-sequencing, context-sensitive-cursor]
element_roles:
  main_text: Contextual lead-in portion of each phrase, typed in primary color
  accent_text: Emphatic / highlighted portion, typed in accent color immediately after main
  cursor: Blinking cursor whose color reflects the active text segment
when_to_use:
  - Multiple text phrases displayed sequentially with typing rhythm
  - Each phrase has a dual-tone structure (neutral lead-in + colored emphasis)
  - Scene is purely text-driven, no visual hero
  - Phrase content varies in length, needs proportional screen time
  - "Statement after statement" cadence for layered messaging
when_not_to_use:
  - Text coexists with a visual hero — see brand-reveal-assemble-zoom or takeover-ticker-displace
  - Phrases should cross-dissolve, not hard-cut
  - Single phrase only — use [context-sensitive-cursor](../rules/context-sensitive-cursor.md) alone
  - Need camera movement / zoom between phrases — see concept-demo-decode-pan
triggers: [multiple phrases typing, sequential statements, typing with highlight, text carousel, dual-color text, rhythmic messaging]
---

# Messaging · Multi-Phrase (HyperFrames)

Multiple phrases type sequentially. Each phrase has a main + accent segment. The cursor color tracks the active segment. The timeline is computed from content length — no hardcoded phase windows.

Same hard-cut multi-phrase arc, restructured around one paused GSAP timeline and a single `onUpdate` that reads `tl.time()` and writes both text and cursor state. Constituent patterns map to [dynamic-content-sequencing](../rules/dynamic-content-sequencing.md) (for the timeline pre-calculation) and [context-sensitive-cursor](../rules/context-sensitive-cursor.md) (for the cursor color + blink).

> Per-frame-component variants of this scene re-run every component every frame and look up `currentPhrase` per render. HyperFrames runs a _single_ paused timeline; the same `currentPhrase = TIMELINE.find(...)` lookup moves inside one `onUpdate` callback that fires whenever GSAP advances the timeline. No conditional DOM — the phrase container exists from t=0 with empty text, and the `onUpdate` overwrites `textContent` in-place.

## When to Use

- Scene delivers multiple messaging beats through text alone
- Each beat has a neutral lead-in followed by an emphasized keyword/phrase
- Content length varies and timing should adapt automatically
- Consistent typing rhythm across all phrases is desired

## Phase Pipeline

Phases are _content-driven_ — derived from script length, not pre-baked into the timeline. The pipeline shape is:

| Phase | Time window                 | What Happens                                                                       | Skill Reference                                                      |
| ----- | --------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1     | `0 – phrase1End`            | Phrase 1: main text types char-by-char → accent text types                         | [context-sensitive-cursor](../rules/context-sensitive-cursor.md)     |
| 2     | `phrase1End – phrase2End`   | Phrase 2: same typing pattern, hard-cut entry                                      | [dynamic-content-sequencing](../rules/dynamic-content-sequencing.md) |
| N     | `phraseN-1End – phraseNEnd` | Phrase N: same pattern repeats; last phrase has a longer `hold` for closing weight | (same skills compose)                                                |

Each phase internally follows the same structure: main characters type at `charSpeed` seconds-per-char, then accent characters continue, then hold for `holdDuration` seconds, then hard-cut to next phrase.

## Data Architecture

Script is a flat array of N entries. Each entry defines its own text and timing parameters. No hardcoded offsets — every phase boundary is computed from the entry above it.

```js
const SCRIPT = [
  {
    textMain: "{phrase1Main}",
    textAccent: "{phrase1Accent}",
    charSpeed: CHAR_SPEED,
    hold: HOLD_MID,
  },
  {
    textMain: "{phrase2Main}",
    textAccent: "{phrase2Accent}",
    charSpeed: CHAR_SPEED,
    hold: HOLD_MID,
  },
  // …
  {
    textMain: "{phraseNMain}",
    textAccent: "{phraseNAccent}",
    charSpeed: CHAR_SPEED,
    hold: HOLD_FINAL,
  },
];
```

Shape rules for the array:

- 2-5 entries; more and the scene drags
- Every entry has a `textMain` (neutral lead-in) and `textAccent` (emphasis); either may be empty if the phrase is single-tone
- `charSpeed` is **seconds per character** (frames / fps). Consistent across entries so typing rhythm reads as one engine
- `hold` is the dwell after the last char is typed. The final entry uses a longer `HOLD_FINAL` to land the closing beat

## Dynamic Timeline Calculation (Setup, Not a Tween)

Compute the timeline once at composition setup — plain reduce, no `useMemo` needed because there's no React lifecycle:

```js
let acc = 0;
const TIMELINE = SCRIPT.map((item) => {
  const totalChars = item.textMain.length + item.textAccent.length;
  const typingDuration = totalChars * item.charSpeed;
  const totalDuration = typingDuration + item.hold;
  const start = acc;
  const end = start + totalDuration;
  acc = end;
  return { ...item, startTime: start, endTime: end, typingDuration };
});
const TOTAL = TIMELINE[TIMELINE.length - 1].endTime;
```

The final `TOTAL` value is the natural full-script length. The composition's `data-duration` is typically set close to `TOTAL` — see the How to Choose Values entry for when to deliberately undercut `TOTAL` to trim a long final hold.

## Master Engine: One onUpdate Drives Everything

Single GSAP "clock" tween spans the whole composition. Its `onUpdate` finds the current phrase, computes the visible main / accent text, and writes the cursor color + blink opacity. _Everything_ per-frame happens here.

```js
const MAIN_COLOR = "{mainColor}";
const ACCENT_COLOR = "{accentColor}";
const BLINK_CYCLE; // seconds, full on-off period (cursor opacity = 1 for first half)

const mainEl = document.querySelector(".phrase-main");
const accentEl = document.querySelector(".phrase-accent");
const cursorEl = document.querySelector(".phrase-cursor");

tl.to(
  { tick: 0 },
  {
    tick: 1,
    duration: TOTAL,
    ease: "none",
    onUpdate: () => {
      const t = tl.time();

      // ----- Cursor blink: square wave via modulo -----
      // (Runs continuously, including in the "no phrase" fallback window.)
      cursorEl.style.opacity = t % BLINK_CYCLE < BLINK_CYCLE / 2 ? "1" : "0";

      // ----- Find current phrase -----
      let phrase = null;
      for (let i = 0; i < TIMELINE.length; i++) {
        if (t >= TIMELINE[i].startTime && t < TIMELINE[i].endTime) {
          phrase = TIMELINE[i];
          break;
        }
      }

      if (!phrase) {
        // Cursor-only fallback (before first phrase or after last)
        if (mainEl.textContent !== "") mainEl.textContent = "";
        if (accentEl.textContent !== "") accentEl.textContent = "";
        cursorEl.style.background = MAIN_COLOR;
        return;
      }

      // ----- Compute visible characters for this phrase -----
      const activeT = t - phrase.startTime;
      const charIdx = Math.floor(activeT / phrase.charSpeed);
      const mainLen = phrase.textMain.length;

      const visMain = phrase.textMain.slice(0, Math.min(charIdx, mainLen));
      const accentLen = Math.max(0, charIdx - mainLen);
      const visAccent = phrase.textAccent.slice(0, accentLen);

      // ----- Write to DOM (only on change to minimize layout work) -----
      if (mainEl.textContent !== visMain) mainEl.textContent = visMain;
      if (accentEl.textContent !== visAccent) accentEl.textContent = visAccent;

      // ----- Cursor color follows the active segment -----
      const inAccent = visMain.length === mainLen && visAccent.length > 0;
      cursorEl.style.background = inAccent ? ACCENT_COLOR : MAIN_COLOR;
    },
  },
  0,
);
```

### Why one `onUpdate` and not three

The text content, cursor color and cursor blink are _all_ pure functions of `tl.time()` and the script. Splitting them across three onUpdates triples the per-frame dispatch cost without buying any clarity — the math interleaves naturally. The `textContent !== visMain` guard prevents redundant DOM writes when the character count hasn't advanced this frame.

### Why a linear scan instead of GSAP labels / per-phrase tweens

Per-phrase tweens would each schedule their own `onUpdate` reading `tl.time()`. With N phrases that's N parallel scans. The single master scan above is O(N) but runs once per frame, so the total cost is the same — and the cursor-blink + fallback logic stays unified.

## Layout

Centered flex row. `white-space: pre` preserves intentional trailing spaces in `textMain` (e.g. `"Build video with "` — note the trailing space before the accent).

```html
<div class="phrase-stage">
  <span class="phrase-main"></span><span class="phrase-accent"></span
  ><span class="phrase-cursor"></span>
</div>
```

```css
.phrase-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: pre;
  font-family: {font};
  font-weight: {fontWeight};
  font-size: {fontSize}px;
  line-height: 1;
}
.phrase-main {
  color: {mainColor};
}
.phrase-accent {
  color: {accentColor};
}
.phrase-cursor {
  display: inline-block;
  width: {cursorWidth}px;
  height: {cursorHeight}px;
  background: {mainColor}; /* overridden by onUpdate per segment */
  margin-left: {cursorGap}px;
  vertical-align: middle;
  transform: translateY({cursorBaselineFix}px); /* fine-tune to align with text baseline */
  will-change: opacity, background-color;
}
```

No fixed-width container — each phrase replaces the previous entirely, so the centered flex re-layouts cleanly at every cut.

## Font Sizing

Pick the largest `fontSize` such that the _longest_ phrase fits within the canvas with comfortable margins. Run once at setup:

```js
const longestChars = Math.max(...SCRIPT.map((p) => p.textMain.length + p.textAccent.length));
// Sans-serif average character advance ≈ CHAR_ADVANCE_RATIO × fontSize.
// Safe upper bound: SAFE_WIDTH_RATIO × canvasWidth fits the longest phrase.
const safeFontSize = Math.floor(
  (canvasWidth * SAFE_WIDTH_RATIO) / (longestChars * CHAR_ADVANCE_RATIO),
);
```

For more accuracy, measure with a hidden canvas after `document.fonts.ready` (see [camera-cursor-tracking](../rules/camera-cursor-tracking.md) for the `ctx.measureText` pattern). For most decks a hand-tuned constant works fine — this is a statement scene, not body copy.

## Inter-Phase State Handoff

```
Phrase N → Phrase N+1:
  Hard cut. No cross-dissolve, no animation.
  The next onUpdate frame's TIMELINE.find returns Phrase N+1, the previous
  phrase's textContent is overwritten to the new phrase's first character.
  activeT resets to ~0 (specifically t - phrase.startTime, which is small).

Before first phrase (t < TIMELINE[0].startTime):
  TIMELINE.find returns undefined → fallback branch fires → text empties,
  cursor blinks at MAIN_COLOR. (In the standard scene TIMELINE[0].startTime
  is exactly 0, so this branch only matters if you offset the script start.)

After last phrase (t ≥ TIMELINE[last].endTime):
  Same fallback branch. data-duration should be ≤ TOTAL so the composition
  ends right at the last phrase's hold completion — no trailing blank state.

Cursor blink:
  Continues through fallback windows. The blink is uncorrelated with phrase
  state — it's a pure function of (t % BLINK_CYCLE).
```

## How to Choose Values

Every magic number lives in one of two places: a `SCRIPT` entry (per-phrase tuning) or a top-level constant (whole-scene tuning).

- **CHAR_SPEED** — seconds per character of typing
  - Range: 0.04-0.12 s/char (≈ 25-8 chars/sec)
  - Effects: low end reads as urgent / mechanical typing; high end reads as deliberate / unhurried
  - Constraints: should be consistent across all SCRIPT entries so the typing rhythm reads as one engine; convert from frames as `frames / fps`
  - Reference: see `examples/messaging-multi-phrase.html`

- **HOLD_MID** — dwell after a non-final phrase finishes typing, before hard-cut to next
  - Range: 0.6-1.5 s
  - Effects: low end feels rushed and the eye can't park on the accent; high end stalls momentum
  - Constraints: `HOLD_MID < HOLD_FINAL` so the closing beat lands distinctly
  - Reference: see `examples/messaging-multi-phrase.html`

- **HOLD_FINAL** — dwell on the last phrase before the composition ends
  - Range: 1.5-3.0 s
  - Effects: low end feels truncated; high end overstays
  - Constraints: only one phrase (the last) gets HOLD_FINAL; all others use HOLD_MID
  - Reference: see `examples/messaging-multi-phrase.html`

- **BLINK_CYCLE** — full on-off period of the cursor blink
  - Range: 0.6-1.2 s (cursor is opaque for `BLINK_CYCLE / 2`)
  - Effects: low end reads as glitchy / agitated; high end reads as terminal-idle
  - Constraints: must be a pure function of `t % BLINK_CYCLE` — no separate animation. Independent of phrase boundaries by design
  - Reference: see `examples/messaging-multi-phrase.html`

- **MAIN_COLOR / ACCENT_COLOR** — text + cursor palette for the two segments
  - Range: discrete choice; ACCENT_COLOR must have visibly higher chroma than MAIN_COLOR so the cursor color swap is legible
  - Effects: equal-luminance pairs (e.g. two pastels) wash out the swap; high-contrast pairs (white ↔ saturated accent) read instantly
  - Constraints: ACCENT_COLOR doubles as the `.phrase-accent` color and the active-segment cursor fill — must match
  - Reference: see `examples/messaging-multi-phrase.html`

- **fontSize / fontWeight / font** — typography of the phrase line
  - Range: at 1920×1080 a fontSize of 100-180 px reads as statement copy; weight 600-900 for emphasis
  - Effects: smaller looks like body copy; thinner reads as quote, not statement
  - Constraints: must satisfy the longest-phrase-fits-on-one-line constraint below; pick via the Font Sizing formula
  - Reference: see `examples/messaging-multi-phrase.html`

- **SAFE_WIDTH_RATIO / CHAR_ADVANCE_RATIO** — font-sizing safety factors
  - Range: SAFE_WIDTH_RATIO 0.80-0.90 (margin around the longest phrase); CHAR_ADVANCE_RATIO 0.45-0.6 for typical sans-serif at heavy weight
  - Effects: SAFE_WIDTH_RATIO too high → phrase touches edges; CHAR_ADVANCE_RATIO too low → underestimates width and the phrase overflows
  - Constraints: if the chosen font is monospace or condensed, re-measure with canvas `measureText`
  - Reference: see `examples/messaging-multi-phrase.html`

- **cursorWidth / cursorHeight / cursorGap / cursorBaselineFix** — cursor block geometry
  - Range: cursorWidth 4-10 px; cursorHeight ≈ 1.0-1.1 × fontSize; cursorGap 4-16 px; cursorBaselineFix small positive integer
  - Effects: thin cursor reads as terminal; thick reads as marker. Height shorter than the cap-height makes the cursor look detached
  - Constraints: must use `display: inline-block` (a `width` set on `display: inline` is ignored)
  - Reference: see `examples/messaging-multi-phrase.html`

- **TOTAL vs `data-duration`** — content-driven duration vs render window
  - Range: `data-duration` may be `≤ TOTAL` to deliberately trim a long final hold, or `≈ TOTAL` to play the whole script
  - Effects: `data-duration` > TOTAL leaves an empty fallback tail; `data-duration` < TOTAL truncates the closing hold (acceptable if the accent word has been on-screen for ≥ HOLD_MID)
  - Constraints: never set `data-duration` so low that the last phrase's typing is cut mid-character — the cap should fall inside the hold window
  - Reference: see `examples/messaging-multi-phrase.html`

- **SCRIPT length (N)** — number of phrases
  - Range: 2-5 entries
  - Effects: 1 entry is not a sequence (use the cursor rule alone); >5 drags and the viewer disengages
  - Constraints: each entry's combined `textMain + textAccent` must fit one line at the chosen fontSize (the Font Sizing formula assumes this)
  - Reference: see `examples/messaging-multi-phrase.html`

## Critical Constraints

- **Single paused timeline** — all per-frame state derives from `tl.time()` in one `onUpdate`. No per-phrase GSAP tweens.
- **`Math.floor` on charIndex** — `slice` with float indices produces fractional-character output (no error, but visibly wrong).
- **`white-space: pre`** — required when `textMain` ends with a space. Without it the trailing space collapses and the accent joins the lead-in without a gap.
- **`charSpeed` in seconds, not frames** — convert via `frames / fps`. Authoring in frames and dividing once at the boundary keeps math legible without mixing units in the timeline.
- **DOM-write guard** — `if (mainEl.textContent !== visMain) ...` — even though `textContent` is cheap, skipping no-op writes prevents needless layout invalidations on phrases where char count is steady (e.g. during `hold`).
- **`data-duration` must cover at least up to the last phrase's accent fully typed + a readable beat** — setting `data-duration < TOTAL` is allowed and is how you trim an over-long closing hold; setting it so low the final accent is cut mid-character is the failure mode. Setting `data-duration > TOTAL` leaves the fallback branch firing at the tail.
- **Longest phrase fits without wrap** — measure or hand-tune `fontSize` so `textMain + textAccent` of the longest entry stays on one line at the chosen canvas width.
- **No infinite repeats** — the master tween has `duration: TOTAL`; the blink is computed via modulo inside the onUpdate (no `repeat: -1` anywhere).
- **No `Math.random` / `Date.now`** — all state is a pure function of `tl.time()` and the immutable SCRIPT array.
- **GSAP transform aliases on the cursor** — if you tween cursor _position_, use `x`/`y`. The CSS `translateY(8px)` baseline-fix is static; don't tween over it.

## Spring → GSAP Ease Cheatsheet (this blueprint)

This blueprint has **no springs** — typing is linear (`ease: "none"`), the blink is a step function via modulo, and the cuts between phrases are instant. The only "ease" is the clock tween's `ease: "none"`.

If you want a _soft_ fade-in instead of a hard cut between phrases, add a short opacity tween on each phrase boundary:

```js
TIMELINE.forEach((p) => {
  tl.fromTo(
    ".phrase-stage",
    { opacity: 0 },
    { opacity: 1, duration: 0.1, ease: "none" },
    p.startTime,
  );
});
```

But this departs from the source's "hard-cut" semantic — use sparingly.

## Golden Sample

- [messaging-multi-phrase.html](../examples/messaging-multi-phrase.html) — three-phrase statement scene on a dark gradient background. Demonstrates the single-paused-timeline + master `onUpdate` engine, the cursor color swap between main and accent segments, the square-wave blink via modulo, the seek-safe `lastIdx` cache, and a `data-duration` deliberately set under the computed `TOTAL` to trim a long closing hold. Refer to the example for concrete colors, font sizing, copy, and timings.
