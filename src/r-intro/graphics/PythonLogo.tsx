import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type PythonLogoProps = {
  readonly size: number;
  readonly at?: number;
  readonly wobble?: number;
};

/** The Python mark supplied with the brief, popping in with a wobble. */
export const PythonLogo: React.FC<PythonLogoProps> = ({
  size,
  at = 0,
  wobble = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  const p = spring({
    frame: local,
    fps,
    config: { damping: 9, stiffness: 150, mass: 0.7 },
  });
  const rot = -Math.sin(local / 42) * wobble;
  return (
    <Img
      src={staticFile("r-intro/python-logo.png")}
      style={{
        width: size,
        height: size,
        display: "block",
        opacity: interpolate(p, [0, 0.2], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `scale(${0.3 + p * 0.7}) rotate(${rot}deg)`,
        filter: `drop-shadow(0 16px 24px rgba(29,36,51,0.25))`,
      }}
    />
  );
};
