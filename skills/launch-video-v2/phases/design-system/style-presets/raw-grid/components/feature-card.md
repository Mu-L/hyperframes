```html
<div class="rg-feature-card">
  <div class="rg-feature-card-top">
    <!-- TODO: replace literal ordinal with the card index when generating
         a series (01 / 02 / 03 / 04). The numeral sits at 0.35 opacity as
         decorative wallpaper behind the title — DO NOT pull from a brand
         placeholder; it's structural, not copy. -->
    <span class="rg-feature-card-num">01</span>
    <div class="rg-feature-card-icon">{LABEL}</div>
  </div>
  <div class="rg-feature-card-body">
    <h3 class="rg-feature-card-title">{HEADLINE}</h3>
    <p class="rg-feature-card-text">{SUBHEAD}</p>
  </div>
</div>

<style>
  /*
    Bordered content card with an oversized weight-900 ordinal at 0.35
    opacity as decorative wallpaper in the top-left corner and a small
    48px ink-bordered icon-box in the top-right. Title + body text sit
    in front of the numeral wallpaper at full opacity. Background variants
    (.primary / .secondary / .gray) flip the card fill to an accent surface.
  */
  .rg-feature-card {
    position: relative;
    background: var(--canvas);
    border: var(--rg-border);
    padding: var(--rg-pad-md);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--rg-gap-md);
  }
  .rg-feature-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .rg-feature-card-num {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(40px, 5vw, 72px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ink);
    opacity: var(--rg-ordinal-opacity);
  }
  .rg-feature-card-icon {
    width: 48px;
    height: 48px;
    border: var(--rg-border);
    background: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: var(--ink);
  }
  .rg-feature-card-title {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(16px, 1.4vw, 22px);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
    margin: 0 0 10px;
  }
  .rg-feature-card-text {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(16px, 1.3vw, 20px);
    font-weight: 500;
    line-height: 1.6;
    color: var(--ink);
    margin: 0;
  }
  .rg-feature-card.primary {
    background: var(--brand-primary);
  }
  .rg-feature-card.secondary {
    background: var(--brand-secondary);
  }
  .rg-feature-card.gray {
    background: var(--rg-gray);
  }
</style>
```
