import React from "react";
import { AbsoluteFill } from "remotion";
import { lit } from "../../gacy/engine/color";
import {Glow } from "../../gacy/kit/light";
import { Sky } from "../../gacy/kit/sky";
import { Snow } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import {CHILDREN, EMMA, EMMA_OLD, LIZZIE, LIZZIE_BLACK, LIZZIE_OLD, TOWNSFOLK } from "../rig/cast";
import { FrontPage } from "../kit/paper";
import { Elm, GasLamp, Headstone, IronFence, Parcel, Tally } from "../kit/props";
import {Cemetery, MainStreet, Maplecroft, Mansion } from "../kit/town";
import {EASE, FOLDED, Finish, LIGHT, Person, Plane, Stage, cam, hash, idle, pose, ramp, standing, useShot, walker, type Light } from "./common";

/**
 * 12:48–13:47. After the trial: a bigger house on the Hill, a town that
 * did not change its mind, a sister who left, two deaths nine days apart,
 * and one family plot.
 */

/** The street on the Hill with Maplecroft at 0. */
const FrenchStreet: React.FC<{ t: number; light: Light; lamps?: number; lit?: number; children?: React.ReactNode; windows?: React.ReactNode; snow?: boolean }> = ({ t, light, lamps = 0, lit: lampsOn = 0, children, windows, snow = false }) => {
  const night = light === LIGHT.night;
  return (
    <>
      <Sky mode={night ? "night" : light === LIGHT.grey ? "overcast" : "day"} t={t} clouds={0.5} stars={night} moon={night ? { x: 1500, y: 150 } : null} />
      <Plane d={40}>
        <rect x={-30000} y={-10} width={60000} height={600} fill={lit(night ? "#1a2a1a" : snow ? "#c8d0d8" : "#5a7a48", light)} />
        {Array.from({ length: 30 }, (_, i) => (
          <Elm key={i} x={-14000 + i * 1000 + hash(i) * 500} h={2000 + hash(i + 3) * 1000} light={light} t={t} seed={i} tone={night ? "#1e2e22" : snow ? "#4a4a44" : "#3e5a36"} />
        ))}
      </Plane>
      <GroundStrip near={-10} far={40} color={night ? "#2a3a2a" : snow ? "#d8dee6" : "#6a8a4a"} farColor={night ? "#1e2a22" : snow ? "#b8c0c8" : "#4e6a3e"} light={light} />
      <Plane d={0}>
        <Mansion id="nb1" x={-6400} light={light} color="#a8b8b0" seed={2} turret={false} lit={lampsOn} />
        <Maplecroft x={0} light={light} lit={lampsOn} />
        <Mansion id="nb2" x={6400} light={light} color="#d0c0a0" seed={3} lit={lampsOn} />
        {windows}
        <Elm x={-2600} h={2800} light={light} t={t} seed={21} tone={night ? "#1e2e22" : snow ? "#4a4a44" : "#3e5a36"} />
        <Elm x={2800} h={2600} light={light} t={t} seed={22} tone={night ? "#1e2e22" : snow ? "#4a4a44" : "#3e5a36"} />
      </Plane>
      <Plane d={-4}>
        <IronFence x0={-20000} x1={20000} h={240} light={light} />
        <rect x={-300} y={-250} width={600} height={250} fill={lit(night ? "#1e2a1e" : snow ? "#d8dee6" : "#5a7a48", light)} />
      </Plane>
      <GroundStrip near={-6} far={-4} color={night ? "#8a8a82" : "#b8b4aa"} light={light} />
      <Plane d={-5}>
        <GasLamp x={-1600} on={lamps} light={light} t={t} />
        <GasLamp x={1800} on={lamps} light={light} t={t} />
      </Plane>
      <GroundStrip near={-30} far={-6} color={night ? "#3a3a3a" : snow ? "#b8bec6" : "#8a8478"} light={light} />
      {children}
    </>
  );
};

