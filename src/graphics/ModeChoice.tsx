import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type Choice = {
  /** The conditions, each with the frame it is named. */
  readonly conditions: readonly {
    readonly label: string;
    readonly at: number;
  }[];
  /** The answer. */
  readonly verdict: string;
  /** Frame at which the answer lands. */
  readonly at: number;
  /** Latin verdicts (Cowork) need their own text direction. */
  readonly latin?: boolean;
};

type ModeChoiceProps = {
  readonly width: number;
  readonly height: number;
  readonly question: string;
  readonly rows: readonly Choice[];
};

/**
 * The two cases, and which mode each one is.
 *
 * A decision this clean is better as a pair of finished rows than as a
 * flowchart: the conditions arrive as the narrator lists them, and the answer
 * lands at the end of the row it belongs to. Nothing branches, because in the
 * narration nothing branches — there are two situations and two answers.
 */
export const ModeChoice: React.FC<ModeChoiceProps> = ({
  width,
  height,
  question,
  rows,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rowHeight = height * 0.3;
  const top = height * 0.24;
  const VERDICT = { width: width * 0.24, height: rowHeight * 0.62 };

  return (
    <div style={{ position: "relative", width, height }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          textAlign: "center",
          direction: "rtl",
          fontFamily,
          fontSize: 52,
          fontWeight: 800,
          color: COLORS.text,
          opacity: interpolate(frame, [4, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {question}
      </div>

      {rows.map((row, i) => {
        const y = top + i * (rowHeight + height * 0.06);
        const landed = spring({
          frame: frame - row.at,
          fps,
          config: { damping: 46, stiffness: 190, mass: 0.8 },
        });

        return (
          <React.Fragment key={i}>
            {/* Conditions, from the right, in the order they are said. */}
            <div
              style={{
                position: "absolute",
                right: width * 0.04,
                top: y,
                width: width * 0.52,
                height: rowHeight,
                direction: "rtl",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                alignContent: "center",
                gap: 14,
              }}
            >
              {row.conditions.map((condition, c) => {
                const show = interpolate(
                  frame - condition.at,
                  [0, 16],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                );
                if (show <= 0) {
                  return null;
                }
                return (
                  <span
                    key={c}
                    style={{
                      fontFamily,
                      fontSize: 34,
                      fontWeight: 700,
                      color: COLORS.text,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      padding: "12px 24px",
                      borderRadius: 14,
                      whiteSpace: "nowrap",
                      opacity: show,
                      transform: `translateX(${(1 - show) * -20}px)`,
                    }}
                  >
                    {condition.label}
                  </span>
                );
              })}
            </div>

            {/* The answer. */}
            {frame >= row.at - 2 ? (
              <div
                style={{
                  position: "absolute",
                  left: width * 0.13,
                  top: y + (rowHeight - VERDICT.height) / 2,
                  width: VERDICT.width,
                  height: VERDICT.height,
                  borderRadius: 16,
                  background: COLORS.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily,
                  fontSize: 46,
                  fontWeight: 800,
                  color: COLORS.background,
                  direction: row.latin ? "ltr" : "rtl",
                  opacity: Math.min(1, landed * 1.3),
                  transform: `scale(${0.78 + Math.min(1, landed) * 0.22})`,
                  boxShadow: `0 0 ${54 * Math.min(1, landed)}px rgba(217,119,87,0.42)`,
                }}
              >
                {row.verdict}
              </div>
            ) : null}

            {/* A rule from the conditions to the answer, so the row reads as
                one statement rather than two labels. */}
            <svg
              width={width}
              height={height}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
              }}
            >
              <line
                x1={width * 0.42}
                y1={y + rowHeight / 2}
                x2={width * 0.385}
                y2={y + rowHeight / 2}
                stroke={COLORS.accent}
                strokeWidth={4}
                strokeLinecap="round"
                opacity={Math.min(1, landed) * 0.8}
              />
              <path
                d={`M ${width * 0.385} ${y + rowHeight / 2 - 11} L ${width * 0.368} ${y + rowHeight / 2} L ${width * 0.385} ${y + rowHeight / 2 + 11} Z`}
                fill={COLORS.accent}
                opacity={Math.min(1, landed) * 0.8}
              />
            </svg>
          </React.Fragment>
        );
      })}
    </div>
  );
};
