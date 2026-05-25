```html
<!-- Edition badge + label unit — circular outlined ordinal next to italic Fraunces "EDITION N." label. Always rendered together — using one without the other reads as broken in this system. -->
<div class="lt-edition-badge">
  <div class="lt-edition-badge-circle">5</div>
  <div class="lt-edition-badge-label">{LABEL}</div>
</div>

<style>
  .lt-edition-badge {
    display: inline-flex;
    align-items: center;
    gap: clamp(12px, 1.2vw, 18px);
    color: var(--brand-primary);
  }
  .lt-edition-badge-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(34px, 2.6vw, 44px);
    height: clamp(34px, 2.6vw, 44px);
    border: var(--lt-border-structural);
    border-radius: var(--lt-radius-badge);
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.05vw, 18px);
    line-height: 1;
    color: var(--brand-primary);
  }
  .lt-edition-badge-label {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(20px, 1.6vw, 30px);
    line-height: 1;
    color: var(--brand-primary);
  }
</style>
```
