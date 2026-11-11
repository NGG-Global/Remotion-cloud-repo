/**
 * Checks the Münzer edit (src/munzer/data/edl.ts) for the film's rule that
 * no piece of archive appears twice, and for ranges that run off the end of
 * a source clip.
 *
 * It compiles the edit and the timeline with tsc into a scratch folder,
 * resolves every shot to film time exactly as the composition does, and
 * lists the source range each clip shot and each still draws on.
 *
 * Usage: node tools/munzer-ledger.mjs [--list]
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const out = fs.mkdtempSync(path.join(os.tmpdir(), "munzer-ledger-"));
execFileSync(
  "npx",
  [
    "tsc",
    "--outDir", out,
    "--module", "commonjs",
    "--target", "es2022",
    "--moduleResolution", "node",
    "--jsx", "react-jsx",
    "--skipLibCheck",
    "--esModuleInterop",
    "--noEmitOnError", "false",
    "src/munzer/data/edl.ts",
    "src/munzer/engine/timeline.ts",
  ],
  { stdio: "inherit" },
);
fs.writeFileSync(path.join(out, "package.json"), '{"type":"commonjs"}');
const find = (name) => {
  for (const dir of [path.join(out, "munzer"), out]) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`compiled ${name} not found under ${out}`);
};
const require = createRequire(import.meta.url);
const { SHOTS, STILLS } = require(find("data/edl.js"));
const tl = require(find("engine/timeline.js"));

const DUR = {
  am88: 406.6, a90: 103.5, o90: 275.5, pj93: 250.8, o94: 144.6, a95: 156.6, a96: 141.3, ar70: 366.6,
};
const FPS = 30;
const fr = (s) => Math.round(s * FPS);
const starts = SHOTS.map((s) => fr(tl.resolve(s.at)));
const END = tl.FILM_FRAMES;
const uses = [];
let problems = 0;

SHOTS.forEach((s, i) => {
  const next = SHOTS[i + 1];
  const overlap = next?.enter?.kind === "fade" ? fr(next.enter.d) : 0;
  const len = ((i + 1 < SHOTS.length ? starts[i + 1] : END) + overlap - starts[i]) / FPS;
  if (len <= 0.2) {
    console.log(`SHORT  ${s.id}: ${len.toFixed(2)} s`);
    problems++;
  }
  if (s.kind === "clip") {
    const a = s.src;
    const b = s.src + len * (s.rate ?? 1);
    uses.push({ id: s.id, clip: s.clip, a, b, film: starts[i] / FPS, len });
    if (b > DUR[s.clip] + 0.01) {
      console.log(`PAST END  ${s.id}: ${s.clip} ${a.toFixed(2)}-${b.toFixed(2)} (clip is ${DUR[s.clip]} s)`);
      problems++;
    }
  }
});
for (const [name, st] of Object.entries(STILLS)) {
  uses.push({ id: `still:${name}`, clip: st.clip, a: st.t - 0.2, b: st.t + 0.2, film: -1, len: 0 });
}
// Insert sound must come from the same source moments as its picture, or
// from moments nobody else uses.
for (const ins of tl.INSERTS) {
  if (!ins.sound) continue;
  const pic = uses.find((u) => Math.abs(u.film - tl.insertStart(ins.id)) < 0.05);
  const a = ins.sound.from;
  const b = a + ins.dur;
  if (!pic || pic.clip !== ins.sound.clip || Math.abs(pic.a - a) > 0.05) {
    console.log(`INSERT SOUND  ${ins.id}: ${ins.sound.clip} ${a}-${b.toFixed(2)} does not match its picture`);
    problems++;
  }
}

const byClip = {};
for (const u of uses) (byClip[u.clip] ??= []).push(u);
for (const [clip, list] of Object.entries(byClip)) {
  list.sort((x, y) => x.a - y.a);
  for (let i = 1; i < list.length; i++) {
    const p = list[i - 1];
    const q = list[i];
    if (q.a < p.b - 0.02) {
      console.log(`REUSED  ${clip}: ${p.id} [${p.a.toFixed(2)}-${p.b.toFixed(2)}] overlaps ${q.id} [${q.a.toFixed(2)}-${q.b.toFixed(2)}]`);
      problems++;
    }
  }
}

if (process.argv.includes("--list")) {
  for (const [clip, list] of Object.entries(byClip)) {
    const used = list.reduce((s, u) => s + (u.b - u.a), 0);
    console.log(`\n${clip}: ${list.length} uses, ${used.toFixed(1)} s of ${DUR[clip]} s`);
    for (const u of list) console.log(`  ${u.a.toFixed(2).padStart(7)} - ${u.b.toFixed(2).padStart(7)}  ${u.id}`);
  }
}
if (process.argv.includes("--mid")) {
  // Mid-point frame of every shot, for a QA contact sheet.
  const mids = SHOTS.map((s, i) => {
    const b = i + 1 < SHOTS.length ? starts[i + 1] : END;
    return Math.round((starts[i] + b) / 2);
  });
  fs.writeFileSync("out/munzer-mid-frames.txt", mids.join(","));
  fs.writeFileSync("out/munzer-shot-ids.txt", SHOTS.map((s, i) => `${mids[i]} ${s.id}`).join("\n"));
}
const anims = fs.readFileSync("src/munzer/anim/index.ts", "utf8");
for (const s of SHOTS) {
  if (s.kind === "anim" && !new RegExp(`\\b${s.anim},`).test(anims)) {
    console.log(`UNKNOWN SCENE  ${s.id}: ${s.anim}`);
    problems++;
  }
}
console.log(`\n${SHOTS.length} shots, ${(END / FPS).toFixed(2)} s film, ${problems} problem(s).`);
fs.rmSync(out, { recursive: true, force: true });
process.exit(problems ? 1 : 0);
