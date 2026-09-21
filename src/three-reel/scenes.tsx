import { noise3D } from "@remotion/noise";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Color,
  IcosahedronGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
} from "three";
import { clamp, REEL } from "../showreel/theme";

export const Ground: React.FC = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.15, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#0b0d14" metalness={0.2} roughness={0.9} />
    </mesh>
    <gridHelper
      args={[28, 28, "#1d2a3d", "#121722"]}
      position={[0, -2.14, 0]}
    />
  </>
);

export const HeroKnot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 90 },
  });
  return (
    <mesh scale={enter * 1.15} rotation={[frame * 0.012, frame * 0.021, 0.35]}>
      <torusKnotGeometry args={[1.15, 0.34, 160, 24]} />
      <meshStandardMaterial
        color={REEL.blue}
        metalness={0.62}
        roughness={0.22}
      />
    </mesh>
  );
};

const PRIMITIVES = [
  { kind: "box" as const, color: REEL.blue },
  { kind: "sphere" as const, color: REEL.blueSoft },
  { kind: "cylinder" as const, color: "#5b8def" },
  { kind: "cone" as const, color: REEL.orange },
  { kind: "torus" as const, color: REEL.ink },
  { kind: "octa" as const, color: REEL.blue },
  { kind: "knot" as const, color: REEL.orange },
];

const PrimitiveMesh: React.FC<{
  readonly kind: (typeof PRIMITIVES)[number]["kind"];
  readonly color: string;
}> = ({ kind, color }) => {
  switch (kind) {
    case "box":
      return (
        <>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshStandardMaterial
            color={color}
            metalness={0.35}
            roughness={0.4}
          />
        </>
      );
    case "sphere":
      return (
        <>
          <sphereGeometry args={[0.68, 32, 24]} />
          <meshStandardMaterial
            color={color}
            metalness={0.15}
            roughness={0.35}
          />
        </>
      );
    case "cylinder":
      return (
        <>
          <cylinderGeometry args={[0.48, 0.48, 1.15, 28]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
        </>
      );
    case "cone":
      return (
        <>
          <coneGeometry args={[0.62, 1.2, 28]} />
          <meshStandardMaterial
            color={color}
            metalness={0.25}
            roughness={0.45}
          />
        </>
      );
    case "torus":
      return (
        <>
          <torusGeometry args={[0.5, 0.18, 16, 48]} />
          <meshStandardMaterial
            color={color}
            metalness={0.5}
            roughness={0.28}
          />
        </>
      );
    case "octa":
      return (
        <>
          <octahedronGeometry args={[0.72, 0]} />
          <meshStandardMaterial
            color={color}
            metalness={0.45}
            roughness={0.3}
          />
        </>
      );
    case "knot":
      return (
        <>
          <torusKnotGeometry args={[0.42, 0.14, 80, 12]} />
          <meshStandardMaterial
            color={color}
            metalness={0.55}
            roughness={0.25}
          />
        </>
      );
    default:
      return null;
  }
};

export const PrimitiveRow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <group position={[0, 0.15, 0]}>
      {PRIMITIVES.map((item, i) => {
        const p = spring({
          frame: frame - i * 4,
          fps,
          config: { damping: 14, stiffness: 110 },
        });
        const x = (i - (PRIMITIVES.length - 1) / 2) * 1.55;
        return (
          <mesh
            key={item.kind}
            position={[x, (1 - p) * 1.4, 0]}
            rotation={[frame * 0.01, frame * 0.018 + i * 0.4, 0.15]}
            scale={0.35 + p * 0.65}
          >
            <PrimitiveMesh kind={item.kind} color={item.color} />
          </mesh>
        );
      })}
    </group>
  );
};

