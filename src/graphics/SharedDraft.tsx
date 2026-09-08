import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { DocSheet, STRUCTURED_LINES } from "./parts/DocSheet";

export type CycleStep = {
  readonly label: string;
  /** Frame at which this step takes its turn. */
  readonly at: number;
  /** Whose turn it is. */
  readonly by: "you" | "claude";
};

type SharedDraftProps = {
  readonly width: number;
  readonly height: number;
  /** Frame at which the question-and-answer reading is shown. */
  readonly qaAt: number;
  /** Frame at which it gives way to a single shared draft. */
  readonly mergeAt: number;
  /** The turns that follow, going round the draft. */
  readonly steps: readonly CycleStep[];
};

/**
 * Two bubbles becoming one document.
 *
 * The line replaces one mental model with another, so both are drawn: a
 * question and an answer that never touch, and then the same two parties
 * working on a single object between them. The draft's quality bar rises with
 * each turn, which is the part of "and he improves" that a diagram of arrows
 * would leave out.
 */
export const SharedDraft: React.FC<SharedDraftProps> = ({
  width,
  height,
  qaAt,
  mergeAt,
  steps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cx = width * 0.5;
  const cy = height * 0.5;

  const qa = interpolate(frame - qaAt, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const merge = interpolate(frame - mergeAt, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const SHEET = { width: Math.min(420, width * 0.24), height: height * 0.5 };
  const BUBBLE = { width: Math.min(400, width * 0.23), height: height * 0.26 };

  /**
   * Turns sit in four fixed slots around the draft, alternating sides: yours
   * to the right, its own to the left, which is where each party already is.
   * Slots rather than an orbit, so no turn can land on the draft or on the
   * quality bar beneath it however many turns there are.
   */
  const CHIP = { width: Math.min(330, width * 0.19), height: 62 };
  const slotX = (side: "you" | "claude") =>
    side === "you"
      ? cx + SHEET.width / 2 + 40
      : cx - SHEET.width / 2 - 40 - CHIP.width;
  const slotY = (row: number) =>
    cy + (row === 0 ? -1 : 1) * height * 0.27 - CHIP.height / 2;

  // Whose turn it is now: the last one to have started. A fixed window would
  // leave two turns lit at once, since consecutive turns here are closer
  // together than any window wide enough to read.
  let current = -1;
  for (let i = 0; i < steps.length; i++) {
    if (frame >= steps[i].at) {
      current = i;
    }
  }
  const done = current + 1;
  const quality = interpolate(done, [0, steps.length], [0.35, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const qualityShown = interpolate(
    frame - (steps[0]?.at ?? mergeAt),
    [0, 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Question and answer: two turns that never meet. */}
      {qa > 0 && merge < 1 ? (
        <div style={{ opacity: qa * (1 - merge) }}>
          <Bubble
            left={cx + 60}
            top={cy - BUBBLE.height - 30}
            size={BUBBLE}
            text="שאלה"
            mine
            shift={merge * 90}
          />
          <Bubble
            left={cx - 60 - BUBBLE.width}
            top={cy + 30}
            size={BUBBLE}
            text="תשובה"
            shift={merge * -90}
          />
          <div
            style={{
              position: "absolute",
              left: cx - 120,
              top: cy - 22,
              width: 240,
              textAlign: "center",
              direction: "rtl",
              fontFamily,
              fontSize: 30,
              fontWeight: 700,
              color: COLORS.textMuted,
              opacity: 1 - merge * 2.4,
            }}
          >
            ונגמר
          </div>
        </div>
      ) : null}

      {/* One draft, worked on from both sides. */}
      {merge > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: cx - SHEET.width / 2,
              top: cy - SHEET.height / 2,
              opacity: merge,
              transform: `scale(${0.9 + merge * 0.1})`,
            }}
          >
            <DocSheet
              width={SHEET.width}
              height={SHEET.height}
              lines={STRUCTURED_LINES}
              tone={COLORS.text}
              tag="טיוטה משותפת"
            />
            {/* How good it is, rising a step per turn. */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: SHEET.height + 18,
                opacity: qualityShown,
              }}
            >
              <div
                style={{
                  height: 14,
                  borderRadius: 7,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: `${quality * 100}%`,
                    borderRadius: 7,
                    background: COLORS.accent,
                  }}
                />
              </div>
            </div>
          </div>

          {steps.map((step, i) => {
            // Two rows per side, filled in the order the turns are taken.
            const sameSide = steps
              .slice(0, i)
              .filter((other) => other.by === step.by).length;
            const x = slotX(step.by);
            const y = slotY(sameSide % 2);

            const pop = spring({
              frame: frame - step.at,
              fps,
              config: { damping: 50, stiffness: 170 },
            });
            if (frame < step.at - 2) {
              return null;
            }
            const live = i === current;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: CHIP.width,
                  height: CHIP.height,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  direction: "rtl",
                  fontFamily,
                  fontSize: 31,
                  fontWeight: 800,
                  borderRadius: 14,
                  color: live ? COLORS.background : COLORS.textMuted,
                  background: live ? COLORS.accent : "rgba(255,255,255,0.07)",
                  border: `1px solid ${
                    live ? COLORS.accent : "rgba(255,255,255,0.1)"
                  }`,
                  boxSizing: "border-box",
                  opacity: pop * (live ? 1 : 0.55),
                  transform: `scale(${0.86 + Math.min(1, pop) * 0.14})`,
                }}
              >
                {step.label}
              </div>
            );
          })}

          <SideLabel
            text="אתם"
            left={slotX("you")}
            width={CHIP.width}
            top={cy - 16}
            show={merge}
          />
          <SideLabel
            text="קלוד"
            left={slotX("claude")}
            width={CHIP.width}
            top={cy - 16}
            show={merge}
          />
        </>
      ) : null}
    </div>
  );
};

const Bubble: React.FC<{
  readonly left: number;
  readonly top: number;
  readonly size: { width: number; height: number };
  readonly text: string;
  readonly mine?: boolean;
  readonly shift: number;
}> = ({ left, top, size, text, mine, shift }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: size.width,
      height: size.height,
      borderRadius: mine ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
      background: mine ? COLORS.surfaceRaised : COLORS.surface,
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      direction: "rtl",
      fontFamily,
      fontSize: 36,
      fontWeight: 700,
      color: COLORS.text,
      transform: `translateX(${shift}px)`,
    }}
  >
    {text}
  </div>
);

const SideLabel: React.FC<{
  readonly text: string;
  readonly left: number;
  readonly width: number;
  readonly top: number;
  readonly show: number;
}> = ({ text, left, width, top, show }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width,
      textAlign: "center",
      direction: "rtl",
      fontFamily,
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: "0.08em",
      color: COLORS.textMuted,
      opacity: show,
    }}
  >
    {text}
  </div>
);
