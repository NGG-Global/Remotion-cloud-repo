import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { DocSheet, PLAIN_LINES } from "./parts/DocSheet";

type MaterialToDeckProps = {
  readonly width: number;
  readonly height: number;
  /** What the attached file is called. */
  readonly fileLabel: string;
  /** Frame at which Claude starts reading it: lines light in turn. */
  readonly readAt: number;
  /** Frame at which the key points lift out and travel to the slides. */
  readonly extractAt: number;
  /** Slide titles the points become, right to left. */
  readonly slides: readonly string[];
};

/**
 * Existing material becoming a deck.
 *
 * "Claude reads the file, finds the main points and builds on them" is three
 * verbs in one sentence. Drawn, each gets a motion: the sheet's lines light as
 * they are read, four of them lift out as tokens, and each token lands as the
 * title of a slide that did not exist a moment ago. The file stays on screen
 * throughout, so the deck is visibly made of it.
 */
export const MaterialToDeck: React.FC<MaterialToDeckProps> = ({
  width,
  height,
  fileLabel,
  readAt,
  extractAt,
  slides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sheetW = Math.min(width * 0.3, 520);
  const sheetH = height * 0.86;
  const sheetLeft = width - sheetW;
  const sheetTop = (height - sheetH) / 2;

  const n = slides.length;
  const gridLeft = 0;
  const gridW = width - sheetW - width * 0.09;
  const cardW = (gridW - 24) / 2;
  const cardH = cardW * 0.5625;
  const gridTop = (height - (cardH * 2 + 24)) / 2;
  const cardPos = (i: number) => ({
    // Right to left, two per row: the first slide sits top right.
    x: gridLeft + (1 - (i % 2)) * (cardW + 24),
    y: gridTop + Math.floor(i / 2) * (cardH + 24),
  });

  const read = interpolate(frame - readAt, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  /** Which sheet lines are the key points: one per slide. */
  const keyLines = [0, 2, 3, 5].slice(0, n);
  const lineY = (i: number) =>
    sheetTop +
    sheetH * 0.11 +
    ((sheetH - sheetH * 0.22) / PLAIN_LINES.length) * (i + 0.5);

  return (
    <div style={{ position: "relative", width, height }}>
      <div style={{ position: "absolute", left: sheetLeft, top: sheetTop }}>
        <DocSheet
          width={sheetW}
          height={sheetH}
          lines={PLAIN_LINES}
          progress={1}
          tag={fileLabel}
        />
        {/* A reading bar sweeping down the sheet. */}
        {read > 0 && read < 1 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: sheetH * 0.08 + read * sheetH * 0.84,
              height: 3,
              background: COLORS.accent,
              boxShadow: `0 0 18px ${COLORS.accent}`,
            }}
          />
        ) : null}
        {/* Key lines light as the bar passes them, and stay lit. */}
        {keyLines.map((li, k) => {
          const lit = interpolate(
            frame - readAt - (li / PLAIN_LINES.length) * 40,
            [0, 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                right: sheetW * 0.09,
                top: lineY(li) - sheetTop - 10,
                width: sheetW * (PLAIN_LINES[li].width * 0.78) + 12,
                height: 20,
                borderRadius: 10,
                background: `rgba(217,119,87,${0.28 * lit})`,
                border: `1px solid rgba(217,119,87,${0.7 * lit})`,
              }}
            />
          );
        })}
      </div>

      {/* Tokens travelling from each key line to its slide. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {keyLines.map((li, k) => {
          const t = interpolate(frame - extractAt - k * 7, [0, 26], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (t <= 0 || t >= 1) return null;
          const x1 = sheetLeft + sheetW * 0.5;
          const y1 = lineY(li);
          const p = cardPos(k);
          const x2 = p.x + cardW * 0.5;
          const y2 = p.y + cardH * 0.3;
          const cx = (x1 + x2) / 2;
          const u = 1 - t;
          const x = u * u * x1 + 2 * u * t * cx + t * t * x2;
          const y =
            u * u * y1 + 2 * u * t * (Math.min(y1, y2) - 60) + t * t * y2;
          return <circle key={k} cx={x} cy={y} r={9} fill={COLORS.accent} />;
        })}
      </svg>

      {/* The slides, forming as the points land. */}
      {slides.map((title, i) => {
        const on = spring({
          frame: frame - extractAt - i * 7 - 22,
          fps,
          config: { damping: 200 },
        });
        if (on <= 0.001) return null;
        const p = cardPos(i);
        return (
          <div
            key={title}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: cardW,
              height: cardH,
              borderRadius: 14,
              background: "#1f2a44",
              border: `1px solid rgba(255,255,255,0.12)`,
              boxShadow: `0 0 30px ${COLORS.accent}22`,
              opacity: on,
              transform: `scale(${0.9 + on * 0.1})`,
              padding: `${cardH * 0.12}px ${cardW * 0.07}px`,
              boxSizing: "border-box",
              direction: "rtl",
            }}
          >
            <div
              style={{
                fontFamily,
                fontSize: cardH * 0.15,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: cardH * 0.1,
                display: "flex",
                flexDirection: "column",
                gap: cardH * 0.06,
              }}
            >
              {[0.8, 0.6, 0.7].map((w, b) => (
                <div
                  key={b}
                  style={{
                    width: `${w * 100}%`,
                    height: cardH * 0.04,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: cardH * 0.03,
                background: `linear-gradient(90deg, ${COLORS.accentSoft}, ${COLORS.accentAlt})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: cardW * 0.05,
                bottom: cardH * 0.08,
                fontFamily,
                fontSize: cardH * 0.09,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};
