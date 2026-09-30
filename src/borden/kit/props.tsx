import React from "react";
import { darken, lighten, lit, mix, type Light, NEUTRAL } from "../../gacy/engine/color";
import { hash, noise } from "../../gacy/engine/time";
import { Glow, Pool } from "../../gacy/kit/light";

/**
 * Objects of 1892, at world scale (200 units per metre). Hand props are
 * drawn in a hand's local frame: origin at the palm, +y down the forearm.
 */

/** A small hatchet, the kind found in the cellar. `handle` 0 = head only. */
export const Hatchet: React.FC<{
  readonly light?: Light;
  readonly handle?: number;
  readonly s?: number;
  readonly rust?: number;
}> = ({ light = NEUTRAL, handle = 1, s = 1, rust = 0 }) => {
  const L = (c: string) => lit(c, light);
  const iron = L(mix("#6a6c70", "#6a4a34", rust));
  return (
    <g transform={`scale(${s})`}>
      {handle > 0 ? <path d={`M-4 0 L4 0 L5 ${64 * handle} L-5 ${64 * handle} Z`} fill={L("#8a6a42")} /> : null}
      {handle > 0 && handle < 1 ? <path d={`M-5 ${64 * handle} L5 ${64 * handle} L2 ${64 * handle + 8} L-3 ${64 * handle + 5} Z`} fill={L("#6a4a2a")} /> : null}
      <path d="M-6 -4 L8 -4 L8 12 L-6 12 Z" fill={iron} />
      <path d="M8 -10 L30 -14 Q36 0 30 16 L8 14 Z" fill={iron} />
      <path d="M30 -14 Q36 0 30 16 L26 12 Q30 0 26 -10 Z" fill={L(lighten("#9a9ca0", 0.2))} />
      <path d="M-6 -4 L-16 -2 L-16 8 L-6 12 Z" fill={L(darken("#6a6c70", 0.2))} />
    </g>
  );
};

/** A full-size felling axe, for the rhyme's version of events. */
export const Axe: React.FC<{ readonly light?: Light; readonly s?: number }> = ({ light = NEUTRAL, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`scale(${s})`}>
      <path d="M-7 0 L7 0 L9 180 L-9 180 Z" fill={L("#8a6a42")} />
      <path d="M-10 -8 L12 -8 L12 20 L-10 20 Z" fill={L("#5a5c60")} />
      <path d="M12 -30 L70 -40 Q86 4 70 48 L12 32 Z" fill={L("#6a6c70")} />
      <path d="M70 -40 Q86 4 70 48 L62 42 Q74 4 62 -32 Z" fill={L("#b0b2b6")} />
    </g>
  );
};

