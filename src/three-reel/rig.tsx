import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  BackSide,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { clamp } from "../showreel/theme";

export type CameraBeat = {
  readonly at: number;
  readonly pos: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly orbit?: number;
  readonly dolly?: number;
};

const mix = (
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const CameraRig: React.FC<{
  readonly beats: readonly CameraBeat[];
}> = ({ beats }) => {
  const frame = useCurrentFrame();
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    const current =
      [...beats].reverse().find((beat) => frame >= beat.at) ?? beats[0];
    const index = beats.indexOf(current);
    const next = beats[index + 1] ?? current;
    const blendStart = next.at - 22;
    const t =
      next === current
        ? 0
        : interpolate(frame, [blendStart, next.at], [0, 1], {
            ...clamp,
            easing: (n) => n * n * (3 - 2 * n),
          });
    const pos = mix(current.pos, next.pos, t);
    const target = mix(current.target, next.target, t);
    const nextAt = next === current ? current.at + 1 : next.at;
    const localT = interpolate(frame, [current.at, nextAt], [0, 1], clamp);
    const orbit = (current.orbit ?? 0) * localT;
    const radius =
      Math.hypot(pos[0] - target[0], pos[2] - target[2]) *
      (1 - localT * (current.dolly ?? 0));
    const base = Math.atan2(pos[0] - target[0], pos[2] - target[2]);
    camera.position.set(
      target[0] + Math.sin(base + orbit) * radius,
      pos[1],
      target[2] + Math.cos(base + orbit) * radius,
    );
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  }, [beats, camera, frame]);

  return null;
};

export const StudioEnvironment: React.FC = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    const renderer = gl as WebGLRenderer;
    const envScene = new Scene();
    const sky = new SphereGeometry(12, 48, 24);
    const colors: number[] = [];
    const pos = sky.attributes.position;
    const tint = new Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 12;
      if (y > 0.2) {
        tint.setRGB(0.18, 0.36, 0.78);
      } else if (y > -0.12) {
        tint.setRGB(0.78, 0.84, 0.94);
      } else {
        tint.setRGB(0.07, 0.08, 0.11);
      }
      colors.push(tint.r, tint.g, tint.b);
    }
    sky.setAttribute("color", new Float32BufferAttribute(colors, 3));
    const skyMat = new MeshBasicMaterial({
      vertexColors: true,
      side: BackSide,
    });
    envScene.add(new Mesh(sky, skyMat));

    const keyGeo = new PlaneGeometry(10, 8);
    const keyMat = new MeshBasicMaterial({ color: "#f4f7ff" });
    const key = new Mesh(keyGeo, keyMat);
    key.position.set(6, 5, 8);
    key.lookAt(0, 0, 0);
    envScene.add(key);

    const coolGeo = new PlaneGeometry(5, 14);
    const coolMat = new MeshBasicMaterial({ color: "#0B84F3" });
    const cool = new Mesh(coolGeo, coolMat);
    cool.position.set(-9, 2, 3);
    cool.lookAt(0, 0, 0);
    envScene.add(cool);

    const warmGeo = new PlaneGeometry(6, 6);
    const warmMat = new MeshBasicMaterial({ color: "#fd8a4a" });
    const warm = new Mesh(warmGeo, warmMat);
    warm.position.set(3, -2, -8);
    warm.lookAt(0, 0, 0);
    envScene.add(warm);

    const pmrem = new PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(envScene, 0.08).texture;
    scene.environment = envMap;
    scene.environmentIntensity = 0.95;

    return () => {
      scene.environment = null;
      envMap.dispose();
      pmrem.dispose();
      sky.dispose();
      skyMat.dispose();
      keyGeo.dispose();
      keyMat.dispose();
      coolGeo.dispose();
      coolMat.dispose();
      warmGeo.dispose();
      warmMat.dispose();
    };
  }, [gl, scene]);

  return null;
};

export const StageLights: React.FC<{
  readonly orbit: boolean;
}> = ({ orbit }) => {
  const frame = useCurrentFrame();
  const spin = orbit ? frame * 0.045 : 0;
  return (
    <>
      <hemisphereLight args={["#8eb8ff", "#1a140f", 0.42]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[4.5, 7, 5]} intensity={1.35} />
      <pointLight
        position={[Math.cos(spin) * 4.2, 1.4, Math.sin(spin) * 4.2]}
        intensity={orbit ? 2.4 : 0.7}
        color="#0B84F3"
      />
      <pointLight
        position={[
          Math.cos(spin + Math.PI) * 4.2,
          -0.6,
          Math.sin(spin + Math.PI) * 4.2,
        ]}
        intensity={orbit ? 1.8 : 0.45}
        color="#fd511d"
      />
    </>
  );
};
