import React from "react";
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame } from "remotion";
import ART from "./art.json";

/**
 * The motion-comic engine.
 *
 * A shot is a stack of pre-painted layers (baked by tools/basement/bake.mjs)
 * seen through a 2D camera. Every layer is a flat image moved with CSS
 * transforms only; the look was paid for once at bake time. Parallax comes
 * from each layer's depth factor `p` (1 = the plate, >1 nearer the lens).
 *
 * Coordinates are plate pixels. Plates are painted at 1.25x the 720p frame,
 * so the stage scale is 0.8 at zoom 1.
 */

export const FPS = 24;
export const VW = 1280;
export const VH = 720;
const BASE = 0.8;

type ArtEntry = { file: string; w: number; h: number };
const art = ART as Record<string, ArtEntry>;
export const artSrc = (n: string): string => {
  const a = art[n];
  if (!a) throw new Error(`Unknown art layer: ${n}`);
  return staticFile(`basement/art/${a.file}`);
};
export const artSize = (n: string): ArtEntry => {
  const a = art[n];
  if (!a) throw new Error(`Unknown art layer: ${n}`);
  return a;
};

/* ---------------- timing helpers ---------------- */

/** Keyframes [t, value]; linear between keys, eased in/out when ease. */
export type K = readonly (readonly [number, number])[];
const io = Easing.bezier(0.45, 0, 0.55, 1);
export const key = (k: K | number | undefined, t: number, dflt = 0, ease = true): number => {
  if (k === undefined) return dflt;
  if (typeof k === "number") return k;
  if (k.length === 0) return dflt;
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const [t0, v0] = k[i - 1];
      const [t1, v1] = k[i];
      const u = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (ease ? io(u) : u);
    }
  }
  return k[k.length - 1][1];
};
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Smooth 1D value noise in [-1, 1]. */
export const noise = (x: number, seed = 0): number => {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i + seed * 101);
  const b = hash(i + 1 + seed * 101);
  const u = f * f * (3 - 2 * f);
  return (a + (b - a) * u) * 2 - 1;
};

/* ---------------- shot description ---------------- */

export type Layer = {
  /** art layer name */
  readonly n: string;
  /** depth factor: 1 = plate, >1 foreground, <1 background */
  readonly p?: number;
  readonly x?: number;
  readonly y?: number;
  readonly op?: K | number;
  readonly dx?: K;
  readonly dy?: K;
  /** scale keyframes about (ox, oy) in plate px */
  readonly sc?: K;
  readonly ox?: number;
  readonly oy?: number;
  /** visibility window in shot seconds */
  readonly from?: number;
  readonly to?: number;
  /** jitter amplitude in plate px (trembling, laughing) */
  readonly jit?: number | K;
  readonly jf?: number;
  /** a breathing rise and fall, amplitude in px */
  readonly br?: number;
};

export type Hole = readonly (readonly [number, number, number, number])[]; // [t, x, y, r]

export type Fx =
  | { readonly t: "flash"; readonly at: number; readonly d?: number; readonly c?: string; readonly peak?: number }
  | { readonly t: "tint"; readonly c: string; readonly op: K | number; readonly blend?: "normal" | "multiply" | "screen" }
  | { readonly t: "black"; readonly op: K }
  | { readonly t: "fog"; readonly op?: number; readonly speed?: number; readonly y?: number }
  | { readonly t: "steam"; readonly x: number; readonly y: number; readonly w: number; readonly op?: K | number }
  | { readonly t: "police" }
  | { readonly t: "tv"; readonly x: number; readonly y: number; readonly w: number; readonly h: number }
  | { readonly t: "heart"; readonly bpm: number; readonly a?: number; readonly from?: number }
  | { readonly t: "muzzle"; readonly at: readonly number[]; readonly x: number; readonly y: number }
  | { readonly t: "arc"; readonly from: number; readonly to: number; readonly x: number; readonly y: number }
  | { readonly t: "drip"; readonly x: number; readonly y0: number; readonly y1: number; readonly every: number; readonly phase?: number }
  | { readonly t: "shadow"; readonly k: Hole }
  | { readonly t: "glint"; readonly pts: readonly (readonly [number, number])[]; readonly every?: number }
  | { readonly t: "smoke"; readonly x: number; readonly y: number }
  | { readonly t: "light"; readonly x: number; readonly y: number; readonly r: number; readonly c: string; readonly op: K | number; readonly flick?: number };

