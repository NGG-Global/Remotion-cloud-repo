import React from "react";
import { Plane, planeScale, toScreen, useCam } from "../../gacy/engine/camera";
import { darken, lighten, lit, mix, type Light, NEUTRAL } from "../../gacy/engine/color";
import { hash, noise } from "../../gacy/engine/time";
import { Glow, Pool } from "../../gacy/kit/light";
import { Sky, type SkyMode } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import { Elm, GasLamp, Headstone, IronFence } from "./props";
import { BordenHouse, HOUSE } from "./house";
import { TYPE } from "../theme";
import { LIGHT } from "../theme";

/**
 * Fall River, 1892, as a handful of sets: the mill town from a hill, the
 * granite mills, "the Hill" where the money lived, Second Street where the
 * Bordens lived, Main Street, a church, the courthouse, Maplecroft and the
 * cemetery. Same world scale as the house (200 units per metre).
 */

export const skyFor = (light: Light): SkyMode =>
  light === LIGHT.night ? "night" : light === LIGHT.grey ? "overcast" : light === LIGHT.morning ? "dusk" : "day";

/** A quadrilateral lying on the ground between depths d0 (far) and d1 (near). */
export const GroundQuad: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly d0: number;
  readonly d1: number;
  readonly color: string;
  readonly opacity?: number;
}> = ({ x0, x1, d0, d1, color, opacity = 1 }) => {
  const cam = useCam();
  if (planeScale(cam, d0) <= 0) {
    return null;
  }
  const near = Math.max(d1, -10 / cam.zoom + 0.5);
  const a = toScreen(cam, x0, 0, d0);
  const b = toScreen(cam, x1, 0, d0);
  const c = toScreen(cam, x1, 0, near);
  const d = toScreen(cam, x0, 0, near);
  return <path d={`M${a.x} ${a.y} L${b.x} ${b.y} L${c.x} ${c.y} L${d.x} ${d.y} Z`} fill={color} opacity={opacity} />;
};

// ------------------------------------------------------------ the mills

/** A granite textile mill: long, five storeys of windows, a tower and a stack. */
export const Mill: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly floors?: number;
  readonly light?: Light;
  readonly t?: number;
  readonly smoke?: number;
  readonly tower?: boolean;
  readonly lit?: number;
  readonly seed?: number;
}> = ({ x, w = 3600, floors = 5, light = NEUTRAL, t = 0, smoke = 1, tower = true, lit: lamps = 0, seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  const fh = 300;
  const h = floors * fh;
  const cols = Math.floor(w / 160);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={L("#7a746a")} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={-w / 2} y={-h + i * (h / 6)} width={w} height={3} fill={L("#5a544c")} opacity={0.5} />
      ))}
      {Array.from({ length: floors }, (_, f) =>
        Array.from({ length: cols }, (_, c) => (
          <g key={`${f}-${c}`}>
            <rect x={-w / 2 + 40 + c * 160} y={-h + 60 + f * fh} width={80} height={180} fill={lamps > 0 && hash(seed + f * 31 + c) > 0.3 ? mix(L("#26303a"), "#ffd890", lamps) : L("#26303a")} />
            <path d={`M${-w / 2 + 40 + c * 160} ${-h + 60 + f * fh} a40 40 0 0 1 80 0`} fill={L("#5a544c")} />
          </g>
        )),
      )}
      <rect x={-w / 2 - 30} y={-h - 40} width={w + 60} height={40} fill={L("#5a544c")} />
      {tower ? (
        <g>
          <rect x={-200} y={-h - 500} width={400} height={500} fill={L("#8a847a")} />
          <path d="M-220 -1900 L0 -2200 L220 -1900 Z" transform={`translate(0 ${-h + 1900 - 500 + 500})`} fill={L("#3a3438")} />
          <rect x={-60} y={-h - 420} width={120} height={200} fill={L("#26303a")} />
        </g>
      ) : null}
      {/* chimney stack */}
      <rect x={w / 2 - 300} y={-h - 1300} width={140} height={1300} fill={L("#5a4a42")} />
      <rect x={w / 2 - 320} y={-h - 1340} width={180} height={50} fill={L("#3a3030")} />
      {smoke > 0
        ? Array.from({ length: 7 }, (_, i) => {
            const k = ((t * 0.12 + i / 7 + hash(seed + i) * 0.3) % 1);
            const sx = w / 2 - 230 + k * 900 + noise(t * 0.4 + i, i) * 60;
            const sy = -h - 1340 - k * 700;
            return <ellipse key={i} cx={sx} cy={sy} rx={120 + k * 260} ry={70 + k * 140} fill={L("#8a847a")} opacity={(0.5 - k * 0.45) * smoke} />;
          })
        : null}
    </g>
  );
};

