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

/**
 * Warm dark palette built around Claude's coral. The interface screenshots are
 * light, so a dark stage makes them read as the subject rather than as part of
 * the background.
 */
export const COLORS = {
  background: "#14110e",
  backgroundDeep: "#0c0a08",
  surface: "#211c17",
  surfaceRaised: "#2b2520",

  /** Claude's coral. Used for every indicator so attention has one colour. */
  accent: "#d97757",
  accentSoft: "#e8a188",
  /** Secondary indicator, for the rare frame that needs two live markers. */
  accentAlt: "#6ba3c4",
  /** Cautions. Distinct from the accent so the limits section reads as a
   * different kind of information, not just more of the same. */
  warn: "#e0a34a",

  text: "#f7f3ec",
  textMuted: "#a79e92",
  /** Text on light surfaces, such as callout pills. */
  ink: "#1a1714",
  labelBg: "#fbf8f2",

  /** Dimming layer behind a spotlight. */
  scrim: "rgba(10,8,6,0.72)",
  /** Hairline around the application window. */
  frameEdge: "rgba(255,255,255,0.10)",
} as const;

/**
 * Type scale in pixels, sized for a 1920x1080 canvas. Remotion scales the
 * preview down, so always design against the real pixel dimensions.
 */
export const FONT_SIZE = {
  display: 112,
  heading: 72,
  subheading: 52,
  body: 40,
  caption: 28,
} as const;

/** Seconds -> frames, so timings stay readable when the fps changes. */
export const seconds = (value: number): number =>
  Math.round(value * FORMAT.fps);
