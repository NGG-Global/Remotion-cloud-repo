import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type Quote = {
  /** Frame at which the wording appears. */
  readonly at: number;
  readonly text: string;
};

type FeedbackAimProps = {
  readonly width: number;
  readonly height: number;
  /** Blunt, specific wording. */
  readonly useful: readonly Quote[];
  /** Hedged wording that says the same thing without saying it. */
  readonly hedged: readonly Quote[];
  /** Frame at which the connector between the pairs appears. */
  readonly betterAt: number;
  /** Frame at which the resulting precision is compared. */
  readonly precisionAt: number;
};

const LINES = [0.94, 0.86, 0.97, 0.8, 0.9, 0.74, 0.88, 0.66] as const;
/** The line the specific feedback is about. */
const TARGET_LINE = 2;

/**
 * The same note, worded two ways, and the edit each one produces.
 *
 * Advice about phrasing is easy to state and hard to feel, so the animation
 * skips past the wording to its consequence: one column gets a cut in a known
 * place, the other gets a haze over everything and a question mark. The
 * precision bars at the end only confirm what the two documents already show.
 */
export const FeedbackAim: React.FC<FeedbackAimProps> = ({
  width,
  height,
  useful,
  hedged,
  betterAt,
  precisionAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COL = width * 0.38;
  const usefulLeft = width - COL;
  const hedgedLeft = 0;
  const quoteTop = 0;
  const docTop = height * 0.42;
  const DOC = { width: COL * 0.78, height: height * 0.42 };

  const better = spring({
    frame: frame - betterAt,
    fps,
    config: { damping: 60, stiffness: 170 },
  });
  const precision = interpolate(frame - precisionAt, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const firstUseful = useful[0]?.at ?? 0;
  const firstHedged = hedged[0]?.at ?? 0;

  return (
    <div style={{ position: "relative", width, height }}>
      <Header
        text="שימושי"
        left={usefulLeft}
        width={COL}
        accent
        show={interpolate(frame, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
      <Header
        text="מנומס, ולא ברור"
        left={hedgedLeft}
        width={COL}
        show={interpolate(frame, [8, 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />

      {useful.map((quote, i) => (
        <QuoteCard
          key={`u${i}`}
          quote={quote}
          left={usefulLeft + (COL - COL * 0.86) / 2}
          top={quoteTop + 62 + i * (height * 0.14)}
          width={COL * 0.86}
          frame={frame}
          fps={fps}
          accent
        />
      ))}
      {hedged.map((quote, i) => (
        <QuoteCard
          key={`h${i}`}
          quote={quote}
          left={hedgedLeft + (COL - COL * 0.86) / 2}
          top={quoteTop + 62 + i * (height * 0.14)}
          width={COL * 0.86}
          frame={frame}
          fps={fps}
        />
      ))}

      {/* The comparison itself, in the gutter between the two. */}
      {frame >= betterAt - 2 ? (
        <div
          style={{
            position: "absolute",
            left: width / 2 - 110,
            top: height * 0.12,
            width: 220,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.ink,
            background: COLORS.labelBg,
            padding: "10px 0",
            borderRadius: 999,
            opacity: Math.min(1, better),
            transform: `scale(${0.8 + Math.min(1, better) * 0.2})`,
          }}
        >
          עדיף על
        </div>
      ) : null}

      {/* The edit each wording produces. */}
      <Document
        left={usefulLeft + (COL - DOC.width) / 2}
        top={docTop}
        size={DOC}
        frame={frame}
        editAt={firstUseful + 20}
        precise
      />
      <Document
        left={hedgedLeft + (COL - DOC.width) / 2}
        top={docTop}
        size={DOC}
        frame={frame}
        editAt={firstHedged + 20}
      />

      {/* How precise the correction turned out. */}
      {precision > 0 ? (
        <>
          <PrecisionBar
            left={usefulLeft + (COL - DOC.width) / 2}
            top={docTop + DOC.height + 24}
            width={DOC.width}
            value={0.94}
            reveal={precision}
            label="תיקון מדויק"
            accent
          />
          <PrecisionBar
            left={hedgedLeft + (COL - DOC.width) / 2}
            top={docTop + DOC.height + 24}
            width={DOC.width}
            value={0.34}
            reveal={precision}
            label="תיקון מפוזר"
          />
        </>
      ) : null}
    </div>
  );
};

const Header: React.FC<{
  readonly text: string;
  readonly left: number;
  readonly width: number;
  readonly show: number;
  readonly accent?: boolean;
}> = ({ text, left, width, show, accent }) => (
  <div
    style={{
      position: "absolute",
      left,
      top: 0,
      width,
      textAlign: "center",
      direction: "rtl",
      fontFamily,
      fontSize: 34,
      fontWeight: 800,
      letterSpacing: "0.04em",
      color: accent ? COLORS.accent : COLORS.textMuted,
      opacity: show,
    }}
  >
    {text}
  </div>
);

const QuoteCard: React.FC<{
  readonly quote: Quote;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly frame: number;
  readonly fps: number;
  readonly accent?: boolean;
}> = ({ quote, left, top, width, frame, fps, accent }) => {
  const pop = spring({
    frame: frame - quote.at,
    fps,
    config: { damping: 62, stiffness: 160 },
  });
  if (frame < quote.at - 2) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        direction: "rtl",
        fontFamily,
        fontSize: 36,
        fontWeight: 700,
        lineHeight: 1.3,
        color: accent ? COLORS.text : COLORS.textMuted,
        background: accent
          ? "rgba(217,119,87,0.14)"
          : "rgba(255,255,255,0.045)",
        border: `1px solid ${accent ? "rgba(217,119,87,0.4)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 14,
        padding: "16px 20px",
        boxSizing: "border-box",
        opacity: pop,
        transform: `translateY(${(1 - pop) * 16}px)`,
      }}
    >
      {`”${quote.text}“`}
    </div>
  );
};

/** A page, and the mark the feedback leaves on it. */
const Document: React.FC<{
  readonly left: number;
  readonly top: number;
  readonly size: { width: number; height: number };
  readonly frame: number;
  readonly editAt: number;
  readonly precise?: boolean;
}> = ({ left, top, size, frame, editAt, precise }) => {
  const edit = interpolate(frame - editAt, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gap = (size.height - 36) / LINES.length;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: size.width,
        height: size.height,
        borderRadius: 14,
        background: COLORS.surface,
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      {LINES.map((w, i) => {
        // In the precise column the named line is actually cut short; in the
        // hedged one nothing is resolved, so every line stays as it was.
        const cut = precise && i === TARGET_LINE ? edit * 0.45 : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 20,
              top: 18 + i * gap,
              width: (size.width - 40) * w * (1 - cut),
              height: 10,
              borderRadius: 5,
              background:
                precise && i === TARGET_LINE ? COLORS.accent : COLORS.text,
              opacity: precise && i === TARGET_LINE ? 0.9 : 0.4,
            }}
          />
        );
      })}

      {precise ? (
        <div
          style={{
            position: "absolute",
            right: 12,
            left: 12,
            top: 18 + TARGET_LINE * gap - 11,
            height: 32,
            borderRadius: 8,
            border: `2px solid ${COLORS.accent}`,
            opacity: edit,
          }}
        />
      ) : (
        <>
          {/* Nothing to aim at, so the whole page is in play. */}
          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: 10,
              border: "2px dashed rgba(224,163,74,0.5)",
              background: "rgba(224,163,74,0.07)",
              opacity: edit,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: size.height * 0.4,
              textAlign: "center",
              fontFamily,
              fontSize: 62,
              fontWeight: 800,
              color: COLORS.warn,
              opacity: edit * 0.9,
            }}
          >
            ?
          </div>
        </>
      )}
    </div>
  );
};

const PrecisionBar: React.FC<{
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly value: number;
  readonly reveal: number;
  readonly label: string;
  readonly accent?: boolean;
}> = ({ left, top, width, value, reveal, label, accent }) => (
  <div style={{ position: "absolute", left, top, width, direction: "rtl" }}>
    <div
      style={{
        height: 16,
        borderRadius: 8,
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
          width: `${value * reveal * 100}%`,
          borderRadius: 8,
          background: accent ? COLORS.accent : COLORS.warn,
        }}
      />
    </div>
    <div
      style={{
        marginTop: 10,
        textAlign: "center",
        fontFamily,
        fontSize: 28,
        fontWeight: 700,
        color: accent ? COLORS.accent : COLORS.warn,
        opacity: interpolate(reveal, [0.5, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {label}
    </div>
  </div>
);
