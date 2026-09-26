import React from "react";
import { darken, lighten, lit, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Glow, Pool } from "./light";

/** Buildings in elevation, world scale (200 units per metre). */

const windowsGrid = (
  x0: number,
  y0: number,
  cols: number,
  rows: number,
  w: number,
  h: number,
  gx: number,
  gy: number,
  fill: (i: number, r: number) => string,
) =>
  Array.from({ length: cols * rows }, (_, k) => {
    const c = k % cols;
    const r = Math.floor(k / cols);
    return <rect key={k} x={x0 + c * gx} y={y0 + r * gy} width={w} height={h} fill={fill(c, r)} />;
  });

/** Late-1960s county courthouse: stone, steps, columns. */
export const Courthouse: React.FC<{ readonly x: number; readonly light?: Light }> = ({ x, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-2600} y={-2400} width={5200} height={2400} fill={L("#b8b0a0")} />
      <rect x={-2700} y={-2480} width={5400} height={100} fill={L("#a8a090")} />
      <path d="M-1200 -2480 L0 -2900 L1200 -2480 Z" fill={L("#aca494")} />
      <path d="M-1000 -2500 L0 -2830 L1000 -2500 Z" fill={L("#c0b8a8")} />
      {windowsGrid(-2400, -2200, 6, 2, 220, 380, 280, 560, () => L("#3a4048"))}
      {windowsGrid(900, -2200, 6, 2, 220, 380, 280, 560, () => L("#3a4048"))}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={-900 + i * 340} y={-2380} width={140} height={1960} fill={L("#d0c8b8")} />
          <rect x={-900 + i * 340} y={-2380} width={40} height={1960} fill={L("#b0a898")} />
        </g>
      ))}
      <rect x={-300} y={-1100} width={600} height={680} fill={L("#2a2622")} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={-1300 - i * 60} y={-420 + i * 70} width={2600 + i * 120} height={70} fill={L(i % 2 ? "#a8a090" : "#b4ac9c")} />
      ))}
    </g>
  );
};

/** Prison perimeter: concrete wall, fence, a tower, floodlights. */
export const PrisonWall: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly light?: Light;
  readonly night?: boolean;
  readonly gate?: number;
  readonly gateX?: number;
  readonly t?: number;
}> = ({ x0, x1, light = NEUTRAL, night = false, gate = 0, gateX = 0, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const h = 1600;
  const gw = 900;
  return (
    <g>
      <rect x={x0} y={-h} width={x1 - x0} height={h} fill={L("#9a968c")} />
      {Array.from({ length: Math.floor((x1 - x0) / 400) }, (_, i) => (
        <rect key={i} x={x0 + i * 400} y={-h} width={6} height={h} fill={L("#8a867c")} />
      ))}
      <rect x={x0} y={-h - 40} width={x1 - x0} height={40} fill={L("#7a766c")} />
      {/* razor wire coils */}
      {Array.from({ length: Math.floor((x1 - x0) / 90) }, (_, i) => (
        <circle key={i} cx={x0 + i * 90 + 45} cy={-h - 80} r={40} fill="none" stroke={L("#5a5a5a")} strokeWidth={4} />
      ))}
      {/* gate */}
      <rect x={gateX - gw / 2 - 40} y={-1200} width={gw + 80} height={1200} fill={L("#6a665e")} />
      <rect x={gateX - gw / 2} y={-1100} width={gw} height={1100} fill={L("#1a1c1e")} />
      <g transform={`translate(${gateX - gw / 2} 0)`}>
        <rect x={-gate * gw * 0.9} y={-1100} width={gw} height={1100} fill={L("#3a3e42")} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-gate * gw * 0.9 + 20 + i * 74} y={-1080} width={14} height={1060} fill={L("#2a2e32")} />
        ))}
      </g>
      {/* tower */}
      <g transform={`translate(${x1 - 700} 0)`}>
        <rect x={-120} y={-2600} width={240} height={2600} fill={L("#8a867c")} />
        <rect x={-260} y={-3000} width={520} height={400} fill={L("#6a665e")} />
        <rect x={-220} y={-2960} width={440} height={200} fill={night ? "#e8d8a8" : L("#2a3038")} opacity={night ? 0.7 : 1} />
        <path d="M-300 -3000 L0 -3200 L300 -3000 Z" fill={L("#4a4640")} />
      </g>
      {night
        ? [x0 + 800, (x0 + x1) / 2, x1 - 1500].map((lx, i) => (
            <g key={i}>
              <rect x={lx - 8} y={-2400} width={16} height={800} fill={L("#3a3a3a")} />
              <circle cx={lx} cy={-2410} r={26} fill="#fff6dc" opacity={0.9 + noise(t * 4, i) * 0.1} />
              <Glow x={lx} y={-2410} r={900} color="#f0e8c8" opacity={0.35} />
              <Pool x={lx} y={-10} rx={1500} ry={140} color="#e8e0c0" opacity={0.25} />
            </g>
          ))
        : null}
    </g>
  );
};

