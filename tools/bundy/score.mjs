/**
 * Builds the soundtrack for the Bundy film: a synthesised score under the
 * three narration files, mixed to public/bundy/audio/mix.wav.
 *
 *   node --experimental-strip-types tools/bundy/score.mjs
 *
 * Everything is generated from oscillators and seeded noise (no samples), so
 * the score carries no third-party rights and renders identically each time.
 * Cue times come from the shot list (src/bundy/data/edit.ts).
 *
 * The voice is the subject. The bed sits well under it; the low hits land on
 * the beats the edit marks in HITS; a sparse, high motif sits under the
 * childhood chapter and the roll of names.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const { NARRATION, END, HITS, CHAPTERS, P2, P3 } = await import(
  "../../src/bundy/data/edit.ts"
);

const SR = 48000;
const N = Math.ceil(END * SR);
const bed = new Float32Array(N);
const fx = new Float32Array(N);

let seed = 0x2545f491;
const rnd = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const db = (d) => Math.pow(10, d / 20);
const smooth = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// ------------------------------------------------------------------ drone
// Low minor voicings that change with the chapters; the flat-five colour
// arrives with the crimes and stays until the trial.
const ch = (i) => CHAPTERS[i].at;
const sections = [
  { at: 0, root: 43.65, third: 51.91, fifth: 65.41 }, // F minor
  { at: ch(0), root: 49.0, third: 58.27, fifth: 73.42 }, // G minor
  { at: ch(1), root: 46.25, third: 55.0, fifth: 65.41 }, // F# dim colour
  { at: P2, root: 41.2, third: 49.0, fifth: 58.27 }, // E dim colour
  { at: ch(4), root: 43.65, third: 51.91, fifth: 61.74 }, // F dim colour
  { at: ch(5), root: 41.2, third: 49.0, fifth: 61.74 }, // E minor
  { at: P3, root: 38.89, third: 46.25, fifth: 58.27 }, // D# minor
  { at: ch(7), root: 43.65, third: 51.91, fifth: 65.41 }, // F minor
];
const sectionAt = (t) => {
  let s = sections[0];
  for (const x of sections) if (t >= x.at) s = x;
  return s;
};

{
  const phases = new Float64Array(9);
  let air = 0;
  let air2 = 0;
  let r = sections[0].root;
  let th = sections[0].third;
  let fi = sections[0].fifth;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const sec = sectionAt(t);
    r += (sec.root - r) * 0.000005;
    th += (sec.third - th) * 0.000005;
    fi += (sec.fifth - fi) * 0.000005;
    const freqs = [r, r * 1.004, fi, fi * 0.997, r * 2, th * 2, th * 2 * 1.003, fi * 2, r * 4];
    const amps = [0.34, 0.26, 0.15, 0.13, 0.1, 0.08, 0.07, 0.035, 0.018];
    let v = 0;
    for (let k = 0; k < freqs.length; k++) {
      phases[k] += (2 * Math.PI * freqs[k]) / SR;
      if (phases[k] > 2 * Math.PI) phases[k] -= 2 * Math.PI;
      v += Math.sin(phases[k]) * amps[k];
    }
    const lfo = 0.72 + 0.28 * Math.sin((2 * Math.PI * t) / 29) * Math.sin((2 * Math.PI * t) / 41);
    air += 0.015 * (noise() - air);
    air2 += 0.015 * (air - air2);
    bed[i] = v * lfo * 0.55 + air2 * 1.1;
  }
}

// Level: well under the voice, fuller in the gaps, a swell at each chapter.
const voiced = (t) => NARRATION.some((n) => t >= n.at - 0.3 && t <= n.at + n.length + 0.3);
{
  let g = db(-18);
  const k = 1 / (SR * 0.8);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let target = voiced(t) ? db(-25) : db(-18);
    for (const c of CHAPTERS) {
      const u = (t - c.at + 1) / 5;
      if (u > 0 && u < 1) target *= 1 + 0.6 * Math.sin(Math.PI * u);
    }
    g += (target - g) * k;
    bed[i] *= g * smooth(clamp01(t / 4)) * smooth(clamp01((END - t) / 5));
  }
}

// ----------------------------------------------------------------- events
const add = (buf, start, samples) => {
  const s0 = Math.round(start * SR);
  for (let j = 0; j < samples.length; j++) {
    const i = s0 + j;
    if (i >= 0 && i < N) buf[i] += samples[j];
  }
};

/** A low hit: a falling sine with a short body of low noise. */
const thump = (scale = 1) => {
  const L = Math.round(3 * SR);
  const out = new Float32Array(L);
  let p = 0;
  let b1 = 0;
  let b2 = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    p += (2 * Math.PI * (36 + 28 * Math.exp(-t / 0.14))) / SR;
    const n = noise();
    b1 += 0.03 * (n - b1);
    b2 += 0.03 * (b1 - b2);
    const atk = clamp01(t / 0.004);
    out[j] = Math.tanh((Math.sin(p) * Math.exp(-t / 0.8) + b2 * 3 * Math.exp(-t / 0.35)) * atk * 1.1) * scale;
  }
  return out;
};

