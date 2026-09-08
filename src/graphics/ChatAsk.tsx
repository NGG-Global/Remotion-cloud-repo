import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type Turn = {
  /** Who is speaking. The viewer's turns sit right, Claude's left. */
  readonly from: "you" | "claude";
  readonly text: string;
  /** Frames after the graphic starts at which this turn appears. */
  readonly at: number;
};

type ChatAskProps = {
  readonly width: number;
  readonly height: number;
  readonly turns: readonly Turn[];
  readonly delay?: number;
};

/**
 * A short exchange, drawn as chat bubbles.
 *
 * The narration quotes the questions people would actually type. Setting them
 * as bubbles rather than as list items is what makes them read as things you
 * say to Claude rather than as features being listed at you.
 */
export const ChatAsk: React.FC<ChatAskProps> = ({
  width,
  height,
  turns,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const rowGap = height * 0.055;
  const bubbleFont = height * 0.072;

  return (
    <div
      style={{
        width,
        height,
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: rowGap,
      }}
    >
      {turns.map((turn, i) => {
        const pop = spring({
          frame: local - turn.at,
          fps,
          config: { damping: 200 },
        });
        const mine = turn.from === "you";

        return (
          <div
            key={`${turn.text}-${i}`}
            style={{
              display: "flex",
              justifyContent: mine ? "flex-start" : "flex-end",
              opacity: pop,
              transform: `translateY(${interpolate(pop, [0, 1], [18, 0])}px)`,
            }}
          >
            <div
              style={{
                maxWidth: "82%",
                fontFamily,
                fontSize: bubbleFont,
                fontWeight: mine ? 600 : 500,
                lineHeight: 1.35,
                color: mine ? COLORS.ink : COLORS.text,
                backgroundColor: mine ? COLORS.labelBg : COLORS.surface,
                border: mine ? "none" : "1px solid rgba(255,255,255,0.09)",
                // The corner nearest the speaker is squared off, which is what
                // makes a bubble read as coming from a side.
                borderRadius: mine
                  ? `${bubbleFont}px ${bubbleFont}px ${bubbleFont}px ${bubbleFont * 0.3}px`
                  : `${bubbleFont}px ${bubbleFont}px ${bubbleFont * 0.3}px ${bubbleFont}px`,
                padding: `${bubbleFont * 0.5}px ${bubbleFont * 0.75}px`,
              }}
            >
              {turn.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
