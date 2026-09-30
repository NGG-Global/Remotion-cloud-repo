import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import { CloseHand } from "../../gacy/kit/hands";
import { Glow, Pool } from "../../gacy/kit/light";
import { Photo } from "../../gacy/kit/paper";
import { Sky } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import { ABBY, ANDREW, CHILDREN, LIZZIE, NEIGHBOR_WOMAN, TOWNSFOLK, EMMA } from "../rig/cast";
import { BordenHouse } from "../kit/house";
import { Axe, Hatchet, MantelClock, OilLamp, Portrait, Rope, Tally } from "../kit/props";
import { Clipping, FALL_RIVER, FrontPage, PaperStack, USMap } from "../kit/paper";
import { MillTown, SecondStreet } from "../kit/town";
import { BordenTitle } from "../type/Title";
import { EASE, FOLDED, Finish, LIGHT, Person, Plane, Stage, between, cam, hash, lerp, pose, ramp, seated, standing, useShot, idle } from "./common";

/**
 * 0:00–1:14. Cold open.
 *
 * A headline, a legend, the town, the house at noon, the woman inside it.
 * Then the rhyme every American child knows, taken apart line by line on
 * an evidence table, and the one thing that never changed: nobody knows.
 */

const TABLE = { key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 } as const;

// ---------------------------------------------------------- the headline

