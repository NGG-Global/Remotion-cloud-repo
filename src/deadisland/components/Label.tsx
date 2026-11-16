import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TYPE } from "../fonts";

/**
 * The only on-screen type in the film: a small identification in the lower
 * corner (a year, a studio, a development version). It fades; it never moves.
 */
export const Label: React.FC<{ readonly line: string; readonly sub?: string }> = ({
  line,
  sub,
}) => {
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
          borderLeft: "2px solid rgba(255,255,255,0.75)",
          textShadow: "0 1px 12px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
        }}
      >
        <div
          style={{
            fontFamily: TYPE.sans,
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: 0.3,
            color: "#f4f1ea",
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
              fontSize: 24,
              color: "rgba(244,241,234,0.82)",
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
