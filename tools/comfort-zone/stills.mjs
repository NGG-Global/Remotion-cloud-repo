/**
 * Renders a handful of frames of ComfortZoneEN from one bundle, for checking
 * the English overlays against the picture without a full render.
 *
 * Usage:
 *   node tools/comfort-zone/stills.mjs <outDir> <clean|source> <frame> [frame...]
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , outDir, plate, ...frames] = process.argv;
if (!outDir || !["clean", "source"].includes(plate) || frames.length === 0) {
  console.error("Usage: node tools/comfort-zone/stills.mjs <outDir> <clean|source> <frame> [frame...]");
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  webpackOverride: enableTailwind,
  publicDir: path.join(root, "public"),
});
const inputProps = { plate, subtitles: true, words: true };
const composition = await selectComposition({ serveUrl, id: "ComfortZoneEN", inputProps });
for (const f of frames) {
  await renderStill({
    composition,
    serveUrl,
    output: path.join(outDir, `${plate}_${f}.jpg`),
    frame: Number(f),
    inputProps,
    imageFormat: "jpeg",
    jpegQuality: 90,
    chromiumOptions: { gl: "swangle" },
  });
  console.log("rendered", f);
}
