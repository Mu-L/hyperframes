```html
<!-- Caveat Brush "human interrupt" — lowercase, large, slightly rotated.
     Use once per scene at most. Place adjacent to a slab headline it qualifies. -->
<span class="pp-script-interrupt">{EYEBROW}</span>

<style>
  .pp-script-interrupt {
    display: inline-block;
    font-family: "Caveat Brush", "Caveat", cursive;
    font-size: 96px;
    line-height: 1;
    text-transform: lowercase;
    color: var(--brand-secondary);
    transform: rotate(var(--tilt-script));
  }
  /* On a blue scene, the script flips to cream or orange — whichever has contrast. */
  .pp-script-interrupt.is-on-blue {
    color: var(--brand-accent);
  }
  /* A smaller variant used as sub-callout / subtitle annotation. */
  .pp-script-interrupt.is-small {
    font-size: 64px;
    transform: rotate(-2deg);
  }
</style>
```
