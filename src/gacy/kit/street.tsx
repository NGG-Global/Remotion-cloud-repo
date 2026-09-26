import React from "react";
import { planeScale, useCam } from "../engine/camera";
import { darken, lit, mix, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Pool } from "./light";

/**
 * Streets, lawns and trees. Ground is a real horizontal plane: a strip that
 * runs from `near` to `far` metres (depths relative to the character plane)
 * projects to the band of screen it would cover. Lawns, sidewalks and road
 * therefore recede toward the horizon correctly as the camera moves.
 */

export const groundY = (cam: ReturnType<typeof useCam>, d: number): number =>
  540 + (cam.shiftY ?? 0) + (0 - cam.y) * planeScale(cam, d);

export const GroundStrip: React.FC<{
  readonly near: number;
  readonly far: number;
  readonly color: string;
  readonly farColor?: string;
  readonly light?: Light;
  readonly opacity?: number;
}> = ({ near, far, color, farColor, light = NEUTRAL, opacity = 1 }) => {
  const cam = useCam();
  if (planeScale(cam, far) <= 0) {
    return null;
  }
  const yFar = groundY(cam, far);
  const yNear = planeScale(cam, near) > 0 ? groundY(cam, near) : 1400;
  if (yNear <= yFar || opacity <= 0) {
    return null;
  }
  const id = `gs-${near}-${far}-${color.replace("#", "")}`;
  const c1 = lit(farColor ?? darken(color, 0.12), light);
  const c2 = lit(color, light);
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x={-60} y={yFar - 0.5} width={2040} height={Math.min(1500, yNear - yFar + 1)} fill={`url(#${id})`} />
    </g>
  );
};

/** Lane markings across a road strip. */
export const RoadLines: React.FC<{
  readonly d: number;
  readonly color?: string;
  readonly light?: Light;
}> = ({ d, color = "#c9c0a0", light = NEUTRAL }) => {
  const cam = useCam();
  const s = planeScale(cam, d);
  if (s <= 0) {
    return null;
  }
  const y = groundY(cam, d);
  const dash = 600;
  const start = Math.floor((cam.x - 1400 / s) / dash) * dash;
  const out: React.ReactNode[] = [];
  for (let x = start; x < cam.x + 1400 / s; x += dash) {
    const sx = 960 + (x - cam.x) * s;
    out.push(
      <rect key={x} x={sx} y={y - 1.5 * s} width={300 * s} height={Math.max(1.5, 5 * s)} fill={lit(color, light)} opacity={0.55} />,
    );
  }
  return <g>{out}</g>;
};

