```html
<!--
  Bar chart — flat vertical rectangles with one accent bar (the "hi" variant)
  carrying the surface accent. Default bars are tier-3 muted on the surface.
  2px solid baseline (the anchor weight) below the bars; bar-track left rule
  also 2px. No rounded ends, no gradient — strict rectangles.
  Heights are inline because each bar's height is data-driven; the worker
  will set `style="height:...vh"` per column.
-->
<div class="sd-chart-bars">
  <div class="sd-chart-bars-header">
    <h2 class="sd-chart-bars-title">{HEADLINE}</h2>
    <span class="sd-chart-bars-source">{LABEL}</span>
  </div>
  <div class="sd-chart-bars-track">
    <div class="sd-chart-bars-col">
      <span class="sd-chart-bars-val">14</span>
      <div class="sd-chart-bars-fill" style="height: 22%"></div>
      <span class="sd-chart-bars-x">Y-4</span>
    </div>
    <div class="sd-chart-bars-col">
      <span class="sd-chart-bars-val">21</span>
      <div class="sd-chart-bars-fill" style="height: 36%"></div>
      <span class="sd-chart-bars-x">Y-3</span>
    </div>
    <div class="sd-chart-bars-col">
      <span class="sd-chart-bars-val">28</span>
      <div class="sd-chart-bars-fill" style="height: 52%"></div>
      <span class="sd-chart-bars-x">Y-2</span>
    </div>
    <div class="sd-chart-bars-col">
      <span class="sd-chart-bars-val">35</span>
      <div class="sd-chart-bars-fill" style="height: 70%"></div>
      <span class="sd-chart-bars-x">Y-1</span>
    </div>
    <div class="sd-chart-bars-col">
      <span class="sd-chart-bars-val sd-chart-bars-val--hi">{NUM}</span>
      <div class="sd-chart-bars-fill sd-chart-bars-fill--hi" style="height: 95%"></div>
      <span class="sd-chart-bars-x">NOW</span>
    </div>
  </div>
  <div class="sd-chart-bars-baseline"></div>
</div>

<style>
  .sd-chart-bars {
    display: flex;
    flex-direction: column;
    gap: var(--gap-md);
    color: var(--brand-primary);
    width: 100%;
  }
  .sd-chart-bars--light {
    color: var(--canvas);
  }
  .sd-chart-bars-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .sd-chart-bars-title {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-h2);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: var(--track-h2);
    text-transform: uppercase;
    color: inherit;
    margin: 0;
  }
  .sd-chart-bars-source {
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-caption);
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, currentColor 32%, transparent);
  }
  .sd-chart-bars-track {
    display: flex;
    align-items: flex-end;
    gap: 4vw;
    height: 30vh;
    border-left: var(--rule-heavy) solid color-mix(in srgb, currentColor 32%, transparent);
    padding-left: 0.5vw;
  }
  .sd-chart-bars-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 1vh;
    height: 100%;
  }
  .sd-chart-bars-fill {
    width: 100%;
    /* Default bars: tier-3 muted on the surface. */
    background: color-mix(in srgb, currentColor 32%, transparent);
  }
  /* Single accent bar — full surface accent, no gradient. */
  .sd-chart-bars-fill--hi {
    background: currentColor;
  }
  .sd-chart-bars-val {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-body);
    font-weight: 700;
    color: color-mix(in srgb, currentColor 58%, transparent);
  }
  .sd-chart-bars-val--hi {
    color: inherit;
    font-weight: 900;
  }
  .sd-chart-bars-x {
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-caption);
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: color-mix(in srgb, currentColor 32%, transparent);
    white-space: nowrap;
  }
  .sd-chart-bars-baseline {
    height: var(--rule-heavy);
    background: color-mix(in srgb, currentColor 32%, transparent);
    margin-top: 1px;
  }
</style>
```
