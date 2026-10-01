import React from "react";
import { darken, lighten, lit, mix, type Light, NEUTRAL } from "../../gacy/engine/color";
import { hash, noise } from "../../gacy/engine/time";
import { Beam, Glow, Pool, Wash } from "../../gacy/kit/light";
import { Bottle, Hay, MagicLantern, OilLamp, SideChair, Workbench } from "./props";
import { PanelDoor, SashWindow, VRoom } from "./rooms";
import { TYPE } from "../theme";

/**
 * Interiors outside the house: the drugstore, the church, the courtroom,
 * the inquest room, the barn loft, a chemist's bench, a hall with a magic
 * lantern. World scale, floor at y = 0.
 */

/** Smith's drug store: a long counter, shelves of bottles behind it. */
export const Drugstore: React.FC<{ readonly light?: Light; readonly t?: number; readonly poisonGlint?: number; readonly children?: React.ReactNode }> = ({ light = NEUTRAL, t = 0, poisonGlint = 0, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={-2400} x1={2400} paper="#a89a78" motif="#988a68" floor="#5a4a38" light={light} dado={false}>
      {/* shelving */}
      <rect x={-1900} y={-540} width={3800} height={380} fill={L("#3a2a1e")} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={-1880} y={-520 + r * 120} width={3760} height={12} fill={L("#6a4a32")} />
          {Array.from({ length: 34 }, (_, i) => (
            <Bottle key={i} x={-1800 + i * 112} y={-520 + r * 120} h={44 + hash(i + r * 7) * 30} color={["#3a5a4a", "#5a3a2a", "#7a8a6a", "#2a3a5a", "#8a6a3a"][Math.floor(hash(i * 3 + r) * 5)]} light={light} label={hash(i + r) > 0.3} />
          ))}
        </g>
      ))}
      {/* the poison shelf: one bottle with a skull, higher up */}
      <rect x={200} y={-620} width={360} height={10} fill={L("#6a4a32")} />
      <Bottle x={380} y={-620} h={70} color="#2a3a5a" light={light} skull />
      {poisonGlint > 0 ? <Glow x={380} y={-660} r={160} color="#e8f0ff" opacity={0.7 * poisonGlint} /> : null}
      {/* counter */}
      <rect x={-1600} y={-200} width={3200} height={200} fill={L("#5a3a28")} />
      <rect x={-1620} y={-212} width={3240} height={14} fill={L("#8a6a48")} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-1560 + i * 270} y={-180} width={220} height={160} fill={L("#4a2e1e")} />
      ))}
      {/* scales and a mortar on the counter */}
      <rect x={-400} y={-260} width={12} height={50} fill={L("#a08a52")} />
      <rect x={-460} y={-262} width={130} height={6} fill={L("#a08a52")} />
      <path d="M-470 -230 Q-430 -215 -390 -230 Z" fill={L("#b89a5a")} />
      <path d="M-350 -230 Q-310 -215 -270 -230 Z" fill={L("#b89a5a")} />
      <path d="M600 -212 L660 -212 L650 -262 L610 -262 Z" fill={L("#e8e4dc")} />
      <OilLamp x={1200} y={-212} on={0.3} t={t} light={light} s={0.7} />
      {/* windows to the street */}
      <SashWindow id="ds1" x={-2200} y={-500} w={300} h={330} light={light} outside="#d8c8a0" blind={0.1} />
      <SashWindow id="ds2" x={1900} y={-500} w={300} h={330} light={light} outside="#d8c8a0" blind={0.1} />
      {children}
    </VRoom>
  );
};