/** The town seen from the Hill: mills along the river, tenements, steeples, smoke. */
export const MillTown: React.FC<{ readonly t: number; readonly light?: Light; readonly evening?: boolean }> = ({ t, light = LIGHT.noon, evening = false }) => {
  const L = (c: string) => lit(c, light);
  const glass = evening ? mix(L("#26303a"), "#ffd890", 0.7) : L("#26303a");
  const tenement = (hx: number, i: number, scale: number) => {
    const hh = (700 + hash(i * 7) * 500) * scale;
    const hw = 360 * scale;
    return (
      <g key={i} transform={`translate(${hx} 0)`}>
        <rect x={-hw} y={-hh} width={hw * 2} height={hh} fill={L(["#8a7a6a", "#7a6a5a", "#9a8a70", "#6a6a62", "#a08a6a"][i % 5])} />
        <path d={`M${-hw - 30} ${-hh} L0 ${-hh - 200 * scale} L${hw + 30} ${-hh} Z`} fill={L("#3a3438")} />
        <rect x={hw * 0.4} y={-hh - 260 * scale} width={50 * scale} height={200 * scale} fill={L("#5a4a42")} />
        {Array.from({ length: 3 }, (_, k) => (
          <rect key={k} x={-hw + 60 * scale + k * 240 * scale} y={-hh + 100 * scale} width={90 * scale} height={140 * scale} fill={hash(i + k) > 0.4 ? glass : L("#26303a")} />
        ))}
      </g>
    );
  };
  return (
    <>
      <Sky mode={evening ? "dusk" : skyFor(light)} t={t} clouds={0.6} stars={false} />
      {/* far hills */}
      <Plane d={200}>
        <path d="M-40000 -1400 Q-30000 -3000 -20000 -1900 Q-10000 -3200 0 -2100 Q10000 -3300 20000 -2000 Q30000 -2900 40000 -1700 L40000 0 L-40000 0 Z" fill={L(evening ? "#3a3a4a" : "#6a7a7a")} />
      </Plane>
      {/* the bay and the river with the mills along it */}
      <Plane d={110}>
        <rect x={-40000} y={-900} width={80000} height={900} fill={L(evening ? "#4a4a5a" : "#7a96a0")} />
        {Array.from({ length: 6 }, (_, i) => (
          <Mill key={i} x={-16000 + i * 6400 + hash(i) * 1000} w={3600 + hash(i + 3) * 1800} floors={5} light={light} t={t + i * 7} seed={i * 5} tower={i % 2 === 0} lit={evening ? 0.9 : 0} />
        ))}
      </Plane>
      <Plane d={70}>
        <rect x={-30000} y={-10} width={60000} height={1200} fill={L(evening ? "#2a3428" : "#4a5a3a")} />
        {Array.from({ length: 5 }, (_, i) => (
          <Mill key={i} x={-12000 + i * 6000 + hash(i + 9) * 1500} w={2800 + hash(i + 4) * 1400} floors={4} light={light} t={t + i * 3} seed={i * 11} tower={i % 2 === 1} smoke={0.9} lit={evening ? 0.9 : 0} />
        ))}
      </Plane>
      <Plane d={40}>
        <rect x={-30000} y={-10} width={60000} height={1200} fill={L(evening ? "#2a3428" : "#4e5e3e")} />
        {Array.from({ length: 40 }, (_, i) => tenement(-16000 + i * 820 + hash(i * 3) * 300, i, 1))}
        {[-9000, 2000, 11000].map((sx) => (
          <g key={sx} transform={`translate(${sx} 0)`}>
            <rect x={-200} y={-1600} width={400} height={1600} fill={L("#e8e2d4")} />
            <path d="M-240 -1600 L0 -2600 L240 -1600 Z" fill={L("#3a3438")} />
            <rect x={-30} y={-1500} width={60} height={200} fill={L("#26303a")} />
          </g>
        ))}
      </Plane>
      <Plane d={18}>
        <rect x={-30000} y={-10} width={60000} height={1200} fill={L(evening ? "#26301e" : "#5a6a42")} />
        {Array.from({ length: 24 }, (_, i) => tenement(-12000 + i * 1000 + hash(i * 5) * 400, i + 40, 1.15))}
      </Plane>
      <GroundStrip near={-30} far={18} color={evening ? "#3a4a34" : "#6a8a4a"} farColor={evening ? "#2a3a2a" : "#4a6a3a"} light={light} />
      <Plane d={-2}>
        {Array.from({ length: 5 }, (_, i) => (
          <Elm key={i} x={-9000 + i * 4500 + hash(i + 20) * 1000} h={2400 + hash(i + 3) * 800} light={light} t={t} seed={i + 50} tone={evening ? "#1e2e22" : "#3e5a36"} />
        ))}
      </Plane>
    </>
  );
};

