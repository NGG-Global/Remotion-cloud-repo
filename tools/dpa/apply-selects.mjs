/**
 * Cuts the chosen footage into the EDL.
 *
 *   node tools/dpa/apply-selects.mjs
 *
 * src/dpa/data/selects.json lists, for each beat, the stretches of playthrough
 * footage chosen for it, in playing order. This divides the beat's narration
 * time among those stretches, places each shot in the middle of its stretch,
 * and points it at the full-quality file fetched by fetch-selects.mjs.
 *
 * A beat keeps its place on the narration timeline exactly; only the cuts
 * inside it are decided here.
 */
import fs from "node:fs";
import path from "node:path";
import {
  EDL_PATH,
  FOOTAGE_DIR,
  readJson,
  ROOT,
  TRANSITION_FRAMES,
  writeJson,
} from "./lib.mjs";

/**
 * Default punch-in per recording, to lose its letterbox bars and subtitles.
 * Three of the games are recorded letterboxed, with the picture between 11.8%
 * and 88.2% of frame height; the subtitles sit in the lower bar, or for House
 * of Ashes inside the bottom of the picture. The Devil in Me fills the frame
 * with subtitles at about 83%.
 */
const CROPS = {
  mom: { zoom: 1.32, x: 0.5, y: 0.487 },
  lh: { zoom: 1.32, x: 0.5, y: 0.487 },
  hoa: { zoom: 1.45, x: 0.5, y: 0.38 },
  dim: { zoom: 1.25, x: 0.5, y: 0 },
};
const cropFor = (part) => CROPS[part.split("_")[0]] ?? null;
const MIN_SHOT_FRAMES = 34;

const selects = readJson(path.join(ROOT, "src/dpa/data/selects.json")).beats;
const manifestPath = path.join(FOOTAGE_DIR, "selects/manifest.json");
const manifest = fs.existsSync(manifestPath)
  ? Object.values(readJson(manifestPath))
  : [];

const edl = readJson(EDL_PATH);
const fps = edl.fps;
const frame = (seconds) => Math.round(seconds * fps);
const total = Math.ceil(edl.duration * fps);

// Collapse the current shots back into beats: "x-003b" belongs to "x-003".
const beats = [];
for (const shot of edl.shots) {
  const id = shot.id.replace(/(\d)[a-z]$/, "$1");
  const last = beats[beats.length - 1];
  if (last && last.id === id) {
    last.end = shot.end;
  } else {
    const {
      source,
      in: _in,
      crop,
      part,
      partIn,
      gain,
      quality,
      picture,
      ...rest
    } = shot;
    beats.push({ ...rest, id });
  }
}

const problems = [];
const shots = [];
let sourced = 0;
let proxied = 0;

beats.forEach((beat, index) => {
  const next = beats[index + 1];
  const from = frame(beat.start);
  const to = next ? frame(next.start) : total;
  const length = to - from;
  const pending = { ...beat, source: null, in: null };
  const chosen = (selects[beat.id] ?? []).filter((r) => r.b - r.a >= 1.2);
  if (!chosen.length) {
    shots.push(pending);
    return;
  }

  // Use as many stretches as give shots of a watchable length.
  let ranges = chosen.slice();
  while (ranges.length > 1 && length / ranges.length < MIN_SHOT_FRAMES) {
    ranges.pop();
  }
  const capacity = (r) => Math.floor((r.b - r.a) * fps) - 2;
  let available = ranges.reduce((sum, r) => sum + capacity(r), 0);
  if (available < length) {
    // Not enough in the trimmed set; bring dropped stretches back.
    ranges = chosen.slice();
    available = ranges.reduce((sum, r) => sum + capacity(r), 0);
  }
  if (available < length) {
    problems.push(
      `${beat.id}: needs ${(length / fps).toFixed(1)}s, chosen footage gives ${(available / fps).toFixed(1)}s`,
    );
    shots.push(pending);
    return;
  }

  // Share the beat among the stretches in proportion to what each offers.
  const frames = ranges.map((r) =>
    Math.min(capacity(r), Math.floor((length * capacity(r)) / available)),
  );
  let spare = length - frames.reduce((a, b) => a + b, 0);
  for (let i = 0; spare > 0; i = (i + 1) % ranges.length) {
    if (frames[i] < capacity(ranges[i])) {
      frames[i]++;
      spare--;
    }
  }

  let cursor = from;
  const built = [];
  for (const [i, range] of ranges.entries()) {
    const first = i === 0;
    const transition = first ? beat.transition : "cut";
    const lead =
      transition === "dissolve"
        ? (beat.transitionFrames ?? TRANSITION_FRAMES.dissolve) / fps
        : 0;
    const used = frames[i] / fps;
    // Centre the shot in its stretch, leaving room for a dissolve lead-in.
    const slack = range.b - range.a - used;
    const partIn = range.a + Math.max(lead, slack / 2);
    const file = manifest.find(
      (entry) =>
        entry.part === range.src &&
        entry.start <= partIn - lead - 0.05 &&
        entry.to >= partIn + used + 0.05 &&
        fs.existsSync(path.join(FOOTAGE_DIR, entry.file)),
    );
    // Where the full-quality stretch has not been fetched, fall back to the
    // low-resolution proxy of the same part, which shares its clock. The shot
    // is marked so it can be upgraded by fetching and re-running this step.
    const proxyPath = `proxy/${range.src}.mp4`;
    const useProxy = !file && fs.existsSync(path.join(FOOTAGE_DIR, proxyPath));
    if (!file && !useProxy) {
      problems.push(
        `${beat.id}: no footage on disk for ${range.src} ${partIn.toFixed(1)}s`,
      );
      built.length = 0;
      break;
    }
    if (useProxy) {
      proxied++;
    }
    built.push({
      ...beat,
      id: first ? beat.id : `${beat.id}${String.fromCharCode(97 + i)}`,
      start: Number((cursor / fps).toFixed(4)),
      end: Number(((cursor + frames[i]) / fps).toFixed(4)),
      source: file ? file.file : proxyPath,
      in: Number((file ? partIn - file.start : partIn).toFixed(3)),
      ...(useProxy ? { quality: "proxy" } : {}),
      part: range.src,
      partIn: Number(partIn.toFixed(2)),
      transition,
      ...(range.crop
        ? { crop: range.crop }
        : range.full || !cropFor(range.src)
          ? {}
          : { crop: cropFor(range.src) }),
      ...(range.note || range.desc
        ? { picture: range.note ?? range.desc }
        : {}),
    });
    cursor += frames[i];
  }
  if (!built.length) {
    shots.push(pending);
    return;
  }
  // The last shot of a beat ends exactly where the beat does.
  built[built.length - 1].end = beat.end;
  shots.push(...built);
  sourced++;
});

writeJson(EDL_PATH, { ...edl, shots });
console.log(
  `${beats.length} beats: ${sourced} cut from footage, ${beats.length - sourced} pending; ${shots.length} shots`,
);
if (proxied) {
  console.log(
    `${proxied} shot(s) use the low-resolution proxy; fetch their footage to upgrade them.`,
  );
}
if (problems.length) {
  console.log(`${problems.length} problem(s):`);
  problems.forEach((line) => console.log(`  - ${line}`));
}