/** A reversed swell that lands on its end. */
const swell = (dur) => {
  const L = Math.round(dur * SR);
  const out = new Float32Array(L);
  let lp = 0;
  for (let j = 0; j < L; j++) {
    const u = j / L;
    lp += 0.05 * (noise() - lp);
    out[j] = lp * Math.pow(u, 3) * 1.6;
  }
  return out;
};

/** A soft, bell-like pluck. */
const pluck = (freq, scale = 1) => {
  const L = Math.round(3.5 * SR);
  const out = new Float32Array(L);
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    p1 += (2 * Math.PI * freq) / SR;
    p2 += (2 * Math.PI * freq * 2.01) / SR;
    p3 += (2 * Math.PI * freq * 3.98) / SR;
    const atk = clamp01(t / 0.006);
    out[j] =
      (Math.sin(p1) * Math.exp(-t / 1.2) + 0.35 * Math.sin(p2) * Math.exp(-t / 0.5) + 0.12 * Math.sin(p3) * Math.exp(-t / 0.18)) *
      atk *
      scale;
  }
  return out;
};

/** A thin high tone that bends slowly: tension under the escapes. */
const tension = (dur, base) => {
  const L = Math.round(dur * SR);
  const out = new Float32Array(L);
  let p = 0;
  let q = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    const f = base * (1 + 0.006 * Math.sin((2 * Math.PI * t) / 7));
    p += (2 * Math.PI * f) / SR;
    q += (2 * Math.PI * f * 1.007) / SR;
    const env = smooth(clamp01(t / 3)) * smooth(clamp01((dur - t) / 3));
    out[j] = (Math.sin(p) + Math.sin(q)) * 0.5 * env;
  }
  return out;
};

// The hits, each with a short swell into it.
for (const at of HITS) {
  add(fx, at - 1.0, swell(1.0).map((x) => x * db(-24)));
  add(fx, at, thump(db(-12)));
}

// Tension beds: the Aspen window, the Glenwood ceiling, the Tallahassee night.
for (const [a, b, f] of [
  [36.8, 63.9, 587.3],
  [717.8, 766.9, 554.4],
  [796.9, 836.5, 523.3],
]) {
  add(fx, a, tension(b - a, f).map((x) => x * db(-36)));
}

// The motif: a falling minor figure, sparse, under the childhood chapter and
// the roll of names.
const motif = [392.0, 349.2, 311.1, 293.7, 311.1, 261.6];
const playMotif = (from, to, gapDb) => {
  let t = from;
  let k = 0;
  while (t < to - 3) {
    add(fx, t, pluck(motif[k % motif.length], db(gapDb)));
    t += k % motif.length === motif.length - 1 ? 4.8 : 1.6;
    k++;
  }
};
playMotif(132.4, 196.0, -32);
playMotif(1247.4, 1290.0, -31);

// ------------------------------------------------------------------ write
const work = path.resolve(".cache/score-bundy");
fs.mkdirSync(work, { recursive: true });
const writeWav = (file, data) => {
  const buf = Buffer.alloc(44 + data.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + data.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(-1, Math.min(1, data[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
};
writeWav(path.join(work, "bed.wav"), bed);
writeWav(path.join(work, "fx.wav"), fx);

const A = "public/bundy/audio";
const inputs = [];
const parts = [];
NARRATION.forEach((n, k) => {
  inputs.push("-i", path.join("public", n.file));
  const ms = Math.round(n.at * 1000);
  parts.push(`[${k}]aresample=48000,adelay=${ms}|${ms},aformat=channel_layouts=stereo[n${k}]`);
});
inputs.push("-i", path.join(work, "bed.wav"), "-i", path.join(work, "fx.wav"));
parts.push(`[3]aformat=channel_layouts=stereo,aecho=0.8:0.7:40|57:0.25|0.2[bed]`);
parts.push(`[4]aformat=channel_layouts=stereo,aecho=0.8:0.6:120:0.2[fx]`);
parts.push(
  `[n0][n1][n2][bed][fx]amix=inputs=5:normalize=0:duration=longest,atrim=0:${END},loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000,aformat=sample_fmts=s16:channel_layouts=stereo[out]`,
);
execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", parts.join(";"), "-map", "[out]", "-ar", "48000", path.join(A, "mix.wav")]);
console.log(`wrote ${A}/mix.wav (${END} s)`);
