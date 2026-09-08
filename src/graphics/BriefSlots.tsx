import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../components/KineticText";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { BezierFlow } from "./BezierFlow";
import { DocSheet, PLAIN_LINES, STRUCTURED_LINES } from "./parts/DocSheet";

export type BriefSlot = {
  /** Field name, as it reads before the recap. */
  readonly label: string;
  /** What the brief actually says. */
  readonly value: string;
  /** Frame at which the field is filled. */
  readonly at: number;
  /** The question this field answers, named in the recap. */
  readonly question?: string;
  /** Frame at which the recap reaches this field. */
  readonly questionAt?: number;
};

type BriefSlotsProps = {
  readonly width: number;
  readonly height: number;
  readonly slots: readonly BriefSlot[];
  /** Frame at which the output stops being generic. */
  readonly sharpenAt: number;
};

/**
 * The brief filling in, and the output changing because of it.
 *
 * This is the argument of the whole episode in one shot, so it is built as one
 * continuous take rather than a cut per sentence: fields arrive as the narrator
 * says them, the deliverable resolves the moment the brief is complete, and the
 * recap re-labels the same fields with the questions they answered. Cutting
 * between three scenes here would break the causal link the passage depends on.
 */
export const BriefSlots: React.FC<BriefSlotsProps> = ({
  width,
  height,
  slots,
  sharpenAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD = { width: width * 0.47, height: height * 0.9 };
  const cardLeft = width - CARD.width;
  const SHEET = { width: width * 0.29, height: height * 0.72 };
  const sheetLeft = width * 0.045;
  const sheetTop = (height - SHEET.height) / 2;

  const rowGap = (CARD.height - 108) / slots.length;

  const sharp = interpolate(frame - sharpenAt, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Brief to deliverable. The tokens only run once the brief is complete,
          so the movement reads as the cause of the change on the left. */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <BezierFlow
          curve={{
            from: { x: cardLeft - 10, y: height * 0.5 },
            c1: { x: cardLeft - 160, y: height * 0.32 },
            c2: { x: sheetLeft + SHEET.width + 160, y: height * 0.68 },
            to: { x: sheetLeft + SHEET.width + 10, y: height * 0.5 },
          }}
          delay={sharpenAt - 20}
          travel={34}
          stagger={8}
          count={5}
          until={sharpenAt + 26}
          showTrack={false}
        />
      </svg>

      {/* The deliverable. Two sheets crossfade in place, so the page is the
          same page getting better rather than a new page arriving. */}
      <div
        style={{
          position: "absolute",
          left: sheetLeft,
          top: sheetTop,
          width: SHEET.width,
          height: SHEET.height,
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 1 - sharp }}>
          <DocSheet
            width={SHEET.width}
            height={SHEET.height}
            lines={PLAIN_LINES}
            tone={COLORS.textMuted}
            blur={2.2}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: sharp,
            transform: `scale(${0.985 + sharp * 0.015})`,
          }}
        >
          <DocSheet
            width={SHEET.width}
            height={SHEET.height}
            lines={STRUCTURED_LINES}
            tone={COLORS.text}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: SHEET.height + 20,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.accent,
            opacity: interpolate(sharp, [0.5, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          יש עם מה לעבוד
        </div>
      </div>

      {/* The brief. */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: (height - CARD.height) / 2,
          width: CARD.width,
          height: CARD.height,
          borderRadius: 24,
          background: COLORS.surface,
          border: `1px solid rgba(255,255,255,0.09)`,
          direction: "rtl",
          padding: "26px 34px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: COLORS.textMuted,
            opacity: interpolate(frame, [0, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          הבריף
        </div>

        {slots.map((slot, i) => {
          const pop = spring({
            frame: frame - slot.at,
            fps,
            config: { damping: 90, stiffness: 130 },
          });
          if (frame < slot.at - 2) {
            return null;
          }

          // The recap swaps the field name for the question it answered.
          const recap =
            slot.questionAt === undefined
              ? 0
              : interpolate(frame - slot.questionAt, [0, 16], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
          const answered = recap > 0.5;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 84 + i * rowGap,
                right: 34,
                left: 34,
                opacity: pop,
                transform: `translateY(${(1 - pop) * 16}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    padding: "5px 14px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    color: answered ? COLORS.ink : COLORS.textMuted,
                    background: answered
                      ? COLORS.accentSoft
                      : "rgba(255,255,255,0.06)",
                  }}
                >
                  {answered && slot.question ? slot.question : slot.label}
                </span>
                {answered ? (
                  <span
                    style={{
                      fontSize: 26,
                      color: COLORS.accent,
                      opacity: interpolate(recap, [0.5, 1], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    ✓
                  </span>
                ) : null}
              </div>
              <KineticText
                text={slot.value}
                delay={slot.at}
                fontSize={38}
                fontWeight={700}
                stagger={1.4}
                align="start"
                maxWidth={CARD.width - 80}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
