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
import { BezierFlow } from "./BezierFlow";
import { DocSheet, STRUCTURED_LINES } from "./parts/DocSheet";

export type BlankRow = {
  /** What Claude would need to know. */
  readonly label: string;
  /** What it puts there instead: plausible, and not yours. */
  readonly guess: string;
  /** Frame at which the empty field appears. */
  readonly at: number;
};

type ProjectBlanksProps = {
  readonly width: number;
  readonly height: number;
  readonly rows: readonly BlankRow[];
  /** Frame at which the globe gives up the frame to the project panel. */
  readonly recedeAt: number;
  /** Frame at which the blanks fill themselves in. */
  readonly guessAt: number;
  /** Frame at which the filling is named for what it is. */
  readonly tagAt: number;
  /** Frame at which the guessed answer is graded. */
  readonly stampAt: number;
};

/** Dots on a slowly turning sphere: general knowledge, and a lot of it. */
const GlobeDots: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly frame: number;
  readonly draw: number;
  readonly opacity: number;
}> = ({ cx, cy, r, frame, draw, opacity }) => {
  const COUNT = 150;
  const GOLDEN = 2.399963229728653;
  const spin = frame * 0.011;

  return (
    <g opacity={opacity}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={COLORS.accentAlt}
        strokeWidth={2}
        strokeOpacity={0.28 * draw}
      />
      {Array.from({ length: COUNT }, (_, i) => {
        // Fibonacci placement, so the dots read as an even covering of a
        // sphere instead of the clumps a random scatter would give — and it
        // is a formula, so every frame draws the same sphere.
        const y = 1 - (i / (COUNT - 1)) * 2;
        const ring = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = i * GOLDEN + spin;
        const x = Math.cos(theta) * ring;
        const z = Math.sin(theta) * ring;

        // Dots appear from the top of the sphere down as it draws on.
        const appear = interpolate(
          draw,
          [i / COUNT, i / COUNT + 0.25],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        if (appear <= 0) {
          return null;
        }

        const front = (z + 1) / 2;
        return (
          <circle
            key={i}
            cx={cx + x * r}
            cy={cy + y * r}
            r={(1.3 + front * 2.4) * appear}
            fill={COLORS.accentAlt}
            opacity={(0.2 + front * 0.7) * appear}
          />
        );
      })}
    </g>
  );
};

/**
 * Everything Claude knows, next to the one thing it does not.
 *
 * Held as a single take from the globe through to the graded answer, because
 * the passage is one causal chain: the project is blank, the blanks get filled
 * with plausible guesses, and the guesses are what make an answer nearly
 * right. Cutting between those steps would let each read as a separate
 * complaint.
 */
export const ProjectBlanks: React.FC<ProjectBlanksProps> = ({
  width,
  height,
  rows,
  recedeAt,
  guessAt,
  tagAt,
  stampAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globeDraw = interpolate(frame, [4, 74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ease = Easing.bezier(0.4, 0, 0.2, 1);
  const recede = interpolate(frame, [recedeAt, recedeAt + 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const shift = interpolate(frame, [stampAt - 22, stampAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const globeCx = interpolate(recede, [0, 1], [width * 0.74, width * 0.93]);
  const globeCy = interpolate(recede, [0, 1], [height * 0.44, height * 0.11]);
  const globeR = interpolate(recede, [0, 1], [height * 0.3, height * 0.075]);

  // The project panel starts as a small empty outline beside the globe, takes
  // the frame once the missing pieces are named, then makes room for the answer.
  const panelLeft =
    interpolate(recede, [0, 1], [width * 0.08, width * 0.34]) +
    shift * width * 0.06;
  const panelWidth = interpolate(recede, [0, 1], [width * 0.36, width * 0.46]);
  const panelHeight = interpolate(
    recede,
    [0, 1],
    [height * 0.5, height * 0.88],
  );
  const panelTop = (height - panelHeight) / 2;

  const guess = interpolate(frame - guessAt, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stamp = spring({
    frame: frame - stampAt,
    fps,
    config: { damping: 34, stiffness: 220, mass: 0.7 },
  });

  const SHEET = { width: width * 0.24, height: height * 0.5 };
  const sheetLeft = width * 0.045;
  const sheetTop = (height - SHEET.height) / 2;

  const rowGap = (panelHeight - 120) / rows.length;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <GlobeDots
          cx={globeCx}
          cy={globeCy}
          r={globeR}
          frame={frame}
          draw={globeDraw}
          opacity={1 - recede * 0.45}
        />
        {shift > 0 ? (
          <BezierFlow
            curve={{
              from: { x: panelLeft - 8, y: height * 0.5 },
              c1: { x: panelLeft - 130, y: height * 0.36 },
              c2: { x: sheetLeft + SHEET.width + 130, y: height * 0.64 },
              to: { x: sheetLeft + SHEET.width + 8, y: height * 0.5 },
            }}
            delay={stampAt - 18}
            travel={30}
            stagger={8}
            count={4}
            color={COLORS.textMuted}
            until={stampAt + 20}
            showTrack={false}
          />
        ) : null}
      </svg>

      {/* The globe's caption, which leaves with it. */}
      <div
        style={{
          position: "absolute",
          left: globeCx - 260,
          top: globeCy + globeR + 22,
          width: 520,
          textAlign: "center",
          direction: "rtl",
          fontFamily,
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.accentAlt,
          opacity:
            interpolate(frame, [40, 62], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }) *
            (1 - recede),
        }}
      >
        המון ידע על העולם
      </div>

      {/* The project: the one file it has nothing in. */}
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop,
          width: panelWidth,
          height: panelHeight,
          borderRadius: 22,
          background: COLORS.surface,
          border: `2px dashed rgba(224,163,74,${0.5 - recede * 0.25})`,
          direction: "rtl",
          padding: "24px 32px",
          boxSizing: "border-box",
          opacity: interpolate(frame, [16, 46], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 30,
            fontWeight: 800,
            color: COLORS.text,
          }}
        >
          הפרויקט שלכם
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily,
            fontSize: 24,
            fontWeight: 600,
            color: COLORS.warn,
            opacity: 1 - recede,
          }}
        >
          ריק
        </div>

        {rows.map((row, i) => {
          const show = interpolate(frame - row.at, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (show <= 0) {
            return null;
          }
          // Blanks fill one after another, fast, so the filling reads as
          // something the model does automatically rather than as a choice.
          const filled = interpolate(
            guess,
            [i * 0.14, i * 0.14 + 0.4],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 104 + i * rowGap,
                right: 32,
                left: 32,
                opacity: show,
                transform: `translateY(${(1 - show) * 12}px)`,
              }}
            >
              <div
                style={{
                  fontFamily,
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.textMuted,
                  marginBottom: 6,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  position: "relative",
                  height: 46,
                  borderBottom: `2px dashed rgba(255,255,255,${0.3 - filled * 0.15})`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    fontFamily,
                    fontSize: 32,
                    fontWeight: 600,
                    fontStyle: "italic",
                    color: COLORS.warn,
                    opacity: filled * 0.85,
                    transform: `translateY(${(1 - filled) * 8}px)`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.guess}
                </div>
              </div>
            </div>
          );
        })}

        {/* What the filling actually is. */}
        <div
          style={{
            position: "absolute",
            left: 32,
            bottom: 20,
            fontFamily,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.ink,
            background: COLORS.warn,
            padding: "6px 16px",
            borderRadius: 999,
            opacity: interpolate(frame - tagAt, [0, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          ניחוש סביר
        </div>
      </div>

      {/* The answer that comes out of a guessed brief. */}
      {frame >= stampAt - 22 ? (
        <div
          style={{
            position: "absolute",
            left: sheetLeft,
            top: sheetTop,
            width: SHEET.width,
            height: SHEET.height,
            opacity: shift,
            transform: `translateX(${(1 - shift) * -40}px)`,
          }}
        >
          <DocSheet
            width={SHEET.width}
            height={SHEET.height}
            lines={STRUCTURED_LINES}
            tone={COLORS.text}
          />
          <div
            style={{
              position: "absolute",
              left: -18,
              top: SHEET.height * 0.34,
              direction: "rtl",
              fontFamily,
              fontSize: 44,
              fontWeight: 800,
              color: COLORS.warn,
              border: `4px solid ${COLORS.warn}`,
              borderRadius: 12,
              padding: "8px 22px",
              background: "rgba(20,17,14,0.9)",
              opacity: Math.min(1, stamp * 1.4),
              transform: `rotate(-9deg) scale(${1 + (1 - Math.min(1, stamp)) * 0.7})`,
              whiteSpace: "nowrap",
            }}
          >
            בערך נכון
          </div>
        </div>
      ) : null}
    </div>
  );
};
