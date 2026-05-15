# info, upgrade, compositions, docs, benchmark, telemetry, asset preprocessing

Catch-all reference for commands that don't fit the main dev loop.

## info, upgrade

```bash
npx hyperframes info         # version and environment details
npx hyperframes upgrade      # check for updates
```

`info` prints the installed HyperFrames version, Node version, OS, and resolved Chrome/FFmpeg paths — useful for bug reports.

## compositions, docs

```bash
npx hyperframes compositions          # list compositions in project
npx hyperframes docs                  # open documentation
```

`compositions` enumerates every `data-composition-id` found in the project, including those inside sub-composition files.

## benchmark

```bash
npx hyperframes benchmark .           # benchmark render performance
```

Times a render of the current project and reports frames-per-second per stage (compile, capture, encode). Use it to measure the effect of `--workers`, `--gpu`, or `--quality` on your machine.

## telemetry

```bash
npx hyperframes telemetry status      # show telemetry state
npx hyperframes telemetry disable     # disable anonymous usage telemetry
npx hyperframes telemetry enable      # re-enable telemetry
```

Telemetry is anonymous usage counters only. Disable globally with `HYPERFRAMES_NO_TELEMETRY=1` if env-var control is preferred over the subcommand.

## Asset Preprocessing

```bash
npx hyperframes tts
npx hyperframes transcribe
npx hyperframes remove-background
```

These produce assets (narration audio, word-level transcripts, transparent video) that get dropped into a composition. Each may download its own model on first run.

For voice selection, Whisper model rules, output format choice, and the TTS → transcript → captions chain, invoke the `hyperframes-media` skill. This skill stays focused on the dev loop.
