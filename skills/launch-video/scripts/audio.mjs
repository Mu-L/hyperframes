#!/usr/bin/env node
// Phase 2.5 — audio (deterministic replacement for the audio subagent).
//
// Reads:  narrator_scripts.json (Phase 2).
// Writes: hyperframes/assets/voice/scene_*.wav, hyperframes/assets/voice/scene_*_words.json,
//         ./audio_meta.json, and (eventually) hyperframes/assets/bgm.wav.
//
// Performance contract:
//   * Per-scene TTS is chained into per-scene transcribe (a scene's whisper run
//     starts the moment its own TTS finishes — does NOT wait for sibling scenes).
//   * BGM (Lyria) is spawned **detached** in parallel with voice work. This
//     script exits as soon as voice + transcribe are done; BGM keeps rendering
//     in the background. audio_meta.json sets `bgm_pending: true` so prep.mjs
//     trusts the path and Phase 4c does the final on-disk check before render.
//
// BGM prompt inference: the script reads concatenated `script` + `keyMessage`
// fields from narrator_scripts.json (no tokens.json side file — Phase 1
// web-research writes asset/section data into research/extraction.json which
// this script doesn't need). Override with --bgm-prompt "..." if the
// auto-inferred mood is wrong.
//
// Usage:
//   node audio.mjs \
//     --narrator-scripts ./narrator_scripts.json \
//     --hyperframes ./hyperframes \
//     --out ./audio_meta.json \
//     [--lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py] \
//     [--voice <id>] [--lang en] \
//     [--provider kokoro|elevenlabs] \
//     [--no-bgm] [--bgm-prompt "<custom prompt>"]

import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// ---------- argv ----------
const argv = process.argv.slice(2);
function flag(name, def) {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return def;
  if (i + 1 >= argv.length) return true;
  const v = argv[i + 1];
  return v.startsWith("--") ? true : v;
}
function die(msg) {
  console.error(`✗ audio.mjs: ${msg}`);
  process.exit(1);
}

const narratorPath = resolve(flag("narrator-scripts", "./narrator_scripts.json"));
const hyperframesDir = resolve(flag("hyperframes", "./hyperframes"));
const outPath = resolve(flag("out", "./audio_meta.json"));
const lyriaRecipe = flag("lyria-recipe") ? resolve(flag("lyria-recipe")) : null;
const userVoice = typeof flag("voice") === "string" ? flag("voice") : null;
const userBgmPrompt = typeof flag("bgm-prompt") === "string" ? flag("bgm-prompt") : null;
const noBgm = flag("no-bgm") === true;
const userProvider = typeof flag("provider") === "string" ? flag("provider") : null;
const lang = typeof flag("lang") === "string" ? flag("lang") : "en";

