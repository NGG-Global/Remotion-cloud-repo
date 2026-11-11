import { FPS } from "../theme";
import type { ClipId } from "../media";

/**
 * The film's clock.
 *
 * Every time in the edit is written in seconds of the narration MP3, which
 * is the master. The finished film is the narration with a few short
 * inserts cut into it: archive sound bites (the voice pauses while a 1988 MC
 * or a 1995 TV commentator speaks), the series title, and the end card.
 * Each insert sits inside a measured silence of the voice, so cutting the
 * narration there never clips a word.
 *
 * `outT(n)` maps a narration time to film time. Shots are placed by
 * narration time and converted here, so a change to one insert moves every
 * later shot with the voice and nothing can drift out of sync.
 */

export type Insert = {
  readonly id: string;
  /** Narration time at which the voice pauses for this insert. */
  readonly at: number;
  /** Seconds of film the insert adds. */
  readonly dur: number;
  /** Archive sound played during the insert, if any. */
  readonly sound?: {
    readonly clip: ClipId;
    /** Source second the sound starts at. */
    readonly from: number;
    readonly gain?: number;
  };
};

/** Measured end of the narration file (ffprobe), seconds. */
export const NARRATION_END = 1025.83;

export const INSERTS: readonly Insert[] = [
  // ESPN, Arnold Classic 1995: "Andreas Munzer, from Germany."
  // Voice silence 111.48-112.21.
  { id: "I1", at: 111.8, dur: 2.8, sound: { clip: "a95", from: 9.4 } },
  // The 1996 stage breathes for a moment before "no one in the audience".
  // Voice silence 138.73-139.15.
  { id: "I2", at: 138.95, dur: 1.7, sound: { clip: "a96", from: 123.7, gain: 0.55 } },
  // Series title. Voice silence 156.03-156.79.
  { id: "TITLE", at: 156.4, dur: 5.4 },
  // MC, Austria 1988: "...the great hope for the future, after Arnold
  // Schwarzenegger surely Austria's greatest talent." Silence 220.59-221.79.
  { id: "I4", at: 221.1, dur: 6.7, sound: { clip: "am88", from: 226.72 } },
  // ESPN, 1995: "There's no body fat there. I'm absolutely convinced he must
  // have less than 6% body fat." Silence 298.77-299.87.
  { id: "I5", at: 299.3, dur: 6.4, sound: { clip: "a95", from: 110.02 } },
  // End card holds after the last word.
  { id: "END", at: NARRATION_END, dur: 4.2 },
];

const sorted = [...INSERTS].sort((a, b) => a.at - b.at);

/** Film seconds of everything inserted strictly before narration time n. */
const insertedBefore = (n: number): number =>
  sorted.filter((i) => i.at <= n).reduce((s, i) => s + i.dur, 0);

/** Narration time -> film time. A time equal to an insert point lands after it. */
export const outT = (n: number): number => n + insertedBefore(n);

/** Film time at which an insert starts. */
export const insertStart = (id: string): number => {
  const ins = sorted.find((i) => i.id === id);
  if (!ins) {
    throw new Error(`Unknown insert ${id}`);
  }
  return ins.at + insertedBefore(ins.at - 1e-6);
};

export const getInsert = (id: string): Insert => {
  const ins = sorted.find((i) => i.id === id);
  if (!ins) {
    throw new Error(`Unknown insert ${id}`);
  }
  return ins;
};

/** A time in the edit: narration seconds, or seconds into an insert. */
export type T = number | { readonly ins: string; readonly t: number };

export const resolve = (t: T): number =>
  typeof t === "number" ? outT(t) : insertStart(t.ins) + t.t;

/** Total film length in seconds. */
export const FILM_END = outT(NARRATION_END + 1e-6);
export const FILM_FRAMES = Math.ceil(FILM_END * FPS);

/** The narration as pieces laid end to end around the inserts. */
export const NARRATION_PIECES: readonly { from: number; to: number; start: number }[] =
  (() => {
    const cuts = sorted.map((i) => i.at).filter((a) => a < NARRATION_END);
    const bounds = [0, ...cuts, NARRATION_END];
    const pieces: { from: number; to: number; start: number }[] = [];
    for (let k = 0; k < bounds.length - 1; k++) {
      pieces.push({
        from: bounds[k],
        to: bounds[k + 1],
        start: outT(bounds[k]),
      });
    }
    return pieces;
  })();

/**
 * Film time -> narration time. Inside an insert the narration is paused, so
 * this returns the insert point; graphics keyed to narration times hold.
 */
export const narrAt = (film: number): number => {
  for (const p of NARRATION_PIECES) {
    const end = p.start + (p.to - p.from);
    if (film < p.start) {
      return p.from;
    }
    if (film < end) {
      return p.from + (film - p.start);
    }
  }
  return NARRATION_END;
};

export const toFrames = (s: number): number => Math.round(s * FPS);