/** Apothecary bottle with a label, upright, origin at the base. */
export const Bottle: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly h?: number;
  readonly color?: string;
  readonly label?: boolean;
  readonly skull?: boolean;
  readonly light?: Light;
}> = ({ x, y = 0, h = 60, color = "#3a5a4a", label = true, skull = false, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  const w = h * 0.42;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w / 2} 0 L${w / 2} 0 L${w / 2} ${-h * 0.7} Q${w / 2} ${-h * 0.82} ${w * 0.18} ${-h * 0.86} L${w * 0.18} ${-h} L${-w * 0.18} ${-h} L${-w * 0.18} ${-h * 0.86} Q${-w / 2} ${-h * 0.82} ${-w / 2} ${-h * 0.7} Z`} fill={L(color)} />
      <rect x={-w * 0.2} y={-h - 6} width={w * 0.4} height={8} fill={L("#8a7a5a")} />
      <rect x={-w * 0.38} y={-h * 0.58} width={w * 0.14} height={h * 0.4} fill="#fff" opacity={0.18} />
      {label ? (
        <g>
          <rect x={-w * 0.38} y={-h * 0.56} width={w * 0.76} height={h * 0.32} fill={L("#efe6d0")} />
          {skull ? (
            <g fill={L("#1a1510")}>
              <circle cx={0} cy={-h * 0.45} r={w * 0.12} />
              <rect x={-w * 0.08} y={-h * 0.4} width={w * 0.16} height={h * 0.05} />
              <path d={`M${-w * 0.16} ${-h * 0.3} L${w * 0.16} ${-h * 0.34} M${-w * 0.16} ${-h * 0.34} L${w * 0.16} ${-h * 0.3}`} stroke={L("#1a1510")} strokeWidth={2} />
            </g>
          ) : (
            <g>
              <rect x={-w * 0.28} y={-h * 0.5} width={w * 0.56} height={2.5} fill={L("#5a5048")} />
              <rect x={-w * 0.22} y={-h * 0.43} width={w * 0.44} height={2} fill={L("#8a8078")} />
              <rect x={-w * 0.26} y={-h * 0.37} width={w * 0.52} height={2} fill={L("#8a8078")} />
            </g>
          )}
        </g>
      ) : null}
    </g>
  );
};

/** Cast-iron kitchen range with a fire door; `fire` 0–1 opens it and lights it. */
export const Stove: React.FC<{
  readonly x: number;
  readonly light?: Light;
  readonly fire?: number;
  readonly t?: number;
  readonly facing?: 1 | -1;
}> = ({ x, light = NEUTRAL, fire = 0, t = 0, facing = 1 }) => {
  const L = (c: string) => lit(c, light);
  const flick = 0.8 + noise(t * 14, 3) * 0.2;
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <ellipse cx={0} cy={0} rx={200} ry={12} fill="#000" opacity={0.3} />
      {[-150, 150].map((lx) => (
        <rect key={lx} x={lx - 14} y={-40} width={28} height={40} fill={L("#1e1c1c")} />
      ))}
      <rect x={-190} y={-220} width={380} height={190} rx={8} fill={L("#26242a")} />
      <rect x={-190} y={-236} width={380} height={20} rx={4} fill={L("#3a383e")} />
      <rect x={-200} y={-244} width={400} height={10} fill={L("#1a181c")} />
      {[-120, -30, 60].map((cx) => (
        <circle key={cx} cx={cx} cy={-238} r={26} fill={L("#141214")} />
      ))}
      {/* fire door */}
      <rect x={-60} y={-190} width={120} height={110} rx={6} fill={L("#1a181a")} />
      {fire > 0 ? (
        <g>
          <rect x={-52} y={-182} width={104} height={94} fill={mix("#ff7a2a", "#ffd080", flick * 0.5)} opacity={Math.min(1, fire * 1.2) * flick} />
          <path d={`M-40 -90 Q-30 ${-120 - noise(t * 9, 1) * 20} -18 -96 Q-6 ${-140 - noise(t * 11, 2) * 24} 8 -100 Q24 ${-130 - noise(t * 8, 4) * 20} 40 -92 Z`} fill="#ffb040" opacity={fire * 0.9} />
          <Glow x={0} y={-140} r={520} color="#ff9a40" opacity={0.45 * fire} />
          <Pool x={0} y={0} rx={480} ry={60} color="#ff9a40" opacity={0.3 * fire} />
        </g>
      ) : null}
      <rect x={-60} y={-190} width={120} height={110} rx={6} fill="none" stroke={L("#4a484c")} strokeWidth={6} />
      <rect x={-6} y={-200} width={12} height={130} fill="none" />
      <circle cx={48} cy={-134} r={7} fill={L("#8a8288")} />
      {/* stovepipe */}
      <rect x={100} y={-560} width={44} height={330} fill={L("#26242a")} />
      <rect x={90} y={-570} width={64} height={14} fill={L("#1a181c")} />
      <rect x={100} y={-236} width={44} height={10} fill={L("#3a383e")} />
      <ellipse cx={122} cy={-560} rx={32} ry={8} fill={L("#3a383e")} />
    </g>
  );
};

/** Oil lamp on a surface. Origin at the base. */
export const OilLamp: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly on?: number;
  readonly t?: number;
  readonly light?: Light;
  readonly s?: number;
}> = ({ x, y, on = 1, t = 0, light = NEUTRAL, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  const fl = on * (0.85 + noise(t * 6, 7) * 0.15);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={24} ry={6} fill={L("#8a7a4a")} />
      <path d="M-8 -4 L8 -4 L12 -30 Q20 -50 12 -70 L-12 -70 Q-20 -50 -12 -30 Z" fill={L("#b89a5a")} />
      <path d="M-16 -70 L16 -70 L14 -84 L-14 -84 Z" fill={L("#a08848")} />
      <path d="M-12 -84 Q-24 -120 -10 -170 Q0 -180 10 -170 Q24 -120 12 -84 Z" fill={mix("#c8d8e0", "#ffe6a8", fl)} opacity={0.55} />
      {fl > 0 ? (
        <>
          <path d={`M-5 -92 Q-8 -112 0 ${-128 - noise(t * 10, 2) * 8} Q8 -112 5 -92 Z`} fill="#ffe08a" opacity={fl} />
          <Glow x={0} y={-120} r={420} color="#ffd080" opacity={0.6 * fl} />
        </>
      ) : null}
    </g>
  );
};

/** Victorian sofa with a rolled arm, on the floor. Andrew's sofa. */
export const Sofa: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly color?: string;
  readonly light?: Light;
  readonly facing?: 1 | -1;
}> = ({ x, w = 480, color = "#6a3a34", light = NEUTRAL, facing = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <ellipse cx={0} cy={0} rx={w * 0.56} ry={12} fill="#000" opacity={0.3} />
      <path d={`M${-w / 2} -30 L${-w / 2} -230 Q${-w / 2 + 40} -280 ${-w / 2 + 90} -240 L${w / 2 - 80} -160 Q${w / 2 + 10} -170 ${w / 2} -120 L${w / 2} -30 Z`} fill={L(darken(color, 0.15))} />
      <rect x={-w / 2 + 10} y={-150} width={w - 20} height={70} rx={20} fill={L(color)} />
      <rect x={-w / 2 + 20} y={-176} width={w * 0.44} height={40} rx={14} fill={L(lighten(color, 0.06))} />
      <rect x={w * 0.02} y={-172} width={w * 0.44} height={40} rx={14} fill={L(lighten(color, 0.06))} />
      <path d={`M${-w / 2 - 20} -240 Q${-w / 2 - 40} -200 ${-w / 2 - 10} -140 L${-w / 2 + 30} -140 L${-w / 2 + 30} -240 Z`} fill={L(color)} />
      <path d={`M${-w / 2} -80 L${w / 2} -80 L${w / 2} -44 Q0 -30 ${-w / 2} -44 Z`} fill={L(darken(color, 0.28))} />
      {[-w / 2 + 30, w / 2 - 40].map((lx) => (
        <path key={lx} d={`M${lx} -44 Q${lx + 6} -20 ${lx} 0 L${lx + 14} 0 Q${lx + 16} -20 ${lx + 14} -44 Z`} fill={L("#2a1c14")} />
      ))}
    </g>
  );
};

export const Armchair: React.FC<{ readonly x: number; readonly color?: string; readonly light?: Light; readonly facing?: 1 | -1 }> = ({ x, color = "#4a4a3a", light = NEUTRAL, facing = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <ellipse cx={0} cy={0} rx={130} ry={10} fill="#000" opacity={0.3} />
      <path d="M-110 -30 L-110 -250 Q-100 -290 -60 -270 L-30 -160 L100 -160 Q120 -160 120 -120 L120 -30 Z" fill={L(darken(color, 0.12))} />
      <rect x={-96} y={-140} width={210} height={60} rx={16} fill={L(color)} />
      <rect x={-96} y={-80} width={210} height={30} fill={L(darken(color, 0.25))} />
      {[-84, 96].map((lx) => (
        <rect key={lx} x={lx} y={-50} width={14} height={50} fill={L("#2a1c14")} />
      ))}
    </g>
  );
};

/** Iron bedstead, side view; `sheet` covers it. Origin at the near foot. */
export const Bed: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly light?: Light;
  readonly facing?: 1 | -1;
  readonly made?: number;
  readonly quilt?: string;
}> = ({ x, w = 520, light = NEUTRAL, facing = 1, made = 1, quilt = "#7a6a58" }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <ellipse cx={w / 2} cy={0} rx={w * 0.56} ry={12} fill="#000" opacity={0.3} />
      {/* frame */}
      <rect x={0} y={-130} width={w} height={26} fill={L("#3a2c22")} />
      <rect x={6} y={-104} width={14} height={104} fill={L("#26201a")} />
      <rect x={w - 20} y={-104} width={14} height={104} fill={L("#26201a")} />
      {/* headboard (far end) and footboard */}
      <rect x={w - 24} y={-330} width={22} height={230} rx={8} fill={L("#3a3438")} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={w - 90 + i * 22} y={-310} width={8} height={210} fill={L("#4a4448")} />
      ))}
      <rect x={w - 100} y={-330} width={100} height={12} rx={6} fill={L("#3a3438")} />
      <rect x={0} y={-230} width={18} height={130} rx={8} fill={L("#3a3438")} />
      <rect x={0} y={-236} width={70} height={12} rx={6} fill={L("#3a3438")} />
      {/* mattress and covers */}
      <rect x={10} y={-160} width={w - 30} height={34} rx={8} fill={L("#e2d8c8")} />
      <path d={`M${20 + (1 - made) * 80} -164 L${w - 30} -164 L${w - 30} -128 L${20 + (1 - made) * 80} ${-128 + (1 - made) * 20} Z`} fill={L(quilt)} />
      <rect x={w - 150} y={-186} width={110} height={30} rx={12} fill={L("#efe8dc")} />
    </g>
  );
};

/** Chest of drawers with a mirror. */
export const Dresser: React.FC<{ readonly x: number; readonly light?: Light; readonly mirror?: boolean; readonly w?: number }> = ({ x, light = NEUTRAL, mirror = true, w = 260 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={w * 0.55} ry={10} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-200} width={w} height={200} fill={L("#4a3020")} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={-w / 2 + 12} y={-190 + i * 62} width={w - 24} height={52} fill={L("#5a3a28")} />
          <circle cx={0} cy={-164 + i * 62} r={5} fill={L("#b89a5a")} />
        </g>
      ))}
      <rect x={-w / 2 - 6} y={-208} width={w + 12} height={10} fill={L("#3a2418")} />
      {mirror ? (
        <g>
          <rect x={-w * 0.32} y={-420} width={w * 0.64} height={210} rx={w * 0.3} fill={L("#3a2418")} />
          <rect x={-w * 0.28} y={-410} width={w * 0.56} height={190} rx={w * 0.26} fill={L("#8a9aa0")} />
          <rect x={-w * 0.2} y={-400} width={w * 0.12} height={140} fill="#fff" opacity={0.15} />
        </g>
      ) : null}
    </g>
  );
};

export const Wardrobe: React.FC<{ readonly x: number; readonly light?: Light; readonly open?: number }> = ({ x, light = NEUTRAL, open = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={150} ry={10} fill="#000" opacity={0.3} />
      <rect x={-130} y={-440} width={260} height={440} fill={L("#3e2a1c")} />
      <rect x={-140} y={-452} width={280} height={14} fill={L("#2e1e14")} />
      <rect x={-120} y={-420} width={110 * (1 - open)} height={400} fill={L("#5a3e2a")} />
      <rect x={10} y={-420} width={110} height={400} fill={L("#5a3e2a")} />
      {open > 0 ? <rect x={-120} y={-420} width={110 * open} height={400} fill={L("#14100c")} /> : null}
      <circle cx={-16} cy={-220} r={5} fill={L("#b89a5a")} />
      <circle cx={16} cy={-220} r={5} fill={L("#b89a5a")} />
    </g>
  );
};

export const Washstand: React.FC<{ readonly x: number; readonly light?: Light }> = ({ x, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-80} y={-170} width={160} height={14} fill={L("#5a3a28")} />
      <rect x={-70} y={-156} width={10} height={156} fill={L("#4a3020")} />
      <rect x={60} y={-156} width={10} height={156} fill={L("#4a3020")} />
      <ellipse cx={0} cy={-176} rx={54} ry={12} fill={L("#e8e4dc")} />
      <path d="M-30 -186 Q-30 -250 -10 -256 L10 -256 Q30 -250 30 -186 Z" fill={L("#e8e4dc")} />
    </g>
  );
};

/** Dining table with a cloth; `laid` adds plates. */
export const DiningTable: React.FC<{ readonly x: number; readonly w?: number; readonly light?: Light; readonly laid?: boolean; readonly cloth?: string }> = ({ x, w = 560, light = NEUTRAL, laid = false, cloth = "#e8e2d4" }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={w * 0.58} ry={14} fill="#000" opacity={0.3} />
      <rect x={-w / 2 + 30} y={-150} width={22} height={150} fill={L("#3a2a1e")} />
      <rect x={w / 2 - 52} y={-150} width={22} height={150} fill={L("#3a2a1e")} />
      <path d={`M${-w / 2 - 10} -160 L${w / 2 + 10} -160 L${w / 2 + 16} -100 L${-w / 2 - 16} -100 Z`} fill={L(cloth)} />
      <path d={`M${-w / 2 - 16} -100 L${w / 2 + 16} -100 L${w / 2 + 16} -92 L${-w / 2 - 16} -92 Z`} fill={L(darken(cloth, 0.2))} />
      {laid
        ? [-w * 0.3, 0, w * 0.3].map((px) => (
            <g key={px}>
              <ellipse cx={px} cy={-158} rx={44} ry={8} fill={L("#f4f0e8")} />
              <ellipse cx={px} cy={-159} rx={30} ry={5} fill={L("#e4e0d4")} />
            </g>
          ))
        : null}
    </g>
  );
};

export const SideChair: React.FC<{ readonly x: number; readonly facing?: 1 | -1; readonly light?: Light; readonly color?: string }> = ({ x, facing = 1, light = NEUTRAL, color = "#4a3020" }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <rect x={-46} y={-210} width={12} height={210} fill={L(darken(color, 0.15))} />
      <rect x={-46} y={-210} width={14} height={110} rx={5} fill={L(color)} />
      <rect x={-40} y={-196} width={10} height={80} fill={L(color)} opacity={0.6} />
      <rect x={-46} y={-100} width={98} height={12} fill={L(color)} />
      <rect x={40} y={-92} width={10} height={92} fill={L(darken(color, 0.2))} />
    </g>
  );
};

/** Small round parlour table. */
export const ParlourTable: React.FC<{ readonly x: number; readonly light?: Light; readonly cloth?: string }> = ({ x, light = NEUTRAL, cloth = "#5a2a2a" }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={0} rx={90} ry={8} fill="#000" opacity={0.3} />
      <rect x={-8} y={-150} width={16} height={150} fill={L("#3a2a1e")} />
      <path d="M-70 0 L-8 -30 L8 -30 L70 0 Z" fill={L("#3a2a1e")} />
      <path d="M-110 -160 L110 -160 L118 -120 L-118 -120 Z" fill={L(cloth)} />
      <ellipse cx={0} cy={-160} rx={110} ry={10} fill={L(lighten(cloth, 0.1))} />
    </g>
  );
};

/** Curtain over a window opening: two panels and a pelmet. */
export const Curtains: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly color?: string; readonly light?: Light }> = ({ x, y, w, h, color = "#5a3a3a", light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <path d={`M${x - 50} ${y - 34} L${x + w * 0.24} ${y - 34} Q${x + w * 0.12} ${y + h * 0.5} ${x + w * 0.2} ${y + h + 60} L${x - 50} ${y + h + 60} Z`} fill={L(color)} />
      <path d={`M${x + w + 50} ${y - 34} L${x + w * 0.76} ${y - 34} Q${x + w * 0.88} ${y + h * 0.5} ${x + w * 0.8} ${y + h + 60} L${x + w + 50} ${y + h + 60} Z`} fill={L(color)} />
      <path d={`M${x - 60} ${y - 40} L${x + w + 60} ${y - 40} L${x + w + 60} ${y + 20} Q${x + w / 2} ${y + 60} ${x - 60} ${y + 20} Z`} fill={L(darken(color, 0.2))} />
    </g>
  );
};

/** Framed portrait on a wall or mantel; the sitter is drawn by the caller. */
export const Portrait: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly h?: number; readonly light?: Light; readonly children?: React.ReactNode; readonly oval?: boolean; readonly id: string }> = ({ x, y, w = 140, h = 180, light = NEUTRAL, children, oval = false, id }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`pt-${id}`}>{oval ? <ellipse cx={0} cy={0} rx={w / 2 - 12} ry={h / 2 - 12} /> : <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} />}</clipPath>
      </defs>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={oval ? w / 2 : 4} fill={L("#7a5a2a")} />
      <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h - 12} rx={oval ? w / 2 : 3} fill={L("#c8a860")} />
      {oval ? <ellipse cx={0} cy={0} rx={w / 2 - 12} ry={h / 2 - 12} fill={L("#d8ccb0")} /> : <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} fill={L("#d8ccb0")} />}
      <g clipPath={`url(#pt-${id})`}>{children}</g>
    </g>
  );
};

