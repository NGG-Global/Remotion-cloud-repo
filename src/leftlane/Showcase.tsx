import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { uiFontFamily } from "../fonts";
import { BRAND } from "./brand";
import { FOOTAGE, LABEL, SCENE } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.inOut(Easing.cubic);

/**
 * A framing of the 1920x1080 recording: `scale` magnifies it and the source
 * point (fx, fy) is placed at the centre of the frame. Scales above 1 crop into
 * the simulator; scales below 1 show the whole browser window as an object.
 */
type Framing = {
  readonly frame: number;
  readonly scale: number;
  readonly fx: number;
  readonly fy: number;
  readonly dy?: number;
  readonly opacity?: number;
};

const framingAt = (
  keys: readonly Framing[],
  frame: number,
): Required<Framing> => {
  const filled = keys.map((k) => ({ dy: 0, opacity: 1, ...k }));
  if (frame <= filled[0].frame) {
    return filled[0];
  }
  for (let i = 0; i < filled.length - 1; i++) {
    const a = filled[i];
    const b = filled[i + 1];
    if (frame <= b.frame) {
      const p = smooth(interpolate(frame, [a.frame, b.frame], [0, 1], clamp));
      const mix = (x: number, y: number) => x + (y - x) * p;
      return {
        frame,
        scale: mix(a.scale, b.scale),
        fx: mix(a.fx, b.fx),
        fy: mix(a.fy, b.fy),
        dy: mix(a.dy, b.dy),
        opacity: mix(a.opacity, b.opacity),
      };
    }
  }
  return filled[filled.length - 1];
};

/**
 * Take A, frames 1-137 of the recording: the straight approach in the left
 * lane, the turn into the roundabout, the first half of the lap.
 * Keyframes are in film frames.
 */
const CLIP_A: readonly Framing[] = [
  { frame: SCENE.clipA.start, scale: 1.45, fx: 960, fy: 583 },
  { frame: SCENE.clipA.start + 54, scale: 1.2, fx: 960, fy: 628 },
  { frame: LABEL.turns.start, scale: 1.2, fx: 960, fy: 628 },
  { frame: LABEL.turns.start + 30, scale: 1.32, fx: 1070, fy: 655 },
  { frame: SCENE.clipA.end, scale: 1.26, fx: 900, fy: 640 },
];

/**
 * Take B, frames 258-292: off the ring onto the exit road, straightening into
 * the left lane while the dash reads "Left lane". Cropped into the simulator.
 */
const CLIP_B: readonly Framing[] = [
  { frame: SCENE.clipB.start, scale: 1.3, fx: 960, fy: 660 },
  { frame: SCENE.clipB.end, scale: 1.22, fx: 960, fy: 636 },
];

/**
 * Take C, frames 27-75: the approach to the roundabout. Starts on the same
 * framing take B ends on, so the cut hides inside the camera move, then pulls
 * back until the whole browser window sits on the canvas, holds, and lets go.
 */
const CLIP_C: readonly Framing[] = [
  { frame: SCENE.clipC.start, scale: 1.22, fx: 960, fy: 636 },
  { frame: SCENE.clipC.start + 28, scale: 0.8, fx: 960, fy: 540 },
  { frame: SCENE.clipC.end - 13, scale: 0.8, fx: 960, fy: 540 },
  {
    frame: SCENE.clipC.end,
    scale: 0.64,
    fx: 960,
    fy: 540,
    dy: -90,
    opacity: 0,
  },
];

type ShowcaseProps = {
  readonly keys: readonly Framing[];
  readonly startFrame: number;
  readonly trimBefore: number;
  readonly trimAfter?: number;
  readonly fadeIn?: { start: number; end: number };
};

const Showcase: React.FC<ShowcaseProps> = ({
  keys,
  startFrame,
  trimBefore,
  trimAfter,
  fadeIn,
}) => {
  const frame = useCurrentFrame() + startFrame;
  const f = framingAt(keys, frame);

  const fade = fadeIn
    ? interpolate(frame, [fadeIn.start, fadeIn.end], [0, 1], clamp)
    : 1;

  // The window only becomes an object (rounded, shadowed) when it is smaller
  // than the frame. Above scale 1 it is full-bleed product footage.
  const windowness = interpolate(f.scale, [0.92, 1.0], [1, 0], clamp);
  const radius = (windowness * 18) / f.scale;

  const tx = 960 - f.fx * f.scale;
  const ty = 540 - f.fy * f.scale + f.dy;

  return (
    <AbsoluteFill style={{ opacity: fade * f.opacity }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${f.scale})`,
          borderRadius: radius,
          overflow: "hidden",
          boxShadow:
            windowness > 0
              ? `0 ${48 / f.scale}px ${140 / f.scale}px rgba(20,30,26,${0.2 * windowness}), 0 0 0 ${1 / f.scale}px rgba(20,30,26,${0.08 * windowness})`
              : "none",
        }}
      >
        <OffthreadVideo
          src={staticFile("leftlane/simulator-recording.mp4")}
          trimBefore={trimBefore}
          trimAfter={trimAfter}
          muted
          style={{ width: 1920, height: 1080, display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const ShowcaseClipA: React.FC = () => (
  <Showcase
    keys={CLIP_A}
    startFrame={SCENE.clipA.start}
    trimBefore={FOOTAGE.clipA.trimBefore}
    fadeIn={SCENE.simulatorFadeIn}
  />
);

export const ShowcaseClipB: React.FC = () => (
  <Showcase
    keys={CLIP_B}
    startFrame={SCENE.clipB.start}
    trimBefore={FOOTAGE.clipB.trimBefore}
    trimAfter={FOOTAGE.clipB.trimAfter}
  />
);

export const ShowcaseClipC: React.FC = () => (
  <Showcase
    keys={CLIP_C}
    startFrame={SCENE.clipC.start}
    trimBefore={FOOTAGE.clipC.trimBefore}
  />
);

/* ------------------------------------------------------------------------ */
/* Editorial labels                                                          */
/* ------------------------------------------------------------------------ */

type FeatureLabelProps = {
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly startFrame: number;
};

/**
 * A small caption in the lower left, over the dark dashboard. It names the
 * beat and leaves; the simulator stays the subject.
 */
const FeatureLabel: React.FC<FeatureLabelProps> = ({
  text,
  start,
  end,
  startFrame,
}) => {
  const frame = useCurrentFrame() + startFrame;
  if (frame < start || frame > end) {
    return null;
  }
  const enter = interpolate(frame, [start, start + 10], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(frame, [end - 7, end], [1, 0], clamp);
  const opacity = enter * exit;

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 928,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity,
        transform: `translateY(${(1 - enter) * 14}px)`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 3,
          background: BRAND.green,
          transform: `scaleX(${enter})`,
          transformOrigin: "left center",
        }}
      />
      <div
        style={{
          fontFamily: uiFontFamily,
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: "0.005em",
          color: BRAND.white,
          opacity: 0.94,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const MontageLabels: React.FC<{ readonly startFrame: number }> = ({
  startFrame,
}) => (
  <AbsoluteFill>
    <FeatureLabel
      text="Turns"
      start={LABEL.turns.start}
      end={LABEL.turns.end}
      startFrame={startFrame}
    />
    <FeatureLabel
      text="Roundabouts"
      start={LABEL.roundabouts.start}
      end={LABEL.roundabouts.end}
      startFrame={startFrame}
    />
    <FeatureLabel
      text="Keep left"
      start={LABEL.keepLeft.start}
      end={LABEL.keepLeft.end}
      startFrame={startFrame}
    />
  </AbsoluteFill>
);
