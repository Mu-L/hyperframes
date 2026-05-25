```html
<!-- Pill button — outlined fully-rounded-rectangle holding italic Fraunces text.
     The system's CTA / action button. Borders are 1.5px structural ink; no fill. -->
<button class="lt-button" type="button">{LABEL}</button>

<style>
  .lt-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: clamp(8px, 1vh, 14px) clamp(20px, 2vw, 32px);
    border: var(--lt-border-structural);
    border-radius: var(--lt-radius-pill);
    background: transparent;
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.1vw, 20px);
    line-height: 1;
    color: var(--brand-primary);
    white-space: nowrap;
    cursor: pointer;
  }
</style>
```
