import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, clamp01, easeOut, lastHitAge, useClock } from "../clock";
import { Grain } from "../components/stage";
import { faces, GLASS } from "../theme";

type WindowCleanProps = {
  readonly hits: readonly number[];
};

export const WindowClean: React.FC<WindowCleanProps> = ({ hits }) => {
  const { time, durationInFrames, fps } = useClock();
  const age = lastHitAge(time, hits);
  const strokes = hits.filter((h) => h <= time).length;
  const strokeP = Number.isFinite(age) ? easeOut(clamp01(age / 0.23)) : 1;
  const lane = (strokes - 1) % 4;
  const squeegeeX = Number.isFinite(age) ? -160 + strokeP * 320 : 160;
  const ken = clamp(time, [0, durationInFrames / fps], [1.12, 1.2]);
  const frame = faces(GLASS.frame);
  const glove = faces(GLASS.glove);
  const clean = Math.min(1, strokes / Math.max(1, hits.length));

  return (
    <AbsoluteFill style={{ backgroundColor: GLASS.paper, overflow: "hidden" }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 900"
        style={{ transform: `scale(${ken})`, transformOrigin: "50% 42%" }}
      >
        <rect x="0" y="0" width="800" height="900" fill={GLASS.paper} />
        <rect
          x="70"
          y="70"
          width="660"
          height="720"
          rx="90"
          fill={frame.edge}
        />
        <rect
          x="88"
          y="88"
          width="624"
          height="684"
          rx="78"
          fill={frame.face}
        />
        <rect x="88" y="88" width="624" height="36" rx="18" fill={frame.lit} />
        <rect
          x="130"
          y="130"
          width="540"
          height="560"
          rx="36"
          fill={GLASS.sky}
        />
        <ellipse
          cx="430"
          cy="250"
          rx="90"
          ry="90"
          fill={GLASS.light}
          opacity="0.95"
        />
        <path
          d="M130 520 C 250 460, 360 540, 400 500 C 470 440, 560 510, 670 470 L 670 690 L 130 690 Z"
          fill={GLASS.hill}
        />
        <path
          d="M130 590 C 280 540, 420 620, 670 560 L 670 690 L 130 690 Z"
          fill="#5e8c78"
          opacity="0.7"
        />
        <rect
          x="130"
          y="130"
          width="540"
          height="560"
          rx="36"
          fill={GLASS.ink}
          opacity={0.28 * (1 - clean)}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const cleared = i < strokes * 1.4;
          return (
            <rect
              key={i}
              x="140"
              y={150 + i * 85}
              width="520"
              height="70"
              rx="8"
              fill="#6d5a72"
              opacity={cleared ? 0.02 : 0.22}
            />
          );
        })}
        <line
          x1="180"
          y1="180"
          x2="320"
          y2="240"
          stroke="#fff"
          strokeWidth="10"
          opacity={0.25 + clean * 0.45}
          strokeLinecap="round"
        />
        <line
          x1="200"
          y1="210"
          x2="280"
          y2="246"
          stroke="#fff"
          strokeWidth="5"
          opacity={0.18 + clean * 0.35}
          strokeLinecap="round"
        />
        <rect
          x="90"
          y="700"
          width="620"
          height="36"
          rx="8"
          fill={faces(GLASS.sill).face}
        />
        <rect
          x="90"
          y="700"
          width="620"
          height="10"
          fill={faces(GLASS.sill).lit}
        />

        <g transform={`translate(${400 + squeegeeX} ${520 + (lane % 2) * 40})`}>
          <rect
            x="-70"
            y="-14"
            width="140"
            height="28"
            rx="8"
            fill={GLASS.ink}
          />
          <rect x="-66" y="-18" width="132" height="16" rx="6" fill="#c5d0d4" />
          <rect x="-8" y="10" width="18" height="90" rx="6" fill={GLASS.ink} />
          <ellipse
            cx="2"
            cy="118"
            rx="36"
            ry="28"
            fill={glove.face}
            stroke={glove.edge}
            strokeWidth="5"
          />
          <ellipse
            cx="2"
            cy="108"
            rx="22"
            ry="12"
            fill={glove.lit}
            opacity="0.6"
          />
        </g>
      </svg>
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
