import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useVideoConfig,
} from "remotion";
import { clamp01, easeOut, useClock } from "../clock";
import { BODY, DISPLAY, shade, TT } from "../theme";
import { HANDLE, type Shot } from "./shots";

/**
 * A captured gameplay clip, full frame. `offset` is seconds past the clip's
 * in-point to start from; the file's own handle is skipped by default.
 */
export const Footage: React.FC<{
  readonly shot: Shot;
  readonly offset?: number;
}> = ({ shot, offset = 0 }) => {
  const { fps } = useVideoConfig();
  return (
    <OffthreadVideo
      src={staticFile(shot.file)}
      trimBefore={Math.round((HANDLE + offset) * fps)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

/** Hard cut with a punch: a little oversize on the first frame, settling by 0.3 s. */
export const PunchIn: React.FC<{
  readonly amount?: number;
  readonly children: React.ReactNode;
}> = ({ amount = 0.06, children }) => {
  const { time } = useClock();
  const scale = 1 + amount * (1 - easeOut(time / 0.3));
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>
  );
};

/** Ink at the top and bottom edges so stamped type reads over any footage. */
export const Vignette: React.FC<{ readonly top?: number; readonly bottom?: number }> = ({
  top = 0.32,
  bottom = 0.22,
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `linear-gradient(180deg, rgba(26,46,40,${top}) 0%, rgba(26,46,40,0) 26%, rgba(26,46,40,0) 74%, rgba(26,46,40,${bottom}) 100%)`,
    }}
  />
);

type CardProps = {
  readonly tilt: number;
  readonly delay?: number;
  readonly width?: number;
  readonly children: React.ReactNode;
};

/**
 * Footage as a tilted paper card slammed onto the bench: ink border, hard
 * shadow, a spring that overshoots the tilt. Alternating the sign of `tilt`
 * from cut to cut is what keeps a montage from reading as a slideshow.
 */
export const Card: React.FC<CardProps> = ({ tilt, delay = 0, width = 760, children }) => {
  const { frame, fps } = useClock();
  const { width: W, height: H } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 190 },
  });
  const height = (width * H) / W;
  const rot = tilt * 2.6 - tilt * 1.6 * enter;
  const scale = 0.82 + 0.18 * enter;
  return (
    <div
      style={{
        position: "absolute",
        left: (W - width) / 2,
        top: (H - height) / 2 + 90,
        width,
        height,
        borderRadius: 56,
        overflow: "hidden",
        border: `12px solid ${TT.inkDeep}`,
        boxShadow: `0 26px 0 ${shade(TT.ink, -0.1)}55, 0 0 0 4px ${TT.cream}`,
        background: TT.paper,
        transform: `rotate(${rot}deg) scale(${scale})`,
        transformOrigin: "50% 60%",
        opacity: interpolate(enter, [0, 0.15], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      {children}
    </div>
  );
};

type StickerProps = {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly rotate?: number;
  readonly delay?: number;
  readonly size?: number;
  readonly fill?: string;
  readonly color?: string;
};

/** A printed sticker: cream pill, ink border, slapped on with a spring. */
export const Sticker: React.FC<StickerProps> = ({
  text,
  x,
  y,
  rotate = -5,
  delay = 0,
  size = 54,
  fill = TT.cream,
  color = TT.ink,
}) => {
  const { frame, fps } = useClock();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 9, mass: 0.6, stiffness: 220 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: `${size * 0.26}px ${size * 0.7}px`,
        borderRadius: 999,
        background: fill,
        color,
        border: `${Math.max(6, size * 0.13)}px solid ${TT.inkDeep}`,
        boxShadow: `0 ${size * 0.16}px 0 ${TT.inkDeep}`,
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${0.4 + 0.6 * enter})`,
        opacity: interpolate(enter, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      {text}
    </div>
  );
};

/** The game's curtain, cut for a portrait frame: paper over coral over ink, sheared. */
export const Curtain: React.FC<{ readonly progress: number }> = ({ progress }) => {
  const { width: w, height: h } = useVideoConfig();
  const p = progress;
  if (p <= 0 || p >= 2) return null;
  const shear = w * 0.22;
  const span = w + shear;
  const edge = p <= 1 ? (1 - p) * span - shear : -(p - 1) * span - shear;
  const right = p <= 1 ? w + shear : w - (p - 1) * span;
  const band = (offset: number) => {
    const x1 = edge - offset;
    const x2 = right;
    return `${x1},0 ${x2},0 ${x2 + shear},${h} ${x1 + shear},${h}`;
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
        <polygon points={band(30)} fill={shade(TT.ink, -0.2)} />
        <polygon points={band(20)} fill={TT.coral} />
        <polygon points={band(0)} fill={TT.paperLift} />
      </svg>
    </AbsoluteFill>
  );
};

/** One curtain pass across a cut: covers over 0.3 s, clears over the next 0.3 s. */
export const CurtainPass: React.FC<{ readonly at: number }> = ({ at }) => {
  const { time } = useClock();
  const local = time - at;
  if (local < -0.3 || local > 0.3) return null;
  const progress = local < 0 ? 1 + local / 0.3 : 1 + local / 0.3;
  return <Curtain progress={progress} />;
};

/** A row of area names sliding across the bottom edge, one pill each. */
export const AreaMarquee: React.FC<{
  readonly names: readonly string[];
  readonly y: number;
  readonly speed?: number;
}> = ({ names, y, speed = 420 }) => {
  const { time } = useClock();
  const { width } = useVideoConfig();
  const x = width + 40 - time * speed;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        display: "flex",
        gap: 22,
        transform: `translateX(${x}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {names.map((name, i) => (
        <div
          key={name}
          style={{
            padding: "14px 34px",
            borderRadius: 999,
            background: i % 2 === 0 ? TT.cream : TT.sunSoft,
            color: TT.ink,
            border: `6px solid ${TT.inkDeep}`,
            boxShadow: `0 8px 0 ${TT.inkDeep}`,
            fontFamily: BODY,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
          }}
        >
          {name}
        </div>
      ))}
    </div>
  );
};

/** Progress 0→1 across a bar, for anything that should breathe with the beat. */
export const beatPulse = (beat: number): number => clamp01(1 - (beat % 1));
