import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";

import { Glow, Pool } from "../../gacy/kit/light";
import { Photo } from "../../gacy/kit/paper";
import {ANDREW_HOME, BRIDGET, CHILDREN, JURORS, LIZZIE, SHADOW, TOWNSFOLK } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { COURT, Courtroom, ExhibitTable } from "../kit/interiors";
import { FrontPage, Ledger, NotePad, Deed } from "../kit/paper";
import {Axe, ClockFace, Hatchet, OilLamp, Rope } from "../kit/props";
import { SecondStreet } from "../kit/town";
import { BENT, EASE, Finish, LIGHT, LYING, Person, Plane, SectionScene, Stage, between, cam, eye, idle, lerp, pose, ramp, seated, standing, useShot, walker, washing } from "./common";

/**
 * 13:47–15:48. The part where an answer is due, and the two stories that
 * are both hard to believe. Then the one thing nobody knows.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;
const COURT_L = LIGHT.grey;

export const TheAnswer: React.FC = () => {
  const { t, dur } = useShot();
  // The house at dusk from the street; a slow push to the door.
  const c = cam(t, [[0, 0], [dur, -300]], [[0, -720], [dur, -420]], [[0, 0.5], [dur, 1.3]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#141a2a">
        <SecondStreet t={t + 500} light={LIGHT.afternoon} lamps={0.6} bordenLit={0.3} />
      </Stage>
      <Finish temp={0.1} vignette={0.8} />
    </AbsoluteFill>
  );
};

/** Five reasons, five pictures, each in its own gap of the voice. */
export const ReasonsYes: React.FC = () => {
  const { t, dur } = useShot();
  // 840.0 she was in the house; 841.4 no break-in; 843.5 her versions; 845.9 money; 847.6 the dress.
  const b = t < 3.6 ? 0 : t < 5.0 ? 1 : t < 7.1 ? 2 : t < 9.5 ? 3 : 4;
  const L = LIGHT.room;
  const insert = (children: React.ReactNode, zoom = 2.2) => (
    <Stage cam={{ x: 0, y: -60, zoom }} t={t} bg="#0c0906">
      <Plane d={0}>
        <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a3a2c", TABLE)} />
        <Pool x={0} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
        {children}
      </Plane>
    </Stage>
  );
  return (
    <AbsoluteFill>
      {b === 0 ? (
        <SectionScene t={t} cam={{ x: 0, y: -620, zoom: 0.52 + t * 0.01 }} light={L} lamps={{ guest: 0.2 }} people={{ dining: <Person x={100} look={LIZZIE} light={L} pose={standing(t, 4, { turn: 0.2 })} facing={1} /> }} finish={{ temp: 0.2, vignette: 0.75 }} />
      ) : b === 1 ? (
        <AbsoluteFill>
          <Stage cam={{ x: -500, y: -420, zoom: 1.8 + (t - 3.6) * 0.1 }} t={t}>
            <SecondStreet t={t + 20} light={LIGHT.noon} />
          </Stage>
          <Finish temp={0.4} vignette={0.7} />
        </AbsoluteFill>
      ) : b === 2 ? (
        <AbsoluteFill>
          {insert(<NotePad x={0} y={0} light={TABLE} rot={-4} items={[{ text: "last saw father 10.45", k: 1, struck: 1 }, { text: "last saw father 10.55", k: 1, struck: 1 }, { text: "barn — 20 min.", k: 1, struck: 1 }]} />, 2.6)}
          <Finish temp={0.2} vignette={0.9} />
        </AbsoluteFill>
      ) : b === 3 ? (
        <AbsoluteFill>
          {insert(
            <g>
              <Deed x={-160} y={0} rot={-6} light={TABLE} />
              <Deed x={200} y={40} rot={8} light={TABLE} seed={4} />
            </g>,
            2.0,
          )}
          <Finish temp={0.2} vignette={0.9} />
        </AbsoluteFill>
      ) : (
        <SectionScene t={t} cam={{ x: 860, y: eye(HOUSE.floor, 150), zoom: 2.3 + (t - 9.5) * 0.1 }} light={LIGHT.morning} props={{ fire: 1 }} finish={{ temp: 0.6, vignette: 0.9 }} />
      )}
      {dur < 0 ? null : null}
    </AbsoluteFill>
  );
};

