```html
<!-- Signature pairing: 180px Alfa Slab orange numeral over a 3px ink top-border DM Mono tag.
     Used to label columns, sections, ordered list items. -->
<div class="pp-column-ordinal">
  <div class="pp-column-num">{KICKER}</div>
  <div class="pp-column-tag">— {LABEL} —</div>
</div>

<style>
  .pp-column-ordinal {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .pp-column-num {
    font-family: "Alfa Slab One", serif;
    font-size: 180px;
    line-height: 0.88;
    letter-spacing: 0.005em;
    text-transform: uppercase;
    color: var(--brand-accent);
    text-shadow: var(--shadow-stamp-md);
  }
  .pp-column-tag {
    font-family: "DM Mono", monospace;
    font-size: 24px;
    letter-spacing: 0.18em;
    line-height: 1;
    text-transform: uppercase;
    color: var(--ink);
    margin-top: 14px;
    padding-top: 18px;
    border-top: var(--border-hairline);
  }
  /* On a blue scene, the tag flips to cream-on-cream-border. */
  .pp-column-ordinal.is-inverse .pp-column-tag {
    color: var(--canvas);
    border-top-color: var(--canvas);
  }
</style>
```
