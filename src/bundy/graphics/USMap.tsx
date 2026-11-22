import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { US_BOUNDS, US_LAND, US_STATES } from "../data/usmap";
import { B, easeInOut, easeOut, ramp, SANS, SERIF } from "../theme";

/**
 * Maps for the Bundy film, on Natural Earth coastlines and state lines.
 *
 * The disappearances are shown as numbered pins with a legend beside the map
 * (name, age where the narration gives it, place, month): the places are the
 * record; nothing is drawn of what happened there. Each pin and legend line
 * arrives on the words that name it.
 */

type LatLon = readonly [number, number];

const P = {
  burlington: [44.476, -73.212],
  philadelphia: [39.952, -75.165],
  tacoma: [47.253, -122.444],
  seattle: [47.66, -122.31],
  olympia: [47.072, -122.976],
  ellensburg: [46.997, -120.548],
  corvallis: [44.565, -123.279],
  burien: [47.47, -122.346],
  sammamish: [47.556, -122.06],
  slc: [40.761, -111.891],
  midvale: [40.611, -111.9],
  lehi: [40.392, -111.851],
  murray: [40.666, -111.888],
  bountiful: [40.889, -111.881],
  snowmass: [39.213, -106.949],
  vail: [39.64, -106.374],
  grandjunction: [39.064, -108.551],
  provo: [40.234, -111.659],
  aspen: [39.191, -106.818],
  glenwood: [39.55, -107.325],
  denver: [39.739, -104.99],
  chicago: [41.878, -87.63],
  annarbor: [42.281, -83.743],
  atlanta: [33.749, -84.388],
  tallahassee: [30.438, -84.281],
  lakecity: [30.19, -82.639],
  pensacola: [30.421, -87.217],
  miami: [25.762, -80.192],
  raiford: [29.95, -82.13],
} as const satisfies Record<string, LatLon>;

const project = ([lat, lon]: LatLon) => ({
  x: (lon - US_BOUNDS.lon0) * US_BOUNDS.k * US_BOUNDS.cosLat,
  y: (US_BOUNDS.lat1 - lat) * US_BOUNDS.k,
});

type Cam = { t: number; c: LatLon; span: number };
type Pin = {
  at: LatLon;
  n?: number;
  t: number;
  survivor?: boolean;
  legend?: { name: string; meta: string };
};
type Label = { at: LatLon; text: string; t: number; minor?: boolean; left?: boolean };
type Route = { pts: readonly LatLon[]; from: number; to: number; dashed?: boolean };
type Preset = {
  cam: readonly Cam[];
  pins?: readonly Pin[];
  labels?: readonly Label[];
  routes?: readonly Route[];
  header?: { text: string; t: number };
  chip?: { text: string; t: number };
  /** Pins without legend lines: a dot per place, for the overview maps. */
  dots?: { at: LatLon; t: number }[];
  /** The jurisdictions map: state clusters and the links that never form. */
  clusters?: boolean;
};

