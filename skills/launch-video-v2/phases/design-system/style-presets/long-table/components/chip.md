```html
<!-- Sharp-cornered outlined rect-tag — the metadata / status counterpart to the pill button. Italic Fraunces text on a 1.5px ink border with no fill. Use for category, status, or short metadata chips where roundness would feel wrong. -->
<span class="lt-chip">{LABEL}</span>

<style>
  .lt-chip {
    display: inline-flex;
    align-items: center;
    padding: clamp(7px, 0.9vh, 12px) clamp(14px, 1.4vw, 22px);
    border: var(--lt-border-structural);
    border-radius: var(--lt-radius-flat);
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.1vw, 20px);
    line-height: 1.1;
    color: var(--brand-primary);
    white-space: nowrap;
  }
</style>
```
