/**
 * Fetches full-quality footage for just the stretches the edit uses.
 *
 *   node tools/dpa/fetch-selects.mjs [--jobs 3]
 *
 * Shots are chosen on low-resolution proxies of each playthrough part. The
 * full-quality parts are far too large to keep, so this pulls only the chosen
 * ranges, with a margin either side, straight from the stream by stream copy.
 *
 * Inputs
 *   src/dpa/data/selects.json   beat id -> [{ src, a, b }] in part seconds
 *   src/dpa/data/parts.tsv      part name <tab> video id
 *
 * Output
 *   footage/dpa/selects/<part>_<start>.mkv   one file per cluster of ranges
 *   footage/dpa/selects/manifest.json         for each file, the part time of
 *                                             its first frame
 *
 * Every file is checked against the proxy at the same part time, so a
 * rendition whose clock disagrees with the proxy is caught here and not in
 * the finished film.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { exec, FOOTAGE_DIR, pool, readJson, ROOT, writeJson } from "./lib.mjs";

const args = process.argv.slice(2);
const jobs = Number(args[args.indexOf("--jobs") + 1]) || 3;

/** Seconds of extra footage fetched before and after each range. */
const MARGIN = 6;
/** Ranges closer than this in the same part are fetched as one file. */
const MERGE_GAP = 25;

const SELECTS = path.join(ROOT, "src/dpa/data/selects.json");
const OUT = path.join(FOOTAGE_DIR, "selects");
const MANIFEST = path.join(OUT, "manifest.json");
fs.mkdirSync(OUT, { recursive: true });

const ids = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, "src/dpa/data/parts.tsv"), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split(/\s+/)),
);

// --- Cluster the chosen ranges per part ------------------------------------
const byPart = {};
for (const ranges of Object.values(readJson(SELECTS).beats)) {
  for (const { src, a, b } of ranges) {
    (byPart[src] ??= []).push([a, b]);
  }
}
const clusters = [];
for (const [part, ranges] of Object.entries(byPart)) {
  ranges.sort((x, y) => x[0] - y[0]);
  let open = null;
  for (const [a, b] of ranges) {
    if (open && a - open.b <= MERGE_GAP) {
      open.b = Math.max(open.b, b);
    } else {
      open = { part, a, b };
      clusters.push(open);
    }
  }
}

const manifest = fs.existsSync(MANIFEST) ? readJson(MANIFEST) : {};
const covered = (cluster) =>
  Object.values(manifest).some(
    (entry) =>
      entry.part === cluster.part &&
      entry.from <= cluster.a - 0.5 &&
      entry.to >= cluster.b + 0.5 &&
      fs.existsSync(path.join(FOOTAGE_DIR, entry.file)),
  );
const todo = clusters.filter((cluster) => !covered(cluster));
const seconds = todo.reduce((sum, c) => sum + (c.b - c.a) + 2 * MARGIN, 0);
console.log(
  `${clusters.length} cluster(s) across ${Object.keys(byPart).length} part(s); ` +
    `${todo.length} to fetch, about ${(seconds / 60).toFixed(1)} min of footage`,
);

// --- Resolve each part's full-quality stream once ---------------------------
const streams = {};
const sleep = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
/**
 * The host does not list every rendition on every request: the same video
 * can offer 1080p one moment and only 288p the next. Ask again until the
 * H.264 1080p stream is offered, and only then settle for less.
 */
const streamFor = (part) => {
  if (!streams[part]) {
    if (!ids[part]) {
      throw new Error(`No video id for part ${part} in parts.tsv`);
    }
    const page = `https://www.dailymotion.com/video/${ids[part]}`;
    const resolve = (format) => {
      try {
        return execFileSync(
          "yt-dlp",
          ["--no-warnings", "-g", "-f", format, page],
          { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
        )
          .trim()
          .split("\n")[0];
      } catch {
        return null;
      }
    };
    let url = null;
    for (let attempt = 0; attempt < 12 && !url; attempt++) {
      url = resolve("b[height=1080][vcodec^=avc1]");
      if (!url) {
        sleep(2500);
      }
    }
    if (!url) {
      url = resolve("b[height>=720][vcodec^=avc1]/b[height>=480]");
      if (url) {
        lowQuality.push(part);
      }
    }
    if (!url) {
      throw new Error(`\nno usable stream offered for ${part}`);
    }
    streams[part] = url;
  }
  return streams[part];
};
const lowQuality = [];

/** Timestamp the stream itself starts at; HLS streams rarely start at zero. */
const offsets = {};
const offsetFor = (part) => {
  if (offsets[part] === undefined) {
    offsets[part] = Number(
      execFileSync(
        "ffprobe",
        [
          "-v",
          "error",
          "-show_entries",
          "format=start_time",
          "-of",
          "csv=p=0",
          streamFor(part),
        ],
        { encoding: "utf8" },
      ).trim(),
    );
  }
  return offsets[part];
};

const firstVideoTime = (file) =>
  Number(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "packet=pts_time",
        "-read_intervals",
        "%+#1",
        "-of",
        "csv=p=0",
        file,
      ],
      { encoding: "utf8" },
    )
      .trim()
      .split("\n")[0],
  );

