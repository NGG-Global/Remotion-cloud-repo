import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

type PathShortcutProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * A long winding route and a direct one, arriving at the same place.
 *
 * Illustrates the closing line: Claude does not replace the expertise, it
 * shortens the way to it. Both paths end at the same marker on purpose — the
 * destination is unchanged, only the route is.
 */
export const PathShortcut: React.FC<PathShortcutProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  // Right to left, matching the narration's reading direction.
  const startX = width * 0.9;
  const endX = width * 0.12;
  const midY = height * 0.5;

  const winding = `M ${startX} ${midY} C ${width * 0.78} ${height * 0.05}, ${width * 0.6} ${height * 0.95}, ${width * 0.46} ${height * 0.5} S ${width * 0.3} ${height * 0.08}, ${endX} ${midY}`;
  const direct = `M ${startX} ${midY} L ${endX} ${midY}`;

  const drawWinding = interpolate(local, [0, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drawDirect = interpolate(local - 42, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flagIn = spring({
    frame: local - 56,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        <path
          d={winding}
          pathLength={1}
          fill="none"
          stroke={COLORS.textMuted}
          strokeWidth={2.5}
          strokeDasharray={1}
          strokeDashoffset={1 - drawWinding}
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          d={direct}
          pathLength={1}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={5}
          strokeDasharray={1}
          strokeDashoffset={1 - drawDirect}
          strokeLinecap="round"
        />
        <circle cx={startX} cy={midY} r={9} fill={COLORS.textMuted} />
      </svg>

      {/* The destination. */}
      <div
        style={{
          position: "absolute",
          left: endX,
          top: midY,
          transform: `translate(-50%, -50%) scale(${flagIn})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: height * 0.05,
        }}
      >
        <div
          style={{
            width: height * 0.2,
            height: height * 0.2,
            borderRadius: "50%",
            backgroundColor: COLORS.accent,
            border: `4px solid ${COLORS.background}`,
          }}
        />
        <div
          style={{
            fontFamily,
            fontSize: height * 0.1,
            fontWeight: 700,
            color: COLORS.text,
            direction: "rtl",
            whiteSpace: "nowrap",
          }}
        >
          המומחיות שלכם
        </div>
      </div>
    </div>
  );
};
