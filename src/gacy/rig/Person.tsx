import React from "react";
import { darken, lighten, lit, mix, type Light, NEUTRAL } from "../engine/color";
import { clamp, lerp } from "../engine/time";
import { STAND, type Pose } from "./pose";

/**
 * The character rig.
 *
 * Adult proportions (about 6.5 heads; 360 units = 1.8 m at scale 1),
 * three-quarter, front and back views, forward kinematics computed in
 * JavaScript so props can be put in a hand and hands can be aimed with IK.
 *
 * Deliberately flat: one base tone and one shadow tone per part, no
 * outlines, light applied by colour math (`light` prop). That is what keeps
 * a room full of people cheap to render and consistent with the sets.
 */

export type Build = "slim" | "average" | "stocky" | "heavy" | "child";

export type HairStyle =
  | "gacy"
  | "mop"
  | "short"
  | "buzz"
  | "long"
  | "bob"
  | "receding"
  | "curly"
  | "afro"
  | "ponytail"
  | "cap"
  | "none";

export type Look = {
  readonly build?: Build;
  readonly fem?: boolean;
  readonly skin?: string;
  readonly hair?: HairStyle;
  readonly hairColor?: string;
  /** Upper-body garment. */
  readonly top?: string;
  /** Second tone: jacket lapels, smock trim, cardigan front. */
  readonly topTrim?: string;
  readonly shirt?: string;
  readonly tie?: string;
  readonly pants?: string;
  readonly shoes?: string;
  readonly sleeves?: "long" | "short";
  /** A coat or smock that hangs below the belt. Length in units. */
  readonly coat?: number;
  /** A skirt or dress from the waist to about the knee. */
  readonly skirt?: string;
  readonly jacket?: boolean;
  readonly badge?: boolean;
  readonly belt?: string;
  readonly glasses?: boolean;
  readonly mustache?: boolean;
  readonly jowls?: number;
  readonly cap?: string;
  readonly clown?: boolean;
  readonly age?: number;
};

export type View = "3q" | "front" | "back";

type Dims = {
  hip: number;
  torso: number;
  neck: number;
  thigh: number;
  shin: number;
  upper: number;
  fore: number;
  sh: number;
  waist: number;
  hipW: number;
  belly: number;
  arm: number;
  leg: number;
  neckW: number;
  head: number;
};

const dimsFor = (build: Build, fem: boolean): Dims => {
  const base: Dims = {
    hip: 178,
    torso: 116,
    neck: 14,
    thigh: 88,
    shin: 82,
    upper: 64,
    fore: 58,
    sh: 38,
    waist: 26,
    hipW: 27,
    belly: 2,
    arm: 10,
    leg: 13,
    neckW: 9,
    head: 1,
  };
  if (build === "slim") {
    Object.assign(base, { sh: 34, waist: 22, hipW: 23, belly: 0, arm: 8.5, leg: 11.5, neckW: 8 });
  } else if (build === "stocky") {
    Object.assign(base, { sh: 43, waist: 37, hipW: 34, belly: 14, arm: 11.5, leg: 15, neckW: 13, head: 1.06, neck: 6 });
  } else if (build === "heavy") {
    Object.assign(base, { sh: 45, waist: 42, hipW: 38, belly: 20, arm: 12.5, leg: 16, neckW: 14, head: 1.08, neck: 6 });
  }
  if (build === "child") {
    Object.assign(base, {
      hip: 112,
      torso: 78,
      neck: 8,
      thigh: 56,
      shin: 50,
      upper: 40,
      fore: 36,
      sh: 25,
      waist: 20,
      hipW: 20,
      belly: 2,
      arm: 7,
      leg: 9,
      neckW: 6,
      head: 1.18,
    });
  }
  if (fem) {
    Object.assign(base, {
      sh: base.sh - 5,
      waist: base.waist - 3,
      hipW: base.hipW + 3,
      hip: 172,
      torso: 110,
      arm: base.arm - 1,
      leg: base.leg - 0.5,
      neckW: base.neckW - 1.5,
      head: base.head * 0.96,
    });
  }
  return base;
};

type P = { x: number; y: number };
const rad = (a: number) => (a * Math.PI) / 180;
const down = (a: number): P => ({ x: Math.sin(rad(a)), y: Math.cos(rad(a)) });
const up = (a: number): P => ({ x: Math.sin(rad(a)), y: -Math.cos(rad(a)) });
const fwd = (a: number): P => ({ x: Math.cos(rad(a)), y: Math.sin(rad(a)) });
const add = (a: P, b: P, k = 1): P => ({ x: a.x + b.x * k, y: a.y + b.y * k });