/** Mantel clock, and a wall clock face, both with real hands. */
export const ClockFace: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly minutes: number; readonly light?: Light; readonly face?: string }> = ({ x, y, r, minutes, light = NEUTRAL, face = "#f2ede0" }) => {
  const L = (c: string) => lit(c, light);
  const m = ((minutes % 60) / 60) * 360;
  const h = (((minutes / 60) % 12) / 12) * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={L(face)} />
      <circle r={r} fill="none" stroke={L("#2a2018")} strokeWidth={r * 0.06} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-r * 0.03} y={-r * 0.9} width={r * 0.06} height={r * 0.14} fill={L("#2a2018")} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-r * 0.04} y={-r * 0.55} width={r * 0.08} height={r * 0.62} fill={L("#1a1510")} transform={`rotate(${h})`} />
      <rect x={-r * 0.03} y={-r * 0.82} width={r * 0.06} height={r * 0.9} fill={L("#1a1510")} transform={`rotate(${m})`} />
      <circle r={r * 0.06} fill={L("#1a1510")} />
    </g>
  );
};

export const MantelClock: React.FC<{ readonly x: number; readonly y: number; readonly minutes: number; readonly light?: Light; readonly s?: number }> = ({ x, y, minutes, light = NEUTRAL, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-70 0 L70 0 L70 -60 Q70 -120 0 -120 Q-70 -120 -70 -60 Z" fill={L("#2a1a12")} />
      <rect x={-78} y={-6} width={156} height={10} fill={L("#1a100a")} />
      <ClockFace x={0} y={-58} r={40} minutes={minutes} light={light} />
    </g>
  );
};

