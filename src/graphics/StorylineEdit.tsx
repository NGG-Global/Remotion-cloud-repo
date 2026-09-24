import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type StorylineItem = {
  readonly title: string;
  readonly message: string;
};

type StorylineEditProps = {
  readonly width: number;
  readonly height: number;
  /** The skeleton, as it first comes back. */
  readonly items: readonly StorylineItem[];
  /** Frame at which the list starts appearing. */
  readonly listAt: number;
  /** Frame at which item `move.from` travels to position `move.to`. */
  readonly move?: {
    readonly at: number;
    readonly from: number;
    readonly to: number;
  };
  /** Frame at which item `strike` is crossed out. */
  readonly strike?: { readonly at: number; readonly index: number };
  /** Frame at which two adjacent items become one. */
  readonly merge?: { readonly at: number; readonly first: number };
  /** Frame at which the slides are built from what is left. */
  readonly buildAt?: number;
};

/**
 * The storyline: edited as a list, then built.
 *
 * The habit the narration is teaching is to fix the story while it is still a
 * list — reorder, cut, merge — and design only afterwards. A list is the one
 * artefact whose edits are cheap enough to show as a motion each: a row slides
 * to its new place, a row is struck through and drops out, two rows fold into
 * one. And when the slides finally form, they form from the edited list, in
 * its order, so the payoff of editing early is on screen too.
 */
