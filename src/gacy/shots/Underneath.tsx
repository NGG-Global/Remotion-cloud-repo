import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, mix, type Light } from "../engine/color";
import { Finish, Haze } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, keys, lerp, noise, ramp } from "../engine/time";
import { Castle } from "../kit/buildings";
import { Glow, Pool } from "../kit/light";
import { Shovel } from "../kit/props";
import { HouseSection, PATCHES, SEC } from "../kit/section";
import { Motes, Sky } from "../kit/sky";
import { GroundStrip, Tree } from "../kit/street";
import { Suburb } from "../kit/suburb";
import { Person } from "../rig/Person";
import { GACY, GACY_WORK, NEIGHBORS, WORKERS } from "../rig/cast";
import { CRAWL, KNEEL, dig, gesture, idle, pose, talk, walk, walkBetween } from "../rig/pose";
import { TYPE } from "../theme";

/**
 * 3:43–4:57. The crawl space, as a place.
 *
 * One set for all of it (kit/section). The trenches are dug in a framing
 * the discovery later repeats exactly (TRENCH_CAM), so the second time
 * the viewer sees that dirt, they already know what it held.
 */

const CRAWL_DARK: Light = { key: "#9aa6bc", ambient: "#07080c", amb: 0.5, desat: 0.35 };
const CRAWL_LIT: Light = { key: "#f0d8a8", ambient: "#0c0a08", amb: 0.4, desat: 0.2 };
const ROOM_NIGHT: Light = { key: "#ffe2b8", ambient: "#20160e", amb: 0.2 };
const ROOM_DAY: Light = { key: "#fff4e4", ambient: "#4a4038", amb: 0.08 };

/** The framing shared by the trench-digging and the police dig. */
export const TRENCH_CAM = { x: -420, y: -250, zoom: 1.32 } as const;

const bgNight = <rect x={-20000} y={-6000} width={40000} height={12000} fill="#05060a" />;

// ------------------------------------------------------ the crawl space

