import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  cameraMotion,
  type CameraPresetName,
  type CameraVector,
} from "../animation/camera";

type CameraProps = {
  readonly children?: React.ReactNode;
  readonly preset?: CameraPresetName;
  readonly from?: CameraVector;
  readonly to?: CameraVector;
  readonly durationInFrames?: number;
};

/**
 * Moves the world under a fixed frame. Pass `from` and `to` for a custom move,
 * or a `preset`. Explicit endpoints replace the preset's endpoints.
 * Handheld wobble is still applied when `preset` is `handheldSubtle`.
 */
export const Camera: React.FC<CameraProps> = ({
  children,
  preset = "static",
  from,
  to,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const motion = cameraMotion({
    frame,
    durationInFrames: durationInFrames ?? config.durationInFrames,
    preset,
    from,
    to,
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${motion.x}px, ${motion.y}px) scale(${motion.scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
