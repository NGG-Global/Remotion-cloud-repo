import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../motion";
import { LAYOUT } from "../theme";

/**
 * The illustration band above the captions. Every scene renders into a
 * 1080-wide SVG/HTML stage of fixed height, and the stage handles the cut:
 * a quick scale-and-fade in, and a fade out over the scene's last frames.
 */
export const Stage: React.FC<{
  readonly children: React.ReactNode;
  readonly fadeOut?: boolean;
}> = ({ children, fadeOut = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;
  const enter = interpolate(t, [0, 0.35], [0, 1], CLAMP);
  const exit = fadeOut
    ? interpolate(t, [total - 0.25, total], [1, 0], CLAMP)
    : 1;
  const scale = 0.94 + 0.06 * enter;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: LAYOUT.stageTop,
        width: 1080,
        height: LAYOUT.stageHeight,
        opacity: enter * exit,
        transform: `scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </div>
  );
};
