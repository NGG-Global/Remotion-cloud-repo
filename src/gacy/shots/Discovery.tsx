import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, mix, type Light } from "../engine/color";
import { Finish, Haze } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, hash, keys, lerp, noise, ramp } from "../engine/time";
import { Beam, Glow, Pool } from "../kit/light";
import { Flashlight, Trowel } from "../kit/props";
import { HouseSection, Marker, PATCHES, SEC } from "../kit/section";
import { Motes, Sky } from "../kit/sky";
import { GroundStrip, Tree } from "../kit/street";
import { Person } from "../rig/Person";
import { NEIGHBORS, OFFICER, TECH, WORKERS } from "../rig/cast";
import { CRAWL, KNEEL, idle, pose, walk, walkBetween } from "../rig/pose";
import { TYPE } from "../theme";
import { TRENCH_CAM } from "./Underneath";

/**
 * 6:53–7:35. The search under the house, escalating: a hatch, a light, the
 * same framing the workers dug in, one investigator kneeling, one marker,
 * then more, then the camera backs out until the scale is plain. Nothing
 * is shown but soil and markers. Then the number, and the people it is.
 */

const ROOM_WINTER: Light = { key: "#fff0dc", ambient: "#3a342c", amb: 0.12, desat: 0.1 };
const CRAWL_SEARCH: Light = { key: "#c8ccd4", ambient: "#07080a", amb: 0.5, desat: 0.35 };

const bg = <rect x={-20000} y={-6000} width={40000} height={12000} fill="#05060a" />;
const crawlY = 58;

/** An investigator on hands and knees with a torch; the beam is aimed at `aim`. */
const Searcher: React.FC<{
  x: number;
  t: number;
  aimX: number;
  facing?: 1 | -1;
  kneel?: boolean;
  seed?: number;
  move?: number;
}> = ({ x, t, aimX, facing = -1, kneel = false, seed = 0, move = 0 }) => {
  const handX = x + facing * (kneel ? 70 : 110);
  const handY = kneel ? -40 : -30;
  const angle = (Math.atan2(40 - handY, aimX - handX) * 180) / Math.PI;
  return (
    <g>
      <Beam x={handX} y={handY + crawlY - 20} angle={angle + noise(t * 0.6, seed) * 4} length={Math.min(520, Math.abs(aimX - handX) + 240)} spread={26} color="#fff6dc" opacity={0.55} />
      <Pool x={aimX} y={40} rx={120} ry={22} color="#fff2d0" opacity={0.45} />
      <Person
        x={x}
        y={crawlY}
        s={0.95}
        look={TECH}
        facing={facing}
        light={CRAWL_SEARCH}
        pose={kneel ? idle(pose({ ...KNEEL, lean: 34, neck: 18, nearUpper: 70, nearFore: 20 }), t, seed, 0.3) : walk(CRAWL, move, move > 0 ? 0.25 : 0)}
        nearHold={<Flashlight light={CRAWL_SEARCH} />}
      />
    </g>
  );
};

