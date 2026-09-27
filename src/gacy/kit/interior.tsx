import React from "react";
import { darken, lighten, lit, mix, type Light, NEUTRAL } from "../engine/color";
import { hash, noise } from "../engine/time";
import { Glow, Pool, Wash } from "./light";

/**
 * Interior pieces in elevation, world scale (200 units per metre). A room
 * is a back wall with a floor band in front of it; furniture stands on
 * y = 0 like people do.
 */

export const Room: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly h?: number;
  readonly paper?: string;
  readonly floor?: string;
  readonly light?: Light;
  readonly stripes?: boolean;
  readonly floorDepth?: number;
  readonly tile?: boolean;
}> = ({
  x0,
  x1,
  h = 520,
  paper = "#b8a07a",
  floor = "#6a4a32",
  light = NEUTRAL,
  stripes = true,
  floorDepth = 700,
  tile = false,
}) => {
  const L = (c: string) => lit(c, light);
  const w = x1 - x0;
  return (
    <g>
      {/* the ceiling above the cornice, so a frame taller than the wall never shows the void above the set */}
      <rect x={x0} y={-h - 1240} width={w} height={1200} fill={L(darken(paper, 0.6))} />
      <rect x={x0} y={-h} width={w} height={h} fill={L(paper)} />
      {stripes
        ? Array.from({ length: Math.ceil(w / 70) }, (_, i) => (
            <rect key={i} x={x0 + i * 70 + 30} y={-h} width={4} height={h} fill={L(darken(paper, 0.07))} opacity={0.7} />
          ))
        : null}
      <rect x={x0} y={-h - 40} width={w} height={40} fill={L(darken(paper, 0.35))} />
      <rect x={x0} y={-34} width={w} height={34} fill={L(darken(paper, 0.28))} />
      <rect x={x0} y={0} width={w} height={floorDepth} fill={L(floor)} />
      {tile
        ? Array.from({ length: Math.ceil(w / 120) }, (_, i) => (
            <rect key={i} x={x0 + i * 120} y={0} width={3} height={floorDepth} fill={L(darken(floor, 0.15))} />
          ))
        : Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={x0} y={18 + i * i * 9} width={w} height={2 + i * 0.4} fill={L(darken(floor, 0.18))} opacity={0.7} />
          ))}
      <Wash x={x0} y={-h} w={w} h={h * 0.5} from="top" color="#000" opacity={0.28} />
      <Wash x={x0} y={0} w={w} h={floorDepth} from="bottom" color="#000" opacity={0.25} />
    </g>
  );
};

export const WindowInt: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly outside?: string;
  readonly light?: Light;
  readonly frame?: string;
  readonly curtains?: string;
  readonly blinds?: boolean;
  readonly snow?: boolean;
  readonly t?: number;
  readonly view?: React.ReactNode;
}> = ({
  x,
  y = -470,
  w = 360,
  h = 280,
  outside = "#16202e",
  light = NEUTRAL,
  frame = "#e4dccc",
  curtains,
  blinds = false,
  snow = false,
  t = 0,
  view,
}) => {
  const L = (c: string) => lit(c, light);
  const id = `wi${Math.round(x)}${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} fill={L(frame)} />
      <rect x={x} y={y} width={w} height={h} fill={outside} />
      <g clipPath={`url(#${id})`}>
        {view}
        {snow
          ? Array.from({ length: 30 }, (_, i) => (
              <circle key={i} cx={x + ((hash(i) * w + t * 10) % w)} cy={y + ((hash(i + 5) * h + t * (30 + hash(i) * 30)) % h)} r={2 + hash(i + 2) * 2} fill="#e8eef4" opacity={0.7} />
            ))
          : null}
        {blinds
          ? Array.from({ length: Math.floor(h / 22) }, (_, i) => (
              <rect key={i} x={x} y={y + i * 22} width={w} height={12} fill={L("#d8d0bc")} opacity={0.85} />
            ))
          : null}
      </g>
      <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke={L(frame)} strokeWidth={10} />
      {curtains ? (
        <g fill={L(curtains)}>
          <path d={`M${x - 40} ${y - 30} L${x + w * 0.22} ${y - 30} Q${x + w * 0.12} ${y + h * 0.5} ${x + w * 0.2} ${y + h + 40} L${x - 40} ${y + h + 40} Z`} />
          <path d={`M${x + w + 40} ${y - 30} L${x + w * 0.78} ${y - 30} Q${x + w * 0.88} ${y + h * 0.5} ${x + w * 0.8} ${y + h + 40} L${x + w + 40} ${y + h + 40} Z`} />
        </g>
      ) : null}
      <rect x={x - 30} y={y + h + 16} width={w + 60} height={16} fill={L(darken(frame, 0.12))} />
    </g>
  );
};

