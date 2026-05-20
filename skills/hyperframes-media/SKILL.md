---
name: hyperframes-media
description: Asset preprocessing for HyperFrames compositions. Use for npx hyperframes tts, transcribe, remove-background, voice selection, Whisper model selection, transcript generation, transparent cutouts, background music generation via Google Lyria, and TTS to transcript to captions workflows.
---

# HyperFrames Media

This skill covers CLI commands that create assets used by compositions. For placing and animating those assets in HTML, use `hyperframes-core`, `hyperframes-captions`, or `hyperframes-creative`.

## Text To Speech

Generate local narration audio with Kokoro-82M. No API key, runs on-device. Default voice is `af_heart`.

```bash
npx hyperframes tts "Text here" --voice af_heart --output narration.wav
npx hyperframes tts script.txt --voice bf_emma --output narration.wav
npx hyperframes tts --list                            # all 54 voices
npx hyperframes tts "Slow and clear" --speed 0.8      # speech speed multiplier
```

### Voice Selection

| Content type      | Voice                  |
| ----------------- | ---------------------- |
| Product demo      | `af_heart`, `af_nova`  |
| Tutorial / how-to | `am_adam`, `bf_emma`   |
| Marketing / promo | `af_sky`, `am_michael` |
| Documentation     | `bf_emma`, `bm_george` |
| Casual / social   | `af_heart`, `af_sky`   |

Run `--list` for the full 54.

### Multilingual (voice prefix → language)

The first letter of the voice ID picks the phonemizer language; `--lang` is only needed to override auto-detection (e.g. English text in a French voice for a stylized accent).

| Prefix | Language             |
| ------ | -------------------- |
| `a`    | American English     |
| `b`    | British English      |
| `e`    | Spanish              |
| `f`    | French               |
| `h`    | Hindi                |
| `i`    | Italian              |
| `j`    | Japanese             |
| `p`    | Brazilian Portuguese |
| `z`    | Mandarin             |

```bash
npx hyperframes tts "La reunión empieza a las nueve" --voice ef_dora --output es.wav
npx hyperframes tts "今日はいい天気ですね" --voice jf_alpha --output ja.wav
```

Non-English phonemization requires `espeak-ng` system-wide (`brew install espeak-ng` / `apt-get install espeak-ng`).

### Speed

- `0.7-0.8` — tutorial, complex content, accessibility
- `1.0` — natural pace (default)
- `1.1-1.2` — intros, transitions, upbeat content
- `1.5+` — rarely appropriate, test carefully

### Long Scripts

Past a few paragraphs, write the text to a `.txt` file and pass the path. Inputs over ~5 minutes of speech may benefit from splitting into segments.

## Transcription

Create normalized word-level timestamps. **Always specify `--model` explicitly** — the CLI default is `small.en`, which silently translates non-English audio into English.

```bash
npx hyperframes transcribe audio.mp3  --model small.en             # known English
npx hyperframes transcribe video.mp4  --model small --language es  # known Spanish
npx hyperframes transcribe audio.mp3  --model small                # unknown language (auto-detect)
npx hyperframes transcribe subtitles.srt                           # import existing
npx hyperframes transcribe subtitles.vtt
npx hyperframes transcribe openai-response.json
```

### Language Rule (Non-Negotiable)

`.en` models (`tiny.en` / `base.en` / `small.en` / `medium.en`) **translate** non-English audio into English. This silently destroys the original language.

1. **Known English** → `--model small.en` (or `medium.en` for music / noisy audio)
2. **Known non-English** → `--model small --language <iso-code>` (no `.en` suffix)
3. **Unknown language** → `--model small` (whisper auto-detects)

**CLI default is `small.en`** — do not rely on it; always pass `--model` to make the choice explicit. `--language` also filters out non-target-language segments from mixed-language audio.

### Model Sizes

| Model      | Size   | Speed    | When                                  |
| ---------- | ------ | -------- | ------------------------------------- |
| `tiny`     | 75 MB  | Fastest  | Quick previews, smoke tests           |
| `base`     | 142 MB | Fast     | Short clips, clear audio              |
| `small`    | 466 MB | Moderate | Default for most multilingual content |
| `medium`   | 1.5 GB | Slow     | Music with vocals, noisy audio        |
| `large-v3` | 3.1 GB | Slowest  | Production quality                    |

