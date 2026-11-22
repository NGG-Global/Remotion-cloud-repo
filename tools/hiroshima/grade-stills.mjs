/**
 * Bakes the colour grade into every still the edit shows, and makes the
 * blurred, darkened backdrop that a mounted (portrait or small) picture sits
 * on.
 *
 *   node --experimental-strip-types tools/hiroshima/grade-stills.mjs
 *
 * Reads public/hiroshima/stills (the downloaded originals) and writes
 * public/hiroshima/graded/<variant>.jpg and <variant>-mount.jpg.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const { stillJobs, stillVariant, GRADE_FILTERS } =
  await import("../../src/hiroshima/data/edit.ts");
const { STILLS } = await import("../../src/hiroshima/data/stills.ts");

const IN = path.resolve("public/hiroshima/stills");
const OUT = path.resolve("public/hiroshima/graded");
fs.mkdirSync(OUT, { recursive: true });

for (const v of stillJobs()) {
  const img = STILLS[v.img];
  const name = stillVariant(v);
  const src = path.join(IN, img.file);
  const grade = GRADE_FILTERS[v.grade ?? "bw"];
  const blur = v.blur ? `,gblur=sigma=${v.blur * 1.4}` : "";
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    src,
    "-vf",
    `format=rgb24,${grade}${blur}`,
    "-q:v",
    "2",
    path.join(OUT, `${name}.jpg`),
  ]);
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    src,
    "-vf",
    `format=rgb24,scale=960:540:force_original_aspect_ratio=increase,crop=960:540,${grade},gblur=sigma=22,eq=brightness=-0.32:saturation=0.4`,
    "-q:v",
    "4",
    path.join(OUT, `${name}-mount.jpg`),
  ]);
  console.log(name);
}
