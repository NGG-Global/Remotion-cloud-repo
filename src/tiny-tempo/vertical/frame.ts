/**
 * The portrait ad's authoring frame.
 *
 * Tiny Tempo is authored against a 720x1280 design box (`src/config/design.ts` in
 * the game). The ad renders at 1080x1920 — exactly 1.5x — so every act here is
 * drawn in the game's own coordinate space and scaled by the SVG viewBox. Geometry
 * lifted from a vignette therefore lands where the game puts it, rather than being
 * re-eyeballed against a different canvas.
 */

export const BOX = { width: 720, height: 1280 } as const;

/** The SVG viewBox every act shares. */
export const VIEW_BOX = `0 0 ${BOX.width} ${BOX.height}`;

export const CENTRE_X = BOX.width / 2;

/**
 * Where the act's stage sits. The game reserves the top of the frame for the phase
 * cue and puts the beat track below the action; the ad keeps the same division so a
 * frame of the video reads as a frame of the game.
 */
export const STAGE = {
  /** Baseline the props stand on. */
  groundY: 880,
  /** Centre of the acting area — the subject's eye line. */
  actionY: 660,
  /** Phase plaque centre. */
  cueY: 210,
  /** Beat track centre. */
  trackY: 1075,
} as const;

/** The game's outline weight, in design units. `STYLE.current.outline` is 7. */
export const INK_WEIGHT = 7;

/**
 * The one key light: upper left, so every cast shadow falls down and right. Offsets
 * are in design units and are added to a shape's own position, never blurred — the
 * workshop treatment stacks flat tones rather than softening them.
 */
export const KEY_LIGHT = { dx: 14, dy: 20, alpha: 0.18 } as const;

/** Quarter-note grid at the music's measured 120 BPM. */
export const beats = (count: number): number => count * 0.5;
