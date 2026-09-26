import { Easing, interpolate } from "remotion";

export type CameraVector = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
};

export const cameraPresets = {
  static: {
    from: { x: 0, y: 0, scale: 1 },
    to: { x: 0, y: 0, scale: 1 },
  },
  slowPushIn: {
    from: { x: 0, y: 0, scale: 1 },
    to: { x: 0, y: 16, scale: 1.08 },
  },
  slowPullOut: {
    from: { x: 0, y: 16, scale: 1.08 },
    to: { x: 0, y: 0, scale: 1 },
  },
  panLeft: {
    from: { x: 80, y: 0, scale: 1.06 },
    to: { x: -80, y: 0, scale: 1.06 },
  },
  panRight: {
    from: { x: -80, y: 0, scale: 1.06 },
    to: { x: 80, y: 0, scale: 1.06 },
  },
  tiltUp: {
    from: { x: 0, y: 48, scale: 1.06 },
    to: { x: 0, y: -36, scale: 1.06 },
  },
  tiltDown: {
    from: { x: 0, y: -36, scale: 1.06 },
    to: { x: 0, y: 48, scale: 1.06 },
  },
  handheldSubtle: {
    from: { x: 0, y: 0, scale: 1.03 },
    to: { x: 0, y: 0, scale: 1.03 },
  },
} as const;

export type CameraPresetName = keyof typeof cameraPresets;

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

export const cameraMotion = ({
  frame,
  durationInFrames,
  preset,
  from,
  to,
}: {
  readonly frame: number;
  readonly durationInFrames: number;
  readonly preset: CameraPresetName;
  readonly from?: CameraVector;
  readonly to?: CameraVector;
}): CameraVector => {
  const presetMotion = cameraPresets[preset];
  const start = from ?? presetMotion.from;
  const end = to ?? presetMotion.to;
  const progress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0, 1],
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const base: CameraVector = {
    x: mix(start.x, end.x, progress),
    y: mix(start.y, end.y, progress),
    scale: mix(start.scale, end.scale, progress),
  };
  if (preset !== "handheldSubtle") {
    return base;
  }
  return {
    x: base.x + Math.sin(frame / 8) * 6,
    y: base.y + Math.cos(frame / 11) * 4,
    scale: base.scale + Math.sin(frame / 17) * 0.004,
  };
};