### Output Shape

Compositions consume a flat array of word objects. The `id` (`w0`, `w1`, …) is added during normalization for stable references in caption overrides; optional for backwards compatibility.

```json
[
  { "id": "w0", "text": "Hello", "start": 0.0, "end": 0.5 },
  { "id": "w1", "text": "world.", "start": 0.6, "end": 1.2 }
]
```

For mandatory caption-quality checks, retry rules, and the OpenAI/Groq Whisper API import path, see the `hyperframes-captions` skill.

## Background Removal

Make a transparent overlay (typical: a talking head over an arbitrary scene). Uses `u2net_human_seg` (MIT).

```bash
npx hyperframes remove-background subject.mp4 -o transparent.webm          # default: VP9 + alpha
npx hyperframes remove-background subject.mp4 -o transparent.mov           # ProRes 4444 (editing)
npx hyperframes remove-background portrait.jpg -o cutout.png               # single-image cutout
npx hyperframes remove-background subject.mp4 -o subject.webm \
  --background-output plate.webm                                           # both layers, one pass
npx hyperframes remove-background subject.mp4 -o transparent.webm --device cpu
npx hyperframes remove-background --info                                   # detected providers
```

### Output Format

- **`.webm` (VP9 alpha)** — default. Plug straight into `<video>` for Chrome-native transparent playback (~1 MB / 4s @ 1080p).
- **`.mov` (ProRes 4444)** — round-trip in editors (Premiere / Resolve / DaVinci). ~50 MB / 4s.
- **`.png`** — single-image cutout.

### Quality (`--quality`)

Controls VP9 encoder CRF only — segmentation quality is fixed. Higher quality keeps the cutout's RGB closer to the source MP4 (important when overlaying the cutout on its own source).

| Preset     | CRF | When                                          |
| ---------- | --- | --------------------------------------------- |
| `fast`     | 30  | Iterating, smaller files, looser color match  |
| `balanced` | 18  | **Default**; visually identical for most uses |
| `best`     | 12  | Master / final delivery, tightest color match |

### Device (`--device`)

`auto` (default) picks CoreML on Apple Silicon, CUDA when available, otherwise CPU. Force with `--device cpu | coreml | cuda`. CUDA requires `HYPERFRAMES_CUDA=1` plus a GPU-enabled `onnxruntime-node` build. Use `--info` to inspect detected providers without rendering.

### Compositing patterns — pick the right one

The cutout WebM is a **re-encoded copy** of the source MP4's RGB. What sits behind it matters.

| Pattern                                                  | Behind the cutout                       | Result                                                                                                          |
| -------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Cutout over a different scene** (most common)          | Static image, gradient, unrelated video | Looks great. Single RGB source for the subject.                                                                 |
| **Cutout over its own source mp4** (text-behind-subject) | Same mp4 the cutout came from           | At `balanced` doubling is barely visible; at `fast` you'll see color shift / edge halo. Use `best` for masters. |
| **Cutout over a different take of the same person**      | Footage of the same subject             | **Two overlapping people. Don't do this.**                                                                      |

### Text-behind-subject pattern (two non-obvious rules)

Putting a headline behind a presenter cutout:

```html
<video
  src="presenter.mp4"
  id="bg"
  data-start="0"
  data-duration="6"
  data-track-index="0"
  muted
  playsinline
></video>

<h1 id="headline" style="z-index:2; ...">MAKE IT IN HYPERFRAMES</h1>

<div class="cutout-wrap" style="position:absolute; inset:0; z-index:3; opacity:0">
  <video
    src="presenter.webm"
    data-start="0"
    data-duration="6"
    data-track-index="1"
    muted
    playsinline
  ></video>
</div>
```

```js
// Flip the wrapper's opacity at the cut, NOT the video's
tl.set(".cutout-wrap", { opacity: 1 }, 3.3);
```

Two rules that are easy to miss:

