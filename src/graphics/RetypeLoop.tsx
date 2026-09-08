import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type LoopStation = {
  readonly label: string;
  /** Frame at which the token reaches this station. */
  readonly at: number;
  /** Context held at this point, 0-1. Drops to nothing at the new chat. */
  readonly context: number;
};

type RetypeLoopProps = {
  readonly width: number;
  readonly height: number;
  /** Exactly four stations: the cycle people actually run. */
  readonly stations: readonly LoopStation[];
  /** Frame at which the cycle is struck out. */
  readonly cutAt: number;
  readonly verdict?: string;
};

/**
 * The cycle of starting over, drawn as a cycle.
 *
 * Four sentences describe a loop that returns to where it began and throws
 * away what was built. Laid out as a list they would read as four separate
 * steps; laid out as a ring, with the context gauge emptying at the third
 * station, the waste is the shape of the picture.
 */
export const RetypeLoop: React.FC<RetypeLoopProps> = ({
  width,
  height,
  stations,
  cutAt,
  verdict = "לא צריך",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cx = width / 2;
  const cy = height * 0.5;
  const R = Math.min(height * 0.36, width * 0.2);

  /**
   * Station angles, starting at the top right and running anticlockwise, so
   * the leg across the top travels right to left with the language.
   */
  const angleFor = (i: number) => (-45 - i * 90) * (Math.PI / 180);
  const pos = (i: number) => ({
    x: cx + Math.cos(angleFor(i)) * R,
    y: cy + Math.sin(angleFor(i)) * R,
  });

  const first = stations[0]?.at ?? 0;
  const last = stations[stations.length - 1]?.at ?? first + 120;
  // The token keeps going past the final station, back to the start: the
  // return is the point.
  const closeAt = last + (last - first) / Math.max(1, stations.length - 1);
  const sweep = interpolate(frame, [first, closeAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tokenAngle = angleFor(0) - sweep * 2 * Math.PI;
  const tokenX = cx + Math.cos(tokenAngle) * R;
  const tokenY = cy + Math.sin(tokenAngle) * R;

  const cut = interpolate(frame - cutAt, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const verdictPop = spring({
    frame: frame - (cutAt + 8),
    fps,
    config: { damping: 40, stiffness: 200, mass: 0.7 },
  });

  // Context held right now: the value of the last station reached.
  let held = 0;
  for (const station of stations) {
    if (frame >= station.at) {
      held = station.context;
    }
  }
  const gauge = interpolate(frame, [first, first + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={COLORS.textMuted}
          strokeWidth={3}
          strokeDasharray="10 12"
          opacity={(0.35 - cut * 0.2) * gauge}
        />
        {/* The travelled arc, so the return to the start is visible as a
            closed circle rather than inferred from the token's position. */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={COLORS.warn}
          strokeWidth={5}
          pathLength="1"
          strokeDasharray={1}
          strokeDashoffset={1 - sweep}
          opacity={0.75 * (1 - cut * 0.65)}
          transform={`rotate(-45 ${cx} ${cy}) scale(1 -1) translate(0 ${-cy * 2})`}
        />

        {frame >= first ? (
          <circle
            cx={tokenX}
            cy={tokenY}
            r={13}
            fill={COLORS.warn}
            opacity={1 - cut * 0.7}
          />
        ) : null}

        {/* The slash that ends it. */}
        {cut > 0 ? (
          <line
            x1={cx - R - 60}
            y1={cy + R + 40}
            x2={cx - R - 60 + (2 * R + 120) * cut}
            y2={cy + R + 40 - (2 * R + 80) * cut}
            stroke={COLORS.accent}
            strokeWidth={10}
            strokeLinecap="round"
          />
        ) : null}
      </svg>

      {stations.map((station, i) => {
        const p = pos(i);
        const reached = interpolate(frame - station.at, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const show = interpolate(frame - (station.at - 14), [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (show <= 0) {
          return null;
        }

        // Labels sit outside the ring, pushed away from the centre, so no
        // label crosses the track the token runs on.
        const outward = 1.34;
        const lx = cx + Math.cos(angleFor(i)) * R * outward;
        const ly = cy + Math.sin(angleFor(i)) * R * outward;
        const dropped = station.context === 0 && reached > 0.4;

        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: p.x - 26,
                top: p.y - 26,
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: reached > 0.4 ? COLORS.warn : COLORS.surfaceRaised,
                border: `2px solid ${
                  reached > 0.4 ? COLORS.warn : "rgba(255,255,255,0.14)"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontSize: 26,
                fontWeight: 800,
                color: reached > 0.4 ? COLORS.background : COLORS.textMuted,
                opacity: show * (1 - cut * 0.55),
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                position: "absolute",
                left: lx - 175,
                top: ly - 32,
                width: 350,
                textAlign: "center",
                direction: "rtl",
                fontFamily,
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.28,
                color: dropped ? COLORS.warn : COLORS.text,
                opacity: show * (1 - cut * 0.55),
                transform: `scale(${0.94 + reached * 0.06})`,
              }}
            >
              {station.label}
            </div>
          </React.Fragment>
        );
      })}

      {/* What the cycle costs: the context, emptied at station three. */}
      {cut < 0.4 ? (
        <div
          style={{
            position: "absolute",
            left: cx - 130,
            top: cy - 52,
            width: 260,
            direction: "rtl",
            textAlign: "center",
            opacity: gauge * (1 - cut * 2.5),
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.textMuted,
              marginBottom: 10,
            }}
          >
            ההקשר שנצבר
          </div>
          <div
            style={{
              height: 18,
              borderRadius: 9,
              background: "rgba(255,255,255,0.09)",
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
                width: `${held * 100}%`,
                borderRadius: 9,
                background: held > 0 ? COLORS.accent : "transparent",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily,
              fontSize: 26,
              fontWeight: 800,
              color: held === 0 ? COLORS.warn : COLORS.accentSoft,
            }}
          >
            {held === 0 ? "אפס" : `${Math.round(held * 100)}%`}
          </div>
        </div>
      ) : null}

      {/* The verdict, in the middle of the loop it replaces. */}
      {frame >= cutAt + 4 ? (
        <div
          style={{
            position: "absolute",
            left: cx - 220,
            top: cy - 46,
            width: 440,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 78,
            fontWeight: 900,
            color: COLORS.accent,
            // The slash runs through this word, so it carries its own ground.
            textShadow:
              "0 0 22px rgba(20,17,14,0.98), 0 0 8px rgba(20,17,14,1)",
            opacity: Math.min(1, verdictPop * 1.3),
            transform: `scale(${0.7 + Math.min(1, verdictPop) * 0.3})`,
          }}
        >
          {verdict}
        </div>
      ) : null}
    </div>
  );
};
