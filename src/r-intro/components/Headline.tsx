import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bidiUnits } from "./bidi";
import { HEBREW } from "../fonts";
import { R, SIZE } from "../theme";

type HeadlineProps = {
  readonly text: string;
  readonly at?: number;
  readonly size?: number;
  readonly weight?: number;
  readonly color?: string;
  readonly align?: "center" | "start";
  /** Words drawn in the highlight colour, on a yellow marker stroke. */
  readonly mark?: readonly string[];
  readonly markColor?: string;
  readonly maxWidth?: number;
  readonly stagger?: number;
  readonly dir?: "rtl" | "ltr";
};

const strip = (w: string) => w.replace(/[.,!?:;"'׳״()]/g, "");

/**
 * Word-by-word Hebrew headline. Each word bounces up into place; marked words
 * get a highlighter stroke that sweeps in behind them a beat later.
 */
export const Headline: React.FC<HeadlineProps> = ({
  text,
  at = 0,
  size = SIZE.heading,
  weight = 800,
  color = R.ink,
  align = "center",
  mark = [],
  markColor = R.yellow,
  maxWidth,
  stagger = 2.2,
  dir = "rtl",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const units = bidiUnits(text);

  return (
    <div
      style={{
        direction: dir,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `${size * 0.05}px ${size * 0.24}px`,
        fontFamily: HEBREW,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.2,
        color,
        maxWidth,
        textAlign: align === "center" ? "center" : "start",
      }}
    >
      {units.map((unit, i) => {
        const word = unit.text;
        const local = frame - at - i * stagger;
        const p = spring({
          frame: local,
          fps,
          config: { damping: 12, stiffness: 160, mass: 0.6 },
        });
        const marked = mark.some((m) =>
          word.split(" ").some((w) => strip(w) === strip(m)),
        );
        const sweep = interpolate(local - 6, [0, 10], [0, 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              position: "relative",
              opacity: interpolate(p, [0, 0.3], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${(1 - p) * size * 0.5}px) rotate(${(1 - p) * (i % 2 ? 6 : -6)}deg)`,
              padding: marked ? `0 ${size * 0.08}px` : 0,
              direction: unit.latin ? "ltr" : dir,
              unicodeBidi: unit.latin ? "isolate" : undefined,
            }}
          >
            {marked ? (
              <span
                style={{
                  position: "absolute",
                  insetInlineStart: 0,
                  bottom: size * 0.08,
                  height: size * 0.5,
                  width: `${sweep}%`,
                  background: markColor,
                  borderRadius: size * 0.1,
                  transform: "rotate(-1.5deg)",
                  zIndex: -1,
                }}
              />
            ) : null}
            {word}
          </span>
        );
      })}
    </div>
  );
};
