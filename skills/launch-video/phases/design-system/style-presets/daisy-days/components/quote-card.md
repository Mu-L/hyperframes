```html
<!-- Quote card: oversized Fredoka quote-mark in soft-pink sits above the
     quoted text. Quotes never appear in this system without the quote-mark
     anchor — it's the signature treatment. -->
<div class="dc-quote">
  <div class="dc-quote-mark" aria-hidden="true">&ldquo;</div>
  <p class="dc-quote-text">{QUOTE}</p>
  <p class="dc-quote-author">{AUTHOR}</p>
</div>

<style>
  .dc-quote {
    background: var(--canvas);
    border: var(--border-bold);
    border-radius: var(--radius-card-lg);
    padding: var(--pad-card-lg);
    box-shadow: var(--shadow-card);
    max-width: 40vw;
    text-align: center;
  }
  .dc-quote-mark {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 4rem;
    line-height: 1;
    color: color-mix(in srgb, var(--brand-secondary) 60%, #f7c8d4);
    margin-bottom: 0.4rem;
  }
  .dc-quote-text {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.3rem, 2.2vw, 1.9rem);
    line-height: 1.35;
    color: var(--ink);
    margin: 0 0 1rem;
  }
  .dc-quote-author {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 0.95rem;
    color: color-mix(in srgb, var(--ink) 60%, transparent);
    margin: 0;
  }
</style>
```
