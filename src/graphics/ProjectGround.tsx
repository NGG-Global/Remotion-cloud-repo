import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type GroundChat = {
  /** The part of the request that is actually different each time. */
  readonly ask: string;
  /** Frame at which this conversation opens. */
  readonly at: number;
};

type ProjectGroundProps = {
  readonly width: number;
  readonly height: number;
  /** The conversations, right to left in the order given. */
  readonly chats: readonly GroundChat[];
  /** The preamble every one of them starts with. */
  readonly preamble: string;
  /**
   * Frame at which the preambles lift out and become one. Omit to leave the
   * picture on the repetition — which is the whole of the argument, before
   * there is anything to fix it.
   */
  readonly mergeAt?: number;
  /** What they become. Required once `mergeAt` is given. */
  readonly groundLabel?: string;
};

/**
 * The same preamble, typed at the top of every conversation — then not.
 *
 * The argument for a project is not that it stores things; it is that the
 * explaining stops repeating. A list of benefits cannot show that, so the
 * repetition is staged: three conversations open, each carrying an identical
 * block above the one line that actually differs.
 *
 * With `mergeAt`, the blocks then leave the conversations, travel to one panel
 * beneath them, and the questions drop into the space they vacated — three
 * short asks, and one place holding everything they have in common. Without
 * it the picture holds on the repetition, which is what the episode's opening
 * needs: the cost has to land before anything is offered to fix it. The same
 * graphic plays both, so the second appearance reads as the first one
 * resolving rather than as a new diagram.
 */
