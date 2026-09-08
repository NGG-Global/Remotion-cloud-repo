import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type CrossFadeProps = {
  readonly children: React.ReactNode;
  /** Length of the fade-in, in frames. */
  readonly frames: number;
};

/**
 * Fades a scene in over the scene beneath it.
 *
 * Scenes each fade themselves out at the end. Without an overlap the outgoing
 * scene reaches zero opacity a frame before the next one starts animating in,
 * which shows as a dark blink on every cut. Extending each scene past its beat
 * and fading the next one in on top turns those blinks into dissolves.
 */
export const CrossFade: React.FC<CrossFadeProps> = ({ children, frames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
