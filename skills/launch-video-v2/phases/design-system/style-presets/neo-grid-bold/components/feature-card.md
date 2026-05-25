```html
<!-- Feature panel: paper fill, mono-numbered tag at top, uppercase card-h3
     headline, mixed-case body. Use 3 instances in a row to occupy
     grid-row span 6. The .ng-feature-tag in the corner uses signal-fill on a
     dark image placeholder, or ink on paper. -->
<div class="ng-feature-card">
  <div class="ng-feature-tag">{KICKER}</div>
  <h3 class="ng-feature-title">{HEADLINE}</h3>
  <p class="ng-feature-body">{SUBHEAD}</p>
</div>

<style>
  .ng-feature-card {
    background: var(--canvas);
    color: var(--ink);
    padding: var(--pad-standard);
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
    min-height: 360px;
  }
  .ng-feature-tag {
    display: inline-block;
    align-self: flex-start;
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 18px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: var(--radius, 0);
  }
  .ng-feature-title {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 30px;
    line-height: 1.05;
    letter-spacing: var(--track-display-tight);
    text-transform: uppercase;
    margin: 0;
  }
  .ng-feature-body {
    font-family: var(--font-body), "Space Grotesk", sans-serif;
    font-size: 22px;
    line-height: 1.4;
    margin: 0;
  }
</style>
```
