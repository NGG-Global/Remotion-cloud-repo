import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, type Light } from "../engine/color";
import { Finish, Haze } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, clamp, hash, keys, lerp, noise, ramp } from "../engine/time";
import { Bus, CityBlock, Courthouse, DriveIn, Elevated, Farmhouse, PrisonWall } from "../kit/buildings";
import { Bicycle } from "../kit/props";
import { CloseHand } from "../kit/hands";
import { Pool, Wash } from "../kit/light";
import { BW, Photo } from "../kit/paper";
import { Sky } from "../kit/sky";
import { GroundStrip, StreetLamp, Tree } from "../kit/street";
import { lightFor, SUBURB, Suburb } from "../kit/suburb";
import { Car } from "../kit/vehicles";
import { Person, solve } from "../rig/Person";
import { GACY, GACY_MANAGER, GACY_SUIT, MOTHER, NEIGHBORS, OFFICER, WORKERS } from "../rig/cast";
import { CARRY, SIT, STAND, idle, pose, reachAngles, talk, walk, walkBetween } from "../rig/pose";

/**
 * 1:07–2:10. Chicago, a childhood the camera refuses to diagnose, Iowa,
 * the 1968 conviction, prison, and the return to a street full of
 * neighbours.
 */

const DUSK: Light = { key: "#e8b89a", ambient: "#262030", amb: 0.28, desat: 0.15 };
const DAY = lightFor("day");
const OVERCAST: Light = { key: "#e2e4e6", ambient: "#5a6068", amb: 0.14, desat: 0.3 };
const LAMP: Light = { key: "#ffe0b4", ambient: "#1a120c", amb: 0.14 };

const CHILD = { build: "child" as const, skin: "#eac19e", hair: "short" as const, hairColor: "#3a2a1e", top: "#8a8a8a", pants: "#5a5a5a" };

// ------------------------------------------------------------- 1942

const Pram: React.FC<{ x: number; light: Light }> = ({ x, light }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-110 -110 L110 -110 Q120 -210 40 -230 L-110 -230 Z" fill={L("#2a2e3a")} />
      <path d="M-110 -230 Q-140 -300 -40 -300 L20 -230 Z" fill={L("#1e222c")} />
      <path d="M110 -150 L190 -290" stroke={L("#2a2a2a")} strokeWidth={8} />
      {[-70, 70].map((wx) => (
        <g key={wx} transform={`translate(${wx} -40)`}>
          <circle r={40} fill="none" stroke={L("#1a1a1a")} strokeWidth={8} />
          <circle r={6} fill={L("#8a8a8a")} />
        </g>
      ))}
      <path d="M-70 -40 L0 -110 L70 -40" stroke={L("#2a2a2a")} strokeWidth={5} fill="none" />
    </g>
  );
};

