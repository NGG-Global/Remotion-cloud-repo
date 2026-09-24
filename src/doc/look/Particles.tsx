import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { hash } from "../theme";

type ParticlesProps = {
  readonly count?: number;
  /** "dust" drifts and twinkles; "embers" rise and glow; "rain" falls. */
  readonly kind?: "dust" | "embers" | "rain";
  readonly color?: string;
  readonly opacity?: number;
};

/**
 * Deterministic particle field. Every particle's path is a closed-form
 * function of the frame and its index, so any frame renders identically
 * whether scrubbed or rendered in parallel.
 */
export const Particles: React.FC<ParticlesProps> = ({
  count = 60,
  kind = "dust",
  color = "#d9d3c3",
  opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const items = [];
  for (let i = 0; i < count; i++) {
    const r1 = hash(i * 3 + 1);
    const r2 = hash(i * 3 + 2);
    const r3 = hash(i * 3 + 3);
    const size = kind === "rain" ? 1 : 1.5 + r3 * 2.5;
    let x: number;
    let y: number;
    let a: number;
    if (kind === "rain") {
      const speed = 22 + r3 * 16;
      x = ((r1 * 1920 + frame * 1.5) % 2000) - 40;
      y = ((r2 * 1080 + frame * speed) % 1180) - 50;
      a = 0.25 + r3 * 0.4;
    } else if (kind === "embers") {
      const speed = 0.5 + r3 * 0.9;
      x = r1 * 1920 + Math.sin(frame * 0.02 + i) * 30;
      y = 1120 - ((r2 * 1200 + frame * speed) % 1250);
      a = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i * 1.7));
    } else {
      x = ((r1 * 1920 + frame * (0.2 + r3 * 0.4)) % 1980) - 30;
      y =
        ((r2 * 1080 + Math.sin(frame * 0.01 + i) * 40 + frame * 0.12) % 1140) -
        30;
      a = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.03 + i * 2.1));
    }
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: kind === "rain" ? 14 + r3 * 10 : size,
          borderRadius: kind === "rain" ? 0 : "50%",
          background: color,
          opacity: a * opacity,
          boxShadow: kind === "embers" ? `0 0 6px ${color}` : undefined,
        }}
      />,
    );
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{items}</AbsoluteFill>;
};