export const Press: React.FC = () => {
  const { t, dur } = useShot();
  const drop = ramp(t, 0.3, 0.75, EASE.out);
  const c = cam(t, [[0, 0], [dur, 20]], -150, [[0, 2.4], [dur, 3.0]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#3a2c20", TABLE)} />
          <PaperStack x={0} n={14} light={TABLE} />
          <g transform={`translate(0 ${-110 - (1 - drop) * 700}) rotate(${-4 + drop * 3})`} opacity={Math.min(1, drop * 3)}>
            <FrontPage id="p1" x={0} y={0} w={420} h={600} light={TABLE} masthead="FALL RIVER HERALD" headline={"SHOCKING\nCRIME"} seed={3} />
          </g>
          <Pool x={200} y={-500} rx={900} ry={700} color="#ffd9a0" opacity={0.35} />
        </Plane>
        <Plane d={-1.5}>
          <OilLamp x={900} y={-40} on={1} t={t} light={TABLE} s={1.6} />
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const Legend: React.FC = () => {
  const { t, dur } = useShot();
  const age = ramp(t, 0.1, 2.4, EASE.inOut);
  const c = cam(t, [[0, 20], [dur, 40]], [[0, -160], [dur, -200]], [[0, 3.0], [dur, 3.5]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#3a2c20", TABLE)} />
          <PaperStack x={0} n={14} light={TABLE} />
          <g transform="translate(0 -110) rotate(-1)">
            <FrontPage id="p2" x={0} y={0} w={420} h={600} light={TABLE} masthead="FALL RIVER HERALD" headline={"SHOCKING\nCRIME"} seed={3} age={age} />
            {/* the page curls and darkens at the corners as it ages */}
            <path d={`M210 300 Q${210 - age * 60} ${300 - age * 40} ${210 - age * 90} 300 Z`} fill="#2a1e12" opacity={age * 0.8} />
            <path d={`M-210 -300 Q${-210 + age * 50} ${-300 + age * 30} -210 ${-300 + age * 80} Z`} fill="#2a1e12" opacity={age * 0.8} />
          </g>
          <Pool x={200} y={-500} rx={900} ry={700} color={age > 0.5 ? "#c88a50" : "#ffd9a0"} opacity={0.35 - age * 0.15} />
        </Plane>
        <Plane d={-1.5}>
          <OilLamp x={900} y={-40} on={1 - age * 0.5} t={t} light={TABLE} s={1.6} />
        </Plane>
      </Stage>
      <Finish temp={0.4 - age * 0.6} vignette={0.85 + age * 0.1} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- the town, the house

export const FallRiver: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -600], [dur, 200]], [[0, -1300], [dur, -1200]], [[0, 0.42], [dur, 0.46]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <MillTown t={t} light={LIGHT.noon} />
      </Stage>
      <Finish temp={0.3} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const SecondStreetNoon: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, -300], [dur, -60]], [[0, -760], [dur, -620]], [[0, 0.5], [dur, 0.74]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet t={t} light={LIGHT.noon} heat={1} />
      </Stage>
      <Finish temp={0.5} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const Nobody: React.FC = () => {
  const { t } = useShot();
  // "no robbery": the door. "no break-in": the windows. "no neighbour saw": the street.
  const c = cam(t, [[0, -600], [1.0, -600], [1.6, 160], [3.2, 160], [3.5, 100], [6.4, -200]], [[0, -420], [1.0, -420], [1.6, -560], [3.2, -560], [3.5, -700], [6.4, -800]], [[0, 1.9], [1.0, 1.9], [1.6, 1.5], [3.2, 1.5], [3.5, 0.9], [6.4, 0.5]], EASE.inOut);
  const neighbor = ramp(t, 4.0, 4.6);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <SecondStreet
          t={t}
          light={LIGHT.noon}
          heat={0.6}
          onWalk={null}
          foreground={null}
          inYard={null}
        />
        {/* a neighbour at the window of the house across the street, seen from behind */}
        <Plane d={-9}>
          <g opacity={neighbor}>
            <Person x={3600} look={NEIGHBOR_WOMAN} light={LIGHT.noon} pose={standing(t, 3, { turn: 1 })} facing={-1} s={1} />
          </g>
        </Plane>
      </Stage>
      <Finish temp={0.5} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const LizzieWindow: React.FC = () => {
  const { t, dur } = useShot();
  const show = ramp(t, 1.4, 2.6, EASE.out);
  const c = cam(t, [[0, -300], [dur, -470]], [[0, -800], [dur, -950]], [[0, 0.8], [dur, 2.2]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Sky mode="day" t={t} clouds={0.4} stars={false} />
        <GroundStrip near={-30} far={40} color="#7a8a58" farColor="#5a6a48" light={LIGHT.noon} />
        <Plane d={0}>
          <BordenHouse
            x={0}
            light={LIGHT.noon}
            t={t}
            atWindow={
              <g opacity={show}>
                <rect x={-580} y={-1100} width={220} height={300} fill="#2a2a30" opacity={0.6} />
                <Person x={-470} y={-690} look={LIZZIE} light={LIGHT.dim} pose={idle(pose({ turn: -0.7 }), t, 4, 0.5)} view="front" />
              </g>
            }
          />
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.7} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- the name spreads

export const MapShot: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, 700], [dur, 300]], [[0, -400], [dur, -440]], [[0, 1.9], [dur, 1.05]]);
  const spots = Array.from({ length: 22 }, (_, i) => ({
    x: 120 + hash(i * 3.3) * 760,
    y: 60 + hash(i * 7.1) * 330,
    rot: (hash(i * 11) - 0.5) * 30,
  }));
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#14110c">
        <Plane d={0}>
          <rect x={-4000} y={-3000} width={8000} height={6000} fill="#1c1812" />
          <USMap x={-470} y={-650} s={1} light={{ key: "#ffe6c0", ambient: "#1c1812", amb: 0.2 }}>
            <circle cx={FALL_RIVER.x} cy={FALL_RIVER.y} r={6 + Math.sin(t * 6) * 2} fill="#8a2a22" />
            <Clipping x={FALL_RIVER.x} y={FALL_RIVER.y} k={ramp(t, 0.3, 0.6)} rot={-6} seed={99} />
            {spots.map((s, i) => {
              const d = Math.hypot(s.x - FALL_RIVER.x, s.y - FALL_RIVER.y);
              const at = 1.0 + (d / 800) * 2.4 + hash(i) * 0.3;
              return <Clipping key={i} x={s.x} y={s.y} k={ramp(t, at, at + 0.35, EASE.out)} rot={s.rot} seed={i} />;
            })}
          </USMap>
        </Plane>
        <Plane d={-1}>
          <Glow x={400} y={-540} r={900} color="#ffd9a0" opacity={0.18} />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.75} />
    </AbsoluteFill>
  );
};

/** A row of brownstone stoops, for the children's street. */
const Brownstones: React.FC<{ t: number }> = () => {
  const L = (c: string) => lit(c, LIGHT.afternoon);
  return (
    <g>
      {[-3000, -1500, 0, 1500, 3000].map((bx, i) => (
        <g key={bx} transform={`translate(${bx} 0)`}>
          <rect x={-760} y={-2200} width={1520} height={2200} fill={L(["#7a5a4a", "#8a6a52", "#6a5a4e"][i % 3])} />
          {Array.from({ length: 40 }, (_, r) => (
            <rect key={r} x={-760} y={-2200 + r * 55} width={1520} height={2} fill={L("#4a3a30")} opacity={0.5} />
          ))}
          {[-500, -140, 220, 580].map((wx) =>
            [0, 1, 2].map((f) => (
              <g key={`${wx}-${f}`}>
                <rect x={wx - 80} y={-2000 + f * 640} width={160} height={300} fill={L("#26303a")} />
                <rect x={wx - 92} y={-2012 + f * 640} width={184} height={16} fill={L("#c8b898")} />
              </g>
            )),
          )}
          <rect x={-120} y={-560} width={240} height={560} fill={L("#2a2420")} />
          {[0, 1, 2, 3, 4].map((s) => (
            <rect key={s} x={-200 - s * 20} y={-60 - s * 60 + 300} width={400 + s * 40} height={60} fill={L(s % 2 ? "#8a8078" : "#9a9088")} transform="translate(0 -300)" />
          ))}
        </g>
      ))}
    </g>
  );
};

export const RopeShot: React.FC = () => {
  const { t, dur } = useShot();
  const c = cam(t, [[0, 300], [dur, -100]], [[0, -450], [dur, -420]], [[0, 0.75], [dur, 0.95]]);
  const phase = t * 1.4;
  const jump = Math.max(0, Math.sin(phase * Math.PI * 2 + 1.2));
  const L = LIGHT.afternoon;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Sky mode="day" t={t} clouds={0.3} stars={false} />
        <Plane d={6}>
          <Brownstones t={t} />
        </Plane>
        <GroundStrip near={-30} far={6} color="#9a968c" farColor="#8a867c" light={L} />
        <Plane d={0}>
          <Person x={-520} look={CHILDREN[1]} light={L} pose={idle(pose({ nearUpper: 40 + Math.sin(phase * Math.PI * 2) * 30, nearFore: 60 + Math.cos(phase * Math.PI * 2) * 20, farUpper: 20, farFore: 30 }), t, 1, 0.5)} facing={1} />
          <Person x={520} look={CHILDREN[3]} light={L} pose={idle(pose({ nearUpper: 40 - Math.sin(phase * Math.PI * 2) * 30, nearFore: 60 - Math.cos(phase * Math.PI * 2) * 20, farUpper: 20, farFore: 30 }), t, 2, 0.5)} facing={-1} />
          <Rope x0={-470} y0={-230} x1={470} y1={-230} phase={phase} light={L} />
          <Person x={0} y={-jump * 70} look={CHILDREN[0]} light={L} pose={pose({ nearKnee: 10 + jump * 40, farKnee: 10 + jump * 40, nearThigh: jump * 20, farThigh: jump * 20, nearUpper: -20, farUpper: -20, smile: 0.8, hipDrop: jump * 10 })} view="front" grounded={false} />
          <Person x={900} look={CHILDREN[2]} light={L} pose={idle(pose({ smile: 0.6, nearUpper: 60, nearFore: 70 }), t, 3)} facing={-1} />
        </Plane>
        <Plane d={-4}>
          <Person x={-1700} look={TOWNSFOLK[1]} light={L} pose={idle(pose({ turn: 0.4 }), t, 8, 0.6)} facing={1} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.6} />
    </AbsoluteFill>
  );
};