export const MaplecroftShot: React.FC = () => {
  const { t, dur } = useShot();
  // The sisters walk up French Street toward the big house.
  const L = LIGHT.afternoon;
  const a = walker(t, 0.4, dur + 1, -2600, -500, undefined, 1);
  const b = walker(t, 0.4, dur + 1, -2800, -700, undefined, 2);
  const c = cam(t, [[0, -1800], [dur, -300]], [[0, -900], [dur, -1000]], [[0, 0.5], [dur, 0.38]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <FrenchStreet t={t} light={L}>
          <Plane d={-5.5}>
            <Person x={a.x} look={LIZZIE} light={L} pose={a.pose} facing={a.facing} />
            <Person x={b.x} look={EMMA} light={L} pose={b.pose} facing={b.facing} />
          </Plane>
        </FrenchStreet>
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const TheHillHome: React.FC = () => {
  const { t, dur } = useShot();
  // The house front; the camera settles on the name on the step.
  const L = LIGHT.afternoon;
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -900], [5.0, -700], [dur, -810]], [[0, 0.4], [5.0, 0.7], [dur, 1.5]], EASE.inOut);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <FrenchStreet t={t + 10} light={L}>
          <Plane d={-5.5}>
            <Person x={-400} look={LIZZIE} light={L} pose={standing(t, 1, { turn: 0.3 })} facing={1} opacity={1 - ramp(t, 5.0, 6.0)} />
            <Person x={-600} look={EMMA} light={L} pose={standing(t, 2, { turn: 0.3 })} facing={1} opacity={1 - ramp(t, 5.0, 6.0)} />
          </Plane>
        </FrenchStreet>
      </Stage>
      <Finish temp={0.4} vignette={0.6} />
    </AbsoluteFill>
  );
};