/** Wooden bucket and a brush, for window washing. */
export const Pail: React.FC<{ readonly x: number; readonly light?: Light }> = ({ x, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-40 0 L40 0 L48 -90 L-48 -90 Z" fill={L("#7a6a4a")} />
      <rect x={-48} y={-90} width={96} height={8} fill={L("#5a5a5a")} />
      <rect x={-44} y={-40} width={88} height={6} fill={L("#5a5a5a")} />
      <ellipse cx={0} cy={-88} rx={44} ry={8} fill={L("#8aa0b0")} />
      <path d="M-48 -90 Q0 -170 48 -90" stroke={L("#3a3a3a")} strokeWidth={6} fill="none" />
    </g>
  );
};

/** Ironing board with a flatiron. */
export const IroningBoard: React.FC<{ readonly x: number; readonly light?: Light; readonly ironX?: number }> = ({ x, light = NEUTRAL, ironX = 60 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-200 -180 L200 -180 L240 -172 L-240 -172 Z" fill={L("#e4dcc8")} />
      <path d="M-160 -172 L-60 0 M-140 -172 L-40 0 M160 -172 L60 0 M140 -172 L40 0" stroke={L("#5a4a3a")} strokeWidth={10} />
      <path d={`M${ironX - 40} -182 L${ironX + 40} -182 L${ironX + 30} -210 L${ionX(ironX)} -210 Z`} fill={L("#26242a")} />
      <path d={`M${ironX - 30} -210 Q${ironX} -240 ${ironX + 30} -210`} stroke={L("#5a4a3a")} strokeWidth={10} fill="none" />
      <rect x={-60} y={-186} width={110} height={6} fill={L("#f4f0e8")} />
    </g>
  );
};
const ionX = (x: number) => x - 30;

