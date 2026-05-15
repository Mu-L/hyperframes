---
name: hyperframes-media
description: Asset preprocessing for HyperFrames compositions. Use for npx hyperframes tts, transcribe, remove-background, voice selection, Whisper model selection, transcript generation, transparent cutouts, and TTS to transcript to captions workflows.
---

# HyperFrames Media

This skill covers CLI commands that create assets used by compositions. For placing and animating those assets in HTML, use `hyperframes-core`, `hyperframes-captions`, or `hyperframes-creative`.

## Text To Speech

Generate local narration audio with Kokoro:

```bash
npx hyperframes tts "Text here" --voice af_heart --output narration.wav
npx hyperframes tts script.txt --voice bf_emma --output narration.wav
npx hyperframes tts --list
```

Voice guidance:

- Product demo: `af_heart`, `af_nova`
- Tutorial: `am_adam`, `bf_emma`
- Marketing: `af_sky`, `am_michael`
- Documentation: `bf_emma`, `bm_george`

For non-English text, pick a voice whose prefix matches the language. Use `--lang` only to override auto-detection.

## Transcription

Create normalized word timestamps:

```bash
npx hyperframes transcribe audio.mp3
npx hyperframes transcribe video.mp4 --model small --language es
npx hyperframes transcribe subtitles.srt
npx hyperframes transcribe subtitles.vtt
```

Language rule:

- Known English: `--model small.en`
- Known non-English: `--model small --language <code>`
- Unknown language: `--model small`

Do not use `.en` Whisper models unless the user explicitly says the audio is English. `.en` models translate non-English speech into English.

Output is a flat word array consumed by caption code:

```json
[
  { "id": "w0", "text": "Hello", "start": 0.0, "end": 0.5 },
  { "id": "w1", "text": "world.", "start": 0.6, "end": 1.2 }
]
```

## Background Removal

Create transparent overlays:

```bash
npx hyperframes remove-background subject.mp4 -o subject.webm
npx hyperframes remove-background portrait.jpg -o cutout.png
npx hyperframes remove-background subject.mp4 -o subject.webm --background-output plate.webm
```

Use `.webm` for Chrome playback in compositions, `.mov` for editing tools, and `.png` for still cutouts.

`--background-output` creates a hole-cut plate, not an inpainted clean plate. Use it when graphics should sit between the plate and the subject cutout.

## TTS To Captions

When no recorded voiceover exists:

```bash
npx hyperframes tts script.txt --voice af_heart --output narration.wav
npx hyperframes transcribe narration.wav
```

Then use `hyperframes-captions` to consume `transcript.json`.

## Requirements

These commands may download model files on first use. TTS requires Python packages used by the CLI; background removal and transcription require their respective local model runtimes. Run `npx hyperframes doctor` if commands fail because of missing environment dependencies.
