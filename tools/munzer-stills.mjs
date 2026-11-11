/**
 * Pulls the archive frames the edit shows as stills (STILLS in
 * src/munzer/data/edl.ts) out of public/munzer/clips into
 * public/munzer/stills, at full source resolution.
 *
 * Usage: node tools/munzer-stills.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const edl = fs.readFileSync("src/munzer/data/edl.ts", "utf8");
const block = edl.slice(edl.indexOf("export const STILLS"), edl.indexOf("} as const;"));
const re = /(\w+): \{ clip: "(\w+)", t: ([\d.]+) \}/g;
fs.mkdirSync("public/munzer/stills", { recursive: true });
let m;
while ((m = re.exec(block))) {
  const [, name, clip, t] = m;
  const out = `public/munzer/stills/${name}.jpg`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", t, "-i", `public/munzer/clips/${clip}.mp4`, "-frames:v", "1", "-q:v", "2", out]);
  console.log(out);
}
