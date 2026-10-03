import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import { Glow, Pool } from "../../gacy/kit/light";
import { ABBY, ANDREW_HOME, CHEMIST, JUDGES, JURORS, KNOWLTON, LIZZIE, PHARMACIST, TOWNSFOLK } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { COURT, Courtroom, Drugstore, ExhibitTable, LabBench } from "../kit/interiors";
import { Scale } from "../kit/paper";
import { Bottle } from "../kit/props";
import { MainStreet } from "../kit/town";
import {EASE, Finish, LIGHT, Person, Plane, SectionScene, Stage, between, cam, eye, idle, lerp, pose, ramp, seated, standing, useShot, walker } from "./common";

/**
 * 7:56–8:46. Prussic acid: the most famous detail, and the problem with it.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;
const COURT_L = LIGHT.grey;

export const FamousDetail: React.FC = () => {
  const { t, dur } = useShot();
  // Main Street toward evening; the camera finds the drugstore door.
  const L = LIGHT.afternoon;
  const c = cam(t, [[0, -900], [dur, -1500]], [[0, -640], [dur, -420]], [[0, 0.6], [dur, 1.2]]);
  const w = walker(t, 0, dur + 1, -2400, -1650, undefined, 1);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <MainStreet t={t + 200} light={L} signs={["DRY GOODS", "HARDWARE", "DRUGS", "BANK"]} lamps={0.3} onWalk={<Person x={w.x} look={{ ...LIZZIE, hat: "bonnet" }} light={L} pose={w.pose} facing={w.facing} />} />
      </Stage>
      <Finish temp={0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const DrugstoreShot: React.FC = () => {
  const { t, dur } = useShot();
  // A woman in a dark dress at the counter, seen from behind. 485.9 "hydrogen cyanide": the bottle glints.
  const glint = between(t, 6.3, dur + 1, 0.4);
  const c = cam(t, [[0, -600], [6.3, -100], [dur, 250]], [[0, -330], [6.3, -360], [dur, -520]], [[0, 1.25], [6.3, 1.1], [dur, 1.5]], EASE.inOut);
  const L = LIGHT.room;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a140e">
        <Plane d={0}>
          <Drugstore light={L} t={t} poisonGlint={glint}>
            <Person x={-200} look={{ ...LIZZIE, hat: "bonnet" }} light={L} pose={idle(pose({ nearUpper: lerp(20, 110, between(t, 5.0, 8.0, 0.6)), nearFore: 20 }), t, 1, 0.5)} view="back" />
            <Person x={120} look={PHARMACIST} light={L} pose={idle(pose({ neck: 6, nearUpper: 30, nearFore: 70 }), t, 2, 0.5)} facing={-1} />
          </Drugstore>
        </Plane>
        <Plane d={-1.5}>
          <Person x={-900} look={TOWNSFOLK[4]} light={L} pose={standing(t, 6, { turn: 0.4 })} facing={1} opacity={0.9} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const Refused: React.FC = () => {
  const { t, dur } = useShot();
  // The pharmacist shakes his head; his hand goes flat on the counter.
  const shake = Math.sin(t * 5) * (1 - ramp(t, 1.8, 2.4)) * 0.5;
  const c = cam(t, [[0, 60], [dur, 100]], [[0, -330], [dur, -320]], [[0, 1.8], [dur, 2.0]]);
  const L = LIGHT.room;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a140e">
        <Plane d={0}>
          <Drugstore light={L} t={t}>
            <Person x={-200} look={{ ...LIZZIE, hat: "bonnet" }} light={L} pose={idle(pose({}), t, 1, 0.4)} view="back" />
            <Person x={120} look={PHARMACIST} light={L} pose={idle(pose({ turn: -0.2 + shake, neck: 2, nearUpper: 40, nearFore: 60, brow: -0.3 }), t, 2, 0.5)} facing={-1} />
          </Drugstore>
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const SoundsBad: React.FC = () => {
  const { t, dur } = useShot();
  // The sick household again, with a bottle's shadow growing on the wall.
  const shadow = ramp(t, 2.0, 5.5, EASE.inOut);
  const c = cam(t, [[0, 520], [dur, 500]], [[0, eye(HOUSE.upper, 250)], [dur, eye(HOUSE.upper, 240)]], [[0, 1.5], [dur, 1.7]]);
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
            <g transform={`translate(560 -180) scale(${1 + shadow * 6})`} opacity={shadow * 0.45}>
              <path d="M-14 0 L14 0 L14 -46 Q14 -54 6 -56 L6 -66 L-6 -66 L-6 -56 Q-14 -54 -14 -46 Z" fill="#000" />
            </g>
          </g>
        ),
      }}
      finish={{ temp: 0.1, vignette: 0.85 }}
    />
  );
};

export const ButProblem: React.FC = () => {
  const { t, dur } = useShot();
  // The courtroom: the bottle on the exhibit table; a judge shakes his head; the clerk carries it out.
  const carry = walker(t, 3.6, dur + 0.4, COURT.witness - 500, 3200, undefined, 5);
  const c = cam(t, [[0, 500], [3.6, 400], [dur, 1200]], [[0, -400], [dur, -380]], [[0, 0.75], [dur, 0.7]]);
  const shake = Math.sin(t * 4) * between(t, 1.6, 3.2, 0.3) * 0.4;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JUDGES.map((j, i) => (
              <Person key={i} x={-600 + i * 600} y={COURT.benchTop - 20} look={j} light={COURT_L} pose={seated(t, i + 20, { neck: 4, turn: i === 1 ? -0.3 + shake : 0 }, 0.3)} facing={-1} view={i === 1 ? "front" : "3q"} grounded={false} />
            ))}
            {JURORS.slice(0, 8).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2 }, 0.4)} facing={-1} />
            ))}
            <ExhibitTable x={COURT.witness - 500} light={COURT_L}>
              <g opacity={1 - ramp(t, 3.6, 4.0)}>
                <Bottle x={0} y={0} h={70} light={COURT_L} skull />
              </g>
            </ExhibitTable>
            <Person x={COURT.prosecution} look={KNOWLTON} light={COURT_L} pose={idle(pose({ nearUpper: 30, nearFore: 60, brow: -0.4, turn: -0.2 }), t, 30, 0.5)} facing={1} />
            <Person x={carry.x} look={TOWNSFOLK[0]} light={COURT_L} pose={t < 3.6 ? standing(t, 5) : { ...carry.pose, nearUpper: 40, nearFore: 80 }} facing={carry.facing} opacity={ramp(t, 3.2, 3.6)} nearHold={t >= 4.0 ? <Bottle x={0} y={30} h={60} light={COURT_L} skull /> : undefined} />
            <Person x={COURT.defense + 120} look={LIZZIE} light={COURT_L} pose={seated(t, 31, { neck: 2 }, 0.3)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const NoPoison: React.FC = () => {
  const { t, dur } = useShot();
  // The chemist's bench: a test, a page with nothing on it.
  const c = cam(t, [[0, -400], [dur, 300]], [[0, -320], [dur, -300]], [[0, 1.1], [dur, 1.35]]);
  const L = { ...LIGHT.room, key: "#f0f4f8" };
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a1a18">
        <Plane d={0}>
          <LabBench light={L} t={t}>
            <Person x={-300} look={CHEMIST} light={L} pose={idle(pose({ lean: 14, neck: 16, nearUpper: 60 + Math.sin(t * 1.8) * 6, nearFore: 60, farUpper: 50, farFore: 70 }), t, 1, 0.4)} facing={1} />
            {/* the result sheet: blank lines, then a single dash */}
            <rect x={600} y={-230} width={160} height={200} fill={lit("#f0ead8", L)} transform="rotate(-6 680 -130)" />
            <rect x={620} y={-140} width={60 * ramp(t, 4.6, 5.2)} height={4} fill={lit("#2a2a48", L)} />
          </LabBench>
        </Plane>
        <Plane d={-1.4}>
          <CloseHand x={700} y={-500 + ramp(t, 3.8, 4.6) * 120} angle={-24} light={L} sleeve="#e6e2d8" s={1.5} curl={0.6} />
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const NoVictims: React.FC = () => {
  const { t, dur } = useShot();
  // The scale: the bottle on one pan; the other pan empty. It sits level.
  const drop = ramp(t, 0.6, 1.2, EASE.out);
  const tilt = -drop * 0.35 + ramp(t, 4.6, 6.0, EASE.inOut) * 0.35;
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -260], [dur, -280]], [[0, 1.3], [dur, 1.25]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a3a2c", TABLE)} />
          <rect x={-3000} y={0} width={6000} height={2000} fill={lit("#1a2a1e", TABLE)} />
          <Pool x={0} y={-400} rx={1400} ry={900} color="#ffd9a0" opacity={0.3} />
          <Scale
            x={0}
            tilt={tilt}
            light={TABLE}
            s={1.4}
            left={
              <g transform={`translate(0 ${-(1 - drop) * 300})`} opacity={drop}>
                <Bottle x={0} y={0} h={60} light={TABLE} skull />
              </g>
            }
            right={<g />}
          />
          {/* the empty pan is what the picture holds on */}
          <Glow x={360} y={-160} r={200} color="#ffe0b0" opacity={0.25 * ramp(t, 5.4, 6.2)} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.85} />
    </AbsoluteFill>
  );
};

