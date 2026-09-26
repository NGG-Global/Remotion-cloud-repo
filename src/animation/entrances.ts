import type { CSSProperties } from "react";
import { Easing, interpolate } from "remotion";

type EntranceOptions = {
  readonly delay?: number;
  readonly durationInFrames?: number;
  readonly distance?: number;
};

const progressOf = (
  frame: number,
  delay: number,
  durationInFrames: number,
): number =>
  interpolate(frame - delay, [0, Math.max(1, durationInFrames)], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const entrances = {
  fade: (frame: number, options: EntranceOptions = {}): CSSProperties => {
    const progress = progressOf(
      frame,
      options.delay ?? 0,
      options.durationInFrames ?? 15,
    );
    return { opacity: progress };
  },
  slideLeft: (frame: number, options: EntranceOptions = {}): CSSProperties => {
    const progress = progressOf(
      frame,
      options.delay ?? 0,
      options.durationInFrames ?? 18,
    );
    const distance = options.distance ?? 48;
    return {
      opacity: progress,
      transform: `translateX(${interpolate(progress, [0, 1], [-distance, 0])}px)`,
    };
  },
  slideRight: (frame: number, options: EntranceOptions = {}): CSSProperties => {
    const progress = progressOf(
      frame,
      options.delay ?? 0,
      options.durationInFrames ?? 18,
    );
    const distance = options.distance ?? 48;
    return {
      opacity: progress,
      transform: `translateX(${interpolate(progress, [0, 1], [distance, 0])}px)`,
    };
  },
  scaleIn: (frame: number, options: EntranceOptions = {}): CSSProperties => {
    const progress = progressOf(
      frame,
      options.delay ?? 0,
      options.durationInFrames ?? 16,
    );
    return {
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.86, 1])})`,
    };
  },
};
