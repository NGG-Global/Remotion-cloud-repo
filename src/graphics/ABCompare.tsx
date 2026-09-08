import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon } from "./LineIcon";

type ABCompareProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Frame at which the "length is not the point" beat lands. */
  readonly lengthAt?: number;
  /** Frame at which the differences are called out. */
  readonly diffAt?: number;
};

/** Output lines per column. The right column runs longer on purpose. */
const LINES = {
  haiku: [0.82, 0.7, 0.9, 0.58],
  sonnet: [0.86, 0.74, 0.92, 0.66, 0.8, 0.54],
} as const;

/** Which Sonnet lines are marked as carrying something Haiku missed. */
const DIFFERENT = [1, 4] as const;

/**
 * The same task run on two models, side by side.
 *
 * Illustrates the experiment the narration recommends, including the part
 * people get wrong: the longer answer is struck out as the wrong thing to
 * measure, and the marked lines are what to actually look for.
 */
export const ABCompare: React.FC<ABCompareProps> = ({
  width,
  height,
  delay = 0,
  lengthAt = 60,
  diffAt = 100,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const colW = width * 0.46;
  // The verdict gets its own row between the task and the columns: squeezed
  // into the gap between them it wrapped and became unreadable.
  const verdictTop = height * 0.13;
  const colTop = height * 0.29;
  const colH = height * 0.7;

  const taskIn = spring({ frame: local, fps, config: { damping: 200 } });

  const column = (
    name: string,
    lines: readonly number[],
    right: number,
    startAt: number,
    marked: boolean,
  ) => (
    <div
      style={{
        position: "absolute",
        top: colTop,
        right,
        width: colW,
        height: colH,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        border: `1px solid ${marked ? `${COLORS.accent}59` : "rgba(255,255,255,0.08)"}`,
        padding: `${height * 0.045}px ${colW * 0.07}px`,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: height * 0.062,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: height * 0.045,
        }}
      >
        {name}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: height * 0.032,
        }}
      >
        {lines.map((w, i) => {
          const grow = interpolate(local - startAt - i * 5, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isDiff = marked && (DIFFERENT as readonly number[]).includes(i);
          const lit = isDiff
            ? interpolate(local - diffAt, [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

          return (
            <div
              key={i}
              style={{ position: "relative", height: height * 0.038 }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${w * grow * 100}%`,
                  borderRadius: 4,
                  backgroundColor: COLORS.textMuted,
                  opacity: 0.4 + lit * 0.1,
                }}
              />
              {isDiff ? (
                <div
                  style={{
                    position: "absolute",
                    inset: `-${height * 0.012}px`,
                    right: `-${height * 0.012}px`,
                    width: `calc(${w * 100}% + ${height * 0.024}px)`,
                    borderRadius: 7,
                    border: `2px solid ${COLORS.accent}`,
                    opacity: lit,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );

  // The length comparison, shown then dismissed.
  const lengthIn = interpolate(local - lengthAt, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lengthOut = interpolate(local - diffAt + 12, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* One task, feeding both columns. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          opacity: taskIn,
          fontFamily,
          fontSize: height * 0.062,
          fontWeight: 600,
          color: COLORS.accent,
        }}
      >
        <LineIcon
          name="report"
          size={height * 0.085}
          delay={delay + 2}
          idle={false}
        />
        אותה משימה — דוח שכבר קראתם
      </div>

      {column("Haiku", LINES.haiku, 0, 18, false)}
      {column("Sonnet", LINES.sonnet, width - colW, 30, true)}

      {/* "The longer answer is not the point." */}
      <div
        style={{
          position: "absolute",
          top: verdictTop,
          right: 0,
          left: 0,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.058,
          fontWeight: 700,
          color: COLORS.textMuted,
          opacity: lengthIn * (1 - lengthOut),
        }}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          מי ארוך יותר
          <span
            style={{
              position: "absolute",
              top: "52%",
              right: 0,
              left: 0,
              height: 2.5,
              backgroundColor: "#c0563c",
              transform: `scaleX(${lengthIn})`,
              transformOrigin: "right center",
            }}
          />
        </span>
      </div>

      {/* What to look for instead. */}
      <div
        style={{
          position: "absolute",
          top: verdictTop,
          right: 0,
          left: 0,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.065,
          fontWeight: 800,
          color: COLORS.accent,
          opacity: interpolate(local - diffAt, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        מה פוספס
      </div>
    </div>
  );
};
