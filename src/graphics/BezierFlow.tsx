import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export type Point = { readonly x: number; readonly y: number };

/** A cubic bezier, as its four control points. */
export type Curve = {
  readonly from: Point;
  readonly c1: Point;
  readonly c2: Point;
  readonly to: Point;
};

/**
 * Position along a cubic bezier at parameter `t`.
 *
 * Evaluated from the control points rather than measured off a rendered path
 * with `getPointAtLength()`. A DOM measurement needs a ref and an effect,
 * which means the first frame renders before the measurement lands — and a
 * frame that depends on a previous frame's measurement is not deterministic,
 * so it cannot be rendered out of order the way Remotion does.
 */
export const pointOnCurve = (curve: Curve, t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * curve.from.x + b * curve.c1.x + c * curve.c2.x + d * curve.to.x,
    y: a * curve.from.y + b * curve.c1.y + c * curve.c2.y + d * curve.to.y,
  };
};

/** The curve as an SVG path, for drawing the route the tokens follow. */
export const curveToPath = (curve: Curve): string =>
  `M ${curve.from.x} ${curve.from.y} C ${curve.c1.x} ${curve.c1.y}, ${curve.c2.x} ${curve.c2.y}, ${curve.to.x} ${curve.to.y}`;

type BezierFlowProps = {
  readonly curve: Curve;
  /** How many tokens travel the curve. */
  readonly count?: number;
  /** Frame at which the first token sets off. */
  readonly delay?: number;
  /** Frames one token takes to cross. */
  readonly travel?: number;
  /** Frames between consecutive tokens. */
  readonly stagger?: number;
  readonly color?: string;
  readonly size?: number;
  /** Draw the route itself, faintly, behind the tokens. */
  readonly showTrack?: boolean;
  /** Stop emitting after this frame, so a flow can end rather than loop. */
  readonly until?: number;
};

/**
 * Tokens travelling along a curve.
 *
 * The workhorse for "this information moves from here to there": a document
 * reaching Claude, a request reaching a system, an answer coming back. Motion
 * along a path reads as transfer in a way that two boxes and an arrow do not.
 */
export const BezierFlow: React.FC<BezierFlowProps> = ({
  curve,
  count = 4,
  delay = 0,
  travel = 40,
  stagger = 10,
  color = COLORS.accent,
  size = 9,
  showTrack = true,
  until,
}) => {
  const frame = useCurrentFrame();

  return (
    <>
      {showTrack ? (
        <path
          d={curveToPath(curve)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.22}
          strokeDasharray="6 7"
        />
      ) : null}

      {Array.from({ length: count }, (_, i) => {
        const start = delay + i * stagger;
        if (until !== undefined && start > until) {
          return null;
        }

        const t = interpolate(frame - start, [0, travel], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Nothing is drawn before a token sets off or after it lands, so the
        // flow reads as discrete parcels rather than a queue at each end.
        if (frame < start || t >= 1) {
          return null;
        }

        const p = pointOnCurve(curve, t);
        // Fade in and out at the ends so a token does not pop into being.
        const opacity = interpolate(t, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={size / 2}
            fill={color}
            opacity={opacity}
          />
        );
      })}
    </>
  );
};
