```html
<button class="ed-button">{LABEL} <span class="ed-arrow">→</span></button>
<style>
  .ed-button {
    background: transparent;
    color: var(--ink);
    border: none;
    border-bottom: var(--rule-hairline);
    padding: 8px 0;
    font-size: clamp(15px, 1.4vw, 18px);
    font-weight: 500;
    cursor: pointer;
  }
  .ed-button:hover {
    border-bottom-color: var(--brand-accent, var(--ink));
  }
  .ed-arrow {
    display: inline-block;
    margin-left: 8px;
    transition: transform 0.32s;
  }
  .ed-button:hover .ed-arrow {
    transform: translateX(4px);
  }
</style>
```
