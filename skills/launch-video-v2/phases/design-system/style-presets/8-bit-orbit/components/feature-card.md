```html
<div class="bo-feature-card">
  <span class="bo-feature-card-bracket-tl"></span>
  <span class="bo-feature-card-bracket-br"></span>
  <h3 class="bo-feature-card-title">{HEADLINE}</h3>
  <p class="bo-feature-card-body">{SUBHEAD}</p>
</div>

<style>
  /*
    Frosted-glass card with inset navy L-brackets (top-left + bottom-right)
    replacing rounded corners. Used on light-surface scenes. The brackets
    are the visual signature — never use border-radius.
  */
  .bo-feature-card {
    position: relative;
    background: color-mix(in srgb, var(--ink) 15%, transparent);
    backdrop-filter: blur(8px);
    padding: 32px 24px;
    border: 2px solid color-mix(in srgb, var(--canvas-navy) 20%, transparent);
  }
  .bo-feature-card-bracket-tl,
  .bo-feature-card-bracket-br {
    position: absolute;
    width: 18px;
    height: 18px;
    border: 4px solid var(--canvas-navy);
  }
  .bo-feature-card-bracket-tl {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
  }
  .bo-feature-card-bracket-br {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
  }
  .bo-feature-card-title {
    font-family: "Tektur", cursive;
    font-weight: 700;
    font-size: clamp(17.6px, 2vw, 24px);
    line-height: 1.15;
    text-transform: uppercase;
    color: var(--canvas-navy);
    margin: 0 0 12px;
  }
  .bo-feature-card-body {
    font-family: "Chakra Petch", sans-serif;
    font-size: clamp(14.4px, 1.2vw, 16px);
    font-weight: 400;
    line-height: 1.7;
    color: var(--canvas-navy);
    margin: 0;
  }
</style>
```
