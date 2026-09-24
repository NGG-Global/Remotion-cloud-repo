import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Scene } from "../components/Scene";
import { Rise } from "../components/Type";
import { DOC, easeOut, ramp } from "../theme";

/**
 * The closing card: the programme's mark, a comment bubble that fills as the
 * narrator asks for opinions, and a closed file for the next episode.
 */
export const Outro: React.FC<{
  readonly series: string;
  readonly next: string;
}> = ({ series, next }) => {
  const frame = useCurrentFrame();
  const bubble = easeOut(ramp(frame, 10, 50));
  const dots = [0, 1, 2].map((i) =>
    easeOut(ramp(frame, 40 + i * 10, 60 + i * 10)),
  );
  const file = easeOut(ramp(frame, 110, 150));
  return (
    <Scene
      fog={0.5}
      fogBand="low"
      flicker={0.2}
      vignette={0.9}
      lamp="50% 30%"
      lampStrength={0.14}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 120,
            alignItems: "center",
            direction: "rtl",
          }}
        >
          <svg
            width={260}
            height={220}
            viewBox="0 0 260 220"
            style={{
              opacity: bubble,
              transform: `scale(${0.9 + 0.1 * bubble})`,
            }}
          >
            <path
              d="M 20 20 L 240 20 L 240 150 L 110 150 L 60 200 L 68 150 L 20 150 Z"
              fill="none"
              stroke={DOC.fogLight}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            {dots.map((d, i) => (
              <circle
                key={i}
                cx={80 + i * 50}
                cy={86}
                r={11 * d}
                fill={DOC.red}
              />
            ))}
          </svg>
          <svg
            width={260}
            height={220}
            viewBox="0 0 260 220"
            style={{
              opacity: file,
              transform: `translateY(${(1 - file) * 20}px)`,
            }}
          >
            <path
              d="M 20 60 L 20 200 L 240 200 L 240 80 L 130 80 L 110 60 Z"
              fill="none"
              stroke={DOC.fogLight}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <path
              d="M 20 60 L 20 40 L 200 40 L 200 60"
              fill="none"
              stroke={DOC.fogLight}
              strokeWidth={5}
              strokeOpacity={0.6}
            />
            <line
              x1="60"
              y1="130"
              x2="200"
              y2="130"
              stroke={DOC.red}
              strokeWidth={4}
              opacity={0.8}
            />
            <line
              x1="60"
              y1="160"
              x2="160"
              y2="160"
              stroke={DOC.fogLight}
              strokeWidth={4}
              opacity={0.5}
            />
          </svg>
        </div>
        <Rise text={series} delay={0} fontSize={92} weight={500} />
        <div
          style={{
            width: 420,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${DOC.red}, transparent)`,
          }}
        />
        <Rise
          text={next}
          delay={120}
          fontSize={40}
          weight={300}
          color={DOC.paperDark}
        />
      </AbsoluteFill>
    </Scene>
  );
};
