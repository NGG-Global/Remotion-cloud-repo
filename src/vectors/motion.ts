import { Easing, interpolate, spring } from "remotion";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** 0 -> 1 over [from, to] seconds, eased out. */
export const ramp = (t: number, from: number, to: number): number =>
  interpolate(t, [from, to], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

/** 0 -> 1 over [from, to] seconds, eased in and out. */
export const glide = (t: number, from: number, to: number): number =>
  interpolate(t, [from, to], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });

/** Springy pop-in starting at `at` seconds: overshoots then settles at 1. */
export const pop = (
  t: number,
  at: number,
  fps: number,
  damping = 11,
): number =>
  t < at
    ? 0
    : spring({
        frame: Math.round((t - at) * fps),
        fps,
        config: { damping, stiffness: 170, mass: 0.7 },
      });

/** Gentle idle float so nothing on screen is ever perfectly frozen. */
export const bob = (t: number, seed = 0, amp = 8, speed = 1.3): number =>
  Math.sin(t * speed + seed * 1.7) * amp;

export const lerp = (a: number, b: number, p: number): number =>
  a + (b - a) * p;

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