export type Cam = readonly (readonly [number, number, number, number])[]; // [t, cx, cy, zoom]

export type Shot = {
  readonly at: number;
  readonly plate: string;
  readonly L?: readonly Layer[];
  readonly cam?: Cam;
  /** camera keys with t as a fraction (0..1) of the shot's length */
  readonly cn?: Cam;
  /** handheld drift amplitude, plate px */
  readonly hand?: number;
  /** impacts: [t, amplitude px] */
  readonly shake?: readonly (readonly [number, number])[];
  /** darkness plate laid over the lit plate, with moving light holes */
  readonly dark?: { readonly n: string; readonly holes: readonly Hole[]; readonly op?: K | number };
  readonly fx?: readonly Fx[];
  /** how the shot comes in */
  readonly tr?: "cut" | "fade" | "xfade" | "flash";
  readonly trd?: number;
  /** fade to black over the last `out` seconds */
  readonly out?: number;
};

/* ---------------- camera ---------------- */

type CamState = { cx: number; cy: number; z: number };
const camAt = (shot: Shot, t: number, dur: number, w: number, h: number): CamState => {
  const ck = shot.cam ?? (shot.cn ? shot.cn.map(([u, x, y, z]) => [u * dur, x, y, z] as const) : [
    [0, w / 2, h / 2, 1.05],
    [dur, w / 2, h / 2, 1.12],
  ]);
  const c = { cx: key(ck.map(([tt, x]) => [tt, x] as const), t), cy: key(ck.map(([tt, , y]) => [tt, y] as const), t), z: key(ck.map(([tt, , , z]) => [tt, z] as const), t) };
  const hand = shot.hand ?? 2.5;
  c.cx += noise(t * 0.35, 1) * hand * 2 + noise(t * 1.1, 2) * hand * 0.5;
  c.cy += noise(t * 0.3, 3) * hand * 1.4 + noise(t * 1.3, 4) * hand * 0.4;
  for (const [t0, a] of shot.shake ?? []) {
    if (t >= t0 && t < t0 + 1.2) {
      const d = Math.exp(-(t - t0) * 6) * a;
      c.cx += noise(t * 30, 7) * d;
      c.cy += noise(t * 30, 9) * d;
    }
  }
  c.z = Math.max(1, c.z);
  const hw = VW / 2 / (BASE * c.z), hh = VH / 2 / (BASE * c.z);
  c.cx = Math.min(w - hw, Math.max(hw, c.cx));
  c.cy = Math.min(h - hh, Math.max(hh, c.cy));
  return c;
};

/** Transform that puts a plate-sized layer of depth p on screen. */
const stageTransform = (c: CamState, p: number, w: number, h: number): string => {
  const zp = 1 + (c.z - 1) * p;
  const cx = w / 2 + (c.cx - w / 2) * p;
  const cy = h / 2 + (c.cy - h / 2) * p;
  return `translate(${VW / 2}px, ${VH / 2}px) scale(${BASE * zp}) translate(${-cx}px, ${-cy}px)`;
};

/* ---------------- the shot renderer ---------------- */

const maskFor = (holes: readonly Hole[], t: number): string =>
  holes
    .map((k) => {
      const x = key(k.map(([tt, xx]) => [tt, xx] as const), t);
      const y = key(k.map(([tt, , yy]) => [tt, yy] as const), t);
      const r = key(k.map(([tt, , , rr]) => [tt, rr] as const), t);
      return `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, transparent 0px, transparent ${(r * 0.3).toFixed(1)}px, rgba(0,0,0,0.55) ${(r * 0.7).toFixed(1)}px, black ${r.toFixed(1)}px)`;
    })
    .join(", ");

