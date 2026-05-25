```html
<!-- Single column / pillar card. Pairs a column-ordinal (orange numeral + mono tag) with
     an Alfa Slab title and Archivo Narrow body. The signature three-column scene unit.
     Use is-alt for the highlighted (blue-fill) middle column. -->
<div class="pp-pillar-card">
  <div class="pp-pillar-num">{KICKER}</div>
  <div class="pp-pillar-tag">— {LABEL} —</div>
  <h3 class="pp-pillar-title">{HEADLINE}</h3>
  <p class="pp-pillar-body">{LEDE}</p>
</div>

<style>
  .pp-pillar-card {
    padding: 60px 50px;
    border-right: var(--border-structural);
    background: var(--canvas);
    color: var(--ink);
    display: flex;
    flex-direction: column;
  }
  .pp-pillar-card:last-child {
    border-right: none;
  }
  .pp-pillar-num {
    font-family: "Alfa Slab One", serif;
    font-size: 180px;
    line-height: 0.88;
    color: var(--brand-accent);
    text-shadow: var(--shadow-stamp-md);
  }
  .pp-pillar-tag {
    font-family: "DM Mono", monospace;
    font-size: 24px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink);
    margin-top: 14px;
    padding-top: 18px;
    border-top: var(--border-hairline);
    align-self: flex-start;
  }
  .pp-pillar-title {
    margin: 30px 0 20px;
    font-family: "Alfa Slab One", serif;
    font-size: 54px;
    line-height: 1;
    letter-spacing: 0.005em;
    text-transform: uppercase;
    color: var(--brand-primary);
  }
  .pp-pillar-body {
    margin: 0;
    font-family: "Archivo Narrow", sans-serif;
    font-weight: 500;
    font-size: 26px;
    line-height: 1.4;
    color: var(--ink);
    max-width: 430px;
  }

  /* Alt variant — highlighted middle column on blue fill. */
  .pp-pillar-card.is-alt {
    background: var(--brand-primary);
    color: var(--canvas);
  }
  .pp-pillar-card.is-alt .pp-pillar-tag {
    color: var(--canvas);
    border-top-color: var(--canvas);
  }
  .pp-pillar-card.is-alt .pp-pillar-title {
    color: var(--brand-accent);
    text-shadow: 4px 4px 0 var(--brand-secondary);
  }
  .pp-pillar-card.is-alt .pp-pillar-body {
    color: var(--canvas);
  }
</style>
```
