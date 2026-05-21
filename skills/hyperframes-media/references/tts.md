# Text To Speech

Generate local narration audio with Kokoro-82M. No API key, runs on-device. Default voice is `af_heart`.

```bash
npx hyperframes tts "Text here" --voice af_heart --output narration.wav
npx hyperframes tts script.txt --voice bf_emma --output narration.wav
npx hyperframes tts --list                            # all 54 voices
npx hyperframes tts "Slow and clear" --speed 0.8      # speech speed multiplier
```

## Voice Selection

| Content type      | Voice                  |
| ----------------- | ---------------------- |
| Product demo      | `af_heart`, `af_nova`  |
| Tutorial / how-to | `am_adam`, `bf_emma`   |
| Marketing / promo | `af_sky`, `am_michael` |
| Documentation     | `bf_emma`, `bm_george` |
| Casual / social   | `af_heart`, `af_sky`   |

Run `--list` for the full 54.

## Multilingual (voice prefix → language)

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

## Speed

- `0.7-0.8` — tutorial, complex content, accessibility
- `1.0` — natural pace (default)
- `1.1-1.2` — intros, transitions, upbeat content
- `1.5+` — rarely appropriate, test carefully

## Long Scripts

Past a few paragraphs, write the text to a `.txt` file and pass the path. Inputs over ~5 minutes of speech may benefit from splitting into segments.
