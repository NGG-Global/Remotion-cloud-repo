import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DOC, easeOut, hash, ramp, SERIF_LATIN } from "../theme";

type PocketWatchProps = {
  readonly hour: number;
  readonly minute: number;
  /** Caption under the watch, e.g. a date. Latin. */
  readonly caption?: string;
  readonly captionAt?: number;
};

/**
 * A pocket watch face filling the dark. The hands are fixed at the hour the
 * narration gives; only the seconds hand ticks, and the whole thing pushes in
 * slowly so the frame never sits still.
 */
export const PocketWatch: React.FC<PocketWatchProps> = ({
  hour,
  minute,
  caption,
  captionAt = 40,
}) => {
  const frame = useCurrentFrame();
  const appear = easeOut(ramp(frame, 0, 40));
  const push = 1 + frame * 0.0009;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  const secondAngle = (Math.floor(frame / 30) * 6 + 200) % 360;
  const gleam =
    0.35 + 0.15 * Math.sin(frame * 0.05) + (hash(frame) - 0.5) * 0.04;

  const R = 300;
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const long = i % 5 === 0;
    const r1 = R - (long ? 34 : 18);
    ticks.push(
      <line
        key={i}
        x1={Math.sin(a) * r1}
        y1={-Math.cos(a) * r1}
        x2={Math.sin(a) * (R - 8)}
        y2={-Math.cos(a) * (R - 8)}
        stroke={DOC.ink}
        strokeWidth={long ? 4 : 1.5}
        opacity={0.85}
      />,
    );
  }
  const numerals = [
    "XII",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
  ];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: appear,
          transform: `scale(${push * (0.92 + 0.08 * appear)}) translateY(${caption ? -30 : 0}px)`,
        }}
      >
        <svg width={760} height={760} viewBox="-380 -380 760 760">
          <defs>
            <radialGradient id="pw-face" cx="40%" cy="35%" r="75%">
              <stop offset="0" stopColor="#efe6d2" />
              <stop offset="0.7" stopColor="#cfc3a6" />
              <stop offset="1" stopColor="#8f8266" />
            </radialGradient>
            <radialGradient id="pw-rim" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#d9b46a" />
              <stop offset="0.6" stopColor="#7a5a26" />
              <stop offset="1" stopColor="#2a1d0a" />
            </radialGradient>
            <linearGradient id="pw-gleam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity={gleam} />
              <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Bow and stem */}
          <circle
            cx="0"
            cy={-R - 78}
            r="30"
            fill="none"
            stroke="url(#pw-rim)"
            strokeWidth="12"
          />
          <rect
            x="-22"
            y={-R - 58}
            width="44"
            height="36"
            rx="6"
            fill="url(#pw-rim)"
          />
          {/* Case */}
          <circle r={R + 26} fill="url(#pw-rim)" />
          <circle r={R + 6} fill="#3a2b12" />
          <circle r={R} fill="url(#pw-face)" />
          {ticks}
          {numerals.map((n, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r = R - 72;
            return (
              <text
                key={n}
                x={Math.sin(a) * r}
                y={-Math.cos(a) * r + 12}
                textAnchor="middle"
                fontFamily={SERIF_LATIN}
                fontSize={38}
                fill={DOC.ink}
                opacity={0.9}
              >
                {n}
              </text>
            );
          })}
          {/* Hands */}
          <g transform={`rotate(${hourAngle})`}>
            <path
              d="M -7 30 L -4 -150 L 0 -170 L 4 -150 L 7 30 Z"
              fill={DOC.ink}
            />
          </g>
          <g transform={`rotate(${minuteAngle})`}>
            <path
              d="M -5 34 L -3 -225 L 0 -245 L 3 -225 L 5 34 Z"
              fill={DOC.ink}
            />
          </g>
          <g transform={`rotate(${secondAngle})`}>
            <line
              x1="0"
              y1="40"
              x2="0"
              y2="-215"
              stroke={DOC.red}
              strokeWidth="2"
            />
            <circle cy="-215" r="4" fill={DOC.red} />
          </g>
          <circle r="9" fill={DOC.ink} />
          <circle r="3.5" fill="#cfc3a6" />
          {/* Glass */}
          <circle r={R} fill="url(#pw-gleam)" />
        </svg>
      </div>
      {caption ? (
        <div
          style={{
            position: "absolute",
            bottom: 90,
            fontFamily: SERIF_LATIN,
            fontSize: 34,
            letterSpacing: 10,
            color: DOC.paperDark,
            opacity: 0.85 * easeOut(ramp(frame, captionAt, captionAt + 30)),
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
