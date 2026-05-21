# Requirements & Caches

Each command downloads its own model on first run and caches it under `~/.cache/hyperframes/`:

- **TTS** — Kokoro-82M (~311 MB) + voices (~27 MB) in `tts/`. Requires Python 3.8+ with `kokoro-onnx` and `soundfile` (`pip install kokoro-onnx soundfile`). Non-English text also needs `espeak-ng` system-wide.
- **Transcribe** — Whisper model size depending on choice (75 MB – 3.1 GB) in `whisper/`. Bundles `whisper.cpp`.
- **Remove-background** — `u2net_human_seg` (~168 MB ONNX) in `background-removal/models/`. Peak inference RAM ~1.5 GB.

Run `npx hyperframes doctor` if a command fails because of a missing dependency.
