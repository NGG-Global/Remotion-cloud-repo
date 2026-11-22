/**
 * Builds the soundtrack: a synthesised score and effects under the three
 * narration files, mixed to public/hiroshima/audio/mix.wav.
 *
 *   node --experimental-strip-types tools/hiroshima/score.mjs
 *
 * Nothing here is sampled: the drone, the clock, the aircraft, the riser into
 * each flash, the blast and the rain are generated from oscillators and
 * seeded noise, so the score carries no third-party rights and renders the
 * same every time. Cue times come from the shot list (src/hiroshima/data/edit.ts).
 *
 * The narration stays the subject: the bed sits about 20 dB under the voice,
 * swells only into the gaps between sections, and the blasts are placed where
 * the narrator pauses.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const { NARRATION, END, FLASHES, RAIN, CHAPTERS, P1, P2, P3 } =
  await import("../../src/hiroshima/data/edit.ts");

const SR = 48000;
const N = Math.ceil(END * SR);
const bed = new Float32Array(N);
const fx = new Float32Array(N);

// Seeded noise, so the score is identical on every run.
let seed = 0x9e3779b9;
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
// One chord per stretch of the film, voiced low; partials beat slowly against
// detuned twins so the bed breathes instead of humming.
const sections = [
  { at: 0, root: 55.0, third: 65.41 }, // A minor
  { at: CHAPTERS[0].at, root: 49.0, third: 58.27 }, // G minor
  { at: CHAPTERS[1].at, root: 43.65, third: 51.91 }, // F minor
  { at: CHAPTERS[3].at, root: 46.25, third: 55.0 }, // F# dim colour
  { at: P2, root: 41.2, third: 49.0 }, // E minor
  { at: CHAPTERS[6].at, root: 49.0, third: 58.27 },
  { at: P3, root: 55.0, third: 65.41 },
  { at: CHAPTERS[7].at, root: 43.65, third: 51.91 },
];
const sectionAt = (t) => {
  let s = sections[0];
  for (const x of sections) if (t >= x.at) s = x;
  return s;
};

{
  const phases = new Float64Array(10);
  let air = 0;
  let air2 = 0;
  let curRoot = sections[0].root;
  let curThird = sections[0].third;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const sec = sectionAt(t);
    // Glide between chords over ~4 s.
    curRoot += (sec.root - curRoot) * 0.000006;
    curThird += (sec.third - curThird) * 0.000006;
    const freqs = [
      curRoot,
      curRoot * 1.0035,
      curRoot * 1.5,
      curRoot * 1.5 * 0.998,
      curRoot * 2,
      curThird * 2,
      curThird * 2 * 1.003,
      curRoot * 3,
      curRoot * 4,
      curThird * 4,
    ];
    const amps = [0.32, 0.26, 0.16, 0.14, 0.12, 0.09, 0.08, 0.04, 0.025, 0.02];
    let v = 0;
    for (let k = 0; k < freqs.length; k++) {
      phases[k] += (2 * Math.PI * freqs[k]) / SR;
      if (phases[k] > 2 * Math.PI) phases[k] -= 2 * Math.PI;
      v += Math.sin(phases[k]) * amps[k];
    }
    const lfo =
      0.75 +
      0.25 *
        Math.sin((2 * Math.PI * t) / 23) *
        Math.sin((2 * Math.PI * t) / 37);
    // Air: low-passed noise.
    air += 0.02 * (noise() - air);
    air2 += 0.02 * (air - air2);
    bed[i] = v * lfo * 0.55 + air2 * 0.9;
  }
}

// Level automation: quieter under the voice, a little fuller in the breaths
// between the three narration files. The target gain is smoothed with a
// ~0.8 s follower so the steps never click.
const voiced = (t) =>
  NARRATION.some((n) => t >= n.at - 0.3 && t <= n.at + n.length + 0.3);
{
  let g = db(-17);
  const k = 1 / (SR * 0.8);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let target = voiced(t) ? db(-24) : db(-17);
    // Chapter swells: up to +4 dB, rising and falling over 5 s.
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

/** A clock tick: a click and a short resonant ping. */
const tick = (strong) => {
  const L = Math.round(0.09 * SR);
  const out = new Float32Array(L);
  let p = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    p += (2 * Math.PI * (strong ? 2100 : 1800)) / SR;
    const click = j < 0.004 * SR ? noise() * (1 - j / (0.004 * SR)) : 0;
    out[j] =
      (click * 0.6 + Math.sin(p) * Math.exp(-t / 0.018) * 0.35) *
      (strong ? 1 : 0.8);
  }
  return out;
};

