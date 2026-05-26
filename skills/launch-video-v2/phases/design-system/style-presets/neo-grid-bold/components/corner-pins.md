```html
<!-- The 2x2 diagonal block stamp used as a corner-mark identity tag. Anchored
     top-right of a panel; uses currentColor for the filled squares so it
     inherits the parent panel's ink/paper color. Sized via --corner-mark-size. -->
<div class="ng-corner-pins" aria-hidden="true">
  <span></span><span></span><span></span><span></span>
</div>

<style>
  .ng-corner-pins {
    position: absolute;
    top: 22px;
    right: 22px;
    width: var(--corner-mark-size);
    height: var(--corner-mark-size);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--blockmark-gap);
    color: var(--ink);
  }
  .ng-corner-pins span {
    background: currentColor;
    border-radius: var(--radius, 0);
  }
  /* Diagonal-fill: top-left and bottom-right filled, other two transparent. */
  .ng-corner-pins span:nth-child(2),
  .ng-corner-pins span:nth-child(3) {
    background: transparent;
  }
</style>
```
