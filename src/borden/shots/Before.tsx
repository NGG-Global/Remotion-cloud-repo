import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { Glow } from "../../gacy/kit/light";
import {ABBY, ANDREW_HOME, DR_BOWEN } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { MuttonPlatter } from "../kit/props";
import { Fence, NeighborHouse, SecondStreet } from "../kit/town";
import { Elm } from "../kit/props";
import { Sky } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import { EASE, Finish, LIGHT, Person, Plane, SectionScene, Stage, between, cam, eye, hash, idle, lerp, pose, ramp, seated, speaking, standing, useShot, walker } from "./common";

/**
 * 2:58–3:20. The days before.
 *
 * A sick household, a stepmother who suspects poison, a doctor who
 * suspects the mutton, and a detail that will look different later.
 */

export const NotRight: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, 300], [dur, 100]], [[0, -760], [dur, -700]], [[0, 0.5], [dur, 0.64]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#05060a">
        <SecondStreet t={t + 40} light={LIGHT.night} lamps={0.8} bordenLit={0.35} neighborsLit={0.15} />
      </Stage>
      <Finish temp={-0.5} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const Sick: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, 520], [dur, 460]], [[0, eye(HOUSE.upper, 250)], [dur, eye(HOUSE.upper, 250)]], [[0, 1.5], [dur, 1.7]]);
  const L = LIGHT.lamp;
  const clutch = Math.sin(t * 1.3) * 0.5 + 0.5;
  return (
    <SectionScene
      t={t}
      cam={c}
      night
      light={L}
      lamps={{ parents: 1, lizzie: 0.2, guest: 0, sitting: 0, dining: 0, kitchen: 0, hall: 0, backhall: 0, attic: 0 }}
      people={{
        parents: (
          <g>
            <Person x={420} look={ABBY} light={L} pose={seated(t, 1, { lean: 18 + clutch * 6, neck: 14, nearUpper: 50, nearFore: 96, farUpper: 46, farFore: 100, brow: -0.7, lids: 0.6 }, 0.3)} facing={-1} />
            <Person x={660} look={ANDREW_HOME} light={L} pose={idle(pose({ lean: 22, neck: 18, nearUpper: 60, nearFore: 40, farUpper: 56, farFore: 44, brow: -0.5, lids: 0.5 }), t, 2, 0.5)} facing={1} />
          </g>
        ),
      }}
      finish={{ temp: 0.1, vignette: 0.85 }}
    />
  );
};

/** Across the street: the doctor's house, at the character plane. */
const DoctorsHouse: React.FC<{ t: number; light: typeof LIGHT.morning; door: number; children?: React.ReactNode }> = ({ t, light, door, children }) => (
  <>
    <Sky mode="day" t={t} clouds={0.4} stars={false} />
    <Plane d={40}>
      <rect x={-30000} y={-10} width={60000} height={600} fill="#4a5a3a" />
      {Array.from({ length: 20 }, (_, i) => (
        <Elm key={i} x={-12000 + i * 1300 + hash(i) * 500} h={1600 + hash(i + 3) * 900} light={light} t={t} seed={i} tone="#3e5a36" />
      ))}
    </Plane>
    <GroundStrip near={-30} far={40} color="#7a8a58" farColor="#5a6a48" light={light} />
    <Plane d={0}>
      <NeighborHouse x={0} light={light} color="#a8a898" seed={7} />
      {door > 0 ? <rect x={-720} y={-600} width={200} height={600} fill="#1a1410" opacity={door} /> : null}
      {children}
    </Plane>
    <Plane d={-4}>
      <Fence x0={-6000} x1={-1000} light={light} />
      <Fence x0={1000} x1={6000} light={light} />
    </Plane>
    <GroundStrip near={-6} far={-4} color="#b0aa9c" light={light} />
    <GroundStrip near={-30} far={-6} color="#8a8070" light={light} />
  </>
);

