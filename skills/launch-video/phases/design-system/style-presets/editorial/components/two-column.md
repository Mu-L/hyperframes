```html
<div class="ed-cols">
  <div>{LEFT}</div>
  <div>{RIGHT}</div>
</div>
<style>
  .ed-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .ed-cols {
      grid-template-columns: 1fr;
    }
  }
</style>
```
