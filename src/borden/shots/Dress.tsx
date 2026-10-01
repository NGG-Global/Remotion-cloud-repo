import React from "react";
import { Glow } from "../../gacy/kit/light";
import { ALICE, LIZZIE } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { HeldDress } from "../kit/props";
import {EASE, HOLD_FRONT, LIGHT, Person, SectionScene, between, cam, eye, idle, lerp, pose, ramp, speaking, standing, useShot, walker } from "./common";

/**
 * 9:30–10:05. The dress.
 */

export const HarderToIgnore: React.FC = () => {
  const { t, dur } = useShot();
  // The kitchen in the morning; Alice comes in from the dining room at 576.
  const w = walker(t, 6.2, 8.6, 560, 780, undefined, 2);
  const c = cam(t, [[0, 700], [dur, 850]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.3], [dur, 1.45]]);
  const L = LIGHT.morning;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ fire: 0.4 }}
      people={{
        kitchen: (
          <g>
            <Person x={950} look={LIZZIE} light={L} pose={idle(pose({ ...HOLD_FRONT, turn: 0.3 }), t, 1, 0.5)} facing={-1} opacity={ramp(t, 3.0, 4.0)} />
            <Person x={w.x} look={ALICE} light={L} pose={t < 6.2 ? standing(t, 2) : w.pose} facing={1} opacity={ramp(t, 6.0, 6.4)} />
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.75 }}
    />
  );
};

export const AtTheStove: React.FC = () => {
  const { t, dur } = useShot();
  // Alice's view: Lizzie at the stove, her back to us.
  const c = cam(t, [[0, 900], [dur, 940]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.5], [dur, 1.7]]);
  const L = LIGHT.morning;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ fire: 0.5 }}
      people={{
        kitchen: (
          <g>
            <Person x={950} look={LIZZIE} light={L} pose={idle(HOLD_FRONT, t, 1, 0.5)} view="back" />
            <Person x={600} look={ALICE} light={L} pose={standing(t, 2, { turn: 0.2 })} facing={1} />
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.8 }}
    />
  );
};

export const HoldsDress: React.FC = () => {
  const { t, dur } = useShot();
  // Close: the dress in her hands, a stain on it.
  const c = cam(t, [[0, 930], [dur, 920]], [[0, eye(HOUSE.floor, 200)], [dur, eye(HOUSE.floor, 190)]], [[0, 2.4], [dur, 2.8]]);
  const L = LIGHT.morning;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ fire: 0.5 }}
      people={{
        kitchen: (
          <g>
            <Person x={950} look={LIZZIE} light={L} pose={idle(pose({ ...HOLD_FRONT, turn: 0.3, neck: 14 }), t, 1, 0.4)} facing={-1} nearHold={<HeldDress light={L} stain={1} s={0.65} />} />
          </g>
        ),
      }}
      finish={{ temp: 0.3, vignette: 0.85 }}
    />
  );
};

export const Burns: React.FC = () => {
  const { t, dur } = useShot();
  // The dress into the fire door; the flames take it.
  const push = ramp(t, 0.1, 0.9, EASE.inOut);
  const fire = 0.5 + ramp(t, 0.6, 1.4) * 0.5;
  const c = cam(t, [[0, 860], [dur, 820]], [[0, eye(HOUSE.floor, 180)], [dur, eye(HOUSE.floor, 160)]], [[0, 2.0], [dur, 2.3]]);
  const L = LIGHT.morning;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ fire }}
      people={{
        kitchen: (
          <g>
            <Person x={950} look={LIZZIE} light={L} pose={idle(pose({ lean: 10 + push * 14, neck: 14, nearUpper: lerp(44, 80, push), nearFore: lerp(74, 40, push), farUpper: lerp(40, 76, push), farFore: lerp(78, 44, push) }), t, 1, 0.3)} facing={-1} nearHold={<g opacity={1 - ramp(t, 0.8, 1.3)}><HeldDress light={L} stain={1} s={0.65} /></g>} />
            <Glow x={780} y={-140} r={500} color="#ff9a40" opacity={0.35 * fire} />
          </g>
        ),
      }}
      finish={{ temp: 0.5, vignette: 0.85 }}
    />
  );
};

export const Why: React.FC = () => {
  const { t, dur } = useShot();
  // Two-shot: Alice asks; Lizzie shrugs, points at the paint smear on a fragment.
  const ask = between(t, 0.2, 1.6, 0.3);
  const shrug = between(t, 1.7, 3.5, 0.4);
  const point = between(t, 3.4, dur, 0.4);
  const c = cam(t, [[0, 820], [dur, 860]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 240)]], [[0, 1.5], [dur, 1.7]]);
  const L = LIGHT.morning;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ fire: 0.9 }}
      people={{
        kitchen: (
          <g>
            <Person x={660} look={ALICE} light={L} pose={speaking(t, 2, { turn: -0.1, brow: -0.3 }, ask)} facing={1} />
            <Person x={960} look={LIZZIE} light={L} pose={idle(pose({ turn: -0.2, nearUpper: lerp(20, 60, shrug) + point * 30, nearFore: lerp(60, 90, shrug) - point * 60, farUpper: lerp(10, 50, shrug), farFore: lerp(60, 90, shrug), smile: 0.2, neck: shrug * 4 }), t, 1, 0.5)} facing={-1} nearHold={point > 0.2 ? <g opacity={point}><HeldDress light={L} stain={1} s={0.5} /></g> : undefined} />
          </g>
        ),
      }}
      finish={{ temp: 0.4, vignette: 0.8 }}
    />
  );
};

export const OfCourse: React.FC = () => {
  const { t, dur } = useShot();
  // The stove door glowing. Hold.
  const c = cam(t, [[0, 790], [dur, 780]], [[0, eye(HOUSE.floor, 150)], [dur, eye(HOUSE.floor, 140)]], [[0, 2.4], [dur, 2.7]]);
  const L = LIGHT.morning;
  return <SectionScene t={t} cam={c} light={L} props={{ fire: 1 }} finish={{ temp: 0.6, vignette: 0.9 }} />;
};

export const NotIdeal: React.FC = () => {
  const { t, dur } = useShot();
  // The kitchen wide: the calendar with the week, the stove smoking, Alice's face.
  const c = cam(t, [[0, 900], [4.0, 1000], [dur, 640]], [[0, eye(HOUSE.floor, 260)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.2], [4.0, 1.3], [dur, 1.7]], EASE.inOut);
  const L = LIGHT.morning;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      props={{ fire: 0.8, calendarRing: ramp(t, 1.4, 2.4) }}
      people={{
        kitchen: (
          <g>
            <Person x={660} look={ALICE} light={L} pose={idle(pose({ turn: -0.1, brow: -0.5, lids: 0.9, nearUpper: 12, nearFore: 118, farUpper: 6, farFore: 122 }), t, 2, 0.5)} facing={1} />
            <Person x={960} look={LIZZIE} light={L} pose={idle(pose({ turn: 0.4 }), t, 1, 0.4)} facing={-1} />
            {/* smoke from the stove */}
            {Array.from({ length: 6 }, (_, i) => (
              <ellipse key={i} cx={660 + Math.sin(t * 0.7 + i) * 30} cy={-600 - ((t * 60 + i * 90) % 500)} rx={30 + ((t * 60 + i * 90) % 500) * 0.1} ry={18} fill="#8a8078" opacity={0.25 - ((t * 60 + i * 90) % 500) * 0.0004} />
            ))}
          </g>
        ),
      }}
      finish={{ temp: 0.4, vignette: 0.8 }}
    />
  );
};

