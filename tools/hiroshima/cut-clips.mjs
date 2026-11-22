/**
 * Cuts every archival segment the edit plays out of the downloaded films.
 *
 *   node --experimental-strip-types tools/hiroshima/cut-clips.mjs [project] [--force]
 *
 * `project` is the folder under src/ and public/ (default "hiroshima"; also
 * "bundy"). Its films are read from the project's raw directory below.
 *
 * Reads the shot list (src/hiroshima/data/edit.ts) and the film registry
 * (src/hiroshima/data/sources.ts), and writes one H.264 file per segment to
 * public/hiroshima/clips: muted, 30 fps, 720 px high, colour-graded, short
 * GOP so the renderer can seek cheaply. Films are expected in .cache/raw (see fetch.mjs).
 * Existing clips are kept unless --force is given.
 */
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const project =
  process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "hiroshima";
const RAW_DIRS = { hiroshima: ".cache/raw", bundy: ".cache/raw-bundy" };
const { clipJobs, GRADE_FILTERS } = await import(
  `../../src/${project}/data/edit.ts`
);
const { FILMS } = await import(`../../src/${project}/data/sources.ts`);

const RAW = path.resolve(RAW_DIRS[project] ?? `.cache/raw-${project}`);
const OUT = path.resolve(`public/${project}/clips`);
const force = process.argv.includes("--force");
fs.mkdirSync(OUT, { recursive: true });

const jobs = clipJobs();
const probe = new Map();
const size = (file) => {
  if (!probe.has(file)) {
    const out = execFileSync("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0",
      file,
    ])
      .toString()
      .trim();
    const [w, h] = out.split(",").map(Number);
    probe.set(file, { w, h });
  }
  return probe.get(file);
};

const exec = promisify(execFile);

const run = async (job) => {
  const film = FILMS[job.src];
  const input = path.join(RAW, film.file);
  const output = path.join(OUT, job.file);
  if (!force && fs.existsSync(output) && fs.statSync(output).size > 0) {
    // Keep an existing cut only if it is still long enough for the edit.
    let have = 0;
    try {
      have = Number(
        execFileSync("ffprobe", [
          "-v",
          "error",
          "-show_entries",
          "format=duration",
          "-of",
          "csv=p=0",
          output,
        ]).toString(),
      );
    } catch {
      have = 0; // an interrupted cut: make it again
    }
    if (have >= job.need - 0.05) return "kept";
  }
  const filters = [];
  if (job.crop) {
    const { w, h } = size(input);
    const [x, y, cw, ch] = job.crop;
    const even = (v) => Math.max(2, Math.round(v / 2) * 2);
    filters.push(
      `crop=${even(cw * w)}:${even(ch * h)}:${even(x * w)}:${even(y * h)}`,
    );
  }
  filters.push(
    // Square the pixels first: NTSC MPEG-2 sources store 4:3 frames in
    // non-square pixels (e.g. 368×480 at 40:23), which a browser may not honour.
    "scale=trunc(iw*sar/2)*2:ih",
    "setsar=1",
    "scale=-2:720:flags=lanczos",
    "fps=30",
    ...(film.pre ? [film.pre] : []),
    GRADE_FILTERS[job.grade],
  );
  if (job.blur) filters.push(`gblur=sigma=${job.blur * 1.4}`);
  filters.push("format=yuv420p");
  await exec("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-threads",
    "2",
    "-ss",
    job.t.toFixed(3),
    "-i",
    input,
    "-t",
    job.need.toFixed(3),
    "-an",
    "-vf",
    filters.join(","),
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "17",
    "-g",
    "15",
    "-movflags",
    "+faststart",
    output,
  ]);
  return "cut";
};

const parallel = Math.max(1, Math.min(4, os.cpus().length));
let done = 0;
const queue = [...jobs];
const worker = async () => {
  while (queue.length) {
    const job = queue.shift();
    try {
      const r = await run(job);
      done++;
      if (r === "cut")
        console.log(
          `[${done}/${jobs.length}] ${job.file} (${job.need.toFixed(1)} s)`,
        );
    } catch (e) {
      console.error(`FAILED ${job.file}: ${e.message}`);
      process.exitCode = 1;
    }
  }
};
await Promise.all(Array.from({ length: parallel }, worker));
// Remove cuts the edit no longer plays.
const wanted = new Set(jobs.map((j) => j.file));
for (const file of fs.readdirSync(OUT)) {
  if (file.endsWith(".mp4") && !wanted.has(file))
    fs.rmSync(path.join(OUT, file));
}
console.log(`${jobs.length} clips in ${path.relative(process.cwd(), OUT)}`);
