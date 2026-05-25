```html
<button class="rg-button">{LABEL}</button>

<style>
  /*
    Primary CTA. Same black-pill ground as `chip` but larger padding,
    arrow-prefixed (the system's interactivity signal), with a 6px ink
    hard-offset shadow for elevation. Strict rectangle — no border-radius.
    The `.accent` variant flips ground to a pastel accent surface and
    keeps text in ink for contrast (text NEVER inverts on accent surfaces).
  */
  .rg-button {
    display: inline-block;
    background: var(--ink);
    color: var(--canvas);
    padding: 14px 24px;
    border: var(--rg-border);
    cursor: pointer;
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(12px, 1.1vw, 14px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: var(--rg-shadow);
  }
  .rg-button::before {
    content: "\2192\00a0";
  }
  /* Accent variant: pastel ground, ink text — borders + arrow + shadow stay. */
  .rg-button.accent {
    background: var(--brand-primary);
    color: var(--ink);
  }
  .rg-button.accent-secondary {
    background: var(--brand-secondary);
    color: var(--ink);
  }
</style>
```
