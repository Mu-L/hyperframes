```html
<!-- The system's signature hero typographic anchor — a massive italic Fraunces numeral (up to 480px) paired with a small Bricolage tracked-uppercase label and an italic Fraunces meta line. Replaces hero imagery on cover-class scenes. The numeral is the visual centerpiece. -->
<div class="lt-jumbo-numeral">
  <div class="lt-jumbo-numeral-digit">{NUM}</div>
  <div class="lt-jumbo-numeral-label">{EYEBROW}</div>
  <div class="lt-jumbo-numeral-meta">{LEDE}</div>
</div>

<style>
  .lt-jumbo-numeral {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    color: var(--brand-primary);
  }
  .lt-jumbo-numeral-digit {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(180px, min(22vw, 38vh), 480px);
    line-height: 0.86;
    letter-spacing: -0.02em;
    color: var(--brand-primary);
  }
  .lt-jumbo-numeral-label {
    margin-top: clamp(8px, 1vh, 16px);
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: clamp(15px, 1.1vw, 18px);
    letter-spacing: var(--lt-track-wider);
    line-height: 1.2;
    color: var(--brand-primary);
  }
  .lt-jumbo-numeral-meta {
    margin-top: clamp(20px, 2.4vh, 36px);
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(17px, 1.2vw, 22px);
    line-height: 1.4;
    color: var(--brand-primary);
    max-width: 30ch;
    text-align: right;
  }
</style>
```
