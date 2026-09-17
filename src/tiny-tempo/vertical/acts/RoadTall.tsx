import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, useClock } from "../../clock";
import { Grain } from "../../components/stage";
import { faces, mix, shade, TT } from "../../theme";
import { INK_WEIGHT, VIEW_BOX } from "../frame";

/** Where the puck sits in frame; the road scrolls past it rather than the reverse. */
const EYE_Y = 900;
const NODES = 16;
/** Opens here rather than at level one, so the Grass/Sand line crosses the frame. */
const START_NODE = 2;

type Node = { readonly x: number; readonly y: number };

/**
 * The map's nodes, laid out up a virtual strip. The road is endless in the game, so
 * the ad shows a window onto it and lets it run off the top of the frame.
 */
const NODE: readonly Node[] = Array.from({ length: NODES }, (_, i) => ({
  x: 360 + Math.sin(i * 0.82) * 168 + Math.sin(i * 0.31) * 46,
  y: 2180 - i * 168,
}));

/** Grass, then Sand, then Snow — three of the game's ten-level areas. */
const BANDS = [
  { until: 1560, ground: "#cbdaa8", far: "#b7c992", name: "Grass" },
  { until: 880, ground: "#e8d7ab", far: "#d8c391", name: "Sand" },
  { until: -600, ground: "#eaf0f2", far: "#d5e1e6", name: "Snow" },
] as const;

/**
 * The endless road, as the map scene draws it: levels strung up a winding path,
 * cleared ones carrying stars, and the player's puck hopping one level per beat.
 */
