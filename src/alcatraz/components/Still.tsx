import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  fitZoomRange,
  place,
  zoomBand,
  type Framing,
} from "../../doc/components/framing";
import { IMAGE_SIZES, type ImageId } from "../data/images";
import { AZ, easeInOut, ramp } from "../theme";

export type { Framing };

export const imageSrc = (id: ImageId): string =>
  staticFile(`alcatraz/img/${id}.jpg`);

export type Tone = "bw" | "sepia" | "color" | "cold" | "faded" | "sketch";

const FILTERS: Record<Tone, string> = {
  bw: "grayscale(1) contrast(1.12) brightness(0.9)",
  sepia: "grayscale(0.85) sepia(0.45) contrast(1.08) brightness(0.88)",
  color: "saturate(0.82) contrast(1.05) brightness(0.92)",
  cold: "grayscale(0.7) contrast(1.1) brightness(0.8) hue-rotate(-10deg)",
  faded: "grayscale(1) contrast(1.35) brightness(0.82)",
  // A pencil sketch on yellowed paper: pull the lines out of the stain.
  sketch: "grayscale(1) contrast(2.6) brightness(1.05) sepia(0.35)",
};

type StillProps = {
  readonly id: ImageId;
  /** Framing at the start and end of the shot: focal point in image fractions, zoom over "cover". */
  readonly from?: Framing;
  readonly to?: Framing;
  readonly tone?: Tone;
  /** Largest blow-up allowed, frame pixels per source pixel. */
  readonly maxUpscale?: number;
  /** `cover` keeps the frame full even if a small scan has to be enlarged. */
  readonly fill?: "mount" | "cover";
  /** Extra darkening, 0..1, for a shot that sits under type. */
  readonly dim?: number;
  /** Frames before the move starts and how long it takes; defaults to the whole shot. */
  readonly delay?: number;
  readonly duration?: number;
  readonly children?: React.ReactNode;
};

/**
 * Ken Burns over a still. The move is authored in image space and held inside
 * the band the scan can carry (see src/doc/components/framing.ts): a picture
 * too small to fill the frame sits whole on a blurred mount of itself instead
 * of being blown up into mush.
 */
export const Still: React.FC<StillProps> = ({
  id,
  from = { x: 0.5, y: 0.5, zoom: 1 },
  to = { x: 0.5, y: 0.5, zoom: 1.08 },
  tone = "bw",
  maxUpscale,
  fill = "mount",
  dim = 0,
  delay = 0,
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, durationInFrames } = useVideoConfig();
  const size = IMAGE_SIZES[id];
  const image = { file: id, w: size.w, h: size.h };
  const span = duration ?? durationInFrames - delay;
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

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: AZ.black }}>
      {covers ? null : <Mount id={id} />}
      <Img
        src={imageSrc(id)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size.w,
          height: size.h,
          maxWidth: "none",
          maxHeight: "none",
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          filter: FILTERS[tone],
          boxShadow: covers
            ? undefined
            : `0 0 ${Math.round(40 / scale)}px rgba(0,0,0,0.9)`,
        }}
      />
      {dim > 0 ? (
        <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />
      ) : null}
      {children ? (
        <AbsoluteFill>
          <Projected
            scale={scale}
            tx={tx}
            ty={ty}
            w={size.w}
            h={size.h}
          >
            {children}
          </Projected>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Overlays drawn in image coordinates (0..1 of the picture), so a highlight
 * stays on the thing it marks while the camera moves.
 */
const ProjectionContext = React.createContext<{
  readonly x: (fx: number) => number;
  readonly y: (fy: number) => number;
  readonly scale: number;
  readonly w: number;
  readonly h: number;
} | null>(null);

const Projected: React.FC<{
  readonly scale: number;
  readonly tx: number;
  readonly ty: number;
  readonly w: number;
  readonly h: number;
  readonly children: React.ReactNode;
}> = ({ scale, tx, ty, w, h, children }) => (
  <ProjectionContext.Provider
    value={{
      x: (fx) => tx + fx * w * scale,
      y: (fy) => ty + fy * h * scale,
      scale,
      w,
      h,
    }}
  >
    {children}
  </ProjectionContext.Provider>
);

export const useProjection = () => {
  const p = React.useContext(ProjectionContext);
  if (!p) throw new Error("useProjection must be used inside <Still>");
  return p;
};

const Mount: React.FC<{ readonly id: ImageId }> = ({ id }) => {
  const { width: W, height: H } = useVideoConfig();
  const size = IMAGE_SIZES[id];
  const scale = Math.max(W / size.w, H / size.h) * 1.2;
  const dw = size.w * scale;
  const dh = size.h * scale;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={imageSrc(id)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size.w,
          height: size.h,
          maxWidth: "none",
          maxHeight: "none",
          transformOrigin: "0 0",
          transform: `translate(${(W - dw) / 2}px, ${(H - dh) / 2}px) scale(${scale})`,
          filter: `blur(${Math.round(24 / scale)}px) brightness(0.28) grayscale(0.6)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.92) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