export const InnocentLegally: React.FC = () => {
  const { t, dur } = useShot();
  // Lizzie walks down Main Street; people turn away as she passes.
  const L = LIGHT.noon;
  const w = walker(t, 0, dur + 1, -2600, 1200, undefined, 1);
  const c = cam(t, [[0, -2000], [dur, 800]], [[0, -600], [dur, -580]], [[0, 0.7], [dur, 0.75]]);
  const passers = [
    { look: TOWNSFOLK[0], x: -1800, f: 1 as const },
    { look: TOWNSFOLK[1], x: -1100, f: -1 as const },
    { look: TOWNSFOLK[2], x: -300, f: 1 as const },
    { look: TOWNSFOLK[3], x: 500, f: -1 as const },
    { look: TOWNSFOLK[5], x: 1300, f: 1 as const },
  ];
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <MainStreet
          t={t + 300}
          light={L}
          onWalk={
            <g>
              {passers.map((p, i) => {
                const near = Math.abs(w.x - p.x) < 500;
                const away = near ? (w.x < p.x ? 1 : -1) : 0;
                return <Person key={i} x={p.x} look={p.look} light={L} pose={standing(t, i + 3, { turn: away === 0 ? 0.3 : 1 })} facing={away === 0 ? p.f : (away as 1 | -1)} view={near ? "back" : "3q"} />;
              })}
              <Person x={w.x} look={LIZZIE_BLACK} light={L} pose={w.pose} facing={w.facing} />
            </g>
          }
        />
      </Stage>
      <Finish temp={0.3} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const Shunned: React.FC = () => {
  const { t, dur } = useShot();
  // 792.9 a woman crosses the street; 794.3 children run after her, chanting; 796.5 two neighbours whisper behind a fence.
  const L = LIGHT.noon;
  const b = t < 1.5 ? 0 : t < 3.7 ? 1 : 2;
  const cross = walker(t, 0.1, 1.5, -1400, -2400, undefined, 4);
  const kids = CHILDREN.map((_, i) => walker(t, 1.6 + i * 0.15, 3.7, -2200 - i * 180, -600 - i * 160, undefined, 10 + i));
  const liz = walker(t, 1.5, 3.7, -1200, 200, undefined, 1);
  const c = b === 0 ? cam(t, [[0, -1600], [1.5, -1800]], -560, [[0, 0.8], [1.5, 0.85]]) : b === 1 ? cam(t, [[1.5, -1400], [3.7, -300]], -560, [[1.5, 0.85], [3.7, 0.9]]) : cam(t, [[3.7, -1400], [dur, -1350]], -700, [[3.7, 0.55], [dur, 0.6]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        {b === 0 ? (
          <MainStreet t={t + 320} light={L} onWalk={<Person x={-1200} look={LIZZIE_BLACK} light={L} pose={standing(t, 1)} facing={1} />} onRoad={<Person x={cross.x} look={TOWNSFOLK[1]} light={L} pose={cross.pose} facing={cross.facing} />} />
        ) : b === 1 ? (
          <MainStreet
            t={t + 320}
            light={L}
            onWalk={
              <g>
                <Person x={liz.x} look={LIZZIE_BLACK} light={L} pose={liz.pose} facing={liz.facing} />
                {kids.map((k, i) => (
                  <Person key={i} x={k.x} look={CHILDREN[i]} light={L} pose={{ ...k.pose, mouth: 0.5 + Math.sin(t * 10 + i) * 0.4, nearUpper: k.pose.nearUpper + 40 }} facing={k.facing} />
                ))}
              </g>
            }
          />
        ) : (
          <FrenchStreet t={t} light={L}>
            <Plane d={-5.5}>
              <Person x={-1500} look={TOWNSFOLK[1]} light={L} pose={idle(pose({ turn: 0.2, neck: 6, nearUpper: 60, nearFore: 110 }), t, 7, 0.6)} facing={1} />
              <Person x={-1300} look={TOWNSFOLK[3]} light={L} pose={idle(pose({ ...FOLDED, turn: 0.2, neck: 8 }), t, 8, 0.6)} facing={-1} />
            </Plane>
          </FrenchStreet>
        )}
      </Stage>
      <Finish temp={0.3} vignette={0.65} />
    </AbsoluteFill>
  );
};

export const NameBelongs: React.FC = () => {
  const { t, dur } = useShot();
  // Lizzie at her window in Maplecroft; over the picture, the chalk rhyme and a front page rise and take the frame.
  const rise = ramp(t, 1.4, 4.0, EASE.inOut);
  const L = LIGHT.afternoon;
  const c = cam(t, [[0, -320], [dur, -320]], [[0, -1300], [dur, -1340]], [[0, 1.4], [dur, 1.7]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <FrenchStreet
          t={t + 20}
          light={L}
          windows={
            <g>
              <rect x={-420} y={-1310} width={200} height={320} fill="#2a2a30" opacity={0.7} />
              <Person x={-320} y={-900} look={LIZZIE_OLD} light={LIGHT.dim} pose={idle(pose({ turn: -0.7 }), t, 4, 0.4)} view="front" />
              <path d={`M-420 -1310 L-220 -1310 L-220 -990 L-420 -990 Z`} fill="#fff" opacity={0.06} />
            </g>
          }
        />
      </Stage>
      <AbsoluteFill style={{ opacity: rise * 0.85, backgroundColor: "#1a1612" }} />
      <AbsoluteFill style={{ opacity: rise }}>
        <Stage cam={{ x: 0, y: -40, zoom: 1.2 }} t={t} bg="transparent">
          <Plane d={0}>
            <FrontPage id="nb" x={-500} y={-80} w={420} h={600} rot={-6} light={{ key: "#ffe9c8", ambient: "#1e150c", amb: 0.3 }} masthead="THE WORLD" headline={"LIZZIE\nBORDEN"} seed={11} age={0.4} />
            <Tally x={100} y={-200} n={40} s={1.6} />
            <Tally x={100} y={-40} n={41} s={1.6} />
          </Plane>
        </Stage>
      </AbsoluteFill>
      <Finish temp={0.3} vignette={0.7} />
    </AbsoluteFill>
  );
};

export const Emma1905: React.FC = () => {
  const { t, dur } = useShot();
  // Emma leaves with a trunk; Lizzie at the window; then the two windows: one lit, one dark.
  const L = LIGHT.afternoon;
  const w = walker(t, 1.0, 5.0, -600, -2200, undefined, 2);
  const nightK = ramp(t, 6.4, 8.6, EASE.inOut);
  const cDay = cam(t, [[0, -300], [6.4, -900]], [[0, -700], [6.4, -800]], [[0, 0.55], [6.4, 0.5]]);
  const cNight = cam(t, [[6.4, -100], [dur, 0]], [[6.4, -1100], [dur, -1200]], [[6.4, 0.7], [dur, 0.8]]);
  return (
    <AbsoluteFill>
      {nightK < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - nightK }}>
          <Stage cam={cDay} t={t}>
            <FrenchStreet
              t={t + 30}
              light={L}
              windows={
                <g>
                  <rect x={-420} y={-1310} width={200} height={320} fill="#2a2a30" opacity={0.7} />
                  <Person x={-320} y={-900} look={LIZZIE_OLD} light={LIGHT.dim} pose={idle(pose({ turn: -0.7 }), t, 4, 0.4)} view="front" />
                </g>
              }
            >
              <Plane d={-5.5}>
                <Person x={w.x} look={EMMA_OLD} light={L} pose={w.pose} facing={w.facing} nearHold={<Parcel light={L} />} />
              </Plane>
            </FrenchStreet>
          </Stage>
          <Finish temp={0.3} vignette={0.65} />
        </AbsoluteFill>
      ) : null}
      {nightK > 0 ? (
        <AbsoluteFill style={{ opacity: nightK }}>
          <Stage cam={cNight} t={t} bg="#05060a">
            <FrenchStreet t={t + 300} light={LIGHT.night} lamps={1} lit={0.4} windows={<g><rect x={-420} y={-1310} width={200} height={320} fill="#f0c070" opacity={0.6} /><rect x={220} y={-1310} width={200} height={320} fill="#10151d" /></g>} />
          </Stage>
          <Finish temp={-0.4} vignette={0.8} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Deaths: React.FC = () => {
  const { t, dur } = useShot();
  // Maplecroft in winter, at night. 816.1 one window goes dark; 821.4 another, nine days later, elsewhere.
  const one = ramp(t, 3.0, 3.6);
  const two = ramp(t, 8.0, 8.6);
  const c = cam(t, [[0, -100], [dur, 100]], [[0, -1100], [dur, -1000]], [[0, 0.7], [dur, 0.62]]);
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t} bg="#05060a">
        <FrenchStreet
          t={t + 400}
          light={LIGHT.night}
          lamps={1}
          lit={0.25}
          snow
          windows={
            <g>
              <rect x={-420} y={-1310} width={200} height={320} fill="#f0c070" opacity={0.6 * (1 - one)} />
              <Glow x={-320} y={-1150} r={400} color="#f0c070" opacity={0.3 * (1 - one)} />
              <rect x={5980} y={-1310} width={200} height={320} fill="#f0c070" opacity={0.5 * (1 - two)} />
            </g>
          }
        />
      </Stage>
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <Snow t={t} density={0.5} />
        </svg>
      </AbsoluteFill>
      <Finish temp={-0.6} vignette={0.85} />
    </AbsoluteFill>
  );
};

export const FamilyPlot: React.FC = () => {
  const { t, dur } = useShot();
  // Oak Grove: the Borden monument and four small stones; the camera pulls back.
  const c = cam(t, [[0, 0], [dur, 0]], [[0, -400], [dur, -500]], [[0, 1.1], [dur, 0.6]]);
  const L = LIGHT.grey;
  return (
    <AbsoluteFill>
      <Stage cam={c} t={t}>
        <Cemetery t={t} light={L}>
          {[-520, -300, 300, 520].map((x, i) => (
            <Headstone key={x} x={x} h={110 + (i % 2) * 10} w={80} light={L} round={false} />
          ))}
          <Person x={-1400} look={TOWNSFOLK[1]} light={L} pose={standing(t, 3, { turn: 0.6 })} facing={1} opacity={0.6} />
        </Cemetery>
      </Stage>
      <Finish temp={-0.3} vignette={0.75} />
    </AbsoluteFill>
  );
};

