import React from "react";
import { darken, lit, mix, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Beam, Glow, Pool, Wash } from "./light";

/**
 * Gacy's house cut open along its length: roof, attic, rooms, floor
 * structure, pipes, and the crawl space on the dirt beneath.
 *
 * Built at the same scale and position as the facade in <Suburb> (house
 * centred on x = 0, floor at y = -160), so the camera can push at the
 * front of the house, let the facade fall away and keep moving without a
 * cut. The opening, the trenches, the smell and the search all use this
 * one set; the discovery deliberately repeats the framing of the digging.
 */

export const SEC = {
  left: -1400,
  right: 1400,
  floor: -160,
  ceiling: -660,
  ridge: -960,
  joistBottom: -122,
  dirtFront: 64,
  dirtBack: 14,
  hatchX: -120,
  hatchW: 150,
  livingEnd: -300,
  hallEnd: 120,
  kitchenEnd: 880,
} as const;

/** Where burial patches lie in the crawl space. Order = order of discovery. */
export const PATCHES: readonly { x: number; y: number; w: number }[] = [
  { x: -560, y: 34, w: 130 },
  { x: -380, y: 48, w: 150 },
  { x: -820, y: 30, w: 120 },
  { x: -220, y: 40, w: 140 },
  { x: 60, y: 30, w: 130 },
  { x: -1020, y: 44, w: 150 },
  { x: 260, y: 46, w: 140 },
  { x: -700, y: 52, w: 120 },
  { x: 460, y: 34, w: 130 },
  { x: -1180, y: 30, w: 110 },
  { x: 640, y: 50, w: 150 },
  { x: -470, y: 22, w: 110 },
  { x: 820, y: 36, w: 130 },
  { x: -920, y: 56, w: 120 },
  { x: 1000, y: 42, w: 140 },
  { x: -120, y: 56, w: 120 },
  { x: 160, y: 20, w: 110 },
  { x: -1260, y: 50, w: 120 },
  { x: 1160, y: 30, w: 110 },
  { x: 370, y: 20, w: 100 },
  { x: -640, y: 16, w: 100 },
  { x: 740, y: 18, w: 100 },
  { x: -300, y: 18, w: 100 },
  { x: 920, y: 58, w: 120 },
  { x: -1080, y: 18, w: 100 },
  { x: 540, y: 58, w: 110 },
  { x: 1240, y: 52, w: 100 },
];

/** Trenches the workers dig, as x ranges along the crawl space. */
export const TRENCHES: readonly [number, number][] = [
  [-1300, -700],
  [-600, -80],
  [200, 1000],
];

export type CrawlState = {
  /** Visible soil patches (fractional = the last one settling in). */
  readonly patches?: number;
  /** 0–1: how much of the trenches is dug. */
  readonly trenches?: number;
  /** Evidence markers placed (fractional = last one appearing). */
  readonly markers?: number;
  readonly haze?: number;
  readonly hatch?: number;
  readonly workLight?: number;
  /** Faint moonlight through the foundation vents. */
  readonly vents?: number;
  readonly drip?: boolean;
};

export const Marker: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly n: number;
  readonly k?: number;
  readonly light?: Light;
  readonly s?: number;
}> = ({ x, y, n, k = 1, light = NEUTRAL, s = 1 }) => {
  if (k <= 0) {
    return null;
  }
  const L = (c: string) => lit(c, light);
  const e = Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={e}>
      <ellipse cx={0} cy={2} rx={26} ry={5} fill="#000" opacity={0.35} />
      <path d={`M-22 0 L-12 ${-36 * e} L12 ${-36 * e} L22 0 Z`} fill={L("#e2b53c")} />
      <path d={`M-22 0 L-12 ${-36 * e} L-4 ${-36 * e} L-10 0 Z`} fill={L("#b8902a")} />
      {e > 0.7 ? (
        <text x={2} y={-9} textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontWeight={700} fontSize={18} fill={L("#1a1610")}>
          {n}
        </text>
      ) : null}
    </g>
  );
};

