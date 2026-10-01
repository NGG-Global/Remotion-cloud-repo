import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage } from "../engine/camera";
import { lit, type Light } from "../engine/color";
import { Finish, Haze, HomeMovie } from "../engine/look";
import { useShot } from "../engine/shot";
import { EASE, clamp, keys, lerp, noise, ramp } from "../engine/time";
import { CloseHand } from "../kit/hands";
import { SEC, HouseSection } from "../kit/section";
import { Frame, Room, TableLamp } from "../kit/interior";
import { Glow, Pool, Wash } from "../kit/light";
import {
  Balloon,
  Bunting,
  Crowd,
  Cup,
  Flag,
  Grill,
  Keys,
  Lumber,
  Newspaper,
  PicnicTable,
  Podium,
  PressCamera,
  Sawhorse,
  Spatula,
  StringLights,
  Clipboard,
  flashAmount,
} from "../kit/props";
import { Sky, Motes } from "../kit/sky";
import { GroundStrip, PicketFence, Tree } from "../kit/street";
import { lightFor, SUBURB, Suburb } from "../kit/suburb";
import { Car } from "../kit/vehicles";
import { Person, solve } from "../rig/Person";
import {
  DEFENSE,
  GACY,
  GACY_SUIT,
  GACY_WORK,
  NEIGHBORS,
  POGO,
  WORKERS,
} from "../rig/cast";
import { CARRY, STAND, gesture, idle, pose, reachAngles, talk, walk, walkBetween } from "../rig/pose";
import { Title } from "../type/Label";

/**
 * 0:00–1:07. Cold open.
 *
 * The famous image first (the clown, the Hollywood version of it), then
 * the man everybody actually saw, then the camera does what nobody on the
 * street could: it goes down through the house into the crawl space, and
 * comes back up to name him.
 */

const NIGHT = lightFor("night");
const DAY = lightFor("day");

/** Waving: the arm swings about a raised pose. */
const wave = (t: number, amt = 1) => ({
  nearUpper: lerp(10, 150, amt),
  nearFore: lerp(10, 30 + Math.sin(t * 9) * 26, amt),
});

// --------------------------------------------------------------- 0:00 street

export const StreetPush: React.FC = () => {
  const { t } = useShot();
  const cam = {
    x: keys(t, [[0, -1800], [6.4, -260]], EASE.drift),
    y: keys(t, [[0, -380], [6.4, -440]], EASE.drift),
    zoom: keys(t, [[0, 0.33], [6.4, 0.6]], EASE.drift),
  };
  const carX = lerp(5200, -6400, ramp(t, 0.5, 4.8, EASE.linear));
  const pogoX = lerp(-140, 520, ramp(t, 3.9, 6.4, EASE.linear));
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={5} t={t}>
        <Suburb
          t={t}
          mode="night"
          gacyLit={0.95}
          neighborsLit={0.4}
          tv
          porch={0.85}
          inside={(b) => (
            <g>
              <Person x={b.x + pogoX} y={b.y + b.h + 150} s={0.95} look={POGO} mode="silhouette" silhouette="#3a2618" pose={walk(STAND, pogoX / 300)} />
            </g>
          )}
          onRoad={
            <Plane d={SUBURB.roadMid - 1.6}>
              <Car x={carX} facing={-1} headlights={1} color="#3a4450" light={NIGHT} />
            </Plane>
          }
          foreground={
            <Plane d={-20.5}>
              <Tree x={-3300} h={1700} kind="bare" light={{ ...NIGHT, amb: 0.8 }} t={t} seed={4} />
            </Plane>
          }
        />
      </Stage>
      <Haze t={t} density={0.3} />
      <Finish temp={-0.6} vignette={0.75} />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------- 0:06 home movie, Pogo

const Park: React.FC<{ t: number }> = ({ t }) => {
  const L = DAY;
  const pogoPose = idle(pose({ ...wave(t, ramp(t, 0.4, 0.9)), farUpper: 26, farFore: 64, smile: 1, turn: -0.4 }), t, 3);
  const j = solve(pogoPose, POGO);
  const hand = { x: j.far.hand.x * 1.02, y: j.far.hand.y };
  return (
    <>
      <Sky mode="day" t={t} clouds={0.6} />
      <Plane d={30}>
        {Array.from({ length: 16 }, (_, i) => (
          <Tree key={i} x={-9000 + i * 1200} h={1600 + (i % 3) * 300} light={L} t={t} seed={i} tone="#3e5a3a" />
        ))}
      </Plane>
      <GroundStrip near={-9} far={30} color="#7a9258" farColor="#6a8248" light={L} />
      <Plane d={7}>
        <Bunting x0={-2400} x1={-200} y={-1100} light={L} />
        <Bunting x0={-200} x1={2200} y={-1100} light={L} />
        <PicnicTable x={-1500} light={L} cloth="#c8483a" />
        <PicnicTable x={1400} light={L} cloth="#e8e2d4" />
        {/* two guests in frame; the others stand clear of the edges, outside it */}
        {NEIGHBORS.map((n, i) => (
          <Person key={i} x={[-2300, -1650, -700, 600, 1550, 2200][i]} look={n} s={0.95} facing={i % 2 ? -1 : 1} light={L} pose={talk(idle(STAND, t, i + 20), t, i)} />
        ))}
      </Plane>
      <Plane d={0}>
        <Person x={0} look={POGO} light={L} pose={pogoPose} />
        {[
          ["#c8483a", -60, -560],
          ["#e8c23a", 40, -610],
          ["#3a6ac8", 110, -540],
        ].map(([c, bx, by], i) => (
          <Balloon key={i} x={Number(bx) + hand.x} y={Number(by)} color={String(c)} t={t} seed={i} ax={hand.x} ay={hand.y} light={L} />
        ))}
      </Plane>
      <Plane d={-4}>
        <PicnicTable x={-1300} light={L} cloth="#e8e2d4" />
      </Plane>
    </>
  );
};

const Fair: React.FC<{ t: number }> = ({ t }) => {
  const L: Light = { key: "#fff0dc", ambient: "#4a4038", amb: 0.08 };
  // A juggling pattern: three balls on offset arcs.
  const balls = [0, 1, 2].map((i) => {
    const p = (t * 1.3 + i / 3) % 1;
    return { x: lerp(-70, 70, p) * (Math.floor(t * 1.3 + i / 3) % 2 ? -1 : 1), y: -430 - Math.sin(p * Math.PI) * 220 };
  });
  return (
    <>
      <Sky mode="day" t={t} />
      <Plane d={4}>
        <rect x={-3000} y={-1400} width={6000} height={1400} fill={lit("#c8b898", L)} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={-3000 + i * 440} y={-1400} width={220} height={1400} fill={lit("#b83a32", L)} opacity={0.9} />
        ))}
        <path d="M-3000 -1400 L3000 -1400 L3000 -1300 L-3000 -1300 Z" fill={lit("#8a2a24", L)} />
        <Bunting x0={-1800} x1={1800} y={-1050} light={L} />
      </Plane>
      <GroundStrip near={-9} far={4} color="#7a8a5a" light={L} />
      <Plane d={0}>
        <rect x={-900} y={-140} width={1800} height={140} fill={lit("#6a4a32", L)} />
        <rect x={-900} y={-150} width={1800} height={16} fill={lit("#8a6a48", L)} />
        <Person x={0} y={-140} look={POGO} light={L} pose={idle(pose({ nearUpper: 60, nearFore: 70, farUpper: 60, farFore: 70, smile: 1, turn: -0.6 }), t, 5)} />
        {balls.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y - 140} r={20} fill={lit(["#e8c23a", "#3a6ac8", "#c8483a"][i], L)} />
        ))}
      </Plane>
      <Plane d={-3.5}>
        <Crowd x0={-2200} x1={2200} n={11} color="#2a241e" h={360} seed={2} t={t} />
      </Plane>
    </>
  );
};