/** Fishing sinkers and a coil of line on a bench. */
export const Sinkers: React.FC<{ readonly x: number; readonly y: number; readonly light?: Light }> = ({ x, y, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={40} cy={-2} rx={40} ry={16} fill="none" stroke={L("#c8b890")} strokeWidth={3} />
      <ellipse cx={44} cy={-4} rx={34} ry={12} fill="none" stroke={L("#c8b890")} strokeWidth={2} />
      {[-30, -12, 6].map((sx, i) => (
        <path key={sx} d={`M${sx} 0 L${sx + 8} -6 L${sx + 8} -18 L${sx + 4} -22 L${sx} -18 Z`} fill={L(i === 1 ? "#6a6a70" : "#5a5a60")} />
      ))}
    </g>
  );
};

/** Hymn book / small bible, hand prop. */
export const HymnBook: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g>
    <rect x={-14} y={-4} width={28} height={40} rx={2} fill={lit("#2a1a1a", light)} />
    <rect x={-11} y={-2} width={22} height={36} fill={lit("#e8e0d0", light)} />
    <rect x={-9} y={16} width={18} height={2} fill={lit("#b8a860", light)} />
  </g>
);

export const DoctorBag: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g>
    <path d="M-2 0 L2 0 L2 10 L-2 10 Z" fill={lit("#2a1a10", light)} />
    <path d="M-30 10 L30 10 L34 60 L-34 60 Z" fill={lit("#2e1e14", light)} />
    <rect x={-34} y={8} width={68} height={8} fill={lit("#4a3a2a", light)} />
    <circle cx={0} cy={16} r={4} fill={lit("#c8a860", light)} />
  </g>
);