export const ProjectGround: React.FC<ProjectGroundProps> = ({
  width,
  height,
  chats,
  preamble,
  mergeAt,
  groundLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const n = chats.length;
  const gap = width * 0.03;
  const cardW = (width - gap * (n - 1)) / n;
  // With no panel to land in, the conversations are the whole picture and
  // take the whole frame; with one, they give up the lower third to it.
  const cardH = mergeAt === undefined ? height * 0.88 : height * 0.54;
  const cardTop = height * 0.02;

  // Right to left: the first conversation named sits rightmost.
  const cardLeft = (i: number) => width - (i + 1) * cardW - i * gap;

  const groundW = Math.min(width * 0.62, cardW * 2.1);
  const groundH = height * 0.26;
  const groundLeft = (width - groundW) / 2;
  const groundTop = height * 0.7;

  const merge =
    mergeAt === undefined
      ? 0
      : spring({
          frame: frame - mergeAt,
          fps,
          config: { damping: 30, stiffness: 90 },
        });

  const padX = cardW * 0.075;
  const blockTop = cardH * 0.17;
  const blockH = cardH * 0.36;

  /** Where a preamble block sits: in its conversation, or folded into the
   *  ground panel. Both ends are real geometry, so the travel lands. */
  const blockBox = (i: number) => {
    const from = {
      x: cardLeft(i) + padX,
      y: cardTop + blockTop,
      w: cardW - padX * 2,
      h: blockH,
    };
    // Folded in, the blocks stack in the panel's left half. The label holds
    // the right half, where an RTL reader starts.
    const to = {
      x: groundLeft + groundW * 0.05,
      y: groundTop + groundH * 0.26,
      w: groundW * 0.4,
      h: groundH * 0.48,
    };
    return {
      x: interpolate(merge, [0, 1], [from.x, to.x]),
      y: interpolate(merge, [0, 1], [from.y, to.y]),
      w: interpolate(merge, [0, 1], [from.w, to.w]),
      h: interpolate(merge, [0, 1], [from.h, to.h]),
    };
  };

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Tethers from the ground panel up to each conversation, drawn once the
          blocks have arrived. Left-origin coordinates throughout: an SVG and a
          CSS `right` measure from opposite edges. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {chats.map((_, i) => {
          if (mergeAt === undefined) {
            return null;
          }
          const draw = interpolate(
            frame - mergeAt - 18 - i * 4,
            [0, 16],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          if (draw <= 0.01) {
            return null;
          }
          const x1 = groundLeft + groundW / 2;
          const y1 = groundTop;
          const x2 = cardLeft(i) + cardW / 2;
          const y2 = cardTop + cardH;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1} ${y1 - (y1 - y2) * 0.6}, ${x2} ${y2 + (y1 - y2) * 0.6}, ${x2} ${y2}`}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={2.5}
              strokeOpacity={0.5}
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset={1 - draw}
            />
          );
        })}
      </svg>

      {/* The conversations. */}
      {chats.map((chat, i) => {
        const open = spring({
          frame: frame - chat.at,
          fps,
          config: { damping: 200 },
        });
        if (open <= 0.001) {
          return null;
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cardLeft(i),
              top: cardTop,
              width: cardW,
              height: cardH,
              borderRadius: 24,
              background: COLORS.surface,
              border: `1px solid rgba(255,255,255,0.08)`,
              opacity: open,
              transform: `translateY(${interpolate(open, [0, 1], [26, 0])}px)`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: cardH * 0.06,
                right: padX,
                left: padX,
                direction: "rtl",
                fontFamily,
                fontSize: cardH * 0.075,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: COLORS.textMuted,
              }}
            >
              {`שיחה ${i + 1}`}
            </div>

            {/* The question. It rises into the space the preamble leaves. */}
            <div
              style={{
                position: "absolute",
                right: padX,
                left: padX,
                top: interpolate(
                  merge,
                  [0, 1],
                  [
                    cardTop + blockTop + blockH - cardTop + cardH * 0.06,
                    cardH * 0.34,
                  ],
                ),
                direction: "rtl",
                fontFamily,
                fontSize: cardH * 0.105,
                fontWeight: 700,
                lineHeight: 1.3,
                color: COLORS.text,
              }}
            >
              {chat.ask}
            </div>
          </div>
        );
      })}

      {/* The ground panel the blocks land in. */}
      {mergeAt === undefined ? null : (
        <div
          style={{
            position: "absolute",
            left: groundLeft,
            top: groundTop,
            width: groundW,
            height: groundH,
            borderRadius: 24,
            background: COLORS.surfaceRaised,
            border: `2px solid ${COLORS.accent}`,
            boxShadow: `0 0 60px ${COLORS.accent}33`,
            opacity: merge,
            transform: `scale(${interpolate(merge, [0, 1], [0.9, 1])})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: groundW * 0.06,
              width: groundW * 0.44,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              direction: "rtl",
              fontFamily,
              fontSize: groundH * 0.23,
              fontWeight: 800,
              lineHeight: 1.2,
              color: COLORS.accent,
            }}
          >
            {groundLabel}
          </div>
        </div>
      )}

      {/* The repeated preambles, over everything, travelling as they merge. */}
      {chats.map((chat, i) => {
        const open = spring({
          frame: frame - chat.at,
          fps,
          config: { damping: 200 },
        });
        if (open <= 0.001) {
          return null;
        }
        const box = blockBox(i);
        // Once folded in, the three stacked blocks read as one.
        const fade = interpolate(merge, [0.55, 1], [1, 0.34], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={`p${i}`}
            style={{
              position: "absolute",
              left: box.x + (i - (n - 1) / 2) * merge * groundH * 0.06,
              top: box.y + (i - (n - 1) / 2) * merge * groundH * 0.07,
              width: box.w,
              height: box.h,
              borderRadius: interpolate(merge, [0, 1], [16, 8]),
              background: "rgba(255,255,255,0.05)",
              border: `1px dashed rgba(255,255,255,0.22)`,
              opacity: open * fade,
              padding: `${box.h * 0.16}px ${box.w * 0.07}px`,
              boxSizing: "border-box",
              direction: "rtl",
              overflow: "hidden",
            }}
          >
            {/* The words go once the block is on its way: at the size it
                lands at they are illegible, and three of them overlapping
                read as damage rather than as a stack. */}
            <div
              style={{
                fontFamily,
                fontSize: cardH * 0.062,
                fontWeight: 400,
                lineHeight: 1.45,
                color: COLORS.textMuted,
                opacity: interpolate(merge, [0, 0.4], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {preamble}
            </div>
          </div>
        );
      })}
    </div>
  );
};
