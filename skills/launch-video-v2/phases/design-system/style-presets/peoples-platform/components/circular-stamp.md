```html
<!-- The "seal" — 200px cream disc, 6px orange border, 8px red box-shadow, rotated -9deg.
     Approval-mark / certification energy. Big Alfa Slab word on top, small mono note below. -->
<div class="pp-circular-stamp">
  <div class="pp-circular-stamp-big">END</div>
  <div class="pp-circular-stamp-small">— {LABEL} —</div>
</div>

<style>
  .pp-circular-stamp {
    width: 200px;
    height: 200px;
    border-radius: var(--radius-disc);
    background: var(--canvas);
    color: var(--brand-primary);
    border: 6px solid var(--brand-accent);
    box-shadow: var(--shadow-block-lg);
    transform: rotate(var(--tilt-stamp-circle));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
    font-family: "Alfa Slab One", serif;
    text-transform: uppercase;
  }
  .pp-circular-stamp-big {
    font-size: 54px;
    line-height: 1;
  }
  .pp-circular-stamp-small {
    margin-top: 8px;
    font-family: "DM Mono", monospace;
    font-size: 18px;
    letter-spacing: 0.18em;
  }
</style>
```
