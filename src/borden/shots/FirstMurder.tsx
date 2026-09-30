import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import {Pool } from "../../gacy/kit/light";
import { ABBY, ANDREW_HAT, BRIDGET, LIZZIE, SHADOW } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { MantelClock, OilLamp, Pail, Portrait } from "../kit/props";
import { Ledger } from "../kit/paper";
import { MainStreet } from "../kit/town";
import { EASE, Finish, LIGHT, Person, Plane, SectionScene, Stage, bedMaking, between, cam, eye, idle, ironing, lerp, pose, ramp, standing, useShot, washing } from "./common";

/**
 * 3:55–4:36. The first murder. Nothing of it is shown: a shadow at a
 * door, a picture frame that will not stay straight, a number in a
 * ledger, and a house that heard nothing.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;

export const NineThirty: React.FC = () => {
  const { t, dur } = useShot();
  // Upstairs, outside the guest room. The clock. A shadow lengthens on the floor.
  const shadow = ramp(t, 3.4, dur, EASE.in);
  const c = cam(t, [[0, -600], [dur, -720]], [[0, eye(HOUSE.upper, 250)], [dur, eye(HOUSE.upper, 250)]], [[0, 1.3], [dur, 1.6]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ guestDoorOpen: 0.7, guestMade: 0.5, minutes: 570 }}
      people={{
        guest: (
          <g>
            <Person x={-1060} look={ABBY} light={L} pose={bedMaking(t, 2)} facing={-1} />
            <MantelClock x={-1180} y={-410} minutes={570} light={L} s={0.55} />
            {/* a shadow reaching across the floor from the door */}
            <path d={`M-760 0 L${-760 - shadow * 420} 0 L${-760 - shadow * 300} 30 L-760 30 Z`} fill="#000" opacity={0.5 * shadow} />
          </g>
        ),
        lizzie: <path d={`M-700 ${-440} L-700 0 L${-700 + 60 * shadow} 0 Z`} fill="#000" opacity={0.35 * shadow} />,
      }}
      finish={{ temp: 0.2, vignette: 0.75 }}
    />
  );
};

export const DontKnow: React.FC = () => {
  const { t, dur } = useShot();
  // From inside the room: the doorway, and a silhouette that is only a silhouette.
  const fill = ramp(t, 0.3, 1.6, EASE.inOut);
  const c = cam(t, [[0, -800], [dur, -760]], [[0, eye(HOUSE.upper, 250)], [dur, eye(HOUSE.upper, 250)]], [[0, 1.6], [dur, 2.0]]);
  const L = { ...LIGHT.dim, amb: lerp(0.42, 0.6, fill) };
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ lizzie: 0.2 }}
      props={{ guestDoorOpen: 0.85, guestMade: 0.5 }}
      people={{
        guest: (
          <g>
            <Person x={-1060} look={ABBY} light={L} pose={bedMaking(t, 2)} facing={-1} />
            <Person x={-800} look={SHADOW} mode="silhouette" silhouette="#08060a" pose={idle(pose({}), t, 9, 0.3)} facing={-1} opacity={fill} />
          </g>
        ),
      }}
      finish={{ temp: -0.1, vignette: 0.9 }}
    />
  );
};

export const Attacked: React.FC = () => {
  const { t, dur } = useShot();
  // The hall wallpaper and a framed picture. 249.0 "the first blow": the frame jolts. 250.2–251.5 "then more": it trembles.
  const jolt = t > 3.55 ? Math.exp(-(t - 3.55) * 4) : 0;
  const more = between(t, 4.8, 6.3, 0.15) * (Math.sin(t * 38) * 0.5 + Math.sin(t * 23) * 0.5);
  const tilt = jolt * 9 + more * 3;
  const c = cam(t, [[0, -380], [dur, -360]], [[0, eye(HOUSE.upper, 340)], [dur, eye(HOUSE.upper, 330)]], [[0, 2.4], [dur, 2.8]]);
  const L = LIGHT.dim;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ lizzie: 0.4, guest: 0.2 }}
      props={{ guestDoorOpen: 0.1 }}
      people={{
        lizzie: (
          <g>
            <g transform={`rotate(${tilt} -380 -400)`}>
              <Portrait id="hallpic" x={-380} y={-400} w={150} h={190} light={L}>
                <rect x={-75} y={-95} width={150} height={190} fill={lit("#6a7a6a", L)} />
                <path d="M-75 40 Q-30 -20 10 20 Q40 -30 75 30 L75 95 L-75 95 Z" fill={lit("#4a5a4a", L)} />
              </Portrait>
            </g>
            <OilLamp x={-560} y={-150} on={0.6 - jolt * 0.3} t={t} light={L} s={0.7} />
          </g>
        ),
      }}
      finish={{ temp: -0.1, vignette: 0.9 }}
    />
  );
};

