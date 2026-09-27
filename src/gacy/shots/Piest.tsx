import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, type Light } from "../engine/color";
import { Finish } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, keys, lerp, ramp } from "../engine/time";
import { Pool } from "../kit/light";
import { PHARM, PharmacyFront, PharmacyInterior } from "../kit/pharmacy";
import { Sky, Snow } from "../kit/sky";
import { GroundStrip, StreetLamp } from "../kit/street";
import { Car } from "../kit/vehicles";
import { Person, solve } from "../rig/Person";
import { GACY_COAT, MOTHER, NEIGHBORS, OWNER, ROBERT, ROBERT_PARKA } from "../rig/cast";
import { STAND, gesture, idle, pose, reachAngles, talk, walk, walkBetween } from "../rig/pose";

/**
 * 4:57–5:31. Robert Piest. Nothing violent is shown. A boy at work, his
 * mother arriving, a conversation with a contractor, "a few minutes", a
 * door closing, and then the one thing the picture holds on: waiting.
 */

const WINTER_NIGHT: Light = { key: "#9aaccc", ambient: "#0e1520", amb: 0.46, desat: 0.3 };
const STORE: Light = { key: "#f2f8f0", ambient: "#3a3e3c", amb: 0.1, desat: 0.05 };
const SNOWLOT = "#c8d2dc";

const Lot: React.FC<{ t: number; carX: number | null; tracks?: number }> = ({ t, carX, tracks = 0 }) => (
  <>
    <GroundStrip near={-20} far={60} color={SNOWLOT} farColor="#aab6c4" light={WINTER_NIGHT} />
    <Plane d={-3}>
      <StreetLamp x={-2600} on={1} light={WINTER_NIGHT} t={t} />
      {carX !== null ? <Car x={carX} color="#1e1e22" facing={-1} light={WINTER_NIGHT} headlights={carX > 2500 ? 1 : 0.6} snow={0.4} /> : null}
      {tracks > 0 ? (
        <g opacity={tracks}>
          {[-60, 60].map((o) => (
            <path key={o} d={`M1400 ${o * 0.2} Q2600 ${o * 0.2 + 20} 6000 ${o * 0.3 + 60}`} stroke="#8a96a6" strokeWidth={36} fill="none" opacity={0.55} />
          ))}
        </g>
      ) : null}
    </Plane>
  </>
);

