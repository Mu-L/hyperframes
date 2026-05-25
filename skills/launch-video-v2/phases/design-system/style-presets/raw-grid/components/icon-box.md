```html
<!-- TODO: replace the literal "RG" with a 1-3 character brand monogram
     or Roman-numeral ordinal (I / II / III / IV) at scene-build time.
     There is no whitelisted placeholder for 1-3 character glyphs;
     hardcode a meaningful literal per §8.5 escape-hatch 1. -->
<div class="rg-icon-box">RG</div>

<style>
  /*
    48px white square with 3px ink border, containing a 1-3 character
    glyph (initials, Roman numeral, single letter) at weight 900. Used
    as a brand logo mark on cover scenes and as feature-card icons inside
    grid cells. Strict square — never elongated, never rounded.
  */
  .rg-icon-box {
    width: 48px;
    height: 48px;
    border: var(--rg-border);
    background: var(--canvas);
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
    font-size: 18px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  /* Inverted variant for use on ink-black surfaces. */
  .rg-icon-box.inverted {
    background: var(--ink);
    color: var(--canvas);
    border-color: var(--canvas);
  }
</style>
```
