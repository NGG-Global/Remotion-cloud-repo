/**
 * Visual identity for the Lizzie Borden episode.
 *
 * 1892, a hot August in a mill town. Daylight is hard and yellow, shadows
 * are warm brown; interiors are dim, papered rooms lit by a window or an
 * oil lamp. The palette is a step warmer and dustier than the Gacy
 * episode, and there is no electric light anywhere in it.
 */

export { TYPE } from "../gacy/theme";

export const INK = {
  paper: "#ece1c8",
  paperShade: "#d3c4a4",
  ink: "#1a1510",
  brass: "#c9a15a",
  blood: "#7a2a22",
  void: "#06050a",
} as const;

/** Scene lights. One per kind of place, so a set reads as one place. */
export const LIGHT = {
  /** Noon in August: hard yellow key, warm brown shade. */
  noon: { key: "#fff3d6", ambient: "#6a5038", amb: 0.06 },
  /** Early morning, softer and pinker. */
  morning: { key: "#ffe6c8", ambient: "#5a4a48", amb: 0.12 },
  /** Late afternoon, orange. */
  afternoon: { key: "#ffd9a8", ambient: "#4a3a34", amb: 0.14 },
  /** Overcast, for the trial and the cemetery. */
  grey: { key: "#e6e6e2", ambient: "#5a5a60", amb: 0.16, desat: 0.2 },
  /** Night outside, moonlit. */
  night: { key: "#8fa2c2", ambient: "#0b111c", amb: 0.5, desat: 0.25 },
  /** A papered room lit by its window in daytime. */
  room: { key: "#ffeedc", ambient: "#3a2a20", amb: 0.24 },
  /** A darker room, the door shut, one window. */
  dim: { key: "#e8d8c0", ambient: "#241a12", amb: 0.42 },
  /** Oil lamp at night. */
  lamp: { key: "#ffd9a0", ambient: "#1e140c", amb: 0.34 },
  /** Cellar. */
  cellar: { key: "#b8b0a0", ambient: "#0c0a08", amb: 0.62, desat: 0.3 },
  /** A sepia photograph. */
  sepia: { key: "#f0dcc0", ambient: "#5a4a3a", amb: 0.08, desat: 0.8 },
} as const;
