import type { Word } from "./captions";
import { WORD_DATA } from "./data/words";

export const WORDS: readonly Word[] = WORD_DATA.map(([text, start, end]) => ({
  text,
  start,
  end,
}));

const norm = (s: string): string => s.replace(/[.,?!:;"'״׳–—-]/g, "").trim();

const NORMED = WORDS.map((w) => norm(w.text));

/**
 * Finds spoken phrases on the narration track, in order.
 *
 * Scenes are placed by what is said rather than by hard-coded seconds, so a
 * re-timed track (a different slowdown, a re-transcription) moves every cut
 * with it. Each lookup starts after the previous match, which keeps repeated
 * words ("וקטור", "מושג") pointing at the right occurrence. A phrase that is
 * not found throws, so a typo fails the render instead of mis-timing a scene.
 */
export const makeCues = () => {
  let cursor = 0;
  const find = (phrase: string): number => {
    const target = phrase.split(/\s+/).map(norm).filter(Boolean);
    for (let i = cursor; i <= NORMED.length - target.length; i++) {
      let ok = true;
      for (let k = 0; k < target.length; k++) {
        if (NORMED[i + k] !== target[k]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        cursor = i + 1;
        return i;
      }
    }
    throw new Error(`Cue not found after word ${cursor}: "${phrase}"`);
  };
  return {
    /** Start (s) of the phrase's first word. */
    at: (phrase: string): number => WORDS[find(phrase)].start,
    /** End (s) of the phrase's last word. */
    end: (phrase: string): number => {
      const i = find(phrase);
      const n = phrase.split(/\s+/).filter((p) => norm(p)).length;
      return WORDS[i + n - 1].end;
    },
  };
};

export const NARRATION_END = WORDS[WORDS.length - 1].end;
