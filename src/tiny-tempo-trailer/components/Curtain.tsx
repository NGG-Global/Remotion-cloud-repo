import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { shade, TT } from "../theme";

type CurtainProps = {
  /** Local frame on which the card fully covers the canvas: the cut hides under it. */
  readonly coverAt: number;
  /** Frames from off-left to covering; the same again to clear. */
  readonly travel?: number;
};

/**
 * The game's scene curtain: a sheared paper card with an ink edge and a coral edge
 * behind it, slid across the bench between screens. Nothing fades; the cut is under it.
 */
export const Curtain: React.FC<CurtainProps> = ({ coverAt, travel = 9 }) => {
  const frame = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const local = frame - (coverAt - travel);
  if (local < 0 || local > travel * 2) return null;
  const eased = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const p =
    local <= travel
      ? eased(local / travel)
      : 1 + eased((local - travel) / travel);

  const shear = h * 0.12;
  const span = w + shear;
  const edge = p <= 1 ? (1 - p) * span - shear : -(p - 1) * span - shear;
  const right = p <= 1 ? w + shear : w - (p - 1) * span;
  const ink = Math.round(h * 0.008);
  const coral = Math.round(h * 0.016);
  const band = (offset: number) =>
    `${edge - offset},0 ${right},0 ${right + shear},${h} ${edge - offset + shear},${h}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <polygon points={band(ink + coral)} fill={shade(TT.ink, -0.2)} />
        <polygon points={band(coral)} fill={TT.coral} />
        <polygon points={band(0)} fill={TT.paperLift} />
      </svg>
    </AbsoluteFill>
  );
};
