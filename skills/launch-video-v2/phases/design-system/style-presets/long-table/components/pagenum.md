```html
<!-- Page-number marker — italic Fraunces at the bottom-right of every scene. The marker is the system's spine; per §H, every scene carries one. Use literal "01 / 08" form (scene index / total) or "{KICKER}" if the index is dynamic. The italic Fraunces voice ties otherwise-different scenes into one coherent program. -->
<span class="lt-pagenum">{KICKER}</span>

<style>
  .lt-pagenum {
    position: absolute;
    right: clamp(36px, 3.6vw, 80px);
    bottom: clamp(40px, 4vh, 64px);
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(14px, 0.95vw, 16px);
    line-height: 1;
    letter-spacing: 0.02em;
    color: var(--brand-primary);
    z-index: 9;
  }
</style>
```
