import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

type EffortCompareProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

const BARS = [
  { label: "ההסבר על המשימה", fraction: 1.0, tone: "long" as const },
  { label: "המשימה עצמה", fraction: 0.22, tone: "short" as const },
];

/**
 * Two bars: a long one for explaining the task, a stub for doing it.
 *
 * Illustrates the closing caution — if the task is shorter than the
 * explanation, just do it. The joke only lands if the disparity is visible at
 * a glance, so the bars are drawn to the same scale and the long one arrives
 * first.
 */
export const EffortCompare: React.FC<EffortCompareProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const barH = height * 0.17;
  const gap = height * 0.13;

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {BARS.map((bar, i) => {
        const start = i * 20;
        const grow = spring({
          frame: local - start,
          fps,
          config: { damping: 200, stiffness: 90 },
        });

        const isLong = bar.tone === "long";
        const top = height * 0.24 + i * (barH + gap);

        return (
          <div
            key={bar.label}
            style={{ position: "absolute", top, right: 0, left: 0 }}
          >
            <div
              style={{
                fontFamily,
                fontSize: height * 0.075,
                fontWeight: 600,
                color: COLORS.textMuted,
                marginBottom: height * 0.03,
                opacity: interpolate(grow, [0, 0.4], [0, 1], {
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {bar.label}
            </div>

            <div
              style={{
                height: barH,
                width: `${bar.fraction * grow * 100}%`,
                borderRadius: barH / 2,
                background: isLong
                  ? `repeating-linear-gradient(115deg, ${COLORS.surfaceRaised} 0 18px, ${COLORS.surface} 18px 36px)`
                  : COLORS.accent,
                border: `1.5px solid ${isLong ? "rgba(255,255,255,0.14)" : COLORS.accent}`,
              }}
            />
          </div>
        );
      })}

      {/* The punchline, once both bars are down. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          fontFamily,
          fontSize: height * 0.088,
          fontWeight: 800,
          color: COLORS.accent,
          opacity: interpolate(local, [58, 74], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(local, [58, 74], [14, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        פשוט תעשו אותה
      </div>
    </div>
  );
};
