import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import { Glow, Pool } from "../../gacy/kit/light";
import { Sky } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import { ABBY, ANDREW, ANDREW_HAT, ANDREW_HOME, BRIDGET, CHILDREN, EMMA, GENTRY, IMMIGRANT, LIZZIE, LIZZIE_CHILD, MILL_WORKERS, TOWNSFOLK } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { Coins, Elm, Headstone, HymnBook, Parcel, Teacup } from "../kit/props";
import { Deed, Ledger, WallCalendar } from "../kit/paper";
import { Cemetery, MainStreet, MillGate, MillTown, SecondStreet, TheHill } from "../kit/town";
import {EASE, FOLDED, Finish, HOLD_FRONT, LIGHT, Person, Plane, SectionScene, Stage, between, cam, eye, idle, lerp, pose, ramp, seated, standing, useShot, walker } from "./common";

/**
 * 1:14–2:58. The family.
 *
 * The mill town and the money in it, a rich man who lived like a poor
 * one, two unmarried daughters in their father's house, a stepmother the
 * younger one would not call mother, and a house whose very plan kept
 * them apart. Then August.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;

// ---------------------------------------------------------- the town

export const MillTownShot: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, 400], [dur, -200]], [[0, -1400], [dur, -1300]], [[0, 0.4], [dur, 0.44]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <MillTown t={t + 12} light={LIGHT.afternoon} />
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const MillGateShot: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.afternoon;
  const c = cam(t, [[0, 200], [dur, -300]], [[0, -800], [dur, -500]], [[0, 0.55], [dur, 0.8]]);
  const workers = Array.from({ length: 9 }, (_, i) => {
    const start = 0.2 + i * 0.55;
    const w = walker(t, start, start + 6, 600 + (i % 3) * 120, -2600 - i * 260, undefined, i);
    return { ...w, look: MILL_WORKERS[i % MILL_WORKERS.length], d: (i % 3) * 0.9 };
  });
  const family = ramp(t, 4.9, 5.6, EASE.out);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Sky mode="dusk" t={t} clouds={0.6} stars={false} />
        <Plane d={6}>
          <MillGate light={L} t={t} />
        </Plane>
        <GroundStrip near={-30} far={6} color="#7a7060" farColor="#5a5048" light={L} />
        {workers.map((w, i) => (
          <Plane key={i} d={w.d}>
            <Person x={w.x} look={w.look} light={L} pose={w.pose} facing={w.facing} s={w.look.build === "child" ? 1 : 1} />
          </Plane>
        ))}
        {/* an immigrant family with bundles, arriving from the right */}
        <Plane d={-1}>
          <g opacity={family}>
            <Person x={1500 - family * 200} look={IMMIGRANT} light={L} pose={idle(HOLD_FRONT, t, 20, 0.5)} facing={-1} nearHold={<Parcel light={L} />} />
            <Person x={1680 - family * 200} look={TOWNSFOLK[3]} light={L} pose={idle(HOLD_FRONT, t, 21, 0.5)} facing={-1} nearHold={<Parcel light={L} />} />
            <Person x={1820 - family * 200} look={CHILDREN[1]} light={L} pose={idle(pose({}), t, 22, 0.5)} facing={-1} />
          </g>
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const TheHillShot: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.afternoon;
  const c = cam(t, [[0, -1200], [dur, 800]], [[0, -900], [dur, -900]], [[0, 0.34], [dur, 0.36]]);
  const pair = walker(t, 0, dur + 2, -3000, -1400, undefined, 4);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <TheHill t={t} light={L} houses={3} />
        <Plane d={-5.5}>
          <Person x={pair.x} look={GENTRY[0]} light={L} pose={pair.pose} facing={pair.facing} />
          <Person x={pair.x + 170} look={GENTRY[1]} light={L} pose={walker(t, 0, dur + 2, -2830, -1230, undefined, 5).pose} facing={pair.facing} />
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- Andrew

