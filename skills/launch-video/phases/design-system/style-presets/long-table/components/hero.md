```html
<!-- Cover-class entry-point: small edition badge + label, then a massive Bricolage uppercase title, an italic Fraunces tagline. The hero is paired with a `jumbo-numeral` component in a 2-column scene layout when used as a true cover. -->
<div class="lt-hero">
  <div class="lt-hero-ed-row">
    <div class="lt-ed-badge">5</div>
    <div class="lt-hero-ed-label">{EYEBROW}</div>
  </div>
  <h1 class="lt-hero-title">{HEADLINE}</h1>
  <p class="lt-hero-tagline">{SUBHEAD}</p>
</div>

<style>
  .lt-hero {
    display: flex;
    flex-direction: column;
    gap: var(--lt-gap-content);
    color: var(--brand-primary);
  }
  .lt-hero-ed-row {
    display: flex;
    align-items: center;
    gap: clamp(12px, 1.2vw, 18px);
  }
  .lt-ed-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(34px, 2.6vw, 44px);
    height: clamp(34px, 2.6vw, 44px);
    border: var(--lt-border-structural);
    border-radius: var(--lt-radius-badge);
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.05vw, 18px);
    line-height: 1;
    color: var(--brand-primary);
  }
  .lt-hero-ed-label {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(20px, 1.6vw, 30px);
    line-height: 1;
    color: var(--brand-primary);
  }
  .lt-hero-title {
    margin: 0;
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    font-size: clamp(82px, min(8.8vw, 15vh), 180px);
    line-height: 0.92;
    letter-spacing: var(--lt-track-display);
    color: var(--brand-primary);
  }
  .lt-hero-tagline {
    margin: 0;
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(18px, 1.4vw, 26px);
    line-height: 1.35;
    color: var(--brand-primary);
    max-width: 40ch;
  }
</style>
```