export const PogoFilm: React.FC = () => {
  const { t } = useShot();
  const first = t < 4.3;
  const lt = first ? t : t - 4.3;
  const cam = first
    ? { x: keys(lt, [[0, -60], [4.3, 40]]), y: -330, zoom: keys(lt, [[0, 1.45], [4.3, 1.8]]) }
    : { x: keys(lt, [[0, 60], [3.6, -40]]), y: -520, zoom: keys(lt, [[0, 1.25], [3.6, 1.4]]) };
  return (
    <HomeMovie>
      <Stage cam={cam} handheld={first ? 14 : 10} t={t * 1.7} bg="#1a140e">
        {first ? <Park t={lt} /> : <Fair t={lt} />}
      </Stage>
    </HomeMovie>
  );
};

// --------------------------------------------------------- 0:14 the makeup

export const Makeup: React.FC = () => {
  const { t } = useShot();
  const warm: Light = { key: "#ffe2b6", ambient: "#1e1610", amb: 0.12 };
  const cam = {
    x: keys(t, [[0, -44], [2.95, 34]], EASE.drift),
    y: keys(t, [[0, -18], [2.95, -26]]),
    zoom: keys(t, [[0, 9.5], [1.8, 9.2], [2.95, 7.6]]),
  };
  const dip = ramp(t, 0.1, 0.7) - ramp(t, 0.9, 1.4);
  const nose = ramp(t, 0.95, 1.55, EASE.out);
  const L = (c: string) => lit(c, warm);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#120d09">
        <Plane d={1.6}>
          <rect x={-600} y={-400} width={1200} height={420} fill={L("#3a2a1e")} />
          <rect x={-240} y={-230} width={480} height={220} fill={L("#1c1612")} />
          <rect x={-226} y={-216} width={452} height={196} fill={L("#5a4a3a")} />
          <rect x={-226} y={-216} width={452} height={196} fill="#caa878" opacity={0.25} />
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <circle cx={-210 + i * 60} cy={-236} r={11} fill="#fff0cc" />
              <Glow x={-210 + i * 60} y={-236} r={80} color="#ffd9a0" opacity={0.6} />
            </g>
          ))}
          {/* wig on a stand, in the mirror's corner */}
          <ellipse cx={170} cy={-60} rx={40} ry={46} fill={L("#d8c8b0")} />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={138 + (i % 3) * 30} cy={-104 + Math.floor(i / 3) * 18} r={17} fill={L("#8a2a22")} />
          ))}
        </Plane>
        <Plane d={0}>
          <rect x={-700} y={0} width={1400} height={400} fill={L("#5a3e2a")} />
          <rect x={-700} y={0} width={1400} height={3} fill={L("#7a5a3e")} />
          <Wash x={-700} y={0} w={1400} h={120} from="bottom" color="#000" opacity={0.5} />
          {/* tin of white greasepaint and its lid */}
          <ellipse cx={-28} cy={6} rx={30} ry={8} fill="#000" opacity={0.35} />
          <path d="M-58 -14 L-58 2 Q-28 12 2 2 L2 -14 Z" fill={L("#b8b4aa")} />
          <ellipse cx={-28} cy={-14} rx={30} ry={8} fill={L("#9a968c")} />
          <ellipse cx={-28} cy={-14} rx={26} ry={6.5} fill={L("#f6f2ea")} />
          <ellipse cx={-34} cy={-15} rx={9} ry={2.5} fill={L("#e2ddd2")} opacity={dip > 0.3 ? 1 : 0.4} />
          <ellipse cx={-86} cy={8} rx={26} ry={7} fill={L("#8a867c")} />
          <ellipse cx={-86} cy={6} rx={22} ry={5} fill={L("#6a665e")} />
          {/* brush cup */}
          <path d="M44 4 L40 -30 L66 -30 L62 4 Z" fill={L("#4a5a6a")} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={46 + i * 6} y={-78 + i * 6} width={3} height={50} fill={L("#8a6a44")} transform={`rotate(${-8 + i * 8} ${48 + i * 6} -30)`} />
            </g>
          ))}
          {/* ruff collar folded at the edge */}
          <ellipse cx={128} cy={-2} rx={46} ry={14} fill={L("#efe9dc")} />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M${88 + i * 11} -8 Q${93 + i * 11} -18 ${98 + i * 11} -8`} stroke={L("#d0c8b8")} strokeWidth={2} fill="none" />
          ))}
          {/* the red nose, set down */}
          <g transform={`translate(8 ${lerp(-120, 2, nose)})`} opacity={nose > 0 ? 1 : 0}>
            <ellipse cx={0} cy={6} rx={12} ry={3.5} fill="#000" opacity={0.35 * nose} />
            <circle cx={0} cy={-6} r={11} fill={L("#c42a24")} />
            <circle cx={-4} cy={-10} r={3} fill="#fff" opacity={0.45} />
          </g>
        </Plane>
        <Plane d={-0.25}>
          {/* hand with a sponge dips into the white */}
          <CloseHand x={lerp(-10, -26, dip)} y={lerp(-150, -64, dip)} angle={24} skin="#e3b692" sleeve="#7a6147" curl={0.5} light={warm}>
            <rect x={-12} y={36} width={24} height={14} rx={5} fill={L("#f2eee4")} />
          </CloseHand>
        </Plane>
        <Plane d={-0.55}>
          <path d="M-190 40 L-176 -60 L-150 -60 L-136 40 Z" fill={L("#2a2622")} opacity={0.95} />
        </Plane>
      </Stage>
      <Finish temp={0.6} vignette={0.8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------ 0:17 the Hollywood version

const HorrorClown: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const glint = 0.6 + noise(t * 3, 2) * 0.4;
  const tilt = noise(t * 0.4, 5) * 6;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#12060a" />
      <radialGradient id="hc-rim" cx="0.5" cy="0.45" r="0.6">
        <stop offset="0" stopColor="#5a0e12" />
        <stop offset="1" stopColor="#0a0306" />
      </radialGradient>
      <rect x={0} y={0} width={w} height={h} fill="url(#hc-rim)" />
      <g transform={`translate(${w / 2} ${h * 0.55}) rotate(${tilt}) scale(${h / 400})`}>
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${-150 + i * 34} -120 L${-130 + i * 34} -200 L${-112 + i * 34} -118 Z`} fill="#8a1a14" />
        ))}
        <path d="M-120 -130 C-130 -40 -110 70 0 110 C110 70 130 -40 120 -130 C60 -170 -60 -170 -120 -130 Z" fill="#e8e2d6" />
        <path d="M-80 -60 L-30 -40 L-40 -10 L-86 -24 Z" fill="#140a0a" />
        <path d="M80 -60 L30 -40 L40 -10 L86 -24 Z" fill="#140a0a" />
        <circle cx={-52} cy={-32} r={5} fill="#ffda6a" opacity={glint} />
        <circle cx={52} cy={-32} r={5} fill="#ffda6a" opacity={glint} />
        <circle cx={0} cy={6} r={18} fill="#b8141a" />
        <path d="M-84 34 Q0 110 84 34 Q0 70 -84 34 Z" fill="#6a0a0e" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${-62 + i * 15} ${44 + Math.abs(i - 4) * -3} l7 16 l7 -16 Z`} fill="#efe6d0" />
        ))}
      </g>
      <rect x={0} y={0} width={w} height={h} fill="#ff2a2a" opacity={0.05 + noise(t * 8, 1) * 0.04} />
    </g>
  );
};

export const Screens: React.FC = () => {
  const { t } = useShot();
  const off = ramp(t, 4.7, 4.95, EASE.in);
  const phoneOff = ramp(t, 5.3, 5.5);
  const cam = {
    x: keys(t, [[0, 60], [9.5, 0]], EASE.drift),
    y: keys(t, [[0, -330], [9.5, -300]], EASE.drift),
    zoom: keys(t, [[0, 0.95], [4.7, 1.25], [9.5, 1.85]], EASE.drift),
  };
  const glow = 1 - off;
  // When the Hollywood image dies, an ordinary lamp comes on: the room is just a room.
  const lamp = ramp(t, 5.4, 6.0, EASE.out);
  const tvLight: Light = { key: off > 0.5 ? "#dcbc94" : "#b8c8e8", ambient: "#07080c", amb: lerp(0.5, lerp(0.72, 0.34, lamp), off), desat: lerp(0.4, 0.2, lamp) };
  const L = (c: string) => lit(c, tvLight);
  const tvW = 760;
  const tvH = 430;
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#040507">
        <Plane d={2.4}>
          <Room x0={-2400} x1={2400} h={900} paper="#3a3e44" floor="#2a2622" light={tvLight} stripes={false} />
          <Frame x={-1400} y={-780} w={330} h={470} light={tvLight} frame="#101010" art={<HorrorClown t={t * 0.3} w={330} h={470} />} />
          <Frame x={1080} y={-760} w={300} h={430} light={tvLight} frame="#101010" art={
            <g>
              <rect width={300} height={430} fill="#0c0a10" />
              <circle cx={150} cy={170} r={70} fill="#b8141a" />
              <path d="M150 240 Q140 320 160 430" stroke="#d8d0c0" strokeWidth={3} fill="none" />
            </g>
          } />
          {/* the television */}
          <rect x={-420} y={-160} width={840} height={160} fill={L("#1a1a1c")} />
          <rect x={-tvW / 2 - 16} y={-200 - tvH - 16} width={tvW + 32} height={tvH + 32} rx={8} fill={L("#0e0e10")} />
          <defs>
            <clipPath id="tv-screen">
              <rect x={-tvW / 2} y={-200 - tvH} width={tvW} height={tvH} />
            </clipPath>
          </defs>
          <rect x={-tvW / 2} y={-200 - tvH} width={tvW} height={tvH} fill="#050608" />
          <g clipPath="url(#tv-screen)">
            <g transform={`translate(0 ${-200 - tvH / 2}) scale(1 ${lerp(1, 0.01, off)}) translate(0 ${200 + tvH / 2})`} opacity={1 - ramp(t, 4.9, 5.1)}>
              <g transform={`translate(${-tvW / 2} ${-200 - tvH})`}>
                <HorrorClown t={t} w={tvW} h={tvH} />
              </g>
            </g>
            {/* reflection in the dead screen: the room, and the person watching */}
            <g opacity={ramp(t, 5.0, 6.4) * 0.5}>
              <path d={`M${-tvW / 2} ${-200 - tvH} L${-tvW / 2 + 260} ${-200 - tvH} L${-tvW / 2 + 60} -200 L${-tvW / 2} -200 Z`} fill="#8a96a8" opacity={0.12} />
              <ellipse cx={30} cy={-260} rx={70} ry={80} fill="#1c2028" />
              <path d="M-120 -200 Q30 -330 180 -200 Z" fill="#1c2028" />
              <circle cx={-260} cy={-520} r={16} fill="#e8c890" opacity={0.6} />
            </g>
          </g>
          {glow > 0 ? <Glow x={0} y={-420} r={1300} color="#c83a3a" opacity={0.28 * glow} /> : null}
          <Pool x={0} y={40} rx={1600} ry={140} color="#b8c8f0" opacity={0.25 * glow} />
          <TableLamp x={-1750} y={-150} on={lerp(0.35, 0.8, off)} light={tvLight} />
          <rect x={-1830} y={-150} width={170} height={150} fill={L("#2a2420")} />
          <rect x={530} y={-150} width={180} height={150} fill={L("#2a2420")} />
          <TableLamp x={620} y={-150} on={lamp} light={tvLight} />
          {lamp > 0 ? <Pool x={620} y={-300} rx={1000} ry={600} color="#ffd8a0" opacity={0.3 * lamp} /> : null}
        </Plane>
        <Plane d={-4.2}>
          {/* the viewer on the couch, back to us */}
          <path d="M-1300 200 L-1300 -40 Q-1300 -110 -1200 -110 L700 -110 Q800 -110 800 -40 L800 200 Z" fill={L("#16181c")} />
          <Person x={-160} y={150} s={1} look={NEIGHBORS[4]} view="back" light={{ ...tvLight, amb: 0.9 }} pose={idle(STAND, t * 0.4, 7, 0.3)} shadow={false} />
          <g transform="translate(560 -118) rotate(-8)">
            <rect x={-40} y={-80} width={80} height={150} rx={10} fill="#0a0a0c" />
            <rect x={-34} y={-72} width={68} height={134} rx={6} fill="#0c0808" />
            <g opacity={1 - phoneOff}>
              <svg x={-34} y={-72} width={68} height={134} viewBox="0 0 330 470" preserveAspectRatio="xMidYMid slice">
                <HorrorClown t={t + 3} w={330} h={470} />
              </svg>
            </g>
            <Glow x={0} y={0} r={200} color="#e0e8ff" opacity={0.25 * (1 - phoneOff)} />
          </g>
        </Plane>
      </Stage>
      <Finish temp={-0.4} vignette={0.85} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------ 0:26 the costume

export const Closet: React.FC = () => {
  const { t } = useShot();
  const hall: Light = { key: "#f0d0a0", ambient: "#0a080c", amb: 0.38 };
  const L = (c: string) => lit(c, hall);
  const close = ramp(t, 1.7, 3.3, EASE.inOut);
  const cam = { x: keys(t, [[0, -60], [3.65, 0]]), y: -470, zoom: keys(t, [[0, 1.9], [3.65, 2.5]], EASE.drift) };
  const dw = 420;
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} bg="#030304">
        <Plane d={1}>
          <rect x={-1600} y={-1000} width={3200} height={1000} fill={L("#2a2622")} />
          <rect x={-1600} y={0} width={3200} height={600} fill={L("#1c1612")} />
          {/* inside the closet */}
          <rect x={-dw / 2} y={-820} width={dw} height={820} fill={L("#141210")} />
          <rect x={-dw / 2} y={-760} width={dw} height={10} fill={L("#3a3024")} />
          {[-160, -110, 130].map((cx, i) => (
            <path key={cx} d={`M${cx} -752 L${cx + 50} -752 L${cx + 60} -330 L${cx - 10} -330 Z`} fill={L(["#2e3440", "#3a3024", "#2a2e2a"][i])} />
          ))}
          {/* Pogo's costume on its hanger */}
          <g>
            <path d="M-20 -760 L0 -780 L20 -760" stroke={L("#b8b0a0")} strokeWidth={4} fill="none" />
            <path d="M-80 -730 L80 -730 L100 -420 L60 -420 L56 -210 L-56 -210 L-60 -420 L-100 -420 Z" fill={L("#9a2e28")} />
            <ellipse cx={0} cy={-735} rx={96} ry={22} fill={L("#e8e2d6")} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={0} cy={-660 + i * 70} r={10} fill={L(i === 1 ? "#2d4f86" : "#d9b23a")} />
            ))}
          </g>
          <Pool x={40} y={-520} rx={260} ry={460} color="#f0cc98" opacity={0.55 * (1 - close)} />
          {/* door, swinging shut */}
          <rect x={-dw / 2 - 30} y={-850} width={dw + 60} height={850} fill="none" stroke={L("#4a3e30")} strokeWidth={30} />
          <rect x={dw / 2 - lerp(dw * 0.45, dw, close)} y={-820} width={lerp(dw * 0.45, dw, close)} height={820} fill={L("#3e3228")} />
          <circle cx={dw / 2 - lerp(dw * 0.45, dw, close) + 30} cy={-420} r={9} fill={L("#8a7a50")} />
        </Plane>
        <Plane d={-2}>
          <Wash x={-3000} y={-2000} w={1800} h={4000} from="left" color="#000" opacity={0.8} />
        </Plane>
      </Stage>
      <Finish vignette={0.9} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------- 0:30 the costume he wore

export const Morning: React.FC = () => {
  const { t } = useShot();
  const L = DAY;
  const doorX = -350;
  const step = walkBetween(t, 0.9, 1.8, doorX, doorX + 170);
  const pick = ramp(t, 1.8, 2.3) - ramp(t, 2.4, 2.9);
  const waveK = ramp(t, 3.0, 3.4) - ramp(t, 4.6, 5.0);
  const leave = walkBetween(t, 6.9, 8.4, doorX + 170, doorX + 600);
  const gx = t < 6.9 ? step.x : leave.x;
  let gp = idle(pose({ smile: 1, turn: lerp(0, -0.5, ramp(t, 5.0, 5.6)) }), t, 1);
  gp = t < 1.8 ? walk(gp, step.phase, step.amt) : gp;
  gp = { ...gp, lean: gp.lean + pick * 40, hipDrop: gp.hipDrop + pick * 30, neck: gp.neck + pick * 20, nearUpper: lerp(gp.nearUpper, 60, pick), nearFore: lerp(gp.nearFore, 10, pick) };
  if (waveK > 0) {
    gp = { ...gp, ...wave(t, waveK), mouth: 0 };
  }
  if (t > 6.9) {
    gp = walk(gp, leave.phase, leave.amt);
  }
  const hasPaper = t > 2.3;
  const neighbor = idle(pose({ farUpper: 34, farFore: 40, turn: 0.2, smile: 0.6, ...(t > 3.4 && t < 4.6 ? wave(t + 1, ramp(t, 3.4, 3.7) - ramp(t, 4.3, 4.6)) : {}) }), t, 12);
  const cam = {
    // the wide holds Gacy at the door and the neighbour's hose inside the frame
    x: keys(t, [[0, 1015], [3.3, 1015], [6.3, -140], [8.2, 60]], EASE.inOut),
    // He is on the stoop (160 up) until he walks off it, so the frame follows him down.
    y: keys(t, [[0, -380], [3.3, -380], [6.3, -420], [8.2, -300]]),
    zoom: keys(t, [[0, 0.46], [3.3, 0.46], [6.3, 1.25], [7.35, 1.3]], EASE.inOut),
  };
  const onStoop = gx < doorX + 250 ? -160 : lerp(-160, 0, clamp((gx - doorX - 250) / 250));
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={4} t={t}>
        <Suburb
          t={t}
          mode="day"
          gacyLit={0}
          neighborsLit={0}
          doorOpen={ramp(t, 0.1, 0.7, EASE.out)}
          onLawn={
            <Plane d={-1.2}>
              <Person x={gx} y={onStoop} look={GACY} light={L} pose={gp} opacity={ramp(t, 0.4, 0.7)} nearHold={hasPaper ? <Newspaper light={L} /> : undefined} />
              {!hasPaper ? (
                <g transform={`translate(${doorX + 190} -150)`}>
                  <rect x={-36} y={-12} width={72} height={24} rx={10} fill={lit("#dcd6c8", L)} />
                </g>
              ) : null}
              <Person x={2380} y={0} look={NEIGHBORS[0]} facing={-1} light={L} pose={neighbor} nearHold={undefined} farHold={<rect x={-4} y={0} width={8} height={40} fill={lit("#3a6a3a", L)} />} />
              <path d={`M2290 -150 Q2100 ${-260 + noise(t * 3, 1) * 10} 1930 -10`} stroke="#d8e8f0" strokeWidth={4} strokeDasharray="10 14" strokeDashoffset={-t * 60} fill="none" opacity={0.7} />
            </Plane>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------- 0:37 businessman, contractor

export const Driveway: React.FC = () => {
  const { t } = useShot();
  const L = DAY;
  const g = walkBetween(t, -0.4, 1.4, 700, 1320);
  const gp = t < 1.4 ? walk(idle(STAND, t, 2), g.phase, g.amt) : gesture(talk(idle(pose({ smile: 0.8 }), t, 2), t, 2), t, 2);
  const w1 = walkBetween(t, 0, 2.2, 3100, 2350, 0.95);
  const cam = { x: keys(t, [[0, 1300], [2.55, 1700]]), y: -360, zoom: 0.42 };
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={4} t={t}>
        <Suburb
          t={t}
          mode="day"
          gacyLit={0}
          neighborsLit={0}
          onLawn={
            <>
              <Plane d={-6}>
                <Lumber x={2900} n={5} len={600} light={L} />
                <Person x={w1.x} look={WORKERS[1]} facing={-1} light={L} pose={walk(pose({ ...CARRY }), w1.phase, w1.amt * 0.8)} nearHold={<rect x={-10} y={0} width={20} height={380} fill={lit("#c8a070", L)} transform="rotate(-62)" />} />
              </Plane>
              <Plane d={-8.6}>
                <Person x={g.x} look={GACY_WORK} light={L} pose={gp} farHold={<Clipboard light={L} />} />
              </Plane>
            </>
          }
          onRoad={
            <Plane d={-11.2}>
              <Car x={1900} kind="van" color="#e8e2d0" facing={-1} light={L} lettering />
              <Person x={2350} look={WORKERS[0]} facing={-1} light={L} pose={idle(pose({ ...CARRY, lean: 12 }), t, 8)} />
            </Plane>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------- 0:40 party host

export const BackyardParty: React.FC<{ readonly wide?: boolean }> = ({ wide = false }) => {
  const { t } = useShot();
  const L: Light = { key: "#ffc890", ambient: "#2a1e22", amb: 0.22, desat: 0.05 };
  const cam = wide
    ? { x: keys(t, [[0, -300], [6, 300]]), y: -440, zoom: 0.85 }
    : { x: keys(t, [[0, -40], [1.8, 120]]), y: -290, zoom: 1.35 };
  const laugh = Math.max(0, Math.sin(t * 5)) * 0.5;
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <Sky mode="dusk" t={t} clouds={0.5} />
        <Plane d={14}>
          {Array.from({ length: 10 }, (_, i) => (
            <Tree key={i} x={-5000 + i * 1100} h={1500 + (i % 3) * 400} light={L} t={t} seed={i} tone="#2a3428" />
          ))}
        </Plane>
        <GroundStrip near={-9} far={14} color="#4a5a3a" farColor="#3a4a30" light={L} />
        <Plane d={4.5}>
          <PicketFence x0={-4000} x1={4000} h={320} light={L} color="#c8bca8" />
          <PicnicTable x={-600} light={L} cloth="#d8d0c0" />
          {[0, 1].map((i) => (
            <Person key={i} x={-880 + i * 560} look={NEIGHBORS[i * 4]} facing={i ? -1 : 1} light={L} pose={talk(idle(pose({ hipDrop: 84, nearThigh: 86, nearKnee: 88, farThigh: 82, farKnee: 84, farUpper: 40, farFore: 80, smile: 0.6 }), t, 50 + i), t, 50 + i, 0.4)} />
          ))}
        </Plane>
        <Plane d={1.4}>
          {[1, 3].map((ni, i) => (
            <Person key={ni} x={400 + i * 300} look={NEIGHBORS[ni]} facing={i ? -1 : 1} light={L} pose={talk(idle(pose({ farUpper: 30, farFore: 76, smile: 0.8 }), t, ni + 4), t, ni + 4, i === 0 ? 0.8 : 0.3)} farHold={<Cup light={L} />} />
          ))}
        </Plane>
        <Plane d={0}>
          <StringLights x0={-2200} x1={2200} y={-860} sag={70} t={t} />
          <Grill x={-60} t={t} light={L} />
          <Person x={-280} look={GACY} light={L} pose={talk(idle(pose({ smile: 1, nearUpper: 44, nearFore: 50, farUpper: 30, farFore: 60, mouth: laugh }), t, 3), t, 3, 0.6)} nearHold={<Spatula light={L} />} />
          <Person x={250} look={NEIGHBORS[2]} facing={-1} light={L} pose={talk(idle(pose({ farUpper: 30, farFore: 80, smile: 1, mouth: laugh * 0.8 }), t, 9), t, 9, 0.3)} farHold={<Cup light={L} />} />
        </Plane>
        <Plane d={-3}>
          <Person x={1050} look={NEIGHBORS[5]} facing={-1} light={{ ...L, amb: 0.45 }} pose={idle(pose({ farUpper: 30, farFore: 76, turn: 0.3 }), t, 31)} farHold={<Cup light={L} />} />
        </Plane>
        <Plane d={-5}>
          <Person x={-1350} look={NEIGHBORS[4]} light={{ ...L, amb: 0.85 }} facing={1} pose={idle(pose({ farUpper: 30, farFore: 76 }), t, 30)} farHold={<Cup light={L} />} />
        </Plane>
      </Stage>
      <Finish temp={0.8} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const Party: React.FC = () => <BackyardParty />;

// ------------------------------------------------------- 0:42 community

export const Hall: React.FC = () => {
  const { t } = useShot();
  const L: Light = { key: "#fff0d8", ambient: "#3a342e", amb: 0.14 };
  const cam = { x: keys(t, [[0, 60], [1.85, -40]]), y: -360, zoom: 1.45 };
  const shake = ramp(t, 0.2, 0.7);
  const gp = solve(STAND, GACY_SUIT);
  const meet = { x: 118, y: -205 };
  const ga = reachAngles(gp.near.shoulder, meet, gp.torsoAngle, gp.dims.upper, gp.dims.fore);
  const pumping = Math.sin(t * 10) * 3 * shake;
  const op = solve(STAND, DEFENSE);
  const oa = reachAngles(op.near.shoulder, { x: 236 - meet.x, y: meet.y }, op.torsoAngle, op.dims.upper, op.dims.fore);
  const fl = flashAmount(t, 1.55);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t}>
        <Plane d={3}>
          <Room x0={-3200} x1={3200} h={900} paper="#8a7a60" floor="#5a4a38" light={L} />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={-3000 + i * 900} y={-900} width={40} height={900} fill={lit("#6a5a44", L)} />
          ))}
          <Bunting x0={-2400} x1={0} y={-820} light={L} />
          <Bunting x0={0} x1={2400} y={-820} light={L} />
          <Flag x={-1100} t={t} light={L} />
          <Podium x={-500} light={L} />
        </Plane>
        <Plane d={0}>
          <Person x={0} look={GACY_SUIT} light={L} pose={talk(idle(pose({ smile: 1, nearUpper: ga.upper, nearFore: ga.fore + pumping }), t, 4), t, 4, 0.7)} />
          <Person x={236} look={DEFENSE} facing={-1} light={L} pose={idle(pose({ smile: 0.8, nearUpper: oa.upper, nearFore: oa.fore - pumping }), t, 5)} />
          <Person x={-540} look={NEIGHBORS[2]} light={L} pose={idle(pose({ farUpper: 60, farFore: 60 }), t, 9)} nearHold={undefined} farHold={<PressCamera flash={fl} light={L} />} />
          <Person x={900} look={NEIGHBORS[1]} facing={-1} light={L} pose={idle(pose({ smile: 0.7 }), t, 10)} />
        </Plane>
        <Plane d={-3.6}>
          {/* the audience: two heads frame the handshake, the rest sit outside the frame */}
          {[-1250, -190, 210, 1250, -1800, 1800].map((ax, i) => (
            <g key={i}>
              <Person x={ax} y={20} look={[...NEIGHBORS, ...WORKERS][i]} view="back" light={{ ...L, amb: 0.5 }} pose={pose({ hipDrop: 84, nearThigh: 86, nearKnee: 88, farThigh: 82, farKnee: 84 })} shadow={false} />
            </g>
          ))}
        </Plane>
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- 0:44 employer

export const JobSite: React.FC<{ readonly t: number; readonly light: Light; readonly frame?: boolean }> = ({ t, light, frame = true }) => {
  const L = (c: string) => lit(c, light);
  return (
    <>
      <Sky mode="day" t={t} clouds={0.5} />
      <Plane d={30}>
        {Array.from({ length: 12 }, (_, i) => (
          <Tree key={i} x={-7000 + i * 1300} h={1400 + (i % 3) * 400} light={light} t={t} seed={i} tone="#3e5638" />
        ))}
      </Plane>
      <GroundStrip near={-9} far={30} color="#8a7a60" farColor="#7a8a5a" light={light} />
      {frame ? (
        <Plane d={5}>
          {/* a house going up: stud walls and a roof truss line */}
          <rect x={-1800} y={-120} width={3600} height={120} fill={L("#8a867e")} />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={-1780 + i * 122} y={-620} width={16} height={500} fill={L("#c8a070")} />
          ))}
          <rect x={-1800} y={-640} width={3600} height={24} fill={L("#b8905e")} />
          <rect x={-1800} y={-140} width={3600} height={24} fill={L("#b8905e")} />
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M${-1800 + i * 400} -640 L${-1600 + i * 400} -900 L${-1400 + i * 400} -640`} stroke={L("#b8905e")} strokeWidth={14} fill="none" />
          ))}
          <rect x={900} y={-1000} width={16} height={1000} fill={L("#a88a5a")} />
          <rect x={1300} y={-1000} width={16} height={1000} fill={L("#a88a5a")} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={900} y={-1000 + i * 170} width={416} height={10} fill={L("#a88a5a")} />
          ))}
        </Plane>
      ) : null}
      <Plane d={2}>
        <Lumber x={-1400} n={7} len={800} light={light} />
        <Sawhorse x={1200} light={light} />
        <rect x={1060} y={-196} width={300} height={20} fill={L("#c8a070")} />
      </Plane>
    </>
  );
};

