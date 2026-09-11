import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { useCurrentFrame } from "remotion";

/**
 * Three pre-rendered cloud tiles (public/fog), generated once as periodic
 * value noise so they tile without a seam. Rasterised fog is the difference
 * between a two-second frame and a ninety-second one: an SVG turbulence
 * filter re-rasterises at full size every frame, a PNG is just composited.
 */
const TILES = [
  staticFile("fog/cloud-0.png"),
  staticFile("fog/cloud-1.png"),
  staticFile("fog/cloud-2.png"),
];

type FogProps = {
  /** Overall opacity, 0-1. */
  readonly density?: number;
  /** Horizontal drift in pixels per frame for the slowest layer. */
  readonly speed?: number;
  /** Colour the fog takes. Defaults to a cold grey. */
  readonly tint?: string;
  /** Where the fog sits vertically: "low" hugs the ground, "full" fills the frame. */
  readonly band?: "low" | "full" | "high";
  /** Blend against the scene. `screen` for lit fog, `normal` for a veil. */
  readonly blend?: "screen" | "normal" | "soft-light";
  /** Frame offset so two fog instances never move in lockstep. */
  readonly seed?: number;
};

/**
 * Three drifting cloud layers, each at a different speed and scale, so the
 * fog has parallax. The band is a vertical gradient mask on the container.
 */
export const Fog: React.FC<FogProps> = ({
  density = 0.5,
  speed = 0.35,
  tint = "#8a94a3",
  band = "full",
  blend = "screen",
  seed = 0,
}) => {
  const frame = useCurrentFrame() + seed;

  const mask =
    band === "low"
      ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 75%)"
      : band === "high"
        ? "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 85%)"
        : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.5) 100%)";

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        maskImage: mask,
        WebkitMaskImage: mask,
        mixBlendMode: blend,
        overflow: "hidden",
      }}
    >
      {TILES.map((tile, i) => {
        const k = 1 + i * 0.9;
        const scale = 1.35 + i * 0.35;
        const tileW = 1024 * scale;
        const x = -((frame * speed * k) % tileW);
        const y = Math.sin(frame * 0.004 * k + i) * 18;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: -40,
              backgroundColor: tint,
              backgroundImage: `url(${tile})`,
              backgroundRepeat: "repeat",
              backgroundPosition: `${x}px ${y}px`,
              backgroundSize: `${tileW}px ${512 * scale}px`,
              backgroundBlendMode: "multiply",
              // Only the cloud's alpha is wanted: the tint fills it via the
              // background colour and the image's alpha clips it.
              maskImage: `url(${tile})`,
              WebkitMaskImage: `url(${tile})`,
              maskRepeat: "repeat",
              WebkitMaskRepeat: "repeat",
              maskPosition: `${x}px ${y}px`,
              WebkitMaskPosition: `${x}px ${y}px`,
              maskSize: `${tileW}px ${512 * scale}px`,
              WebkitMaskSize: `${tileW}px ${512 * scale}px`,
              opacity: density * (0.6 - i * 0.12),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
