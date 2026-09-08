import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type FadeInProps = {
  readonly children: React.ReactNode;
  /** Frames to wait before fading in. */
  readonly delay?: number;
  /** Length of the fade, in frames. */
  readonly durationInFrames?: number;
  /** Pixels to travel upwards while fading in. Set to 0 for a pure fade. */
  readonly offset?: number;
};

/**
 * Fade-and-rise wrapper for any element.
 *
 * `extrapolateLeft`/`extrapolateRight` are clamped so the value holds at 0
 * before the fade and at 1 after it. Without clamping, `interpolate()` keeps
 * extending the line and the element overshoots past full opacity.
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  durationInFrames,
  offset = 24,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeLength = durationInFrames ?? Math.round(fps * 0.5);

  const progress = interpolate(frame - delay, [0, fadeLength], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [offset, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};
