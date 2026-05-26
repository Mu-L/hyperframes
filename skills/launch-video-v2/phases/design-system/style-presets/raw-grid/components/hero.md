```html
<div class="rg-hero">
  <span class="rg-hero-eyebrow">{EYEBROW}</span>
  <h1 class="rg-hero-display">{HEADLINE}</h1>
  <p class="rg-hero-body">{SUBHEAD}</p>
</div>

<style>
  /*
    Cover-tier hero block. Display headline at weight 900 uppercase with
    negative tracking — the system's primary typographic moment. Sits on
    the white canvas or an accent surface; text color is always var(--ink)
    on light surfaces (never brand-primary, never brand-secondary).
  */
  .rg-hero {
    background: var(--canvas);
    padding: var(--rg-pad-lg);
    color: var(--ink);
  }
  .rg-hero-eyebrow {
    display: block;
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(11px, 1vw, 13px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
    margin-bottom: var(--rg-gap-md);
  }
  .rg-hero-display {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(48px, 7vw, 96px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--ink);
    margin: 0;
  }
  .rg-hero-body {
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    font-size: clamp(16px, 1.3vw, 20px);
    font-weight: 500;
    line-height: 1.6;
    color: var(--ink);
    margin-top: var(--rg-gap-md);
    max-width: 50ch;
  }
</style>
```
