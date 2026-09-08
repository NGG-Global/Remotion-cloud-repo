import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

type SparkProps = {
  readonly size: number;
  readonly delay?: number;
  readonly color?: string;
  /** Number of spokes. */
  readonly spokes?: number;
  /** Continuous rotation in degrees across 100 frames. */
  readonly drift?: number;
  readonly opacity?: number;
};

/**
 * Radiating starburst used as the video's recurring motif — for the opening
 * mark, chapter cards and transition wipes.
 *
 * Spokes are drawn as tapered paths rather than rects so the tips come to a
 * soft point, and they bloom outwards one after another on entry.
 */
export const Spark: React.FC<SparkProps> = ({
  size,
  delay = 0,
  color = COLORS.accent,
  spokes = 12,
  drift = 18,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = frame - delay;
  const rotation = (local / 100) * drift;

  const half = size / 2;
  const inner = size * 0.055;
  const outer = half * 0.94;
  const waist = size * 0.021;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", overflow: "visible", opacity }}
      aria-hidden
    >
      <g transform={`translate(${half} ${half}) rotate(${rotation})`}>
        {Array.from({ length: spokes }, (_, i) => {
          // Stagger the bloom so the mark assembles rather than pops.
          const grow = spring({
            frame: local - i * 1.6,
            fps,
            config: { damping: 200, stiffness: 120 },
          });

          const length = outer * grow;
          const angle = (360 / spokes) * i;

          return (
            <path
              key={i}
              d={`M ${-waist} ${-inner} Q 0 ${-length} ${waist} ${-inner} Z`}
              fill={color}
              transform={`rotate(${angle})`}
              opacity={interpolate(grow, [0, 0.3, 1], [0, 0.7, 1], {
                extrapolateRight: "clamp",
              })}
            />
          );
        })}
        <circle
          r={
            inner *
            1.15 *
            spring({ frame: local, fps, config: { damping: 200 } })
          }
          fill={color}
        />
      </g>
    </svg>
  );
};
