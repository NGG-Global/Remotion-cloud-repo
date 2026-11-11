import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import {Pool } from "../../gacy/kit/light";
import { Photo } from "../../gacy/kit/paper";
import { Sky } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import { CHILDREN, CONGREGATION, IMMIGRANT, LIZZIE, MARSHAL, MILL_WORKERS, OFFICER, OFFICER_2, SHADOW, SUNDAY_CHILDREN, TOWNSFOLK } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { BarnLoft, ChurchInterior, Pew } from "../kit/interiors";
import { NotePad, PennyDreadful, Scale } from "../kit/paper";
import { Bottle, Hatchet, HeldDress, HymnBook, Note, Sinkers } from "../kit/props";
import { Church, MainStreet, MillGate } from "../kit/town";
import {EASE, FOLDED, Finish, LIGHT, Person, Plane, SectionScene, Stage, cam, eye, idle, lerp, pose, ramp, seated, speaking, standing, useShot, walker } from "./common";

/**
 * 6:36–7:56. The story closes around Lizzie: who she was in 1892, who
 * the town suspected first, and the trouble with everything she said.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;

export const ClosingIn: React.FC = () => {
  const { t, dur } = useShot();
  // Lizzie seated in the sitting room; the edges darken; faces at the window.
  const dark = ramp(t, 0.5, 3.0);
  const c = cam(t, [[0, -560], [dur, -600]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 240)]], [[0, 1.4], [dur, 1.7]]);
  const L = { ...LIGHT.room, amb: lerp(0.24, 0.45, dark) };
  return (
    <AbsoluteFill>
      <SectionScene
        t={t}
        cam={c}
        light={L}
        people={{
          sitting: (
            <g>
              <Person x={-600} look={LIZZIE} light={L} pose={seated(t, 1, { neck: 6, lids: 0.9 }, 0.3)} facing={1} />
              {/* faces at the window behind her */}
              <g opacity={dark * 0.8}>
                <Person x={-380} y={-180} s={0.7} look={TOWNSFOLK[0]} mode="silhouette" silhouette="#2a2a30" pose={pose({ turn: -1 })} view="front" />
                <Person x={-300} y={-190} s={0.7} look={TOWNSFOLK[1]} mode="silhouette" silhouette="#2a2a30" pose={pose({ turn: -1 })} view="front" />
              </g>
            </g>
          ),
        }}
        finish={{ temp: 0.0, vignette: 0.7 + dark * 0.25 }}
      />
    </AbsoluteFill>
  );
};

