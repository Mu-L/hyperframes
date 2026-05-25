```html
<!-- The 12-column × 8-row CSS grid wrapper that every Neo-Grid Bold scene
     composes inside. Inset 40px from the canvas edge with a putty surround
     showing through the 12px gap between cells. The frame is the system's
     structural identity — every panel above sits inside this grid. -->
<div class="ng-panel-grid">
  <div class="ng-panel-grid-cell ng-panel-grid-cell-a">
    <div class="ng-panel-grid-eyebrow">{KICKER}</div>
    <h2 class="ng-panel-grid-title">{HEADLINE}</h2>
  </div>
  <div class="ng-panel-grid-cell ng-panel-grid-cell-b">
    <div class="ng-panel-grid-num">{NUM}</div>
    <div class="ng-panel-grid-label">{LABEL}</div>
  </div>
  <div class="ng-panel-grid-cell ng-panel-grid-cell-c">
    <p class="ng-panel-grid-body">{SUBHEAD}</p>
  </div>
  <div class="ng-panel-grid-cell ng-panel-grid-cell-d">
    <div class="ng-panel-grid-label">{EYEBROW}</div>
  </div>
</div>

<style>
  .ng-panel-grid {
    position: relative;
    background: var(--canvas);
    display: grid;
    grid-template-columns: var(--grid-cols);
    grid-template-rows: var(--grid-rows);
    gap: var(--grid-gap);
    padding: var(--grid-inset);
    aspect-ratio: 16 / 9;
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
  }
  .ng-panel-grid-cell {
    background: var(--canvas);
    color: var(--ink);
    padding: var(--pad-standard);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    border-radius: var(--radius, 0);
  }
  .ng-panel-grid-cell-a {
    grid-column: 1 / span 7;
    grid-row: 1 / span 5;
    background: var(--ink);
    color: var(--canvas);
  }
  .ng-panel-grid-cell-b {
    grid-column: 8 / span 5;
    grid-row: 1 / span 5;
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
  }
  .ng-panel-grid-cell-c {
    grid-column: 1 / span 7;
    grid-row: 6 / span 3;
  }
  .ng-panel-grid-cell-d {
    grid-column: 8 / span 5;
    grid-row: 6 / span 3;
  }
  .ng-panel-grid-eyebrow {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: var(--track-mono-wide);
    text-transform: uppercase;
    opacity: 0.7;
  }
  .ng-panel-grid-title {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: clamp(48px, 5vw, 88px);
    line-height: 0.95;
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    margin: 0;
  }
  .ng-panel-grid-num {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: clamp(96px, 10vw, 156px);
    line-height: 0.9;
    letter-spacing: var(--track-display-loose);
  }
  .ng-panel-grid-label {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 16px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
  }
  .ng-panel-grid-body {
    font-family: var(--font-body), "Space Grotesk", sans-serif;
    font-size: 22px;
    line-height: 1.45;
    margin: 0;
  }
</style>
```
