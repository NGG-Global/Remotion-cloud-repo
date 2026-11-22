/**
 * Downloads the archival films the Hiroshima documentary is cut from into
 * .cache/raw (git-ignored). About 3.5 GB in all; the files are the Internet
 * Archive mirrors listed in src/hiroshima/data/sources.ts.
 *
 *   node --experimental-strip-types tools/hiroshima/fetch.mjs
 *
 * Then: cut-clips.mjs, grade-stills.mjs, score.mjs (see docs/HIROSHIMA_NOTES.md).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const { FILMS } = await import("../../src/hiroshima/data/sources.ts");

const RAW = path.resolve(".cache/raw");
fs.mkdirSync(RAW, { recursive: true });

for (const [id, film] of Object.entries(FILMS)) {
  const out = path.join(RAW, film.file);
  if (fs.existsSync(out) && fs.statSync(out).size > 0) {
    console.log(`${id}: have ${film.file}`);
    continue;
  }
  console.log(`${id}: fetching ${film.url}`);
  execFileSync("curl", ["-sSL", "--retry", "4", "-o", out, film.url], {
    stdio: "inherit",
  });
}
