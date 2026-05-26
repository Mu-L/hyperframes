```html
<!-- Meta-pill chip. Pure border, no fill — the topbar/meta-row marker.
     999px radius is the only soft shape in the system; everything else is square. -->
<span class="pp-chip">{LABEL}</span>

<style>
  .pp-chip {
    display: inline-block;
    font-family: "DM Mono", monospace;
    font-size: 24px;
    letter-spacing: 0.18em;
    line-height: 1;
    text-transform: uppercase;
    color: var(--ink);
    border: 3px solid var(--ink);
    padding: 8px 20px;
    border-radius: var(--radius-pill);
    background: transparent;
  }
  /* On a blue-fill scene, the chip inverts to cream-on-blue. */
  .pp-chip.is-inverse {
    color: var(--canvas);
    border-color: var(--canvas);
  }
</style>
```
