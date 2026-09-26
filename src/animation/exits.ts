import type { CSSProperties } from "react";
import { Easing, interpolate } from "remotion";

type ExitOptions = {
  readonly startFrame: number;
  readonly durationInFrames?: number;
};

export const exits = {
  fade: (frame: number, options: ExitOptions): CSSProperties => {
    const duration = options.durationInFrames ?? 15;
    const opacity = interpolate(
      frame,
      [options.startFrame, options.startFrame + duration],
      [1, 0],
      {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
    return { opacity };
  },
};