// ---------- Step 1: bootstrap hyperframes/ ----------
if (!existsSync(hyperframesDir)) {
  console.log(`hyperframes/ missing → npx hyperframes init ${hyperframesDir}`);
  const r = spawnSync(
    "npx",
    [
      "hyperframes",
      "init",
      hyperframesDir,
      "--example",
      "blank",
      "--non-interactive",
      "--skip-skills",
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) die("npx hyperframes init failed");
}
const voiceDir = join(hyperframesDir, "assets", "voice");
mkdirSync(voiceDir, { recursive: true });

// ---------- Step 2: read inputs ----------
if (!existsSync(narratorPath)) die(`narrator_scripts.json not found at ${narratorPath}`);
const narrator = JSON.parse(readFileSync(narratorPath, "utf8"));

const scenes = (narrator.scenes || []).map((s) => {
  const dm = String(s.estimatedDuration ?? "0").match(/[\d.]+/);
  return {
    sceneNumber: s.sceneNumber,
    sceneId: `scene_${s.sceneNumber}`,
    script: typeof s.script === "string" ? s.script : "",
    estimatedDuration: dm ? parseFloat(dm[0]) : 0,
  };
});
if (scenes.length === 0) die("no scenes in narrator_scripts.json");
for (const s of scenes) {
  if (!s.script.trim()) die(`${s.sceneId}: empty "script" field in narrator_scripts.json`);
}

// BGM-inference corpus: concatenate every scene's narrative metadata so we can
// look for category keywords (SaaS / crypto / creative / fintech / etc.) and
// pick a matching Lyria prompt. Replaces the old tokens.json-based inference.
const bgmInferenceBlob = (() => {
  const parts = [
    narrator.project || "",
    narrator.narrativeArchetype || "",
    narrator.emotionalArc || "",
  ];
  for (const s of narrator.scenes || []) {
    parts.push(s.sceneName || "");
    parts.push(s.script || "");
    if (s.narrativeIntent) {
      parts.push(s.narrativeIntent.narrativeRole || "");
      parts.push(s.narrativeIntent.keyMessage || "");
    }
  }
  return parts.join(" ").toLowerCase();
})();

// ---------- Step 3: provider detection ----------
function elevenlabsAvailable() {
  if (!process.env.ELEVENLABS_API_KEY) return false;
  const r = spawnSync("python3", ["-c", "import elevenlabs"], {
    stdio: "ignore",
  });
  return r.status === 0;
}

let provider = userProvider;
if (!provider) provider = elevenlabsAvailable() ? "elevenlabs" : "kokoro";
if (provider !== "kokoro" && provider !== "elevenlabs")
  die(`invalid --provider "${provider}" (must be kokoro or elevenlabs)`);
if (provider === "elevenlabs" && !process.env.ELEVENLABS_API_KEY)
  die("provider=elevenlabs but $ELEVENLABS_API_KEY is not set");

const voiceId =
  userVoice ||
  (provider === "elevenlabs"
    ? "21m00Tcm4TlvDq8ikWAM" // Rachel (ElevenLabs default)
    : lang === "en"
      ? "am_michael"
      : die(
          "Kokoro non-English path requires explicit --voice (see /hyperframes-media references/tts.md)",
        ));

// ---------- Step 4: write narration → /tmp/scene_<N>.txt ----------
for (const s of scenes) {
  writeFileSync(`/tmp/${s.sceneId}.txt`, s.script);
}

// ---------- Step 4b: pre-flight BGM-deps install (parallel with TTS) ----------
// MusicGen via HuggingFace transformers (no audiocraft / xformers / PyAV — those
// don't build cleanly on Apple Silicon). If Lyria won't be used and deps are
// missing, kick off pip install now so it runs in the background while TTS is
// generating. We await the result in Step 5b before deciding whether to spawn BGM.
const BGM_PY_DEPS = ["transformers", "torch", "soundfile"];
const BGM_PY_PROBE =
  "import transformers, soundfile, torch; from transformers import MusicgenForConditionalGeneration";
let bgmDepsInstallPromise = null;
if (!noBgm && !(process.env.GOOGLE_API_KEY && lyriaRecipe && existsSync(lyriaRecipe))) {
  const probe = spawnSync("python3", ["-c", BGM_PY_PROBE], { stdio: "ignore" });
  if (probe.status !== 0) {
    console.log(
      `BGM: deps missing → pip install ${BGM_PY_DEPS.join(" ")} (background, parallel with TTS)…`,
    );
    bgmDepsInstallPromise = new Promise((resolve) => {
      const proc = spawn("pip", ["install", "-q", ...BGM_PY_DEPS], { stdio: "ignore" });
      proc.on("exit", (code) => {
        if (code === 0) console.log("BGM: deps install complete ✓");
        else console.log(`BGM: deps install failed (exit ${code}) — BGM will be skipped`);
        resolve(code === 0);
      });
      proc.on("error", () => resolve(false));
    });
  }
}

// ---------- Step 5: BGM variables + helpers ----------
const bgmRelPath = "assets/bgm.wav";
const bgmAbsPath = join(hyperframesDir, bgmRelPath);
let bgmEnabled = false;
let bgmReason = "";
let bgmPid = null;

function bgmPyDepsAvailable() {
  const r = spawnSync("python3", ["-c", BGM_PY_PROBE], { stdio: "ignore" });
  return r.status === 0;
}

function inferBgmPrompt() {
  if (userBgmPrompt) return userBgmPrompt;
  const blob = bgmInferenceBlob;

  // --- Industry base ---
  let base, bpm;
  if (/\b(crypto|nft|web3|defi|token|blockchain|exchange|wallet|dao)\b/.test(blob)) {
    base = "atmospheric electronic, deep bass, futuristic synths, restrained percussion";
    bpm = 100;
  } else if (/\b(finance|fintech|bank|payment|invest|wealth|insurance|treasury)\b/.test(blob)) {
    base = "calm cinematic, soft strings, subtle piano, restrained percussion";
    bpm = 92;
  } else if (/\b(creative|agency|design|studio|art|brand|marketing|content)\b/.test(blob)) {
    base = "playful electronic, warm pads, light percussion";
    bpm = 115;
  } else {
    // default: SaaS / tech / platform
    base = "uplifting corporate tech, bright modern piano with synth pads";
    bpm = 108;
  }

  // --- Archetype adjusts arc shape ---
  const archetype = (narrator.narrativeArchetype || "").toLowerCase();
  const arc = (narrator.emotionalArc || "").toLowerCase();

  // PAS: starts tense, resolves → build from minor to major feel
  if (/\bpas\b|pain.agitate|pain.+solve/.test(archetype)) {
    return `${base}, starts with subtle tension then builds to resolution, BPM ${bpm}, transitions from MINOR to MAJOR`;
  }
  // BAB / Future Pacing: visionary, ascending energy
  if (/\bbab\b|before.after|future.pac|vision/.test(archetype)) {
    return `${base}, cinematic and aspirational, steady build with rising energy, BPM ${bpm}, MAJOR`;
  }
  // Feature Cascade: fast momentum, no dip
  if (/cascade|feature.benefit/.test(archetype)) {
    bpm = Math.min(bpm + 10, 128);
    return `${base}, energetic and driving, consistent momentum without slowdown, BPM ${bpm}, MAJOR`;
  }
  // Demo Loop: focused, clean, not distracting
  if (/demo.loop|question.+answer/.test(archetype)) {
    bpm = Math.max(bpm - 8, 88);
    return `${base}, clean and focused, minimal arrangement to not distract from UI demo, BPM ${bpm}`;
  }

  // --- Emotional arc as tiebreaker ---
  if (/frustrat|anxiety|overwhelm|tension/.test(arc) && /relief|excite|triumph/.test(arc)) {
    return `${base}, builds from understated tension to uplifting resolution, BPM ${bpm}, MINOR to MAJOR`;
  }
  if (/excit|awe|power|triumph/.test(arc)) {
    return `${base}, energetic and confident, uplifting throughout, BPM ${bpm}, MAJOR`;
  }
  if (/trust|ease|clarity|reassur/.test(arc)) {
    return `${base}, warm and reassuring, gentle momentum, BPM ${Math.max(bpm - 5, 85)}`;
  }

  return `${base}, BPM ${bpm}, MAJOR`;
}

// ---------- Step 6: per-scene chained TTS → transcribe (parallel across scenes) ----------
function spawnP(cmd, args, opts) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: "ignore", ...opts });
    p.on("exit", (code) => resolve({ status: code ?? -1 }));
    p.on("error", () => resolve({ status: -1 }));
  });
}

