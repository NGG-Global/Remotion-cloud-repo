import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, mix, type Light } from "../engine/color";
import { Finish } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, hash, keys, lerp, ramp } from "../engine/time";
import { CityBlock } from "../kit/buildings";
import { Pool, Wash } from "../kit/light";
import { Photo } from "../kit/paper";
import { Bunting, Crowd, Flag, Sawhorse, flashAmount, PressCamera, Clipboard } from "../kit/props";
import { Corkboard, DressingTable, KitchenTable, Pin } from "../kit/rooms";
import { Sky } from "../kit/sky";
import { GroundStrip } from "../kit/street";
import { Car } from "../kit/vehicles";
import { Person, solve } from "../rig/Person";
import { DEFENSE, GACY, GACY_SUIT, GACY_WORK, NEIGHBORS, POGO, WORKERS } from "../rig/cast";
import { CARRY, STAND, SIT, gesture, idle, pose, reachAngles, talk, walk, walkBetween } from "../rig/pose";
import { BackyardParty, JobSite } from "./Opening";

/**
 * 2:10–2:56. The business, the parade, the parties, and Pogo: a man at a
 * mirror, a photograph nobody thought twice about, and a wall of other
 * 1970s clowns it fits right into.
 */

const DAY: Light = { key: "#fff6e8", ambient: "#6a6a70", amb: 0.06 };

// -------------------------------------------------------------- business