export const RoadTall: React.FC = () => {
  const { time, beat } = useClock();

  // The shot is half a bar, so the puck takes eighth notes and opens partway up
  // the road: the point is that the areas turn over, and a two-hop crawl from
  // level one never reaches the edge of the first one.
  const step = Math.min(NODES - 1.001, START_NODE + beat * 2);
  const index = Math.floor(step);
  const within = step - index;
  const from = NODE[index] ?? NODE[0]!;
  const to = NODE[Math.min(NODES - 1, index + 1)] ?? from;

  // A hop, not a slide: up and over, landing on the beat.
  const travel = easeOut(clamp01(within / 0.72));
  const puckX = from.x + (to.x - from.x) * travel;
  const puckY =
    from.y + (to.y - from.y) * travel - Math.sin(travel * Math.PI) * 74;
  const camera = puckY - EYE_Y;

  const path = NODE.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(
    " ",
  );
  const sage = faces("#8fa96a");

  return (
    <AbsoluteFill style={{ backgroundColor: "#cbdaa8", overflow: "hidden" }}>
      <svg
        width="100%"
        height="100%"
        viewBox={VIEW_BOX}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, display: "block" }}
        aria-hidden
      >
        <g transform={`translate(0 ${-camera})`}>
          {/* Ground bands. The palette turns over as the road leaves each area. */}
          {BANDS.map((band, i) => {
            const top = i === 0 ? 2600 : (BANDS[i - 1]?.until ?? 2600);
            return (
              <g key={band.name}>
                <rect
                  x={-200}
                  y={band.until}
                  width={1120}
                  height={top - band.until}
                  fill={band.ground}
                />
                <rect
                  x={-200}
                  y={band.until}
                  width={1120}
                  height={64}
                  fill={band.far}
                />
              </g>
            );
          })}

          {/* Scenery either side, so the road is travelling through somewhere. */}
          {Array.from({ length: 20 }, (_, i) => {
            const y = 2240 - i * 150;
            const side = i % 2 === 0 ? -1 : 1;
            const x = 360 + side * (240 + ((i * 37) % 90));
            const band = BANDS.filter((b) => y > b.until)[0] ?? BANDS[2]!;
            const snow = band.name === "Snow";
            const sand = band.name === "Sand";
            if (sand) {
              return (
                <g key={i}>
                  <ellipse
                    cx={x + 6}
                    cy={y + 30}
                    rx={42}
                    ry={12}
                    fill={TT.inkDeep}
                    opacity={0.12}
                  />
                  <rect
                    x={x - 11}
                    y={y - 26}
                    width={22}
                    height={56}
                    rx={8}
                    fill="#8a6a45"
                  />
                  {[-1, 1].map((k) => (
                    <path
                      key={k}
                      d={`M ${x} ${y - 24} q ${k * 54} -18 ${k * 66} -58`}
                      fill="none"
                      stroke="#6f9455"
                      strokeWidth={13}
                      strokeLinecap="round"
                    />
                  ))}
                </g>
              );
            }
            return (
              <g key={i}>
                <ellipse
                  cx={x + 6}
                  cy={y + 28}
                  rx={48}
                  ry={13}
                  fill={TT.inkDeep}
                  opacity={0.12}
                />
                <rect
                  x={x - 8}
                  y={y - 12}
                  width={16}
                  height={42}
                  rx={6}
                  fill={shade("#4a6b3a", -0.2)}
                />
                {[0, 1, 2].map((k) => (
                  <polygon
                    key={k}
                    points={`${x - (52 - k * 13)},${y - 6 - k * 34} ${x + (52 - k * 13)},${y - 6 - k * 34} ${x},${y - 52 - k * 34}`}
                    fill={
                      snow
                        ? mix("#3f5a4a", "#eaf0f2", 0.22)
                        : mix("#4a6b3a", "#cbdaa8", 0.1 + k * 0.08)
                    }
                  />
                ))}
                {snow ? (
                  <polygon
                    points={`${x - 20},${y - 84} ${x + 20},${y - 84} ${x},${y - 108}`}
                    fill="#fff"
                    opacity={0.9}
                  />
                ) : null}
              </g>
            );
          })}

          {/* The road: a dark bed, the sage surface, one lit crown. */}
          <path
            d={path}
            fill="none"
            stroke={shade("#6e8b52", -0.28)}
            strokeWidth={104}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path}
            fill="none"
            stroke={sage.face}
            strokeWidth={82}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path}
            fill="none"
            stroke={sage.lit}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray="30 34"
            opacity={0.55}
          />

          {NODE.map((n, i) => {
            const cleared = i < index;
            const current = i === index;
            return (
              <g key={i} transform={`translate(${n.x} ${n.y})`}>
                <ellipse
                  cx={5}
                  cy={44}
                  rx={48}
                  ry={14}
                  fill={TT.inkDeep}
                  opacity={0.16}
                />
                <circle
                  r={52}
                  fill={cleared || current ? TT.cream : "#c2cfae"}
                  stroke={TT.inkDeep}
                  strokeWidth={INK_WEIGHT + 2}
                />
                {cleared ? (
                  <g>
                    {[-1, 0, 1].map((k) => (
                      <polygon
                        key={k}
                        points="0,-15 4.5,-4.5 16,-4 7,3.5 10,15 0,8 -10,15 -7,3.5 -16,-4 -4.5,-4.5"
                        fill={TT.brass}
                        stroke={shade(TT.brass, -0.35)}
                        strokeWidth={2}
                        transform={`translate(${k * 27} ${k === 0 ? -4 : 2}) scale(${k === 0 ? 1.15 : 0.95})`}
                      />
                    ))}
                  </g>
                ) : (
                  <text
                    x={0}
                    y={15}
                    textAnchor="middle"
                    fontFamily="Fredoka"
                    fontWeight={700}
                    fontSize={42}
                    fill={TT.ink}
                  >
                    {i + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* The player's puck, hopping one level per beat. */}
          <g transform={`translate(${puckX} ${puckY})`}>
            <ellipse
              cx={4}
              cy={58 + Math.sin(travel * Math.PI) * 30}
              rx={34 - Math.sin(travel * Math.PI) * 10}
              ry={11}
              fill={TT.inkDeep}
              opacity={0.22}
            />
            <circle r={46} fill={TT.coralDeep} />
            <circle
              cy={-5}
              r={46}
              fill={TT.coral}
              stroke={TT.inkDeep}
              strokeWidth={INK_WEIGHT + 1}
            />
            <ellipse
              cx={-14}
              cy={-22}
              rx={16}
              ry={11}
              fill={TT.coralLit}
              opacity={0.85}
            />
            <circle cy={-5} r={13} fill={TT.cream} opacity={0.5} />
          </g>
        </g>
      </svg>

      {/* Haze at the head of the road, so it reads as running on past the frame. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${mix("#eaf0f2", "#ffffff", 0.4)} 0%, rgba(255,255,255,0) 26%)`,
          opacity: clamp01(0.35 + Math.sin(time) * 0.05),
        }}
      />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
