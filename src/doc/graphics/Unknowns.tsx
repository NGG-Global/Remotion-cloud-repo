import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DOC, easeInOut, easeOut, ramp } from "../theme";

type Item = "face" | "work" | "why" | "name";

/**
 * The four things nobody knows, shown one at a time as a dark emblem that
 * surfaces, holds, and is taken by the fog. No words: a featureless head, a
 * hand and its tools, an empty heart drawn as a knot, a signature line with
 * nothing on it.
 */
export const Unknowns: React.FC<{
  /** Frame at which each emblem surfaces, in order face, work, why, name. */
  readonly at: readonly [number, number, number, number];
  /** Frames each emblem holds; defaults to the gap to the next one. */
  readonly hold?: number;
  /** Frames the last emblem holds when no explicit hold is given. */
  readonly lastHold?: number;
}> = ({ at, hold, lastHold = 120 }) => {
  const frame = useCurrentFrame();
  const items: Item[] = ["face", "work", "why", "name"];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {items.map((item, i) => {
        const start = at[i];
        const next = at.slice(i + 1).find((v) => v > start && v < 90000);
        const holdFrames =
          hold ?? (next === undefined ? lastHold : next - start - 40);
        const inT = easeOut(ramp(frame, start, start + 30));
        const outT = easeInOut(
          ramp(frame, start + holdFrames, start + holdFrames + 40),
        );
        const o = inT * (1 - outT);
        if (o <= 0) return null;
        const q = easeInOut(ramp(frame, start + 40, start + 90));
        return (
          <div
            key={item}
            style={{
              position: "absolute",
              opacity: o,
              transform: `translateY(${(1 - inT) * 30 - outT * 40}px) scale(${1 + outT * 0.15})`,
              filter: `blur(${outT * 14}px)`,
            }}
          >
            <Emblem item={item} question={q} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Emblem: React.FC<{ item: Item; question: number }> = ({
  item,
  question,
}) => {
  const stroke = DOC.fogLight;
  const qPath = "M 0 -40 C 0 -75 60 -75 60 -40 C 60 -12 30 -12 30 20";
  const qLen = 190;
  const Q = (
    <g transform="translate(150 -30)">
      <path
        d={qPath}
        fill="none"
        stroke={DOC.red}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={qLen}
        strokeDashoffset={qLen * (1 - question)}
        opacity={0.95}
      />
      <circle
        cx="30"
        cy="52"
        r="6"
        fill={DOC.red}
        opacity={question > 0.97 ? 1 : 0}
      />
    </g>
  );
  return (
    <svg width={760} height={520} viewBox="-380 -260 760 520">
      <defs>
        <radialGradient id="unk-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={DOC.gas} stopOpacity="0.16" />
          <stop offset="1" stopColor={DOC.gas} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="250" fill="url(#unk-glow)" />
      {item === "face" ? (
        <g>
          {/* Head and shoulders, featureless */}
          <path
            d="M -70 -150 C -70 -215 70 -215 70 -150 C 70 -95 45 -60 20 -45 L 20 -20 C 110 0 170 60 175 150 L -175 150 C -170 60 -110 0 -20 -20 L -20 -45 C -45 -60 -70 -95 -70 -150 Z"
            fill={DOC.black}
            stroke={stroke}
            strokeWidth={3}
            strokeOpacity={0.55}
          />
          {Q}
        </g>
      ) : null}
      {item === "work" ? (
        <g>
          {/* Three tools: scalpel, cleaver, pen */}
          <g transform="rotate(-25) translate(-150 0)">
            <rect
              x="-8"
              y="-110"
              width="16"
              height="150"
              rx="6"
              fill={DOC.black}
              stroke={stroke}
              strokeWidth={3}
              strokeOpacity={0.55}
            />
            <path
              d="M -8 40 L 8 40 L 3 120 L -3 120 Z"
              fill={stroke}
              opacity={0.8}
            />
          </g>
          <g transform="translate(0 -10)">
            <path
              d="M -60 -120 L 60 -120 L 60 10 L 20 40 L -60 40 Z"
              fill={DOC.black}
              stroke={stroke}
              strokeWidth={3}
              strokeOpacity={0.55}
            />
            <rect
              x="-6"
              y="40"
              width="12"
              height="90"
              fill={DOC.black}
              stroke={stroke}
              strokeWidth={3}
              strokeOpacity={0.55}
            />
          </g>
          <g transform="rotate(25) translate(150 0)">
            <path
              d="M -6 -120 L 6 -120 L 6 70 L 0 110 L -6 70 Z"
              fill={DOC.black}
              stroke={stroke}
              strokeWidth={3}
              strokeOpacity={0.55}
            />
          </g>
          {Q}
        </g>
      ) : null}
      {item === "why" ? (
        <g>
          {/* A knot: motive with no thread to pull */}
          <path
            d="M -120 0 C -120 -90 0 -90 0 0 C 0 90 120 90 120 0 C 120 -90 0 -90 0 0 C 0 90 -120 90 -120 0 Z"
            fill="none"
            stroke={stroke}
            strokeWidth={10}
            strokeOpacity={0.7}
            strokeLinecap="round"
          />
          <path
            d="M -120 0 C -160 -40 -170 -90 -150 -140"
            fill="none"
            stroke={stroke}
            strokeWidth={10}
            strokeOpacity={0.7}
            strokeLinecap="round"
          />
          <path
            d="M 120 0 C 160 40 170 90 150 140"
            fill="none"
            stroke={stroke}
            strokeWidth={10}
            strokeOpacity={0.7}
            strokeLinecap="round"
          />
          {Q}
        </g>
      ) : null}
      {item === "name" ? (
        <g>
          {/* A signature line with the ink stopping short */}
          <line
            x1="-250"
            y1="80"
            x2="250"
            y2="80"
            stroke={stroke}
            strokeWidth={3}
            strokeOpacity={0.6}
          />
          <path
            d="M -230 60 C -200 20 -180 30 -170 60 C -160 85 -140 20 -120 50 C -100 80 -90 40 -70 50"
            fill="none"
            stroke={DOC.red}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={260}
            strokeDashoffset={260 * (1 - question)}
            opacity={0.9}
          />
          <text
            x="-60"
            y="60"
            fontFamily="serif"
            fontSize="44"
            fill={stroke}
            opacity={0.35 * question}
            fontStyle="italic"
          >
            . . .
          </text>
        </g>
      ) : null}
    </svg>
  );
};
