```html
<!--
  Image placeholder — a flat rectangle in the warm "alt" tone of the current
  surface, with centered mono uppercase label at tier-3 opacity. Used for any
  image slot that hasn't been filled by the worker. Dark variant uses a brand-
  tinted shade of canvas; light variant uses a brand-tinted shade plus a
  hairline border for separation against the brand-color ground.
-->
<div class="sd-img-placeholder">
  <span class="sd-img-placeholder-label">{LABEL}</span>
</div>

<style>
  .sd-img-placeholder {
    /* Warm-dark alt — mix canvas with a touch of brand-primary for warmth, never neutral grey. */
    background: color-mix(in srgb, var(--canvas) 92%, var(--brand-primary));
    color: color-mix(in srgb, var(--brand-primary) 32%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 40vh;
    flex: 1;
  }
  /* Light variant sits on a brand-primary scene; needs hairline separation. */
  .sd-img-placeholder--light {
    background: color-mix(in srgb, var(--brand-primary) 92%, var(--canvas));
    color: color-mix(in srgb, var(--canvas) 35%, transparent);
    border: var(--rule-hairline) solid color-mix(in srgb, var(--canvas) 18%, transparent);
  }
  .sd-img-placeholder-label {
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-label);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: inherit;
  }
</style>
```
