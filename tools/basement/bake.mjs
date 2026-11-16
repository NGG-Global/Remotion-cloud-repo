/**
 * Bakes the painted layers to rasters.
 *
 *   node tools/basement/bake.mjs            # bake everything that changed
 *   node tools/basement/bake.mjs coin hall  # only layers whose name contains a filter
 *   node tools/basement/bake.mjs --force    # ignore the cache
 *
 * Opaque layers are written as JPEG (smaller, cheaper to decode during the
 * render); layers with transparency as PNG. A manifest keyed by a hash of
 * each layer's SVG source skips layers whose source did not change, so an
 * accepted image is never re-baked by accident.
 */
import { createRequire } from "node:module";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { LAYERS } from "./scenes.mjs";

// Playwright is pre-installed globally (NODE_PATH), not a project dependency.
const { chromium } = createRequire(import.meta.url)("playwright");

const OUT = path.resolve("public/basement/art");
const MANIFEST = path.join(OUT, "manifest.json");
fs.mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
const filters = args.filter((a) => !a.startsWith("--"));
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

const todo = [];
for (const make of LAYERS) {
  const layer = make();
  if (filters.length && !filters.some((f) => layer.name.includes(f))) continue;
  const hash = crypto.createHash("sha1").update(layer.svg).digest("hex").slice(0, 16);
  const file = `${layer.name}.${layer.opaque ? "jpg" : "png"}`;
  if (!force && manifest[layer.name]?.hash === hash && fs.existsSync(path.join(OUT, file))) continue;
  todo.push({ ...layer, hash, file });
}
console.log(`${todo.length} layer(s) to bake`);
if (todo.length) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const l of todo) {
    const t0 = Date.now();
    await page.setViewportSize({ width: l.w, height: l.h });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent;overflow:hidden">${l.svg}</body></html>`);
    await page.waitForTimeout(30);
    await page.screenshot({
      path: path.join(OUT, l.file),
      type: l.opaque ? "jpeg" : "png",
      quality: l.opaque ? 90 : undefined,
      omitBackground: !l.opaque,
      clip: { x: 0, y: 0, width: l.w, height: l.h },
    });
    manifest[l.name] = { hash: l.hash, file: l.file, w: l.w, h: l.h };
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
    console.log(`  ${l.file} ${l.w}x${l.h} ${Date.now() - t0}ms`);
  }
  await browser.close();
}
// The composition imports this to know each layer's file and size.
fs.writeFileSync(
  path.resolve("src/basement/art.json"),
  JSON.stringify(Object.fromEntries(Object.entries(manifest).sort().map(([k, v]) => [k, { file: v.file, w: v.w, h: v.h }])), null, 1),
);