/** Handbag or a parcel, hand prop. */
export const Parcel: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g>
    <rect x={-20} y={8} width={40} height={30} fill={lit("#a88a5a", light)} />
    <rect x={-20} y={20} width={40} height={4} fill={lit("#5a3a2a", light)} />
    <rect x={-2} y={8} width={4} height={30} fill={lit("#5a3a2a", light)} />
  </g>
);

/** A folded letter / note, hand prop or on a table. */
export const Note: React.FC<{ readonly light?: Light; readonly s?: number }> = ({ light = NEUTRAL, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-22} y={4} width={44} height={30} fill={lit("#f0e8d4", light)} />
    <path d="M-22 4 L0 20 L22 4" stroke={lit("#c8b890", light)} strokeWidth={2} fill="none" />
  </g>
);

/** A dress on a hanger (or in the hand): a small version of a skirted torso. */
export const HeldDress: React.FC<{ readonly color?: string; readonly light?: Light; readonly stain?: number; readonly s?: number }> = ({ color = "#8fa0b8", light = NEUTRAL, stain = 0, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`scale(${s})`}>
      <path d="M-18 6 L18 6 L24 60 L40 150 L-40 150 L-24 60 Z" fill={L(color)} />
      <path d="M-18 6 L-6 6 L-10 60 L-24 60 Z" fill={L(darken(color, 0.15))} />
      {stain > 0 ? <ellipse cx={14} cy={96} rx={8} ry={12} fill={L("#8a6a3a")} opacity={stain} /> : null}
    </g>
  );
};

/** A coin stack on a table. */
export const Coins: React.FC<{ readonly x: number; readonly y: number; readonly n: number; readonly light?: Light }> = ({ x, y, n, light = NEUTRAL }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <ellipse cx={0} cy={-i * 5} rx={16} ry={5} fill={lit("#b89a4a", light)} />
        <ellipse cx={0} cy={-i * 5 - 2} rx={16} ry={5} fill={lit("#d8b860", light)} />
      </g>
    ))}
  </g>
);

/** A joint of meat on a platter, and the flies that go with August. */
export const MuttonPlatter: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly flies?: number; readonly light?: Light }> = ({ x, y, t, flies = 0, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={90} ry={22} fill={L("#e8e4dc")} />
      <ellipse cx={0} cy={-2} rx={70} ry={14} fill={L("#d8d0c4")} />
      <path d="M-50 -6 Q-40 -50 10 -46 Q56 -40 50 -8 Q30 8 0 6 Q-30 8 -50 -6 Z" fill={L("#7a4a3a")} />
      <path d="M-30 -30 Q0 -40 30 -28" stroke={L("#a87a5a")} strokeWidth={5} fill="none" />
      {flies > 0
        ? Array.from({ length: 4 }, (_, i) => (
            <circle key={i} cx={noise(t * 3 + i * 7, i) * 60} cy={-50 + noise(t * 2.5 + i * 3, i + 9) * 30} r={2.2} fill="#1a1510" opacity={flies} />
          ))
        : null}
    </g>
  );
};

