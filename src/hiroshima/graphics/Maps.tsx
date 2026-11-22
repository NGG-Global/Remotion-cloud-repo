import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { LAND_BOUNDS, LAND_PATH } from "../data/land";
import { easeInOut, easeOut, H, ramp, SANS, SERIF } from "../theme";

/**
 * Maps of the two missions and of Tsutomu Yamaguchi's journeys, drawn from
 * Natural Earth coastlines. The land is one path in world units under an SVG
 * camera; routes, rings and labels are projected to the screen every frame so
 * their line weights and type sizes stay constant while the camera moves.
 */

type LatLon = readonly [number, number];

const PLACES = {
  hiroshima: [34.3853, 132.4553],
  nagasaki: [32.7503, 129.8779],
  kokura: [33.8834, 130.8752],
  niigata: [37.9161, 139.0364],
  tokyo: [35.6762, 139.6503],
  tinian: [15.0043, 145.6357],
  iwojima: [24.7808, 141.3225],
} as const satisfies Record<string, LatLon>;

/** Approximate line of the railway from Hiroshima to Nagasaki in 1945. */
const RAIL: readonly LatLon[] = [
  [34.397, 132.475],
  [34.17, 132.22],
  [34.05, 131.8],
  [34.0, 131.47],
  [33.95, 131.25],
  [33.95, 130.94],
  [33.94, 130.96],
  [33.886, 130.88],
  [33.59, 130.42],
  [33.38, 130.51],
  [33.26, 130.3],
  [32.84, 130.05],
  [32.7503, 129.8779],
];

const project = ([lat, lon]: LatLon) => ({
  x: (lon - LAND_BOUNDS.lon0) * LAND_BOUNDS.k * LAND_BOUNDS.cosLat,
  y: (LAND_BOUNDS.lat1 - lat) * LAND_BOUNDS.k,
});

type Cam = { t: number; c: LatLon; span: number };

const camAt = (keys: readonly Cam[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const u = easeInOut(ramp(t, a.t, b.t));
      // Interpolate the span geometrically so zooms feel even.
      return {
        t,
        c: [
          a.c[0] + (b.c[0] - a.c[0]) * u,
          a.c[1] + (b.c[1] - a.c[1]) * u,
        ] as LatLon,
        span: a.span * Math.pow(b.span / a.span, u),
      };
    }
  }
  return keys[keys.length - 1];
};

type Route = {
  pts: readonly LatLon[];
  from: number;
  to: number;
  dashed?: boolean;
  color?: string;
  marker?: "plane" | "train";
};
type Label = {
  at: LatLon;
  text: string;
  t: number;
  tone?: "main" | "minor";
  ring?: boolean;
  side?: "left" | "right";
  burst?: number;
};
type Preset = {
  cam: readonly Cam[];
  routes: readonly Route[];
  labels: readonly Label[];
  header?: { text: string; t: number };
  chip?: { text: string; t: number };
  clouds?: { at: LatLon; from: number; to: number };
  loop?: { at: LatLon; from: number; to: number };
};

const P = PLACES;

