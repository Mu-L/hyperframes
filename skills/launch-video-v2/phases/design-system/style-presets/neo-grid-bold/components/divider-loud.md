```html
<!-- Section divider: a two-panel composition where a signal ordinal panel sits
     beside an ink display panel. The ordinal is 320px Space-Grotesk weight 700.
     Use as a full-bleed scene element; the headline panel carries a <mark>
     swatch on one word inside the display. -->
<div class="ng-divider-loud">
  <div class="ng-divider-num-pane">
    <div class="ng-divider-label">{KICKER}</div>
    <div class="ng-divider-num">{NUM}</div>
  </div>
  <div class="ng-divider-title-pane">
    <div class="ng-divider-overline">{EYEBROW}</div>
    <h2 class="ng-divider-title">{HEADLINE}</h2>
    <p class="ng-divider-sub">{LEDE}</p>
  </div>
</div>

<style>
  .ng-divider-loud {
    display: grid;
    grid-template-columns: 4fr 8fr;
    gap: var(--grid-gap);
    background: var(--ink);
    color: var(--canvas);
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
    min-height: 540px;
  }
  .ng-divider-num-pane {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
    padding: var(--pad-large);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .ng-divider-label {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 18px;
    letter-spacing: var(--track-mono-wide);
    text-transform: uppercase;
  }
  .ng-divider-num {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: clamp(180px, 16vw, 320px);
    line-height: 0.85;
    letter-spacing: -0.05em;
  }
  .ng-divider-title-pane {
    background: var(--ink);
    color: var(--canvas);
    padding: var(--pad-large);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }
  .ng-divider-overline {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 16px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
    color: var(--canvas);
    opacity: 0.7;
  }
  .ng-divider-title {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: clamp(72px, 7vw, 132px);
    line-height: 0.9;
    letter-spacing: var(--track-display-loose);
    text-transform: uppercase;
    margin: 0;
  }
  .ng-divider-title mark {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
    padding: var(--mark-pad-lg);
  }
  .ng-divider-sub {
    font-family: var(--font-body), "Space Grotesk", sans-serif;
    font-size: 22px;
    line-height: 1.45;
    max-width: 48ch;
    opacity: 0.85;
    margin: 0;
  }
</style>
```
