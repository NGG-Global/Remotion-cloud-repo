import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type PopProps = {
  readonly children: React.ReactNode;
  /** Frame at which the element pops in. */
  readonly at?: number;
  /** Frame at which it leaves, if ever. */
  readonly until?: number;
  readonly style?: React.CSSProperties;
  /** Degrees of tilt the element settles at. */
  readonly tilt?: number;
  /** Direction the element arrives from. */
  readonly from?: "below" | "above" | "left" | "right" | "scale";
  /** Larger = more overshoot. */
  readonly bounce?: number;
};

/**
 * Sticker-style entrance: an overshooting spring with a small squash, so
 * elements land on the page rather than fading onto it. The exit is a quick
 * shrink, so the eye is never left on a half-transparent element.
 */
export const Pop: React.FC<PopProps> = ({
  children,
  at = 0,
  until,
  style,
  tilt = 0,
  from = "below",
  bounce = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - at,
    fps,
    config: { damping: 10 + (1 - bounce) * 10, stiffness: 150, mass: 0.7 },
  });
  const leave =
    until === undefined
      ? 0
      : spring({
          frame: frame - until,
          fps,
          config: { damping: 200, stiffness: 220 },
          durationInFrames: 12,
        });

  if (frame < at) return null;
  if (until !== undefined && frame > until + 14) return null;

  const dist = 140;
  const dx = from === "left" ? -dist : from === "right" ? dist : 0;
  const dy = from === "below" ? dist : from === "above" ? -dist : 0;
  const tx = interpolate(enter, [0, 1], [dx, 0]);
  const ty = interpolate(enter, [0, 1], [dy, 0]);
  const scale =
    (from === "scale" ? interpolate(enter, [0, 1], [0.2, 1]) : 1) * (1 - leave);
  const squash = 1 + (1 - Math.min(enter, 1)) * 0.12 * bounce;
  const opacity = interpolate(enter, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translate(${tx}px, ${ty}px) rotate(${tilt}deg) scale(${scale / squash}, ${scale * squash})`,
        transformOrigin: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
