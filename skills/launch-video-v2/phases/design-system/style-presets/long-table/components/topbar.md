```html
<!-- The system's universal section opener — Bricolage uppercase headline on the left + small italic Fraunces label-tag on the right, separated below by a 1.5px solid ink horizontal rule. The topbar-divider is the system's universal page-divider device. -->
<header class="lt-topbar">
  <h2 class="lt-topbar-headline">{HEADLINE}</h2>
  <span class="lt-topbar-label">{LABEL}</span>
</header>

<style>
  .lt-topbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: clamp(20px, 2vw, 36px);
    border-bottom: var(--lt-border-structural);
    padding-bottom: clamp(14px, 1.6vh, 24px);
    color: var(--brand-primary);
  }
  .lt-topbar-headline {
    margin: 0;
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    font-size: clamp(56px, min(6vw, 10vh), 120px);
    line-height: 0.9;
    letter-spacing: var(--lt-track-display);
    color: var(--brand-primary);
  }
  .lt-topbar-label {
    font-family: "Fraunces", Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(15px, 1.05vw, 18px);
    line-height: 1.4;
    color: var(--brand-primary);
    text-align: right;
  }
</style>
```