export const AndrewStreet: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.noon;
  const w = walker(t, 0, dur + 1.5, -2200, 900, undefined, 1);
  // "real estate" 4.8, "banks" 6.3: the buildings he owns light up as he passes.
  const estate = between(t, 4.8, dur + 1, 0.4);
  const bank = between(t, 6.3, dur + 1, 0.4);
  const c = cam(t, [[0, -1800], [dur, 700]], [[0, -700], [dur, -640]], [[0, 0.55], [dur, 0.62]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <MainStreet
          t={t}
          light={L}
          signs={["DRY GOODS", "HARDWARE", "BANK", "BORDEN BLOCK"]}
          onWalk={
            <g>
              <Person x={w.x} look={ANDREW_HAT} light={L} pose={w.pose} facing={w.facing} />
              <Person x={-3200} look={TOWNSFOLK[0]} light={L} pose={standing(t, 7, { turn: 0.3 })} facing={1} />
              <Person x={2400} look={TOWNSFOLK[1]} light={L} pose={standing(t, 8)} facing={-1} />
            </g>
          }
        />
        <Plane d={0}>
          <Glow x={0} y={-1000} r={1100} color="#ffe0a0" opacity={0.4 * estate} />
          <Glow x={1500} y={-1000} r={1100} color="#ffe0a0" opacity={0.4 * bank} />
          <Glow x={3000} y={-1000} r={900} color="#ffe0a0" opacity={0.3 * bank} />
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const ModestHouse: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.noon;
  const w = walker(t, 0, dur + 1, 1500, -1600, undefined, 2);
  const c = cam(t, [[0, 100], [dur, -100]], [[0, -640], [dur, -640]], [[0, 0.62], [dur, 0.66]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet t={t + 5} light={L} heat={0.5} onWalk={<Person x={w.x} look={TOWNSFOLK[2]} light={L} pose={w.pose} facing={w.facing} />} />
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const Thrifty: React.FC = () => {
  const { t, dur } = useShot();
  // 102.2 "very frugal": he turns the lamp down.
  const lamp = 1 - ramp(t, 2.6, 3.4) * 0.72;
  const c = cam(t, [[0, 260], [dur, 300]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 240)]], [[0, 1.35], [dur, 1.7]]);
  const reach = between(t, 2.3, 3.6, 0.35);
  return (
    <SectionScene
      t={t}
      cam={c}
      night
      light={{ ...LIGHT.lamp, amb: lerp(0.34, 0.6, 1 - lamp) }}
      lamps={{ dining: lamp, sitting: 0, kitchen: 0, hall: 0, guest: 0, lizzie: 0.3, parents: 0, backhall: 0, attic: 0 }}
      props={{ laid: false }}
      people={{
        dining: (
          <g>
            <Person x={420} look={ANDREW_HOME} light={LIGHT.lamp} pose={seated(t, 1, { lean: 14, neck: 16, nearUpper: lerp(30, 70, reach), nearFore: lerp(60, 30, reach), farUpper: 34, farFore: 70 }, 0.4)} facing={-1} />
            <Coins x={40} y={-160} n={5} light={LIGHT.lamp} />
            <Coins x={-10} y={-158} n={3} light={LIGHT.lamp} />
            <g transform="translate(180 -150) scale(0.32) rotate(-70)">
              <Ledger x={0} y={-2} light={LIGHT.lamp} rot={0} lines={10} />
            </g>
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.85 }}
    />
  );
};

export const HillVsStreet: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.afternoon;
  const swap = t >= 4.4;
  const cHill = cam(t, [[0, -600], [4.4, 400]], [[0, -1000], [4.4, -960]], [[0, 0.36], [4.4, 0.4]]);
  const cStreet = cam(t, [[4.4, 200], [dur, 0]], [[4.4, -640], [dur, -620]], [[4.4, 0.62], [dur, 0.7]]);
  return (
    <AbsoluteFill>
      {!swap ? (
        <Stage cam={cHill} t={t}>
          <TheHill t={t + 4} light={L} houses={3} />
          <Plane d={-5.5}>
            <Person x={-1800} look={GENTRY[2]} light={L} pose={standing(t, 5, { turn: 0.2 })} facing={1} />
            <Person x={-1620} look={GENTRY[3]} light={L} pose={standing(t, 6, { turn: 0.2 })} facing={1} />
          </Plane>
        </Stage>
      ) : (
        <Stage cam={cStreet} t={t}>
          <SecondStreet t={t + 8} light={L} heat={0.3} onWalk={<Person x={-1500} look={TOWNSFOLK[4]} light={L} pose={standing(t, 9)} facing={1} />} />
        </Stage>
      )}
      <Finish temp={0.4} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const LizzieDislikes: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -240], [dur, -300]], [[0, eye(HOUSE.upper, 240)], [dur, eye(HOUSE.upper, 250)]], [[0, 1.5], [dur, 1.75]]);
  return (
    <SectionScene
      t={t}
      cam={c}
      light={LIGHT.room}
      lamps={{ guest: 0.4, parents: 0.4 }}
      people={{
        lizzie: (
          <g>
            <Person x={-420} look={LIZZIE} light={LIGHT.room} pose={idle(pose({ ...FOLDED, turn: 0.8, neck: -4 }), t, 3, 0.6)} facing={-1} />
          </g>
        ),
      }}
      finish={{ temp: 0.2, vignette: 0.7 }}
    />
  );
};

