```html
<div class="rg-connector-arrow">&rarr;</div>

<style>
  /*
    32px solid ink square containing a white arrow glyph at weight 900.
    Positioned absolutely between sequential items (timeline steps,
    process flows) to indicate forward progression. The system's visual
    "→" between stages. Strict square, no shadow — the inversion
    (white on ink) is the only visual treatment.
  */
  .rg-connector-arrow {
    width: 32px;
    height: 32px;
    border: var(--rg-border);
    background: var(--ink);
    color: var(--canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: 16px;
    font-weight: 900;
    line-height: 1;
  }
  /* Downward / vertical-flow variant — flip glyph at build time if used. */
  .rg-connector-arrow.down {
    /* DOM author swaps &rarr; for &darr; — no rotation transform, which
       would break the strict-orthogonality rule. */
  }
</style>
```