/** Workers leaving a mill gate. */
export const MillGate: React.FC<{ readonly light?: Light; readonly t?: number }> = ({ light = NEUTRAL, t = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g>
      <Mill x={0} w={5000} floors={5} light={light} t={t} tower />
      <rect x={-800} y={-520} width={1600} height={520} fill={L("#3a3438")} />
      <rect x={-760} y={-500} width={1520} height={500} fill={L("#14181c")} />
      <IronFence x0={-2500} x1={-800} h={260} light={light} />
      <IronFence x0={800} x1={2500} h={260} light={light} />
      {[-820, 780].map((px) => (
        <rect key={px} x={px - 40} y={-620} width={80} height={620} fill={L("#6a645c")} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- houses

/** A wealthy house on the Hill: mansard roof, a turret, a deep porch. */
export const Mansion: React.FC<{ readonly x: number; readonly light?: Light; readonly color?: string; readonly seed?: number; readonly turret?: boolean; readonly lit?: number; readonly id: string }> = ({ x, light = NEUTRAL, color = "#c8b890", seed = 0, turret = true, lit: lamps = 0, id }) => {
  const L = (c: string) => lit(c, light);
  const w = 2600;
  const trim = lighten(color, 0.3);
  const glass = (gx: number, gy: number, gw: number, gh: number, k: string) => (
    <g key={k}>
      <rect x={gx - 12} y={gy - 12} width={gw + 24} height={gh + 24} fill={L(trim)} />
      <rect x={gx} y={gy} width={gw} height={gh} fill={lamps > 0 && hash(seed + gx) > 0.4 ? mix(L("#2a3440"), "#ffd890", lamps) : L("#2a3440")} />
      <path d={`M${gx + gw / 2} ${gy} V${gy + gh}`} stroke={L(trim)} strokeWidth={6} />
    </g>
  );
  return (
    <g transform={`translate(${x} 0)`} data-id={id}>
      {/* main block */}
      <rect x={-w / 2} y={-1500} width={w} height={1500} fill={L(color)} />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={-w / 2} y={-1500 + 30 + i * 46} width={w} height={3} fill={L(darken(color, 0.12))} opacity={0.5} />
      ))}
      {/* mansard roof */}
      <path d={`M${-w / 2 - 80} -1500 L${-w / 2 + 200} -1900 L${w / 2 - 200} -1900 L${w / 2 + 80} -1500 Z`} fill={L("#3a3438")} />
      <rect x={-w / 2 + 200} y={-1930} width={w - 400} height={40} fill={L("#2a2428")} />
      {[-800, 0, 800].map((dx) => (
        <g key={dx}>
          <rect x={dx - 120} y={-1800} width={240} height={280} fill={L(color)} />
          <path d={`M${dx - 150} -1800 L${dx} -1900 L${dx + 150} -1800 Z`} fill={L("#2a2428")} />
          {glass(dx - 70, -1780, 140, 200, `d${dx}`)}
        </g>
      ))}
      {/* turret */}
      {turret ? (
        <g>
          <rect x={w / 2 - 500} y={-2000} width={500} height={2000} fill={L(darken(color, 0.05))} />
          <path d={`M${w / 2 - 560} -2000 L${w / 2 - 250} -2600 L${w / 2 + 60} -2000 Z`} fill={L("#3a3438")} />
          {glass(w / 2 - 320, -1850, 140, 220, "t1")}
          {glass(w / 2 - 320, -1250, 140, 220, "t2")}
          {glass(w / 2 - 320, -650, 140, 220, "t3")}
        </g>
      ) : null}
      {/* windows */}
      {[-900, -500, 100, 500].map((wx) => glass(wx - 80, -1300, 160, 300, `u${wx}`))}
      {[-900, 500].map((wx) => glass(wx - 80, -700, 160, 300, `l${wx}`))}
      {/* porch */}
      <rect x={-500} y={-760} width={1000} height={30} fill={L(trim)} />
      <path d="M-540 -760 L500 -760 L460 -860 L-500 -860 Z" fill={L("#3a3438")} />
      {[-440, -160, 120, 400].map((px) => (
        <rect key={px} x={px - 16} y={-730} width={32} height={730} fill={L(trim)} />
      ))}
      <rect x={-140} y={-620} width={220} height={620} fill={L("#3a2a22")} />
      <rect x={-110} y={-580} width={160} height={200} fill={L("#2a3440")} />
      <rect x={-520} y={-90} width={1040} height={90} fill={L(darken(trim, 0.2))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-220 - i * 40} y={-60 + i * 30} width={440 + i * 80} height={30} fill={L(i % 2 ? "#8a8a82" : "#9a9a92")} />
      ))}
      <Pool x={0} y={-600} rx={180} ry={200} color="#ffd890" opacity={0.25 * lamps} />
    </g>
  );
};

