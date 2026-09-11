import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { archiveSrc, type ArchiveImage } from "../archive";
import { DOC, easeInOut, ramp } from "../theme";

/** A framing of the image: focal point in image fractions, and a zoom over "cover". */
export type Framing = {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
};

type ArchivalProps = {
  readonly image: ArchiveImage;
  readonly from: Framing;
  readonly to: Framing;
  /** Frames the move takes; defaults to the whole sequence. */
  readonly duration?: number;
  /** Frames to wait before the move starts. */
  readonly delay?: number;
  /** Finish. `sepia` for photographs, `print` for engravings and newspaper, `cold` for night. */
  readonly tone?: "sepia" | "print" | "cold" | "none";
  /** 0-1, how far towards monochrome. */
  readonly desaturate?: number;
  readonly brightness?: number;
  readonly contrast?: number;
  /** Fit the image to the frame by covering it (default) or containing it on a dark mount. */
  readonly fit?: "cover" | "contain";
  /** Slight blur, for material that is out of focus behind something else. */
  readonly blur?: number;
  readonly style?: React.CSSProperties;
};

/**
 * Ken Burns over an archival image.
 *
 * The move is expressed in image space (a focal point and a zoom), so the
 * same framing works whatever the image's aspect. Zoom 1 is the smallest
 * scale that covers the frame; the focal point is what sits centre-frame.
 */
export const Archival: React.FC<ArchivalProps> = ({
  image,
  from,
  to,
  duration,
  delay = 0,
  tone = "sepia",
  desaturate = 0.85,
  brightness = 0.82,
  contrast = 1.1,
  fit = "cover",
  blur = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, durationInFrames } = useVideoConfig();
  const span = duration ?? durationInFrames;
  const t = easeInOut(ramp(frame, delay, delay + span));

  const base =
    fit === "cover"
      ? Math.max(W / image.w, H / image.h)
      : Math.min(W / image.w, H / image.h);
  const zoom = from.zoom + (to.zoom - from.zoom) * t;
  const fx = from.x + (to.x - from.x) * t;
  const fy = from.y + (to.y - from.y) * t;
  const scale = base * zoom;

  // Put the focal point at frame centre.
  const tx = W / 2 - fx * image.w * scale;
  const ty = H / 2 - fy * image.h * scale;

  const filter = [
    `saturate(${1 - desaturate})`,
    tone === "sepia" ? "sepia(0.55)" : "",
    `brightness(${brightness})`,
    `contrast(${contrast})`,
    blur > 0 ? `blur(${blur}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const tint =
    tone === "cold"
      ? "rgba(70, 95, 130, 0.35)"
      : tone === "sepia"
        ? "rgba(120, 90, 50, 0.16)"
        : tone === "print"
          ? "rgba(90, 80, 60, 0.12)"
          : "transparent";

  return (
    <AbsoluteFill
      style={{ overflow: "hidden", background: DOC.black, ...style }}
    >
      <Img
        src={archiveSrc(image)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: image.w,
          height: image.h,
          maxWidth: "none",
          maxHeight: "none",
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          filter,
          willChange: "transform",
        }}
      />
      <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};
