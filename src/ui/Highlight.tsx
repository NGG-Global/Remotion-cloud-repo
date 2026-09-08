import React, { useMemo } from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import type { Region } from "./regions";
import { useProjection } from "./UIShowcase";

type HighlightProps = {
  readonly region: Region;
  /** Frame, relative to the enclosing sequence, at which the ring appears. */
  readonly delay?: number;
  /** Breathing room around the element, in window pixels. */
  readonly pad?: number;
  readonly color?: string;
  /** Dim the rest of the interface to push attention onto the region. */
  readonly dim?: boolean;
};

/**
 * Focus ring around an interface element, optionally dimming everything else.
 *
 * The dimming uses an SVG mask rather than four surrounding rectangles so the
 * cut-out can have rounded corners matching the element it sits over. Padding
 * and stroke are in window pixels, so the indicator keeps its visual weight
 * while the camera moves.
 */
export const Highlight: React.FC<HighlightProps> = ({
  region,
  delay = 0,
  pad = 10,
  color = COLORS.accent,
  dim = true,
}) => {
  const frame = useCurrentFrame();
  const { project } = useProjection();

  const r = project(region);
  const box = {
    x: r.x - pad,
    y: r.y - pad,
    w: r.w + pad * 2,
    h: r.h + pad * 2,
  };

  const local = frame - delay;

  // Short overshoot on the way in gives the indicator snap without bounce.
  const appear = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const overshoot = interpolate(local, [0, 7, 14], [1.06, 1.015, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow breathing pulse so the ring stays alive on longer holds.
  const pulse = 0.5 + 0.5 * Math.sin((local / 26) * Math.PI * 2);

  const maskId = useMemo(
    () =>
      `spot-${Math.round(random(`${region.x}:${region.y}:${region.w}`) * 1e9)}`,
    [region.x, region.y, region.w],
  );

  const radius = Math.min(box.h * 0.3, 20);

  return (
    <>
      {dim ? (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
          aria-hidden
        >
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={radius}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={COLORS.scrim}
            opacity={appear}
            mask={`url(#${maskId})`}
          />
        </svg>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: box.x + box.w / 2,
          top: box.y + box.h / 2,
          width: box.w,
          height: box.h,
          marginLeft: -box.w / 2,
          marginTop: -box.h / 2,
          borderRadius: radius,
          border: `3px solid ${color}`,
          transform: `scale(${overshoot})`,
          opacity: appear,
          boxShadow: `0 0 ${16 + pulse * 20}px ${color}${dim ? "cc" : "99"}`,
        }}
      />
    </>
  );
};