const ELEVENLABS_PY = `
import os, sys
from elevenlabs.client import ElevenLabs
from elevenlabs import save
client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
text = open(sys.argv[1]).read()
audio = client.text_to_speech.convert(
    text=text,
    voice_id=sys.argv[2],
    model_id="eleven_multilingual_v2",
    output_format="mp3_44100_128",
)
save(audio, sys.argv[3])
`;

async function ttsScene(s) {
  const txt = `/tmp/${s.sceneId}.txt`;
  const wavRel = `assets/voice/${s.sceneId}.wav`;
  if (provider === "kokoro") {
    const args = ["hyperframes", "tts", txt, "--voice", voiceId, "--output", wavRel];
    if (lang !== "en") args.push("--lang", lang);
    return spawnP("npx", args, { cwd: hyperframesDir });
  } else {
    const wavAbs = join(hyperframesDir, wavRel);
    return spawnP("python3", ["-c", ELEVENLABS_PY, txt, voiceId, wavAbs], {});
  }
}

async function transcribeScene(s) {
  // `npx hyperframes transcribe` writes a fixed `transcript.json` into its
  // --dir. Parallel scenes would collide if they all wrote into
  // hyperframes/assets/voice/transcript.json, so give each scene its own
  // throwaway --dir and move the result into the canonical name afterwards.
  const wavRel = `assets/voice/${s.sceneId}.wav`;
  const model = lang === "en" ? "small.en" : "small";
  const td = mkdtempSync(join(tmpdir(), `hf-trans-${s.sceneId}-`));
  const args = ["hyperframes", "transcribe", wavRel, "--model", model, "--dir", td];
  if (lang !== "en") args.push("--language", lang);
  const r = await spawnP("npx", args, { cwd: hyperframesDir });
  if (r.status === 0) {
    const src = join(td, "transcript.json");
    const dst = join(hyperframesDir, `assets/voice/${s.sceneId}_words.json`);
    if (existsSync(src)) {
      try {
        renameSync(src, dst);
      } catch {
        // cross-device fallback: read+write
        try {
          writeFileSync(dst, readFileSync(src));
        } catch {}
      }
    }
  }
  try {
    rmSync(td, { recursive: true, force: true });
  } catch {}
  return r;
}

