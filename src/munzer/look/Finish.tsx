import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { hash } from "../engine/time";

/**
 * Grain baked once into a tile and re-positioned each frame, plus a
 * vignette. Kept light: the archive already has its own video noise, and
 * heavy synthetic grain only costs bitrate on YouTube.
 */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" seed="11"/><feColorMatrix type="saturate" values="0"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`,
)}")`;

export const Finish: React.FC<{ readonly grain?: number; readonly vignette?: number }> = ({
  grain = 0.035,
  vignette = 0.6,
}) => {
  const frame = useCurrentFrame();
  const jx = Math.floor(hash(frame) * 256);
  const jy = Math.floor(hash(frame + 977) * 256);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(85% 75% at 50% 48%, transparent 50%, rgba(0,0,0,${0.85 * vignette}) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          backgroundPosition: `${jx}px ${jy}px`,
          opacity: grain,
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
