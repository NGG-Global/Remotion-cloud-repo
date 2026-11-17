/**
 * Automated checks on a rendered Dark Pictures file.
 *
 *   node tools/dpa/qa.mjs [out/dpa/The_Dark_Pictures_Anthology_Documentary_720p.mp4]
 *
 * One decode pass at thumbnail size looks for black and frozen picture; the
 * audio is compared against the narration it was built from. Exits non-zero if
 * anything fails. Dark horror footage legitimately trips the black detector,
 * so those hits are listed for a look rather than failed outright.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  loadEdl,
  OUT_DIR,
  probe,
  ROOT,
  timecode,
  validateEdl,
} from "./lib.mjs";

const file =
  process.argv[2] ??
  path.join(OUT_DIR, "The_Dark_Pictures_Anthology_Documentary_720p.mp4");
const edl = loadEdl();
const narration = path.join(ROOT, "public", edl.narration);

const failures = [];
const review = [];
const check = (ok, message) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${message}`);
  if (!ok) {
    failures.push(message);
  }
};

// --- Timeline ---------------------------------------------------------------
const problems = validateEdl(edl);
check(
  problems.length === 0,
  `EDL is contiguous, fully sourced, no reused footage (${problems.length} problem(s))`,
);
problems.slice(0, 15).forEach((line) => console.log(`        ${line}`));

const lengths = edl.shots
  .map((shot) => (shot.to - shot.from) / edl.fps)
  .sort((a, b) => a - b);
const median = lengths[Math.floor(lengths.length / 2)];
console.log(
  `INFO  ${edl.shots.length} shots, median ${median.toFixed(1)}s, ` +
    `shortest ${lengths[0].toFixed(1)}s, longest ${lengths[lengths.length - 1].toFixed(1)}s`,
);

// --- Container --------------------------------------------------------------
const info = probe(file);
const source = probe(narration);
check(
  info.video?.codec === "h264",
  `video codec is H.264 (${info.video?.codec})`,
);
check(
  info.video?.width === edl.width && info.video?.height === edl.height,
  `resolution is ${edl.width}x${edl.height} (${info.video?.width}x${info.video?.height})`,
);
check(
  Math.abs((info.video?.fps ?? 0) - edl.fps) < 0.01,
  `frame rate is ${edl.fps} fps (${info.video?.fps})`,
);
check(
  info.video?.pixFmt === "yuv420p",
  `pixel format is yuv420p (${info.video?.pixFmt})`,
);
check(info.audio?.codec === "aac", `audio codec is AAC (${info.audio?.codec})`);
check(
  info.video?.frames === edl.total,
  `picture has every frame (${info.video?.frames} of ${edl.total})`,
);
check(
  Math.abs((info.audio?.duration ?? 0) - source.duration) < 0.08,
  `audio runs the full narration (${info.audio?.duration?.toFixed(2)}s of ${source.duration.toFixed(2)}s)`,
);

// --- Picture and sound, one pass --------------------------------------------
const detect = (input, withVideo) => {
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      input,
      ...(withVideo
        ? [
            "-vf",
            "scale=320:180,blackdetect=d=0.4:pic_th=0.98:pix_th=0.06,freezedetect=n=-55dB:d=1.5",
          ]
        : ["-vn"]),
      "-af",
      "silencedetect=noise=-45dB:d=1.5,ebur128=peak=true",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8", maxBuffer: 1 << 28 },
  );
  if (result.status !== 0) {
    console.error(result.stderr.slice(-2000));
    process.exit(1);
  }
  // FFmpeg reports on stderr.
  return result.stderr;
};

const lastNumber = (log, pattern) => {
  const all = [...log.matchAll(pattern)];
  return all.length ? Number(all[all.length - 1][1]) : NaN;
};

const parse = (log) => ({
  black: [...log.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map(
    (m) => [Number(m[1]), Number(m[2])],
  ),
  frozen: [
    ...log.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_end: ([\d.]+)/g),
  ].map((m) => [Number(m[1]), Number(m[2])]),
  silence: [
    ...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g),
  ].map((m) => [Number(m[1]) - Number(m[2]), Number(m[1])]),
  // The summary block comes last; the running readout precedes it.
  loudness: lastNumber(log, /I:\s+(-?[\d.]+) LUFS/g),
  peak: lastNumber(log, /Peak:\s+(-?[\d.]+) dBFS/g),
});

console.log("Scanning picture and sound...");
const out = parse(detect(file, true));
const ref = parse(detect(narration, false));

// Black is expected only where the edit dips to black on purpose.
const fades = edl.shots
  .filter((shot) => shot.transition === "fade")
  .map((shot) => shot.from / edl.fps)
  .concat([0, edl.total / edl.fps]);
// A planned dip to black is short. A long black stretch is a fault even if a
// fade happens to fall inside it.
const strayBlack = out.black.filter(
  ([a, b]) => b - a > 2.5 || !fades.some((t) => t > a - 1.2 && t < b + 1.2),
);
console.log(
  `INFO  black outside planned fades: ${strayBlack.length} interval(s)`,
);
for (const [a, b] of strayBlack) {
  const long = b - a > 2;
  (long ? failures : review).push(`black ${timecode(a)}-${timecode(b)}`);
  console.log(
    `        ${long ? "FAIL" : "LOOK"}  ${timecode(a)} - ${timecode(b)} (${(b - a).toFixed(1)}s)`,
  );
}

check(
  out.frozen.length === 0,
  `no frozen picture (${out.frozen.length} interval(s))`,
);
out.frozen.forEach(([a, b]) =>
  console.log(`        ${timecode(a)} - ${timecode(b)}`),
);

const silent = (list) => list.reduce((sum, [a, b]) => sum + (b - a), 0);
check(
  Math.abs(silent(out.silence) - silent(ref.silence)) < 1.5,
  `no silence the narration does not have (${silent(out.silence).toFixed(1)}s vs ${silent(ref.silence).toFixed(1)}s in the source)`,
);
check(
  Math.abs(out.loudness - ref.loudness) < 1.5,
  `loudness matches the narration (${out.loudness} vs ${ref.loudness} LUFS)`,
);
check(out.peak <= -0.5, `no clipping (true peak ${out.peak} dBFS)`);

console.log("");
if (review.length) {
  console.log(`${review.length} item(s) worth a look: ${review.join(", ")}`);
}
if (failures.length) {
  console.log(`${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("All checks passed.");
