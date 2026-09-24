/**
 * Buck's Row, Whitechapel, 1888. A narrow street between two rows of
 * soot-dark terraces, wet cobbles, a handful of gas lamps and a fog that
 * swallows the far end.
 *
 * Everything in here is a pure function of props and useCurrentFrame(): the
 * camera, the lamp flicker, the walk cycles. Nothing accumulates between
 * frames, so frame 42 renders the same on any machine.
 *
 * Coordinates. The street runs along -Z. Street positions (walker, shape,
 * top-hat figure, constable) are given as 0..1 along STREET_LENGTH, so
 * `streetZ(s) = -s * STREET_LENGTH`. The camera dollies along its own shorter
 * track, `cameraZ(progress) = -progress * CAMERA_TRACK`, so at progress 1 it is
 * still well inside the street with buildings ahead of it. `aheadOf(progress,
 * d)` gives the street position d units in front of the camera.
 *
 * Software rendering (SwiftShader) is the target, so geometry is kept light:
 * shared unit geometries, shared materials, no shadows, seven lights in total.
 */
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";
import { clamp01, DOC, hash, mix } from "../theme";

export type Street3DProps = {
  /** Camera dolly along the street, 0..1, caller drives it from the frame. */
  readonly progress: number;
  /** Camera height/tilt: "eye" looks down the street, "low" is near the cobbles looking slightly down at the gutter. */
  readonly view?: "eye" | "low" | "high";
  /** Slow lateral drift/parallax, 0..1 */
  readonly drift?: number;
  /** A dark silhouetted figure walking down the street: its position along the street 0..1 (0 = near camera). null hides it. */
  readonly walker?: {
    readonly progress: number;
    readonly side?: -1 | 1;
  } | null;
  /** A second walker (the man who joins), same shape. */
  readonly walker2?: {
    readonly progress: number;
    readonly side?: -1 | 1;
  } | null;
  /** A dark covered shape lying by the wall (a body under what looks like tarpaulin), 0..1 opacity. Keep it abstract: a low dark mound, no anatomy. */
  readonly shape?: number;
  /** Position of the shape along the street 0..1 */
  readonly shapeAt?: number;
  /** A standing figure in top hat and long cloak at the far end of the street, 0..1 opacity. */
  readonly topHat?: number;
  /** Where the top-hat figure stands, 0..1 along the street. Default: 28 units ahead of the camera. */
  readonly topHatAt?: number;
  /** A constable with a bull's-eye lantern approaching, 0..1 progress along street; null hides. His lantern is a moving warm point light. */
  readonly constable?: { readonly progress: number } | null;
  /** Fog density 0..1 (three.js scene fog near/far). */
  readonly fog?: number;
  /** Render the WebGL canvas at this fraction of frame size and upscale with CSS (0.5 = 960x540). Default 0.5 for render speed. */
  readonly resolution?: number;
  /** Variation seed for building heights/window lights. */
  readonly seed?: number;
};

/** Length of the built street in world units. Street positions 0..1 map onto it. */
export const STREET_LENGTH = 90;
/** Length of the camera's dolly track. progress 1 leaves 40 units of street ahead of the lens. */
export const CAMERA_TRACK = 50;

export const streetZ = (s: number): number => -s * STREET_LENGTH;
export const cameraZ = (progress: number): number =>
  -clamp01(progress) * CAMERA_TRACK;
/** Street position (0..1) of a point `distance` units in front of the camera. */
export const aheadOf = (progress: number, distance: number): number =>
  (clamp01(progress) * CAMERA_TRACK + distance) / STREET_LENGTH;

/** Half the distance between the two building faces. */
const HALF_W = 3.6;
/** One terrace house is this deep along the street. */
const SEG = 6;
/** Height of the textured facade; parapets and chimneys vary the roofline above it. */
const FACADE_H = 8;
const LAMP_SPACING = 9;
const LAMP_COUNT = 11;
const LAMP_LIGHTS = 4;
const BUILDINGS = 20;

const INK = "#04050a";

// ---------------------------------------------------------------------------
// Procedural textures. Each is drawn once per component instance (useMemo).
// ---------------------------------------------------------------------------

const makeCanvas = (
  w: number,
  h: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) throw new Error("2D canvas context unavailable");
  return [c, g];
};

const toTexture = (c: HTMLCanvasElement): CanvasTexture => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
};

