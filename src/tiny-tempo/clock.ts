import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BPM } from "./theme";

export const clamp = (
  value: number,
  input: readonly [number, number],
  output: readonly [number, number],
): number =>
  interpolate(value, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, value));

export const easeOut = (t: number): number => {
  const p = clamp01(t);
  return 1 - (1 - p) ** 3;
};

/** Scene-local clock. Sequences shift this to start at 0. */
export const useClock = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const time = frame / fps;
  const beat = time * (BPM / 60);
  return { frame, fps, time, beat, durationInFrames, width, height };
};

/** Seconds since the most recent hit at or before `time`. Infinity if none yet. */
export const lastHitAge = (time: number, hits: readonly number[]): number => {
  let age = Infinity;
  for (const hit of hits) {
    if (hit <= time) age = Math.min(age, time - hit);
  }
  return age;
};

export const nextHitIn = (
  time: number,
  hits: readonly number[],
): number | null => {
  for (const hit of hits) {
    if (hit > time) return hit - time;
  }
  return null;
};

/**
 * Hammer pose from Tiny Tempo's own curves: lift, accelerate into contact,
 * tiny hold, then a restrained recoil. Sampled from scene time against a
 * list of hit instants so the swing always lands on the beat.
 */
export const hammerAngle = (time: number, hits: readonly number[]): number => {
  const until = nextHitIn(time, hits);
  const age = lastHitAge(time, hits);
  let recovered = age < 0.34 ? recoil(age) : 0.55;
  if (!Number.isFinite(recovered)) recovered = 0.55;
  if (until !== null && until < 0.24) return anticipation(until, recovered);
  return recovered;
};

const anticipation = (untilImpact: number, recoveredAngle: number): number => {
  const p = clamp01(1 - untilImpact / 0.24);
  const lift =
    p < 0.42
      ? 0.55 + 0.27 * Math.sin((p / 0.42) * (Math.PI / 2))
      : 0.82 * (1 - ((p - 0.42) / 0.58) ** 3);
  return lift + (Math.min(0.55, recoveredAngle) - 0.55) * (1 - p);
};

const recoil = (age: number): number => {
  const p = clamp01((age - 0.026) / (0.34 - 0.026));
  return 0.55 * easeOut(p) + 0.13 * Math.sin(p * Math.PI) ** 2;
};

/** A compression that is 0 at both ends and peaks at `amount`. */
export const squash = (
  age: number,
  duration: number,
  amount: number,
): number => {
  if (!Number.isFinite(age) || age < 0 || age >= duration) return 0;
  return Math.sin((age / duration) * Math.PI) * amount;
};

/** Damped oscillation after an impact. */
export const settle = (
  age: number,
  frequency: number,
  decay: number,
): number => {
  if (!Number.isFinite(age) || age < 0) return 0;
  return Math.sin(age * frequency) * Math.exp(-age * decay);
};
