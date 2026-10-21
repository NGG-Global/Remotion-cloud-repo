import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { R } from "../theme";

type BurstProps = {
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly count?: number;
  readonly spread?: number;
  readonly colors?: readonly string[];
};

const seeded = (i: number, salt: number) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * Confetti burst from a point: pieces fly out, slow, and drop under gravity,
 * all derived from the frame so a re-render gives the same shower.
 */
export const Burst: React.FC<BurstProps> = ({
  at,
  x,
  y,
  count = 26,
  spread = 420,
  colors = [R.blue, R.yellow, R.coral, R.green, R.purple],
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 55) return null;

  return (
    <div
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}
    >
      {Array.from({ length: count }, (_, i) => {
        const angle = seeded(i, 1) * Math.PI * 2;
        const speed = spread * (0.5 + seeded(i, 2) * 0.5);
        const ease = 1 - Math.pow(1 - Math.min(t / 40, 1), 3);
        const px = Math.cos(angle) * speed * ease;
        const py = Math.sin(angle) * speed * ease + t * t * 0.45;
        const rot = seeded(i, 3) * 720 * ease;
        const size = 14 + seeded(i, 4) * 18;
        const opacity = interpolate(t, [0, 30, 55], [1, 1, 0]);
        const round = seeded(i, 5) > 0.5;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: round ? size : size * 0.55,
              borderRadius: round ? size : 4,
              background: colors[i % colors.length],
              transform: `translate(${px}px, ${py}px) rotate(${rot}deg)`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
