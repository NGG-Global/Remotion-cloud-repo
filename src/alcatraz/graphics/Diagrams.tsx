import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { useNarr } from "../components/Shot";
import { imageSrc } from "../components/Still";
import {
  AZ,
  clamp01,
  easeInOut,
  easeOut,
  mix,
  ramp,
  SANS,
  SERIF,
} from "../theme";

/** Blueprint ground shared by the diagrams: dark steel with a faint grid. */
export const Blueprint: React.FC<{ readonly children?: React.ReactNode; readonly tint?: string }> = ({
  children,
  tint = AZ.steel,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(90% 80% at 50% 45%, ${tint} 0%, ${AZ.ink} 70%, ${AZ.black} 100%)`,
    }}
  >
    <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
      <defs>
        <pattern id="grid" width={48} height={48} patternUnits="userSpaceOnUse">
          <path d="M48,0 L0,0 0,48" fill="none" stroke="rgba(185,214,234,0.06)" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width={1920} height={1080} fill="url(#grid)" />
    </svg>
    {children}
  </AbsoluteFill>
);

/** A path that draws itself from `a` to `b` (narration seconds). */
const Draw: React.FC<{
  readonly d: string;
  readonly a: number;
  readonly b: number;
  readonly stroke?: string;
  readonly width?: number;
  readonly fill?: string;
  readonly dash?: string;
}> = ({ d, a, b, stroke = AZ.fog, width = 3, fill = "none", dash }) => {
  const n = useNarr();
  const p = easeInOut(ramp(n, a, b));
  return (
    <path
      d={d}
      pathLength={1}
      fill={fill}
      fillOpacity={fill === "none" ? 0 : p}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash ?? "1 1"}
      strokeDashoffset={dash ? 0 : 1 - p}
      opacity={dash ? p : 1}
    />
  );
};

const T: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly at: number;
  readonly size?: number;
  readonly color?: string;
  readonly anchor?: "start" | "middle" | "end";
  readonly font?: string;
  readonly weight?: number;
}> = ({ x, y, text, at, size = 34, color = AZ.text, anchor = "middle", font = SANS, weight = 400 }) => {
  const n = useNarr();
  const o = easeOut(ramp(n, at, at + 0.4));
  return (
    <text
      x={x}
      y={y + (1 - o) * 10}
      fontFamily={font}
      fontWeight={weight}
      fontSize={size}
      fill={color}
      textAnchor={anchor}
      direction="rtl"
      opacity={o}
    >
      {text}
    </text>
  );
};

/* ------------------------------------------------------------------ cell */

/**
 * A cell in plan, to scale: 5 by 9 feet (about 1.5 by 2.7 metres), drawn
 * over the HABS photograph of a cell in C block, then furnished on the words.
 */
export const CellPlan: React.FC = () => {
  const n = useNarr();
  // 1 m = 200 px. 1.52 x 2.74 m.
  const W = 1.52 * 200;
  const L = 2.74 * 200;
  const x0 = 960 - L / 2;
  const y0 = 560 - W / 2;
  const photo = 1 - 0.75 * ramp(n, 306.0, 307.6);
  const drop = (at: number) => easeOut(ramp(n, at, at + 0.35));
  return (
    <Blueprint>
      <AbsoluteFill style={{ opacity: photo * 0.55 }}>
        <Img
          src={imageSrc("habs-typical-cell")}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) brightness(0.55) blur(2px)" }}
        />
      </AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <Draw d={`M${x0},${y0} H${x0 + L} V${y0 + W} H${x0} Z`} a={306.0} b={307.4} stroke={AZ.text} width={6} />
        {/* bars on the front (left) wall */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={i}
            x1={x0 - 14}
            x2={x0 + 14}
            y1={y0 + ((i + 1) * W) / 10}
            y2={y0 + ((i + 1) * W) / 10}
            stroke={AZ.fog}
            strokeWidth={5}
            opacity={ramp(n, 307.0, 307.6)}
          />
        ))}
        {/* width */}
        <Draw d={`M${x0 - 90},${y0} V${y0 + W}`} a={308.3} b={309.1} stroke={AZ.amber} width={3} />
        <T x={x0 - 110} y={y0 + W / 2 + 12} text="1.5 מ׳" at={308.6} size={44} color={AZ.amber} anchor="end" weight={500} />
        {/* length */}
        <Draw d={`M${x0},${y0 + W + 80} H${x0 + L}`} a={309.7} b={310.9} stroke={AZ.amber} width={3} />
        <T x={960} y={y0 + W + 140} text="2.7 מ׳" at={310.4} size={44} color={AZ.amber} weight={500} />
        {/* bed along the back wall */}
        <g opacity={drop(313.1)} transform={`translate(0, ${(1 - drop(313.1)) * -20})`}>
          <rect x={x0 + 40} y={y0 + 18} width={0.76 * 200 * 2.4} height={0.76 * 200 * 0.55} rx={8} fill="rgba(231,223,204,0.18)" stroke={AZ.paper} strokeWidth={3} />
          <T x={x0 + 40 + 0.76 * 200 * 1.2} y={y0 + 18 + 56} text="מיטה" at={313.1} size={34} color={AZ.paper} />
        </g>
        <g opacity={drop(313.88)} transform={`translate(0, ${(1 - drop(313.88)) * -20})`}>
          <rect x={x0 + L - 90} y={y0 + W - 120} width={70} height={52} rx={10} fill="rgba(185,214,234,0.18)" stroke={AZ.ice} strokeWidth={3} />
          <T x={x0 + L - 140} y={y0 + W - 82} text="כיור" at={313.88} size={32} color={AZ.ice} anchor="end" />
        </g>
        <g opacity={drop(314.32)} transform={`translate(0, ${(1 - drop(314.32)) * -20})`}>
          <ellipse cx={x0 + L - 55} cy={y0 + W - 30} rx={32} ry={22} fill="rgba(185,214,234,0.18)" stroke={AZ.ice} strokeWidth={3} />
          <T x={x0 + L - 140} y={y0 + W - 18} text="אסלה" at={314.32} size={32} color={AZ.ice} anchor="end" />
        </g>
      </svg>
    </Blueprint>
  );
};

/* ------------------------------------------------------------- cellhouse */

/**
 * The cellhouse as a plan of its four blocks. D block lights up on its name,
 * and at the end of it the six dark cells known as the Hole.
 */
export const BlockPlan: React.FC = () => {
  const n = useNarr();
  const blocks = [
    { id: "A", x: 1330, cells: 28 },
    { id: "B", x: 1040, cells: 28 },
    { id: "C", x: 760, cells: 28 },
    { id: "D", x: 380, cells: 21 },
  ];
  const d = easeOut(ramp(n, 322.2, 322.9));
  const iso = easeOut(ramp(n, 324.8, 325.6));
  return (
    <Blueprint>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <Draw d="M240,250 H1680 V850 H240 Z" a={319.6} b={320.8} stroke={AZ.fog} width={4} />
        <T x={960} y={215} text="בית התאים" at={319.8} size={40} color={AZ.fog} font={SERIF} />
        {blocks.map((b, i) => {
          const isD = b.id === "D";
          const o = ramp(n, 320.2 + i * 0.25, 320.6 + i * 0.25);
          const w = isD ? 200 : 170;
          const stroke = isD ? mix(0, 1, d) : 0;
          return (
            <g key={b.id} opacity={o}>
              <rect
                x={b.x}
                y={330}
                width={w}
                height={440}
                fill={isD ? `rgba(192,38,45,${0.08 + 0.32 * d})` : "rgba(185,214,234,0.06)"}
                stroke={isD && stroke > 0 ? AZ.red : AZ.fog}
                strokeWidth={isD ? 3 + 3 * d : 2}
              />
              {Array.from({ length: b.cells / 2 }).map((_, j) => (
                <line key={j} x1={b.x} x2={b.x + w} y1={330 + ((j + 1) * 440) / (b.cells / 2 + 1)} y2={330 + ((j + 1) * 440) / (b.cells / 2 + 1)} stroke="rgba(154,166,178,0.25)" strokeWidth={1.5} />
              ))}
              <text x={b.x + w / 2} y={310} fontFamily={SERIF} fontSize={isD ? 52 + 10 * d : 46} fill={isD && d > 0 ? AZ.red : AZ.text} textAnchor="middle">
                {b.id}
              </text>
            </g>
          );
        })}
        {/* the wall that separates D from the rest */}
        <line x1={660} x2={660} y1={260} y2={840} stroke={AZ.text} strokeWidth={6} opacity={d} />
        <T x={480} y={830} text="אגף D · בידוד" at={324.8} size={40} color={AZ.red} weight={500} />
        <g opacity={iso}>
          <rect x={380} y={690} width={200} height={80} fill="rgba(0,0,0,0.85)" stroke={AZ.red} strokeWidth={3} />
        </g>
      </svg>
    </Blueprint>
  );
};

/* ---------------------------------------------------------------- dungeon */

/**
 * Section through the old military prison: the building above ground, the
 * dungeon cells cut into the rock beneath it, and fourteen days counted off.
 */
export const Dungeon: React.FC = () => {
  const n = useNarr();
  const ground = 560;
  const tally = Math.floor(clamp01(ramp(n, 196.4, 198.4)) * 14);
  const lamp = 1 - 0.7 * ramp(n, 193.8, 195.0);
  const rise = easeInOut(ramp(n, 199.6, 201.8));
  return (
    <Blueprint tint="#151a20">
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        {/* rock */}
        <rect x={0} y={ground} width={1920} height={520} fill="#100f0d" opacity={ramp(n, 190.0, 190.8)} />
        <Draw d={`M0,${ground} H1920`} a={190.0} b={190.9} stroke={AZ.landDark} width={4} />
        {/* the prison above ground */}
        <Draw d={`M520,${ground} V250 H1400 V${ground}`} a={190.4} b={191.6} stroke={AZ.fog} width={4} />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={580 + i * 115} y={330} width={50} height={80} fill="none" stroke={AZ.fog} strokeWidth={2} opacity={ramp(n, 191.2 + i * 0.05, 191.6 + i * 0.05)} />
        ))}
        <T x={960} y={215} text="מבנה הכלא" at={191.2} size={38} color={AZ.fog} font={SERIF} />
        {/* dungeon cells */}
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={ramp(n, 191.8 + i * 0.2, 192.4 + i * 0.2)}>
            <rect x={640 + i * 230} y={ground + 160} width={180} height={150} fill="#050505" stroke={i === 1 ? AZ.red : AZ.landDark} strokeWidth={i === 1 ? 4 : 2} />
          </g>
        ))}
        <T x={960} y={ground + 380} text="תאי צינוק" at={192.3} size={44} color={AZ.red} font={SERIF} />
        {/* one prisoner, as a small figure; light dies down */}
        <g transform={`translate(${960}, ${mix(ground + 300, 520, rise)})`} opacity={1 - 0.2 * rise}>
          <circle cx={0} cy={-92} r={14} fill={AZ.paper} opacity={0.25 + 0.6 * lamp} />
          <rect x={-14} y={-76} width={28} height={70} rx={10} fill={AZ.paper} opacity={0.25 + 0.6 * lamp} />
        </g>
        {/* tally of fourteen days */}
        <g transform="translate(1520, 760)">
          {Array.from({ length: tally }).map((_, i) => {
            const group = Math.floor(i / 5);
            const inGroup = i % 5;
            const gx = group * 120;
            return inGroup < 4 ? (
              <line key={i} x1={gx + inGroup * 20} y1={0} x2={gx + inGroup * 20} y2={80} stroke={AZ.paper} strokeWidth={5} strokeLinecap="round" />
            ) : (
              <line key={i} x1={gx - 12} y1={64} x2={gx + 74} y2={14} stroke={AZ.paper} strokeWidth={5} strokeLinecap="round" />
            );
          })}
        </g>
        <T x={1650} y={900} text="14 ימים" at={197.4} size={52} color={AZ.paper} font={SERIF} weight={500} />
      </svg>
    </Blueprint>
  );
};

/* ---------------------------------------------------------------- escape */

/**
 * June 1962 as a section through the cellhouse: the cell, the vent behind the
 * sink, the utility corridor, the raft, the heads on the pillows, and the
 * climb to the roof. Held in one take so the plan reads as the chain it was.
 */
export const EscapeRoute: React.FC = () => {
  const n = useNarr();
  const raft = easeOut(ramp(n, 628.2, 629.2));
  const heads = easeOut(ramp(n, 631.3, 632.0));
  const night = ramp(n, 633.6, 634.8);
  const go = easeInOut(ramp(n, 636.5, 639.6));
  // Route: cell -> vent -> corridor -> up the pipes -> roof
  const route: { x: number; y: number }[] = [
    { x: 520, y: 760 },
    { x: 760, y: 760 },
    { x: 960, y: 760 },
    { x: 1000, y: 360 },
    { x: 1100, y: 250 },
  ];
  const seg = go * (route.length - 1);
  const k = Math.min(route.length - 2, Math.floor(seg));
  const f = seg - k;
  const man = { x: mix(route[k].x, route[k + 1].x, f), y: mix(route[k].y, route[k + 1].y, f) };
  return (
    <Blueprint tint={night > 0 ? "#0b1220" : AZ.steel}>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.35 * night})` }} />
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        {/* cellhouse section */}
        <Draw d="M300,860 V300 L1100,200 L1650,300 V860 Z" a={619.7} b={621.0} stroke={AZ.fog} width={3} />
        {/* the cell */}
        <Draw d="M380,860 V640 H720 V860" a={619.8} b={620.6} stroke={AZ.text} width={4} />
        <T x={550} y={620} text="התא" at={620.0} size={34} color={AZ.text} />
        {/* the wall and the opening */}
        <rect x={712} y={720} width={16} height={60} fill={AZ.red} opacity={ramp(n, 620.2, 620.6)} />
        <T x={720} y={900} text="פתח באוורור" at={620.4} size={30} color={AZ.red} />
        {/* utility corridor */}
        <rect x={740} y={640} width={260} height={220} fill="rgba(185,214,234,0.05)" stroke={AZ.ice} strokeWidth={2} strokeDasharray="10 8" opacity={ramp(n, 621.6, 622.4)} />
        <T x={870} y={620} text="מסדרון השירות" at={621.6} size={34} color={AZ.ice} />
        {/* pipes up to the roof */}
        <Draw d="M980,860 V330 L1080,240" a={622.6} b={623.9} stroke={AZ.ice} width={3} dash="8 10" />
        <T x={1270} y={225} text="הגג" at={623.2} size={34} color={AZ.ice} />
        {/* hidden work: a cardboard grille over the hole */}
        <g opacity={easeOut(ramp(n, 624.96, 625.5))}>
          <rect x={700} y={714} width={40} height={72} fill="none" stroke={AZ.paper} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={706} x2={734} y1={726 + i * 16} y2={726 + i * 16} stroke={AZ.paper} strokeWidth={2} />
          ))}
        </g>
        {/* the raft, stored in the corridor */}
        <g opacity={raft} transform={`translate(870, ${800 + (1 - raft) * 20})`}>
          <ellipse cx={0} cy={0} rx={95} ry={22} fill="rgba(226,166,75,0.25)" stroke={AZ.amber} strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={70} ry={12} fill="none" stroke={AZ.amber} strokeWidth={2} />
        </g>
        <T x={870} y={772} text="רפסודה ממעילי גשם" at={628.4} size={28} color={AZ.amber} />
        {/* bed with a dummy head */}
        <rect x={400} y={800} width={260} height={40} rx={6} fill="rgba(231,223,204,0.15)" stroke={AZ.paper} strokeWidth={2} />
        <g opacity={heads}>
          <circle cx={430} cy={788} r={20} fill={AZ.paper} />
          <path d="M412,780 Q430,760 448,780" stroke="#3a2a1a" strokeWidth={8} fill="none" />
        </g>
        <T x={530} y={940} text="ראש מזויף על הכרית" at={631.4} size={30} color={AZ.paper} />
        {/* the route */}
        <path
          d={route.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")}
          pathLength={1}
          fill="none"
          stroke={AZ.red}
          strokeWidth={4}
          strokeDasharray="1 1"
          strokeDashoffset={1 - go}
          opacity={go > 0 ? 1 : 0}
        />
        <circle cx={man.x} cy={man.y} r={12} fill={AZ.red} opacity={go > 0 && go < 1 ? 1 : go >= 1 ? 1 : 0} />
        <T x={1500} y={140} text="11–12 ביוני 1962 · לילה" at={633.7} size={40} color={AZ.text} font={SERIF} />
      </svg>
    </Blueprint>
  );
};

