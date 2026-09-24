import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { archiveSrc, type ArchiveImage } from "../archive";
import { DOC, easeInOut, ramp } from "../theme";
import { fitZoomRange, place, zoomBand, type Framing } from "./framing";
import { Mount } from "./Mount";

export type { Framing } from "./framing";

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
  /**
   * Largest blow-up allowed, in frame pixels per source pixel. Raise it only
   * for a large sheet whose detail is the point, such as a map.
   */
  readonly maxUpscale?: number;
  /**
   * `mount` (default) shows a picture too small for the frame whole, on a
   * mount of itself. `cover` fills the frame whatever it costs, for a photo
   * used as the backdrop to a dramatisation rather than as a document.
   */
  readonly fill?: "mount" | "cover";
  /** Slight blur, for material that is out of focus behind something else. */
  readonly blur?: number;
  readonly style?: React.CSSProperties;
};

/**
 * Ken Burns over an archival image.
 *
 * The move is expressed in image space (a focal point and a zoom), so the same
 * framing works whatever the image's aspect. Zoom 1 is the smallest scale that
 * covers the frame; the focal point is what sits centre-frame.
 *
 * What the call site asks for is a wish, not an instruction. `framing.ts` holds
 * the move inside the band this particular scan can carry, and a picture too
 * small to fill the frame is shown whole on a mount rather than blown up until
 * nobody can tell what it is. The authored push survives; only its depth is
 * traded for legibility.
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
  maxUpscale,
  fill = "mount",
  blur = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, durationInFrames } = useVideoConfig();
  const span = duration ?? durationInFrames;
  const t = easeInOut(ramp(frame, delay, delay + span));

  const band = zoomBand(image, W, H, {
    maxUpscale,
    floor: fill === "cover" ? "cover" : "contain",
  });
  const [z0, z1] = fitZoomRange(from.zoom, to.zoom, band);
  const { scale, tx, ty, covers } = place(
    image,
    W,
    H,
    {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      zoom: z0 + (z1 - z0) * t,
    },
    band,
  );

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
      {covers ? null : <Mount image={image} />}
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
          boxShadow: covers
            ? undefined
            : `0 0 ${Math.round(46 / scale)}px rgba(0, 0, 0, 0.85)`,
          willChange: "transform",
        }}
      />
      <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};
