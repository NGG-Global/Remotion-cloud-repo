import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, clamp01, easeOut, lastHitAge, useClock } from "../clock";
import { Grain } from "../components/stage";
import { CRAFT, faces, TT } from "../theme";

type ScissorsPaperProps = {
  readonly hits: readonly number[];
};

const STAR = [
  [0, -160],
  [48, -52],
  [152, -48],
  [62, 20],
  [96, 132],
  [0, 64],
  [-96, 132],
  [-62, 20],
  [-152, -48],
  [-48, -52],
] as const;

export const ScissorsPaper: React.FC<ScissorsPaperProps> = ({ hits }) => {
  const { time, durationInFrames, fps } = useClock();
  const snips = hits.filter((h) => h <= time).length;
  const cut = Math.min(1, snips / Math.max(1, hits.length));
  const age = lastHitAge(time, hits);
  const open = Number.isFinite(age) ? easeOut(clamp01(age / 0.22)) : 1;
  const blade = 18 + (1 - open) * 22;
  const unfold = clamp01((cut - 0.55) / 0.45);
  const ken = clamp(time, [0, durationInFrames / fps], [1.12, 1.2]);
  const steel = faces(CRAFT.steel);
  const coral = faces(CRAFT.coral);
  const star = faces(CRAFT.star);

  const starPoints = STAR.map(
    ([x, y]) => `${x * (0.5 + unfold * 0.5)},${y}`,
  ).join(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: CRAFT.paper, overflow: "hidden" }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 900 900"
        style={{ transform: `scale(${ken})`, transformOrigin: "50% 52%" }}
      >
        <rect
          x="90"
          y="110"
          width="720"
          height="680"
          rx="28"
          fill={CRAFT.mat}
        />
        <rect
          x="90"
          y="110"
          width="720"
          height="680"
          rx="28"
          fill="none"
          stroke={faces(CRAFT.mat).edge}
          strokeWidth="10"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <line
              x1="120"
              y1={160 + i * 70}
              x2="780"
              y2={160 + i * 70}
              stroke={CRAFT.grid}
              strokeWidth="2"
            />
            <line
              x1={150 + i * 70}
              y1="140"
              x2={150 + i * 70}
              y2="760"
              stroke={CRAFT.grid}
              strokeWidth="2"
            />
          </g>
        ))}
        <g transform="translate(430 460)">
          <polygon
            points={starPoints}
            fill={star.face}
            stroke={star.edge}
            strokeWidth="8"
            strokeLinejoin="round"
            opacity={0.35 + unfold * 0.65}
          />
          {unfold < 0.95 ? (
            <rect
              x="-4"
              y="-170"
              width="8"
              height="340"
              fill={TT.ink}
              opacity="0.12"
            />
          ) : null}
        </g>
        <g
          transform={`translate(${520 + cut * -40} ${220 + cut * 240}) rotate(${12 + cut * 50})`}
        >
          <g transform={`rotate(${-blade})`}>
            <path
              d="M0 0 L140 -8 L148 8 L0 14 Z"
              fill={steel.face}
              stroke={steel.edge}
              strokeWidth="5"
            />
            <circle
              cx="-18"
              cy="4"
              r="22"
              fill={coral.face}
              stroke={coral.edge}
              strokeWidth="6"
            />
            <circle
              cx="-18"
              cy="4"
              r="10"
              fill="none"
              stroke={TT.cream}
              strokeWidth="4"
            />
          </g>
          <g transform={`rotate(${blade})`}>
            <path
              d="M0 0 L140 8 L148 -6 L0 -12 Z"
              fill={steel.lit}
              stroke={steel.edge}
              strokeWidth="5"
            />
            <circle
              cx="-18"
              cy="-4"
              r="22"
              fill={coral.face}
              stroke={coral.edge}
              strokeWidth="6"
            />
            <circle
              cx="-18"
              cy="-4"
              r="10"
              fill="none"
              stroke={TT.cream}
              strokeWidth="4"
            />
          </g>
          <circle cx="0" cy="0" r="7" fill={steel.edge} />
        </g>
      </svg>
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
