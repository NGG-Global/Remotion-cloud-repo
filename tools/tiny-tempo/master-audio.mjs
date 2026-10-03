#!/usr/bin/env node
/*
 * Lifts a rendered trailer's audio to a delivery loudness, leaving the picture alone.
 *
 * The render keeps the title theme at the level it was delivered, about -21 LUFS, which is
 * where the game plays it. Platforms turn loud uploads down but do not turn quiet ones up,
 * so a delivery file is raised to TARGET with true peaks held under CEILING by a limiter
 * that only touches the few transients the gain pushes over. The video stream is copied.
 *
 *   node tools/tiny-tempo/master-audio.mjs out/tiny-tempo-trailer.mp4 [out/...-master.mp4]
 */
import { spawnSync } from "node:child_process";

const TARGET = -16; // LUFS integrated
const CEILING = -1; // dBTP

const [input, output = input.replace(/\.mp4$/, "-master.mp4")] =
  process.argv.slice(2);
if (!input) {
  console.error("usage: master-audio.mjs <in.mp4> [out.mp4]");
  process.exit(1);
}

const measure = (file, filter = "") => {
  const run = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      file,
      "-vn",
      "-af",
      `${filter}${filter ? "," : ""}ebur128=peak=true`,
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  const text = run.stderr.slice(run.stderr.lastIndexOf("Summary:"));
  const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(text)?.[1]);
  const peak = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(text)?.[1]);
  if (!Number.isFinite(lufs) || !Number.isFinite(peak))
    throw new Error(`could not measure ${file}`);
  return { lufs, peak };
};

const chain = (gain) =>
  `volume=${gain.toFixed(2)}dB,alimiter=limit=${(10 ** ((CEILING - 1) / 20)).toFixed(4)}:attack=4:release=60:level=false`;

const before = measure(input);
// The limiter takes a little of the level it is given; one correction pass makes up for it.
let gain = TARGET - before.lufs;
const trial = measure(input, chain(gain));
gain += TARGET - trial.lufs;

const run = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-c:v",
    "copy",
    "-af",
    chain(gain),
    "-c:a",
    "aac",
    "-b:a",
    "256k",
    "-ar",
    "48000",
    "-movflags",
    "+faststart",
    output,
  ],
  { stdio: "inherit" },
);
if (run.status !== 0) throw new Error("ffmpeg failed");
const after = measure(output);
console.log(
  `${input}: ${before.lufs} LUFS, peak ${before.peak} dBFS -> ${output}: ${after.lufs} LUFS, peak ${after.peak} dBFS (gain ${gain.toFixed(1)} dB)`,
);
