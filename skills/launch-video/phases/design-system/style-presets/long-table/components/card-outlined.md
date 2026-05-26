```html
<!-- The system's primary content card — a 1.5px ink-outlined rectangle holding a card-top metadata row (separated below by a 1px @ 32% solid divider), a Bricolage card title, a Fraunces roman body description, and a meta-row at the bottom (separated above by a 1px @ 32% dashed divider). The solid-above / dashed-below divider rhythm is the system's signature card-internal device. Roman (non-italic) Fraunces is used for the body description — italic at small sizes hurts legibility. -->
<article class="lt-card-outlined">
  <div class="lt-card-outlined-top">
    <span class="lt-card-outlined-num">{KICKER}</span>
    <span class="lt-card-outlined-tag">{LABEL}</span>
  </div>
  <h3 class="lt-card-outlined-title">{HEADLINE}</h3>
  <p class="lt-card-outlined-desc">{LEDE}</p>
  <div class="lt-card-outlined-meta">
    <span class="lt-card-outlined-meta-left">{LEFT}</span>
    <span class="lt-card-outlined-meta-right">{RIGHT}</span>
  </div>
</article>

<style>
  .lt-card-outlined {
    display: flex;
    flex-direction: column;
    gap: var(--lt-gap-tight);
    padding: clamp(20px, 2vh, 32px) clamp(20px, 1.8vw, 30px);
    border: var(--lt-border-structural);
    border-radius: var(--lt-radius-flat);
    background: transparent;
    color: var(--brand-primary);
  }
  .lt-card-outlined-top {
    display: flex;
    align-items: center;
    gap: clamp(10px, 1vw, 16px);
    border-bottom: var(--lt-divider-solid);
    padding-bottom: clamp(10px, 1.2vh, 16px);
  }
  .lt-card-outlined-num,
  .lt-card-outlined-tag {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.05vw, 18px);
    line-height: 1;
    color: var(--brand-primary);
  }
  .lt-card-outlined-tag {
    margin-left: auto;
  }
  .lt-card-outlined-title {
    margin: 0;
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    font-size: clamp(28px, 2.4vw, 44px);
    line-height: 0.95;
    letter-spacing: var(--lt-track-tight);
    color: var(--brand-primary);
  }
  .lt-card-outlined-desc {
    margin: 0;
    flex: 1;
    font-family: "Fraunces", Georgia, serif;
    font-style: normal;
    font-weight: 400;
    font-size: clamp(15px, 1vw, 17px);
    line-height: 1.45;
    color: var(--brand-primary);
  }
  .lt-card-outlined-meta {
    display: flex;
    align-items: center;
    gap: clamp(10px, 1vw, 16px);
    margin-top: auto;
    border-top: var(--lt-divider-dashed);
    padding-top: clamp(10px, 1.2vh, 16px);
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(14px, 0.95vw, 16px);
    line-height: 1.4;
    color: var(--brand-primary);
  }
  .lt-card-outlined-meta-left {
    margin-right: auto;
  }
</style>
```