// ---------------------------------------------------------- the sisters

export const Sisters: React.FC = () => {
  const { t, dur } = useShot();
  // 115.4 Lizzie; 117.5 Emma; 120.6 both; 122.5–124.4 "in their father's house": Andrew.
  const c = cam(
    t,
    [[0, -560], [1.8, -560], [2.6, -760], [4.8, -760], [5.6, -600], [7.6, -600], [8.6, -560], [dur, -560]],
    [[0, eye(HOUSE.floor, 230)], [dur, eye(HOUSE.floor, 250)]],
    [[0, 1.9], [1.8, 1.9], [2.6, 1.9], [4.8, 1.9], [5.6, 1.3], [7.6, 1.3], [8.6, 1.15], [dur, 1.15]],
    EASE.inOut,
  );
  const andrew = walker(t, 7.2, 9.2, -140, -280, undefined, 3);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      people={{
        sitting: (
          <g>
            {/* Lizzie sewing on the sofa */}
            <Person x={-540} look={LIZZIE} light={L} pose={seated(t, 1, { lean: 10, neck: 14, nearUpper: 40 + Math.sin(t * 2.6) * 6, nearFore: 70, farUpper: 36, farFore: 76 }, 0.4)} facing={1} />
            {/* Emma reading in the armchair */}
            <Person x={-800} look={EMMA} light={L} pose={seated(t, 2, { lean: 4, neck: 12, nearUpper: 34, nearFore: 84, farUpper: 30, farFore: 88 }, 0.4)} facing={1} nearHold={<HymnBook light={L} />} />
            <Person x={andrew.x} look={ANDREW_HOME} light={L} pose={t > 7.2 ? andrew.pose : standing(t, 3)} facing={t > 7.2 ? andrew.facing : -1} opacity={ramp(t, 7.0, 7.4)} />
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.7 }}
    />
  );
};

const ANDREW_YOUNG = { ...ANDREW, hairColor: "#4a3a2c", age: 45 };
const EMMA_YOUNG = { ...CHILDREN[0], top: "#2a2a30", skirt: "#2a2a30", pants: "#2a2a30", hairColor: "#4a3222", hair: "long" as const, age: 12 };

export const MotherDied: React.FC = () => {
  const { t, dur } = useShot();
  // 128.0 "then Andrew married Abby": she walks in and takes his arm.
  const abby = walker(t, 3.0, 5.4, 1500, 260, undefined, 6);
  const L = LIGHT.grey;
  const c = cam(t, [[0, -200], [3.0, -160], [dur, 0]], [[0, -380], [dur, -400]], [[0, 0.9], [3.0, 0.95], [dur, 0.8]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Cemetery t={t} light={L}>
          <g transform="translate(-700 0)">
            <Headstone x={0} h={220} w={130} light={L} />
            <path d="M-160 0 Q0 -30 160 0 Z" fill={lit("#4a3a2a", L)} />
          </g>
        </Cemetery>
        <Plane d={-1.5}>
          <Person x={-400} look={ANDREW_YOUNG} light={L} pose={idle(pose({ neck: 14, turn: 0.3 }), t, 1, 0.5)} facing={-1} />
          <Person x={-240} look={LIZZIE_CHILD} light={L} pose={idle(pose({ neck: -20, turn: t > 4 ? 0.9 : 0.2, farUpper: -40, farFore: 10 }), t, 2, 0.6)} facing={t > 4.6 ? 1 : -1} />
          <Person x={-80} look={EMMA_YOUNG} light={L} pose={idle(pose({ neck: 10 }), t, 3, 0.5)} facing={-1} />
          <Person x={abby.x} look={ABBY} light={L} pose={abby.pose} facing={abby.facing} opacity={ramp(t, 2.8, 3.3)} />
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.8} grain={0.5} />
    </AbsoluteFill>
  );
};