async function runScene(s) {
  const tts = await ttsScene(s);
  if (tts.status !== 0) return { sceneId: s.sceneId, ttsOk: false };

  const trans = await transcribeScene(s);
  const wordsRel = `assets/voice/${s.sceneId}_words.json`;
  const wordsAbs = join(hyperframesDir, wordsRel);
  let wordsNonempty = false;
  if (trans.status === 0 && existsSync(wordsAbs)) {
    try {
      const arr = JSON.parse(readFileSync(wordsAbs, "utf8"));
      wordsNonempty = Array.isArray(arr) && arr.length > 0;
    } catch {
      wordsNonempty = false;
    }
  }
  return {
    sceneId: s.sceneId,
    ttsOk: true,
    voicePath: `assets/voice/${s.sceneId}.wav`,
    wordsPath: wordsNonempty ? wordsRel : "",
  };
}

console.log(`provider: ${provider}  voice: ${voiceId}  lang: ${lang}`);
console.log(`spawning ${scenes.length} TTS+transcribe pipelines in parallel…`);
const t0 = Date.now();
const results = await Promise.all(scenes.map(runScene));
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`voice work done in ${elapsed}s`);

// ---------- Step 5b: spawn BGM (after TTS — deps install may now be done) ----------
if (bgmDepsInstallPromise) {
  console.log("BGM: waiting for deps install to finish…");
  await bgmDepsInstallPromise;
}

if (noBgm) {
  bgmReason = "disabled by --no-bgm";
} else if (process.env.GOOGLE_API_KEY && lyriaRecipe && existsSync(lyriaRecipe)) {
  // Path A: Lyria (cloud)
  const totalS = scenes.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const prompt = inferBgmPrompt();
  const log = `/tmp/bgm-${Date.now()}.log`;
  console.log(`BGM: launching Lyria (detached) — prompt: "${prompt.slice(0, 70)}…"`);
  console.log(`     log: ${log}`);
  const fd = openSync(log, "w");
  const bgm = spawn(
    "python3",
    [
      lyriaRecipe,
      "--output",
      bgmAbsPath,
      "--duration",
      String(Math.max(1, totalS)),
      "--prompt",
      prompt,
    ],
    { detached: true, stdio: ["ignore", fd, fd] },
  );
  bgm.unref();
  closeSync(fd);
  bgmEnabled = true;
  bgmPid = bgm.pid;
} else if (bgmPyDepsAvailable()) {
  // Path B: MusicGen via HuggingFace transformers (local, free, no API key).
  // pip install transformers torch soundfile  →  facebook/musicgen-small (~300MB).
  // MusicGen emits ~50 codec frames per second, so max_new_tokens ≈ duration_s × 50.
  const totalS = scenes.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const prompt = inferBgmPrompt();
  const log = `/tmp/bgm-${Date.now()}.log`;
  console.log(
    `BGM: launching MusicGen via transformers (detached, local) — prompt: "${prompt.slice(0, 70)}…"`,
  );
  console.log(`     log: ${log}`);
  const fd = openSync(log, "w");
  const script = [
    "from transformers import MusicgenForConditionalGeneration, AutoProcessor",
    "import soundfile as sf",
    "processor = AutoProcessor.from_pretrained('facebook/musicgen-small')",
    "model = MusicgenForConditionalGeneration.from_pretrained('facebook/musicgen-small')",
    `inputs = processor(text=[${JSON.stringify(prompt)}], padding=True, return_tensors='pt')`,
    `audio = model.generate(**inputs, max_new_tokens=int(${Math.max(1, totalS)} * 50))`,
    "sr = model.config.audio_encoder.sampling_rate",
    `sf.write(${JSON.stringify(bgmAbsPath)}, audio[0, 0].cpu().numpy(), sr)`,
  ].join("; ");
  const bgm = spawn("python3", ["-c", script], {
    detached: true,
    stdio: ["ignore", fd, fd],
  });
  bgm.unref();
  closeSync(fd);
  bgmEnabled = true;
  bgmPid = bgm.pid;
} else {
  const depsHint = `pip install ${BGM_PY_DEPS.join(" ")}`;
  bgmReason = !process.env.GOOGLE_API_KEY
    ? `$GOOGLE_API_KEY not set; BGM deps not installed (${depsHint})`
    : `--lyria-recipe not provided; BGM deps not installed (${depsHint})`;
}