export const ShotView: React.FC<{ readonly shot: Shot; readonly dur: number; readonly lead: number }> = ({ shot, dur, lead }) => {
  const frame = useCurrentFrame();
  // shot-local seconds: 0 at the shot's narration start, negative during a crossfade lead-in
  const t = frame / FPS - lead;
  const { w, h } = artSize(shot.plate);
  const cam = camAt(shot, t, dur, w, h);
  const base = stageTransform(cam, 1, w, h);
  const layerBox = (tf: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: 0, top: 0, width: w, height: h, maxWidth: "none", maxHeight: "none", transformOrigin: "0 0", transform: tf, ...extra });

  // entrance and exit
  let op = 1;
  let blackIn = 0;
  const trd = shot.trd ?? (shot.tr === "xfade" ? 0.8 : 0.6);
  if (shot.tr === "xfade") op = Math.min(1, Math.max(0, (t + trd) / trd));
  if (shot.tr === "fade") blackIn = 1 - Math.min(1, Math.max(0, t / trd));
  let blackOut = 0;
  if (shot.out) blackOut = Math.min(1, Math.max(0, (t - (dur - shot.out)) / shot.out));

  return (
    <AbsoluteFill style={{ opacity: op, backgroundColor: "#000", overflow: "hidden" }}>
      <Img src={artSrc(shot.plate)} style={layerBox(base)} />
      {shot.dark ? (
        <Img
          src={artSrc(shot.dark.n)}
          style={layerBox(base, {
            opacity: key(shot.dark.op, t, 1),
            WebkitMaskImage: maskFor(shot.dark.holes, t),
            maskImage: maskFor(shot.dark.holes, t),
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          } as React.CSSProperties)}
        />
      ) : null}
      {(shot.L ?? []).map((l, i) => {
        if (l.from !== undefined && t < l.from) return null;
        if (l.to !== undefined && t >= l.to) return null;
        const a = artSize(l.n);
        const p = l.p ?? 1;
        const jit = typeof l.jit === "number" || l.jit === undefined ? l.jit ?? 0 : key(l.jit, t);
        const jf = l.jf ?? 9;
        const ox = (l.x ?? 0) + key(l.dx, t) + (jit ? noise(t * jf, i * 3 + 1) * jit : 0);
        const oy = (l.y ?? 0) + key(l.dy, t) + (jit ? noise(t * jf, i * 3 + 2) * jit : 0) + (l.br ? Math.sin(t * 1.6 + i) * l.br : 0);
        const s = key(l.sc, t, 1);
        const sx = l.ox ?? a.w / 2, sy = l.oy ?? a.h;
        const tf = `${stageTransform(cam, p, w, h)} translate(${ox}px, ${oy}px) translate(${sx}px, ${sy}px) scale(${s}) translate(${-sx}px, ${-sy}px)`;
        return <Img key={i} src={artSrc(l.n)} style={{ position: "absolute", left: 0, top: 0, width: a.w, height: a.h, maxWidth: "none", maxHeight: "none", transformOrigin: "0 0", transform: tf, opacity: key(l.op, t, 1) }} />;
      })}
      <div style={layerBox(base)}>
        {(shot.fx ?? []).map((fx, i) => (
          <PlateFx key={i} fx={fx} t={t} />
        ))}
      </div>
      {(shot.fx ?? []).map((fx, i) => (
        <ScreenFx key={i} fx={fx} t={t} frame={frame} />
      ))}
      {blackIn > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: blackIn }} /> : null}
      {blackOut > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: blackOut }} /> : null}
      {shot.tr === "flash" && t < 0.5 ? <AbsoluteFill style={{ backgroundColor: "#fff", opacity: Math.max(0, 1 - t / 0.5) }} /> : null}
    </AbsoluteFill>
  );
};

/* ---------------- effects drawn in plate space ---------------- */

const FOG = [staticFile("basement/fog-0.png"), staticFile("basement/fog-1.png"), staticFile("basement/fog-2.png")];

