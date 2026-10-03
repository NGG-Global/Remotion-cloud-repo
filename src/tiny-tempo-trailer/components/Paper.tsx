import React from "react";
import { AbsoluteFill } from "remotion";
import { Grain } from "../../tiny-tempo/components/stage";
import { TT } from "../theme";

/**
 * The bench behind a framed shot: the game's paper, a still pool of its sun, its grain.
 * No drift and no gradient wash — the recordings supply the motion.
 */
export const Paper: React.FC<{
  readonly children?: React.ReactNode;
  readonly sunX?: number;
  readonly sunY?: number;
}> = ({ children, sunX = 50, sunY = 38 }) => (
  <AbsoluteFill style={{ backgroundColor: TT.paper, overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${sunX}% ${sunY}%, ${TT.sun}4d 0%, ${TT.sun}1f 30%, transparent 64%)`,
      }}
    />
    <Grain opacity={0.1} />
    {children}
  </AbsoluteFill>
);
