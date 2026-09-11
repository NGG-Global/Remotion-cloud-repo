/**
 * A double helix for the DNA beat: two backbone strands of small spheres,
 * base pairs as cylinder rungs, cold clinical light and a transparent canvas
 * so the caller's backdrop shows through.
 *
 * Pure function of props. `turn` spins the helix (0..1 = one full turn),
 * `build` assembles it from the bottom up, `doubt` pulls it apart again.
 */
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  Color,
  CylinderGeometry,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { clamp01, DOC, easeOut, hash } from "../theme";

export type DNAHelixProps = {
  /** Rotation progress, caller-driven from frame (0..1 = one full turn; values beyond 1 keep turning). */
  readonly turn: number;
  /** 0..1 how much of the helix has "assembled" (base pairs pop in from bottom to top). */
  readonly build?: number;
  /** 0..1 breaks the helix apart / glitches it (for the "not so simple" beat): pairs drift and fade. */
  readonly doubt?: number;
  readonly resolution?: number;
  /** Strand and rung colour. Default cold cyan-white, with the film's red on about one pair in seven. */
  readonly color?: string;
};

/** Base pairs along the helix. Under 150 meshes: 22 pairs x (2 beads + 1 rung + 2 backbone links). */
export const DNA_PAIRS = 22;
const RISE = 0.46;
const RADIUS = 2.0;
/** Radians of twist per pair: ten and a half pairs per turn, close to B-DNA. */
const TWIST = (Math.PI * 2) / 10.5;
const HEIGHT = (DNA_PAIRS - 1) * RISE;

const UP = new Vector3(0, 1, 0);
type V3 = readonly [number, number, number];
/** Quaternion turning the cylinder's +Y axis onto the segment a -> b. */
const alignTo = (a: V3, b: V3): Quaternion => {
  const dir = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  return new Quaternion().setFromUnitVectors(UP, dir);
};
const midOf = (a: V3, b: V3): [number, number, number] => [
  (a[0] + b[0]) / 2,
  (a[1] + b[1]) / 2,
  (a[2] + b[2]) / 2,
];
const lenOf = (a: V3, b: V3): number =>
  Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

const CameraRig: React.FC<{ readonly turn: number }> = ({ turn }) => {
  const camera = useThree((s) => s.camera);
  // A slow orbit and breathing height, a fraction of the helix's own spin.
  const a = turn * Math.PI * 2 * 0.18;
  const x = Math.sin(a) * 2.2;
  const y = 0.6 + Math.sin(a * 0.7) * 0.5;
  const z = 17 + Math.cos(a) * 0.6;
  useLayoutEffect(() => {
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 42;
      camera.updateProjectionMatrix();
    }
  }, [camera, x, y, z]);
  return null;
};

type Pair = {
  readonly i: number;
  readonly y: number;
  readonly angle: number;
  readonly red: boolean;
  /** Drift direction and spin used when doubt pulls the pair apart. */
  readonly dx: number;
  readonly dz: number;
  readonly dr: number;
};

