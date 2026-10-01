/**
 * The vertical teaser's grid.
 *
 * The home-page theme is 64 seconds at exactly 120 BPM with the first downbeat
 * on sample zero (measured from the mix, see tools/audio-envelope.py), so a
 * beat is 15 frames and a bar is 60. Every cut in the teaser is expressed in
 * bars and beats against that grid rather than in frames, so the edit reads
 * like the score it follows.
 */

export const TEASER_FORMAT = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const BEAT_SECONDS = 0.5;
export const BAR_SECONDS = 2;

/** Seconds to frames at the teaser's frame rate. */
export const sec = (value: number): number =>
  Math.round(value * TEASER_FORMAT.fps);

/** The frame a given bar (and beat within it) starts on. */
export const bar = (index: number, beat = 0): number =>
  sec(index * BAR_SECONDS + beat * BEAT_SECONDS);

/** Beat offsets (in seconds) as a plain list, for the graphics' `hits`. */
export const beats = (...offsets: readonly number[]): readonly number[] =>
  offsets.map((b) => b * BEAT_SECONDS);

/** Vertical safe area: platform chrome covers the top and bottom bands. */
export const SAFE = {
  top: 220,
  bottom: 300,
} as const;
