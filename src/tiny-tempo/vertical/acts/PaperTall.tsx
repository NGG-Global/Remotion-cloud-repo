import React from "react";
import {
  clamp01,
  easeOut,
  hammerAngle,
  lastHitAge,
  useClock,
} from "../../clock";
import { CRAFT, faces, TT } from "../../theme";
import { CENTRE_X, INK_WEIGHT } from "../frame";
import { ActStage, CastShadow } from "./ActStage";
import type { ActProps } from "./types";

const MAT = { x: 36, y: 176, w: 648, h: 916 } as const;
const SHEET = { x: 118, y: 264, w: 484, h: 736 } as const;
const STAR = { cx: CENTRE_X, cy: 632, outer: 196, inner: 88 } as const;
/** Screw to blade point. The scissors are set back this far along the cut line. */
const BLADE = 196;

/** The cut line, as ten straight runs between the star's points. */
const VERTICES: readonly { readonly x: number; readonly y: number }[] =
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? STAR.outer : STAR.inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return { x: STAR.cx + Math.cos(a) * r, y: STAR.cy + Math.sin(a) * r };
  });

const SEGMENTS = VERTICES.map((from, i) => {
  const to = VERTICES[(i + 1) % VERTICES.length]!;
  return { from, to, length: Math.hypot(to.x - from.x, to.y - from.y) };
});
const TOTAL = SEGMENTS.reduce((sum, s) => sum + s.length, 0);

/** Position and heading a fraction `t` of the way round the cut line. */
const alongCut = (t: number): { x: number; y: number; angle: number } => {
  let remaining = clamp01(t) * TOTAL;
  for (const seg of SEGMENTS) {
    if (remaining <= seg.length) {
      const k = seg.length === 0 ? 0 : remaining / seg.length;
      return {
        x: seg.from.x + (seg.to.x - seg.from.x) * k,
        y: seg.from.y + (seg.to.y - seg.from.y) * k,
        angle:
          (Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x) * 180) /
          Math.PI,
      };
    }
    remaining -= seg.length;
  }
  const last = SEGMENTS[SEGMENTS.length - 1]!;
  return {
    x: last.to.x,
    y: last.to.y,
    angle:
      (Math.atan2(last.to.y - last.from.y, last.to.x - last.from.x) * 180) /
      Math.PI,
  };
};

/** The run of the cut line already travelled, as an SVG path. */
const cutPath = (t: number): string => {
  const end = clamp01(t) * TOTAL;
  let walked = 0;
  let d = `M ${VERTICES[0]!.x} ${VERTICES[0]!.y}`;
  for (const seg of SEGMENTS) {
    if (walked + seg.length <= end) {
      d += ` L ${seg.to.x} ${seg.to.y}`;
      walked += seg.length;
      continue;
    }
    const k = (end - walked) / seg.length;
    if (k > 0) {
      d += ` L ${seg.from.x + (seg.to.x - seg.from.x) * k} ${seg.from.y + (seg.to.y - seg.from.y) * k}`;
    }
    break;
  }
  return d;
};

const STAR_POLY = VERTICES.map((v) => `${v.x},${v.y}`).join(" ");

/**
 * Scissors & paper, the ninth act and the one that ends with something made.
 *
 * Each snip advances the cut a fixed run around the outline, so the shape assembles
 * on the beat; the round's payoff lifts the cutout off the sheet rather than simply
 * scoring the attempt.
 */