export const Stepmother: React.FC = () => {
  const { t, dur } = useShot();
  // 139.1 "...complicated": Lizzie turns her head a little further away.
  const away = ramp(t, 7.0, 7.8);
  const c = cam(t, [[0, 520], [dur, 40]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 240)]], [[0, 1.6], [dur, 1.5]]);
  const L = LIGHT.lamp;
  return (
    <SectionScene
      t={t}
      cam={c}
      night
      light={L}
      lamps={{ dining: 1, sitting: 0.3, kitchen: 0.2, guest: 0, lizzie: 0, parents: 0, hall: 0, backhall: 0, attic: 0 }}
      props={{ laid: true }}
      people={{
        dining: (
          <g>
            <Person x={560} look={ABBY} light={L} pose={seated(t, 1, { lean: 6, neck: 6, nearUpper: 40, nearFore: 70 }, 0.4)} facing={-1} />
            <Person x={225} look={ANDREW_HOME} light={L} pose={seated(t, 2, { lean: 8, neck: 10 }, 0.3)} facing={1} view="3q" />
            <Person x={-100} look={LIZZIE} light={L} pose={seated(t, 3, { lean: 2, neck: -4, turn: lerp(0.2, 0.9, away), nearUpper: 36, nearFore: 80 }, 0.4)} facing={1} />
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.85 }}
    />
  );
};

// ---------------------------------------------------------- money

const TableTop: React.FC<{ t: number; children: React.ReactNode; cloth?: string }> = ({ t, children, cloth = "#2a3a2c" }) => (
  <Plane d={0}>
    <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit(cloth, TABLE)} />
    <Pool x={200} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3 + Math.sin(t * 3) * 0.02} />
    {children}
  </Plane>
);

export const Money: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, 0], [dur, 60]], [[0, -60], [dur, -40]], [[0, 2.2], [dur, 2.6]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <TableTop t={t}>
          <Ledger x={0} y={-40} light={TABLE} rot={-3} lines={12} entries={[{ y: -120, text: "Rents, Second St.", k: 1 }, { y: -80, text: "Union Savings Bank", k: 1 }, { y: -40, text: "Mill shares", k: 1 }, { y: 0, text: "A. J. Borden", k: ramp(t, 0.4, 1.6) }]} />
          <Coins x={360} y={80} n={6} light={TABLE} />
          <Coins x={420} y={120} n={4} light={TABLE} />
          <Coins x={-400} y={130} n={2} light={TABLE} />
        </TableTop>
        <Plane d={-1.4}>
          <CloseHand x={420} y={-360} angle={18} light={TABLE} sleeve="#1e1c1e" s={1.6} curl={0.5} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const DeedAbby: React.FC = () => {
  const { t, dur } = useShot();
  // 145.4–147.3: the deed slides from Andrew's side toward Abby's.
  const slide = ramp(t, 1.6, 3.4, EASE.inOut);
  const c = cam(t, [[0, -100], [dur, 200]], [[0, -40], [dur, -40]], [[0, 2.0], [dur, 2.2]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <TableTop t={t}>
          <Deed x={lerp(-420, 420, slide)} y={0} rot={lerp(-8, 6, slide)} light={TABLE} signed={1} />
          <Teacup x={700} y={200} light={TABLE} />
        </TableTop>
        <Plane d={-1.4}>
          <CloseHand x={lerp(-560, 260, slide)} y={-300} angle={14} light={TABLE} sleeve="#1e1c1e" s={1.6} curl={0.2} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const SistersReact: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -640], [dur, -620]], [[0, eye(HOUSE.floor, 300)], [dur, eye(HOUSE.floor, 300)]], [[0, 2.2], [dur, 2.5]]);
  const L = LIGHT.lamp;
  return (
    <SectionScene
      t={t}
      cam={c}
      night
      light={L}
      lamps={{ sitting: 0.8, dining: 0.3, kitchen: 0, guest: 0, lizzie: 0, parents: 0, hall: 0, backhall: 0, attic: 0 }}
      people={{
        sitting: (
          <g>
            <Person x={-740} look={EMMA} light={L} pose={idle(pose({ ...FOLDED, brow: -0.6, turn: -0.2 }), t, 1, 0.5)} facing={1} />
            <Person x={-560} look={LIZZIE} light={L} pose={idle(pose({ ...FOLDED, brow: -0.8, turn: -0.3, neck: -3 }), t, 2, 0.5)} facing={-1} />
          </g>
        ),
      }}
      finish={{ temp: 0.2, vignette: 0.85 }}
    />
  );
};