/** The rhyme, written in chalk on the pavement, from above. */
export const Rhyme: React.FC = () => {
  const { t, dur } = useShot();
  // 35.80: "Lizzie Borden took an axe" (hatchet drawn 0.5–1.4), "forty whacks" tally 1.5–3.6, "forty-one" second tally 5.9–7.1.
  const hatchet = ramp(t, 0.5, 1.4, EASE.out);
  const forty = lerp(0, 40, ramp(t, 1.5, 3.6, EASE.linear));
  const one = lerp(0, 41, ramp(t, 5.9, 7.1, EASE.linear));
  const c = cam(t, [[0, -200], [dur, 120]], [[0, -60], [dur, -40]], [[0, 1.7], [dur, 1.35]]);
  const chalk = "#f0ece2";
  const L = LIGHT.afternoon;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#8a867c">
        <Plane d={0}>
          <rect x={-4000} y={-3000} width={8000} height={6000} fill={lit("#9a968c", L)} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-4000} y={-3000 + i * 500} width={8000} height={6} fill={lit("#7a766c", L)} opacity={0.6} />
          ))}
          {/* chalk hatchet */}
          <g transform="translate(-560 -60) rotate(-20)" stroke={chalk} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9}>
            <path d="M0 0 L0 330" strokeDasharray={`${330 * hatchet} 400`} />
            <path d="M-70 -60 L70 -60 L90 40 L-90 40 Z" strokeDasharray={`${420 * hatchet} 500`} />
          </g>
          <Tally x={-260} y={-120} n={forty} s={2.2} color={chalk} />
          <Tally x={-260} y={120} n={one} s={2.2} color={chalk} />
          {/* the rope's shadow sweeping across */}
          <path d={`M-3000 ${-600 + Math.sin(t * 1.4 * Math.PI * 2) * 500} Q0 ${-300 + Math.sin(t * 1.4 * Math.PI * 2) * 900} 3000 ${-600 + Math.sin(t * 1.4 * Math.PI * 2) * 500}`} stroke="#000" strokeWidth={14} fill="none" opacity={0.18} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