export const HouseSection: React.FC<{
  readonly t: number;
  /** Light for the rooms (lamps on). */
  readonly roomLight?: Light;
  /** Light in the crawl space. */
  readonly crawlLight?: Light;
  readonly lamps?: number;
  readonly night?: boolean;
  readonly crawl?: CrawlState;
  readonly living?: React.ReactNode;
  readonly hall?: React.ReactNode;
  readonly kitchen?: React.ReactNode;
  readonly bedroom?: React.ReactNode;
  readonly under?: React.ReactNode;
  readonly soilWidth?: number;
  readonly snow?: number;
  /** Party props upstairs (glasses, a cake). */
  readonly party?: boolean;
}> = ({
  t,
  roomLight = { key: "#ffe6c4", ambient: "#2a2018", amb: 0.18 },
  crawlLight = { key: "#7a8494", ambient: "#050608", amb: 0.72, desat: 0.3 },
  lamps = 1,
  night = true,
  crawl = {},
  living,
  hall,
  kitchen,
  bedroom,
  under,
  soilWidth = 26000,
  snow = 0,
  party = false,
}) => {
  const R = (c: string) => lit(c, roomLight);
  const C = (c: string) => lit(c, crawlLight);
  const { left, right, floor, ceiling, ridge, joistBottom, dirtFront, dirtBack } = SEC;
  const trench = crawl.trenches ?? 0;
  const patches = crawl.patches ?? 0;
  const markers = crawl.markers ?? 0;
  const haze = crawl.haze ?? 0;
  const hatch = crawl.hatch ?? 0;
  const work = crawl.workLight ?? 0;
  const vents = crawl.vents ?? 0.6;
  const wall = 34;
  const cut = "#1c1714";
  const windowNight = night ? "#141c2a" : "#8fa6b8";

  const room = (x0: number, x1: number, paper: string, key: string) => (
    <g key={key}>
      <rect x={x0} y={ceiling} width={x1 - x0} height={floor - ceiling} fill={R(paper)} />
      {Array.from({ length: Math.floor((x1 - x0) / 60) }, (_, i) => (
        <rect key={i} x={x0 + 20 + i * 60} y={ceiling} width={3} height={floor - ceiling} fill={R(darken(paper, 0.08))} opacity={0.5} />
      ))}
      <rect x={x0} y={floor - 30} width={x1 - x0} height={30} fill={R(darken(paper, 0.3))} />
      <Wash x={x0} y={ceiling} w={x1 - x0} h={160} from="top" color="#000" opacity={0.3} />
    </g>
  );

  return (
    <g>
      {/* soil, wide enough to fill the frame at any push */}
      <rect x={-soilWidth / 2} y={0} width={soilWidth} height={2400} fill={C("#3b2d22")} />
      <rect x={-soilWidth / 2} y={0} width={soilWidth} height={26} fill={C(night ? "#1e2a20" : "#4a5a3a")} />
      {snow > 0 ? <rect x={-soilWidth / 2} y={-14} width={soilWidth} height={16} fill={C("#c8d0da")} /> : null}
      {Array.from({ length: 40 }, (_, i) => (
        <ellipse key={i} cx={-soilWidth / 2 + hash(i) * soilWidth} cy={200 + hash(i + 3) * 1200} rx={20 + hash(i + 6) * 40} ry={8 + hash(i + 8) * 14} fill={C("#2e231a")} opacity={0.7} />
      ))}
      {[340, 620, 980].map((y, i) => (
        <rect key={y} x={-soilWidth / 2} y={y} width={soilWidth} height={6 + i * 2} fill={C("#33271d")} opacity={0.6} />
      ))}

      {/* crawl space: back foundation wall, dirt floor, piers, pipes */}
      <rect x={left} y={joistBottom} width={right - left} height={dirtBack - joistBottom + 4} fill={C("#5c5a56")} />
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={i} x={left + (i % 18) * 156 + (Math.floor(i / 18) % 2) * 78} y={joistBottom + 16 + Math.floor(i / 18) * 60} width={150} height={4} fill={C("#46443f")} />
      ))}
      {[-900, 300, 1100].map((vx) => (
        <g key={vx}>
          <rect x={vx - 50} y={-96} width={100} height={46} fill={C("#101216")} />
          {vents > 0 ? (
            <>
              <Pool x={vx} y={-74} rx={120} ry={60} color="#9fb2cc" opacity={0.35 * vents} />
              <Pool x={vx - 40} y={dirtBack + 10} rx={180} ry={26} color="#8ea2c0" opacity={0.25 * vents} />
            </>
          ) : null}
        </g>
      ))}
      <path d={`M${left} ${dirtBack} L${right} ${dirtBack} L${right} ${dirtFront} L${left} ${dirtFront} Z`} fill={C("#4a3a2c")} />
      {Array.from({ length: 50 }, (_, i) => (
        <ellipse key={i} cx={left + hash(i + 11) * (right - left)} cy={dirtBack + 6 + hash(i + 13) * (dirtFront - dirtBack - 10)} rx={6 + hash(i + 17) * 14} ry={2 + hash(i) * 3} fill={C("#3a2d22")} opacity={0.8} />
      ))}
      {/* trenches: dug channels with spoil beside them */}
      {TRENCHES.map(([a, b], i) => {
        const len = (b - a) * Math.min(1, Math.max(0, trench * 3 - i));
        if (len <= 2) {
          return null;
        }
        return (
          <g key={i}>
            <path d={`M${a} ${dirtFront - 22} L${a + len} ${dirtFront - 22} L${a + len - 10} ${dirtFront - 4} L${a + 10} ${dirtFront - 4} Z`} fill={C("#1c140e")} />
            <path d={`M${a} ${dirtBack + 14} Q${a + len / 2} ${dirtBack - 2} ${a + len} ${dirtBack + 14} Z`} fill={C("#5a4632")} />
          </g>
        );
      })}
      {/* disturbed soil patches: low mounds of loose, darker earth */}
      {PATCHES.map((p, i) => {
        const k = Math.max(0, Math.min(1, patches - i));
        if (k <= 0) {
          return null;
        }
        return (
          <g key={i} opacity={k}>
            <ellipse cx={p.x} cy={p.y + 4} rx={p.w / 2 + 6} ry={8} fill={C("#241a12")} opacity={0.7} />
            <path d={`M${p.x - p.w / 2} ${p.y + 2} Q${p.x - p.w * 0.25} ${p.y - 12} ${p.x} ${p.y - 10} Q${p.x + p.w * 0.3} ${p.y - 12} ${p.x + p.w / 2} ${p.y + 2} Z`} fill={C("#6e5640")} />
            <path d={`M${p.x - p.w * 0.3} ${p.y - 5} Q${p.x} ${p.y - 12} ${p.x + p.w * 0.25} ${p.y - 6}`} stroke={C("#6e5840")} strokeWidth={3} fill="none" />
            {[0, 1, 2, 3].map((j) => (
              <circle key={j} cx={p.x - p.w * 0.35 + j * p.w * 0.22} cy={p.y - 2 + (j % 2) * 3} r={2.5} fill={C("#3a2c20")} />
            ))}
          </g>
        );
      })}
      {PATCHES.map((p, i) => (
        <Marker key={`m${i}`} x={p.x + p.w * 0.3} y={p.y + 6} n={i + 1} k={markers - i} light={crawlLight} s={0.9} />
      ))}
      {/* piers and girder */}
      {[-1000, -500, 0, 500, 1000].map((px) => (
        <g key={px}>
          <rect x={px - 34} y={joistBottom + 20} width={68} height={dirtBack - joistBottom - 12} fill={C("#6e6b64")} />
          <rect x={px - 34} y={joistBottom + 20} width={20} height={dirtBack - joistBottom - 12} fill={C("#54514b")} />
        </g>
      ))}
      <rect x={left} y={joistBottom} width={right - left} height={22} fill={C("#5a4632")} />
      {/* heating duct and pipes */}
      <rect x={left + 120} y={joistBottom + 22} width={1900} height={40} fill={C("#8a9098")} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={left + 150 + i * 160} y={joistBottom + 22} width={4} height={40} fill={C("#6a7078")} />
      ))}
      <rect x={-180} y={floor} width={34} height={dirtBack - floor - 20} fill={C("#2e2a28")} />
      <rect x={640} y={floor} width={26} height={120} fill={C("#2e2a28")} />
      <path d={`M653 ${floor + 120} Q653 ${joistBottom + 90} 900 ${joistBottom + 96} L${right - 60} ${joistBottom + 96}`} stroke={C("#2e2a28")} strokeWidth={22} fill="none" />
      {crawl.drip ? (
        <circle cx={-163} cy={dirtBack - 30 + ((t * 120) % 60)} r={3} fill={C("#9ab0c0")} opacity={0.7} />
      ) : null}
      {/* haze in the crawl space */}
      {haze > 0 ? (
        <g opacity={haze}>
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={i}
              cx={left + 200 + i * 400 + noise(t * 0.2 + i, i) * 80}
              cy={-40 + noise(t * 0.15 + i * 3, i + 2) * 20}
              rx={320}
              ry={60}
              fill="#7a8a6a"
              opacity={0.16}
            />
          ))}
        </g>
      ) : null}
      {work > 0 ? (
        <g>
          <Glow x={-380} y={-80} r={500} color="#f5d9a0" opacity={0.55 * work} />
          <rect x={-392} y={joistBottom + 20} width={4} height={26} fill={C("#222")} />
          <circle cx={-390} cy={joistBottom + 52} r={9} fill="#fff2cc" opacity={work} />
        </g>
      ) : null}
      {under}
      {/* floor structure in section: joists in a row, subfloor, finish */}
      <rect x={left - 20} y={floor} width={right - left + 40} height={joistBottom - floor} fill={cut} />
      {Array.from({ length: 34 }, (_, i) => (
        <rect key={i} x={left + 10 + i * 82} y={floor + 14} width={22} height={joistBottom - floor - 16} fill={R("#7a5c3e")} />
      ))}
      <rect x={left - 20} y={floor} width={right - left + 40} height={14} fill={R("#8a6a4a")} />
      {/* hatch in the closet floor */}
      <rect x={SEC.hatchX} y={floor - 1} width={SEC.hatchW} height={joistBottom - floor + 2} fill={hatch > 0 ? "#0a0806" : cut} opacity={hatch > 0 ? 1 : 0} />
      {hatch > 0 ? (
        <g>
          <path d={`M${SEC.hatchX} ${floor} L${SEC.hatchX - Math.sin(hatch * 1.4) * 10} ${floor - Math.sin(hatch * 1.4) * SEC.hatchW} L${SEC.hatchX + 14 - Math.sin(hatch * 1.4) * 10} ${floor - Math.sin(hatch * 1.4) * SEC.hatchW} L${SEC.hatchX + 14} ${floor} Z`} fill={R("#6a4e36")} />
          <Beam x={SEC.hatchX + SEC.hatchW / 2} y={floor} angle={90} length={200} spread={50} color="#ffe2b0" opacity={0.3 * hatch * lamps} />
        </g>
      ) : null}

      {/* rooms */}
      {room(left, SEC.livingEnd, "#b89c74", "living")}
      {room(SEC.livingEnd, SEC.hallEnd, "#a79a82", "hall")}
      {room(SEC.hallEnd, SEC.kitchenEnd, "#c8b88c", "kitchen")}
      {room(SEC.kitchenEnd, right, "#9aa0a0", "bed")}
      {/* living room: back window, couch, lamp, TV, pictures */}
      <rect x={-1180} y={-560} width={420} height={260} fill={R(darken("#e8dcc4", 0.05))} />
      <rect x={-1164} y={-544} width={388} height={228} fill={windowNight} />
      <path d="M-1164 -544 L-1100 -544 Q-1110 -430 -1094 -316 L-1164 -316 Z" fill={R("#8a5a3a")} />
      <path d="M-776 -544 L-840 -544 Q-830 -430 -846 -316 L-776 -316 Z" fill={R("#8a5a3a")} />
      <path d="M-1250 -160 L-1250 -300 Q-1250 -330 -1220 -330 L-760 -330 Q-730 -330 -730 -300 L-730 -160 Z" fill={R("#6a4a36")} />
      <rect x={-1270} y={-260} width={560} height={80} rx={20} fill={R("#7a5640")} />
      <rect x={-1240} y={-300} width={250} height={50} rx={14} fill={R("#86604a")} />
      <rect x={-980} y={-300} width={250} height={50} rx={14} fill={R("#86604a")} />
      <rect x={-640} y={-240} width={220} height={20} fill={R("#5a3e2c")} />
      <rect x={-620} y={-220} width={12} height={60} fill={R("#4a3222")} />
      <rect x={-452} y={-220} width={12} height={60} fill={R("#4a3222")} />
      {party ? (
        <g>
          {[-600, -560, -500].map((gx) => (
            <rect key={gx} x={gx} y={-268} width={14} height={28} rx={3} fill={R("#d8e4e8")} opacity={0.8} />
          ))}
        </g>
      ) : null}
      {/* floor lamp */}
      <rect x={-1330} y={-520} width={8} height={360} fill={R("#3a3028")} />
      <path d="M-1370 -520 L-1282 -520 L-1300 -590 L-1352 -590 Z" fill={R("#e8d4a8")} />
      {lamps > 0 ? (
        <>
          <Glow x={-1326} y={-540} r={420} color="#ffd9a0" opacity={0.55 * lamps} />
          <Pool x={-1100} y={-165} rx={600} ry={40} color="#ffd8a0" opacity={0.4 * lamps} />
        </>
      ) : null}
      {/* TV console */}
      <rect x={-560} y={-360} width={200} height={200} rx={10} fill={R("#4a3626")} />
      <rect x={-540} y={-344} width={150} height={120} rx={14} fill={R("#1a2024")} />
      <rect x={-540} y={-344} width={150} height={120} rx={14} fill="#7a9ac8" opacity={0.25 + noise(t * 6, 1) * 0.1} style={{ mixBlendMode: "screen" }} />
      {[
        [-1150, -620, 90, 70],
        [-980, -630, 60, 80],
      ].map(([px, py, pw, ph], i) => (
        <g key={i}>
          <rect x={px} y={py} width={pw} height={ph} fill={R("#3a2c20")} />
          <rect x={px + 8} y={py + 8} width={pw - 16} height={ph - 16} fill={R(mix("#8a9aa0", "#c8b890", i * 0.5))} />
        </g>
      ))}
      {living}
      {/* hall + closet with coats */}
      <rect x={-250} y={-600} width={320} height={440} fill={R("#6a5c48")} />
      <rect x={-240} y={-580} width={300} height={10} fill={R("#3a3024")} />
      {[-220, -170, -120, -60, 0].map((cx, i) => (
        <path key={cx} d={`M${cx} -570 L${cx + 50} -570 L${cx + 58} -330 L${cx - 8} -330 Z`} fill={R(["#5a4a3a", "#3e4a56", "#7a5a3a", "#4a4a42", "#6a3a32"][i])} />
      ))}
      {hall}
      {/* kitchen: cabinets, fridge, table */}
      <rect x={160} y={-640} width={420} height={120} fill={R("#8a6a4a")} />
      <rect x={160} y={-330} width={420} height={170} fill={R("#8a6a4a")} />
      <rect x={160} y={-340} width={420} height={16} fill={R("#d8d0c0")} />
      <rect x={600} y={-560} width={140} height={400} rx={10} fill={R("#e8e2d4")} />
      <rect x={600} y={-420} width={140} height={4} fill={R("#b8b2a4")} />
      <circle cx={360} cy={-600} r={0} fill="none" />
      <path d="M470 -660 L470 -560" stroke={R("#2a2622")} strokeWidth={3} />
      <path d="M430 -560 L510 -560 L495 -530 L445 -530 Z" fill={R("#d8b870")} />
      {lamps > 0 ? <Glow x={470} y={-530} r={320} color="#ffe0a8" opacity={0.4 * lamps} /> : null}
      {kitchen}
      {/* bedroom */}
      <rect x={960} y={-280} width={380} height={120} rx={10} fill={R("#6a7a8a")} />
      <rect x={960} y={-330} width={40} height={170} fill={R("#4a3a2c")} />
      <rect x={1010} y={-300} width={120} height={40} rx={10} fill={R("#e8e4dc")} />
      {bedroom}
      {/* partition walls cut */}
      {[left, SEC.livingEnd, SEC.hallEnd, SEC.kitchenEnd, right - wall].map((wx, i) => (
        <rect key={i} x={wx - (i === 0 ? 0 : wall / 2)} y={ceiling} width={wall} height={floor - ceiling} fill={cut} />
      ))}
      {/* door openings */}
      {[SEC.livingEnd, SEC.hallEnd, SEC.kitchenEnd].map((dx) => (
        <rect key={dx} x={dx - wall / 2} y={-560} width={wall} height={400} fill={R("#2e2620")} />
      ))}
      {/* ceiling, attic, roof in section */}
      <rect x={left - 20} y={ceiling - 40} width={right - left + 40} height={40} fill={cut} />
      {Array.from({ length: 34 }, (_, i) => (
        <rect key={i} x={left + 10 + i * 82} y={ceiling - 36} width={20} height={32} fill={R("#6a5038")} />
      ))}
      <path d={`M${left - 90} ${ceiling - 40} L${left + 500} ${ridge} L${right - 500} ${ridge} L${right + 90} ${ceiling - 40} Z`} fill={lit("#1c1814", crawlLight)} />
      <path d={`M${left - 60} ${ceiling - 44} L${left + 500} ${ridge + 30} L${right - 500} ${ridge + 30} L${right + 60} ${ceiling - 44} Z`} fill={lit("#2c2620", crawlLight)} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={left + 100 + i * 260} y={ceiling - 70} width={200} height={26} rx={10} fill={lit("#8a7a5a", crawlLight)} opacity={0.8} />
      ))}
      <path d={`M${left - 110} ${ceiling - 30} L${left + 500} ${ridge - 20} L${right - 500} ${ridge - 20} L${right + 110} ${ceiling - 30}`} stroke={lit(snow > 0 ? "#dde4ea" : "#34302d", NEUTRAL)} strokeWidth={36} fill="none" />
      {/* foundation walls, cut */}
      {[left - 60, right].map((fx) => (
        <g key={fx}>
          <rect x={fx} y={floor} width={60} height={dirtFront + 90 - floor} fill={lit("#8a867e", crawlLight)} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={fx} y={floor + 30 + i * 60} width={60} height={3} fill={lit("#5a5750", crawlLight)} />
          ))}
        </g>
      ))}
    </g>
  );
};
