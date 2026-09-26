import React from "react";
import { darken, lighten, lit, type Light, NEUTRAL } from "../engine/color";
import { noise } from "../engine/time";
import { Beam, Glow, Pool } from "./light";

/**
 * Late-1970s vehicles in side elevation at world scale. Wheels roll by
 * distance (`x / radius`), so a parked car's wheels never spin.
 */

const Wheel: React.FC<{ x: number; r: number; roll: number; light: Light }> = ({
  x,
  r,
  roll,
  light,
}) => (
  <g transform={`translate(${x} ${-r})`}>
    <circle r={r} fill={lit("#15161a", light)} />
    <circle r={r * 0.55} fill={lit("#8d9096", light)} />
    <g transform={`rotate(${(roll * 180) / Math.PI})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={-r * 0.06} y={-r * 0.5} width={r * 0.12} height={r * 0.36} fill={lit("#5a5d63", light)} transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={r * 0.14} fill={lit("#b8bcc2", light)} />
  </g>
);

export type CarKind = "sedan" | "van" | "police" | "unmarked" | "pickup";

export const Car: React.FC<{
  readonly x: number;
  readonly kind?: CarKind;
  readonly color?: string;
  readonly facing?: 1 | -1;
  readonly light?: Light;
  readonly headlights?: number;
  readonly lightbar?: number;
  readonly t?: number;
  /** Silhouettes seen through the side windows. */
  readonly occupants?: React.ReactNode;
  readonly snow?: number;
  readonly lettering?: boolean;
}> = ({
  x,
  kind = "sedan",
  color = "#5a4e44",
  facing = 1,
  light = NEUTRAL,
  headlights = 0,
  lightbar = 0,
  t = 0,
  occupants,
  snow = 0,
  lettering = false,
}) => {
  const L = (c: string) => lit(c, light);
  const r = 66;
  const roll = (x / r) * facing;
  const glassC = L("#26303a");
  const chrome = L("#aeb2b6");
  const body = kind === "police" ? "#e9e8e2" : color;
  const van = kind === "van";
  const pickup = kind === "pickup";
  const len = van ? 980 : pickup ? 1060 : 1060;
  const half = len / 2;
  const bodyPath = van
    ? `M${-half} -80 L${-half} -330 Q${-half} -400 ${-half + 60} -400 L${half - 260} -400 Q${half - 200} -400 ${half - 150} -320 L${half - 40} -250 Q${half} -240 ${half} -200 L${half} -80 Z`
    : pickup
      ? `M${-half} -80 L${-half} -200 L${-half + 440} -200 L${-half + 460} -300 L${-half + 700} -300 L${-half + 770} -205 L${half - 30} -190 Q${half} -185 ${half} -150 L${half} -80 Z`
      : `M${-half} -80 L${-half + 10} -190 L${-half + 300} -196 L${-half + 400} -275 L${half - 380} -275 L${half - 250} -198 L${half - 20} -186 Q${half} -180 ${half} -140 L${half} -80 Z`;
  const windows = van
    ? `M${half - 250} -385 L${half - 210} -385 Q${half - 175} -380 ${half - 150} -320 L${half - 250} -320 Z`
    : pickup
      ? `M${-half + 475} -290 L${-half + 690} -290 L${-half + 745} -212 L${-half + 470} -212 Z`
      : `M${-half + 318} -200 L${-half + 410} -262 L${half - 392} -262 L${half - 272} -200 Z`;
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      <ellipse cx={0} cy={-2} rx={half * 0.95} ry={20} fill="#000" opacity={0.35} />
      {headlights > 0 ? (
        <>
          <Beam x={half - 10} y={-150} angle={4} length={1500} spread={16} color="#fff1c8" opacity={0.35 * headlights} />
          <Pool x={half + 600} y={-10} rx={700} ry={60} color="#fff0c0" opacity={0.3 * headlights} />
        </>
      ) : null}
      <path d={bodyPath} fill={L(body)} />
      <path d={`M${-half} -150 L${half} -150 L${half} -80 L${-half} -80 Z`} fill={L(darken(body, 0.14))} />
      {kind === "police" ? (
        <path d={`M${-half + 380} -275 L${half - 380} -275 L${half - 250} -198 L${half - 20} -186 L${half} -150 L${-half} -150 L${-half + 10} -190 L${-half + 300} -196 Z`} fill={L("#1d2533")} opacity={0} />
      ) : null}
      {kind === "police" ? (
        <rect x={-half + 60} y={-176} width={len - 120} height={28} fill={L("#24324a")} />
      ) : null}
      <path d={windows} fill={glassC} />
      {!van && !pickup ? (
        <rect x={-6} y={-262} width={16} height={62} fill={L(body)} />
      ) : null}
      {occupants ? <g clipPath={undefined}>{occupants}</g> : null}
      {van ? (
        <>
          <rect x={-half + 80} y={-360} width={half + 120} height={160} rx={10} fill={L(darken(body, 0.05))} />
          {lettering ? (
            <rect x={-half + 140} y={-300} width={half - 40} height={36} rx={4} fill={L(lighten(body, 0.35))} opacity={0.8} />
          ) : null}
          <rect x={-40} y={-360} width={6} height={280} fill={L(darken(body, 0.3))} />
        </>
      ) : null}
      {pickup ? (
        <rect x={-half + 20} y={-236} width={420} height={36} fill={L(darken(body, 0.2))} />
      ) : null}
      <rect x={half - 14} y={-138} width={22} height={40} rx={4} fill={chrome} />
      <rect x={-half - 8} y={-138} width={22} height={40} rx={4} fill={chrome} />
      <rect x={half - 26} y={-176} width={24} height={20} rx={3} fill={headlights > 0 ? "#fff4d0" : L("#d8d4c4")} />
      <rect x={-half + 2} y={-176} width={20} height={20} rx={3} fill={headlights > 0 ? "#e04030" : L("#8a2a24")} />
      {headlights > 0 ? <Glow x={-half + 10} y={-166} r={70} color="#ff3a2a" opacity={0.4 * headlights} /> : null}
      {/* door seams, handle */}
      <path d={`M${-half + 520} -268 L${-half + 520} -90 M${-half + 300} -196 L${-half + 300} -90`} stroke={L(darken(body, 0.28))} strokeWidth={4} opacity={van || pickup ? 0 : 1} />
      <rect x={-half + 540} y={-178} width={50} height={9} rx={3} fill={chrome} opacity={van || pickup ? 0 : 1} />
      <path d={`M${-half + 40} -84 L${half - 40} -84`} stroke="#000" strokeWidth={6} opacity={0.2} />
      <path d={`M${-half + 90} -80 A 82 82 0 0 1 ${-half + 270} -80 Z`} fill={L("#0e0f12")} />
      <path d={`M${half - 270} -80 A 82 82 0 0 1 ${half - 90} -80 Z`} fill={L("#0e0f12")} />
      <Wheel x={-half + 180} r={r} roll={roll} light={light} />
      <Wheel x={half - 180} r={r} roll={roll} light={light} />
      {snow > 0 ? (
        <path d={van ? `M${-half + 10} -400 L${half - 260} -400 L${half - 270} ${-400 - 18 * snow} L${-half + 20} ${-400 - 18 * snow} Z` : `M${-half + 400} -275 L${half - 380} -275 L${half - 390} ${-275 - 16 * snow} L${-half + 410} ${-275 - 16 * snow} Z`} fill={L("#e6ebf0")} />
      ) : null}
      {lightbar > 0 || kind === "police" ? (
        <g>
          <rect x={-60} y={van ? -420 : -300} width={120} height={24} rx={6} fill={L("#1a1c20")} />
          <rect x={-56} y={van ? -418 : -298} width={50} height={18} rx={4} fill={lightbar > 0 && noise(t * 6, 1) > 0 ? "#e8403a" : L("#6a2a26")} />
          <rect x={6} y={van ? -418 : -298} width={50} height={18} rx={4} fill={lightbar > 0 && noise(t * 6, 1) <= 0 ? "#4a7ae0" : L("#2a3a6a")} />
          {lightbar > 0 ? <Glow x={0} y={-290} r={260} color={noise(t * 6, 1) > 0 ? "#e8403a" : "#4a7ae0"} opacity={0.35 * lightbar} /> : null}
        </g>
      ) : null}
    </g>
  );
};