export const NotAccurate: React.FC = () => {
  const { t, dur } = useShot();
  const scuff = ramp(t, 0.6, 1.8, EASE.inOut);
  const smear = ramp(t, 0.9, 2.2);
  const c = cam(t, [[0, 120], [dur, 60]], -40, [[0, 1.35], [dur, 1.5]]);
  const chalk = "#f0ece2";
  const L = LIGHT.afternoon;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#8a867c">
        <Plane d={0}>
          <rect x={-4000} y={-3000} width={8000} height={6000} fill={lit("#9a968c", L)} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-4000} y={-3000 + i * 500} width={8000} height={6} fill={lit("#7a766c", L)} opacity={0.6} />
          ))}
          <g opacity={1 - smear * 0.75}>
            <g transform="translate(-560 -60) rotate(-20)" stroke={chalk} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9}>
              <path d="M0 0 L0 330" />
              <path d="M-70 -60 L70 -60 L90 40 L-90 40 Z" />
            </g>
            <Tally x={-260} y={-120} n={40} s={2.2} color={chalk} />
            <Tally x={-260} y={120} n={41} s={2.2} color={chalk} />
          </g>
          {/* a smear where the shoe dragged */}
          <ellipse cx={lerp(-700, 700, scuff)} cy={60} rx={420 * smear} ry={120} fill="#e8e4da" opacity={0.25 * smear} />
        </Plane>
        <Plane d={-0.6}>
          {/* a boot dragging across the chalk */}
          <g transform={`translate(${lerp(-1400, 1200, scuff)} 40)`}>
            <path d="M-120 0 L120 0 L110 -60 L-40 -80 L-140 -40 Z" fill={lit("#2a2018", L)} />
            <rect x={-30} y={-220} width={80} height={150} fill={lit("#4a4a44", L)} />
          </g>
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- the evidence table

