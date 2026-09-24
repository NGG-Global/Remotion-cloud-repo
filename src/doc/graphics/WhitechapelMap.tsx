import React, { useId } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { ARCHIVE, archiveSrc } from "../archive";
import { fitZoomRange, place, zoomBand } from "../components/framing";
import { clamp01, DOC, easeInOut, easeOut, hash, mix, ramp } from "../theme";

/**
 * Animated map of the Whitechapel murders over the 1894 Ordnance Survey plan.
 *
 * The move is a Ken Burns in image space exactly as in `Archival.tsx`: a focal
 * point in image fractions and a zoom over "cover". Pins, crosses and the
 * route live in the same transformed container as the map, placed in image
 * pixel coordinates, and each is counter-scaled so it keeps a constant size
 * on screen. Everything is derived from the frame number.
 */

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------

export type MapSite = "nichols" | "chapman" | "stride" | "eddowes" | "kelly";

/** The six other cases on the Metropolitan Police "Whitechapel murders" file. */
export type FileSite =
  | "smith"
  | "tabram"
  | "mylett"
  | "mckenzie"
  | "pinchin"
  | "coles";

export type AnySite = MapSite | FileSite;

const MAP = ARCHIVE.plan1894;

/**
 * Pixel coordinates in the 2848x1860 plan, verified against the street names
 * on the sheet (see the justification beside each).
 */
export const MAP_SITES: Record<MapSite, { x: number; y: number }> = {
  /** Buck's Row, south side, at the north-east corner of the Board School block (Brown's stable gateway). */
  nichols: { x: 2216, y: 476 },
  /** 29 Hanbury Street, north side, midway between Wilkes Street and Commercial Street. */
  chapman: { x: 1107, y: 190 },
  /** Dutfield's Yard, west side of Berner Street, a few doors north of Fairclough Street. */
  stride: { x: 2030, y: 1596 },
  /** Mitre Square, towards its south-west corner, off Mitre Street. */
  eddowes: { x: 345, y: 1622 },
  /** Miller's Court, north side of Dorset Street, between Crispin Street and Commercial Street. */
  kelly: { x: 740, y: 583 },
};

/** Approximate marks for the other six file cases; off-sheet sites sit just inside the nearest edge. */
export const MAP_FILE_SITES: Record<FileSite, { x: number; y: number }> = {
  /** Osborn Street at the Wentworth Street / Brick Lane junction. */
  smith: { x: 1366, y: 858 },
  /** George Yard Buildings, north end of George Yard behind Toynbee Hall. */
  tabram: { x: 1222, y: 962 },
  /** Clarke's Yard, Poplar: far to the east, off the sheet. */
  mylett: { x: 2836, y: 1480 },
  /** Castle Alley, midway between Whitechapel High Street and Old Castle Street. */
  mckenzie: { x: 1000, y: 1222 },
  /** Pinchin Street railway arch, south of Ellen Street: just off the bottom edge, in line with Backchurch Lane. */
  pinchin: { x: 1860, y: 1848 },
  /** Swallow Gardens, off Chamber Street south of Aldgate: off the bottom edge. */
  coles: { x: 730, y: 1848 },
};

const ALL_SITES: Record<AnySite, { x: number; y: number }> = {
  ...MAP_SITES,
  ...MAP_FILE_SITES,
};

/** Chronological order of the eleven file cases, used for the stagger in `eleven` mode. */
const FILE_ORDER: readonly AnySite[] = [
  "smith",
  "tabram",
  "nichols",
  "chapman",
  "stride",
  "eddowes",
  "kelly",
  "mylett",
  "mckenzie",
  "pinchin",
  "coles",
];

const CANONICAL: readonly MapSite[] = [
  "nichols",
  "chapman",
  "stride",
  "eddowes",
  "kelly",
];

const isCanonical = (s: AnySite): s is MapSite =>
  (CANONICAL as readonly string[]).includes(s);

// ---------------------------------------------------------------------------
// Framing helpers
// ---------------------------------------------------------------------------

/** Focal point as fractions of the map image, and a zoom over cover (1 = whole frame covered). */
export type MapFraming = { x: number; y: number; zoom: number };

/** A framing centred on one site. */
export const siteFraming = (site: MapSite, zoom: number): MapFraming => ({
  x: MAP_SITES[site].x / MAP.w,
  y: MAP_SITES[site].y / MAP.h,
  zoom,
});

