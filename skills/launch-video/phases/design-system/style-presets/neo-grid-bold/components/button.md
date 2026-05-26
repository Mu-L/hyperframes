```html
<!-- Primary CTA / "step" card — paper or signal fill, ink uppercase headline,
     mono numbered eyebrow, body copy, optional right-arrow at the bottom. Strict
     rectangle, no shadow. Use .ng-button-signal for the signal variant. -->
<div class="ng-button">
  <div class="ng-button-eyebrow">{KICKER}</div>
  <h3 class="ng-button-title">{LABEL}</h3>
  <p class="ng-button-body">{SUBHEAD}</p>
  <div class="ng-button-arrow" aria-hidden="true">
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
      <path d="M8 32 H56 M40 16 L56 32 L40 48" />
    </svg>
  </div>
</div>

<style>
  .ng-button {
    background: var(--canvas);
    color: var(--ink);
    padding: var(--pad-standard);
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow-panel, none);
    min-height: 280px;
  }
  .ng-button-signal {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
  }
  .ng-button-ink {
    background: var(--ink);
    color: var(--canvas);
  }
  .ng-button-eyebrow {
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 16px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
    opacity: 0.85;
  }
  .ng-button-title {
    font-family: var(--font-display), "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 44px;
    line-height: 1;
    letter-spacing: var(--track-display);
    text-transform: uppercase;
    margin: 0;
  }
  .ng-button-body {
    font-family: var(--font-body), "Space Grotesk", sans-serif;
    font-size: 20px;
    line-height: 1.45;
    margin: 0;
  }
  .ng-button-arrow {
    width: 64px;
    height: 64px;
    margin-top: auto;
  }
  .ng-button-arrow svg {
    width: 100%;
    height: 100%;
  }
</style>
```
