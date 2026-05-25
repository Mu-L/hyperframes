```html
<!-- Cover / closing-style hero. Big slab numeral-or-word in orange with jumbo stacked shadow,
     subtitle in cream/ink, all on whatever surface the scene background provides. -->
<div class="pp-hero">
  <div class="pp-hero-eyebrow">{EYEBROW}</div>
  <h1 class="pp-hero-title">{HEADLINE}</h1>
  <div class="pp-hero-subrow">
    <span class="pp-hero-script">a</span>
    <span class="pp-hero-sub">{SUBHEAD}</span>
  </div>
</div>

<style>
  .pp-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--gap-content, 120px) var(--gap-slide, 90px);
    gap: 32px;
  }
  .pp-hero-eyebrow {
    font-family: "DM Mono", monospace;
    font-size: 24px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink);
    opacity: 0.85;
  }
  .pp-hero-title {
    margin: 0;
    font-family: "Alfa Slab One", serif;
    font-size: clamp(96px, 12vw, 240px);
    line-height: 0.86;
    letter-spacing: 0.005em;
    text-transform: uppercase;
    color: var(--brand-accent);
    text-shadow: var(--shadow-stamp-jumbo);
  }
  .pp-hero-subrow {
    display: flex;
    align-items: center;
    gap: 28px;
    margin-top: 18px;
  }
  .pp-hero-script {
    font-family: "Caveat Brush", "Caveat", cursive;
    font-size: 84px;
    line-height: 1;
    color: var(--brand-secondary);
    transform: rotate(-5deg);
    text-transform: lowercase;
  }
  .pp-hero-sub {
    font-family: "Alfa Slab One", serif;
    font-size: clamp(36px, 4.5vw, 72px);
    line-height: 1;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    color: var(--brand-primary);
  }
</style>
```
