import React from "react";
import { AbsoluteFill } from "remotion";
import { Fog } from "../../doc/look/Fog";

type ForegroundFogProps = {
  readonly opacity?: number;
};

/**
 * The documentary already has a frame-driven fog made from local cloud tiles.
 * The asset id `fog` reuses that component instead of drawing a second one.
 */
export const ForegroundFog: React.FC<ForegroundFogProps> = ({
  opacity = 1,
}) => {
  return (
    <AbsoluteFill style={{ opacity }}>
      <Fog density={0.62} band="low" speed={0.45} blend="screen" />
    </AbsoluteFill>
  );
};
