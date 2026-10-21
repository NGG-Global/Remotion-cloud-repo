import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DISPLAY } from "../fonts";
import { R } from "../theme";

type RLogoProps = {
  readonly size: number;
  readonly at?: number;
  /** Slow continuous wobble, in degrees. */
  readonly wobble?: number;
};

/**
 * A drawn stand-in for the R mark: the grey ring and a bold blue R. Drawn
 * rather than fetched, so no trademark artwork needs to ship with the repo.
 */
export const RLogo: React.FC<RLogoProps> = ({ size, at = 0, wobble = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  const ring = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const letter = spring({
    frame: local - 8,
    fps,
    config: { damping: 9, stiffness: 160, mass: 0.7 },
  });
  const rot = Math.sin(local / 38) * wobble;
  const ringLen = Math.PI * 2 * (size * 0.42);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `rotate(${rot}deg)`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="rring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#c8cdd6" />
            <stop offset="1" stopColor="#7d8591" />
          </linearGradient>
        </defs>
        <ellipse
          cx={size * 0.5}
          cy={size * 0.46}
          rx={size * 0.46}
          ry={size * 0.36}
          fill="none"
          stroke="url(#rring)"
          strokeWidth={size * 0.13}
          strokeDasharray={ringLen}
          strokeDashoffset={ringLen * (1 - ring)}
          strokeLinecap="round"
          transform={`rotate(-20 ${size * 0.5} ${size * 0.46})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: size * 0.78,
          color: R.blue,
          lineHeight: 1,
          paddingTop: size * 0.12,
          paddingLeft: size * 0.06,
          opacity: interpolate(letter, [0, 0.2], [0, 1], {
            extrapolateRight: "clamp",
          }),
          transform: `scale(${0.3 + letter * 0.7})`,
          textShadow: `0 ${size * 0.03}px 0 ${R.blueDeep}`,
        }}
      >
        R
      </div>
    </div>
  );
};
