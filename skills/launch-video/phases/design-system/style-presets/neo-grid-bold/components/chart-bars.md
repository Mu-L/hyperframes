```html
<!-- Two-series bar-chart panel. Series A is solid ink fill; series B is
     signal-fill with a 1.5px ink hairline border (prevents the bright yellow
     vibrating against paper). Axes are 2px solid ink wireframe at left and
     bottom. X-axis labels in mono uppercase. The bars themselves are pure
     rectangles; heights set via inline style="height: NN%". -->
<div class="ng-chart-bars">
  <div class="ng-chart-legend">
    <div class="ng-chart-legend-item"><i></i> {LEFT}</div>
    <div class="ng-chart-legend-item ng-chart-legend-b"><i></i> {RIGHT}</div>
  </div>
  <div class="ng-chart-bars-plot">
    <div class="ng-chart-bar">
      <div class="ng-chart-bar-a" style="height:42%"></div>
      <div class="ng-chart-bar-b" style="height:78%"></div>
    </div>
    <div class="ng-chart-bar">
      <div class="ng-chart-bar-a" style="height:55%"></div>
      <div class="ng-chart-bar-b" style="height:88%"></div>
    </div>
    <div class="ng-chart-bar">
      <div class="ng-chart-bar-a" style="height:36%"></div>
      <div class="ng-chart-bar-b" style="height:62%"></div>
    </div>
    <div class="ng-chart-bar">
      <div class="ng-chart-bar-a" style="height:64%"></div>
      <div class="ng-chart-bar-b" style="height:94%"></div>
    </div>
    <div class="ng-chart-bar">
      <div class="ng-chart-bar-a" style="height:48%"></div>
      <div class="ng-chart-bar-b" style="height:72%"></div>
    </div>
    <div class="ng-chart-bar">
      <div class="ng-chart-bar-a" style="height:30%"></div>
      <div class="ng-chart-bar-b" style="height:54%"></div>
    </div>
  </div>
  <div class="ng-chart-xaxis">
    <span>NA</span><span>EU</span><span>LATAM</span><span>APAC</span><span>MENA</span
    ><span>SSA</span>
  </div>
</div>

<style>
  .ng-chart-bars {
    background: var(--canvas);
    color: var(--ink);
    padding: var(--pad-large);
    display: flex;
    flex-direction: column;
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
    min-height: 420px;
  }
  .ng-chart-legend {
    display: flex;
    gap: 28px;
    margin-bottom: 18px;
  }
  .ng-chart-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
  }
  .ng-chart-legend-item i {
    width: 18px;
    height: 12px;
    background: var(--ink);
    display: inline-block;
  }
  .ng-chart-legend-b i {
    background: var(--signal-fill, var(--brand-primary));
    border: var(--border-hairline);
  }
  .ng-chart-bars-plot {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 18px;
    align-items: end;
    padding: 16px 0 28px 0;
    border-bottom: var(--border-axis);
    min-height: 240px;
  }
  .ng-chart-bar {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
    height: 100%;
    justify-content: flex-end;
  }
  .ng-chart-bar-a {
    background: var(--ink);
  }
  .ng-chart-bar-b {
    background: var(--signal-fill, var(--brand-primary));
    border: var(--border-hairline);
  }
  .ng-chart-xaxis {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 18px;
    padding-top: 8px;
  }
  .ng-chart-xaxis span {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 14px;
    text-align: center;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
  }
</style>
```
