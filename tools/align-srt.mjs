/**
 * Re-times a subtitle file against a whisper.cpp transcript of the same
 * narration, and rewrites the beat table in src/doc/beats.ts.
 *
 * Why: the SRT delivered with the voice track was generated from the text,
 * with the pauses between paragraphs collapsed, so its timings drift up to
 * twenty seconds behind the audio by the end. The transcript is measured from
 * the audio itself. Matching the two word sequences gives anchor pairs
 * (subtitle time, audio time); the beats are moved through a monotone
 * piecewise-linear map built from those anchors.
 *
 * Usage:
 *   node tools/align-srt.mjs public/audio/jack-narration.srt \
 *        public/audio/jack-narration.mp3.transcript.json src/doc/beats.ts
 *
 * Writes <srt>.aligned.json with the anchors, and rewrites the `at` values in
 * the beats file in place.
 */
import fs from "node:fs";

const [srtPath, transcriptPath, beatsPath] = process.argv.slice(2);
if (!srtPath || !transcriptPath) {
  console.error("Usage: node tools/align-srt.mjs <srt> <transcript.json> [beats.ts]");
  process.exit(1);
}

const toSeconds = (t) => {
  const m = t.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
};

/** Hebrew-aware normalisation: drop stage tags, punctuation, quotes. */
const normalise = (s) =>
  s
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[^֐-׿\w\s]/g, " ")
    .replace(/["'׳״]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

// ---- subtitle words, each with an estimated time ---------------------------
const srt = fs.readFileSync(srtPath, "utf8").replace(/\r/g, "");
const cues = [];
for (const block of srt.split(/\n\n+/)) {
  const lines = block.trim().split("\n");
  if (lines.length < 3) continue;
  const times = lines[1].match(/(\S+)\s+-->\s+(\S+)/);
  if (!times) continue;
  cues.push({ from: toSeconds(times[1]), to: toSeconds(times[2]), text: lines.slice(2).join(" ") });
}
const srtWords = [];
for (const cue of cues) {
  const words = normalise(cue.text);
  const chars = words.reduce((a, w) => a + w.length + 1, 0);
  let acc = 0;
  for (const w of words) {
    srtWords.push({ w, t: cue.from + ((acc + w.length / 2) / chars) * (cue.to - cue.from) });
    acc += w.length + 1;
  }
}

// ---- transcript words --------------------------------------------------------
// Accepts either the tool's own transcript ({from,to,text}[]) or whisper.cpp's
// native JSON ({transcription:[{offsets:{from,to},text}]}, offsets in ms).
const raw = JSON.parse(fs.readFileSync(transcriptPath, "utf8"));
const transcript = Array.isArray(raw)
  ? raw
  : raw.transcription.map((seg) => ({ from: seg.offsets.from / 1000, to: seg.offsets.to / 1000, text: seg.text }));
const asrWords = [];
for (const seg of transcript) {
  const words = normalise(seg.text);
  const span = Math.max(0.01, seg.to - seg.from);
  words.forEach((w, i) => asrWords.push({ w, t: seg.from + (span * (i + 0.5)) / words.length }));
}

// ---- longest-common-subsequence style alignment (banded DP) ------------------
const A = srtWords.map((x) => x.w);
const B = asrWords.map((x) => x.w);
const similar = (a, b) => {
  if (a === b) return 1;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return 0.8;
  if (a.length >= 5 && b.length >= 5 && a.slice(1) === b.slice(1)) return 0.6; // prefix letter (ו/ה/ב) differs
  return 0;
};
const n = A.length;
const m = B.length;
const band = Math.max(200, Math.floor(Math.abs(n - m) * 1.5) + 200);
const score = new Map();
const key = (i, j) => i * (m + 1) + j;
const get = (i, j) => score.get(key(i, j)) ?? 0;
const back = new Map();
for (let i = 1; i <= n; i++) {
  const jc = Math.round((i * m) / n);
  const j0 = Math.max(1, jc - band);
  const j1 = Math.min(m, jc + band);
  for (let j = j0; j <= j1; j++) {
    const s = similar(A[i - 1], B[j - 1]);
    let best = get(i - 1, j);
    let dir = 1;
    if (get(i, j - 1) > best) {
      best = get(i, j - 1);
      dir = 2;
    }
    if (s > 0 && get(i - 1, j - 1) + s > best) {
      best = get(i - 1, j - 1) + s;
      dir = 3;
    }
    score.set(key(i, j), best);
    back.set(key(i, j), dir);
  }
}
const anchors = [];
let i = n;
let j = m;
while (i > 0 && j > 0) {
  const dir = back.get(key(i, j));
  if (dir === 3) {
    anchors.push({ srt: srtWords[i - 1].t, asr: asrWords[j - 1].t, w: A[i - 1] });
    i--;
    j--;
  } else if (dir === 1 || dir === undefined) i--;
  else j--;
}
anchors.reverse();

// Enforce monotonicity and drop outliers: the offset should move smoothly.
const smooth = [];
for (const a of anchors) {
  const prev = smooth[smooth.length - 1];
  if (prev && (a.asr <= prev.asr || a.srt <= prev.srt)) continue;
  if (prev && Math.abs(a.asr - a.srt - (prev.asr - prev.srt)) > 4) continue;
  smooth.push(a);
}
console.log(`subtitle words ${n}, transcript words ${m}, anchors ${anchors.length}, kept ${smooth.length}`);

const mapTime = (t) => {
  if (t <= smooth[0].srt) return t + (smooth[0].asr - smooth[0].srt);
  for (let k = 1; k < smooth.length; k++) {
    if (t <= smooth[k].srt) {
      const a = smooth[k - 1];
      const b = smooth[k];
      const f = (t - a.srt) / Math.max(1e-6, b.srt - a.srt);
      return a.asr + f * (b.asr - a.asr);
    }
  }
  const last = smooth[smooth.length - 1];
  return t + (last.asr - last.srt);
};

fs.writeFileSync(`${srtPath}.aligned.json`, JSON.stringify({ anchors: smooth }, null, 1));

// Report the drift at each cue start.
for (const cue of cues.filter((_, k) => k % 10 === 0)) {
  console.log(`${cue.from.toFixed(2)} -> ${mapTime(cue.from).toFixed(2)}  (${(mapTime(cue.from) - cue.from).toFixed(2)})  ${cue.text.slice(0, 40)}`);
}

if (beatsPath) {
  let src = fs.readFileSync(beatsPath, "utf8");
  let count = 0;
  src = src.replace(/\{ at: ([\d.]+), id: "([^"]+)" \}/g, (all, at, id) => {
    count++;
    const mapped = Math.round(mapTime(+at) * 100) / 100;
    return `{ at: ${mapped}, id: "${id}" }`;
  });
  fs.writeFileSync(beatsPath, src);
  console.log(`rewrote ${count} beats in ${beatsPath}`);
}
