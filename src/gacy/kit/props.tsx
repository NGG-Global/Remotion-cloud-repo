import React from "react";
import { darken, lit, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Glow } from "./light";

/**
 * Small props. World scale unless noted. "Hand" props are drawn in a
 * hand's local frame: origin at the palm, +y running down the forearm.
 */

export const Balloon: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly t: number;
  readonly seed?: number;
  readonly ax?: number;
  readonly ay?: number;
  readonly light?: Light;
}> = ({ x, y, color, t, seed = 0, ax, ay, light = NEUTRAL }) => {
  const bx = x + noise(t * 0.6, seed) * 16;
  const by = y + noise(t * 0.5, seed + 3) * 10;
  return (
    <g>
      <path d={`M${ax ?? x} ${ay ?? y + 300} Q${(bx + (ax ?? x)) / 2 + 12} ${(by + (ay ?? y + 300)) / 2} ${bx} ${by + 58}`} stroke={lit("#d8d0c0", light)} strokeWidth={2} fill="none" />
      <ellipse cx={bx} cy={by} rx={46} ry={56} fill={lit(color, light)} />
      <ellipse cx={bx - 14} cy={by - 20} rx={10} ry={16} fill="#fff" opacity={0.3} />
      <path d={`M${bx - 6} ${by + 56} L${bx + 6} ${by + 56} L${bx} ${by + 64} Z`} fill={lit(darken(color, 0.2), light)} />
    </g>
  );
};

export const PicnicTable: React.FC<{ readonly x: number; readonly light?: Light; readonly cloth?: string }> = ({
  x,
  light = NEUTRAL,
  cloth,
}) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={380} ry={16} fill="#000" opacity={0.25} />
      <rect x={-340} y={-150} width={680} height={20} fill={L(cloth ?? "#8a6a44")} />
      {cloth ? <path d="M-346 -150 L346 -150 L356 -100 L-356 -100 Z" fill={L(cloth)} /> : null}
      <rect x={-380} y={-86} width={760} height={16} fill={L("#7a5a3a")} />
      <path d="M-260 -130 L-300 0 M260 -130 L300 0 M-240 -130 L-200 0 M240 -130 L200 0" stroke={L("#5a4028")} strokeWidth={16} />
    </g>
  );
};

export const Grill: React.FC<{ readonly x: number; readonly t: number; readonly light?: Light }> = ({
  x,
  t,
  light = NEUTRAL,
}) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-40 0 L-10 -170 M40 0 L10 -170 M0 0 L0 -170" stroke={L("#2a2a2a")} strokeWidth={8} />
      <path d="M-90 -170 Q0 -110 90 -170 Z" fill={L("#1e1e20")} />
      <rect x={-94} y={-176} width={188} height={10} rx={4} fill={L("#3a3a3c")} />
      <Glow x={0} y={-180} r={100} color="#ff8a3a" opacity={0.35} />
      {Array.from({ length: 6 }, (_, i) => {
        const p = ((t * 0.35 + i / 6) % 1 + 1) % 1;
        return (
          <ellipse
            key={i}
            cx={noise(t * 0.5 + i, i) * 30 + p * 60}
            cy={-190 - p * 420}
            rx={30 + p * 70}
            ry={20 + p * 40}
            fill={L("#c8c4bc")}
            opacity={0.35 * (1 - p)}
          />
        );
      })}
    </g>
  );
};

export const StringLights: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly y: number;
  readonly sag?: number;
  readonly on?: number;
  readonly t?: number;
}> = ({ x0, x1, y, sag = 80, on = 1, t = 0 }) => {
  const n = Math.floor((x1 - x0) / 90);
  const cols = ["#ffd88a", "#ffb87a", "#f8e8b0"];
  return (
    <g>
      <path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`} stroke="#1a1814" strokeWidth={2.5} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / n;
        const bx = x0 + (x1 - x0) * u;
        const by = y + sag * 4 * u * (1 - u) + 10;
        const tw = 0.85 + noise(t * 2 + i, i) * 0.15;
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r={8} fill={cols[i % 3]} opacity={on * tw} />
            {on > 0 ? <Glow x={bx} y={by} r={60} color={cols[i % 3]} opacity={0.3 * on * tw} /> : null}
          </g>
        );
      })}
    </g>
  );
};

export const Bunting: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly y: number;
  readonly light?: Light;
}> = ({ x0, x1, y, light = NEUTRAL }) => {
  const n = Math.floor((x1 - x0) / 70);
  const cols = ["#9a3a32", "#e8e2d4", "#2e4a7a"];
  return (
    <g>
      <path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y + 90} ${x1} ${y}`} stroke={lit("#e8e2d4", light)} strokeWidth={2} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / n;
        const bx = x0 + (x1 - x0) * u;
        const by = y + 180 * u * (1 - u);
        return <path key={i} d={`M${bx - 26} ${by} L${bx + 26} ${by} L${bx} ${by + 56} Z`} fill={lit(cols[i % 3], light)} />;
      })}
    </g>
  );
};

