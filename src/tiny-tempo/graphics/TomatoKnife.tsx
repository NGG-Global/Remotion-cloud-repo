import React from "react";
import { AbsoluteFill } from "remotion";
import {
  clamp,
  clamp01,
  easeOut,
  lastHitAge,
  nextHitIn,
  squash,
  useClock,
} from "../clock";
import { ChipBurst, ImpactFlash } from "../components/feedback";
import { Grain } from "../components/stage";
import { faces, KITCHEN } from "../theme";

type TomatoKnifeProps = {
  readonly hits: readonly number[];
};

/** White-tiled kitchen. The tomato is the only saturated thing in frame. */
export const TomatoKnife: React.FC<TomatoKnifeProps> = ({ hits }) => {
  const { time, durationInFrames, fps } = useClock();
  const chops = hits.filter((h) => h <= time).length;
  const age = lastHitAge(time, hits);
  const until = nextHitIn(time, hits);
  const windup =
    until !== null && until < 0.22
      ? Math.sin((1 - until / 0.22) * Math.PI) * 22
      : 0;
  const drop =
    Number.isFinite(age) && age < 0.16 ? (1 - easeOut(age / 0.16)) * 38 : 0;
  const rest = 28;
  const knifeRot = rest + windup - drop;
  const ken = clamp(time, [0, durationInFrames / fps], [1, 1.07]);
  const press = squash(age, 0.14, 8);
  const steel = faces(KITCHEN.steel);
  const handle = faces(KITCHEN.handle);
  const tomato = faces(KITCHEN.tomato);
  const remaining = Math.max(0.22, 1 - chops * 0.18);

  return (
    <AbsoluteFill
      style={{ backgroundColor: KITCHEN.paper, overflow: "hidden" }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{ transform: `scale(${ken})`, transformOrigin: "46% 60%" }}
      >
        {Array.from({ length: 6 }, (_, row) =>
          Array.from({ length: 10 }, (_, col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 196 - 20}
              y={row * 150 - 40}
              width="188"
              height="142"
              rx="8"
              fill={row > 3 ? KITCHEN.counter : "#eef3ee"}
              stroke={KITCHEN.grout}
              strokeWidth="8"
            />
          )),
        )}
        <rect x="0" y="620" width="1920" height="480" fill={KITCHEN.counter} />
        <g transform={`translate(960 ${730 + press})`}>
          <rect
            x="-520"
            y="0"
            width="1040"
            height="48"
            rx="10"
            fill={KITCHEN.boardEdge}
          />
          <rect
            x="-520"
            y="-8"
            width="1040"
            height="42"
            rx="10"
            fill={KITCHEN.board}
          />
          <rect x="-520" y="-8" width="1040" height="10" fill="#efe0b8" />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={-420 + i * 220}
              y1="-4"
              x2={-420 + i * 220}
              y2="28"
              stroke="#cdb383"
              strokeWidth="3"
              opacity="0.55"
            />
          ))}
        </g>

        <g transform="translate(820 560)">
          <ellipse
            cx="18"
            cy="158"
            rx={120 * remaining}
            ry="22"
            fill={KITCHEN.ink}
            opacity="0.14"
          />
          <ellipse
            cx="0"
            cy="40"
            rx={130 * remaining}
            ry={118 * remaining}
            fill={tomato.shade}
          />
          <ellipse
            cx="-8"
            cy="28"
            rx={130 * remaining}
            ry={118 * remaining}
            fill={tomato.face}
          />
          <ellipse
            cx="-36"
            cy="-10"
            rx={70 * remaining}
            ry={50 * remaining}
            fill={tomato.lit}
            opacity="0.85"
          />
          <ellipse
            cx="-4"
            cy={-78 * remaining}
            rx="22"
            ry="16"
            fill={KITCHEN.stem}
          />
          <ellipse
            cx="10"
            cy={-90 * remaining}
            rx="18"
            ry="10"
            fill="#6f9c4c"
            transform={`rotate(24 10 ${-90 * remaining})`}
          />
        </g>

        {hits.map((hit, i) => {
          const sliceAge = time - hit;
          if (sliceAge < 0) return null;
          const t = clamp01(sliceAge / 0.42);
          const x = 980 + i * 52 + easeOut(t) * 70;
          const y = 620 - Math.sin(t * Math.PI) * 90 + easeOut(t) * 80;
          const rot = -18 + easeOut(t) * (28 + i * 6);
          return (
            <g key={hit} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <ellipse
                cx="0"
                cy="0"
                rx="28"
                ry="72"
                fill={KITCHEN.flesh}
                stroke={KITCHEN.tomato}
                strokeWidth="10"
              />
              <ellipse cx="0" cy="0" rx="16" ry="48" fill="#f0a08e" />
              <ellipse cx="0" cy="0" rx="7" ry="18" fill={KITCHEN.seed} />
            </g>
          );
        })}

        <g transform={`translate(1080 430) rotate(${knifeRot})`}>
          <rect
            x="-30"
            y="-18"
            width="150"
            height="42"
            rx="10"
            fill={handle.face}
            stroke={handle.edge}
            strokeWidth="6"
          />
          <rect
            x="-30"
            y="-18"
            width="150"
            height="12"
            rx="8"
            fill={handle.lit}
            opacity="0.5"
          />
          <circle cx="8" cy="4" r="5" fill="#b9c2c6" />
          <circle cx="38" cy="4" r="5" fill="#b9c2c6" />
          <path
            d="M118 -14 L390 8 L392 18 L118 26 Z"
            fill={steel.face}
            stroke={steel.edge}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M124 -10 L382 8 L126 6 Z" fill={steel.lit} opacity="0.7" />
        </g>

        <ImpactFlash cx={960} cy={700} age={age} color="#fff" />
        <ChipBurst
          cx={900}
          cy={690}
          age={age}
          colors={[KITCHEN.flesh, KITCHEN.seed, KITCHEN.tomatoLit]}
        />
      </svg>
      <Grain opacity={0.08} dots={false} />
    </AbsoluteFill>
  );
};
