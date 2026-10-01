/**
 * Reads the log of a framing-debug stills run and lists the shots where a
 * character's head is sliced by the frame edge.
 *
 * Usage:
 *   INPUT_PROPS='{"framingDebug":true}' LOGS=1 \
 *     node tools/stills.mjs GacyDocumentary out/qa 0.5 <frames> .cache/bundle > out/framing.log
 *   node tools/framing-report.mjs out/framing.log
 *
 * A head counts as cut when its circle crosses a frame edge. A head just
 * outside a side edge (within three head radii) is listed too, because the
 * shoulders and arms are then usually in frame without it. Heads larger
 * than 220 px across are foreground figures passing the lens and are listed
 * separately; heads under 12 px are background crowd and are ignored.
 * Frames are mapped to shots through the `at` times in
 * src/gacy/data/timeline.ts.
 */
import fs from "node:fs";

const [logPath] = process.argv.slice(2);
if (!logPath) {
  console.error("usage: node tools/framing-report.mjs <framing.log>");
  process.exit(1);
}

const W = 1920;
const H = 1080;
const FPS = 30;

const timeline = fs.readFileSync("src/gacy/data/timeline.ts", "utf8");
const body = timeline.slice(timeline.indexOf("export const SHOTS"), timeline.indexOf("export const END_SECONDS"));
const shots = [...body.matchAll(/\{ id: "([^"]+)", at: ([\d.]+)/g)].map((m) => ({ id: m[1], at: Number(m[2]) }));
const shotAt = (frame) => {
  const t = frame / FPS;
  let s = shots[0];
  for (const x of shots) {
    if (x.at <= t + 1e-6) {
      s = x;
    }
  }
  return s.id;
};

const seen = new Set();
const issues = new Map();
const add = (shot, kind, frame, detail) => {
  const key = `${shot}|${kind}`;
  if (!issues.has(key)) {
    issues.set(key, { shot, kind, frames: new Set(), detail });
  }
  issues.get(key).frames.add(frame);
};

for (const line of fs.readFileSync(logPath, "utf8").split("\n")) {
  // stills.mjs prefixes each console line with the composition frame.
  const m = line.match(/^\[(\d+)\] log: FRAMING (.*)$/);
  if (!m) {
    continue;
  }
  let e;
  try {
    e = JSON.parse(m[2]);
  } catch {
    continue;
  }
  const f = Number(m[1]);
  const key = `${f}|${e.hx}|${e.hy}|${e.hr}`;
  if (seen.has(key)) {
    continue;
  }
  seen.add(key);
  const { hx, hy, hr, fy } = e;
  if (hr < 6) {
    continue;
  }
  const shot = shotAt(f);
  const crossesX = (hx - hr < 0 && hx + hr > 0) || (hx - hr < W && hx + hr > W);
  const crossesY = (hy - hr < 0 && hy + hr > 0) || (hy - hr < H && hy + hr > H);
  const inX = hx + hr > 0 && hx - hr < W;
  const inY = hy + hr > 0 && hy - hr < H;
  if (hr > 110) {
    if ((crossesX && inY) || (crossesY && inX)) {
      add(shot, "foreground head at edge", f, `r=${hr}`);
    }
    continue;
  }
  if ((crossesX && inY) || (crossesY && inX)) {
    add(shot, "head cut by frame edge", f, `head at (${hx}, ${hy}) r=${hr}`);
  } else if (hy + hr <= 0 && fy > 0 && hx > 0 && hx < W) {
    add(shot, "head above frame, body in frame", f, `head y=${hy}, feet y=${fy}`);
  } else if (inY && ((hx + hr <= 0 && hx + 3 * hr > 0) || (hx - hr >= W && hx - 3 * hr < W))) {
    // Just past a side edge: the shoulders and arms are likely still in frame.
    add(shot, "head beside frame, body in frame", f, `head at (${hx}, ${hy}) r=${hr}`);
  }
}

const rows = [...issues.values()].sort((a, b) => [...a.frames][0] - [...b.frames][0]);
if (!rows.length) {
  console.log("No cut heads found.");
}
for (const r of rows) {
  const frames = [...r.frames].sort((a, b) => a - b);
  console.log(`${r.shot.padEnd(18)} ${r.kind.padEnd(34)} frames ${frames.join(",")}  (${r.detail})`);
}
