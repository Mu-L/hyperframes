```html
<div class="rg-bar-meter">
  <div class="rg-bar-meter-label">{LABEL}</div>
  <div class="rg-bar-meter-track">
    <!-- TODO: replace width:62% with the data percentage when generating
         a series of bars; the inline value text ({NUM}) sits inside the
         fill at weight 800. Phase 4b worker should tween width 0% → target
         via power3.out at DUR.med (see §E motion rules). -->
    <div class="rg-bar-meter-fill" style="width: 62%;">{NUM}</div>
  </div>
</div>

<style>
  /*
    Bordered horizontal bar meter — 32px tall ink-bordered track with a
    flat-color child fill (pastel primary / pastel secondary / ink-black).
    Bars in the ink-black variant get inverted text color (white on ink);
    pastel bars keep ink text. The fill carries an inline value label at
    12px weight 800. The 3px ink border IS the track frame — no shadow.
  */
  .rg-bar-meter {
    width: 100%;
  }
  .rg-bar-meter-label {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink);
    margin-bottom: 6px;
  }
  .rg-bar-meter-track {
    width: 100%;
    height: 32px;
    border: var(--rg-border);
    background: var(--canvas);
    position: relative;
  }
  .rg-bar-meter-fill {
    height: 100%;
    background: var(--brand-primary);
    color: var(--ink);
    display: flex;
    align-items: center;
    padding-left: 10px;
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }
  .rg-bar-meter-fill.secondary {
    background: var(--brand-secondary);
    color: var(--ink);
  }
  .rg-bar-meter-fill.inverted {
    background: var(--ink);
    color: var(--canvas);
  }
</style>
```