/** A 1960s fast-food stand with a pole sign; no brand, no lettering. */
export const DriveIn: React.FC<{
  readonly x: number;
  readonly light?: Light;
  /** People behind the service window, drawn between wall and glass. */
  readonly inside?: React.ReactNode;
}> = ({ x, light = NEUTRAL, inside }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      {/* pole sign: a bucket-and-star shape, no words */}
      <rect x={1500} y={-2200} width={40} height={2200} fill={L("#8a8a8a")} />
      <path d="M1320 -2600 L1720 -2600 L1660 -2200 L1380 -2200 Z" fill={L("#c8322a")} />
      <path d="M1360 -2560 L1680 -2560 L1640 -2260 L1400 -2260 Z" fill={L("#f2ece0")} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={1420 + i * 56} y={-2540} width={24} height={260} fill={L("#c8322a")} opacity={0.85} />
      ))}
      <circle cx={1520} cy={-2700} r={70} fill={L("#e8c23a")} />
      {/* building */}
      <path d="M-1500 -900 L1300 -900 L1400 -1000 L-1600 -1000 Z" fill={L("#c8322a")} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-1600 + i * 250} y={-1000} width={125} height={100} fill={L("#f2ece0")} opacity={0.9} />
      ))}
      <rect x={-1400} y={-900} width={2600} height={900} fill={L("#e8e0d0")} />
      <rect x={-1300} y={-640} width={2400} height={440} fill={L("#8aa6b8")} />
      {inside}
      <rect x={-1300} y={-640} width={2400} height={440} fill={L("#bcd0dc")} opacity={0.22} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-1300 + i * 480} y={-640} width={12} height={440} fill={L("#e8e0d0")} />
      ))}
      <rect x={-1400} y={-200} width={2600} height={200} fill={L("#e8e0d0")} />
      <rect x={-1400} y={-214} width={2600} height={30} fill={L("#b8b0a0")} />
      <rect x={-1400} y={-70} width={2600} height={70} fill={L("#c8322a")} />
      <path d="M-1300 -640 L-980 -200 L-800 -200 L-1120 -640 Z" fill="#fff" opacity={0.14} />
    </g>
  );
};

export const Farmhouse: React.FC<{ readonly x: number; readonly light?: Light; readonly lit?: number }> = ({
  x,
  light = NEUTRAL,
  lit: on = 0,
}) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-700 -1100 L0 -1700 L700 -1100 Z" fill={L("#3a3432")} />
      <rect x={-600} y={-1100} width={1200} height={1100} fill={L("#b8b0a2")} />
      <rect x={-460} y={-900} width={220} height={300} fill={on > 0 ? "#e8b870" : L("#2a2e34")} />
      <rect x={240} y={-900} width={220} height={300} fill={L("#2a2e34")} />
      <rect x={-100} y={-520} width={200} height={520} fill={L("#4a3a2e")} />
      <rect x={900} y={-1300} width={500} height={1300} fill={L("#7a3a2e")} />
      <path d="M850 -1300 L1150 -1600 L1450 -1300 Z" fill={L("#5a2a22")} />
    </g>
  );
};

