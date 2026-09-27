/**
 * Master timeline for the Gacy episode.
 *
 * `start` / `end` are seconds into `public/audio/gacy-narration.mp3`.
 * The audio file is the master clock (645.30s). Section edges were placed by
 * mapping the narration script onto detected speech, so a scene change lands
 * on the topic the voice is actually on. Adjust a boundary here and every
 * sequence follows.
 */
export const NARRATION_SECONDS = 645.302857;
export const FPS = 30;

/** Enough frames to hold the whole voice track. */
export const TOTAL_FRAMES = Math.ceil(NARRATION_SECONDS * FPS);

export const SCENES = [
  { id: "opening", start: 0, end: 68.33 },
  { id: "chicago", start: 68.33, end: 99.49 },
  { id: "iowa", start: 99.49, end: 135.14 },
  { id: "business", start: 135.14, end: 151.6 },
  { id: "pogo", start: 151.6, end: 175.61 },
  { id: "missing", start: 175.61, end: 224.92 },
  { id: "crawl", start: 224.92, end: 269.49 },
  { id: "suburb", start: 269.49, end: 289.75 },
  { id: "piest", start: 289.75, end: 324.09 },
  { id: "police", start: 324.09, end: 361.84 },
  { id: "watch", start: 361.84, end: 390.03 },
  { id: "subscribe", start: 390.03, end: 412.56 },
  { id: "search2", start: 412.56, end: 451.92 },
  { id: "people", start: 451.92, end: 481.66 },
  { id: "trial", start: 481.66, end: 535.24 },
  { id: "execution", start: 535.24, end: 556.63 },
  { id: "names", start: 556.63, end: 593.7 },
  { id: "ending", start: 593.7, end: NARRATION_SECONDS },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const frameAt = (seconds: number): number => Math.round(seconds * FPS);

export const sceneFrames = (
  start: number,
  end: number,
): { from: number; durationInFrames: number } => ({
  from: frameAt(start),
  durationInFrames: Math.max(1, frameAt(end) - frameAt(start)),
});