export const DeedSisters: React.FC = () => {
  const { t, dur } = useShot();
  // 151.5–153: a second deed slides toward the sisters (bottom). 155.0: "on the surface": the cup trembles.
  const slide = ramp(t, 1.0, 2.6, EASE.inOut);
  const settle = ramp(t, 3.2, 4.0);
  const tremble = between(t, 4.6, dur + 1, 0.3);
  const c = cam(t, [[0, 100], [dur, 500]], [[0, -40], [dur, 120]], [[0, 2.0], [dur, 2.6]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <TableTop t={t}>
          <Deed x={420} y={-140} rot={6} light={TABLE} signed={1} />
          <Deed x={lerp(-300, 60, slide)} y={lerp(-240, 260, slide)} rot={lerp(-20, 4, slide)} light={TABLE} signed={1} seed={4} />
          <Teacup x={700} y={200} light={TABLE} tremble={tremble} t={t} />
        </TableTop>
        <Plane d={-1.4}>
          <CloseHand x={lerp(-440, -100, slide) - settle * 500} y={lerp(-480, -60, slide) - settle * 300} angle={22} light={TABLE} sleeve="#1e1c1e" s={1.6} curl={0.2} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- the odd house

export const OddHouse: React.FC = () => {
  const { t, dur } = useShot();
  // 160.3 "even its plan was unusual": the wall falls away.
  const open = ramp(t, 3.3, 4.5, EASE.inOut);
  const c = cam(t, [[0, 300], [dur, 0]], [[0, -640], [dur, -560]], [[0, 0.62], [3.3, 0.56], [dur, 0.5]]);
  const L = LIGHT.afternoon;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={LIGHT.room}
      open={open}
      windowsLit={0}
      lamps={{}}
      people={{
        sitting: <Person x={-500} look={ANDREW_HOME} light={LIGHT.room} pose={seated(t, 1)} facing={1} />,
        lizzie: <Person x={-300} look={LIZZIE} light={LIGHT.room} pose={standing(t, 2)} />,
        kitchen: <Person x={1000} look={BRIDGET} light={LIGHT.room} pose={standing(t, 3)} facing={-1} />,
        parents: <Person x={500} look={ABBY} light={LIGHT.room} pose={seated(t, 4)} />,
      }}
      finish={{ temp: 0.3, vignette: 0.7 }}
      yard={
        <Plane d={-3}>
          <Elm x={-2600} h={2400} light={L} t={t} seed={3} />
        </Plane>
      }
    />
  );
};

export const ThroughRooms: React.FC = () => {
  const { t, dur } = useShot();
  // A figure crosses the upper floor from the back stairs through every room to the front.
  const w = walker(t, 0.2, dur + 0.4, 1150, -1150, undefined, 5);
  const c = cam(t, [[0, 700], [dur, -600]], [[0, eye(HOUSE.upper, 250)], [dur, eye(HOUSE.upper, 250)]], [[0, 1.05], [dur, 1.05]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ bolts: 0, guestDoorOpen: 0.9 }}
      people={{
        backhall: w.x > 850 ? <Person x={w.x} look={BRIDGET} light={L} pose={w.pose} facing={w.facing} /> : null,
        parents: w.x <= 850 && w.x > 100 ? <Person x={w.x} look={BRIDGET} light={L} pose={w.pose} facing={w.facing} /> : null,
        lizzie: w.x <= 100 && w.x > -700 ? <Person x={w.x} look={BRIDGET} light={L} pose={w.pose} facing={w.facing} /> : null,
        guest: w.x <= -700 ? <Person x={w.x} look={BRIDGET} light={L} pose={w.pose} facing={w.facing} /> : null,
      }}
      finish={{ temp: 0.2, vignette: 0.7 }}
    />
  );
};

export const LockedDoors: React.FC = () => {
  const { t, dur } = useShot();
  // 167.3 bolt on the door between the rooms; 168.1 the front door's three locks.
  const bolt = ramp(t, 0.2, 0.6, EASE.out);
  const front = t >= 1.05;
  const locks = lerp(0, 3, ramp(t, 1.15, 2.2, EASE.linear));
  const cDoor = cam(t, [[0, 100], [1.05, 110]], eye(HOUSE.upper, 300), [[0, 2.6], [1.05, 2.8]]);
  const cFront = cam(t, [[1.05, -1290], [dur, -1280]], eye(HOUSE.floor, 300), [[1.05, 2.4], [dur, 2.6]]);
  return (
    <SectionScene
      t={t}
      cam={front ? cFront : cDoor}
      light={LIGHT.dim}
      props={{ bolts: bolt, frontLocks: locks, guestDoorOpen: 0 }}
      finish={{ temp: 0.1, vignette: 0.85 }}
    />
  );
};

export const Apart: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -100], [dur, 0]], [[0, -560], [dur, -640]], [[0, 0.7], [dur, 0.52]]);
  const L = LIGHT.lamp;
  return (
    <SectionScene
      t={t}
      cam={c}
      night
      light={L}
      lamps={{ parents: 1, lizzie: 1, sitting: 1, attic: 0.8, dining: 0, kitchen: 0, hall: 0, guest: 0, backhall: 0, cellar: 0 }}
      props={{ guestDoorOpen: 0 }}
      people={{
        parents: (
          <g>
            <Person x={300} look={ANDREW_HOME} light={L} pose={seated(t, 1, { neck: 14, nearUpper: 34, nearFore: 84 }, 0.3)} facing={1} nearHold={<HymnBook light={L} />} />
            <Person x={620} look={ABBY} light={L} pose={seated(t, 2, { neck: 8 }, 0.3)} facing={-1} />
          </g>
        ),
        lizzie: <Person x={-500} look={LIZZIE} light={L} pose={seated(t, 3, { neck: 14, nearUpper: 34, nearFore: 84 }, 0.3)} facing={1} nearHold={<HymnBook light={L} />} />,
        sitting: <Person x={-820} look={EMMA} light={L} pose={seated(t, 4, { neck: 12 }, 0.3)} facing={1} />,
        attic: <Person x={-100} look={BRIDGET} light={L} pose={seated(t, 5, { neck: 8 }, 0.3)} facing={-1} />,
      }}
      finish={{ temp: 0.1, vignette: 0.85 }}
    />
  );
};