export const Business: React.FC = () => {
  const { t } = useShot();
  const L = DAY;
  const g = walkBetween(t, -0.3, 2.4, -1300, 80);
  const gp = t < 2.4 ? walk(idle(pose({ smile: 0.7 }), t, 2), g.phase, g.amt) : gesture(talk(idle(pose({ smile: 0.8, turn: 0.2 }), t, 2), t, 2, 0.9), t, 2, 0.8, "far");
  const w1 = walkBetween(t, 0, 5.25, 2600, -2400, 0.95);
  const w2 = walkBetween(t, 0.8, 5.25, -3200, 2400, 0.95);
  const cam = {
    x: keys(t, [[0, -900], [2.6, 300], [5.25, 420]], EASE.inOut),
    y: keys(t, [[0, -380], [5.25, -380]]),
    zoom: keys(t, [[0, 1.45], [2.6, 1.6], [5.25, 1.75]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={4} t={t}>
        <JobSite t={t} light={L} />
        <Plane d={3}>
          <Car x={-2400} kind="van" color="#e8e2d0" light={L} lettering />
        </Plane>
        <Plane d={1.4}>
          <Person x={w1.x} look={WORKERS[1]} facing={-1} light={L} pose={walk(pose({ ...CARRY }), w1.phase, w1.amt)} nearHold={<rect x={-10} y={0} width={20} height={420} fill={lit("#c8a070", L)} transform="rotate(-62)" />} />
        </Plane>
        <Plane d={0.4}>
          {/* blueprints on a sawhorse table */}
          <Sawhorse x={560} light={L} />
          <Sawhorse x={980} light={L} />
          <rect x={430} y={-200} width={680} height={22} fill={lit("#b8905e", L)} />
          <path d="M470 -206 L1060 -206 L1040 -226 L500 -226 Z" fill={lit("#3a5a7a", L)} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={520 + i * 100} y={-224} width={60} height={3} fill={lit("#bcd4e8", L)} />
          ))}
          <Person x={840} look={WORKERS[0]} facing={-1} light={L} pose={idle(pose({ lean: 16, neck: 14, nearUpper: 40, nearFore: 30, turn: 0.2 }), t, 6)} />
        </Plane>
        <Plane d={0}>
          <Person x={g.x} look={GACY_WORK} light={L} pose={gp} farHold={t > 2.4 ? undefined : <Clipboard light={L} />} />
        </Plane>
        <Plane d={-4.2}>
          <Person x={w2.x} look={WORKERS[2]} light={{ ...L, amb: 0.25 }} pose={walk(pose({ ...CARRY }), w2.phase, w2.amt)} nearHold={<rect x={-40} y={-20} width={80} height={520} fill={lit("#b8905e", L)} transform="rotate(-78)" />} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------- the parade

export const Parade: React.FC = () => {
  const { t, dur } = useShot();
  const L: Light = { key: "#fff2e0", ambient: "#6a6460", amb: 0.08, desat: 0.1 };
  const march = (x0: number) => x0 + t * 160;
  const shake = ramp(t, 2.4, 2.9) * (1 - ramp(t, 4.3, 4.65));
  const gp = solve(STAND, GACY_SUIT);
  const reach = reachAngles(gp.near.shoulder, { x: 118, y: -205 }, gp.torsoAngle, gp.dims.upper, gp.dims.fore);
  const pol = solve(STAND, DEFENSE);
  const reach2 = reachAngles(pol.near.shoulder, { x: 118, y: -205 }, pol.torsoAngle, pol.dims.upper, pol.dims.fore);
  const cam = {
    x: keys(t, [[0, -1600], [2.2, 200], [dur, 400]], EASE.inOut),
    y: keys(t, [[0, -560], [dur, -480]]),
    zoom: keys(t, [[0, 0.75], [2.2, 1.05], [dur, 1.2]], EASE.inOut),
  };
  const fl = flashAmount(t, 3.1);
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={4} t={t}>
        <Sky mode="day" t={t} clouds={0.6} />
        <Plane d={20}>
          <CityBlock x0={-12000} x1={12000} light={{ ...L, amb: 0.2 }} lit={0} seed={7} />
        </Plane>
        <GroundStrip near={-14} far={20} color="#6a6a66" light={L} />
        <Plane d={9}>
          <Bunting x0={-6000} x1={-2000} y={-1200} light={L} />
          <Bunting x0={-2000} x1={2000} y={-1200} light={L} />
          <Bunting x0={2000} x1={6000} y={-1200} light={L} />
          <Crowd x0={-7000} x1={7000} n={34} color={lit("#4a4038", L)} h={330} seed={3} t={t} />
        </Plane>
        <Plane d={4}>
          {/* marchers with flags, moving left to right */}
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <Person x={march(-5200 + i * 520)} look={{ ...NEIGHBORS[i % 6], top: i % 2 ? "#e8e2d4" : "#8a2a24" }} light={L} pose={walk(pose({ nearUpper: 70, nearFore: 60 }), march(-5200 + i * 520) / 300, 1)} />
              {i % 3 === 0 ? <Flag x={march(-5200 + i * 520) + 40} t={t + i} light={L} /> : null}
            </g>
          ))}
        </Plane>
        <Plane d={0}>
          {/* the reviewing stand */}
          <rect x={-300} y={-160} width={1400} height={160} fill={lit("#6a4a32", L)} />
          <rect x={-300} y={-180} width={1400} height={24} fill={lit("#e8e2d4", L)} />
          <Bunting x0={-300} x1={1100} y={-170} light={L} />
          <Person x={200} look={GACY_SUIT} light={L} pose={talk(idle(pose({ smile: 1, nearUpper: lerp(4, reach.upper, shake), nearFore: lerp(8, reach.fore + Math.sin(t * 10) * 3 * shake, shake) }), t, 4), t, 4, 0.8)} farHold={<Clipboard light={L} />} />
          <Person x={436} look={DEFENSE} facing={-1} light={L} pose={idle(pose({ smile: 0.9, nearUpper: lerp(4, reach2.upper, shake), nearFore: lerp(8, reach2.fore - Math.sin(t * 10) * 3 * shake, shake) }), t, 5)} />
          <Person x={760} look={NEIGHBORS[2]} facing={-1} light={L} pose={idle(pose({ farUpper: 60, farFore: 60 }), t, 9)} farHold={<PressCamera flash={fl} light={L} />} />
        </Plane>
        <Plane d={-4.5}>
          <Crowd x0={-5000} x1={5000} n={14} color="#1a1612" h={380} seed={11} t={t} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.55} />
    </AbsoluteFill>
  );
};

