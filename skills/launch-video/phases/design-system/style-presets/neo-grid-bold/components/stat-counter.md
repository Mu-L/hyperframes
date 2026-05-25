```html
<!-- Numeral-first stat block. Big Space-Grotesk weight-700 stat in negative
     letter-spacing, mono uppercase caption below. Three sizes: .sm (96px),
     default (156px), .lg (240px). Default is paper fill, .signal swaps to
     brand-primary, .ink inverts. Counts via a number tween, not a text swap. -->
<div class="ng-stat-counter">
  <div class="ng-stat-num">{NUM}</div>
  <div class="ng-stat-label">{LABEL}</div>
</div>

<style>
  .ng-stat-counter {
    background: var(--canvas);
    color: var(--ink);
    padding: var(--pad-compact);
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: flex-end;
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
    min-height: 220px;
  }
  .ng-stat-counter.ng-stat-signal {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
  }
  .ng-stat-counter.ng-stat-ink {
    background: var(--ink);
    color: var(--canvas);
  }
  .ng-stat-num {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 156px;
    line-height: 0.9;
    letter-spacing: var(--track-display-loose);
  }
  .ng-stat-counter.ng-stat-sm .ng-stat-num {
    font-size: 96px;
  }
  .ng-stat-counter.ng-stat-lg .ng-stat-num {
    font-size: 240px;
    letter-spacing: -0.04em;
  }
  .ng-stat-label {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 18px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
    margin-top: 8px;
    opacity: 0.85;
  }
  .ng-stat-counter.ng-stat-ink .ng-stat-label {
    opacity: 0.85;
  }
</style>
```
