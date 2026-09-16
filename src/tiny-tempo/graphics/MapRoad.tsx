import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, useClock } from "../clock";
import { Grain } from "../components/stage";
import { faces, shade, TT } from "../theme";

type MapRoadProps = {
  readonly delay?: number;
};

/** A stretch of the endless sage road, coral puck hopping on the beat. */
export const MapRoad: React.FC<MapRoadProps> = ({ delay = 0 }) => {
  const { time, beat } = useClock();
  const t = Math.max(0, time - delay);
  const hop = Math.abs(Math.sin(beat * Math.PI)) * 18;
  const travel = clamp(t, [0, 3.2], [0, 1]);
  const sage = faces("#9bb07a");
  const sand = "#e6d4a8";

  const nodes = Array.from({ length: 8 }, (_, i) => {
    const x = 180 + i * 210 + Math.sin(i * 1.4) * 28;
    const y = 540 + Math.sin(i * 0.9) * 70 + (i % 2 === 0 ? -20 : 30);
    return { x, y };
  });

  const path = nodes
    .map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`)
    .join(" ");
  const current = Math.min(
    nodes.length - 1,
    Math.floor(travel * (nodes.length - 1) + 0.001),
  );
  const puck = nodes[current]!;

  return (
    <AbsoluteFill style={{ backgroundColor: "#d5e0c4", overflow: "hidden" }}>
      <AbsoluteFill
        style={{ background: `linear-gradient(#c5d6a8, #d5e0c4 40%, ${sand})` }}
      />
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        <ellipse cx="240" cy="200" rx="160" ry="50" fill="#b7c992" />
        <ellipse cx="1680" cy="260" rx="200" ry="60" fill="#b7c992" />
        <path
          d={path}
          fill="none"
          stroke={shade("#6e8b52", -0.2)}
          strokeWidth="78"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="none"
          stroke={sage.face}
          strokeWidth="58"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="none"
          stroke={sage.lit}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.5"
        />
        {nodes.map((n, i) => {
          const unlocked = i <= current;
          return (
            <g key={i} transform={`translate(${n.x} ${n.y})`}>
              <circle r="42" fill={TT.ink} opacity="0.16" />
              <circle
                r="34"
                fill={unlocked ? TT.cream : "#c5d0b0"}
                stroke={TT.ink}
                strokeWidth="7"
              />
              {i < current ? (
                <polygon
                  points="0,-16 5,-4 18,-4 8,4 12,16 0,8 -12,16 -8,4 -18,-4 -5,-4"
                  fill={TT.brass}
                />
              ) : null}
            </g>
          );
        })}
        <g transform={`translate(${puck.x} ${puck.y - 10 - hop})`}>
          <ellipse cx="4" cy="48" rx="28" ry="10" fill={TT.ink} opacity="0.2" />
          <circle r="36" fill={TT.coral} stroke={TT.inkDeep} strokeWidth="8" />
          <circle r="14" fill={TT.coralLit} />
        </g>
      </svg>
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
