import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import type { Region } from "./regions";
import { useProjection } from "./UIShowcase";

export type CursorStop = {
  /** Frame at which the pointer starts moving to this target. */
  readonly at: number;
  readonly region: Region;
  /** Travel time in frames. */
  readonly duration?: number;
  /** Show a click ripple once the pointer arrives. */
  readonly click?: boolean;
};

type CursorProps = {
  readonly stops: readonly CursorStop[];
  /** Frame at which the pointer fades in. */
  readonly appearAt?: number;
};

const TRAVEL = Easing.bezier(0.32, 0, 0.2, 1);

/**
 * Pointer that travels between interface elements and clicks.
 *
 * The path is derived from the stop list rather than animated per-property so
 * the pointer is always exactly on the element it is about to click, which is
 * what makes a UI walkthrough read as real.
 */
export const Cursor: React.FC<CursorProps> = ({ stops, appearAt = 0 }) => {
  const frame = useCurrentFrame();
  const { project } = useProjection();

  // Screen position of a region's centre, in window pixels.
  const centreOf = (region: Region) => {
    const r = project(region);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  };

  if (stops.length === 0) {
    return null;
  }

  let index = 0;
  for (let i = 0; i < stops.length; i++) {
    if (frame >= stops[i].at) {
      index = i;
    }
  }

  const stop = stops[index];
  const duration = stop.duration ?? 22;
  const target = centreOf(stop.region);

  let position = target;
  if (index > 0) {
    const from = centreOf(stops[index - 1].region);
    const t = interpolate(frame, [stop.at, stop.at + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: TRAVEL,
    });
    // A slight arc reads as a hand movement rather than a linear tween.
    const arc = Math.sin(t * Math.PI) * 26;
    position = {
      x: from.x + (target.x - from.x) * t,
      y: from.y + (target.y - from.y) * t - arc,
    };
  }

  const { x, y } = position;

  // Constant on-canvas size: the pointer is an annotation, not part of the
  // screenshot, so it must not scale with the camera.
  const size = 34;
  const opacity = interpolate(frame, [appearAt, appearAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Click ripple fires when the pointer lands on a stop marked as a click.
  const clickFrame = stop.click ? stop.at + duration : null;
  const ripple =
    clickFrame === null
      ? 0
      : interpolate(frame, [clickFrame, clickFrame + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const rippleVisible =
    clickFrame !== null && frame >= clickFrame && ripple < 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        pointerEvents: "none",
      }}
    >
      {rippleVisible ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size * 2.6,
            height: size * 2.6,
            marginLeft: -size * 1.3,
            marginTop: -size * 1.3,
            borderRadius: "50%",
            border: `${Math.max(2, size * 0.09)}px solid ${COLORS.accent}`,
            transform: `scale(${0.25 + ripple * 0.95})`,
            opacity: 1 - ripple,
          }}
        />
      ) : null}

      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 24 34"
        style={{
          display: "block",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.45))",
        }}
        aria-hidden
      >
        <path
          d="M3 2 L3 26 L9.5 20 L14 31 L18.5 29 L14 18.5 L21 18.5 Z"
          fill="#ffffff"
          stroke={COLORS.ink}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
