# Background Music — Google Lyria Recipe

Full Python recipe for generating an original BGM track sized to a target video duration via Google Lyria RealTime. Referenced from the `## Background Music` section in `SKILL.md`.

## Generation script

```python
#!/usr/bin/env python3
"""Generate BGM using Google Lyria RealTime API."""

import asyncio
import os
import wave
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ── Configuration ────────────────────────────────────────
# Adjust these based on the brand mood and computed video duration.

PROMPT = "Uplifting corporate tech, bright and modern, gentle piano with synth pads"
NEGATIVE_PROMPT = "dark, horror, heavy metal, sad"  # or None
BPM = 110
DURATION_SEC = 45       # MUST equal sum of all scene voiceDuration values
BRIGHTNESS = 0.8        # 0-1, higher = brighter mood
DENSITY = 0.5           # 0-1, higher = more instrument layers
SCALE = "MAJOR"         # MAJOR, MINOR, PENTATONIC, etc. or None
OUTPUT_DIR = "./assets" # HyperFrames serves assets/, NOT public/

# ── Lyria client ─────────────────────────────────────────

SAMPLE_RATE = 48000
CHANNELS = 2
SAMPLE_WIDTH = 2  # 16-bit


async def generate_bgm() -> dict:
    from google import genai
    from google.genai import types

    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set.")

    client = genai.Client(
        api_key=api_key,
        http_options={"api_version": "v1alpha"},
    )

    out = Path(OUTPUT_DIR)
    out.mkdir(parents=True, exist_ok=True)
    wav_path = out / "bgm.wav"

    target_bytes = int(DURATION_SEC * SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH)

    cfg: dict = {"bpm": BPM, "temperature": 1.0}
    if DENSITY is not None:
        cfg["density"] = DENSITY
    if BRIGHTNESS is not None:
        cfg["brightness"] = BRIGHTNESS
    if SCALE is not None:
        scale_enum = getattr(types.Scale, SCALE, None)
        if scale_enum:
            cfg["scale"] = scale_enum

    prompts = [types.WeightedPrompt(text=PROMPT, weight=1.0)]
    if NEGATIVE_PROMPT:
        prompts.append(types.WeightedPrompt(text=NEGATIVE_PROMPT, weight=-1.0))

    buf = bytearray()
    timeout = DURATION_SEC + 8

    async with client.aio.live.music.connect(
        model="models/lyria-realtime-exp",
    ) as session:
        await session.set_weighted_prompts(prompts=prompts)
        await session.set_music_generation_config(
            config=types.LiveMusicGenerationConfig(**cfg),
        )
        await session.play()

        async def collect():
            while len(buf) < target_bytes:
                async for msg in session.receive():
                    sc = msg.server_content
                    if sc and sc.audio_chunks:
                        for chunk in sc.audio_chunks:
                            buf.extend(chunk.data)
                            if len(buf) >= target_bytes:
                                return
                await asyncio.sleep(1e-6)

        try:
            await asyncio.wait_for(collect(), timeout=timeout)
        except TimeoutError:
            print(f"Timeout after {timeout:.0f}s, collected {len(buf)} bytes")

    audio = bytes(buf[:target_bytes])
    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPLE_WIDTH)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio)

    actual_duration = len(audio) / (SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH)
    print(f"BGM saved to: {wav_path}")
    print(f"Duration: {actual_duration:.2f}s")
    return {"file": str(wav_path), "duration_sec": round(actual_duration, 2)}


asyncio.run(generate_bgm())
```

## Tuning constants

| Constant          | Guidance                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `PROMPT`          | Match brand tone: tech → modern synth; creative agency → playful beats. Always specify mood + instrumentation. |
| `NEGATIVE_PROMPT` | Styles to exclude. Set to `None` if not needed.                                                                |
| `BPM`             | 90-110 calm, 110-130 energetic, 130+ high-impact                                                               |
| `DURATION_SEC`    | MUST equal sum of all scene voice durations                                                                    |
| `BRIGHTNESS`      | ≥ 0.7 for promotional / upbeat content                                                                         |
| `DENSITY`         | Lower = sparser arrangement; higher = fuller mix                                                               |
| `SCALE`           | `MAJOR` (upbeat), `MINOR` (somber), `PENTATONIC` (folk), or `None`                                             |
| `OUTPUT_DIR`      | Keep as `./assets` — HyperFrames will not find files under `public/`                                           |
