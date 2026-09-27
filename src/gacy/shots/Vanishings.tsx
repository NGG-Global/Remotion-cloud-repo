import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, mix, type Light } from "../engine/color";
import { Finish, Haze } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, clamp, keys, lerp, ramp } from "../engine/time";
import { CityBlock } from "../kit/buildings";
import { CloseHand } from "../kit/hands";
import { Flyer } from "../kit/paper";
import { Handcuffs, Lumber } from "../kit/props";
import { BusStation, Diner, GacyLivingRoom, LIVING } from "../kit/rooms";
import { HouseSection } from "../kit/section";
import { Sky, Snow, Motes } from "../kit/sky";
import { GroundStrip, StreetLamp, Tree } from "../kit/street";
import { Suburb } from "../kit/suburb";
import { Person } from "../rig/Person";
import { GACY, WORKERS } from "../rig/cast";
import { SIT, idle, pose, walk, walkBetween } from "../rig/pose";
import { JobSite } from "./Opening";

/**
 * 2:56–3:43. The disappearances, told only through absence: a pole that
 * collects flyers for six years, three young men in the places the
 * narration names, a pair of handcuffs and a lamp switched off. Then the
 * camera backs away from the front door and goes down, through the
 * foundation vent, under the house.
 */

// -------------------------------------------------------- 1972–1978

export const Flyers: React.FC = () => {
  const { t, dur } = useShot();
  // Time-lapse: a day-night cycle every ~0.9 s, seasons over the shot.
  const cycles = t / 0.9;
  const day = (Math.cos(cycles * Math.PI * 2) + 1) / 2;
  const season = (t / dur) * 3;
  const winter = Math.max(0, Math.sin(season * Math.PI * 2 - 1.2));
  const L: Light = {
    key: mix("#8fa2c2", "#fff2e0", day),
    ambient: mix("#0b111c", "#6a6a70", day),
    amb: lerp(0.5, 0.08, day),
    desat: 0.2,
  };
  const n = Math.min(9, 1 + Math.floor(ramp(t, 0.2, dur - 0.4, EASE.linear) * 9));
  const cam = { x: keys(t, [[0, -120], [dur, 40]]), y: keys(t, [[0, -900], [dur, -1000]]), zoom: keys(t, [[0, 1.5], [dur, 2.05]], EASE.drift) };
  const spots = [
    [0, -1020, -3],
    [-10, -760, 4],
    [4, -1260, -6],
    [-6, -520, 2],
    [8, -1500, 5],
    [-12, -1180, -2],
    [10, -880, 8],
    [-4, -640, -7],
    [6, -1380, 3],
  ];
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Sky mode={day > 0.5 ? "day" : "night"} t={t} stars={day < 0.3} />
        <Plane d={25}>
          <CityBlock x0={-8000} x1={8000} light={L} lit={1 - day} seed={3} />
        </Plane>
        <GroundStrip near={-9} far={25} color={winter > 0.3 ? "#c8d0d8" : "#6a6862"} light={L} />
        <Plane d={3}>
          <StreetLamp x={900} on={1 - day} light={L} t={t} />
          <Tree x={-1500} h={1500} kind={winter > 0.2 ? "bare" : "leafy"} light={L} t={t} tone={mix("#3a5438", "#8a5a2a", clamp(season % 1))} />
        </Plane>
        <Plane d={0}>
          <rect x={-70} y={-2600} width={140} height={2600} fill={lit("#4a3a2e", L)} />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={-70} y={-2600 + i * 86} width={140} height={2} fill={lit("#3a2c22", L)} opacity={0.6} />
          ))}
          {spots.slice(0, n).map(([dx, y, rot], i) => (
            <Flyer key={i} x={Number(dx)} y={Number(y)} rot={Number(rot)} light={L} age={clamp((n - i) / 9)} seed={i} s={1.05} />
          ))}
        </Plane>
      </Stage>
      {winter > 0.2 ? <AbsoluteFill><svg width={1920} height={1080}><Snow t={t} density={winter} /></svg></AbsoluteFill> : null}
      <Finish temp={day > 0.5 ? 0.2 : -0.5} vignette={0.7} />
    </AbsoluteFill>
  );
};

// ------------------------------------------ work, looking for work, other