export const IfNot: React.FC = () => {
  const { t, dur } = useShot();
  // The stranger's path: in at the side door 853.8, up to the guest room 856.1, waiting 857.4, down to the sitting room 859.9, out 861.7; nobody sees.
  const u = ramp(t, 2.6, 11.4, EASE.linear);
  const pts: [number, number][] = [
    [HOUSE.sideDoor + 400, 0],
    [1250, 0],
    [1250, HOUSE.upper - HOUSE.floor],
    [-1000, HOUSE.upper - HOUSE.floor],
    [-1000, HOUSE.upper - HOUSE.floor],
    [-1000, HOUSE.upper - HOUSE.floor],
    [-1030, HOUSE.upper - HOUSE.floor],
    [-1330, 0],
    [-500, 0],
    [-500, 0],
    [1250, 0],
    [HOUSE.sideDoor + 500, 0],
  ];
  const i = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1)));
  const f = u * (pts.length - 1) - i;
  const p = { x: lerp(pts[i][0], pts[i + 1][0], f), y: lerp(pts[i][1], pts[i + 1][1], f) };
  const moving = Math.abs(pts[i + 1][0] - pts[i][0]) > 1 || Math.abs(pts[i + 1][1] - pts[i][1]) > 1;
  const c = cam(t, [[0, 0], [dur, -100]], [[0, -600], [dur, -620]], [[0, 0.5], [dur, 0.54]]);
  const L = LIGHT.room;
  const fig = <Person x={p.x} y={p.y} look={SHADOW} mode="silhouette" silhouette="#08060a" pose={moving ? pose({ lean: 10, nearThigh: 30 + Math.sin(t * 9) * 25, farThigh: 30 - Math.sin(t * 9) * 25, nearKnee: 40, farKnee: 40 }) : idle(pose({}), t, 9, 0.3)} facing={u < 0.55 ? -1 : 1} grounded={false} opacity={u > 0.01 && u < 0.99 ? 1 : 0} />;
  const up = p.y !== 0;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.4 }}
      props={{ guestDoorOpen: 0.6, backDoorOpen: between(t, 2.4, 4.0, 0.3) * 0.7 + between(t, 10.6, dur, 0.3) * 0.7 }}
      people={{
        kitchen: !up && p.x > 600 ? fig : <Person x={780} look={LIZZIE} light={L} pose={standing(t, 4)} facing={1} opacity={u > 0.6 ? 1 : 0} />,
        dining: !up && p.x <= 600 && p.x > -150 ? fig : null,
        sitting: (
          <g>
            {!up && p.x <= -150 && p.x > -950 ? fig : null}
            <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} opacity={ramp(t, 8.0, 8.4)} />
          </g>
        ),
        hall: !up && p.x <= -950 ? fig : null,
        backhall: up && p.x > 850 ? fig : null,
        parents: up && p.x <= 850 && p.x > 100 ? fig : null,
        lizzie: up && p.x <= 100 && p.x > -700 ? fig : null,
        guest: (
          <g>
            {up && p.x <= -700 ? fig : null}
            <Person x={-1060} look={{ ...BRIDGET, top: "#4a3a3e", skirt: "#4a3a3e", pants: "#4a3a3e", apron: undefined, hairColor: "#8a8078", build: "heavy" }} light={L} pose={idle(BENT, t, 2, 0.4)} facing={-1} opacity={u < 0.3 ? 1 : 0} />
          </g>
        ),
      }}
      yard={
        <Plane d={0}>
          {!up && p.x > 1400 ? fig : null}
          <Person x={-520} look={BRIDGET} light={LIGHT.noon} pose={washing(t, 2)} facing={-1} />
        </Plane>
      }
      finish={{ temp: 0.1, vignette: 0.8 }}
    />
  );
};

