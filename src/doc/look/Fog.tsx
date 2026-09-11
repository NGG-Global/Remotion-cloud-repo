import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * A soft cloud tile. Low-frequency turbulence, luminance lifted into alpha, so
 * the tile can be tinted with a background colour and layered with `screen`.
 */
const cloudTile = (seed: number, freq: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq} ${freq * 1.6}" numOctaves="4" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.55"/></filter><rect width="1024" height="512" filter="url(#f)"/></svg>`,
  )}")`;

const TILES = [
  cloudTile(3, 0.0022),
  cloudTile(11, 0.0031),
  cloudTile(19, 0.0045),
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
 * fog has parallax. Edges are masked with a gradient so it never shows a seam.
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
      }}
    >
      {TILES.map((tile, i) => {
        const k = 1 + i * 0.9;
        const x = -((frame * speed * k) % 1024);
        const y = Math.sin(frame * 0.004 * k + i) * 18;
        const scale = 1.35 + i * 0.35;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: "-25%",
              backgroundColor: tint,
              maskImage: tile,
              WebkitMaskImage: tile,
              maskRepeat: "repeat",
              WebkitMaskRepeat: "repeat",
              maskPosition: `${x}px ${y}px`,
              WebkitMaskPosition: `${x}px ${y}px`,
              maskSize: `${1024 * scale}px ${512 * scale}px`,
              WebkitMaskSize: `${1024 * scale}px ${512 * scale}px`,
              opacity: density * (0.55 - i * 0.12),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
