import React, { useId } from "react";
import { AbsoluteFill } from "remotion";
import { clamp, useClock } from "../clock";
import { TT } from "../theme";

type GrainProps = {
  readonly opacity?: number;
  readonly dots?: boolean;
};

/** Paper tooth plus the icon's dotted field. Unique filter ids per mount. */
export const Grain: React.FC<GrainProps> = ({
  opacity = 0.14,
  dots = true,
}) => {
  const rawId = useId().replace(/:/g, "");
  const noise = `tt-grain-${rawId}`;
  const speckle = `tt-dots-${rawId}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply" }}>
      <svg width="100%" height="100%" aria-hidden>
        <defs>
          <filter id={noise}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              seed="7"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <pattern
            id={speckle}
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="3" r="1.1" fill={TT.ink} opacity="0.22" />
            <circle cx="11" cy="10" r="0.9" fill={TT.ink} opacity="0.16" />
            <circle cx="16" cy="4" r="0.7" fill={TT.ink} opacity="0.12" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${noise})`}
          opacity={opacity}
        />
        {dots ? (
          <rect
            width="100%"
            height="100%"
            fill={`url(#${speckle})`}
            opacity={0.45}
          />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

type PaperFieldProps = {
  readonly paper?: string;
  readonly sun?: string;
  readonly sunX?: number;
  readonly sunY?: number;
  readonly children?: React.ReactNode;
};

/**
 * The game's stage: a paper field, a warm pool of light, grain. The sun drifts
 * a few percent across the composition so a held shot never feels frozen.
 */
export const PaperField: React.FC<PaperFieldProps> = ({
  paper = TT.paper,
  sun = TT.sun,
  sunX = 58,
  sunY = 32,
  children,
}) => {
  const { time, durationInFrames, fps } = useClock();
  const duration = durationInFrames / fps;
  const drift = clamp(time, [0, duration], [-4, 5]);

  return (
    <AbsoluteFill style={{ backgroundColor: paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${sunX + drift}% ${sunY - drift * 0.4}%, ${sun}55 0%, ${sun}22 28%, transparent 62%)`,
        }}
      />
      <Grain />
      {children}
    </AbsoluteFill>
  );
};