const rgb = (r: number, g: number, b: number): string =>
  `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;

/** Wet cobbles. 512px covers 3 world units, stones about 19cm, staggered courses. */
const cobbleTexture = (seed: number): CanvasTexture => {
  const S = 512;
  const [c, g] = makeCanvas(S, S);
  g.fillStyle = "#101219";
  g.fillRect(0, 0, S, S);
  const st = 32;
  const rows = S / st;
  for (let row = 0; row < rows; row++) {
    const off = row % 2 ? st / 2 : 0;
    for (let col = -1; col <= rows; col++) {
      const n = seed * 13 + row * 97 + col * 7;
      const v = hash(n);
      const wet = hash(n + 0.37) < 0.14;
      const x = col * st + off + 2;
      const y = row * st + 2;
      const w = st - 4;
      const h = st - 4;
      g.fillStyle = wet
        ? rgb(mix(38, 52, v), mix(44, 60, v), mix(58, 78, v))
        : rgb(mix(22, 42, v), mix(24, 45, v), mix(32, 58, v));
      g.beginPath();
      g.roundRect(x, y, w, h, 5);
      g.fill();
      // A sheen along the top edge: what a lamp catches on a wet stone.
      g.fillStyle = `rgba(170,185,205,${(0.1 + 0.2 * v).toFixed(3)})`;
      g.fillRect(x + 3, y + 1, w - 6, 3);
      // Shadow pooling at the bottom edge.
      g.fillStyle = "rgba(0,0,0,0.4)";
      g.fillRect(x + 2, y + h - 4, w - 4, 4);
    }
  }
  const t = toTexture(c);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  return t;
};

/** Window columns (local z) and rows (world y) shared by texture and lit planes. */
const WIN_COLS = [-1.9, 0, 1.9];
const WIN_ROWS = [1.6, 3.2, 4.7, 6.3];
const WIN_W = 0.72;
const WIN_H = 1.05;
const DOOR_W = 1.0;
const DOOR_H = 2.15;
const PX = 64; // pixels per world unit on the facade

const windowExists = (variant: number, row: number, col: number): boolean => {
  // Ground floor: the door takes the centre.
  if (row === 0 && col === 1) return false;
  return hash(variant * 31 + row * 7 + col * 3 + 0.5) > 0.14;
};

/** One terrace facade, 6 x 8 world units, brick courses, dark windows and a door. */
const facadeTexture = (variant: number, base: string): CanvasTexture => {
  const W = SEG * PX;
  const H = FACADE_H * PX;
  const [c, g] = makeCanvas(W, H);
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  // Brick courses: low-contrast, so the wall reads as texture not pattern.
  const bh = 8;
  const bw = 24;
  for (let y = 0; y < H; y += bh) {
    const stagger = (y / bh) % 2 ? -bw / 2 : 0;
    for (let x = stagger; x < W; x += bw) {
      const n = hash(variant * 1000 + y * 3.1 + x * 0.7);
      g.fillStyle =
        n > 0.5
          ? `rgba(255,220,190,${(0.02 + 0.06 * (n - 0.5)).toFixed(3)})`
          : `rgba(0,0,0,${(0.06 + 0.3 * (0.5 - n)).toFixed(3)})`;
      g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
    }
  }
  // Mortar lines.
  g.fillStyle = "rgba(0,0,0,0.35)";
  for (let y = 0; y < H; y += bh) g.fillRect(0, y, W, 1);

  // Soot at the top and grime at the pavement.
  const top = g.createLinearGradient(0, 0, 0, H * 0.35);
  top.addColorStop(0, "rgba(0,0,0,0.55)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = top;
  g.fillRect(0, 0, W, H * 0.35);
  const bottom = g.createLinearGradient(0, H, 0, H - 1.4 * PX);
  bottom.addColorStop(0, "rgba(0,0,0,0.5)");
  bottom.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = bottom;
  g.fillRect(0, H - 1.4 * PX, W, 1.4 * PX);
  // Damp patches.
  for (let i = 0; i < 5; i++) {
    const px = hash(variant * 7 + i * 3) * W;
    const py = hash(variant * 11 + i * 5) * H;
    const r = 40 + hash(variant + i) * 90;
    const rad = g.createRadialGradient(px, py, 0, px, py, r);
    rad.addColorStop(0, "rgba(0,0,0,0.28)");
    rad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rad;
    g.fillRect(px - r, py - r, r * 2, r * 2);
  }

  // Windows: dark glass, a stone sill, a lintel.
  WIN_ROWS.forEach((wy, row) => {
    WIN_COLS.forEach((wz, col) => {
      if (!windowExists(variant, row, col)) return;
      const cx = (SEG / 2 + wz) * PX;
      const cy = H - wy * PX;
      const w = WIN_W * PX;
      const h = WIN_H * PX;
      g.fillStyle = "#2b2622";
      g.fillRect(cx - w / 2 - 3, cy - h / 2 - 7, w + 6, 7);
      g.fillStyle = "#3a352e";
      g.fillRect(cx - w / 2 - 5, cy + h / 2, w + 10, 6);
      g.fillStyle = "#07080b";
      g.fillRect(cx - w / 2, cy - h / 2, w, h);
      // Sash bar and a hint of reflection.
      g.fillStyle = "rgba(60,58,54,0.9)";
      g.fillRect(cx - w / 2, cy - 1, w, 2);
      g.fillStyle = "rgba(120,130,150,0.08)";
      g.fillRect(cx - w / 2 + 3, cy - h / 2 + 3, w / 2 - 5, h / 2 - 6);
    });
  });

  // Door in the centre bay.
  const dx = (SEG / 2) * PX;
  g.fillStyle = "#2a2622";
  g.fillRect(
    dx - (DOOR_W * PX) / 2 - 5,
    H - DOOR_H * PX - 8,
    DOOR_W * PX + 10,
    8,
  );
  g.fillStyle = "#06070a";
  g.fillRect(dx - (DOOR_W * PX) / 2, H - DOOR_H * PX, DOOR_W * PX, DOOR_H * PX);
  g.fillStyle = "#1c1916";
  g.fillRect(dx - (DOOR_W * PX) / 2, H - 6, DOOR_W * PX, 6);

  return toTexture(c);
};

// ---------------------------------------------------------------------------
// Silhouettes. 128x256 canvases, figure drawn in near-black; the lantern on the
// constable is the only thing drawn in colour.
// ---------------------------------------------------------------------------

type FigureKind = "walker" | "constable" | "topHat";

const drawLegs = (g: CanvasRenderingContext2D, hipY: number, phase: number) => {
  g.strokeStyle = INK;
  g.lineWidth = 15;
  g.lineCap = "round";
  const spread = 20 * phase;
  g.beginPath();
  g.moveTo(56, hipY);
  g.lineTo(58 - spread, 248);
  g.moveTo(72, hipY);
  g.lineTo(70 + spread, 248);
  g.stroke();
  // Boots.
  g.fillStyle = INK;
  g.fillRect(48 - spread, 240, 22, 10);
  g.fillRect(60 + spread, 240, 22, 10);
};

/** phase -1..1 swings the legs; used for the 3-frame walk cycle. */
const figureTexture = (kind: FigureKind, phase: number): CanvasTexture => {
  const [c, g] = makeCanvas(128, 256);
  g.clearRect(0, 0, 128, 256);
  g.fillStyle = INK;

  if (kind === "topHat") {
    // Head and stovepipe hat.
    g.beginPath();
    g.arc(64, 66, 13, 0, Math.PI * 2);
    g.fill();
    g.fillRect(49, 14, 30, 44);
    g.fillRect(38, 54, 52, 7);
    // A wide cloak falling to the ground, shoulders squared.
    g.beginPath();
    g.moveTo(36, 86);
    g.lineTo(92, 86);
    g.quadraticCurveTo(102, 120, 116, 250);
    g.lineTo(12, 250);
    g.quadraticCurveTo(26, 120, 36, 86);
    g.fill();
    // Neck.
    g.fillRect(58, 74, 12, 14);
    return toTexture(c);
  }

  drawLegs(g, 158, phase);

  if (kind === "walker") {
    // Head and flat cap with a peak.
    g.beginPath();
    g.arc(64, 54, 13, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(64, 44, 18, 7, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(64, 44, 26, 4);
    g.fillRect(59, 62, 10, 14);
    // Long coat, slightly flared.
    g.beginPath();
    g.moveTo(42, 78);
    g.lineTo(86, 78);
    g.lineTo(98, 172);
    g.lineTo(30, 172);
    g.closePath();
    g.fill();
    // Arms swinging against the legs.
    g.strokeStyle = INK;
    g.lineWidth = 11;
    g.beginPath();
    g.moveTo(44, 88);
    g.lineTo(38 + 8 * phase, 150);
    g.moveTo(84, 88);
    g.lineTo(90 - 8 * phase, 150);
    g.stroke();
    return toTexture(c);
  }

  // Constable: custodian helmet, cape, one arm out with the bull's-eye lantern.
  g.beginPath();
  g.arc(64, 66, 13, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(64, 50, 20, 30, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(64, 70, 25, 5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(60, 18, 8, 8);
  g.fillRect(58, 76, 12, 14);
  g.beginPath();
  g.moveTo(36, 90);
  g.lineTo(92, 90);
  g.lineTo(104, 180);
  g.lineTo(24, 180);
  g.closePath();
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 11;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(88, 100);
  g.lineTo(110, 132);
  g.stroke();
  // Lantern body and its warm glass.
  g.fillStyle = INK;
  g.fillRect(101, 132, 20, 24);
  g.fillStyle = DOC.gasHot;
  g.fillRect(104, 137, 14, 15);
  g.fillStyle = "rgba(255,240,200,0.9)";
  g.fillRect(108, 141, 6, 7);
  return toTexture(c);
};

/** Soft radial glow for the gas lamps, drawn additively. */
const haloTexture = (): CanvasTexture => {
  const S = 128;
  const [c, g] = makeCanvas(S, S);
  g.clearRect(0, 0, S, S);
  const rad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  rad.addColorStop(0, "rgba(255,230,190,0.7)");
  rad.addColorStop(0.12, "rgba(255,215,150,0.5)");
  rad.addColorStop(0.35, "rgba(255,200,120,0.2)");
  rad.addColorStop(0.7, "rgba(255,190,110,0.05)");
  rad.addColorStop(1, "rgba(255,190,110,0)");
  g.fillStyle = rad;
  g.fillRect(0, 0, S, S);
  return toTexture(c);
};

/** A low mound under sacking by the wall. Deliberately shapeless. */
const moundTexture = (): CanvasTexture => {
  const [c, g] = makeCanvas(256, 128);
  g.clearRect(0, 0, 256, 128);
  const body = g.createLinearGradient(0, 56, 0, 124);
  body.addColorStop(0, "rgba(30,34,44,1)");
  body.addColorStop(0.4, "rgba(14,16,22,1)");
  body.addColorStop(1, INK);
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(6, 124);
  g.quadraticCurveTo(24, 104, 52, 98);
  g.quadraticCurveTo(70, 92, 84, 78);
  g.quadraticCurveTo(100, 62, 122, 68);
  g.quadraticCurveTo(140, 74, 152, 84);
  g.quadraticCurveTo(178, 80, 198, 90);
  g.quadraticCurveTo(222, 100, 238, 112);
  g.quadraticCurveTo(248, 118, 250, 124);
  g.closePath();
  g.fill();
  // The fog's light catches the ridge of the wet cloth, unevenly.
  g.strokeStyle = "rgba(120,130,150,0.22)";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(60, 98);
  g.quadraticCurveTo(76, 90, 88, 78);
  g.quadraticCurveTo(102, 64, 122, 70);
  g.moveTo(160, 86);
  g.quadraticCurveTo(190, 84, 214, 98);
  g.stroke();
  // Folds in the cloth, barely lighter.
  g.strokeStyle = "rgba(90,96,110,0.35)";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(80, 92);
  g.quadraticCurveTo(100, 104, 96, 122);
  g.moveTo(150, 72);
  g.quadraticCurveTo(168, 92, 160, 122);
  g.moveTo(200, 88);
  g.quadraticCurveTo(212, 100, 206, 122);
  g.stroke();
  return toTexture(c);
};

// ---------------------------------------------------------------------------
// Scene pieces
// ---------------------------------------------------------------------------

type CamState = {
  readonly pos: readonly [number, number, number];
  readonly look: readonly [number, number, number];
  readonly fov: number;
};

/** Pins the camera to the props every render. Nothing here accumulates. */
const CameraRig: React.FC<{ readonly cam: CamState }> = ({ cam }) => {
  const camera = useThree((s) => s.camera);
  const [px, py, pz] = cam.pos;
  const [lx, ly, lz] = cam.look;
  useLayoutEffect(() => {
    camera.position.set(px, py, pz);
    camera.lookAt(lx, ly, lz);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, px, py, pz, lx, ly, lz, cam.fov]);
  return null;
};

type BillboardProps = {
  readonly tex: Texture;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
  readonly h: number;
  readonly opacity: number;
  readonly camX: number;
  readonly camZ: number;
  readonly geometry: PlaneGeometry;
};

/** A flat silhouette turned to face the camera. */
const Billboard: React.FC<BillboardProps> = ({
  tex,
  x,
  y,
  z,
  w,
  h,
  opacity,
  camX,
  camZ,
  geometry,
}) => {
  if (opacity <= 0.002) return null;
  const yaw = Math.atan2(camX - x, camZ - z);
  return (
    <mesh
      geometry={geometry}
      position={[x, y, z]}
      rotation={[0, yaw, 0]}
      scale={[w, h, 1]}
    >
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={opacity}
        alphaTest={0.05}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
};

const LAMP_Z = Array.from(
  { length: LAMP_COUNT },
  (_, i) => -4 - i * LAMP_SPACING,
);
const lampSide = (i: number): number => (i % 2 ? 1 : -1);
const lampX = (i: number): number => lampSide(i) * (HALF_W - 0.55);

const Scene: React.FC<
  Required<Omit<Street3DProps, "resolution" | "topHatAt">> & {
    readonly topHatAt: number | undefined;
  }
> = ({
  progress,
  view,
  drift,
  walker,
  walker2,
  shape,
  shapeAt,
  topHat,
  topHatAt,
  constable,
  fog,
  seed,
}) => {
  const frame = useCurrentFrame();

  // Shared geometry and materials: one of each, scaled per mesh.
  const geo = useMemo(
    () => ({
      box: new BoxGeometry(1, 1, 1),
      plane: new PlaneGeometry(1, 1),
      post: new CylinderGeometry(0.045, 0.07, 1, 8),
    }),
    [],
  );

  const tex = useMemo(
    () => ({
      cobbles: cobbleTexture(seed),
      facades: [
        facadeTexture(0, "#1d1a19"),
        facadeTexture(1, "#241f1c"),
        facadeTexture(2, "#2a231f"),
      ],
      walker: [
        figureTexture("walker", -1),
        figureTexture("walker", 0),
        figureTexture("walker", 1),
      ],
      constable: [
        figureTexture("constable", -1),
        figureTexture("constable", 0),
        figureTexture("constable", 1),
      ],
      topHat: figureTexture("topHat", 0),
      mound: moundTexture(),
      halo: haloTexture(),
    }),
    [seed],
  );

  const mat = useMemo(() => {
    const cob = tex.cobbles;
    cob.repeat.set(4, 48);
    return {
      // A whisper of emissive keeps the unlit cobbles off pure black: grain needs something to sit on.
      ground: new MeshStandardMaterial({
        map: cob,
        color: "#c8ccd4",
        metalness: 0.3,
        roughness: 0.5,
        emissive: "#0a0b10",
      }),
      kerb: new MeshLambertMaterial({ color: "#15161b", emissive: "#06070a" }),
      facades: tex.facades.map((t) => new MeshLambertMaterial({ map: t })),
      attic: new MeshLambertMaterial({ color: "#1a1715" }),
      chimney: new MeshLambertMaterial({ color: "#161311" }),
      door: new MeshLambertMaterial({ color: "#07080a" }),
      gatePost: new MeshLambertMaterial({ color: "#2c2823" }),
      gateVoid: new MeshLambertMaterial({ color: "#050507" }),
      post: new MeshLambertMaterial({ color: "#14151a" }),
      head: new MeshLambertMaterial({ color: "#0d0e12" }),
      farWall: new MeshLambertMaterial({ color: "#15161b" }),
    };
  }, [tex]);

  // Camera.
  const camZ = cameraZ(progress);
  const dx = (clamp01(drift) - 0.5) * 1.6;
  const cam: CamState = useMemo(() => {
    if (view === "low") {
      return {
        pos: [dx, 0.55, camZ],
        look: [dx * 0.3 - 1.1, 0.1, camZ - 7],
        fov: 50,
      };
    }
    if (view === "high") {
      return {
        pos: [dx, 4.6, camZ],
        look: [dx * 0.5, 0.9, camZ - 22],
        fov: 44,
      };
    }
    return { pos: [dx, 1.65, camZ], look: [dx * 0.4, 1.3, camZ - 30], fov: 46 };
  }, [view, dx, camZ]);

  // Fog. Denser fog is a touch lighter: it is lit from within by the lamps.
  const fogT = clamp01(fog);
  const fogColor = useMemo(
    () => new Color("#11151c").lerp(new Color("#2a3140"), fogT),
    [fogT],
  );
  const fogNear = mix(14, 3, fogT);
  const fogFar = mix(75, 30, fogT);

  // Which lamps get a real light: the nearest few ahead of the camera.
  const litLamps = useMemo(() => {
    const ahead = LAMP_Z.map((z, i) => ({ z, i })).filter(
      (l) => l.z < camZ + 1.5,
    );
    ahead.sort((a, b) => b.z - a.z);
    const chosen = ahead.slice(0, LAMP_LIGHTS);
    while (chosen.length < LAMP_LIGHTS)
      chosen.push(chosen[chosen.length - 1] ?? { z: LAMP_Z[0], i: 0 });
    return chosen;
  }, [camZ]);

  const flicker = (i: number): number =>
    1 +
    0.07 * Math.sin(frame * 0.29 + i * 1.7) +
    0.05 * Math.sin(frame * 0.71 + i) +
    0.05 * (hash(frame * 3 + i * 131) - 0.5);

  // Walk cycle: 3 textures over a 4-step loop, a step every 5 frames.
  const cycle = [0, 1, 2, 1];
  const walkIdx = (offset: number) =>
    cycle[(Math.floor(frame / 5) + offset) % 4];
  const bob = (offset: number) =>
    0.025 * Math.sin((frame + offset * 5) * (Math.PI / 5));

  // The gate the body lies by. Kept clear of a lamp so it sits in half-light.
  const gateZ = streetZ(shapeAt);
  const gateX = -HALF_W;

  const walkerAt = (
    w: { readonly progress: number; readonly side?: -1 | 1 } | null,
    offset: number,
    key: string,
  ) => {
    if (!w) return null;
    const z = streetZ(w.progress);
    if (z > camZ - 1.5) return null;
    const side = w.side ?? -1;
    return (
      <Billboard
        key={key}
        geometry={geo.plane}
        tex={tex.walker[walkIdx(offset)]}
        x={side * 1.7}
        y={0.9 + bob(offset)}
        z={z}
        w={0.95}
        h={1.9}
        opacity={1}
        camX={cam.pos[0]}
        camZ={camZ}
      />
    );
  };

  const constZ = constable ? streetZ(constable.progress) : null;
  const constVisible = constZ !== null && constZ < camZ - 1.2;
  const constX = 0.9;
  const lanternPos: [number, number, number] = constVisible
    ? [constX + 0.45, 1.15, (constZ ?? 0) + 0.3]
    : [0, -50, 0];
  const lanternFlick =
    1 + 0.08 * Math.sin(frame * 0.9) + 0.06 * (hash(frame * 7 + 5) - 0.5);

  const topHatZ = topHatAt === undefined ? camZ - 28 : streetZ(topHatAt);

  const glassColor = (i: number) =>
    new Color(DOC.gasHot).multiplyScalar(0.3 * flicker(i));

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <CameraRig cam={cam} />

      <ambientLight color="#3a4658" intensity={1.7} />
      <hemisphereLight color="#4a5870" groundColor="#10121a" intensity={1.0} />

      {litLamps.map((l, k) => (
        <pointLight
          key={k}
          position={[lampX(l.i) - lampSide(l.i) * 0.25, 3.05, l.z]}
          color={DOC.gas}
          intensity={26 * flicker(l.i)}
          distance={17}
          decay={2}
        />
      ))}
      <pointLight
        position={lanternPos}
        color={DOC.gasHot}
        intensity={constVisible ? 9 * lanternFlick : 0}
        distance={11}
        decay={2}
      />

      {/* Ground and kerbs */}
      <mesh
        geometry={geo.plane}
        material={mat.ground}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -STREET_LENGTH / 2 - 10]}
        scale={[12, 150, 1]}
      />
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          geometry={geo.box}
          material={mat.kerb}
          position={[s * 3.05, 0.07, -STREET_LENGTH / 2 - 10]}
          scale={[0.55, 0.14, 150]}
        />
      ))}

      {/* Terraces */}
      {[-1, 1].map((s) =>
        Array.from({ length: BUILDINGS }, (_, i) => {
          const zc = 8 - SEG / 2 - i * SEG;
          const n = seed * 7 + i * 3 + (s + 1) * 50;
          const variant = Math.floor(hash(n) * 3) % 3;
          const attic = hash(n + 1) * 2.8;
          const hasChimney = hash(n + 2) > 0.45;
          const chimneyZ = zc + (hash(n + 3) - 0.5) * 3.5;
          const faceX = s * (HALF_W - 0.03);
          return (
            <group key={`${s}-${i}`}>
              <mesh
                geometry={geo.box}
                material={mat.facades[variant]}
                position={[s * (HALF_W + 3), FACADE_H / 2, zc]}
                scale={[6, FACADE_H, SEG]}
              />
              {attic > 0.35 && (
                <mesh
                  geometry={geo.box}
                  material={mat.attic}
                  position={[s * (HALF_W + 3 + 0.15), FACADE_H + attic / 2, zc]}
                  scale={[6, attic, SEG - 0.05]}
                />
              )}
              {hasChimney && (
                <mesh
                  geometry={geo.box}
                  material={mat.chimney}
                  position={[
                    s * (HALF_W + 1.6),
                    FACADE_H + attic + 0.6,
                    chimneyZ,
                  ]}
                  scale={[0.55, 1.3, 0.5]}
                />
              )}
              {/* Door recess */}
              <mesh
                geometry={geo.box}
                material={mat.door}
                position={[s * (HALF_W - 0.02), DOOR_H / 2, zc]}
                scale={[0.14, DOOR_H, DOOR_W]}
              />
              {/* Lit windows, a sparse handful */}
              {WIN_ROWS.map((wy, row) =>
                WIN_COLS.map((wz, col) => {
                  if (!windowExists(variant, row, col)) return null;
                  const wn = hash(n + row * 13 + col * 29 + 7);
                  if (wn > 0.085) return null;
                  const flick =
                    hash(n + row + col) < 0.35
                      ? 0.75 + 0.25 * flicker(i * 3 + row + col)
                      : 1;
                  const warmth = hash(n + row * 3 + col);
                  const c = new Color(DOC.gas)
                    .lerp(new Color(DOC.gasHot), warmth)
                    .multiplyScalar((0.02 + 0.05 * warmth) * flick);
                  return (
                    <mesh
                      key={`${row}-${col}`}
                      geometry={geo.plane}
                      position={[faceX, wy, zc + wz]}
                      rotation={[0, -s * (Math.PI / 2), 0]}
                      scale={[WIN_W - 0.14, WIN_H - 0.14, 1]}
                    >
                      <meshBasicMaterial color={c} />
                    </mesh>
                  );
                }),
              )}
            </group>
          );
        }),
      )}

      {/* The street closes off in the fog */}
      <mesh
        geometry={geo.box}
        material={mat.farWall}
        position={[0, 6, -STREET_LENGTH - 16]}
        scale={[24, 12, 4]}
      />

      {/* Gateway on the left, where the shape lies */}
      <mesh
        geometry={geo.box}
        material={mat.gateVoid}
        position={[gateX + 0.02, 1.45, gateZ]}
        scale={[0.2, 2.9, 2.3]}
      />
      <mesh
        geometry={geo.box}
        material={mat.gatePost}
        position={[gateX + 0.1, 1.55, gateZ - 1.3]}
        scale={[0.32, 3.1, 0.36]}
      />
      <mesh
        geometry={geo.box}
        material={mat.gatePost}
        position={[gateX + 0.1, 1.55, gateZ + 1.3]}
        scale={[0.32, 3.1, 0.36]}
      />
      <mesh
        geometry={geo.box}
        material={mat.gatePost}
        position={[gateX + 0.1, 3.2, gateZ]}
        scale={[0.36, 0.3, 3.0]}
      />

      {/* Gas lamps */}
      {LAMP_Z.map((z, i) => (
        <group key={i} position={[lampX(i), 0, z]}>
          <mesh
            geometry={geo.post}
            material={mat.post}
            position={[0, 1.45, 0]}
            scale={[1, 2.9, 1]}
          />
          <mesh
            geometry={geo.box}
            position={[0, 3.1, 0]}
            scale={[0.26, 0.34, 0.26]}
          >
            <meshBasicMaterial color={glassColor(i)} />
          </mesh>
          <mesh
            geometry={geo.box}
            material={mat.head}
            position={[0, 3.32, 0]}
            scale={[0.44, 0.1, 0.44]}
          />
          <mesh
            geometry={geo.box}
            material={mat.head}
            position={[0, 2.9, 0]}
            scale={[0.3, 0.06, 0.3]}
          />
        </group>
      ))}
      {LAMP_Z.map((z, i) => {
        const dist = camZ - z;
        if (dist < 0.5) return null;
        const fade = clamp01(1 - (dist - fogNear * 0.5) / (fogFar * 0.9));
        const strength = Math.min(
          1,
          fade * fade * (0.75 + 0.45 * fogT) * flicker(i),
        );
        if (strength < 0.01) return null;
        const yaw = Math.atan2(cam.pos[0] - lampX(i), camZ - z);
        const size = 2.8 + 2.0 * fogT;
        const toCam = Math.hypot(cam.pos[0] - lampX(i), dist);
        const ox = ((cam.pos[0] - lampX(i)) / toCam) * 0.5;
        const oz = (dist / toCam) * 0.5;
        return (
          <mesh
            key={`halo-${i}`}
            geometry={geo.plane}
            position={[lampX(i) + ox, 3.1, z + oz]}
            rotation={[0, yaw, 0]}
            scale={[size, size, 1]}
          >
            <meshBasicMaterial
              map={tex.halo}
              color={DOC.gasHot}
              transparent
              opacity={strength}
              blending={AdditiveBlending}
              depthWrite={false}
              fog={false}
            />
          </mesh>
        );
      })}

      {/* Figures */}
      {walkerAt(walker, 0, "w1")}
      {walkerAt(walker2, 2, "w2")}

      <Billboard
        geometry={geo.plane}
        tex={tex.mound}
        x={gateX + 0.75}
        y={0.28}
        z={gateZ + 0.2}
        w={1.9}
        h={0.95}
        opacity={clamp01(shape)}
        camX={cam.pos[0]}
        camZ={camZ}
      />

      {topHatZ < camZ - 2 && (
        <Billboard
          geometry={geo.plane}
          tex={tex.topHat}
          x={-0.9}
          y={1.05}
          z={topHatZ}
          w={1.05}
          h={2.1}
          opacity={clamp01(topHat)}
          camX={cam.pos[0]}
          camZ={camZ}
        />
      )}

      {constVisible && constZ !== null && (
        <>
          <Billboard
            geometry={geo.plane}
            tex={tex.constable[walkIdx(1)]}
            x={constX}
            y={0.95 + bob(1)}
            z={constZ}
            w={1.0}
            h={2.0}
            opacity={1}
            camX={cam.pos[0]}
            camZ={camZ}
          />
          {/* The bull's-eye: a hard core and a wide scatter in the fog, thrown toward the camera */}
          {[
            { size: 1.1, op: 0.95, off: 0.3 },
            { size: 4.5, op: 0.28 + 0.25 * fogT, off: 0.6 },
          ].map((hl, k) => {
            const yaw = Math.atan2(
              cam.pos[0] - lanternPos[0],
              camZ - lanternPos[2],
            );
            return (
              <mesh
                key={k}
                geometry={geo.plane}
                position={[
                  lanternPos[0],
                  lanternPos[1],
                  lanternPos[2] + hl.off,
                ]}
                rotation={[0, yaw, 0]}
                scale={[hl.size, hl.size, 1]}
              >
                <meshBasicMaterial
                  map={tex.halo}
                  color={DOC.gasHot}
                  transparent
                  opacity={hl.op * lanternFlick}
                  blending={AdditiveBlending}
                  depthWrite={false}
                  fog={false}
                />
              </mesh>
            );
          })}
        </>
      )}
    </>
  );
};

export const Street3D: React.FC<Street3DProps> = ({
  progress,
  view = "eye",
  drift = 0.5,
  walker = null,
  walker2 = null,
  shape = 0,
  shapeAt = 0.5,
  topHat = 0,
  topHatAt,
  constable = null,
  fog = 0.6,
  resolution = 0.5,
  seed = 1,
}) => {
  const { width, height } = useVideoConfig();
  const r = Math.min(1, Math.max(0.1, resolution));
  const w = Math.round(width * r);
  const h = Math.round(height * r);

  return (
    <AbsoluteFill style={{ backgroundColor: DOC.black, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: h,
          transform: `scale(${width / w}, ${height / h})`,
          transformOrigin: "top left",
        }}
      >
        <ThreeCanvas
          width={w}
          height={h}
          dpr={1}
          gl={{ antialias: true }}
          camera={{ fov: 46, near: 0.1, far: 240, position: [0, 1.65, 0] }}
        >
          <Scene
            progress={progress}
            view={view}
            drift={drift}
            walker={walker}
            walker2={walker2}
            shape={shape}
            shapeAt={shapeAt}
            topHat={topHat}
            topHatAt={topHatAt}
            constable={constable}
            fog={fog}
            seed={seed}
          />
        </ThreeCanvas>
      </div>
    </AbsoluteFill>
  );
};
