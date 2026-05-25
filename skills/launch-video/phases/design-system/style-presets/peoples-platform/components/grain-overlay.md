```html
<!-- Mandatory atmospheric overlay. Sits on every scene as a sibling/::before layer
     to give flat digital surfaces a screen-printed quality. Static — never animated.
     Worker places this AFTER all foreground content so it sits on top, with pointer-events: none. -->
<div class="pp-grain-overlay" aria-hidden="true"></div>

<style>
  .pp-grain-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
      radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size:
      3px 3px,
      5px 5px;
    background-position:
      0 0,
      1px 2px;
    mix-blend-mode: multiply;
    opacity: 0.5;
    z-index: 1000;
  }
</style>
```
