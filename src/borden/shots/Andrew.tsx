import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import { Glow, Pool } from "../../gacy/kit/light";
import { ANDREW, ANDREW_HAT, ANDREW_HOME, BRIDGET, LIZZIE, REPORTER, TOWNSFOLK } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { Note } from "../kit/props";
import { SecondStreet } from "../kit/town";
import {EASE, Finish, LIGHT, LYING, Person, Plane, SectionScene, Stage, between, cam, eye, idle, lerp, pose, ramp, speaking, standing, useShot, walker } from "./common";

/**
 * 4:36–5:19. Andrew comes home. He rests. He does not know.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;

export const AndrewReturns: React.FC = () => {
  const { t, dur } = useShot();
  // He walks up to the front door (in the end wall of the cutaway) and finds it locked.
  const w = walker(t, 0.2, 3.6, -2600, -1520, undefined, 1);
  const tug = between(t, 3.9, 5.0, 0.3) * (Math.sin(t * 9) * 0.5 + 0.5);
  const c = cam(t, [[0, -2000], [dur, -1500]], [[0, -520], [dur, -400]], [[0, 0.8], [dur, 1.2]]);
  const L = LIGHT.noon;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={LIGHT.room}
      lamps={{ guest: 0.1 }}
      props={{ guestDoorOpen: 0.15, frontLocks: 3 }}
      people={{
        kitchen: <Person x={780} look={LIZZIE} light={LIGHT.room} pose={standing(t, 4)} facing={1} />,
      }}
      yard={
        <Plane d={0}>
          <Person x={w.x} look={ANDREW_HAT} light={L} pose={t > 3.8 ? idle(pose({ nearUpper: 60 + tug * 10, nearFore: 30, lean: 4 }), t, 1, 0.4) : w.pose} facing={1} />
        </Plane>
      }
      finish={{ temp: 0.4, vignette: 0.7 }}
    />
  );
};

export const BridgetOpens: React.FC = () => {
  const { t, dur } = useShot();
  // Inside the hall: Bridget comes to the door and works the locks.
  const w = walker(t, 0, 1.0, -900, -1250, undefined, 2);
  const locks = 3 - lerp(0, 3, ramp(t, 1.0, 1.9, EASE.linear));
  const c = cam(t, [[0, -1100], [dur, -1180]], [[0, eye(HOUSE.floor, 260)], [dur, eye(HOUSE.floor, 280)]], [[0, 1.6], [dur, 2.0]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ frontLocks: locks, frontDoorOpen: ramp(t, 1.85, dur + 0.3) * 0.6 }}
      people={{
        hall: <Person x={w.x} look={BRIDGET} light={L} pose={t < 1.0 ? w.pose : idle(pose({ nearUpper: 70 + Math.sin(t * 7) * 8, nearFore: 30, lean: 6 }), t, 2, 0.4)} facing={-1} />,
      }}
      yard={
        <Plane d={0}>
          <Person x={-1520} look={ANDREW_HAT} light={LIGHT.noon} pose={standing(t, 1)} facing={1} />
        </Plane>
      }
      finish={{ temp: 0.3, vignette: 0.75 }}
    />
  );
};

export const AndrewIn: React.FC = () => {
  const { t, dur } = useShot();
  const w = walker(t, 0.1, 1.6, -1500, -1150, undefined, 1);
  const c = cam(t, [[0, -1250], [dur, -1150]], [[0, eye(HOUSE.floor, 260)], [dur, eye(HOUSE.floor, 260)]], [[0, 1.6], [dur, 1.7]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ frontDoorOpen: 0.7 }}
      people={{
        hall: (
          <g>
            <Person x={-1000} look={BRIDGET} light={L} pose={standing(t, 2, { turn: -0.2 })} facing={-1} />
            <Person x={Math.max(w.x, -1400)} look={t > 1.2 ? ANDREW : ANDREW_HAT} light={L} pose={w.pose} facing={1} />
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.75 }}
    />
  );
};

export const SofaShot: React.FC = () => {
  const { t, dur } = useShot();
  // 286.5 "sits down"; 287.5 "or lies down": he settles onto the sofa.
  const sit = ramp(t, 1.0, 2.0, EASE.inOut);
  const lie = ramp(t, 2.8, 4.4, EASE.inOut);
  const c = cam(t, [[0, -520], [dur, -560]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 230)]], [[0, 1.45], [dur, 1.65]]);
  const L = LIGHT.room;
  const standing_ = pose({ lean: 2 });
  const sitting = pose({ hipDrop: 84, lean: -4, nearThigh: 86, nearKnee: 88, farThigh: 82, farKnee: 84, nearUpper: 22, nearFore: 48, farUpper: 18, farFore: 52 });
  const blend = (a: typeof standing_, b: typeof standing_, k: number) => Object.fromEntries(Object.keys(a).map((f) => [f, lerp(a[f as keyof typeof a], b[f as keyof typeof b], k)])) as typeof standing_;
  const p = lie > 0 ? blend(sitting, LYING, lie) : blend(standing_, sitting, sit);
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.1 }}
      props={{ guestDoorOpen: 0.15 }}
      people={{
        sitting: <Person x={lerp(-640, -560, sit) + lie * 90} y={-lie * 60 - sit * 6} look={ANDREW_HOME} light={L} pose={idle(p, t, 1, 0.3)} facing={1} grounded={false} />,
      }}
      finish={{ temp: 0.3, vignette: 0.75 }}
    />
  );
};

export const Ordinary: React.FC = () => {
  const { t, dur } = useShot();
  // Close on the resting man, the clock, the sun through the blind, a fly.
  const c = cam(t, [[0, -560], [dur, -520]], [[0, eye(HOUSE.floor, 200)], [dur, eye(HOUSE.floor, 210)]], [[0, 1.9], [dur, 2.3]]);
  const L = LIGHT.room;
  const fly = { x: -600 + Math.sin(t * 2.1) * 120 + Math.sin(t * 5.3) * 40, y: -330 + Math.cos(t * 1.7) * 60 + Math.sin(t * 7.1) * 20 };
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ minutes: 640 + t * 0.2 }}
      people={{
        sitting: (
          <g>
            <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} />
            <circle cx={fly.x} cy={fly.y} r={3} fill="#1a1510" opacity={0.8} />
          </g>
        ),
      }}
      finish={{ temp: 0.4, vignette: 0.75 }}
    />
  );
};

export const DoesntKnow: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -520], [dur, -1000]], [[0, eye(HOUSE.floor, 200)], [dur, eye(HOUSE.upper, 260)]], [[0, 2.0], [dur, 1.3]], EASE.inOut);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.12 }}
      props={{ guestDoorOpen: 0.15, guestHem: 0.6, minutes: 642 }}
      people={{
        sitting: <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} />,
      }}
      finish={{ temp: 0.1, vignette: 0.85 }}
    />
  );
};

export const FamousHouse: React.FC = () => {
  const { t, dur } = useShot();
  // The street, then the crowd of the coming days fades in around the house: onlookers, a photographer.
  const crowd = ramp(t, 2.0, 5.0, EASE.inOut);
  const c = cam(t, [[0, 0], [dur, 40]], [[0, -640], [dur, -700]], [[0, 0.72], [dur, 0.5]]);
  const L = LIGHT.noon;
  const people = [
    { look: TOWNSFOLK[0], x: -2200, f: 1 as const },
    { look: TOWNSFOLK[1], x: -1900, f: 1 as const },
    { look: TOWNSFOLK[2], x: -1500, f: 1 as const },
    { look: TOWNSFOLK[3], x: -1200, f: 1 as const },
    { look: REPORTER, x: -700, f: 1 as const },
    { look: TOWNSFOLK[4], x: 1300, f: -1 as const },
    { look: TOWNSFOLK[5], x: 1600, f: -1 as const },
    { look: REPORTER, x: 2000, f: -1 as const },
    { look: TOWNSFOLK[0], x: 2400, f: -1 as const },
  ];
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet
          t={t + 80}
          light={L}
          heat={0.5}
          onWalk={
            <g opacity={crowd}>
              {people.map((p, i) => (
                <Person key={i} x={p.x} look={p.look} light={L} pose={standing(t, i + 10, { turn: p.f === 1 ? 0.5 : 0.5 })} facing={p.f} />
              ))}
              {/* a photographer under a cloth at a tripod camera */}
              <g transform="translate(-300 0)">
                <path d="M-40 0 L-10 -300 M40 0 L10 -300 M0 0 L0 -300" stroke={lit("#3a2a1e", L)} strokeWidth={8} />
                <rect x={-60} y={-380} width={120} height={80} fill={lit("#2a2018", L)} />
                <circle cx={64} cy={-340} r={16} fill={lit("#4a4a48", L)} />
                <path d="M-70 -380 Q-120 -300 -160 -100 L-40 -100 Q-30 -300 -40 -380 Z" fill={lit("#1e1a1a", L)} />
              </g>
            </g>
          }
        />
      </Stage>
      <Finish temp={0.4} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const TheNote: React.FC = () => {
  const { t, dur } = useShot();
  // Lizzie tells her father Abby has gone out; a note appears in the air between them (what she describes), then wavers.
  const note = between(t, 4.2, dur + 0.5, 0.4);
  const c = cam(t, [[0, -640], [dur, -600]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.5], [dur, 1.7]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.1 }}
      props={{ guestDoorOpen: 0.15 }}
      people={{
        sitting: (
          <g>
            <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.9, neck: 30 }), t, 1, 0.25)} facing={1} grounded={false} />
            <Person x={-800} look={LIZZIE} light={L} pose={speaking(t, 3, { turn: -0.2 }, 0.8)} facing={1} />
            <g opacity={note * 0.9} transform={`translate(-560 ${-520 - Math.sin(t * 1.5) * 8})`}>
              <Note light={L} s={2.2} />
              <Glow x={0} y={30} r={200} color="#fff4d8" opacity={0.3} />
            </g>
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.75 }}
    />
  );
};