export const Door: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly h?: number;
  readonly color?: string;
  readonly frame?: string;
  readonly open?: number;
  readonly light?: Light;
  readonly beyond?: string;
  readonly glass?: boolean;
}> = ({ x, w = 190, h = 420, color = "#5a3e2c", frame = "#d8ccb8", open = 0, light = NEUTRAL, beyond = "#0e0c0a", glass = false }) => {
  const L = (c: string) => lit(c, light);
  const leaf = w * Math.cos(open * 1.35);
  return (
    <g>
      <rect x={x - 14} y={-h - 14} width={w + 28} height={h + 14} fill={L(frame)} />
      <rect x={x} y={-h} width={w} height={h} fill={beyond} />
      <g>
        <rect x={x} y={-h} width={leaf} height={h} fill={L(color)} />
        {glass ? (
          <rect x={x + leaf * 0.12} y={-h + 30} width={leaf * 0.76} height={h * 0.5} fill={L("#2a3440")} opacity={0.85} />
        ) : (
          <>
            <rect x={x + leaf * 0.14} y={-h + 34} width={leaf * 0.72} height={h * 0.36} fill={L(darken(color, 0.16))} />
            <rect x={x + leaf * 0.14} y={-h * 0.5} width={leaf * 0.72} height={h * 0.4} fill={L(darken(color, 0.16))} />
          </>
        )}
        <circle cx={x + leaf * 0.86} cy={-h * 0.48} r={7} fill={L("#c8a860")} />
      </g>
    </g>
  );
};

export const FloorLamp: React.FC<{
  readonly x: number;
  readonly on?: number;
  readonly light?: Light;
  readonly h?: number;
}> = ({ x, on = 1, light = NEUTRAL, h = 360 }) => (
  <g>
    <rect x={x - 4} y={-h} width={8} height={h} fill={lit("#3a3028", light)} />
    <ellipse cx={x} cy={-3} rx={40} ry={8} fill={lit("#2a241e", light)} />
    <path d={`M${x - 46} ${-h} L${x + 46} ${-h} L${x + 28} ${-h - 70} L${x - 28} ${-h - 70} Z`} fill={on > 0.3 ? mix(lit("#e8d4a8", light), "#ffe8b8", on) : lit("#b8a888", light)} />
    {on > 0 ? (
      <>
        <Glow x={x} y={-h - 20} r={420} color="#ffd9a0" opacity={0.5 * on} />
        <Pool x={x} y={0} rx={420} ry={50} color="#ffd8a0" opacity={0.35 * on} />
      </>
    ) : null}
  </g>
);

export const TableLamp: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly on?: number;
  readonly light?: Light;
}> = ({ x, y, on = 1, light = NEUTRAL }) => (
  <g>
    <path d={`M${x - 16} ${y} Q${x - 22} ${y - 40} ${x} ${y - 60} Q${x + 22} ${y - 40} ${x + 16} ${y} Z`} fill={lit("#8a6a4a", light)} />
    <path d={`M${x - 44} ${y - 60} L${x + 44} ${y - 60} L${x + 30} ${y - 118} L${x - 30} ${y - 118} Z`} fill={on > 0.3 ? mix(lit("#e8d4a8", light), "#ffeac0", on) : lit("#b8a888", light)} />
    {on > 0 ? <Glow x={x} y={y - 80} r={360} color="#ffd9a0" opacity={0.55 * on} /> : null}
  </g>
);

