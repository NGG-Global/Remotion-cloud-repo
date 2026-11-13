import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BAY_LAND, BAY_PLACES, KM_PER_UNIT } from "../data/bay";
import {
  AZ,
  easeInOut,
  easeOut,
  FPS,
  mix,
  ramp,
  SANS,
  SERIF,
} from "../theme";

type Pt = { readonly x: number; readonly y: number };
type View = { readonly cx: number; readonly cy: number; readonly w: number };

const P = BAY_PLACES;
const lerpView = (a: View, b: View, t: number): View => ({
  cx: mix(a.cx, b.cx, t),
  cy: mix(a.cy, b.cy, t),
  w: Math.exp(mix(Math.log(a.w), Math.log(b.w), t)),
});

/** Quadratic bezier through a control point, as SVG path data. */
const curve = (a: Pt, c: Pt, b: Pt): string =>
  `M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`;

const Land: React.FC<{ readonly fill: string; readonly stroke: string; readonly k: number }> = ({
  fill,
  stroke,
  k,
}) => (
  <g>
    {BAY_LAND.map((d, i) => (
      <path
        key={i}
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.6 * k}
        strokeLinejoin="round"
      />
    ))}
  </g>
);

/** A label anchored to a map point, kept at a constant size on screen. */
const Tag: React.FC<{
  readonly at: Pt;
  readonly text: string;
  readonly k: number;
  readonly o: number;
  readonly dx?: number;
  readonly dy?: number;
  readonly size?: number;
  readonly color?: string;
  readonly anchor?: "start" | "middle" | "end";
  readonly font?: string;
}> = ({ at, text, k, o, dx = 0, dy = 0, size = 34, color = AZ.text, anchor = "middle", font = SERIF }) => (
  <text
    x={at.x + dx * k}
    y={at.y + dy * k}
    fontFamily={font}
    fontSize={size * k}
    fill={color}
    textAnchor={anchor}
    direction="rtl"
    opacity={o}
    style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.75)", strokeWidth: 6 * k }}
  >
    {text}
  </text>
);

type Variant = "distance" | "strategic" | "currents";

/**
 * San Francisco Bay drawn from OpenStreetMap coastline data, with a camera
 * that moves in map units so every overlay stays pinned to the place it marks.
 *
 * - `distance`: the bay, then the island and the two kilometres of water to
 *   the city.
 * - `strategic`: a ship coming in through the Golden Gate past the island's
 *   guns.
 * - `currents`: night, and the ebb pouring out through the Gate around the
 *   island the three men left from.
 */
