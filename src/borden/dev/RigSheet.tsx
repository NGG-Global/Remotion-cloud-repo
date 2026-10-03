import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fonts";
import { Person } from "../../gacy/rig/Person";
import { SIT, STAND, gesture, idle, pose, talk, walk } from "../../gacy/rig/pose";
import { ABBY, ALICE, ANDREW, ANDREW_HAT, BRIDGET, DR_BOWEN, EMMA, JUDGES, JURORS, KNOWLTON, LIZZIE, LIZZIE_BLACK, LIZZIE_CHILD, LIZZIE_OLD, MILL_WORKERS, MORSE, OFFICER, PALE_MAN, PHARMACIST, ROBINSON, SHADOW, TOWNSFOLK } from "../rig/cast";

/** Maintainer's reference: the Borden cast on one frame. */
export const BordenRigSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const row1 = [
    { look: LIZZIE, p: idle(STAND, t, 1) },
    { look: LIZZIE_BLACK, p: idle(STAND, t, 2) },
    { look: LIZZIE_OLD, p: idle(STAND, t, 3) },
    { look: EMMA, p: talk(idle(STAND, t, 4), t, 4) },
    { look: ANDREW, p: idle(STAND, t, 5) },
    { look: ANDREW_HAT, p: walk(STAND, t * 0.8) },
    { look: ABBY, p: idle(STAND, t, 6) },
    { look: BRIDGET, p: gesture(idle(STAND, t, 7), t, 7) },
    { look: MORSE, p: idle(STAND, t, 8) },
  ];
  const row2 = [
    { look: DR_BOWEN, p: idle(STAND, t, 9), view: "3q" as const },
    { look: ALICE, p: idle(STAND, t, 10), view: "3q" as const },
    { look: OFFICER, p: idle(STAND, t, 11), view: "3q" as const },
    { look: KNOWLTON, p: gesture(idle(STAND, t, 12), t, 12), view: "3q" as const },
    { look: ROBINSON, p: idle(STAND, t, 13), view: "3q" as const },
    { look: JUDGES[0], p: SIT, view: "3q" as const },
    { look: PHARMACIST, p: idle(STAND, t, 14), view: "3q" as const },
    { look: PALE_MAN, p: idle(STAND, t, 15), view: "3q" as const },
    { look: LIZZIE_CHILD, p: idle(STAND, t, 16), view: "3q" as const },
  ];
  const row3 = [
    { look: LIZZIE, p: idle(STAND, t, 21), view: "front" as const },
    { look: ABBY, p: idle(STAND, t, 22), view: "back" as const },
    { look: ANDREW, p: SIT, view: "3q" as const },
    { look: JURORS[0], p: SIT, view: "3q" as const },
    { look: JURORS[3], p: idle(STAND, t, 23), view: "front" as const },
    { look: MILL_WORKERS[0], p: walk(STAND, t), view: "3q" as const },
    { look: MILL_WORKERS[1], p: idle(STAND, t, 24), view: "3q" as const },
    { look: TOWNSFOLK[1], p: idle(STAND, t, 25), view: "3q" as const },
    { look: SHADOW, p: idle(pose({}), t, 26), view: "3q" as const, sil: true },
  ];
  return (
    <AbsoluteFill style={{ background: "#8a8a86" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {[350, 700, 1050].map((y) => (
          <rect key={y} x={0} y={y} width={1920} height={3} fill="#555" />
        ))}
        {row1.map((c, i) => (
          <Person key={i} x={130 + i * 205} y={350} s={0.85} look={c.look} pose={c.p} />
        ))}
        {row2.map((c, i) => (
          <Person key={i} x={130 + i * 205} y={700} s={0.85} look={c.look} pose={c.p} view={c.view} />
        ))}
        {row3.map((c, i) => (
          <Person key={i} x={130 + i * 205} y={1050} s={0.85} look={c.look} pose={c.p} view={c.view} mode={c.sil ? "silhouette" : "color"} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
