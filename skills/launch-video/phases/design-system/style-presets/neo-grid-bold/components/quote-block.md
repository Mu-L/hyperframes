```html
<!-- Pull-quote composition: paper-fill body holding the blockquote with a giant
     signal-color quote-mark glyph, ink-stroke outlined, sitting above an
     attribution panel (signal-fill) with the speaker name + mono role. Use as
     a 2-panel scene element — quote on top, attribution below. -->
<div class="ng-quote-block">
  <div class="ng-quote-body">
    <div class="ng-quote-mark" aria-hidden="true">&ldquo;</div>
    <blockquote class="ng-quote-text">{QUOTE}</blockquote>
  </div>
  <div class="ng-quote-attr">
    <div class="ng-quote-role">{LABEL}</div>
    <div class="ng-quote-name">{AUTHOR}</div>
  </div>
</div>

<style>
  .ng-quote-block {
    display: flex;
    flex-direction: column;
    gap: var(--grid-gap);
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
  }
  .ng-quote-body {
    background: var(--canvas);
    color: var(--ink);
    padding: 48px 52px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .ng-quote-mark {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 96px;
    line-height: 0.8;
    color: var(--signal-fill, var(--brand-primary));
    -webkit-text-stroke: 2px var(--ink);
  }
  .ng-quote-text {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 500;
    font-size: 38px;
    line-height: 1.28;
    letter-spacing: var(--track-display-tight);
    margin: 0;
    color: var(--ink);
  }
  .ng-quote-attr {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
    padding: 36px 40px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ng-quote-role {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
  }
  .ng-quote-name {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 30px;
    text-transform: uppercase;
    letter-spacing: var(--track-display-tight);
  }
</style>
```