/** The Hill: mansions behind iron fences and elms. */
export const TheHill: React.FC<{ readonly t: number; readonly light?: Light; readonly houses?: number; readonly lamps?: number }> = ({ t, light = LIGHT.noon, houses = 3, lamps = 0 }) => {
  const L = (c: string) => lit(c, light);
  const night = light === LIGHT.night;
  return (
    <>
      <Sky mode={skyFor(light)} t={t} clouds={0.5} stars={night} />
      <Plane d={40}>
        <rect x={-30000} y={-10} width={60000} height={600} fill={L(night ? "#1a2a1a" : "#5a7a48")} />
        {Array.from({ length: 30 }, (_, i) => (
          <Elm key={i} x={-14000 + i * 1000 + hash(i) * 500} h={2000 + hash(i + 3) * 1000} light={light} t={t} seed={i} tone={night ? "#1e2e22" : "#3e5a36"} />
        ))}
      </Plane>
      <GroundStrip near={-10} far={40} color={night ? "#2a3a2a" : "#6a8a4a"} farColor={night ? "#1e2a22" : "#4e6a3e"} light={light} />
      <Plane d={0}>
        {Array.from({ length: houses }, (_, i) => {
          const hx = (i - Math.floor(houses / 2)) * 6200;
          return (
            <g key={i}>
              <Mansion id={`m${i}`} x={hx} light={light} color={["#c8b890", "#a8b8b0", "#d0c0a0"][i % 3]} seed={i} turret={i % 2 === 0} lit={lamps} />
              <Elm x={hx - 2600} h={2600 + hash(i) * 600} light={light} t={t} seed={i + 20} tone={night ? "#1e2e22" : "#3e5a36"} />
            </g>
          );
        })}
      </Plane>
      <Plane d={-4}>
        <IronFence x0={-20000} x1={20000} h={240} light={light} />
        {[-6000, 0, 6000].map((gx) => (
          <rect key={gx} x={gx - 300} y={-250} width={600} height={250} fill={L(night ? "#1e2a1e" : "#5a7a48")} />
        ))}
      </Plane>
      <GroundStrip near={-6} far={-4} color={night ? "#8a8a82" : "#b8b4aa"} light={light} />
      <GroundStrip near={-30} far={-6} color={night ? "#3a3a3a" : "#8a8478"} light={light} />
    </>
  );
};

