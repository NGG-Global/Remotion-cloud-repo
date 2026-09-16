import React from "react";
import { AbsoluteFill } from "remotion";
import {
  clamp,
  clamp01,
  easeOut,
  lastHitAge,
  nextHitIn,
  useClock,
} from "../clock";
import { Grain } from "../components/stage";
import { faces, GYM } from "../theme";

type BicepCurlProps = {
  readonly hits: readonly number[];
};

export const BicepCurl: React.FC<BicepCurlProps> = ({ hits }) => {
  const { time, durationInFrames, fps } = useClock();
  const reps = hits.filter((h) => h <= time).length;
  const age = lastHitAge(time, hits);
  const until = nextHitIn(time, hits);
  const squeeze = Number.isFinite(age) ? 1 - easeOut(clamp01(age / 0.32)) : 0;
  const wind = until !== null && until < 0.22 ? 1 - until / 0.22 : 0;
  const flex = Math.max(squeeze, wind * 0.85);
  const arm = -70 + flex * 118;
  const ken = clamp(time, [0, durationInFrames / fps], [1, 1.05]);
  const kit = faces(GYM.kit);
  const skin = faces(GYM.skin);
  const iron = faces(GYM.iron);
  const tallies = reps;

  return (
    <AbsoluteFill style={{ backgroundColor: GYM.paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 60% 24%, ${GYM.lamp}66 0%, transparent 50%)`,
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 900 1000"
        style={{ transform: `scale(${ken})`, transformOrigin: "55% 60%" }}
      >
        <rect x="0" y="780" width="900" height="220" fill={GYM.mat} />
        <rect x="0" y="780" width="900" height="14" fill="#5d5966" />
        <rect
          x="70"
          y="120"
          width="200"
          height="180"
          rx="12"
          fill="#34493f"
          stroke="#8a6743"
          strokeWidth="10"
        />
        {Array.from({ length: tallies }, (_, i) => (
          <line
            key={i}
            x1={100 + (i % 4) * 28}
            y1={160 + Math.floor(i / 4) * 40}
            x2={118 + (i % 4) * 28}
            y2={196 + Math.floor(i / 4) * 40}
            stroke={GYM.chalk}
            strokeWidth="6"
            strokeLinecap="round"
          />
        ))}
        <g transform="translate(520 780)">
          <ellipse
            cx="-70"
            cy="8"
            rx="38"
            ry="16"
            fill={GYM.ink}
            opacity="0.2"
          />
          <ellipse
            cx="40"
            cy="8"
            rx="38"
            ry="16"
            fill={GYM.ink}
            opacity="0.2"
          />
          <rect
            x="-92"
            y="-140"
            width="44"
            height="148"
            rx="20"
            fill={skin.shade}
          />
          <rect
            x="18"
            y="-140"
            width="44"
            height="148"
            rx="20"
            fill={skin.shade}
          />
          <path d="M-80 -140 L-70 -340 L70 -340 L80 -140 Z" fill={kit.shade} />
          <path d="M-70 -150 L-58 -340 L58 -340 L70 -150 Z" fill={kit.face} />
          <path
            d="M-40 -338 L40 -338 L32 -300 L-32 -300 Z"
            fill={kit.lit}
            opacity="0.5"
          />
          <polygon points="-8,-250 8,-268 8,-232" fill="#89c7b4" />
          <ellipse
            cx="8"
            cy="-410"
            rx="64"
            ry="74"
            fill={skin.face}
            stroke={skin.edge}
            strokeWidth="6"
          />
          <ellipse
            cx="-10"
            cy="-430"
            rx="28"
            ry="16"
            fill={skin.lit}
            opacity="0.5"
          />
          <path d="M-20 -455 Q 20 -500 55 -450" fill={GYM.hair} />
          <path
            d="M-8 -390 Q 10 -382 28 -388"
            fill="none"
            stroke={GYM.ink}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse cx="-12" cy="-418" rx="7" ry="9" fill={GYM.ink} />
          <ellipse cx="28" cy="-418" rx="7" ry="9" fill={GYM.ink} />
          <path
            d="M8 -368 Q 22 -360 10 -354"
            fill="none"
            stroke={GYM.ink}
            strokeWidth="3"
          />
          <g transform={`translate(58 -250) rotate(${arm})`}>
            <rect
              x="-18"
              y="0"
              width="36"
              height={150 + flex * 8}
              rx="18"
              fill={skin.face}
              stroke={skin.edge}
              strokeWidth="5"
            />
            <ellipse
              cx="0"
              cy="20"
              rx={22 + flex * 10}
              ry="28"
              fill={skin.shade}
            />
            <g transform={`translate(0 ${150 + flex * 8})`}>
              <rect
                x="-16"
                y="-12"
                width="32"
                height="24"
                rx="8"
                fill={iron.face}
              />
              <rect
                x="-70"
                y="-52"
                width="36"
                height="104"
                rx="8"
                fill={iron.face}
                stroke={iron.edge}
                strokeWidth="5"
              />
              <rect
                x="34"
                y="-52"
                width="36"
                height="104"
                rx="8"
                fill={iron.face}
                stroke={iron.edge}
                strokeWidth="5"
              />
              <rect
                x="-66"
                y="-48"
                width="10"
                height="96"
                fill={GYM.chrome}
                opacity="0.5"
              />
            </g>
          </g>
        </g>
      </svg>
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
