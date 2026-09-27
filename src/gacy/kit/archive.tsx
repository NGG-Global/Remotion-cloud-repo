import React from "react";
import { darken, lit, mix, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { TYPE } from "../theme";
import { Glow } from "./light";

/**
 * The identification work that reopened the case in 2011: the evidence
 * archive, the table the files are laid out on, the DNA lab and the
 * screens the genealogists work on. Rooms are at world scale (200 units per
 * metre); the table shots are at paper scale (about 1 unit per millimetre),
 * like the rest of the film's desk inserts.
 *
 * The unidentified victims are never given faces. Their files carry a
 * blank card with a soft outline; a card only warms when the person on it
 * has a name again.
 */

export const blendLight = (a: Light, b: Light, k: number): Light => ({
  key: mix(a.key, b.key, k),
  ambient: mix(a.ambient, b.ambient, k),
  amb: a.amb + (b.amb - a.amb) * k,
  desat: (a.desat ?? 0) + ((b.desat ?? 0) - (a.desat ?? 0)) * k,
});

/** A fluorescent tube stuttering on at `t0`. Deterministic, 0..1. */
export const tubeOn = (t: number, t0: number): number => {
  const u = t - t0;
  if (u < 0) {
    return 0;
  }
  const steps: [number, number][] = [
    [0.05, 0.9],
    [0.16, 0.05],
    [0.21, 0.75],
    [0.36, 0.08],
    [0.44, 1],
    [0.52, 0.3],
  ];
  for (const [end, v] of steps) {
    if (u < end) {
      return v;
    }
  }
  return 1;
};

// ---------------------------------------------------------------- archive

export const SHELF = {
  bay: 200,
  planks: [-20, -130, -240, -350],
  top: -440,
  boxW: 80,
  boxH: 56,
} as const;

/** A banker's box seen from the front. `y` is its bottom edge. */
export const ArchiveBox: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly light?: Light;
  readonly tone?: string;
  readonly label?: string;
  readonly s?: number;
}> = ({ x, y, light = NEUTRAL, tone = "#b89c72", label, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  const w = SHELF.boxW;
  const h = SHELF.boxH;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={L(tone)} />
      <rect x={-w / 2 - 2} y={-h - 2} width={w + 4} height={9} fill={L(darken(tone, 0.12))} />
      <rect x={-12} y={-h + 13} width={24} height={7} rx={3.5} fill={L("#1a140e")} />
      <rect x={label ? -22 : -15} y={-h + 25} width={label ? 44 : 30} height={label ? 20 : 15} fill={L("#ece6d6")} />
      {label ? (
        <text x={0} y={-h + 39} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={700} fontSize={11} fill={L("#2a2218")}>
          {label}
        </text>
      ) : (
        <rect x={-11} y={-h + 30} width={22} height={2} fill={L("#9a9282")} />
      )}
      <rect x={-w / 2} y={-6} width={w} height={6} fill="#000" opacity={0.18} />
    </g>
  );
};

/**
 * Steel shelving, front on, filled with boxes. `hole` leaves one slot
 * empty ([bay, plank, slot]) so a box can be taken out of it.
 */
export const ArchiveShelves: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly light?: Light;
  readonly seed?: number;
  readonly hole?: readonly [number, number, number];
}> = ({ x0, x1, light = NEUTRAL, seed = 0, hole }) => {
  const L = (c: string) => lit(c, light);
  const bays = Math.ceil((x1 - x0) / SHELF.bay);
  return (
    <g>
      {/* back panel: the dark gap behind the boxes */}
      <rect x={x0} y={SHELF.top} width={x1 - x0} height={-SHELF.top} fill={L("#1e2226")} />
      {Array.from({ length: bays }, (_, b) => {
        const bx = x0 + b * SHELF.bay;
        return (
          <g key={b}>
            {SHELF.planks.map((py, p) =>
              [0, 1].map((slot) => {
                const k = hash(seed + b * 13 + p * 5 + slot * 3);
                const isHole = hole && hole[0] === b && hole[1] === p && hole[2] === slot;
                if (isHole || k < 0.07) {
                  return null;
                }
                const tone = k > 0.9 ? "#d8d4ca" : mix("#b89c72", "#9a8260", hash(seed + b * 7 + p + slot));
                return <ArchiveBox key={`${p}-${slot}`} x={bx + 55 + slot * 90} y={py} light={light} tone={tone} />;
              }),
            )}
            {SHELF.planks.map((py) => (
              <rect key={py} x={bx} y={py} width={SHELF.bay} height={7} fill={L("#8a9096")} />
            ))}
            <rect x={bx - 4} y={SHELF.top} width={8} height={-SHELF.top} fill={L("#6e7378")} />
          </g>
        );
      })}
      <rect x={x1 - 4} y={SHELF.top} width={8} height={-SHELF.top} fill={L("#6e7378")} />
      <rect x={x0} y={SHELF.top} width={x1 - x0} height={8} fill={L("#7a8086")} />
    </g>
  );
};

