import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import type { Region } from "./regions";
import { useProjection } from "./UIShowcase";

export type AttachedFile = {
  /** Filename as it would read in the composer. */
  readonly name: string;
  /** Extension badge. Kept to three or four characters so the chip stays small. */
  readonly kind: string;
  /** Frame at which this file lands in the composer. */
  readonly at: number;
};

type AttachedChipsProps = {
  /** The composer's text line, which the chips row covers. */
  readonly region: Region;
  readonly files: readonly AttachedFile[];
  /**
   * Render the most recent arrival first, so it takes the right-hand end of
   * the row. For a long run of files this keeps the newest one on screen and
   * lets the older ones run off the far side, the way a real composer does.
   */
  readonly newestFirst?: boolean;
};

/** Badge colours per file type, close to the ones the real applications use. */
const BADGE: Record<string, string> = {
  pdf: "#c0392b",
  docx: "#2a5699",
  doc: "#2a5699",
  xlsx: "#1e7145",
  xls: "#1e7145",
  pptx: "#d24726",
  ppt: "#d24726",
  csv: "#1e7145",
};

/**
 * Files sitting in the composer, ready to be worked on.
 *
 * The screenshot was taken with an empty composer, so an episode about
 * bringing files into a conversation has nothing to point at. Drawing the
 * chips in screenshot coordinates puts them where they would really be — and
 * because they arrive one at a time, the attaching is something the viewer
 * watches rather than a state they are shown.
 *
 * The region is covered with the composer's own white first, the same way
 * `TypedPrompt` covers the baked-in placeholder.
 */
export const AttachedChips: React.FC<AttachedChipsProps> = ({
  region,
  files,
  newestFirst = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { project } = useProjection();

  const r = project(region);
  // Chip metrics come from the covered line's height, so they match the
  // interface's scale wherever the camera is.
  const chipHeight = r.h * 0.82;
  const fontSize = chipHeight * 0.42;
  const gap = chipHeight * 0.22;

  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        // The composer is right-aligned for Hebrew, so the first file attached
        // sits at the right and the row grows leftwards.
        direction: "rtl",
        gap,
        overflow: "hidden",
      }}
    >
      {(newestFirst ? [...files].reverse() : files).map((file, i) => {
        const pop = spring({
          frame: frame - file.at,
          fps,
          config: { damping: 60, stiffness: 170 },
        });
        if (frame < file.at - 2) {
          return null;
        }
        const badge = BADGE[file.kind.toLowerCase()] ?? "#6b6259";

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: chipHeight * 0.2,
              height: chipHeight,
              padding: `0 ${chipHeight * 0.3}px`,
              borderRadius: chipHeight * 0.24,
              background: "#faf9f5",
              border: "1px solid rgba(0,0,0,0.10)",
              flexShrink: 0,
              opacity: pop,
              transform: `translateY(${(1 - pop) * chipHeight * 0.5}px) scale(${0.88 + pop * 0.12})`,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: chipHeight * 0.5,
                height: chipHeight * 0.62,
                borderRadius: chipHeight * 0.09,
                background: badge,
                color: "#ffffff",
                fontFamily,
                fontSize: fontSize * 0.5,
                fontWeight: 700,
                letterSpacing: "0.02em",
                direction: "ltr",
                flexShrink: 0,
              }}
            >
              {file.kind.toUpperCase()}
            </span>
            <span
              style={{
                fontFamily,
                fontSize,
                fontWeight: 500,
                color: "#1f1e1d",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
