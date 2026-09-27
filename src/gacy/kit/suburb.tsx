import React from "react";
import { Plane, planeScale, toScreen, useCam } from "../engine/camera";
import { darken, lit, type Light } from "../engine/color";
import { hash } from "../engine/time";
import { GACY_HOUSE, HOUSE_STYLES, RanchHouse, type WindowBox } from "./house";
import { Pool } from "./light";
import { Sky, type SkyMode } from "./sky";
import { GroundStrip, Mailbox, RoadLines, StreetLamp, Tree, UtilityPole, Wires } from "./street";

/**
 * The street Gacy lived on, as one set.
 *
 * Depths (metres behind the character plane): the house fronts sit at 0,
 * lawns run 8 m toward the street, then sidewalk, parkway, a 7 m road and
 * the near kerb. A wide shot from across the street is zoom ≈ 0.5
 * (camera 20 m back); a push to the front door is zoom 2 and the street
 * planes simply pass behind the lens.
 */

export const SUBURB = {
  lawnNear: -8,
  walkNear: -9.2,
  parkNear: -10.4,
  roadFar: -10.6,
  roadNear: -17.6,
  roadMid: -14.1,
  nearWalk: -19.4,
  houseStep: 4400,
} as const;

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
  return (
    <path
      d={`M${a.x} ${a.y} L${b.x} ${b.y} L${c.x} ${c.y} L${d.x} ${d.y} Z`}
      fill={color}
      opacity={opacity}
    />
  );
};

export type SuburbMode = "night" | "dusk" | "day" | "winterDay" | "winterNight" | "predawn";

export const lightFor = (mode: SuburbMode): Light => {
  switch (mode) {
    case "night":
      return { key: "#8fa2c2", ambient: "#0b111c", amb: 0.5, desat: 0.25 };
    case "winterNight":
      return { key: "#9aaccc", ambient: "#0e1520", amb: 0.46, desat: 0.3 };
    case "predawn":
      return { key: "#a4aec0", ambient: "#1a2130", amb: 0.35, desat: 0.2 };
    case "dusk":
      return { key: "#e0a888", ambient: "#2a2230", amb: 0.3, desat: 0.1 };
    case "winterDay":
      return { key: "#e8ecf0", ambient: "#6a7480", amb: 0.12, desat: 0.25 };
    default:
      return { key: "#fff6e8", ambient: "#6a6a70", amb: 0.06 };
  }
};

const skyFor = (mode: SuburbMode): SkyMode =>
  mode === "night" || mode === "winterNight"
    ? "night"
    : mode === "winterDay"
      ? "winterDay"
      : mode === "predawn"
        ? "predawn"
        : mode;

