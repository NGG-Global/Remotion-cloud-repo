import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

type KineticTextProps = {
  readonly text: string;
  /** Frames to wait before the first word appears. */
  readonly delay?: number;
  readonly fontSize?: number;
  readonly fontWeight?: number;
  readonly color?: string;
  /** Right-to-left for Hebrew, left-to-right for Latin. */
  readonly dir?: "rtl" | "ltr";
  /** Frames between consecutive words. */
  readonly stagger?: number;
  readonly align?: "start" | "center" | "end";
  readonly maxWidth?: number;
  /** Highlight these words in the accent colour. */
  readonly emphasise?: readonly string[];
};

/**
 * Word-by-word text reveal, aware of writing direction.
 *
 * Hebrew has to lay out as RTL at the flex-container level: splitting a Hebrew
 * string on spaces yields words in logical order, and only `direction: rtl`
 * places the first word on the right where a reader expects it. Setting the
 * direction on the individual words instead would render them in reverse.
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  fontSize = 72,
  fontWeight = 700,
  color = COLORS.text,
  dir = "rtl",
  stagger = 2.5,
  align = "start",
  maxWidth,
  emphasise,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stripped = (word: string) => word.replace(/[.,!?:;"'׳״()]/g, "");
  const isEmphasised = (word: string) =>
    emphasise?.some((e) => stripped(word) === stripped(e)) ?? false;

  return (
    <div
      style={{
        direction: dir,
        display: "flex",
        flexWrap: "wrap",
        gap: `${fontSize * 0.08}px ${fontSize * 0.26}px`,
        justifyContent:
          align === "center"
            ? "center"
            : align === "end"
              ? "flex-end"
              : "flex-start",
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight: 1.22,
        letterSpacing: dir === "rtl" ? "0" : "-0.02em",
        color,
        maxWidth,
      }}
    >
      {text.split(" ").map((word, index) => {
        const progress = spring({
          frame: frame - delay - index * stagger,
          fps,
          config: { damping: 200 },
        });

        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              color: isEmphasised(word) ? COLORS.accent : undefined,
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [fontSize * 0.32, 0])}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