// The women, in the order the narration names them. Ages only where the
// narration gives them; months as the narration gives them.
const NW: Pin[] = [
  { at: P.seattle, n: 1, t: 0, legend: { name: "לינדה אן הילי, 21", meta: "סיאטל · פברואר 1974" } },
  { at: P.olympia, n: 2, t: 2.2, legend: { name: "דונה גייל מנסון, 19", meta: "אולימפיה · מרץ 1974" } },
  { at: P.ellensburg, n: 3, t: 8.0, legend: { name: "סוזן רנקורט, 18", meta: "אלנסברג · אפריל 1974" } },
  { at: P.corvallis, n: 4, t: 14.4, legend: { name: "רוברטה קתלין פארקס", meta: "קורבליס, אורגון · מאי 1974" } },
  { at: P.burien, n: 5, t: 19.2, legend: { name: "ברנדה קרול בול", meta: "אזור סיאטל · יוני 1974" } },
  { at: P.seattle, n: 6, t: 22.3, legend: { name: "ג׳ורג׳אן הוקינס", meta: "סיאטל · יוני 1974" } },
];
const SAMMAMISH: Pin = { at: P.sammamish, n: 7, t: 0, legend: { name: "ג׳ניס אוט, 23 · דניס נסלונד, 19", meta: "לייק סממיש · 14 ביולי 1974" } };
const UTAH: Pin[] = [
  { at: P.midvale, n: 8, t: 0, legend: { name: "מליסה סמית׳, 17", meta: "מידוויל, יוטה · אוקטובר 1974" } },
  { at: P.lehi, n: 9, t: 5.3, legend: { name: "לורה איים, 17", meta: "יוטה · אוקטובר 1974" } },
];
const DARONCH: Pin = { at: P.murray, t: 0, survivor: true, legend: { name: "קרול דה־רונץ׳, 18 · שרדה", meta: "מארי, יוטה · 8 בנובמבר 1974" } };
const KENT: Pin = { at: P.bountiful, n: 10, t: 0.3, legend: { name: "דברה קנט, 17", meta: "באונטיפול, יוטה · 8 בנובמבר 1974" } };
const CO: Pin[] = [
  { at: P.snowmass, n: 11, t: 0, legend: { name: "קרין קמפבל", meta: "סנואומאס, קולורדו · ינואר 1975" } },
  { at: P.vail, n: 12, t: 2.2, legend: { name: "ג׳ולי קנינגהם", meta: "וייל, קולורדו · מרץ 1975" } },
  { at: P.grandjunction, n: 13, t: 6.2, legend: { name: "דניס אוליברסון", meta: "גרנד ג׳נקשן, קולורדו · אפריל 1975" } },
  { at: P.provo, n: 14, t: 10.7, legend: { name: "סוזן קרטיס", meta: "פרובו, יוטה · יוני 1975" } },
];
const FL: Pin[] = [
  { at: P.tallahassee, n: 15, t: 0, legend: { name: "מרגרט באומן · ליסה לוי", meta: "טלהאסי · 15 בינואר 1978" } },
  { at: P.lakecity, n: 16, t: 1.0, legend: { name: "קימברלי ליץ׳, 12", meta: "לייק סיטי, פלורידה · 9 בפברואר 1978" } },
];

const allDots = (t0: number, step: number) =>
  [...NW, SAMMAMISH, ...UTAH, KENT, ...CO, ...FL].map((p, i) => ({ at: p.at, t: t0 + i * step }));

const WEST: LatLon = [43.5, -114];
const USA: LatLon = [38.5, -97];

