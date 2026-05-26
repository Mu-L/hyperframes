```html
<!-- 220×220 stat card. Use up to 3 in a row. Pair each with a .stat-text overlay. -->
<div id="glass-stat1" class="glass-panel widget-card liquid-glass"></div>
<div class="text-overlay stat-text" style="top: 300px; left: 200px;">
  <span class="stat-label">{LABEL}</span>
  <span class="stat-value">{NUM}</span>
</div>
<style>
  .widget-card {
    width: 220px;
    height: 220px;
    --lg-blur: 0.42;
    --lg-refraction: 0.82;
    --lg-corner-radius: 28;
    --lg-z-radius: 46;
    --lg-specular: 0.34;
    --lg-fresnel: 1.25;
    --lg-edge-highlight: 0.26;
    --lg-chrom-aberration: 0.08;
    --lg-shadow-opacity: 0;
    --lg-saturation: 0.38;
  }
  .stat-text {
    width: 220px;
    height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 22px;
    border-radius: 28px;
    background:
      linear-gradient(
        150deg,
        rgba(255, 255, 255, 0.28),
        rgba(255, 255, 255, 0.06) 46%,
        rgba(255, 255, 255, 0.16)
      ),
      linear-gradient(180deg, rgba(9, 18, 31, 0.2), rgba(255, 255, 255, 0.04));
    border: 1px solid rgba(255, 255, 255, 0.36);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 -18px 38px rgba(255, 255, 255, 0.08);
    overflow: hidden;
    text-shadow: var(--text-shadow-glass);
  }
  .stat-label {
    font-size: 14px;
    font-weight: 650;
    color: var(--ink-on-glass);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .stat-value {
    font-size: 52px;
    font-weight: 700;
    color: var(--ink-on-glass);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
</style>
```
