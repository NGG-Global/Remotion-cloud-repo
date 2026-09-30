import React from "react";
import { AbsoluteFill } from "remotion";

import { ABBY, ANDREW_HAT, ANDREW_HOME, BRIDGET, EMMA, LIZZIE, MORSE } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { Pail } from "../kit/props";
import { SecondStreet } from "../kit/town";
import { BENT, EASE, Finish, LIGHT, Person, Plane, SectionScene, Stage, bedMaking, between, cam, eye, idle, lerp, pose, ramp, seated, standing, useShot, walker, washing } from "./common";

/**
 * 3:20–3:55. Thursday, 4 August. The house wakes, and empties.
 */

export const Dawn: React.FC = () => {
  const { t, dur } = useShot();
  const wake = ramp(t, 0.6, 3.4, EASE.inOut);
  const c = cam(t, [[0, 100], [dur, 0]], [[0, -720], [dur, -680]], [[0, 0.52], [dur, 0.6]]);
  const L = { key: lerpHex("#a4aec0", "#ffe6c8", wake), ambient: "#1a2130", amb: lerp(0.35, 0.12, wake), desat: lerp(0.2, 0, wake) };
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c1220">
        <SecondStreet t={t + 50} light={L} lamps={1 - wake} bordenLit={0.5 * (1 - wake) + 0.2} neighborsLit={0.1} />
      </Stage>
      <Finish temp={lerp(-0.4, 0.4, wake)} vignette={0.7} />
    </AbsoluteFill>
  );
};

const lerpHex = (a: string, b: string, k: number): string => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
};

export const EmmaAway: React.FC = () => {
  const { t, dur } = useShot();
  // Emma's place in the house, empty: her figure fades out of the sitting room.
  const gone = ramp(t, 1.0, 2.4, EASE.inOut);
  const c = cam(t, [[0, -600], [dur, -640]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.4], [dur, 1.6]]);
  const L = LIGHT.morning;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      people={{
        sitting: <Person x={-780} look={EMMA} light={L} pose={seated(t, 4, { neck: 12 }, 0.3)} facing={1} opacity={1 - gone} />,
      }}
      finish={{ temp: 0.3, vignette: 0.7 }}
    />
  );
};

export const WhoIsHome: React.FC = () => {
  const { t, dur } = useShot();
  // 209.8 Andrew, 210.5 Abby, 211.1 Lizzie, 212.9 Bridget, 215.8 Morse: each lit as named.
  const on = (at: number) => between(t, at, dur + 2, 0.4);
  const a = on(1.2);
  const ab = on(1.9);
  const li = on(2.5);
  const br = on(4.3);
  const mo = on(7.2);
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -600], [dur, -640]], [[0, 0.5], [dur, 0.54]]);
  const L = LIGHT.morning;
  const dimK = 0.25;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ dining: lerp(dimK, 1, a), kitchen: lerp(dimK, 1, Math.max(ab, br)), lizzie: lerp(dimK, 1, li), guest: lerp(dimK, 1, mo), sitting: dimK, hall: dimK, parents: dimK, backhall: dimK, attic: dimK, cellar: 0 }}
      people={{
        dining: <Person x={225} look={ANDREW_HOME} light={L} pose={seated(t, 1, { neck: 10 }, 0.3)} facing={1} opacity={lerp(0.5, 1, a)} />,
        kitchen: (
          <g>
            <Person x={760} look={ABBY} light={L} pose={idle(pose({ nearUpper: 40, nearFore: 70 }), t, 2, 0.5)} facing={1} opacity={lerp(0.5, 1, ab)} />
            <Person x={1000} look={BRIDGET} light={L} pose={idle(BENT, t, 3, 0.5)} facing={-1} opacity={lerp(0.5, 1, br)} />
          </g>
        ),
        lizzie: <Person x={-320} look={LIZZIE} light={L} pose={standing(t, 4, { turn: 0.3 })} facing={-1} opacity={lerp(0.5, 1, li)} />,
        guest: <Person x={-1000} look={MORSE} light={L} pose={standing(t, 5)} facing={1} opacity={lerp(0.5, 1, mo)} />,
      }}
      finish={{ temp: 0.3, vignette: 0.7 }}
    />
  );
};