export const BayMap: React.FC<{ readonly variant: Variant }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const A = P.alcatraz;

  let view: View;
  if (variant === "distance") {
    const wide: View = { cx: 2050, cy: 1950, w: 3300 };
    const near: View = { cx: A.x + 30, cy: A.y + 230, w: 1150 };
    view = lerpView(wide, near, easeInOut(ramp(t, 0.6, 4.4)));
  } else if (variant === "strategic") {
    const a: View = { cx: 1500, cy: 1950, w: 2500 };
    const b: View = { cx: 1650, cy: 1930, w: 2150 };
    view = lerpView(a, b, easeInOut(ramp(t, 0, 13)));
  } else {
    const a: View = { cx: A.x - 150, cy: A.y + 40, w: 1500 };
    const b: View = { cx: A.x - 520, cy: A.y + 20, w: 2300 };
    view = lerpView(a, b, easeInOut(ramp(t, 4.5, 15)));
  }
  const h = (view.w * 9) / 16;
  const k = view.w / 1920; // map units per screen pixel
  const night = variant === "currents";

  const water = night ? "#050d16" : AZ.seaDeep;
  const land = night ? "#1c2026" : "#3a3b36";
  const coast = night ? "rgba(150,180,205,0.55)" : "rgba(222,212,182,0.75)";

  return (
    <AbsoluteFill style={{ background: water }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${view.cx - view.w / 2} ${view.cy - h / 2} ${view.w} ${h}`}
      >
        <defs>
          <pattern id="hatch" width={24} height={24} patternUnits="userSpaceOnUse">
            <path d="M0,24 L24,0" stroke="rgba(255,255,255,0.035)" strokeWidth={3} />
          </pattern>
        </defs>
        <rect
          x={view.cx - view.w}
          y={view.cy - h}
          width={view.w * 2}
          height={h * 2}
          fill="url(#hatch)"
        />
        <Land fill={land} stroke={coast} k={k} />
        {variant === "distance" ? <Distance t={t} k={k} /> : null}
        {variant === "strategic" ? <Strategic t={t} k={k} /> : null}
        {variant === "currents" ? <Currents t={t} k={k} frame={frame} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

const Pulse: React.FC<{ readonly at: Pt; readonly t: number; readonly k: number; readonly color?: string }> = ({
  at,
  t,
  k,
  color = AZ.red,
}) => {
  const cycle = (t % 1.6) / 1.6;
  return (
    <g>
      <circle cx={at.x} cy={at.y} r={(14 + 60 * cycle) * k} fill="none" stroke={color} strokeWidth={3 * k} opacity={1 - cycle} />
      <circle cx={at.x} cy={at.y} r={9 * k} fill={color} />
    </g>
  );
};

const Distance: React.FC<{ readonly t: number; readonly k: number }> = ({ t, k }) => {
  const A = P.alcatraz;
  const B = P.aquaticPark;
  const bay = easeOut(ramp(t, 0.3, 1.2)) * (1 - ramp(t, 2.0, 2.6));
  const line = easeInOut(ramp(t, 2.1, 3.4));
  const km = easeOut(ramp(t, 3.0, 3.6));
  const isle = easeOut(ramp(t, 4.6, 5.2));
  const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const len = Math.hypot(B.x - A.x, B.y - A.y);
  const kmValue = len * KM_PER_UNIT;
  return (
    <g>
      <Tag at={{ x: 2050, y: 1750 }} text="מפרץ סן פרנסיסקו" k={k} o={bay} size={64} color={AZ.paper} />
      <Tag at={P.downtown} text="סן פרנסיסקו" k={k} o={km} dx={60} dy={40} size={38} color={AZ.paper} />
      <line
        x1={A.x}
        y1={A.y}
        x2={mix(A.x, B.x, line)}
        y2={mix(A.y, B.y, line)}
        stroke={AZ.amber}
        strokeWidth={4 * k}
        strokeDasharray={`${14 * k} ${10 * k}`}
      />
      <circle cx={B.x} cy={B.y} r={8 * k} fill={AZ.amber} opacity={line} />
      <Tag
        at={mid}
        text={`כ-${Math.round(kmValue)} ק״מ`}
        k={k}
        o={km}
        dx={-120}
        dy={12}
        size={46}
        color={AZ.amber}
        font={SANS}
      />
      <g opacity={Math.max(isle, ramp(t, 2.0, 2.4))}>
        <Pulse at={A} t={t} k={k} />
      </g>
      <Tag at={A} text="אלקטרז" k={k} o={isle} dy={-48} size={50} />
    </g>
  );
};

const Strategic: React.FC<{ readonly t: number; readonly k: number }> = ({ t, k }) => {
  const A = P.alcatraz;
  const gate = P.goldenGate;
  const sea = { x: 120, y: 2050 };
  const inner = { x: 2350, y: 1700 };
  const shipT = easeInOut(ramp(t, 3.0, 9.0));
  // Ship path: in from the ocean, through the strait, past the island.
  const path = [sea, { x: gate.x - 150, y: gate.y + 40 }, { x: gate.x + 250, y: gate.y - 10 }, { x: A.x - 120, y: A.y + 90 }, inner];
  const seg = shipT * (path.length - 1);
  const i = Math.min(path.length - 2, Math.floor(seg));
  const f = seg - i;
  const ship = { x: mix(path[i].x, path[i + 1].x, f), y: mix(path[i].y, path[i + 1].y, f) };
  const heading = Math.atan2(path[i + 1].y - path[i].y, path[i + 1].x - path[i].x);
  const range = easeOut(ramp(t, 5.9, 7.4));
  const gateLabel = easeOut(ramp(t, 1.0, 1.8));
  const prison = easeOut(ramp(t, 9.0, 10.2));
  const d = path.map((p, j) => `${j === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(185,214,234,0.35)" strokeWidth={3 * k} strokeDasharray={`${10 * k} ${12 * k}`} opacity={ramp(t, 2.8, 3.4)} />
      <circle cx={A.x} cy={A.y} r={520 * range} fill="rgba(192,38,45,0.10)" stroke={AZ.red} strokeWidth={3 * k} strokeDasharray={`${18 * k} ${10 * k}`} opacity={range * (1 - 0.6 * prison)} />
      <Tag at={gate} text="שער הזהב" k={k} o={gateLabel} dy={-70} size={44} color={AZ.paper} />
      <Tag at={{ x: 330, y: 2180 }} text="האוקיינוס השקט" k={k} o={gateLabel} size={36} color={AZ.fog} />
      <g transform={`translate(${ship.x},${ship.y}) rotate(${(heading * 180) / Math.PI})`} opacity={ramp(t, 2.8, 3.3)}>
        <path d={`M${-26 * k},${-9 * k} L${18 * k},${-9 * k} L${30 * k},0 L${18 * k},${9 * k} L${-26 * k},${9 * k} Z`} fill={AZ.paper} />
      </g>
      <Pulse at={A} t={t} k={k} color={prison > 0 ? AZ.red : AZ.amber} />
      <Tag at={A} text="אלקטרז" k={k} o={ramp(t, 0.4, 1.2)} dy={-46} size={46} />
      <Tag at={A} text="כלא צבאי" k={k} o={prison} dy={76} size={40} color={AZ.red} font={SANS} />
    </g>
  );
};

/** Ebb-tide streamlines, flowing west through the Golden Gate. */
const FLOWS: readonly (readonly [Pt, Pt, Pt])[] = [
  [{ x: 3300, y: 1650 }, { x: 2300, y: 1820 }, { x: 900, y: 2000 }],
  [{ x: 3200, y: 1500 }, { x: 2200, y: 1700 }, { x: 900, y: 1960 }],
  [{ x: 2550, y: 2120 }, { x: 2050, y: 2000 }, { x: 900, y: 2040 }],
  [{ x: 2600, y: 1250 }, { x: 1900, y: 1650 }, { x: 900, y: 1990 }],
  [{ x: 2450, y: 2060 }, { x: 1950, y: 1990 }, { x: 950, y: 2070 }],
  [{ x: 2400, y: 1400 }, { x: 1700, y: 1800 }, { x: 900, y: 2020 }],
  [{ x: 3100, y: 1700 }, { x: 2250, y: 1740 }, { x: 900, y: 1980 }],
];

const Currents: React.FC<{ readonly t: number; readonly k: number; readonly frame: number }> = ({ t, k, frame }) => {
  const A = P.alcatraz;
  const flows = ramp(t, 8.2, 9.6);
  const routes = ramp(t, 5.5, 7.0) * (1 - 0.6 * ramp(t, 13, 14));
  const cold = easeOut(ramp(t, 11.0, 11.8));
  const q = easeOut(ramp(t, 18.6, 19.3));
  const targets: Pt[] = [P.angelIsland, { x: P.sausalito.x + 120, y: P.sausalito.y + 120 }, P.aquaticPark];
  return (
    <g>
      {FLOWS.map(([a, c, b], i) => (
        <path
          key={i}
          d={curve(a, c, b)}
          fill="none"
          stroke={AZ.ice}
          strokeWidth={4 * k}
          strokeLinecap="round"
          strokeDasharray={`${70 * k} ${130 * k}`}
          strokeDashoffset={-(frame * (9 + i * 1.3)) * k}
          opacity={flows * 0.55}
        />
      ))}
      {targets.map((p, i) => (
        <path
          key={i}
          d={curve(A, { x: (A.x + p.x) / 2 + (i - 1) * 80, y: (A.y + p.y) / 2 - 60 }, p)}
          fill="none"
          stroke={AZ.amber}
          strokeWidth={3 * k}
          strokeDasharray={`${8 * k} ${14 * k}`}
          opacity={routes * 0.8}
        />
      ))}
      <Pulse at={A} t={t} k={k} />
      <Tag at={A} text="אלקטרז" k={k} o={ramp(t, 0.3, 1.0)} dy={-46} size={44} />
      <Tag at={P.goldenGate} text="שער הזהב" k={k} o={flows} dy={-80} size={40} color={AZ.fog} />
      <Tag at={{ x: A.x - 420, y: A.y + 260 }} text="מים קרים · זרמים חזקים" k={k} o={cold} size={44} color={AZ.ice} font={SANS} />
      <Tag at={A} text="?" k={k} o={q} dy={-120} size={150} color={AZ.text} />
    </g>
  );
};