export const Lumber: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly n?: number;
  readonly len?: number;
  readonly light?: Light;
}> = ({ x, y = 0, n = 6, len = 700, light = NEUTRAL }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-len / 2 + (i % 2) * 20} y={-22 - i * 22} width={len} height={20} fill={lit(i % 2 ? "#c8a070" : "#b8905e", light)} />
    ))}
    <rect x={-len / 2 + 60} y={-6} width={30} height={6} fill={lit("#6a5a4a", light)} />
  </g>
);

export const Sawhorse: React.FC<{ readonly x: number; readonly light?: Light }> = ({ x, light = NEUTRAL }) => (
  <g transform={`translate(${x} 0)`} stroke={lit("#a07a4a", light)} strokeWidth={14}>
    <path d="M-120 -170 L120 -170" strokeWidth={24} />
    <path d="M-100 -170 L-140 0 M-100 -170 L-60 0 M100 -170 L60 0 M100 -170 L140 0" />
  </g>
);

/** A single board or plywood sheet carried in the hand (hand-local). */
export const HeldBoard: React.FC<{ readonly len?: number; readonly light?: Light }> = ({ len = 520, light = NEUTRAL }) => (
  <rect x={-len * 0.5} y={-6} width={len} height={18} fill={lit("#c8a070", light)} transform="rotate(90)" />
);

export const Clipboard: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g transform="rotate(-70) translate(-10 -40)">
    <rect x={0} y={0} width={60} height={80} rx={4} fill={lit("#8a6a40", light)} />
    <rect x={6} y={10} width={48} height={64} fill={lit("#f0ead8", light)} />
    <rect x={20} y={-4} width={20} height={10} rx={2} fill={lit("#b8b8b8", light)} />
  </g>
);

export const Newspaper: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g transform="rotate(-80) translate(-20 -10)">
    <rect x={0} y={0} width={70} height={30} rx={8} fill={lit("#dcd6c8", light)} />
    <rect x={8} y={8} width={54} height={4} fill={lit("#8a867e", light)} />
  </g>
);

export const Cup: React.FC<{ readonly light?: Light; readonly steam?: number; readonly t?: number }> = ({
  light = NEUTRAL,
  steam = 0,
  t = 0,
}) => (
  <g transform="rotate(-90) translate(-4 -14)">
    <path d="M0 0 L22 0 L19 28 L3 28 Z" fill={lit("#ece6da", light)} />
    {steam > 0
      ? [0, 1].map((i) => (
          <path key={i} d={`M${8 + i * 6} -4 q ${noise(t + i, i) * 6} -10 0 -20`} stroke="#fff" strokeWidth={2} opacity={0.3 * steam} fill="none" />
        ))
      : null}
  </g>
);

export const Spatula: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g>
    <rect x={-3} y={0} width={6} height={70} fill={lit("#3a3a3a", light)} />
    <rect x={-12} y={66} width={24} height={30} rx={3} fill={lit("#9a9a9a", light)} />
  </g>
);

export const Keys: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g>
    <circle cx={0} cy={14} r={7} fill="none" stroke={lit("#c8c0a0", light)} strokeWidth={2.5} />
    <rect x={-2} y={18} width={4} height={18} fill={lit("#c8c0a0", light)} />
  </g>
);

export const Envelope: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g transform="rotate(-80) translate(-24 -8)">
    <rect x={0} y={0} width={48} height={24} fill={lit("#e8dcc0", light)} />
    <path d="M0 0 L24 14 L48 0" stroke={lit("#b8a888", light)} strokeWidth={2} fill="none" />
  </g>
);

export const Flashlight: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g transform="rotate(-90)">
    <rect x={-6} y={-8} width={52} height={16} rx={4} fill={lit("#2a2c30", light)} />
    <rect x={40} y={-11} width={14} height={22} rx={3} fill={lit("#3a3c40", light)} />
  </g>
);

export const Shovel: React.FC<{ readonly light?: Light; readonly len?: number }> = ({ light = NEUTRAL, len = 260 }) => (
  <g transform="rotate(-100)">
    <rect x={-len * 0.3} y={-4} width={len} height={8} fill={lit("#8a6a44", light)} />
    <path d={`M${len * 0.7} -16 L${len * 0.7 + 60} -12 Q${len * 0.7 + 74} 0 ${len * 0.7 + 60} 12 L${len * 0.7} 16 Z`} fill={lit("#6a6e72", light)} />
  </g>
);

export const Trowel: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g transform="rotate(-10)">
    <rect x={-3} y={0} width={6} height={20} fill={lit("#6a4a2a", light)} />
    <path d="M-10 20 L10 20 L0 48 Z" fill={lit("#9a9ea2", light)} />
  </g>
);

