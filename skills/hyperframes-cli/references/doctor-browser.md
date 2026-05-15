# doctor, browser

Environment diagnosis and bundled-Chrome management. Run these first when a render or preview fails.

## doctor

```bash
npx hyperframes doctor
```

Checks the local environment and reports issues with:

- **Chrome / Chromium** — bundled or system, version, path.
- **FFmpeg** — found, version, codecs available.
- **Node.js** — version >= 22 required.
- **Memory** — available RAM, swap, ulimit.

Run `doctor` first when:

- `render` fails with a Chrome or FFmpeg error.
- `preview` opens but the composition fails to load.
- A fresh machine has never run HyperFrames.

Common issues:

- **Missing FFmpeg** — install via `brew install ffmpeg` (macOS) or your package manager.
- **Missing bundled Chrome** — run `npx hyperframes browser install`.
- **Low memory** — close other Chromes, reduce `--workers`, or use `--quality draft`.

## browser

```bash
npx hyperframes browser           # status of bundled Chrome
npx hyperframes browser install   # download/refresh the pinned Chrome version
```

Manage the Chrome build HyperFrames uses for rendering. The pinned version exists because pixel output drifts across Chrome versions — using the bundled build keeps rendered output reproducible across machines.