export const PathWork: React.FC = () => {
  const { t, dur } = useShot();
  const L: Light = { key: "#f0b890", ambient: "#2a2230", amb: 0.24, desat: 0.1 };
  const w = walkBetween(t, 0.3, dur + 0.6, 200, -1300);
  const cam = { x: keys(t, [[0, 100], [dur, -300]]), y: -420, zoom: 1.2 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <JobSite t={t} light={L} />
        <Plane d={0}>
          <Person x={w.x} look={WORKERS[3]} facing={-1} light={L} pose={walk(idle(pose({ farUpper: 20, farFore: 60 }), t, 2), w.phase, w.amt)} />
          <Lumber x={900} n={4} len={500} light={L} />
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const PathDiner: React.FC = () => {
  const { t, dur } = useShot();
  const L: Light = { key: "#fff0d0", ambient: "#3a3430", amb: 0.12 };
  const cam = { x: keys(t, [[0, -150], [dur, 50]]), y: -200, zoom: 1.7 };
  const circle = ramp(t, 0.6, 1.6);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={1.4}>
          <Diner light={L} t={t} />
        </Plane>
        <Plane d={0}>
          <Person x={-60} look={WORKERS[0]} light={L} pose={idle(pose({ ...SIT, lean: 20, neck: 22, nearUpper: 56, nearFore: 70, farUpper: 50, farFore: 76 }), t, 3, 0.4)} />
          {/* the classifieds, with a pen circling one ad */}
          <g transform="translate(96 -206) rotate(-6) scale(0.55)">
            <rect x={-90} y={-60} width={180} height={120} fill={lit("#e8e2d2", L)} />
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={-80} y={-50 + i * 13} width={70 + (i % 3) * 20} height={4} fill={lit("#8a847a", L)} />
            ))}
            <ellipse cx={20} cy={-10} rx={40} ry={16} fill="none" stroke="#2a3a6a" strokeWidth={3} strokeDasharray={`${circle * 180} 200`} />
          </g>
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const PathStation: React.FC = () => {
  const { t, dur } = useShot();
  const L: Light = { key: "#d8e8e4", ambient: "#101416", amb: 0.3, desat: 0.3 };
  const cam = { x: keys(t, [[0, 60], [dur, -40]]), y: -260, zoom: keys(t, [[0, 1.05], [dur, 1.2]], EASE.drift) };
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={2}>
          <BusStation light={L} t={t} />
        </Plane>
        <Plane d={0}>
          <Person x={-80} look={WORKERS[1]} light={L} pose={idle(pose({ ...SIT, lean: 8, neck: 10, nearUpper: 30, nearFore: 60 }), t, 4, 0.6)} />
          <rect x={60} y={-80} width={150} height={80} rx={20} fill={lit("#4a4a3a", L)} />
        </Plane>
      </Stage>
      <Finish temp={-0.4} vignette={0.75} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------ the "trick"

export const Handcuff: React.FC = () => {
  const { t, dur } = useShot();
  const off = ramp(t, 9.1, 9.3, EASE.in);
  const room: Light = { key: "#ffe0b4", ambient: "#07060a", amb: lerp(0.2, 0.9, off), desat: lerp(0, 0.5, off) };
  const place = ramp(t, 0.8, 2.0, EASE.out);
  const reach = ramp(t, 8.2, 9.1, EASE.inOut) * (1 - ramp(t, 9.6, 10.6));
  const cam = {
    x: keys(t, [[0, -900], [dur, -620]], EASE.drift),
    y: keys(t, [[0, -180], [6.0, -160], [dur, -40]], EASE.drift),
    zoom: keys(t, [[0, 1.7], [6.0, 2.3], [dur, 3.4]], EASE.drift),
  };
  const flourish = Math.sin(t * 2.2) * ramp(t, 2.2, 3.0) * (1 - ramp(t, 7.0, 8.0));
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#040305">
        <Plane d={0}>
          <GacyLivingRoom light={room} lamp={1 - off} t={t} />
          {/* his shadow on the panelling, showing a "trick" */}
          {/* the shadow fades as the game stops being a game, before the push reaches it */}
          {t < 7.5 ? (
            <g opacity={0.45 * (1 - off) * (1 - ramp(t, 6.5, 7.5))}>
              <Person x={-980} y={40} s={1.05} look={GACY} mode="silhouette" silhouette="#1a0e08" pose={pose({ nearUpper: 60 + flourish * 30, nearFore: 60 + flourish * 40, farUpper: 50 - flourish * 20, farFore: 70, turn: 0.3 })} shadow={false} />
            </g>
          ) : null}
          <Handcuffs x={LIVING.tableX - 60} y={lerp(-40, 56, place)} light={room} s={1.1} rot={-6} />
        </Plane>
        <Plane d={-0.8}>
          {/* enters from outside the frame to set the cuffs down */}
          <CloseHand x={lerp(-260, -600, place)} y={lerp(-160, 10, place) - ramp(t, 2.2, 2.8) * 160} angle={-160} skin="#e3b692" sleeve="#7a6147" s={1.15} curl={0.5} light={room} />
          <CloseHand x={lerp(-1500, -1300, reach)} y={lerp(-240, -440, reach)} angle={-150} skin="#e3b692" sleeve="#7a6147" s={1.15} curl={0.7} light={room} />
        </Plane>
      </Stage>
      <Finish temp={0.5} vignette={0.9} />
    </AbsoluteFill>
  );
};

// ------------------------------- back away from the door, then go under

export const UnderTheHouse: React.FC = () => {
  const { t } = useShot();
  // 0–8.4: pull back from the front door. 8.4–19.6: tilt down and push
  // into a foundation vent. 19.6+: through it, into the crawl space.
  const doorX = -350;
  const ventX = 100;
  const cam = {
    x: keys(t, [[0, doorX], [8.4, -200], [10.5, 60], [18.8, ventX], [21.6, ventX - 160]], EASE.inOut),
    y: keys(t, [[0, -420], [8.4, -470], [10.5, -300], [18.8, -80], [21.6, -30]], EASE.inOut),
    zoom: keys(t, [[0, 1.5], [8.4, 0.62], [10.5, 0.75], [18.8, 6.2], [20.2, 7.4], [21.6, 2.6]], EASE.inOut),
  };
  const through = ramp(t, 19.4, 20.4, EASE.inOut);
  const crawlL: Light = { key: "#8a96ac", ambient: "#06070a", amb: 0.66, desat: 0.35 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        {through < 1 ? (
          <Suburb t={t + 200} mode="night" gacyLit={0.15} neighborsLit={0.35} porch={1} ground={1} />
        ) : null}
        {through > 0 ? (
          <Plane d={0} opacity={through}>
            <rect x={-20000} y={-4000} width={40000} height={8000} fill="#030304" />
            <HouseSection t={t} night crawl={{ patches: 9, vents: 1, haze: 0.2 }} crawlLight={crawlL} lamps={0} under={<Motes t={t} x={-900} y={-110} w={1600} h={140} n={40} color="#b8c4d8" opacity={0.5} />} />
          </Plane>
        ) : null}
      </Stage>
      <Haze t={t} density={0.25 * (1 - through)} />
      <Finish temp={-0.6} vignette={0.85} />
    </AbsoluteFill>
  );
};

