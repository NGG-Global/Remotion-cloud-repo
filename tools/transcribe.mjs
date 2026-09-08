/**
 * Transcribes a narration track to a timed script, for aligning animation to
 * the voice.
 *
 * Everything runs locally through whisper.cpp — the audio never leaves the
 * machine, which matters when the narration discusses internal material.
 *
 * Usage:
 *   node tools/transcribe.mjs public/audio/narration.mp3 [language]
 *
 * Writes <input>.transcript.json next to a working directory under .cache/asr,
 * containing one entry per sentence with its start and end time in seconds.
 *
 * Notes learned the hard way:
 *
 * - Pick the model to match the language. An English-only model (`*.en`) fed
 *   another language does not fail: it emits a fluent-looking English
 *   hallucination, often the same sentence repeated dozens of times.
 * - Do not enable `tokenLevelTimestamps` for a non-Latin script. whisper.cpp
 *   splits tokens mid-character, and the resulting JSON has U+FFFD where the
 *   bytes were cut. Sentence-level output is written intact.
 */

import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
} from "@remotion/install-whisper-cpp";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const WHISPER_VERSION = "1.5.5";
const CACHE = path.resolve(".cache/asr");

const input = process.argv[2];
const language = process.argv[3] ?? "he";

if (!input) {
  console.error("Usage: node tools/transcribe.mjs <audio file> [language]");
  process.exit(1);
}

// Hebrew and other non-Latin scripts need the multilingual large model; the
// medium multilingual model produces noticeably worse Hebrew.
const model = language === "en" ? "medium.en" : "large-v3";

fs.mkdirSync(CACHE, { recursive: true });
const whisperPath = path.join(CACHE, "whisper.cpp");
const wav = path.join(CACHE, "narration.16k.wav");

console.log("Preparing whisper.cpp...");
await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
await downloadWhisperModel({ folder: whisperPath, model });

// whisper.cpp only accepts 16 kHz mono PCM. Remotion ships its own ffmpeg, so
// there is no separate install to depend on.
console.log("Converting audio...");
execFileSync(
  "npx",
  ["remotion", "ffmpeg", "-i", input, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav, "-y"],
  { stdio: "ignore" },
);

console.log(`Transcribing (${model}, ${language})...`);
const result = await transcribe({
  inputPath: wav,
  whisperPath,
  whisperCppVersion: WHISPER_VERSION,
  model,
  language,
  tokenLevelTimestamps: false,
  printOutput: false,
  onProgress: (p) => process.stdout.write(`\r${Math.round(p * 100)}%   `),
});

const sentences = result.transcription
  .map((segment) => ({
    from: segment.offsets.from / 1000,
    to: segment.offsets.to / 1000,
    text: segment.text.trim(),
  }))
  .filter((s) => s.text.length > 0);

const out = `${input}.transcript.json`;
fs.writeFileSync(out, JSON.stringify(sentences, null, 2));
console.log(`\nWrote ${sentences.length} sentences to ${out}`);