export const MorseLeaves: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.morning;
  const door = between(t, 0.2, 1.4, 0.3);
  const w = walker(t, 0.5, dur + 0.5, HOUSE.sideDoor, HOUSE.sideDoor + 2400, undefined, 5);
  const c = cam(t, [[0, 900], [dur, 1500]], [[0, -480], [dur, -520]], [[0, 0.8], [dur, 0.7]]);
  return (
    <SectionScene
      t={t}
      cam={c}
      open={0}
      light={L}
      yard={
        <Plane d={-0.5}>
          <Person x={w.x} look={MORSE} light={L} pose={w.pose} facing={w.facing} opacity={ramp(t, 0.3, 0.7)} />
        </Plane>
      }
      finish={{ temp: 0.3, vignette: 0.65 }}
      atWindow={null}
      windowsLit={0}
      shell={1}
      lamps={{}}
      people={{}}
      props={{ backDoorOpen: door }}
    />
  );
};

export const AndrewLeaves: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.morning;
  const w = walker(t, 0.1, dur + 0.6, -100, -1900, undefined, 6);
  const door = 1 - ramp(t, 0.5, 1.0);
  const c = cam(t, [[0, -300], [dur, -900]], [[0, -520], [dur, -560]], [[0, 0.8], [dur, 0.72]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet t={t + 60} light={L} doorOpen={door} onWalk={null} inYard={<Person x={w.x} look={ANDREW_HAT} light={L} pose={w.pose} facing={w.facing} />} />
      </Stage>
      <Finish temp={0.3} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const AbbyUpstairs: React.FC = () => {
  const { t, dur } = useShot();
  // 224.0 she climbs; 228.1 "she is making up the guest room".
  const climb = ramp(t, 0.2, 2.6, EASE.inOut);
  const inRoom = ramp(t, 2.6, 3.6, EASE.inOut);
  const stairX = lerp(-1020, -1350, 1 - climb);
  const stairY = lerp(0, HOUSE.upper - HOUSE.floor, climb);
  const c = cam(t, [[0, -1150], [2.6, -1150], [3.8, -1000], [dur, -980]], [[0, eye(HOUSE.floor, 200)], [2.6, eye(HOUSE.upper, 200)], [dur, eye(HOUSE.upper, 250)]], [[0, 1.1], [2.6, 1.1], [3.8, 1.35], [dur, 1.45]], EASE.inOut);
  const L = LIGHT.morning;
  const climbing = climb > 0 && climb < 1;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ guestMade: 1 - inRoom * 0.5 + ramp(t, 4.0, dur) * 0.5, guestDoorOpen: 0.9 }}
      people={{
        hall: climb < 1 ? <Person x={stairX} y={stairY} look={ABBY} light={L} pose={climbing ? pose({ lean: 8, nearThigh: 30 + Math.sin(t * 6) * 20, farThigh: 30 - Math.sin(t * 6) * 20, nearKnee: 40, farKnee: 40, nearUpper: 20, nearFore: 40 }) : standing(t, 1)} facing={1} grounded={false} /> : null,
        guest: climb >= 1 ? <Person x={lerp(-1000, -820, inRoom)} look={ABBY} light={L} pose={inRoom > 0.9 ? bedMaking(t, 2) : idle(pose({}), t, 2, 0.5)} facing={1} /> : null,
      }}
      finish={{ temp: 0.3, vignette: 0.7 }}
    />
  );
};

export const BridgetWindows: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.noon;
  const c = cam(t, [[0, -300], [dur, -450]], [[0, -520], [dur, -540]], [[0, 0.95], [dur, 1.1]]);
  return (
    <SectionScene
      t={t}
      cam={c}
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
  );
};

export const LizzieStays: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, 200], [dur, 100]], [[0, -520], [dur, -560]], [[0, 0.62], [dur, 0.56]]);
  const L = LIGHT.noon;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={LIGHT.room}
      lamps={{ guest: 0.6 }}
      people={{
        dining: <Person x={100} look={LIZZIE} light={LIGHT.room} pose={standing(t, 4, { turn: 0.2 })} facing={1} />,
        guest: <Person x={-820} look={ABBY} light={LIGHT.dim} pose={bedMaking(t, 2)} facing={1} />,
      }}
      yard={
        <Plane d={-0.6}>
          <Person x={-520} look={BRIDGET} light={L} pose={washing(t, 2)} facing={-1} />
          <Pail x={-380} light={L} />
        </Plane>
      }
      finish={{ temp: 0.4, vignette: 0.7 }}
    />
  );
};

