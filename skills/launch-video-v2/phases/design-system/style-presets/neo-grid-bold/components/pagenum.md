```html
<!-- Persistent page-number tag, anchored bottom-left of every scene. Format is
     "01 / 12" — JetBrains Mono uppercase at 0.04em tracking. Three variants:
     default (paper), .invert (ink fill), .signal (signal fill). The variant is
     picked per scene to contrast with the lower-left panel underneath it. -->
<div class="ng-pagenum">01 / 12</div>

<style>
  .ng-pagenum {
    position: absolute;
    left: 0;
    bottom: 0;
    background: var(--canvas);
    color: var(--ink);
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 24px;
    padding: 14px 22px;
    letter-spacing: var(--track-mono-tight);
    text-transform: uppercase;
    border-radius: var(--radius, 0);
  }
  .ng-pagenum.ng-pagenum-invert {
    background: var(--ink);
    color: var(--canvas);
  }
  .ng-pagenum.ng-pagenum-signal {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
  }
</style>
```
