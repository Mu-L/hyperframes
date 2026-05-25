```html
<!-- Framed-header pattern: a colored cap sits flush above a white body.
     The pair shares one continuous 3px border and casts a single offset
     shadow on the bottom unit. Don't pile two cards — this is the substitute. -->
<div class="dc-welcome">
  <div class="dc-welcome-cap">
    <h2 class="dc-welcome-title">{HEADLINE}</h2>
  </div>
  <div class="dc-welcome-body">
    <p class="dc-welcome-lede">{LEDE}</p>
  </div>
</div>

<style>
  .dc-welcome {
    width: 100%;
    max-width: 44vw;
  }
  .dc-welcome-cap {
    background: color-mix(in srgb, var(--brand-primary) 32%, #a8e6cf);
    border: var(--border-bold);
    border-bottom: none;
    border-radius: var(--radius-card-lg) var(--radius-card-lg) 0 0;
    padding: 1rem 2rem;
    text-align: center;
  }
  .dc-welcome-title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.4rem, 2.4vw, 2rem);
    line-height: 1.15;
    letter-spacing: 0.02em;
    color: var(--ink);
    margin: 0;
  }
  .dc-welcome-body {
    background: var(--canvas);
    border: var(--border-bold);
    border-radius: 0 0 var(--radius-card-lg) var(--radius-card-lg);
    padding: var(--pad-card-md);
    box-shadow: var(--shadow-card);
  }
  .dc-welcome-lede {
    font-family: var(--font-body);
    font-weight: 500;
    font-size: clamp(1rem, 1.3vw, 1.15rem);
    line-height: 1.6;
    color: var(--ink);
    margin: 0;
  }
</style>
```