/** Second Street: modest houses close together, the Borden house at 0. */
export const SecondStreet: React.FC<{
  readonly t: number;
  readonly light?: Light;
  readonly lamps?: number;
  readonly bordenLit?: number;
  readonly neighborsLit?: number;
  readonly onWalk?: React.ReactNode;
  readonly onRoad?: React.ReactNode;
  readonly inYard?: React.ReactNode;
  readonly foreground?: React.ReactNode;
  readonly doorOpen?: number;
  readonly sideDoorOpen?: number;
  readonly windowsUp?: number;
  readonly peel?: number;
  readonly barn?: boolean;
  readonly heat?: number;
}> = ({ t, light = LIGHT.noon, lamps = 0, bordenLit = 0, neighborsLit = 0, onWalk, onRoad, inYard, foreground, doorOpen = 0, sideDoorOpen = 0, windowsUp = 0, peel = 0, barn = true, heat = 0 }) => {
  const L = (c: string) => lit(c, light);
  const night = light === LIGHT.night;
  const walk = night ? "#7a7a74" : "#b0aa9c";
  const road = night ? "#3a3a36" : "#8a8070";
  return (
    <>
      <Sky mode={skyFor(light)} t={t} clouds={0.5} stars={night} moon={night ? { x: 1500, y: 150 } : null} />
      <Plane d={60}>
        <rect x={-30000} y={-10} width={60000} height={600} fill={L(night ? "#141c18" : "#4a5a3a")} />
        {Array.from({ length: 24 }, (_, i) => (
          <Elm key={i} x={-12000 + i * 1000 + hash(i) * 500} h={1600 + hash(i + 3) * 900} light={light} t={t} seed={i} tone={night ? "#18221c" : "#3e5a36"} />
        ))}
        {[-7000, 4000].map((sx) => (
          <g key={sx} transform={`translate(${sx} 0)`}>
            <rect x={-160} y={-1400} width={320} height={1400} fill={L("#e8e2d4")} />
            <path d="M-190 -1400 L0 -2200 L190 -1400 Z" fill={L("#3a3438")} />
          </g>
        ))}
      </Plane>
      <GroundStrip near={-7} far={60} color={night ? "#2a3a2c" : "#7a8a58"} farColor={night ? "#1e2a22" : "#5a6a48"} light={light} />
      {/* back yard and barn behind the house */}
      {barn ? (
        <Plane d={9}>
          <Barn x={HOUSE.barnX} light={light} />
        </Plane>
      ) : null}
      <Plane d={0}>
        <NeighborHouse x={-2500} light={light} color="#b8b0a0" lit={neighborsLit} seed={1} />
        <NeighborHouse x={2300} light={light} color="#c8c0a8" lit={neighborsLit * 0.6} seed={2} />
        <BordenHouse x={0} light={light} lit={bordenLit} t={t} doorOpen={doorOpen} sideDoorOpen={sideDoorOpen} windowsUp={windowsUp} peel={peel} />
        {inYard}
        <Elm x={-1250} h={1700} light={light} t={t} seed={7} tone={night ? "#1e2e22" : "#4a6a3a"} />
        <Elm x={3900} h={2000} light={light} t={t} seed={8} tone={night ? "#1e2e22" : "#4a6a3a"} />
      </Plane>
      <Plane d={-5}>
        <Fence x0={-3800} x1={-1500} light={light} />
        <Fence x0={-1050} x1={1050} light={light} gate={doorOpen > 0.5 ? 1 : 0} />
        <Fence x0={1400} x1={3800} light={light} />
      </Plane>
      <GroundStrip near={-6.6} far={-5.2} color={walk} light={light} />
      <Plane d={-6}>
        {onWalk}
        <GasLamp x={-1700} on={lamps} light={light} t={t} />
        <GasLamp x={2000} on={lamps} light={light} t={t} />
        <Elm x={-4200} h={2600} light={light} t={t} seed={11} tone={night ? "#1e2e22" : "#4a6a3a"} />
      </Plane>
      <GroundStrip near={-14} far={-6.6} color={road} farColor={darken(road, 0.1)} light={light} />
      {heat > 0 ? (
        <Plane d={-8}>
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} cx={-4000 + i * 2000 + noise(t * 0.5 + i, i) * 200} cy={-20} rx={900} ry={16 + noise(t * 2 + i, i + 3) * 8} fill="#fff" opacity={0.06 * heat} />
          ))}
        </Plane>
      ) : null}
      <Plane d={-9}>{onRoad}</Plane>
      <GroundStrip near={-16} far={-14} color={walk} light={light} />
      <GroundStrip near={-40} far={-16} color={night ? "#2a3a2c" : "#6a7a4a"} light={light} />
      {foreground}
    </>
  );
};

/** A plain wooden fence with an optional gate. */
export const Fence: React.FC<{ readonly x0: number; readonly x1: number; readonly light?: Light; readonly gate?: number }> = ({ x0, x1, light = NEUTRAL, gate = 0 }) => {
  const L = (c: string) => lit(c, light);
  const n = Math.floor((x1 - x0) / 36);
  const gateAt = (x0 + x1) / 2;
  return (
    <g>
      <rect x={x0} y={-160} width={x1 - x0} height={10} fill={L("#8a7a62")} />
      <rect x={x0} y={-70} width={x1 - x0} height={10} fill={L("#8a7a62")} />
      {Array.from({ length: n }, (_, i) => {
        const px = x0 + i * 36;
        if (gate > 0 && Math.abs(px - gateAt) < 110) {
          return null;
        }
        return <path key={i} d={`M${px} 0 L${px} -190 L${px + 10} -204 L${px + 20} -190 L${px + 20} 0 Z`} fill={L("#a89a80")} />;
      })}
    </g>
  );
};

