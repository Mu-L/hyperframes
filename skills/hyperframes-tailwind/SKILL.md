---
name: hyperframes-tailwind
description: Tailwind CSS v4 browser-runtime guidance for HyperFrames compositions. Use when editing projects created with hyperframes init --tailwind, writing Tailwind utility classes in composition HTML, adding CSS-first v4 theme tokens, or debugging Tailwind render readiness.
---

# HyperFrames Tailwind

HyperFrames `init --tailwind` uses the Tailwind browser runtime pinned by the scaffold. Treat it as Tailwind v4, not Studio's Tailwind v3 setup.

## When To Use

- The project was scaffolded with `npx hyperframes init --tailwind`.
- `index.html` contains `window.__tailwindReady`.
- The task asks for Tailwind utility classes, `@theme`, custom utilities, or v3-to-v4 fixes in a composition.
- Rendered frames have missing Tailwind styles or frame-0 flashes.

## Version Contract

- Do not replace the scaffolded runtime with `cdn.tailwindcss.com`.
- Keep the readiness shim deterministic; HyperFrames waits for `window.__tailwindReady`.
- For offline or locked-down renders, compile Tailwind to CSS and include the stylesheet directly.

## v4 Browser Runtime Rules

Tailwind v4 is CSS-first:

```html
<style type="text/tailwindcss">
  @theme {
    --color-brand: oklch(0.68 0.2 252);
    --font-display: "Inter", sans-serif;
  }

  @utility headline-balance {
    text-wrap: balance;
    letter-spacing: 0;
  }
</style>
```

Avoid v3-only patterns in browser-runtime compositions:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Do not add `tailwind.config.js` only for composition colors, fonts, spacing, or utilities. Use `@theme` and `@utility`.

## Composition Pattern

Use Tailwind for static layout and style. Keep render-critical timing in GSAP or another seekable HyperFrames adapter.

```html
<section
  id="hero"
  class="clip absolute inset-0 grid place-items-center bg-zinc-950 text-white"
  data-start="0"
  data-duration="5"
  data-track-index="1"
>
  <div class="w-[1280px] max-w-[82vw] text-center">
    <h1 class="text-7xl font-black leading-none text-balance">Render-ready Tailwind</h1>
  </div>
</section>
```

## Dynamic Class Safety

The browser runtime scans classes it can see. Do not build render-critical class names only at seek time:

```js
// Risky: the runtime may never see every generated class.
element.className = `bg-${color}-500`;
```

Prefer complete class tokens in HTML, data variants, or explicit CSS:

```html
<div data-tone="blue" class="bg-blue-500 data-[tone=rose]:bg-rose-500"></div>
```

## Validation

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect
```

If styles appear in preview but not render, confirm the runtime script is present and `window.__tailwindReady` resolves before capture.
