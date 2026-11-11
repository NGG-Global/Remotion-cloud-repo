import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useShot } from "../engine/shot";
import { EASE, clamp, hash, ramp } from "../engine/time";
import { PHOTOS, photoSrc, type PhotoId } from "../media";
import { INK, W, H } from "../theme";
import { CENTER, mix, place, type Framing } from "./frame";
import { gradeFilter, gradeTint, type Grade } from "./grade";

export type PhotoProps = {
  /** A magazine photograph, or a frame pulled from the archive video. */
  readonly photo?: PhotoId;
  readonly still?: { readonly file: string; readonly w: number; readonly h: number };
  readonly from?: Framing;
  readonly to?: Framing;
  readonly grade?: Grade;
  /**
   * `full`: the photo fills the frame. `print`: a print lying on a dark
   * table, slightly turned, for photographs presented as photographs.
   */
  readonly look?: "full" | "print";
  /** Camera flashes at these narration times. */
  readonly flashes?: readonly number[];
  /** A shutter blink at the start (a still taken from the video). */
  readonly shutter?: boolean;
};

/**
 * Ken Burns over a still. A photograph too small to fill 1920 wide is not
 * blown up past legibility: in `full` it is placed over a soft, darkened
 * enlargement of itself, the way broadcast documentaries mount archive.
 */
export const Photo: React.FC<PhotoProps> = ({
  photo,
  still,
  from = CENTER,
  to,
  grade = "photo",
  look = "full",
  flashes = [],
  shutter = false,
}) => {
  const { t, n, dur } = useShot();
  const meta = photo ? PHOTOS[photo] : still!;
  const src = photo ? photoSrc(photo) : staticFile(`munzer/stills/${still!.file}`);
  const k = EASE.drift(clamp(t / Math.max(dur, 0.01)));
  const f = mix(from, to ?? from, k);
  const tint = gradeTint(grade);

  // Largest scale that still reads as a photograph rather than mush.
  const maxScale = 2.6;
  const coverScale = Math.max(W / meta.w, H / meta.h) * f.z;
  const tooSmall = look === "full" && coverScale > maxScale;

  const flash = flashes.reduce((acc, at) => {
    const d = n - at;
    return d >= 0 && d < 0.35 ? Math.max(acc, 1 - d / 0.35) : acc;
  }, 0);
  const blink = shutter ? 1 - ramp(t, 0, 0.28, EASE.out) : 0;

  let body: React.ReactNode;
  if (look === "print") {
    const ph = 860;
    const pw = (meta.w / meta.h) * ph;
    const rot = (hash(meta.w + meta.h) - 0.5) * 4;
    const z = 1 + 0.08 * k;
    body = (
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 70% at 50% 45%, #1c1b19 0%, ${INK.void} 100%)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: pw + 36,
            height: ph + 36,
            background: "#e9e3d6",
            padding: 18,
            transform: `rotate(${rot}deg) scale(${z})`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          }}
        >
          <Img
            src={src}
            style={{ width: pw, height: ph, filter: gradeFilter(grade), display: "block" }}
          />
        </div>
      </AbsoluteFill>
    );
  } else if (tooSmall) {
    const fitScale = Math.min(maxScale, Math.min(W / meta.w, H / meta.h) * f.z);
    const pw = meta.w * fitScale;
    const ph = meta.h * fitScale;
    const dx = (0.5 - f.x) * pw * 0.35;
    const dy = (0.5 - f.y) * ph * 0.35;
    body = (
      <AbsoluteFill style={{ background: INK.void }}>
        <Img
          src={src}
          style={{
            position: "absolute",
            inset: -80,
            width: W + 160,
            height: H + 160,
            objectFit: "cover",
            filter: `${gradeFilter(grade)} blur(38px) brightness(0.42)`,
          }}
        />
        <Img
          src={src}
          style={{
            position: "absolute",
            left: (W - pw) / 2 + dx,
            top: (H - ph) / 2 + dy,
            width: pw,
            height: ph,
            filter: gradeFilter(grade),
            boxShadow: "0 0 90px rgba(0,0,0,0.85)",
          }}
        />
      </AbsoluteFill>
    );
  } else {
    const { scale, tx, ty } = place(meta.w, meta.h, f, "cover");
    body = (
      <AbsoluteFill style={{ background: INK.void, overflow: "hidden" }}>
        <Img
          src={src}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: meta.w,
            height: meta.h,
            maxWidth: "none",
            transformOrigin: "0 0",
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            filter: gradeFilter(grade),
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {body}
      {tint ? <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply" }} /> : null}
      {flash > 0 ? (
        <AbsoluteFill style={{ background: "#fffaf0", opacity: flash * 0.75 }} />
      ) : null}
      {blink > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: blink }} /> : null}
    </AbsoluteFill>
  );
};
