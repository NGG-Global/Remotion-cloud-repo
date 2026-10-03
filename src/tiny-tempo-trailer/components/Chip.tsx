import React from "react";
import { useCurrentFrame } from "remotion";
import { BODY, PANEL, shade, TT } from "../theme";

type ChipProps = {
  readonly text: string;
  readonly at: number;
  readonly until?: number;
  readonly tone?: "cream" | "coral" | "ink";
  readonly size?: number;
  readonly style?: React.CSSProperties;
};

/**
 * The game's threshold chip: a small cream slab with an ink label, lifted on the one
 * light. Used for the words that name what is on screen — WATCH, TAP, a tempo — never
 * for a sentence.
 */
export const Chip: React.FC<ChipProps> = ({
  text,
  at,
  until,
  tone = "cream",
  size = 34,
  style,
}) => {
  const frame = useCurrentFrame();
  const age = frame - at;
  if (age < 0) return null;
  if (until !== undefined && frame >= until) return null;
  const p = Math.min(1, age / 5);
  const rise = (1 - p) ** 2 * 18;
  const leaving =
    until !== undefined ? Math.max(0, 1 - (until - frame) / 3) : 0;

  const face = tone === "coral" ? TT.coral : tone === "ink" ? TT.ink : TT.cream;
  const ink = tone === "cream" ? TT.ink : TT.cream;
  const edge = tone === "cream" ? TT.inkDeep : shade(face, -0.45);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${size * 0.42}px ${size * 0.9}px ${size * 0.5}px`,
        borderRadius: size * 1.1,
        background: face,
        color: ink,
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        boxShadow: `0 0 0 ${PANEL.outline * 0.55}px ${edge}, 0 ${PANEL.depth * 0.55}px 0 ${PANEL.outline * 0.55}px ${edge}`,
        opacity: Math.min(1, age / 2 + 0.3) * (1 - leaving),
        transform: `translateY(${rise}px)`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
