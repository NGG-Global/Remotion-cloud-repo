import React from "react";
import { AbsoluteFill } from "remotion";

type LayerProps = {
  readonly children?: React.ReactNode;
  readonly zIndex?: number;
  readonly opacity?: number;
};

/** Stacking wrapper. Higher zIndex paints above lower ones. */
export const Layer: React.FC<LayerProps> = ({
  children,
  zIndex = 0,
  opacity = 1,
}) => {
  return (
    <AbsoluteFill style={{ zIndex, opacity, pointerEvents: "none" }}>
      {children}
    </AbsoluteFill>
  );
};
