/**
 * Design tokens for the Alcatraz episode of "Behind the Nightmare".
 *
 * The series look (near-black ground, grain, serif type) comes from the Jack
 * the Ripper episode in src/doc. Alcatraz trades its gaslight for the bay:
 * steel, sea-fog grey and one cold blue, with a signal red kept for the few
 * moments that carry violence or a warning.
 */
import { FORMAT, seconds } from "../theme";

export { FORMAT, seconds };

export const FPS = FORMAT.fps;

export const AZ = {
  black: "#05070a",
  ink: "#0b0f14",
  steel: "#1b222b",
  steelLight: "#2c3642",
  sea: "#16324a",
  seaDeep: "#0a1a29",
  seaLight: "#5d86a6",
  fog: "#9aa6b2",
  land: "#c7b994",
  landDark: "#7f765f",
  paper: "#e7dfcc",
  paperDark: "#b6aa8d",
  text: "#eef0f2",
  textMuted: "#9aa3ad",
  red: "#c0262d",
  redDeep: "#5e0f13",
  amber: "#e2a64b",
  ice: "#b9d6ea",
} as const;

/** Hebrew serif for titles and labels (loaded by src/doc/fonts). */
export const SERIF = "Frank Ruhl Libre";
/** Latin serif for dates and archival tags. */
export const SERIF_LATIN = "Playfair Display";
/** Hebrew sans for small annotations (loaded by src/fonts). */
export const SANS = "Rubik";

/** Standard dissolve between shots, in frames. */
export const DISSOLVE = seconds(0.6);

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
/** Clamped linear 0..1 over [a, b], in whatever unit both are in. */
export const ramp = (v: number, a: number, b: number): number =>
  clamp01((v - a) / Math.max(1e-6, b - a));
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