export const August: React.FC = () => {
  const { t, dur } = useShot();
  // 173.8–175.5: July torn off the kitchen calendar. 176.8: the street in the heat.
  const tear = ramp(t, 0.3, 1.5, EASE.in);
  const swap = ramp(t, 3.0, 3.8, EASE.inOut);
  const cCal = cam(t, [[0, 1120], [3.0, 1120]], [[0, HOUSE.floor - 400], [3.0, HOUSE.floor - 400]], [[0, 2.6], [3.0, 2.9]]);
  const cStreet = cam(t, [[3.0, 100], [dur, -40]], [[3.0, -700], [dur, -660]], [[3.0, 0.5], [dur, 0.56]]);
  const ROOM = LIGHT.room;
  return (
    <AbsoluteFill>
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <Stage cam={cCal} t={t}>
            <Plane d={0}>
              <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#b8b090", ROOM)} />
              <WallCalendar x={1120} y={HOUSE.floor - 400} light={ROOM} s={0.9} />
              <g transform={`translate(1120 ${HOUSE.floor - 400}) rotate(${tear * 40}) translate(${tear * 300} ${tear * 500})`} opacity={1 - ramp(t, 1.3, 1.6)}>
                <WallCalendar x={0} y={0} light={ROOM} s={0.9} month="JULY" year="1892" ringDay={0} />
              </g>
            </Plane>
            <Plane d={-1.2}>
              <CloseHand x={1150 + tear * 200} y={HOUSE.floor - 600 + tear * 300} angle={-150 + tear * 30} light={ROOM} skin="#efcbb0" sleeve="#4a5a72" s={1.5} curl={0.6} />
            </Plane>
          </Stage>
          <Finish temp={0.3} vignette={0.7} />
        </AbsoluteFill>
      ) : null}
      {swap > 0 ? (
        <AbsoluteFill style={{ opacity: swap }}>
          <Stage cam={cStreet} t={t}>
            <SecondStreet t={t + 20} light={LIGHT.noon} heat={1.4} />
          </Stage>
          <Finish temp={0.7} vignette={0.6} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