export const Nineteen: React.FC = () => {
  const { t, dur } = useShot();
  // 254.1 "nineteen": written into the ledger.
  const c = cam(t, [[0, 40], [dur, 90]], [[0, -60], [dur, -40]], [[0, 2.6], [dur, 3.0]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a2a2c", TABLE)} />
          <Pool x={200} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
          <Ledger x={0} y={-40} light={TABLE} rot={-2} lines={12} entries={[{ y: -120, text: "Mrs. A. D. Borden", k: 1 }, { y: -80, text: "guest chamber, floor", k: 1 }, { y: 10, text: "19", k: ramp(t, 1.9, 2.6), big: true }]} />
        </Plane>
        <Plane d={-1.4}>
          <CloseHand x={lerp(160, 250, ramp(t, 1.9, 2.6))} y={-260} angle={-22} light={TABLE} sleeve="#2a2a2e" s={1.6} curl={0.7}>
            <path d="M0 40 L2 120" stroke="#1a1510" strokeWidth={4} />
          </CloseHand>
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.9} />
    </AbsoluteFill>
  );
};

export const OnTheFloor: React.FC = () => {
  const { t, dur } = useShot();
  // The guest room from its door: the bed, and beyond it, a hem and a shoe.
  const c = cam(t, [[0, -900], [dur, -940]], [[0, eye(HOUSE.upper, 200)], [dur, eye(HOUSE.upper, 190)]], [[0, 1.5], [dur, 1.7]]);
  const L = LIGHT.dim;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.7 }}
      props={{ guestDoorOpen: 0.9, guestMade: 0.5, guestHem: 1 }}
      finish={{ temp: -0.2, vignette: 0.9 }}
    />
  );
};

export const NobodyHeard: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -200], [dur, 0]], [[0, -600], [dur, -640]], [[0, 0.56], [dur, 0.5]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.15 }}
      props={{ guestDoorOpen: 0.1, guestHem: 0 }}
      people={{
        kitchen: <Person x={780} look={LIZZIE} light={L} pose={ironing(t, 4)} facing={1} />,
      }}
      yard={
        <Plane d={-0.6}>
          <Person x={-520} look={BRIDGET} light={LIGHT.noon} pose={washing(t, 2)} facing={-1} />
          <Pail x={-380} light={LIGHT.noon} />
        </Plane>
      }
      finish={{ temp: 0.2, vignette: 0.75 }}
    />
  );
};

export const BridgetWorks: React.FC = () => {
  const { t, dur } = useShot();
  // 262.8 Bridget at the windows; 264.4 Andrew downtown.
  const swap = ramp(t, 1.6, 2.2, EASE.inOut);
  const cB = cam(t, [[0, -500], [1.8, -560]], [[0, -520], [1.8, -540]], [[0, 1.2], [1.8, 1.3]]);
  const cA = cam(t, [[1.8, -400], [dur, 100]], [[1.8, -600], [dur, -580]], [[1.8, 0.7], [dur, 0.75]]);
  const L = LIGHT.noon;
  const w = { x: lerp(-600, 200, ramp(t, 1.8, dur + 0.5, EASE.linear)) };
  return (
    <AbsoluteFill>
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <SectionScene
            t={t}
            cam={cB}
            open={0}
            light={L}
            yard={
              <Plane d={-0.6}>
                <Person x={-520} look={BRIDGET} light={L} pose={washing(t, 2)} facing={-1} />
                <Pail x={-380} light={L} />
              </Plane>
            }
            finish={{ temp: 0.5, vignette: 0.6 }}
          />
        </AbsoluteFill>
      ) : null}
      {swap > 0 ? (
        <AbsoluteFill style={{ opacity: swap }}>
          <Stage cam={cA} t={t}>
            <MainStreet t={t + 30} light={L} signs={["DRY GOODS", "HARDWARE", "BANK", "BORDEN BLOCK"]} onWalk={<Person x={w.x} look={ANDREW_HAT} light={L} pose={standing(t, 1, { turn: 0.3 })} facing={1} />} />
          </Stage>
          <Finish temp={0.5} vignette={0.6} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const LizzieIroning: React.FC = () => {
  const { t } = useShot();
  // Lizzie irons in the kitchen; at 270.4 "her stepmother lies dead upstairs" the camera rises through the ceiling to the dark guest room.
  const rise = ramp(t, 3.6, 6.4, EASE.inOut);
  const c = cam(t, [[0, 800], [3.6, 760], [6.4, -1000]], [[0, eye(HOUSE.floor, 250)], [3.6, eye(HOUSE.floor, 250)], [6.4, eye(HOUSE.upper, 250)]], [[0, 1.5], [3.6, 1.5], [6.4, 1.3]], EASE.inOut);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: lerp(0.4, 0.12, rise) }}
      props={{ guestDoorOpen: 0.15, guestHem: 0.6 }}
      people={{
        kitchen: <Person x={780} look={LIZZIE} light={L} pose={ironing(t, 4)} facing={1} />,
      }}
      finish={{ temp: lerp(0.3, -0.3, rise), vignette: lerp(0.7, 0.9, rise) }}
    />
  );
};

export const FirstOnly: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -900], [dur, -600]], [[0, eye(HOUSE.upper, 250)], [dur, -620]], [[0, 1.2], [dur, 0.55]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.1 }}
      props={{ guestDoorOpen: 0.15, guestHem: 0.6 }}
      people={{
        kitchen: <Person x={780} look={LIZZIE} light={L} pose={ironing(t, 4)} facing={1} />,
      }}
      yard={
        <Plane d={-0.6}>
          <Person x={-520} look={BRIDGET} light={LIGHT.noon} pose={washing(t, 2)} facing={-1} />
          <Pail x={-380} light={LIGHT.noon} />
        </Plane>
      }
      finish={{ temp: 0.1, vignette: 0.8 }}
    />
  );
};