export const Teacup: React.FC<{ readonly x: number; readonly y: number; readonly light?: Light; readonly tremble?: number; readonly t?: number }> = ({ x, y, light = NEUTRAL, tremble = 0, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const dx = tremble > 0 ? noise(t * 30, 5) * 3 * tremble : 0;
  return (
    <g transform={`translate(${x + dx} ${y})`}>
      <ellipse cx={0} cy={0} rx={30} ry={7} fill={L("#f2ede0")} />
      <path d="M-20 -2 L20 -2 L16 -30 L-16 -30 Z" fill={L("#f2ede0")} />
      <path d="M20 -22 Q34 -20 22 -8" stroke={L("#f2ede0")} strokeWidth={5} fill="none" />
      <ellipse cx={0} cy={-30} rx={16} ry={4} fill={L("#6a4a2a")} />
    </g>
  );
};

export const Gavel: React.FC<{ readonly light?: Light }> = ({ light = NEUTRAL }) => (
  <g>
    <rect x={-3} y={0} width={6} height={60} fill={lit("#6a4a2a", light)} />
    <rect x={-22} y={-14} width={44} height={22} rx={6} fill={lit("#4a2e1a", light)} />
  </g>
);

/** Skipping rope between two children's hands, as a sagging arc. */
export const Rope: React.FC<{ readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number; readonly phase: number; readonly light?: Light }> = ({ x0, y0, x1, y1, phase, light = NEUTRAL }) => {
  const sag = Math.sin(phase * Math.PI * 2) * 260;
  return <path d={`M${x0} ${y0} Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag} ${x1} ${y1}`} stroke={lit("#c8b090", light)} strokeWidth={6} fill="none" strokeLinecap="round" />;
};

/** Chalk tally marks on a pavement, `n` strokes (fractional = the last being drawn). */
export const Tally: React.FC<{ readonly x: number; readonly y: number; readonly n: number; readonly s?: number; readonly color?: string }> = ({ x, y, n, s = 1, color = "#f4f0e6" }) => {
  const groups = Math.ceil(n / 5);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.9}>
      {Array.from({ length: groups }, (_, g) => {
        const base = g * 5;
        return Array.from({ length: 5 }, (_, i) => {
          const k = Math.max(0, Math.min(1, n - (base + i)));
          if (k <= 0) {
            return null;
          }
          const gx = g * 70;
          if (i < 4) {
            return <path key={`${g}-${i}`} d={`M${gx + i * 12} 0 L${gx + i * 12 + 2 * k} ${34 * k}`} />;
          }
          return <path key={`${g}-${i}`} d={`M${gx - 6} 26 L${gx - 6 + 50 * k} ${8 + 4 * k}`} />;
        });
      })}
    </g>
  );
};

/** Gas street lamp. */
export const GasLamp: React.FC<{ readonly x: number; readonly on?: number; readonly light?: Light; readonly t?: number }> = ({ x, on = 0, light = NEUTRAL, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const g = on * (0.85 + noise(t * 4, 2) * 0.15);
  return (
    <g transform={`translate(${x} 0)`}>
      {g > 0 ? <Pool x={0} y={0} rx={420} ry={60} color="#f3c98a" opacity={0.3 * g} /> : null}
      <path d="M-30 0 L30 0 L20 -40 L-20 -40 Z" fill={L("#2a2c30")} />
      <rect x={-8} y={-620} width={16} height={580} fill={L("#2a2c30")} />
      <path d="M-30 -620 L30 -620 L22 -700 L-22 -700 Z" fill={mix(L("#c8c0a0"), "#ffe6a8", g)} opacity={0.85} />
      <path d="M-34 -700 L34 -700 L0 -730 Z" fill={L("#1e2024")} />
      {g > 0 ? <Glow x={0} y={-660} r={300} color="#ffd890" opacity={0.6 * g} /> : null}
    </g>
  );
};

/** A picket or iron fence panel. */
export const IronFence: React.FC<{ readonly x0: number; readonly x1: number; readonly h?: number; readonly light?: Light }> = ({ x0, x1, h = 220, light = NEUTRAL }) => {
  const n = Math.floor((x1 - x0) / 40);
  const c = lit("#26262a", light);
  return (
    <g>
      <rect x={x0} y={-h * 0.85} width={x1 - x0} height={8} fill={c} />
      <rect x={x0} y={-h * 0.2} width={x1 - x0} height={8} fill={c} />
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={x0 + i * 40} y={-h} width={5} height={h} fill={c} />
          <path d={`M${x0 + i * 40 - 4} ${-h} L${x0 + i * 40 + 2.5} ${-h - 16} L${x0 + i * 40 + 9} ${-h} Z`} fill={c} />
        </g>
      ))}
    </g>
  );
};