/**
 * A framing centred on the bounding box of several sites. The component clamps
 * the move so the sheet always covers the frame, so a framing near an edge
 * simply slides inward.
 */
export const sitesFraming = (
  sites: readonly MapSite[],
  zoom: number,
): MapFraming => {
  const xs = sites.map((s) => MAP_SITES[s].x);
  const ys = sites.map((s) => MAP_SITES[s].y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2 / MAP.w,
    y: (Math.min(...ys) + Math.max(...ys)) / 2 / MAP.h,
    zoom,
  };
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type WhitechapelMapProps = {
  from: MapFraming;
  to: MapFraming;
  /** Frames the move takes; defaults to the whole sequence. */
  duration?: number;
  /** Frames to wait before the move starts. */
  delay?: number;
  /** Which pins are shown and the frame at which each drops. Pins bloom with a ripple ring, settle, then pulse slowly. */
  pins?: readonly { site: MapSite; at: number }[];
  /** A dashed ink route traced from one site to another between frames start..end, with a travelling dot. */
  route?: { from: MapSite; to: MapSite; start: number; end: number } | null;
  /**
   * Show all eleven marks on the Whitechapel-murders file as small grey ink
   * crosses appearing one by one from `start` (about 8 frames apart). At
   * `highlightAt` the five canonical sites bloom red and the other six fade
   * back. Sites listed in `pins` bloom at their own `at` instead.
   */
  eleven?: { start: number; highlightAt?: number } | null;
  /** Ink-wash darkening 0..1 (default 0.55): old paper under lamplight, not a bright scan. */
  wash?: number;
  /** Cold night grade 0..1. */
  night?: number;
  /** A faint magnifying lens following the focal point, 0..1. */
  lens?: number;
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

type RGB = readonly [number, number, number];

const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

const rgb = (c: RGB, alpha = 1): string =>
  `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`;

/** Damped overshoot: 0 at t=0, peaks ~1.07 just under halfway, settles at 1. */
const bloom = (t: number): number =>
  t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-6 * t) * Math.cos(t * 7);

// ---------------------------------------------------------------------------
// Marks
// ---------------------------------------------------------------------------

/** An irregular ink-blot outline in a 100x100 box, seeded per site so it never changes. */
const blotPath = (seed: number): string => {
  const n = 14;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 30 + (hash(seed * 31 + i) - 0.5) * 11;
    pts.push({ x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r });
  }
  // Smooth through the midpoints so the blob reads as wet ink, not a polygon.
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    d += i === 0 ? `M ${mx} ${my} ` : "";
    const r = pts[(i + 2) % n];
    const nx = (q.x + r.x) / 2;
    const ny = (q.y + r.y) / 2;
    d += `Q ${q.x} ${q.y} ${nx} ${ny} `;
  }
  return d + "Z";
};

const BLOTS: Record<AnySite, string> = Object.fromEntries(
  FILE_ORDER.map((s, i) => [s, blotPath(i + 3)]),
) as Record<AnySite, string>;

/** Satellite droplets around the blot, in the same 100x100 box. */
const droplets = (seed: number): { x: number; y: number; r: number }[] =>
  [0, 1, 2].map((i) => {
    const a = hash(seed * 17 + i) * Math.PI * 2;
    const d = 36 + hash(seed * 23 + i) * 10;
    return {
      x: 50 + Math.cos(a) * d,
      y: 50 + Math.sin(a) * d,
      r: 2 + hash(seed * 29 + i) * 3,
    };
  });

type PinProps = {
  site: AnySite;
  /** Frame at which the pin drops. */
  at: number;
  frame: number;
  /** Screen-pixel diameter of the blot. */
  size: number;
  /** Current map scale, for the counter-scale. */
  scale: number;
  opacity?: number;
};

