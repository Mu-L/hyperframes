```html
<!-- Large 2x2 brand-mark stamp. Used as a decorative identity tag inside a
     panel — top-left or bottom-right of a hero/quote scene. Diagonal squares
     filled, other two transparent. Sized via --blockmark-size (default 56px,
     scaled up to 96px on quote slides). Renders in ink by default; modifier
     class .ng-block-stamp-signal flips to signal-fill for use on ink panels. -->
<div class="ng-block-stamp" aria-hidden="true">
  <span></span><span></span><span></span><span></span>
</div>

<style>
  .ng-block-stamp {
    width: 96px;
    height: 96px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 6px;
    color: var(--ink);
  }
  .ng-block-stamp span {
    background: currentColor;
    border-radius: var(--radius, 0);
  }
  .ng-block-stamp span:nth-child(2),
  .ng-block-stamp span:nth-child(3) {
    background: transparent;
  }
  .ng-block-stamp-signal {
    color: var(--signal-fill, var(--brand-primary));
  }
  .ng-block-stamp-paper {
    color: var(--canvas);
  }
</style>
```
