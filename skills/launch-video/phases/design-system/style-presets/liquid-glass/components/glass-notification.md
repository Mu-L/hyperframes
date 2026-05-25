```html
<!-- 520×118 floating toast. Slides in top-right. Pair with .notif-card text overlay. -->
<div id="glass-notif1" class="glass-panel notif-panel liquid-glass"></div>
<div class="text-overlay notif-card" style="top: 60px; left: 1340px;">
  <div class="notif-avatar" style="background: var(--brand-primary);">{INITIAL}</div>
  <div class="notif-body">
    <div class="notif-title">{TITLE}</div>
    <div class="notif-msg">{MESSAGE}</div>
  </div>
</div>
<style>
  .notif-panel {
    width: 520px;
    height: 118px;
    --lg-blur: 0.22;
    --lg-refraction: 0.6;
    --lg-corner-radius: 36;
    --lg-z-radius: 38;
    --lg-specular: 0.2;
    --lg-fresnel: 0.9;
    --lg-edge-highlight: 0.1;
    --lg-chrom-aberration: 0.05;
    --lg-shadow-opacity: 0.35;
    --lg-shadow-spread: 14;
    --lg-shadow-offset-y: 4;
    --lg-saturation: 0.25;
  }
  .notif-card {
    width: 520px;
    height: 118px;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--ink-on-glass);
    text-shadow: var(--text-shadow-glass);
  }
  .notif-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 18px;
    flex-shrink: 0;
  }
  .notif-body {
    flex: 1;
    min-width: 0;
  }
  .notif-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink-on-glass);
  }
  .notif-msg {
    font-size: 14px;
    font-weight: 550;
    color: var(--ink-on-glass-soft);
    margin-top: 2px;
  }
</style>
```