/** Screen position of a box slot, for taking a box out of the shelves. */
export const slotAt = (x0: number, bay: number, plank: number, slot: number) => ({
  x: x0 + bay * SHELF.bay + 55 + slot * 90,
  y: SHELF.planks[plank],
});

/** Ceiling fixture with one tube. `on` 0..1. */
export const Fluorescent: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly on: number;
  readonly light?: Light;
}> = ({ x, y, w = 240, on, light = NEUTRAL }) => (
  <g>
    <rect x={x - w / 2} y={y - 16} width={w} height={16} fill={lit("#8a8e92", light)} />
    <rect x={x - w / 2 + 10} y={y} width={w - 20} height={9} rx={4} fill={mix("#3a3e42", "#f4fbff", on)} />
    {on > 0.05 ? <Glow x={x} y={y + 6} r={w * 1.1} color="#e8f4ff" opacity={0.55 * on} /> : null}
  </g>
);

/** Concrete floor and a painted wall for the archive room. */
export const ArchiveRoom: React.FC<{ readonly light?: Light; readonly x0?: number; readonly x1?: number }> = ({
  light = NEUTRAL,
  x0 = -6000,
  x1 = 6000,
}) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={x0} y={-1400} width={x1 - x0} height={1400} fill={L("#5a6064")} />
      <rect x={x0} y={-620} width={x1 - x0} height={16} fill={L("#4a5054")} />
      <rect x={x0} y={0} width={x1 - x0} height={600} fill={L("#4a4e50")} />
    </g>
  );
};

// ---------------------------------------------------------------- table

/** A grey laminate work table, top down. */
export const WorkTable: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-3200} y={-2200} width={6400} height={4400} fill={L("#6a6e70")} />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={-3200} y={-2200 + i * 110 + hash(i) * 30} width={6400} height={2} fill={L("#626668")} opacity={0.5} />
      ))}
    </g>
  );
};

/** A banker's box seen from above, lid `lid` 0 (on) .. 1 (lifted away). */
export const BoxTop: React.FC<{ readonly x: number; readonly y: number; readonly lid: number; readonly light?: Light; readonly files?: number }> = ({
  x,
  y,
  lid,
  light = NEUTRAL,
  files = 9,
}) => {
  const L = (c: string) => lit(c, light);
  const w = 420;
  const h = 320;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 16} width={w} height={h} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#a88e64")} />
      <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} fill={L("#3a2e20")} />
      {Array.from({ length: files }, (_, i) => (
        <rect key={i} x={-w / 2 + 24 + i * ((w - 48) / files)} y={-h / 2 + 18} width={(w - 48) / files - 6} height={h - 36} fill={L(i % 3 === 0 ? "#d8c490" : "#c8ae7a")} />
      ))}
      <g transform={`translate(${lid * 700} ${-lid * 520}) rotate(${lid * 14})`} opacity={1 - lid * 0.2}>
        <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} fill={L("#b8a07a")} />
        <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} fill="none" stroke={L("#98804e")} strokeWidth={6} />
        <rect x={-90} y={-30} width={180} height={60} fill={L("#ece4d2")} />
        <text x={0} y={10} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={700} fontSize={26} letterSpacing={2} fill={L("#2a2218")}>
          GACY
        </text>
      </g>
    </g>
  );
};

/**
 * The card clipped to an unidentified victim's file: no face, only a soft
 * outline. `named` 0..1 warms it once the person has a name again.
 */
