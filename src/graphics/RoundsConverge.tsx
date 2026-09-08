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

export type Round = {
  readonly label: string;
  /** Frame at which this round lands. */
  readonly at: number;
  /**
   * How close this round gets, 0-1. Drives the geometry only: it is how far
   * the blocks sit from the outline, not a measurement of anything.
   */
  readonly fit: number;
  /**
   * How close it got, in words. Shown instead of a number, which would read
   * as a score for something that was never scored.
   */
  readonly verdict: string;
};

type RoundsConvergeProps = {
  readonly width: number;
  readonly height: number;
  readonly rounds: readonly Round[];
};

/** The shape of the deliverable being aimed at, in fractions of the panel. */
const TARGET = [
  { x: 0.08, y: 0.08, w: 0.46, h: 0.12 },
  { x: 0.08, y: 0.26, w: 0.84, h: 0.08 },
  { x: 0.08, y: 0.4, w: 0.7, h: 0.08 },
  { x: 0.08, y: 0.56, w: 0.34, h: 0.12 },
  { x: 0.08, y: 0.74, w: 0.84, h: 0.08 },
  { x: 0.08, y: 0.86, w: 0.56, h: 0.08 },
] as const;

/**
 * Per-block error directions, fixed rather than generated.
 *
 * A round's blocks are pushed off the target along these vectors, scaled by
 * how far that round still is. Fixed values keep every frame identical and
 * keep the misfit looking like a misfit instead of noise.
 */
const DRIFT = [
  { dx: 0.1, dy: -0.03, dw: 0.34 },
  { dx: -0.06, dy: 0.04, dw: -0.22 },
  { dx: 0.08, dy: -0.05, dw: 0.16 },
  { dx: -0.09, dy: 0.03, dw: 0.4 },
  { dx: 0.05, dy: 0.05, dw: -0.3 },
  { dx: -0.07, dy: -0.04, dw: 0.26 },
] as const;

/**
 * Three passes closing on the same target.
 *
 * "The interesting part happens in the second and third round" is a claim
 * about convergence, which needs a fixed thing to converge on. The dashed
 * outline is that fixed thing, and it stays on screen throughout so each
 * round is measured against it rather than against the round before.
 */
export const RoundsConverge: React.FC<RoundsConvergeProps> = ({
  width,
  height,
  rounds,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PANEL = {
    width: Math.min(700, width * 0.4),
    height: height * 0.78,
  };
  const panelLeft = width * 0.5 - PANEL.width / 2;
  const panelTop = (height - PANEL.height) / 2 + 24;

  // The round currently on screen, and how far it has settled.
  let index = -1;
  for (let i = 0; i < rounds.length; i++) {
    if (frame >= rounds[i].at) {
      index = i;
    }
  }
  const current = index >= 0 ? rounds[index] : undefined;
  const previous = index > 0 ? rounds[index - 1] : undefined;

  const settle = current
    ? interpolate(frame, [current.at, current.at + 26], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.3, 0, 0.2, 1),
      })
    : 0;

  // Fit moves from the previous round's value to this one, so the counter and
  // the blocks travel together.
  const fit = current
    ? interpolate(settle, [0, 1], [previous?.fit ?? 0.1, current.fit])
    : 0;
  const error = 1 - fit;

  const done = current && current === rounds[rounds.length - 1];
  const snap = spring({
    frame: frame - (rounds[rounds.length - 1]?.at ?? 0) - 14,
    fps,
    config: { damping: 30, stiffness: 200, mass: 0.7 },
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {/* What is being aimed at. */}
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop,
          width: PANEL.width,
          height: PANEL.height,
          background: COLORS.surface,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {TARGET.map((block, i) => (
          <div
            key={`t${i}`}
            style={{
              position: "absolute",
              // Blocks are laid out from the right: these stand in for a
              // Hebrew deliverable.
              right: block.x * PANEL.width,
              top: block.y * PANEL.height,
              width: block.w * PANEL.width,
              height: block.h * PANEL.height,
              borderRadius: 8,
              border: "2px dashed rgba(255,255,255,0.42)",
              opacity: interpolate(frame, [0, 18], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        ))}

        {/* The current attempt. */}
        {current
          ? TARGET.map((block, i) => {
              const drift = DRIFT[i];
              const w = Math.max(0.06, block.w * (1 + drift.dw * error));
              return (
                <div
                  key={`a${i}`}
                  style={{
                    position: "absolute",
                    right: (block.x + drift.dx * error) * PANEL.width,
                    top: (block.y + drift.dy * error) * PANEL.height,
                    width: w * PANEL.width,
                    height: block.h * PANEL.height,
                    borderRadius: 8,
                    background: COLORS.accent,
                    opacity: done && snap > 0.3 ? 0.95 : 0.72,
                  }}
                />
              );
            })
          : null}
      </div>

      {/* Round markers, kept in view so the sequence is countable. */}
      {rounds.map((round, i) => {
        const show = interpolate(frame - (round.at - 10), [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (show <= 0) {
          return null;
        }
        const live = i === index;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: panelLeft + PANEL.width + 40,
              top: panelTop + 12 + i * 132,
              direction: "rtl",
              opacity: show,
              transform: `translateX(${(1 - show) * -16}px)`,
            }}
          >
            <div
              style={{
                fontFamily,
                fontSize: 34,
                fontWeight: 800,
                color: live ? COLORS.accent : COLORS.textMuted,
                whiteSpace: "nowrap",
              }}
            >
              {round.label}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily,
                fontSize: 26,
                fontWeight: 600,
                color: live ? COLORS.text : "#6b6259",
              }}
            >
              {round.verdict}
            </div>
            {/* A bar rather than a figure: it shows the closing without
                claiming to have measured it. */}
            <div
              style={{
                marginTop: 8,
                width: 190,
                height: 10,
                borderRadius: 5,
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
                  width: `${(live ? fit : round.fit) * 100}%`,
                  borderRadius: 5,
                  background: live ? COLORS.accent : "rgba(255,255,255,0.22)",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Where the draft starts, on the other side of the panel. */}
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop - 52,
          width: PANEL.width,
          direction: "rtl",
          textAlign: "center",
          fontFamily,
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.textMuted,
          opacity: interpolate(frame, [8, 26], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        התוצר שאתם רוצים
      </div>
    </div>
  );
};