export const Chicago1942: React.FC = () => {
  const { t, dur } = useShot();
  const trainX = lerp(1800, -9500, ramp(t, 0, dur, EASE.linear));
  const mom = walkBetween(t, -1, dur + 1, -900, 500, 0.95);
  const mp = solve(STAND, MOTHER);
  const reach = reachAngles(mp.near.shoulder, { x: 210, y: -290 }, mp.torsoAngle, mp.dims.upper, mp.dims.fore);
  const cam = { x: keys(t, [[0, -300], [dur, 100]]), y: keys(t, [[0, -760], [dur, -800]]), zoom: keys(t, [[0, 0.6], [dur, 0.67]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Sky mode="dusk" t={t} clouds={0.8} />
        <Plane d={40}>
          <CityBlock x0={-14000} x1={14000} light={{ ...DUSK, amb: 0.5 }} lit={0.4} seed={5} />
        </Plane>
        <GroundStrip near={-12} far={40} color="#3a3834" light={DUSK} />
        <Plane d={9}>
          <CityBlock x0={-6000} x1={6000} light={DUSK} lit={0.55} seed={1} />
        </Plane>
        <Plane d={3.2}>
          <Elevated x0={-9000} x1={9000} light={{ ...DUSK, amb: 0.45 }} trainX={trainX} t={t} />
        </Plane>
        <Plane d={2}>
          <StreetLamp x={-1400} on={0.8} light={DUSK} t={t} />
          <StreetLamp x={1800} on={0.8} light={DUSK} t={t} />
        </Plane>
        <Plane d={0}>
          <Person x={mom.x} look={MOTHER} light={DUSK} pose={walk(idle(pose({ nearUpper: reach.upper, nearFore: reach.fore }), t, 2), mom.phase, mom.amt)} />
          <Pram x={mom.x + 300} light={DUSK} />
        </Plane>
        <Plane d={-2.2}>
          <Car x={lerp(-4500, 3500, ramp(t, 0.5, dur, EASE.linear))} color="#2a2a2e" light={{ ...DUSK, amb: 0.4 }} headlights={0.6} />
        </Plane>
      </Stage>
      <Haze t={t} density={0.25} color="#8a7a8a" />
      <Finish temp={0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------ the album and the map

type Snap = { id: string; draw: React.ReactNode; rot: number; x: number; y: number };

const snapScene = (kind: number): React.ReactNode => {
  const bg = ["#9a9a98", "#b0b0ae", "#8a8a88", "#a4a4a2", "#96968f", "#aaaaa6"][kind % 6];
  switch (kind % 6) {
    case 0:
      return (
        <g>
          <rect width={180} height={140} fill={bg} />
          <rect y={100} width={180} height={40} fill="#7a7a78" />
          <g transform="translate(80 118) scale(0.34)">
            <Person x={0} look={CHILD} light={BW} pose={pose({ hipDrop: 30, nearThigh: 40, nearKnee: 60, farThigh: 30, farKnee: 50, nearUpper: 50, nearFore: 20, farUpper: 50, farFore: 20, smile: 1 })} grounded={false} />
          </g>
          <circle cx={55} cy={122} r={14} fill="none" stroke="#3a3a3a" strokeWidth={3} />
          <circle cx={110} cy={122} r={10} fill="none" stroke="#3a3a3a" strokeWidth={3} />
        </g>
      );
    case 1:
      return (
        <g>
          <rect width={180} height={140} fill={bg} />
          <g transform="translate(90 190) scale(0.62)">
            <Person x={0} look={{ ...CHILD, top: "#4a4a4a", shirt: "#e8e8e8" }} light={BW} view="front" pose={pose({ smile: 0.4 })} />
          </g>
        </g>
      );
    case 2:
      return (
        <g>
          <rect width={180} height={140} fill={bg} />
          <rect x={10} y={20} width={160} height={90} fill="#7e7e7c" />
          <rect x={0} y={106} width={180} height={34} fill="#6a6a68" />
          <g transform="translate(0 120) scale(0.26)">
            <Person x={170} look={{ ...NEIGHBORS[0], hair: "short" }} light={BW} view="front" pose={STAND} />
            <Person x={360} look={NEIGHBORS[1]} light={BW} view="front" pose={STAND} />
            <Person x={520} look={CHILD} light={BW} view="front" pose={pose({ smile: 0.6 })} />
          </g>
        </g>
      );
    case 3:
      return (
        <g>
          <rect width={180} height={140} fill={bg} />
          <rect y={96} width={180} height={44} fill="#8a8a88" />
          <g transform="translate(70 124) scale(0.36)">
            <Person x={0} look={CHILD} light={BW} pose={pose({ farUpper: 50, farFore: 30, smile: 1 })} />
          </g>
          <ellipse cx={122} cy={112} rx={22} ry={12} fill="#4a4a48" />
          <circle cx={140} cy={100} r={9} fill="#4a4a48" />
        </g>
      );
    case 4:
      return (
        <g>
          <rect width={180} height={140} fill={bg} />
          <rect y={90} width={180} height={50} fill="#9a9a96" />
          <g transform="translate(90 128) scale(0.38)">
            <Person x={0} look={{ ...CHILD, cap: "#3a3a3a", top: "#dadada" }} light={BW} pose={pose({ nearUpper: 120, nearFore: 60, farUpper: 110, farFore: 70 })} />
          </g>
          <rect x={96} y={30} width={6} height={60} fill="#4a3a2a" transform="rotate(30 99 60)" />
        </g>
      );
    default:
      return (
        <g>
          <rect width={180} height={140} fill={bg} />
          <rect y={100} width={180} height={40} fill="#7a7a78" />
          <g transform="translate(90 132) scale(0.4)">
            <Person x={-60} look={{ ...CHILD, build: "child" }} light={BW} pose={STAND} />
            <Person x={80} look={{ ...CHILD, hair: "mop", hairColor: "#6a5a4a" }} light={BW} facing={-1} pose={STAND} />
          </g>
        </g>
      );
  }
};

const SNAPS: Snap[] = Array.from({ length: 14 }, (_, i) => ({
  id: `s${i}`,
  draw: snapScene(i),
  rot: (hash(i * 3.1) - 0.5) * 18,
  x: (hash(i * 7.3) - 0.5) * 1500,
  y: (hash(i * 5.9) - 0.5) * 820,
}));

const Table: React.FC<{ t: number; light: Light }> = ({ t, light }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <rect x={-3000} y={-2000} width={6000} height={4000} fill={L("#4a3222")} />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={-3000} y={-2000 + i * 140 + (hash(i) - 0.5) * 30} width={6000} height={3} fill={L("#3a2618")} opacity={0.7} />
      ))}
      <Pool x={-200} y={-120} rx={1500} ry={1100} color="#ffd8a0" opacity={0.42 + noise(t * 2, 3) * 0.02} blend="soft-light" />
    </g>
  );
};

export const Album: React.FC = () => {
  const { t } = useShot();
  const turn = ramp(t, 1.2, 2.4, EASE.inOut);
  const pencil = ramp(t, 6.2, 6.9, EASE.out) - ramp(t, 8.6, 9.2, EASE.in);
  const circle = ramp(t, 6.8, 8.0, EASE.inOut);
  const cam = { x: keys(t, [[0, -40], [5.8, 60], [9.2, 230]], EASE.inOut), y: keys(t, [[0, 10], [5.8, 0], [9.2, -100]]), zoom: keys(t, [[0, 1.9], [5.8, 2.1], [9.2, 3.1]], EASE.inOut) };
  const page = (side: number, set: number) => (
    <g>
      <rect x={side < 0 ? -420 : 0} y={-270} width={420} height={540} fill={lit("#2a2622", LAMP)} />
      {[0, 1, 2, 3].map((k) => (
        <Photo
          key={k}
          id={`al${set}-${k}-${side}`}
          x={(side < 0 ? -210 : 210) + (k % 2 ? 95 : -95)}
          y={k < 2 ? -120 : 120}
          w={150}
          h={116}
          border={8}
          rot={(hash(set * 9 + k + side) - 0.5) * 6}
          light={LAMP}
          scene={<g transform="scale(0.833)">{snapScene(set * 4 + k + (side > 0 ? 2 : 0))}</g>}
        />
      ))}
    </g>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#140c08">
        <Plane d={0}>
          <Table t={t} light={LAMP} />
          <rect x={-440} y={-290} width={880} height={580} rx={8} fill={lit("#3e2a1c", LAMP)} />
          {page(-1, 0)}
          {page(1, turn > 0.5 ? 1 : 0)}
          {/* the turning page */}
          {turn > 0 && turn < 1 ? (
            <g transform={`scale(${Math.cos(turn * Math.PI)} 1)`}>
              <rect x={0} y={-270} width={420} height={540} fill={lit(turn < 0.5 ? "#2a2622" : "#322c26", LAMP)} />
            </g>
          ) : null}
          <rect x={-6} y={-290} width={12} height={580} fill={lit("#1e140c", LAMP)} />
          {/* the red circle true crime likes to draw */}
          <circle
            cx={305}
            cy={-120}
            r={92}
            fill="none"
            stroke="#b8241c"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={`${circle * 600} 600`}
            opacity={0.9}
            transform="rotate(-80 305 -120)"
          />
        </Plane>
        <Plane d={-1.2}>
          <CloseHand x={lerp(900, 430, pencil) + circle * 40} y={lerp(-600, -300, pencil) + Math.sin(circle * 6.3) * 20} angle={-150} skin="#d8a888" sleeve="#4a4034" s={3.2} light={LAMP}>
            <rect x={-5} y={30} width={10} height={70} rx={3} fill="#b8241c" transform="rotate(-20 0 30)" />
          </CloseHand>
        </Plane>
      </Stage>
      <Finish temp={0.6} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const NoMoment: React.FC = () => {
  const { t } = useShot();
  const erase = ramp(t, 0.3, 1.5, EASE.inOut);
  const spread = ramp(t, 2.6, 6.2, EASE.out);
  const cam = { x: keys(t, [[0, 40], [7.4, 0]]), y: keys(t, [[0, -10], [7.4, 0]]), zoom: keys(t, [[0, 2.9], [2.4, 2.4], [7.4, 1.05]], EASE.inOut) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#140c08">
        <Plane d={0}>
          <Table t={t} light={LAMP} />
          {SNAPS.map((s, i) => {
            const k = clamp(spread * 1.6 - i * 0.05);
            return (
              <Photo
                key={s.id}
                id={`nm-${s.id}`}
                x={lerp(0, s.x, k)}
                y={lerp(0, s.y, k)}
                rot={lerp(0, s.rot, k)}
                light={LAMP}
                scene={s.draw}
              />
            );
          })}
          <circle cx={lerp(0, SNAPS[3].x, clamp(spread * 1.6 - 0.15))} cy={lerp(0, SNAPS[3].y, clamp(spread * 1.6 - 0.15))} r={120} fill="none" stroke="#b8241c" strokeWidth={9} opacity={0.9 * (1 - erase)} />
        </Plane>
        <Plane d={-1.5}>
          <CloseHand x={lerp(260, 900, erase)} y={lerp(-120, -700, erase)} angle={-150} skin="#d8a888" sleeve="#4a4034" s={3.2} light={LAMP} />
        </Plane>
      </Stage>
      <Finish temp={0.6} vignette={0.8} />
    </AbsoluteFill>
  );
};

/** Chicago → Waterloo, Iowa, as a road map on the same table. */
const RoadMap: React.FC<{ line: number }> = ({ line }) => {
  const L = (c: string) => lit(c, LAMP);
  return (
    <g>
      <rect x={-900} y={-560} width={1800} height={1120} fill={L("#e8e0c8")} />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={-900 + i * 450} y={-560} width={3} height={1120} fill={L("#c8bea4")} />
      ))}
      <rect x={-900} y={-2} width={1800} height={3} fill={L("#c8bea4")} />
      {/* Iowa (west) and Illinois (east), simplified outlines */}
      <path d="M-860 -300 L-120 -330 Q-80 -250 -110 -170 Q-60 -100 -90 -20 L-140 40 L-120 120 L-860 150 Z" fill={L("#d8ceb0")} stroke={L("#9a8a6a")} strokeWidth={4} />
      <path d="M-120 -330 L300 -340 L310 -250 Q330 -180 320 -60 L360 200 L380 420 L300 540 L180 500 Q120 380 60 260 Q-20 160 -120 120 L-140 40 L-90 -20 Q-60 -100 -110 -170 Q-80 -250 -120 -330 Z" fill={L("#e2d8bc")} stroke={L("#9a8a6a")} strokeWidth={4} />
      <path d="M310 -340 Q420 -300 430 -120 Q440 20 360 60 L330 -60 Q330 -180 310 -250 Z" fill={L("#9ab4c4")} />
      <path d="M-120 -330 Q-80 -250 -110 -170 Q-60 -100 -90 -20 L-140 40 L-120 120" stroke={L("#7a9ab0")} strokeWidth={10} fill="none" />
      {/* roads */}
      <path d="M300 -130 Q0 -110 -300 -170 Q-460 -200 -560 -230" stroke={L("#c8a060")} strokeWidth={6} fill="none" />
      <path d="M300 -130 L260 300" stroke={L("#c8a060")} strokeWidth={5} fill="none" />
      <circle cx={300} cy={-130} r={14} fill={L("#2a2622")} />
      <circle cx={-560} cy={-230} r={12} fill={L("#2a2622")} />
      <path
        d="M300 -130 Q0 -110 -300 -170 Q-460 -200 -560 -230"
        stroke="#b8241c"
        strokeWidth={12}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${line * 900} 1000`}
      />
      <text x={330} y={-150} fontFamily="Frank Ruhl Libre, serif" fontSize={40} fill={L("#2a2622")} direction="rtl">
        שיקגו
      </text>
      <text x={-480} y={-250} fontFamily="Frank Ruhl Libre, serif" fontSize={40} fill={L("#2a2622")} direction="rtl" opacity={clamp(line * 2 - 1)}>
        איווה
      </text>
    </g>
  );
};

export const SignsAndMap: React.FC = () => {
  const { t } = useShot();
  const shadow = ramp(t, 4.0, 6.0, EASE.inOut);
  const flick = t > 4.2 && t < 6.2 ? (noise(t * 18, 2) > 0.55 ? 0.5 : 1) : 1;
  const line = ramp(t, 8.6, 10.4, EASE.inOut);
  const lamp: Light = { ...LAMP, amb: lerp(0.14, 0.34, shadow * (flick < 1 ? 1 : 0.6)) };
  const cam = {
    x: keys(t, [[0, 0], [4.0, 520], [7.2, 540], [8.4, 2100], [11.1, 2120]], EASE.inOut),
    y: keys(t, [[0, 0], [4.0, 180], [7.2, 190], [8.4, -40], [11.1, -60]], EASE.inOut),
    zoom: keys(t, [[0, 1.05], [4.0, 2.6], [7.2, 3.0], [8.4, 1.25], [11.1, 1.38]], EASE.inOut),
  };
  const young: React.ReactNode = (
    <g>
      <rect width={180} height={140} fill="#9a9a96" />
      <g transform="translate(90 216) scale(0.56)">
        <Person x={0} look={{ ...GACY_SUIT, jowls: 0.6 }} light={BW} view="front" pose={pose({ smile: 0.2 })} />
      </g>
    </g>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#140c08">
        <Plane d={0}>
          <Table t={t} light={lamp} />
          {SNAPS.map((s) => (
            <Photo key={s.id} id={`sg-${s.id}`} x={s.x} y={s.y} rot={s.rot} light={lamp} scene={s.draw} />
          ))}
          <Photo id="young" x={560} y={200} rot={4} w={200} h={156} light={lamp} scene={<g transform="scale(1.11)">{young}</g>} />
          <g transform="translate(2250 60)">
            <RoadMap line={line} />
          </g>
        </Plane>
        <Plane d={-1}>
          {/* the lamp's shade edge sliding over the table */}
          <Wash x={-1600} y={-1400} w={4200 * shadow + 10} h={2800} from="right" color="#000" opacity={0.5 * shadow} />
        </Plane>
      </Stage>
      <Finish temp={0.6} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Iowa

export const IowaLife: React.FC = () => {
  const { t } = useShot();
  const L: Light = { key: "#fff2dc", ambient: "#6a6460", amb: 0.06, desat: 0.15 };
  const cam = {
    x: keys(t, [[0, 1500], [1.9, 40], [4.2, 60], [6.8, 250]], EASE.inOut),
    y: keys(t, [[0, -2250], [1.9, -280], [4.2, -280], [6.8, -520]], EASE.inOut),
    zoom: keys(t, [[0, 0.95], [1.9, 1.55], [4.2, 1.55], [6.8, 0.55]], EASE.inOut),
  };
  const give = ramp(t, 2.1, 2.8) - ramp(t, 3.4, 3.9);
  const leave = walkBetween(t, 3.9, 6.8, 330, 1500);
  const gp = solve(STAND, GACY_MANAGER);
  const hand = reachAngles(gp.near.shoulder, { x: 170, y: -250 }, gp.torsoAngle, gp.dims.upper, gp.dims.fore);
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={2} t={t}>
        <Sky mode="day" t={t} clouds={0.8} />
        <Plane d={40}>
          {Array.from({ length: 12 }, (_, i) => (
            <Tree key={i} x={-9000 + i * 1600} h={1300 + (i % 3) * 300} light={L} t={t} seed={i + 50} tone="#4a6040" />
          ))}
        </Plane>
        <GroundStrip near={-12} far={40} color="#8a8a82" farColor="#7a8a60" light={L} />
        <Plane d={0}>
          <DriveIn
            x={0}
            light={L}
            inside={
              <>
                <Person x={-60} look={GACY_MANAGER} light={{ ...L, amb: 0.15 }} pose={talk(idle(pose({ smile: 1, nearUpper: lerp(10, hand.upper, give), nearFore: lerp(10, hand.fore, give) }), t, 4), t, 4, 0.8)} nearHold={give > 0.2 ? <rect x={-16} y={0} width={32} height={40} fill={lit("#c8a870", L)} /> : undefined} />
                <Person x={-400} look={{ ...WORKERS[1], top: "#e8e0d0", cap: "#c8322a" }} light={{ ...L, amb: 0.2 }} facing={-1} pose={idle(pose({ nearUpper: 40, nearFore: 60, lean: 10 }), t, 11)} />
              </>
            }
          />
        </Plane>
        <Plane d={-1.2}>
          <Person x={t < 3.9 ? 330 : leave.x} look={NEIGHBORS[2]} facing={t < 3.9 ? -1 : 1} light={L} pose={t < 3.9 ? idle(pose({ nearUpper: lerp(4, 60, give), nearFore: lerp(8, 50, give), smile: 0.8 }), t, 3) : walk(STAND, leave.phase, leave.amt)} nearHold={t > 3.4 ? <rect x={-16} y={0} width={32} height={40} fill={lit("#c8a870", L)} /> : undefined} />
        </Plane>
        <Plane d={-4}>
          <Car x={-1800} color="#6a8aa0" light={L} />
          <Person x={-850} look={{ ...NEIGHBORS[5], hair: "bob", hairColor: "#6a4a2a" }} facing={1} light={L} pose={idle(pose({ smile: 0.8 }), t, 9)} />
        </Plane>
      </Stage>
      <Finish temp={0.5} vignette={0.5} />
    </AbsoluteFill>
  );
};

export const Conviction: React.FC = () => {
  const { t } = useShot();
  const L = OVERCAST;
  const down = walkBetween(t, 0.6, 5.4, -700, 500);
  const stepY = (x: number) => (x < -300 ? -420 : x > 700 ? 0 : lerp(-420, 0, (x + 300) / 1000));
  const cuffed = pose({ nearUpper: 22, nearFore: 60, farUpper: 18, farFore: 64, neck: 10, brow: -0.3 });
  const deputy = { ...OFFICER, top: "#8a7a5a", shirt: "#7a6a4a", pants: "#4a4034", cap: "#4a4034" };
  const cam = {
    x: keys(t, [[0, -300], [6.4, 300]]),
    // starts high enough that the two men on the steps are below the frame, not sliced by it
    y: keys(t, [[0, -2200], [2.2, -420], [6.4, -330]], EASE.inOut),
    zoom: keys(t, [[0, 0.42], [2.2, 0.75], [6.4, 0.9]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Sky mode="overcast" t={t} clouds={0.9} />
        <GroundStrip near={-12} far={30} color="#8a8680" light={L} />
        <Plane d={3}>
          <Courthouse x={0} light={L} />
        </Plane>
        <Plane d={0}>
          <Person x={down.x} y={stepY(down.x)} look={GACY_SUIT} light={L} pose={walk(idle(cuffed, t, 2, 0.4), down.phase, down.amt * 0.7)} />
          <Person x={down.x + 160} y={stepY(down.x + 160)} look={deputy} light={L} pose={walk(idle(pose({ nearUpper: 40, nearFore: 50 }), t, 3), down.phase + 0.3, down.amt * 0.7)} />
        </Plane>
        <Plane d={-5}>
          <Car x={1600} color="#e8e4dc" kind="police" light={L} />
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const Cell: React.FC<{ readonly years?: [number, number] }> = ({ years = [1968, 1970] }) => {
  const { t, dur } = useShot();
  const L: Light = { key: "#d8dce2", ambient: "#1a1c22", amb: 0.32, desat: 0.3 };
  const pages = Math.floor(ramp(t, 0.8, dur - 0.6, EASE.inOut) * 20);
  const sun = keys(t, [[0, -900], [dur, 700]], EASE.linear);
  const cam = { x: keys(t, [[0, -260], [dur, -60]]), y: -300, zoom: keys(t, [[0, 1.2], [dur, 1.35]], EASE.drift) };
  const monthsShown = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const year = years[0] + Math.floor(pages / 12);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0c0d10">
        <Plane d={1.5}>
          <rect x={-2000} y={-1400} width={4000} height={1400} fill={lit("#8a8a84", L)} />
          <rect x={-2000} y={0} width={4000} height={600} fill={lit("#5a5a56", L)} />
          <rect x={-300} y={-1150} width={260} height={200} fill={lit("#c8d4e0", L)} />
          <Pool x={sun} y={-520} rx={280} ry={220} color="#e8e0c8" opacity={0.35} />
          {/* bunk */}
          <rect x={-900} y={-230} width={900} height={60} fill={lit("#4a4e52", L)} />
          <rect x={-900} y={-260} width={900} height={40} rx={10} fill={lit("#9a9a90", L)} />
          <rect x={-880} y={-170} width={16} height={170} fill={lit("#3a3e42", L)} />
          <rect x={-40} y={-170} width={16} height={170} fill={lit("#3a3e42", L)} />
          {/* wall calendar */}
          <g transform="translate(380 -560)">
            <rect x={-110} y={-140} width={220} height={280} fill={lit("#f0ece0", L)} />
            <rect x={-110} y={-140} width={220} height={60} fill={lit("#8a2a24", L)} />
            <text x={0} y={-98} textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontSize={34} fill={lit("#f0ece0", L)}>
              {year}
            </text>
            <text x={0} y={30} textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontSize={64} fill={lit("#2a2622", L)}>
              {monthsShown[pages % 12]}
            </text>
            {Array.from({ length: 4 }, (_, r) => (
              <rect key={r} x={-80} y={60 + r * 16} width={160} height={3} fill={lit("#b8b0a0", L)} />
            ))}
          </g>
        </Plane>
        <Plane d={1.3}>
          <Person x={-520} y={0} look={{ ...GACY, top: "#8a96a4", shirt: "#8a96a4", pants: "#4a5464" }} light={L} pose={idle(pose({ ...SIT, lean: 12, neck: 16, nearUpper: 30, nearFore: 70, farUpper: 26, farFore: 76 }), t, 5, 0.5)} />
        </Plane>
        <Plane d={-1.8}>
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={-2400 + i * 300} y={-2400} width={34} height={3200} fill={lit("#2a2c30", L)} />
          ))}
          <rect x={-2400} y={-1500} width={4800} height={40} fill={lit("#2a2c30", L)} />
        </Plane>
      </Stage>
      <Finish temp={-0.4} vignette={0.75} />
    </AbsoluteFill>
  );
};

export const Release: React.FC = () => {
  const { t } = useShot();
  const L = OVERCAST;
  const gate = ramp(t, 0.2, 1.4, EASE.inOut);
  const out = walkBetween(t, 1.0, 3.4, 0, 1400);
  const busX = t < 3.6 ? 2200 : lerp(2200, 9000, ramp(t, 3.6, 4.8, EASE.in));
  const cam = { x: keys(t, [[0, 100], [4.8, 1300]]), y: -360, zoom: keys(t, [[0, 0.95], [4.8, 0.8]]) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Sky mode="overcast" t={t} clouds={0.9} />
        <GroundStrip near={-12} far={30} color="#8a8680" light={L} />
        <Plane d={2}>
          <PrisonWall x0={-6000} x1={2600} light={L} gate={gate} gateX={0} />
        </Plane>
        <Plane d={0}>
          {t < 3.5 ? (
            <Person x={out.x} look={{ ...GACY, top: "#5a5448" }} light={L} opacity={ramp(t, 0.9, 1.3)} pose={walk(idle(pose({ farUpper: 20, farFore: 70 }), t, 3), out.phase, out.amt)} farHold={<rect x={-22} y={0} width={44} height={60} rx={4} fill={lit("#b8a07a", L)} />} />
          ) : null}
        </Plane>
        <Plane d={-2.5}>
          <Bus x={busX} light={L} />
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.6} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------- back in Chicago

export const MovingIn: React.FC = () => {
  const { t } = useShot();
  const L = DAY;
  const g = walkBetween(t, 0.2, 3.3, 900, -150);
  const mail = walkBetween(t, 0, 3.7, 2800, 1700);
  const bike = lerp(-3200, 3600, ramp(t, 0, 3.7, EASE.linear));
  const cam = { x: keys(t, [[0, 700], [3.7, 250]]), y: -380, zoom: 0.62 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Suburb
          t={t}
          mode="day"
          gacyLit={0}
          neighborsLit={0}
          onLawn={
            <Plane d={-5}>
              <Person x={g.x} look={GACY} facing={-1} light={L} pose={walk(pose({ ...CARRY, smile: 0.7 }), g.phase, g.amt)} nearHold={<rect x={-50} y={-10} width={100} height={80} fill={lit("#b89a6a", L)} transform="rotate(20)" />} />
              <Person x={mail.x} look={{ ...OFFICER, top: "#7a8aa0", shirt: "#7a8aa0", badge: false, cap: "#4a5a70" }} facing={-1} light={L} pose={walk(pose({ farUpper: 20, farFore: 60 }), mail.phase, mail.amt)} />
            </Plane>
          }
          onRoad={
            <Plane d={-11.4}>
              <Car x={1400} kind="pickup" color="#8a6a4a" facing={-1} light={L} />
            </Plane>
          }
          onNearWalk={
            <Plane d={-9}>
<Bicycle x={bike} light={L} />
              <Person x={bike - 10} y={-44} s={0.72} look={{ ...CHILD, top: "#c85a3a" }} light={L} grounded={false} shadow={false} pose={pose({ lean: 14, nearThigh: 70 + Math.sin(bike / 70) * 22, nearKnee: 80 - Math.sin(bike / 70) * 20, farThigh: 70 - Math.sin(bike / 70) * 22, farKnee: 80 + Math.sin(bike / 70) * 20, nearUpper: 62, nearFore: 18, farUpper: 60, farFore: 20, smile: 1 })} />
            </Plane>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

export const Nowhere: React.FC = () => {
  const { t, dur } = useShot();
  const L = DUSK;
  const cam = { x: keys(t, [[0, -400], [dur, 200]]), y: -700, zoom: keys(t, [[0, 0.28], [dur, 0.32]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Sky mode="dusk" t={t} clouds={0.9} />
        <GroundStrip near={-30} far={200} color="#5a5a3a" farColor="#6a6040" light={L} />
        <Plane d={60}>
          <Farmhouse x={0} light={L} lit={1} />
          <Tree x={-2200} h={1600} kind="bare" light={L} t={t} />
        </Plane>
        <Plane d={-8}>
          {Array.from({ length: 30 }, (_, i) => (
            <path key={i} d={`M${-6000 + i * 420} 0 L${-6000 + i * 420 + 30} ${-200 - hash(i) * 200} L${-6000 + i * 420 + 60} 0 Z`} fill={lit("#4a4a2a", L)} />
          ))}
        </Plane>
      </Stage>
      <Haze t={t} density={0.4} color="#9a8a7a" y={700} />
      <Finish temp={0.3} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const InFront: React.FC = () => {
  const { t } = useShot();
  const L = DAY;
  const cam = {
    x: keys(t, [[0, -100], [2.2, 150]]),
    // rises to the house, but stops with the people on the lawn still whole
    y: keys(t, [[0, -420], [2.2, -640]], EASE.out),
    zoom: keys(t, [[0, 0.62], [2.2, 0.5]], EASE.out),
  };
  const people = [
    { look: NEIGHBORS[0], x: -2500, d: -3.5, f: 1 as const },
    { look: NEIGHBORS[1], x: -1900, d: -8.8, f: 1 as const },
    { look: WORKERS[0], x: 1900, d: -5, f: -1 as const },
    { look: NEIGHBORS[3], x: 2600, d: -8.8, f: -1 as const },
    { look: NEIGHBORS[5], x: 3300, d: -2.5, f: -1 as const },
    { look: NEIGHBORS[2], x: -3300, d: -6, f: 1 as const },
    { look: NEIGHBORS[4], x: 900, d: -7, f: -1 as const },
  ];
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Suburb
          t={t}
          mode="day"
          gacyLit={0}
          neighborsLit={0}
          houses={3}
          onLawn={
            <>
              {people.map((p, i) => (
                <Plane key={i} d={p.d}>
                  <Person x={p.x} look={p.look} facing={p.f} light={L} pose={talk(idle(pose({ turn: 0.2, smile: 0.5 }), t, i + 60), t, i + 60, 0.3)} />
                </Plane>
              ))}
              <Plane d={-5.5}>
                <Person x={-150} look={GACY} light={L} pose={idle(pose({ ...wave(t), smile: 1 }), t, 70)} />
              </Plane>
            </>
          }
          onRoad={
            <Plane d={SUBURB.roadMid}>
              <Car x={lerp(-6000, 5000, ramp(t, 0, 2.2, EASE.linear))} color="#8a3a2a" light={L} />
            </Plane>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

const wave = (t: number) => ({ nearUpper: 150, nearFore: 30 + Math.sin(t * 9) * 26 });