export const UnknownCard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly light?: Light;
  readonly named?: number;
  readonly rot?: number;
}> = ({ x, y, w = 120, h = 150, light = NEUTRAL, named = 0, rot = 0 }) => {
  const paper = mix("#d4d2cc", "#f0dcb8", named);
  const outline = mix("#bcbab4", "#e8c890", named);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} fill="#000" opacity={0.28} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={lit(paper, light)} />
      <g fill={lit(outline, light)}>
        <ellipse cx={0} cy={-h * 0.12} rx={w * 0.2} ry={h * 0.2} />
        <path d={`M${-w * 0.38} ${h / 2} Q${-w * 0.36} ${h * 0.14} 0 ${h * 0.12} Q${w * 0.36} ${h * 0.14} ${w * 0.38} ${h / 2} Z`} />
      </g>
      {named > 0 ? <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#ffd89a" opacity={0.16 * named} /> : null}
      {/* paper clip */}
      <rect x={-w * 0.3} y={-h / 2 - 14} width={16} height={40} rx={8} fill="none" stroke={lit("#9aa0a6", light)} strokeWidth={3} />
    </g>
  );
};

/** Letters typed onto a file label, revealed one by one. */
export const Typed: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly k: number;
  readonly size?: number;
  readonly light?: Light;
  readonly anchor?: "start" | "middle";
}> = ({ x, y, text, k, size = 16, light = NEUTRAL, anchor = "middle" }) => {
  const n = Math.round(text.length * Math.max(0, Math.min(1, k)));
  if (n <= 0) {
    return null;
  }
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={TYPE.serif} fontWeight={600} fontSize={size} letterSpacing={size * 0.08} fill={lit("#1e1a14", light)}>
      {/* keep the unrevealed part as invisible text so centred names don't slide */}
      {text.slice(0, n)}
      <tspan fillOpacity={0}>{text.slice(n)}</tspan>
    </text>
  );
};

/**
 * An unidentified victim's file lying on the table: folder, blank card and
 * a label strip that stays empty until a name is typed on it.
 */
export const VictimFile: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly light?: Light;
  readonly rot?: number;
  readonly name?: string;
  readonly typed?: number;
  readonly named?: number;
  readonly opacity?: number;
}> = ({ x, y, light = NEUTRAL, rot = 0, name, typed = 0, named = 0, opacity = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
      <rect x={-112} y={-147} width={240} height={310} rx={4} fill="#000" opacity={0.3} />
      <rect x={-120} y={-155} width={240} height={310} rx={4} fill={L("#c8ae7a")} />
      <path d="M30 -155 L40 -175 L110 -175 L120 -155 Z" fill={L("#c8ae7a")} />
      <text x={75} y={-160} textAnchor="middle" fontFamily={TYPE.serif} fontSize={11} fontWeight={600} letterSpacing={1} fill={L("#3a2e1e")}>
        UNIDENTIFIED
      </text>
      <UnknownCard x={-10} y={-30} light={light} named={named} rot={-2} />
      <rect x={-100} y={88} width={200} height={40} fill={L("#ece6d6")} />
      <rect x={-100} y={88} width={200} height={40} fill="none" stroke={L("#b8ae98")} strokeWidth={2} />
      {name ? <Typed x={0} y={114} text={name} k={typed} size={name.length > 18 ? 12 : 14} light={light} /> : null}
    </g>
  );
};

/** Two rows of four files, the layout the identification table keeps. */
export const FILE_SLOTS = Array.from({ length: 8 }, (_, i) => ({
  x: -405 + (i % 4) * 270,
  y: i < 4 ? -175 : 185,
  rot: (hash(i * 11) - 0.5) * 4,
}));

// ---------------------------------------------------------------- lab