export const BigParty: React.FC = () => <BackyardParty wide />;

// ------------------------------------------------------------ the mirror

export const Mirror: React.FC = () => {
  const { t } = useShot();
  const warm: Light = { key: "#ffe0b0", ambient: "#1c140e", amb: 0.14 };
  // The camera crosses behind him. His head passes over the glass at about
  // 2.2 s; the reflection finishes becoming Pogo while it is hidden.
  const cam = {
    x: keys(t, [[0, -380], [4.6, 460], [6.2, 120], [9.3, 42]], EASE.inOut),
    y: keys(t, [[0, -300], [4.6, -300], [6.2, -290], [9.3, -242]], EASE.inOut),
    zoom: keys(t, [[0, 2.3], [4.6, 2.4], [6.2, 2.8], [9.3, 7.2]], EASE.inOut),
  };
  const full = t > 2.2;
  const paint = ramp(t, 0.3, 2.0);
  const seated = pose({ ...SIT, nearUpper: 120, nearFore: 128, farUpper: 40, farFore: 70 });
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#0e0a08">
        <Plane d={0.55}>
          <DressingTable
            light={warm}
            t={t}
            reflection={
              <g>
                <rect x={-300} y={-500} width={600} height={400} fill={lit("#2a221c", warm)} />
                <Person x={40} y={10} s={0.9} look={full ? POGO : GACY} light={{ ...warm, amb: 0.08 }} facing={1} pose={idle(pose({ ...seated, turn: -0.7, smile: full ? 1 : 0.1, nearUpper: full ? 20 : 120, nearFore: full ? 40 : 128 }), t, 3, 0.5)} />
                {!full ? <ellipse cx={46} cy={-236} rx={1 + 16 * paint} ry={1 + 20 * paint} fill="#f4f0e6" opacity={0.92} /> : null}
              </g>
            }
          />
        </Plane>
        <Plane d={-0.9}>
          <Person x={0} y={0} look={GACY} view="back" light={{ ...warm, amb: 0.5 }} pose={idle(seated, t, 4, 0.5)} shadow={false} />
        </Plane>
        <Plane d={-3}>
          <Wash x={-2600} y={-2000} w={1600} h={3000} from="left" color="#000" opacity={0.8} />
        </Plane>
      </Stage>
      <Finish temp={0.7} vignette={0.85} />
    </AbsoluteFill>
  );
};

// --------------------------------------------- a photograph, then a paper

