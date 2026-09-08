import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type ConstraintOption = {
  /** What this approach would take. */
  readonly label: string;
  /** Whether it still fits once the constraint is known. */
  readonly fits: boolean;
};

type ConstraintNarrowsProps = {
  readonly width: number;
  readonly height: number;
  /** What was proposed, and rejected. */
  readonly proposed: string;
  /** What there is actually room for. */
  readonly actual: string;
  /** Fraction of the proposal the constraint leaves. */
  readonly remaining: number;
  readonly options: readonly ConstraintOption[];
  /** Frame at which the proposal is rejected. */
  readonly rejectAt: number;
  /** Frame at which the real constraint replaces it. */
  readonly narrowAt: number;
  /** Frame at which the approaches that no longer fit drop away. */
  readonly pruneAt: number;
};

/**
 * A constraint stated up front, and the work it saves.
 *
 * The payoff of the line is negative — time *not* spent on approaches that
 * cannot work — and nothing is harder to show than an absence. So the
 * approaches are drawn first, all of them live, and then struck out in front
 * of the viewer. What is left is visibly what remains of something larger.
 */
export const ConstraintNarrows: React.FC<ConstraintNarrowsProps> = ({
  width,
  height,
  proposed,
  actual,
  remaining,
  options,
  rejectAt,
  narrowAt,
  pruneAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ease = Easing.bezier(0.45, 0, 0.2, 1);

  const barRight = width * 0.88;
  const barFull = width * 0.76;
  const barY = height * 0.06;
  const barH = 62;

  const narrowed = interpolate(frame, [narrowAt, narrowAt + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const barWidth = barFull * (1 - narrowed * (1 - remaining));

  const rejected = spring({
    frame: frame - rejectAt,
    fps,
    config: { damping: 40, stiffness: 220, mass: 0.6 },
  });
  // A short shudder as the rejection lands, then still.
  const shake =
    frame >= rejectAt && frame < rejectAt + 16
      ? Math.sin((frame - rejectAt) * 1.5) * (1 - (frame - rejectAt) / 16) * 7
      : 0;

  /**
   * Until the constraint is known, no approach can be shown as fitting. The
   * paths were coloured from `fits` the moment they were drawn, which put the
   * answer on screen several seconds before the narration got to it.
   */
  const revealed = frame >= pruneAt;

  const originX = width * 0.8;
  const originY = height * 0.52;
  const chipRight = width * 0.34;
  const chipWidth = 250;
  const fanTop = height * 0.26;
  const fanBottom = height * 0.94;
  const step =
    options.length > 1 ? (fanBottom - fanTop) / (options.length - 1) : 0;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* What was on the table, and what is left of it. */}
      <div
        style={{
          position: "absolute",
          left: barRight - barWidth,
          top: barY,
          width: barWidth,
          height: barH,
          borderRadius: 14,
          background: narrowed > 0.5 ? COLORS.accent : COLORS.surfaceRaised,
          border: `2px solid ${
            rejected > 0.3 && narrowed < 0.5
              ? COLORS.warn
              : "rgba(255,255,255,0.12)"
          }`,
          transform: `translateX(${shake}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            direction: "rtl",
            fontFamily,
            fontSize: 30,
            fontWeight: 800,
            color: narrowed > 0.5 ? COLORS.background : COLORS.text,
            whiteSpace: "nowrap",
          }}
        >
          {narrowed > 0.5 ? actual : proposed}
        </span>
      </div>

      {/* The ghost of the original span, so the contraction stays measurable. */}
      {narrowed > 0 ? (
        <div
          style={{
            position: "absolute",
            left: barRight - barFull,
            top: barY,
            width: barFull,
            height: barH,
            borderRadius: 14,
            border: "2px dashed rgba(255,255,255,0.16)",
            opacity: narrowed,
          }}
        />
      ) : null}

      {rejected > 0.02 ? (
        <div
          style={{
            position: "absolute",
            left: barRight - barFull - 20,
            top: barY + barH + 16,
            direction: "rtl",
            fontFamily,
            fontSize: 28,
            fontWeight: 800,
            color: COLORS.ink,
            background: COLORS.warn,
            padding: "6px 18px",
            borderRadius: 999,
            opacity: Math.min(1, rejected * 1.5),
            transform: `scale(${0.7 + Math.min(1, rejected) * 0.3}) rotate(-3deg)`,
            whiteSpace: "nowrap",
          }}
        >
          הלקוח סירב
        </div>
      ) : null}

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {options.map((option, i) => {
          const y = fanTop + i * step;
          const draw = interpolate(frame - (10 + i * 7), [0, 26], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const cut = option.fits
            ? 0
            : interpolate(frame - (pruneAt + i * 5), [0, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

          return (
            <path
              key={i}
              d={`M ${originX} ${originY} C ${originX - 150} ${originY}, ${chipRight + 150} ${y}, ${chipRight + 8} ${y}`}
              fill="none"
              stroke={
                revealed && option.fits ? COLORS.accent : COLORS.textMuted
              }
              strokeWidth={revealed && option.fits ? 3 : 2.5}
              // pathLength normalises the path to 1, so it can be drawn on
              // without measuring its real length in the DOM.
              pathLength="1"
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
              opacity={(revealed && option.fits ? 0.75 : 0.45) * (1 - cut)}
            />
          );
        })}

        <circle
          cx={originX}
          cy={originY}
          r={11}
          fill={COLORS.accent}
          opacity={interpolate(frame, [4, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      </svg>

      {options.map((option, i) => {
        const y = fanTop + i * step;
        const show = interpolate(frame - (24 + i * 7), [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (show <= 0) {
          return null;
        }
        const cut = option.fits
          ? 0
          : interpolate(frame - (pruneAt + i * 5), [0, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
        const kept =
          option.fits && frame > pruneAt
            ? interpolate(frame - (pruneAt + 12), [0, 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: chipRight - chipWidth,
              top: y - 27,
              width: chipWidth,
              height: 54,
              borderRadius: 12,
              background: kept > 0.4 ? COLORS.accent : COLORS.surface,
              border: `1px solid ${
                kept > 0.4 ? COLORS.accent : "rgba(255,255,255,0.1)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              direction: "rtl",
              opacity: show * (1 - cut * 0.82),
              // Pruned options slide out of the way rather than vanishing, so
              // it is clear they were ruled out and not merely hidden.
              transform: `translateX(${cut * -70}px) scale(${1 - cut * 0.12})`,
              filter: cut > 0 ? `saturate(${1 - cut})` : undefined,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 28,
                fontWeight: 700,
                color: kept > 0.4 ? COLORS.background : COLORS.text,
                textDecoration: cut > 0.5 ? "line-through" : undefined,
                whiteSpace: "nowrap",
              }}
            >
              {option.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
