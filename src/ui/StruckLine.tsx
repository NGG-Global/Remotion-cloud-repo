import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import type { Region } from "./regions";
import { useProjection } from "./UIShowcase";

type StruckLineProps = {
  /** The region to strike through. */
  readonly region: Region;
  /** Frame at which the stroke starts drawing. */
  readonly at: number;
  /** Frames the stroke takes to cross. */
  readonly frames?: number;
  readonly color?: string;
};

/**
 * A stroke drawn through something in the interface.
 *
 * For the beats that show a wrong way of doing something before the right
 * one: the wrong version stays on screen and gets crossed out, rather than
 * being cut away before the viewer has read it. Drawn on rather than faded in,
 * so it reads as an act.
 */
export const StruckLine: React.FC<StruckLineProps> = ({
  region,
  at,
  frames = 16,
  color = COLORS.warn,
}) => {
  const frame = useCurrentFrame();
  const { project } = useProjection();

  const drawn = interpolate(frame - at, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (drawn <= 0) {
    return null;
  }

  const r = project(region);
  const thickness = Math.max(3, r.h * 0.08);

  return (
    <div
      style={{
        position: "absolute",
        // Struck from the right, where the line of Hebrew it crosses begins.
        left: r.x + r.w * (1 - drawn),
        top: r.y + r.h / 2 - thickness / 2,
        width: r.w * drawn,
        height: thickness,
        borderRadius: thickness,
        background: color,
      }}
    />
  );
};
