import React from "react";
import { lit, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Bookshelf } from "./interior";
import { Glow, Pool, Wash } from "./light";

/**
 * Nisson Pharmacy, Des Plaines, December 1978, as a set: a storefront on
 * a snowy lot, and inside, aisles, a counter and the front door with a bell.
 * World scale; the front wall sits at x = PHARM.front and people stand on
 * y = 0 inside.
 */

export const PHARM = {
  front: 1500,
  door: 1150,
  doorW: 260,
  counter: -300,
  clock: { x: 700, y: -560 },
} as const;

/** Wall clock without numerals: hands only, so no specific time is claimed. */
export const WallClock: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly minutes: number;
  readonly light?: Light;
  readonly r?: number;
}> = ({ x, y, minutes, light = NEUTRAL, r = 44 }) => {
  const L = (c: string) => lit(c, light);
  const m = (minutes / 60) * 360;
  const h = (minutes / 720) * 360 + 270;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 6} fill={L("#3a3632")} />
      <circle r={r} fill={L("#f0ece2")} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-2} y={-r + 4} width={4} height={i % 3 === 0 ? 10 : 6} fill={L("#3a3632")} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-3} y={-r * 0.5} width={6} height={r * 0.5} rx={3} fill={L("#1a1816")} transform={`rotate(${h})`} />
      <rect x={-2} y={-r * 0.8} width={4} height={r * 0.8} rx={2} fill={L("#1a1816")} transform={`rotate(${m})`} />
      <circle r={4} fill={L("#8a2a24")} />
    </g>
  );
};

/** Interior. `lights` 0–1 dims the store as it closes; `back` dims only the rear. */
export const PharmacyInterior: React.FC<{
  readonly light?: Light;
  readonly lights?: number;
  readonly back?: number;
  readonly t?: number;
  readonly minutes?: number;
  readonly doorOpen?: number;
  readonly snow?: boolean;
  readonly outside?: React.ReactNode;
}> = ({ light = NEUTRAL, lights = 1, back = 1, t = 0, minutes = 0, doorOpen = 0, snow = true, outside }) => {
  const L = (c: string) => lit(c, light);
  const fl = (i: number) => lights * (noise(t * 13 + i, i) > 0.93 ? 0.7 : 1);
  return (
    <g>
      {/* back wall, shelves, counter */}
      <rect x={-3200} y={-760} width={PHARM.front + 3200} height={760} fill={L("#e2dccc")} />
      <rect x={-3200} y={-760} width={PHARM.front + 3200} height={60} fill={L("#3e6a7a")} />
      <rect x={-3200} y={-40} width={PHARM.front + 3200} height={40} fill={L("#8a8478")} />
      {/* the floor runs under the front wall, so the wall never stands on nothing */}
      <rect x={-3200} y={0} width={PHARM.front + 3360} height={700} fill={L("#bdb6a4")} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={-3200 + i * 200} y={0} width={3} height={700} fill={L("#a8a290")} />
      ))}
      <Bookshelf x={-2500} w={700} h={620} light={light} seed={3} items="products" />
      <Bookshelf x={-1700} w={700} h={620} light={light} seed={8} items="products" />
      <Bookshelf x={200} w={600} h={620} light={light} seed={13} items="products" />
      {/* pharmacy counter at the back */}
      <rect x={PHARM.counter - 700} y={-240} width={1100} height={240} fill={L("#6a4a34")} />
      <rect x={PHARM.counter - 720} y={-260} width={1140} height={24} fill={L("#d8d0bc")} />
      <rect x={PHARM.counter - 180} y={-340} width={140} height={80} fill={L("#3a3a3a")} />
      <rect x={PHARM.counter - 170} y={-332} width={120} height={36} fill={L("#9ab0a0")} opacity={0.6} />
      <WallClock x={PHARM.clock.x} y={PHARM.clock.y} minutes={minutes} light={light} />
      {/* fluorescent tubes */}
      {[-2600, -1500, -400, 700].map((fx, i) => {
        const on = fx < -200 ? fl(i) * back : fl(i);
        return (
          <g key={fx}>
            <rect x={fx - 220} y={-744} width={440} height={16} fill={on > 0.3 ? "#f4fbf6" : L("#9a9a96")} />
            {on > 0 ? <Glow x={fx} y={-720} r={700} color="#eef8f0" opacity={0.28 * on} /> : null}
          </g>
        );
      })}
      {/* front wall: windows, and the door with its bell */}
      <rect x={PHARM.front - 40} y={-760} width={200} height={760} fill={L("#8a8478")} />
      <g>
        <rect x={PHARM.door - PHARM.doorW / 2 - 14} y={-560} width={PHARM.doorW + 28} height={560} fill={L("#5a5a5a")} />
        <rect x={PHARM.door - PHARM.doorW / 2} y={-546} width={PHARM.doorW} height={546} fill="#0e1520" />
        <g>{outside}</g>
        {snow
          ? Array.from({ length: 20 }, (_, i) => (
              <circle key={i} cx={PHARM.door - PHARM.doorW / 2 + ((hash(i) * PHARM.doorW + t * 6) % PHARM.doorW)} cy={-540 + ((hash(i + 5) * 540 + t * (40 + hash(i) * 40)) % 540)} r={2 + hash(i + 2) * 2} fill="#e8eef4" opacity={0.8} />
            ))
          : null}
        <rect x={PHARM.door - PHARM.doorW / 2} y={-546} width={PHARM.doorW * (1 - doorOpen * 0.8)} height={546} fill={L("#8aa0b0")} opacity={0.25} />
        <rect x={PHARM.door - PHARM.doorW / 2 + PHARM.doorW * (1 - doorOpen * 0.8) - 8} y={-546} width={10} height={546} fill={L("#6a6a6a")} />
        <rect x={PHARM.door + PHARM.doorW / 2 - 40} y={-300} width={10} height={60} fill={L("#c8c0a0")} />
        <circle cx={PHARM.door - PHARM.doorW / 2 + 20} cy={-570} r={9} fill={L("#c8a860")} />
      </g>
      <Wash x={-3200} y={-760} w={1500} h={1460} from="left" color="#000" opacity={0.45 * (1 - back * 0.4) + 0.2} />
      <Pool x={-400} y={20} rx={2200} ry={200} color="#eef8f0" opacity={0.18 * lights} />
    </g>
  );
};

