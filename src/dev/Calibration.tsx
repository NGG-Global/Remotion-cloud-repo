import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

/**
 * Development-only helper: renders the UI screenshot with a labelled
 * percentage grid so callout regions can be read off precisely.
 * Not registered for delivery — render it with `npx remotion still Calibration`.
 */
const STEP = 5;

export const Calibration: React.FC = () => {
  const lines = [];
  for (let p = 0; p <= 100; p += STEP) {
    const major = p % 10 === 0;
    lines.push(
      <div
        key={`v${p}`}
        style={{
          position: "absolute",
          left: `${p}%`,
          top: 0,
          bottom: 0,
          width: major ? 2 : 1,
          background: major ? "rgba(255,0,80,0.9)" : "rgba(255,0,80,0.35)",
        }}
      />,
    );
    lines.push(
      <div
        key={`h${p}`}
        style={{
          position: "absolute",
          top: `${p}%`,
          left: 0,
          right: 0,
          height: major ? 2 : 1,
          background: major ? "rgba(0,120,255,0.9)" : "rgba(0,120,255,0.35)",
        }}
      />,
    );
    if (major) {
      lines.push(
        <div
          key={`vl${p}`}
          style={{
            position: "absolute",
            left: `${p}%`,
            top: 4,
            fontSize: 22,
            fontWeight: 700,
            color: "#ff0050",
            background: "rgba(255,255,255,0.85)",
            padding: "1px 4px",
          }}
        >
          {p}
        </div>,
      );
      lines.push(
        <div
          key={`hl${p}`}
          style={{
            position: "absolute",
            top: `${p}%`,
            left: 4,
            fontSize: 22,
            fontWeight: 700,
            color: "#0078ff",
            background: "rgba(255,255,255,0.85)",
            padding: "1px 4px",
          }}
        >
          {p}
        </div>,
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <Img
        src={staticFile("img/claude-home.jpg")}
        style={{ width: "100%", height: "100%" }}
      />
      {lines}
    </AbsoluteFill>
  );
};
