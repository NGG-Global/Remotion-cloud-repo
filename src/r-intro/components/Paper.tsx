import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { R } from "../theme";

type PaperProps = {
  readonly children?: React.ReactNode;
  /** Tint of the drifting blobs behind the content. */
  readonly tint?: string;
  readonly tintAlt?: string;
};

/**
 * The cream stage every scene sits on. Two large soft blobs drift slowly so
 * long holds never look frozen, and a faint dot grid gives the paper texture
 * without the cost of a noise filter per frame.
 */
export const Paper: React.FC<PaperProps> = ({
  children,
  tint = R.sky,
  tintAlt = R.yellowLit,
}) => {
  const frame = useCurrentFrame();
  const x1 = 18 + Math.sin(frame / 140) * 8;
  const y1 = 22 + Math.cos(frame / 170) * 6;
  const x2 = 84 - Math.sin(frame / 160) * 7;
  const y2 = 78 + Math.cos(frame / 150) * 6;
  const breathe = interpolate(Math.sin(frame / 90), [-1, 1], [0.9, 1.08]);

  return (
    <AbsoluteFill style={{ background: R.paper }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(${46 * breathe}% ${30 * breathe}% at ${x1}% ${y1}%, ${tint} 0%, transparent 70%)`,
          opacity: 0.85,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(44% 28% at ${x2}% ${y2}%, ${tintAlt} 0%, transparent 70%)`,
          opacity: 0.55,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${R.ink}12 1.6px, transparent 1.6px)`,
          backgroundSize: "36px 36px",
          opacity: 0.5,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
