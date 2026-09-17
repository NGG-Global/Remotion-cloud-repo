import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, useClock } from "../../clock";
import { Grain } from "../../components/stage";
import { KEY_LIGHT, VIEW_BOX } from "../frame";
import { TT } from "../../theme";

type ActStageProps = {
  /** The act's own paper. Each vignette carries its palette; the shell does not. */
  readonly paper: string;
  /** The warm pool the one key light throws onto the paper. */
  readonly sun?: string;
  readonly sunX?: number;
  readonly sunY?: number;
  /** Pushes in across the shot so a held act never sits still. */
  readonly push?: readonly [number, number];
  readonly children: React.ReactNode;
};

/**
 * Every act's backdrop: paper, one pool of light, grain, and an SVG in the game's
 * 720x1280 design box.
 *
 * The push is a slow scale ramp rather than a pan. Panning a full-bleed vertical
 * frame walks the subject off the short axis; scaling from the centre keeps the
 * prop where the composition put it.
 */
export const ActStage: React.FC<ActStageProps> = ({
  paper,
  sun = TT.sun,
  sunX = 42,
  sunY = 26,
  push = [1.02, 1.09],
  children,
}) => {
  const { time, durationInFrames, fps } = useClock();
  const span = durationInFrames / fps;
  const scale = clamp(time, [0, span], [push[0], push[1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${sunX}% ${sunY}%, ${sun}66 0%, ${sun}22 30%, transparent 64%)`,
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={VIEW_BOX}
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, display: "block" }}
          aria-hidden
        >
          {children}
        </svg>
      </AbsoluteFill>
      <Grain opacity={0.11} />
    </AbsoluteFill>
  );
};

type CastShadowProps = {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry?: number;
  readonly opacity?: number;
};

/** The key light's one cast shadow: a flat ellipse, offset, never blurred. */
export const CastShadow: React.FC<CastShadowProps> = ({
  cx,
  cy,
  rx,
  ry,
  opacity = KEY_LIGHT.alpha,
}) => (
  <ellipse
    cx={cx + KEY_LIGHT.dx * 0.4}
    cy={cy + KEY_LIGHT.dy * 0.3}
    rx={rx}
    ry={ry ?? rx * 0.26}
    fill={TT.inkDeep}
    opacity={opacity}
  />
);
