```html
<!--
  Studio chip — mono uppercase metadata label. Studio has no pill / no badge /
  no rounded tag; the chip is just IBM Plex Mono uppercase text at 0.06em
  tracking. Use for category labels, scene-counter chrome, "approach" /
  "services" eyebrow chrome, any small spec-sheet voice moment. No background
  fill, no border — the type alone is the chip. Reads naturally on both dark
  and light surfaces via currentColor + opacity.
-->
<span class="sd-chip">{LABEL}</span>

<style>
  .sd-chip {
    display: inline-block;
    font-family: "IBM Plex Mono", monospace;
    font-size: var(--sz-label);
    font-weight: 500;
    line-height: 1;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
    /* Surface-aware muted accent — tier-2 opacity on the parent ink. */
    color: color-mix(in srgb, currentColor 58%, transparent);
  }
  /* Variant: full-strength chip for emphasis moments. */
  .sd-chip--strong {
    color: inherit;
    font-weight: 700;
  }
</style>
```
