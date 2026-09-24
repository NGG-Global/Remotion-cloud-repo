import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DOC, easeInOut, easeOut, ramp, SERIF_LATIN } from "../theme";

/**
 * What the detectives did not have. A fingerprint, a helix and a camera
 * surface in turn, each stamped with the year it would arrive, and each
 * fades back to a ghost. The years are the only type on screen.
 */
export const NoTools: React.FC<{
  readonly at: readonly [number, number, number];
  readonly labels?: readonly [string, string, string];
}> = ({ at, labels = ["1901", "1986", "1990s"] }) => {
  const frame = useCurrentFrame();
  const stroke = DOC.text;
  const spots = [-560, 0, 560];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {spots.map((sx, i) => {
        const start = at[i];
        const inT = easeOut(ramp(frame, start, start + 26));
        const ghost = easeInOut(ramp(frame, start + 70, start + 100));
        const alpha = inT * (1 - ghost * 0.7);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + sx,
              top: 500,
              transform: `translate(-50%, -50%) translateY(${(1 - inT) * 26}px)`,
              opacity: alpha,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 34,
            }}
          >
            <svg width={340} height={340} viewBox="-170 -170 340 340">
              <g
                fill="none"
                stroke={stroke}
                strokeWidth={4}
                strokeLinecap="round"
              >
                {i === 0
                  ? [26, 46, 66, 86, 106, 126].map((r, k) => (
                      <path
                        key={r}
                        d={`M ${-r} 40 A ${r} ${r * 1.25} 0 1 1 ${r} 40`}
                        strokeDasharray={r * 7}
                        strokeDashoffset={
                          r *
                          7 *
                          (1 -
                            easeOut(
                              ramp(frame, start + k * 3, start + 24 + k * 3),
                            ))
                        }
                        transform={`translate(0 ${-20 + k * 4})`}
                      />
                    ))
                  : null}
                {i === 1
                  ? Array.from({ length: 9 }).map((_, k) => {
                      const y = -120 + k * 30;
                      const w = Math.cos(k * 0.8 + frame * 0.04) * 80;
                      return (
                        <g key={k}>
                          <line x1={-w} y1={y} x2={w} y2={y} opacity={0.7} />
                          <circle
                            cx={-w}
                            cy={y}
                            r={7}
                            fill={k % 3 === 0 ? DOC.red : stroke}
                            stroke="none"
                          />
                          <circle
                            cx={w}
                            cy={y}
                            r={7}
                            fill={stroke}
                            stroke="none"
                          />
                        </g>
                      );
                    })
                  : null}
                {i === 2 ? (
                  <g>
                    <rect x="-110" y="-50" width="150" height="90" rx="8" />
                    <path d="M 40 -25 L 110 -60 L 110 50 L 40 15 Z" />
                    <line x1="-60" y1="40" x2="-60" y2="110" />
                    <line x1="-100" y1="110" x2="-20" y2="110" />
                    <circle cx="-35" cy="-5" r="20" />
                    <circle
                      cx="-35"
                      cy="-5"
                      r="6"
                      fill={DOC.red}
                      stroke="none"
                      opacity={0.5 + 0.5 * Math.sin(frame * 0.3)}
                    />
                  </g>
                ) : null}
              </g>
            </svg>
            <div
              style={{
                fontFamily: SERIF_LATIN,
                fontSize: 44,
                letterSpacing: 6,
                color: DOC.paperDark,
                opacity: easeOut(ramp(frame, start + 22, start + 46)),
              }}
            >
              {labels[i]}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