// ---------- Step 7: ffprobe durations + assemble audio_meta.json ----------
function ffprobeDuration(path) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
    { encoding: "utf8" },
  );
  if (r.status !== 0) return NaN;
  return parseFloat(r.stdout.trim());
}

const scenesMap = {};
const failedScenes = [];
let totalDuration = 0;
for (const r of results) {
  if (!r.ttsOk) {
    failedScenes.push(r.sceneId);
    continue;
  }
  const dur = ffprobeDuration(join(hyperframesDir, r.voicePath));
  if (!isFinite(dur) || dur <= 0) {
    failedScenes.push(r.sceneId);
    continue;
  }
  scenesMap[r.sceneId] = {
    voicePath: r.voicePath,
    voiceDuration: parseFloat(dur.toFixed(3)),
    wordsPath: r.wordsPath,
  };
  totalDuration += dur;
}

const audioMeta = {
  tts_provider: provider,
  voice_id: voiceId,
  bgm_enabled: bgmEnabled,
  bgm_path: bgmEnabled ? bgmRelPath : null,
  bgm_pending: bgmEnabled && !existsSync(bgmAbsPath),
  total_duration_s: parseFloat(totalDuration.toFixed(3)),
  scenes: scenesMap,
};

writeFileSync(outPath, JSON.stringify(audioMeta, null, 2));

if (Object.keys(scenesMap).length === 0) {
  console.error(
    `✗ audio.mjs: zero scenes got voice — wrote audio_meta.json with empty scenes map for orchestrator to decide`,
  );
  process.exit(1);
}

// ---------- Step 8: summary ----------
console.log(`\n✓ wrote ${outPath}`);
console.log(`  provider: ${provider}  voice: ${voiceId}`);
console.log(`  scenes voiced: ${Object.keys(scenesMap).length}/${scenes.length}`);
const transcribed = Object.values(scenesMap).filter((s) => s.wordsPath).length;
console.log(`  scenes transcribed: ${transcribed}/${Object.keys(scenesMap).length}`);
console.log(`  total voice duration: ${audioMeta.total_duration_s}s`);
if (bgmEnabled) {
  const bgmBackend =
    process.env.GOOGLE_API_KEY && lyriaRecipe && existsSync(lyriaRecipe)
      ? "Lyria"
      : "MusicGen via transformers (local)";
  console.log(`  bgm: launched via ${bgmBackend} pid=${bgmPid} (detached, → ${bgmRelPath})`);
  if (audioMeta.bgm_pending) {
    console.log(`       bgm_pending=true; downstream phases re-check disk before emitting <audio>`);
  } else {
    console.log(`       bgm.wav already on disk`);
  }
} else {
  console.log(`  bgm: disabled (${bgmReason})`);
}
if (failedScenes.length) {
  console.log(
    `\nfailed scenes (omitted from audio_meta — Phase 4a falls back to estimatedDuration):`,
  );
  for (const id of failedScenes) console.log(`  - ${id}`);
}
