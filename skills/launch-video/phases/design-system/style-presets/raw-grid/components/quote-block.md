```html
<div class="rg-quote-block">
  <div class="rg-quote-block-mark">&ldquo;</div>
  <div class="rg-quote-block-body">
    <p class="rg-quote-block-text">{QUOTE}</p>
    <div class="rg-quote-block-rule"></div>
    <p class="rg-quote-block-author">{AUTHOR}</p>
  </div>
</div>

<style>
  /*
    Pull-quote block. Oversized opening curly-quote at 0.15 opacity sits
    absolutely in the top-left as decorative wallpaper; the quote body
    sits in front at full opacity. A 60px × 4px ink rule-stub separates
    the quote from the attribution. Background variants flip the block
    fill to a pastel accent surface (sage or pink) — the wallpaper mark
    stays ink-colored at low opacity in both modes.
  */
  .rg-quote-block {
    position: relative;
    background: var(--brand-secondary);
    padding: var(--rg-pad-lg);
    color: var(--ink);
    overflow: hidden;
  }
  .rg-quote-block-mark {
    position: absolute;
    top: clamp(20px, 3vw, 40px);
    left: clamp(32px, 4vw, 64px);
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(80px, 12vw, 160px);
    font-weight: 900;
    line-height: 1;
    color: var(--ink);
    opacity: var(--rg-quote-opacity);
    pointer-events: none;
  }
  .rg-quote-block-body {
    position: relative;
    z-index: 2;
    max-width: 900px;
  }
  .rg-quote-block-text {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(32px, 4.5vw, 64px);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    color: var(--ink);
    margin: 0 0 var(--rg-gap-md);
  }
  .rg-quote-block-rule {
    width: var(--rg-rule-len);
    height: var(--rg-rule-thick);
    background: var(--ink);
    margin-bottom: var(--rg-gap-md);
  }
  .rg-quote-block-author {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(11px, 1vw, 13px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
    margin: 0;
  }
  .rg-quote-block.primary {
    background: var(--brand-primary);
  }
  .rg-quote-block.white {
    background: var(--canvas);
  }
</style>
```