/** A neighbouring clapboard house, smaller than a mansion, bigger than a cottage. */
export const NeighborHouse: React.FC<{ readonly x: number; readonly light?: Light; readonly color?: string; readonly lit?: number; readonly seed?: number }> = ({ x, light = NEUTRAL, color = "#c0b8a8", lit: lamps = 0, seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  const w = 1800;
  const glass = (gx: number, gy: number, k: string) => (
    <g key={k}>
      <rect x={gx - 12} y={gy - 12} width={164} height={264} fill={L("#ece6d8")} />
      <rect x={gx} y={gy} width={140} height={240} fill={lamps > 0 && hash(seed + gx) > 0.4 ? mix(L("#26303a"), "#ffd890", lamps) : L("#26303a")} />
      <path d={`M${gx + 70} ${gy} V${gy + 240} M${gx} ${gy + 120} H${gx + 140}`} stroke={L("#ece6d8")} strokeWidth={6} />
      <rect x={gx - 40} y={gy - 12} width={26} height={264} fill={L("#3a4a3a")} />
      <rect x={gx + 154} y={gy - 12} width={26} height={264} fill={L("#3a4a3a")} />
    </g>
  );
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-w / 2} y={-1200} width={w} height={1200} fill={L(color)} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={-w / 2} y={-1200 + 30 + i * 48} width={w} height={3} fill={L(darken(color, 0.12))} opacity={0.5} />
      ))}
      <path d={`M${-w / 2 - 80} -1200 L0 -1700 L${w / 2 + 80} -1200 Z`} fill={L("#3a3438")} />
      <rect x={w / 2 - 500} y={-1900} width={110} height={400} fill={L("#6a4a3a")} />
      {glass(-w / 2 + 200, -1080, "a")}
      {glass(-w / 2 + 500, -1080, "b")}
      {glass(w / 2 - 340, -1080, "c")}
      {glass(-w / 2 + 500, -560, "d")}
      {glass(w / 2 - 340, -560, "e")}
      <rect x={-w / 2 + 180} y={-600} width={200} height={600} fill={L("#3a2a22")} />
      <rect x={-w / 2 + 120} y={-90} width={320} height={90} fill={L("#8a8a82")} />
      <rect x={-w / 2} y={-100} width={w} height={100} fill={L("#7a7a72")} />
    </g>
  );
};

/** The barn behind the Borden house: gable end, a loft door above the big door. */
export const Barn: React.FC<{ readonly x: number; readonly light?: Light; readonly doorOpen?: number; readonly loftOpen?: number }> = ({ x, light = NEUTRAL, doorOpen = 0, loftOpen = 0 }) => {
  const L = (c: string) => lit(c, light);
  const w = 1500;
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-w / 2} y={-1100} width={w} height={1100} fill={L("#8a6a4a")} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-w / 2 + 40 + i * 104} y={-1100} width={4} height={1100} fill={L("#6a4a32")} opacity={0.7} />
      ))}
      <path d={`M${-w / 2 - 60} -1100 L0 -1620 L${w / 2 + 60} -1100 Z`} fill={L("#3a3438")} />
      <rect x={-260} y={-700} width={520} height={700} fill={L("#3a2a1e")} />
      <rect x={-250} y={-690} width={250 * (1 - doorOpen)} height={690} fill={L("#6a4a32")} />
      <rect x={0} y={-690} width={250} height={690} fill={L("#6a4a32")} />
      <path d="M-240 -680 L-10 -20 M-10 -680 L-240 -20" stroke={L("#5a3a22")} strokeWidth={14} />
      <path d="M10 -680 L240 -20 M240 -680 L10 -20" stroke={L("#5a3a22")} strokeWidth={14} />
      <rect x={-140} y={-1300} width={280} height={340} fill={L("#1a1410")} />
      <rect x={-130} y={-1290} width={260 * (1 - loftOpen)} height={320} fill={L("#6a4a32")} />
      <rect x={-w / 2} y={-40} width={w} height={40} fill={L("#5a5a52")} />
    </g>
  );
};

// ---------------------------------------------------------------- downtown