export const Couch: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly color?: string;
  readonly light?: Light;
}> = ({ x, w = 560, color = "#6e5a44", light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={w * 0.55} ry={14} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-190} width={w} height={110} rx={24} fill={L(darken(color, 0.1))} />
      <rect x={-w / 2 - 20} y={-110} width={w + 40} height={80} rx={20} fill={L(color)} />
      <rect x={-w / 2} y={-130} width={w / 2 - 6} height={40} rx={14} fill={L(lighten(color, 0.05))} />
      <rect x={6} y={-130} width={w / 2 - 6} height={40} rx={14} fill={L(lighten(color, 0.05))} />
      <rect x={-w / 2 - 40} y={-160} width={50} height={130} rx={18} fill={L(darken(color, 0.05))} />
      <rect x={w / 2 - 10} y={-160} width={50} height={130} rx={18} fill={L(darken(color, 0.05))} />
      <rect x={-w / 2} y={-30} width={10} height={30} fill={L("#2a2018")} />
      <rect x={w / 2 - 10} y={-30} width={10} height={30} fill={L("#2a2018")} />
    </g>
  );
};

export const Armchair: React.FC<{
  readonly x: number;
  readonly color?: string;
  readonly light?: Light;
  readonly facing?: 1 | -1;
}> = ({ x, color = "#7a4a3a", light = NEUTRAL, facing = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <ellipse cx={0} cy={0} rx={140} ry={12} fill="#000" opacity={0.3} />
      <rect x={-120} y={-230} width={70} height={200} rx={24} fill={L(darken(color, 0.12))} />
      <rect x={-110} y={-110} width={230} height={80} rx={18} fill={L(color)} />
      <rect x={-80} y={-150} width={200} height={50} rx={16} fill={L(lighten(color, 0.05))} />
      <rect x={90} y={-150} width={40} height={120} rx={14} fill={L(darken(color, 0.05))} />
      <rect x={-100} y={-30} width={10} height={30} fill={L("#2a2018")} />
      <rect x={100} y={-30} width={10} height={30} fill={L("#2a2018")} />
    </g>
  );
};

export const Table: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly h?: number;
  readonly color?: string;
  readonly light?: Light;
  readonly cloth?: string;
}> = ({ x, w = 320, h = 150, color = "#6a4a32", light = NEUTRAL, cloth }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={w * 0.55} ry={12} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h} width={w} height={16} fill={L(color)} />
      {cloth ? <path d={`M${-w / 2 - 6} ${-h - 2} L${w / 2 + 6} ${-h - 2} L${w / 2 + 12} ${-h + 50} L${-w / 2 - 12} ${-h + 50} Z`} fill={L(cloth)} /> : null}
      <rect x={-w / 2 + 14} y={-h + 16} width={12} height={h - 16} fill={L(darken(color, 0.25))} />
      <rect x={w / 2 - 26} y={-h + 16} width={12} height={h - 16} fill={L(darken(color, 0.25))} />
    </g>
  );
};

export const Chair: React.FC<{
  readonly x: number;
  readonly facing?: 1 | -1;
  readonly color?: string;
  readonly light?: Light;
  readonly folding?: boolean;
}> = ({ x, facing = 1, color = "#5a4030", light = NEUTRAL, folding = false }) => {
  const L = (c: string) => lit(c, light);
  const c = folding ? "#8a8c90" : color;
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <rect x={-44} y={-200} width={12} height={200} fill={L(darken(c, 0.15))} />
      <rect x={-44} y={-200} width={16} height={90} rx={4} fill={L(c)} />
      <rect x={-44} y={-96} width={96} height={12} fill={L(c)} />
      <rect x={40} y={-90} width={10} height={90} fill={L(darken(c, 0.2))} />
    </g>
  );
};

