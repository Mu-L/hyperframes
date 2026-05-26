```html
<!--
  Studio hero — cover-tier display headline. One word or one short phrase at
  12vw Barlow 900 uppercase, surface-accent color. Either sits on a dark canvas
  (brand-primary type) or a brand-primary canvas (canvas-color type). Add the
  `.sd-hero--light` modifier when the parent scene is a light/yellow surface.
  The eyebrow (mono uppercase) is optional but recommended for chrome scenes;
  drop it on pure-statement scenes.
-->
<div class="sd-hero">
  <span class="sd-hero-eyebrow">{EYEBROW}</span>
  <h1 class="sd-hero-display">{HEADLINE}</h1>
</div>

<style>
  .sd-hero {
    background: var(--canvas);
    color: var(--brand-primary);
    padding: var(--pad-y) var(--pad-x);
    width: 100%;
  }
  .sd-hero--light {
    background: var(--brand-primary);
    color: var(--canvas);
  }
  .sd-hero-eyebrow {
    display: block;
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-label);
    font-weight: 500;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
    /* Mono eyebrow uses tier-2 opacity on the surface accent. */
    color: color-mix(in srgb, currentColor 58%, transparent);
    margin-bottom: var(--gap-lg);
  }
  .sd-hero-display {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-display);
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    color: inherit;
    margin: 0;
    max-width: 95%;
  }
</style>
```