const Scene: React.FC<Required<Omit<DNAHelixProps, "resolution">>> = ({
  turn,
  build,
  doubt,
  color,
}) => {
  const geo = useMemo(
    () => ({
      bead: new SphereGeometry(0.19, 14, 10),
      rung: new CylinderGeometry(0.055, 0.055, 1, 8),
      link: new CylinderGeometry(0.075, 0.075, 1, 6),
    }),
    [],
  );

  const mat = useMemo(() => {
    const base = new Color(color);
    const mk = (c: Color, emissive: number, opacity: number) =>
      new MeshStandardMaterial({
        color: c,
        emissive: c.clone().multiplyScalar(emissive),
        metalness: 0.25,
        roughness: 0.35,
        transparent: true,
        opacity,
      });
    return {
      strand: base,
      red: new Color(DOC.red),
      mk,
    };
  }, [color]);

  const pairs: Pair[] = useMemo(
    () =>
      Array.from({ length: DNA_PAIRS }, (_, i) => ({
        i,
        y: i * RISE - HEIGHT / 2,
        angle: i * TWIST,
        red: i % 7 === 3,
        dx: (hash(i * 3 + 1) - 0.5) * 2,
        dz: (hash(i * 3 + 2) - 0.5) * 2,
        dr: (hash(i * 3 + 3) - 0.5) * 2,
      })),
    [],
  );

  const b = clamp01(build);
  const d = clamp01(doubt);
  const spin = turn * Math.PI * 2;

  // Assembly: each pair pops in over a short window, bottom to top.
  const appear = (i: number) => easeOut(clamp01((b * (DNA_PAIRS + 3) - i) / 3));
  // Doubt: each pair leaves on its own schedule so the collapse is ragged.
  const undo = (i: number) => clamp01((d * 1.6 - hash(i * 7 + 11) * 0.6) / 1.0);

  const strandPos = (
    p: Pair,
    side: 1 | -1,
    drift: number,
  ): [number, number, number] => {
    const a = p.angle + (side === 1 ? 0 : Math.PI) + drift * p.dr * 1.4;
    const r = RADIUS + drift * 1.6;
    return [
      Math.cos(a) * r + drift * p.dx * 2.5,
      p.y + drift * p.dz * 1.5,
      Math.sin(a) * r,
    ];
  };

  return (
    <>
      <ambientLight color="#3a4658" intensity={0.35} />
      <directionalLight position={[-6, 8, 7]} color="#dfe9f4" intensity={2.2} />
      <pointLight
        position={[7, -3, -6]}
        color="#7fb6d6"
        intensity={38}
        distance={30}
        decay={2}
      />
      <pointLight
        position={[-4, 6, -8]}
        color="#9ab8d0"
        intensity={22}
        distance={30}
        decay={2}
      />

      <group rotation={[0, spin, 0.16]}>
        {pairs.map((p) => {
          const s = appear(p.i);
          if (s <= 0.001) return null;
          const u = undo(p.i);
          const drift = u * u;
          const fade = 1 - u * 0.95;
          const a = strandPos(p, 1, drift);
          const bpos = strandPos(p, -1, drift);
          const mid = midOf(a, bpos);
          const len = lenOf(a, bpos);
          const rungQ = alignTo(a, bpos);
          const rungColor = p.red ? mat.red : mat.strand;
          const rungMat = mat.mk(
            rungColor,
            p.red ? 0.35 : 0.08,
            fade * (0.9 - drift * 0.5),
          );
          const beadMat = mat.mk(mat.strand, 0.12, fade);
          const scale = s * (1 - drift * 0.35);

          // Backbone link to the next pair, per strand.
          const next = pairs[p.i + 1];
          const links =
            next && appear(next.i) > 0.5 && drift < 0.02
              ? ([1, -1] as const).map((side) => {
                  const from = strandPos(p, side, 0);
                  const to = strandPos(next, side, 0);
                  return (
                    <mesh
                      key={`l${side}`}
                      geometry={geo.link}
                      material={mat.mk(mat.strand, 0.05, 0.85 * appear(next.i))}
                      position={midOf(from, to)}
                      quaternion={alignTo(from, to)}
                      scale={[1, lenOf(from, to), 1]}
                    />
                  );
                })
              : null;

          return (
            <group key={p.i}>
              <mesh
                geometry={geo.bead}
                material={beadMat}
                position={a}
                scale={scale}
              />
              <mesh
                geometry={geo.bead}
                material={beadMat}
                position={bpos}
                scale={scale}
              />
              <mesh
                geometry={geo.rung}
                material={rungMat}
                position={mid}
                quaternion={rungQ}
                scale={[s, len * s, s]}
              />
              {links}
            </group>
          );
        })}
      </group>
      <CameraRig turn={turn} />
    </>
  );
};

export const DNAHelix: React.FC<DNAHelixProps> = ({
  turn,
  build = 1,
  doubt = 0,
  resolution = 0.5,
  color = "#b8d4e8",
}) => {
  const { width, height } = useVideoConfig();
  const r = Math.min(1, Math.max(0.1, resolution));
  const w = Math.round(width * r);
  const h = Math.round(height * r);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
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
          gl={{ alpha: true, antialias: true, premultipliedAlpha: true }}
          camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0.6, 17] }}
          style={{ background: "transparent" }}
        >
          <Scene turn={turn} build={build} doubt={doubt} color={color} />
        </ThreeCanvas>
      </div>
    </AbsoluteFill>
  );
};
