import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, easeOut, lastHitAge, settle, useClock } from "../../clock";
import { StarMedal } from "../../components/feedback";
import { Grain } from "../../components/stage";
import { faces, shade, TT } from "../../theme";
import { beats } from "../format";

/**
 * Bars 24-26: the level map, climbing. The coral puck hops a node on every
 * kick of the figure and a brass star stamps onto the node it just cleared.
 * The camera rides with it, so the road scrolls under the beat.
 */
const HOPS = beats(0, 3, 4, 5, 6, 8, 11);

const NODES = Array.from({ length: 9 }, (_, i) => ({
  x: 540 + Math.sin(i * 1.25 + 0.6) * 300,
  y: 1700 - i * 250,
}));

export const RoadV: React.FC = () => {
  const { time, fps } = useClock();
  const index = HOPS.filter((h) => h <= time).length;
  const age = lastHitAge(time, HOPS);
  const hopP = Number.isFinite(age) ? easeOut(clamp(age, [0, 0.3], [0, 1])) : 1;
  const from = NODES[Math.max(0, index - 1)]!;
  const to = NODES[Math.min(NODES.length - 1, index)]!;
  const px = from.x + (to.x - from.x) * hopP;
  const py = from.y + (to.y - from.y) * hopP;
  const arc = Math.sin(hopP * Math.PI) * 90;
  const landSquash =
    Number.isFinite(age) && age > 0.3 ? settle(age - 0.3, 26, 9) * 0.1 : 0;
  const idle = Math.abs(Math.sin((time / 0.5) * Math.PI)) * 8;

  // Camera: the puck rides a little below centre; the road scrolls under it.
  const camera = 1150 - py;

  const sage = faces("#9bb07a");
  const coral = faces(TT.coral);
  const path = NODES.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(
    " ",
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(#c5d6a8, #d5e0c4 45%, #e6d4a8)",
        overflow: "hidden",
      }}
    >
      <Grain opacity={0.12} />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <g transform={`translate(0 ${camera})`}>
          <ellipse cx="160" cy="-120" rx="190" ry="54" fill="#b7c992" />
          <ellipse cx="960" cy="520" rx="220" ry="60" fill="#b7c992" />
          <ellipse cx="120" cy="1250" rx="170" ry="50" fill="#b7c992" />
          <ellipse cx="980" cy="1900" rx="210" ry="58" fill="#b7c992" />

          <path
            d={path}
            fill="none"
            stroke={shade("#6e8b52", -0.2)}
            strokeWidth="92"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path}
            fill="none"
            stroke={sage.face}
            strokeWidth="70"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path}
            fill="none"
            stroke={sage.lit}
            strokeWidth="12"
            strokeDasharray="34 44"
            strokeLinecap="round"
            opacity="0.6"
          />

          {NODES.map((n, i) => {
            const cleared = i < index - 1 || (i === index - 1 && hopP > 0.6);
            return (
              <g key={i} transform={`translate(${n.x} ${n.y})`}>
                <circle r="54" fill={shade("#6e8b52", -0.35)} />
                <circle cy="-6" r="50" fill={cleared ? "#fff5dc" : "#cfdac0"} />
                <circle
                  cy="-6"
                  r="50"
                  fill="none"
                  stroke={TT.inkDeep}
                  strokeWidth="7"
                />
              </g>
            );
          })}

          {NODES.map((n, i) => {
            const hop = HOPS[i];
            if (hop === undefined || i >= NODES.length - 1) return null;
            if (time < hop + 0.25) return null;
            return (
              <StarMedal
                key={`star-${i}`}
                x={n.x}
                y={n.y - 8}
                radius={38}
                delay={Math.round((hop + 0.25) * fps)}
              />
            );
          })}

          <g transform={`translate(${px} ${py - 10 - arc - idle})`}>
            <ellipse
              cy={arc + idle + 16}
              rx={46 - arc * 0.15}
              ry={16 - arc * 0.05}
              fill={TT.inkDeep}
              opacity={0.2}
            />
            <g transform={`scale(${1 + landSquash}, ${1 - landSquash})`}>
              <circle cy="8" r="44" fill={coral.edge} />
              <circle
                r="44"
                fill={coral.face}
                stroke={TT.inkDeep}
                strokeWidth="7"
              />
              <ellipse
                cx="-12"
                cy="-16"
                rx="16"
                ry="9"
                fill={coral.lit}
                opacity="0.9"
              />
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