const Pin: React.FC<PinProps> = ({
  site,
  at,
  frame,
  size,
  scale,
  opacity = 1,
}) => {
  const age = frame - at;
  if (age < 0 || opacity <= 0) {
    return null;
  }
  const p = ALL_SITES[site];
  const seed = FILE_ORDER.indexOf(site) + 3;
  const grow = bloom(ramp(age, 0, 16));
  // Slow breathing once settled; period a little over two seconds.
  const settled = ramp(age, 16, 40);
  const breath = 1 + settled * 0.05 * Math.sin(age * 0.09 + seed);
  const s = grow * breath;

  const ring1 = ramp(age, 0, 36);
  const ring2 = ramp(age, 8, 44);
  const glow = 0.28 + settled * 0.1 * Math.sin(age * 0.09 + seed + 1.2);

  const box = size * 3.2;
  const red = DOC.red;
  const deep = DOC.redDeep;
  const gid = `blot-${site}`;

  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: 0,
        height: 0,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -box / 2,
          top: -box / 2,
          width: box,
          height: box,
          transform: `scale(${1 / scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* Faint glow beneath. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(168,23,31,${glow * grow}) 0%, rgba(168,23,31,0) 60%)`,
          }}
        />
        <svg
          width={box}
          height={box}
          viewBox="0 0 320 320"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <radialGradient id={gid} cx="42%" cy="40%" r="60%">
              <stop offset="0%" stopColor={red} />
              <stop offset="70%" stopColor={red} />
              <stop offset="100%" stopColor={deep} />
            </radialGradient>
          </defs>
          {/* Ripple rings. */}
          {[ring1, ring2].map((t, i) =>
            t > 0 && t < 1 ? (
              <circle
                key={i}
                cx={160}
                cy={160}
                r={mix(size * 0.45, size * 1.45, easeOut(t)) * (320 / box)}
                fill="none"
                stroke={red}
                strokeWidth={(1.6 - t) * (320 / box)}
                opacity={(1 - t) * (i === 0 ? 0.75 : 0.45)}
              />
            ) : null,
          )}
          {/* The blot, drawn in a 100-unit box scaled to `size` screen px. */}
          <g
            transform={`translate(160 160) scale(${((size / 64) * s * 320) / box}) translate(-50 -50)`}
          >
            <path d={BLOTS[site]} fill={`url(#${gid})`} />
            {droplets(seed).map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={red} />
            ))}
            {/* A darker heart where the ink pooled. */}
            <circle cx={47} cy={49} r={11} fill={deep} opacity={0.55} />
          </g>
        </svg>
      </div>
    </div>
  );
};

type CrossProps = {
  site: AnySite;
  at: number;
  frame: number;
  scale: number;
  opacity: number;
};

/** A small ink cross for the file cases. */
const Cross: React.FC<CrossProps> = ({ site, at, frame, scale, opacity }) => {
  const age = frame - at;
  if (age < 0 || opacity <= 0) {
    return null;
  }
  const p = ALL_SITES[site];
  const s = bloom(ramp(age, 0, 12));
  const size = 30;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: 0,
        height: 0,
        opacity,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        style={{
          position: "absolute",
          left: -size / 2,
          top: -size / 2,
          transform: `scale(${s / scale})`,
          transformOrigin: "50% 50%",
          overflow: "visible",
        }}
      >
        {/* A faint paper halo so the ink reads over the hatching. */}
        <circle cx={15} cy={15} r={13} fill="rgba(236, 222, 190, 0.42)" />
        <g stroke="#5c5346" strokeWidth={3.2} strokeLinecap="round" fill="none">
          <line x1={7} y1={7} x2={23} y2={23} />
          <line x1={23} y1={7} x2={7} y2={23} />
        </g>
        <circle
          cx={15}
          cy={15}
          r={13}
          fill="none"
          stroke="#5c5346"
          strokeWidth={0.9}
          opacity={0.5}
        />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

type RouteGeom = {
  d: string;
  length: number;
  pointAt: (t: number) => { x: number; y: number };
};

/** A slightly curved quadratic path between two sites, with its length sampled numerically. */
const routeGeometry = (a: MapSite, b: MapSite): RouteGeom => {
  const p0 = MAP_SITES[a];
  const p2 = MAP_SITES[b];
  const dx = p2.x - p0.x;
  const dy = p2.y - p0.y;
  const dist = Math.hypot(dx, dy) || 1;
  // Control point offset to one side by 10% of the distance; bow it away from the frame centre-ish.
  const side = dy >= 0 ? -1 : 1;
  const cx = (p0.x + p2.x) / 2 + (side * -dy * 0.1 * dist) / dist;
  const cy = (p0.y + p2.y) / 2 + (side * dx * 0.1 * dist) / dist;
  const pointAt = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * cx + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * cy + t * t * p2.y,
    };
  };
  let length = 0;
  let prev = pointAt(0);
  const steps = 64;
  for (let i = 1; i <= steps; i++) {
    const q = pointAt(i / steps);
    length += Math.hypot(q.x - prev.x, q.y - prev.y);
    prev = q;
  }
  return {
    d: `M ${p0.x} ${p0.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`,
    length,
    pointAt,
  };
};

