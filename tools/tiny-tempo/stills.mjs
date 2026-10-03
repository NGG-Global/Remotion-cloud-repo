#!/usr/bin/env node
/*
 * Renders review stills of the trailer compositions from one bundle.
 *
 *   node tools/tiny-tempo/stills.mjs <outDir> TinyTempoTrailer:50,100 TinyTempoTeaser:40
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const SHELL = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const [outDir, ...jobs] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.ts"), publicDir: join(ROOT, "public") });
const browserExecutable = existsSync(SHELL) ? SHELL : null;
for (const job of jobs) {
  const [id, list] = job.split(":");
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  for (const frame of list.split(",").map(Number)) {
    const output = join(outDir, `${id}-${String(frame).padStart(4, "0")}.png`);
    await renderStill({ composition, serveUrl, frame, output, browserExecutable, scale: Number(process.env.SCALE ?? 0.5) });
    console.log(output);
  }
}
