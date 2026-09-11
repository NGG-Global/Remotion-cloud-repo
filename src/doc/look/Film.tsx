import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { hash } from "../theme";

/**
 * Fine monochrome grain baked once into a tile. The tile is re-positioned by
 * a hash of the frame number so the grain crawls the way film grain does,
 * without re-rasterising the noise every frame.
 */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`,
)}")`;

type FilmProps = {
  /** Grain strength, 0-1. */
  readonly grain?: number;
  /** Vignette strength, 0-1. */
  readonly vignette?: number;
  /** Gaslight flicker amplitude, 0-1. Subtle at 0.3. */
  readonly flicker?: number;
  /** Occasional hairline scratches and dust, for archival material. */
  readonly scratches?: boolean;
};

/**
 * Photographic finish laid over a scene: grain, a vignette to hold the eye
 * centre-frame, a slow gaslight flicker, and optional scratches.
 */
export const Film: React.FC<FilmProps> = ({
  grain = 0.09,
  vignette = 0.75,
  flicker = 0,
  scratches = false,
}) => {
  const frame = useCurrentFrame();

  const jitterX = Math.floor(hash(frame) * 256);
  const jitterY = Math.floor(hash(frame + 1000) * 256);

  const flick = useMemo(() => {
    if (flicker <= 0) return 0;
    const slow = Math.sin(frame * 0.21) * 0.5 + Math.sin(frame * 0.53) * 0.3;
    const fast = (hash(frame) - 0.5) * 0.6;
    return (slow + fast) * 0.06 * flicker;
  }, [frame, flicker]);

  const scratchLines = useMemo(() => {
    if (!scratches) return [];
    const lines: { x: number; o: number; w: number }[] = [];
    for (let i = 0; i < 3; i++) {
      // Each scratch lives for a handful of frames then jumps elsewhere.
      const life = 5 + Math.floor(hash(i * 77) * 9);
      const slot = Math.floor(frame / life);
      const visible = hash(slot * 13 + i * 101) > 0.72;
      if (!visible) continue;
      lines.push({
        x: hash(slot * 31 + i * 7) * 1920,
        o: 0.08 + hash(slot * 3 + i) * 0.12,
        w: hash(slot + i * 5) > 0.5 ? 1 : 2,
      });
    }
    return lines;
  }, [frame, scratches]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {flicker > 0 ? (
        <AbsoluteFill
          style={{
            backgroundColor: flick > 0 ? "#ffffff" : "#000000",
            opacity: Math.abs(flick),
            mixBlendMode: flick > 0 ? "soft-light" : "multiply",
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          background: `radial-gradient(80% 70% at 50% 48%, transparent 45%, rgba(0,0,0,${0.9 * vignette}) 100%)`,
        }}
      />

      {scratchLines.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: l.x,
            width: l.w,
            background: "rgba(255,255,255,1)",
            opacity: l.o,
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          backgroundPosition: `${jitterX}px ${jitterY}px`,
          opacity: grain,
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
