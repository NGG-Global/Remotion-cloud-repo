import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { DocSheet, STRUCTURED_LINES } from "./parts/DocSheet";

type NotFinalStampProps = {
  readonly width: number;
  readonly height: number;
  /** Frame at which the stamp comes down. */
  readonly stampAt: number;
  /** Frame at which the sheet is re-labelled for what it is. */
  readonly relabelAt: number;
  /** Closing line, held under the sheet. */
  readonly note?: string;
  /** Frame at which the closing line appears. */
  readonly noteAt?: number;
};

/**
 * A "final" stamp that will not take.
 *
 * The habit being corrected is treating the first reply as finished work, and
 * a stamp refusing to land is a plainer way to say so than any wording on
 * screen. The sheet itself is good — structured, sharp — so the rejection
 * reads as being about its status, not its quality.
 */
export const NotFinalStamp: React.FC<NotFinalStampProps> = ({
  width,
  height,
  stampAt,
  relabelAt,
  note,
  noteAt = relabelAt + 34,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SHEET = { width: Math.min(680, width * 0.38), height: height * 0.66 };
  const sheetLeft = width / 2 - SHEET.width / 2;
  const sheetTop = height * 0.08;

  const appear = spring({ frame, fps, config: { damping: 90 } });

  // Descent, impact, rebound. A single low-damping spring would settle onto
  // the page; this has to come off it again, so the two halves are separate.
  const IMPACT = stampAt + 18;
  const drop = interpolate(frame, [stampAt, IMPACT], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rebound = spring({
    frame: frame - IMPACT,
    fps,
    config: { damping: 12, stiffness: 90, mass: 1.1 },
  });

  const stampY = interpolate(drop, [0, 1], [-height * 0.5, 0]) + rebound * -190;
  const stampFade = interpolate(frame - (IMPACT + 26), [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // A ring off the point of contact, so the refusal has a moment of force.
  const hit = interpolate(frame - IMPACT, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jolt =
    frame >= IMPACT && frame < IMPACT + 14
      ? Math.sin((frame - IMPACT) * 1.9) * (1 - (frame - IMPACT) / 14) * 6
      : 0;

  const relabel = spring({
    frame: frame - relabelAt,
    fps,
    config: { damping: 60, stiffness: 160 },
  });

  return (
    <div style={{ position: "relative", width, height }}>
      <div
        style={{
          position: "absolute",
          left: sheetLeft,
          top: sheetTop,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 24 + jolt}px)`,
        }}
      >
        <DocSheet
          width={SHEET.width}
          height={SHEET.height}
          lines={STRUCTURED_LINES}
          progress={interpolate(frame, [6, 52], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
          tone={COLORS.text}
        />
      </div>

      {/* The label it actually deserves. */}
      {frame >= relabelAt - 2 ? (
        <div
          style={{
            position: "absolute",
            left: sheetLeft - 20,
            top: sheetTop + 18,
            direction: "rtl",
            fontFamily,
            fontSize: 34,
            fontWeight: 800,
            color: COLORS.background,
            background: COLORS.accent,
            padding: "8px 22px",
            borderRadius: 999,
            opacity: relabel,
            transform: `translateX(${(1 - relabel) * -20}px) rotate(-2deg)`,
            whiteSpace: "nowrap",
          }}
        >
          טיוטה
        </div>
      ) : null}

      {/* The stamp, and its refusal. */}
      {frame >= stampAt - 2 && stampFade < 1 ? (
        <div
          style={{
            position: "absolute",
            left: width / 2 - 190,
            top: sheetTop + SHEET.height * 0.36 + stampY,
            width: 380,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 66,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: COLORS.warn,
            border: `6px solid ${COLORS.warn}`,
            borderRadius: 14,
            padding: "12px 0",
            background: "rgba(20,17,14,0.82)",
            opacity: (1 - stampFade) * 0.96,
            transform: `rotate(${-7 + rebound * 5}deg)`,
          }}
        >
          סופי
        </div>
      ) : null}

      {hit > 0 && hit < 1 ? (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <circle
            cx={width / 2}
            cy={sheetTop + SHEET.height * 0.44}
            r={40 + hit * 190}
            fill="none"
            stroke={COLORS.warn}
            strokeWidth={5 * (1 - hit)}
            opacity={(1 - hit) * 0.8}
          />
        </svg>
      ) : null}

      {note && frame >= noteAt - 2 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: sheetTop + SHEET.height + 26,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 40,
            fontWeight: 700,
            color: COLORS.text,
            opacity: interpolate(frame - noteAt, [0, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