/** A block of Main Street: brick commercial buildings with awnings and signs. */
export const MainStreet: React.FC<{ readonly t: number; readonly light?: Light; readonly signs?: readonly string[]; readonly lamps?: number; readonly onWalk?: React.ReactNode; readonly onRoad?: React.ReactNode }> = ({ t, light = LIGHT.noon, signs = ["BANK", "DRY GOODS", "DRUGS", "HARDWARE"], lamps = 0, onWalk, onRoad }) => {
  const L = (c: string) => lit(c, light);
  const night = light === LIGHT.night;
  const building = (bx: number, i: number) => {
    const w = 1500;
    const floors = 3 + (i % 2);
    const h = floors * 640;
    const brick = ["#8a5a48", "#9a6a52", "#7a5a4a", "#a87a5a"][i % 4];
    return (
      <g key={i} transform={`translate(${bx} 0)`}>
        <rect x={-w / 2} y={-h} width={w} height={h} fill={L(brick)} />
        {Array.from({ length: Math.floor(h / 40) }, (_, r) => (
          <rect key={r} x={-w / 2} y={-h + r * 40} width={w} height={2} fill={L(darken(brick, 0.25))} opacity={0.5} />
        ))}
        <rect x={-w / 2 - 20} y={-h - 60} width={w + 40} height={60} fill={L("#d8ccb0")} />
        {Array.from({ length: floors - 1 }, (_, f) =>
          [-500, -160, 180, 520].map((wx) => (
            <g key={`${f}-${wx}`}>
              <rect x={wx - 90} y={-h + 120 + f * 640} width={180} height={340} fill={L("#26303a")} />
              <path d={`M${wx - 100} ${-h + 120 + f * 640} a100 100 0 0 1 200 0`} fill={L("#d8ccb0")} />
              <rect x={wx - 100} y={-h + 460 + f * 640} width={200} height={16} fill={L("#d8ccb0")} />
            </g>
          )),
        )}
        {/* shopfront */}
        <rect x={-w / 2 + 40} y={-560} width={w - 80} height={560} fill={L("#3a3a3a")} />
        <rect x={-w / 2 + 60} y={-520} width={w - 120} height={420} fill={night ? mix(L("#1e2830"), "#ffd890", 0.5 * lamps) : L("#4a5a60")} />
        <rect x={-w / 2 + 60} y={-520} width={w - 120} height={420} fill="#fff" opacity={0.08} />
        <rect x={-w / 2 + 40} y={-660} width={w - 80} height={100} fill={L("#2a2a2e")} />
        <text x={0} y={-590} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={700} fontSize={64} fill={L("#e8d8a8")} letterSpacing={6}>
          {signs[i % signs.length]}
        </text>
        <path d={`M${-w / 2 + 40} -700 L${w / 2 - 40} -700 L${w / 2 + 60} -560 L${-w / 2 - 60} -560 Z`} fill={L(i % 2 ? "#6a3a3a" : "#3a4a5a")} opacity={0.9} />
      </g>
    );
  };
  return (
    <>
      <Sky mode={skyFor(light)} t={t} clouds={0.5} stars={night} />
      <Plane d={0}>
        {[-4600, -3000, -1500, 0, 1500, 3000, 4600].map((bx, i) => building(bx, i))}
      </Plane>
      <GroundStrip near={-4} far={0} color={night ? "#5a5a56" : "#b0aa9c"} light={light} />
      <Plane d={-3.5}>
        {onWalk}
        {[-3800, -800, 2200].map((gx) => (
          <GasLamp key={gx} x={gx} on={lamps} light={light} t={t} />
        ))}
      </Plane>
      <GroundStrip near={-14} far={-4} color={night ? "#3a3a36" : "#8a8070"} farColor={night ? "#333330" : "#7a7060"} light={light} />
      <Plane d={-8}>{onRoad}</Plane>
      <GroundStrip near={-40} far={-14} color={night ? "#5a5a56" : "#b0aa9c"} light={light} />
    </>
  );
};

/** Wooden church with a steeple. */
export const Church: React.FC<{ readonly x: number; readonly light?: Light; readonly doorOpen?: number }> = ({ x, light = NEUTRAL, doorOpen = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-1100} y={-1300} width={2200} height={1300} fill={L("#ece6d8")} />
      {Array.from({ length: 26 }, (_, i) => (
        <rect key={i} x={-1100} y={-1300 + 20 + i * 48} width={2200} height={3} fill={L("#c8c2b4")} opacity={0.6} />
      ))}
      <path d="M-1180 -1300 L0 -2000 L1180 -1300 Z" fill={L("#3a3438")} />
      <rect x={-220} y={-2700} width={440} height={800} fill={L("#ece6d8")} />
      <path d="M-260 -2700 L0 -3500 L260 -2700 Z" fill={L("#3a3438")} />
      <rect x={-60} y={-2600} width={120} height={200} fill={L("#26303a")} />
      {[-700, -400, 400, 700].map((wx) => (
        <g key={wx}>
          <rect x={wx - 70} y={-1000} width={140} height={500} fill={L("#26303a")} />
          <path d={`M${wx - 70} -1000 a70 70 0 0 1 140 0`} fill={L("#26303a")} />
          <path d={`M${wx} -1070 V-500 M${wx - 70} -800 H${wx + 70}`} stroke={L("#ece6d8")} strokeWidth={8} />
        </g>
      ))}
      <rect x={-160} y={-700} width={320} height={700} fill={L("#3a2a22")} />
      <rect x={-150} y={-690} width={150 * (1 - doorOpen)} height={690} fill={L("#5a3a2a")} />
      <rect x={0} y={-690} width={150} height={690} fill={L("#5a3a2a")} />
      <path d="M-160 -700 a160 160 0 0 1 320 0 Z" fill={L("#3a2a22")} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-260 - i * 40} y={-60 + i * 30} width={520 + i * 80} height={30} fill={L(i % 2 ? "#8a8a82" : "#9a9a92")} />
      ))}
    </g>
  );
};

