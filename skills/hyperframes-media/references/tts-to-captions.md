# TTS → Captions

When no recorded voiceover exists, generate one and transcribe it back for word-level caption timing:

```bash
npx hyperframes tts script.txt --voice af_heart --output narration.wav
npx hyperframes transcribe narration.wav --model small.en   # voice af_heart is American English
```

Whisper extracts precise word boundaries from the generated audio, so caption timing matches delivery without hand-tuning. Match `--model` to the voice's language (use `small.en` for `a`/`b` prefixes, `small --language <code>` otherwise). Then consume `transcript.json` via the caption references in `captions/`.
