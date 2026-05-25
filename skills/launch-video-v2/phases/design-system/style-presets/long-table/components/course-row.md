```html
<!-- Course / menu row — a 64px / 1fr / auto grid row with a 1px @ 32% solid border-bottom. Holds a Fraunces italic numeral, an item (Bricolage uppercase name + Fraunces italic description), and a Fraunces italic pairing tag at the right. The menu / programme pattern. -->
<div class="lt-course-row">
  <span class="lt-course-row-num">{KICKER}</span>
  <div class="lt-course-row-item">
    <span class="lt-course-row-name">{HEADLINE}</span>
    <span class="lt-course-row-desc">{LEDE}</span>
  </div>
  <span class="lt-course-row-pair">{RIGHT}</span>
</div>

<style>
  .lt-course-row {
    display: grid;
    grid-template-columns: 64px 1fr auto;
    gap: clamp(14px, 1.4vw, 28px);
    align-items: center;
    padding: clamp(14px, 1.6vh, 24px) 0;
    border-bottom: var(--lt-divider-solid);
    color: var(--brand-primary);
  }
  .lt-course-row-num {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(16px, 1.1vw, 20px);
    line-height: 1;
    color: var(--brand-primary);
  }
  .lt-course-row-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .lt-course-row-name {
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: clamp(20px, 1.5vw, 28px);
    line-height: 1.05;
    letter-spacing: var(--lt-track-tight);
    color: var(--brand-primary);
  }
  .lt-course-row-desc {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1vw, 17px);
    line-height: 1.4;
    color: var(--brand-primary);
    max-width: 60ch;
  }
  .lt-course-row-pair {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(14px, 0.95vw, 16px);
    line-height: 1;
    color: var(--lt-ink-78);
    text-align: right;
    white-space: nowrap;
  }
</style>
```