export const Bus: React.FC<{
  readonly x: number;
  readonly light?: Light;
  readonly facing?: 1 | -1;
  readonly color?: string;
}> = ({ x, light = NEUTRAL, facing = 1, color = "#b8bcc0" }) => {
  const L = (c: string) => lit(c, light);
  const r = 90;
  const roll = (x / r) * facing;
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <ellipse cx={0} cy={-2} rx={1200} ry={24} fill="#000" opacity={0.35} />
      <path d="M-1200 -120 L-1200 -640 Q-1200 -700 -1140 -700 L1100 -700 Q1200 -700 1210 -600 L1220 -120 Z" fill={L(color)} />
      <rect x={-1200} y={-420} width={2420} height={60} fill={L("#2e4a7a")} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={-1100 + i * 230} y={-640} width={190} height={180} rx={10} fill={L("#26303a")} />
      ))}
      <rect x={1010} y={-640} width={180} height={300} fill={L("#26303a")} />
      {[-800, 700].map((wx) => (
        <g key={wx} transform={`translate(${wx} ${-r})`}>
          <circle r={r} fill={L("#141414")} />
          <circle r={r * 0.5} fill={L("#8a8a8a")} />
          <rect x={-4} y={-r * 0.5} width={8} height={r} fill={L("#5a5a5a")} transform={`rotate(${(roll * 180) / Math.PI})`} />
        </g>
      ))}
    </g>
  );
};

/** The castle horror films promise. Lit by lightning when `flash` > 0. */
export const Castle: React.FC<{ readonly x: number; readonly flash?: number; readonly light?: Light }> = ({
  x,
  flash = 0,
  light = NEUTRAL,
}) => {
  const c = lit(darken("#2a2630", 0.1 - flash * 0.4), light);
  const c2 = lit(darken("#1c1a22", -flash * 0.3), light);
  const win = "#e8b860";
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-4000 0 Q-2000 -900 0 -1100 Q2000 -900 4000 0 Z" fill={lit("#15141a", light)} />
      <g transform="translate(0 -1000)">
        {[-1100, -500, 500, 1100].map((tx, i) => (
          <g key={tx}>
            <rect x={tx - 180} y={-1800 - (i % 2) * 400} width={360} height={1800 + (i % 2) * 400} fill={i % 2 ? c2 : c} />
            <path d={`M${tx - 230} ${-1800 - (i % 2) * 400} L${tx} ${-2400 - (i % 2) * 400} L${tx + 230} ${-1800 - (i % 2) * 400} Z`} fill={c2} />
            <rect x={tx - 40} y={-1500 - (i % 2) * 300} width={80} height={140} rx={40} fill={win} opacity={0.8} />
          </g>
        ))}
        <rect x={-900} y={-1300} width={1800} height={1300} fill={c} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-900 + i * 210} y={-1400} width={120} height={120} fill={c} />
        ))}
        {/* the door */}
        <path d="M-260 0 L-260 -560 Q0 -820 260 -560 L260 0 Z" fill={lit("#3a2618", light)} />
        <path d="M-230 0 L-230 -540 Q0 -780 230 -540 L230 0 Z" fill={lit("#4a3220", light)} />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-230 + i * 100} y={-620} width={8} height={620} fill={lit("#2a1a10", light)} />
        ))}
        <rect x={-600} y={-900} width={100} height={160} rx={50} fill={win} opacity={0.7} />
        <rect x={500} y={-900} width={100} height={160} rx={50} fill={win} opacity={0.5} />
      </g>
    </g>
  );
};

