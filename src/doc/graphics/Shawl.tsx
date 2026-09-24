import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DOC, easeInOut, easeOut, hash, mix, ramp } from "../theme";

/**
 * A length of patterned cloth under a cold examination lamp. Hands reach in
 * from the edges and pass over it one after another, each leaving a faint
 * mark: a hundred and thirty years of handling, drawn as contamination.
 */
export const Shawl: React.FC<{
  /** Frame at which the hands begin. */
  readonly handsAt: number;
  /** Frames between hands. */
  readonly interval?: number;
  readonly handCount?: number;
  /** Frame at which a cold sample-light sweeps over the cloth. */
  readonly scanAt?: number;
}> = ({ handsAt, interval = 34, handCount = 7, scanAt }) => {
  const frame = useCurrentFrame();
  const appear = easeOut(ramp(frame, 0, 40));
  const scan =
    scanAt === undefined ? 0 : easeInOut(ramp(frame, scanAt, scanAt + 70));

  const daisies = [];
  for (let i = 0; i < 26; i++) {
    const x = 120 + hash(i * 3) * 1500;
    const y = 300 + hash(i * 7) * 460;
    const s = 0.6 + hash(i * 11) * 0.7;
    daisies.push(
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.55}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((p) => (
          <ellipse
            key={p}
            cx="0"
            cy="-16"
            rx="6"
            ry="15"
            fill="#a89a7c"
            transform={`rotate(${p * 45})`}
          />
        ))}
        <circle r="7" fill="#c8a25a" />
      </g>,
    );
  }

  return (
    <AbsoluteFill style={{ background: "#0a0c10", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(55% 60% at 50% 45%, rgba(190,210,235,0.14) 0%, rgba(190,210,235,0.03) 40%, transparent 70%)",
        }}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", left: 0, top: 0, opacity: appear }}
      >
        <defs>
          <linearGradient id="shawl-cloth" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4a3a2e" />
            <stop offset="0.5" stopColor="#6b5442" />
            <stop offset="1" stopColor="#3b2d24" />
          </linearGradient>
          <clipPath id="shawl-clip">
            <path d="M 80 380 C 300 260 700 300 960 280 C 1250 260 1600 300 1840 360 C 1880 520 1860 680 1800 800 C 1500 860 1100 820 800 850 C 500 880 250 820 100 760 C 40 640 60 500 80 380 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#shawl-clip)">
          <rect width="1920" height="1080" fill="url(#shawl-cloth)" />
          {/* Folds */}
          {[0, 1, 2, 3, 4].map((k) => (
            <path
              key={k}
              d={`M ${200 + k * 330} 300 C ${240 + k * 330} 500 ${160 + k * 330} 700 ${220 + k * 330} 880`}
              stroke="rgba(0,0,0,0.45)"
              strokeWidth={60}
              fill="none"
              style={{ filter: "blur(18px)" }}
            />
          ))}
          {daisies}
          {/* Marks left by handling */}
          {Array.from({ length: handCount }).map((_, i) => {
            const t = easeOut(
              ramp(
                frame,
                handsAt + i * interval + 14,
                handsAt + i * interval + 40,
              ),
            );
            const x = 300 + hash(i * 17) * 1300;
            const y = 380 + hash(i * 19) * 380;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={90 * t}
                ry={55 * t}
                fill="rgba(240,230,210,0.10)"
                style={{ filter: "blur(14px)" }}
              />
            );
          })}
          {/* Scan light */}
          {scan > 0 ? (
            <rect
              x={mix(-300, 1920, scan)}
              y="200"
              width="260"
              height="700"
              fill="rgba(180,220,255,0.35)"
              style={{ filter: "blur(22px)" }}
            />
          ) : null}
        </g>
      </svg>
      {/* Hands */}
      {Array.from({ length: handCount }).map((_, i) => {
        const start = handsAt + i * interval;
        const t = ramp(frame, start, start + interval + 10);
        if (t <= 0 || t >= 1) return null;
        const path = Math.sin(t * Math.PI);
        const fromLeft = i % 2 === 0;
        const x = fromLeft ? mix(-420, 700, path) : mix(2340, 1200, path);
        const y = 420 + hash(i * 23) * 300 + Math.sin(t * Math.PI * 2) * 30;
        return (
          <svg
            key={i}
            width={520}
            height={300}
            viewBox="0 0 520 300"
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scaleX(${fromLeft ? 1 : -1}) rotate(${-8 + hash(i) * 16}deg)`,
              opacity: 0.92,
            }}
          >
            <path
              d="M 0 90 L 300 80 C 330 40 360 30 372 60 L 350 95 C 400 88 440 90 470 100 C 480 115 470 122 452 124 L 380 130 L 460 140 C 476 148 472 160 452 162 L 380 160 L 440 175 C 452 186 444 196 428 196 L 360 190 L 400 205 C 408 216 398 224 386 222 L 320 210 C 300 230 260 240 220 235 L 0 220 Z"
              fill={DOC.black}
            />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};