/** Lab wall, bench and cabinets. World scale; the bench top is at y = -180. */
export const LabBench: React.FC<{ readonly light?: Light; readonly t: number }> = ({ light = NEUTRAL, t }) => {
  const L = (c: string) => lit(c, light);
  const blink = noise(t * 2, 3) > 0 ? 1 : 0.3;
  return (
    <g>
      <rect x={-2400} y={-1100} width={4800} height={1100} fill={L("#c8d0d4")} />
      {/* wall cabinets */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={-1800 + i * 300} y={-820} width={290} height={220} fill={L("#e4e8ea")} />
          <rect x={-1800 + i * 300 + 130} y={-640} width={30} height={6} fill={L("#8a9094")} />
        </g>
      ))}
      <rect x={-2400} y={-196} width={4800} height={18} fill={L("#1e2226")} />
      <rect x={-2400} y={-178} width={4800} height={178} fill={L("#d4dade")} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-2400 + i * 400} y={-178} width={4} height={178} fill={L("#aab2b8")} />
      ))}
      {/* sequencer */}
      <g transform="translate(-80 -196)">
        <rect x={-140} y={-230} width={280} height={230} fill={L("#eceeef")} />
        <rect x={-120} y={-200} width={150} height={120} fill={L("#2a3440")} />
        <rect x={-116} y={-196} width={142} height={40} fill={L("#3a4a5a")} opacity={0.6} />
        <rect x={60} y={-200} width={60} height={30} fill={L("#1e2a36")} />
        <circle cx={90} cy={-140} r={6} fill={blink > 0.5 ? "#6ae08a" : "#2a5a3a"} />
        <rect x={-140} y={-30} width={280} height={10} fill={L("#c8ccd0")} />
      </g>
      {/* tube rack */}
      <g transform="translate(-620 -196)">
        <rect x={-100} y={-26} width={200} height={26} fill={L("#e8e4dc")} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={-88 + i * 24} y={-66} width={10} height={46} rx={4} fill={L("#e8eef2")} opacity={0.9} />
            <rect x={-89 + i * 24} y={-72} width={12} height={10} rx={2} fill={L(["#3a7ac8", "#c83a3a", "#3aa86a", "#e8c23a"][i % 4])} />
          </g>
        ))}
      </g>
    </g>
  );
};

/** A pipette (about 20 cm) held in a CloseHand at world scale, drawn in the hand's frame. */
export const Pipette: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g transform="translate(0 22) rotate(-6)">
    <rect x={-3.5} y={-8} width={7} height={26} rx={3} fill={lit("#e8ecee", light)} />
    <rect x={-2.5} y={-15} width={5} height={8} rx={2} fill={lit("#3a7ac8", light)} />
    <path d="M-2 18 L2 18 L0.6 36 L-0.6 36 Z" fill={lit("#f4f6f8", light)} opacity={0.9} />
  </g>
);

/** Where the pipette tip sits in the hand's frame (for aiming it into a tube). */
export const PIPETTE_TIP = 58;

/** Monitors and TVs draw their picture in a virtual canvas this wide. */
export const SCREEN_VW = 640;

/**
 * A flat monitor standing on a bench at world scale (`y` is the bench top).
 * `children` draw into a SCREEN_VW-wide canvas with the screen's aspect.
 */
export const Monitor: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly light?: Light;
  readonly id: string;
  readonly children?: React.ReactNode;
}> = ({ x, y, w = 130, h = 80, light = NEUTRAL, id, children }) => {
  const L = (c: string) => lit(c, light);
  const k = w / SCREEN_VW;
  const sy = -26 - h - 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-18} y={-3} width={36} height={3} fill={L("#2a2e32")} />
      <rect x={-4} y={-26} width={8} height={24} fill={L("#3a3e42")} />
      <g transform={`translate(${-w / 2} ${sy})`}>
        <rect x={-3} y={-3} width={w + 6} height={h + 7} rx={2} fill={L("#1a1c1e")} />
        <defs>
          <clipPath id={`mon-${id}`}>
            <rect x={0} y={0} width={w} height={h} />
          </clipPath>
        </defs>
        <rect x={0} y={0} width={w} height={h} fill="#0e141a" />
        <g clipPath={`url(#mon-${id})`}>
          <g transform={`scale(${k})`}>{children}</g>
        </g>
      </g>
      <Glow x={0} y={sy + h / 2} r={w * 1.3} color="#9ac8ff" opacity={0.16} />
    </g>
  );
};

/** Centre of a Monitor's screen in world units, for framing the camera on it. */
export const monitorCentre = (x: number, y: number, h = 80) => ({ x, y: y - 26 - 4 - h / 2 });

const peaksAt = (seed: number, n: number) =>
  Array.from({ length: n }, (_, i) => ({ c: 0.05 + (i + hash(seed + i)) / n * 0.9, a: 0.25 + hash(seed * 3 + i) * 0.7 }));

