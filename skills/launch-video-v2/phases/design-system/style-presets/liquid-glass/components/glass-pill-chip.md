```html
<!-- 130×36 status pill. Stack 3-5 in a row for "system state" beats. -->
<div id="glass-pill1" class="glass-panel pill-chip liquid-glass"></div>
<div class="text-overlay pill-text" style="top: 720px; left: 300px;">
  <span class="pill-dot" style="background: var(--brand-accent);"></span>
  <span class="pill-label">{LABEL}</span>
</div>
<style>
  .pill-chip {
    width: 130px;
    height: 36px;
    /* Widget archetype, pill-shape override on corner-radius. */
    --lg-blur: var(--lg-widget-blur);
    --lg-refraction: var(--lg-widget-refraction);
    --lg-corner-radius: 40; /* override: pill shape, not the 28px widget default */
    --lg-z-radius: var(--lg-widget-z-radius);
    --lg-specular: var(--lg-widget-specular);
    --lg-fresnel: var(--lg-widget-fresnel);
    --lg-edge-highlight: var(--lg-widget-edge-highlight);
    --lg-saturation: var(--lg-widget-saturation);
  }
  .pill-text {
    width: 130px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 40px;
    background: linear-gradient(130deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.1));
    border: 1px solid rgba(255, 255, 255, 0.34);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48);
  }
  .pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .pill-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-on-glass);
  }
</style>
```
