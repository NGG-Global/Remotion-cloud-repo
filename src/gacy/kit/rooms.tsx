import React from "react";
import { darken, lighten, lit, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Armchair, Couch, Door, FloorLamp, Frame, Room, TableLamp, WindowInt } from "./interior";
import { Glow, Pool, Wash } from "./light";

/**
 * Recurring rooms. Gacy's living room returns three times (the handcuffs,
 * the smell, the search), so it is one component with the same layout
 * every time; the viewer should recognise the room before anything is
 * said about it.
 */

export const LIVING = {
  width: 3600,
  register: { x: 300, y: 18 },
  couchX: -700,
  lampX: -1260,
  tableX: -560,
  tvX: 900,
  doorX: 1400,
} as const;

export const GacyLivingRoom: React.FC<{
  readonly light?: Light;
  readonly lamp?: number;
  readonly night?: boolean;
  readonly t?: number;
  readonly tv?: number;
  readonly registerHaze?: number;
  readonly snow?: boolean;
  readonly drawers?: number;
}> = ({ light = NEUTRAL, lamp = 1, night = true, t = 0, tv = 0, registerHaze = 0, snow = false, drawers = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <Room x0={-LIVING.width / 2} x1={LIVING.width / 2} h={520} paper="#8a6a48" floor="#5a4632" light={light} />
      {/* wood panelling */}
      {Array.from({ length: 26 }, (_, i) => (
        <rect key={i} x={-1800 + i * 140} y={-520} width={4} height={486} fill={L("#6a4e34")} opacity={0.8} />
      ))}
      <WindowInt x={-420} y={-470} w={520} h={300} outside={night ? "#0e1522" : "#8aa0b0"} light={light} curtains="#7a5a3a" snow={snow} t={t} />
      <Frame x={-1500} y={-450} w={160} h={120} light={light} art={<rect width={160} height={120} fill={L("#8a9a8a")} />} />
      <Frame x={180} y={-440} w={110} h={140} light={light} art={<rect width={110} height={140} fill={L("#a89878")} />} />
      {/* shelf unit with drawers (the search opens them) */}
      <g transform="translate(560 0)">
        <rect x={-150} y={-300} width={300} height={300} fill={L("#5a3e2a")} />
        {[0, 1, 2].map((i) => {
          const open = Math.max(0, Math.min(1, drawers * 3 - i));
          return (
            <g key={i}>
              <rect x={-140 - open * 10} y={-290 + i * 96} width={280 + open * 20} height={86} fill={L(open > 0 ? "#6a4a32" : "#654632")} />
              {open > 0 ? <rect x={-130} y={-290 + i * 96 + 86} width={260} height={open * 30} fill={L("#2a1e14")} /> : null}
              <rect x={-20} y={-252 + i * 96} width={40} height={8} rx={3} fill={L("#c8a860")} />
            </g>
          );
        })}
        <TableLamp x={-60} y={-300} on={lamp * 0.6} light={light} />
      </g>
      <Couch x={LIVING.couchX} color="#6a5642" light={light} />
      <FloorLamp x={LIVING.lampX} on={lamp} light={light} />
      {/* coffee table */}
      <g transform={`translate(${LIVING.tableX} 0)`}>
        <ellipse cx={0} cy={80} rx={300} ry={20} fill="#000" opacity={0.3} />
        <rect x={-260} y={-4} width={520} height={20} fill={L("#4a3222")} transform="translate(0 60)" />
        <rect x={-240} y={76} width={12} height={60} fill={L("#3a2618")} />
        <rect x={228} y={76} width={12} height={60} fill={L("#3a2618")} />
      </g>
      {/* television console */}
      <g transform={`translate(${LIVING.tvX} 0)`}>
        <rect x={-190} y={-280} width={380} height={280} rx={10} fill={L("#4a3424")} />
        <rect x={-150} y={-250} width={220} height={170} rx={20} fill={L("#1a2024")} />
        {tv > 0 ? <rect x={-150} y={-250} width={220} height={170} rx={20} fill="#8aa6d8" opacity={tv * (0.3 + noise(t * 6, 1) * 0.1)} /> : null}
        <circle cx={120} cy={-200} r={12} fill={L("#6a645c")} />
      </g>
      <Armchair x={1250} color="#7a4a3a" light={light} facing={-1} />
      <Door x={LIVING.doorX + 100} light={light} color="#5a3e2c" open={0} />
      {/* the floor register: the heating vent the smell comes through */}
      <g transform={`translate(${LIVING.register.x} ${LIVING.register.y})`}>
        <rect x={-70} y={-10} width={140} height={22} fill={L("#3a3632")} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={-64 + i * 22} y={-8} width={12} height={18} fill={L("#1a1816")} />
        ))}
        {registerHaze > 0
          ? Array.from({ length: 5 }, (_, i) => {
              const p = ((t * 0.18 + i / 5) % 1 + 1) % 1;
              return (
                <ellipse
                  key={i}
                  cx={noise(t * 0.4 + i, i) * 60}
                  cy={-20 - p * 360}
                  rx={60 + p * 160}
                  ry={24 + p * 50}
                  fill="#8a9a78"
                  opacity={registerHaze * 0.16 * (1 - p)}
                />
              );
            })
          : null}
      </g>
      <Wash x={-1800} y={-520} w={800} h={1300} from="left" color="#000" opacity={0.35} />
      <Wash x={1000} y={-520} w={800} h={1300} from="right" color="#000" opacity={0.35} />
    </g>
  );
};