export const Crew: React.FC = () => {
  const { t } = useShot();
  const L = DAY;
  const cam = { x: keys(t, [[0, 40], [2.95, 120]]), y: -285, zoom: keys(t, [[0, 1.5], [2.95, 1.68]]) };
  const give = ramp(t, 0.3, 0.9) - ramp(t, 1.9, 2.3);
  const g = solve(STAND, GACY_WORK);
  const ga = reachAngles(g.near.shoulder, { x: 150, y: -200 }, g.torsoAngle, g.dims.upper, g.dims.fore);
  const w = solve(STAND, WORKERS[0]);
  const wa = reachAngles(w.near.shoulder, { x: 150, y: -200 }, w.torsoAngle, w.dims.upper, w.dims.fore);
  const carrier = walkBetween(t, 0, 3.4, 2600, -2800);
  const passer = walkBetween(t, 1.8, 3.4, 1900, -1100);
  return (
    <AbsoluteFill>
      <Stage cam={cam} handheld={3} t={t}>
        <JobSite t={t} light={L} />
        <Plane d={1.5}>
          <Person x={carrier.x} look={WORKERS[2]} facing={-1} light={L} pose={walk(pose({ ...CARRY }), carrier.phase, carrier.amt)} nearHold={<rect x={-10} y={0} width={20} height={420} fill={lit("#c8a070", L)} transform="rotate(-60)" />} />
        </Plane>
        <Plane d={0}>
          <Person x={-60} look={GACY_WORK} light={L} pose={talk(idle(pose({ smile: 1, nearUpper: lerp(4, ga.upper, give), nearFore: lerp(8, ga.fore, give) }), t, 6), t, 6, 0.6)} nearHold={give > 0.5 ? <Keys light={L} /> : undefined} />
          <Person x={240} look={WORKERS[0]} facing={-1} light={L} pose={idle(pose({ smile: 0.7, nearUpper: lerp(4, wa.upper, give), nearFore: lerp(8, wa.fore, give) }), t, 7)} />
        </Plane>
        <Plane d={-4.5}>
          <Person x={passer.x} look={WORKERS[3]} facing={-1} light={{ ...L, amb: 0.3 }} pose={walk(pose({ ...CARRY }), passer.phase, passer.amt)} nearHold={<rect x={-60} y={-30} width={120} height={600} fill={lit("#b8905e", L)} transform="rotate(-80)" />} />
        </Plane>
      </Stage>
      <Finish temp={0.3} vignette={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------ 0:46 under the house, up

export const Descent: React.FC = () => {
  const { t } = useShot();
  // Camera choreography, local seconds (0 = 0:46.55).
  const camX = keys(t, [[0, -300], [1.4, -300], [3.0, -500], [4.6, -520], [6.8, -760], [7.2, -760], [8.4, -620], [9.6, -300], [12, 0], [20.4, 260]]);
  const camY = keys(t, [[0, -420], [1.4, -420], [3.0, -360], [4.6, -142], [5.6, -62], [7.2, -56], [7.9, -150], [8.5, -420], [9.2, -820], [9.9, -1300], [11.6, -1900], [16, -2000], [20.4, -1700]]);
  const zoom = keys(t, [[0, 0.5], [1.4, 0.55], [3.0, 1.15], [4.6, 2.2], [5.6, 2.5], [7.2, 2.45], [8.5, 1.4], [9.2, 1.0], [9.9, 0.6], [11.6, 0.34], [16, 0.31], [20.4, 0.36]]);
  const peel = ramp(t, 2.0, 3.1) * (1 - ramp(t, 9.0, 9.9));
  const sectionK = peel;
  const room: Light = { key: "#ffe2b8", ambient: "#20160e", amb: 0.18 };
  const crawlL: Light = { key: "#8a96ac", ambient: "#06070a", amb: 0.62, desat: 0.35 };
  const guests = [
    { look: NEIGHBORS[0], x: -1180, f: 1 as const },
    { look: NEIGHBORS[1], x: -960, f: -1 as const },
    { look: GACY, x: -660, f: 1 as const },
    { look: NEIGHBORS[3], x: -300, f: -1 as const },
    { look: NEIGHBORS[5], x: 380, f: 1 as const },
    { look: NEIGHBORS[2], x: 560, f: -1 as const },
  ];
  const porchOff = 1 - ramp(t, 19.4, 19.6);
  return (
    <AbsoluteFill>
      <Stage cam={{ x: camX, y: camY, zoom }} handheld={3} t={t}>
        <Suburb
          t={t + 46}
          mode="night"
          gacyLit={1}
          neighborsLit={0.45}
          tv={false}
          porch={0.85 * porchOff}
          peel={peel}
          ground={1 - sectionK}
          sleep={ramp(t, 12.5, 19.2)}
          inside={(b) => (
            <g>
              {guests.slice(0, 4).map((gs, i) => (
                <Person key={i} x={b.x + 90 + i * 150} y={b.y + b.h + 170} s={0.95} look={gs.look} facing={gs.f} mode="silhouette" silhouette="#4a2e1c" pose={talk(idle(STAND, t, i), t, i, 0.5)} />
              ))}
            </g>
          )}
          behindHouses={null}
        />
        {sectionK > 0 ? (
          <Plane d={0} opacity={sectionK}>
            <HouseSection
              t={t}
              roomLight={room}
              crawlLight={crawlL}
              lamps={1}
              party
              crawl={{ patches: 6, vents: 0.9, drip: true, haze: 0.25 }}
              living={
                <g>
                  {guests.map((gs, i) => (
                    <Person key={i} x={gs.x} y={SEC.floor} look={gs.look} facing={gs.f} light={room} pose={talk(gesture(idle(pose({ smile: gs.look === GACY ? 1 : 0.6, farUpper: 30, farFore: 76 }), t, i + 40), t, i + 40, 0.5), t, i + 40, i === 2 ? 1 : 0.35)} farHold={gs.look === GACY ? undefined : <Cup light={room} />} />
                  ))}
                </g>
              }
              under={<Motes t={t} x={-1300} y={-110} w={2400} h={140} n={40} color="#b8c4d8" opacity={0.5} />}
            />
          </Plane>
        ) : null}
      </Stage>
      <Haze t={t} density={0.25 * (1 - sectionK)} />
      <Title t={t} from={8.6} to={16.4} />
      <Finish temp={-0.5} vignette={0.8} />
    </AbsoluteFill>
  );
};



