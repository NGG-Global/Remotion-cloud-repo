import React from "react";
import { AbsoluteFill } from "remotion";

type LandscapeProps = {
  /** Magnification of the 1920x1080 stage. 16/9 fills a 1080x1920 frame edge to edge. */
  readonly scale?: number;
  /** The stage point (in 1920x1080 coordinates) to pin under `x`,`y`. */
  readonly focusX?: number;
  readonly focusY?: number;
  /** Where in the parent that point lands. Defaults to the parent's centre. */
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly children: React.ReactNode;
};

/** Full-bleed crop of a 1080-tall stage into a 1080x1920 frame. */
export const FILL_SCALE = 1920 / 1080;

/**
 * The game's act graphics are drawn on a 1920x1080 stage. This mounts one at
 * its native size, then scales and pans it so a chosen point of the stage sits
 * where the vertical frame wants it: a close crop that reads as a camera
 * move rather than a letterboxed landscape clip.
 */
export const Landscape: React.FC<LandscapeProps> = ({
  scale = FILL_SCALE,
  focusX = 960,
  focusY = 540,
  x,
  y,
  width = 1080,
  height = 1920,
  children,
}) => {
  const cx = x ?? width / 2;
  const cy = y ?? height / 2;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: "0 0",
          transform: `translate(${cx - focusX * scale}px, ${cy - focusY * scale}px) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
