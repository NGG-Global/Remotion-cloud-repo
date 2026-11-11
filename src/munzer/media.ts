import { staticFile } from "remotion";

/**
 * Every archive source the film draws on. The clips in public/munzer/clips
 * are the downloaded files with only the black side bars cropped off,
 * re-timed to a constant 30 fps and re-encoded with a keyframe every half
 * second (fast seeking). Source times in the edit are seconds into these
 * files, which match the downloaded originals second for second.
 * Provenance for each file is in public/munzer/SOURCES.md.
 *
 * `safe` is the part of each picture the edit may show, [x0, y0, x1, y1]
 * as fractions: it keeps the uploader's corner watermarks and, for the 1995
 * broadcast, the network's corner bug out of frame.
 */
export const CLIPS = {
  /** Guest posing at a club show, Austria, 1988 (home video). */
  am88: { file: "am88.mp4", w: 848, h: 480, dur: 406.6, safe: [0, 0, 1, 1] },
  /** Arnold Classic 1990, posing routine. */
  a90: { file: "a90.mp4", w: 632, h: 476, dur: 103.5, safe: [0, 0, 1, 0.865] },
  /** Mr. Olympia 1990: TV stats card, posing routine, short interview. */
  o90: { file: "o90.mp4", w: 848, h: 480, dur: 275.5, safe: [0, 0.07, 1, 0.895] },
  /** Mr. Olympia 1993, prejudging line-ups (Münzer not singled out). */
  pj93: { file: "pj93.mp4", w: 846, h: 480, dur: 250.8, safe: [0, 0.09, 1, 0.89] },
  /** Mr. Olympia 1994, posing routine. */
  o94: { file: "o94.mp4", w: 840, h: 480, dur: 144.6, safe: [0, 0.1, 1, 0.85] },
  /** Arnold Classic 1995, ESPN broadcast with commentary. */
  a95: { file: "a95.mp4", w: 844, h: 478, dur: 156.6, safe: [0.01, 0.08, 0.81, 0.87] },
  /** Arnold Classic 1996 (early March), posing routine, days before his death. */
  a96: { file: "a96.mp4", w: 636, h: 480, dur: 141.3, safe: [0, 0.08, 1, 0.92] },
  /** Arnold Schwarzenegger, Mr. Olympia 1970 compilation. */
  ar70: { file: "ar70.mp4", w: 848, h: 480, dur: 366.6, safe: [0.1, 0.09, 0.93, 1] },
} as const;

export type ClipId = keyof typeof CLIPS;

export const clipSrc = (id: ClipId): string =>
  staticFile(`munzer/clips/${CLIPS[id].file}`);

export const PHOTOS = {
  "portrait-smile": { w: 486, h: 486 },
  "legpress-bw": { w: 588, h: 834 },
  "backstage-15": { w: 2263, h: 1200 },
  "side-chest-stage": { w: 590, h: 838 },
  "most-muscular-blue": { w: 629, h: 792 },
  "weider-banner": { w: 764, h: 756 },
  "side-chest-dark": { w: 495, h: 795 },
  "most-muscular-curtain": { w: 339, h: 512 },
  "double-biceps-30": { w: 660, h: 758 },
  "gym-dumbbell-bw": { w: 547, h: 740 },
  "side-biceps-stage": { w: 594, h: 756 },
  "studio-purple": { w: 500, h: 655 },
} as const;

export type PhotoId = keyof typeof PHOTOS;

export const photoSrc = (id: PhotoId): string =>
  staticFile(`munzer/photos/${id}.jpg`);

export const NARRATION = staticFile("munzer/narration.mp3");
