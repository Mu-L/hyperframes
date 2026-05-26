```html
<div class="rg-stat-counter">
  <div class="rg-stat-counter-num">{NUM}</div>
  <div class="rg-stat-counter-label">{LABEL}</div>
</div>

<style>
  /*
    Bordered stat tile — large weight-900 numeral over a small uppercase
    caption. The 3px ink border IS the elevation; no shadow by default
    (add `.elevated` for the 6px hard-offset shadow on featured stats).
    Background is white by default; `.primary` / `.secondary` flip to a
    pastel accent surface (text stays ink).
  */
  .rg-stat-counter {
    background: var(--canvas);
    border: var(--rg-border);
    padding: var(--rg-pad-sm);
    color: var(--ink);
  }
  .rg-stat-counter-num {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(36px, 4vw, 56px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 8px;
  }
  .rg-stat-counter-label {
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
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .rg-stat-counter.primary {
    background: var(--brand-primary);
  }
  .rg-stat-counter.secondary {
    background: var(--brand-secondary);
  }
  .rg-stat-counter.gray {
    background: var(--rg-gray);
  }
  .rg-stat-counter.inverted {
    background: var(--ink);
    color: var(--canvas);
  }
  .rg-stat-counter.inverted .rg-stat-counter-num,
  .rg-stat-counter.inverted .rg-stat-counter-label {
    color: var(--canvas);
  }
  .rg-stat-counter.elevated {
    box-shadow: var(--rg-shadow);
  }
</style>
```
