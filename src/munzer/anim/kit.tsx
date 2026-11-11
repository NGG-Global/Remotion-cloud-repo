import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE, clamp, dirOf, hash, ramp } from "../engine/time";
import { INK, TYPE } from "../theme";

/**
 * Building blocks for the drawn scenes. The look is a medical plate seen in
 * a dark room: thin teal line work that draws itself, one red for damage,
 * and Hebrew type set small and quiet.
 */

export const Backdrop: React.FC<{
  readonly tone?: "clinic" | "warm" | "black" | "red";
  readonly grid?: boolean;
  readonly children?: React.ReactNode;
}> = ({ tone = "clinic", grid = true, children }) => {
  const glow =
    tone === "clinic"
      ? "rgba(70, 120, 120, 0.22)"
      : tone === "warm"
        ? "rgba(140, 100, 60, 0.20)"
        : tone === "red"
          ? "rgba(140, 40, 30, 0.22)"
          : "rgba(0,0,0,0)";
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(70% 70% at 50% 45%, ${glow} 0%, rgba(0,0,0,0) 70%), ${INK.ground}`,
        overflow: "hidden",
      }}
    >
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,184,179,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(127,184,179,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            backgroundPosition: "0 0",
          }}
        />
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

/** Text that fades and rises into place as `k` goes 0 -> 1. */
export const Txt: React.FC<{
  readonly k: number;
  readonly children: string;
  readonly size?: number;
  readonly weight?: number;
  readonly color?: string;
  readonly font?: "sans" | "serif";
  readonly x?: number;
  readonly y?: number;
  readonly align?: "left" | "center" | "right";
  readonly width?: number;
  readonly style?: React.CSSProperties;
  readonly spacing?: number;
}> = ({
  k,
  children,
  size = 44,
  weight = 400,
  color = INK.text,
  font = "sans",
  x,
  y,
  align = "center",
  width = 1400,
  style,
  spacing = 0,
}) => {
  if (k <= 0) {
    return null;
  }
  const left =
    x === undefined
      ? (1920 - width) / 2
      : align === "center"
        ? x - width / 2
        : align === "right"
          ? x - width
          : x;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y ?? 0,
        width,
        textAlign: align,
        direction: dirOf(children),
        fontFamily: font === "serif" ? TYPE.serif : TYPE.hebrew,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.18,
        letterSpacing: spacing,
        color,
        opacity: clamp(k),
        translate: `0px ${(1 - clamp(k)) * 14}px`,
        textShadow: "0 2px 18px rgba(0,0,0,0.6)",
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A path that draws itself: `k` is how much of it is drawn. */
export const Draw: React.FC<{
  readonly d: string;
  readonly k: number;
  readonly stroke?: string;
  readonly width?: number;
  readonly fill?: string;
  readonly fillK?: number;
  readonly glow?: boolean;
  readonly dash?: string;
}> = ({ d, k, stroke = INK.clinic, width = 3, fill = "none", fillK = 0, glow = false, dash }) => (
  <>
    {fill !== "none" && fillK > 0 ? <path d={d} fill={fill} opacity={fillK} /> : null}
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={dash ?? "1 1"}
      strokeDashoffset={dash ? 0 : 1 - clamp(k)}
      opacity={dash ? clamp(k) : 1}
      style={glow ? { filter: `drop-shadow(0 0 6px ${stroke})` } : undefined}
    />
  </>
);

/** Catmull-Rom through points, as a cubic bezier path. */
export const smooth = (pts: readonly (readonly [number, number])[], closed = false): string => {
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${p[1][0]} ${p[1][1]}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x2} ${y2}`;
  }
  return closed ? `${d} Z` : d;
};

/** Number that counts up between two narration times. */
export const countTo = (n: number, from: number, to: number, value: number): number =>
  Math.round(value * ramp(n, from, to, EASE.out));

// ---------------------------------------------------------------------------
// Anatomy. Drawn plates, not photographs: the film never shows the body.

export const HEART = {
  body: smooth(
    [
      [132, 118],
      [98, 186],
      [100, 270],
      [146, 340],
      [222, 394],
      [288, 422],
      [330, 372],
      [352, 292],
      [346, 210],
      [312, 150],
      [252, 126],
      [190, 120],
    ],
    true,
  ),
  aorta: "M 196 122 C 194 74 206 44 244 36 C 280 30 304 50 306 84 L 306 132",
  pulmonary: "M 246 128 C 248 96 264 78 300 76",
  vena: "M 138 120 L 132 34",
  coronaryA: "M 256 140 C 252 220 266 330 290 414",
  coronaryB: "M 128 214 C 158 268 196 326 236 372",
  coronaryC: "M 318 170 C 336 230 338 290 326 350",
};