/** Inside the church: pews, a pulpit, tall windows. `pews` rows are drawn by the caller. */
export const ChurchInterior: React.FC<{ readonly light?: Light; readonly t?: number; readonly children?: React.ReactNode }> = ({ light = NEUTRAL, t = 0, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-3000} y={-1600} width={6000} height={1600} fill={L("#e8e2d4")} />
      <rect x={-3000} y={-1640} width={6000} height={40} fill={L("#c8c0b0")} />
      {[-2200, -1200, 1200, 2200].map((wx) => (
        <g key={wx}>
          <rect x={wx - 100} y={-1300} width={200} height={800} fill={L("#c8d8e0")} />
          <path d={`M${wx - 100} -1300 a100 100 0 0 1 200 0`} fill={L("#c8d8e0")} />
          <path d={`M${wx} -1400 V-500 M${wx - 100} -1000 H${wx + 100}`} stroke={L("#e8e2d4")} strokeWidth={10} />
          <Beam x={wx} y={-900} angle={62} length={1400} spread={16} color="#fff4d8" opacity={0.18} />
        </g>
      ))}
      <rect x={-3000} y={0} width={6000} height={900} fill={L("#6a5038")} />
      {/* the chancel arch behind the pulpit */}
      <path d="M-700 -300 L-700 -1000 a700 700 0 0 1 1400 0 L700 -300 Z" fill={L("#d8d0c0")} />
      <path d="M-640 -300 L-640 -980 a640 640 0 0 1 1280 0 L640 -300 Z" fill={L("#c8c0ac")} />
      <rect x={-30} y={-1200} width={60} height={400} fill={L("#5a3a28")} />
      <rect x={-160} y={-1090} width={320} height={60} fill={L("#5a3a28")} />
      {/* pulpit */}
      <rect x={-200} y={-360} width={400} height={360} fill={L("#5a3a28")} />
      <rect x={-230} y={-380} width={460} height={30} fill={L("#8a6a48")} />
      <rect x={-60} y={-600} width={120} height={240} fill={L("#5a3a28")} />
      <path d="M-40 -600 L40 -600 L0 -660 Z" fill={L("#3a2418")} />
      <Wash x={-3000} y={-1600} w={6000} h={700} from="top" color="#000" opacity={0.25} />
      {children}
      {/* motes */}
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={-2000 + hash(i) * 4000 + noise(t * 0.3 + i, i) * 30} cy={-1200 + ((hash(i + 5) * 1000 + t * 8) % 1000)} r={2} fill="#fff4d8" opacity={0.4} />
      ))}
    </g>
  );
};

/** A church pew. */
export const Pew: React.FC<{ readonly x: number; readonly w?: number; readonly light?: Light }> = ({ x, w = 900, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-w / 2} y={-200} width={w} height={20} fill={L("#5a3a28")} />
      <rect x={-w / 2} y={-100} width={w} height={16} fill={L("#5a3a28")} />
      <rect x={-w / 2} y={-200} width={20} height={200} fill={L("#4a2e1e")} />
      <rect x={w / 2 - 20} y={-200} width={20} height={200} fill={L("#4a2e1e")} />
    </g>
  );
};

export const COURT = {
  bench: 0,
  benchTop: -600,
  jury: 2200,
  witness: 1100,
  defense: -1200,
  prosecution: -300,
  reporters: -2300,
  gallery: 3800,
} as const;