export const EvidenceTable: React.FC = () => {
  const { t, dur } = useShot();
  // 47.5: "not her mother" (photo placed 0.2–0.8); 49.0: "not an axe that size" (axe→hatchet 2.0–4.3); 52.4: "far fewer blows" (tally erased 5.2–7.2).
  const photo = ramp(t, 0.2, 0.8, EASE.out);
  const shrink = ramp(t, 2.2, 4.4, EASE.inOut);
  const fewer = 1 - ramp(t, 5.2, 7.2, EASE.inOut);
  const c = cam(t, [[0, -300], [2.0, -300], [4.5, 260], [5.2, 260], [dur, 700]], [[0, -120], [2.0, -120], [4.5, -80], [5.2, -80], [dur, 40]], [[0, 2.4], [2.0, 2.4], [4.5, 2.6], [5.2, 2.6], [dur, 2.4]], EASE.inOut);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0c0906">
        <Plane d={0}>
          <rect x={-3000} y={-2000} width={6000} height={4000} fill={lit("#2c4a3a", TABLE)} />
          {/* the photograph of Abby, placed */}
          <g transform={`translate(0 ${-(1 - photo) * 300})`} opacity={photo}>
            <Photo id="abby" x={-300} y={-140} w={200} h={250} rot={-5} light={TABLE} tone="#8a7a6a" scene={<Person x={100} y={420} s={1.5} look={ABBY} light={LIGHT.sepia} pose={seated(0, 1)} view="front" />} />
          </g>
          {/* the axe of the rhyme, and the hatchet it probably was */}
          <g transform="translate(260 -160) rotate(70)">
            <g opacity={1 - shrink} transform={`scale(${lerp(1, 0.55, shrink)})`}>
              <Axe light={TABLE} s={1.2} />
            </g>
          </g>
          <g transform="translate(260 -140) rotate(70)" opacity={shrink}>
            <Hatchet light={TABLE} s={1.5} handle={0.9} />
          </g>
          {/* a slate with the count */}
          <g transform="translate(760 40)">
            <rect x={-180} y={-130} width={360} height={260} rx={6} fill={lit("#2a2a2c", TABLE)} />
            <rect x={-170} y={-120} width={340} height={240} fill={lit("#3a3a3c", TABLE)} />
            <g opacity={lerp(0.25, 1, fewer)}>
              <Tally x={-150} y={-90} n={Math.round(lerp(10, 40, fewer))} s={0.9} color="#e8e4da" />
            </g>
            <ellipse cx={0} cy={0} rx={190 * (1 - fewer)} ry={130} fill="#3a3a3c" opacity={0.9 * (1 - fewer)} />
            <g opacity={1 - fewer}>
              <Tally x={-150} y={-90} n={19} s={0.9} color="#e8e4da" />
            </g>
          </g>
          <Pool x={300} y={-300} rx={1200} ry={800} color="#ffd9a0" opacity={0.3} />
        </Plane>
        <Plane d={-1.2}>
          <CloseHand x={lerp(-260, 60, photo)} y={-600 + (1 - photo) * 100} angle={30} light={TABLE} sleeve="#2a2a2e" s={1.6} curl={0.4} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const Portraits: React.FC = () => {
  const { t, dur } = useShot();
  // 62.2 "Andrew", 62.7 "Abby": each portrait brightens on its name.
  const a = between(t, 6.7, dur + 1, 0.4);
  const b = between(t, 7.2, dur + 1, 0.4);
  const dim = ramp(t, 7.9, 8.6);
  const c = cam(t, [[0, -560], [dur, -540]], [[0, -400], [dur, -430]], [[0, 1.4], [dur, 2.3]]);
  const ROOM = LIGHT.lamp;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#0a0806">
        <Plane d={0}>
          <rect x={-3000} y={-1600} width={6000} height={1600} fill={lit("#5a4a42", ROOM)} />
          {Array.from({ length: 40 }, (_, i) =>
            Array.from({ length: 12 }, (_, j) => (
              <path key={`${i}-${j}`} d={`M${-3000 + 60 + i * 150 + (j % 2) * 75} ${-1560 + j * 130} l12 14 l-12 14 l-12 -14 Z`} fill={lit("#4a3a34", ROOM)} opacity={0.6} />
            )),
          )}
          <rect x={-3000} y={0} width={6000} height={900} fill={lit("#3a2a22", ROOM)} />
          {/* mantel */}
          <rect x={-1000} y={-300} width={900} height={300} fill={lit("#3a2a22", ROOM)} />
          <rect x={-920} y={-240} width={740} height={240} fill="#0c0806" />
          <rect x={-1040} y={-316} width={980} height={18} fill={lit("#5a4030", ROOM)} />
          <MantelClock x={-550} y={-316} minutes={640} light={ROOM} s={0.9} />
          <Portrait id="pa" x={-780} y={-560} w={170} h={220} light={ROOM} oval>
            <g opacity={lerp(0.55, 1, a)}>
              <Person x={0} y={400} s={1.7} look={ANDREW} light={LIGHT.sepia} pose={seated(0, 1)} view="front" />
            </g>
          </Portrait>
          <Portrait id="pb" x={-320} y={-560} w={170} h={220} light={ROOM} oval>
            <g opacity={lerp(0.55, 1, b)}>
              <Person x={0} y={400} s={1.7} look={ABBY} light={LIGHT.sepia} pose={seated(0, 2)} view="front" />
            </g>
          </Portrait>
          <Glow x={-780} y={-560} r={260} color="#ffe0b0" opacity={0.35 * a} />
          <Glow x={-320} y={-560} r={260} color="#ffe0b0" opacity={0.35 * b} />
          <OilLamp x={-120} y={-316} on={1 - dim * 0.7} t={t} light={ROOM} s={0.9} />
        </Plane>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: dim * 0.6 }} />
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

