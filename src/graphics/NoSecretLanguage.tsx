import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { COLORS } from "../theme";

type NoSecretLanguageProps = {
  readonly width: number;
  readonly height: number;
  /** Lines of the incantation, in the order they pile up. */
  readonly syntax: readonly string[];
  /** Frame at which the incantation is struck out. */
  readonly strikeAt: number;
  /** Frame at which the plain brief takes its place. */
  readonly briefAt: number;
  /** What the brief actually contains. */
  readonly briefTitle: string;
  readonly briefLines: readonly string[];
};

/**
 * The incantation, crossed out, and a plain briefing in its place.
 *
 * People arrive at this expecting to learn a syntax, so the animation shows
 * the syntax first and takes it away. The replacement is deliberately
 * ordinary — a note handed to a colleague — because the point of the line is
 * that nothing special is required.
 */
export const NoSecretLanguage: React.FC<NoSecretLanguageProps> = ({
  width,
  height,
  syntax,
  strikeAt,
  briefAt,
  briefTitle,
  briefLines,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const struck = interpolate(frame - strikeAt, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // The card leaves after the strike lands, rather than with it, so the
  // crossing-out is legible before the thing being crossed out goes away.
  const discard = interpolate(frame - (strikeAt + 16), [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const CARD = { width: Math.min(760, width * 0.44), height: height * 0.52 };
  const cardLeft = width / 2 - CARD.width / 2;
  const cardTop = height * 0.1;

  const NOTE = { width: Math.min(700, width * 0.4), height: height * 0.44 };
  const note = spring({
    frame: frame - briefAt,
    fps,
    config: { damping: 70, stiffness: 120 },
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {discard < 1 ? (
        <div
          style={{
            position: "absolute",
            left: cardLeft,
            top: cardTop,
            width: CARD.width,
            height: CARD.height,
            borderRadius: 20,
            background: COLORS.surface,
            border: "1px solid rgba(255,255,255,0.09)",
            padding: "26px 30px",
            boxSizing: "border-box",
            direction: "ltr",
            opacity: 1 - discard,
            transform: `translateY(${discard * 70}px) rotate(${discard * -3}deg) scale(${1 - discard * 0.08})`,
          }}
        >
          <div
            style={{
              fontFamily,
              direction: "rtl",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: COLORS.textMuted,
              marginBottom: 18,
            }}
          >
            "שפת פרומפטים"
          </div>
          {syntax.map((line, i) => {
            // Each line lands a little faster than the one before, so the pile
            // reads as escalating rather than as a steady list.
            const at = 8 + i * Math.max(9, 22 - i * 2);
            const show = interpolate(frame - at, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            if (show <= 0) {
              return null;
            }
            return (
              <div
                key={i}
                style={{
                  fontFamily: `${uiFontFamily}, ui-monospace, Menlo, monospace`,
                  fontSize: 27,
                  fontWeight: 500,
                  lineHeight: 1.65,
                  color: COLORS.accentAlt,
                  opacity: show * 0.92,
                  transform: `translateX(${(1 - show) * -14}px)`,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {line}
              </div>
            );
          })}

          {struck > 0 ? (
            <svg
              width={CARD.width}
              height={CARD.height}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                pointerEvents: "none",
              }}
            >
              <line
                x1={26}
                y1={CARD.height - 40}
                x2={26 + (CARD.width - 52) * struck}
                y2={CARD.height - 40 - (CARD.height - 90) * struck}
                stroke={COLORS.warn}
                strokeWidth={9}
                strokeLinecap="round"
                opacity={0.92}
              />
            </svg>
          ) : null}
        </div>
      ) : null}

      {frame >= briefAt - 3 ? (
        <div
          style={{
            position: "absolute",
            left: width / 2 - NOTE.width / 2,
            top: height / 2 - NOTE.height / 2,
            width: NOTE.width,
            height: NOTE.height,
            borderRadius: 18,
            background: COLORS.labelBg,
            padding: "34px 38px",
            boxSizing: "border-box",
            direction: "rtl",
            opacity: note,
            transform: `translateY(${(1 - note) * 40}px) rotate(${(1 - note) * 2.5}deg)`,
            boxShadow: "0 26px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 40,
              fontWeight: 800,
              color: COLORS.ink,
              marginBottom: 26,
            }}
          >
            {briefTitle}
          </div>
          {briefLines.map((line, i) => {
            const show = interpolate(
              frame - (briefAt + 12 + i * 13),
              [0, 12],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            if (show <= 0) {
              return null;
            }
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                  opacity: show,
                  transform: `translateX(${(1 - show) * -16}px)`,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.accent,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily,
                    fontSize: 32,
                    fontWeight: 600,
                    color: "#3a332c",
                  }}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