export const PhotoOp: React.FC = () => {
  const { t } = useShot();
  const L: Light = { key: "#fff2dc", ambient: "#5a5048", amb: 0.08 };
  const flashAt = 2.7;
  const fl = flashAmount(t, flashAt);
  const inPaper = t > 3.1;
  const cam = inPaper
    ? { x: keys(t, [[3.1, 150], [4.6, 150], [6, 60]]), y: keys(t, [[3.1, -250], [4.6, -250], [6, -300]]), zoom: keys(t, [[3.1, 6.2], [4.6, 6.0], [6, 2.2]], EASE.inOut) }
    : { x: keys(t, [[0, -200], [3.1, 0]]), y: -470, zoom: keys(t, [[0, 1.2], [3.1, 1.35]]) };
  const pogoPose = idle(pose({ smile: 1, nearUpper: 150, nearFore: 30 + Math.sin(t * 7) * 18, turn: -0.5 }), t, 2);
  const turnPage = ramp(t, 4.8, 5.6, EASE.inOut);
  const breakfast: Light = { key: "#fff4e0", ambient: "#4a4038", amb: 0.08 };
  const scene = (
    <g>
      <rect width={420} height={300} fill="#d8d4cc" />
      <g transform="translate(210 290) scale(0.62)">
        <Person x={-40} look={POGO} light={{ key: "#ffffff", ambient: "#7a7a7a", amb: 0.05, desat: 1 }} pose={pogoPose} />
        <Person x={170} look={NEIGHBORS[1]} light={{ key: "#ffffff", ambient: "#7a7a7a", amb: 0.05, desat: 1 }} facing={-1} pose={pose({ smile: 1 })} />
        <Person x={-230} look={NEIGHBORS[0]} light={{ key: "#ffffff", ambient: "#7a7a7a", amb: 0.05, desat: 1 }} pose={pose({ smile: 1 })} />
      </g>
    </g>
  );
  return (
    <AbsoluteFill>
      {!inPaper ? (
        <Stage cam={cam} handheld={4} t={t}>
          <Sky mode="day" t={t} clouds={0.6} />
          <GroundStrip near={-10} far={20} color="#7a9258" light={L} />
          <Plane d={6}>
            <Bunting x0={-3000} x1={3000} y={-1100} light={L} />
            <Crowd x0={-3600} x1={3600} n={14} color={lit("#5a5048", L)} h={330} seed={5} t={t} />
          </Plane>
          <Plane d={0}>
            <Person x={-230} look={NEIGHBORS[0]} light={L} pose={idle(pose({ smile: 1 }), t, 6)} />
            <Person x={0} look={POGO} light={L} pose={pogoPose} />
            <Person x={220} look={NEIGHBORS[1]} light={L} facing={-1} pose={idle(pose({ smile: 1, turn: -0.4 }), t, 7)} />
          </Plane>
          <Plane d={-3.2}>
            <Person x={-800} look={NEIGHBORS[2]} light={{ ...L, amb: 0.5 }} pose={idle(pose({ nearUpper: 70, nearFore: 60, farUpper: 70, farFore: 60, neck: 6 }), t, 8)} farHold={<PressCamera flash={fl} light={L} />} />
          </Plane>
        </Stage>
      ) : (
        <Stage cam={cam} t={t}>
          <Plane d={2.5}>
            <KitchenTable light={breakfast} t={t} />
          </Plane>
          <Plane d={0}>
            <Person x={0} look={NEIGHBORS[0]} light={breakfast} facing={1} pose={idle(pose({ ...SIT, nearUpper: 70, nearFore: 62, farUpper: 74, farFore: 58, neck: 10, turn: 0.3 }), t, 9, 0.4)} />
          </Plane>
          <Plane d={-0.6}>
            <g transform={`translate(150 -250) rotate(-4) scale(${1 - turnPage * 0.08})`}>
              <rect x={-140} y={-95} width={280} height={190} fill={lit("#e6e0d0", breakfast)} />
              <rect x={-128} y={-86} width={256} height={16} fill={lit("#3a3632", breakfast)} opacity={0.8} />
              <Photo id="paper-pogo" x={-38} y={10} w={150} h={107} border={0} light={breakfast} scene={<g transform="scale(0.357)">{scene}</g>} />
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={i} x={54} y={-56 + i * 15} width={70} height={4} fill={lit("#9a948a", breakfast)} />
              ))}
              <rect x={-140 + turnPage * 140} y={-95} width={280 * (1 - turnPage) + 1} height={190} fill={lit("#ded8c8", breakfast)} opacity={turnPage > 0 ? 1 : 0} />
            </g>
          </Plane>
        </Stage>
      )}
      {fl > 0 ? <AbsoluteFill style={{ backgroundColor: "#fff", opacity: fl * 0.9 }} /> : null}
      <Finish temp={0.4} vignette={0.55} />
    </AbsoluteFill>
  );
};

// -------------------------------------------- every clown of the seventies

const CLOWN_VARIANTS = [
  { hair: "#c83a2a", top: "#3a6a9a", nose: true },
  { hair: "#e8c23a", top: "#8a3a8a", nose: true },
  { hair: "#3a8a4a", top: "#e8a83a", nose: true },
  { hair: "#f0ece0", top: "#c83a2a", nose: true },
  { hair: "#6a3a2a", top: "#3a8a8a", nose: true },
  { hair: "#e86a2a", top: "#4a4a8a", nose: true },
];

