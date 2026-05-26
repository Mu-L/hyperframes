```html
<!-- Paper-texture overlay — a 4px-tile radial-dot pattern at 10% opacity, layered atmospherically beneath all scene content. Sits absolutely on the stage with pointer-events disabled. Invisible at conversational viewing distance, just-visible up close — gives the cream surface its "printed paper" quality. Per §H, this overlay is on EVERY scene; removing it breaks the printed-program register. -->
<div class="lt-paper-texture" aria-hidden="true"></div>

<style>
  .lt-paper-texture {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: var(--lt-paper-texture-opacity);
    background-image: var(--lt-paper-texture);
    background-size: var(--lt-paper-texture-size);
    z-index: 1;
  }
</style>
```
