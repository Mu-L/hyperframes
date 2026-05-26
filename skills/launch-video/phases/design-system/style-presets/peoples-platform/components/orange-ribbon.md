```html
<!-- Bottom-anchored 60px marquee strip. Orange fill, blue mono text at 0.22em,
     6px ink top border. Used on data-heavy scenes as a footer beat — repeated star-bullets,
     section names, or campaign slogans. -->
<div class="pp-orange-ribbon">
  <span class="pp-orange-ribbon-item">★ {LABEL}</span>
  <span class="pp-orange-ribbon-item">★ {LABEL}</span>
  <span class="pp-orange-ribbon-item">★ {LABEL}</span>
  <span class="pp-orange-ribbon-item">★ {LABEL}</span>
</div>

<style>
  .pp-orange-ribbon {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--ribbon-height, 60px);
    background: var(--brand-accent);
    border-top: var(--border-structural);
    display: flex;
    align-items: center;
    gap: 50px;
    overflow: hidden;
    padding-left: 90px;
    color: var(--brand-primary);
    font-family: "DM Mono", monospace;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.22em;
    line-height: 1;
    text-transform: uppercase;
  }
  .pp-orange-ribbon-item {
    white-space: nowrap;
  }
</style>
```
