import React from "react";
import { evolvePath } from "@remotion/paths";
import { makeRect } from "@remotion/shapes";
import { Easing, interpolate, useCurrentFrame } from "remotion";

const DOOR = makeRect({ width: 150, height: 300, cornerRadius: 4 });
const SWING = "M 70 360 A 150 150 0 0 1 220 360";

/**
 * Door swinging open from its left hinge. Timing comes from the frame.
 */
export const DoorOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 45], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const angle = interpolate(progress, [0, 1], [0, -62]);
  const arc = evolvePath(progress, SWING);

  return (
    <svg viewBox="0 0 420 480" width="100%" height="100%">
      <rect x={40} y={40} width={250} height={340} fill="#cbb59a" />
      <rect x={58} y={58} width={214} height={300} fill="#1b2430" />
      <path
        d={SWING}
        fill="none"
        stroke="#f2e2c4"
        strokeWidth={4}
        strokeDasharray={arc.strokeDasharray}
        strokeDashoffset={arc.strokeDashoffset}
      />
      <g transform={`translate(70 70) rotate(${angle} 0 0)`}>
        <path d={DOOR.path} fill="#8a5a32" stroke="#5c3a1e" strokeWidth={4} />
        <circle cx={120} cy={160} r={7} fill="#e6c56a" />
      </g>
    </svg>
  );
};