const PRESETS: Record<string, Preset> = {
  overview: {
    cam: [{ t: 0, c: USA, span: 27 }, { t: 6.4, c: [38.8, -98], span: 25 }],
    dots: allDots(0.6, 0.18),
    header: { text: "\u20661974–1978\u2069", t: 0.3 },
  },
  burlington: {
    cam: [{ t: 0, c: [40.5, -90], span: 22 }, { t: 6, c: [43, -75], span: 9 }],
    labels: [{ at: P.burlington, text: "ברלינגטון, ורמונט", t: 3.4 }],
    chip: { text: "1946", t: 1.0 },
  },
  philadelphia: {
    cam: [{ t: 0, c: [42.3, -75], span: 8.5 }, { t: 5.1, c: [41.6, -75.5], span: 8 }],
    labels: [
      { at: P.burlington, text: "ברלינגטון", t: 0, minor: true },
      { at: P.philadelphia, text: "פילדלפיה, פנסילבניה", t: 1.8, left: true },
    ],
    routes: [{ pts: [P.burlington, P.philadelphia], from: 0.2, to: 2.2, dashed: true }],
  },
  tacoma: {
    cam: [{ t: 0, c: [41.5, -98], span: 24 }, { t: 4.2, c: [42.5, -100], span: 23 }],
    labels: [
      { at: P.philadelphia, text: "פילדלפיה", t: 0, minor: true, left: true },
      { at: P.tacoma, text: "טקומה, וושינגטון", t: 2.6 },
    ],
    routes: [{ pts: [P.philadelphia, P.tacoma], from: 0.2, to: 2.8, dashed: true }],
    chip: { text: "1950", t: 0.4 },
  },
  nw: {
    cam: [{ t: 0, c: [46.6, -120.4], span: 5.6 }, { t: 17.8, c: [46.2, -120.1], span: 4.8 }],
    header: { text: "צפון־מערב ארה״ב · 1974", t: 0.6 },
    pins: [{ ...NW[0], t: 6.5 }],
    labels: [{ at: P.seattle, text: "סיאטל", t: 0.8, minor: true }],
  },
  nw2: {
    cam: [{ t: 0, c: [46.2, -120.1], span: 4.8 }, { t: 28, c: [46.1, -120.0], span: 4.6 }],
    header: { text: "צפון־מערב ארה״ב · 1974", t: 0 },
    pins: [{ ...NW[0], t: -1 }, ...NW.slice(1)],
  },
  toUtah: {
    cam: [{ t: 0, c: [44, -117], span: 11 }, { t: 4.8, c: [43, -116], span: 10.5 }],
    labels: [
      { at: P.seattle, text: "סיאטל", t: 0, minor: true },
      { at: P.slc, text: "סולט לייק סיטי", t: 2.4 },
    ],
    routes: [{ pts: [P.seattle, P.slc], from: 0.3, to: 2.6, dashed: true }],
    chip: { text: "סתיו 1974", t: 0.4 },
  },
  utah1: {
    cam: [{ t: 0, c: [40.64, -111.3], span: 1.3 }, { t: 12.5, c: [40.62, -111.32], span: 1.2 }],
    header: { text: "יוטה · 1974", t: 0.2 },
    labels: [{ at: P.slc, text: "סולט לייק סיטי", t: 0.3, minor: true }],
    pins: UTAH,
  },
  utah2: {
    cam: [{ t: 0, c: [40.62, -111.32], span: 1.2 }, { t: 11.8, c: [40.65, -111.3], span: 1.18 }],
    header: { text: "יוטה · 1974", t: 0 },
    labels: [{ at: P.slc, text: "סולט לייק סיטי", t: 0, minor: true }],
    pins: [...UTAH.map((p) => ({ ...p, t: -1 })), { ...DARONCH, t: -1 }, KENT],
  },
  colorado: {
    cam: [{ t: 0, c: [39.7, -106.8], span: 5.2 }, { t: 16.5, c: [39.6, -106.6], span: 5.0 }],
    header: { text: "קולורדו ויוטה · 1975", t: 0 },
    pins: CO,
  },
  overview2: {
    cam: [{ t: 0, c: WEST, span: 13 }, { t: 9.2, c: [43, -113], span: 12 }],
    dots: [...NW, SAMMAMISH, ...UTAH, KENT, ...CO].map((p, i) => ({ at: p.at, t: 0.2 + i * 0.12 })),
    header: { text: "\u20661974–1975\u2069 · ארבע מדינות", t: 0.4 },
  },
  toAspen: {
    cam: [{ t: 0, c: [40, -109], span: 5 }, { t: 7, c: [39.6, -108], span: 4.4 }],
    labels: [
      { at: P.slc, text: "יוטה", t: 0, minor: true },
      { at: P.aspen, text: "אספן, קולורדו", t: 2.6 },
    ],
    routes: [{ pts: [P.slc, P.aspen], from: 0.4, to: 2.8, dashed: true }],
    chip: { text: "1977", t: 0.4 },
  },
  flight: {
    cam: [{ t: 0, c: [37.5, -97], span: 22 }, { t: 10.8, c: [36.5, -94], span: 21 }],
    labels: [
      { at: P.glenwood, text: "גלנווד ספרינגס", t: 0, minor: true },
      { at: P.chicago, text: "שיקגו", t: 2.6, minor: true },
      { at: P.annarbor, text: "אן ארבור", t: 4.0, minor: true },
      { at: P.atlanta, text: "אטלנטה", t: 5.6, minor: true, left: true },
      { at: P.tallahassee, text: "טלהאסי, פלורידה", t: 7.6 },
    ],
    routes: [
      { pts: [P.glenwood, P.denver, P.chicago, P.annarbor, P.atlanta, P.tallahassee], from: 0.4, to: 7.8, dashed: true },
    ],
    chip: { text: "סוף דצמבר 1977 – ינואר 1978", t: 0.3 },
  },
  lakecity: {
    cam: [{ t: 0, c: [30.2, -82.0], span: 4.4 }, { t: 7.1, c: [30.25, -81.7], span: 4.2 }],
    labels: [{ at: P.tallahassee, text: "טלהאסי", t: 0, minor: true }],
    pins: [{ ...FL[1], t: 0.6 }],
  },
  pensacola: {
    cam: [{ t: 0, c: [30.25, -83.6], span: 4.4 }, { t: 4.9, c: [30.3, -85.2], span: 4.6 }],
    labels: [
      { at: P.tallahassee, text: "טלהאסי", t: 0, minor: true },
      { at: P.pensacola, text: "פנסקולה · 15 בפברואר 1978", t: 1.2, left: true },
    ],
    pins: [{ ...FL[1], t: -1, legend: undefined }],
  },
  overview3: {
    cam: [{ t: 0, c: USA, span: 26 }, { t: 6, c: [38.5, -98], span: 25 }],
    dots: allDots(0.1, 0.06),
    routes: [
      { pts: [P.seattle, P.slc, P.aspen], from: 0.3, to: 2.0, dashed: true },
      { pts: [P.glenwood, P.denver, P.chicago, P.annarbor, P.atlanta, P.tallahassee, P.pensacola], from: 1.8, to: 4.6, dashed: true },
    ],
    header: { text: "\u20661974–1978\u2069", t: 0.2 },
  },
  overview4: {
    cam: [{ t: 0, c: USA, span: 25 }, { t: 8.6, c: [38.5, -98], span: 24 }],
    dots: allDots(0.2, 0.15),
    header: { text: "הודאות · 1989", t: 0.3 },
  },
  jurisdictions: {
    cam: [{ t: 0, c: USA, span: 26 }, { t: 17.7, c: [38.5, -98], span: 25 }],
    dots: allDots(0, 0),
    clusters: true,
  },
};

