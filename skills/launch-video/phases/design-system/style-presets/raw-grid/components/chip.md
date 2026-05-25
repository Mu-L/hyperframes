```html
<span class="rg-chip">{LABEL}</span>

<style>
  /*
    Black-pill label — the system's universal section tag. White uppercase
    text on ink-black ground at weight 800, 11px, 0.08em tracking, 6/14
    padding. Strict rectangle (no border-radius). May be prepended with
    the arrow glyph via the `.arrow` variant on CTA usages.
  */
  .rg-chip {
    display: inline-block;
    background: var(--ink);
    color: var(--canvas);
    padding: 6px 14px;
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  /* Arrow-prefix variant — used as CTA-style chip. Inline → glyph + nbsp. */
  .rg-chip.arrow::before {
    content: "\2192\00a0";
  }
</style>
```
