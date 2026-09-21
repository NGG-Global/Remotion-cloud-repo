import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../showreel/theme";

export type CameraBeat = {
  readonly at: number;
  readonly pos: readonly [number, number, number];
  readonly target: readonly [number, number, number];
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
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  }, [beats, camera, frame]);

  return null;
};

export const StageLights: React.FC<{
  readonly orbit: boolean;
}> = ({ orbit }) => {
  const frame = useCurrentFrame();
  const spin = orbit ? frame * 0.045 : 0;
  return (
    <>
      <ambientLight intensity={0.32} />
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