export const MaterialLine: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 9), [-1, 1], [0.35, 1.4]);
  const hue = interpolate(frame, [0, 180], [0, 1], clamp);
  const color = useMemo(() => {
    const c = new Color();
    c.setHSL(0.58 + hue * 0.08, 0.85, 0.52);
    return c;
  }, [hue]);

  return (
    <group position={[0, 0.2, 0]}>
      <mesh position={[-2.7, 0, 0]} rotation={[0, frame * 0.02, 0]}>
        <sphereGeometry args={[0.85, 48, 32]} />
        <meshStandardMaterial
          color={REEL.blue}
          metalness={0.95}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[-0.9, 0, 0]} rotation={[0, frame * 0.02, 0]}>
        <sphereGeometry args={[0.85, 48, 32]} />
        <meshLambertMaterial color="#8b93a7" />
      </mesh>
      <mesh position={[0.9, 0, 0]} rotation={[0, frame * 0.02, 0]}>
        <sphereGeometry args={[0.85, 32, 20]} />
        <meshStandardMaterial
          color={REEL.ink}
          wireframe
          emissive={REEL.blue}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[2.7, 0, 0]} rotation={[0, frame * 0.02, 0]}>
        <sphereGeometry args={[0.85, 48, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={REEL.orange}
          emissiveIntensity={pulse * 0.55}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

export const LightSubject: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <mesh rotation={[0.4, frame * 0.018, 0.2]}>
      <torusKnotGeometry args={[1.05, 0.28, 140, 20]} />
      <meshStandardMaterial color="#e8edf7" metalness={0.7} roughness={0.18} />
    </mesh>
  );
};

export const CameraSubject: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <group rotation={[0, frame * 0.004, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial
          color={REEL.blue}
          metalness={0.5}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[2.4, 0.3, 0]} rotation={[0.5, frame * 0.03, 0]}>
        <torusGeometry args={[0.55, 0.16, 16, 48]} />
        <meshStandardMaterial
          color={REEL.orange}
          metalness={0.25}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[-2.1, 0.85, 0.3]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial
          color={REEL.ink}
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

export const SolarSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const sun = frame * 0.01;
  const planet = frame * 0.028;
  const moon = frame * 0.08;
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.7, 32, 24]} />
        <meshStandardMaterial
          color="#fd9a3d"
          emissive="#fd511d"
          emissiveIntensity={0.85}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.35, 0.012, 8, 80]} />
        <meshBasicMaterial color="#1d2a3d" />
      </mesh>
      <group rotation={[0.2, planet, 0]}>
        <mesh position={[2.35, 0, 0]} rotation={[0, sun, 0.4]}>
          <sphereGeometry args={[0.38, 24, 18]} />
          <meshStandardMaterial
            color={REEL.blue}
            metalness={0.35}
            roughness={0.45}
          />
        </mesh>
        <group position={[2.35, 0, 0]} rotation={[0.5, moon, 0]}>
          <mesh position={[0.72, 0.1, 0]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshStandardMaterial color="#c5cddb" roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const FIELD = 6;

export const InstanceField: React.FC = () => {
  const frame = useCurrentFrame();
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => new IcosahedronGeometry(0.5, 0), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: REEL.blue,
        metalness: 0.45,
        roughness: 0.32,
      }),
    [],
  );

  useLayoutEffect(() => {
    const node = mesh.current;
    if (!node) {
      return;
    }
    let i = 0;
    const mid = (FIELD - 1) / 2;
    for (let x = 0; x < FIELD; x++) {
      for (let y = 0; y < FIELD; y++) {
        for (let z = 0; z < FIELD; z++) {
          const n = noise3D("field", x / 3.2, y / 3.2, z / 3.2 + frame / 48);
          dummy.position.set(
            (x - mid) * 0.72,
            (y - mid) * 0.72,
            (z - mid) * 0.72,
          );
          dummy.scale.setScalar(0.28 + (n + 1) * 0.16);
          dummy.rotation.set(n * 0.6, frame * 0.012 + n, n * 0.4);
          dummy.updateMatrix();
          node.setMatrixAt(i, dummy.matrix);
          i += 1;
        }
      }
    }
    node.instanceMatrix.needsUpdate = true;
  }, [dummy, frame]);

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, FIELD * FIELD * FIELD]}
    />
  );
};

const VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPos;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPos;
void main() {
  float bands = sin(vPos.y * 7.0 + uTime * 2.2);
  vec3 cool = vec3(0.043, 0.518, 0.953);
  vec3 warm = vec3(0.992, 0.318, 0.114);
  vec3 color = mix(cool, warm, bands * 0.5 + 0.5);
  float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
  gl_FragColor = vec4(color + rim * 0.25, 1.0);
}
`;

export const ShaderOrb: React.FC = () => {
  const frame = useCurrentFrame();
  const material = useRef<ShaderMaterial>(null);
  useLayoutEffect(() => {
    if (material.current) {
      material.current.uniforms.uTime.value = frame * 0.05;
    }
  }, [frame]);
  return (
    <mesh rotation={[frame * 0.008, frame * 0.016, 0.2]}>
      <icosahedronGeometry args={[1.55, 3]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  );
};