const camAt = (keys: readonly Cam[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const u = easeInOut(ramp(t, a.t, b.t));
      return {
        t,
        c: [a.c[0] + (b.c[0] - a.c[0]) * u, a.c[1] + (b.c[1] - a.c[1]) * u] as LatLon,
        span: a.span * Math.pow(b.span / a.span, u),
      };
    }
  }
  return keys[keys.length - 1];
};

const partial = (pts: { x: number; y: number }[], f: number) => {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
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
    out.push({ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u });
    break;
  }
  return out;
};

// Clusters for the jurisdictions map: where each state's investigation sat.
const CLUSTERS: { c: LatLon; r: number; label: string; t: number }[] = [
  { c: [46.8, -122.2], r: 70, label: "וושינגטון ואורגון", t: 0.6 },
  { c: [40.6, -111.8], r: 55, label: "יוטה", t: 1.6 },
  { c: [39.4, -107.4], r: 55, label: "קולורדו", t: 2.6 },
  { c: [30.3, -84.2], r: 60, label: "פלורידה", t: 3.6 },
];

export const USMap: React.FC<{ preset: string }> = ({ preset }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: Hh, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const p = PRESETS[preset] ?? PRESETS.overview;
  const cam = camAt(p.cam, t);
  const center = project(cam.c);
  const vh = cam.span * US_BOUNDS.k;
  const vw = (vh * W) / Hh;
  const vx = center.x - vw / 2;
  const vy = center.y - vh / 2;
  const toScreen = (ll: LatLon) => {
    const q = project(ll);
    return { x: ((q.x - vx) / vw) * W, y: ((q.y - vy) / vh) * Hh };
  };
  const fade = Math.min(easeOut(ramp(frame, 0, 10)), 1 - ramp(frame, durationInFrames - 8, durationInFrames));
  const legend = (p.pins ?? []).filter((x) => x.legend);
  const hasLegend = legend.length > 0;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 100% at 40% 40%, #12161b 0%, ${B.sea} 70%)`, opacity: fade }}>
      <svg width={W} height={Hh} viewBox={`${vx} ${vy} ${vw} ${vh}`} style={{ position: "absolute", inset: 0 }}>
        <path d={US_LAND} fill={B.land} stroke={B.coast} strokeWidth={1.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <path d={US_STATES} fill="none" stroke={B.state} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      </svg>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {(p.routes ?? []).map((r, i) => {
          const f = easeInOut(ramp(t, r.from, r.to));
          if (f <= 0) return null;
          const pts = partial(r.pts.map(toScreen), f);
          const end = pts[pts.length - 1];
          return (
            <g key={i}>
              <polyline
                points={pts.map((q) => `${q.x},${q.y}`).join(" ")}
                fill="none"
                stroke={B.paper}
                strokeWidth={3}
                strokeDasharray={r.dashed ? "10 9" : undefined}
                strokeLinecap="round"
                opacity={0.85}
              />
              {f < 1 ? <circle cx={end.x} cy={end.y} r={8} fill={B.paper} /> : null}
            </g>
          );
        })}
        {p.clusters
          ? CLUSTERS.map((c, i) => {
              const q = toScreen(c.c);
              const o = easeOut(ramp(t, c.t, c.t + 0.6));
              return (
                <g key={i} opacity={o}>
                  <circle cx={q.x} cy={q.y} r={c.r} fill="rgba(201,72,59,0.08)" stroke={B.ember} strokeWidth={2} strokeDasharray="6 7" />
                </g>
              );
            })
          : null}
        {p.clusters
          ? [
              [0, 1, 5.5],
              [1, 2, 6.8],
              [2, 3, 8.5],
            ].map(([a, b, at], i) => {
              const A = toScreen(CLUSTERS[a].c);
              const Bp = toScreen(CLUSTERS[b].c);
              const grow = easeInOut(ramp(t, at, at + 2.4));
              // The link reaches only part way: the cases were not connected in time.
              const reach = 0.62 * grow;
              const x2 = A.x + (Bp.x - A.x) * reach;
              const y2 = A.y + (Bp.y - A.y) * reach;
              const qm = { x: A.x + (Bp.x - A.x) * 0.5, y: A.y + (Bp.y - A.y) * 0.5 };
              return (
                <g key={`l${i}`}>
                  <line x1={A.x} y1={A.y} x2={x2} y2={y2} stroke={B.paperDim} strokeWidth={2.5} strokeDasharray="4 10" />
                  <text x={qm.x} y={qm.y - 16} textAnchor="middle" fontFamily={SERIF} fontSize={48} fill={B.ember} opacity={easeOut(ramp(t, at + 2.2, at + 2.8))}>
                    ?
                  </text>
                </g>
              );
            })
          : null}
        {(p.dots ?? []).map((d, i) => {
          const q = toScreen(d.at);
          const o = easeOut(ramp(t, d.t, d.t + 0.35));
          return <circle key={i} cx={q.x + (i % 3) * 3} cy={q.y + ((i * 7) % 5)} r={7} fill={B.ember} opacity={o * 0.9} />;
        })}
      </svg>
      {(p.labels ?? []).map((l, i) => {
        const q = toScreen(l.at);
        const o = easeOut(ramp(t, l.t, l.t + 0.5));
        if (o <= 0) return null;
        return (
          <React.Fragment key={`lb${i}`}>
            <div style={{ position: "absolute", left: q.x - 7, top: q.y - 7, width: 14, height: 14, borderRadius: 7, background: l.minor ? B.paperDim : B.paper, opacity: o }} />
            <div
              style={{
                position: "absolute",
                top: q.y - (l.minor ? 22 : 30),
                ...(l.left ? { right: W - q.x + 22 } : { left: q.x + 22 }),
                fontFamily: l.minor ? SANS : SERIF,
                fontSize: l.minor ? 32 : 50,
                fontWeight: l.minor ? 400 : 600,
                color: l.minor ? B.paperDim : B.paper,
                whiteSpace: "nowrap",
                direction: "rtl",
                opacity: o,
                textShadow: "0 2px 14px rgba(0,0,0,0.95)",
              }}
            >
              {l.text}
            </div>
          </React.Fragment>
        );
      })}
      {(p.pins ?? []).map((pin, i) => {
        const q = toScreen(pin.at);
        const o = easeOut(ramp(t, pin.t, pin.t + 0.5));
        if (o <= 0) return null;
        const pulse = 1 + 0.3 * Math.exp(-Math.max(0, t - pin.t) * 2) * Math.sin((t - pin.t) * 12);
        // Pins at the same place (two disappearances from Seattle) sit side by side.
        const twin = (p.pins ?? []).slice(0, i).filter((o2) => o2.at === pin.at).length;
        const x = q.x + twin * 30;
        return (
          <div
            key={`p${i}`}
            style={{
              position: "absolute",
              left: x - 17 * pulse,
              top: q.y - 17 * pulse,
              width: 34 * pulse,
              height: 34 * pulse,
              borderRadius: "50%",
              background: pin.survivor ? "transparent" : B.ember,
              border: `3px solid ${pin.survivor ? B.paper : B.ember}`,
              color: B.paper,
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 19,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: o,
              boxShadow: "0 0 18px rgba(0,0,0,0.8)",
            }}
          >
            {pin.n ?? ""}
          </div>
        );
      })}
      {hasLegend ? (
        <div
          style={{
            position: "absolute",
            top: 170,
            right: 90,
            width: 640,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            direction: "rtl",
            padding: "28px 32px",
            background: "rgba(7,8,10,0.72)",
            borderRight: `3px solid ${B.ember}`,
          }}
        >
          {legend.map((pin, i) => {
            const o = easeOut(ramp(t, pin.t, pin.t + 0.6));
            return (
              <div key={`lg${i}`} style={{ display: "flex", gap: 18, alignItems: "flex-start", opacity: Math.max(0, o), transform: `translateX(${(1 - o) * -14}px)` }}>
                <div
                  style={{
                    minWidth: 34,
                    height: 34,
                    borderRadius: 17,
                    background: pin.survivor ? "transparent" : B.ember,
                    border: `2px solid ${pin.survivor ? B.paper : B.ember}`,
                    color: B.paper,
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 4,
                  }}
                >
                  {pin.n ?? ""}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 38, color: B.paper, lineHeight: 1.15 }}>{pin.legend!.name}</span>
                  <span style={{ fontFamily: SANS, fontSize: 26, color: B.paperDim }}>{pin.legend!.meta}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {p.clusters ? (
        CLUSTERS.map((c, i) => {
          const q = toScreen(c.c);
          return (
            <div
              key={`cl${i}`}
              style={{
                position: "absolute",
                left: q.x - 150,
                top: q.y + c.r + 8,
                width: 300,
                textAlign: "center",
                fontFamily: SANS,
                fontSize: 30,
                color: B.paper,
                direction: "rtl",
                opacity: easeOut(ramp(t, c.t + 0.2, c.t + 0.8)),
                textShadow: "0 2px 12px rgba(0,0,0,0.95)",
              }}
            >
              {c.label}
            </div>
          );
        })
      ) : null}
      {p.header ? (
        <div
          style={{
            position: "absolute",
            top: 84,
            right: 90,
            fontFamily: SANS,
            fontSize: 40,
            color: B.paper,
            direction: "rtl",
            opacity: easeOut(ramp(t, p.header.t, p.header.t + 0.6)),
            borderRight: `4px solid ${B.ember}`,
            paddingRight: 20,
            textShadow: "0 2px 14px rgba(0,0,0,0.95)",
          }}
        >
          {p.header.text}
        </div>
      ) : null}
      {p.chip ? (
        <div
          style={{
            position: "absolute",
            bottom: 96,
            right: 90,
            fontFamily: SANS,
            fontSize: 38,
            color: B.paper,
            direction: "rtl",
            padding: "10px 24px",
            background: "rgba(7,8,10,0.7)",
            border: `1.5px solid ${B.ember}`,
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