/**
 * A dressing table with a bulb-framed mirror, at real size: table top at
 * 0.75 m, mirror from 0.9 to 2.15 m. `reflection` is drawn in the same
 * world coordinates and clipped to the glass.
 */
export const MIRROR = { x: 0, top: -430, bottom: -180, w: 380 } as const;

export const DressingTable: React.FC<{
  readonly light?: Light;
  readonly reflection?: React.ReactNode;
  readonly t?: number;
}> = ({ light = NEUTRAL, reflection, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const { top, bottom, w } = MIRROR;
  const h = bottom - top;
  const bulbs: [number, number][] = [
    ...Array.from({ length: 5 }, (_, i) => [-w / 2 + 30 + (i * (w - 60)) / 4, top - 14] as [number, number]),
    ...Array.from({ length: 3 }, (_, i) => [-w / 2 - 14, top + 40 + i * 80] as [number, number]),
    ...Array.from({ length: 3 }, (_, i) => [w / 2 + 14, top + 40 + i * 80] as [number, number]),
  ];
  return (
    <g>
      <rect x={-2000} y={-1400} width={4000} height={1400} fill={L("#3a2e26")} />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={-2000 + i * 140} y={-1400} width={3} height={1400} fill={L("#2e241e")} />
      ))}
      <rect x={-2000} y={0} width={4000} height={800} fill={L("#2a1e16")} />
      <defs>
        <clipPath id="mirror-clip">
          <rect x={-w / 2} y={top} width={w} height={h} rx={4} />
        </clipPath>
      </defs>
      <rect x={-w / 2 - 28} y={top - 28} width={w + 56} height={h + 56} rx={8} fill={L("#5a4232")} />
      <rect x={-w / 2} y={top} width={w} height={h} rx={4} fill={L("#1e1a18")} />
      <g clipPath="url(#mirror-clip)">
        {reflection}
        <path d={`M${-w / 2} ${top} L${-w / 2 + 90} ${top} L${-w / 2 - 20} ${bottom} L${-w / 2 - 110} ${bottom} Z`} fill="#fff" opacity={0.07} />
      </g>
      {bulbs.map(([bx, by], i) => {
        const f = 0.92 + noise(t * 3 + i, i) * 0.08;
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r={7} fill="#fff4d8" opacity={f} />
            <Glow x={bx} y={by} r={60} color="#ffd9a0" opacity={0.4 * f} />
          </g>
        );
      })}
      {/* table top, drawers, clutter */}
      <rect x={-320} y={-152} width={640} height={14} fill={L("#6a4a34")} />
      <rect x={-300} y={-138} width={600} height={96} fill={L("#4a3424")} />
      <rect x={-280} y={-118} width={250} height={10} rx={3} fill={L("#5a3e2c")} />
      <rect x={30} y={-118} width={250} height={10} rx={3} fill={L("#5a3e2c")} />
      <rect x={-292} y={-42} width={14} height={42} fill={L("#3a2618")} />
      <rect x={278} y={-42} width={14} height={42} fill={L("#3a2618")} />
      <ellipse cx={-170} cy={-156} rx={20} ry={5} fill={L("#f2eee4")} />
      <circle cx={-128} cy={-160} r={6} fill={L("#c42a24")} />
      <rect x={120} y={-186} width={8} height={32} fill={L("#4a5a6a")} />
      <rect x={134} y={-180} width={7} height={26} fill={L("#8a3a3a")} />
      <rect x={236} y={-160} width={6} height={14} fill={L("#6a5a4a")} />
      <ellipse cx={239} cy={-184} rx={24} ry={28} fill={L("#d8c8b0")} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={223 + (i % 3) * 16} cy={-204 + Math.floor(i / 3) * 10} r={10} fill={L("#8a2a22")} />
      ))}
      <Pool x={0} y={-300} rx={700} ry={400} color="#ffd9a0" opacity={0.28} />
    </g>
  );
};

/** Cork board of snapshots, for the 1970s clowns. `items` are drawn at pinned positions. */
export const Corkboard: React.FC<{
  readonly light?: Light;
  readonly w?: number;
  readonly h?: number;
  readonly children?: React.ReactNode;
}> = ({ light = NEUTRAL, w = 5000, h = 1600, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-w / 2 - 60} y={-h / 2 - 60} width={w + 120} height={h + 120} fill={L("#6a4a32")} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#b8905e")} />
      {Array.from({ length: 220 }, (_, i) => (
        <circle key={i} cx={-w / 2 + hash(i) * w} cy={-h / 2 + hash(i + 7) * h} r={3 + hash(i + 3) * 4} fill={L(darken("#b8905e", 0.15 + hash(i + 1) * 0.1))} />
      ))}
      {children}
    </g>
  );
};

