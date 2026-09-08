import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

/** Where the needle rests, and what the narration says about each stop. */
const STOPS = [
  { label: "נמוך", note: "תשובה מהירה ופשוטה", angle: -66 },
  { label: "בינוני", note: "ברירת המחדל — מתאים לרוב", angle: 0 },
  { label: "גבוה", note: "בעיה שדורשת חשיבה", angle: 66 },
] as const;

type EffortDialProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Frames spent on each stop before moving to the next. */
  readonly hold?: number;
};

const EASE = Easing.bezier(0.45, 0, 0.25, 1);

/**
 * A dial sweeping between the three effort levels.
 *
 * Effort is one control with a middle default, which a list of three bullets
 * does not convey. A needle that starts at the default, drops, then climbs
 * shows both the range and where it sits by default.
 */
export const EffortDial: React.FC<EffortDialProps> = ({
  width,
  height,
  delay = 0,
  hold = 46,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;

  // Default first, then low, then high: the order the narration describes.
  const order = [1, 0, 2] as const;

  // Clamped at both ends. Before the delay elapses `local` is negative, and an
  // unclamped floor gives -1, which indexes past the start of the array.
  const step = Math.max(
    0,
    Math.min(order.length - 1, Math.floor(local / hold)),
  );
  const within = interpolate(local - step * hold, [0, hold * 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const fromAngle = STOPS[order[Math.max(0, step - 1)]].angle;
  const toAngle = STOPS[order[step]].angle;
  const angle =
    step === 0 ? toAngle * within : fromAngle + (toAngle - fromAngle) * within;

  /**
   * The label follows the needle rather than the step counter. Switching on
   * the step boundary named the destination while the needle was still on its
   * way there, which read as a mismatch.
   */
  const activeIndex = within > 0.5 ? order[step] : order[Math.max(0, step - 1)];

  const cx = width / 2;
  const cy = height * 0.66;
  const radius = Math.min(width * 0.34, height * 0.52);

  const arc = (a: number) => ({
    x: cx + Math.sin((a * Math.PI) / 180) * radius,
    y: cy - Math.cos((a * Math.PI) / 180) * radius,
  });

  const start = arc(-84);
  const end = arc(84);

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {/* The track. */}
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={height * 0.055}
          strokeLinecap="round"
        />
        {/* Filled portion, up to the needle. */}
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${arc(angle).x} ${arc(angle).y}`}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={height * 0.055}
          strokeLinecap="round"
        />

        {/* Tick at each stop. */}
        {STOPS.map((stop) => {
          const inner = {
            x:
              cx +
              Math.sin((stop.angle * Math.PI) / 180) *
                (radius - height * 0.055),
            y:
              cy -
              Math.cos((stop.angle * Math.PI) / 180) *
                (radius - height * 0.055),
          };
          const outer = {
            x:
              cx +
              Math.sin((stop.angle * Math.PI) / 180) * (radius + height * 0.05),
            y:
              cy -
              Math.cos((stop.angle * Math.PI) / 180) * (radius + height * 0.05),
          };
          return (
            <line
              key={stop.label}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={2}
            />
          );
        })}

        {/* Needle. */}
        <line
          x1={cx}
          y1={cy}
          x2={arc(angle).x}
          y2={arc(angle).y}
          stroke={COLORS.text}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={height * 0.035} fill={COLORS.text} />
      </svg>

      {/* Stop labels, sitting outside the arc. */}
      {STOPS.map((stop, i) => {
        const p = {
          x:
            cx +
            Math.sin((stop.angle * Math.PI) / 180) * (radius + height * 0.17),
          y:
            cy -
            Math.cos((stop.angle * Math.PI) / 180) * (radius + height * 0.17),
        };
        const active = activeIndex === i;
        return (
          <div
            key={stop.label}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -50%)",
              fontFamily,
              fontSize: height * 0.07,
              fontWeight: active ? 800 : 600,
              color: active ? COLORS.accent : COLORS.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {stop.label}
          </div>
        );
      })}

      {/* What the current stop is for. */}
      <div
        style={{
          position: "absolute",
          right: 0,
          left: 0,
          bottom: 0,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.075,
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        {STOPS[activeIndex].note}
      </div>
    </div>
  );
};
