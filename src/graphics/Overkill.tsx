import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

type OverkillProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * A small task pointed at a large model, with the quota each choice costs.
 *
 * Illustrates the narration's point that the strongest model is not always the
 * right one. The circles are drawn to scale against each other and the quota
 * bars underneath give the cost, so the mismatch is visible rather than
 * asserted.
 */
export const Overkill: React.FC<OverkillProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const taskR = height * 0.085;
  const modelR = height * 0.235;

  const taskX = width * 0.82;
  const modelX = width * 0.28;
  const centreY = height * 0.36;

  const taskIn = spring({ frame: local, fps, config: { damping: 200 } });
  const modelIn = spring({ frame: local - 10, fps, config: { damping: 200 } });
  const arrow = interpolate(local - 20, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bars = [
    { label: "מודל מתאים", fraction: 0.22, at: 40 },
    { label: "המודל הכבד ביותר", fraction: 0.92, at: 52 },
  ];

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {/* Task, drawn small. */}
        <circle
          cx={taskX}
          cy={centreY}
          r={taskR * taskIn}
          fill={`${COLORS.accent}26`}
          stroke={COLORS.accent}
          strokeWidth={2}
        />
        {/* Model, drawn to the same scale. */}
        <circle
          cx={modelX}
          cy={centreY}
          r={modelR * modelIn}
          fill="rgba(255,255,255,0.04)"
          stroke={COLORS.textMuted}
          strokeWidth={2}
          strokeDasharray="7 6"
        />
        {/* The task sent at it. */}
        <path
          d={`M ${taskX - taskR - 14} ${centreY} L ${modelX + modelR + 14} ${centreY}`}
          pathLength={1}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={2.5}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          // `left`, matching the SVG's left-origin coordinates. CSS `right`
          // inside an RTL container would mirror the label onto the other
          // circle.
          left: taskX - width * 0.1,
          top: centreY + taskR + height * 0.03,
          width: width * 0.2,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.055,
          fontWeight: 700,
          color: COLORS.accent,
          opacity: taskIn,
        }}
      >
        לסכם פסקה
      </div>

      <div
        style={{
          position: "absolute",
          left: modelX - modelR,
          top: centreY - height * 0.03,
          width: modelR * 2,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.055,
          fontWeight: 700,
          color: COLORS.textMuted,
          opacity: modelIn,
        }}
      >
        המודל הכבד ביותר
      </div>

      {/* What each choice costs from the quota. */}
      <div
        style={{
          position: "absolute",
          right: 0,
          left: 0,
          top: height * 0.68,
          display: "flex",
          flexDirection: "column",
          gap: height * 0.055,
        }}
      >
        {bars.map((bar) => {
          const grow = spring({
            frame: local - bar.at,
            fps,
            config: { damping: 200, stiffness: 80 },
          });
          const heavy = bar.fraction > 0.5;

          return (
            <div
              key={bar.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: width * 0.025,
              }}
            >
              <div
                style={{
                  width: width * 0.3,
                  flexShrink: 0,
                  fontFamily,
                  fontSize: height * 0.05,
                  fontWeight: 600,
                  color: heavy ? COLORS.textMuted : COLORS.text,
                }}
              >
                {bar.label}
              </div>
              <div
                style={{
                  flex: 1,
                  height: height * 0.075,
                  borderRadius: height * 0.04,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${bar.fraction * grow * 100}%`,
                    borderRadius: height * 0.04,
                    background: heavy
                      ? `repeating-linear-gradient(115deg, ${COLORS.surfaceRaised} 0 12px, ${COLORS.surface} 12px 24px)`
                      : COLORS.accent,
                    border: heavy
                      ? "1.5px solid rgba(255,255,255,0.14)"
                      : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          fontFamily,
          fontSize: height * 0.048,
          fontWeight: 500,
          color: COLORS.textMuted,
          opacity: interpolate(local, [70, 86], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        אותה תוצאה — יותר זמן ויותר מכסה
      </div>
    </div>
  );
};
