import React from "react";
import { AbsoluteFill } from "remotion";

type SceneProps = {
  readonly children?: React.ReactNode;
  readonly background?: string;
};

/** Full-frame stage. Children are positioned inside it. */
export const Scene: React.FC<SceneProps> = ({
  children,
  background = "#101418",
}) => {
  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      {children}
    </AbsoluteFill>
  );
};