export const PaperTall: React.FC<ActProps> = ({ hits, finish }) => {
  const { time } = useClock();
  const age = lastHitAge(time, hits);
  const snips = hits.filter((h) => h <= time).length;
  const pose = hammerAngle(time, hits);

  // Every snip claims the same run of the line, and the last one closes the shape.
  const per = 1 / Math.max(1, hits.length);
  const settled = snips * per;
  const travel =
    age < 0.18 && snips > 0
      ? settled - per * (1 - easeOut(age / 0.18))
      : settled;
  const progress = clamp01(travel);
  const freed = finish !== undefined && time >= finish;
  const lift = freed ? easeOut(clamp01((time - (finish ?? 0)) / 0.7)) : 0;

  const tip = alongCut(progress);
  // Blades are wide open at the top of the wind-up and shut at contact.
  const gape = 4 + pose * 26;

  const ink = faces(CRAFT.ink);
  const mat = faces(CRAFT.mat);
  const coral = faces(CRAFT.coral);
  const steel = faces(CRAFT.steel);

  return (
    <ActStage
      paper={CRAFT.paper}
      sun={TT.sun}
      sunX={44}
      sunY={18}
      push={[1.01, 1.07]}
    >
      <defs>
        {/* The sheet minus the cutout, so the hole is real once the star lifts. */}
        <mask id="tt-sheet-mask">
          <rect x={0} y={0} width={720} height={1280} fill="#fff" />
          {lift > 0 ? <polygon points={STAR_POLY} fill="#000" /> : null}
        </mask>
      </defs>

      {/* Self-healing cutting mat. */}
      <CastShadow
        cx={CENTRE_X}
        cy={MAT.y + MAT.h}
        rx={332}
        ry={26}
        opacity={0.14}
      />
      <rect
        x={MAT.x}
        y={MAT.y + 14}
        width={MAT.w}
        height={MAT.h}
        rx={26}
        fill={mat.edge}
      />
      <rect
        x={MAT.x}
        y={MAT.y}
        width={MAT.w}
        height={MAT.h}
        rx={26}
        fill={mat.face}
      />
      {Array.from({ length: 13 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={MAT.x + 24 + i * 50}
          y1={MAT.y + 20}
          x2={MAT.x + 24 + i * 50}
          y2={MAT.y + MAT.h - 20}
          stroke={CRAFT.grid}
          strokeWidth={i % 4 === 0 ? 3 : 1.6}
          opacity={i % 4 === 0 ? 0.75 : 0.45}
        />
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={MAT.x + 20}
          y1={MAT.y + 26 + i * 50}
          x2={MAT.x + MAT.w - 20}
          y2={MAT.y + 26 + i * 50}
          stroke={CRAFT.grid}
          strokeWidth={i % 4 === 0 ? 3 : 1.6}
          opacity={i % 4 === 0 ? 0.75 : 0.45}
        />
      ))}
      <rect
        x={MAT.x}
        y={MAT.y}
        width={MAT.w}
        height={MAT.h}
        rx={26}
        fill="none"
        stroke={ink.edge}
        strokeWidth={INK_WEIGHT}
      />

      {/* The sheet. Once the star is freed the sheet carries the hole. */}
      <g mask="url(#tt-sheet-mask)">
        <rect
          x={SHEET.x + 10}
          y={SHEET.y + 14}
          width={SHEET.w}
          height={SHEET.h}
          rx={10}
          fill={TT.inkDeep}
          opacity={0.16}
        />
        <rect
          x={SHEET.x}
          y={SHEET.y}
          width={SHEET.w}
          height={SHEET.h}
          rx={10}
          fill={coral.face}
        />
        <rect
          x={SHEET.x}
          y={SHEET.y}
          width={SHEET.w}
          height={70}
          rx={10}
          fill={coral.lit}
          opacity={0.55}
        />
        <rect
          x={SHEET.x}
          y={SHEET.y}
          width={SHEET.w}
          height={SHEET.h}
          rx={10}
          fill="none"
          stroke={ink.edge}
          strokeWidth={INK_WEIGHT}
        />
      </g>
      {lift > 0 ? (
        <polygon points={STAR_POLY} fill={coral.edge} opacity={0.35 * lift} />
      ) : null}

      {/* Guide line ahead of the blades, open cut behind them. */}
      <polygon
        points={STAR_POLY}
        fill="none"
        stroke={CRAFT.paper}
        strokeWidth={6}
        strokeDasharray="16 14"
        opacity={0.9 - progress * 0.45}
      />
      {progress > 0 ? (
        <>
          <path
            d={cutPath(progress)}
            fill="none"
            stroke={coral.edge}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={cutPath(progress)}
            fill="none"
            stroke={CRAFT.mat}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        </>
      ) : null}

      {/* The freed star, tipping up off the sheet. */}
      {lift > 0 ? (
        <g
          transform={`translate(${-lift * 52} ${-lift * 236}) rotate(${-lift * 15} ${STAR.cx} ${STAR.cy}) scale(${1 + lift * 0.14}) translate(${-STAR.cx * lift * 0.14} ${-STAR.cy * lift * 0.14})`}
        >
          <polygon
            points={STAR_POLY}
            fill={TT.inkDeep}
            opacity={0.26 * lift}
            transform={`translate(${34 * lift} ${52 * lift})`}
          />
          <polygon
            points={STAR_POLY}
            fill={coral.face}
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
            strokeLinejoin="round"
          />
          <polygon
            points={VERTICES.slice(0, 5)
              .map((v) => `${v.x},${v.y}`)
              .join(" ")}
            fill={coral.lit}
            opacity={0.4}
          />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = i * 1.05;
            const d = 210 + lift * 90;
            return (
              <circle
                key={i}
                cx={STAR.cx + Math.cos(a) * d}
                cy={STAR.cy + Math.sin(a) * d * 0.8}
                r={7 * (1 - lift)}
                fill={CRAFT.star}
                opacity={1 - lift}
              />
            );
          })}
        </g>
      ) : null}

      {/* Scissors, trailing the head of the cut.
          The blades turn about the screw, not about their points, so the screw is
          set back along the cut line by one blade length and the tips meet exactly
          where the line is being opened. */}
      {!freed ? (
        <g
          transform={`translate(${tip.x} ${tip.y}) rotate(${tip.angle + 180}) scale(0.84) translate(${BLADE} 0)`}
        >
          {[1, -1].map((side) => (
            <g key={side} transform={`rotate(${side * gape})`}>
              <g transform={`scale(1 ${side})`}>
                <path
                  d={`M -${BLADE + 6} 2 L -${BLADE - 16} -16 L -6 -26 L 2 6 Z`}
                  fill={steel.face}
                  stroke={ink.edge}
                  strokeWidth={6}
                  strokeLinejoin="round"
                />
                <path
                  d={`M -${BLADE - 12} -10 L -14 -19`}
                  stroke={steel.rim}
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              {/* Neck and bow handle, drawn as strokes so the ring stays open. */}
              <path
                d={`M 4 ${side * 6} L 46 ${side * 40}`}
                stroke={ink.edge}
                strokeWidth={34}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 4 ${side * 6} L 46 ${side * 40}`}
                stroke={CRAFT.coral}
                strokeWidth={22}
                strokeLinecap="round"
                fill="none"
              />
              <ellipse
                cx={92}
                cy={side * 72}
                rx={50}
                ry={38}
                fill="none"
                stroke={ink.edge}
                strokeWidth={38}
                transform={`rotate(${side * -26} 92 ${side * 72})`}
              />
              <ellipse
                cx={92}
                cy={side * 72}
                rx={50}
                ry={38}
                fill="none"
                stroke={CRAFT.coral}
                strokeWidth={26}
                transform={`rotate(${side * -26} 92 ${side * 72})`}
              />
            </g>
          ))}
          <circle r={17} fill={steel.shade} stroke={ink.edge} strokeWidth={6} />
          <circle r={6} fill={steel.rim} />
        </g>
      ) : null}

      {/* Paper confetti thrown off each snip. */}
      {age < 0.34
        ? [0, 1, 2, 3, 4].map((i) => {
            const p = age / 0.34;
            const a = -2.2 + i * 0.55;
            return (
              <rect
                key={i}
                x={tip.x + Math.cos(a) * (26 + p * 96) - 6}
                y={tip.y + Math.sin(a) * (20 + p * 70) + p * p * 96 - 4}
                width={13}
                height={8}
                rx={2}
                fill={i % 2 ? coral.lit : CRAFT.star}
                opacity={1 - p}
                transform={`rotate(${i * 54 + p * 200} ${tip.x} ${tip.y})`}
              />
            );
          })
        : null}
    </ActStage>
  );
};
