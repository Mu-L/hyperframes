```html
<table class="rg-comparison-table">
  <thead>
    <tr>
      <th>{LEFT}</th>
      <th>{RIGHT}</th>
      <!-- TODO: add additional <th> columns at build time when comparing
           3+ options. The first row is always ink-black header; subsequent
           rows alternate white / gray via :nth-child. -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{DO_1}</td>
      <td>{DONT_1}</td>
    </tr>
    <tr>
      <td>{DO_2}</td>
      <td>{DONT_2}</td>
    </tr>
    <tr>
      <td>{DO_3}</td>
      <td>{DONT_3}</td>
    </tr>
  </tbody>
</table>

<style>
  /*
    Comparison table with bordered cells, ink-black header row, and a
    gray zebra-stripe on even body rows. The 3px ink border IS the table
    grid — border-collapse:collapse forces cell borders to share edges.
    Header text is uppercase weight 800; body cells are sentence case
    weight 600. Hover-state highlight (sage on row hover) is omitted —
    the video has no interactive states.
  */
  .rg-comparison-table {
    width: 100%;
    border-collapse: collapse;
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      Helvetica,
      Arial,
      sans-serif;
    color: var(--ink);
  }
  .rg-comparison-table th {
    border: var(--rg-border);
    padding: var(--rg-pad-sm);
    background: var(--ink);
    color: var(--canvas);
    font-size: clamp(12px, 1.1vw, 14px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: left;
  }
  .rg-comparison-table td {
    border: var(--rg-border);
    padding: var(--rg-pad-sm);
    background: var(--canvas);
    font-size: clamp(14px, 1.2vw, 17px);
    font-weight: 600;
    line-height: 1.4;
    color: var(--ink);
  }
  .rg-comparison-table tr:nth-child(even) td {
    background: var(--rg-gray);
  }
</style>
```
