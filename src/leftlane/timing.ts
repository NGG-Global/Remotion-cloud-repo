/**
 * Every timing decision for the Left Lane commercial lives here.
 *
 * Units are frames at 30 fps unless a name says otherwise. Narration cut
 * points are seconds in the untouched master recording; the segments are
 * played straight from that file with trim offsets, so the edit is entirely
 * non-destructive and can be re-spaced by changing numbers in this file.
 */
export const FPS = 30;
export const sec = (s: number): number => Math.round(s * FPS);

/** Total runtime: 29 s. Narration ends at 26.07 s; the brand holds after it. */
export const TOTAL_FRAMES = sec(29);

/**
 * The master narration, as recorded, with word timings from a local
 * word-level transcription (whisper.cpp) cross-checked against a silence scan:
 *
 *   0.10 - 4.45   "When you're used to driving on the right, even getting
 *                  started can go slightly wrong."
 *   4.98 - 7.68   "Practice the switch before you pick up the keys."
 *   8.69 - 12.94  "Turns, roundabouts, keeping left, right in your browser."
 *                  Turns 8.69 · roundabouts 9.58 · keeping left 10.60 ·
 *                  right in your browser 11.83
 *   13.85 - 17.95 "So your first drive on the left doesn't feel like your
 *                  first drive ever."
 *   18.31 - 20.87 "Left Lane, practice before you drive."
 *
 * The gaps between sentences are digital silence (below -80 dBFS), so cutting
 * inside them adds nothing audible. Each segment below starts and ends inside
 * such a gap; no cut touches speech or a breath.
 */
export type NarrationSegment = {
  readonly id: string;
  /** Cut points in the master file, seconds. */
  readonly from: number;
  readonly to: number;
  /** Where the segment starts on the timeline, seconds. */
  readonly at: number;
};

export const NARRATION: readonly NarrationSegment[] = [
  { id: "habit", from: 0, to: 4.72, at: 0.5 },
  { id: "practice", from: 4.72, to: 8.2, at: 7.4 },
  { id: "montage", from: 8.2, to: 13.25, at: 11.4 },
  { id: "confidence", from: 13.25, to: 18.1, at: 17.0 },
  { id: "brand", from: 18.1, to: 21.0, at: 23.3 },
];

/** Timeline position of a moment in the master file, in frames. */
const cue = (segmentId: string, masterSeconds: number): number => {
  const segment = NARRATION.find((s) => s.id === segmentId);
  if (!segment) {
    throw new Error(`Unknown narration segment ${segmentId}`);
  }
  return sec(segment.at + (masterSeconds - segment.from));
};

/** Spoken beats on the timeline (frames), derived from the placement above. */
export const CUE = {
  onTheRight: cue("habit", 1.24),
  slightlyWrong: cue("habit", 3.6),
  wrongEnds: cue("habit", 4.45),
  practice: cue("practice", 4.98),
  keysEnd: cue("practice", 7.68),
  turns: cue("montage", 8.69),
  roundabouts: cue("montage", 9.58),
  keepingLeft: cue("montage", 10.6),
  inYourBrowser: cue("montage", 11.83),
  browserEnds: cue("montage", 12.94),
  soYourFirstDrive: cue("confidence", 13.85),
  everEnds: cue("confidence", 17.95),
  leftLane: cue("brand", 18.31),
  laneEnds: cue("brand", 18.94),
  practiceBefore: cue("brand", 19.41),
  narrationEnds: cue("brand", 20.87),
} as const;

/** Scene boundaries and transitions. */
export const SCENE = {
  /** 1 - HABIT: abstract road, vehicle drifts right, hesitates, corrects. */
  habit: { start: 0, end: sec(9.7) },
  /** The abstract road tilts into perspective and hands over to the product. */
  tilt: { start: sec(8.0), end: sec(9.3) },
  abstractFadeOut: { start: sec(9.15), end: sec(9.65) },
  simulatorFadeIn: { start: sec(9.05), end: sec(9.5) },

  /** 2 + 3 - the real simulator, three takes from the one recording. */
  clipA: { start: sec(9.2), end: sec(13.75) },
  clipB: { start: sec(13.75), end: CUE.inYourBrowser - 4 },
  clipC: { start: CUE.inYourBrowser - 4, end: sec(16.53) },

  /** 5 - CONFIDENCE: abstract road returns, vehicle drives correctly. */
  confidence: { start: sec(16.4), end: sec(22.2) },

  /** 6 - BRAND: official end card animation, then a static hold. */
  endCard: { start: sec(21.6) },
  endCardStill: { start: sec(26.2) },
} as const;

/**
 * Product footage in/out points, as frame numbers in the recording. The
 * recording is 30 fps: frame 0 is an unrelated title frame and the results
 * overlay begins at frame 310, so usable footage is frames 1-309.
 */
export const FOOTAGE = {
  /** Straight approach to the roundabout, into the ring, first half lap. */
  clipA: { trimBefore: 1 },
  /** Leaving the ring onto the exit road; the dash confirms "Left lane". */
  clipB: { trimBefore: 258, trimAfter: 310 },
  /**
   * The approach again, seen whole inside its browser window while the camera
   * pulls back: the coaching line "Roundabout ahead. Look RIGHT" is on screen.
   */
  clipC: { trimBefore: 27 },
} as const;

/** Small editorial labels during the montage; frames on the timeline. */
export const LABEL = {
  turns: { start: CUE.turns, end: CUE.roundabouts - 2 },
  roundabouts: { start: CUE.roundabouts, end: sec(13.7) },
  keepLeft: { start: CUE.keepingLeft, end: CUE.inYourBrowser - 4 },
  /** Interface-style note beside the vehicle while it sits on the wrong side. */
  wrongSide: { start: sec(4.35), end: sec(5.55) },
  /**
   * The spoken tagline appears as the end card's supporting line, a beat after
   * the words start so it does not compete with the wordmark's arrival.
   */
  tagline: { start: CUE.practiceBefore + 8 },
} as const;
