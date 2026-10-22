// Cuts the captured clips into the shots the ad uses: each output starts HANDLE seconds
// before its sync point so the composition can land that point on a bar line.
// Usage: node tools/tiny-tempo-trim.mjs <capture dir> public/footage
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node tools/tiny-tempo-trim.mjs <capture dir> <out dir>'); process.exit(1); }
const HANDLE = 0.5;
// name: output file; clip: capture; at: 'target' (first player target) or a number of seconds; preroll: seconds before that point to begin; length: seconds after it.
const SHOTS = [
  // name: output; clip: capture; at: 'target' (the first player target) or seconds; from: in-point relative to that; length: seconds kept after the in-point.
  { name: 'hammer', clip: 'hammer', at: 'target', from: -2.0, length: 6.5 },
  { name: 'result', clip: 'result', at: 0.6, from: 0, length: 5 },
  { name: 'road', clip: 'map2', at: 1.5, from: 0, length: 3 },
  { name: 'gate', clip: 'gate', at: 2.0, from: 0, length: 3 },
  { name: 'tomato', clip: 'tomato', at: 'target', from: -0.5, length: 1.5 },
  { name: 'bubble', clip: 'bubble', at: 'target', from: -0.5, length: 1.5 },
  { name: 'trombone', clip: 'trombone', at: 'target', from: -0.5, length: 1.5 },
  { name: 'popcorn', clip: 'popcorn', at: 'target', from: -0.5, length: 1.5 },
  { name: 'scratch', clip: 'scratch', at: 'target', from: 0, length: 1 },
  { name: 'frog', clip: 'frog', at: 'target', from: 0, length: 1 },
  { name: 'icecream', clip: 'icecream', at: 'target', from: 0, length: 1 },
  { name: 'camera', clip: 'camera', at: 'target', from: 0, length: 1 },
  { name: 'scissors', clip: 'scissors', at: 'target', from: 1.0, length: 2.5 },
];
mkdirSync(out, { recursive: true });
for (const shot of SHOTS) {
  const metaPath = `${src}/${shot.clip}.json`;
  const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {};
  const point = shot.at === 'target' ? meta.firstTarget : shot.at;
  if (typeof point !== 'number') { console.log(`skip ${shot.name}: no sync point in ${metaPath}`); continue; }
  const start = Math.max(0, point + shot.from - HANDLE);
  const duration = HANDLE + shot.length;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', start.toFixed(3), '-i', `${src}/${shot.clip}.mp4`, '-t', duration.toFixed(3), '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${out}/${shot.name}.mp4`]);
  console.log(`${shot.name}: ${shot.clip} from ${start.toFixed(3)} s for ${duration.toFixed(2)} s (sync at ${point.toFixed(3)})`);
}
