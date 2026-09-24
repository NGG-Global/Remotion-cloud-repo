/**
 * Design tokens for the documentary.
 *
 * Kept apart from the explainer series' warm coral palette: this film is
 * cold, dark and period, and its accent is gaslight rather than brand colour.
 */
import { FORMAT, seconds } from "../theme";

export { FORMAT, seconds };

export const DOC = {
  /** Near-black with a cold cast. Never pure black, so grain has something to sit on. */
  black: "#06070a",
  ink: "#0d0f14",
  slate: "#1a1d26",
  /** The fog. */
  fog: "#8a94a3",
  fogLight: "#c3cad4",
  /** Gaslight. */
  gas: "#e6a54a",
  gasHot: "#ffd48a",
  /** Ink and blood. Used sparingly; it is the only saturated colour in the film. */
  red: "#a8171f",
  redDeep: "#5a0b10",
  /** Paper and parchment, for archival mounts. */
  paper: "#e6dcc6",
  paperDark: "#b9ab8e",
  /** On-screen type. */
  text: "#efe9dc",
  textMuted: "#9a948a",
} as const;

/** Frames of the standard dissolve between beats. */
export const DISSOLVE = seconds(0.5);

/** Period serif for the few words that appear on screen. */
export const SERIF = "Frank Ruhl Libre";
export const SERIF_LATIN = "Playfair Display";
export const SERIF_TEXT = "Cormorant Garamond";

/** Clamped linear interpolation over [a, b]. */
export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
export const ramp = (frame: number, from: number, to: number): number =>
  clamp01((frame - from) / Math.max(1, to - from));
export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number): number => t * t * t;
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Deterministic pseudo-random in [0, 1), so particles never change between renders. */
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
