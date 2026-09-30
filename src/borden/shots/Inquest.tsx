import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import { Glow, Pool } from "../../gacy/kit/light";
import { Lines } from "../../gacy/kit/paper";
import { DR_BOWEN, JENNINGS, JUDGES, JURORS, KNOWLTON, LIZZIE, STENOGRAPHER } from "../rig/cast";
import { HOUSE } from "../kit/house";
import { COURT, Corridor, Courtroom, InquestRoom } from "../kit/interiors";
import { Bottle } from "../kit/props";
import { TYPE } from "../theme";
import {EASE, Finish, LIGHT, Person, Plane, SectionScene, Stage, between, cam, eye, idle, lerp, pose, ramp, seated, speaking, useShot, walker } from "./common";

/**
 * 8:46–9:30. The inquest: hours of questions, a confused witness, and
 * the morphine and the missing lawyer that the retellings leave out.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;
const COURT_L = LIGHT.grey;

export const InquestShot: React.FC = () => {
  const { t, dur } = useShot();
  // Lizzie on a chair, Knowlton pacing, the clock's hands sweeping hours; at 533.8 "confused" the stenographer's page fills with crossings.
  const hours = lerp(600, 600 + 60 * 5, ramp(t, 0.5, 7.0, EASE.linear));
  const walkK = walker(t, 0.5, 4.0, 400, -300, undefined, 1);
  const back = walker(t, 4.0, 8.0, -300, 300, undefined, 1);
  const kn = t < 4.0 ? walkK : back;
  const mess = ramp(t, 7.4, 8.8);
  const c = cam(t, [[0, -400], [dur, 100]], [[0, -330], [dur, -320]], [[0, 0.95], [dur, 1.05]]);
  const L = LIGHT.dim;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0a08">
        <Plane d={0}>
          <InquestRoom light={L} t={t} minutes={hours}>
            <Person x={-1000} look={LIZZIE} light={L} pose={seated(t, 1, { neck: 4, lids: 0.8, nearUpper: 34, nearFore: 84 }, 0.35)} facing={1} />
            <Person x={kn.x} look={KNOWLTON} light={L} pose={kn.pose.nearThigh !== 1 ? kn.pose : speaking(t, 2, { turn: -0.2 }, 0.8)} facing={kn.facing} />
            <Person x={900} look={STENOGRAPHER} light={L} pose={seated(t, 3, { lean: 14, neck: 20, nearUpper: 40 + Math.sin(t * 9) * 6, nearFore: 70, farUpper: 36, farFore: 76 }, 0.3)} facing={-1} />
            <g transform="translate(700 -180)">
              <rect x={-60} y={-8} width={140} height={10} fill={lit("#ece6d8", L)} />
              <g opacity={mess}>
                {[0, 1, 2].map((i) => (
                  <rect key={i} x={-50 + i * 40} y={-6} width={30} height={2} fill="#8a2a22" />
                ))}
              </g>
            </g>
          </InquestRoom>
        </Plane>
      </Stage>
      <Finish temp={0.1} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const Morphine: React.FC = () => {
  const { t, dur } = useShot();
  // Dr Bowen hands Lizzie a small bottle in the sitting room. 543.0 "morphine": close on the bottle and its label.
  const hand = ramp(t, 5.4, 7.0, EASE.inOut);
  const close = ramp(t, 7.2, 8.0, EASE.inOut);
  const cRoom = cam(t, [[0, -640], [7.2, -580]], [[0, eye(HOUSE.floor, 250)], [7.2, eye(HOUSE.floor, 250)]], [[0, 1.4], [7.2, 1.6]]);
  const cClose = cam(t, [[7.2, 0], [dur, 10]], [[7.2, -60], [dur, -50]], [[7.2, 3.0], [dur, 3.4]]);
  const L = LIGHT.dim;
  return (
    <AbsoluteFill>
      {close < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - close }}>
          <SectionScene
            t={t}
            cam={cRoom}
            light={L}
            lamps={{ sitting: 0.6 }}
            people={{
              sitting: (
                <g>
                  <Person x={-720} look={LIZZIE} light={L} pose={seated(t, 1, { neck: 8, lids: 0.7, nearUpper: lerp(34, 60, hand), nearFore: lerp(84, 60, hand) }, 0.35)} facing={1} />
                  <Person x={-460} look={DR_BOWEN} light={L} pose={idle(pose({ lean: 10, neck: 10, nearUpper: lerp(30, 70, hand), nearFore: lerp(60, 40, hand), farUpper: 20, farFore: 60 }), t, 2, 0.5)} facing={-1} nearHold={<Bottle x={0} y={34} h={26} light={L} color="#5a4a3a" />} />
                </g>
              ),
            }}
            finish={{ temp: 0.1, vignette: 0.85 }}
          />
        </AbsoluteFill>
      ) : null}
      {close > 0 ? (
        <AbsoluteFill style={{ opacity: close }}>
          <Stage cam={cClose} t={t} bg="#0c0906">
            <Plane d={0}>
              <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2a2a2c", TABLE)} />
              <Pool x={0} y={-100} rx={900} ry={700} color="#ffd9a0" opacity={0.3} />
              <Bottle x={0} y={40} h={140} light={TABLE} color="#5a4a3a" label={false} />
              <rect x={-26} y={-58} width={52} height={40} fill={lit("#efe6d0", TABLE)} />
              <text x={0} y={-32} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={700} fontSize={11} fill={lit("#2a2018", TABLE)} letterSpacing={1}>
                MORPHINE
              </text>
              <Lines x={-20} y={-26} w={40} n={2} gap={5} thick={1.2} color={lit("#8a8272", TABLE)} />
            </Plane>
            <Plane d={-1.4}>
              <CloseHand x={-60} y={-260} angle={-40} light={TABLE} sleeve="#3e3a44" s={1.4} curl={0.5} />
            </Plane>
          </Stage>
          <Finish temp={0.1} vignette={0.9} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Affected: React.FC = () => {
  const { t, dur } = useShot();
  // The inquest room from her chair: the picture doubles and swims.
  const swim = ramp(t, 0.4, 2.0) * (1 - ramp(t, dur - 0.6, dur));
  const c = cam(t, [[0, 100], [dur, 200]], [[0, -330], [dur, -320]], [[0, 1.1], [dur, 1.2]]);
  const L = LIGHT.dim;
  const scene = (dx: number, dy: number, op: number) => (
    <AbsoluteFill style={{ opacity: op, translate: `${dx}px ${dy}px` }}>
      <Stage cam={c} t={t} bg="#0c0a08">
        <Plane d={0}>
          <InquestRoom light={L} t={t} minutes={860}>
            <Person x={kx(t)} look={KNOWLTON} light={L} pose={speaking(t, 2, { turn: -0.3 }, 0.8)} facing={-1} />
            <Person x={900} look={STENOGRAPHER} light={L} pose={seated(t, 3, { lean: 14, neck: 20 }, 0.3)} facing={-1} />
          </InquestRoom>
        </Plane>
      </Stage>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      {scene(0, 0, 1)}
      {scene(Math.sin(t * 1.3) * 26 * swim, Math.cos(t * 0.9) * 14 * swim, 0.45 * swim)}
      {scene(-Math.sin(t * 1.1) * 40 * swim, Math.sin(t * 0.7) * 20 * swim, 0.3 * swim)}
      <AbsoluteFill style={{ backgroundColor: "#0c0a08", opacity: 0.25 * swim }} />
      <Finish temp={0.0} vignette={0.85 + swim * 0.1} />
    </AbsoluteFill>
  );
};

const kx = (t: number) => 200 + Math.sin(t * 0.6) * 200;

export const NoLawyer: React.FC = () => {
  const { t, dur } = useShot();
  // The empty chair beside her; then the corridor, where her lawyer waits outside a shut door.
  const swap = ramp(t, 2.2, 2.9, EASE.inOut);
  const cRoom = cam(t, [[0, -1100], [2.2, -1120]], [[0, -300], [2.2, -300]], [[0, 1.5], [2.2, 1.7]]);
  const cHall = cam(t, [[2.2, 300], [dur, 200]], [[2.2, -320], [dur, -320]], [[2.2, 1.1], [dur, 1.2]]);
  const L = LIGHT.dim;
  return (
    <AbsoluteFill>
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <Stage cam={cRoom} t={t} bg="#0c0a08">
            <Plane d={0}>
              <InquestRoom light={L} t={t} minutes={880}>
                <Person x={-1000} look={LIZZIE} light={L} pose={seated(t, 1, { neck: 6, lids: 0.7 }, 0.35)} facing={1} />
                <Glow x={-1250} y={-150} r={260} color="#ffe0b0" opacity={0.2 * ramp(t, 1.0, 1.8)} />
              </InquestRoom>
            </Plane>
          </Stage>
          <Finish temp={0.1} vignette={0.85} />
        </AbsoluteFill>
      ) : null}
      {swap > 0 ? (
        <AbsoluteFill style={{ opacity: swap }}>
          <Stage cam={cHall} t={t} bg="#0c0a08">
            <Plane d={0}>
              <Corridor light={L} t={t}>
                <Person x={500} look={JENNINGS} light={L} pose={seated(t, 4, { neck: 4, nearUpper: 40, nearFore: 90 }, 0.4)} facing={-1} />
              </Corridor>
            </Plane>
          </Stage>
          <Finish temp={0.0} vignette={0.85} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Excluded: React.FC = () => {
  const { t, dur } = useShot();
  // The trial: Knowlton holds up the inquest transcript; the presiding judge shakes his head; the transcript is set aside.
  const shake = Math.sin(t * 4.5) * between(t, 2.4, 4.2, 0.3) * 0.4;
  const aside = ramp(t, 4.8, 6.2, EASE.inOut);
  const c = cam(t, [[0, -300], [dur, 0]], [[0, -420], [dur, -440]], [[0, 0.9], [dur, 0.85]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Plane d={0}>
          <Courtroom light={COURT_L} t={t}>
            {JUDGES.map((j, i) => (
              <Person key={i} x={-600 + i * 600} y={COURT.benchTop - 20} look={j} light={COURT_L} pose={seated(t, i + 20, { neck: 4, turn: i === 1 ? -0.3 + shake : 0 }, 0.3)} facing={-1} view={i === 1 ? "front" : "3q"} grounded={false} />
            ))}
            {JURORS.slice(0, 6).map((j, i) => (
              <Person key={i} x={COURT.jury - 800 + i * 220} y={-140} look={j} light={COURT_L} pose={seated(t, i, { turn: 0.2 }, 0.4)} facing={-1} />
            ))}
            <Person x={COURT.prosecution + 200} look={KNOWLTON} light={COURT_L} pose={idle(pose({ nearUpper: lerp(120, 40, aside), nearFore: lerp(30, 70, aside), neck: -6 + aside * 8, turn: -0.2 }), t, 30, 0.5)} facing={1} nearHold={<g transform={`translate(0 ${20 + aside * 10})`}><rect x={-30} y={0} width={60} height={80} fill={lit("#ece6d2", COURT_L)} /><Lines x={-22} y={12} w={44} n={6} gap={10} thick={2} color={lit("#7a7262", COURT_L)} /></g>} />
            <Person x={COURT.defense + 120} look={LIZZIE} light={COURT_L} pose={seated(t, 31, { neck: 2 }, 0.3)} facing={1} />
          </Courtroom>
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const NotPart: React.FC = () => {
  const { t, dur } = useShot();
  // The transcript goes into a drawer; the drawer shuts; a key turns.
  const into = ramp(t, 0.4, 2.0, EASE.inOut);
  const shut = ramp(t, 2.6, 3.4, EASE.in);
  const key = ramp(t, 4.0, 5.0, EASE.inOut);
  const c = cam(t, [[0, 0], [dur, 30]], [[0, -60], [dur, -40]], [[0, 2.2], [dur, 2.5]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#4a3020", TABLE)} />
          <Pool x={200} y={-300} rx={1300} ry={900} color="#ffd9a0" opacity={0.3} />
          <g transform={`translate(0 ${lerp(160, 0, shut)}) scale(${lerp(1.2, 1, shut)})`}>
            <rect x={-360} y={-120} width={720} height={240} fill={lit("#5a3a28", TABLE)} />
            <rect x={-340} y={-100} width={680} height={200} fill={lit("#2a1a12", TABLE)} opacity={1 - shut} />
            <g transform={`translate(${lerp(-500, 0, into)} ${lerp(-300, 0, into)}) rotate(${lerp(-20, 0, into)})`} opacity={1 - shut}>
              <rect x={-120} y={-80} width={240} height={160} fill={lit("#ece6d2", TABLE)} />
              <Lines x={-100} y={-60} w={200} n={9} gap={16} thick={2.4} color={lit("#7a7262", TABLE)} />
            </g>
            <circle cx={0} cy={0} r={12} fill={lit("#b89a5a", TABLE)} opacity={shut} />
            <g transform={`translate(0 0) rotate(${key * 90})`} opacity={shut}>
              <rect x={-4} y={-40} width={8} height={80} fill={lit("#8a7a4a", TABLE)} />
              <rect x={-14} y={30} width={28} height={10} fill={lit("#8a7a4a", TABLE)} />
            </g>
          </g>
        </Plane>
        <Plane d={-1.4}>
          <CloseHand x={lerp(-360, 40, into) - shut * 200} y={lerp(-560, -240, into) - shut * 200 + key * 40} angle={-30 + key * 60} light={TABLE} sleeve="#2c2a2e" s={1.6} curl={0.6} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.9} />
    </AbsoluteFill>
  );
};