/** A tapered capsule between two points. */
export const capsule = (a: P, b: P, ra: number, rb: number): string => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.max(0.001, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const f = (v: number) => v.toFixed(1);
  return [
    `M${f(a.x + nx * ra)} ${f(a.y + ny * ra)}`,
    `L${f(b.x + nx * rb)} ${f(b.y + ny * rb)}`,
    `A${f(rb)} ${f(rb)} 0 0 0 ${f(b.x - nx * rb)} ${f(b.y - ny * rb)}`,
    `L${f(a.x - nx * ra)} ${f(a.y - ny * ra)}`,
    `A${f(ra)} ${f(ra)} 0 0 0 ${f(a.x + nx * ra)} ${f(a.y + ny * ra)}`,
    "Z",
  ].join(" ");
};

export type Joints = {
  hip: P;
  torsoAngle: number;
  neckBase: P;
  headC: P;
  headAngle: number;
  near: { shoulder: P; elbow: P; wrist: P; hand: P; foreAngle: number };
  far: { shoulder: P; elbow: P; wrist: P; hand: P; foreAngle: number };
  nearLeg: { hip: P; knee: P; ankle: P; toe: P; footAngle: number };
  farLeg: { hip: P; knee: P; ankle: P; toe: P; footAngle: number };
  dims: Dims;
};

/** Forward kinematics. Local space: facing right, feet at the origin, scale 1. */
export const solve = (
  p: Pose,
  look: Look = {},
  view: View = "3q",
  grounded = true,
): Joints => {
  const d = dimsFor(look.build ?? "average", look.fem ?? false);
  const T = p.pelvis + p.lean;
  let hip: P = { x: p.hipX, y: -(d.hip - p.hipDrop) };
  const spread = view === "3q" ? 0.42 : 0.55;
  const legOf = (thigh: number, knee: number, side: number) => {
    const h = add(hip, fwd(p.pelvis), side * d.hipW * spread);
    const tw = thigh - p.pelvis;
    const k = add(h, down(tw), d.thigh);
    const sw = tw - knee;
    const a = add(k, down(sw), d.shin);
    const footAngle = sw + 90;
    const toe = add(a, down(footAngle), 24);
    return { hip: h, knee: k, ankle: a, toe, footAngle };
  };
  let nearLeg = legOf(p.nearThigh, p.nearKnee, view === "3q" ? -1 : -1);
  let farLeg = legOf(p.farThigh, p.farKnee, 1);
  if (grounded) {
    const low = Math.max(
      nearLeg.ankle.y + 8,
      farLeg.ankle.y + 8,
      nearLeg.knee.y + d.leg,
      farLeg.knee.y + d.leg,
      nearLeg.toe.y + 3,
      farLeg.toe.y + 3,
    );
    hip = { x: hip.x, y: hip.y - low };
    nearLeg = legOf(p.nearThigh, p.nearKnee, -1);
    farLeg = legOf(p.farThigh, p.farKnee, 1);
  }
  const neckBase = add(hip, up(T), d.torso);
  const shoulderC = add(hip, up(T), d.torso - 9);
  const shOff = view === "3q" ? [-0.5, 0.42] : [-0.9, 0.9];
  const armOf = (upper: number, fore: number, off: number) => {
    const s = add(shoulderC, fwd(T), d.sh * off);
    const uw = upper - T;
    const e = add(s, down(uw), d.upper);
    const fw = uw + fore;
    const w = add(e, down(fw), d.fore);
    const h = add(w, down(fw), 7);
    return { shoulder: s, elbow: e, wrist: w, hand: h, foreAngle: fw };
  };
  const near = armOf(p.nearUpper, p.nearFore, shOff[0]);
  const far = armOf(p.farUpper, p.farFore, shOff[1]);
  const headAngle = T + p.neck;
  const headC = add(neckBase, up(headAngle), d.neck + 24 * d.head);
  return {
    hip,
    torsoAngle: T,
    neckBase,
    headC,
    headAngle,
    near,
    far,
    nearLeg,
    farLeg,
    dims: d,
  };
};

// ------------------------------------------------------------------ parts

type Paint = (c: string) => string;

const Hand: React.FC<{
  at: P;
  angle: number;
  r: number;
  fill: string;
  shade: string;
  point?: boolean;
}> = ({ at, angle, r, fill, shade, point }) => (
  <g transform={`translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${(-angle).toFixed(1)})`}>
    <ellipse cx={0} cy={2} rx={r * 0.95} ry={r * 1.2} fill={fill} />
    <ellipse cx={r * 0.7} cy={-1} rx={r * 0.35} ry={r * 0.6} fill={shade} />
    {point ? (
      <rect x={-r * 0.25} y={r} width={r * 0.5} height={r * 1.5} rx={r * 0.25} fill={fill} />
    ) : null}
  </g>
);

const Shoe: React.FC<{ at: P; angle: number; fill: string; w: number }> = ({
  at,
  angle,
  fill,
  w,
}) => {
  // Shoe points along the foot; drawn so it reads from the side.
  const a = rad(angle);
  const dx = Math.sin(a);
  const dy = Math.cos(a);
  const toe = { x: at.x + dx * 26, y: at.y + dy * 26 };
  const heel = { x: at.x - dx * 7, y: at.y - dy * 7 };
  return <path d={capsule(heel, toe, w * 0.62, w * 0.5)} fill={fill} />;
};