const PRESETS: Record<string, Preset> = {
  targets: {
    cam: [
      { t: 0, c: [35.6, 136.6], span: 13 },
      { t: 3.8, c: [34.6, 133.6], span: 7.5 },
    ],
    routes: [],
    header: { text: "רשימת המטרות · יולי 1945", t: 0.2 },
    labels: [
      { at: P.kokura, text: "קוקורה", t: 0.7, tone: "minor", side: "left" },
      { at: P.niigata, text: "ניגאטה", t: 0.9, tone: "minor" },
      { at: P.nagasaki, text: "נגסקי", t: 1.1, tone: "minor", side: "left" },
      { at: P.tokyo, text: "טוקיו", t: 0.4, tone: "minor" },
      { at: P.hiroshima, text: "הירושימה", t: 0.3, tone: "main", ring: true },
    ],
  },
  enola: {
    cam: [
      { t: 0, c: [24.6, 139.2], span: 27 },
      { t: 4.7, c: [25.2, 138.2], span: 25.5 },
    ],
    routes: [
      {
        pts: [P.tinian, P.iwojima, P.hiroshima],
        from: 0.4,
        to: 3.5,
        marker: "plane",
      },
    ],
    labels: [
      { at: P.tinian, text: "טיניאן", t: 0.1, tone: "main" },
      { at: P.iwojima, text: "איוו ג׳ימה", t: 1.6, tone: "minor" },
      {
        at: P.hiroshima,
        text: "הירושימה",
        t: 3.0,
        tone: "main",
        ring: true,
        burst: 3.6,
        side: "left",
      },
    ],
    chip: { text: "6 באוגוסט 1945 · 08:15", t: 3.7 },
  },
  bockscar: {
    cam: [
      { t: 0, c: [25.0, 138.6], span: 25 },
      { t: 3.6, c: [33.25, 131.0], span: 4.8 },
      { t: 10.4, c: [33.2, 130.6], span: 4.2 },
    ],
    routes: [
      { pts: [P.tinian, P.kokura], from: 0.3, to: 3.2, marker: "plane" },
      { pts: [P.kokura, P.nagasaki], from: 6.6, to: 8.8, marker: "plane" },
    ],
    loop: { at: P.kokura, from: 3.4, to: 6.4 },
    clouds: { at: P.kokura, from: 3.2, to: 7.4 },
    labels: [
      { at: P.tinian, text: "טיניאן", t: 0.1, tone: "main" },
      { at: P.kokura, text: "קוקורה", t: 2.6, tone: "main", side: "left" },
      {
        at: P.nagasaki,
        text: "נגסקי",
        t: 8.4,
        tone: "main",
        ring: true,
        burst: 8.9,
        side: "left",
      },
    ],
    chip: { text: "9 באוגוסט 1945", t: 0.3 },
  },
  business: {
    cam: [
      { t: 0, c: [33.5, 131.2], span: 4.3 },
      { t: 10.4, c: [33.65, 131.25], span: 3.9 },
    ],
    routes: [
      {
        pts: [...RAIL].reverse(),
        from: 6.4,
        to: 9.4,
        dashed: true,
        color: "#efe8da",
        marker: "train",
      },
    ],
    header: { text: "צוטומו ימגוצ׳י · מהנדס במיצובישי · בן 29", t: 1.6 },
    labels: [
      {
        at: P.nagasaki,
        text: "נגסקי · מספנות מיצובישי",
        t: 0.5,
        tone: "main",
        side: "left",
      },
      { at: P.hiroshima, text: "הירושימה", t: 8.9, tone: "main", ring: true },
    ],
    chip: { text: "נסיעת עסקים", t: 6.6 },
  },
  train: {
    cam: [
      { t: 0, c: [33.6, 131.3], span: 4.2 },
      { t: 4.8, c: [33.45, 131.0], span: 4.0 },
    ],
    routes: [
      {
        pts: RAIL,
        from: 0.3,
        to: 4.3,
        dashed: true,
        color: "#efe8da",
        marker: "train",
      },
    ],
    labels: [
      { at: P.hiroshima, text: "הירושימה", t: 0, tone: "main" },
      { at: P.nagasaki, text: "נגסקי", t: 0, tone: "main", side: "left" },
    ],
    chip: { text: "7–8 באוגוסט 1945 · ברכבת", t: 0.4 },
  },
};

const polyLength = (pts: { x: number; y: number }[]) => {
  let l = 0;
  for (let i = 1; i < pts.length; i++)
    l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return l;
};

/** The first `f` (0-1) of a polyline, plus its end point and heading. */
const partial = (pts: { x: number; y: number }[], f: number) => {
  const total = polyLength(pts);
  let left = total * f;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (left >= seg) {
      out.push(pts[i]);
      left -= seg;
      continue;
    }
    const u = seg > 0 ? left / seg : 0;
    out.push({
      x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u,
      y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u,
    });
    break;
  }
  const a = out[Math.max(0, out.length - 2)];
  const b = out[out.length - 1];
  return { pts: out, end: b, angle: Math.atan2(b.y - a.y, b.x - a.x) };
};