const PlateFx: React.FC<{ readonly fx: Fx; readonly t: number }> = ({ fx, t }) => {
  switch (fx.t) {
    case "steam": {
      const o = key(fx.op, t, 0.5);
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const cyc = (t * 0.12 + i / 5) % 1;
            const x = fx.x - fx.w / 2 + ((i * 0.37) % 1) * fx.w + noise(t * 0.3, i) * 40 - 260;
            const y = fx.y - cyc * 420 - 180;
            return <Img key={i} src={FOG[i % 3]} style={{ position: "absolute", maxWidth: "none", left: x, top: y, width: 520 + cyc * 300, height: 260 + cyc * 150, opacity: o * Math.sin(cyc * Math.PI) * 0.85 }} />;
          })}
        </>
      );
    }
    case "drip": {
      const ph = (t + (fx.phase ?? 0)) % fx.every;
      const fall = Math.min(1, Math.max(0, (ph - 0.3) / 0.35));
      const y = fx.y0 + (fx.y1 - fx.y0) * fall * fall;
      const swell = Math.min(1, ph / 0.3);
      return <div style={{ position: "absolute", left: fx.x - 5, top: y - 6, width: 10, height: 6 + swell * 8 + fall * 10, borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%", background: "#7c1119", opacity: fall >= 1 ? 0 : 0.95 }} />;
    }
    case "tv": {
      const v = 0.55 + noise(t * 4, 5) * 0.25 + (hash(Math.floor(t * 6)) > 0.8 ? 0.2 : 0);
      return <div style={{ position: "absolute", left: fx.x - fx.w / 2, top: fx.y - fx.h / 2, width: fx.w, height: fx.h, background: "radial-gradient(closest-side, rgba(110,170,230,0.45), rgba(110,170,230,0))", opacity: v }} />;
    }
    case "muzzle": {
      const hit = fx.at.find((a) => t >= a && t < a + 0.12);
      if (hit === undefined) return null;
      return <div style={{ position: "absolute", left: fx.x - 200, top: fx.y - 200, width: 400, height: 400, background: "radial-gradient(closest-side, rgba(255,250,220,1), rgba(255,190,90,0.6) 35%, rgba(255,140,40,0))" }} />;
    }
    case "arc": {
      if (t < fx.from || t > fx.to) return null;
      const seed = Math.floor(t * 24);
      const pts = (k: number) => Array.from({ length: 7 }, (_, i) => `${fx.x - 30 + i * 10},${fx.y + (hash(seed * 13 + i + k * 7) - 0.5) * 40}`).join(" ");
      return (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
          <circle cx={fx.x} cy={fx.y} r={60} fill="rgba(140,190,255,0.35)" />
          <polyline points={pts(1)} fill="none" stroke="#e8f4ff" strokeWidth={3} />
          <polyline points={pts(2)} fill="none" stroke="#7ab0ff" strokeWidth={2} />
        </svg>
      );
    }
    case "shadow": {
      const x = key(fx.k.map(([tt, xx]) => [tt, xx] as const), t);
      const y = key(fx.k.map(([tt, , yy]) => [tt, yy] as const), t);
      const r = key(fx.k.map(([tt, , , rr]) => [tt, rr] as const), t);
      return <div style={{ position: "absolute", left: x - r, top: y - r * 1.6, width: r * 2, height: r * 3.2, background: "radial-gradient(closest-side, rgba(0,0,0,0.85), rgba(0,0,0,0))" }} />;
    }
    case "glint": {
      const every = fx.every ?? 2.2;
      return (
        <>
          {fx.pts.map(([x, y], i) => {
            const ph = ((t + i * 0.7) % every) / every;
            const o = ph < 0.15 ? Math.sin((ph / 0.15) * Math.PI) : 0;
            return o > 0 ? <div key={i} style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, background: "radial-gradient(closest-side, rgba(255,250,235,0.95), rgba(255,250,235,0))", opacity: o }} /> : null;
          })}
        </>
      );
    }
    case "smoke": {
      return (
        <>
          {[0, 1, 2].map((i) => {
            const cyc = (t * 0.15 + i / 3) % 1;
            return <Img key={i} src={FOG[(i + 1) % 3]} style={{ position: "absolute", maxWidth: "none", left: fx.x - 120 + noise(t * 0.4, i) * 30, top: fx.y - cyc * 260 - 60, width: 240 + cyc * 160, height: 120 + cyc * 80, opacity: 0.35 * Math.sin(cyc * Math.PI) }} />;
          })}
        </>
      );
    }
    case "light": {
      const o = key(fx.op, t, 1) * (fx.flick ? 1 - fx.flick * (0.5 + 0.5 * noise(t * 7, 11)) : 1);
      return <div style={{ position: "absolute", left: fx.x - fx.r, top: fx.y - fx.r, width: fx.r * 2, height: fx.r * 2, background: `radial-gradient(closest-side, ${fx.c}, rgba(0,0,0,0))`, opacity: o }} />;
    }
    default:
      return null;
  }
};