const ClownSnap: React.FC<{ i: number; pogo?: boolean }> = ({ i, pogo }) => {
  const v = CLOWN_VARIANTS[i % CLOWN_VARIANTS.length];
  const look = pogo ? POGO : { ...POGO, hairColor: v.hair, top: v.top, pants: v.top, build: (["slim", "average", "heavy"] as const)[i % 3], jowls: 0 };
  const faded: Light = { key: "#f4e2c4", ambient: "#6a5a4a", amb: 0.08, desat: 0.35 };
  return (
    <g>
      <rect width={220} height={170} fill={mix("#c8b8a0", "#8aa0b0", hash(i) * 0.6)} />
      <g transform="translate(110 240) scale(0.62)">
        <Person x={0} look={look} light={faded} view={i % 2 ? "front" : "3q"} pose={pose({ smile: 1, nearUpper: i % 3 === 0 ? 150 : 10, nearFore: 30, farUpper: i % 4 === 1 ? 140 : 10, farFore: 30, turn: -0.5 })} />
      </g>
    </g>
  );
};

export const ClownBoard: React.FC<{ readonly dim?: boolean }> = ({ dim = false }) => {
  const { t, dur } = useShot();
  const warmK = dim ? 1 - ramp(t, 1.2, 4.2) : 1;
  const L: Light = { key: mix("#b8c4d8", "#ffe8c8", warmK), ambient: "#140e0a", amb: lerp(0.5, 0.12, warmK), desat: lerp(0.6, 0, warmK) };
  const spots = Array.from({ length: 18 }, (_, i) => ({
    x: -2200 + (i % 9) * 540 + (hash(i) - 0.5) * 80,
    y: -380 + Math.floor(i / 9) * 420 + (hash(i + 4) - 0.5) * 60,
    rot: (hash(i * 3) - 0.5) * 12,
  }));
  const pogoI = 12;
  const cam = dim
    ? {
        x: keys(t, [[0, spots[pogoI].x - 200], [dur, spots[pogoI].x]], EASE.drift),
        y: keys(t, [[0, spots[pogoI].y + 40], [dur, spots[pogoI].y]], EASE.drift),
        zoom: keys(t, [[0, 1.9], [dur, 3.6]], EASE.inOut),
      }
    : {
        x: keys(t, [[0, -1900], [dur, spots[pogoI].x - 200]], EASE.inOut),
        y: keys(t, [[0, -300], [dur, spots[pogoI].y + 40]], EASE.inOut),
        zoom: keys(t, [[0, 1.5], [dur, 1.9]], EASE.inOut),
      };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#100c08">
        <Plane d={0}>
          <Corkboard light={L}>
            {spots.map((s, i) => {
              const k = dim && i !== pogoI ? 1 - ramp(t, 1.0 + hash(i) * 2, 3.5 + hash(i) * 2) : 1;
              return (
                <g key={i} opacity={0.15 + 0.85 * k}>
                  <Photo id={`cb${i}${dim ? "d" : ""}`} x={s.x} y={s.y} w={220} h={170} rot={s.rot} light={L} scene={<ClownSnap i={i} pogo={i === pogoI} />} />
                  <Pin x={s.x} y={s.y - 95} light={L} c={["#c83a2a", "#3a6ac8", "#e8c23a"][i % 3]} />
                </g>
              );
            })}
          </Corkboard>
        </Plane>
        <Plane d={-1}>
          <Pool x={cam.x} y={cam.y} rx={900} ry={600} color={dim ? "#9ab0d0" : "#ffd9a0"} opacity={dim ? 0.2 : 0.18} />
        </Plane>
      </Stage>
      <Finish temp={dim ? -0.5 : 0.5} vignette={dim ? 0.95 : 0.7} />
    </AbsoluteFill>
  );
};

export const InHindsight: React.FC = () => <ClownBoard dim />;

