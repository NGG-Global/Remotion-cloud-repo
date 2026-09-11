import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  DOC,
  easeInOut,
  easeOut,
  hash,
  mix,
  ramp,
  SERIF_LATIN,
} from "../theme";

/** A drop of red ink spreading in the dark. The film's stand-in for violence. */
export const InkDrop: React.FC<{
  readonly at?: number;
  readonly x?: number;
  readonly y?: number;
  readonly size?: number;
}> = ({ at = 0, x = 960, y = 540, size = 520 }) => {
  const frame = useCurrentFrame();
  const t = easeOut(ramp(frame, at, at + 70));
  const settle = easeInOut(ramp(frame, at + 70, at + 200));
  const r = size * (0.15 + 0.85 * t) * (1 + settle * 0.12);
  const lobes = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + hash(i) * 0.5;
    const d = r * (0.55 + hash(i * 3) * 0.35) * t;
    lobes.push(
      <circle
        key={i}
        cx={x + Math.cos(a) * d * 0.6}
        cy={y + Math.sin(a) * d * 0.45}
        r={r * (0.35 + hash(i * 5) * 0.3)}
        fill={DOC.red}
      />,
    );
  }
  return (
    <AbsoluteFill>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", left: 0, top: 0, filter: "blur(2px)" }}
      >
        <g opacity={0.9 * t}>
          <ellipse cx={x} cy={y} rx={r * 0.8} ry={r * 0.6} fill={DOC.redDeep} />
          {lobes}
          <ellipse cx={x} cy={y} rx={r * 0.55} ry={r * 0.42} fill={DOC.red} />
        </g>
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 40% at ${(x / 1920) * 100}% ${(y / 1080) * 100}%, rgba(168,23,31,${0.25 * t}) 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** A single red stroke crossing the frame. */
export const Strike: React.FC<{
  readonly at: number;
  readonly cross?: boolean;
}> = ({ at, cross = true }) => {
  const frame = useCurrentFrame();
  const a = easeOut(ramp(frame, at, at + 14));
  const b = easeOut(ramp(frame, at + 10, at + 24));
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <line
        x1={560}
        y1={180}
        x2={560 + 800 * a}
        y2={180 + 720 * a}
        stroke={DOC.red}
        strokeWidth={14}
        strokeLinecap="round"
        opacity={0.92}
      />
      {cross ? (
        <line
          x1={1360}
          y1={180}
          x2={1360 - 800 * b}
          y2={180 + 720 * b}
          stroke={DOC.red}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={0.92}
        />
      ) : null}
    </svg>
  );
};

/**
 * A large numeral or short Latin word, the only kind of type the film puts
 * on screen at size: a year, a count.
 */
export const BigMark: React.FC<{
  readonly text: string;
  readonly delay?: number;
  readonly size?: number;
  readonly color?: string;
}> = ({ text, delay = 0, size = 300, color = DOC.paperDark }) => {
  const frame = useCurrentFrame();
  const t = easeOut(ramp(frame, delay, delay + 40));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: SERIF_LATIN,
          fontSize: size,
          fontWeight: 500,
          letterSpacing: size * 0.04,
          color,
          opacity: t,
          transform: `scale(${mix(0.96, 1, t)})`,
          textShadow: "0 0 60px rgba(0,0,0,0.9)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Modern headlines: bright cards sliding in over the dark, each with a bold
 * line and grey text bars. The words are the kind that were printed.
 */
export const Headlines: React.FC<{
  readonly start?: number;
  readonly interval: number;
  readonly words: readonly string[];
}> = ({ start = 0, interval, words }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {words.map((w, i) => {
        const land = start + i * interval;
        const t = easeOut(ramp(frame, land, land + 12));
        if (t <= 0) return null;
        const drift = (frame - land) * 0.25;
        const x = 200 + hash(i * 3) * 900;
        const y = 120 + hash(i * 5) * 560;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y + (1 - t) * 60 - drift,
              width: 720,
              padding: "34px 40px",
              background: "#f4f1ea",
              color: "#111",
              boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
              transform: `rotate(${hash(i * 7) * 6 - 3}deg) scale(${mix(0.9, 1, t)})`,
              opacity: t,
              fontFamily: "Inter, Helvetica, Arial, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: 46,
                fontWeight: 800,
                letterSpacing: -1,
                lineHeight: 1.05,
              }}
            >
              {w}
            </div>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[0.95, 0.85, 0.6].map((wf, k) => (
                <div
                  key={k}
                  style={{
                    height: 12,
                    width: `${wf * 100}%`,
                    background: "#bfbbb2",
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 24,
                width: 10,
                height: 10,
                borderRadius: 5,
                background: DOC.red,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * A journal article under a desk lamp, and the stamps a journal puts on a
 * paper it no longer stands behind.
 */
export const JournalNotice: React.FC<{
  readonly concernAt: number;
  readonly correctionAt: number;
}> = ({ concernAt, correctionAt }) => {
  const frame = useCurrentFrame();
  const appear = easeOut(ramp(frame, 0, 30));
  const s1 = easeOut(ramp(frame, concernAt, concernAt + 10));
  const s2 = easeOut(ramp(frame, correctionAt, correctionAt + 10));
  const stamp = (
    t: number,
    text: string,
    y: number,
    rot: number,
    year: string,
  ) => (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: y,
        transform: `rotate(${rot}deg) scale(${mix(1.6, 1, t)})`,
        opacity: t,
        border: `6px solid ${DOC.red}`,
        color: DOC.red,
        padding: "10px 26px",
        fontFamily: SERIF_LATIN,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: 4,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        mixBlendMode: "multiply",
      }}
    >
      {text}
      <span
        style={{
          fontSize: 24,
          marginLeft: 22,
          letterSpacing: 2,
          verticalAlign: "middle",
        }}
      >
        {year}
      </span>
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(50% 60% at 50% 40%, rgba(255,230,190,0.16) 0%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 1180,
          height: 860,
          background: "#f1ede4",
          boxShadow: "0 40px 90px rgba(0,0,0,0.7)",
          opacity: appear,
          transform: `translateY(${(1 - appear) * 40 + 60}px)`,
          padding: "70px 90px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 14,
            width: 260,
            background: "#333",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            height: 34,
            width: "84%",
            background: "#222",
            marginBottom: 14,
          }}
        />
        <div
          style={{
            height: 34,
            width: "62%",
            background: "#222",
            marginBottom: 46,
          }}
        />
        <div style={{ display: "flex", gap: 40 }}>
          {[0, 1].map((col) => (
            <div
              key={col}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {Array.from({ length: 18 }).map((_, k) => (
                <div
                  key={k}
                  style={{
                    height: 9,
                    width: `${70 + hash(col * 40 + k) * 30}%`,
                    background: "#b7b2a8",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {stamp(s1, "Expression of Concern", 300, -8, "2024")}
        {stamp(s2, "Correction", 470, 5, "2025")}
      </div>
    </AbsoluteFill>
  );
};