type HairPart = "behind" | "cap" | "fringe";

/**
 * Hair in three passes so it wraps the skull: `behind` hangs behind the
 * head and neck, `cap` sits on the skull (under the ear), `fringe` falls
 * over the forehead. Head-local space: skull centre near (0, -6), radius
 * about 24, face toward +x in three-quarter view.
 */
const Hair: React.FC<{
  style: HairStyle;
  color: string;
  part: HairPart;
  view: View;
}> = ({ style, color, part, view }) => {
  if (style === "none" || style === "cap") {
    return null;
  }
  const sh = darken(color, 0.28);
  if (view === "back") {
    if (part === "fringe") {
      return null;
    }
    if (part === "behind") {
      if (style === "long") {
        return <path d="M-26 -4 L-28 44 C-10 52 10 52 28 44 L26 -4 Z" fill={color} />;
      }
      if (style === "bob") {
        return <path d="M-27 -4 L-28 24 C-10 30 10 30 28 24 L27 -4 Z" fill={color} />;
      }
      if (style === "afro") {
        return <ellipse cx={0} cy={-10} rx={36} ry={33} fill={color} />;
      }
      if (style === "ponytail") {
        return <path d="M-6 6 C-12 20 -8 40 0 50 C8 40 12 20 6 6 Z" fill={color} />;
      }
      return null;
    }
    if (style === "receding") {
      return <path d="M-26 6 C-27 -8 27 -8 26 6 C24 18 -24 18 -26 6 Z" fill={color} />;
    }
    if (style === "buzz") {
      return <path d="M-25 8 C-28 -32 28 -32 25 8 C18 16 -18 16 -25 8 Z" fill={color} opacity={0.75} />;
    }
    return <path d="M-26 10 C-30 -34 30 -34 26 10 C20 20 -20 20 -26 10 Z" fill={color} />;
  }
  if (view === "front") {
    if (part === "behind") {
      if (style === "long") {
        return <path d="M-27 -8 C-32 20 -30 40 -24 52 L24 52 C30 40 32 20 27 -8 Z" fill={color} />;
      }
      if (style === "bob") {
        return <path d="M-28 -8 C-31 10 -30 20 -26 28 L26 28 C30 20 31 10 28 -8 Z" fill={color} />;
      }
      if (style === "afro") {
        return <ellipse cx={0} cy={-12} rx={37} ry={32} fill={color} />;
      }
      return null;
    }
    if (part === "cap") {
      if (style === "receding") {
        return (
          <g fill={color}>
            <path d="M-25 6 C-26 -6 -22 -14 -17 -17 L-17 4 Z" />
            <path d="M25 6 C26 -6 22 -14 17 -17 L17 4 Z" />
          </g>
        );
      }
      const drop = style === "mop" || style === "bob" || style === "long" ? 10 : style === "buzz" ? -6 : 0;
      return (
        <path
          d={`M-25 ${4 + drop} C-28 -34 28 -34 25 ${4 + drop} C22 -6 14 -12 0 -13 C-14 -12 -22 -6 -25 ${4 + drop} Z`}
          fill={color}
          opacity={style === "buzz" ? 0.75 : 1}
        />
      );
    }
    if (style === "mop" || style === "bob" || style === "long") {
      return <path d="M-22 -10 C-14 -24 16 -24 22 -10 C14 -14 6 -12 0 -8 C-8 -12 -16 -14 -22 -10 Z" fill={color} />;
    }
    if (style === "gacy") {
      return <path d="M-20 -16 C-8 -26 14 -26 22 -14 C12 -18 0 -18 -10 -14 C-14 -13 -18 -13 -20 -16 Z" fill={color} />;
    }
    return null;
  }
  // three-quarter view
  if (part === "behind") {
    switch (style) {
      case "long":
        return <path d="M-24 -10 C-30 10 -28 36 -20 52 C-8 56 6 54 12 48 C4 40 -2 26 -4 10 Z" fill={color} />;
      case "bob":
        return <path d="M-25 -8 C-29 8 -28 20 -22 28 C-12 32 -2 30 4 26 C-2 18 -6 8 -6 0 Z" fill={color} />;
      case "afro":
        return <ellipse cx={-6} cy={-12} rx={36} ry={32} fill={color} />;
      case "ponytail":
        return <path d="M-22 -6 C-40 0 -40 30 -30 44 C-26 30 -22 14 -16 4 Z" fill={color} />;
      default:
        return null;
    }
  }
  if (part === "cap") {
    switch (style) {
      case "gacy":
        return (
          <g>
            <path d="M18 -19 C10 -35 -20 -36 -25 -12 C-27 -1 -24 7 -19 11 L-13 8 C-15 -1 -12 -9 -5 -13 C3 -17 11 -15 19 -13 C21 -15 20 -17 18 -19 Z" fill={color} />
            <path d="M16 -18 C6 -26 -10 -26 -20 -14" stroke={sh} strokeWidth={1.6} fill="none" opacity={0.7} />
            <path d="M12 -14 C4 -20 -8 -20 -16 -8" stroke={sh} strokeWidth={1.2} fill="none" opacity={0.5} />
          </g>
        );
      case "short":
        return (
          <path d="M17 -20 C8 -35 -20 -35 -25 -12 C-26 -2 -24 6 -19 10 L-14 7 C-15 -2 -12 -10 -4 -14 C4 -17 12 -16 19 -14 C20 -17 19 -19 17 -20 Z" fill={color} />
        );
      case "mop":
        return (
          <path d="M22 -14 C16 -38 -24 -38 -28 -8 C-30 8 -26 20 -18 25 L-12 16 C-14 4 -10 -6 -2 -10 C8 -12 16 -10 24 -8 C25 -10 24 -12 22 -14 Z" fill={color} />
        );
      case "buzz":
        return (
          <path d="M16 -21 C8 -33 -20 -33 -24 -12 C-25 -3 -23 4 -19 8 L-14 5 C-14 -4 -10 -12 -2 -15 C6 -18 12 -18 17 -17 Z" fill={color} opacity={0.72} />
        );
      case "receding":
        return (
          <path d="M-8 -26 C-20 -24 -26 -12 -25 -2 C-25 5 -22 9 -18 11 L-13 7 C-14 -3 -12 -12 -6 -18 Z" fill={color} />
        );
      case "curly":
        return (
          <g fill={color}>
            <path d="M18 -18 C10 -36 -22 -36 -26 -10 C-27 2 -24 10 -18 14 L-12 8 C-14 -2 -10 -10 -2 -14 C6 -16 14 -14 20 -12 Z" />
            {[
              [12, -24],
              [2, -30],
              [-10, -30],
              [-20, -22],
              [-25, -10],
              [-23, 2],
            ].map(([cx, cy]) => (
              <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={7.5} />
            ))}
          </g>
        );
      case "afro":
        return (
          <path d="M18 -18 C12 -30 -18 -32 -24 -12 C-26 -2 -22 6 -18 10 L-12 6 C-14 -4 -10 -12 -2 -15 C6 -17 14 -15 20 -13 Z" fill={color} />
        );
      case "long":
      case "bob":
      case "ponytail":
        return (
          <path d="M20 -16 C14 -36 -22 -38 -27 -10 C-28 2 -26 10 -22 14 L-14 10 C-15 -2 -10 -10 -2 -13 C8 -15 16 -12 23 -10 C24 -12 22 -14 20 -16 Z" fill={color} />
        );
      default:
        return null;
    }
  }
  // fringe
  switch (style) {
    case "mop":
      return <path d="M24 -10 C18 0 6 -2 -2 -6 C4 -16 18 -18 24 -10 Z" fill={color} />;
    case "long":
    case "bob":
      return <path d="M23 -10 C16 -2 6 -4 -2 -8 C6 -18 18 -18 23 -10 Z" fill={color} />;
    case "gacy":
      return <path d="M19 -14 C14 -8 8 -9 2 -11 C8 -17 14 -18 19 -14 Z" fill={color} />;
    default:
      return null;
  }
};