/** New Bedford Superior Court, June 1893: three judges, a jury box, a packed rail. */
export const Courtroom: React.FC<{ readonly light?: Light; readonly t?: number; readonly children?: React.ReactNode; readonly fans?: boolean }> = ({ light = NEUTRAL, t = 0, children, fans = true }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-5000} y={-1800} width={10000} height={1800} fill={L("#a09070")} />
      {Array.from({ length: 40 }, (_, i) =>
        Array.from({ length: 12 }, (_, j) => (
          <path key={`${i}-${j}`} d={`M${-5000 + 120 + i * 250 + (j % 2) * 125} ${-1760 + j * 120} l16 20 l-16 20 l-16 -20 Z`} fill={L("#8a7a5a")} opacity={0.5} />
        )),
      )}
      {/* panelling */}
      <rect x={-5000} y={-700} width={10000} height={700} fill={L("#5a3a28")} />
      {Array.from({ length: 34 }, (_, i) => (
        <rect key={i} x={-5000 + i * 300 + 20} y={-680} width={260} height={640} fill={L("#6a4a32")} />
      ))}
      <rect x={-5000} y={-710} width={10000} height={16} fill={L("#3a2418")} />
      {/* tall windows */}
      {[-3600, 3400].map((wx) => (
        <g key={wx}>
          <rect x={wx - 200} y={-1600} width={400} height={860} fill={L("#c8d8dc")} />
          <path d={`M${wx - 200} -1600 a200 200 0 0 1 400 0`} fill={L("#c8d8dc")} />
          <path d={`M${wx} -1800 V-740 M${wx - 200} -1200 H${wx + 200}`} stroke={L("#e8e2d4")} strokeWidth={12} />
          <Beam x={wx} y={-1200} angle={60} length={1600} spread={20} color="#fff4d8" opacity={0.16} />
        </g>
      ))}
      {/* the bench, raised, three seats */}
      <rect x={-900} y={COURT.benchTop} width={1800} height={-COURT.benchTop} fill={L("#5a3a28")} />
      <rect x={-940} y={COURT.benchTop - 40} width={1880} height={50} fill={L("#8a6a48")} />
      {[-600, 0, 600].map((sx) => (
        <rect key={sx} x={sx - 160} y={COURT.benchTop - 300} width={320} height={260} rx={20} fill={L("#3a2418")} />
      ))}
      <rect x={-5000} y={0} width={10000} height={900} fill={L("#5a4a38")} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={-5000} y={16 + i * i * 9} width={10000} height={2 + i * 0.4} fill={L("#3a2e22")} opacity={0.7} />
      ))}
      {/* witness stand */}
      <rect x={COURT.witness - 180} y={-380} width={360} height={380} fill={L("#5a3a28")} />
      <rect x={COURT.witness - 200} y={-400} width={400} height={24} fill={L("#8a6a48")} />
      {/* jury box: a low rail with a raised floor */}
      <rect x={COURT.jury - 900} y={-140} width={1800} height={140} fill={L("#4a3020")} />
      <rect x={COURT.jury - 920} y={-320} width={1840} height={20} fill={L("#8a6a48")} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={COURT.jury - 900 + i * 115} y={-300} width={12} height={160} fill={L("#6a4a32")} />
      ))}
      {/* tables */}
      {[COURT.defense, COURT.prosecution].map((tx) => (
        <g key={tx}>
          <rect x={tx - 300} y={-160} width={600} height={18} fill={L("#8a6a48")} />
          <rect x={tx - 280} y={-142} width={16} height={142} fill={L("#4a2e1e")} />
          <rect x={tx + 264} y={-142} width={16} height={142} fill={L("#4a2e1e")} />
          <rect x={tx - 200} y={-170} width={220} height={10} fill={L("#ece6d8")} />
        </g>
      ))}
      {/* reporters' table */}
      <rect x={COURT.reporters - 500} y={-150} width={1000} height={16} fill={L("#8a6a48")} />
      <rect x={COURT.reporters - 480} y={-134} width={14} height={134} fill={L("#4a2e1e")} />
      <rect x={COURT.reporters + 466} y={-134} width={14} height={134} fill={L("#4a2e1e")} />
      {/* ceiling fans of the heat: palm-leaf fans are with the people; here, the rail */}
      <rect x={-5000} y={-40} width={10000} height={6} fill={L("#3a2418")} opacity={fans ? 0.3 : 0} />
      {children}
      <Wash x={-5000} y={-1800} w={10000} h={800} from="top" color="#000" opacity={0.3} />
      <Pool x={0} y={-500} rx={3000} ry={900} color="#fff0d0" opacity={0.08 * (0.9 + noise(t * 0.2, 1) * 0.1)} />
    </g>
  );
};

/** An exhibit table with a cloth, where things are placed for the jury. */
export const ExhibitTable: React.FC<{ readonly x: number; readonly light?: Light; readonly w?: number; readonly children?: React.ReactNode }> = ({ x, light = NEUTRAL, w = 700, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={w * 0.58} ry={12} fill="#000" opacity={0.3} />
      <rect x={-w / 2 + 30} y={-170} width={20} height={170} fill={L("#4a2e1e")} />
      <rect x={w / 2 - 50} y={-170} width={20} height={170} fill={L("#4a2e1e")} />
      <rect x={-w / 2} y={-184} width={w} height={20} fill={L("#5a3a28")} />
      <path d={`M${-w / 2 - 10} -186 L${w / 2 + 10} -186 L${w / 2 + 14} -140 L${-w / 2 - 14} -140 Z`} fill={L("#d8d0c0")} />
      <g transform="translate(0 -186)">{children}</g>
    </g>
  );
};

