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
import { ChipBurst } from "../components/feedback";
import { Grain } from "../components/stage";
import { faces, TIMBER } from "../theme";

type SawTimberProps = {
  readonly hits: readonly number[];
};

export const SawTimber: React.FC<SawTimberProps> = ({ hits }) => {
  const { time, durationInFrames, fps } = useClock();
  const bites = hits.filter((h) => h <= time).length;
  const age = lastHitAge(time, hits);
  const until = nextHitIn(time, hits);
  const dir = bites % 2 === 0 ? 1 : -1;
  const travel = Number.isFinite(age)
    ? (1 - easeOut(clamp01(age / 0.28))) * 70 * dir
    : 0;
  const wind =
    until !== null && until < 0.2
      ? Math.sin((1 - until / 0.2) * Math.PI) * -28 * dir
      : 0;
  const kerf = Math.min(1, bites / Math.max(2, hits.length)) * 70;
  const ken = clamp(time, [0, durationInFrames / fps], [1.18, 1.28]);
  const steel = faces(TIMBER.steel);
  const grip = faces(TIMBER.grip);
  const wood = faces(TIMBER.sapwood);

  return (
    <AbsoluteFill style={{ backgroundColor: TIMBER.paper, overflow: "hidden" }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 900"
        style={{ transform: `scale(${ken})`, transformOrigin: "55% 55%" }}
      >
        <rect x="0" y="620" width="1200" height="280" fill="#d5d8d2" />
        <g transform="translate(0 40) rotate(-6.5 600 400)">
          <g transform="translate(380 520)">
            <polygon
              points="-40,0 40,0 28,90 -28,90"
              fill={TIMBER.ink}
              opacity="0.18"
            />
            <rect
              x="-46"
              y="-12"
              width="92"
              height="18"
              rx="4"
              fill={wood.edge}
            />
            <polygon points="-30,6 30,6 18,80 -18,80" fill={grip.shade} />
          </g>
          <g transform="translate(560 530)">
            <rect
              x="-46"
              y="-12"
              width="92"
              height="18"
              rx="4"
              fill={wood.edge}
            />
            <polygon points="-30,6 30,6 18,80 -18,80" fill={grip.shade} />
          </g>
          <g transform="translate(200 360)">
            <rect
              x="0"
              y="0"
              width="820"
              height="86"
              rx="8"
              fill={wood.shade}
            />
            <rect x="0" y="0" width="820" height="70" rx="8" fill={wood.face} />
            <rect x="0" y="0" width="820" height="16" fill={wood.lit} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line
                key={i}
                x1="20"
                y1={14 + i * 10}
                x2="800"
                y2={18 + i * 10}
                stroke={TIMBER.grain}
                strokeWidth="2"
                opacity="0.35"
              />
            ))}
            <rect
              x="560"
              y="8"
              width="10"
              height={kerf}
              fill={TIMBER.kerf}
              opacity="0.85"
            />
          </g>
          <g transform={`translate(${560 + travel + wind} 300)`}>
            <rect
              x="-20"
              y="0"
              width="18"
              height="220"
              rx="3"
              fill={steel.face}
              stroke={steel.edge}
              strokeWidth="4"
            />
            {Array.from({ length: 14 }, (_, i) => (
              <polygon
                key={i}
                points={`-2,${14 + i * 14} 16,${20 + i * 14} -2,${26 + i * 14}`}
                fill={steel.shade}
              />
            ))}
            <path
              d="M-28 0 C -70 -8, -90 40, -40 70 L -8 70 L -8 8 Z"
              fill={grip.face}
              stroke={grip.edge}
              strokeWidth="5"
            />
            <rect
              x="-78"
              y="18"
              width="44"
              height="16"
              rx="6"
              fill={TIMBER.glove}
            />
          </g>
        </g>
        <ChipBurst
          cx={760}
          cy={430}
          age={age}
          colors={[TIMBER.sawdust, TIMBER.lit, TIMBER.grain]}
        />
      </svg>
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
