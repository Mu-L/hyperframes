```html
<!--
  Pull-quote block — large uppercase Barlow 900 at 3.8vw, NO quote marks
  (the type itself is loud enough), attribution in mono uppercase below.
  Studio quote slides are chromeless: nothing else on the scene besides this.
-->
<div class="sd-quote-block">
  <p class="sd-quote-block-text">{QUOTE}</p>
  <div class="sd-quote-block-attr">
    <span class="sd-quote-block-author">{AUTHOR}</span>
    <span class="sd-quote-block-meta">{SUBHEAD}</span>
  </div>
</div>

<style>
  .sd-quote-block {
    display: flex;
    flex-direction: column;
    gap: var(--gap-lg);
    color: var(--brand-primary);
    max-width: 95%;
  }
  .sd-quote-block--light {
    color: var(--canvas);
  }
  .sd-quote-block-text {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-quote);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    color: inherit;
    max-width: 82%;
    margin: 0;
  }
  .sd-quote-block-attr {
    display: flex;
    flex-direction: column;
    gap: 0.4vh;
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-label);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .sd-quote-block-author {
    color: inherit;
  }
  .sd-quote-block-meta {
    /* Tier-2 mute on the supporting attribution line. */
    color: color-mix(in srgb, currentColor 58%, transparent);
  }
</style>
```
