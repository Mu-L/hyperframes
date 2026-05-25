```html
<div class="bn-hero">
  <span class="bn-eyebrow">{EYEBROW}</span>
  <h1 class="bn-display">{HEADLINE}</h1>
  <p class="bn-body">{SUBHEAD}</p>
</div>
<style>
  .bn-hero {
    background: var(--canvas);
    border: var(--border-bold);
    box-shadow: var(--shadow-hard);
    padding: clamp(48px, 6vw, 96px);
    transform: rotate(var(--tilt-l));
  }
  .bn-eyebrow {
    font-size: clamp(14px, 1.4vw, 30px);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .bn-display {
    font-size: clamp(200px, 24vw, 340px);
    letter-spacing: -0.04em;
    font-weight: 800;
    line-height: 0.95;
  }
  .bn-body {
    font-size: clamp(18px, 1.8vw, 28px);
    margin-top: 24px;
    max-width: 50ch;
  }
</style>
```
