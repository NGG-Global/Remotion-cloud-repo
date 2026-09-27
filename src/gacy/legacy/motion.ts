import { useCurrentFrame, useVideoConfig } from "remotion";

export const clamp = (v: number, a = 0, b = 1): number =>
  Math.min(b, Math.max(a, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

export const easeIn = (t: number): number => t * t;

/** Deterministic 0–1 hash so atmosphere never flickers between renders. */
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Local clock inside a Sequence. `p` runs 0–1 across the scene. */
export const useScene = (): {
  frame: number;
  fps: number;
  t: number;
  dur: number;
  p: number;
} => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  return {
    frame,
    fps,
    t: frame / fps,
    dur: durationInFrames / fps,
    p: frame / Math.max(1, durationInFrames - 1),
  };
};

/** Progress through a window of scene-local seconds. */
export const span = (
  t: number,
  from: number,
  to: number,
): { p: number; e: number; visible: boolean } => {
  const p = clamp((t - from) / Math.max(0.001, to - from));
  return { p, e: easeInOut(p), visible: t >= from - 0.04 && t <= to + 0.04 };
};

export type Key = { readonly at: number; readonly v: number };

/** Eased value along sorted keyframes. `at` is in the same unit as `t`. */
export const keys = (t: number, track: readonly Key[]): number => {
  if (track.length === 0) {
    return 0;
  }
  if (t <= track[0].at) {
    return track[0].v;
  }
  const last = track[track.length - 1];
  if (t >= last.at) {
    return last.v;
  }
  let i = 0;
  while (i < track.length - 1 && t > track[i + 1].at) {
    i += 1;
  }
  const a = track[i];
  const b = track[i + 1];
  const p = easeInOut((t - a.at) / Math.max(0.001, b.at - a.at));
  return lerp(a.v, b.v, p);
};

export const breathe = (frame: number, speed = 0.08): number =>
  Math.sin(frame * speed);
