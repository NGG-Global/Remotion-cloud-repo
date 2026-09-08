import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

type BackdropProps = {
  readonly accentColor?: string;
};

/**
 * Slowly drifting gradient background.
 *
 * The movement is derived from the composition's own length rather than a fixed
 * frame count, so the same component reads correctly in a 3 second sting and in
 * a 30 second explainer.
 */
export const Backdrop: React.FC<BackdropProps> = ({
  accentColor = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const style = useMemo<React.CSSProperties>(() => {
    const angle = interpolate(frame, [0, durationInFrames], [135, 205]);
    const spread = interpolate(frame, [0, durationInFrames], [55, 80]);

    return {
      background: `linear-gradient(${angle}deg, ${COLORS.background} 0%, ${COLORS.surface} ${spread}%, ${COLORS.background} 100%)`,
    };
  }, [frame, durationInFrames]);

  const glowStyle = useMemo<React.CSSProperties>(() => {
    const drift = interpolate(frame, [0, durationInFrames], [-6, 6]);

    return {
      background: `radial-gradient(circle at ${50 + drift}% ${30 - drift}%, ${accentColor}33 0%, transparent 55%)`,
    };
  }, [frame, durationInFrames, accentColor]);

  return (
    <AbsoluteFill style={style}>
      <AbsoluteFill style={glowStyle} />
    </AbsoluteFill>
  );
};