/** DNA fragment-analysis traces drawing across the screen. Illustrative. */
export const Electropherogram: React.FC<{ readonly w: number; readonly h: number; readonly progress: number }> = ({ w, h, progress }) => {
  const colors = ["#4a9aff", "#4ad88a", "#f0d04a", "#ff5a5a"];
  const base = h * 0.82;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#0e1822" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={0} y={h * 0.12 + i * h * 0.14} width={w} height={0.8} fill="#2a3a4a" />
      ))}
      <rect x={0} y={0} width={w} height={16} fill="#1a2a3a" />
      <rect x={8} y={5} width={60} height={5} fill="#6a8aaa" />
      <rect x={w - 70} y={5} width={40} height={5} fill="#6a8aaa" />
      {colors.map((c, ci) => {
        const peaks = peaksAt(ci * 17 + 3, 7);
        const pts: string[] = [];
        const steps = 120;
        for (let s = 0; s <= steps * progress; s++) {
          const u = s / steps;
          let v = 0.015 * Math.sin(u * 90 + ci);
          for (const p of peaks) {
            v += p.a * Math.exp(-(((u - p.c) / 0.008) ** 2));
          }
          pts.push(`${(u * w).toFixed(1)},${(base - v * h * 0.62 - ci * 2).toFixed(1)}`);
        }
        return pts.length > 1 ? <polyline key={c} points={pts.join(" ")} fill="none" stroke={c} strokeWidth={1.6} opacity={0.9} /> : null;
      })}
      <rect x={w * progress - 1} y={16} width={2} height={h - 16} fill="#cfe6ff" opacity={progress < 1 ? 0.6 : 0} />
    </g>
  );
};

type TreeNode = { x: number; y: number; gen: number; fem: boolean; parent?: number };

const TREE: TreeNode[] = (() => {
  const nodes: TreeNode[] = [];
  // Four generations, fanning downward, as a genealogist builds them.
  const gens = [2, 4, 7, 10];
  let prevStart = 0;
  gens.forEach((n, g) => {
    const start = nodes.length;
    for (let i = 0; i < n; i++) {
      const parent = g === 0 ? undefined : prevStart + Math.floor((i * gens[g - 1]) / n);
      nodes.push({ x: (i + 0.5) / n, y: 0.16 + g * 0.24, gen: g, fem: hash(g * 31 + i) > 0.5, parent });
    }
    prevStart = start;
  });
  return nodes;
})();

/** Leaves of the tree that light up as matches. */
export const TREE_MATCHES = [TREE.length - 9, TREE.length - 5, TREE.length - 2];

/** A family tree assembling on screen; `progress` 0..1, `match` 0..1 lights three leaves. */
export const FamilyTree: React.FC<{ readonly w: number; readonly h: number; readonly progress: number; readonly match: number }> = ({ w, h, progress, match }) => {
  const shown = TREE.length * progress;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#101a24" />
      <rect x={0} y={0} width={w} height={16} fill="#1a2a3a" />
      <rect x={8} y={5} width={80} height={5} fill="#6a8aaa" />
      <rect x={w - 16} y={4} width={8} height={8} fill="#6a8aaa" />
      {TREE.map((n, i) => {
        const k = Math.max(0, Math.min(1, shown - i));
        if (k <= 0) {
          return null;
        }
        const p = n.parent !== undefined ? TREE[n.parent] : undefined;
        const X = n.x * w;
        const Y = n.y * h;
        const isMatch = TREE_MATCHES.includes(i);
        const col = isMatch ? mix("#8aa8c8", "#ffc870", match) : "#8aa8c8";
        return (
          <g key={i} opacity={k}>
            {p ? <path d={`M${p.x * w} ${p.y * h + 6} V${(p.y * h + Y) / 2} H${X} V${Y - 6}`} stroke="#4a6a8a" strokeWidth={1.2} fill="none" /> : null}
            {n.fem ? <circle cx={X} cy={Y} r={6} fill="none" stroke={col} strokeWidth={1.6} /> : <rect x={X - 6} y={Y - 6} width={12} height={12} fill="none" stroke={col} strokeWidth={1.6} />}
            {isMatch && match > 0 ? <circle cx={X} cy={Y} r={6 + match * 8} fill="#ffc870" opacity={0.22 * match} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/** A plain cork case board with pinned cards, world scale. */
export const CaseBoard: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly light?: Light; readonly children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  light = NEUTRAL,
  children,
}) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} fill={L("#8a8e92")} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#b8966a")} />
      {Array.from({ length: 90 }, (_, i) => (
        <circle key={i} cx={-w / 2 + hash(i) * w} cy={-h / 2 + hash(i + 7) * h} r={1 + hash(i + 3) * 1.6} fill={L(darken("#b8966a", 0.15))} />
      ))}
      {children}
    </g>
  );
};

/** A flat TV, world scale (`y` is its bottom edge); `children` draw into a SCREEN_VW-wide canvas. */
export const FlatTV: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly light?: Light;
  readonly id: string;
  readonly on?: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, w = 220, h = 124, light = NEUTRAL, id, on = 1, children }) => {
  const L = (c: string) => lit(c, light);
  const k = w / SCREEN_VW;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 6} y={-h - 6} width={w + 12} height={h + 12} rx={3} fill={L("#141618")} />
      <defs>
        <clipPath id={`tv-${id}`}>
          <rect x={-w / 2} y={-h} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="#08090a" />
      <g clipPath={`url(#tv-${id})`} opacity={on}>
        <g transform={`translate(${-w / 2} ${-h}) scale(${k})`}>{children}</g>
      </g>
      {on > 0 ? <Glow x={0} y={-h / 2} r={w * 1.2} color="#ffd0a0" opacity={0.2 * on} /> : null}
    </g>
  );
};

