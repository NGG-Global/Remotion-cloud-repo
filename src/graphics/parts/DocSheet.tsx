import React from "react";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../theme";

export type DocLine = {
  /** Line length as a fraction of the sheet's text column. */
  readonly width: number;
  /** Draw as a heading rather than body text. */
  readonly heading?: boolean;
};

type DocSheetProps = {
  readonly width: number;
  readonly height: number;
  readonly lines: readonly DocLine[];
  /**
   * How much of the sheet is written, 0-1. Lines fill in order, and the line
   * at the boundary is drawn part-width, so the sheet reads as being composed
   * rather than as a block that fades in.
   */
  readonly progress?: number;
  /** Colour of the body lines. Headings always take the accent. */
  readonly tone?: string;
  /** Accent for headings and the rule under them. */
  readonly accent?: string;
  /** Softening, in pixels, for a sheet that is meant to look unusable. */
  readonly blur?: number;
  /** Corner label, for a draft number or a version tag. */
  readonly tag?: string;
  readonly tagColor?: string;
  readonly background?: string;
  readonly borderColor?: string;
  readonly opacity?: number;
};

/**
 * A sheet of written output, abstracted to bars.
 *
 * Every scene in this episode compares one piece of output with another, so
 * the page itself has to carry meaning without being readable: length,
 * structure and sharpness do the work that the words would. Real sentences
 * would pull the eye into reading and away from the narration.
 */
export const DocSheet: React.FC<DocSheetProps> = ({
  width,
  height,
  lines,
  progress = 1,
  tone = COLORS.textMuted,
  accent = COLORS.accent,
  blur = 0,
  tag,
  tagColor,
  background = COLORS.surface,
  borderColor = "rgba(255,255,255,0.09)",
  opacity = 1,
}) => {
  const padX = width * 0.11;
  const padY = height * 0.11;
  const column = width - padX * 2;
  const rows = lines.length;
  const gap = (height - padY * 2) / Math.max(1, rows);
  const written = progress * rows;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: Math.min(18, width * 0.05),
        background,
        border: `1px solid ${borderColor}`,
        overflow: "hidden",
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        opacity,
      }}
    >
      {lines.map((line, i) => {
        // Fraction of this line that is written: 1 for lines already passed,
        // a partial for the line the cursor is on, 0 for lines not yet reached.
        const fill = Math.max(0, Math.min(1, written - i));
        if (fill <= 0) {
          return null;
        }
        const barHeight = line.heading ? gap * 0.4 : gap * 0.22;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: padY + i * gap + (gap - barHeight) / 2,
              // Text starts at the right edge of the column: these sheets
              // stand in for Hebrew documents.
              right: padX,
              width: column * line.width * fill,
              height: barHeight,
              borderRadius: barHeight / 2,
              background: line.heading ? accent : tone,
              opacity: line.heading ? 0.95 : 0.5,
            }}
          />
        );
      })}

      {tag ? (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            direction: "rtl",
            fontFamily,
            fontSize: Math.max(13, height * 0.055),
            fontWeight: 700,
            letterSpacing: "0.04em",
            padding: "3px 10px",
            borderRadius: 999,
            color: tagColor ?? COLORS.ink,
            background: tagColor ? "rgba(0,0,0,0.35)" : COLORS.labelBg,
          }}
        >
          {tag}
        </div>
      ) : null}
    </div>
  );
};

/** Body-text sheet layouts, so the graphics don't each invent their own. */
export const PLAIN_LINES: readonly DocLine[] = [
  { width: 0.96 },
  { width: 0.9 },
  { width: 0.94 },
  { width: 0.86 },
  { width: 0.92 },
  { width: 0.72 },
];

/** A structured deliverable: headings with body under each. */
export const STRUCTURED_LINES: readonly DocLine[] = [
  { width: 0.5, heading: true },
  { width: 0.93 },
  { width: 0.84 },
  { width: 0.42, heading: true },
  { width: 0.9 },
  { width: 0.66 },
];
