/**
 * Renders the Dark Pictures documentary in cached segments and assembles the
 * delivery file.
 *
 *   node tools/dpa/render.mjs                 full film
 *   node tools/dpa/render.mjs --from 300 --to 330   validation excerpt
 *   node tools/dpa/render.mjs --allow-pending       render with unsourced shots black
 *
 * How it stays fast:
 *
 * - The timeline is one Remotion composition. A segment is just a frame range
 *   of it, so transitions that cross a segment boundary come out right.
 * - Each segment's file name carries a hash of the shots, clips and encoder
 *   settings behind it. An unchanged segment is reused; a changed shot costs
 *   one segment, not the film.
 * - Segments are rendered muted with identical encoder settings and joined by
 *   stream copy. The audio is mixed and encoded once, then muxed without
 *   touching the picture, so the narration is never cut at a segment join.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  CLIPS_PATH,
  FOOTAGE_DIR,
  loadEdl,
  OUT_DIR,
  probe,
  readJson,
  ROOT,
  sha,
  timecode,
  validateEdl,
} from "./lib.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) =>
  args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : fallback;

const COMPOSITION = "DarkPictures";
const FINAL_NAME = "The_Dark_Pictures_Anthology_Documentary_720p.mp4";
const SEGMENT_SECONDS = 60;

const crf = Number(option("crf", 21));
const preset = option("preset", "veryfast");
// Rendering is bound by video decoding in the browser and x264 together. One
// worker per core is slower than leaving a core for the encoder.
const concurrency = Number(
  option("concurrency", Math.max(1, os.cpus().length - 1)),
);
const allowPending = flag("allow-pending");
const rangeFrom = option("from", null);
const rangeTo = option("to", null);
const excerpt = rangeFrom !== null || rangeTo !== null;

const edl = loadEdl();
const clips = readJson(CLIPS_PATH);

const problems = validateEdl(edl, { allowPending });
for (const shot of edl.shots) {
  if (shot.source !== null && !clips[shot.id]) {
    problems.push(
      `${shot.id} is sourced but not prepared. Run tools/dpa/prep.mjs.`,
    );
  }
}
if (problems.length) {
  console.error(
    `The EDL is not ready to render (${problems.length} problem(s)):`,
  );
  for (const line of problems.slice(0, 40)) {
    console.error(`  - ${line}`);
  }
  if (problems.length > 40) {
    console.error(`  ... and ${problems.length - 40} more`);
  }
  process.exit(1);
}

// --- Segment plan -----------------------------------------------------------
// Cut at shot boundaries, at every chapter change and at least every minute.
const segments = [];
let open = null;
for (const shot of edl.shots) {
  const fresh =
    !open ||
    shot.chapter !== open.chapter ||
    (shot.from - open.from) / edl.fps >= SEGMENT_SECONDS;
  if (fresh) {
    if (open) {
      open.to = shot.from;
    }
    open = { from: shot.from, to: edl.total, chapter: shot.chapter };
    segments.push(open);
  }
}

const settings = {
  crf,
  preset,
  w: edl.width,
  h: edl.height,
  fps: edl.fps,
  v: 3,
};
for (const segment of segments) {
  // Everything on screen during the segment, including a neighbour that is
  // only present for a transition.
  const involved = edl.shots
    .filter((shot) => shot.mount < segment.to && shot.to > segment.from)
    .map((shot) => [
      shot.id,
      shot.mount,
      shot.from,
      shot.to,
      shot.transition,
      shot.transitionFrames ?? null,
      clips[shot.id]?.file ?? null,
    ]);
  const next = edl.shots.find((shot) => shot.from === segment.to);
  segment.hash = sha(
    JSON.stringify([involved, next?.transition ?? null, segment, settings]),
  );
  segment.file = path.join(
    OUT_DIR,
    "segments",
    `${String(segment.from).padStart(6, "0")}-${segment.hash}.mp4`,
  );
}

const wanted = segments.filter((segment) => {
  const a = segment.from / edl.fps;
  const b = segment.to / edl.fps;
  return (
    (rangeFrom === null || b > Number(rangeFrom)) &&
    (rangeTo === null || a < Number(rangeTo))
  );
});
const stale = wanted.filter((segment) => !fs.existsSync(segment.file));
console.log(
  `${segments.length} segment(s) in the film, ${wanted.length} requested, ` +
    `${stale.length} to render (concurrency ${concurrency}, crf ${crf}, ${preset})`,
);

fs.mkdirSync(path.join(OUT_DIR, "segments"), { recursive: true });
const run = (command, commandArgs) => {
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`${command} exited with ${result.status}`);
    process.exit(result.status ?? 1);
  }
};

// --- Picture ----------------------------------------------------------------
if (stale.length) {
  const bundle = path.join(OUT_DIR, "bundle");
  console.log("Bundling...");
  run("npx", ["remotion", "bundle", "--out-dir", bundle, "--log", "error"]);

  const started = Date.now();
  let frames = 0;
  for (const [i, segment] of stale.entries()) {
    const temp = `${segment.file}.part.mp4`;
    const t0 = Date.now();
    run("npx", [
      "remotion",
      "render",
      bundle,
      COMPOSITION,
      temp,
      `--frames=${segment.from}-${segment.to - 1}`,
      "--muted",
      "--codec=h264",
      `--crf=${crf}`,
      `--x264-preset=${preset}`,
      // PNG frames with an explicit BT.709 conversion. JPEG frames are quicker
      // to capture, but Remotion then tags BT.601 data as BT.709 and every
      // colour shifts; its default writes untagged full-range video instead.
      "--color-space=bt709",
      "--image-format=png",
      `--concurrency=${concurrency}`,
      "--log=error",
    ]);
    fs.renameSync(temp, segment.file);
    const count = segment.to - segment.from;
    frames += count;
    const seconds = (Date.now() - t0) / 1000;
    console.log(
      `  [${i + 1}/${stale.length}] ${timecode(segment.from / edl.fps)}-` +
        `${timecode(segment.to / edl.fps)}  ${count} frames in ${seconds.toFixed(0)}s ` +
        `(${(count / seconds).toFixed(1)} fps)`,
    );
  }
  const total = (Date.now() - started) / 1000;
  console.log(
    `Rendered ${frames} frames in ${total.toFixed(0)}s (${(frames / total).toFixed(1)} fps overall)`,
  );
}

// Segments nothing refers to any more are dropped.
if (!excerpt) {
  const keep = new Set(segments.map((segment) => path.basename(segment.file)));
  for (const file of fs.readdirSync(path.join(OUT_DIR, "segments"))) {
    if (!keep.has(file)) {
      fs.rmSync(path.join(OUT_DIR, "segments", file));
    }
  }
}

// --- Join, by stream copy ---------------------------------------------------
const startSeconds = wanted[0].from / edl.fps;
const endSeconds = wanted[wanted.length - 1].to / edl.fps;
const list = path.join(OUT_DIR, "concat.txt");
fs.writeFileSync(
  list,
  wanted
    .map((segment) => `file '${segment.file.replace(/'/g, "'\\''")}'`)
    .join("\n") + "\n",
);
const picture = path.join(
  OUT_DIR,
  excerpt ? "excerpt.video.mp4" : "picture.mp4",
);
run("ffmpeg", [
  "-v",
  "error",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  list,
  "-c",
  "copy",
  // Complete the colour tags in the bitstream; no re-encode.
  "-bsf:v",
  "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
  "-y",
  picture,
]);

// --- Audio: narration, plus any game ambience ducked beneath it -------------
const narration = path.join(ROOT, "public", edl.narration);
const ambient = edl.shots.filter(
  (shot) =>
    typeof shot.gain === "number" &&
    shot.source !== null &&
    probe(path.join(FOOTAGE_DIR, shot.source)).audio,
);
const audioKey = sha(
  JSON.stringify([
    fs.statSync(narration).size,
    ambient.map((shot) => [
      shot.source,
      shot.in,
      shot.from,
      shot.to,
      shot.gain,
    ]),
    "v1",
  ]),
);
const audio = path.join(OUT_DIR, `audio-${audioKey}.m4a`);
if (!fs.existsSync(audio)) {
  const inputs = ["-i", narration];
  const graph = [];
  if (!ambient.length) {
    graph.push("[0:a]aformat=channel_layouts=stereo[out]");
  } else {
    ambient.forEach((shot, i) => {
      const length = (shot.to - shot.from) / edl.fps;
      const fade = Math.min(0.5, length / 3);
      inputs.push(
        "-ss",
        String(shot.in),
        "-t",
        length.toFixed(3),
        "-i",
        path.join(FOOTAGE_DIR, shot.source),
      );
      graph.push(
        `[${i + 1}:a]aresample=44100,aformat=channel_layouts=stereo,` +
          `volume=${shot.gain}dB,afade=t=in:d=${fade},` +
          `afade=t=out:st=${(length - fade).toFixed(3)}:d=${fade},` +
          `adelay=${Math.round((shot.from / edl.fps) * 1000)}:all=1[a${i}]`,
      );
    });
    const beds = ambient.map((_, i) => `[a${i}]`).join("");
    graph.push(
      `${beds}amix=inputs=${ambient.length}:normalize=0:duration=longest[bed]`,
      "[0:a]aformat=channel_layouts=stereo,asplit[voice][key]",
      // The bed drops out of the way whenever the narrator is speaking.
      "[bed][key]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=450[ducked]",
      "[voice][ducked]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89[out]",
    );
  }
  const script = path.join(OUT_DIR, "audio.filter");
  fs.writeFileSync(script, graph.join(";\n"));
  console.log(`Mixing audio (${ambient.length} ambient shot(s))...`);
  run("ffmpeg", [
    "-v",
    "error",
    ...inputs,
    "-filter_complex_script",
    script,
    "-map",
    "[out]",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "44100",
    "-y",
    audio,
  ]);
}

// --- Mux --------------------------------------------------------------------
const final = path.join(
  OUT_DIR,
  excerpt
    ? `excerpt_${Math.round(startSeconds)}-${Math.round(endSeconds)}.mp4`
    : FINAL_NAME,
);
run("ffmpeg", [
  "-v",
  "error",
  "-i",
  picture,
  ...(excerpt
    ? ["-ss", String(startSeconds), "-t", String(endSeconds - startSeconds)]
    : []),
  "-i",
  audio,
  "-map",
  "0:v",
  "-map",
  "1:a",
  "-c",
  "copy",
  "-movflags",
  "+faststart",
  "-y",
  final,
]);
fs.rmSync(picture);

const size = fs.statSync(final).size / 1e6;
const duration = execFileSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", final],
  { encoding: "utf8" },
).trim();
console.log(
  `Wrote ${path.relative(ROOT, final)} (${size.toFixed(1)} MB, ${Number(duration).toFixed(2)}s)`,
);
