```html
<!-- Hero stat: oversized Alfa Slab numeral in orange with jumbo stacked shadow,
     superscript unit in cream, caption + source below. Two-column layout on wide;
     scene worker reflows if needed. -->
<div class="pp-stat-counter">
  <div class="pp-stat-num">{NUM}<sup class="pp-stat-sup">%</sup></div>
  <div class="pp-stat-body">
    <h3 class="pp-stat-headline">{SUBHEAD}</h3>
    <p class="pp-stat-lede">{LEDE}</p>
    <div class="pp-stat-source">— SOURCE · INTERNAL —</div>
  </div>
</div>

<style>
  .pp-stat-counter {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    padding: var(--gap-slide, 90px);
  }
  .pp-stat-num {
    font-family: "Alfa Slab One", serif;
    font-size: clamp(220px, 28vw, 540px);
    line-height: 0.82;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--brand-accent);
    text-shadow: var(--shadow-stamp-jumbo);
  }
  .pp-stat-sup {
    font-size: 0.24em;
    vertical-align: top;
    line-height: 1;
    color: var(--canvas);
    text-shadow: var(--shadow-stamp-md);
  }
  .pp-stat-body {
    color: var(--canvas);
  }
  .pp-stat-headline {
    margin: 0 0 24px;
    font-family: "Alfa Slab One", serif;
    font-size: 64px;
    line-height: 1;
    letter-spacing: 0.005em;
    text-transform: uppercase;
    color: var(--canvas);
  }
  .pp-stat-lede {
    margin: 0;
    font-family: "Archivo Narrow", sans-serif;
    font-weight: 500;
    font-size: 30px;
    line-height: 1.4;
    color: var(--canvas);
    max-width: 640px;
  }
  .pp-stat-source {
    margin-top: 36px;
    font-family: "DM Mono", monospace;
    font-size: 24px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--brand-accent);
    border-top: var(--border-hairline);
    border-top-color: var(--canvas);
    padding-top: 18px;
    display: inline-block;
  }
  /* On a paper scene, invert: ink text instead of cream. */
  .pp-stat-counter.is-on-paper .pp-stat-body,
  .pp-stat-counter.is-on-paper .pp-stat-headline,
  .pp-stat-counter.is-on-paper .pp-stat-lede {
    color: var(--ink);
  }
  .pp-stat-counter.is-on-paper .pp-stat-source {
    color: var(--brand-primary);
    border-top-color: var(--ink);
  }
</style>
```