export const PoisonFear: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.morning;
  const w = walker(t, 0, 2.6, -2200, -800, undefined, 2);
  const door = ramp(t, 2.2, 2.7);
  const c = cam(t, [[0, -1500], [dur, -700]], [[0, -480], [dur, -440]], [[0, 0.75], [dur, 1.0]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <DoctorsHouse t={t} light={L} door={door}>
          <Person x={-620} look={DR_BOWEN} light={{ ...L, amb: 0.4 }} pose={standing(t, 3, { turn: -0.2 })} facing={-1} opacity={door} />
          <Person x={w.x} look={ABBY} light={L} pose={w.pose} facing={w.facing} />
        </DoctorsHouse>
      </Stage>
      <Finish temp={0.3} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const Doctor: React.FC = () => {
  const { t, dur } = useShot();
  // 189.6–192.5 the doctor waves it off at his door; 192.6 the mutton in the heat.
  const swap = ramp(t, 3.0, 3.8, EASE.inOut);
  const L = LIGHT.morning;
  const cDoor = cam(t, [[0, -700], [3.0, -680]], [[0, -300], [3.0, -290]], [[0, 1.5], [3.0, 1.65]]);
  const cTable = cam(t, [[3.0, 250], [dur, 200]], [[3.0, HOUSE.floor - 240], [dur, HOUSE.floor - 220]], [[3.0, 1.8], [dur, 2.3]]);
  const ROOM = LIGHT.room;
  return (
    <AbsoluteFill>
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <Stage cam={cDoor} t={t}>
            <DoctorsHouse t={t} light={L} door={1}>
              <Person x={-620} look={DR_BOWEN} light={{ ...L, amb: 0.3 }} pose={speaking(t, 3, { turn: -0.1, smile: 0.3, nearUpper: 30 + Math.sin(t * 2) * 20, nearFore: 60 }, 0.8)} facing={-1} />
              <Person x={-840} look={ABBY} light={L} pose={idle(pose({ neck: 4, turn: -0.2 }), t, 2, 0.6)} facing={1} />
            </DoctorsHouse>
          </Stage>
          <Finish temp={0.3} vignette={0.65} />
        </AbsoluteFill>
      ) : null}
      {swap > 0 ? (
        <AbsoluteFill style={{ opacity: swap }}>
          <SectionScene
            t={t}
            cam={cTable}
            light={ROOM}
            props={{ laid: true }}
            people={{
              dining: <MuttonPlatter x={225} y={-160} t={t} flies={1} light={ROOM} />,
            }}
            finish={{ temp: 0.6, vignette: 0.7 }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const InHindsight: React.FC = () => {
  const { t, dur } = useShot();
  // The same platter; the colour drains and the room darkens.
  const drain = ramp(t, 0.6, 3.4, EASE.inOut);
  const c = cam(t, [[0, 200], [dur, 210]], [[0, HOUSE.floor - 220], [dur, HOUSE.floor - 200]], [[0, 2.3], [dur, 2.8]]);
  const ROOM = { key: lit(LIGHT.room.key, { key: "#ffffff", ambient: "#000000", amb: drain * 0.5 }), ambient: "#1a1410", amb: lerp(0.24, 0.7, drain), desat: drain * 0.7 };
  return (
    <AbsoluteFill>
      <SectionScene
        t={t}
        cam={c}
        light={ROOM}
        props={{ laid: true }}
        people={{
          dining: (
            <g>
              <MuttonPlatter x={225} y={-160} t={t} flies={1 - drain} light={ROOM} />
              <Glow x={225} y={-200} r={500} color="#ffd9a0" opacity={0.3 * (1 - drain)} />
            </g>
          ),
        }}
        finish={{ temp: lerp(0.5, -0.4, drain), vignette: lerp(0.7, 0.95, drain) }}
      />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: between(t, 3.6, dur + 2, 0.5) * 0.35 }} />
    </AbsoluteFill>
  );
};

