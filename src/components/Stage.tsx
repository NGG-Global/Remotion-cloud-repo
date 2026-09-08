import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

/**
 * Fine grain, generated once as a data URI and tiled.
 *
 * `feTurbulence` is expensive to evaluate; baking it into a small tiled image
 * means the browser rasterises it once instead of per frame.
 */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="160" height="160" filter="url(#n)" opacity="0.55"/></svg>`,
)}")`;

type StageProps = {
  readonly children?: React.ReactNode;
  /** Strength of the drifting accent glow, 0-1. */
  readonly glow?: number;
};

/**
 * The dark stage every scene sits on: warm base, a slow drifting glow, a
 * vignette to hold the eye centre-frame, and a touch of grain so large flat
 * areas do not band when encoded.
 */
export const Stage: React.FC<StageProps> = ({ children, glow = 1 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const glowStyle = useMemo<React.CSSProperties>(() => {
    const t = durationInFrames > 1 ? frame / durationInFrames : 0;
    const gx = interpolate(t, [0, 1], [38, 62]);
    const gy = interpolate(t, [0, 1], [24, 12]);

    return {
      background: `radial-gradient(120% 90% at ${gx}% ${gy}%, ${COLORS.accent}${glow > 0.6 ? "26" : "14"} 0%, transparent 58%)`,
    };
  }, [frame, durationInFrames, glow]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(168deg, ${COLORS.background} 0%, ${COLORS.backgroundDeep} 100%)`,
      }}
    >
      <AbsoluteFill style={glowStyle} />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(78% 68% at 50% 46%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Grain */}
      <AbsoluteFill
        style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          opacity: 0.035,
          mixBlendMode: "overlay",
        }}
      />

      {children}
    </AbsoluteFill>
  );
};
