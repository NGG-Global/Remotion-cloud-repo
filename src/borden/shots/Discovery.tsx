import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import { Glow, Pool } from "../../gacy/kit/light";
import { ALICE, ANDREW_HOME, BRIDGET, DR_BOWEN, LIZZIE, NEIGHBOR_WOMAN, SHADOW, TOWNSFOLK } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { BarnLoft } from "../kit/interiors";
import { ClockFace, Sinkers } from "../kit/props";
import { Ledger } from "../kit/paper";
import { SecondStreet } from "../kit/town";
import {EASE, Finish, LIGHT, LYING, Person, Plane, SectionScene, Stage, between, cam, eye, idle, lerp, pose, ramp, speaking, standing, useShot, walker } from "./common";

/**
 * 5:19–6:36. The barn, the second body, the first one found, and the
 * arithmetic of an hour and a half.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;

export const ToTheBarn: React.FC = () => {
  const { t, dur } = useShot();
  // From the side yard: Lizzie crosses from the side door to the barn.
  const w = walker(t, 0.2, dur + 0.6, HOUSE.sideDoor, HOUSE.barnX + 500, undefined, 3);
  const c = cam(t, [[0, 1100], [dur, 2200]], [[0, -480], [dur, -520]], [[0, 0.7], [dur, 0.62]]);
  const L = LIGHT.noon;
  return (
    <SectionScene
      t={t}
      cam={c}
      open={0}
      light={L}
      props={{ backDoorOpen: 0.5 }}
      yard={
        <Plane d={2}>
          <Person x={w.x} look={LIZZIE} light={L} pose={w.pose} facing={w.facing} s={0.96} />
        </Plane>
      }
      finish={{ temp: 0.5, vignette: 0.65 }}
    />
  );
};

export const BarnLoftShot: React.FC = () => {
  const { t, dur } = useShot();
  // She looks over the bench: sinkers, line. 325.5 "sinkers": she lifts one.
  const lift = between(t, 2.6, 4.6, 0.4);
  const c = cam(t, [[0, 700], [dur, 560]], [[0, -400], [dur, -380]], [[0, 0.9], [dur, 1.25]]);
  const L = LIGHT.dim;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a140e">
        <Plane d={0}>
          <BarnLoft light={L} t={t} bench={<Sinkers x={-60} y={0} light={L} />}>
            <Person x={330} look={LIZZIE} light={L} pose={idle(pose({ lean: 12 + lift * 4, neck: 12, nearUpper: 50 + lift * 30, nearFore: 40 - lift * 20, farUpper: 40, farFore: 60 }), t, 1, 0.5)} facing={1} />
          </BarnLoft>
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const TimePasses: React.FC = () => {
  const { t, dur } = useShot();
  // "she said she spent some time there. Then went back": the light shifts; she climbs down.
  const shift = ramp(t, 0.2, 2.2, EASE.inOut);
  const w = walker(t, 2.3, dur + 0.2, 330, -820, undefined, 3);
  const c = cam(t, [[0, 300], [2.3, 200], [dur, -400]], [[0, -440], [dur, -400]], [[0, 0.9], [dur, 0.95]]);
  const L = LIGHT.dim;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a140e">
        <Plane d={0}>
          <BarnLoft light={L} t={t + shift * 40} bench={<Sinkers x={-60} y={0} light={L} />} dust={1 - shift * 0.3}>
            <Person x={w.x} look={LIZZIE} light={L} pose={t < 2.3 ? idle(pose({ turn: 0.4, neck: -6 }), t, 1, 0.6) : w.pose} facing={t < 2.3 ? -1 : w.facing} />
            <Glow x={0} y={-1050} r={800 + shift * 400} color="#fff0c8" opacity={0.15 + shift * 0.1} />
          </BarnLoft>
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const BridgetRests: React.FC = () => {
  const { t, dur } = useShot();
  // The attic: Bridget lying down. 338.5 she sits up at the call. Then down the back stairs to the sitting-room door.
  const up = ramp(t, 5.6, 6.3, EASE.out);
  const down = ramp(t, 6.6, dur + 2.8, EASE.inOut);
  const c = cam(
    t,
    [[0, -60], [5.6, -40], [6.6, 0], [dur, -180]],
    [[0, eye(HOUSE.attic, 200)], [5.6, eye(HOUSE.attic, 200)], [6.6, eye(HOUSE.attic, 220)], [dur, eye(HOUSE.floor, 250)]],
    [[0, 1.5], [5.6, 1.5], [6.6, 1.3], [dur, 0.8]],
    EASE.inOut,
  );
  const L = LIGHT.room;
  const LYING_BED = pose({ ...LYING, lids: 0.15 });
  const SITUP = pose({ hipDrop: 80, lean: 0, nearThigh: 84, nearKnee: 20, farThigh: 80, farKnee: 24, nearUpper: 30, nearFore: 30, farUpper: 20, farFore: 40, lids: 1, neck: -6 });
  const blend = (a: typeof LYING_BED, b: typeof LYING_BED, k: number) => Object.fromEntries(Object.keys(a).map((f) => [f, lerp(a[f as keyof typeof a], b[f as keyof typeof b], k)])) as typeof LYING_BED;
  const stairY = lerp(0, HOUSE.floor - HOUSE.attic, down);
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.1 }}
      props={{ guestDoorOpen: 0.15 }}
      people={{
        attic: down < 0.05 ? <Person x={-40} y={-100} look={BRIDGET} light={L} pose={idle(blend(LYING_BED, SITUP, up), t, 1, 0.2)} facing={1} grounded={false} /> : null,
        backhall: down >= 0.05 && down < 0.5 ? <Person x={lerp(1100, 1250, down * 2)} y={stairY * 0 + lerp(0, HOUSE.upper - HOUSE.attic, Math.min(1, down * 2))} look={BRIDGET} light={L} pose={pose({ lean: 8, nearThigh: 30 + Math.sin(t * 6) * 20, farThigh: 30 - Math.sin(t * 6) * 20, nearKnee: 40, farKnee: 40 })} facing={1} grounded={false} /> : null,
        kitchen: down >= 0.5 ? <Person x={lerp(1250, 700, (down - 0.5) * 2)} y={lerp(0, HOUSE.floor - HOUSE.upper, Math.min(1, (down - 0.5) * 3))} look={BRIDGET} light={L} pose={pose({ lean: 8, nearThigh: 30 + Math.sin(t * 6) * 20, farThigh: 30 - Math.sin(t * 6) * 20, nearKnee: 40, farKnee: 40 })} facing={-1} grounded={false} /> : null,
        sitting: <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0)} facing={1} grounded={false} opacity={0.0} />,
      }}
      finish={{ temp: 0.3, vignette: 0.8 }}
    />
  );
};

export const AndrewDead: React.FC = () => {
  const { t, dur } = useShot();
  // The sitting-room doorway from the dining room: Bridget and Lizzie at the door; the sofa arm only.
  const arrive = walker(t, 0.1, 1.6, 200, -120, undefined, 2);
  const c = cam(t, [[0, -60], [dur, -120]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.6], [dur, 1.9]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ sitting: 0.35, guest: 0.1 }}
      props={{ guestDoorOpen: 0.15 }}
      people={{
        dining: (
          <g>
            <Person x={-60} look={LIZZIE} light={L} pose={idle(pose({ turn: 0.6, brow: -0.6, nearUpper: 60, nearFore: 100 }), t, 3, 0.7)} facing={-1} />
            <Person x={arrive.x + 120} look={BRIDGET} light={L} pose={t < 1.6 ? arrive.pose : idle(pose({ brow: -0.8, mouth: 0.6, nearUpper: 70, nearFore: 110, farUpper: 66, farFore: 114 }), t, 2, 0.7)} facing={-1} />
          </g>
        ),
      }}
      finish={{ temp: 0.1, vignette: 0.9 }}
    />
  );
};

export const TenEleven: React.FC = () => {
  const { t, dur } = useShot();
  // 344.5 "ten or eleven blows": the ledger. 348.5 the wallpaper and the two women's turned faces.
  const swap = ramp(t, 3.6, 4.3, EASE.inOut);
  const cL = cam(t, [[0, 40], [3.6, 90]], [[0, -60], [3.6, -40]], [[0, 2.6], [3.6, 3.0]]);
  const cR = cam(t, [[3.6, -100], [dur, -130]], [[3.6, eye(HOUSE.floor, 300)], [dur, eye(HOUSE.floor, 300)]], [[3.6, 2.3], [dur, 2.6]]);
  const L = LIGHT.room;
  return (
    <AbsoluteFill>
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <Stage cam={cL} t={t} bg="#0c0906">
            <Plane d={0}>
              <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a2a2c", TABLE)} />
              <Pool x={200} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
              <Ledger x={0} y={-40} light={TABLE} rot={-2} lines={12} entries={[{ y: -120, text: "Mrs. A. D. Borden", k: 1 }, { y: -80, text: "guest chamber, floor", k: 1 }, { y: 10, text: "19", k: 1, big: true }, { y: -40, text: "A. J. Borden, sitting room", k: ramp(t, 0.1, 1.4) }, { y: 70, text: "10 – 11", k: ramp(t, 1.6, 2.6), big: true }]} />
            </Plane>
            <Plane d={-1.4}>
              <CloseHand x={lerp(160, 300, ramp(t, 1.6, 2.6))} y={-200} angle={-22} light={TABLE} sleeve="#2a2a2e" s={1.6} curl={0.7}>
                <path d="M0 40 L2 120" stroke="#1a1510" strokeWidth={4} />
              </CloseHand>
            </Plane>
          </Stage>
          <Finish temp={0.2} vignette={0.9} />
        </AbsoluteFill>
      ) : null}
      {swap > 0 ? (
        <AbsoluteFill style={{ opacity: swap }}>
          <SectionScene
            t={t}
            cam={cR}
            light={L}
            lamps={{ sitting: 0.3 }}
            people={{
              dining: (
                <g>
                  <Person x={-60} look={LIZZIE} light={L} pose={idle(pose({ turn: -0.6, neck: -8, brow: -0.4, lids: 0.7 }), t, 3, 0.5)} facing={1} />
                  <Person x={120} look={BRIDGET} light={L} pose={idle(pose({ turn: -0.2, neck: 10, nearUpper: 70, nearFore: 110, brow: -0.8 }), t, 2, 0.6)} facing={1} />
                </g>
              ),
            }}
            finish={{ temp: 0.0, vignette: 0.9 }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const LizzieSays: React.FC = () => {
  const { t, dur } = useShot();
  // Lizzie in the hall talking to Bridget; above her the guest room, dark. 357.9 "Abby is dead upstairs": the room pulses. 359.4 she points to the door.
  const pulse = between(t, 4.0, 5.4, 0.3);
  const point = between(t, 5.6, dur + 1, 0.4);
  const c = cam(t, [[0, -1050], [dur, -1000]], [[0, eye(HOUSE.floor, 300)], [dur, -600]], [[0, 1.3], [dur, 0.95]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.08 + pulse * 0.25, sitting: 0.3 }}
      props={{ guestDoorOpen: 0.15, guestHem: 0.7, frontDoorOpen: 0 }}
      people={{
        hall: (
          <g>
            <Person x={-1120} look={LIZZIE} light={L} pose={speaking(t, 3, { turn: -0.2, nearUpper: lerp(20, 80, point), nearFore: lerp(60, 10, point) }, 0.7)} facing={-1} />
            <Person x={-1000} look={BRIDGET} light={L} pose={idle(pose({ brow: -0.6, neck: 4 }), t, 2, 0.6)} facing={1} />
          </g>
        ),
      }}
      finish={{ temp: 0.1, vignette: 0.85 }}
    />
  );
};

export const NeighborsCome: React.FC = () => {
  const { t, dur } = useShot();
  // Neighbours hurry; the doctor crosses with his bag; people go in at the front door.
  const L = LIGHT.noon;
  const a = walker(t, 0.1, 2.8, -2400, -700, undefined, 1);
  const b = walker(t, 0.6, 3.4, 2600, 300, undefined, 2);
  const doc = walker(t, 1.6, 4.2, 3200, -200, undefined, 3);
  const inA = walker(t, 3.0, 5.4, -700, -900, undefined, 4);
  const c = cam(t, [[0, -600], [dur, -300]], [[0, -600], [dur, -560]], [[0, 0.6], [dur, 0.75]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet
          t={t + 90}
          light={L}
          doorOpen={ramp(t, 2.6, 3.2)}
          onWalk={
            <g>
              <Person x={t < 3.0 ? a.x : inA.x} look={NEIGHBOR_WOMAN} light={L} pose={t < 3.0 ? a.pose : inA.pose} facing={t < 3.0 ? a.facing : inA.facing} />
              <Person x={b.x} look={ALICE} light={L} pose={b.pose} facing={b.facing} />
              <Person x={doc.x} look={DR_BOWEN} light={L} pose={doc.pose} facing={doc.facing} />
              <Person x={2000} look={TOWNSFOLK[0]} light={L} pose={standing(t, 8, { turn: 0.4 })} facing={-1} opacity={ramp(t, 2, 2.6)} />
            </g>
          }
        />
      </Stage>
      <Finish temp={0.4} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const StairsShot: React.FC = () => {
  const { t, dur } = useShot();
  // Up the front stairs; the guest-room door ajar; through the gap, under the bed, a dark shape.
  const climb = ramp(t, 0.4, 5.0, EASE.inOut);
  const see = ramp(t, 8.6, 9.4, EASE.out);
  const c = cam(
    t,
    [[0, -1150], [5.0, -1000], [8.0, -880], [dur, -840]],
    [[0, eye(HOUSE.floor, 260)], [5.0, eye(HOUSE.upper, 200)], [8.0, eye(HOUSE.upper, 120)], [dur, eye(HOUSE.upper, 100)]],
    [[0, 1.3], [5.0, 1.4], [8.0, 2.0], [dur, 2.3]],
    EASE.inOut,
  );
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      handheld={2}
      light={L}
      lamps={{ guest: 0.35 + see * 0.15 }}
      props={{ guestDoorOpen: 0.5, guestHem: 0.7 + see * 0.3, frontDoorOpen: 0.7 }}
      people={{
        hall: climb < 1 ? <Person x={lerp(-1330, -990, climb)} y={lerp(0, HOUSE.upper - HOUSE.floor, climb)} look={ALICE} light={L} pose={pose({ lean: 10, nearThigh: 30 + Math.sin(t * 6) * 20, farThigh: 30 - Math.sin(t * 6) * 20, nearKnee: 40, farKnee: 40, neck: -6 })} facing={1} grounded={false} /> : null,
        guest: climb >= 1 ? <Person x={-760} look={ALICE} light={L} pose={idle(pose({ turn: 0.8, neck: 12, lean: 8, brow: -0.3 }), t, 5, 0.6)} facing={-1} /> : null,
      }}
      finish={{ temp: 0.0, vignette: 0.9 }}
    />
  );
};

export const NinetyMinutes: React.FC = () => {
  const { t, dur } = useShot();
  // The mantel clock: 9:30 to 11:00.
  const m = lerp(570, 660, ramp(t, 0.3, 2.6, EASE.inOut));
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -60], [dur, -60]], [[0, 2.2], [dur, 2.5]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#3a2a22", TABLE)} />
          <Pool x={0} y={-100} rx={900} ry={700} color="#ffd9a0" opacity={0.3} />
          <path d="M-140 60 L140 60 L140 -80 Q140 -200 0 -200 Q-140 -200 -140 -80 Z" fill={lit("#2a1a12", TABLE)} />
          <ClockFace x={0} y={-60} r={110} minutes={m} light={TABLE} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.9} />
    </AbsoluteFill>
  );
};

export const DidNotFlee: React.FC = () => {
  const { t, dur } = useShot();
  // What did not happen: a figure in, up, down, out, in one dash. Then the picture rewinds it.
  const run = ramp(t, 0.6, 4.4, EASE.linear);
  const undo = ramp(t, 4.8, 6.6, EASE.inOut);
  const k = run * (1 - undo);
  const path = (u: number) => {
    // waypoints: side door -> kitchen -> back stairs -> parents -> lizzie -> guest -> back the same way -> out.
    const pts: [number, number][] = [
      [HOUSE.sideDoor + 300, 0],
      [HOUSE.sideDoor, 0],
      [1250, 0],
      [1250, HOUSE.upper - HOUSE.floor],
      [-1000, HOUSE.upper - HOUSE.floor],
      [-1000, HOUSE.upper - HOUSE.floor],
      [1250, HOUSE.upper - HOUSE.floor],
      [1250, 0],
      [-500, 0],
      [-500, 0],
      [HOUSE.sideDoor + 500, 0],
    ];
    const i = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1)));
    const f = u * (pts.length - 1) - i;
    return { x: lerp(pts[i][0], pts[i + 1][0], f), y: lerp(pts[i][1], pts[i + 1][1], f) };
  };
  const p = path(k);
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -600], [dur, -620]], [[0, 0.5], [dur, 0.52]]);
  const L = LIGHT.room;
  const fig = <Person x={p.x} y={p.y} look={SHADOW} mode="silhouette" silhouette="#08060a" pose={pose({ lean: 14, nearThigh: 40 + Math.sin(t * 12) * 30, farThigh: 40 - Math.sin(t * 12) * 30, nearKnee: 50, farKnee: 50, nearUpper: 30, farUpper: -30 })} facing={k < 0.5 ? -1 : 1} grounded={false} opacity={k > 0.02 ? 1 : 0} />;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.2 }}
      props={{ guestDoorOpen: 0.5, backDoorOpen: 0.6 }}
      people={{
        kitchen: p.y === 0 && p.x > 600 ? fig : null,
        dining: p.y === 0 && p.x <= 600 && p.x > -150 ? fig : null,
        sitting: p.y === 0 && p.x <= -150 ? fig : null,
        backhall: p.y !== 0 && p.x > 850 ? fig : null,
        parents: p.y !== 0 && p.x <= 850 && p.x > 100 ? fig : null,
        lizzie: p.y !== 0 && p.x <= 100 && p.x > -700 ? fig : null,
        guest: p.y !== 0 && p.x <= -700 ? fig : null,
      }}
      yard={<Plane d={0}>{p.y === 0 && p.x > 1400 ? fig : null}</Plane>}
      finish={{ temp: 0.1, vignette: 0.8 }}
    />
  );
};

export const Waited: React.FC = () => {
  const { t, dur } = useShot();
  // 390.9 "waited": a silhouette standing still upstairs; 392.0 "hid": in the wardrobe corner; 393.3 "was in the house all along": the silhouette fades, the people remain.
  const waitK = between(t, 0.8, 2.2, 0.3);
  const hideK = between(t, 2.2, 3.5, 0.3);
  const fade = ramp(t, 3.6, 4.8);
  const c = cam(t, [[0, -300], [dur, 0]], [[0, -620], [dur, -640]], [[0, 0.62], [dur, 0.5]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.2 }}
      props={{ guestDoorOpen: 0.3 }}
      people={{
        lizzie: <Person x={-500} look={SHADOW} mode="silhouette" silhouette="#08060a" pose={idle(pose({}), t, 9, 0.3)} facing={-1} opacity={waitK * (1 - fade)} />,
        parents: <Person x={700} look={SHADOW} mode="silhouette" silhouette="#08060a" pose={idle(pose({ lean: 6 }), t, 9, 0.3)} facing={-1} opacity={hideK * (1 - fade)} />,
        kitchen: <Person x={780} look={LIZZIE} light={L} pose={standing(t, 4, { turn: 0.2 })} facing={1} />,
        sitting: <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} />,
      }}
      yard={
        <Plane d={-0.6}>
          <Person x={-520} look={BRIDGET} light={LIGHT.noon} pose={standing(t, 2)} facing={-1} />
        </Plane>
      }
      finish={{ temp: 0.1, vignette: 0.8 }}
    />
  );
};

