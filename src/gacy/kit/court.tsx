import React from "react";
import { darken, lit, type Light, NEUTRAL } from "../engine/color";
import { hash } from "../engine/time";
import { Flag } from "./props";
import { Glow, Pool, Wash } from "./light";
import { PATCHES } from "./section";
import { WallClock } from "./pharmacy";
import { WindowInt } from "./interior";

/**
 * A Cook County courtroom, 1980, and the jury room. World scale; the well
 * of the court is the character plane. The exhibit easel shows the same
 * floor plan the investigators drew (kit/section PATCHES), so the viewer
 * recognises it.
 */

export const COURT = {
  bench: 0,
  benchTop: -560,
  jury: 1900,
  defense: -1300,
  prosecution: 700,
  easel: 1250,
} as const;

export const CourtRoom: React.FC<{ readonly light?: Light; readonly t?: number }> = ({ light = NEUTRAL, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-4200} y={-1600} width={8400} height={1600} fill={L("#6a4e36")} />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={-4200 + i * 290} y={-1600} width={10} height={1600} fill={L("#5a4028")} />
      ))}
      <rect x={-4200} y={-760} width={8400} height={24} fill={L("#4a3422")} />
      {[-3200, 2400].map((wx) => (
        <WindowInt key={wx} x={wx} y={-1480} w={560} h={640} outside="#c8d0d8" light={light} />
      ))}
      {/* seal above the bench */}
      <circle cx={0} cy={-1200} r={170} fill={L("#8a6a3a")} />
      <circle cx={0} cy={-1200} r={140} fill={L("#b89a5a")} />
      <circle cx={0} cy={-1200} r={100} fill={L("#9a7a42")} />
      <Flag x={-700} t={t} light={light} />
      {/* the judge's bench, raised */}
      <rect x={-600} y={COURT.benchTop} width={1200} height={-COURT.benchTop} fill={L("#5a3e28")} />
      <rect x={-640} y={COURT.benchTop - 30} width={1280} height={40} fill={L("#7a5a3a")} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={-560 + i * 240} y={COURT.benchTop + 40} width={200} height={-COURT.benchTop - 80} fill={L("#4e3622")} />
      ))}
      {/* witness box */}
      <rect x={-1100} y={-330} width={380} height={330} fill={L("#5a3e28")} />
      <rect x={-1120} y={-350} width={420} height={30} fill={L("#7a5a3a")} />
      {/* jury box: two tiers */}
      <rect x={COURT.jury - 700} y={-300} width={1500} height={300} fill={L("#5a3e28")} />
      <rect x={COURT.jury - 720} y={-320} width={1540} height={30} fill={L("#7a5a3a")} />
      <rect x={COURT.jury - 700} y={-460} width={1500} height={40} fill={L("#4a3220")} opacity={0.6} />
      <Pool x={0} y={-600} rx={3000} ry={700} color="#fff4e0" opacity={0.2} />
      <Wash x={-4200} y={-1600} w={8400} h={600} from="top" color="#000" opacity={0.35} />
    </g>
  );
};

/** Counsel table with papers. */
export const CounselTable: React.FC<{ readonly x: number; readonly light?: Light }> = ({ x, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-420} y={-150} width={840} height={20} fill={L("#6a4a30")} />
      <rect x={-400} y={-130} width={800} height={130} fill={L("#4e3622")} />
      {[-300, -120, 140].map((px, i) => (
        <rect key={px} x={px} y={-162} width={120} height={12} fill={L(["#e8e2d4", "#d8d0bc", "#e0dccc"][i])} transform={`rotate(${(hash(px) - 0.5) * 6} ${px} -156)`} />
      ))}
      <rect x={260} y={-196} width={30} height={46} fill={L("#8a8a8a")} />
    </g>
  );
};

export const GalleryBench: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-5000} y={-220} width={10000} height={40} fill={L("#5a3e28")} />
      <rect x={-5000} y={-180} width={10000} height={180} fill={L("#3e2a1a")} />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={-5000 + i * 520} y={-220} width={20} height={220} fill={L("#2e1e12")} />
      ))}
    </g>
  );
};

/** The investigators' floor plan, as a courtroom exhibit. `mark` hatches the crawl space. */
export const PlanExhibit: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly light?: Light;
  readonly mark?: number;
  readonly s?: number;
  readonly board?: React.ReactNode;
}> = ({ x, y, light = NEUTRAL, mark = 0, s = 1, board }) => {
  const L = (c: string) => lit(c, light);
  const w = 560;
  const h = 400;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M${-w / 2 + 40} ${h / 2} L${-w / 2 - 20} ${h / 2 + 420} M${w / 2 - 40} ${h / 2} L${w / 2 + 20} ${h / 2 + 420} M0 ${h / 2} L0 ${h / 2 + 440}`} stroke={L("#4a3422")} strokeWidth={14} />
      <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} fill={L("#2a2622")} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#efe9dc")} />
      {board ?? (
        <g transform={`scale(${w / 3200})`}>
          <rect x={-1400} y={-520} width={2800} height={1040} fill="none" stroke={L("#2a2622")} strokeWidth={14} />
          {[-300, 120, 880].map((px) => (
            <path key={px} d={`M${px} -520 L${px} 520`} stroke={L("#2a2622")} strokeWidth={9} />
          ))}
          <path d="M-1400 40 L-300 40 M120 -80 L880 -80" stroke={L("#2a2622")} strokeWidth={9} />
          {mark > 0 ? (
            <g opacity={mark}>
              {Array.from({ length: 28 }, (_, i) => (
                <path key={i} d={`M${-1400 + i * 100} 520 L${-1400 + i * 100 + 400} -520`} stroke={L("#a8322a")} strokeWidth={6} opacity={0.35} />
              ))}
            </g>
          ) : null}
          {PATCHES.map((p, i) => (
            <circle key={i} cx={p.x} cy={(hash(i * 5) - 0.5) * 860} r={24} fill={L("#a8322a")} />
          ))}
        </g>
      )}
    </g>
  );
};

/** Jury room: a long table, twelve chairs, a clock. */
export const JuryRoom: React.FC<{ readonly light?: Light; readonly minutes: number }> = ({ light = NEUTRAL, minutes }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-3000} y={-1200} width={6000} height={1200} fill={L("#a89a82")} />
      <rect x={-3000} y={0} width={6000} height={700} fill={L("#5a4a3a")} />
      <WindowInt x={-2400} y={-1050} w={700} h={520} outside="#9aaab8" light={light} blinds />
      <WallClock x={380} y={-640} minutes={minutes} light={light} r={80} />
      <Glow x={0} y={-1100} r={1800} color="#fff4e0" opacity={0.2} />
      <rect x={-3000} y={-60} width={6000} height={60} fill={L(darken("#a89a82", 0.3))} />
    </g>
  );
};