/** The storefront from the parking lot at night, in snow. */
export const PharmacyFront: React.FC<{
  readonly light?: Light;
  readonly inside?: React.ReactNode;
  readonly lights?: number;
}> = ({ light = NEUTRAL, inside, lights = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-2600} y={-1100} width={5200} height={1100} fill={L("#6a5a4a")} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-2600} y={-1100 + i * 80} width={5200} height={3} fill={L("#5a4a3c")} />
      ))}
      <rect x={-2400} y={-1320} width={4800} height={220} fill={L("#e8e4d8")} />
      <text x={0} y={-1172} textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontWeight={700} fontSize={130} letterSpacing={18} fill={L("#2e5a6a")}>
        NISSON
      </text>
      <rect x={-2400} y={-1100} width={4800} height={18} fill={L("#3a3632")} />
      <defs>
        <clipPath id="pharm-glass">
          <rect x={-2200} y={-900} width={4400} height={780} />
        </clipPath>
      </defs>
      <rect x={-2200} y={-900} width={4400} height={780} fill={lights > 0 ? "#e8eee4" : "#1a2028"} />
      <g clipPath="url(#pharm-glass)">{inside}</g>
      <rect x={-2200} y={-900} width={4400} height={780} fill="#aac0d0" opacity={0.12} />
      {[-1100, 0, 1100].map((mx) => (
        <rect key={mx} x={mx - 12} y={-900} width={24} height={780} fill={L("#3a3632")} />
      ))}
      <rect x={-2240} y={-120} width={4480} height={120} fill={L("#8a867e")} />
      {lights > 0 ? <Pool x={0} y={40} rx={3200} ry={260} color="#eef4e8" opacity={0.35 * lights} /> : null}
      <Wash x={-2600} y={-1320} w={5200} h={300} from="top" color="#000" opacity={0.25} />
    </g>
  );
};