export const StorylineEdit: React.FC<StorylineEditProps> = ({
  width,
  height,
  items,
  listAt,
  move,
  strike,
  merge,
  buildAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bubbleW = Math.min(width * 0.46, 760);
  const bubbleLeft = width - bubbleW;
  const rowH = Math.min(height * 0.11, 84);
  const padY = height * 0.06;
  const listTop = padY + rowH * 0.8;

  const moveT = move
    ? spring({
        frame: frame - move.at,
        fps,
        config: { damping: 26, stiffness: 110 },
      })
    : 0;
  const strikeT = strike
    ? interpolate(frame - strike.at, [0, 12, 30, 44], [0, 1, 1, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const strikeGone = strike
    ? interpolate(frame - strike.at, [30, 44], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const mergeT = merge
    ? spring({
        frame: frame - merge.at,
        fps,
        config: { damping: 26, stiffness: 110 },
      })
    : 0;
  const build = buildAt
    ? spring({ frame: frame - buildAt, fps, config: { damping: 200 } })
    : 0;

  /**
   * Each row's slot after every edit that has happened so far, as a
   * fractional position so the transitions interpolate.
   */
  const slot = (i: number): { pos: number; alive: number } => {
    let pos = i;
    let alive = 1;
    if (move) {
      const { from, to } = move;
      if (i === from) pos = interpolate(moveT, [0, 1], [from, to]);
      else if (from > to && i >= to && i < from) pos = i + moveT;
      else if (from < to && i > from && i <= to) pos = i - moveT;
    }
    // Positions after the move, for the later edits to reason about.
    const settled = (j: number) => {
      if (!move) return j;
      const { from, to } = move;
      if (j === from) return to;
      if (from > to && j >= to && j < from) return j + 1;
      if (from < to && j > from && j <= to) return j - 1;
      return j;
    };
    if (strike) {
      const sPos = settled(strike.index);
      if (i === strike.index) alive = 1 - strikeGone;
      else if (settled(i) > sPos) pos -= strikeGone;
    }
    if (merge) {
      const firstPos = settled(merge.first);
      const secondIndex = items.findIndex(
        (_, j) => settled(j) === firstPos + 1,
      );
      if (i === secondIndex) {
        pos -= mergeT;
        alive *= 1 - mergeT;
      } else if (settled(i) > firstPos + 1) {
        pos -= mergeT;
      }
    }
    return { pos, alive };
  };

  const finalOrder = items
    .map((_, i) => ({ i, ...slot(i) }))
    .filter((r) => r.alive > 0.5)
    .sort((a, b) => a.pos - b.pos);

  const slideW = Math.min(width * 0.2, 300);
  const slideH = slideW * 0.5625;
  const slidesArea = width - bubbleW - width * 0.06;
  const slideCols = 2;
  const slideGap = 18;
  const slideLeft = (k: number) =>
    slidesArea - (1 + (k % slideCols)) * slideW - (k % slideCols) * slideGap;
  const slideTop = (k: number) =>
    height * 0.08 + Math.floor(k / slideCols) * (slideH + slideGap);

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The reply bubble holding the list. */}
      <div
        style={{
          position: "absolute",
          left: bubbleLeft,
          top: padY * 0.5,
          width: bubbleW,
          height:
            listTop -
            padY * 0.5 +
            rowH * (finalOrder.length + 0.2) +
            Math.max(
              0,
              rowH *
                (items.length - finalOrder.length) *
                (1 - Math.max(strikeGone, mergeT)),
            ),
          borderRadius: 24,
          background: COLORS.surface,
          border: `1px solid rgba(255,255,255,0.09)`,
          opacity: spring({
            frame: frame - listAt + 6,
            fps,
            config: { damping: 200 },
          }),
        }}
      >
        <div
          style={{
            position: "absolute",
            top: rowH * 0.3,
            right: bubbleW * 0.06,
            fontFamily,
            fontSize: rowH * 0.3,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: COLORS.textMuted,
          }}
        >
          סטורי־ליין
        </div>
      </div>

      {items.map((item, i) => {
        const on = spring({
          frame: frame - listAt - i * 5,
          fps,
          config: { damping: 200 },
        });
        if (on <= 0.001) return null;
        const { pos, alive } = slot(i);
        const isStruck = strike?.index === i;
        const isMerging = merge !== undefined && alive < 1 && !isStruck;
        const isMoving = move?.from === i && moveT > 0.02 && moveT < 0.98;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bubbleLeft + bubbleW * 0.05,
              top: listTop + pos * rowH,
              width: bubbleW * 0.9,
              height: rowH * 0.86,
              borderRadius: 14,
              background: isMoving
                ? COLORS.surfaceRaised
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${isMoving ? COLORS.accent : "rgba(255,255,255,0.08)"}`,
              boxShadow: isMoving ? `0 10px 30px rgba(0,0,0,0.4)` : undefined,
              display: "flex",
              alignItems: "center",
              gap: bubbleW * 0.03,
              padding: `0 ${bubbleW * 0.04}px`,
              boxSizing: "border-box",
              opacity: on * Math.max(alive, isStruck ? 1 - strikeGone : 0),
              transform: `translateX(${isMerging ? -mergeT * 20 : 0}px) scale(${isMoving ? 1.03 : 1})`,
              zIndex: isMoving ? 2 : 1,
            }}
          >
            <div
              style={{
                width: rowH * 0.36,
                height: rowH * 0.36,
                borderRadius: "50%",
                background:
                  isStruck && strikeT > 0.5 ? COLORS.warn : COLORS.accent,
                color: COLORS.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontSize: rowH * 0.2,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {Math.round(pos) + 1}
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <div
                style={{
                  fontFamily,
                  fontSize: rowH * 0.27,
                  fontWeight: 700,
                  color: COLORS.text,
                  whiteSpace: "nowrap",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: rowH * 0.2,
                  color: COLORS.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.message}
              </div>
              {isStruck ? (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    left: 0,
                    height: 3,
                    background: COLORS.warn,
                    transform: `scaleX(${strikeT})`,
                    transformOrigin: "right center",
                  }}
                />
              ) : null}
            </div>
          </div>
        );
      })}

      {/* The slides, built from the list as it stands. */}
      {build > 0.01
        ? finalOrder.map((row, k) => {
            const on = spring({
              frame: frame - (buildAt ?? 0) - k * 5,
              fps,
              config: { damping: 200 },
            });
            if (on <= 0.001) return null;
            return (
              <div
                key={row.i}
                style={{
                  position: "absolute",
                  left: slideLeft(k),
                  top: slideTop(k),
                  width: slideW,
                  height: slideH,
                  borderRadius: 12,
                  background: "#1f2a44",
                  boxShadow: `0 0 26px ${COLORS.accent}22`,
                  opacity: on,
                  transform: `scale(${0.9 + on * 0.1})`,
                  padding: `${slideH * 0.12}px ${slideW * 0.07}px`,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontFamily,
                    fontSize: slideH * 0.14,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {items[row.i].title}
                </div>
                <div
                  style={{
                    marginTop: slideH * 0.1,
                    width: "70%",
                    height: slideH * 0.05,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.35)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: slideW * 0.06,
                    bottom: slideH * 0.08,
                    fontFamily,
                    fontSize: slideH * 0.1,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {k + 1}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: slideH * 0.03,
                    background: `linear-gradient(90deg, ${COLORS.accentSoft}, ${COLORS.accentAlt})`,
                  }}
                />
              </div>
            );
          })
        : null}
    </div>
  );
};
