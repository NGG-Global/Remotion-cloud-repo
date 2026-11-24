import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { rand } from "../motion";
import { C } from "../theme";

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: rand(i * 3 + 1) * 1080,
  y: rand(i * 3 + 2) * 1920,
  r: 1.2 + rand(i * 3 + 3) * 2.4,
  phase: rand(i * 7) * Math.PI * 2,
  drift: 6 + rand(i * 11) * 14,
}));

/**
 * The "space" every vector lives in: a slow-drifting dot grid over a deep
 * indigo gradient, with a few twinkling points. Kept quiet so the graphics
 * and captions always win.
 */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shift = (t * 9) % 60;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 70% at 50% 35%, ${C.bgLift} 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.gridStrong} 2.2px, transparent 2.6px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${shift}px ${shift * 0.6}px`,
          opacity: 0.55,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {STARS.map((s, i) => {
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.phase));
          const y = (s.y - t * s.drift + 1920 * 4) % 1920;
          return (
            <circle
              key={i}
              cx={s.x}
              cy={y}
              r={s.r}
              fill="#cfc8ff"
              opacity={tw * 0.5}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