/** The house at night under the title, then the family in a photographer's studio. */
export const TitleShot: React.FC = () => {
  const { t, dur } = useShot();
  const studio = ramp(t, 6.0, 7.2, EASE.inOut);
  const flash = t > 8.7 && t < 9.0 ? Math.exp(-(t - 8.7) * 16) : 0;
  const cNight = cam(t, [[0, 0], [dur, 60]], [[0, -760], [dur, -700]], [[0, 0.5], [dur, 0.56]]);
  const cStudio = cam(t, [[6, 0], [dur, 0]], -330, [[6, 0.95], [dur, 1.05]]);
  const SEPIA = LIGHT.sepia;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - studio }}>
        <Stage cam={cNight} t={t} bg="#05060a">
          <SecondStreet t={t + 30} light={LIGHT.night} lamps={1} bordenLit={0.7} neighborsLit={0.3} />
        </Stage>
        <Finish temp={-0.5} vignette={0.8} />
      </AbsoluteFill>
      {studio > 0 ? (
        <AbsoluteFill style={{ opacity: studio }}>
          <Stage cam={cStudio} t={t} bg="#2a2018">
            <Plane d={0}>
              <rect x={-3000} y={-1600} width={6000} height={1600} fill={lit("#8a7a66", SEPIA)} />
              <rect x={-3000} y={0} width={6000} height={900} fill={lit("#5a4a3c", SEPIA)} />
              {/* a painted backdrop of columns and drapery */}
              <path d="M-900 -1500 Q-700 -1300 -900 -1000 L-900 0 L-1100 0 L-1100 -1500 Z" fill={lit("#6a5a4a", SEPIA)} />
              <path d="M900 -1500 Q700 -1300 900 -1000 L900 0 L1100 0 L1100 -1500 Z" fill={lit("#6a5a4a", SEPIA)} />
              <rect x={-320} y={-200} width={120} height={200} fill={lit("#4a3a30", SEPIA)} />
              <rect x={200} y={-200} width={120} height={200} fill={lit("#4a3a30", SEPIA)} />
              <Person x={-260} look={ANDREW} light={SEPIA} pose={seated(t, 1, {}, 0.15)} />
              <Person x={260} look={ABBY} light={SEPIA} pose={seated(t, 2, {}, 0.15)} facing={-1} />
              <Person x={-520} look={LIZZIE} light={SEPIA} pose={idle(pose({ nearUpper: 10, nearFore: 60, farUpper: 8, farFore: 64 }), t, 3, 0.15)} />
              <Person x={40} look={EMMA} light={SEPIA} pose={idle(FOLDED, t, 4, 0.15)} facing={-1} />
            </Plane>
            <Plane d={-2}>
              <Glow x={0} y={-400} r={1400} color="#f0d8b0" opacity={0.2} />
            </Plane>
          </Stage>
          <AbsoluteFill style={{ backgroundColor: "#fff4e0", opacity: flash }} />
          <Finish temp={0.6} vignette={0.9} grain={0.6} />
        </AbsoluteFill>
      ) : null}
      <BordenTitle t={t} from={0.5} to={6.6} />
    </AbsoluteFill>
  );
};

