/**
 * Renders a batch of stills from one composition, for visual QA: five frames
 * per shot, a contact sheet of a sequence, a before/after check.
 *
 * It bundles once and keeps one browser open, which is far faster than
 * calling `npx remotion still` once per frame.
 *
 * Usage:
 *   node tools/stills.mjs <compositionId> <outDir> <scale> <frame,frame,...> [bundleDir]
 *
 * Example (three frames of the Piest sequence at half size):
 *   node tools/stills.mjs GacyDocumentary out/qa 0.5 8950,9300,9900 .cache/bundle
 *
 * Writes <outDir>/f<frame>.jpg. Pass a bundleDir to reuse the bundle between
 * runs; set REBUNDLE=1 after changing code. LOGS=1 prints the page's console,
 * which is how SVG errors (for example a negative rect height) show up.
 *
 * remotion.config.ts does not apply to the Node APIs, so its settings
 * (rspack, Tailwind, the SwiftShader GL backend) are repeated here.
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import fs from "node:fs";
import path from "node:path";

const [compId, outDir, scaleStr, framesStr, bundleDir] = process.argv.slice(2);
if (!compId || !outDir || !scaleStr || !framesStr) {
  console.error("usage: node tools/stills.mjs <compositionId> <outDir> <scale> <frame,frame,...> [bundleDir]");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

let serveUrl = bundleDir;
if (!serveUrl || !fs.existsSync(path.join(serveUrl, "index.html")) || process.env.REBUNDLE) {
  serveUrl = await bundle({
    entryPoint: path.resolve("src/index.ts"),
    outDir: bundleDir ? path.resolve(bundleDir) : undefined,
    webpackOverride: (c) => enableTailwind(c),
    rspack: true,
  });
}

const chromiumOptions = { gl: "swangle" };
const browser = await openBrowser("chrome", { chromiumOptions });
const composition = await selectComposition({ serveUrl, id: compId, puppeteerInstance: browser });
const frames = framesStr.split(",").map(Number);
const concurrency = 4;

let next = 0;
const worker = async () => {
  while (next < frames.length) {
    const frame = frames[next++];
    const output = path.join(outDir, `f${String(frame).padStart(6, "0")}.jpg`);
    await renderStill({
      serveUrl,
      composition,
      frame,
      output,
      scale: Number(scaleStr),
      imageFormat: "jpeg",
      jpegQuality: 82,
      puppeteerInstance: browser,
      overwrite: true,
      chromiumOptions,
      onBrowserLog: (log) => {
        if (process.env.LOGS) {
          console.log(`\n[${frame}] ${log.type}: ${log.text}`);
        }
      },
    });
    process.stdout.write(`${frame} `);
  }
};
await Promise.all(Array.from({ length: concurrency }, worker));
await browser.close({ silent: true });
console.log(`\ndone: ${frames.length} stills in ${outDir}`);