export const ReasonsNo: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, COURT.jury - 500], [dur, COURT.jury + 100]], [[0, -340], [dur, -340]], [[0, 1.2], [dur, 1.25]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JURORS.map((j, i) => (
              <Person key={i} x={COURT.jury - 850 + (i % 6) * 320 + (i >= 6 ? 160 : 0)} y={i >= 6 ? -140 : -30} look={j} light={i >= 6 ? { ...COURT_L, amb: 0.3 } : COURT_L} pose={seated(t, i, { turn: 0.15, neck: 4 }, 0.4)} facing={-1} />
            ))}
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const NoEvidence: React.FC = () => {
  const { t, dur } = useShot();
  // The exhibit table: three outlined places, each blown away in turn: weapon in hand 868.5, eyewitness 871.5, a weapon at all 873.3.
  const gone = [ramp(t, 2.6, 3.4), ramp(t, 4.6, 5.4), ramp(t, 6.4, 7.2)];
  const c = cam(t, [[0, COURT.witness - 500], [dur, COURT.witness - 480]], [[0, -300], [dur, -290]], [[0, 1.6], [dur, 1.9]]);
  const stroke = lit("#c8c0b0", COURT_L);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            <ExhibitTable x={COURT.witness - 500} light={COURT_L} w={900}>
              {[-280, 0, 280].map((x, i) => (
                <g key={i} transform={`translate(${x + gone[i] * 80} ${-gone[i] * 120})`} opacity={1 - gone[i]} fill="none" stroke={stroke} strokeWidth={3} strokeDasharray="8 8">
                  {i === 0 ? <g transform="rotate(80)"><path d="M-6 -4 L8 -4 L8 12 L-6 12 Z M8 -10 L30 -14 Q36 0 30 16 L8 14 Z M-4 0 L4 0 L5 64 L-5 64 Z" transform="scale(2)" /></g> : null}
                  {i === 0 ? <path d="M-60 -20 Q-40 -60 -10 -50 L-10 -10" /> : null}
                  {i === 1 ? <g><circle cx={0} cy={-120} r={30} /><path d="M-50 -40 Q0 -90 50 -40 L50 0 L-50 0 Z" /></g> : null}
                  {i === 2 ? <g transform="rotate(100)"><path d="M-6 -4 L8 -4 L8 12 L-6 12 Z M8 -10 L30 -14 Q36 0 30 16 L8 14 Z" transform="scale(2.4)" /></g> : null}
                </g>
              ))}
            </ExhibitTable>
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const Weaker: React.FC = () => {
  const { t, dur } = useShot();
  // A lurid front page (the myth) beside a plain photograph (the woman); the page fades.
  const fade = ramp(t, 3.4, 6.2, EASE.inOut);
  const c = cam(t, [[0, -100], [dur, 100]], [[0, -60], [dur, -40]], [[0, 1.5], [dur, 1.7]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a3a2c", TABLE)} />
          <Pool x={0} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
          <g opacity={1 - fade * 0.85}>
            <FrontPage id="myth" x={-330} y={-40} w={420} h={600} rot={-5} light={TABLE} masthead="POLICE GAZETTE" headline={"THE FALL RIVER\nFIEND"} seed={21} sketch={<g transform="translate(90 200) scale(0.7)"><Person x={0} look={{ ...LIZZIE, top: "#3a3a3a", skirt: "#3a3a3a", pants: "#3a3a3a" }} light={LIGHT.sepia} mode="sketch" pose={pose({ lean: 10, nearUpper: 150, nearFore: 20, brow: -1, turn: 0.2 })} facing={1} nearHold={<Axe light={LIGHT.sepia} s={0.7} />} /></g>} />
          </g>
          <Photo id="plain" x={330} y={-40} w={260} h={340} rot={4} light={TABLE} tone="#8a7a6a" scene={<Person x={130} y={400} s={1.1} look={LIZZIE} light={LIGHT.sepia} pose={seated(0, 1)} view="front" />} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.9} />
    </AbsoluteFill>
  );
};

export const Circumstantial: React.FC = () => {
  const { t, dur } = useShot();
  // A folder on the table, loose pages; the camera drifts.
  const c = cam(t, [[0, -100], [dur, 120]], [[0, -60], [dur, -30]], [[0, 1.8], [dur, 2.1]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a3a2c", TABLE)} />
          <Pool x={0} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
          <Ledger x={-300} y={-40} light={TABLE} rot={-3} lines={12} entries={[{ y: -120, text: "in the house", k: 1 }, { y: -80, text: "no forced entry", k: 1 }, { y: -40, text: "the note, never found", k: 1 }, { y: 0, text: "the dress, burned", k: 1 }, { y: 40, text: "the hatchet head", k: 1 }]} />
          <NotePad x={300} y={-20} light={TABLE} rot={5} items={[{ text: "witness — none", k: 1 }, { text: "blood — none", k: 1 }, { text: "weapon — ?", k: 1 }]} />
          <g transform="translate(560 200) rotate(70)">
            <Hatchet light={TABLE} s={1.6} handle={0.12} rust={0.3} />
          </g>
        </Plane>
        <Plane d={-1.5}>
          <OilLamp x={900} y={-40} on={1} t={t} light={TABLE} s={1.6} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.9} />
    </AbsoluteFill>
  );
};

export const Survived: React.FC = () => {
  const { t, dur } = useShot();
  // The rope children again, over the house.
  const L = LIGHT.afternoon;
  const phase = t * 1.4;
  const jump = Math.max(0, Math.sin(phase * Math.PI * 2 + 1.2));
  const c = cam(t, [[0, 0], [dur, -80]], [[0, -520], [dur, -560]], [[0, 0.7], [dur, 0.8]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet
          t={t + 600}
          light={L}
          onWalk={
            <g>
              <Person x={-520} look={CHILDREN[1]} light={L} pose={idle(pose({ nearUpper: 40 + Math.sin(phase * Math.PI * 2) * 30, nearFore: 60 + Math.cos(phase * Math.PI * 2) * 20 }), t, 1, 0.5)} facing={1} />
              <Person x={520} look={CHILDREN[3]} light={L} pose={idle(pose({ nearUpper: 40 - Math.sin(phase * Math.PI * 2) * 30, nearFore: 60 - Math.cos(phase * Math.PI * 2) * 20 }), t, 2, 0.5)} facing={-1} />
              <Rope x0={-470} y0={-230} x1={470} y1={-230} phase={phase} light={L} />
              <Person x={0} y={-jump * 70} look={CHILDREN[0]} light={L} pose={pose({ nearKnee: 10 + jump * 40, farKnee: 10 + jump * 40, nearThigh: jump * 20, farThigh: jump * 20, nearUpper: -20, farUpper: -20, smile: 0.8 })} view="front" grounded={false} />
            </g>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const IfSheDid: React.FC = () => {
  const { t, dur } = useShot();
  // Noon, the street full of people, the house full of people, Lizzie calm in the sitting room.
  const c = cam(t, [[0, 0], [4.6, 0], [dur, -560]], [[0, -640], [4.6, -620], [dur, eye(HOUSE.floor, 250)]], [[0, 0.5], [4.6, 0.52], [dur, 1.5]], EASE.inOut);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.2 }}
      props={{ guestDoorOpen: 0.15, guestHem: 0.5 }}
      people={{
        sitting: (
          <g>
            <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} />
            <Person x={-740} look={LIZZIE} light={L} pose={seated(t, 3, { neck: 2, lids: 0.9 }, 0.3)} facing={1} />
          </g>
        ),
        kitchen: <Person x={1000} look={BRIDGET} light={L} pose={standing(t, 2)} facing={-1} />,
      }}
      yard={
        <Plane d={-6}>
          {TOWNSFOLK.map((l, i) => (
            <Person key={i} x={-3600 + i * 700} look={l} light={LIGHT.noon} pose={standing(t, i + 20, { turn: 0.2 })} facing={i % 2 ? 1 : -1} />
          ))}
        </Plane>
      }
      finish={{ temp: 0.3, vignette: 0.75 }}
    />
  );
};

export const IfSheDidnt: React.FC = () => {
  const { t, dur } = useShot();
  // Her face turns to the camera; the picture darkens.
  const turn = ramp(t, 0.4, 2.0, EASE.inOut);
  const dark = ramp(t, 2.0, dur);
  const c = cam(t, [[0, -740], [dur, -740]], [[0, eye(HOUSE.floor, 300)], [dur, eye(HOUSE.floor, 310)]], [[0, 2.4], [dur, 2.8]]);
  const L = { ...LIGHT.room, amb: lerp(0.24, 0.6, dark) };
  return (
    <AbsoluteFill>
      <SectionScene t={t} cam={c} light={L} people={{ sitting: <Person x={-740} look={LIZZIE} light={L} pose={seated(t, 3, { neck: 2, turn: lerp(0.2, -1, turn) }, 0.3)} facing={1} view={turn > 0.95 ? "front" : "3q"} /> }} finish={{ temp: 0.1, vignette: 0.85 + dark * 0.15 }} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: dark * 0.5 }} />
    </AbsoluteFill>
  );
};

