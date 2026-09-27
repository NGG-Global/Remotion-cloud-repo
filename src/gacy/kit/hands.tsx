import React from "react";
import { darken, lit, type Light, NEUTRAL } from "../engine/color";

/**
 * A hand for close-ups (the rig's hands are mittens, fine at medium
 * distance but not in an insert shot). Drawn pointing down its +y axis
 * from the wrist, world units at real size (a hand is ~36 units long).
 */
export const CloseHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle?: number;
  readonly skin?: string;
  readonly sleeve?: string;
  readonly curl?: number;
  readonly light?: Light;
  readonly s?: number;
  readonly flip?: boolean;
  readonly children?: React.ReactNode;
}> = ({ x, y, angle = 0, skin = "#e3b692", sleeve = "#58634e", curl = 0.3, light = NEUTRAL, s = 1, flip = false, children }) => {
  const L = (c: string) => lit(c, light);
  const sh = L(darken(skin, 0.14));
  const fingers = [-10, -3.5, 3, 9.5];
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${flip ? -s : s} ${s})`}>
      <rect x={-13} y={-80} width={26} height={70} rx={10} fill={L(sleeve)} />
      <rect x={-14} y={-18} width={28} height={10} rx={4} fill={L(darken(sleeve, 0.2))} />
      <rect x={-10} y={-10} width={20} height={16} rx={6} fill={L(skin)} />
      <path d="M-13 4 Q-15 24 -11 34 L11 34 Q15 22 13 4 Z" fill={L(skin)} />
      {fingers.map((fx, i) => {
        const len = [15, 18, 17, 13][i] * (1 - curl * 0.55);
        return (
          <g key={i}>
            <rect x={fx - 2.8} y={31} width={5.6} height={len} rx={2.8} fill={L(skin)} />
            <rect x={fx - 2.8} y={31 + len * 0.55} width={5.6} height={1.2} fill={sh} opacity={0.7} />
          </g>
        );
      })}
      <path d="M13 10 Q24 16 22 30 Q19 34 16 30 Q16 22 11 18 Z" fill={L(skin)} />
      <path d="M-12 8 Q-13 22 -10 32" stroke={sh} strokeWidth={2} fill="none" opacity={0.6} />
      {children}
    </g>
  );
};
