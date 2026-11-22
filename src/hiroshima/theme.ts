/**
 * Design tokens for "Behind the Nightmare: Hiroshima and Nagasaki".
 *
 * The picture is mostly black-and-white archive, so the palette is built to
 * sit beside it: warm paper whites for type, a near-black that is never pure
 * black, and one ember accent for the flash, the routes on the maps and the
 * figures that matter. The ember is used sparingly so it keeps its weight.
 */
import { FORMAT, seconds } from "../theme";

export { FORMAT, seconds };

export const H = {
  black: "#07080a",
  ink: "#0f1114",
  slate: "#1b1e23",
  paper: "#efe8da",
  paperDim: "#bdb4a3",
  muted: "#8e877b",
  ember: "#e06a35",
  emberHot: "#ffb36b",
  emberDeep: "#7a2a12",
  sea: "#0b0e12",
  land: "#26231f",
  coast: "#8a7d66",
  red: "#a8171f",
} as const;

/** Hebrew display serif (titles, names, quotes). Registered in ../doc/fonts. */
export const SERIF = "Frank Ruhl Libre";
/** Latin display serif for dates and English titles. */
export const SERIF_LATIN = "Playfair Display";
/** Sans for captions, labels and numbers. Registered in ../fonts. */
export const SANS = "Rubik";

/** Frames of the standard dissolve. */
export const DISSOLVE = seconds(0.6);

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
export const ramp = (x: number, a: number, b: number): number =>
  clamp01((x - a) / Math.max(1e-6, b - a));
export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number): number => t * t * t;
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Deterministic pseudo-random in [0, 1). */
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
