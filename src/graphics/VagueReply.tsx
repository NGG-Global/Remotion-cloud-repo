import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { DocSheet, PLAIN_LINES } from "./parts/DocSheet";

type VagueReplyProps = {
  readonly width: number;
  readonly height: number;
  /** The prompt, typed a character at a time. */
  readonly prompt: string;
  /** Frame at which typing starts. */
  readonly typeAt?: number;
  /** Frames the prompt takes to type. */
  readonly typeFrames?: number;
  /** Frame at which the reply starts arriving. */
  readonly replyAt: number;
  /** Praise tags for the reply, each with the frame it lands on. */
  readonly tags: readonly { readonly at: number; readonly text: string }[];
  /** Frame at which the reply is revealed as addressed to no one. */
  readonly emptyAt: number;
};

/**
 * A reply that is right about everything and useful to no one.
 *
 * The trap in this passage is that the output really is good — tidy, correct,
 * well written. So the animation grants all of that first, in tags, and only
 * then exposes the missing addressee. Showing a visibly bad answer instead
 * would illustrate a different, easier problem.
 */
export const VagueReply: React.FC<VagueReplyProps> = ({
  width,
  height,
  prompt,
  typeAt = 6,
  typeFrames = 52,
  replyAt,
  tags,
  emptyAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PANEL = { width: Math.min(1020, width * 0.6), height: height * 0.86 };
  const panelLeft = width / 2 - PANEL.width / 2;

  const shown = Math.round(
    interpolate(frame - typeAt, [0, typeFrames], [0, prompt.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const sent = spring({
    frame: frame - (typeAt + typeFrames),
    fps,
    config: { damping: 200 },
  });

  const streamed = interpolate(frame - replyAt, [0, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Once the addressee is exposed, the colour drains out of the reply. The
  // sheet does not move: it is the same output, revalued.
  const drained = interpolate(frame - emptyAt, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bubbleWidth = PANEL.width * 0.72;
  const sheetWidth = PANEL.width * 0.82;

  return (
    <div style={{ position: "relative", width, height }}>
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: 0,
          width: PANEL.width,
          height: PANEL.height,
          borderRadius: 26,
          background: COLORS.backgroundDeep,
          border: `1px solid ${COLORS.frameEdge}`,
          overflow: "hidden",
          direction: "rtl",
          padding: "30px 34px",
          boxSizing: "border-box",
        }}
      >
        {/* The prompt, as typed. */}
        <div
          style={{
            width: bubbleWidth,
            marginRight: 0,
            padding: "18px 24px",
            borderRadius: "18px 18px 4px 18px",
            background: COLORS.surfaceRaised,
            fontFamily,
            fontSize: 34,
            fontWeight: 600,
            color: COLORS.text,
            transform: `translateY(${(1 - sent) * -4}px)`,
            minHeight: 40,
          }}
        >
          {prompt.slice(0, shown)}
          {shown < prompt.length && frame >= typeAt ? (
            <span
              style={{
                opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.15,
                color: COLORS.accent,
              }}
            >
              |
            </span>
          ) : null}
        </div>

        {/* The reply. */}
        {frame >= replyAt - 4 ? (
          <div
            style={{
              marginTop: 30,
              marginRight: PANEL.width - sheetWidth - 68,
              opacity: interpolate(frame - (replyAt - 4), [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <DocSheet
              width={sheetWidth}
              height={PANEL.height * 0.5}
              lines={PLAIN_LINES}
              progress={streamed}
              tone={COLORS.text}
              accent={COLORS.accent}
              background={COLORS.surface}
              opacity={1 - drained * 0.55}
              blur={drained * 2.4}
            />
          </div>
        ) : null}
      </div>

      {/* Praise, tethered outside the panel so it reads as commentary on the
          reply rather than as part of it. */}
      {tags.map((tag, i) => {
        const pop = spring({
          frame: frame - tag.at,
          fps,
          config: { damping: 140, stiffness: 150 },
        });
        if (frame < tag.at - 2) {
          return null;
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: panelLeft + PANEL.width + 26,
              top: PANEL.height * 0.34 + i * 74,
              direction: "rtl",
              fontFamily,
              fontSize: 30,
              fontWeight: 700,
              color: COLORS.ink,
              background: COLORS.labelBg,
              padding: "9px 20px",
              borderRadius: 999,
              opacity: pop * (1 - drained * 0.85),
              transform: `translateX(${(1 - pop) * -18}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {tag.text}
          </div>
        );
      })}

      {/* The addressee line: blank, and the reason the rest does not matter. */}
      {drained > 0 ? (
        <div
          style={{
            position: "absolute",
            left: panelLeft - 300,
            top: PANEL.height * 0.44,
            width: 280,
            direction: "rtl",
            textAlign: "left",
            opacity: drained,
            transform: `translateX(${(1 - drained) * 24}px)`,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 30,
              fontWeight: 600,
              color: COLORS.textMuted,
            }}
          >
            נכתב עבור
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily,
              fontSize: 58,
              fontWeight: 800,
              color: COLORS.warn,
              letterSpacing: "0.06em",
            }}
          >
            — אף אחד
          </div>
        </div>
      ) : null}
    </div>
  );
};
