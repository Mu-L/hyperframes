```html
<!-- 14px-tall solid-ink bar, 30% width. The full-stop punctuation after a manifesto headline.
     Heavier than a hairline rule — closer to a redaction bar. Mood: emphatic period. -->
<hr class="pp-divider-loud" />

<style>
  .pp-divider-loud {
    display: block;
    border: 0;
    height: 14px;
    width: 30%;
    background: var(--ink);
    margin: 60px 0 0;
  }
  /* On a blue/dark scene, the rule inverts to cream. */
  .pp-divider-loud.is-inverse {
    background: var(--canvas);
  }
</style>
```
