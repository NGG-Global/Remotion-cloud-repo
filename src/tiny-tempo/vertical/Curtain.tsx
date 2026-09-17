import React from "react";
import { AbsoluteFill } from "remotion";
import { useClock } from "../clock";
import { shade, TT } from "../theme";

/** How long the card takes to cover, and then to clear. Two beats in all. */
const HALF = 0.25;

type CurtainProps = {
  /** Composition frame the card fully covers — the cut it is hiding. */
  readonly at: number;
};

/**
 * The game's scene curtain, cut for the portrait frame.
 *
 * `SceneCurtain` in the game hides the moment one vignette is swapped for the next,
 * so the ad uses it for the same job: every cut between acts is a pass of the card,
 * never a dissolve, which keeps the edit as hard-edged as the art.
 */
export const Curtain: React.FC<CurtainProps> = ({ at }) => {
  const { time, fps } = useClock();
  // `at` is the covered frame, so the pass starts half its length earlier.
  const local = time - at / fps + HALF;
  if (local < 0 || local > HALF * 2) return null;

  const progress = local < HALF ? local / HALF : 1 + (local - HALF) / HALF;
  const w = 1080;
  const h = 1920;
  const shear = w * 0.16;
  const span = w + shear;
  const left =
    progress <= 1
      ? (1 - progress) * span - shear
      : -(progress - 1) * span - shear;
  const right = progress <= 1 ? w + shear : w - (progress - 1) * span;

  const band = (inset: number): string => {
    const x1 = left - inset;
    return `${x1 + shear},0 ${right + shear},0 ${right},${h} ${x1},${h}`;
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <polygon points={band(34)} fill={shade(TT.ink, -0.2)} />
        <polygon points={band(18)} fill={TT.coral} />
        <polygon points={band(0)} fill={TT.paperLift} />
      </svg>
    </AbsoluteFill>
  );
};