/** Mean absolute difference between two tiny greyscale frames, 0 to 255. */
const frameDifference = (fileA, timeA, fileB, timeB) => {
  const grab = (file, time) =>
    execFileSync(
      "ffmpeg",
      [
        "-v",
        "error",
        "-ss",
        time.toFixed(3),
        "-i",
        file,
        "-frames:v",
        "1",
        "-vf",
        "scale=48:27,format=gray",
        "-f",
        "rawvideo",
        "-",
      ],
      { maxBuffer: 1 << 20 },
    );
  const x = grab(fileA, timeA);
  const y = grab(fileB, timeB);
  if (!x.length || x.length !== y.length) {
    return 255;
  }
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += Math.abs(x[i] - y[i]);
  }
  return sum / x.length;
};

let done = 0;
const failures = [];
await pool(todo, jobs, async (cluster) => {
  const from = Math.max(0, cluster.a - MARGIN);
  const length = cluster.b - cluster.a + 2 * MARGIN;
  const name = `${cluster.part}_${String(Math.round(from)).padStart(5, "0")}.mkv`;
  const file = path.join(OUT, name);
  try {
    const url = streamFor(cluster.part);
    let attempt = 0;
    for (;;) {
      try {
        // Stream copy with the stream's own timestamps kept, so the file's
        // first frame time is the part time it was cut at.
        await exec(
          "ffmpeg",
          [
            // Both limits are input options: with -copyts an output -t
            // would be measured against the part's absolute timestamps.
            // An input seek is already measured from the stream's start.
            "-v",
            "error",
            "-ss",
            from.toFixed(3),
            "-t",
            length.toFixed(3),
            "-i",
            url,
            "-map",
            "0:v:0",
            "-c",
            "copy",
            "-copyts",
            "-y",
            file,
          ],
          { maxBuffer: 1 << 24 },
        );
        break;
      } catch (error) {
        if (++attempt >= 5) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 4000 * attempt));
      }
    }
    // Part time of the file's first frame. Copying starts on the first
    // keyframe after the seek point, a second or two into the margin.
    let start;
    if (fs.statSync(file).size >= 100_000) {
      // Part time of the file's first frame. Copying starts on a keyframe
      // near the seek point, somewhere inside the margin.
      start = firstVideoTime(file) - offsetFor(cluster.part);
    } else {
      // Some streams cannot be seeked on input and yield nothing. Read from
      // the top and cut on output instead; re-encoding makes the cut exact.
      await exec(
        "ffmpeg",
        [
          "-v",
          "error",
          "-i",
          url,
          "-ss",
          from.toFixed(3),
          "-t",
          length.toFixed(3),
          "-map",
          "0:v:0",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "14",
          "-y",
          file,
        ],
        { maxBuffer: 1 << 24 },
      );
      if (fs.statSync(file).size < 100_000) {
        throw new Error("\nthe stream returned no video for this range");
      }
      start = from;
    }
    const proxy = path.join(FOOTAGE_DIR, "proxy", `${cluster.part}.mp4`);
    // Compare at two points; a clock mismatch shows as a different picture.
    const checks = [cluster.a + 0.5, cluster.b - 0.5].map((t) =>
      frameDifference(file, t - start, proxy, t),
    );
    const worst = Math.max(...checks);
    manifest[name] = {
      file: `selects/${name}`,
      part: cluster.part,
      start: Number(start.toFixed(3)),
      from: Number(start.toFixed(3)),
      to: Number((from + length).toFixed(3)),
      match: Number(worst.toFixed(1)),
    };
    if (worst > 18) {
      failures.push(
        `${name}: picture differs from the proxy (${worst.toFixed(1)})`,
      );
    }
  } catch (error) {
    failures.push(`${name}: ${String(error.message).split("\n").slice(-2)[0]}`);
  }
  done++;
  if (done % 15 === 0 || done === todo.length) {
    console.log(`  ${done}/${todo.length}`);
    writeJson(MANIFEST, manifest);
  }
});

writeJson(MANIFEST, manifest);
if (lowQuality.length) {
  console.log(`Below 1080p (host did not offer it): ${lowQuality.join(", ")}`);
}
if (failures.length) {
  console.log(`${failures.length} problem(s):`);
  failures.forEach((line) => console.log(`  - ${line}`));
  process.exitCode = 1;
} else {
  console.log("All selects fetched and matched against their proxies.");
}