export const HeartPlate: React.FC<{
  readonly k: number;
  readonly fillK?: number;
  readonly color?: string;
  readonly fill?: string;
  readonly beat?: number;
}> = ({ k, fillK = 0, color = INK.clinic, fill = "rgba(127,184,179,0.12)", beat = 0 }) => (
  <g style={{ transformOrigin: "200px 240px", transform: `scale(${1 + beat * 0.035})` }}>
    <Draw d={HEART.body} k={k} stroke={color} width={4} fill={fill} fillK={fillK} glow />
    <Draw d={HEART.aorta} k={ramp(k, 0.3, 1)} stroke={color} width={4} />
    <Draw d={HEART.pulmonary} k={ramp(k, 0.4, 1)} stroke={color} width={3} />
    <Draw d={HEART.vena} k={ramp(k, 0.45, 1)} stroke={color} width={3} />
    <Draw d={HEART.coronaryA} k={ramp(k, 0.55, 1)} stroke={color} width={1.6} />
    <Draw d={HEART.coronaryB} k={ramp(k, 0.6, 1)} stroke={color} width={1.6} />
    <Draw d={HEART.coronaryC} k={ramp(k, 0.65, 1)} stroke={color} width={1.6} />
  </g>
);

export const LIVER = {
  body: "M 40 128 C 58 62 164 30 304 40 C 426 48 540 62 576 98 C 592 118 562 144 520 164 C 440 204 362 252 282 302 C 242 326 200 332 170 312 C 110 272 50 212 40 164 Z",
  lobe: "M 334 46 C 322 124 302 204 282 300",
  gall: "M 250 290 C 240 318 258 340 280 330 C 296 322 292 300 278 292",
};

export const LiverPlate: React.FC<{
  readonly k: number;
  readonly fillK?: number;
  readonly color?: string;
  readonly fill?: string;
}> = ({ k, fillK = 0, color = INK.clinic, fill = "rgba(127,184,179,0.10)" }) => (
  <g>
    <Draw d={LIVER.body} k={k} stroke={color} width={4} fill={fill} fillK={fillK} glow />
    <Draw d={LIVER.lobe} k={ramp(k, 0.4, 1)} stroke={color} width={2} />
    <Draw d={LIVER.gall} k={ramp(k, 0.6, 1)} stroke={color} width={2} />
  </g>
);

export const KIDNEY =
  "M 120 20 C 60 20 20 80 20 160 C 20 240 60 300 120 300 C 170 300 192 262 172 222 C 158 194 152 172 162 142 C 176 102 182 62 162 36 C 152 26 136 20 120 20 Z";
export const KIDNEY_HILUM = "M 168 160 C 196 158 216 150 236 140";

export const LUNG_L =
  "M 186 50 C 124 64 64 164 52 282 C 46 334 82 356 142 346 C 178 340 194 314 194 272 L 194 70 Z";
export const LUNG_R =
  "M 254 50 C 316 64 376 164 388 282 C 394 334 358 356 298 346 C 262 340 246 314 246 272 L 246 70 Z";
export const TRACHEA = "M 220 0 L 220 64 M 220 64 C 210 70 200 78 194 92 M 220 64 C 230 70 240 78 246 92";

/** Front-view body outline in a 400 x 900 box. */
const RIGHT_HALF: (readonly [number, number])[] = [
  [214, 118],
  [222, 142],
  [290, 160],
  [322, 196],
  [334, 300],
  [344, 420],
  [346, 474],
  [352, 520],
  [336, 526],
  [326, 474],
  [312, 336],
  [300, 236],
  [284, 250],
  [280, 336],
  [270, 420],
  [288, 484],
  [290, 600],
  [278, 702],
  [280, 782],
  [262, 858],
  [280, 884],
  [234, 886],
  [236, 858],
  [230, 762],
  [228, 700],
  [214, 560],
  [200, 524],
];
const LEFT_HALF = [...RIGHT_HALF].reverse().map(([x, y]) => [400 - x, y] as const);
export const BODY = smooth([...RIGHT_HALF, ...LEFT_HALF.slice(1)], true);
export const HEAD = "M 200 22 C 228 22 248 44 248 72 C 248 100 228 122 200 122 C 172 122 152 100 152 72 C 152 44 172 22 200 22 Z";

/** Where each organ plate sits inside the 400 x 900 body. */
const PLACE = {
  lungs: { x: 108, y: 168, s: 0.42 },
  heart: { x: 180, y: 214, s: 0.2 },
  liver: { x: 112, y: 300, s: 0.27 },
  kidneyL: { x: 136, y: 372, s: 0.2 },
  kidneyR: { x: 264, y: 372, s: 0.2 },
  gut: { x: 200, y: 452, s: 1 },
} as const;

export type OrganKey = "lungs" | "heart" | "liver" | "kidneys" | "gut";

const organStyle = (dmg: number) => ({
  stroke: dmg > 0.01 ? INK.damage : INK.clinic,
  fill: dmg > 0.01 ? `rgba(200,64,46,${0.18 + 0.4 * dmg})` : "rgba(127,184,179,0.16)",
});

/**
 * The body as a medical figure with its organs drawn in. `state` maps an
 * organ to [visibility 0-1, damage 0-1]; damaged organs turn red and, with
 * `pulse`, throb.
 */
