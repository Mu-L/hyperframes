```html
<div class="rg-process-step">
  <!-- TODO: replace literal "01" with the step ordinal at build time
       (01 / 02 / 03 / 04 ... ). The numeral sits at 0.20 opacity as
       decorative wallpaper above the step title — DO NOT pull from a
       brand placeholder; it's structural. -->
  <span class="rg-process-step-num">01</span>
  <h3 class="rg-process-step-title">{HEADLINE}</h3>
  <p class="rg-process-step-text">{SUBHEAD}</p>
</div>

<style>
  /*
    Vertically-stacked timeline / process step. Oversized weight-900
    ordinal at 0.20 opacity sits above the title as wallpaper; title is
    a subtitle-tier uppercase weight-700; body is sentence-case weight-500.
    Adjacent steps are separated by a 3px ink border on the left edge
    (the "border-as-layout" pattern at step scope) — the parent grid
    enforces the border; this component just provides the cell content.
    Background variants flip the cell fill to a pastel accent surface.
  */
  .rg-process-step {
    background: var(--canvas);
    padding: var(--rg-pad-md) var(--rg-pad-sm);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .rg-process-step-num {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(48px, 6vw, 80px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ink);
    opacity: var(--rg-numeral-opacity);
  }
  .rg-process-step-title {
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
    margin: 0;
  }
  .rg-process-step-text {
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
  .rg-process-step.primary {
    background: var(--brand-primary);
  }
  .rg-process-step.secondary {
    background: var(--brand-secondary);
  }
</style>
```
