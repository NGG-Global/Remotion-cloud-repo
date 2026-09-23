import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { SkillSheet, type SheetBlock } from "./parts/SkillSheet";

export type DoingTurn = {
  readonly from: "you" | "claude";
  readonly text: string;
  readonly at: number;
};

type SkillFromDoingProps = {
  readonly width: number;
  readonly height: number;
  /** Doing the task once, out loud. */
  readonly turns: readonly DoingTurn[];
  /** The draft that comes out of it. */
  readonly title: string;
  readonly blocks: readonly SheetBlock[];
  /** Frame at which the conversation starts becoming a draft. */
  readonly draftAt: number;
};

/**
 * The other way to write a skill: do the job once, out loud.
 *
 * The narration offers two routes and this is the one that is hard to picture,
 * because nothing is being authored — you work, and the procedure is extracted
 * from the working. So the conversation sits on the right where reading
 * starts, the draft assembles on the left, and tokens travel between them as
 * each turn lands. The draft's sections fill in the order the conversation
 * supplies them, which is the claim: the skill is made of what you already
 * said.
 */
export const SkillFromDoing: React.FC<SkillFromDoingProps> = ({
  width,
  height,
  turns,
  title,
  blocks,
  draftAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colW = width * 0.44;
  const chatLeft = width - colW;
  const sheetLeft = 0;
  const sheetW = colW;
  const sheetH = height * 0.92;

  const bubbleH = height * 0.15;
  const gap = height * 0.035;

  const draft = spring({
    frame: frame - draftAt,
    fps,
    config: { damping: 32, stiffness: 90 },
  });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* What each turn contributes, travelling to the draft. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {blocks.map((block, i) => {
          const t = interpolate(frame - draftAt - i * 10, [0, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (t <= 0.01 || t >= 1) {
            return null;
          }
          const y1 = height * 0.2 + i * (bubbleH + gap) * 0.7;
          const x1 = chatLeft;
          const x2 = sheetLeft + sheetW;
          const y2 = height * 0.2 + i * (sheetH / blocks.length) * 0.8;
          return (
            <circle
              key={i}
              cx={interpolate(t, [0, 1], [x1, x2])}
              cy={interpolate(t, [0, 1], [y1, y2])}
              r={8}
              fill={COLORS.accent}
              opacity={interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0])}
            />
          );
        })}
      </svg>

      {/* Doing it, out loud. */}
      {turns.map((turn, i) => {
        const on = spring({
          frame: frame - turn.at,
          fps,
          config: { damping: 200 },
        });
        if (on <= 0.001) {
          return null;
        }
        const mine = turn.from === "you";

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: chatLeft + (mine ? colW * 0.1 : 0),
              top: height * 0.04 + i * (bubbleH + gap),
              width: colW * 0.9,
              minHeight: bubbleH,
              borderRadius: 20,
              background: mine ? COLORS.labelBg : COLORS.surface,
              border: mine ? "none" : `1px solid rgba(255,255,255,0.1)`,
              color: mine ? COLORS.ink : COLORS.text,
              opacity: on * (1 - draft * 0.45),
              transform: `translateY(${interpolate(on, [0, 1], [18, 0])}px)`,
              padding: `${bubbleH * 0.18}px ${colW * 0.055}px`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              fontFamily,
              fontSize: bubbleH * 0.24,
              fontWeight: mine ? 600 : 400,
              lineHeight: 1.35,
            }}
          >
            {turn.text}
          </div>
        );
      })}

      {/* The draft it turns into. */}
      {draft > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: sheetLeft,
            top: (height - sheetH) / 2,
            width: sheetW,
            height: sheetH,
            opacity: draft,
            transform: `translateX(${interpolate(draft, [0, 1], [-30, 0])}px)`,
          }}
        >
          <SkillSheet
            width={sheetW}
            height={sheetH}
            title={title}
            blocks={blocks}
            tag="טיוטה"
            delay={draftAt}
          />
        </div>
      ) : null}
    </div>
  );
};
