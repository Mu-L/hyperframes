```html
<button class="bn-button">{LABEL}</button>
<style>
  .bn-button {
    background: var(--brand-accent);
    color: var(--ink);
    border: var(--border-bold);
    box-shadow: var(--shadow-hard);
    padding: 16px 32px;
    font-size: clamp(16px, 1.6vw, 22px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .bn-button:hover {
    transform: translate(-3px, -3px);
    box-shadow: var(--shadow-hover);
  }
</style>
```
