/**
 * Prepares one trimmed clip per sourced shot in the EDL.
 *
 *   node tools/dpa/prep.mjs [--jobs 3]
 *
 * Only the stretches the edit actually uses are transcoded: 1280x720, 30 fps,
 * H.264, no audio, cut to the shot's exact frame count (plus its dissolve
 * lead-in). A clip is named after a hash of everything that shapes it, so an
 * unchanged shot is never encoded twice and a changed one never reuses a stale
 * file.
 */
import fs from "node:fs";
import path from "node:path";
import {
  CLIP_DIR,
  CLIPS_PATH,
  exec,
  FOOTAGE_DIR,
  loadEdl,
  pool,
  probe,
  ROOT,
  sha,
  writeJson,
} from "./lib.mjs";

const args = process.argv.slice(2);
const jobs = Number(args[args.indexOf("--jobs") + 1]) || 3;

const edl = loadEdl();
fs.mkdirSync(CLIP_DIR, { recursive: true });

const clips = {};
const todo = [];
const missing = [];

for (const shot of edl.shots) {
  if (shot.source === null || shot.in === null) {
    continue;
  }
  const source = path.join(FOOTAGE_DIR, shot.source);
  if (!fs.existsSync(source)) {
    missing.push(`${shot.id}: ${shot.source}`);
    continue;
  }
  const stat = fs.statSync(source);
  const frames = shot.to - shot.mount;
  const seek = shot.in - shot.lead / edl.fps;
  const crop = shot.crop ?? null;
  const key = sha(
    JSON.stringify([
      shot.source,
      stat.size,
      Math.round(stat.mtimeMs),
      seek.toFixed(4),
      frames,
      crop,
      edl.width,
      edl.height,
      edl.fps,
      "v2",
    ]),
  );
  const name = `${shot.id}-${key}.mp4`;
  clips[shot.id] = { file: `dpa/clips/${name}` };
  if (!fs.existsSync(path.join(CLIP_DIR, name))) {
    todo.push({ shot, source, seek, frames, crop, name });
  }
}

if (missing.length) {
  console.error(`Missing source files:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

const { width: W, height: H, fps } = edl;

/**
 * How a source's colour should be read. Captures are often untagged, and an
 * untagged clip is decoded as BT.601 by FFmpeg but as BT.709 by a browser, so
 * the same file shows two different reds. Every clip is therefore converted to
 * BT.709 limited range and tagged as such. An untagged source is read by the
 * usual convention: BT.709 at 720 lines and above, BT.601 below.
 */
const colourCache = new Map();
const sourceColour = (file) => {
  if (!colourCache.has(file)) {
    const { video } = probe(file);
    const tagged = {
      bt709: "bt709",
      smpte170m: "bt601",
      bt470bg: "bt601",
      bt2020nc: "bt2020",
    }[video.colorSpace];
    colourCache.set(file, {
      matrix: tagged ?? (video.height >= 720 ? "bt709" : "bt601"),
      range:
        video.colorRange === "pc" || video.pixFmt?.startsWith("yuvj")
          ? "pc"
          : "tv",
    });
  }
  return colourCache.get(file);
};
console.log(
  `${Object.keys(clips).length} sourced shot(s), ${todo.length} to encode, ` +
    `${edl.shots.length - Object.keys(clips).length} still unsourced`,
);

let done = 0;
await pool(todo, jobs, async ({ shot, source, seek, frames, crop, name }) => {
  const filters = [];
  if (crop) {
    // Punch in around a chosen point to lose a HUD element or subtitle.
    const z = Math.max(1, crop.zoom);
    filters.push(
      `crop=iw/${z}:ih/${z}:(iw-iw/${z})*${crop.x}:(ih-ih/${z})*${crop.y}`,
    );
  }
  const colour = sourceColour(source);
  filters.push(
    `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos:` +
      `in_color_matrix=${colour.matrix}:in_range=${colour.range}:` +
      `out_color_matrix=bt709:out_range=tv`,
    `crop=${W}:${H}`,
    `fps=${fps}`,
    "setsar=1",
    "format=yuv420p",
  );
  const target = path.join(CLIP_DIR, name);
  const temp = `${target}.part.mp4`;
  await exec("ffmpeg", [
    "-v",
    "error",
    "-ss",
    seek.toFixed(4),
    "-i",
    source,
    "-an",
    "-vf",
    filters.join(","),
    "-frames:v",
    String(frames),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "17",
    "-colorspace",
    "bt709",
    "-color_primaries",
    "bt709",
    "-color_trc",
    "bt709",
    "-color_range",
    "tv",
    // Short GOP: the renderer seeks into these clips from several workers.
    "-g",
    "15",
    "-movflags",
    "+faststart",
    "-y",
    temp,
  ]);
  fs.renameSync(temp, target);
  done++;
  if (done % 20 === 0 || done === todo.length) {
    console.log(`  ${done}/${todo.length} (${shot.id})`);
  }
});

// Clips no shot refers to any more are removed so the bundle stays small.
const keep = new Set(Object.values(clips).map((c) => path.basename(c.file)));
for (const file of fs.readdirSync(CLIP_DIR)) {
  if (!keep.has(file)) {
    fs.rmSync(path.join(CLIP_DIR, file));
  }
}

writeJson(CLIPS_PATH, clips);
console.log(`Wrote ${path.relative(ROOT, CLIPS_PATH)}`);
