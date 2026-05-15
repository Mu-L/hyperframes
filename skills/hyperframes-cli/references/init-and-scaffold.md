# init, capture, skills

Scaffolding commands. Use these instead of creating files by hand — they set up the right file structure, copy media, run transcription, and install AI coding skills.

## init

```bash
npx hyperframes init my-video                              # interactive wizard
npx hyperframes init my-video --example warm-grain         # pick an example
npx hyperframes init my-video --video clip.mp4             # with video file
npx hyperframes init my-video --audio track.mp3            # with audio file
npx hyperframes init my-video --example blank --tailwind   # with Tailwind v4 browser runtime
npx hyperframes init my-video --non-interactive            # skip prompts (CI/agents)
```

Templates: `blank`, `warm-grain`, `play-mode`, `swiss-grid`, `vignelli`, `decision-tree`, `kinetic-type`, `product-promo`, `nyt-graph`.

When using `--tailwind`, invoke the `hyperframes-tailwind` skill before editing classes or theme tokens. The scaffold uses Tailwind v4 browser runtime patterns, not Studio's Tailwind v3 setup.

When `--audio` is supplied, `init` can transcribe the file with Whisper. For voice/model selection see the `hyperframes-media` skill.

## capture

```bash
npx hyperframes capture https://stripe.com                  # scaffold from a website
npx hyperframes capture https://linear.app -o linear-video  # custom output directory
npx hyperframes capture https://example.com --json          # JSON output for agents
npx hyperframes capture https://example.com --skip-assets   # skip image/SVG download
npx hyperframes capture https://example.com --max-screenshots 12
npx hyperframes capture https://example.com --timeout 60000 # page-load timeout in ms
```

Captures a live URL as an editable HyperFrames project: screenshots become layered scenes, assets are downloaded locally, and the result is a normal project you can `lint` / `preview` / `render`. Use this when the user supplies a URL as the starting point for a video.

## skills

```bash
npx hyperframes skills    # install HyperFrames skills for AI coding tools
```

One-time setup that adds the HyperFrames skill pack (`hyperframes-core`, `-creative`, `-captions`, `-cli`, `-registry`, `-media`, `-tailwind`, `-gsap`) to the local AI coding environment so agents follow the framework conventions. Re-run after major HyperFrames upgrades.
