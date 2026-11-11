import { Easing, interpolate } from "remotion";

/**
 * Timing helpers. Shots and graphics work in seconds, never in raw frames,
 * so a beat reads the way the edit was planned: against the narration.
 */

export const EASE = {
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 0.8, 0.2),
  drift: Easing.bezier(0.3, 0, 0.7, 1),
  linear: Easing.linear,
} as const;

export const clamp = (v: number, a = 0, b = 1): number =>
  Math.min(b, Math.max(a, v));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** 0 -> 1 across [t0, t1], eased and clamped at both ends. */
export const ramp = (
  t: number,
  t0: number,
  t1: number,
  easing: (x: number) => number = EASE.inOut,
): number => {
  if (t1 <= t0) {
    return t >= t1 ? 1 : 0;
  }
  return interpolate(t, [t0, t1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
};

/** Rises across [a, b], holds, falls across [c, d]. */
export const win = (
  t: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number => Math.min(ramp(t, a, b, EASE.out), 1 - ramp(t, c, d, EASE.in));

/** Deterministic 0-1 hash. No Math.random anywhere in the film. */
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

/** Smooth 1D value noise in [-1, 1]. */
export const noise = (x: number, seed = 0): number => {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i + seed * 1013) * 2 - 1;
  const b = hash(i + 1 + seed * 1013) * 2 - 1;
  const u = f * f * (3 - 2 * f);
  return a + (b - a) * u;
};

/** Hebrew runs right to left; digits and Latin names run left to right. */
export const dirOf = (s: string): "rtl" | "ltr" =>
  /[֐-׿]/.test(s) ? "rtl" : "ltr";
