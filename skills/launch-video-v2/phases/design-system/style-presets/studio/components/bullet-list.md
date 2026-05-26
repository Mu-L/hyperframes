```html
<!--
  Em-dash bullet list — Studio's only list pattern. The em-dash carries the
  surface accent at full opacity; the item text uses tier-2 opacity. NEVER
  dots, NEVER circles, NEVER a different glyph. Body items use Barlow 400/500
  in sentence case (uppercase is reserved for headlines).
-->
<ul class="sd-bullet-list">
  <li class="sd-bullet-list-item">{DO_1}</li>
  <li class="sd-bullet-list-item">{DO_2}</li>
  <li class="sd-bullet-list-item">{DO_3}</li>
</ul>

<style>
  .sd-bullet-list {
    list-style: none;
    margin: 0;
    padding-left: 1.2em;
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-body);
    font-weight: 400;
    line-height: 1.5;
    color: var(--brand-primary);
  }
  .sd-bullet-list--lead {
    font-size: var(--sz-lead);
    font-weight: 500;
  }
  .sd-bullet-list--light {
    color: var(--canvas);
  }
  .sd-bullet-list-item {
    /* Body text muted to tier-2 — the em-dash carries the full-strength accent. */
    color: color-mix(in srgb, currentColor 75%, transparent);
    position: relative;
  }
  .sd-bullet-list-item::before {
    content: "\2014"; /* em-dash bullet marker */
    margin-left: -1.2em;
    margin-right: 0.5em;
    color: var(--brand-primary);
  }
  .sd-bullet-list--light .sd-bullet-list-item::before {
    color: var(--canvas);
  }
</style>
```