/* ---------------- effects drawn in screen space ---------------- */

const ScreenFx: React.FC<{ readonly fx: Fx; readonly t: number; readonly frame: number }> = ({ fx, t, frame }) => {
  switch (fx.t) {
    case "flash": {
      const d = fx.d ?? 0.35;
      if (t < fx.at || t > fx.at + d) return null;
      const u = (t - fx.at) / d;
      return <AbsoluteFill style={{ backgroundColor: fx.c ?? "#fff", opacity: (fx.peak ?? 1) * (1 - u) * (1 - u) }} />;
    }
    case "tint":
      return <AbsoluteFill style={{ backgroundColor: fx.c, opacity: key(fx.op, t), mixBlendMode: fx.blend ?? "normal" }} />;
    case "black":
      return <AbsoluteFill style={{ backgroundColor: "#000", opacity: key(fx.op, t) }} />;
    case "fog": {
      const sp = fx.speed ?? 12;
      return (
        <AbsoluteFill style={{ opacity: fx.op ?? 0.18 }}>
          {[0, 1, 2].map((i) => {
            const x = (((t * sp * (1 + i * 0.4) + i * 600) % 2200) + 2200) % 2200 - 900;
            return <Img key={i} src={FOG[i]} style={{ position: "absolute", maxWidth: "none", left: x, top: (fx.y ?? 380) + i * 70 - 120, width: 1100, height: 560 }} />;
          })}
        </AbsoluteFill>
      );
    }
    case "police": {
      const ph = Math.floor(t * 3) % 2;
      return (
        <>
          <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 15% 80%, rgba(200,30,40,0.55), rgba(0,0,0,0))", opacity: ph ? 1 : 0.25 }} />
          <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 85% 80%, rgba(40,90,220,0.55), rgba(0,0,0,0))", opacity: ph ? 0.25 : 1 }} />
        </>
      );
    }
    case "heart": {
      if (fx.from !== undefined && t < fx.from) return null;
      const beat = (t * fx.bpm) / 60;
      const ph = beat - Math.floor(beat);
      const pulse = Math.exp(-ph * 9) + 0.6 * Math.exp(-Math.max(0, ph - 0.18) * 9) * (ph > 0.18 ? 1 : 0);
      return <AbsoluteFill style={{ background: "radial-gradient(70% 70% at 50% 50%, rgba(0,0,0,0) 40%, rgba(40,0,4,0.95) 100%)", opacity: (fx.a ?? 0.55) * Math.min(1, pulse) }} />;
    }
    case "muzzle": {
      const hit = fx.at.find((a) => t >= a && t < a + 0.09);
      return hit !== undefined ? <AbsoluteFill style={{ backgroundColor: "#fff6e0", opacity: 0.55 }} /> : null;
    }
    case "arc": {
      if (t < fx.from || t > fx.to) return null;
      return <AbsoluteFill style={{ backgroundColor: "#8ab8ff", opacity: hash(frame) > 0.5 ? 0.18 : 0.04 }} />;
    }
    default:
      return null;
  }
};

/* ---------------- film finish over everything ---------------- */

const GRAIN = staticFile("gacy/grain.png");
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  // grain refreshes at 12 fps: reads as film, costs half the bitrate
  const g = Math.floor(frame / 2);
  const x = Math.floor(hash(g) * 256);
  const y = Math.floor(hash(g + 1000) * 256);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={GRAIN} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
      <AbsoluteFill
        style={{
          // eslint-disable-next-line @remotion/no-background-image
          backgroundImage: `url(${GRAIN})`,
          backgroundRepeat: "repeat",
          backgroundPosition: `${x}px ${y}px`,
          opacity: 0.13,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(85% 78% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