/** A room in the Fall River police court where the inquest was held. */
export const InquestRoom: React.FC<{ readonly light?: Light; readonly t?: number; readonly minutes?: number; readonly children?: React.ReactNode }> = ({ light = NEUTRAL, t = 0, minutes = 600, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={-2200} x1={2200} paper="#8a8a7a" motif="#7a7a6a" floor="#4a4038" light={light}>
      <SashWindow id="iq1" x={-1700} y={-500} w={260} h={320} light={light} outside="#d8d0b0" blind={0.5} />
      <SashWindow id="iq2" x={1400} y={-500} w={260} h={320} light={light} outside="#d8d0b0" blind={0.5} />
      {/* clock on the wall */}
      <g transform="translate(0 -440)">
        <circle r={70} fill={L("#3a2a1e")} />
        <circle r={60} fill={L("#efe8d8")} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-2} y={-54} width={4} height={10} fill={L("#2a2018")} transform={`rotate(${i * 30})`} />
        ))}
        <rect x={-3} y={-34} width={6} height={40} fill={L("#1a1510")} transform={`rotate(${(((minutes / 60) % 12) / 12) * 360})`} />
        <rect x={-2} y={-52} width={4} height={58} fill={L("#1a1510")} transform={`rotate(${((minutes % 60) / 60) * 360})`} />
      </g>
      {/* a long table */}
      <rect x={-700} y={-170} width={1400} height={18} fill={L("#4a3020")} />
      <rect x={-680} y={-152} width={18} height={152} fill={L("#3a2418")} />
      <rect x={662} y={-152} width={18} height={152} fill={L("#3a2418")} />
      <rect x={-300} y={-180} width={200} height={10} fill={L("#ece6d8")} />
      <rect x={100} y={-180} width={160} height={10} fill={L("#ece6d8")} />
      <SideChair x={-1000} facing={1} light={light} />
      <SideChair x={-1250} facing={1} light={light} />
      <SideChair x={900} facing={-1} light={light} />
      <PanelDoor x={1900} w={180} h={440} light={light} color="#4a3a2e" />
      <OilLamp x={-560} y={-170} on={0.4} t={t} light={light} s={0.7} />
      {children}
    </VRoom>
  );
};

/** The barn loft: rafters, a small window, a workbench, hay. */
export const BarnLoft: React.FC<{ readonly light?: Light; readonly t?: number; readonly dust?: number; readonly windowOpen?: number; readonly children?: React.ReactNode; readonly bench?: React.ReactNode }> = ({ light = NEUTRAL, t = 0, dust = 1, windowOpen = 0, children, bench }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <path d="M-2200 0 L-2200 -500 L0 -1500 L2200 -500 L2200 0 Z" fill={L("#6a5236")} />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={-2200 + i * 150} y={-1500} width={6} height={1500} fill={L("#4a3826")} opacity={0.5} />
      ))}
      {/* rafters */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = -1800 + i * 450;
        const y = -500 - (1 - Math.abs(x) / 2200) * 1000;
        return <rect key={i} x={x - 30} y={y} width={60} height={-y} fill={L("#3a2a1a")} opacity={0.6} />;
      })}
      <rect x={-2200} y={0} width={4400} height={900} fill={L("#5a4a32")} />
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={-2200 + i * 200} y={0} width={4} height={900} fill={L("#4a3a26")} />
      ))}
      {/* the loft window */}
      <rect x={-140} y={-1200} width={280} height={300} fill={L("#3a2a1a")} />
      <rect x={-120} y={-1180} width={240} height={260} fill={mix(L("#d8c890"), "#fff4d8", 0.6)} />
      <rect x={-120} y={-1180} width={240 * (1 - windowOpen)} height={260} fill={L("#8a7a5a")} opacity={0.7} />
      <path d="M0 -1180 V-920 M-120 -1050 H120" stroke={L("#3a2a1a")} strokeWidth={10} />
      <Beam x={0} y={-1050} angle={70} length={1500} spread={18} color="#fff4d8" opacity={0.3} />
      {dust > 0
        ? Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={-300 + hash(i) * 600 + noise(t * 0.4 + i, i) * 40} cy={-1000 + ((hash(i + 5) * 1000 + t * (6 + hash(i) * 8)) % 1000)} r={1.5 + hash(i + 2) * 2} fill="#fff4d8" opacity={0.5 * dust} />
          ))
        : null}
      <Hay x={-1400} w={900} light={light} seed={3} />
      <Hay x={1500} w={700} light={light} seed={9} />
      <Workbench x={500} light={light}>{bench}</Workbench>
      {/* ladder hatch */}
      <rect x={-1000} y={-10} width={300} height={40} fill={L("#1a1410")} />
      <rect x={-990} y={-300} width={12} height={300} fill={L("#4a3a26")} />
      <rect x={-722} y={-300} width={12} height={300} fill={L("#4a3a26")} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-990} y={-280 + i * 70} width={280} height={10} fill={L("#4a3a26")} />
      ))}
      <Wash x={-2200} y={-1500} w={4400} h={900} from="top" color="#000" opacity={0.45} />
      {children}
    </g>
  );
};