export const Tree: React.FC<{
  readonly x: number;
  readonly h?: number;
  readonly t?: number;
  readonly kind?: "leafy" | "bare" | "pine";
  readonly tone?: string;
  readonly light?: Light;
  readonly seed?: number;
}> = ({ x, h = 1400, t = 0, kind = "leafy", tone = "#2f4636", light = NEUTRAL, seed = 0 }) => {
  const sway = noise(t * 0.35 + seed, seed) * 1.6;
  const trunk = lit("#3b2e25", light);
  const w = h * 0.045;
  if (kind === "bare") {
    const br = lit("#2e2621", light);
    const branches = Array.from({ length: 9 }, (_, i) => {
      const y0 = -h * (0.45 + (i / 9) * 0.5);
      const dir = i % 2 ? 1 : -1;
      const len = h * (0.34 - i * 0.022) * (0.8 + hash(seed + i) * 0.4);
      const ang = dir * (40 + hash(seed * 3 + i) * 24);
      const ex = Math.sin((ang * Math.PI) / 180) * len;
      const ey = y0 - Math.cos((ang * Math.PI) / 180) * len;
      return (
        <g key={i}>
          <path d={`M0 ${y0} Q${ex * 0.4} ${y0 - len * 0.2} ${ex} ${ey}`} stroke={br} strokeWidth={w * (0.55 - i * 0.04)} fill="none" strokeLinecap="round" />
          <path d={`M${ex * 0.6} ${(y0 + ey) / 2} L${ex * 0.9 + dir * len * 0.2} ${ey - len * 0.25}`} stroke={br} strokeWidth={w * 0.18} strokeLinecap="round" />
        </g>
      );
    });
    return (
      <g transform={`translate(${x} 0) rotate(${sway * 0.4} 0 0)`}>
        <path d={`M${-w} 0 L${-w * 0.5} ${-h * 0.8} L${w * 0.5} ${-h * 0.8} L${w} 0 Z`} fill={trunk} />
        {branches}
      </g>
    );
  }
  if (kind === "pine") {
    const c = lit(tone, light);
    const c2 = lit(darken(tone, 0.25), light);
    return (
      <g transform={`translate(${x} 0) rotate(${sway * 0.3} 0 0)`}>
        <rect x={-w * 0.6} y={-h * 0.2} width={w * 1.2} height={h * 0.2} fill={trunk} />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M0 ${-h * (0.35 + i * 0.18) - h * 0.28} L${h * (0.26 - i * 0.05)} ${-h * (0.18 + i * 0.18)} L${-h * (0.26 - i * 0.05)} ${-h * (0.18 + i * 0.18)} Z`}
            fill={i % 2 ? c2 : c}
          />
        ))}
      </g>
    );
  }
  const c1 = lit(tone, light);
  const c2 = lit(darken(tone, 0.22), light);
  const c3 = lit(mix(tone, "#9aa878", 0.18), light);
  const blobs = [
    [0, -0.78, 0.33],
    [-0.2, -0.64, 0.25],
    [0.22, -0.66, 0.26],
    [-0.08, -0.92, 0.24],
    [0.14, -0.86, 0.22],
  ];
  return (
    <g transform={`translate(${x} 0)`}>
      <path d={`M${-w} 0 L${-w * 0.6} ${-h * 0.62} L${w * 0.6} ${-h * 0.62} L${w} 0 Z`} fill={trunk} />
      <g transform={`rotate(${sway} 0 ${-h * 0.6})`}>
        {blobs.map(([bx, by, br], i) => (
          <ellipse key={i} cx={bx * h} cy={by * h} rx={br * h} ry={br * h * 0.82} fill={i === 1 ? c2 : c1} />
        ))}
        <ellipse cx={0.1 * h} cy={-0.9 * h} rx={0.13 * h} ry={0.09 * h} fill={c3} opacity={0.6} />
        <ellipse cx={-0.18 * h} cy={-0.56 * h} rx={0.22 * h} ry={0.1 * h} fill={c2} opacity={0.7} />
      </g>
    </g>
  );
};

export const Bush: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly tone?: string;
  readonly light?: Light;
  readonly snow?: boolean;
}> = ({ x, w = 260, tone = "#2c3f30", light = NEUTRAL, snow = false }) => (
  <g transform={`translate(${x} 0)`}>
    <ellipse cx={0} cy={-w * 0.28} rx={w * 0.5} ry={w * 0.32} fill={lit(tone, light)} />
    <ellipse cx={-w * 0.25} cy={-w * 0.2} rx={w * 0.3} ry={w * 0.22} fill={lit(darken(tone, 0.2), light)} />
    <ellipse cx={w * 0.22} cy={-w * 0.36} rx={w * 0.22} ry={w * 0.18} fill={lit(mix(tone, "#8a9a70", 0.15), light)} />
    {snow ? <ellipse cx={0} cy={-w * 0.52} rx={w * 0.38} ry={w * 0.1} fill={lit("#dfe6ee", light)} /> : null}
  </g>
);

/** Street lamp with its pool of light on the ground. */
export const StreetLamp: React.FC<{
  readonly x: number;
  readonly t?: number;
  readonly on?: number;
  readonly light?: Light;
  readonly flicker?: boolean;
}> = ({ x, t = 0, on = 1, light = NEUTRAL, flicker = false }) => {
  const f = flicker ? (noise(t * 12, x) > 0.75 ? 0.4 : 1) : 1;
  const glow = on * f;
  const pole = lit("#2a2c30", light);
  return (
    <g transform={`translate(${x} 0)`}>
      <Pool x={0} y={0} rx={520} ry={70} color="#f3c98a" opacity={0.35 * glow} />
      <rect x={-7} y={-1000} width={14} height={1000} fill={pole} />
      <path d="M0 -1000 Q0 -1060 90 -1060" stroke={pole} strokeWidth={12} fill="none" />
      <path d="M70 -1070 L130 -1070 L122 -1046 L78 -1046 Z" fill={lit("#35342f", light)} />
      <ellipse cx={100} cy={-1044} rx={20} ry={6} fill="#ffe0a8" opacity={0.3 + 0.7 * glow} />
      <Pool x={100} y={-1030} rx={160} ry={140} color="#f5cf90" opacity={0.45 * glow} />
    </g>
  );
};

/** Wooden utility pole. Wires are drawn by the scene between poles. */
export const UtilityPole: React.FC<{
  readonly x: number;
  readonly light?: Light;
}> = ({ x, light = NEUTRAL }) => {
  const c = lit("#3a2e26", light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-11} y={-1900} width={22} height={1900} fill={c} />
      <rect x={-130} y={-1800} width={260} height={14} fill={c} />
      <rect x={-90} y={-1680} width={180} height={12} fill={c} />
      {[-110, -40, 40, 110].map((ix) => (
        <rect key={ix} x={ix - 4} y={-1818} width={8} height={18} fill={lit("#8a8f96", light)} />
      ))}
    </g>
  );
};

export const Wires: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly y?: number;
  readonly sag?: number;
  readonly light?: Light;
}> = ({ x0, x1, y = -1810, sag = 90, light = NEUTRAL }) => (
  <g stroke={lit("#141619", light)} strokeWidth={3} fill="none" opacity={0.8}>
    {[-110, -40, 40, 110].map((o, i) => (
      <path key={i} d={`M${x0 + o} ${y} Q${(x0 + x1) / 2 + o} ${y + sag + i * 6} ${x1 + o} ${y}`} />
    ))}
  </g>
);

export const Mailbox: React.FC<{ readonly x: number; readonly light?: Light }> = ({
  x,
  light = NEUTRAL,
}) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-5} y={-230} width={10} height={230} fill={lit("#4a3a2c", light)} />
    <path d="M-34 -230 L34 -230 L34 -282 Q0 -306 -34 -282 Z" fill={lit("#2e3236", light)} />
    <rect x={30} y={-282} width={6} height={30} fill={lit("#8a2c24", light)} />
  </g>
);

export const PicketFence: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly h?: number;
  readonly color?: string;
  readonly light?: Light;
}> = ({ x0, x1, h = 200, color = "#d8d2c4", light = NEUTRAL }) => {
  const n = Math.floor((x1 - x0) / 44);
  const c = lit(color, light);
  return (
    <g>
      <rect x={x0} y={-h * 0.72} width={x1 - x0} height={12} fill={lit(darken(color, 0.2), light)} />
      <rect x={x0} y={-h * 0.3} width={x1 - x0} height={12} fill={lit(darken(color, 0.2), light)} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${x0 + i * 44} 0 L${x0 + i * 44} ${-h} L${x0 + i * 44 + 13} ${-h - 14} L${x0 + i * 44 + 26} ${-h} L${x0 + i * 44 + 26} 0 Z`} fill={c} />
      ))}
    </g>
  );
};
