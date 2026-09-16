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
 * Workshop hammer. Drawn grip-left / head-right like the launcher icon, then
 * rotated so contact drives the poll onto the nail. Pose uses Tiny Tempo's
 * anticipation / contact / recoil, mapped into a cinematic swing.
 */
export const HammerNail: React.FC<HammerNailProps> = ({
  hits,
  poster = false,
  scale = 1,
}) => {
  const { time, durationInFrames, fps } = useClock();
  const pose = hammerAngle(time, hits);
  const age = lastHitAge(time, hits);
  const depth = Math.min(
    0.45,
    hits.filter((h) => h <= time).length / Math.max(2, hits.length),
  );
  const until = nextHitIn(time, hits);
  const idle =
    until === null && !Number.isFinite(age) ? Math.sin(time * 1.25) * 0.03 : 0;
  // Contact ~18°, rest ~−21°, windup ~−40° — handle stays in the air.
  const rot = 14 - (pose + idle) * 42;
  const press = squash(age, 0.16, 0.05);
  const shake = settle(age, 110, 20) * (poster ? 10 : 6);
  const ink = faces(WORKSHOP.ink);
  const handle = faces(poster ? WORKSHOP.cream : WORKSHOP.red);
  const wood = faces(WORKSHOP.wood);
  const ken = clamp(
    time,
    [0, durationInFrames / fps],
    [poster ? 1.12 : 1.2, poster ? 1.2 : 1.32],
  );
  const paper = poster ? TT.coral : WORKSHOP.paper;
  const sun = poster ? "#e8896c" : WORKSHOP.sun;
  const hero = poster ? 2.15 : 1.95;
  const nailX = poster ? 1240 : 1200;
  const benchY = poster ? 790 : 770;
  const nailH = poster ? 92 : 64 + (1 - depth) * 120;
  const nailY = benchY - (poster ? 22 : nailH);
  const reach = 318 * hero;
  const contact = (14 * Math.PI) / 180;
  const gripX = nailX - Math.cos(contact) * reach;
  const gripY = nailY - Math.sin(contact) * reach;

  return (
    <AbsoluteFill style={{ backgroundColor: paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: poster
            ? `radial-gradient(circle at 46% 40%, ${sun} 0%, ${paper} 56%)`
            : `radial-gradient(circle at 62% 28%, ${sun}66 0%, transparent 58%)`,
        }}
      />
      <Grain opacity={poster ? 0.2 : 0.12} />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{
          transform: `translate(${shake}px, ${shake * 0.35}px) scale(${ken * scale})`,
          transformOrigin: poster ? "54% 52%" : "52% 58%",
        }}
      >
        {poster ? (
          <circle cx="920" cy="430" r="430" fill={sun} opacity="0.55" />
        ) : null}

        <rect
          x="0"
          y={benchY}
          width="1920"
          height={1080 - benchY}
          fill={poster ? "#c9a06a" : wood.face}
        />
        <rect x="0" y={benchY} width="1920" height="20" fill={wood.lit} />
        <rect x="0" y={benchY + 20} width="1920" height="8" fill={wood.shade} />
        <rect x="0" y={benchY - 8} width="1920" height="8" fill={wood.edge} />
        <ellipse
          cx="420"
          cy="940"
          rx="36"
          ry="13"
          fill={WORKSHOP.ink}
          opacity="0.14"
        />
        <ellipse
          cx="580"
          cy="990"
          rx="30"
          ry="11"
          fill={WORKSHOP.ink}
          opacity="0.1"
        />

        <ellipse
          cx={nailX + 8}
          cy={benchY + 10}
          rx="70"
          ry="16"
          fill={WORKSHOP.ink}
          opacity="0.16"
        />
        {poster ? (
          <g transform={`translate(${nailX} ${benchY})`}>
            <rect
              x="-16"
              y={-nailH + 8}
              width="32"
              height={nailH - 4}
              rx="8"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="6"
            />
            <rect
              x="-8"
              y={-nailH + 16}
              width="8"
              height={nailH - 28}
              fill={ink.lit}
              opacity="0.5"
            />
            <ellipse
              cx="0"
              cy={-nailH}
              rx="52"
              ry="18"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="7"
            />
            <ellipse cx="0" cy={-nailH - 7} rx="52" ry="14" fill={ink.lit} />
            <ellipse
              cx="8"
              cy="8"
              rx="58"
              ry="14"
              fill="none"
              stroke={WORKSHOP.cream}
              strokeWidth="5"
              opacity="0.45"
            />
          </g>
        ) : (
          <g transform={`translate(${nailX} ${nailY})`}>
            <line
              x1="0"
              y1={nailH}
              x2="0"
              y2="8"
              stroke={ink.edge}
              strokeWidth="26"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1={nailH}
              x2="0"
              y2="8"
              stroke={ink.face}
              strokeWidth="18"
              strokeLinecap="round"
            />
            <line
              x1="-5"
              y1={nailH - 8}
              x2="-5"
              y2="12"
              stroke={ink.rim}
              strokeWidth="5"
              opacity="0.8"
            />
            <rect
              x="-36"
              y="-8"
              width="72"
              height="18"
              rx="6"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="5"
            />
            <ellipse cx="0" cy="-8" rx="36" ry="8" fill={ink.lit} />
          </g>
        )}

        <g
          transform={`translate(${gripX} ${gripY}) rotate(${rot}) scale(${hero})`}
        >
          <rect
            x="8"
            y="-6"
            width="270"
            height="48"
            rx="16"
            fill={WORKSHOP.ink}
            opacity="0.12"
          />
          <rect
            x="16"
            y="-22"
            width="270"
            height="46"
            rx="14"
            fill={handle.shade}
            stroke={handle.edge}
            strokeWidth="7"
          />
          <rect
            x="16"
            y="-22"
            width="270"
            height="32"
            rx="14"
            fill={handle.face}
          />
          <rect
            x="36"
            y="-20"
            width="210"
            height="8"
            rx="4"
            fill={handle.lit}
          />
          <rect
            x="-36"
            y="-26"
            width="64"
            height="54"
            rx="14"
            fill={ink.face}
            stroke={ink.edge}
            strokeWidth="7"
          />
          <rect x="-36" y="-26" width="64" height="16" rx="14" fill={ink.lit} />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={-22 + i * 10}
              y1={-12}
              x2={-16 + i * 10}
              y2={18}
              stroke="#698075"
              strokeWidth="2.2"
              opacity="0.5"
            />
          ))}
          <rect
            x="250"
            y="-62"
            width="92"
            height="118"
            rx="10"
            fill={ink.face}
            stroke={ink.edge}
            strokeWidth="8"
          />
          <rect x="250" y="-62" width="92" height="20" rx="8" fill={ink.lit} />
          <rect
            x="256"
            y="-56"
            width="78"
            height="4"
            fill={ink.rim}
            opacity="0.65"
          />
          <rect x="250" y="8" width="92" height="48" fill={ink.shade} />
          <rect x="244" y="46" width="104" height="14" rx="5" fill={ink.edge} />
          <rect x="244" y="54" width="104" height="6" rx="2" fill="#a9b6a1" />
          <polygon
            points="232,-46 250,-54 250,-14 228,-8"
            fill={ink.face}
            stroke={ink.edge}
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <circle cx="292" cy="-28" r="5" fill={WORKSHOP.paper} />
        </g>

        <ImpactFlash
          cx={nailX}
          cy={nailY}
          age={age}
          scale={poster ? 1.6 : 1.2}
        />
        <ChipBurst
          cx={nailX}
          cy={nailY}
          age={age}
          colors={[WORKSHOP.cream, WORKSHOP.sun, WORKSHOP.wood]}
        />
        <rect
          x="0"
          y={benchY}
          width="1920"
          height={press * 12}
          fill={wood.shade}
          opacity={0.35}
        />
      </svg>
    </AbsoluteFill>
  );
};
