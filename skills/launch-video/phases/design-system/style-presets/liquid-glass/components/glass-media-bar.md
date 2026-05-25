```html
<!-- 640×116 horizontal media/now-playing bar. High saturation glass; full-bleed feel. -->
<div id="glass-media" class="glass-panel media-panel liquid-glass"></div>
<div class="text-overlay media-text" style="top: 476px; left: 640px;">
  <div class="album-art" style="background: var(--brand-gradient);"></div>
  <div class="media-info">
    <div class="media-title">{TITLE}</div>
    <div class="media-artist">{SUBTITLE}</div>
  </div>
</div>
<style>
  .media-panel {
    width: 640px;
    height: 116px;
    background: rgba(255, 255, 255, 0.055);
    --lg-blur: 0.42;
    --lg-refraction: 0.92;
    --lg-corner-radius: 44;
    --lg-z-radius: 58;
    --lg-specular: 0.46;
    --lg-fresnel: 1.15;
    --lg-edge-highlight: 0.34;
    --lg-chrom-aberration: 0.08;
    --lg-saturation: 1.1;
  }
  .media-text {
    width: 640px;
    height: 116px;
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 0 24px;
    text-shadow: var(--text-shadow-glass);
  }
  .album-art {
    width: 78px;
    height: 78px;
    border-radius: 20px;
    flex-shrink: 0;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.28),
      0 12px 26px rgba(0, 0, 0, 0.24);
  }
  .media-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--ink-on-glass);
  }
  .media-artist {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink-on-glass-soft);
    margin-top: 2px;
  }
</style>
```
