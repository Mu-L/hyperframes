```html
<!-- Rectangular stamp, blue fill + orange text, 5px cream border, 6px red box-shadow,
     rotated -3deg. Address-label energy. Used as an attribution badge beside a pull quote. -->
<div class="pp-quote-stamp">★ {LABEL} ★</div>

<style>
  .pp-quote-stamp {
    display: inline-block;
    background: var(--brand-primary);
    color: var(--brand-accent);
    padding: 18px 32px;
    transform: rotate(var(--tilt-stamp-rect));
    border: var(--border-stamp);
    font-family: "Alfa Slab One", serif;
    font-size: 28px;
    letter-spacing: 0.04em;
    line-height: 1;
    text-transform: uppercase;
    box-shadow: var(--shadow-block-md);
  }
</style>
```
