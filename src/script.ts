/**
 * The video's timeline.
 *
 * `at` is the second in the narration at which each beat begins, taken from a
 * transcription of `public/audio/narration.mp3`. Scene lengths are derived
 * from the gaps between beats rather than written out, so re-timing a beat
 * cannot leave a scene overlapping its neighbour.
 *
 * On-screen text is written to reinforce the narration, not to duplicate it:
 * short phrases using the narrator's own terms. Nothing here is a caption.
 */

export type Beat = {
  /** Second at which this beat starts. */
  readonly at: number;
  /** Identifier, used to look the beat up when composing the video. */
  readonly id: string;
};

/** Total length of the narration, in seconds. */
export const NARRATION_SECONDS = 218.57;

export const BEATS = [
  { at: 0.0, id: "hook" },
  { at: 5.38, id: "title" },
  { at: 12.08, id: "roadmap" },
  { at: 20.48, id: "chapter-what" },
  { at: 22.76, id: "not-search" },
  { at: 29.34, id: "give-it" },
  { at: 42.64, id: "strengths" },
  { at: 53.6, id: "assistant" },
  { at: 61.98, id: "chapter-tasks" },
  { at: 67.1, id: "task-read" },
  { at: 77.38, id: "task-write" },
  { at: 88.02, id: "task-think" },
  { at: 97.34, id: "task-order" },
  { at: 106.4, id: "rule" },
  { at: 114.24, id: "chapter-spaces" },
  { at: 120.78, id: "spaces-tour" },
  { at: 149.4, id: "microsoft" },
  { at: 159.86, id: "next-video-teaser" },
  { at: 163.04, id: "chapter-limits" },
  { at: 166.54, id: "limit-accuracy" },
  { at: 177.96, id: "limit-judgement" },
  { at: 192.66, id: "limit-privacy" },
  { at: 201.96, id: "limit-effort" },
  { at: 207.94, id: "bottom-line" },
  { at: 213.62, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatId = (typeof BEATS)[number]["id"];

/** Start second of a beat. */
export const beatAt = (id: BeatId): number => {
  const beat = BEATS.find((b) => b.id === id);
  if (!beat) {
    throw new Error(`Unknown beat: ${id}`);
  }
  return beat.at;
};

/**
 * Length of a beat in seconds — up to the next beat, or to the end of the
 * narration for the final one.
 */
export const beatLength = (id: BeatId): number => {
  const index = BEATS.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error(`Unknown beat: ${id}`);
  }
  const next = BEATS[index + 1];
  return (next ? next.at : NARRATION_SECONDS) - BEATS[index].at;
};