/** A chemist's bench: jars, a burner, glassware. */
export const LabBench: React.FC<{ readonly light?: Light; readonly t?: number; readonly children?: React.ReactNode }> = ({ light = NEUTRAL, t = 0, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={-2000} x1={2000} paper="#d8d4c8" motif="#c8c4b8" floor="#4a4a44" light={light} dado={false}>
      <rect x={-1800} y={-560} width={3600} height={12} fill={L("#5a4a3a")} />
      <rect x={-1800} y={-440} width={3600} height={12} fill={L("#5a4a3a")} />
      {Array.from({ length: 26 }, (_, i) => (
        <rect key={i} x={-1760 + i * 140} y={-560 - 40 - hash(i) * 40} width={70} height={40 + hash(i) * 40} rx={8} fill={L(["#c8d8e0", "#8a6a3a", "#e8e4dc", "#4a6a5a"][i % 4])} opacity={0.9} />
      ))}
      <rect x={-1400} y={-200} width={2800} height={200} fill={L("#3a2e26")} />
      <rect x={-1420} y={-212} width={2840} height={16} fill={L("#1a1614")} />
      {/* glassware */}
      {[-900, -700, -520].map((bx, i) => (
        <g key={bx}>
          <path d={`M${bx - 30} -212 L${bx + 30} -212 L${bx + 12} -300 L${bx - 12} -300 Z`} fill={L("#d8e8f0")} opacity={0.8} />
          <rect x={bx - 26} y={-240} width={52} height={20} fill={L(["#8a6a3a", "#5a7a5a", "#7a5a6a"][i])} opacity={0.8} />
        </g>
      ))}
      <rect x={-200} y={-232} width={12} height={20} fill={L("#5a5a5a")} />
      <path d={`M-194 -232 Q-194 ${-262 - noise(t * 10, 1) * 6} -194 -280`} stroke="#8ab0ff" strokeWidth={8} opacity={0.8} fill="none" />
      <Glow x={-194} y={-270} r={140} color="#8ab0ff" opacity={0.4} />
      {[200, 320, 440].map((tx) => (
        <g key={tx}>
          <rect x={tx - 8} y={-330} width={16} height={120} rx={8} fill={L("#e8f0f4")} opacity={0.8} />
          <rect x={tx - 6} y={-260} width={12} height={48} rx={6} fill={L("#c8b890")} opacity={0.9} />
        </g>
      ))}
      <rect x={100} y={-214} width={420} height={6} fill={L("#3a3a3a")} />
      {/* a microscope */}
      <path d="M800 -212 L900 -212 L890 -240 L810 -240 Z" fill={L("#2a2a2a")} />
      <rect x={840} y={-420} width={20} height={180} fill={L("#2a2a2a")} />
      <path d="M850 -420 L900 -470 L916 -458 L866 -408 Z" fill={L("#2a2a2a")} />
      {children}
    </VRoom>
  );
};

