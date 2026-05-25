```html
<!--
  Stat tile — 2px top rule (the "anchor" weight), 5.5vw Barlow 900 numeral
  in the surface accent, sentence-case label below, optional mono stat-note
  at tier-3 opacity. Left padding is zero so the rule starts flush left;
  right/bottom padding only. The surface accent flips on `.sd-stat-counter--light`.
-->
<div class="sd-stat-counter">
  <div class="sd-stat-counter-num">{NUM}</div>
  <div class="sd-stat-counter-label">{LABEL}</div>
  <div class="sd-stat-counter-note">{SUBHEAD}</div>
</div>

<style>
  .sd-stat-counter {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
    padding: var(--gap-md) var(--gap-md) var(--gap-md) 0;
    border-top: var(--rule-heavy) solid var(--brand-primary);
    color: var(--brand-primary);
  }
  /* Light variant: top rule flips to canvas-color; type flips too. */
  .sd-stat-counter--light {
    border-top-color: var(--canvas);
    color: var(--canvas);
  }
  .sd-stat-counter-num {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-stat);
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: var(--track-stat);
    text-transform: uppercase;
    color: inherit;
  }
  .sd-stat-counter-label {
    font-family: "Barlow", "Inter", sans-serif;
    font-size: var(--sz-body);
    font-weight: 500;
    line-height: 1.4;
    color: inherit;
  }
  .sd-stat-counter-note {
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-caption);
    font-weight: 400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    /* Tier-3 mute on the surface accent. */
    color: color-mix(in srgb, currentColor 32%, transparent);
  }
</style>
```