export const Pin: React.FC<{ readonly x: number; readonly y: number; readonly c?: string; readonly light?: Light }> = ({
  x,
  y,
  c = "#c83a2a",
  light = NEUTRAL,
}) => (
  <g>
    <circle cx={x + 3} cy={y + 4} r={9} fill="#000" opacity={0.3} />
    <circle cx={x} cy={y} r={9} fill={lit(c, light)} />
    <circle cx={x - 3} cy={y - 3} r={3} fill="#fff" opacity={0.4} />
  </g>
);

/** A 1970s diner counter with stools, pie case and a window. */
export const Diner: React.FC<{ readonly light?: Light; readonly t?: number }> = ({ light = NEUTRAL, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <Room x0={-2400} x1={2400} h={560} paper="#c8b890" floor="#3a3a3a" light={light} stripes={false} tile />
      <rect x={-2400} y={-560} width={4800} height={40} fill={L("#8a2a24")} />
      <WindowInt x={-1900} y={-480} w={700} h={300} outside="#8aa0b0" light={light} blinds />
      <WindowInt x={1200} y={-480} w={700} h={300} outside="#8aa0b0" light={light} blinds />
      <rect x={-600} y={-440} width={1200} height={200} fill={L("#d8d4c8")} />
      {Array.from({ length: 4 }, (_, i) => (
        <circle key={i} cx={-450 + i * 300} cy={-340} r={60} fill={L(["#c89a5a", "#a84a3a", "#d8b870", "#8a5a3a"][i])} />
      ))}
      <rect x={-2400} y={-220} width={4800} height={40} fill={L("#e8e2d4")} />
      <rect x={-2400} y={-180} width={4800} height={180} fill={L("#8a2a24")} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`translate(${-2000 + i * 560} 0)`}>
          <rect x={-8} y={-110} width={16} height={110} fill={L("#9a9a9a")} />
          <ellipse cx={0} cy={-120} rx={60} ry={18} fill={L("#a83a2a")} />
        </g>
      ))}
      <Glow x={0} y={-600} r={900} color="#fff0d0" opacity={0.2 + noise(t, 2) * 0.02} />
    </g>
  );
};

/** A bus terminal at night: benches, a departures board, a clock. */
export const BusStation: React.FC<{ readonly light?: Light; readonly t?: number }> = ({ light = NEUTRAL, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const flick = noise(t * 11, 4) > 0.8 ? 0.6 : 1;
  return (
    <g>
      <Room x0={-3000} x1={3000} h={900} paper="#8a9290" floor="#4a4a46" light={light} stripes={false} tile />
      <rect x={-900} y={-820} width={1800} height={260} fill={L("#1a1c1e")} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={-860} y={-790 + i * 46} width={1300 + (i % 2) * 300} height={20} fill="#e8b84a" opacity={0.55} />
      ))}
      <circle cx={1400} cy={-700} r={90} fill={L("#e8e4d8")} />
      <path d="M1400 -700 L1400 -760 M1400 -700 L1450 -690" stroke={L("#1a1a1a")} strokeWidth={8} strokeLinecap="round" />
      {[-1600, 0, 1600].map((bx) => (
        <g key={bx} transform={`translate(${bx} 0)`}>
          <rect x={-420} y={-110} width={840} height={30} fill={L("#6a5a44")} />
          <rect x={-420} y={-220} width={840} height={24} fill={L("#6a5a44")} />
          <rect x={-400} y={-80} width={14} height={80} fill={L("#3a3a3a")} />
          <rect x={386} y={-80} width={14} height={80} fill={L("#3a3a3a")} />
        </g>
      ))}
      {[-2200, -400, 1400].map((lx, i) => (
        <g key={lx}>
          <rect x={lx - 200} y={-900} width={400} height={20} fill={L("#e8f0f0")} opacity={i === 1 ? flick : 1} />
          <Glow x={lx} y={-880} r={700} color="#d8f0e8" opacity={0.25 * (i === 1 ? flick : 1)} />
        </g>
      ))}
    </g>
  );
};

export const KitchenTable: React.FC<{ readonly light?: Light; readonly t?: number }> = ({ light = NEUTRAL, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <Room x0={-2400} x1={2400} h={560} paper="#d8c898" floor="#8a7a5a" light={light} tile />
      <WindowInt x={-1000} y={-480} w={600} h={320} outside="#b8d0e0" light={light} curtains="#c86a4a" t={t} />
      <rect x={400} y={-540} width={900} height={160} fill={L("#9a7a4a")} />
      <rect x={400} y={-260} width={900} height={260} fill={L("#9a7a4a")} />
      <rect x={400} y={-270} width={900} height={20} fill={L("#e8e0c8")} />
      <Pool x={-700} y={-300} rx={900} ry={500} color="#fff4d8" opacity={0.25} />
      <rect x={-2400} y={-6} width={4800} height={6} fill={L(lighten("#8a7a5a", 0.1))} />
    </g>
  );
};