/** A granite courthouse with a portico, seen from the street. */
export const Courthouse1893: React.FC<{ readonly x: number; readonly light?: Light }> = ({ x, light = NEUTRAL }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-2400} y={-1700} width={4800} height={1700} fill={L("#a8a49a")} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-2400} y={-1700 + i * 210} width={4800} height={4} fill={L("#8a867c")} opacity={0.6} />
      ))}
      <path d="M-1500 -1700 L0 -2300 L1500 -1700 Z" fill={L("#b8b4aa")} />
      <path d="M-1560 -1700 L1560 -1700 L1560 -1760 L-1560 -1760 Z" fill={L("#c8c4ba")} />
      {[-1100, -600, -100, 400, 900].map((cx) => (
        <g key={cx}>
          <rect x={cx - 70} y={-1700} width={140} height={1500} fill={L("#c8c4ba")} />
          <rect x={cx - 90} y={-1720} width={180} height={40} fill={L("#d8d4ca")} />
          <rect x={cx - 90} y={-240} width={180} height={40} fill={L("#8a867c")} />
        </g>
      ))}
      {[-1900, -1650, 1650, 1900].map((wx) => (
        <rect key={wx} x={wx - 60} y={-1200} width={120} height={400} fill={L("#26303a")} />
      ))}
      {[-1900, -1650, 1650, 1900].map((wx) => (
        <rect key={`l${wx}`} x={wx - 60} y={-600} width={120} height={400} fill={L("#26303a")} />
      ))}
      <rect x={-260} y={-800} width={520} height={800} fill={L("#2a2420")} />
      <path d="M-260 -800 a260 260 0 0 1 520 0 Z" fill={L("#2a2420")} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-1500 - i * 60} y={-200 + i * 40} width={3000 + i * 120} height={40} fill={L(i % 2 ? "#9a968c" : "#aaa69c")} />
      ))}
    </g>
  );
};

/** Maplecroft: a big Queen Anne house on French Street, a name on the step. */
export const Maplecroft: React.FC<{ readonly x: number; readonly light?: Light; readonly lit?: number }> = ({ x, light = NEUTRAL, lit: lamps = 0 }) => (
  <g>
    <Mansion id="maplecroft" x={x} light={light} color="#c8b070" seed={13} turret lit={lamps} />
    <text x={x} y={-6} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={600} fontSize={40} fill={lit("#2a2418", light)} letterSpacing={4}>
      MAPLECROFT
    </text>
  </g>
);

/** Oak Grove cemetery: a family plot with a granite monument. */
export const Cemetery: React.FC<{ readonly t: number; readonly light?: Light; readonly children?: React.ReactNode }> = ({ t, light = LIGHT.grey, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <>
      <Sky mode={skyFor(light)} t={t} clouds={0.8} />
      <Plane d={40}>
        <rect x={-30000} y={-10} width={60000} height={600} fill={L("#5a6a48")} />
        {Array.from({ length: 20 }, (_, i) => (
          <Elm key={i} x={-12000 + i * 1300 + hash(i) * 500} h={2200 + hash(i + 3) * 800} light={light} t={t} seed={i} tone="#3a4a34" />
        ))}
      </Plane>
      <GroundStrip near={-12} far={40} color="#6a7a4e" farColor="#4e5e40" light={light} />
      <Plane d={14}>
        {Array.from({ length: 26 }, (_, i) => (
          <Headstone key={i} x={-9000 + i * 720 + hash(i * 7) * 300} h={160 + hash(i * 3) * 120} w={90 + hash(i) * 60} light={light} lean={(hash(i * 5) - 0.5) * 8} round={hash(i + 2) > 0.4} />
        ))}
      </Plane>
      <Plane d={6}>
        {Array.from({ length: 12 }, (_, i) => (
          <Headstone key={i} x={-6000 + i * 1100 + hash(i * 11) * 400} h={180 + hash(i * 13) * 140} w={100 + hash(i + 1) * 70} light={light} lean={(hash(i * 17) - 0.5) * 6} round={hash(i + 4) > 0.5} />
        ))}
      </Plane>
      <Plane d={0}>
        {/* the Borden monument */}
        <rect x={-260} y={-40} width={520} height={40} fill={L("#8a8a82")} />
        <rect x={-200} y={-120} width={400} height={80} fill={L("#9a9a92")} />
        <rect x={-120} y={-620} width={240} height={500} fill={L("#a4a49c")} />
        <path d="M-140 -620 L0 -700 L140 -620 Z" fill={L("#9a9a92")} />
        <text x={0} y={-380} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={700} fontSize={54} fill={L("#5a5a52")} letterSpacing={4}>
          BORDEN
        </text>
        {children}
        <Elm x={-2200} h={2600} light={light} t={t} seed={41} tone="#3a4a34" />
        <Elm x={2600} h={2400} light={light} t={t} seed={42} tone="#3a4a34" />
      </Plane>
      <GroundStrip near={-40} far={-12} color="#5e6e48" light={light} />
      <Plane d={-6}>
        <Glow x={0} y={-300} r={2000} color="#c8d0c8" opacity={0.08} />
      </Plane>
    </>
  );
};