/** A hall with a magic lantern throwing a picture onto a sheet. */
export const LanternHall: React.FC<{ readonly light?: Light; readonly t?: number; readonly on?: number; readonly slide?: React.ReactNode; readonly children?: React.ReactNode }> = ({ light = NEUTRAL, t = 0, on = 1, slide, children }) => {
  const L = (c: string) => lit(c, light);
  const g = on * (0.9 + noise(t * 8, 3) * 0.1);
  return (
    <g>
      <rect x={-3000} y={-1600} width={6000} height={1600} fill={L("#2a2420")} />
      <rect x={-3000} y={0} width={6000} height={900} fill={L("#1e1a16")} />
      {/* the sheet */}
      <rect x={-1100} y={-1300} width={2200} height={1000} fill={mix(L("#8a867e"), "#fff4d8", 0.75 * g)} />
      <path d="M-1120 -1310 L1120 -1310 L1110 -1290 L-1110 -1290 Z" fill={L("#4a4640")} />
      <defs>
        <clipPath id="lantern-sheet">
          <rect x={-1100} y={-1300} width={2200} height={1000} />
        </clipPath>
      </defs>
      <g clipPath="url(#lantern-sheet)" opacity={g}>
        <ellipse cx={0} cy={-800} rx={1150} ry={560} fill="#fff8e8" opacity={0.55} />
        {slide}
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={-1000 + hash(i) * 2000 + noise(t * 2 + i, i) * 30} cy={-1300 + hash(i + 5) * 1000} r={1.5} fill="#000" opacity={0.25 * (hash(Math.floor(t * 12) + i) > 0.6 ? 1 : 0)} />
        ))}
      </g>
      <Beam x={0} y={-800} angle={180} length={3200} spread={40} color="#fff4d8" opacity={0.22 * g} />
      <MagicLantern x={3000} y={-320} on={on} t={t} light={light} />
      <rect x={2860} y={-320} width={260} height={320} fill={L("#3a2e26")} />
      <Glow x={0} y={-800} r={1600} color="#fff0c8" opacity={0.18 * g} />
      {children}
    </g>
  );
};

/** The series mark as a lantern slide. */
export const SeriesSlide: React.FC<{ readonly k: number }> = ({ k }) => (
  <g opacity={k}>
    <text x={0} y={-860} textAnchor="middle" fontFamily={`${TYPE.serif}, serif`} fontWeight={600} fontSize={150} fill="#2a2018" direction="rtl" opacity={0.85}>
      מאחורי הסיוט
    </text>
    <rect x={-500 * k} y={-800} width={1000 * k} height={6} fill="#5a4a2a" opacity={0.7} />
  </g>
);

/** A corridor with a closed door: where a lawyer waits outside. */
export const Corridor: React.FC<{ readonly light?: Light; readonly t?: number; readonly children?: React.ReactNode }> = ({ light = NEUTRAL, t = 0, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <VRoom x0={-1600} x1={1600} paper="#7a7a6a" motif="#6a6a5a" floor="#3a3a34" light={light}>
      <PanelDoor x={-90} w={180} h={440} light={light} color="#3a3a3a" />
      <rect x={-60} y={-520} width={120} height={40} fill={L("#e8e0c8")} />
      <text x={0} y={-492} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={700} fontSize={26} fill={L("#2a2418")} letterSpacing={2}>
        INQUEST
      </text>
      <SideChair x={500} facing={-1} light={light} />
      <OilLamp x={-900} y={-300} on={0.5} t={t} light={light} s={0.7} />
      <rect x={-920} y={-300} width={40} height={10} fill={L("#3a2a1e")} />
      {children}
    </VRoom>
  );
};

/** A dark wall of printed pages, for the "media circus". */
export const PaperWall: React.FC<{ readonly light?: Light; readonly children?: React.ReactNode }> = ({ light = NEUTRAL, children }) => (
  <g>
    <rect x={-4000} y={-2400} width={8000} height={2400} fill={lit("#1a1612", light)} />
    <rect x={-4000} y={0} width={8000} height={900} fill={lit("#12100c", light)} />
    {children}
  </g>
);

export const lampGlow = (t: number, seed = 0): number => 0.85 + noise(t * 5, seed) * 0.15;
export const darker = (l: Light, k: number): Light => ({ ...l, key: darken(l.key, k), amb: Math.min(0.9, l.amb + k * 0.4) });
export const brighter = (l: Light, k: number): Light => ({ ...l, key: lighten(l.key, k), amb: Math.max(0, l.amb - k * 0.3) });