export const Hatch: React.FC = () => {
  const { t, dur } = useShot();
  const lid = ramp(t, 3.1, 4.1, EASE.inOut);
  const down = ramp(t, 4.6, 7.4, EASE.inOut);
  const cam = {
    x: keys(t, [[0, -180], [4.6, -100], [dur, -150]], EASE.inOut),
    y: keys(t, [[0, -330], [4.6, -300], [dur, -60]], EASE.inOut),
    zoom: keys(t, [[0, 1.9], [4.6, 2.1], [dur, 2.6]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#05060a">
        <Plane d={0}>
          {bg}
          <HouseSection
            t={t}
            night={false}
            roomLight={ROOM_WINTER}
            crawlLight={{ ...CRAWL_SEARCH, amb: 0.7 }}
            lamps={0.4}
            snow={1}
            crawl={{ patches: 12, trenches: 0.66, hatch: lid, vents: 0.2 }}
            hall={
              <Person x={40} y={SEC.floor} look={OFFICER} facing={-1} light={ROOM_WINTER} pose={idle(pose({ ...KNEEL, lean: 30 + down * 10, neck: 20 + down * 12, nearUpper: lerp(40, 90, lid), nearFore: lerp(40, 10, lid) }), t, 2, 0.4)} nearHold={<Flashlight light={ROOM_WINTER} />} />
            }
            under={
              lid > 0.6 ? (
                <g>
                  <Beam x={-50} y={SEC.floor + 20} angle={lerp(80, 120, down)} length={lerp(200, 520, down)} spread={30} color="#fff6dc" opacity={0.6} />
                  <Pool x={lerp(-60, -300, down)} y={40} rx={170} ry={28} color="#fff2d0" opacity={0.5 * down} />
                </g>
              ) : null
            }
          />
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.8} />
    </AbsoluteFill>
  );
};

export const DigBegins: React.FC = () => {
  const { t, dur } = useShot();
  const a = walkBetween(t, 0, 2.6, SEC.hatchX, -520);
  const b = walkBetween(t, 0.6, 3.6, SEC.hatchX + 40, -150);
  const c = walkBetween(t, 1.3, 4.4, SEC.hatchX + 60, 280);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...TRENCH_CAM, x: keys(t, [[0, TRENCH_CAM.x + 40], [dur, TRENCH_CAM.x - 20]], EASE.drift) }} handheld={2} t={t} bg="#05060a">
        <Plane d={0}>
          {bg}
          <HouseSection
            t={t}
            night={false}
            roomLight={ROOM_WINTER}
            crawlLight={CRAWL_SEARCH}
            lamps={0.4}
            snow={1}
            crawl={{ patches: 12, trenches: 0.66, hatch: 1, workLight: 0.5, vents: 0.2 }}
            hall={<Person x={40} y={SEC.floor} look={OFFICER} facing={-1} light={ROOM_WINTER} pose={idle(pose({ lean: 20, neck: 24 }), t, 3)} />}
            under={
              <g>
                <Searcher x={a.amt > 0 ? a.x : -520} t={t} aimX={-580} kneel={a.amt === 0 && t > 2.6} seed={1} move={a.phase} />
                <Searcher x={b.amt > 0 ? b.x : -150} t={t} aimX={-230} seed={2} move={b.phase} />
                <Searcher x={c.amt > 0 ? c.x : 280} t={t} aimX={180} facing={-1} seed={3} move={c.phase} />
                <Motes t={t} x={-1000} y={-110} w={1600} h={150} n={40} color="#e8e4d8" opacity={0.45} />
              </g>
            }
          />
        </Plane>
      </Stage>
      <Finish temp={-0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

/** One continuous framing for the finds: first marker, then more, then the scale. */
const Finds: React.FC<{ readonly stage: "first" | "more" | "all" }> = ({ stage }) => {
  const { t, dur } = useShot();
  const p0 = PATCHES[0];
  let markers = 0;
  let cam = { x: p0.x, y: 0, zoom: 3.4 };
  if (stage === "first") {
    markers = ramp(t, 1.0, 1.4, EASE.out);
    cam = { x: keys(t, [[0, p0.x + 40], [dur, p0.x + 20]]), y: keys(t, [[0, -10], [dur, 0]]), zoom: keys(t, [[0, 3.2], [dur, 3.5]], EASE.drift) };
  } else if (stage === "more") {
    markers = 1 + ramp(t, 0.5, 0.8, EASE.out) + ramp(t, 1.9, 2.2, EASE.out) + ramp(t, 2.4, 2.7, EASE.out);
    cam = { x: keys(t, [[0, p0.x + 20], [dur, p0.x + 160]]), y: keys(t, [[0, 0], [dur, -20]]), zoom: keys(t, [[0, 3.5], [dur, 2.4]], EASE.inOut) };
  } else {
    markers = lerp(4, 27, ramp(t, 0.3, 4.8, EASE.inOut));
    cam = {
      x: keys(t, [[0, p0.x + 160], [5.5, 200], [dur, 500]], EASE.inOut),
      y: keys(t, [[0, -20], [5.5, -260], [dur, -300]], EASE.inOut),
      zoom: keys(t, [[0, 2.4], [5.5, 0.62], [dur, 0.5]], EASE.inOut),
    };
  }
  const yard = stage === "all" ? ramp(t, 5.2, 5.6) + ramp(t, 6.4, 6.8) : 0;
  const many = stage === "all" ? ramp(t, 1.2, 3.8) : 0;
  const freeze = stage === "first" ? ramp(t, 0.3, 0.7) : 1;
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={stage === "all" ? 2 : 1} t={t} bg="#05060a">
        <Plane d={0}>
          {bg}
          <HouseSection
            t={t}
            night={false}
            roomLight={ROOM_WINTER}
            crawlLight={CRAWL_SEARCH}
            lamps={0.4}
            snow={1}
            crawl={{ patches: 16, trenches: 0.66, hatch: 1, workLight: 0.5, markers, vents: 0.2 }}
            under={
              <g>
                <Searcher x={p0.x + 110} t={t} aimX={p0.x} kneel seed={1} />
                {stage !== "first" ? <Searcher x={-150} t={t} aimX={PATCHES[1].x} kneel seed={2} /> : null}
                {stage === "all"
                  ? [PATCHES[4].x + 100, PATCHES[6].x + 120, PATCHES[8].x + 110, PATCHES[5].x + 100].map((x, i) => (
                      <g key={i} opacity={many}>
                        <Searcher x={x} t={t} aimX={x - 110} kneel seed={i + 5} />
                      </g>
                    ))
                  : null}
                {stage === "first" ? (
                  <g transform={`translate(${p0.x + 30} ${10 - freeze * 6})`}>
                    <Trowel light={CRAWL_SEARCH} />
                  </g>
                ) : null}
              </g>
            }
          />
          {/* elsewhere on the property: under the garage slab and the drive */}
          {stage === "all" ? (
            <g>
              <rect x={1500} y={-40} width={1100} height={40} fill={lit("#8a867e", CRAWL_SEARCH)} />
              <rect x={1500} y={0} width={1100} height={400} fill={lit("#3b2d22", CRAWL_SEARCH)} />
              <Marker x={1800} y={120} n={28} k={yard} light={CRAWL_SEARCH} />
              <Marker x={2300} y={80} n={29} k={yard - 1} light={CRAWL_SEARCH} />
            </g>
          ) : null}
        </Plane>
      </Stage>
      <Finish temp={-0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const FirstFind: React.FC = () => <Finds stage="first" />;
export const MoreFinds: React.FC = () => <Finds stage="more" />;
export const AllFinds: React.FC = () => <Finds stage="all" />;

// ------------------------------------------------------------ the river

export const River: React.FC = () => {
  const { t, dur } = useShot();
  const L: Light = { key: "#b8c4d8", ambient: "#101624", amb: 0.4, desat: 0.3 };
  const boat = lerp(-1400, 600, ramp(t, 0, dur, EASE.linear));
  const cam = { x: keys(t, [[0, boat - 700], [dur, boat - 300]]), y: -330, zoom: keys(t, [[0, 0.8], [dur, 0.9]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Sky mode="predawn" t={t} clouds={0.8} />
        <Plane d={40}>
          {Array.from({ length: 30 }, (_, i) => (
            <Tree key={i} x={-15000 + i * 1000} h={1400 + (i % 3) * 400} kind="bare" light={L} t={t} seed={i} />
          ))}
          <path d="M-6000 -900 L-2000 -1100 L2000 -1100 L6000 -900 L6000 -800 L-6000 -800 Z" fill={lit("#1e222a", L)} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M${-5000 + i * 900} -800 L${-4550 + i * 900} -1080 L${-4100 + i * 900} -800`} stroke={lit("#1e222a", L)} strokeWidth={30} fill="none" />
          ))}
          {[-4000, 0, 4000].map((px) => (
            <rect key={px} x={px - 60} y={-800} width={120} height={800} fill={lit("#1e222a", L)} />
          ))}
        </Plane>
        <GroundStrip near={-30} far={40} color="#1c2838" farColor="#2a3848" light={L} />
        <Plane d={0}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M${-6000 + i * 800 + ((t * 30) % 800)} ${20 + (i % 3) * 30} l200 0`} stroke="#8aa0b8" strokeWidth={4} opacity={0.3} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx={-5000 + i * 1400 + hash(i) * 400} cy={40 + hash(i + 3) * 40} rx={160 + hash(i) * 120} ry={14} fill={lit("#c8d0da", L)} opacity={0.7} />
          ))}
          {/* the police boat and its searchlight */}
          <g transform={`translate(${boat} 0)`}>
            <path d="M-300 0 L300 0 L360 -80 L-340 -80 Z" fill={lit("#2a3040", L)} />
            <rect x={-120} y={-200} width={200} height={120} fill={lit("#3a4050", L)} />
            <rect x={-100} y={-180} width={160} height={50} fill={lit("#1a2028", L)} />
            <circle cx={120} cy={-150} r={14} fill="#fff8e0" />
            <Beam x={130} y={-150} angle={20 + noise(t * 0.5, 2) * 8} length={1400} spread={16} color="#fff4d8" opacity={0.55} />
            <Glow x={120} y={-150} r={220} color="#fff4d8" opacity={0.5} />
          </g>
        </Plane>
        <Plane d={-6}>
          <path d="M-9000 0 Q-4000 -260 0 -120 T 9000 -200 L9000 1400 L-9000 1400 Z" fill={lit("#c8d0da", { ...L, amb: 0.55 })} />
        </Plane>
      </Stage>
      <Haze t={t} density={0.4} color="#6a7890" y={650} />
      <Finish temp={-0.7} vignette={0.8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------ a number, then people

const YOUNG = [WORKERS[0], WORKERS[1], WORKERS[2], WORKERS[3], NEIGHBORS[4]];

export const ThirtyThree: React.FC = () => {
  const { t, dur } = useShot();
  const plan = 1 - ramp(t, 3.4, 4.4);
  const num = ramp(t, 1.9, 2.6, EASE.out) * (1 - ramp(t, 3.6, 4.6, EASE.in));
  const people = ramp(t, 3.9, 5.6, EASE.inOut);
  const cam = { x: 0, y: keys(t, [[0, 0], [3.6, -60], [dur, -160]]), zoom: keys(t, [[0, 1.3], [3.6, 1.05], [dur, 0.98]], EASE.drift) };
  const planL: Light = { key: "#d8d0c0", ambient: "#0a0908", amb: 0.3 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#07060a">
        {/* the house seen from above, as investigators drew it */}
        <Plane d={0} opacity={plan}>
          <rect x={-1500} y={-620} width={3000} height={1240} fill={lit("#1a1c20", planL)} />
          <rect x={-1400} y={-520} width={2800} height={1040} fill="none" stroke={lit("#8a8a84", planL)} strokeWidth={6} />
          {[-300, 120, 880].map((x) => (
            <path key={x} d={`M${x} -520 L${x} 520`} stroke={lit("#6a6a64", planL)} strokeWidth={4} />
          ))}
          <path d="M-1400 40 L-300 40 M120 -80 L880 -80" stroke={lit("#6a6a64", planL)} strokeWidth={4} />
          {PATCHES.map((p, i) => (
            <path key={i} d={`M${p.x} ${(hash(i * 5) - 0.5) * 860 - 10} l12 20 l-24 0 Z`} fill={lit("#e2b53c", planL)} />
          ))}
        </Plane>
        <Plane d={-0.5} opacity={1}>
          {num > 0 ? (
            <text x={0} y={110} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={600} fontSize={360} fill="#f2ece0" opacity={num} style={{ letterSpacing: 8 }}>
              33
            </text>
          ) : null}
        </Plane>
        {/* thirty-three people, not a statistic */}
        <Plane d={0} opacity={people}>
          <rect x={-4000} y={-2000} width={8000} height={4000} fill="#1c130c" />
          <Glow x={0} y={-420} r={1500} color="#ffd9a8" opacity={0.32} />
          {Array.from({ length: 33 }, (_, i) => {
            const row = i < 10 ? 0 : i < 21 ? 1 : 2;
            const col = row === 0 ? i : row === 1 ? i - 10 : i - 21;
            const n = row === 1 ? 11 : row === 0 ? 10 : 12;
            const x = (col - (n - 1) / 2) * (row === 2 ? 170 : 180) + (hash(i) - 0.5) * 30;
            const y = 40 + row * 110;
            const look = { ...YOUNG[i % YOUNG.length], hair: (["mop", "short", "curly", "afro", "buzz", "mop", "short"] as const)[i % 7] };
            return (
              <Person
                key={i}
                x={x}
                y={y}
                s={0.9 + row * 0.08 + (hash(i + 3) - 0.5) * 0.08}
                look={look}
                mode="silhouette"
                silhouette={mix("#2e2016", "#0c0806", row * 0.45)}
                facing={hash(i + 7) > 0.5 ? 1 : -1}
                pose={idle(pose({ turn: -0.6 }), t, i + 90, 0.5)}
              />
            );
          })}
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.85} />
    </AbsoluteFill>
  );
};
