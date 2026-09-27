import React from "react";
import { darken, lit, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Room, WindowInt } from "./interior";
import { Glow, Pool, Wash } from "./light";
import { WallClock } from "./pharmacy";

/** Police station, stakeout car, the theatre, the stadium. World scale. */

export const Typewriter: React.FC<{ readonly x: number; readonly y: number; readonly light?: Light; readonly t?: number }> = ({
  x,
  y,
  light = NEUTRAL,
  t = 0,
}) => {
  const L = (c: string) => lit(c, light);
  const carriage = ((t * 40) % 60) - 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-80 0 L80 0 L64 -46 L-64 -46 Z" fill={L("#2e3234")} />
      <rect x={-90 + carriage * 0.3} y={-70} width={180} height={22} rx={8} fill={L("#1e2224")} />
      <rect x={-50} y={-120} width={100} height={60} fill={L("#f0ece0")} />
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={-40} y={-110 + i * 12} width={70 - i * 10} height={3} fill={L("#6a645a")} />
      ))}
    </g>
  );
};

export const FilingCabinet: React.FC<{
  readonly x: number;
  readonly light?: Light;
  readonly open?: number;
  readonly which?: number;
}> = ({ x, light = NEUTRAL, open = 0, which = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-100} y={-560} width={200} height={560} fill={L("#6a726e")} />
      {[0, 1, 2, 3].map((i) => {
        const o = i === which ? open : 0;
        return (
          <g key={i} transform={`translate(0 ${o * 16})`}>
            <rect x={-92 - o * 30} y={-548 + i * 138} width={184 + o * 60} height={126} fill={L(o > 0 ? "#7a827e" : "#737b77")} />
            {o > 0 ? (
              <g>
                {Array.from({ length: 6 }, (_, k) => (
                  <rect key={k} x={-80 - o * 30 + k * 30} y={-560 + i * 138} width={24} height={30} fill={L(["#c8ae7a", "#b89e6a", "#d8be8a"][k % 3])} />
                ))}
              </g>
            ) : null}
            <rect x={-30} y={-500 + i * 138} width={60} height={12} rx={4} fill={L("#b8bcbc")} />
            <rect x={-20} y={-530 + i * 138} width={40} height={16} fill={L("#e8e4d8")} />
          </g>
        );
      })}
    </g>
  );
};

/** The Des Plaines station at night: a front counter, desks, cabinets, blinds. */
export const StationRoom: React.FC<{
  readonly light?: Light;
  readonly t?: number;
  readonly cabinetOpen?: number;
  readonly minutes?: number;
}> = ({ light = NEUTRAL, t = 0, cabinetOpen = 0, minutes = 20 }) => {
  const L = (c: string) => lit(c, light);
  const tube = noise(t * 9, 3) > 0.9 ? 0.75 : 1;
  return (
    <g>
      <Room x0={-3200} x1={3200} h={620} paper="#9aa49a" floor="#4a4a44" light={light} stripes={false} tile />
      <rect x={-3200} y={-240} width={6400} height={6} fill={L("#7a847a")} />
      <WindowInt x={-2600} y={-560} w={600} h={320} outside="#0c1420" light={light} blinds />
      <WindowInt x={1900} y={-560} w={600} h={320} outside="#0c1420" light={light} blinds />
      {/* bulletin board */}
      <rect x={-1500} y={-560} width={520} height={320} fill={L("#8a6a4a")} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={-1480 + (i % 3) * 170} y={-540 + Math.floor(i / 3) * 100} width={130} height={80} fill={L(["#e8e4d8", "#d8d0b8", "#f0ece0"][i % 3])} transform={`rotate(${(hash(i) - 0.5) * 8} ${-1415 + (i % 3) * 170} ${-500 + Math.floor(i / 3) * 100})`} />
      ))}
      <WallClock x={-400} y={-470} minutes={minutes} light={light} r={50} />
      <FilingCabinet x={900} light={light} open={cabinetOpen} which={1} />
      <FilingCabinet x={1130} light={light} />
      {/* front counter */}
      <rect x={-900} y={-230} width={1400} height={230} fill={L("#5a4a3a")} />
      <rect x={-920} y={-250} width={1440} height={24} fill={L("#8a7a62")} />
      <Typewriter x={-500} y={-250} light={light} t={t} />
      <rect x={200} y={-300} width={80} height={50} fill={L("#1a1a1a")} />
      <rect x={210} y={-296} width={60} height={20} rx={8} fill={L("#2a2a2a")} />
      {[-2000, -400, 1300].map((lx) => (
        <g key={lx}>
          <rect x={lx - 260} y={-612} width={520} height={14} fill={tube > 0.8 ? "#f2faf4" : L("#9a9a96")} />
          <Glow x={lx} y={-600} r={800} color="#e8f4ec" opacity={0.26 * tube} />
        </g>
      ))}
      <Pool x={0} y={30} rx={2600} ry={240} color="#e8f4ec" opacity={0.2} />
      <Wash x={-3200} y={-620} w={1400} h={1400} from="left" color="#000" opacity={0.3} />
    </g>
  );
};