/** Lobby poster frame with marquee bulbs; `children` draw into w×h. */
export const PosterFrame: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly light?: Light;
  readonly id: string;
  readonly t: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, w = 200, h = 300, light = NEUTRAL, id, t, children }) => {
  const L = (c: string) => lit(c, light);
  const bulbs = 10;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 22} y={-h - 22} width={w + 44} height={h + 44} fill={L("#3a2a1e")} />
      <rect x={-w / 2 - 12} y={-h - 12} width={w + 24} height={h + 24} fill={L("#8a6a3a")} />
      <defs>
        <clipPath id={`po-${id}`}>
          <rect x={-w / 2} y={-h} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#po-${id})`}>
        <g transform={`translate(${-w / 2} ${-h})`}>{children}</g>
      </g>
      {Array.from({ length: bulbs }, (_, i) => {
        const on = 0.55 + 0.45 * (Math.sin(t * 6 - i * 0.9) > 0 ? 1 : 0);
        const by = -h - 17 + ((i + 0.5) / bulbs) * (h + 34);
        return (
          <g key={i}>
            <circle cx={-w / 2 - 17} cy={by} r={4} fill={mix("#6a4a1a", "#ffe8a0", on)} />
            <circle cx={w / 2 + 17} cy={by} r={4} fill={mix("#6a4a1a", "#ffe8a0", on)} />
          </g>
        );
      })}
      <Glow x={0} y={-h / 2} r={h * 0.9} color="#ffb870" opacity={0.12} />
    </g>
  );
};