export const BodyMap: React.FC<{
  readonly k: number;
  readonly state?: Partial<Record<OrganKey, readonly [number, number]>>;
  readonly pulse?: number;
  readonly scale?: number;
  readonly x?: number;
  readonly y?: number;
}> = ({ k, state = {}, pulse = 0, scale = 1, x = 760, y = 90 }) => {
  const organ = (key: OrganKey, node: (st: ReturnType<typeof organStyle>, vis: number) => React.ReactNode) => {
    const st = state[key];
    if (!st || st[0] <= 0) {
      return null;
    }
    return <g key={key} opacity={st[0]}>{node(organStyle(st[1]), st[0])}</g>;
  };
  const beat = (key: OrganKey) => 1 + ((state[key]?.[1] ?? 0) > 0.01 ? pulse * 0.06 : 0);
  const at = (p: { x: number; y: number; s: number }, key: OrganKey, w: number, h: number) =>
    `translate(${p.x + (w * p.s) / 2} ${p.y + (h * p.s) / 2}) scale(${p.s * beat(key)}) translate(${-w / 2} ${-h / 2})`;
  return (
    <svg
      viewBox="0 0 400 900"
      width={400 * scale}
      height={900 * scale}
      style={{ position: "absolute", left: x, top: y, overflow: "visible" }}
    >
      <Draw d={BODY} k={k} stroke={INK.clinicDim} width={2.5} fill="rgba(127,184,179,0.04)" fillK={k} />
      <Draw d={HEAD} k={k} stroke={INK.clinicDim} width={2.5} />
      {organ("lungs", (st) => (
        <g transform={at(PLACE.lungs, "lungs", 440, 360)}>
          <path d={LUNG_L} fill={st.fill} stroke={st.stroke} strokeWidth={6} />
          <path d={LUNG_R} fill={st.fill} stroke={st.stroke} strokeWidth={6} />
          <path d={TRACHEA} fill="none" stroke={st.stroke} strokeWidth={6} />
        </g>
      ))}
      {organ("heart", (st) => (
        <g transform={at(PLACE.heart, "heart", 400, 440)}>
          <path d={HEART.body} fill={st.fill} stroke={st.stroke} strokeWidth={10} />
          <path d={HEART.aorta} fill="none" stroke={st.stroke} strokeWidth={10} />
        </g>
      ))}
      {organ("liver", (st) => (
        <g transform={at(PLACE.liver, "liver", 620, 360)}>
          <path d={LIVER.body} fill={st.fill} stroke={st.stroke} strokeWidth={8} />
        </g>
      ))}
      {organ("kidneys", (st) => (
        <>
          <g transform={at(PLACE.kidneyL, "kidneys", 240, 320)}>
            <path d={KIDNEY} fill={st.fill} stroke={st.stroke} strokeWidth={10} />
          </g>
          <g transform={`${at(PLACE.kidneyR, "kidneys", 240, 320)} translate(240 0) scale(-1 1)`}>
            <path d={KIDNEY} fill={st.fill} stroke={st.stroke} strokeWidth={10} />
          </g>
        </>
      ))}
      {organ("gut", (st) => (
        <ellipse
          cx={PLACE.gut.x}
          cy={PLACE.gut.y}
          rx={62 * beat("gut")}
          ry={44 * beat("gut")}
          fill={st.fill}
          stroke={st.stroke}
          strokeWidth={2.5}
        />
      ))}
    </svg>
  );
};

/** Deterministic scatter of points inside a box, for tumours and cells. */
export const scatter = (
  count: number,
  seed: number,
  box: { x: number; y: number; w: number; h: number },
): { x: number; y: number; s: number }[] =>
  Array.from({ length: count }, (_, i) => ({
    x: box.x + hash(seed + i * 7.31) * box.w,
    y: box.y + hash(seed + i * 3.17 + 50) * box.h,
    s: 0.6 + hash(seed + i * 1.93 + 90) * 0.8,
  }));

/** A thin rule with a label, used to tag a thing in a plate. */
export const Tag: React.FC<{
  readonly k: number;
  readonly x: number;
  readonly y: number;
  readonly tx: number;
  readonly ty: number;
  readonly text: string;
  readonly color?: string;
  readonly size?: number;
}> = ({ k, x, y, tx, ty, text, color = INK.clinic, size = 34 }) => {
  if (k <= 0) {
    return null;
  }
  const right = tx > x;
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={1920} height={1080}>
        <circle cx={x} cy={y} r={6} fill={color} opacity={k} />
        <path
          d={`M ${x} ${y} L ${tx} ${ty}`}
          stroke={color}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - clamp(k * 1.4)}
          fill="none"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: ty - size * 0.68,
          ...(right ? { left: tx + 14 } : { right: 1920 - tx + 14 }),
          fontFamily: TYPE.hebrew,
          fontSize: size,
          fontWeight: 400,
          color: INK.text,
          direction: dirOf(text),
          whiteSpace: "nowrap",
          opacity: ramp(k, 0.5, 1),
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}
      >
        {text}
      </div>
    </>
  );
};