export const Podium: React.FC<{ readonly x: number; readonly light?: Light }> = ({ x, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-80 0 L-60 -260 L60 -260 L80 0 Z" fill={L("#5a3e2a")} />
      <path d="M-90 -260 L90 -260 L100 -300 L-100 -300 Z" fill={L("#6a4a32")} />
      <circle cx={0} cy={-150} r={30} fill={L("#c8a860")} opacity={0.7} />
      <rect x={-4} y={-360} width={8} height={70} fill={L("#2a2a2a")} />
      <ellipse cx={0} cy={-366} rx={12} ry={16} fill={L("#1a1a1a")} />
    </g>
  );
};

export const Flag: React.FC<{ readonly x: number; readonly t: number; readonly light?: Light }> = ({ x, t, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  const w = (i: number) => Math.sin(t * 2 + i) * 8;
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-5} y={-900} width={10} height={900} fill={L("#c8b070")} />
      <path d={`M5 -880 Q90 ${-880 + w(0)} 180 -880 L180 -700 Q90 ${-700 + w(1)} 5 -700 Z`} fill={L("#9a3a32")} />
      {[1, 3, 5].map((i) => (
        <path key={i} d={`M5 ${-880 + i * 26} Q90 ${-880 + i * 26 + w(i)} 180 ${-880 + i * 26}`} stroke={L("#ece6da")} strokeWidth={12} fill="none" />
      ))}
      <rect x={5} y={-880} width={80} height={92} fill={L("#2e3e6a")} />
    </g>
  );
};

/** Camera-flash pop at time `at`, as a screen-space flash plus a bulb glow. */
export const flashAmount = (t: number, at: number): number => {
  const d = t - at;
  if (d < 0 || d > 0.35) {
    return 0;
  }
  return Math.exp(-d * 14);
};

export const PressCamera: React.FC<{ readonly flash?: number; readonly light?: Light }> = ({
  flash = 0,
  light = NEUTRAL,
}) => (
  <g transform="rotate(-90) translate(-10 -30)">
    <rect x={0} y={0} width={60} height={40} rx={4} fill={lit("#2a2a2c", light)} />
    <circle cx={30} cy={20} r={12} fill={lit("#4a4a50", light)} />
    <rect x={10} y={-40} width={10} height={40} fill={lit("#6a6a6a", light)} />
    <circle cx={15} cy={-48} r={16} fill={lit("#d8d8d8", light)} />
    {flash > 0 ? <Glow x={15} y={-48} r={600} color="#ffffff" opacity={flash} /> : null}
  </g>
);

export const Crowd: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly n: number;
  readonly color: string;
  readonly h?: number;
  readonly seed?: number;
  readonly t?: number;
}> = ({ x0, x1, n, color, h = 340, seed = 0, t = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = x0 + ((i + hash(seed + i) * 0.6) / n) * (x1 - x0);
      const hh = h * (0.88 + hash(seed + i * 3) * 0.2);
      const sway = noise(t * 0.4 + i, seed + i) * 3;
      return (
        <g key={i} transform={`translate(${x} 0) rotate(${sway} 0 0)`}>
          <ellipse cx={0} cy={-hh + 26} rx={24} ry={28} fill={color} />
          <path d={`M-40 ${-hh + 62} Q0 ${-hh + 44} 40 ${-hh + 62} L46 ${-hh * 0.45} L30 0 L-30 0 L-46 ${-hh * 0.45} Z`} fill={color} />
        </g>
      );
    })}
  </g>
);



/** A child's bicycle in side view; wheels roll with x. */
export const Bicycle: React.FC<{ readonly x: number; readonly light?: Light; readonly color?: string }> = ({
  x,
  light = NEUTRAL,
  color = "#3a6a9a",
}) => {
  const L = (c: string) => lit(c, light);
  const r = 44;
  const roll = (x / r) * (180 / Math.PI);
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} ${-r})`}>
      <circle r={r} fill="none" stroke={L("#1a1a1a")} strokeWidth={6} />
      <g transform={`rotate(${roll})`} stroke={L("#9a9a9a")} strokeWidth={1.5}>
        <path d={`M${-r} 0 L${r} 0 M0 ${-r} L0 ${r}`} />
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} 0)`}>
      {wheel(-60)}
      {wheel(70)}
      <path d={`M-60 ${-r} L-10 ${-r - 70} L50 ${-r - 70} L70 ${-r} M-10 ${-r - 70} L0 ${-r} L-60 ${-r} M50 ${-r - 70} L56 ${-r - 100}`} stroke={L(color)} strokeWidth={7} fill="none" strokeLinejoin="round" />
      <rect x={-26} y={-r - 84} width={34} height={8} rx={4} fill={L("#1a1a1a")} />
      <path d={`M46 ${-r - 104} L70 ${-r - 108}`} stroke={L("#2a2a2a")} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};
