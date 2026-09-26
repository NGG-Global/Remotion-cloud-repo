import React from "react";

/**
 * Practical light: pools, glows and beams, drawn as gradients with a screen
 * blend so they brighten whatever they fall on. These carry most of the
 * mood; a set with no practical light reads as a diagram.
 */

const gid = (...parts: (string | number)[]) =>
  parts.join("-").replace(/[^a-zA-Z0-9-]/g, "");

/** Soft elliptical pool of light (lamp on a floor, window on a lawn). */
export const Pool: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rx: number;
  readonly ry: number;
  readonly color?: string;
  readonly opacity?: number;
  readonly blend?: "screen" | "normal" | "soft-light" | "overlay";
}> = ({ x, y, rx, ry, color = "#ffd9a0", opacity = 0.5, blend = "screen" }) => {
  const id = gid("pool", color);
  if (opacity <= 0.001) {
    return null;
  }
  return (
    <g style={{ mixBlendMode: blend }}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="0.45" stopColor={color} stopOpacity={0.45} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} opacity={opacity} />
    </g>
  );
};

/**
 * A cone of light from (x, y) along `angle` (degrees, 0 = pointing right,
 * 90 = straight down), `length` long, `spread` degrees wide.
 */
export const Beam: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly length: number;
  readonly spread?: number;
  readonly color?: string;
  readonly opacity?: number;
}> = ({ x, y, angle, length, spread = 22, color = "#f4e6c2", opacity = 0.5 }) => {
  if (opacity <= 0.001) {
    return null;
  }
  const id = gid("beam", color);
  const half = (spread / 2) * (Math.PI / 180);
  const w = Math.tan(half) * length;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle})`}
      style={{ mixBlendMode: "screen" }}
      opacity={opacity}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity={0.95} />
          <stop offset="0.6" stopColor={color} stopOpacity={0.35} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`M0 -3 L${length} ${-w} Q${length * 1.04} 0 ${length} ${w} L0 3 Z`} fill={`url(#${id})`} />
      <path
        d={`M0 -1.5 L${length * 0.7} ${-w * 0.35} L${length * 0.7} ${w * 0.35} L0 1.5 Z`}
        fill={`url(#${id})`}
        opacity={0.6}
      />
    </g>
  );
};

/** Round glow around a bulb or a window. */
export const Glow: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly color?: string;
  readonly opacity?: number;
}> = ({ x, y, r, color = "#ffd9a0", opacity = 0.6 }) => (
  <Pool x={x} y={y} rx={r} ry={r} color={color} opacity={opacity} />
);

/** Full-rect light falloff from one side; cheap "the lamp is over there". */
export const Wash: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly from?: "left" | "right" | "top" | "bottom";
  readonly color?: string;
  readonly opacity?: number;
}> = ({ x, y, w, h, from = "left", color = "#000", opacity = 0.5 }) => {
  const id = gid("wash", from, color);
  const dir =
    from === "left"
      ? { x1: 0, y1: 0, x2: 1, y2: 0 }
      : from === "right"
        ? { x1: 1, y1: 0, x2: 0, y2: 0 }
        : from === "top"
          ? { x1: 0, y1: 0, x2: 0, y2: 1 }
          : { x1: 0, y1: 1, x2: 0, y2: 0 };
  return (
    <g>
      <defs>
        <linearGradient id={id} {...dir}>
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} opacity={opacity} />
    </g>
  );
};