export const NoNote: React.FC = () => {
  const { t, dur } = useShot();
  // A drawer pulled open; nothing in it. 318.6 "then, according to Lizzie, she went out toward the barn": out of the window.
  const pull = ramp(t, 0.2, 0.9, EASE.out);
  const gone = ramp(t, 1.0, 1.8);
  const c = cam(t, [[0, 40], [dur, 0]], [[0, -60], [dur, -40]], [[0, 2.4], [dur, 2.2]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#4a3020", TABLE)} />
          <Pool x={200} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
          {/* a drawer front, pulled out toward the camera: it grows */}
          <g transform={`translate(0 ${pull * 160}) scale(${1 + pull * 0.2})`}>
            <rect x={-360} y={-120} width={720} height={240} fill={lit("#5a3a28", TABLE)} />
            <rect x={-340} y={-100} width={680} height={200} fill={lit("#2a1a12", TABLE)} />
            <g opacity={1 - gone}>
              <Note light={TABLE} s={1.6} />
            </g>
            <circle cx={0} cy={140} r={10} fill={lit("#b89a5a", TABLE)} />
          </g>
        </Plane>
        <Plane d={-1.4}>
          <CloseHand x={-200 + pull * 60} y={-380 + pull * 120} angle={-30} light={TABLE} skin="#e9c3a4" sleeve="#2f3a52" s={1.6} curl={0.6} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.9} />
    </AbsoluteFill>
  );
};

