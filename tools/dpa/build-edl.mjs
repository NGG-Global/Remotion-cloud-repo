/**
 * Builds src/dpa/data/edl.json from the editorial plan and the transcript.
 *
 *   node tools/dpa/build-edl.mjs
 *
 * Each beat in tools/dpa/plan.txt names a run of narration sentences. The cut
 * into a beat is placed a few frames ahead of its first word, never before the
 * previous sentence has finished, and snapped to a frame.
 *
 * Footage choices already made in edl.json are kept: a beat whose timing has
 * not changed carries its shots across, so the plan can be reworded without
 * losing the edit.
 */
import fs from "node:fs";
import path from "node:path";
import { EDL_PATH, readJson, ROOT, writeJson } from "./lib.mjs";

const FPS = 30;
const LEAD = 0.15;
const GAMES = {
  MOM: "Man of Medan",
  LH: "Little Hope",
  HOA: "House of Ashes",
  DIM: "The Devil in Me",
  CUR: "The Curator",
  UD: "Until Dawn",
  D8020: "Directive 8020",
  MIX: "Anthology",
};

const transcript = readJson(path.join(ROOT, "src/dpa/data/transcript.json"));
const { sentences, duration } = transcript;
const plan = fs.readFileSync(path.join(ROOT, "tools/dpa/plan.txt"), "utf8");

const beats = [];
let chapter = null;
for (const raw of plan.split("\n")) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  if (line.startsWith("@")) {
    chapter = line.slice(1).trim();
    continue;
  }
  const [range, game, transition, topic, need] = line
    .split("|")
    .map((s) => s.trim());
  const [first, last = first] = range.split("-").map(Number);
  if (!GAMES[game] || !need) {
    throw new Error(`Malformed plan line: ${line}`);
  }
  beats.push({
    first,
    last,
    chapter,
    game: GAMES[game],
    transition,
    topic,
    need,
  });
}

// Every sentence belongs to exactly one beat, in order.
let expected = 0;
for (const beat of beats) {
  if (beat.first !== expected || beat.last < beat.first) {
    throw new Error(
      `Plan skips or repeats a sentence at ${beat.first}-${beat.last} (expected ${expected}).`,
    );
  }
  expected = beat.last + 1;
}
if (expected !== sentences.length) {
  throw new Error(`Plan covers ${expected} of ${sentences.length} sentences.`);
}

const snap = (t) => Math.round(t * FPS) / FPS;
const previous = fs.existsSync(EDL_PATH) ? readJson(EDL_PATH).shots : [];
const counters = {};
const shots = [];

beats.forEach((beat, i) => {
  const prev = beats[i - 1];
  const next = beats[i + 1];
  const cutIn = (b, before) =>
    snap(Math.max(sentences[before.last].end, sentences[b.first].start - LEAD));
  const start = prev ? cutIn(beat, prev) : 0;
  const end = next ? cutIn(next, beat) : duration;
  counters[beat.chapter] = (counters[beat.chapter] ?? 0) + 1;
  const id = `${beat.chapter}-${String(counters[beat.chapter]).padStart(3, "0")}`;
  const base = {
    id,
    start: Number(start.toFixed(4)),
    end: Number(end.toFixed(4)),
    chapter: beat.chapter,
    game: beat.game,
    topic: beat.topic,
    narration: sentences
      .slice(beat.first, beat.last + 1)
      .map((s) => s.text)
      .join(" "),
    need: beat.need,
    source: null,
    in: null,
    transition: beat.transition,
  };
  // Carry over any footage already cut into this beat's time span.
  const kept = previous.filter(
    (shot) =>
      shot.source !== null &&
      shot.start >= base.start - 1e-6 &&
      shot.end <= base.end + 1e-6,
  );
  const covers =
    kept.length &&
    Math.abs(kept[0].start - base.start) < 1e-6 &&
    Math.abs(kept[kept.length - 1].end - base.end) < 1e-6;
  if (covers) {
    kept.forEach((shot, n) =>
      shots.push({
        ...base,
        ...shot,
        id: n ? `${id}${String.fromCharCode(97 + n)}` : id,
        chapter: beat.chapter,
        game: beat.game,
        topic: beat.topic,
        need: beat.need,
        narration: base.narration,
      }),
    );
  } else {
    shots.push(base);
  }
});

writeJson(EDL_PATH, {
  fps: FPS,
  width: 1280,
  height: 720,
  narration: transcript.source,
  duration,
  shots,
});

const sourced = shots.filter((s) => s.source !== null).length;
console.log(
  `${shots.length} shots across ${Object.keys(counters).length} chapters; ${sourced} sourced, ${shots.length - sourced} awaiting footage`,
);
