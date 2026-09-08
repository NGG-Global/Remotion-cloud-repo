import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE } from "../theme";

type AnimatedHeadlineProps = {
  readonly text: string;
  /** Frames to wait before the first word appears. */
  readonly delay?: number;
  readonly fontSize?: number;
  readonly color?: string;
};

/** Frames between consecutive words. Small enough to read as one gesture. */
const WORD_STAGGER = 3;

/**
 * Headline that reveals one word at a time.
 *
 * Every word runs its own `spring()` offset by its index. Because `spring()` is
 * a pure function of the frame number, the animation is deterministic: frame
 * 42 looks identical whether it is scrubbed in the Studio, rendered locally, or
 * rendered on a farm of machines.
 */
export const AnimatedHeadline: React.FC<AnimatedHeadlineProps> = ({
  text,
  delay = 0,
  fontSize = FONT_SIZE.display,
  color = COLORS.text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <h1
      style={{
        margin: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: "0.25em",
        fontFamily,
        fontSize,
        fontWeight: 800,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color,
      }}
    >
      {text.split(" ").map((word, index) => {
        const progress = spring({
          frame: frame - delay - index * WORD_STAGGER,
          fps,
          // High damping gives a firm settle with no visible bounce, which
          // suits corporate titles better than a springy overshoot.
          config: { damping: 200 },
        });

        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [fontSize * 0.35, 0])}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </h1>
  );
};