/** B-29 drone: two buzzing tones beating like propellers, low-passed. */
const engine = (dur) => {
  const L = Math.round(dur * SR);
  const out = new Float32Array(L);
  let p1 = 0;
  let p2 = 0;
  let lp = 0;
  let lp2 = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    p1 += (2 * Math.PI * 71) / SR;
    p2 += (2 * Math.PI * 73.3) / SR;
    const saw =
      ((p1 / (2 * Math.PI)) % 1) * 2 - 1 + (((p2 / (2 * Math.PI)) % 1) * 2 - 1);
    lp += 0.05 * (saw - lp);
    lp2 += 0.05 * (lp - lp2);
    const env = smooth(clamp01(t / 2.5)) * smooth(clamp01((dur - t) / 1.5));
    out[j] = lp2 * env * (0.8 + 0.2 * Math.sin(2 * Math.PI * 6.8 * t));
  }
  return out;
};

/** The rise into a flash: filtered noise opening up and a climbing tone. */
const riser = (dur) => {
  const L = Math.round(dur * SR);
  const out = new Float32Array(L);
  let lp = 0;
  let p = 0;
  for (let j = 0; j < L; j++) {
    const u = j / L;
    const cutoff = 200 + 5000 * u * u;
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp += a * (noise() - lp);
    p += (2 * Math.PI * (110 + 500 * u * u)) / SR;
    out[j] = (lp * 0.7 + Math.sin(p) * 0.25) * Math.pow(u, 2.2);
  }
  return out;
};

/** The blast: a falling sub, a body of low noise, a crack, a long rumble. */
const blast = (scale = 1, length = 9) => {
  const L = Math.round(length * SR);
  const out = new Float32Array(L);
  let p = 0;
  let b1 = 0;
  let b2 = 0;
  let r1 = 0;
  let r2 = 0;
  let hp = 0;
  let prev = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    const f = 24 + 40 * Math.exp(-t / 0.5);
    p += (2 * Math.PI * f) / SR;
    const atk = clamp01(t / 0.006);
    const sub = Math.sin(p) * Math.exp(-t / 2.4) * atk;
    const n = noise();
    b1 += 0.025 * (n - b1);
    b2 += 0.025 * (b1 - b2);
    const body = b2 * 7 * Math.exp(-t / 1.3) * atk;
    r1 += 0.008 * (n - r1);
    r2 += 0.008 * (r1 - r2);
    const rumble = r2 * 16 * Math.exp(-t / 4.5) * smooth(clamp01(t / 0.4));
    hp = 0.9 * (hp + n - prev);
    prev = n;
    const crack = hp * Math.exp(-t / 0.05) * 0.5;
    out[j] =
      Math.tanh((sub * 0.95 + body + rumble * 0.8 + crack) * 1.2) * scale;
  }
  return out;
};

/** A low hit, for the "2" and the series sting. */
const thump = (scale = 1) => {
  const L = Math.round(2.5 * SR);
  const out = new Float32Array(L);
  let p = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    p += (2 * Math.PI * (38 + 30 * Math.exp(-t / 0.15))) / SR;
    out[j] = Math.sin(p) * Math.exp(-t / 0.7) * clamp01(t / 0.004) * scale;
  }
  return out;
};

