import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DOC, easeInOut, easeOut, ramp } from "../theme";

/**
 * Four ways out, and no way to tell which he took. Four dark doorways in a
 * row; each is lit in turn as the narration offers it, and behind each is
 * a different emblem: a grave, bars, a hospital cross, a departing ship.
 */
export const Doors: React.FC<{
  readonly at: readonly [number, number, number, number];
  readonly allDarkAt?: number;
}> = ({ at, allDarkAt }) => {
  const frame = useCurrentFrame();
  const dark =
    allDarkAt === undefined
      ? 0
      : easeInOut(ramp(frame, allDarkAt, allDarkAt + 40));
  const stroke = DOC.fogLight;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 70, direction: "rtl" }}>
        {at.map((start, i) => {
          const lit = easeOut(ramp(frame, start, start + 26)) * (1 - dark);
          const glow = lit * (0.7 + 0.3 * Math.sin(frame * 0.09 + i));
          return (
            <div
              key={i}
              style={{ position: "relative", width: 320, height: 620 }}
            >
              <svg width={320} height={620} viewBox="0 0 320 620">
                <defs>
                  <linearGradient
                    id={`door-light-${i}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0"
                      stopColor={DOC.gasHot}
                      stopOpacity={0.55 * glow}
                    />
                    <stop
                      offset="1"
                      stopColor={DOC.gas}
                      stopOpacity={0.08 * glow}
                    />
                  </linearGradient>
                </defs>
                {/* Arch */}
                <path
                  d="M 30 620 L 30 190 C 30 60 290 60 290 190 L 290 620 Z"
                  fill="#0a0b0f"
                  stroke={stroke}
                  strokeOpacity={0.2}
                  strokeWidth={3}
                />
                <path
                  d="M 50 620 L 50 200 C 50 90 270 90 270 200 L 270 620 Z"
                  fill={`url(#door-light-${i})`}
                />
                <g
                  stroke={stroke}
                  strokeWidth={5}
                  fill="none"
                  strokeLinecap="round"
                  opacity={lit}
                >
                  {i === 0 ? (
                    <g transform="translate(160 370)">
                      <path d="M -60 120 L -60 -40 C -60 -110 60 -110 60 -40 L 60 120" />
                      <line x1="0" y1="-60" x2="0" y2="30" />
                      <line x1="-30" y1="-30" x2="30" y2="-30" />
                    </g>
                  ) : null}
                  {i === 1 ? (
                    <g transform="translate(160 360)">
                      {[-80, -40, 0, 40, 80].map((x) => (
                        <line key={x} x1={x} y1={-130} x2={x} y2={150} />
                      ))}
                      <line x1="-95" y1="-30" x2="95" y2="-30" />
                    </g>
                  ) : null}
                  {i === 2 ? (
                    <g transform="translate(160 360)">
                      <path d="M -30 -110 L 30 -110 L 30 -40 L 100 -40 L 100 20 L 30 20 L 30 90 L -30 90 L -30 20 L -100 20 L -100 -40 L -30 -40 Z" />
                    </g>
                  ) : null}
                  {i === 3 ? (
                    <g transform="translate(160 380)">
                      <path d="M -110 60 L 110 60 L 80 110 L -80 110 Z" />
                      <line x1="0" y1="60" x2="0" y2="-110" />
                      <path d="M 0 -100 L 90 -20 L 0 -10 Z" />
                      <path
                        d="M -120 130 q 30 20 60 0 t 60 0 t 60 0"
                        opacity={0.6}
                      />
                    </g>
                  ) : null}
                </g>
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
