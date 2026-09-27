import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Person } from "../rig/Person";
import {
  CRAWL,
  CROUCH,
  KNEEL,
  SIT,
  STAND,
  dig,
  gesture,
  idle,
  pose,
  talk,
  walk,
} from "../rig/pose";
import {
  DETECTIVE,
  GACY,
  GACY_SUIT,
  GACY_WORK,
  JUDGE,
  MOTHER,
  NEIGHBORS,
  OFFICER,
  POGO,
  ROBERT,
  WORKERS,
} from "../rig/cast";

/** Maintainer's reference: every look and the core poses on one frame. */
export const RigSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const row1 = [
    { look: GACY, p: talk(idle(STAND, t, 1), t, 1) },
    { look: GACY_WORK, p: gesture(idle(STAND, t, 2), t, 2) },
    { look: GACY_SUIT, p: idle(STAND, t, 3) },
    { look: POGO, p: idle(pose({ smile: 1 }), t, 4) },
    { look: ROBERT, p: idle(STAND, t, 5) },
    { look: MOTHER, p: idle(pose({ brow: -0.6 }), t, 6) },
    { look: OFFICER, p: idle(STAND, t, 7) },
    { look: DETECTIVE, p: idle(STAND, t, 8) },
    { look: JUDGE, p: idle(STAND, t, 9) },
  ];
  const row2 = [
    { look: WORKERS[0], p: walk(STAND, t * 0.9), view: "3q" as const },
    { look: WORKERS[1], p: SIT, view: "3q" as const },
    { look: WORKERS[2], p: KNEEL, view: "3q" as const },
    { look: WORKERS[3], p: CROUCH, view: "3q" as const },
    { look: GACY_WORK, p: CRAWL, view: "3q" as const },
    { look: WORKERS[0], p: dig(STAND, t * 0.6), view: "3q" as const },
    { look: NEIGHBORS[1], p: idle(STAND, t, 12), view: "front" as const },
    { look: NEIGHBORS[3], p: idle(STAND, t, 13), view: "back" as const },
    { look: GACY, p: idle(STAND, t, 14), view: "front" as const },
  ];
  return (
    <AbsoluteFill style={{ background: "#8a8a86" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <rect x={0} y={470} width={1920} height={4} fill="#555" />
        <rect x={0} y={1000} width={1920} height={4} fill="#555" />
        {row1.map((c, i) => (
          <Person key={i} x={130 + i * 205} y={470} s={1.1} look={c.look} pose={c.p} />
        ))}
        {row2.map((c, i) => (
          <Person key={i} x={130 + i * 205} y={1000} s={1.1} look={c.look} pose={c.p} view={c.view} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
