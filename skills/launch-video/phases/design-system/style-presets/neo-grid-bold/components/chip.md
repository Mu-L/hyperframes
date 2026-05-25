```html
<!-- Comparison/state pill — strict rectangle, 0 radius despite the name. Three
     state variants live as modifier classes: .yes (signal fill), .part (paper +
     ink hairline border), .no (ink fill, paper text). Mono uppercase body. -->
<span class="ng-chip ng-chip-yes">{LABEL}</span>

<style>
  .ng-chip {
    display: inline-block;
    padding: 6px 14px;
    font-family: var(--font-mono), "JetBrains Mono", monospace;
    font-size: 16px;
    letter-spacing: var(--track-mono);
    text-transform: uppercase;
    font-weight: 500;
    line-height: 1.3;
    border-radius: var(--radius, 0);
  }
  .ng-chip-yes {
    background: var(--signal-fill, var(--brand-primary));
    color: var(--ink);
  }
  .ng-chip-part {
    background: var(--canvas);
    color: var(--ink);
    border: var(--border-hairline);
  }
  .ng-chip-no {
    background: var(--ink);
    color: var(--canvas);
  }
</style>
```
