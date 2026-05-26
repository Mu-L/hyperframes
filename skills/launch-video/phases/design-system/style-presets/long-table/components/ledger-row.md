```html
<!-- Horizontal ledger-style row — the system's calendar / schedule / index pattern. Multi-column grid (num · city · theme · date · seats-pill) separated by a 1px @ 32% solid border-bottom. Reads as a guestbook / restaurant-reservation log. Bricolage uppercase for the city marker (the structural focus); italic Fraunces for everything else. The seats-pill at the end reuses the pill border vocabulary. -->
<div class="lt-ledger-row">
  <span class="lt-ledger-row-num">{KICKER}</span>
  <span class="lt-ledger-row-city">{LABEL}</span>
  <span class="lt-ledger-row-theme">{LEDE}</span>
  <span class="lt-ledger-row-date">{LEFT}</span>
  <span class="lt-ledger-row-seats">{RIGHT}</span>
</div>

<style>
  .lt-ledger-row {
    display: grid;
    grid-template-columns: 80px 160px 1.6fr 0.9fr auto;
    gap: clamp(14px, 1.4vw, 28px);
    align-items: center;
    padding: clamp(11px, 1.3vh, 18px) 0;
    border-bottom: var(--lt-divider-solid);
    color: var(--brand-primary);
  }
  .lt-ledger-row-num {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.05vw, 18px);
    line-height: 1;
    color: var(--brand-primary);
  }
  .lt-ledger-row-city {
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: clamp(18px, 1.3vw, 24px);
    line-height: 1;
    letter-spacing: var(--lt-track-tight);
    color: var(--brand-primary);
  }
  .lt-ledger-row-theme {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(17px, 1.2vw, 22px);
    line-height: 1.3;
    color: var(--brand-primary);
  }
  .lt-ledger-row-date {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.05vw, 17px);
    line-height: 1;
    color: var(--brand-primary);
  }
  .lt-ledger-row-seats {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: var(--lt-border-structural);
    border-radius: var(--lt-radius-pill);
    padding: 6px 16px;
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(13px, 0.95vw, 16px);
    line-height: 1;
    color: var(--brand-primary);
    white-space: nowrap;
  }
</style>
```
