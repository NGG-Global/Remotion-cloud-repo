/**
 * Central format and design tokens.
 *
 * Compositions read from here instead of hardcoding sizes and colours, so a
 * brand change is a one-file edit rather than a search-and-replace.
 */

/** Delivery format for every composition in this project. */
export const FORMAT = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export const COLORS = {
  background: "#0b1220",
  surface: "#151f33",
  accent: "#3b82f6",
  text: "#f8fafc",
  textMuted: "#94a3b8",
} as const;

/**
 * Type scale in pixels, sized for a 1920x1080 canvas. Remotion scales the
 * preview down, so always design against the real pixel dimensions.
 */
export const FONT_SIZE = {
  display: 112,
  heading: 72,
  body: 40,
  caption: 28,
} as const;

/** Seconds -> frames, so timings stay readable when the fps changes. */
export const seconds = (value: number): number =>
  Math.round(value * FORMAT.fps);
