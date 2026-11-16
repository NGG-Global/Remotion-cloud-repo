import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TYPE } from "../fonts";

/**
 * The only on-screen type in the film: a small identification in the lower
 * corner (a year, a studio, a development version). It fades; it never moves.
 */
export const Label: React.FC<{
  readonly line: string;
  readonly sub?: string;
  /** "dark" sets dark type, for labels that sit on a white card. */
  readonly tone?: "light" | "dark";
}> = ({ line, sub, tone = "light" }) => {
  const dark = tone === "dark";
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 14, durationInFrames - 14, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const dir = (s: string) => (/[֐-׿]/.test(s) ? "rtl" : "ltr");
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <div
        style={{
          position: "absolute",
          left: 96,
          bottom: 84,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingLeft: 18,
          borderLeft: dark
            ? "2px solid rgba(20,20,20,0.75)"
            : "2px solid rgba(255,255,255,0.75)",
          textShadow: dark
            ? "none"
            : "0 1px 12px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
        }}
      >
        <div
          style={{
            fontFamily: TYPE.sans,
            fontWeight: 500,
            fontSize: 40,
            letterSpacing: 0.3,
            color: dark ? "#161616" : "#f4f1ea",
            direction: dir(line),
            textAlign: "left",
          }}
        >
          {line}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: TYPE.sans,
              fontWeight: 400,
              fontSize: 27,
              color: dark ? "rgba(22,22,22,0.8)" : "rgba(244,241,234,0.82)",
              direction: dir(sub),
              textAlign: "left",
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