export const JapanMap: React.FC<{ preset: string }> = ({ preset }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: Hh, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const p = PRESETS[preset] ?? PRESETS.targets;
  const cam = camAt(p.cam, t);
  const center = project(cam.c);
  const vh = cam.span * LAND_BOUNDS.k;
  const vw = (vh * W) / Hh;
  const vx = center.x - vw / 2;
  const vy = center.y - vh / 2;
  const toScreen = (ll: LatLon) => {
    const q = project(ll);
    return { x: ((q.x - vx) / vw) * W, y: ((q.y - vy) / vh) * Hh };
  };
  const fade = Math.min(
    easeOut(ramp(frame, 0, 12)),
    1 - ramp(frame, durationInFrames - 10, durationInFrames),
  );

  // Graticule every 5 degrees, in screen space.
  const grid: React.ReactNode[] = [];
  for (let lon = 115; lon <= 155; lon += 5) {
    const a = toScreen([0, lon]);
    grid.push(
      <line
        key={`lo${lon}`}
        x1={a.x}
        y1={0}
        x2={a.x}
        y2={Hh}
        stroke="rgba(239,232,218,0.06)"
        strokeWidth={1}
      />,
    );
  }
  for (let lat = 5; lat <= 50; lat += 5) {
    const a = toScreen([lat, 120]);
    grid.push(
      <line
        key={`la${lat}`}
        x1={0}
        y1={a.y}
        x2={W}
        y2={a.y}
        stroke="rgba(239,232,218,0.06)"
        strokeWidth={1}
      />,
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 100% at 50% 40%, #11161c 0%, ${H.sea} 70%)`,
        opacity: fade,
      }}
    >
      <svg
        width={W}
        height={Hh}
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d={LAND_PATH}
          fill={H.land}
          stroke={H.coast}
          strokeWidth={1.6}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {grid}
        {p.loop
          ? (() => {
              const c = toScreen(p.loop.at);
              const u = ramp(t, p.loop.from, p.loop.to);
              if (u <= 0) return null;
              const r = 46;
              const turns = 3 * u;
              const pts: string[] = [];
              const steps = Math.max(2, Math.floor(120 * u));
              for (let i = 0; i <= steps; i++) {
                const a = (i / steps) * turns * Math.PI * 2 - Math.PI / 2;
                pts.push(
                  `${c.x + Math.cos(a) * r},${c.y + Math.sin(a) * r * 0.7}`,
                );
              }
              return (
                <polyline
                  points={pts.join(" ")}
                  fill="none"
                  stroke={H.ember}
                  strokeWidth={2.5}
                  strokeDasharray="6 8"
                  opacity={
                    0.85 * (1 - ramp(t, p.loop.to + 0.2, p.loop.to + 1.2))
                  }
                />
              );
            })()
          : null}
        {p.routes.map((r, i) => {
          const pts = r.pts.map(toScreen);
          const f = easeInOut(ramp(t, r.from, r.to));
          if (f <= 0) return null;
          const part = partial(pts, f);
          const color = r.color ?? H.ember;
          const moving = f < 1;
          return (
            <g key={i}>
              <polyline
                points={part.pts.map((q) => `${q.x},${q.y}`).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={r.dashed ? "10 9" : undefined}
                style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
              />
              {moving && r.marker === "plane" ? (
                <g
                  transform={`translate(${part.end.x},${part.end.y}) rotate(${(part.angle * 180) / Math.PI + 90})`}
                >
                  <path
                    d="M0,-16 L3,-4 L16,4 L16,7 L3,3 L2,12 L6,15 L6,17 L0,15 L-6,17 L-6,15 L-2,12 L-3,3 L-16,7 L-16,4 L-3,-4 Z"
                    fill={H.paper}
                  />
                </g>
              ) : null}
              {moving && r.marker === "train" ? (
                <circle
                  cx={part.end.x}
                  cy={part.end.y}
                  r={9}
                  fill={H.paper}
                  stroke={H.black}
                  strokeWidth={3}
                />
              ) : null}
            </g>
          );
        })}
        {p.clouds
          ? (() => {
              const c = toScreen(p.clouds.at);
              const o = Math.min(
                easeOut(ramp(t, p.clouds.from, p.clouds.from + 0.8)),
                1 - ramp(t, p.clouds.to - 0.8, p.clouds.to),
              );
              return [0, 1, 2, 3, 4, 5].map((k) => (
                <ellipse
                  key={k}
                  cx={c.x + Math.cos(k * 1.7) * 70 + (t - p.clouds!.from) * 9}
                  cy={c.y + Math.sin(k * 2.3) * 34 - 10}
                  rx={60 + (k % 3) * 22}
                  ry={26 + (k % 2) * 10}
                  fill="rgba(190,190,190,0.30)"
                  opacity={o}
                  style={{ filter: "blur(10px)" }}
                />
              ));
            })()
          : null}
      </svg>
      {p.labels.map((l, i) => {
        const q = toScreen(l.at);
        const o = easeOut(ramp(t, l.t, l.t + 0.5));
        if (o <= 0) return null;
        const main = l.tone !== "minor";
        const burst =
          l.burst !== undefined ? ramp(t, l.burst, l.burst + 1.4) : 0;
        const pulse = l.ring ? 1 + 0.25 * Math.sin(t * 4) : 1;
        const left = l.side === "left";
        return (
          <React.Fragment key={i}>
            {burst > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: q.x - 300 * burst,
                  top: q.y - 300 * burst,
                  width: 600 * burst,
                  height: 600 * burst,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,214,160,0.95) 0%, rgba(224,106,53,0.5) 35%, rgba(224,106,53,0) 70%)",
                  opacity: 1 - burst,
                }}
              />
            ) : null}
            {l.ring ? (
              <div
                style={{
                  position: "absolute",
                  left: q.x - 22 * pulse,
                  top: q.y - 22 * pulse,
                  width: 44 * pulse,
                  height: 44 * pulse,
                  borderRadius: "50%",
                  border: `3px solid ${H.ember}`,
                  opacity: o * 0.9,
                }}
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                left: q.x - (main ? 8 : 6),
                top: q.y - (main ? 8 : 6),
                width: main ? 16 : 12,
                height: main ? 16 : 12,
                borderRadius: "50%",
                background: l.ring ? H.ember : main ? H.paper : H.paperDim,
                opacity: o,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: q.y - (main ? 30 : 22),
                ...(left ? { right: W - q.x + 26 } : { left: q.x + 26 }),
                fontFamily: main ? SERIF : SANS,
                fontSize: main ? 52 : 32,
                fontWeight: main ? 600 : 400,
                color: main ? H.paper : H.paperDim,
                direction: "rtl",
                whiteSpace: "nowrap",
                opacity: o,
                textShadow: "0 2px 16px rgba(0,0,0,0.95)",
              }}
            >
              {l.text}
            </div>
          </React.Fragment>
        );
      })}
      {p.header ? (
        <div
          style={{
            position: "absolute",
            top: 90,
            right: 110,
            fontFamily: SANS,
            fontSize: 40,
            color: H.paper,
            direction: "rtl",
            opacity: easeOut(ramp(t, p.header.t, p.header.t + 0.6)),
            textShadow: "0 2px 16px rgba(0,0,0,0.95)",
            borderRight: `4px solid ${H.ember}`,
            paddingRight: 20,
          }}
        >
          {p.header.text}
        </div>
      ) : null}
      {p.chip ? (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            right: 110,
            fontFamily: SANS,
            fontSize: 38,
            color: H.paper,
            direction: "rtl",
            padding: "10px 24px",
            background: "rgba(7,8,10,0.7)",
            border: `1.5px solid ${H.ember}`,
            borderRadius: 6,
            opacity: easeOut(ramp(t, p.chip.t, p.chip.t + 0.5)),
          }}
        >
          {p.chip.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Over the pre-war postcard of the Aioi Bridge: a second sun opening above
 * the city, then the height it burst at.
 */
export const Burst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: Hh } = useVideoConfig();
  const t = frame / fps;
  const cx = W * 0.56;
  const cy = Hh * 0.1;
  const grow = easeOut(ramp(t, 0, 1.6));
  const flicker = 1 + 0.04 * Math.sin(t * 23) + 0.03 * Math.sin(t * 37);
  const line = easeInOut(ramp(t, 2.6, 3.6));
  const label = easeOut(ramp(t, 3.3, 3.9));
  const groundY = Hh * 0.6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `rgba(255,190,120,${0.18 * grow})`,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - 420 * grow * flicker,
          top: cy - 420 * grow * flicker,
          width: 840 * grow * flicker,
          height: 840 * grow * flicker,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,250,1) 0%, rgba(255,236,200,0.95) 12%, rgba(255,170,90,0.55) 32%, rgba(224,106,53,0.15) 55%, rgba(224,106,53,0) 70%)",
          mixBlendMode: "screen",
        }}
      />
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line
          x1={cx}
          y1={cy + 40}
          x2={cx}
          y2={cy + 40 + (groundY - cy - 40) * line}
          stroke={H.paper}
          strokeWidth={4}
          strokeDasharray="14 10"
          opacity={0.95}
          style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.9))" }}
        />
        <line
          x1={cx - 60}
          y1={groundY}
          x2={cx + 60}
          y2={groundY}
          stroke={H.paper}
          strokeWidth={3}
          opacity={line}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          right: W - cx + 36,
          top: (cy + groundY) / 2 - 40,
          padding: "10px 26px",
          background: "rgba(7,8,10,0.72)",
          borderRight: `4px solid ${H.ember}`,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 60,
          color: H.paper,
          opacity: label,
          direction: "rtl",
          whiteSpace: "nowrap",
        }}
      >
        כ־600 מטר מעל העיר
      </div>
    </AbsoluteFill>
  );
};
