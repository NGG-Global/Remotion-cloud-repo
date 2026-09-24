import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

type DesignTooEarlyProps = {
  readonly width: number;
  readonly height: number;
  /** Frame at which the ten finished slides pop in. */
  readonly buildAt: number;
  /** Frame at which they are found to tell the wrong story. */
  readonly wrongAt: number;
  /** Frame at which the rearranging starts: moving, deleting, splitting. */
  readonly shuffleAt: number;
  readonly verdict?: string;
};

const COUNT = 10;
const TONES = [
  "#1f2a44",
  "#7cc4e8",
  "#1f2a44",
  "#e8a188",
  "#1f2a44",
  "#f2d27c",
  "#1f2a44",
  "#7cc4e8",
  "#1f2a44",
  "#8fd0a8",
];

/**
 * Designing first, and paying for it.
 *
 * The temptation the narration names is to say "make me a deck" and let the
 * design start. The cost is not visible in the deck — ten finished slides look
 * finished — so the picture has to show what happens next: the slides get
 * pulled about, two are struck, one is split, and the neat grid becomes a mess
 * of things being rebuilt. Drawn as the actual motions of reordering, the
 * waste is legible without a word of complaint.
 */
export const DesignTooEarly: React.FC<DesignTooEarlyProps> = ({
  width,
  height,
  buildAt,
  wrongAt,
  shuffleAt,
  verdict = "הסיפור הלא נכון",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cols = 5;
  const gap = width * 0.018;
  const cardW = (width - gap * (cols - 1)) / cols;
  const cardH = cardW * 0.5625;
  const gridTop = (height - (cardH * 2 + gap)) / 2;
  const home = (i: number) => ({
    x: width - (1 + (i % cols)) * cardW - (i % cols) * gap,
    y: gridTop + Math.floor(i / cols) * (cardH + gap),
  });

  const wrong = interpolate(frame - wrongAt, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shuffle = spring({
    frame: frame - shuffleAt,
    fps,
    config: { damping: 22, stiffness: 70 },
  });

  /** Where each slide ends up once the rearranging is done. */
  const moved = (i: number) => {
    const h = home(i);
    // Two swaps, two deletions, one split. Fixed, so the mess is the same mess
    // on every render.
    const swaps: Record<number, number> = { 1: 7, 7: 1, 3: 8, 8: 3 };
    if (swaps[i] !== undefined) {
      const t = home(swaps[i]);
      return {
        x: interpolate(shuffle, [0, 1], [h.x, t.x]),
        y: interpolate(shuffle, [0, 1], [h.y, t.y]),
        rot: interpolate(shuffle, [0, 0.5, 1], [0, i % 2 ? 6 : -6, 0]),
        scale: 1,
        gone: 0,
      };
    }
    if (i === 4 || i === 9) {
      return {
        x: h.x,
        y: h.y + shuffle * height * 0.06,
        rot: shuffle * (i === 4 ? -8 : 8),
        scale: 1 - shuffle * 0.1,
        gone: shuffle,
      };
    }
    if (i === 5) {
      return { x: h.x, y: h.y, rot: 0, scale: 1, gone: 0, split: shuffle };
    }
    return { x: h.x, y: h.y, rot: 0, scale: 1, gone: 0 };
  };

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {Array.from({ length: COUNT }, (_, i) => {
        const on = spring({
          frame: frame - buildAt - i * 3,
          fps,
          config: { damping: 200 },
        });
        if (on <= 0.001) return null;
        const m = moved(i);
        const split = "split" in m ? (m.split ?? 0) : 0;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: m.x,
                top: m.y,
                width:
                  split > 0 ? cardW * (1 - split * 0.5) - split * 6 : cardW,
                height: cardH,
                borderRadius: 10,
                background: "#fff",
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                opacity: on * (1 - m.gone * 0.75),
                transform: `rotate(${m.rot}deg) scale(${m.scale * (0.92 + on * 0.08)})`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: cardH * 0.34,
                  background: TONES[i],
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: cardW * 0.08,
                  top: cardH * 0.1,
                  width: cardW * 0.5,
                  height: cardH * 0.12,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.85)",
                }}
              />
              {[0.7, 0.55, 0.62].map((w, b) => (
                <div
                  key={b}
                  style={{
                    position: "absolute",
                    right: cardW * 0.08,
                    top: cardH * (0.46 + b * 0.14),
                    width: `${w * 70}%`,
                    height: cardH * 0.06,
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.14)",
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  left: cardW * 0.06,
                  bottom: cardH * 0.08,
                  fontFamily,
                  fontSize: cardH * 0.12,
                  color: "rgba(0,0,0,0.4)",
                }}
              >
                {i + 1}
              </div>
              {m.gone > 0.2 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily,
                    fontSize: cardH * 0.5,
                    fontWeight: 800,
                    color: COLORS.warn,
                    opacity: m.gone,
                  }}
                >
                  ×
                </div>
              ) : null}
            </div>
            {/* The split's other half. */}
            {split > 0.05 ? (
              <div
                style={{
                  position: "absolute",
                  left: m.x + cardW * (1 - split * 0.5) + 6,
                  top: m.y,
                  width: cardW * split * 0.5 - 6,
                  height: cardH,
                  borderRadius: 10,
                  background: "#fff",
                  border: `2px dashed ${COLORS.warn}`,
                  boxSizing: "border-box",
                  opacity: split,
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}

      {wrong > 0 ? (
        <div
          style={{
            position: "absolute",
            top: gridTop - height * 0.13,
            right: 0,
            left: 0,
            textAlign: "center",
            fontFamily,
            fontSize: height * 0.07,
            fontWeight: 800,
            color: COLORS.warn,
            opacity: wrong * (1 - shuffle * 0.5),
            transform: `translateY(${(1 - wrong) * 10}px)`,
          }}
        >
          {verdict}
        </div>
      ) : null}
    </div>
  );
};
