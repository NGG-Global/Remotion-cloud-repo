import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  clipFile,
  stillVariant,
  type ClipV,
  type Move,
  type StillV,
} from "../data/edit";
import { STILLS } from "../data/stills";
import { B as H, easeInOut } from "../theme";

/*
 * The colour grade is baked into the media (tools/hiroshima/cut-clips.mjs and
 * grade-stills.mjs, filters in data/edit.ts): this renderer composites in
 * software, where a full-frame CSS filter roughly doubled the cost of a frame.
 * Only transforms and a flat black "dim" layer are applied here.
 */

const lerpMove = (a: Move | undefined, b: Move | undefined, t: number) => {
  const ax = a?.x ?? 0.5;
  const ay = a?.y ?? 0.5;
  const az = a?.z ?? 1;
  const bx = b?.x ?? ax;
  const by = b?.y ?? ay;
  const bz = b?.z ?? az;
  return {
    x: ax + (bx - ax) * t,
    y: ay + (by - ay) * t,
    z: az + (bz - az) * t,
  };
};

/**
 * The camera on a picture: object-fit cover, then a zoom around the focal
 * point. Zoom never goes below 1, so an edge of the picture can never slide
 * into frame, whatever the source's aspect.
 */
const cameraStyle = (
  from: Move | undefined,
  to: Move | undefined,
  progress: number,
): React.CSSProperties => {
  const m = lerpMove(from, to, easeInOut(progress));
  const z = Math.max(1, m.z);
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${m.x * 100}% ${m.y * 100}%`,
    transform: `scale(${z})`,
    transformOrigin: `${m.x * 100}% ${m.y * 100}%`,
  };
};

const Dim: React.FC<{ dim?: number }> = ({ dim }) =>
  dim ? <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} /> : null;

type ShotProps = {
  /** Frames the shot is on screen, tail included; the move spans all of it. */
  readonly frames: number;
};

export const ClipShot: React.FC<ShotProps & { readonly v: ClipV }> = ({
  v,
  frames,
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, frames - 1)));
  return (
    <AbsoluteFill style={{ background: H.black, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`bundy/clips/${clipFile(v)}`)}
        muted
        playbackRate={v.r ?? 1}
        pauseWhenBuffering={false}
        style={cameraStyle(v.from, v.to, progress)}
      />
      <Dim dim={v.dim} />
    </AbsoluteFill>
  );
};

/**
 * A still. Landscape pictures are filmed across the frame; portrait ones and
 * small scans sit whole on a blurred, darkened copy of themselves (a mount),
 * because blowing a portrait photograph up to cover 16:9 throws away most of
 * it, often the part that matters.
 */
export const StillShot: React.FC<ShotProps & { readonly v: StillV }> = ({
  v,
  frames,
}) => {
  const frame = useCurrentFrame();
  const img = STILLS[v.img];
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, frames - 1)));
  const aspect = img.w / img.h;
  const fit = v.fit ?? (aspect < 1.25 || img.w < 900 ? "mount" : "cover");
  const name = stillVariant(v);
  const src = staticFile(`bundy/graded/${name}.jpg`);

  if (fit === "cover") {
    return (
      <AbsoluteFill style={{ background: H.black, overflow: "hidden" }}>
        <Img src={src} style={cameraStyle(v.from, v.to, progress)} />
        <Dim dim={v.dim} />
      </AbsoluteFill>
    );
  }

  // Mounted: the picture whole, breathing slowly, over its own blur.
  const m = lerpMove(v.from, v.to, easeInOut(progress));
  const breathe = 0.86 * Math.max(1, m.z);
  return (
    <AbsoluteFill style={{ background: H.black, overflow: "hidden" }}>
      <Img
        src={staticFile(`bundy/graded/${name}-mount.jpg`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(110% 90% at 50% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 75%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={src}
          style={{
            height: aspect < 16 / 9 ? `${breathe * 100}%` : undefined,
            width: aspect >= 16 / 9 ? `${breathe * 100}%` : undefined,
            objectFit: "contain",
            transform: `translate(${(0.5 - m.x) * 8}%, ${(0.5 - m.y) * 8}%)`,
            boxShadow: "0 30px 90px rgba(0,0,0,0.85)",
          }}
        />
      </AbsoluteFill>
      <Dim dim={v.dim} />
    </AbsoluteFill>
  );
};