export const CrawlTour: React.FC = () => {
  const { t } = useShot();
  const cam = {
    x: keys(t, [[0, 0], [3.2, 900], [14.9, -1000]], EASE.inOut),
    y: keys(t, [[0, -520], [3.2, -45], [14.9, -50]], EASE.inOut),
    zoom: keys(t, [[0, 0.55], [3.2, 2.35], [14.9, 2.5]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#05060a">
        <Sky mode="night" t={t} moon={{ x: 1500, y: 140 }} />
        <Plane d={0}>
          {bgNight}
          <HouseSection
            t={t}
            roomLight={{ ...ROOM_NIGHT, amb: 0.5 }}
            crawlLight={CRAWL_DARK}
            lamps={0.2}
            crawl={{ patches: 0, vents: 1, drip: t > 12.8, haze: 0.1 }}
            under={<Motes t={t} x={-1300} y={-110} w={2600} h={150} n={50} color="#b8c4d8" opacity={0.5} />}
          />
        </Plane>
      </Stage>
      <Finish temp={-0.6} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const Burials: React.FC = () => {
  const { t } = useShot();
  // "One more" lands at +3.3, +4.6, +6.2 s.
  const beats = [3.25, 4.55, 6.15];
  const patches = 1 + beats.reduce((a, b) => a + ramp(t, b, b + 0.45, EASE.out), 0);
  const swing = Math.sin(t * 1.3) * 5;
  // Each "another" is a jump in time: the bulb dips, and when it comes back the
  // camera has moved to the newest grave and the shovel is standing in it.
  const dip = Math.max(0, ...beats.map((b) => 1 - Math.min(1, Math.abs(t - (b - 0.1)) / 0.16)));
  const passed = beats.filter((b) => t >= b - 0.1).length;
  const newest = PATCHES[passed];
  const stops = [-600, -470, -690, -400];
  const drift = (t - (passed ? beats[passed - 1] : 0)) * 14;
  const cam = { x: stops[passed] + drift, y: -40, zoom: keys(t, [[0, 2.6], [7.2, 2.85]], EASE.drift) };
  const bulbX = -560 + swing;
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#05060a">
        <Plane d={0}>
          {bgNight}
          <HouseSection
            t={t}
            roomLight={{ ...ROOM_NIGHT, amb: 0.55 }}
            crawlLight={{ ...CRAWL_LIT, amb: 0.52 + dip * 0.38 }}
            lamps={0}
            crawl={{ patches, vents: 0.4, haze: 0.08 }}
            under={
              <g>
                <path d={`M-560 ${SEC.joistBottom + 20} L${bulbX} ${SEC.joistBottom + 60}`} stroke="#1a1a1a" strokeWidth={2} />
                <circle cx={bulbX} cy={SEC.joistBottom + 66} r={7} fill="#fff0c8" />
                <Glow x={bulbX} y={SEC.joistBottom + 66} r={420} color="#f5d9a0" opacity={0.5 * (1 - dip)} />
                <Pool x={newest.x} y={newest.y - 4} rx={newest.w * 0.9} ry={34} color="#f5d9a0" opacity={0.22 * (1 - dip)} />
                {beats.map((b, i) => {
                  const p = PATCHES[i + 1];
                  const u = ramp(t, b, b + 1.6, EASE.out);
                  if (u <= 0 || u >= 1) {
                    return null;
                  }
                  return (
                    <g key={i} opacity={1 - u}>
                      {Array.from({ length: 9 }, (_, j) => (
                        <circle key={j} cx={p.x + (j - 4) * 14 + noise(j + i * 9, 2) * 10} cy={p.y - 8 - u * (20 + (j % 3) * 14)} r={2 + (j % 2)} fill="#9a8a70" />
                      ))}
                    </g>
                  );
                })}
                {/* the shovel lies flat beside the newest grave: there is no room to stand it up */}
                <g transform={`translate(${newest.x + newest.w * 0.55} ${newest.y + 14}) rotate(97)`}>
                  <Shovel light={CRAWL_LIT} len={180} />
                </g>
              </g>
            }
          />
        </Plane>
      </Stage>
      <Finish temp={-0.2} vignette={0.9} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------- "drainage" trenches

export const Trenches: React.FC = () => {
  const { t, dur } = useShot();
  const w1 = walkBetween(t, 0.4, 2.2, SEC.hatchX + 40, -700);
  const w2 = walkBetween(t, 1.2, 3.2, SEC.hatchX + 60, -250);
  const trench = ramp(t, 2.0, dur, EASE.linear) * 0.66;
  const gTalk = t > 5.6 && t < 8.4;
  const wipe = ramp(t, 9.3, 9.8) - ramp(t, 10.6, 11.2);
  const crawlY = 58;
  const worker = (x: number, phase: number, crawling: boolean, look: typeof WORKERS[0], key: string, brow = 0) =>
    crawling ? (
      <Person key={key} x={x} y={crawlY} s={0.95} look={look} facing={-1} light={CRAWL_LIT} pose={walk(CRAWL, phase * 0.5, 0.25)} />
    ) : (
      <Person
        key={key}
        x={x}
        y={crawlY}
        s={0.95}
        look={look}
        facing={-1}
        light={CRAWL_LIT}
        pose={brow > 0 ? pose({ ...KNEEL, nearUpper: lerp(30, 150, brow), nearFore: lerp(40, 120, brow), neck: 4 }) : dig(pose({ ...KNEEL, lean: 30 }), t * 0.7 + phase)}
        farHold={brow > 0 ? undefined : <Shovel light={CRAWL_LIT} len={150} />}
      />
    );
  return (
    <AbsoluteFill>
      <Stage cam={{ ...TRENCH_CAM, x: keys(t, [[0, TRENCH_CAM.x - 60], [dur, TRENCH_CAM.x + 40]], EASE.drift) }} handheld={2} t={t} bg="#05060a">
        <Plane d={0}>
          {bgNight}
          <HouseSection
            t={t}
            roomLight={ROOM_DAY}
            crawlLight={CRAWL_LIT}
            lamps={0.3}
            night={false}
            crawl={{ patches: 4, trenches: trench, hatch: 1, workLight: 1, vents: 0.2 }}
            hall={
              <Person x={SEC.hatchX - 70} y={SEC.floor} look={GACY_WORK} light={ROOM_DAY} pose={gTalk ? gesture(talk(idle(pose({ neck: 24, lean: 14, turn: 0.4 }), t, 3), t, 3), t, 3, 1) : idle(pose({ neck: 26, lean: 16, nearUpper: 60, nearFore: 20 }), t, 3)} />
            }
            under={
              <g>
                {t < 2.2 ? worker(w1.x, w1.phase, true, WORKERS[0], "a") : worker(-700, 0, false, WORKERS[0], "a", wipe)}
                {t < 3.2 ? worker(w2.x, w2.phase, true, WORKERS[3], "b") : worker(-250, 0.5, false, WORKERS[3], "b")}
              </g>
            }
          />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.8} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- the smell

export const Smell: React.FC = () => {
  const { t, dur } = useShot();
  const haze = ramp(t, 0.6, 3.2);
  // Explanations, each on its word: sewer (+5.8), damp (+7.8), "something under the house" (+8.9).
  const explain = t > 5.3 && t < 10.2;
  const sniff = ramp(t, 2.4, 3.0) - ramp(t, 10.6, 11.4);
  const laugh = ramp(t, 11.6, 12.2);
  const cam = {
    x: keys(t, [[0, -760], [2.2, -820], [4.4, -900], [5.4, -780], [10.2, -760], [dur, -640]], EASE.inOut),
    y: keys(t, [[0, -40], [2.2, -60], [4.4, -420], [5.4, -370], [10.2, -370], [dur, -260]], EASE.inOut),
    zoom: keys(t, [[0, 2.3], [2.2, 2.3], [4.4, 2.6], [5.4, 1.9], [10.2, 1.9], [dur, 1.3]], EASE.inOut),
  };
  const point = t > 5.6 && t < 6.8 ? 1 : 0;
  const shrug = t > 7.6 && t < 8.6 ? 1 : 0;
  const down = t > 8.8 && t < 10.0 ? 1 : 0;
  const gPose = explain
    ? talk(
        idle(
          pose({
            smile: 0.6,
            nearUpper: point ? 60 : shrug ? 50 : down ? 30 : 20,
            nearFore: point ? 10 : shrug ? 110 : down ? -10 : 60,
            farUpper: shrug ? 50 : 10,
            farFore: shrug ? 110 : 20,
            neck: down ? 18 : 0,
            brow: shrug ? 0.8 : 0.2,
          }),
          t,
          5,
        ),
        t,
        5,
      )
    : talk(idle(pose({ smile: 1, mouth: laugh * 0.5 }), t, 5), t, 5, laugh);
  const guests = [
    { look: NEIGHBORS[1], x: -1150, f: 1 as const, s: 0 },
    { look: NEIGHBORS[0], x: -920, f: 1 as const, s: 1 },
    { look: NEIGHBORS[3], x: -380, f: -1 as const, s: 0 },
  ];
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={2} t={t} bg="#05060a">
        <Plane d={0}>
          {bgNight}
          <HouseSection
            t={t}
            roomLight={ROOM_NIGHT}
            crawlLight={CRAWL_DARK}
            lamps={1}
            party
            crawl={{ patches: 10, trenches: 0.66, haze: haze * 0.8, vents: 0.6 }}
            living={
              <g>
                <Person x={-640} y={SEC.floor} look={GACY} light={ROOM_NIGHT} pose={gPose} />
                {guests.map((g, i) => (
                  <Person
                    key={i}
                    x={g.x}
                    y={SEC.floor}
                    look={g.look}
                    facing={g.f}
                    light={ROOM_NIGHT}
                    pose={talk(idle(pose({ farUpper: 30, farFore: 76, smile: lerp(0.8, -0.2, sniff * g.s) * (1 - laugh) + laugh, brow: -sniff * g.s, neck: -sniff * g.s * 8, mouth: laugh * 0.6 }), t, i + 30), t, i + 30, explain ? 0.1 : 0.4)}
                  />
                ))}
                {/* haze seeping up through the floor register */}
                {Array.from({ length: 6 }, (_, i) => {
                  const p = ((t * 0.12 + i / 6) % 1 + 1) % 1;
                  return (
                    <ellipse
                      key={i}
                      cx={-820 + noise(t * 0.3 + i, i) * 60}
                      cy={SEC.floor - 10 - p * 300}
                      rx={50 + p * 160}
                      ry={20 + p * 50}
                      fill="#8a9a78"
                      opacity={haze * 0.24 * (1 - p) * (1 - laugh * 0.5)}
                    />
                  );
                })}
              </g>
            }
          />
          <rect x={-900} y={SEC.floor - 4} width={120} height={6} fill="#2a2622" />
        </Plane>
      </Stage>
      <Finish temp={0.2} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------- not a castle

export const CastleShot: React.FC = () => {
  const { t, dur } = useShot();
  const bolt = (at: number) => Math.exp(-Math.max(0, t - at) * 9) * (t >= at ? 1 : 0);
  const flash = Math.max(bolt(4.9), bolt(10.4));
  const L: Light = { key: mix("#6a7a9a", "#e8eeff", flash), ambient: "#06060c", amb: lerp(0.5, 0.1, flash), desat: 0.4 };
  const sign = ramp(t, 8.2, 9.0, EASE.out);
  const cam = {
    x: keys(t, [[0, 0], [dur, 0]]),
    y: keys(t, [[0, -2400], [6.0, -1600], [dur, -1330]], EASE.inOut),
    zoom: keys(t, [[0, 0.16], [6.0, 0.4], [dur, 1.75]], EASE.inOut),
  };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#05060a">
        <Sky mode="night" t={t} stars={false} clouds={1} />
        <Plane d={60}>
          {Array.from({ length: 40 }, (_, i) => (
            <Tree key={i} x={-20000 + i * 1000} h={2200 + (i % 4) * 600} kind="pine" light={L} t={t} tone="#101a14" seed={i} />
          ))}
        </Plane>
        <Plane d={0}>
          <Castle x={0} flash={flash} light={L} />
          {/* the sign the narration jokes about: a door that warns you */}
          <g transform={`translate(0 ${-1000 - 380}) rotate(-3) scale(1.25)`} opacity={sign}>
            <rect x={-150} y={-60} width={300} height={130} fill={lit("#d8c8a0", L)} />
            <text x={0} y={-12} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={700} fontSize={34} fill={lit("#6a1a14", L)} direction="rtl">
              נא לא להיכנס
            </text>
            <text x={0} y={40} textAnchor="middle" fontFamily={TYPE.serif} fontSize={28} fill={lit("#2a1a14", L)} direction="rtl">
              יש פה רוצח סדרתי
            </text>
          </g>
        </Plane>
      </Stage>
      {flash > 0 ? <AbsoluteFill style={{ backgroundColor: "#dfe6ff", opacity: flash * 0.5 }} /> : null}
      <Haze t={t} density={0.35} color="#4a5064" />
      <Finish temp={-0.8} vignette={0.9} />
    </AbsoluteFill>
  );
};

// ------------------------------------ a house people came into and ate in

export const OrdinaryHouse: React.FC = () => {
  const { t, dur } = useShot();
  const sectionOn = ramp(t, 1.9, 2.4);
  // Vignettes lit one by one on their verbs.
  const enter = walkBetween(t, 2.6, 4.2, 180, -150);
  const worker = walkBetween(t, 5.9, 8.6, 900, 200);
  const cam = {
    x: keys(t, [[0, -350], [1.9, -350], [2.4, -400], [4.4, -200], [6.2, 300], [7.4, 400], [9.2, -100], [dur, -100]], EASE.inOut),
    y: keys(t, [[0, -520], [1.9, -520], [2.4, -420], [7.4, -420], [9.2, -160], [dur, -60]], EASE.inOut),
    zoom: keys(t, [[0, 0.6], [1.9, 0.75], [2.4, 1.05], [7.4, 1.15], [9.2, 0.95], [dur, 1.2]], EASE.inOut),
  };
  const day = ROOM_DAY;
  const crawlL: Light = { key: "#a8b2c4", ambient: "#0a0b0e", amb: 0.42, desat: 0.35 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#05060a">
        {sectionOn < 1 ? (
          <Suburb t={t} mode="day" gacyLit={0} neighborsLit={0} />
        ) : null}
        {sectionOn > 0 ? (
          <Plane d={0} opacity={sectionOn}>
            <Sky mode="day" t={t} />
            <rect x={-20000} y={-6000} width={40000} height={6000} fill="#8fa6b8" />
            <GroundStrip near={-9} far={40} color="#6a8052" light={day} opacity={0} />
            <HouseSection
              t={t}
              night={false}
              roomLight={day}
              crawlLight={crawlL}
              lamps={0.3}
              crawl={{ patches: 16, trenches: 0.66, vents: 0.5 }}
              living={
                <g>
                  <Person x={enter.x} y={SEC.floor} look={NEIGHBORS[5]} facing={-1} light={day} pose={walk(idle(pose({ smile: 0.8 }), t, 1), enter.phase, enter.amt)} />
                  <Person x={-1050} y={SEC.floor} look={NEIGHBORS[1]} light={day} pose={talk(idle(pose({ hipDrop: 84, nearThigh: 86, nearKnee: 88, farThigh: 82, farKnee: 84, smile: 0.6 }), t, 2), t, 2, t > 5.0 && t < 7.4 ? 1 : 0.2)} />
                  <Person x={-820} y={SEC.floor} look={GACY} facing={-1} light={day} pose={talk(idle(pose({ smile: 1 }), t, 3), t, 3, t > 5.0 && t < 7.4 ? 0.8 : 0.2)} />
                </g>
              }
              kitchen={
                <g>
                  <rect x={260} y={SEC.floor - 150} width={320} height={16} fill={lit("#6a4a32", day)} />
                  <rect x={274} y={SEC.floor - 134} width={10} height={134} fill={lit("#4a3222", day)} />
                  <rect x={556} y={SEC.floor - 134} width={10} height={134} fill={lit("#4a3222", day)} />
                  <Person x={250} y={SEC.floor} look={NEIGHBORS[2]} light={day} pose={idle(pose({ hipDrop: 84, nearThigh: 86, nearKnee: 88, farThigh: 82, farKnee: 84, nearUpper: 60, nearFore: 70, neck: 10 }), t, 4)} />
                  <Person x={590} y={SEC.floor} look={NEIGHBORS[0]} facing={-1} light={day} pose={idle(pose({ hipDrop: 84, nearThigh: 86, nearKnee: 88, farThigh: 82, farKnee: 84, nearUpper: 64, nearFore: 66 }), t, 6)} />
                  {[330, 500].map((px) => (
                    <ellipse key={px} cx={px} cy={SEC.floor - 154} rx={30} ry={6} fill={lit("#ece6da", day)} />
                  ))}
                </g>
              }
              bedroom={
                <Person x={worker.x + 400} y={SEC.floor} look={WORKERS[1]} facing={-1} light={day} pose={walk(pose({ farUpper: 20, farFore: 60 }), worker.phase, worker.amt)} farHold={<rect x={-30} y={0} width={60} height={40} fill={lit("#8a3a2a", day)} />} />
              }
            />
          </Plane>
        ) : null}
      </Stage>
      <Finish temp={0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

