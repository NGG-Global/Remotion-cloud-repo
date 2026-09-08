import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

/**
 * Line icons, drawn as path sets so each one can animate itself on.
 *
 * Every path carries `pathLength="1"`, which normalises its length regardless
 * of geometry. That lets a single dash offset draw any path on without
 * measuring it, so icons can be added here without touching the animation.
 */
const ICONS = {
  meeting: [
    "M5 9 h13 a2 2 0 0 1 2 2 v6 a2 2 0 0 1 -2 2 h-6 l-4 3 v-3 h-3 a2 2 0 0 1 -2 -2 v-6 a2 2 0 0 1 2 -2 z",
    "M13 6 h14 a2 2 0 0 1 2 2 v5 a2 2 0 0 1 -2 2 h-1",
  ],
  report: [
    "M8 3 h11 l6 6 v20 h-17 z",
    "M19 3 v6 h6",
    "M12 24 v-4",
    "M16 24 v-9",
    "M20 24 v-6",
  ],
  compare: [
    "M3 6 h10 v20 h-10 z",
    "M19 6 h10 v20 h-10 z",
    "M6 12 h4 M6 16 h4 M6 20 h3",
    "M22 12 h4 M22 16 h4 M22 20 h3",
    "M14.5 16 h3",
  ],
  table: [
    "M4 7 h24 v18 h-24 z",
    "M4 13 h24",
    "M4 19 h24",
    "M12 7 v18",
    "M20 7 v18",
  ],
  pen: [
    "M6 26 l3 -9 L22 4 a2.8 2.8 0 0 1 4 4 L13 21 z",
    "M6 26 l7 -5",
    "M4 30 h24",
  ],
  flow: [
    "M3 12 h6 v8 h-6 z",
    "M13 12 h6 v8 h-6 z",
    "M23 12 h6 v8 h-6 z",
    "M9 16 h4",
    "M19 16 h4",
  ],
  megaphone: [
    "M7 13 l12 -6 v18 l-12 -6 z",
    "M7 13 h-3 v6 h3",
    "M23 11 a8 8 0 0 1 0 10",
  ],
  slides: [
    "M4 5 h24 v15 h-24 z",
    "M16 20 v5",
    "M11 25 h10",
    "M8 10 h9",
    "M8 14 h5",
  ],
  bulb: [
    "M16 4 a8 8 0 0 1 5 14 v3 h-10 v-3 a8 8 0 0 1 5 -14 z",
    "M13 25 h6",
    "M14 28 h4",
  ],
  framework: ["M5 6 h22 v20 h-22 z", "M5 12 h22", "M12 12 v14", "M19 12 v14"],
  scale: [
    "M16 6 v20",
    "M8 28 h16",
    "M5 12 h22",
    "M5 12 l-3 6 a4 4 0 0 0 6 0 z",
    "M27 12 l-3 6 a4 4 0 0 0 6 0 z",
  ],
  repeat: [
    "M6 14 a10 10 0 0 1 18 -4",
    "M20 9 l4 1 l-1 4",
    "M26 18 a10 10 0 0 1 -18 4",
    "M12 23 l-4 -1 l1 -4",
  ],
  globe: [
    "M16 4 a12 12 0 1 0 0.01 0",
    "M4 16 h24",
    "M16 4 a15 12 0 0 0 0 24",
    "M16 4 a15 12 0 0 1 0 24",
  ],
  files: ["M6 9 h9 l3 3 h8 v14 h-20 z", "M10 6 h8 l3 3 h5"],
  mail: ["M4 8 h24 v16 h-24 z", "M4 9 l12 9 l12 -9"],
  calendar: [
    "M4 7 h24 v21 h-24 z",
    "M4 13 h24",
    "M10 4 v6",
    "M22 4 v6",
    "M10 19 h4",
  ],
  lock: ["M8 14 h16 v13 h-16 z", "M11 14 v-4 a5 5 0 0 1 10 0 v4", "M16 19 v3"],
  warning: ["M16 4 l12 22 h-24 z", "M16 12 v7", "M16 22.5 v0.5"],
  person: ["M16 6 a5 5 0 1 0 0.01 0", "M6 28 a10 10 0 0 1 20 0"],
  quote: [
    "M7 11 q0 -4 4 -4 v3 q-1.5 0 -1.5 1.5 h2.5 v6 h-5 z",
    "M18 11 q0 -4 4 -4 v3 q-1.5 0 -1.5 1.5 h2.5 v6 h-5 z",
  ],
  funnel: ["M4 6 h24 l-9 11 v10 l-6 3 v-13 z"],
  check: ["M6 17 l7 7 l13 -15"],
  shield: [
    "M16 4 l11 4 v9 c0 7 -5 10 -11 12 c-6 -2 -11 -5 -11 -12 v-9 z",
    "M11 16 l4 4 l7 -8",
  ],
  clock: ["M16 4 a12 12 0 1 0 0.01 0", "M16 9 v8 l5 3"],
  text: ["M6 7 h20", "M6 13 h20", "M6 19 h14", "M6 25 h9"],
  doc: [
    "M8 3 h11 l6 6 v20 h-17 z",
    "M19 3 v6 h6",
    "M12 16 h9",
    "M12 21 h9",
    "M12 11 h4",
  ],
} as const;

export type IconName = keyof typeof ICONS;

type LineIconProps = {
  readonly name: IconName;
  readonly size?: number;
  /** Frame at which the icon starts drawing. */
  readonly delay?: number;
  readonly color?: string;
  /** Frames the draw-on takes. */
  readonly drawFrames?: number;
  /** Add a soft idle wobble, so the icon keeps a little life on long holds. */
  readonly idle?: boolean;
};

/**
 * A line icon that draws itself on, then breathes.
 *
 * Paths draw in sequence rather than all at once — an icon assembling stroke
 * by stroke is what makes it read as drawn rather than as a fading image.
 */
export const LineIcon: React.FC<LineIconProps> = ({
  name,
  size = 44,
  delay = 0,
  color = COLORS.accent,
  drawFrames = 14,
  idle = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const paths = ICONS[name];

  const local = frame - delay;

  // A small pop on arrival gives the icon some character without it bouncing.
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 170 },
  });
  const scale = interpolate(pop, [0, 1], [0.72, 1]);

  const wobble = idle ? Math.sin(local / 34) * 1.6 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{
        display: "block",
        overflow: "visible",
        transform: `scale(${scale}) rotate(${wobble}deg)`,
      }}
      aria-hidden
    >
      {paths.map((d, index) => {
        const start = index * Math.max(2, drawFrames * 0.35);
        const drawn = interpolate(local - start, [0, drawFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <path
            key={`${name}-${index}`}
            d={d}
            pathLength={1}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={1 - drawn}
          />
        );
      })}
    </svg>
  );
};
