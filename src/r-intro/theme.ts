/**
 * Design tokens for the vertical R tutorial.
 *
 * A bright, playful palette: R's own blue carries the brand, a warm yellow is
 * the "fun" colour for emphasis and bursts, and the stage is a soft cream so
 * code panels and the RStudio screenshot read as objects sitting on paper.
 */

export const PORTRAIT = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const R = {
  paper: "#f6f1e7",
  paperDeep: "#ece4d4",
  ink: "#1d2433",
  inkSoft: "#4b5365",
  muted: "#8a8f9c",
  blue: "#2165b0",
  blueLit: "#3b82d6",
  blueDeep: "#174a85",
  sky: "#cfe3fb",
  yellow: "#f8c646",
  yellowLit: "#ffd96b",
  coral: "#ef6a5a",
  green: "#3fae7a",
  purple: "#8b5fc7",
  white: "#ffffff",
  /** Code panel. */
  panel: "#1b2230",
  panelLine: "#263044",
  codeText: "#e8ecf4",
  codeKeyword: "#79b8ff",
  codeNumber: "#ffcb6b",
  codeString: "#c3e88d",
  codeComment: "#7c8494",
  codeOutput: "#bfc7d6",
} as const;

/** Type scale for a 1080x1920 canvas. */
export const SIZE = {
  display: 118,
  heading: 84,
  subheading: 60,
  body: 46,
  caption: 32,
  code: 40,
} as const;

/** Seconds -> frames at the portrait frame rate. */
export const sec = (value: number): number => Math.round(value * PORTRAIT.fps);
