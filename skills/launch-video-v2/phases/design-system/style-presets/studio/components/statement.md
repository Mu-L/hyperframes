```html
<!--
  Statement scene body — one massive Barlow 900 h1 at 7.5vw, justified to
  bottom of the scene with empty surface above. This is Studio's "manifesto"
  moment: zero chrome, zero ornament. Headline color is always the surface
  accent. Add `.sd-statement--light` to flip the surface mapping.
-->
<div class="sd-statement">
  <h1 class="sd-statement-text">{HEADLINE}</h1>
</div>

<style>
  .sd-statement {
    background: var(--canvas);
    color: var(--brand-primary);
    width: 100%;
    height: 100%;
    padding: var(--pad-y) var(--pad-x);
    /* The empty surface above the headline is structural. */
    padding-bottom: calc(var(--pad-y) * 1.5);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .sd-statement--light {
    background: var(--brand-primary);
    color: var(--canvas);
  }
  .sd-statement-text {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-h1);
    font-weight: 900;
    line-height: 0.92;
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    color: inherit;
    max-width: 90%;
    margin: 0;
  }
</style>
```