/** A reversed swell (whoosh) that lands on `dur`. */
const swell = (dur) => {
  const L = Math.round(dur * SR);
  const out = new Float32Array(L);
  let lp = 0;
  for (let j = 0; j < L; j++) {
    const u = j / L;
    lp += 0.06 * (noise() - lp);
    out[j] = lp * Math.pow(u, 3) * 1.6;
  }
  return out;
};

/** Rain: band-limited hiss with scattered drops. */
const rain = (dur, strength) => {
  const L = Math.round(dur * SR);
  const out = new Float32Array(L);
  let lp = 0;
  let hp = 0;
  let prev = 0;
  let drop = 0;
  for (let j = 0; j < L; j++) {
    const t = j / SR;
    const n = noise();
    lp += 0.35 * (n - lp);
    hp = 0.97 * (hp + lp - prev);
    prev = lp;
    if (rnd() < 0.0009) drop = 0.5 + rnd() * 0.5;
    drop *= 0.992;
    const env = smooth(clamp01(t / 2)) * smooth(clamp01((dur - t) / 2));
    out[j] = (hp * 0.35 + drop * noise() * 0.5) * env * strength;
  }
  return out;
};

// Cold open: the clock, ticking from the first words until the release.
for (let t = 0.2; t < 34.3; t += 1.0)
  add(
    fx,
    t,
    tick(Math.round(t) % 2 === 0).map((x) => x * db(-12)),
  );
// The aircraft, from the first sight of it to the flash.
add(
  fx,
  17.6,
  engine(41.8 - 17.6).map((x) => x * db(-21)),
);

// Each flash: a riser cut dead, a beat of nothing, then the blast.
FLASHES.forEach((at, k) => {
  const primary = k < 2; // Hiroshima and Nagasaki; the later two are recalled
  add(
    fx,
    at - 3.2,
    riser(3.2).map((x) => x * db(primary ? -15 : -21)),
  );
  add(fx, at + 0.12, blast(primary ? db(-4) : db(-10), primary ? 9 : 6));
});

// The series mark, open and close.
for (const at of [86.4, 1395.4]) {
  add(
    fx,
    at - 1.2,
    swell(1.2).map((x) => x * db(-18)),
  );
  add(fx, at, thump(db(-10)));
}
// "He survived two."
add(fx, 1089.9 + 3.15, thump(db(-6)));
add(fx, 1089.9 + 3.15, blast(db(-18), 3));

// Black rain.
for (const [a, b, s] of RAIN) add(fx, a, rain(b - a, s * db(-20)));

// ------------------------------------------------------------------ write
const work = path.resolve(".cache/score");
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

// Mix: narration at unity, the score under it, the effects slightly wider.
// Loudness is normalised for YouTube's reference (-14 LUFS) with headroom.
const A = "public/hiroshima/audio";
const inputs = [];
const parts = [];
NARRATION.forEach((n, k) => {
  inputs.push("-i", path.join("public", n.file));
  const ms = Math.round(n.at * 1000);
  parts.push(
    `[${k}]aresample=48000,adelay=${ms}|${ms},aformat=channel_layouts=stereo[n${k}]`,
  );
});
inputs.push("-i", path.join(work, "bed.wav"), "-i", path.join(work, "fx.wav"));
parts.push(
  `[3]aformat=channel_layouts=stereo,aecho=0.8:0.7:40|57:0.25|0.2[bed]`,
);
parts.push(`[4]aformat=channel_layouts=stereo[fx]`);
parts.push(
  `[n0][n1][n2][bed][fx]amix=inputs=5:normalize=0:duration=longest,atrim=0:${END},loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000,aformat=sample_fmts=s16:channel_layouts=stereo[out]`,
);
execFileSync("ffmpeg", [
  "-v",
  "error",
  "-y",
  ...inputs,
  "-filter_complex",
  parts.join(";"),
  "-map",
  "[out]",
  "-ar",
  "48000",
  path.join(A, "mix.wav"),
]);
console.log(`wrote ${A}/mix.wav (${END} s)`);
