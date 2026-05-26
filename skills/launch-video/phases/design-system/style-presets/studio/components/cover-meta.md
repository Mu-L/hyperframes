```html
<!--
  Cover-meta — Studio's signature three-column mono metadata footer. Column 1
  left-aligned (studio × client + date), column 2 centered (presentation
  title), column 3 right-aligned (studio name). Separated from the cover-type
  above by a 1px hairline at tier-3 opacity. The asymmetric grid (left/center/
  right) is non-negotiable — it IS the "Boring Studios" identifier.
-->
<div class="sd-cover-meta">
  <div class="sd-cover-meta-col sd-cover-meta-col--left">{LEFT}</div>
  <div class="sd-cover-meta-col sd-cover-meta-col--center">{HEADLINE}</div>
  <div class="sd-cover-meta-col sd-cover-meta-col--right">{RIGHT}</div>
</div>

<style>
  .sd-cover-meta {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    padding-top: var(--gap-md);
    border-top: var(--rule-hairline) solid color-mix(in srgb, var(--brand-primary) 32%, transparent);
    color: var(--brand-primary);
    width: 100%;
  }
  .sd-cover-meta--light {
    border-top-color: color-mix(in srgb, var(--canvas) 32%, transparent);
    color: var(--canvas);
  }
  .sd-cover-meta-col {
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-caption);
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: 0.04em;
    color: color-mix(in srgb, currentColor 58%, transparent);
  }
  .sd-cover-meta-col--center {
    text-align: center;
  }
  .sd-cover-meta-col--right {
    text-align: right;
  }
</style>
```