1. **Wrap the cutout `<video>` in a non-timed `<div>` and animate the wrapper's opacity, not the video element's.** The framework forces `opacity: 1` on active clips (any element with `data-start` / `data-duration`), so animating the video's opacity directly is silently overridden. The wrapper has no `data-*` attributes, so it's owned by your CSS / GSAP.
2. **Both videos use `data-start="0"` and `data-media-start="0"`** so the framework decodes them in sync from t=0. Late-mounting the cutout (`data-start=3.3`) introduces a seek + warm-up that lands a frame off the base mp4 — visible as one frame of misalignment at the cut.

### Layer separation (`--background-output`)

Emits a **second** transparent video alongside the cutout: same source RGB, alpha is `255 - mask` instead of `mask`. The cutout has the subject opaque; the plate has the surroundings opaque (with a transparent hole where the subject was). Use it when text / graphics need to live **between** the two layers.

| File                             | Alpha is…                                               | Use it for                                                       |
| -------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `-o subject.webm`                | mask — subject opaque, background transparent           | Foreground layer (top)                                           |
| `--background-output plate.webm` | inverse mask — surroundings opaque, subject transparent | Bottom layer; place text / graphics between this and the subject |

Both share the same `--quality` and run from a single inference pass — only encode cost roughly doubles. Only valid for video inputs with `.webm` / `.mov` outputs.

**Hole-cut, not inpainted.** The subject region in `plate.webm` is fully transparent — composite something opaque under it to fill the hole.

### When `remove-background` is NOT the right tool

If a user asks for "the room **without** the person, displayed standalone" (no subject anywhere, no compositing on top), `--background-output` is wrong — its plate has a transparent hole, not a filled-in clean plate. They need an **inpainter**: LaMa, ProPainter, or E2FGVI. Tell them this command can't do it.

## Background Music

Generate original background music via Google Lyria RealTime. Unlike `tts` and `transcribe` above, there is no `npx hyperframes` wrapper — run the Python recipe in [references/background-music.md](./references/background-music.md) directly through Bash.

Requires `GOOGLE_API_KEY` and `pip install -q google-genai python-dotenv`. Output lands in `assets/bgm.wav` (HyperFrames serves `assets/`, not `public/`).

**`DURATION_SEC` must equal the total video duration.** Sum scene voice durations first:

```bash
total=$(for f in assets/voice/scene_*.wav; do
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"
done | paste -sd+ - | bc)
```

Place the generated track as a top-level `<audio>` clip in `index.html`; see `hyperframes-core/references/variables-and-media.md` for `<audio>` wiring and volume conventions (typically `data-volume="0.15"`–`"0.25"` under narration).

## TTS To Captions

When no recorded voiceover exists, generate one and transcribe it back for word-level caption timing:

```bash
npx hyperframes tts script.txt --voice af_heart --output narration.wav
npx hyperframes transcribe narration.wav --model small.en   # voice af_heart is American English
```

Whisper extracts precise word boundaries from the generated audio, so caption timing matches delivery without hand-tuning. Match `--model` to the voice's language (use `small.en` for `a`/`b` prefixes, `small --language <code>` otherwise). Then use `hyperframes-captions` to consume `transcript.json`.

## Requirements

Each command downloads its own model on first run and caches it under `~/.cache/hyperframes/`:

- **TTS** — Kokoro-82M (~311 MB) + voices (~27 MB) in `tts/`. Requires Python 3.8+ with `kokoro-onnx` and `soundfile` (`pip install kokoro-onnx soundfile`). Non-English text also needs `espeak-ng` system-wide.
- **Transcribe** — Whisper model size depending on choice (75 MB – 3.1 GB) in `whisper/`. Bundles `whisper.cpp`.
- **Remove-background** — `u2net_human_seg` (~168 MB ONNX) in `background-removal/models/`. Peak inference RAM ~1.5 GB.
- **Background Music** — Google Lyria RealTime API (cloud). Requires `GOOGLE_API_KEY` + `google-genai` Python package. No local model download; streamed over WebSocket.

Run `npx hyperframes doctor` if a command fails because of a missing dependency.
