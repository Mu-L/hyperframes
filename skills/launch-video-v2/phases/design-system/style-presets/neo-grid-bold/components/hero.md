```html
<!-- Cover-style display panel: signal fill (brand-primary), uppercase Space-Grotesk
     class headline with a <mark> swatch inside, mono kicker above, blockmark stamp
     bottom-right. Pure-rectangle, no rounding, no shadow. Prefix: ng-. -->
<div class="ng-hero">
  <div class="ng-hero-kicker">{KICKER}</div>
  <h1 class="ng-hero-title">{HEADLINE}<br /><mark class="ng-mark">{EYEBROW}</mark></h1>
  <div class="ng-hero-blockmark" aria-hidden="true">
    <span></span><span></span><span></span><span></span>
  </div>
</div>

<style>
  .ng-hero {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
    padding: var(--pad-hero);
    position: relative;
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
    min-height: 540px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .ng-hero-kicker {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 24px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
    color: var(--ink);
    opacity: 0.85;
  }
  .ng-hero-title {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: clamp(72px, 6.8vw, 132px);
    line-height: 0.92;
    letter-spacing: var(--track-display-loose);
    text-transform: uppercase;
    margin: 0;
    color: var(--ink);
  }
  .ng-hero-title .ng-mark {
    background: var(--canvas);
    color: var(--ink);
    padding: var(--mark-pad-lg);
    /* Inside a signal panel the mark swatch flips to canvas/paper so it still reads as a swatch, not a tone-on-tone block. */
  }
  .ng-hero-blockmark {
    width: var(--blockmark-size);
    height: var(--blockmark-size);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--blockmark-gap);
    align-self: flex-end;
  }
  .ng-hero-blockmark span:nth-child(1) {
    background: var(--ink);
  }
  .ng-hero-blockmark span:nth-child(2) {
    background: transparent;
  }
  .ng-hero-blockmark span:nth-child(3) {
    background: transparent;
  }
  .ng-hero-blockmark span:nth-child(4) {
    background: var(--ink);
  }
</style>
```
