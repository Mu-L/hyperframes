```html
<!--
  Before/after compare panel — two columns divided by a single vertical 2px
  rule (Studio's asymmetric pattern: left panel carries the divider, right
  does not). Mono uppercase compare-label above each h3 sub-headline, body
  paragraph below, optional em-dash bullets. The "after" label color carries
  the surface accent; "before" stays muted.
-->
<div class="sd-compare-panel">
  <div class="sd-compare-panel-side sd-compare-panel-side--before">
    <div class="sd-compare-panel-label">{KICKER}</div>
    <h3 class="sd-compare-panel-title">{LEFT}</h3>
    <p class="sd-compare-panel-body">{LEDE}</p>
  </div>
  <div class="sd-compare-panel-side sd-compare-panel-side--after">
    <div class="sd-compare-panel-label sd-compare-panel-label--strong">{LABEL}</div>
    <h3 class="sd-compare-panel-title">{RIGHT}</h3>
    <p class="sd-compare-panel-body">{LEDE}</p>
  </div>
</div>

<style>
  .sd-compare-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    color: var(--brand-primary);
  }
  .sd-compare-panel--light {
    color: var(--canvas);
  }
  .sd-compare-panel-side {
    display: flex;
    flex-direction: column;
    gap: var(--gap-md);
    padding: var(--gap-md) 0;
  }
  .sd-compare-panel-side--before {
    padding-right: calc(var(--pad-x) * 0.55);
    /* The signature asymmetric 2px rule lives on the left panel only. */
    border-right: var(--rule-heavy) solid currentColor;
  }
  .sd-compare-panel-side--after {
    padding-left: calc(var(--pad-x) * 0.55);
  }
  .sd-compare-panel-label {
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-label);
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding-bottom: var(--gap-sm);
    border-bottom: var(--rule-hairline) solid color-mix(in srgb, currentColor 18%, transparent);
    /* Tier-2 muted by default; the after-label flips to full accent. */
    color: color-mix(in srgb, currentColor 58%, transparent);
  }
  .sd-compare-panel-label--strong {
    color: inherit;
    font-weight: 700;
  }
  .sd-compare-panel-title {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-h3);
    font-weight: 700;
    line-height: 1.1;
    text-transform: uppercase;
    color: inherit;
    margin: 0;
  }
  .sd-compare-panel-body {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-lead);
    font-weight: 400;
    line-height: 1.45;
    color: color-mix(in srgb, currentColor 62%, transparent);
    margin: 0;
  }
</style>
```
