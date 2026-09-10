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
import { LineIcon, type IconName } from "./LineIcon";

type HandOffProps = {
  readonly width: number;
  readonly height: number;
  /** Frame at which step-by-step management is ruled out. */
  readonly strikeAt: number;
  /** Frame at which the whole task is handed over. */
  readonly handOverAt: number;
  /** Frame at which you leave, and the work carries on without you. */
  readonly awayAt: number;
  /** Frame at which you come back to the result. */
  readonly backAt: number;
  /** The guarantees, each with the frame it is named. */
  readonly assurances: readonly {
    readonly label: string;
    readonly icon: IconName;
    readonly at: number;
  }[];
};

const MICRO_STEPS = 5;

/**
 * Handing over a whole task instead of steering every step.
 *
 * Both working styles are on screen because the line is a substitution. The
 * chain of small steps is drawn with a marker on every link — each one is a
 * point where the work stops without you — and handing over replaces the
 * whole chain with one card. The clock running while you are gone is what
 * makes "come back and see what came out" a saving rather than a delay.
 */
export const HandOff: React.FC<HandOffProps> = ({
  width,
  height,
  strikeAt,
  handOverAt,
  awayAt,
  backAt,
  assurances,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chainY = height * 0.16;
  const nodeR = 30;
  const chainRight = width * 0.9;
  const chainSpan = width * 0.8;
  const step = chainSpan / (MICRO_STEPS - 1);

  const struck = interpolate(frame - strikeAt, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const handed = spring({
    frame: frame - handOverAt,
    fps,
    config: { damping: 62, stiffness: 150 },
  });

  // Progress runs while you are away, so the ring is the elapsed meeting.
  const progress = interpolate(frame, [awayAt, backAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.3, 1),
  });
  const away = interpolate(frame, [awayAt, awayAt + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const back = interpolate(frame, [backAt, backAt + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const TASK = { width: Math.min(310, width * 0.18), height: height * 0.18 };
  const taskCx = width * 0.5;
  const taskCy = height * 0.5;
  /** Comfortably clear of the card's corners, so the ring reads as a ring. */
  const ringR = Math.min(height * 0.23, width * 0.14);

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Step by step: five links, each waiting on you. */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <line
          x1={chainRight}
          y1={chainY}
          x2={chainRight - chainSpan}
          y2={chainY}
          stroke={COLORS.textMuted}
          strokeWidth={3}
          strokeDasharray="8 8"
          opacity={
            (0.4 - struck * 0.25) *
            interpolate(frame, [0, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        {struck > 0 ? (
          <line
            x1={chainRight + 24}
            y1={chainY}
            x2={chainRight + 24 - (chainSpan + 48) * struck}
            y2={chainY}
            stroke={COLORS.warn}
            strokeWidth={9}
            strokeLinecap="round"
            opacity={0.92}
          />
        ) : null}
      </svg>

      {Array.from({ length: MICRO_STEPS }, (_, i) => {
        const show = interpolate(frame - (4 + i * 7), [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (show <= 0) {
          return null;
        }
        // Nodes run right to left with the language.
        const cx = chainRight - i * step;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - nodeR,
              top: chainY - nodeR,
              width: nodeR * 2,
              height: nodeR * 2,
              borderRadius: "50%",
              background: COLORS.surfaceRaised,
              border: `2px solid rgba(255,255,255,0.14)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: show * (1 - struck * 0.6),
            }}
          >
            <LineIcon
              name="person"
              size={nodeR * 1.1}
              delay={4 + i * 7}
              drawFrames={12}
              color={COLORS.textMuted}
            />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: chainY + 56,
          textAlign: "center",
          direction: "rtl",
          fontFamily,
          fontSize: 30,
          fontWeight: 700,
          color: struck > 0.4 ? COLORS.warn : COLORS.textMuted,
          opacity: interpolate(frame, [14, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textDecoration: struck > 0.6 ? "line-through" : undefined,
        }}
      >
        לנהל אותו שלב אחרי שלב
      </div>

      {/* One task, handed over whole. */}
      {frame >= handOverAt - 2 ? (
        <div
          style={{
            position: "absolute",
            left: taskCx - TASK.width / 2,
            top: taskCy - TASK.height / 2,
            width: TASK.width,
            height: TASK.height,
            borderRadius: 16,
            background: COLORS.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 34,
            fontWeight: 800,
            color: COLORS.background,
            textAlign: "center",
            padding: "0 18px",
            boxSizing: "border-box",
            opacity: handed,
            transform: `scale(${0.86 + handed * 0.14})`,
            boxShadow: `0 0 ${50 * handed}px rgba(217,119,87,0.4)`,
          }}
        >
          משימה שלמה
        </div>
      ) : null}

      {/* The ring closes while you are elsewhere. */}
      {frame >= awayAt - 10 ? (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <circle
            cx={taskCx}
            cy={taskCy}
            r={ringR}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={7}
          />
          <circle
            cx={taskCx}
            cy={taskCy}
            r={ringR}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={7}
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
            transform={`rotate(-90 ${taskCx} ${taskCy})`}
          />
        </svg>
      ) : null}

      {/* You, out of the room and back again. */}
      {away > 0 ? (
        <div
          style={{
            position: "absolute",
            left: taskCx + ringR + 70 + away * width * 0.1 - back * width * 0.1,
            top: taskCy - 56,
            width: 260,
            textAlign: "center",
            direction: "rtl",
            opacity: away,
          }}
        >
          <LineIcon
            name={back > 0.5 ? "check" : "calendar"}
            size={54}
            delay={awayAt}
            drawFrames={16}
            color={back > 0.5 ? COLORS.accent : COLORS.textMuted}
          />
          <div
            style={{
              marginTop: 8,
              fontFamily,
              fontSize: 28,
              fontWeight: 700,
              color: back > 0.5 ? COLORS.accent : COLORS.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {back > 0.5 ? "חוזרים לתוצאה" : "יוצאים לפגישה"}
          </div>
        </div>
      ) : null}

      {/* What makes handing over safe. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          direction: "rtl",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {assurances.map((item, i) => {
          const show = interpolate(frame - item.at, [0, 16], [0, 1], {
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
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(217,119,87,0.14)",
                border: `1px solid rgba(217,119,87,0.45)`,
                opacity: show,
                transform: `translateY(${(1 - show) * 12}px)`,
              }}
            >
              <LineIcon
                name={item.icon}
                size={32}
                delay={item.at}
                drawFrames={14}
                color={COLORS.accent}
              />
              <span
                style={{
                  fontFamily,
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.text,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
