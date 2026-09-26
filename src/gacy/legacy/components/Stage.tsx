import React from "react";
import { AbsoluteFill } from "remotion";
import { PAL } from "../theme";

/**
 * Virtual camera. Children live in world space; the camera looks at
 * (camX, camY) and zooms around that point. `depth` below 1 lags behind
 * the camera, which is the parallax.
 */
export const World: React.FC<{
  readonly camX: number;
  readonly camY: number;
  readonly zoom?: number;
  readonly children: React.ReactNode;
}> = ({ camX, camY, zoom = 1, children }) => {
  return (
    <AbsoluteFill style={{ background: PAL.void, overflow: "hidden" }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        <g
          transform={`translate(${960} ${540}) scale(${zoom}) translate(${-camX} ${-camY})`}
        >
          {children}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** A world-space layer that drifts less than the camera, for depth. */
export const Layer: React.FC<{
  readonly depth: number;
  readonly camX: number;
  readonly camY?: number;
  readonly children: React.ReactNode;
}> = ({ depth, camX, camY = 0, children }) => {
  const lag = 1 - depth;
  return (
    <g transform={`translate(${camX * lag} ${camY * lag * 0.45})`}>{children}</g>
  );
};

export const Grade: React.FC<{ readonly lift?: number }> = ({ lift = 0 }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(8,10,16,0.28), transparent 22%, transparent 70%, rgba(8,10,16,0.45))`,
          opacity: 0.9,
        }}
      />
      {lift > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(226, 163, 90, ${0.08 * lift})`,
            mixBlendMode: "soft-light",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
