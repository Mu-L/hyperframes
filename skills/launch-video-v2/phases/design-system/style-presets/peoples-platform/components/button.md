```html
<!-- Primary CTA. Orange fill + cream border + 10px red box-shadow. Square corners.
     Alfa Slab uppercase, 48px, slight tracking. -->
<a class="pp-button" href="#">{LABEL}</a>

<style>
  .pp-button {
    display: inline-block;
    font-family: "Alfa Slab One", serif;
    font-size: 48px;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--brand-primary);
    background: var(--brand-accent);
    border: var(--border-structural-inverse);
    border-radius: var(--radius-square);
    padding: 24px 44px;
    box-shadow: 10px 10px 0 var(--brand-secondary);
    text-decoration: none;
    cursor: pointer;
  }
  /* On a paper scene where the cream border would disappear, use the ink border instead. */
  .pp-button.is-on-paper {
    border: var(--border-structural);
  }
</style>
```
