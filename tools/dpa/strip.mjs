/**
 * Close look at a stretch of source footage, for placing a shot.
 *
 *   node tools/dpa/strip.mjs <source> <from> <to> <out.jpg> [--fps 1]
 *
 * <source> is a path under footage/dpa. Writes one image of timestamped
 * frames between the two times (seconds) and prints the source's own cut
 * points inside that range, so a shot can be placed between them.
 */
import fs from "node:fs";
import path from "node:path";
import { exec, FOOTAGE_DIR, readJson } from "./lib.mjs";

const [source, from, to, out] = process.argv.slice(2);
const args = process.argv.slice(6);
const fps = Number(args[args.indexOf("--fps") + 1]) || 1;
if (!out) {
  console.error(
    "Usage: node tools/dpa/strip.mjs <source> <from> <to> <out.jpg> [--fps 1]",
  );
  process.exit(1);
}

const a = Number(from);
const b = Number(to);
const count = Math.max(1, Math.ceil((b - a) * fps));
const columns = Math.min(8, count);
const rows = Math.ceil(count / columns);
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
await exec("ffmpeg", [
  "-v",
  "error",
  "-ss",
  String(a),
  "-t",
  String(b - a),
  "-copyts",
  "-i",
  path.join(FOOTAGE_DIR, source),
  "-an",
  "-vf",
  `fps=${fps},scale=320:180,drawtext=fontfile=${FONT}:text='%{pts\\:hms}':` +
    `x=5:y=5:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6,tile=${columns}x${rows}`,
  "-frames:v",
  "1",
  "-q:v",
  "4",
  "-y",
  out,
]);

const inventory = path.join(FOOTAGE_DIR, "inventory.json");
const cuts = fs.existsSync(inventory)
  ? (readJson(inventory)[source]?.cuts ?? []).filter((t) => t >= a && t <= b)
  : [];
console.log(`${out}: ${count} frame(s) at ${fps} fps, ${a}s to ${b}s`);
console.log(
  `cuts in range: ${cuts.length ? cuts.join(", ") : "none detected"}`,
);
