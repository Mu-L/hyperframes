```html
<!-- The signature inline highlighter swatch. <mark> is repurposed here as a
     yellow (signal-fill) background block wrapping one or more words inside a
     display headline. Reveals in motion via scaleX(0→1) with left
     transform-origin — width sweeps across the word, never fades. The bigger
     sibling .ng-mark-em is the <em> color-switch variant (no background, just
     the signal color applied to the text — stays upright, no italic). -->
<h2 class="ng-mark-host">
  Build <mark class="ng-mark">{LABEL}</mark> the way <em class="ng-mark-em">{EYEBROW}</em> works.
</h2>

<style>
  .ng-mark-host {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: clamp(48px, 5vw, 88px);
    line-height: 1;
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    color: var(--ink);
    margin: 0;
  }
  .ng-mark {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
    padding: var(--mark-pad);
    border-radius: var(--radius, 0);
    /* Origin for the scaleX reveal in motion. */
    transform-origin: left center;
  }
  .ng-mark-em {
    background: transparent;
    color: var(--signal-fill, var(--brand-primary));
    font-style: normal; /* repurposed em: color switch only, never italic */
  }
</style>
```
