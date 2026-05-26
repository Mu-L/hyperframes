```html
<!-- 6px cream-border rectangle, inset 48px from the scene edge. The "design within a design"
     — visual signal that a blue-fill scene is framed (poster-within-a-poster), not merely flooded.
     Worker positions this absolutely inside the scene; foreground content sits on top. -->
<div class="pp-inset-frame" aria-hidden="true"></div>

<style>
  .pp-inset-frame {
    position: absolute;
    inset: var(--frame-inset, 48px);
    border: var(--border-structural-inverse);
    pointer-events: none;
  }
  /* On a paper scene where the cream border would vanish, an inset frame should
     instead use the ink border. Worker toggles this. */
  .pp-inset-frame.is-on-paper {
    border: var(--border-structural);
  }
</style>
```