/** A Chicago block of brick two- and three-flats, 1940s. */
export const CityBlock: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly light?: Light;
  readonly lit?: number;
  readonly seed?: number;
}> = ({ x0, x1, light = NEUTRAL, lit: on = 0.5, seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  const out: React.ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const w = 1300 + hash(seed + i) * 500;
    const floors = 2 + Math.floor(hash(seed + i * 3) * 2);
    const h = floors * 640 + 300;
    const brick = ["#7a4a3a", "#8a5a42", "#6a4034", "#8a6a52"][i % 4];
    out.push(
      <g key={i}>
        <rect x={x} y={-h} width={w - 20} height={h} fill={L(brick)} />
        <rect x={x - 20} y={-h - 60} width={w + 20} height={60} fill={L(darken(brick, 0.3))} />
        {Array.from({ length: floors }, (_, f) =>
          [0, 1, 2].map((c) => {
            const lw = hash(seed + i * 11 + f * 5 + c) < on;
            return (
              <g key={`${f}-${c}`}>
                <rect x={x + 160 + c * ((w - 320) / 3)} y={-h + 260 + f * 640} width={(w - 320) / 3 - 80} height={380} fill={lw ? "#e8b870" : L("#2a2e36")} opacity={lw ? 0.85 : 1} />
                <rect x={x + 140 + c * ((w - 320) / 3)} y={-h + 640 + f * 640} width={(w - 320) / 3 - 40} height={24} fill={L(lighten(brick, 0.2))} />
              </g>
            );
          }),
        )}
        <rect x={x + w / 2 - 110} y={-520} width={220} height={520} fill={L("#3a2a20")} />
        {[0, 1, 2, 3].map((s) => (
          <rect key={s} x={x + w / 2 - 200 - s * 30} y={-120 + s * 30} width={400 + s * 60} height={30} fill={L("#8a867e")} />
        ))}
      </g>,
    );
    x += w;
    i += 1;
  }
  return <g>{out}</g>;
};

/** The elevated railway: steel columns and a deck, with an optional train. */
export const Elevated: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly light?: Light;
  readonly trainX?: number | null;
  readonly t?: number;
}> = ({ x0, x1, light = NEUTRAL, trainX = null, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const deck = -1100;
  return (
    <g>
      {Array.from({ length: Math.ceil((x1 - x0) / 1200) }, (_, i) => (
        <g key={i}>
          <rect x={x0 + i * 1200} y={deck} width={60} height={-deck} fill={L("#2e3032")} />
          <path d={`M${x0 + i * 1200 + 30} ${deck + 40} L${x0 + i * 1200 + 330} ${deck + 340}`} stroke={L("#2e3032")} strokeWidth={24} />
          <path d={`M${x0 + i * 1200 + 30} ${deck + 40} L${x0 + i * 1200 - 270} ${deck + 340}`} stroke={L("#2e3032")} strokeWidth={24} />
        </g>
      ))}
      <rect x={x0} y={deck - 120} width={x1 - x0} height={120} fill={L("#3a3c3e")} />
      {Array.from({ length: Math.ceil((x1 - x0) / 200) }, (_, i) => (
        <rect key={i} x={x0 + i * 200} y={deck - 120} width={12} height={120} fill={L("#2a2c2e")} />
      ))}
      {trainX !== null ? (
        <g transform={`translate(${trainX} ${deck - 120})`}>
          {[0, 1, 2].map((c) => (
            <g key={c} transform={`translate(${c * 2300} 0)`}>
              <rect x={0} y={-640} width={2200} height={600} rx={40} fill={L("#6a5a3a")} />
              <rect x={0} y={-640} width={2200} height={60} fill={L("#4a3e28")} />
              {Array.from({ length: 8 }, (_, w) => (
                <rect key={w} x={120 + w * 250} y={-540} width={170} height={200} fill="#e8c890" opacity={0.75 + noise(t * 3 + w + c, c) * 0.2} />
              ))}
              <rect x={0} y={-60} width={2200} height={30} fill={L("#1a1a1a")} />
            </g>
          ))}
        </g>
      ) : null}
    </g>
  );
};