/** Elm tree: a tall vase shape, for the streets of a New England town. */
export const Elm: React.FC<{ readonly x: number; readonly h?: number; readonly light?: Light; readonly t?: number; readonly seed?: number; readonly tone?: string }> = ({ x, h = 2200, light = NEUTRAL, t = 0, seed = 0, tone = "#4a6a3a" }) => {
  const L = (c: string) => lit(c, light);
  const sway = noise(t * 0.3 + seed, seed) * 1.4;
  const w = h * 0.03;
  return (
    <g transform={`translate(${x} 0)`}>
      <path d={`M${-w} 0 L${-w * 0.7} ${-h * 0.5} L${w * 0.7} ${-h * 0.5} L${w} 0 Z`} fill={L("#3a2e24")} />
      <path d={`M${-w * 0.7} ${-h * 0.5} Q${-h * 0.14} ${-h * 0.6} ${-h * 0.22} ${-h * 0.8} M${w * 0.7} ${-h * 0.5} Q${h * 0.14} ${-h * 0.6} ${h * 0.22} ${-h * 0.8}`} stroke={L("#3a2e24")} strokeWidth={w * 0.8} fill="none" />
      <g transform={`rotate(${sway} 0 ${-h * 0.5})`}>
        {[
          [0, -0.82, 0.3, 0.2],
          [-0.2, -0.7, 0.2, 0.14],
          [0.22, -0.72, 0.2, 0.14],
          [-0.1, -0.94, 0.18, 0.1],
          [0.1, -0.9, 0.16, 0.1],
        ].map(([bx, by, rx, ry], i) => (
          <ellipse key={i} cx={bx * h} cy={by * h} rx={rx * h} ry={ry * h} fill={L(i % 2 ? darken(tone, 0.2) : tone)} />
        ))}
        <ellipse cx={0.06 * h} cy={-0.92 * h} rx={0.12 * h} ry={0.06 * h} fill={L(mix(tone, "#a8b870", 0.2))} opacity={0.6} />
      </g>
    </g>
  );
};

/** A bench of sinkers, saws and tools in a barn loft. */
export const Workbench: React.FC<{ readonly x: number; readonly light?: Light; readonly children?: React.ReactNode }> = ({ x, light = NEUTRAL, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-260} y={-190} width={520} height={22} fill={L("#6a5236")} />
      <rect x={-240} y={-168} width={18} height={168} fill={L("#4a3826")} />
      <rect x={222} y={-168} width={18} height={168} fill={L("#4a3826")} />
      <rect x={-240} y={-90} width={480} height={10} fill={L("#4a3826")} />
      <g transform="translate(0 -190)">{children}</g>
    </g>
  );
};

/** Hay bales / loose hay, for the barn loft. */
export const Hay: React.FC<{ readonly x: number; readonly w?: number; readonly light?: Light; readonly seed?: number }> = ({ x, w = 600, light = NEUTRAL, seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d={`M${-w / 2} 0 Q${-w * 0.3} -160 0 -120 Q${w * 0.3} -200 ${w / 2} 0 Z`} fill={L("#b89a52")} />
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d={`M${-w / 2 + hash(seed + i) * w} ${-hash(seed + i * 3) * 120} l${8 - hash(i) * 16} ${-14}`} stroke={L("#d8b86a")} strokeWidth={2} />
      ))}
    </g>
  );
};

/** A magic lantern on a table, throwing a beam. */
export const MagicLantern: React.FC<{ readonly x: number; readonly y: number; readonly on?: number; readonly light?: Light; readonly t?: number }> = ({ x, y, on = 1, light = NEUTRAL, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  const g = on * (0.9 + noise(t * 8, 3) * 0.1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-70} y={-110} width={110} height={110} rx={6} fill={L("#3a2a22")} />
      <rect x={-40} y={-150} width={30} height={40} fill={L("#2a2220")} />
      <rect x={40} y={-80} width={60} height={44} rx={10} fill={L("#8a7a4a")} />
      <circle cx={100} cy={-58} r={22} fill={mix(L("#88a0b0"), "#fff4d8", g)} />
      {g > 0 ? <Glow x={100} y={-58} r={200} color="#fff0c8" opacity={0.6 * g} /> : null}
    </g>
  );
};

/** A gravestone. */
export const Headstone: React.FC<{ readonly x: number; readonly h?: number; readonly w?: number; readonly light?: Light; readonly lean?: number; readonly round?: boolean }> = ({ x, h = 200, w = 120, light = NEUTRAL, lean = 0, round = true }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0) rotate(${lean})`}>
      <path d={round ? `M${-w / 2} 0 L${-w / 2} ${-h + w / 2} Q0 ${-h - w * 0.15} ${w / 2} ${-h + w / 2} L${w / 2} 0 Z` : `M${-w / 2} 0 L${-w / 2} ${-h} L${w / 2} ${-h} L${w / 2} 0 Z`} fill={L("#9a9a92")} />
      <path d={`M${-w / 2 + 8} 0 L${-w / 2 + 8} ${-h * 0.5} L${w / 2 - 8} ${-h * 0.5}`} fill="none" stroke={L("#7a7a72")} strokeWidth={3} opacity={0.5} />
      <rect x={-w / 2 - 10} y={-10} width={w + 20} height={12} fill={L("#7a7a72")} />
    </g>
  );
};