type RouteProps = {
  route: NonNullable<WhitechapelMapProps["route"]>;
  frame: number;
  scale: number;
};

const Route: React.FC<RouteProps> = ({ route, frame, scale }) => {
  const maskId = useId();
  const progress = easeInOut(ramp(frame, route.start, route.end));
  if (progress <= 0) {
    return null;
  }
  const geom = routeGeometry(route.from, route.to);
  const L = geom.length;
  const sw = 3.6 / scale;
  const dash = 13 / scale;
  const gap = 9 / scale;
  const head = geom.pointAt(progress);
  const dotR = 6 / scale;
  // The dot lingers a moment at the destination, then dissolves.
  const dotFade = 1 - ramp(frame, route.end + 6, route.end + 22);

  return (
    <svg
      width={MAP.w}
      height={MAP.h}
      viewBox={`0 0 ${MAP.w} ${MAP.h}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <path
            d={geom.d}
            fill="none"
            stroke="#fff"
            strokeWidth={sw * 6}
            strokeLinecap="round"
            pathLength={L}
            strokeDasharray={L}
            strokeDashoffset={L * (1 - progress)}
          />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Soft ink bleed under the line. */}
        <path
          d={geom.d}
          fill="none"
          stroke={DOC.red}
          strokeWidth={sw * 3.5}
          opacity={0.22}
          strokeLinecap="round"
        />
        <path
          d={geom.d}
          fill="none"
          stroke={DOC.red}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          opacity={0.8}
        />
      </g>
      {dotFade > 0 ? (
        <g opacity={dotFade}>
          <circle
            cx={head.x}
            cy={head.y}
            r={dotR * 4.5}
            fill={DOC.gas}
            opacity={0.16}
          />
          <circle
            cx={head.x}
            cy={head.y}
            r={dotR * 2.4}
            fill={DOC.red}
            opacity={0.3}
          />
          <circle cx={head.x} cy={head.y} r={dotR} fill={DOC.red} />
          <circle
            cx={head.x}
            cy={head.y}
            r={dotR * 0.45}
            fill={DOC.gasHot}
            opacity={0.85}
          />
        </g>
      ) : null}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WARM_LIGHT = hexToRgb("#f1e4c8");
const WARM_DARK = hexToRgb("#8c6f45");
const COLD_LIGHT = hexToRgb("#b8c2cf");
const COLD_DARK = hexToRgb("#3f4b5c");

export const WhitechapelMap: React.FC<WhitechapelMapProps> = ({
  from,
  to,
  duration,
  delay = 0,
  pins = [],
  route = null,
  eleven = null,
  wash = 0.55,
  night = 0,
  lens = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, durationInFrames } = useVideoConfig();
  const span = duration ?? durationInFrames;
  const t = easeInOut(ramp(frame, delay, delay + span));

  // Ken Burns in image space, as in Archival.tsx. The sheet always covers the
  // frame, and the deepest zoom is the one the engraving can still carry: past
  // about 1.3 screen pixels per printed pixel the street names turn to pulp,
  // and a map nobody can read is not a map.
  const band = zoomBand(MAP, W, H, { floor: "cover", maxUpscale: 1.3 });
  const [z0, z1] = fitZoomRange(from.zoom, to.zoom, band);
  const zoom = mix(z0, z1, t);
  const { scale, tx, ty } = place(
    MAP,
    W,
    H,
    { x: mix(from.x, to.x, t), y: mix(from.y, to.y, t), zoom },
    band,
  );
  const mapTransform = `translate(${tx}px, ${ty}px) scale(${scale})`;

  // Grade. Sepia and contrast make it print; the multiply layer makes it paper.
  const w = clamp01(wash);
  const n = clamp01(night);
  const filter = [
    `sepia(${mix(0.8, 0.25, n)})`,
    `saturate(${mix(0.9, 0.55, n)})`,
    `contrast(${mix(1.14, 1.22, w)})`,
    `brightness(${mix(1.02, 0.6, w) * mix(1, 0.85, n)})`,
  ].join(" ");
  const warm = mixRgb(WARM_LIGHT, WARM_DARK, w * 0.9);
  const cold = mixRgb(COLD_LIGHT, COLD_DARK, w * 0.9);
  const paper = mixRgb(warm, cold, n);
  const vignette = 0.5 + w * 0.35;

  // Pin size grows a little with zoom, staying in the 28-40 px band on screen.
  const pinSize = 30 + 10 * clamp01((zoom - 1) / 2.5);

  // Which sites get a red pin, and when.
  const pinAt = new Map<MapSite, number>();
  for (const p of pins) {
    pinAt.set(p.site, p.at);
  }
  if (eleven?.highlightAt !== undefined) {
    for (const s of CANONICAL) {
      if (!pinAt.has(s)) {
        pinAt.set(s, eleven.highlightAt);
      }
    }
  }

  const marks = (
    <>
      {eleven
        ? FILE_ORDER.map((s, i) => {
            const at = eleven.start + i * 8;
            let opacity = 0.9;
            if (isCanonical(s)) {
              const red = pinAt.get(s);
              // The cross gives way to the blot as it blooms.
              if (red !== undefined) {
                opacity *= 1 - ramp(frame, red, red + 8);
              }
            } else if (eleven.highlightAt !== undefined) {
              opacity *= mix(
                1,
                0.35,
                ramp(frame, eleven.highlightAt, eleven.highlightAt + 24),
              );
            }
            return (
              <Cross
                key={s}
                site={s}
                at={at}
                frame={frame}
                scale={scale}
                opacity={opacity}
              />
            );
          })
        : null}
      {route ? <Route route={route} frame={frame} scale={scale} /> : null}
      {Array.from(pinAt.entries()).map(([s, at]) => (
        <Pin
          key={s}
          site={s}
          at={at}
          frame={frame}
          size={pinSize}
          scale={scale}
        />
      ))}
    </>
  );

  const sheetStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: MAP.w,
    height: MAP.h,
    maxWidth: "none",
    maxHeight: "none",
    transformOrigin: "0 0",
    transform: mapTransform,
    willChange: "transform",
  };

  // Lens: a second copy of the sheet, magnified about the frame centre.
  const lensR = 180;
  const lensMag = 1.25;
  const lensLeft = W / 2 - lensR;
  const lensTop = H / 2 - lensR;
  const lensTransform = `translate(${lensR + lensMag * (tx - lensLeft - lensR)}px, ${
    lensR + lensMag * (ty - lensTop - lensR)
  }px) scale(${scale * lensMag})`;
  const lensOpacity = clamp01(lens);

  return (
    <AbsoluteFill
      style={{ overflow: "hidden", background: DOC.black, ...style }}
    >
      <Img src={archiveSrc(MAP)} style={{ ...sheetStyle, filter }} />
      {/* Paper: multiply the scan with parchment so white becomes old paper. */}
      <AbsoluteFill
        style={{ background: rgb(paper), mixBlendMode: "multiply" }}
      />
      {/* Marks share the sheet's transform. */}
      <div style={sheetStyle}>{marks}</div>
      {/* Lamplight falling off towards the edges. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 62% at 50% 48%, rgba(0,0,0,0) 0%, rgba(4,3,2,${vignette * 0.45}) 55%, rgba(4,3,2,${vignette}) 100%)`,
        }}
      />
      {/* A thin cold veil at night. */}
      {n > 0 ? (
        <AbsoluteFill style={{ background: `rgba(40, 56, 82, ${n * 0.22})` }} />
      ) : null}

      {lensOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: lensLeft,
            top: lensTop,
            width: lensR * 2,
            height: lensR * 2,
            opacity: lensOpacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              overflow: "hidden",
              background: DOC.black,
            }}
          >
            <Img
              src={archiveSrc(MAP)}
              style={{
                ...sheetStyle,
                transform: lensTransform,
                filter: `${filter} brightness(1.08)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: rgb(paper),
                mixBlendMode: "multiply",
              }}
            />
            <div style={{ ...sheetStyle, transform: lensTransform }}>
              {marks}
            </div>
            {/* Glass: a soft inner shade and a highlight arc. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                boxShadow:
                  "inset 0 0 40px rgba(0,0,0,0.45), inset 0 0 6px rgba(0,0,0,0.6)",
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255,240,210,0.16) 0%, rgba(255,240,210,0) 38%)",
              }}
            />
          </div>
          {/* Brass rim. */}
          <div
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              border: `3px solid ${rgb(hexToRgb(DOC.gas), 0.6)}`,
              boxShadow: `0 0 0 1px rgba(60,40,15,0.6), 0 6px 18px rgba(0,0,0,0.5)`,
            }}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
