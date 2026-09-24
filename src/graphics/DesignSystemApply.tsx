import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { COLORS } from "../theme";

type DesignSystemApplyProps = {
  readonly width: number;
  readonly height: number;
  /** The design system's name, on its card. */
  readonly systemName?: string;
  /** Frame at which the token card arrives. Omit for the unbranded case. */
  readonly tokensAt?: number;
  /** Frame at which the tokens sweep onto the slides. */
  readonly applyAt?: number;
  /** How many slides. */
  readonly slides?: number;
};

const NAVY = "#1f2a44";
const SKY = "#7cc4e8";

/**
 * A design system landing on a deck — or, without one, a deck that stays plain.
 *
 * The narration's point is that choosing a system saves saying "which blue,
 * which font, where the logo goes" every time. So the three tokens are drawn as
 * three things — a swatch, a type sample, a logo slot — and the sweep across the
 * slides is what applying them looks like: colour, then type, then the mark,
 * landing on every slide at once. Left without tokens, the same slides stay
 * white with bars, which is the "just test the idea" case in one picture.
 */
export const DesignSystemApply: React.FC<DesignSystemApplyProps> = ({
  width,
  height,
  systemName = "NGG Design System",
  tokensAt,
  applyAt,
  slides = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tokens =
    tokensAt === undefined
      ? 0
      : spring({ frame: frame - tokensAt, fps, config: { damping: 200 } });
  const apply =
    applyAt === undefined
      ? 0
      : interpolate(frame - applyAt, [0, 36], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const cardW = Math.min(width * 0.24, 400);
  const cardH = height * 0.62;
  const cardLeft = width - cardW;
  const cardTop = (height - cardH) / 2;

  const gap = width * 0.025;
  const areaLeft = 0;
  const areaW = tokensAt === undefined ? width : width - cardW - width * 0.07;
  const slideW = (areaW - gap * (slides - 1)) / slides;
  const slideH = slideW * 0.5625;
  const slideTop = (height - slideH) / 2;
  const slideLeft = (i: number) =>
    areaLeft + areaW - (i + 1) * slideW - i * gap;

  /** How far the sweep has reached each slide, right to left. */
  const reach = (i: number) =>
    interpolate(apply, [i / slides, (i + 1) / slides], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {tokensAt !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: cardLeft,
            top: cardTop,
            width: cardW,
            height: cardH,
            borderRadius: 24,
            background: COLORS.surface,
            border: `2px solid ${COLORS.accent}`,
            boxShadow: `0 0 50px ${COLORS.accent}22`,
            opacity: tokens,
            transform: `translateY(${interpolate(tokens, [0, 1], [24, 0])}px)`,
            padding: `${cardH * 0.07}px ${cardW * 0.1}px`,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: cardH * 0.06,
          }}
        >
          <div
            style={{
              direction: "ltr",
              fontFamily: uiFontFamily,
              fontSize: cardH * 0.06,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {systemName}
          </div>
          <div
            style={{
              fontFamily,
              fontSize: cardH * 0.045,
              color: COLORS.textMuted,
            }}
          >
            צבעים
          </div>
          <div style={{ display: "flex", gap: cardW * 0.05 }}>
            {[NAVY, SKY, "#f2d27c", "#ffffff"].map((c) => (
              <div
                key={c}
                style={{
                  width: cardW * 0.15,
                  height: cardW * 0.15,
                  borderRadius: 10,
                  background: c,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontFamily,
              fontSize: cardH * 0.045,
              color: COLORS.textMuted,
            }}
          >
            פונטים
          </div>
          <div
            style={{
              direction: "ltr",
              fontFamily,
              fontSize: cardH * 0.12,
              fontWeight: 800,
              color: COLORS.text,
              lineHeight: 1,
            }}
          >
            Aa{" "}
            <span style={{ fontWeight: 400, color: COLORS.textMuted }}>אב</span>
          </div>
          <div
            style={{
              fontFamily,
              fontSize: cardH * 0.045,
              color: COLORS.textMuted,
            }}
          >
            לוגו
          </div>
          <div
            style={{
              width: cardW * 0.34,
              height: cardH * 0.11,
              borderRadius: 8,
              border: `2px dashed ${COLORS.textMuted}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "42%",
                height: "45%",
                borderRadius: 4,
                background: COLORS.accent,
              }}
            />
          </div>
        </div>
      ) : null}

      {/* The sweep itself. */}
      {apply > 0 && apply < 1 ? (
        <div
          style={{
            position: "absolute",
            top: slideTop - 20,
            left: areaLeft + areaW * (1 - apply),
            width: 4,
            height: slideH + 40,
            background: COLORS.accent,
            boxShadow: `0 0 24px ${COLORS.accent}`,
            borderRadius: 2,
          }}
        />
      ) : null}

      {Array.from({ length: slides }, (_, i) => {
        const on = spring({
          frame: frame - 6 - i * 5,
          fps,
          config: { damping: 200 },
        });
        const r = reach(i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: slideLeft(i),
              top: slideTop,
              width: slideW,
              height: slideH,
              borderRadius: 12,
              overflow: "hidden",
              background: "#ffffff",
              boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              opacity: on,
              transform: `translateY(${interpolate(on, [0, 1], [20, 0])}px)`,
            }}
          >
            {/* Colour: a header band that grows in. */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: slideH * 0.3 * r,
                background: NAVY,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: slideH * 0.3,
                height: 4 * r,
                background: SKY,
              }}
            />
            {/* Type: the title bar becomes a real title. */}
            <div
              style={{
                position: "absolute",
                right: slideW * 0.07,
                top: slideH * 0.09,
                width: slideW * 0.5,
              }}
            >
              {r > 0.5 ? (
                <div
                  style={{
                    fontFamily,
                    fontSize: slideH * 0.11,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >{`שקף ${i + 1}`}</div>
              ) : (
                <div
                  style={{
                    height: slideH * 0.08,
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.14)",
                  }}
                />
              )}
            </div>
            {[0.86, 0.62, 0.74].map((w, b) => (
              <div
                key={b}
                style={{
                  position: "absolute",
                  right: slideW * 0.07,
                  top: slideH * (0.44 + b * 0.12),
                  width: `${w * 60}%`,
                  height: slideH * 0.045,
                  borderRadius: 999,
                  background:
                    r > 0.5 ? "rgba(31,42,68,0.35)" : "rgba(0,0,0,0.12)",
                }}
              />
            ))}
            {/* The mark, landing last. */}
            <div
              style={{
                position: "absolute",
                left: slideW * 0.05,
                bottom: slideH * 0.08,
                width: slideW * 0.12,
                height: slideH * 0.1,
                borderRadius: 4,
                background: COLORS.accent,
                opacity: interpolate(r, [0.75, 1], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
