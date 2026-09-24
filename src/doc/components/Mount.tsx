import React from "react";
import { AbsoluteFill, Img, useVideoConfig } from "remotion";
import { archiveSrc, type ArchiveImage } from "../archive";
import { DOC } from "../theme";

/**
 * The surround a picture sits on when it is too small to fill the frame.
 *
 * Half this archive is a portrait-format scan of a few hundred pixels. Blowing
 * one up until it covers 16:9 destroys it, so it is shown whole instead, on a
 * mount made from a blurred, darkened copy of itself: the frame stays full and
 * takes its colour from the picture, and the eye still goes to the sheet.
 */
export const Mount: React.FC<{
  readonly image: ArchiveImage;
  /** Extra filter for the backdrop, on top of the blur and the darkening. */
  readonly filter?: string;
}> = ({ image, filter = "" }) => {
  const { width: W, height: H } = useVideoConfig();
  const scale = Math.max(W / image.w, H / image.h) * 1.18;
  const dw = image.w * scale;
  const dh = image.h * scale;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DOC.black }}>
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
          transform: `translate(${(W - dw) / 2}px, ${(H - dh) / 2}px) scale(${scale})`,
          filter: `blur(${Math.round(26 / scale)}px) brightness(0.3) saturate(0.4) ${filter}`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0.92) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
