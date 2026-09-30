import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { Glow } from "../../gacy/kit/light";
import { Sky } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import { DR_BOWEN, EMMA, JENNINGS, JUDGES, JURORS, KNOWLTON, LIZZIE, LIZZIE_BLACK, PALE_MAN, REPORTER, ROBINSON, SHADOW, TOWNSFOLK } from "../rig/cast";
import { COURT, Courtroom, ExhibitTable, PaperWall } from "../kit/interiors";
import { FrontPage, NotePad, Deed } from "../kit/paper";

import { Courthouse1893, SecondStreet } from "../kit/town";
import { EASE, FOLDED, Finish, LIGHT, Person, Plane, Stage, between, cam, hash, idle, lerp, pose, ramp, seated, speaking, standing, useShot, walker } from "./common";

/**
 * 11:38–12:48. New Bedford, June 1893. The circus, the case, the list of
 * what was missing, a pale young man, reasonable doubt, and the verdict.
 */

const COURT_L = LIGHT.grey;
const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;

export const TrialOpens: React.FC = () => {
  const { t, dur } = useShot();
  const L = LIGHT.grey;
  const c = cam(t, [[0, -600], [dur, 200]], [[0, -900], [dur, -700]], [[0, 0.36], [dur, 0.5]]);
  const crowd = [...TOWNSFOLK, REPORTER, REPORTER, ...TOWNSFOLK];
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Sky mode="overcast" t={t} clouds={0.8} stars={false} />
        <GroundStrip near={-30} far={40} color="#a8a49a" farColor="#8a867c" light={L} />
        <Plane d={2}>
          <Courthouse1893 x={0} light={L} />
        </Plane>
        <Plane d={-2}>
          {crowd.map((l, i) => (
            <Person key={i} x={-2600 + i * 400 + hash(i) * 120} look={l} light={L} pose={standing(t, i, { turn: 0.5 })} facing={i < 7 ? 1 : -1} />
          ))}
          {/* reporters with notebooks at the steps */}
          <Person x={-500} look={REPORTER} light={L} pose={idle(pose({ neck: 16, nearUpper: 60, nearFore: 90 }), t, 40, 0.5)} facing={1} />
          <Person x={520} look={REPORTER} light={L} pose={idle(pose({ neck: 16, nearUpper: 60, nearFore: 90 }), t, 41, 0.5)} facing={-1} />
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const Papers: React.FC = () => {
  const { t, dur } = useShot();
  // A wall of front pages with sketches of Lizzie.
  const c = cam(t, [[0, -600], [dur, 500]], [[0, -700], [dur, -640]], [[0, 0.9], [dur, 0.75]]);
  const pages = Array.from({ length: 12 }, (_, i) => ({ x: -2000 + (i % 6) * 760 + hash(i) * 80, y: -1500 + Math.floor(i / 6) * 720 + hash(i + 9) * 60, rot: (hash(i * 3) - 0.5) * 8, at: i * 0.12 }));
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#12100c">
        <Plane d={0}>
          <PaperWall light={TABLE}>
            {pages.map((p, i) => (
              <g key={i} opacity={ramp(t, p.at, p.at + 0.3)}>
                <FrontPage
                  id={`w${i}`}
                  x={p.x}
                  y={p.y}
                  w={420}
                  h={600}
                  rot={p.rot}
                  light={TABLE}
                  masthead={["THE GLOBE", "NEW YORK HERALD", "THE WORLD", "BOSTON POST", "THE SUN", "DAILY NEWS"][i % 6]}
                  headline={["LIZZIE\nBORDEN", "THE TRIAL\nOPENS", "GUILTY OR\nNOT?", "FALL RIVER\nMYSTERY", "MISS BORDEN\nIN COURT", "THE HATCHET"][i % 6]}
                  seed={i * 7}
                  sketch={<Person x={80} y={200} s={0.7} look={i % 2 ? LIZZIE_BLACK : LIZZIE} light={LIGHT.sepia} mode="sketch" pose={pose({ turn: -0.3 })} view="front" />}
                />
              </g>
            ))}
          </PaperWall>
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const Prosecution: React.FC = () => {
  const { t, dur } = useShot();
  // Knowlton before the jury; on the exhibit table, one thing per point: the notebook 707.3, the deed 709.2, a burned scrap 710.8, a locked door (a key) 713.7.
  const k1 = ramp(t, 1.2, 1.7, EASE.out);
  const k2 = ramp(t, 3.1, 3.6, EASE.out);
  const k3 = ramp(t, 4.7, 5.2, EASE.out);
  const k4 = ramp(t, 7.6, 8.1, EASE.out);
  const c = cam(t, [[0, COURT.jury - 900], [dur, COURT.witness - 400]], [[0, -380], [dur, -330]], [[0, 0.9], [dur, 1.25]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JURORS.slice(0, 8).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2 }, 0.4)} facing={-1} />
            ))}
            <ExhibitTable x={COURT.witness - 400} light={COURT_L} w={900}>
              <g transform={`translate(-330 ${-(1 - k1) * 200 - 2}) scale(0.45)`} opacity={k1}>
                <NotePad x={0} y={-150} light={COURT_L} items={[{ text: "10.45 / 10.55 ?", k: 1, struck: 1 }]} />
              </g>
              <g transform={`translate(-110 ${-(1 - k2) * 200 - 2}) scale(0.4)`} opacity={k2}>
                <Deed x={0} y={-170} light={COURT_L} />
              </g>
              <g transform={`translate(100 ${-(1 - k3) * 200})`} opacity={k3}>
                <path d="M-40 0 Q-30 -60 0 -70 Q30 -60 40 0 Z" fill={lit("#2a2018", COURT_L)} />
                <path d="M-20 0 Q-10 -30 10 -36 Q20 -30 24 0 Z" fill={lit("#5a4a3a", COURT_L)} />
              </g>
              <g transform={`translate(300 ${-(1 - k4) * 200})`} opacity={k4}>
                <rect x={-12} y={-40} width={24} height={14} rx={4} fill={lit("#8a8a8a", COURT_L)} />
                <rect x={-4} y={-30} width={8} height={30} fill={lit("#8a8a8a", COURT_L)} />
                <rect x={-14} y={-8} width={28} height={8} fill={lit("#8a8a8a", COURT_L)} />
              </g>
            </ExhibitTable>
            <Person x={COURT.jury - 1250} look={KNOWLTON} light={COURT_L} pose={speaking(t, 30, { turn: -0.1 }, 0.9)} facing={1} />
            <Person x={COURT.defense + 120} look={LIZZIE} light={COURT_L} pose={seated(t, 31, { neck: 2 }, 0.3)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const Defense: React.FC = () => {
  const { t, dur } = useShot();
  // Robinson rises, walks to the jury, opens his hands: nothing in them.
  const w = walker(t, 0.8, 3.6, COURT.defense - 200, COURT.jury - 1250, undefined, 2);
  const open = between(t, 4.4, dur + 1, 0.6);
  const c = cam(t, [[0, COURT.defense], [dur, COURT.jury - 1000]], [[0, -380], [dur, -360]], [[0, 0.95], [dur, 1.15]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JURORS.slice(0, 8).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2 }, 0.4)} facing={-1} />
            ))}
            <Person x={w.x} look={ROBINSON} light={COURT_L} pose={t < 3.6 ? w.pose : idle(pose({ nearUpper: lerp(20, 50, open), nearFore: lerp(60, 100, open), farUpper: lerp(16, 46, open), farFore: lerp(64, 104, open), neck: 4 }), t, 2, 0.5)} facing={1} />
            <Person x={COURT.defense + 120} look={LIZZIE} light={COURT_L} pose={seated(t, 31, { neck: 2 }, 0.3)} facing={1} />
            <Person x={COURT.defense - 400} look={JENNINGS} light={COURT_L} pose={seated(t, 32, { neck: 6 }, 0.3)} facing={1} />
            <Person x={COURT.prosecution} look={KNOWLTON} light={COURT_L} pose={seated(t, 30, { ...FOLDED, neck: 4 }, 0.3)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const WhatIsMissing: React.FC = () => {
  const { t, dur } = useShot();
  // Four empty stands in a row; a hollow outline appears on each "no": witness 723.2, weapon 724.5, dress 726.2, motive 728.1.
  const ks = [ramp(t, 0.1, 0.6), ramp(t, 1.4, 1.9), ramp(t, 3.0, 3.5), ramp(t, 4.9, 5.4)];
  const c = cam(t, [[0, -300], [dur, 300]], [[0, -280], [dur, -280]], [[0, 1.2], [dur, 1.1]]);
  const stroke = lit("#c8c0b0", COURT_L);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#1a1612">
        <Plane d={0}>
          <rect x={-4000} y={-1800} width={8000} height={1800} fill={lit("#5a3a28", COURT_L)} />
          <rect x={-4000} y={0} width={8000} height={900} fill={lit("#5a4a38", COURT_L)} />
          {[-900, -300, 300, 900].map((x, i) => (
            <g key={i} transform={`translate(${x} 0)`}>
              <rect x={-120} y={-220} width={240} height={220} fill={lit("#4a3020", COURT_L)} />
              <rect x={-130} y={-232} width={260} height={16} fill={lit("#8a6a48", COURT_L)} />
              <g opacity={ks[i]} transform="translate(0 -232)" fill="none" stroke={stroke} strokeWidth={3} strokeDasharray="8 8">
                {i === 0 ? <Person x={0} y={0} s={0.55} look={SHADOW} mode="silhouette" silhouette="none" pose={pose({})} /> : null}
                {i === 0 ? <path d="M-40 0 L-40 -200 L40 -200 L40 0" /> : null}
                {i === 1 ? <g transform="rotate(80)"><path d="M-6 -4 L8 -4 L8 12 L-6 12 Z M8 -10 L30 -14 Q36 0 30 16 L8 14 Z M-4 0 L4 0 L5 64 L-5 64 Z" transform="scale(2.2)" /></g> : null}
                {i === 2 ? <path d="M-18 6 L18 6 L24 60 L40 150 L-40 150 L-24 60 Z" transform="translate(0 -160)" /> : null}
                {i === 3 ? <g><circle cx={0} cy={-90} r={60} /><path d="M-20 -110 Q0 -70 20 -110 M0 -90 L0 -30" /></g> : null}
              </g>
            </g>
          ))}
          <Glow x={0} y={-500} r={1800} color="#fff0d0" opacity={0.12} />
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const SuspiciousMen: React.FC = () => {
  const { t, dur } = useShot();
  // A witness on the stand, pointing; through the window behind, a street with strangers.
  const c = cam(t, [[0, COURT.witness - 300], [dur, COURT.witness]], [[0, -400], [dur, -420]], [[0, 1.0], [dur, 1.2]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            <Person x={COURT.witness} y={-380} look={TOWNSFOLK[2]} light={COURT_L} pose={speaking(t, 5, { nearUpper: 100 + Math.sin(t * 1.5) * 10, nearFore: 10, turn: -0.2 }, 0.8)} facing={-1} grounded={false} />
            {JURORS.slice(0, 4).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2 }, 0.4)} facing={-1} />
            ))}
            <Person x={COURT.prosecution + 300} look={ROBINSON} light={COURT_L} pose={idle(pose({ ...FOLDED }), t, 2, 0.5)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const PaleMan: React.FC = () => {
  const { t, dur } = useShot();
  // Second Street, that morning: a pale young man by the fence, pacing, looking at the house.
  const L = LIGHT.morning;
  const pace = walker(t, 0.4, 3.2, -900, -500, undefined, 3);
  const back = walker(t, 3.6, 6.4, -500, -800, undefined, 3);
  const w = t < 3.6 ? pace : back;
  const c = cam(t, [[0, -300], [dur, -600]], [[0, -520], [dur, -480]], [[0, 0.8], [dur, 1.1]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet t={t + 200} light={L} onWalk={<Person x={w.x} look={PALE_MAN} light={L} pose={w.pose.nearThigh !== 1 ? w.pose : idle(pose({ turn: 0.6, neck: -4 }), t, 3, 0.7)} facing={w.facing} />} />
        <Plane d={-9}>
          <Person x={-2000} look={DR_BOWEN} light={L} pose={standing(t, 8, { turn: 0.4 })} facing={1} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const WasItHim: React.FC = () => {
  const { t, dur } = useShot();
  // He turns to the camera; his face goes to a blank silhouette; he walks off and is gone.
  const turn = ramp(t, 0.4, 1.4, EASE.inOut);
  const blank = ramp(t, 1.8, 2.8);
  const w = walker(t, 3.2, dur + 0.5, -700, -2400, undefined, 3);
  const L = LIGHT.morning;
  const c = cam(t, [[0, -700], [3.2, -700], [dur, -1200]], [[0, -400], [dur, -480]], [[0, 1.7], [3.2, 1.7], [dur, 1.1]], EASE.inOut);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet
          t={t + 210}
          light={L}
          onWalk={
            <g>
              <Person x={t < 3.2 ? -700 : w.x} look={PALE_MAN} light={L} pose={t < 3.2 ? idle(pose({ turn: lerp(0.6, -1, turn) }), t, 3, 0.5) : w.pose} facing={t < 3.2 ? 1 : w.facing} opacity={1 - blank} view={turn > 0.9 && t < 3.2 ? "front" : "3q"} />
              <Person x={t < 3.2 ? -700 : w.x} look={SHADOW} mode="silhouette" silhouette="#2a2a30" pose={t < 3.2 ? idle(pose({ turn: -1 }), t, 3, 0.5) : w.pose} facing={t < 3.2 ? 1 : w.facing} opacity={blank * (1 - ramp(t, dur - 1.2, dur))} view={t < 3.2 ? "front" : "3q"} />
            </g>
          }
        />
      </Stage>
      <Finish temp={0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const ReasonableDoubt: React.FC = () => {
  const { t, dur } = useShot();
  // The jurors' faces; brows lift and heads tilt as doubt goes along the row.
  const c = cam(t, [[0, COURT.jury - 700], [dur, COURT.jury + 300]], [[0, -330], [dur, -330]], [[0, 1.5], [dur, 1.5]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JURORS.slice(0, 8).map((j, i) => {
              const d = between(t, 1.0 + i * 0.55, dur + 1, 0.5);
              return <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2 - d * 0.3, neck: d * 6, brow: d * 0.6 }, 0.4)} facing={-1} />;
            })}
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const Verdict: React.FC = () => {
  const { t, dur } = useShot();
  // The foreman stands and reads; Lizzie stands; at 759.5 "not guilty" she sinks back.
  const stand = ramp(t, 0.6, 1.4, EASE.out);
  const lizStand = ramp(t, 1.8, 2.6, EASE.out);
  const sink = ramp(t, 5.5, 6.3, EASE.in);
  const c = cam(t, [[0, COURT.jury - 600], [2.0, COURT.jury - 600], [3.2, COURT.defense + 200], [dur, COURT.defense + 100]], [[0, -360], [dur, -320]], [[0, 1.1], [2.0, 1.1], [3.2, 1.5], [dur, 1.7]], EASE.inOut);
  const lizK = lizStand * (1 - sink);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JUDGES.map((j, i) => (
              <Person key={i} x={-600 + i * 600} y={COURT.benchTop - 20} look={j} light={COURT_L} pose={seated(t, i + 20, { neck: 4 }, 0.3)} facing={-1} view={i === 1 ? "front" : "3q"} grounded={false} />
            ))}
            {JURORS.slice(0, 8).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={i === 0 ? idle(pose({ hipDrop: 84 * (1 - stand), nearThigh: 86 * (1 - stand), nearKnee: 88 * (1 - stand), farThigh: 82 * (1 - stand), farKnee: 84 * (1 - stand), nearUpper: 40, nearFore: 90, neck: 8 }), t, 50, 0.3) : seated(t, i, { turn: 0.2 }, 0.4)} facing={-1} grounded={i === 0 ? stand > 0.98 : true} />
            ))}
            <Person x={COURT.defense + 120} look={LIZZIE} light={COURT_L} pose={idle(pose({ hipDrop: 84 * (1 - lizK), nearThigh: 86 * (1 - lizK), nearKnee: 88 * (1 - lizK), farThigh: 82 * (1 - lizK), farKnee: 84 * (1 - lizK), nearUpper: 30, nearFore: 70, farUpper: 28, farFore: 74, neck: sink * 14, lids: 1 - sink * 0.6 }), t, 31, 0.3)} facing={1} grounded={false} />
            <Person x={COURT.defense - 200} look={ROBINSON} light={COURT_L} pose={seated(t, 32, { neck: 4 }, 0.3)} facing={1} />
            <Person x={COURT.defense - 480} look={EMMA} light={COURT_L} pose={seated(t, 33, { neck: 4, nearUpper: 40, nearFore: 90 }, 0.3)} facing={1} />
            <Person x={COURT.prosecution} look={KNOWLTON} light={COURT_L} pose={seated(t, 30, { neck: 4 }, 0.3)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const Free: React.FC = () => {
  const { t, dur } = useShot();
  // The courthouse steps: Lizzie comes out; the crowd parts but stares. The picture stays on the staring crowd.
  const L = LIGHT.grey;
  const w = walker(t, 0.6, 4.0, 0, -900, undefined, 1);
  const c = cam(t, [[0, 0], [4.0, -600], [dur, -1400]], [[0, -600], [dur, -520]], [[0, 0.7], [4.0, 0.85], [dur, 1.1]], EASE.inOut);
  const crowd = [...TOWNSFOLK, REPORTER, ...TOWNSFOLK.slice(0, 3), REPORTER];
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Sky mode="overcast" t={t} clouds={0.8} stars={false} />
        <GroundStrip near={-30} far={40} color="#a8a49a" farColor="#8a867c" light={L} />
        <Plane d={2}>
          <Courthouse1893 x={0} light={L} />
        </Plane>
        <Plane d={-1}>
          <Person x={w.x} look={LIZZIE_BLACK} light={L} pose={w.pose} facing={w.facing} />
          <Person x={w.x + 180} look={EMMA} light={L} pose={walker(t, 0.6, 4.0, 180, -720, undefined, 2).pose} facing={-1} />
        </Plane>
        <Plane d={-3}>
          {crowd.map((l, i) => {
            const side = i % 2 ? 1 : -1;
            const x = side * (400 + Math.floor(i / 2) * 320) - 1200;
            return <Person key={i} x={x} look={l} light={L} pose={standing(t, i + 5, { turn: x < w.x ? 0.7 : 0.7 })} facing={x < w.x ? 1 : -1} />;
          })}
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.7} />
    </AbsoluteFill>
  );
};