/**
 * Inside an unmarked car at night, looking out of the windscreen. Screen
 * space (1920×1080), drawn over the stage as the nearest layer.
 */
export const CarInterior: React.FC<{
  readonly light?: Light;
  readonly t?: number;
  readonly heads?: boolean;
  readonly steam?: number;
}> = ({ light = NEUTRAL, t = 0, heads = true, steam = 0 }) => {
  const L = (c: string) => lit(c, light);
  const dark = L("#07080b");
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {/* roof, pillars, dash */}
      <path d={`M0 0 L1920 0 L1920 170 Q960 120 0 170 Z`} fill={dark} />
      <path d="M0 0 L220 0 L420 1080 L0 1080 Z" fill={dark} />
      <path d="M1920 0 L1700 0 L1500 1080 L1920 1080 Z" fill={dark} />
      <path d="M0 800 Q960 740 1920 800 L1920 1080 L0 1080 Z" fill={L("#101216")} />
      <rect x={900} y={170} width={180} height={60} rx={10} fill={L("#0c0e12")} />
      <rect x={908} y={176} width={164} height={48} rx={8} fill={L("#2a3440")} opacity={0.8} />
      {/* steering wheel */}
      <ellipse cx={560} cy={980} rx={300} ry={140} fill="none" stroke={L("#0a0b0e")} strokeWidth={46} />
      {heads ? (
        <g fill={dark}>
          <ellipse cx={600} cy={800} rx={120} ry={140} />
          <path d="M380 1080 Q400 880 600 880 Q800 880 820 1080 Z" />
          <ellipse cx={1340} cy={820} rx={115} ry={135} />
          <path d="M1120 1080 Q1140 900 1340 900 Q1540 900 1560 1080 Z" />
        </g>
      ) : null}
      {steam > 0 ? (
        <g>
          <rect x={1250} y={900} width={60} height={70} rx={8} fill={L("#e8e4d8")} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${1270 + i * 12} 890 q ${noise(t + i, i) * 14} -40 0 -80`} stroke="#fff" strokeWidth={4} opacity={0.18 * steam} fill="none" />
          ))}
        </g>
      ) : null}
      <path d="M420 170 Q960 130 1500 170 L1480 260 Q960 220 440 260 Z" fill="#9ab0c8" opacity={0.05} />
    </svg>
  );
};

/** A movie theatre: the screen (render prop), the beam, rows of heads. */
export const Theater: React.FC<{
  readonly light?: Light;
  readonly t?: number;
  readonly screen?: React.ReactNode;
}> = ({ light = NEUTRAL, t = 0, screen }) => {
  const L = (c: string) => lit(c, light);
  const flick = 0.85 + noise(t * 6, 2) * 0.15;
  return (
    <g>
      <rect x={-5000} y={-2600} width={10000} height={3200} fill={L("#1a0c0e")} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-5000 + i * 900} y={-2600} width={420} height={3200} fill={L("#240e12")} />
      ))}
      <rect x={-2100} y={-2200} width={4200} height={1900} fill="#050505" />
      <defs>
        <clipPath id="theater-screen">
          <rect x={-2000} y={-2120} width={4000} height={1740} />
        </clipPath>
      </defs>
      <g clipPath="url(#theater-screen)" opacity={flick}>
        {screen}
      </g>
      <Glow x={0} y={-1200} r={2600} color="#b8c8e8" opacity={0.18 * flick} />
    </g>
  );
};

export const TheaterRows: React.FC<{ readonly light?: Light; readonly n?: number; readonly t?: number; readonly seed?: number }> = ({
  light = NEUTRAL,
  n = 16,
  t = 0,
  seed = 0,
}) => {
  const c = lit("#0a0608", light);
  return (
    <g>
      <rect x={-6000} y={-60} width={12000} height={400} fill={lit("#2a1416", light)} />
      {Array.from({ length: n }, (_, i) => {
        const x = -4800 + i * 640 + (hash(seed + i) - 0.5) * 120;
        const hy = -360 + hash(seed + i * 3) * 40 + noise(t * 0.3 + i, i) * 4;
        return (
          <g key={i}>
            <rect x={x - 260} y={-220} width={520} height={260} rx={40} fill={lit("#3a1a1e", light)} />
            <ellipse cx={x} cy={hy} rx={80} ry={96} fill={c} />
            <path d={`M${x - 170} 0 Q${x - 150} ${hy + 120} ${x} ${hy + 110} Q${x + 150} ${hy + 120} ${x + 170} 0 Z`} fill={c} />
          </g>
        );
      })}
    </g>
  );
};

/** A stadium scoreboard of bulbs with three names and no numbers. */
export const Scoreboard: React.FC<{
  readonly light?: Light;
  readonly t?: number;
  readonly names: readonly string[];
  readonly lit: readonly number[];
  readonly power?: number;
}> = ({ light = NEUTRAL, t = 0, names, lit: on, power = 1 }) => {
  const L = (c: string) => lit(c, light);
  const W = 3600;
  const H = 1500;
  return (
    <g>
      <rect x={-120} y={-120} width={240} height={3000} fill={L("#2a2c30")} transform={`translate(${-W / 3} ${H / 2})`} />
      <rect x={-120} y={-120} width={240} height={3000} fill={L("#2a2c30")} transform={`translate(${W / 3} ${H / 2})`} />
      <rect x={-W / 2 - 60} y={-H / 2 - 60} width={W + 120} height={H + 120} fill={L("#1a1c20")} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} fill={L("#0c0d10")} />
      {names.map((name, i) => {
        const y = -H / 2 + 260 + i * 420;
        const k = (on[i] ?? 0) * power;
        const flick = k > 0 ? 0.8 + noise(t * 10 + i * 3, i) * 0.2 : 0;
        return (
          <g key={name}>
            <text x={-W / 2 + 200} y={y + 90} fontFamily="Frank Ruhl Libre, serif" fontWeight={700} fontSize={220} letterSpacing={24} fill={k > 0 ? "#ffd88a" : "#2a2418"} opacity={k > 0 ? flick : 1}>
              {name}
            </text>
            {/* blank digit panels where the counts would be */}
            {[0, 1].map((d) => (
              <rect key={d} x={W / 2 - 700 + d * 300} y={y - 110} width={240} height={260} fill={darken("#1a1810", 0.2)} stroke="#3a3420" strokeWidth={6} />
            ))}
            {k > 0 ? <Glow x={-W / 2 + 900} y={y} r={1200} color="#ffd070" opacity={0.18 * k * flick} /> : null}
          </g>
        );
      })}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={-W / 2 + 45 + i * 90} cy={-H / 2 + 60} r={16} fill={power > 0.5 ? "#ffd88a" : "#2a2418"} opacity={power > 0.5 ? 0.7 + noise(t * 4 + i, i) * 0.3 : 1} />
      ))}
    </g>
  );
};
