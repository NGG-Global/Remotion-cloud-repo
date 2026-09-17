import React from "react";
import { interpolate, spring } from "remotion";
import { useClock } from "../clock";
import { BODY, DISPLAY, TT } from "../theme";

type StampTypeProps = {
  readonly text: string;
  readonly size: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly delay?: number;
  readonly weight?: number;
  readonly align?: "left" | "center" | "right";
  readonly italic?: boolean;
  readonly shadow?: boolean;
  readonly maxWidth?: number;
};

/**
 * Fredoka with the game's printed-sticker outline: a hard ink stroke and a
 * close drop shadow. Springs in with a squash, matching the workshop
 * exaggeration rather than a corporate fade.
 */
export const StampType: React.FC<StampTypeProps> = ({
  text,
  size,
  fill = TT.cream,
  stroke = TT.inkDeep,
  delay = 0,
  weight = 700,
  align = "center",
  italic = false,
  shadow = true,
  maxWidth,
}) => {
  const { frame, fps } = useClock();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, mass: 0.55, stiffness: 170 },
  });
  const strokeWidth = Math.max(3, size * 0.055);
  const drop = Math.max(2, size * 0.07);
  const y = interpolate(progress, [0, 1], [size * 0.55, 0]);
  const squish = 1 + (1 - progress) * 0.18;
  const wide = 1 - (1 - progress) * 0.12;

  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        lineHeight: 0.92,
        letterSpacing: "-0.03em",
        color: fill,
        textAlign: align,
        whiteSpace: "pre-line",
        maxWidth,
        opacity: interpolate(progress, [0, 0.25], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${y}px) scale(${wide}, ${squish})`,
        transformOrigin:
          align === "left"
            ? "left bottom"
            : align === "right"
              ? "right bottom"
              : "center bottom",
        WebkitTextStroke: `${strokeWidth}px ${stroke}`,
        paintOrder: "stroke fill",
        textShadow: shadow ? `0 ${drop}px 0 ${stroke}` : "none",
      }}
    >
      {text}
    </div>
  );
};

type BodyCopyProps = {
  readonly text: string;
  readonly size?: number;
  readonly color?: string;
  readonly delay?: number;
  readonly align?: "left" | "center" | "right";
  readonly weight?: number;
};

export const BodyCopy: React.FC<BodyCopyProps> = ({
  text,
  size = 36,
  color = TT.muted,
  delay = 0,
  align = "center",
  weight = 700,
}) => {
  const { frame, fps } = useClock();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <p
      style={{
        margin: 0,
        fontFamily: BODY,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
        color,
        textAlign: align,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
      }}
    >
      {text}
    </p>
  );
};