export const SomeoneElse: React.FC = () => {
  const { t, dur } = useShot();
  // The side yard: the side door. 915.6 a silhouette goes in; up 918.4; waits 919.4; down 920.4; out 922; the door swings shut on an empty yard.
  const u = ramp(t, 5.4, 12.6, EASE.linear);
  const pts: [number, number][] = [
    [HOUSE.sideDoor + 600, 0],
    [1250, 0],
    [1250, HOUSE.upper - HOUSE.floor],
    [-1000, HOUSE.upper - HOUSE.floor],
    [-1000, HOUSE.upper - HOUSE.floor],
    [-1030, HOUSE.upper - HOUSE.floor],
    [-1330, 0],
    [-500, 0],
    [1250, 0],
    [HOUSE.sideDoor + 700, 0],
  ];
  const i = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1)));
  const f = u * (pts.length - 1) - i;
  const p = { x: lerp(pts[i][0], pts[i + 1][0], f), y: lerp(pts[i][1], pts[i + 1][1], f) };
  const moving = Math.abs(pts[i + 1][0] - pts[i][0]) > 1 || Math.abs(pts[i + 1][1] - pts[i][1]) > 1;
  const open = ramp(t, 4.6, 5.6, EASE.inOut);
  const c = cam(t, [[0, 1100], [4.6, 1000], [6.0, 200], [dur, 0]], [[0, -480], [4.6, -520], [6.0, -620], [dur, -640]], [[0, 1.0], [4.6, 0.9], [6.0, 0.52], [dur, 0.5]], EASE.inOut);
  const L = LIGHT.room;
  const fig = <Person x={p.x} y={p.y} look={SHADOW} mode="silhouette" silhouette="#08060a" pose={moving ? pose({ lean: 10, nearThigh: 30 + Math.sin(t * 9) * 25, farThigh: 30 - Math.sin(t * 9) * 25, nearKnee: 40, farKnee: 40 }) : idle(pose({}), t, 9, 0.3)} facing={u < 0.5 ? -1 : 1} grounded={false} opacity={u > 0.01 && u < 0.99 ? 1 : 0} />;
  const up = p.y !== 0;
  const inside = u > 0.08 && u < 0.92;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      open={open}
      lamps={{ guest: 0.4 }}
      props={{ guestDoorOpen: 0.6, backDoorOpen: between(t, 4.8, 6.4, 0.3) * 0.7 + between(t, 12.0, 13.6, 0.3) * 0.7 }}
      people={{
        kitchen: inside && !up && p.x > 600 ? fig : null,
        dining: inside && !up && p.x <= 600 && p.x > -150 ? fig : null,
        sitting: (
          <g>
            {inside && !up && p.x <= -150 && p.x > -950 ? fig : null}
            <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} opacity={ramp(t, 9.6, 10.0)} />
          </g>
        ),
        hall: inside && !up && p.x <= -950 ? fig : null,
        backhall: inside && up && p.x > 850 ? fig : null,
        parents: inside && up && p.x <= 850 && p.x > 100 ? fig : null,
        lizzie: inside && up && p.x <= 100 && p.x > -700 ? fig : null,
        guest: inside && up && p.x <= -700 ? fig : null,
      }}
      yard={<Plane d={0}>{!inside ? fig : null}</Plane>}
      finish={{ temp: 0.1, vignette: 0.8 }}
    />
  );
};

