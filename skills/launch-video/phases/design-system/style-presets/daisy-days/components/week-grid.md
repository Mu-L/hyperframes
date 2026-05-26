```html
<!-- A 5-column grid of small framed-header cards. Used for any "five-item
     parallel" content beat (a week, five steps, five features). Each card
     has a pastel cap rotating through the marker palette; body is white. -->
<div class="dc-week">
  <div class="dc-week-card">
    <div class="dc-week-cap dc-week-cap--1">{LABEL}</div>
    <div class="dc-week-body">
      <ul>
        <li>{LEFT}</li>
        <li>{RIGHT}</li>
      </ul>
    </div>
  </div>
  <div class="dc-week-card">
    <div class="dc-week-cap dc-week-cap--2">{LABEL}</div>
    <div class="dc-week-body">
      <ul>
        <li>{LEFT}</li>
        <li>{RIGHT}</li>
      </ul>
    </div>
  </div>
  <div class="dc-week-card">
    <div class="dc-week-cap dc-week-cap--3">{LABEL}</div>
    <div class="dc-week-body">
      <ul>
        <li>{LEFT}</li>
        <li>{RIGHT}</li>
      </ul>
    </div>
  </div>
  <div class="dc-week-card">
    <div class="dc-week-cap dc-week-cap--4">{LABEL}</div>
    <div class="dc-week-body">
      <ul>
        <li>{LEFT}</li>
        <li>{RIGHT}</li>
      </ul>
    </div>
  </div>
  <div class="dc-week-card">
    <div class="dc-week-cap dc-week-cap--5">{LABEL}</div>
    <div class="dc-week-body">
      <ul>
        <li>{LEFT}</li>
        <li>{RIGHT}</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .dc-week {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.8rem;
    width: 100%;
    max-width: 56vw;
  }
  .dc-week-card {
    background: var(--canvas);
    border: var(--border-bold);
    border-radius: var(--radius-card);
    overflow: hidden;
    box-shadow: var(--shadow-small);
  }
  .dc-week-cap {
    padding: 0.6rem 0.4rem;
    text-align: center;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.15;
    color: var(--ink);
    border-bottom: var(--border-bold);
  }
  .dc-week-cap--1 {
    background: color-mix(in srgb, var(--brand-secondary) 45%, #f7c8d4);
  }
  .dc-week-cap--2 {
    background: color-mix(in srgb, var(--brand-primary) 40%, #a8e6cf);
  }
  .dc-week-cap--3 {
    background: var(--brand-accent);
    color: var(--canvas);
  }
  .dc-week-cap--4 {
    background: color-mix(in srgb, var(--brand-secondary) 45%, #fde68a);
  }
  .dc-week-cap--5 {
    background: color-mix(in srgb, var(--brand-primary) 45%, #d4a5e8);
  }
  .dc-week-body {
    padding: 0.8rem 1rem;
  }
  .dc-week-body ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .dc-week-body li {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.85rem;
    line-height: 1.4;
    padding-left: 0.8rem;
    position: relative;
    color: var(--ink);
  }
  .dc-week-body li::before {
    content: "—";
    position: absolute;
    left: 0;
    color: color-mix(in srgb, var(--ink) 50%, transparent);
  }
</style>
```
