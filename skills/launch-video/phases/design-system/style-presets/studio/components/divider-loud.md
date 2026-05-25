```html
<!--
  Divider-loud — the 2px "anchor" rule used as a section separator inside a
  scene. The single heaviest line in the system. Use sparingly: anywhere a
  layout needs to read as "structural change" (above a stat row, between a
  chapter label and its title, between hero and body). Color is the surface
  accent. For mere chrome separation use a 1px hairline directly, not this.
-->
<hr class="sd-divider-loud" />

<style>
  .sd-divider-loud {
    border: 0;
    height: var(--rule-heavy);
    background: var(--brand-primary);
    width: 100%;
    margin: 0;
  }
  .sd-divider-loud--light {
    background: var(--canvas);
  }
  /* Muted variant — same weight, dropped to tier-3 opacity. Useful when the
     divider sits below a strong headline and a full-strength rule would
     compete with it. */
  .sd-divider-loud--muted {
    background: color-mix(in srgb, var(--brand-primary) 32%, transparent);
  }
  .sd-divider-loud--muted.sd-divider-loud--light {
    background: color-mix(in srgb, var(--canvas) 35%, transparent);
  }
</style>
```