export const Suburb: React.FC<{
  readonly t: number;
  readonly mode?: SuburbMode;
  readonly snow?: number;
  /** Interior lights of Gacy's house 0–1. */
  readonly gacyLit?: number;
  readonly neighborsLit?: number;
  readonly tv?: boolean;
  readonly porch?: number;
  readonly peel?: number;
  readonly inside?: (b: WindowBox) => React.ReactNode;
  /** Picture-window contents for the other houses on the street (index ≠ 0). */
  readonly insideOthers?: (i: number, b: WindowBox) => React.ReactNode;
  /** Slots, each drawn inside the right depth plane. */
  readonly onLawn?: React.ReactNode;
  readonly onRoad?: React.ReactNode;
  readonly onNearWalk?: React.ReactNode;
  readonly foreground?: React.ReactNode;
  readonly behindHouses?: React.ReactNode;
  readonly houses?: number;
  readonly lamps?: boolean;
  readonly moon?: { x: number; y: number } | null;
  readonly doorOpen?: number;
  /** Fades the street's ground (lawns, road, walks, lamps) for section views. */
  readonly ground?: number;
  /** 0–1: the neighbourhood going to bed. Other houses' windows go dark one by one. */
  readonly sleep?: number;
}> = ({
  t,
  mode = "night",
  snow = 0,
  gacyLit = 0.8,
  neighborsLit = 0.5,
  tv = false,
  porch = 0,
  peel = 0,
  inside,
  insideOthers,
  onLawn,
  onRoad,
  onNearWalk,
  foreground,
  behindHouses,
  houses = 2,
  lamps = true,
  moon = { x: 1500, y: 150 },
  doorOpen = 0,
  ground = 1,
  sleep = 0,
}) => {
  const awake = (seed: number) => (sleep > 0 && sleep > hash(seed) * 0.95 ? 0 : 1);
  const light = lightFor(mode);
  const night = mode === "night" || mode === "winterNight" || mode === "predawn";
  const winter = mode.startsWith("winter") || snow > 0.3;
  const lawn = winter ? "#cfd8e2" : night ? "#2a3a2c" : "#6a8052";
  const lawnFar = winter ? "#b8c4d0" : night ? "#1e2a22" : "#5a7046";
  const walk = winter ? "#c4ccd4" : "#9a968c";
  const road = winter ? "#5a5e64" : "#3a3c40";
  const L = (c: string) => lit(c, light);
  const idx = Array.from({ length: houses * 2 + 1 }, (_, i) => i - houses);
  return (
    <>
      <Sky mode={skyFor(mode)} t={t} moon={night ? moon : null} clouds={night ? 0.6 : 0.4} stars={night && mode !== "predawn"} />
      {/* far tree line */}
      <Plane d={70}>
        <rect x={-30000} y={-10} width={60000} height={400} fill={L(night ? "#141c22" : "#4a5a48")} />
        {Array.from({ length: 60 }, (_, i) => (
          <Tree
            key={i}
            x={-24000 + i * 800 + hash(i) * 400}
            h={1500 + hash(i + 3) * 900}
            kind={winter || hash(i + 7) > 0.8 ? "bare" : "leafy"}
            tone={night ? "#18221c" : "#3e5040"}
            light={light}
            t={t}
            seed={i}
          />
        ))}
      </Plane>
      <Plane d={40}>
        {Array.from({ length: 14 }, (_, i) => {
          const hx = -14000 + i * 2200;
          return (
            <g key={i} transform={`translate(${hx} 0)`}>
              <path d="M-900 -560 L-400 -800 L400 -800 L900 -560 Z" fill={L(night ? "#1a1f26" : "#5a5650")} />
              <rect x={-850} y={-560} width={1700} height={560} fill={L(night ? "#20252c" : "#8a8478")} />
              {night && hash(i + 20) > 0.45 && awake(i + 60) ? (
                <rect x={-500} y={-420} width={300} height={200} fill="#e8b870" opacity={0.5 * neighborsLit} />
              ) : null}
            </g>
          );
        })}
      </Plane>
      {behindHouses}
      <GroundStrip near={SUBURB.lawnNear} far={40} color={lawn} farColor={lawnFar} light={light} opacity={ground} />
      {/* houses */}
      <Plane d={0}>
        {idx.map((i) => {
          const hx = i * SUBURB.houseStep;
          const isG = i === 0;
          const style = isG ? GACY_HOUSE : HOUSE_STYLES[(i + 5) % HOUSE_STYLES.length];
          return (
            <g key={i}>
              {!isG ? (
                <Tree x={hx - 2200} h={1500 + hash(i + 1) * 500} kind={winter ? "bare" : "leafy"} light={light} t={t} seed={i + 30} tone={night ? "#1f2d24" : "#3a5438"} />
              ) : null}
              <RanchHouse
                id={`house${i + 10}`}
                x={hx}
                style={style}
                light={light}
                night={night}
                lit={isG ? gacyLit : neighborsLit * (hash(i + 2) > 0.3 ? 1 : 0.2) * awake(i + 90)}
                t={t}
                tv={isG ? tv : hash(i) > 0.6 && night}
                snow={winter ? 1 : 0}
                garage="right"
                porchLight={isG ? porch : night && hash(i + 9) > 0.5 ? 0.6 : 0}
                inside={isG ? inside : insideOthers ? (b: WindowBox) => insideOthers(i, b) : undefined}
                peel={isG ? peel : 0}
                doorOpen={isG ? doorOpen : 0}
              />
            </g>
          );
        })}
      </Plane>
      {/* driveways and walks, lying on the lawn */}
      {ground > 0 && idx.map((i) => {
        const hx = i * SUBURB.houseStep;
        const gx = hx + 1400;
        return (
          <g key={`dw${i}`}>
            <GroundQuad x0={gx + 60} x1={gx + 940} d0={0} d1={SUBURB.parkNear} color={L(winter ? "#b4bcc6" : night ? "#b0aca2" : "#8a867e")} opacity={ground * (night ? 0.8 : 1)} />
            <GroundQuad x0={hx - 520} x1={hx - 280} d0={0} d1={SUBURB.lawnNear} color={L(winter ? "#bcc4ce" : night ? "#b8b4aa" : "#9a968c")} opacity={ground * (night ? 0.8 : 1)} />
          </g>
        );
      })}
      {onLawn}
      <GroundStrip near={SUBURB.walkNear} far={SUBURB.lawnNear} color={walk} light={light} opacity={ground} />
      <GroundStrip near={SUBURB.parkNear} far={SUBURB.walkNear} color={lawn} light={light} opacity={ground} />
      <GroundStrip near={SUBURB.roadNear} far={SUBURB.roadFar} color={road} farColor={darken(road, 0.1)} light={light} opacity={ground} />
      {ground > 0 ? <RoadLines d={SUBURB.roadMid} light={light} /> : null}
      {lamps && ground > 0 ? (
        <Plane d={SUBURB.parkNear + 0.3} opacity={ground}>
          {[-2, -1, 0, 1, 2].map((i) => (
            <StreetLamp key={i} x={i * 5200 + 2600} t={t} on={night ? 1 : 0} light={light} />
          ))}
          {[-3, -2, -1, 0, 1, 2].map((i) => (
            <UtilityPole key={`p${i}`} x={i * 4200 - 600} light={light} />
          ))}
          {[-3, -2, -1, 0, 1].map((i) => (
            <Wires key={`w${i}`} x0={i * 4200 - 600} x1={(i + 1) * 4200 - 600} light={light} />
          ))}
          <Mailbox x={-1250} light={light} />
        </Plane>
      ) : null}
      {onRoad}
      <GroundStrip near={SUBURB.nearWalk} far={SUBURB.roadNear} color={walk} light={light} opacity={ground} />
      <GroundStrip near={-40} far={SUBURB.nearWalk} color={lawn} light={light} opacity={ground} />
      {onNearWalk}
      {night ? (
        <Plane d={SUBURB.roadMid}>
          <Pool x={0} y={0} rx={9000} ry={400} color="#0a0f18" opacity={0.3} blend="normal" />
        </Plane>
      ) : null}
      {foreground}
    </>
  );
};