export const PharmacyNight: React.FC = () => {
  const { t, dur } = useShot();
  const carX = t < 2.3 ? null : lerp(5200, 1400, ramp(t, 2.3, dur, EASE.out));
  const stock = Math.sin(t * 2.2) * 0.5 + 0.5;
  const cam = { x: keys(t, [[0, -300], [dur, 250]]), y: -560, zoom: keys(t, [[0, 0.52], [dur, 0.6]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#05070b">
        <Sky mode="night" t={t} stars={false} clouds={0.8} />
        <Plane d={8}>
          <PharmacyFront
            light={WINTER_NIGHT}
            inside={
              <g>
                <PharmacyInterior light={STORE} t={t} minutes={0} snow={false} />
                <Person x={-600} look={ROBERT} light={STORE} pose={idle(pose({ nearUpper: lerp(60, 150, stock), nearFore: 30, turn: 0.2 }), t, 2)} />
                <Person x={600} look={NEIGHBORS[1]} facing={-1} light={STORE} pose={idle(STAND, t, 5)} />
              </g>
            }
          />
        </Plane>
        <Lot t={t} carX={carX} />
      </Stage>
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <Snow t={t} density={0.9} />
        </svg>
      </AbsoluteFill>
      <Finish temp={-0.5} vignette={0.75} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------ inside, working

export const Shift: React.FC = () => {
  const { t, dur } = useShot();
  const cam = {
    x: keys(t, [[0, -2200], [4.6, -900], [dur, -500]], EASE.inOut),
    y: keys(t, [[0, -400], [dur, -420]]),
    zoom: keys(t, [[0, 1.25], [4.6, 1.4], [dur, 1.1]], EASE.inOut),
  };
  const reach = Math.max(0, Math.sin(t * 1.4));
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={2} t={t}>
        <Plane d={1.5}>
          <PharmacyInterior light={STORE} t={t} minutes={0} />
        </Plane>
        <Plane d={0}>
          <Person x={-1500} look={ROBERT} light={STORE} pose={idle(pose({ nearUpper: lerp(40, 160, reach), nearFore: lerp(40, 20, reach), turn: t > 6 ? -0.4 : 0.1 }), t, 2)} nearHold={reach > 0.4 ? <rect x={-12} y={0} width={24} height={34} rx={4} fill={lit("#c8483a", STORE)} /> : undefined} />
          <Person x={-120} look={OWNER} facing={1} light={STORE} pose={talk(idle(pose({ smile: 0.3 }), t, 3), t, 3, 0.5)} />
          <Person x={180} look={GACY_COAT} facing={-1} light={STORE} pose={gesture(talk(idle(pose({ smile: 0.8 }), t, 4), t, 4), t, 4, 0.8)} />
        </Plane>
        <Plane d={-2.4}>
          {/* a shelf end passing close to the lens as the camera tracks */}
          <rect x={-3000} y={-1400} width={260} height={1500} fill={lit("#5a6a6a", { ...STORE, amb: 0.6 })} />
          <rect x={-900} y={-1400} width={220} height={1500} fill={lit("#5a6a6a", { ...STORE, amb: 0.6 })} />
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.6} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------ his mother

export const MotherArrives: React.FC = () => {
  const { t, dur } = useShot();
  const door = ramp(t, 0, 0.5) * (1 - ramp(t, 1.3, 1.8));
  const m = walkBetween(t, 0.15, dur + 0.4, PHARM.door + 60, PHARM.door - 520);
  const cam = { x: keys(t, [[0, 900], [dur, 820]]), y: -420, zoom: 1.45 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={1.5}>
          <PharmacyInterior light={STORE} t={t} doorOpen={door} />
        </Plane>
        <Plane d={0.2}>
          <Person x={m.x} look={MOTHER} facing={-1} light={STORE} pose={walk(idle(pose({ smile: 0.5, turn: -0.3, ...(t > 1.2 ? { nearUpper: 140, nearFore: 30 + Math.sin(t * 8) * 20 } : {}) }), t, 6), m.phase, m.amt)} />
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const TellsMom: React.FC = () => {
  const { t, dur } = useShot();
  const point = ramp(t, 2.6, 3.1) * (1 - ramp(t, 4.6, 5.1));
  const r = solve(STAND, ROBERT);
  const aim = reachAngles(r.near.shoulder, { x: -260, y: -300 }, r.torsoAngle, r.dims.upper, r.dims.fore);
  const cam = { x: keys(t, [[0, 520], [dur, 470]]), y: -430, zoom: keys(t, [[0, 1.75], [dur, 1.9]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={3}>
          <PharmacyInterior light={STORE} t={t} />
          <Person x={-200} look={GACY_COAT} facing={1} light={{ ...STORE, amb: 0.25 }} pose={talk(idle(pose({ smile: 0.6 }), t, 4), t, 4, 0.4)} />
          <Person x={80} look={OWNER} facing={-1} light={{ ...STORE, amb: 0.25 }} pose={idle(STAND, t, 3)} />
        </Plane>
        <Plane d={0}>
          <Person x={300} look={ROBERT} facing={1} light={STORE} pose={talk(idle(pose({ turn: -0.2, nearUpper: lerp(4, aim.upper + 180, point), nearFore: lerp(8, 10, point), smile: 0.4 }), t, 2), t, 2, 0.9)} />
          <Person x={620} look={MOTHER} facing={-1} light={STORE} pose={idle(pose({ smile: 0.4, brow: t > 3 ? -0.2 : 0, turn: -0.2 }), t, 6)} />
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const SummerJob: React.FC = () => {
  const { t, dur } = useShot();
  const cam = { x: keys(t, [[0, -90], [dur, -40]]), y: -440, zoom: keys(t, [[0, 2.0], [dur, 2.15]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={1.5}>
          <PharmacyInterior light={STORE} t={t} />
        </Plane>
        <Plane d={0}>
          <Person x={-260} look={GACY_COAT} facing={1} light={STORE} pose={gesture(talk(idle(pose({ smile: 1, turn: -0.1 }), t, 4), t, 4), t, 4, 1)} />
          <Person x={80} look={ROBERT} facing={-1} light={STORE} pose={idle(pose({ smile: 0.3, neck: Math.sin(t * 3) * 3, turn: -0.1 }), t, 2)} />
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const FewMinutes: React.FC = () => {
  const { t, dur } = useShot();
  const hand = ramp(t, 0.2, 0.5) * (1 - ramp(t, 1.4, 1.7));
  const out = walkBetween(t, 1.5, 3.1, 520, PHARM.door + 80);
  const door = ramp(t, 2.6, 2.9) * (1 - ramp(t, 3.1, 3.4));
  const cam = { x: keys(t, [[0, 640], [dur, 900]]), y: -430, zoom: 1.5 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={1.5}>
          <PharmacyInterior light={STORE} t={t} doorOpen={door} />
        </Plane>
        <Plane d={0.2}>
          {t < 3.2 ? (
            <Person x={out.x} look={t > 1.2 ? ROBERT_PARKA : ROBERT} facing={t > 1.4 ? 1 : -1} light={STORE} pose={walk(idle(pose({ smile: 0.5, turn: -0.3, nearUpper: lerp(4, 110, hand), nearFore: lerp(8, 20, hand) }), t, 2), out.phase, out.amt)} />
          ) : null}
          <Person x={330} look={MOTHER} facing={1} light={STORE} pose={idle(pose({ smile: 0.3, turn: t > 2 ? 0.4 : 0 }), t, 6)} />
        </Plane>
      </Stage>
      <Finish temp={-0.1} vignette={0.65} />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------- waiting

export const Waiting: React.FC = () => {
  const { t, dur } = useShot();
  const minutes = lerp(0, 55, ramp(t, 0.2, 5.4, EASE.inOut));
  const back = 1 - ramp(t, 2.8, 3.2);
  const cust = walkBetween(t, 0.3, 2.4, -300, PHARM.door + 60);
  const cam = {
    x: keys(t, [[0, 500], [dur, 1060]], EASE.drift),
    y: keys(t, [[0, -440], [dur, -330]], EASE.drift),
    zoom: keys(t, [[0, 1.2], [dur, 2.1]], EASE.drift),
  };
  const lightNow: Light = { ...STORE, amb: lerp(0.1, 0.28, 1 - back) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={1.5}>
          <PharmacyInterior
            light={lightNow}
            t={t}
            back={back}
            minutes={minutes}
            doorOpen={ramp(t, 2.0, 2.3) * (1 - ramp(t, 2.6, 2.9))}
            outside={
              <g>
                {/* the lot, empty now, tyre tracks already filling with snow */}
                <rect x={PHARM.door - 130} y={-300} width={260} height={300} fill="#8a96a8" opacity={0.5} />
                <path d={`M${PHARM.door - 130} -120 Q${PHARM.door} -150 ${PHARM.door + 130} -190`} stroke="#6a7686" strokeWidth={14} fill="none" opacity={0.6} />
                <path d={`M${PHARM.door - 130} -70 Q${PHARM.door} -100 ${PHARM.door + 130} -140`} stroke="#6a7686" strokeWidth={14} fill="none" opacity={0.6} />
              </g>
            }
          />
        </Plane>
        <Plane d={0}>
          {t < 2.5 ? <Person x={cust.x} look={NEIGHBORS[2]} light={lightNow} pose={walk(STAND, cust.phase, cust.amt)} /> : null}
          <Person x={700} look={MOTHER} facing={1} light={lightNow} pose={idle(pose({ brow: -0.4, turn: 0.6, farUpper: 10, farFore: 90, nearUpper: 12, nearFore: 86 }), t, 6, 0.4)} />
        </Plane>
        <Plane d={-1}>
          <Pool x={PHARM.door} y={-200} rx={400} ry={400} color="#9ab0c8" opacity={0.15} />
        </Plane>
      </Stage>
      <Finish temp={-0.3} vignette={0.8} />
    </AbsoluteFill>
  );
};
