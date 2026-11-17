/**
 * Builds the footage inventory for the Dark Pictures documentary.
 *
 *   node tools/dpa/inventory.mjs [--every 5] [--no-scenes] [--only proxy]
 *                                [--tile 6x6] [--thumb 320x180]
 *
 * For every video under footage/dpa it records resolution, frame rate,
 * duration and codecs, writes timestamped contact sheets for choosing shots,
 * and lists the source's own cut points so a shot can be placed without
 * straddling one.
 *
 * Each source is decoded at most twice, once per pass, and the result is
 * cached against the file's size and modification time. Contact sheets decode
 * keyframes only.
 */
import fs from "node:fs";
import path from "node:path";
import { exec, FOOTAGE_DIR, pool, probe, readJson, writeJson } from "./lib.mjs";

const args = process.argv.slice(2);
const every = Number(args[args.indexOf("--every") + 1]) || 5;
const withScenes = !args.includes("--no-scenes");
const value = (name, fallback) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
/** Restrict the run to one sub-directory of footage/dpa. */
const only = value("--only", null);
const tile = value("--tile", "6x6");
const thumb = value("--thumb", "320x180").replace("x", ":");
const perSheet = tile.split("x").reduce((a, b) => a * Number(b), 1);

const INVENTORY = path.join(FOOTAGE_DIR, "inventory.json");
const SHEETS = path.join(FOOTAGE_DIR, "sheets");
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const VIDEO = /\.(mp4|mkv|mov|webm|m4v|avi|ts)$/i;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "sheets" ? [] : walk(full);
    }
    return VIDEO.test(entry.name) ? [full] : [];
  });

if (!fs.existsSync(FOOTAGE_DIR)) {
  console.error(`No footage directory. Put source videos in ${FOOTAGE_DIR}`);
  process.exit(1);
}

const previous = fs.existsSync(INVENTORY) ? readJson(INVENTORY) : {};
const inventory = {};
const files = walk(only ? path.join(FOOTAGE_DIR, only) : FOOTAGE_DIR).sort();
console.log(`${files.length} source file(s)`);

await pool(files, 2, async (file) => {
  const rel = path.relative(FOOTAGE_DIR, file);
  const stat = fs.statSync(file);
  const stamp = `${stat.size}:${Math.round(stat.mtimeMs)}:${every}:${withScenes}:${tile}:${thumb}`;
  if (previous[rel]?.stamp === stamp) {
    inventory[rel] = previous[rel];
    return;
  }

  const info = probe(file);
  const slug = rel.replace(/[^\w.-]+/g, "_").replace(/\.\w+$/, "");
  const sheetDir = path.join(SHEETS, slug);
  fs.rmSync(sheetDir, { recursive: true, force: true });
  fs.mkdirSync(sheetDir, { recursive: true });

  // 6x6 thumbnails per sheet, each stamped with its source time.
  const label = fs.existsSync(FONT)
    ? `,drawtext=fontfile=${FONT}:text='%{pts\\:hms}':x=6:y=6:fontsize=${thumb.startsWith("320") ? 20 : 15}:` +
      `fontcolor=white:box=1:boxcolor=black@0.6`
    : "";
  await exec(
    "ffmpeg",
    [
      "-v",
      "error",
      "-skip_frame",
      "nokey",
      "-i",
      file,
      "-an",
      "-vf",
      `fps=1/${every},scale=${thumb}:force_original_aspect_ratio=increase,crop=${thumb}${label},tile=${tile}`,
      "-fps_mode",
      "vfr",
      "-q:v",
      "4",
      path.join(sheetDir, "%03d.jpg"),
      "-y",
    ],
    { maxBuffer: 1 << 26 },
  );

  let cuts = [];
  if (withScenes) {
    const { stderr } = await exec(
      "ffmpeg",
      [
        "-v",
        "info",
        "-i",
        file,
        "-an",
        "-vf",
        "scale=320:-2,select='gt(scene,0.32)',showinfo",
        "-f",
        "null",
        "-",
      ],
      { maxBuffer: 1 << 28 },
    );
    cuts = [...stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) =>
      Number(Number(m[1]).toFixed(2)),
    );
  }

  inventory[rel] = {
    stamp,
    ...info,
    sheets: path.relative(FOOTAGE_DIR, sheetDir),
    sheetSpanSeconds: every * perSheet,
    cuts,
  };
  console.log(
    `${rel}: ${info.video?.width}x${info.video?.height} @ ${info.video?.fps} fps, ` +
      `${info.duration.toFixed(1)}s, ${cuts.length} cuts`,
  );
});

writeJson(
  INVENTORY,
  Object.fromEntries(
    Object.entries({ ...(only ? previous : {}), ...inventory }).sort(),
  ),
);
console.log(`Wrote ${path.relative(process.cwd(), INVENTORY)}`);