export const Impossible: React.FC = () => {
  const { t, dur } = useShot();
  // Townsfolk on Main Street in groups, shaking their heads.
  const L = LIGHT.noon;
  const c = cam(t, [[0, -900], [dur, 500]], [[0, -600], [dur, -580]], [[0, 0.62], [dur, 0.68]]);
  const shake = (seed: number) => Math.sin(t * 3 + seed) * 0.5;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <MainStreet
          t={t + 100}
          light={L}
          onWalk={
            <g>
              <Person x={-1600} look={TOWNSFOLK[0]} light={L} pose={speaking(t, 1, { turn: shake(1) }, 0.6)} facing={1} />
              <Person x={-1380} look={TOWNSFOLK[1]} light={L} pose={idle(pose({ turn: 0.3 + shake(2) * 0.4, brow: -0.3 }), t, 2, 0.6)} facing={-1} />
              <Person x={-200} look={TOWNSFOLK[2]} light={L} pose={idle(pose({ ...FOLDED, turn: shake(3) * 0.5 }), t, 3, 0.6)} facing={1} />
              <Person x={40} look={TOWNSFOLK[3]} light={L} pose={speaking(t, 4, {}, 0.5)} facing={-1} />
              <Person x={1300} look={TOWNSFOLK[4]} light={L} pose={idle(pose({ turn: shake(5) * 0.6 }), t, 5, 0.6)} facing={1} />
              <Person x={1520} look={TOWNSFOLK[5]} light={L} pose={idle(pose({ turn: -0.3 + shake(6) * 0.4 }), t, 6, 0.6)} facing={-1} />
            </g>
          }
        />
      </Stage>
      <Finish temp={0.4} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const ChurchShot: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.noon;
  const c = cam(t, [[0, -200], [dur, 100]], [[0, -900], [dur, -800]], [[0, 0.42], [dur, 0.5]]);
  const out = CONGREGATION.map((look, i) => walker(t, 0.2 + i * 0.4, 5 + i * 0.4, 0, (i % 2 ? 1 : -1) * (900 + i * 300), undefined, i));
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Sky mode="day" t={t} clouds={0.4} stars={false} />
        <GroundStrip near={-30} far={40} color="#7a8a58" farColor="#5a6a48" light={L} />
        <Plane d={0}>
          <Church x={0} light={L} doorOpen={0.9} />
          {out.map((w, i) => (
            <Person key={i} x={w.x} look={CONGREGATION[i]} light={L} pose={w.pose} facing={w.facing} />
          ))}
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const SundaySchool: React.FC = () => {
  const { t, dur } = useShot();
  // Lizzie with children on a pew. 417.1–423.5: the picture freezes into a photograph and a penny-dreadful cover slides in beside it.
  const freeze = ramp(t, 7.8, 8.8, EASE.inOut);
  const cover = ramp(t, 9.4, 10.6, EASE.out);
  const tf = Math.min(t, 7.8);
  const L = LIGHT.room;
  const c = cam(t, [[0, -300], [7.8, -200], [8.8, -200], [dur, -200]], [[0, -420], [7.8, -400], [8.8, -400], [dur, -400]], [[0, 0.95], [7.8, 1.05], [8.8, 0.9], [dur, 0.88]], EASE.inOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - freeze }}>
        <Stage cam={c} t={t}>
          <Plane d={0}>
            <ChurchInterior light={L} t={tf}>
              <Pew x={-700} light={L} />
              <Pew x={600} light={L} />
              <Person x={-300} look={LIZZIE} light={L} pose={speaking(tf, 1, { turn: -0.1, smile: 0.5, neck: 6 }, 0.7)} facing={1} nearHold={<HymnBook light={L} />} />
              {SUNDAY_CHILDREN.map((k, i) => (
                <Person key={i} x={80 + i * 230} look={k} light={L} pose={seated(tf, i + 3, { neck: -8, smile: 0.5 }, 0.5)} facing={-1} />
              ))}
              <Person x={-900} look={CHILDREN[3]} light={L} pose={seated(tf, 9, { neck: -6 }, 0.5)} facing={1} />
            </ChurchInterior>
          </Plane>
        </Stage>
        <Finish temp={0.4} vignette={0.65} />
      </AbsoluteFill>
      {freeze > 0 ? (
        <AbsoluteFill style={{ opacity: freeze }}>
          <Stage cam={{ x: 0, y: -80, zoom: 1.5 }} t={t} bg="#0c0906">
            <Plane d={0}>
              <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a3a2c", TABLE)} />
              <Pool x={0} y={-300} rx={1400} ry={900} color="#ffd9a0" opacity={0.3} />
              <Photo
                id="sunday"
                x={-300 - cover * 120}
                y={-80}
                w={380}
                h={280}
                rot={-3}
                light={TABLE}
                tone="#8a7a6a"
                scene={
                  <g transform="translate(190 260) scale(0.62)">
                    <Person x={-160} look={LIZZIE} light={LIGHT.sepia} pose={pose({ smile: 0.4 })} facing={1} nearHold={<HymnBook />} />
                    {SUNDAY_CHILDREN.map((k, i) => (
                      <Person key={i} x={80 + i * 150} look={k} light={LIGHT.sepia} pose={pose({ ...seated(0, i), smile: 0.4 })} facing={-1} />
                    ))}
                  </g>
                }
              />
              <g transform={`translate(${lerp(1100, 330, cover)} 0) rotate(${lerp(12, 4, cover)})`} opacity={Math.min(1, cover * 2)}>
                <PennyDreadful id="pd" x={0} y={0} light={TABLE} s={0.95}>
                  <g transform="translate(0 180)">
                    <Person x={-30} look={SHADOW} mode="silhouette" silhouette="#3a2418" pose={pose({ lean: 12, nearUpper: 150, nearFore: 20, farUpper: 40, farFore: 60, turn: 0.4 })} facing={1} s={1.05} nearHold={<Hatchet light={LIGHT.sepia} s={1.6} />} />
                    <rect x={-160} y={-80} width={320} height={60} fill="#2a1a10" opacity={0.6} />
                  </g>
                </PennyDreadful>
              </g>
            </Plane>
          </Stage>
          <Finish temp={0.3} vignette={0.85} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Strangers: React.FC = () => {
  const { t, dur } = useShot();
  // At the mill gate: an officer stops a labourer; another questions a man by the fence.
  const L = LIGHT.afternoon;
  const c = cam(t, [[0, -700], [dur, 300]], [[0, -520], [dur, -500]], [[0, 0.9], [dur, 1.05]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Sky mode="dusk" t={t} clouds={0.6} stars={false} />
        <Plane d={6}>
          <MillGate light={L} t={t} />
        </Plane>
        <GroundStrip near={-30} far={6} color="#7a7060" farColor="#5a5048" light={L} />
        <Plane d={0}>
          <Person x={-700} look={OFFICER} light={L} pose={speaking(t, 1, { nearUpper: 60, nearFore: 30 }, 0.7)} facing={1} />
          <Person x={-480} look={IMMIGRANT} light={L} pose={idle(pose({ ...FOLDED, neck: 6, turn: -0.2, brow: -0.4 }), t, 2, 0.6)} facing={-1} />
          <Person x={600} look={OFFICER_2} light={L} pose={idle(pose({ nearUpper: 40, nearFore: 80, neck: 6 }), t, 3, 0.6)} facing={1} />
          <Person x={820} look={MILL_WORKERS[2]} light={L} pose={idle(pose({ nearUpper: 20, nearFore: 60, turn: -0.3 }), t, 4, 0.6)} facing={-1} />
          <Person x={1400} look={MILL_WORKERS[0]} light={L} pose={standing(t, 5, { turn: 0.5 })} facing={-1} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const Questioning: React.FC = () => {
  const { t, dur } = useShot();
  // The Marshal and an officer with a notebook in the sitting room; Lizzie answers.
  const c = cam(t, [[0, -540], [dur, -500]], [[0, eye(HOUSE.floor, 250)], [dur, eye(HOUSE.floor, 250)]], [[0, 1.3], [dur, 1.5]]);
  const L = LIGHT.room;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      people={{
        sitting: (
          <g>
            <Person x={-740} look={LIZZIE} light={L} pose={seated(t, 1, { neck: 4, nearUpper: 34, nearFore: 84 }, 0.4)} facing={1} />
            <Person x={-420} look={MARSHAL} light={L} pose={speaking(t, 2, { turn: -0.1 }, 0.7)} facing={-1} />
            <Person x={-240} look={OFFICER} light={L} pose={idle(pose({ neck: 16, nearUpper: 60, nearFore: 90, farUpper: 54, farFore: 96 }), t, 3, 0.4)} facing={-1} nearHold={<rect x={-16} y={4} width={32} height={40} fill={lit("#ece6d2", L)} />} />
          </g>
        ),
      }}
      finish={{ temp: 0.2, vignette: 0.75 }}
    />
  );
};

export const WhereWasShe: React.FC = () => {
  const { t, dur } = useShot();
  // Her figure jumps from room to room as the story changes: kitchen 437.8, dining 439.6, and between.
  const slot = t < 1.4 ? 0 : t < 2.5 ? 1 : t < 4.3 ? 2 : 3;
  const c = cam(t, [[0, 200], [dur, 100]], [[0, -600], [dur, -620]], [[0, 0.55], [dur, 0.52]]);
  const L = LIGHT.room;
  const fig = (x: number) => <Person x={x} look={LIZZIE} light={L} pose={standing(t, 4, { turn: 0.2 })} facing={1} />;
  return (
    <SectionScene
      t={t}
      cam={c}
      light={L}
      lamps={{ guest: 0.2 }}
      people={{
        kitchen: slot === 0 || slot === 2 ? fig(900) : null,
        dining: slot === 1 ? fig(200) : null,
        lizzie: slot === 3 ? fig(-400) : null,
      }}
      finish={{ temp: 0.2, vignette: 0.75 }}
    />
  );
};

const NotebookInsert: React.FC<{ t: number; items: { text: string; k: number; struck?: number }[]; camX?: number }> = ({ t, items, camX = 0 }) => (
  <AbsoluteFill>
    <Stage cam={{ x: camX, y: -20, zoom: 2.6 }} t={t} bg="#0c0906">
      <Plane d={0}>
        <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#3a3a3c", TABLE)} />
        <Pool x={0} y={-300} rx={1200} ry={900} color="#ffd9a0" opacity={0.3} />
        <NotePad x={0} y={0} light={TABLE} rot={-4} items={items} />
      </Plane>
    </Stage>
    <Finish temp={0.2} vignette={0.9} />
  </AbsoluteFill>
);

export const LastSaw: React.FC = () => {
  const { t } = useShot();
  return (
    <NotebookInsert
      t={t}
      items={[
        { text: "last saw father 10.45", k: ramp(t, 0.2, 1.2), struck: ramp(t, 1.5, 1.9) },
        { text: "last saw father 10.55", k: ramp(t, 1.9, 2.7), struck: ramp(t, 2.9, 3.3) },
        { text: "last saw father  ?", k: ramp(t, 3.3, 3.8) },
      ]}
    />
  );
};

export const BarnAnswers: React.FC = () => {
  const { t, dur } = useShot();
  // 446.6 "what she did in the barn": answers written and struck. 448.8: Lizzie's face.
  const swap = ramp(t, 4.6, 5.3, EASE.inOut);
  const L = LIGHT.room;
  return (
    <AbsoluteFill>
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <NotebookInsert
            t={t}
            camX={0}
            items={[
              { text: "barn — 20 min.", k: ramp(t, 0.3, 1.1), struck: ramp(t, 2.6, 3.0) },
              { text: "barn — 30 min.", k: ramp(t, 1.3, 2.1), struck: ramp(t, 3.2, 3.6) },
              { text: "sinkers / lead", k: ramp(t, 2.2, 3.0), struck: ramp(t, 3.8, 4.2) },
              { text: "ate pears (?)", k: ramp(t, 3.3, 4.2) },
            ]}
          />
        </AbsoluteFill>
      ) : null}
      {swap > 0 ? (
        <AbsoluteFill style={{ opacity: swap }}>
          <SectionScene
            t={t}
            cam={{ x: -740, y: eye(HOUSE.floor, 300), zoom: 2.6 + (t - 4.6) * 0.06 }}
            light={L}
            people={{
              sitting: <Person x={-740} look={LIZZIE} light={L} pose={seated(t, 1, { neck: 2, lids: 0.85, turn: -0.4 }, 0.35)} facing={1} />,
            }}
            finish={{ temp: 0.1, vignette: 0.85 }}
          />
        </AbsoluteFill>
      ) : null}
      {dur < 0 ? null : null}
    </AbsoluteFill>
  );
};

export const PoliceBarn: React.FC = () => {
  const { t, dur } = useShot();
  // An officer kneels in the loft, running a finger through undisturbed dust.
  const c = cam(t, [[0, 300], [dur, 100]], [[0, -380], [dur, -300]], [[0, 0.95], [dur, 1.3]]);
  const L = LIGHT.dim;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a140e">
        <Plane d={0}>
          <BarnLoft light={L} t={t} dust={0.6} bench={<Sinkers x={-60} y={0} light={L} />}>
            <Person x={-200} look={OFFICER} light={L} pose={idle(pose({ hipDrop: 70, lean: 24, nearThigh: 8, nearKnee: 94, farThigh: 78, farKnee: 82, nearUpper: 70 + Math.sin(t * 2) * 6, nearFore: 20, farUpper: 24, farFore: 50, neck: 20 }), t, 1, 0.3)} facing={1} />
            <Person x={500} look={MARSHAL} light={L} pose={idle(pose({ ...FOLDED, neck: 14, turn: 0.2 }), t, 2, 0.5)} facing={-1} />
            {/* a clean, dusty floor: a swept arc where the finger went */}
            <path d={`M-120 -6 Q-60 -40 ${-120 + 120 * ramp(t, 1.5, 4)} -8`} stroke="#8a7a5a" strokeWidth={6} fill="none" opacity={0.6} />
          </BarnLoft>
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const DefenseWitnesses: React.FC = () => {
  const { t, dur } = useShot();
  // The same loft, brighter: two boys climbing in through the hatch, the way the defence's witnesses said they had.
  const a = ramp(t, 0.4, 2.0, EASE.out);
  const b = ramp(t, 1.2, 2.8, EASE.out);
  const c = cam(t, [[0, -400], [dur, -200]], [[0, -380], [dur, -400]], [[0, 1.1], [dur, 1.0]]);
  const L = { ...LIGHT.room, amb: 0.3 };
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a140e">
        <Plane d={0}>
          <BarnLoft light={L} t={t + 50} dust={0.8} windowOpen={0.7} bench={<Sinkers x={-60} y={0} light={L} />}>
            <Person x={-860} y={(1 - a) * 300} look={CHILDREN[1]} light={L} pose={pose({ nearUpper: 100 - a * 60, nearFore: 20, farUpper: 90 - a * 60, farFore: 20, nearKnee: 30 * (1 - a), farKnee: 40 * (1 - a) })} facing={1} grounded={false} opacity={Math.min(1, a * 4)} />
            <Person x={-700} y={(1 - b) * 300} look={CHILDREN[3]} light={L} pose={pose({ nearUpper: 100 - b * 60, nearFore: 20, farUpper: 90 - b * 60, farFore: 20, nearKnee: 30 * (1 - b), farKnee: 40 * (1 - b), smile: 0.6 })} facing={1} grounded={false} opacity={Math.min(1, b * 4)} />
          </BarnLoft>
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const ScaleShot: React.FC = () => {
  const { t, dur } = useShot();
  // 467.1–470.6: evidence on the left pan, each cracking. 471.1–475: explanations on the right, each cracking too.
  const l1 = ramp(t, 3.0, 3.5, EASE.out);
  const l2 = ramp(t, 4.0, 4.5, EASE.out);
  const l3 = ramp(t, 5.0, 5.5, EASE.out);
  const crackL = ramp(t, 5.9, 6.6);
  const r1 = ramp(t, 7.0, 7.5, EASE.out);
  const r2 = ramp(t, 8.2, 8.7, EASE.out);
  const crackR = ramp(t, 9.8, 10.6);
  const tilt = -(l1 + l2 + l3) * 0.3 * (1 - crackL * 0.7) + (r1 + r2) * 0.4 * (1 - crackR * 0.7);
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -260], [dur, -280]], [[0, 1.3], [dur, 1.2]]);
  const crack = (k: number) => (k > 0 ? <path d="M-30 -60 L-10 -30 L-24 0 L4 30 L-6 60" stroke="#1a1510" strokeWidth={4} fill="none" opacity={k} /> : null);
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
              <g>
                <g transform={`translate(-40 ${-(1 - l1) * 300 - 8}) rotate(80)`} opacity={l1}>
                  <Hatchet light={TABLE} s={1.1} handle={0.3} />
                </g>
                <g transform={`translate(30 ${-(1 - l2) * 300 - 60})`} opacity={l2}>
                  <HeldDress light={TABLE} s={0.5} stain={1} />
                </g>
                <g transform={`translate(70 ${-(1 - l3) * 300})`} opacity={l3}>
                  <Bottle x={0} y={0} h={50} light={TABLE} skull />
                </g>
                <g transform="translate(10 -40)">{crack(crackL)}</g>
              </g>
            }
            right={
              <g>
                <g transform={`translate(-40 ${-(1 - r1) * 300 - 10})`} opacity={r1}>
                  <Note light={TABLE} s={1.4} />
                </g>
                <g transform={`translate(50 ${-(1 - r2) * 300})`} opacity={r2}>
                  <Person x={0} y={0} s={0.28} look={SHADOW} mode="silhouette" silhouette="#1a1510" pose={pose({})} />
                </g>
                <g transform="translate(10 -40)">{crack(crackR)}</g>
              </g>
            }
          />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.85} />
    </AbsoluteFill>
  );
};