const Face: React.FC<{
  p: Pose;
  look: Look;
  view: View;
  skin: string;
  paint: Paint;
}> = ({ p, look, view, skin, paint }) => {
  if (view === "back") {
    return null;
  }
  const k = view === "front" ? -1 : clamp(p.turn, -1, 1);
  const u = (k + 1) / 2;
  const cx = lerp(0, 13, u);
  const eyeGap = lerp(9.5, 6.5, u);
  const nearEye = { x: cx - eyeGap * (1 - u * 0.6), y: -3 };
  const farEye = { x: cx + eyeGap * lerp(1, 0.55, u), y: -3 };
  const showFar = u < 0.85;
  const lids = clamp(p.lids, 0.05, 1);
  const ink = paint("#241a14");
  const brow = paint(darken(look.hairColor ?? "#2a2018", 0.1));
  const shade = paint(darken(skin, 0.14));
  const gz = p.gaze * 1.3;
  const browY = -11 - p.brow * 2.5;
  const browTilt = p.brow < 0 ? p.brow * -2.5 : 0;
  const mouthX = lerp(0, 12, u);
  const mouthY = 15;
  const mw = lerp(7, 5.5, u);
  const clown = look.clown ?? false;
  return (
    <g>
      {clown ? (
        <path d="M-22 -14 C-18 -28 20 -30 24 -10 C28 8 24 26 8 30 C-6 32 -18 26 -22 12 Z" fill={paint("#f4f0e6")} />
      ) : null}
      {/* nose */}
      {clown ? (
        <circle cx={lerp(0, 20, u)} cy={5} r={5.5} fill={paint("#c9302c")} />
      ) : (
        <path
          d={
            u > 0.55
              ? `M${cx + 8} -4 Q${cx + 15} 6 ${cx + 10} 9 Q${cx + 6} 10 ${cx + 4} 8 Z`
              : `M${cx - 2} 1 Q${cx + 1} 7 ${cx + 4} 7 Q${cx + 1} 9 ${cx - 2} 8 Z`
          }
          fill={shade}
        />
      )}
      {/* eyes */}
      {clown ? (
        <g fill={paint("#2d4f86")} opacity={0.85}>
          <path d={`M${nearEye.x} ${-3 - 10} L${nearEye.x + 3} ${-3} L${nearEye.x} ${-3 + 7} L${nearEye.x - 3} ${-3} Z`} />
          {showFar ? (
            <path d={`M${farEye.x} ${-3 - 10} L${farEye.x + 3} ${-3} L${farEye.x} ${-3 + 7} L${farEye.x - 3} ${-3} Z`} />
          ) : null}
        </g>
      ) : null}
      <ellipse cx={nearEye.x + gz} cy={nearEye.y} rx={2.4} ry={2.9 * lids} fill={ink} />
      {showFar ? (
        <ellipse
          cx={farEye.x + gz}
          cy={farEye.y}
          rx={2.2 * lerp(1, 0.75, u)}
          ry={2.9 * lids}
          fill={ink}
        />
      ) : null}
      {look.glasses ? (
        <g fill="none" stroke={paint("#2a2622")} strokeWidth={1.4}>
          <rect x={nearEye.x - 6} y={-8} width={12} height={9} rx={2.5} />
          {showFar ? <rect x={farEye.x - 5} y={-8} width={10} height={9} rx={2.5} /> : null}
          <path d={`M${nearEye.x + 6} -5 L${farEye.x - 5} -5`} />
        </g>
      ) : null}
      {/* brows */}
      {!clown ? (
        <g stroke={brow} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <path d={`M${nearEye.x - 4} ${browY + browTilt} L${nearEye.x + 3.5} ${browY - browTilt * 0.6}`} />
          {showFar ? (
            <path d={`M${farEye.x - 3.2} ${browY - browTilt * 0.6} L${farEye.x + 3.2} ${browY + browTilt}`} />
          ) : null}
        </g>
      ) : null}
      {look.mustache ? (
        <path
          d={`M${mouthX - 7} ${mouthY - 3} Q${mouthX} ${mouthY - 8} ${mouthX + 7} ${mouthY - 3} Q${mouthX} ${mouthY - 1} ${mouthX - 7} ${mouthY - 3} Z`}
          fill={brow}
        />
      ) : null}
      {/* mouth */}
      {clown ? (
        <path
          d={`M${mouthX - 10} ${mouthY - 2} Q${mouthX} ${mouthY + 10} ${mouthX + 10} ${mouthY - 2} Q${mouthX} ${mouthY + 4} ${mouthX - 10} ${mouthY - 2} Z`}
          fill={paint("#c9302c")}
        />
      ) : p.mouth > 0.08 ? (
        <ellipse
          cx={mouthX}
          cy={mouthY + 1}
          rx={mw * 0.7}
          ry={1.2 + p.mouth * 3.6}
          fill={paint("#4a2622")}
        />
      ) : (
        <path
          d={`M${mouthX - mw} ${mouthY - p.smile * 1.5} Q${mouthX} ${mouthY + p.smile * 4} ${mouthX + mw} ${mouthY - p.smile * 1.5}`}
          stroke={paint(darken(skin, 0.42))}
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {(look.age ?? 30) > 50 ? (
        <path
          d={`M${nearEye.x - 5} 6 Q${nearEye.x - 1} 9 ${nearEye.x + 2} 7`}
          stroke={shade}
          strokeWidth={1.2}
          fill="none"
        />
      ) : null}
    </g>
  );
};

export type Mode = "color" | "silhouette" | "sketch";

export type PersonProps = {
  readonly x: number;
  readonly y?: number;
  readonly s?: number;
  readonly facing?: 1 | -1;
  readonly pose?: Pose;
  readonly look?: Look;
  readonly view?: View;
  readonly light?: Light;
  readonly mode?: Mode;
  readonly silhouette?: string;
  readonly opacity?: number;
  readonly grounded?: boolean;
  /** Drawn in the near hand's local frame (origin at the hand, +y down the forearm). */
  readonly nearHold?: React.ReactNode;
  readonly farHold?: React.ReactNode;
  readonly shadow?: boolean;
};

export const Person: React.FC<PersonProps> = ({
  x,
  y = 0,
  s = 1,
  facing = 1,
  pose = STAND,
  look = {},
  view = "3q",
  light = NEUTRAL,
  mode = "color",
  silhouette = "#0c0e12",
  opacity = 1,
  grounded = true,
  nearHold,
  farHold,
  shadow = true,
}) => {
  const j = solve(pose, look, view, grounded);
  const d = j.dims;
  const sil = mode === "silhouette";
  const sketch = mode === "sketch";
  const paint: Paint = sil
    ? () => silhouette
    : sketch
      ? (c: string) => mix(lit(c, light), "#efe6d2", 0.72)
      : (c: string) => lit(c, light);
  const stroke = sketch ? "#3a332c" : "none";
  const sw = sketch ? 1.6 : 0;
  const skin = look.skin ?? "#e0b28e";
  const top = look.top ?? "#6a5a48";
  const pants = look.pants ?? "#3a4150";
  const shoes = look.shoes ?? "#1e1a16";
  const shirt = look.shirt ?? "#e8dfcf";
  const hairC = look.hairColor ?? "#2a2018";
  const longSleeves = (look.sleeves ?? "long") === "long";
  const shadeK = 0.16;
  const T = j.torsoAngle;
  const f = (v: number) => v.toFixed(1);

  const limb = (a: P, b: P, ra: number, rb: number, c: string, key: string) => (
    <path key={key} d={capsule(a, b, ra, rb)} fill={paint(c)} stroke={stroke} strokeWidth={sw} />
  );

  const arm = (side: "near" | "far") => {
    const a = side === "near" ? j.near : j.far;
    const k = side === "far" ? 0.12 : 0;
    const sleeve = darken(top, k);
    const foreC = longSleeves ? sleeve : darken(skin, k);
    const handC = darken(skin, k);
    const hold = side === "near" ? nearHold : farHold;
    return (
      <g key={side}>
        {limb(a.shoulder, a.elbow, d.arm, d.arm * 0.88, sleeve, "u")}
        {limb(a.elbow, a.wrist, d.arm * 0.86, d.arm * 0.7, foreC, "f")}
        {longSleeves && !sil ? (
          <path d={capsule(add(a.wrist, down(a.foreAngle), -3), a.wrist, d.arm * 0.74, d.arm * 0.72)} fill={paint(darken(sleeve, 0.12))} />
        ) : null}
        <Hand
          at={a.hand}
          angle={a.foreAngle}
          r={d.arm * 0.78}
          fill={paint(handC)}
          shade={paint(darken(handC, 0.12))}
        />
        {hold ? (
          <g transform={`translate(${f(a.hand.x)} ${f(a.hand.y)}) rotate(${f(-a.foreAngle)})`}>{hold}</g>
        ) : null}
      </g>
    );
  };

  const leg = (side: "near" | "far") => {
    const l = side === "near" ? j.nearLeg : j.farLeg;
    const k = side === "far" ? 0.14 : 0;
    const c = darken(pants, k);
    return (
      <g key={side}>
        {limb(l.hip, l.knee, d.leg, d.leg * 0.84, c, "t")}
        {limb(l.knee, l.ankle, d.leg * 0.82, d.leg * 0.62, c, "s")}
        <Shoe at={l.ankle} angle={l.footAngle} fill={paint(darken(shoes, k))} w={d.leg} />
      </g>
    );
  };

  // Torso outline in torso space: origin at the hip, up is -y, front is +x.
  const sh = d.sh;
  const w = d.waist;
  const hw = d.hipW;
  const b = d.belly;
  const L = d.torso;
  const front = view !== "3q";
  const torsoPath = front
    ? `M${-sh + 6} ${-L} Q0 ${-L - 6} ${sh - 6} ${-L} Q${sh + 3} ${-L + 3} ${sh} ${-L + 20} L${w + b * 0.4} ${-L * 0.35} Q${hw + 3} ${-12} ${hw} 8 L${-hw} 8 Q${-hw - 3} -12 ${-w - b * 0.4} ${-L * 0.35} L${-sh} ${-L + 20} Q${-sh - 3} ${-L + 3} ${-sh + 6} ${-L} Z`
    : `M${-sh * 0.55} ${-L} Q${sh * 0.1} ${-L - 7} ${sh * 0.62} ${-L + 1} Q${sh * 0.95} ${-L + 6} ${sh * 0.8} ${-L + 26} L${w * 0.72 + b * 0.5} ${-L * 0.42} Q${w * 0.9 + b * 1.25} ${-L * 0.16} ${hw * 0.72} 8 L${-hw * 0.95} 8 L${-hw * 0.95} ${-L * 0.25} Q${-w * 0.95} ${-L * 0.55} ${-sh * 0.78} ${-L + 20} Q${-sh * 0.86} ${-L + 4} ${-sh * 0.55} ${-L} Z`;
  const shadePath = front
    ? `M${-sh + 6} ${-L} Q${-sh - 3} ${-L + 3} ${-sh} ${-L + 20} L${-w - b * 0.4} ${-L * 0.35} Q${-hw - 3} -12 ${-hw} 8 L${-hw * 0.45} 8 L${-sh * 0.4} ${-L} Z`
    : `M${-sh * 0.55} ${-L} Q${-sh * 0.86} ${-L + 4} ${-sh * 0.78} ${-L + 20} Q${-w * 0.95} ${-L * 0.55} ${-hw * 0.95} ${-L * 0.25} L${-hw * 0.95} 8 L${-hw * 0.2} 8 L${-sh * 0.05} ${-L} Z`;
  const beltY = -18;
  const coat = look.coat ?? 0;
  const vX = front ? 0 : sh * 0.34;

  const torso = (
    <g transform={`translate(${f(j.hip.x)} ${f(j.hip.y)}) rotate(${f(T)})`}>
      <path d={torsoPath} fill={paint(top)} stroke={stroke} strokeWidth={sw} />
      {!sil ? (
        <>
          {/* belt and seat of the trousers, under a short top */}
          {coat <= 0 && !look.skirt ? (
            <path
              d={front ? `M${-hw} ${beltY} L${hw} ${beltY} L${hw} 8 L${-hw} 8 Z` : `M${-hw * 0.95} ${beltY} L${hw * 0.74 + b * 0.2} ${beltY} L${hw * 0.72} 8 L${-hw * 0.95} 8 Z`}
              fill={paint(pants)}
            />
          ) : null}
          {coat <= 0 && look.belt ? (
            <rect x={front ? -hw : -hw * 0.95} y={beltY - 1} width={front ? hw * 2 : hw * 1.7 + b * 0.2} height={5} fill={paint(look.belt)} />
          ) : null}
          <path d={shadePath} fill={paint(darken(top, shadeK))} opacity={0.9} />
          {/* collar / neckline */}
          <path
            d={`M${vX - 9} ${-L + 1} L${vX} ${-L + (look.jacket || look.tie ? 30 : 13)} L${vX + 9} ${-L + 1} Z`}
            fill={paint(shirt)}
          />
          {look.tie ? (
            <path
              d={`M${vX - 2.5} ${-L + 4} L${vX + 2.5} ${-L + 4} L${vX + 4} ${-L + 44} L${vX} ${-L + 50} L${vX - 4} ${-L + 44} Z`}
              fill={paint(look.tie)}
            />
          ) : null}
          {look.jacket ? (
            <g fill={paint(look.topTrim ?? darken(top, 0.22))}>
              <path d={`M${vX - 10} ${-L + 1} L${vX - 2} ${-L + 36} L${vX - 7} ${-L + 40} L${vX - 15} ${-L + 8} Z`} />
              <path d={`M${vX + 10} ${-L + 1} L${vX + 2} ${-L + 36} L${vX + 8} ${-L + 40} L${vX + 15} ${-L + 8} Z`} />
            </g>
          ) : null}
          {look.topTrim && !look.jacket ? (
            <path
              d={`M${vX - 2} ${-L + 14} L${vX + 2} ${-L + 14} L${vX + 3} ${beltY} L${vX - 3} ${beltY} Z`}
              fill={paint(look.topTrim)}
            />
          ) : null}
          {look.badge ? (
            <path
              d={`M${vX + (front ? -18 : 6)} ${-L + 30} l5 -3 l5 3 l-1 7 l-4 3 l-4 -3 Z`}
              fill={paint("#d8b85a")}
            />
          ) : null}
          {look.clown ? (
            <g>
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={vX + 2} cy={-L + 36 + i * 24} r={5} fill={paint(i === 1 ? "#2d4f86" : "#e9c24a")} />
              ))}
            </g>
          ) : null}
        </>
      ) : null}
      {look.clown ? (
        <g>
          <ellipse cx={vX * 0.6} cy={-L + 2} rx={sh * 1.05} ry={11} fill={paint("#f4efe4")} />
          <ellipse cx={vX * 0.6} cy={-L + 6} rx={sh * 0.8} ry={6} fill={paint("#e6ded0")} />
        </g>
      ) : null}
    </g>
  );

  const coatSkirt =
    coat > 0 || look.skirt ? (
      <g transform={`translate(${f(j.hip.x)} ${f(j.hip.y)}) rotate(${f(pose.pelvis)})`}>
        <path
          d={
            front
              ? `M${-hw - 2} -20 L${hw + 2} -20 L${hw + 8} ${coat > 0 ? coat : 70} L${-hw - 8} ${coat > 0 ? coat : 70} Z`
              : `M${-hw * 0.98} -20 L${hw * 0.76 + b * 0.3} -20 L${hw * 0.86 + 6} ${coat > 0 ? coat : 70} L${-hw - 6} ${coat > 0 ? coat : 70} Z`
          }
          fill={paint(look.skirt ?? top)}
          stroke={stroke}
          strokeWidth={sw}
        />
        <path
          d={front ? `M${-hw - 2} -20 L${-hw * 0.3} -20 L${-hw * 0.3} ${coat > 0 ? coat : 70} L${-hw - 8} ${coat > 0 ? coat : 70} Z` : `M${-hw * 0.98} -20 L${-hw * 0.2} -20 L${-hw * 0.1} ${coat > 0 ? coat : 70} L${-hw - 6} ${coat > 0 ? coat : 70} Z`}
          fill={paint(darken(look.skirt ?? top, shadeK))}
        />
      </g>
    ) : null;

  const hs = d.head;
  const headTurn = view === "front" ? -1 : view === "back" ? 1 : pose.turn;
  const earX = view === "front" ? 23 : lerp(-4, -10, (clamp(headTurn, -1, 1) + 1) / 2);
  const jowl = look.jowls ?? 0;
  const head = (
    <g transform={`translate(${f(j.headC.x)} ${f(j.headC.y)}) rotate(${f(j.headAngle)}) scale(${hs})`}>
      <Hair style={look.hair ?? "short"} color={paint(darken(hairC, 0.08))} part="behind" view={view} />
      <path
        d={
          view === "front" || view === "back"
            ? `M-24 -4 C-26 -32 26 -32 24 -4 C24 14 ${16 + jowl * 4} ${26 + jowl * 3} 0 ${29 + jowl * 3} C${-16 - jowl * 4} ${26 + jowl * 3} -24 14 -24 -4 Z`
            : `M-22 -6 C-24 -32 22 -34 25 -8 C27 4 26 12 ${22 + jowl * 2} 20 C${16 + jowl * 3} ${28 + jowl * 3} ${4} ${31 + jowl * 3} ${-6 - jowl * 2} ${27 + jowl * 3} C${-16 - jowl * 5} ${22 + jowl * 3} -22 12 -22 -6 Z`
        }
        fill={paint(skin)}
        stroke={stroke}
        strokeWidth={sw}
      />
      {!sil && view !== "back" ? (
        <path
          d={
            view === "front"
              ? `M-12 ${20 + jowl * 2} C-6 ${27 + jowl * 3} 6 ${27 + jowl * 3} 12 ${20 + jowl * 2} C8 ${29 + jowl * 3} -8 ${29 + jowl * 3} -12 ${20 + jowl * 2} Z`
              : `M-14 ${14 + jowl} C-10 ${24 + jowl * 3} 8 ${29 + jowl * 3} 20 ${20 + jowl * 2} C14 ${30 + jowl * 3} -6 ${30 + jowl * 3} -14 ${14 + jowl} Z`
          }
          fill={paint(darken(skin, 0.12))}
          opacity={0.8}
        />
      ) : null}
      <Hair style={look.hair ?? "short"} color={paint(hairC)} part="cap" view={view} />
      {view !== "back" && !sil ? (
        <ellipse cx={earX} cy={3} rx={4.5} ry={7.5} fill={paint(darken(skin, 0.06))} />
      ) : null}
      {view === "front" && !sil ? (
        <ellipse cx={-earX} cy={3} rx={4} ry={7} fill={paint(darken(skin, 0.08))} />
      ) : null}
      {!sil ? <Face p={pose} look={look} view={view} skin={skin} paint={paint} /> : null}
      <Hair style={look.hair ?? "short"} color={paint(lighten(hairC, 0.03))} part="fringe" view={view} />
      {look.cap ? (
        <g fill={paint(look.cap)}>
          <path d="M-25 -10 C-25 -36 24 -38 26 -12 Z" />
          <path d={view === "3q" ? "M6 -15 L38 -11 L36 -7 L4 -10 Z" : "M-20 -13 L20 -13 L22 -7 L-22 -7 Z"} fill={paint(darken(look.cap, 0.25))} />
        </g>
      ) : null}
    </g>
  );

  const neck = !sil ? (
    <path
      d={capsule(j.neckBase, add(j.neckBase, up(j.headAngle), d.neck + 10), d.neckW, d.neckW * 0.95)}
      fill={paint(darken(skin, 0.12))}
    />
  ) : (
    <path d={capsule(j.neckBase, add(j.neckBase, up(j.headAngle), d.neck + 10), d.neckW, d.neckW)} fill={silhouette} />
  );

  const shadowW = 46 + d.hipW;
  return (
    <g
      transform={`translate(${f(x)} ${f(y)}) scale(${f(facing * s)} ${f(s)})`}
      opacity={opacity}
    >
      {shadow && !sil && grounded ? (
        <ellipse cx={j.hip.x * 0.5} cy={2} rx={shadowW} ry={9} fill="#000" opacity={0.28} />
      ) : null}
      {arm("far")}
      {leg("far")}
      {leg("near")}
      {coatSkirt}
      {neck}
      {torso}
      {head}
      {arm("near")}
    </g>
  );
};
