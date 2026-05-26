```html
<!--
  Chapter label — the mono "NN / TITLE" lockup that anchors chapter and section
  scenes. Always paired with a large Barlow 900 h1 below; the label is the
  metadata voice, the title is the graphic mass. Tier-2 opacity by default;
  override with `.sd-chapter-label--strong` if it should read as primary.
-->
<div class="sd-chapter-label">
  <span class="sd-chapter-label-num">{KICKER}</span>
  <span class="sd-chapter-label-sep">/</span>
  <span class="sd-chapter-label-name">{LABEL}</span>
</div>

<style>
  .sd-chapter-label {
    display: inline-flex;
    align-items: baseline;
    gap: 0.6em;
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-label);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    /* Surface-aware muted accent — works on dark and light. */
    color: color-mix(in srgb, currentColor 58%, transparent);
  }
  .sd-chapter-label-sep {
    opacity: 0.6;
  }
  .sd-chapter-label--strong {
    color: inherit;
  }
</style>
```