/** Five generic horror-clown posters: no titles, no real films. */
export const ClownPoster: React.FC<{ readonly v: number; readonly w: number; readonly h: number; readonly t: number }> = ({ v, w, h, t }) => {
  const title = (
    <g>
      <rect x={w * 0.12} y={h * 0.84} width={w * 0.76} height={h * 0.05} fill="#e8dcc8" opacity={0.85} />
      <rect x={w * 0.3} y={h * 0.915} width={w * 0.4} height={h * 0.018} fill="#e8dcc8" opacity={0.5} />
    </g>
  );
  const face = (cx: number, cy: number, r: number, grin = 1) => (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.15} fill="#ece4d6" />
      <path d={`M${cx - r * 0.62} ${cy - r * 0.35} l${r * 0.4} ${r * 0.14} l${-r * 0.08} ${r * 0.26} Z`} fill="#140a0a" />
      <path d={`M${cx + r * 0.62} ${cy - r * 0.35} l${-r * 0.4} ${r * 0.14} l${r * 0.08} ${r * 0.26} Z`} fill="#140a0a" />
      <circle cx={cx} cy={cy + r * 0.1} r={r * 0.16} fill="#b8141a" />
      <path d={`M${cx - r * 0.6} ${cy + r * 0.38} Q${cx} ${cy + r * (0.38 + 0.5 * grin)} ${cx + r * 0.6} ${cy + r * 0.38} Q${cx} ${cy + r * 0.62} ${cx - r * 0.6} ${cy + r * 0.38} Z`} fill="#6a0a0e" />
    </g>
  );
  switch (v % 5) {
    case 0:
      return (
        <g>
          <rect width={w} height={h} fill="#1a0608" />
          <circle cx={w / 2} cy={h * 0.42} r={w * 0.52} fill="#5a0e12" opacity={0.7} />
          {face(w / 2, h * 0.42, w * 0.3)}
          {title}
        </g>
      );
    case 1:
      return (
        <g>
          <rect width={w} height={h} fill="#0c1016" />
          <rect x={0} y={h * 0.62} width={w} height={h * 0.38} fill="#161a20" />
          <path d={`M${w * 0.5} ${h * 0.34} L${w * 0.5 + noise(t, 3) * 3} ${h * 0.7}`} stroke="#e8e0d0" strokeWidth={1.2} />
          <ellipse cx={w * 0.5} cy={h * 0.27} rx={w * 0.12} ry={w * 0.15} fill="#c81a1e" />
          <rect x={w * 0.46} y={h * 0.7} width={w * 0.08} height={h * 0.12} fill="#e8e0d0" opacity={0.3} />
          {title}
        </g>
      );
    case 2:
      return (
        <g>
          <rect width={w} height={h} fill="#10141a" />
          <rect x={w * 0.25} y={h * 0.2} width={w * 0.5} height={h * 0.6} fill="#e8b860" opacity={0.85} />
          <path d={`M${w * 0.5} ${h * 0.34} a${w * 0.08} ${w * 0.09} 0 1 1 0.1 0 Z`} fill="#10141a" />
          <path d={`M${w * 0.36} ${h * 0.8} Q${w * 0.38} ${h * 0.44} ${w * 0.5} ${h * 0.42} Q${w * 0.62} ${h * 0.44} ${w * 0.64} ${h * 0.8} Z`} fill="#10141a" />
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={i} cx={w * (0.36 + i * 0.07)} cy={h * 0.3} r={w * 0.035} fill="#10141a" />
          ))}
          {title}
        </g>
      );
    case 3:
      return (
        <g>
          <rect width={w} height={h} fill="#e8e0d0" />
          <ellipse cx={w / 2} cy={h * 0.4} rx={w * 0.44} ry={h * 0.2} fill="#f4eee4" />
          <path d={`M${w * 0.16} ${h * 0.4} L${w * 0.84} ${h * 0.4}`} stroke="#2a1a3a" strokeWidth={w * 0.06} opacity={0.9} />
          <circle cx={w / 2} cy={h * 0.4} r={w * 0.14} fill="#1a2a5a" />
          <circle cx={w / 2} cy={h * 0.4} r={w * 0.06} fill="#080808" />
          <path d={`M${w * 0.5} ${h * 0.22} L${w * 0.5} ${h * 0.14} M${w * 0.5} ${h * 0.58} L${w * 0.5} ${h * 0.68}`} stroke="#c81a1e" strokeWidth={w * 0.04} />
          <g transform={`translate(0 ${h * 0.0})`}>
            <rect x={w * 0.12} y={h * 0.84} width={w * 0.76} height={h * 0.05} fill="#2a1a1a" opacity={0.85} />
          </g>
        </g>
      );
    default:
      return (
        <g>
          <rect width={w} height={h} fill="#1a1024" />
          <path d={`M${w * 0.1} ${h * 0.72} L${w * 0.5} ${h * 0.2} L${w * 0.9} ${h * 0.72} Z`} fill="#8a1a2a" />
          {Array.from({ length: 4 }, (_, i) => (
            <path key={i} d={`M${w * 0.5} ${h * 0.2} L${w * (0.1 + i * 0.27)} ${h * 0.72}`} stroke="#e8c23a" strokeWidth={w * 0.03} />
          ))}
          <path d={`M${w * 0.44} ${h * 0.72} Q${w * 0.46} ${h * 0.5} ${w * 0.52} ${h * 0.48} Q${w * 0.6} ${h * 0.5} ${w * 0.62} ${h * 0.72} Z`} fill="#0a0608" />
          <circle cx={w * 0.53} cy={h * 0.44} r={w * 0.06} fill="#0a0608" />
          {title}
        </g>
      );
  }
};
