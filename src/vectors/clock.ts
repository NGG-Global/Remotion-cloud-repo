import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Scene-local clock in seconds. Inside a <Sequence>, frame 0 is the scene's
 * first frame and `dur` is the scene's own length.
 */
export const useScene = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return { t: frame / fps, dur: durationInFrames / fps, fps, frame };
};
