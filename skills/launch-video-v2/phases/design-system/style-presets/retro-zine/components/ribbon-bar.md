```html
<div class="rz-ribbon-bar">{LABEL}</div>

<style>
  /*
    Solid brand-primary color-block with cream text — used as section labels,
    eyebrow strips, accent bars, inline highlight bars. Reads as a printed
    ribbon glued onto the page. NO border, NO border-radius. The ribbon's
    visual weight comes from the saturated brand color sitting flat on the
    khaki canvas.
  */
  .rz-ribbon-bar {
    display: inline-block;
    background: var(--brand-primary);
    color: var(--anchor-cream);
    font-family: "Bebas Neue", sans-serif;
    font-size: clamp(14px, 1.5vw, 18px);
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    line-height: 1.2;
    padding: 6px 16px;
  }
  /* Secondary variant: ink ground with brand-primary text. */
  .rz-ribbon-bar.ink {
    background: var(--ink);
    color: var(--brand-primary);
  }
  /* Stamp-style tilted ribbon — pair sparingly with a stamp-mark on the same scene. */
  .rz-ribbon-bar.stamp {
    transform: rotate(var(--rot-stamp));
  }
</style>
```
