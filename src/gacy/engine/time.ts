import { Easing, interpolate } from "remotion";

/**
 * Timing helpers. Every shot works in seconds of its own local clock, so a
 * beat written as `ramp(t, 2.1, 3.4)` reads the way the edit is planned:
 * against the narration, not against frame counts.
 */

export const EASE = {
  /** Default for camera moves and people: slow in, slow out, no overshoot. */
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  /** Settles into place. Arrivals, reveals. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Leaves slowly, then commits. Departures, drops. */
  in: Easing.bezier(0.55, 0, 0.8, 0.2),
  /** Long documentary push: barely accelerates, barely decelerates. */
  drift: Easing.bezier(0.3, 0, 0.7, 1),
  linear: Easing.linear,
} as const;

export const clamp = (v: number, a = 0, b = 1): number =>
  Math.min(b, Math.max(a, v));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** 0 → 1 across [t0, t1], eased and clamped. */
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

/** Rises across [a, b], holds, falls across [c, d]. For labels and lights. */
export const window4 = (
  t: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number => Math.min(ramp(t, a, b, EASE.out), 1 - ramp(t, c, d, EASE.in));

export type Track = readonly (readonly [number, number])[];

/**
 * Eased keyframes: `[[time, value], ...]`, sorted by time. Each segment eases
 * in and out, so a chain of keys never jerks at a key.
 */
export const keys = (
  t: number,
  track: Track,
  easing: (x: number) => number = EASE.inOut,
): number => {
  if (track.length === 0) {
    return 0;
  }
  if (track.length === 1) {
    return track[0][1];
  }
  return interpolate(
    t,
    track.map((k) => k[0]),
    track.map((k) => k[1]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing },
  );
};

/** Deterministic 0–1 hash. */
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth deterministic value noise in [-1, 1]. For drift, sway, flicker. */
export const noise = (x: number, seed = 0): number => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i + seed * 71.3);
  const b = hash(i + 1 + seed * 71.3);
  return (a + (b - a) * u) * 2 - 1;
};

/** Two octaves of noise, for handheld camera and breathing variation. */
export const fbm = (x: number, seed = 0): number =>
  noise(x, seed) * 0.7 + noise(x * 2.3 + 11, seed + 3) * 0.3;
