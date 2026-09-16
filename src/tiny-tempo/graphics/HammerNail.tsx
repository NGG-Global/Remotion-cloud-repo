import React from "react";
import { AbsoluteFill } from "remotion";
import {
  clamp,
  hammerAngle,
  lastHitAge,
  nextHitIn,
  settle,
  squash,
  useClock,
} from "../clock";
import { ChipBurst, ImpactFlash } from "../components/feedback";
import { Grain } from "../components/stage";
import { faces, TT, WORKSHOP } from "../theme";

type HammerNailProps = {
  readonly hits: readonly number[];
  readonly poster?: boolean;
  readonly scale?: number;
};

/**
 * Workshop hammer on a timber bench. Pose is Tiny Tempo's own anticipation /
 * contact / recoil, sampled against `hits` so every strike lands on the music.
 */
export const HammerNail: React.FC<HammerNailProps> = ({
  hits,
  poster = false,
  scale = 1,
}) => {
  const { time, durationInFrames, fps } = useClock();
  const angle = hammerAngle(time, hits);
  const age = lastHitAge(time, hits);
  const depth = Math.min(
    1,
    hits.filter((h) => h <= time).length / Math.max(1, hits.length),
  );
  const nailH = 168 * (1 - depth) + 18;
  const press = squash(age, 0.16, 0.045);
  const shake = settle(age, 110, 20) * 7;
  const until = nextHitIn(time, hits);
  const idle =
    until === null && !Number.isFinite(age) ? Math.sin(time * 1.25) * 0.03 : 0;
  const rot = ((angle + idle) * 180) / Math.PI;
  const ink = faces(WORKSHOP.ink);
  const red = faces(poster ? WORKSHOP.cream : WORKSHOP.red);
  const wood = faces(WORKSHOP.wood);
  const ken = clamp(time, [0, durationInFrames / fps], [1, 1.06]);
  const paper = poster ? TT.coral : WORKSHOP.paper;
  const sun = poster ? "#e07058" : WORKSHOP.sun;

  return (
    <AbsoluteFill style={{ backgroundColor: paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: poster
            ? `radial-gradient(circle at 48% 42%, ${sun} 0%, ${paper} 58%)`
            : `radial-gradient(circle at 62% 28%, ${sun}55 0%, transparent 58%)`,
        }}
      />
      <Grain opacity={poster ? 0.18 : 0.12} />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{
          transform: `translate(${shake}px, ${shake * 0.35}px) scale(${ken * scale})`,
          transformOrigin: "60% 62%",
        }}
      >
        <rect
          x="0"
          y="720"
          width="1920"
          height="380"
          fill={poster ? "#c9a06a" : wood.face}
        />
        <rect x="0" y="720" width="1920" height="22" fill={wood.lit} />
        <rect x="0" y="742" width="1920" height="8" fill={wood.shade} />
        <rect x="0" y="714" width="1920" height="8" fill={wood.edge} />
        <ellipse
          cx="1180"
          cy="768"
          rx="58"
          ry="16"
          fill="none"
          stroke={WORKSHOP.woodDark}
          strokeWidth="3"
          opacity="0.4"
        />
        <ellipse
          cx="420"
          cy="900"
          rx="34"
          ry="12"
          fill={WORKSHOP.ink}
          opacity="0.12"
        />
        <ellipse
          cx="560"
          cy="960"
          rx="28"
          ry="10"
          fill={WORKSHOP.ink}
          opacity="0.1"
        />

        <ellipse
          cx="1288"
          cy="728"
          rx="78"
          ry="16"
          fill={WORKSHOP.ink}
          opacity="0.16"
        />
        <g transform={`translate(1288, ${728 - nailH})`}>
          <line
            x1="0"
            y1={nailH}
            x2="0"
            y2="8"
            stroke={ink.edge}
            strokeWidth="28"
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1={nailH}
            x2="0"
            y2="8"
            stroke={ink.face}
            strokeWidth="20"
            strokeLinecap="round"
          />
          <line
            x1="-6"
            y1={nailH - 8}
            x2="-6"
            y2="12"
            stroke={ink.rim}
            strokeWidth="5"
            opacity="0.8"
          />
          <rect
            x="-38"
            y="-8"
            width="76"
            height="18"
            rx="6"
            fill={ink.face}
            stroke={ink.edge}
            strokeWidth="5"
          />
          <ellipse cx="0" cy="-8" rx="38" ry="8" fill={ink.lit} />
          <line
            x1="-18"
            y1="-12"
            x2="12"
            y2="-12"
            stroke={WORKSHOP.cream}
            strokeWidth="2.5"
            opacity="0.85"
          />
        </g>

        <g transform={`translate(1288, ${728 - nailH}) rotate(${rot})`}>
          <g transform="translate(80, 8)">
            <rect
              x="-8"
              y="-18"
              width="290"
              height="52"
              rx="16"
              fill={WORKSHOP.ink}
              opacity="0.1"
              transform="translate(8 8)"
            />
            <rect
              x="-16"
              y="-24"
              width="286"
              height="48"
              rx="14"
              fill={red.shade}
              stroke={red.edge}
              strokeWidth="7"
            />
            <rect
              x="-16"
              y="-24"
              width="286"
              height="34"
              rx="14"
              fill={red.face}
            />
            <rect x="8" y="-22" width="220" height="8" rx="4" fill={red.lit} />
            <rect
              x="210"
              y="-25"
              width="68"
              height="51"
              rx="13"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="7"
            />
            <rect
              x="210"
              y="-25"
              width="68"
              height="14"
              rx="13"
              fill={ink.lit}
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={222 + i * 9}
                y1={-14}
                x2={228 + i * 9}
                y2={16}
                stroke="#698075"
                strokeWidth="2"
                opacity="0.45"
              />
            ))}
            <rect
              x="-78"
              y="-58"
              width="78"
              height="101"
              rx="8"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="7"
            />
            <rect
              x="-78"
              y="-58"
              width="78"
              height="16"
              rx="5"
              fill={ink.lit}
            />
            <rect
              x="-72"
              y="-54"
              width="66"
              height="3"
              fill={ink.rim}
              opacity="0.6"
            />
            <rect x="-78" y="-4" width="78" height="46" fill={ink.shade} />
            <rect
              x="-84"
              y="30"
              width="88"
              height="13"
              rx="4"
              fill={ink.edge}
            />
            <rect x="-84" y="38" width="88" height="5" rx="2" fill="#a9b6a1" />
            <polygon
              points="-4,-48 48,-40 66,-2 38,-16 10,-21 -2,-14"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <circle cx="-32" cy="-30" r="4" fill={WORKSHOP.paper} />
          </g>
        </g>

        <ImpactFlash cx={1288} cy={728 - nailH} age={age} />
        <ChipBurst
          cx={1288}
          cy={728 - nailH}
          age={age}
          colors={[WORKSHOP.cream, WORKSHOP.sun, WORKSHOP.wood]}
        />
        <rect
          x="0"
          y="720"
          width="1920"
          height={press * 10}
          fill={wood.shade}
          opacity={0.4}
        />
      </svg>
    </AbsoluteFill>
  );
};