export const NeverKnown: React.FC = () => {
  const { t, dur } = useShot();
  // The silhouette walks away down the street and dissolves into the crowd.
  const L = LIGHT.afternoon;
  const w = walker(t, 0, dur + 0.5, 800, -1400, undefined, 9);
  const c = cam(t, [[0, 300], [dur, -600]], [[0, -560], [dur, -560]], [[0, 0.7], [dur, 0.62]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet
          t={t + 700}
          light={L}
          onWalk={
            <g>
              {TOWNSFOLK.map((l, i) => (
                <Person key={i} x={-2600 + i * 600} look={l} light={L} pose={standing(t, i + 20, { turn: 0.2 })} facing={i % 2 ? 1 : -1} />
              ))}
              <Person x={w.x} look={SHADOW} mode="silhouette" silhouette="#2a2a30" pose={w.pose} facing={w.facing} opacity={1 - ramp(t, 1.4, dur - 0.2)} />
            </g>
          }
        />
      </Stage>
      <Finish temp={0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const StillKnow: React.FC = () => {
  const { t, dur } = useShot();
  // The house, framed as in the opening, in a calmer light, the street empty.
  const c = cam(t, [[0, -300], [dur, -60]], [[0, -760], [dur, -620]], [[0, 0.5], [dur, 0.7]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet t={t + 800} light={LIGHT.grey} />
      </Stage>
      <Finish temp={-0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const WhenHow: React.FC = () => {
  const { t, dur } = useShot();
  // 935.9 "when": the clock; 937.6 "how": the hatchet outline; 939.6 "who was in the house": the people lit.
  const b = t < 2.9 ? 0 : t < 4.9 ? 1 : 2;
  const L = LIGHT.room;
  return (
    <AbsoluteFill>
      {b === 0 ? (
        <AbsoluteFill>
          <Stage cam={{ x: 0, y: -60, zoom: 2.2 + t * 0.06 }} t={t} bg="#0c0906">
            <Plane d={0}>
              <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#3a2a22", TABLE)} />
              <Pool x={0} y={-100} rx={900} ry={700} color="#ffd9a0" opacity={0.3} />
              <path d="M-140 60 L140 60 L140 -80 Q140 -200 0 -200 Q-140 -200 -140 -80 Z" fill={lit("#2a1a12", TABLE)} />
              <ClockFace x={0} y={-60} r={110} minutes={lerp(570, 660, ramp(t, 0.2, 2.6))} light={TABLE} />
            </Plane>
          </Stage>
          <Finish temp={0.2} vignette={0.9} />
        </AbsoluteFill>
      ) : b === 1 ? (
        <AbsoluteFill>
          <Stage cam={{ x: 0, y: -60, zoom: 2.4 + (t - 2.9) * 0.1 }} t={t} bg="#0c0906">
            <Plane d={0}>
              <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#3a3a3c", TABLE)} />
              <Pool x={0} y={-100} rx={900} ry={700} color="#ffd9a0" opacity={0.3} />
              <g transform="rotate(75)">
                <Hatchet light={TABLE} s={4.2} handle={0.12} rust={0.3} />
              </g>
            </Plane>
          </Stage>
          <Finish temp={0.2} vignette={0.9} />
        </AbsoluteFill>
      ) : (
        <SectionScene
          t={t}
          cam={{ x: 0, y: -620, zoom: 0.52 }}
          light={L}
          lamps={{ guest: 0.5 }}
          people={{
            sitting: <Person x={-470} y={-96} look={ANDREW_HOME} light={L} pose={idle(pose({ ...LYING, lids: 0.1 }), t, 1, 0.25)} facing={1} grounded={false} />,
            kitchen: <Person x={780} look={LIZZIE} light={L} pose={standing(t, 4)} facing={1} />,
            guest: <Person x={-1060} look={{ ...BRIDGET, top: "#4a3a3e", skirt: "#4a3a3e", pants: "#4a3a3e", apron: undefined, hairColor: "#8a8078", build: "heavy" }} light={L} pose={idle(BENT, t, 2, 0.4)} facing={-1} />,
          }}
          yard={
            <Plane d={-0.6}>
              <Person x={-520} look={BRIDGET} light={LIGHT.noon} pose={washing(t, 2)} facing={-1} />
            </Plane>
          }
          finish={{ temp: 0.2, vignette: 0.75 }}
        />
      )}
      {dur < 0 ? null : null}
    </AbsoluteFill>
  );
};

export const AlmostEverything: React.FC = () => {
  const { t, dur } = useShot();
  // Everything on the table; the camera pulls back.
  const c = cam(t, [[0, 100], [dur, 0]], [[0, -60], [dur, -20]], [[0, 2.2], [dur, 1.3]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a3a2c", TABLE)} />
          <Pool x={0} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
          <Ledger x={-500} y={-60} light={TABLE} rot={-4} lines={12} entries={[{ y: -120, text: "Mrs. A. D. Borden", k: 1 }, { y: -80, text: "guest chamber, floor", k: 1 }, { y: 10, text: "19", k: 1, big: true }, { y: -40, text: "A. J. Borden, sitting room", k: 1 }, { y: 70, text: "10 – 11", k: 1, big: true }]} />
          <NotePad x={220} y={-80} light={TABLE} rot={6} items={[{ text: "9.30 — 11.00", k: 1 }, { text: "Second Street", k: 1 }, { text: "in the house: 3", k: 1 }]} />
          <Photo id="ae" x={620} y={120} w={200} h={250} rot={-3} light={TABLE} tone="#8a7a6a" scene={<Person x={100} y={300} s={0.9} look={LIZZIE} light={LIGHT.sepia} pose={seated(0, 1)} view="front" />} />
          <Deed x={-120} y={220} rot={12} light={TABLE} seed={3} />
          <g transform="translate(300 260) rotate(70)">
            <Hatchet light={TABLE} s={1.6} handle={0.12} rust={0.3} />
          </g>
        </Plane>
        <Plane d={-1.5}>
          <OilLamp x={1000} y={-40} on={1} t={t} light={TABLE} s={1.6} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.9} />
    </AbsoluteFill>
  );
};

export const WhoHeld: React.FC = () => {
  const { t, dur } = useShot();
  // The hatchet head alone under the lamp; a hand's shadow reaches for it and stops.
  const reach = ramp(t, 0.4, 1.6, EASE.inOut) * (1 - ramp(t, dur - 0.5, dur));
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -40], [dur, -30]], [[0, 2.6], [dur, 3.0]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a2a2c", TABLE)} />
          <Pool x={0} y={-200} rx={900} ry={700} color="#ffd9a0" opacity={0.35} />
          <g transform="rotate(75)">
            <Hatchet light={TABLE} s={4.6} handle={0.12} rust={0.3} />
          </g>
          {/* the shadow of a hand, from the lamp side */}
          <g transform={`translate(${lerp(-700, -200, reach)} ${lerp(300, 100, reach)}) rotate(-40) scale(4)`} opacity={0.45 * reach}>
            <path d="M-13 4 Q-15 24 -11 34 L11 34 Q15 22 13 4 Z M-10 31 h5.6 v18 h-5.6 Z M-3.5 31 h5.6 v20 h-5.6 Z M3 31 h5.6 v19 h-5.6 Z M9.5 31 h5.6 v15 h-5.6 Z M13 10 Q24 16 22 30 Q19 34 16 30 Q16 22 11 18 Z M-13 -80 h26 v90 h-26 Z" fill="#000" />
          </g>
          <Glow x={0} y={-100} r={500} color="#ffd9a0" opacity={0.2} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.95} />
    </AbsoluteFill>
  );
};