/** A CRT television. `screen` is drawn inside the tube, clipped. */
export const TVSet: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly light?: Light;
  readonly screen?: React.ReactNode;
  readonly on?: number;
  readonly t?: number;
  readonly s?: number;
}> = ({ x, y = 0, light = NEUTRAL, screen, on = 1, t = 0, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  const id = `tv${Math.round(x)}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-190} y={-150} width={380} height={150} fill={L("#4a3424")} />
      <rect x={-170} y={0} width={14} height={60} fill={L("#2a1e16")} />
      <rect x={156} y={0} width={14} height={60} fill={L("#2a1e16")} />
      <rect x={-150} y={-440} width={300} height={290} rx={20} fill={L("#2e2a26")} />
      <defs>
        <clipPath id={id}>
          <rect x={-120} y={-414} width={220} height={220} rx={34} />
        </clipPath>
      </defs>
      <rect x={-120} y={-414} width={220} height={220} rx={34} fill="#0b0d10" />
      <g clipPath={`url(#${id})`} opacity={on}>
        {screen}
        {Array.from({ length: 44 }, (_, i) => (
          <rect key={i} x={-120} y={-414 + i * 5} width={220} height={2} fill="#000" opacity={0.25} />
        ))}
        <rect x={-120} y={-414} width={220} height={220} fill="#9ab4d8" opacity={0.08 + noise(t * 9, 2) * 0.04} />
      </g>
      <path d="M-110 -404 Q-60 -412 -20 -408" stroke="#fff" strokeWidth={6} opacity={0.08} fill="none" />
      <circle cx={126} cy={-380} r={10} fill={L("#6a645c")} />
      <circle cx={126} cy={-346} r={10} fill={L("#6a645c")} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={116} y={-310 + i * 14} width={20} height={4} fill={L("#1e1a16")} />
      ))}
      <path d="M-40 -440 L-90 -560 M40 -440 L90 -560" stroke={L("#8a8a8a")} strokeWidth={4} />
      {on > 0 ? <Glow x={-10} y={-300} r={520} color="#8aa6d8" opacity={0.35 * on} /> : null}
    </g>
  );
};

export const Bookshelf: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly h?: number;
  readonly light?: Light;
  readonly seed?: number;
  readonly items?: "books" | "boxes" | "products";
}> = ({ x, w = 360, h = 460, light = NEUTRAL, seed = 0, items = "books" }) => {
  const L = (c: string) => lit(c, light);
  const rows = Math.floor(h / 110);
  const pal = items === "products" ? ["#c8483a", "#e8e0c8", "#3a6a9a", "#e8b83a", "#6a9a6a", "#f0ece0"] : items === "boxes" ? ["#b89a6a", "#a88a5a", "#c8aa7a"] : ["#6a3a2a", "#3a4a5a", "#7a6a3a", "#2a3a2a", "#8a5a3a", "#4a3a4a"];
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={L("#4a3426")} />
      {Array.from({ length: rows }, (_, r) => {
        const y = -h + 20 + r * 110;
        let cx = -w / 2 + 16;
        const out: React.ReactNode[] = [];
        let i = 0;
        while (cx < w / 2 - 30) {
          const bw = items === "boxes" ? 90 : items === "products" ? 34 + hash(seed + r * 13 + i) * 20 : 16 + hash(seed + r * 11 + i) * 18;
          const bh = items === "boxes" ? 70 : 50 + hash(seed + i * 7 + r) * 34;
          out.push(<rect key={i} x={cx} y={y + 86 - bh} width={bw - 3} height={bh} fill={L(pal[Math.floor(hash(seed + i * 3 + r * 5) * pal.length)])} />);
          cx += bw;
          i += 1;
        }
        return (
          <g key={r}>
            <rect x={-w / 2 + 8} y={y} width={w - 16} height={90} fill={L("#2a1e16")} />
            {out}
            <rect x={-w / 2} y={y + 86} width={w} height={14} fill={L("#5a4230")} />
          </g>
        );
      })}
    </g>
  );
};

/** A framed picture or poster on a wall; `art` is drawn inside, 0,0 at top-left. */
export const Frame: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly art?: React.ReactNode;
  readonly frame?: string;
  readonly light?: Light;
  readonly mat?: string;
}> = ({ x, y, w, h, art, frame = "#2a2018", light = NEUTRAL, mat }) => {
  const id = `fr${Math.round(x)}${Math.round(y)}`;
  return (
    <g>
      <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill={lit(frame, light)} />
      {mat ? <rect x={x} y={y} width={w} height={h} fill={lit(mat, light)} /> : null}
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${x} ${y})`}>{art}</g>
      </g>
    </g>
  );
};