/* ------------------------------------------------------------- isolation */

/**
 * Isolation as a shrinking world: the island's outline closes in on the
 * cellhouse, then on one cell, while the count of days keeps running.
 */
export const IsolationZoom: React.FC = () => {
  const n = useNarr();
  const t1 = easeInOut(ramp(n, 345.3, 347.6));
  const t2 = easeInOut(ramp(n, 349.8, 352.2));
  const w = mix(mix(1500, 700, t1), 220, t2);
  const h = mix(mix(560, 300, t1), 220, t2);
  const r = mix(mix(220, 12, t1), 4, t2);
  const ticks = Math.floor(Math.max(0, n - 352.6) * 6);
  const label = t2 > 0.5 ? "תא אחד" : t1 > 0.5 ? "אגף הבידוד" : "האי";
  return (
    <Blueprint tint="#10151b">
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <rect x={960 - w / 2} y={540 - h / 2} width={w} height={h} rx={r} fill="none" stroke={AZ.text} strokeWidth={5} />
        <rect x={960 - w / 2 - 40} y={540 - h / 2 - 40} width={w + 80} height={h + 80} rx={r + 30} fill="none" stroke="rgba(154,166,178,0.25)" strokeWidth={2} />
        <text x={960} y={540 + h / 2 + 90} fontFamily={SERIF} fontSize={46} fill={AZ.fog} textAnchor="middle" direction="rtl">
          {label}
        </text>
        <g transform="translate(960,540)">
          {Array.from({ length: Math.min(60, ticks) }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            return <line key={i} x1={Math.cos(a) * 300} y1={Math.sin(a) * 300} x2={Math.cos(a) * 320} y2={Math.sin(a) * 320} stroke={AZ.paper} strokeWidth={3} opacity={0.6} />;
          })}
        </g>
      </svg>
    </Blueprint>
  );
};
