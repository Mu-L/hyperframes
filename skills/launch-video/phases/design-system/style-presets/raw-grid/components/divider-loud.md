```html
<div class="rg-divider-loud"></div>

<style>
  /*
    60px × 4px solid ink rule stub — the system's signature "section break"
    mark. Placed inline next to a chip or eyebrow caption, or under a hero
    block to anchor the typographic moment. The `.full` variant stretches
    to 100% width for true section-divider use; the default 60px stub is
    the editorial accent treatment.
  */
  .rg-divider-loud {
    width: var(--rg-rule-len);
    height: var(--rg-rule-thick);
    background: var(--ink);
    flex-shrink: 0;
  }
  /* Full-width section divider — borders normally do this job; use sparingly. */
  .rg-divider-loud.full {
    width: 100%;
  }
  /* Vertical orientation — for inline use beside text. */
  .rg-divider-loud.vertical {
    width: var(--rg-rule-thick);
    height: var(--rg-rule-len);
  }
</style>
```
