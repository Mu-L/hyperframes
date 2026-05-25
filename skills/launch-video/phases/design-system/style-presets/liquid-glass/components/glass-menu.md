```html
<!--
  390×506 vertical menu, light-tinted glass (text reads dark). For dense
  popovers — context menus, settings panes, command palettes.
-->
<div id="glass-menu" class="glass-panel menu-panel liquid-glass"></div>
<div class="text-overlay menu-text" style="top: 270px; left: 800px;">
  <div class="menu-item"><span>{ITEM_1}</span><span class="menu-kbd">{KBD_1}</span></div>
  <div class="menu-item"><span>{ITEM_2}</span><span class="menu-kbd">{KBD_2}</span></div>
  <div class="menu-sep"></div>
  <div class="menu-item"><span>{ITEM_3}</span><span class="menu-kbd">{KBD_3}</span></div>
</div>
<style>
  .menu-panel {
    width: 390px;
    height: 506px;
    background: rgba(255, 255, 255, 0.15);
    --lg-blur: 0.56;
    --lg-refraction: 0.52;
    --lg-corner-radius: 30;
    --lg-z-radius: 48;
    --lg-specular: 0.26;
    --lg-fresnel: 1;
    --lg-edge-highlight: 0.2;
    --lg-chrom-aberration: 0.035;
    --lg-tint: 0.88;
    --lg-brightness: 0.54;
    --lg-saturation: -0.24;
  }
  .menu-text {
    width: 390px;
    height: 506px;
    display: flex;
    flex-direction: column;
    padding: 18px 0;
    border-radius: 30px;
    overflow: hidden;
  }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 28px;
    font-size: 18px;
    font-weight: 650;
    color: var(--ink-on-light-glass);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.26);
  }
  .menu-kbd {
    margin-left: auto;
    font-size: 14px;
    font-weight: 650;
    color: rgba(0, 7, 14, 0.82);
    font-variant-numeric: tabular-nums;
  }
  .menu-sep {
    height: 1px;
    margin: 10px 28px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.24), transparent);
  }
</style>
```
