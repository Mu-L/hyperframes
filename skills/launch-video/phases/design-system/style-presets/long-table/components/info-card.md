```html
<!-- Featured-edition supporting panel — a wider 1.5px outlined card with internal info-rows. Each row is a key (italic Fraunces, tracked uppercase) + value (Bricolage 700 uppercase) pair, separated by 1px @ 32% dashed dividers. Use beside a hero headline for "When / Where / Who / How long / Seat" style metadata blocks. -->
<aside class="lt-info-card">
  <div class="lt-info-card-row">
    <span class="lt-info-card-key">{EYEBROW}</span>
    <span class="lt-info-card-value">{HEADLINE}</span>
  </div>
  <div class="lt-info-card-row">
    <span class="lt-info-card-key">{KICKER}</span>
    <span class="lt-info-card-value">{LABEL}</span>
  </div>
  <div class="lt-info-card-row">
    <span class="lt-info-card-key">{LEFT}</span>
    <span class="lt-info-card-value">{RIGHT}</span>
  </div>
</aside>

<style>
  .lt-info-card {
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 2vh, 28px);
    padding: clamp(28px, 3vw, 56px) clamp(28px, 2.4vw, 48px);
    border: var(--lt-border-structural);
    border-radius: var(--lt-radius-flat);
    background: transparent;
    color: var(--brand-primary);
  }
  .lt-info-card-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: clamp(20px, 2vw, 36px);
    align-items: baseline;
    border-bottom: var(--lt-divider-dashed);
    padding-bottom: clamp(12px, 1.4vh, 20px);
  }
  .lt-info-card-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .lt-info-card-key {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(14px, 0.95vw, 16px);
    line-height: 1.2;
    letter-spacing: var(--lt-track-wide);
    text-transform: uppercase;
    color: var(--brand-primary);
  }
  .lt-info-card-value {
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: clamp(20px, 1.6vw, 28px);
    line-height: 1.1;
    letter-spacing: var(--lt-track-tight);
    color: var(--brand-primary);
    text-align: right;
  }
</style>
```
