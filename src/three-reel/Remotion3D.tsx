import React from "react";
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Overlay, type Chapter } from "./chrome";
import {
  CameraRig,
  StageLights,
  StudioEnvironment,
  type CameraBeat,
} from "./rig";
import {
  CameraSubject,
  Ground,
  HeroKnot,
  InstanceField,
  LightSubject,
  MaterialLine,
  PrimitiveRow,
  ShaderOrb,
  SolarSystem,
} from "./scenes";
import { seconds } from "../theme";
import "../fonts";

const SCENE = {
  title: seconds(10),
  primitives: seconds(12),
  materials: seconds(12),
  lights: seconds(10),
  camera: seconds(12),
  orbit: seconds(12),
  field: seconds(10),
  shader: seconds(10),
  outro: seconds(8),
} as const;

const order = [
  "title",
  "primitives",
  "materials",
  "lights",
  "camera",
  "orbit",
  "field",
  "shader",
  "outro",
] as const;

const AT = order.reduce(
  (acc, key) => {
    const prev = acc._end;
    acc[key] = prev;
    acc._end = prev + SCENE[key];
    return acc;
  },
  { _end: 0 } as Record<string, number>,
);

export const REMOTION_3D_DURATION = AT._end;

const CHAPTERS: Chapter[] = [
  {
    at: AT.title,
    dur: SCENE.title,
    title: "The canvas is a camera",
    pack: "ThreeCanvas",
  },
  {
    at: AT.primitives,
    dur: SCENE.primitives,
    title: "Every mesh is a component",
    pack: "geometries",
  },
  {
    at: AT.materials,
    dur: SCENE.materials,
    title: "Metal, matte, wire, light",
    pack: "materials",
  },
  {
    at: AT.lights,
    dur: SCENE.lights,
    title: "Light is just another actor",
    pack: "point · directional",
  },
  {
    at: AT.camera,
    dur: SCENE.camera,
    title: "Dolly and orbit from the frame",
    pack: "useThree · interpolate",
  },
  {
    at: AT.orbit,
    dur: SCENE.orbit,
    title: "Groups parent motion",
    pack: "scene graph",
  },
  {
    at: AT.field,
    dur: SCENE.field,
    title: "One draw call, many bodies",
    pack: "InstancedMesh · noise",
  },
  {
    at: AT.shader,
    dur: SCENE.shader,
    title: "GLSL, still a function of time",
    pack: "ShaderMaterial",
  },
  {
    at: AT.outro,
    dur: SCENE.outro,
    title: "npx remotion render Remotion3D",
    pack: "start here",
  },
];

const CAMERAS: CameraBeat[] = [
  { at: AT.title, pos: [0, 0.45, 6.6], target: [0, 0.05, 0] },
  { at: AT.primitives, pos: [0, 0.55, 8.8], target: [0, 0.1, 0] },
  { at: AT.materials, pos: [0, 0.35, 7.4], target: [0, 0.05, 0] },
  { at: AT.lights, pos: [2.2, 1.4, 5.4], target: [0, 0, 0] },
  {
    at: AT.camera,
    pos: [4.8, 2.2, 5.6],
    target: [0, 0.1, 0],
    orbit: Math.PI * 0.72,
    dolly: 0.28,
  },
  { at: AT.orbit, pos: [0.4, 2.8, 6.4], target: [0, 0, 0] },
  { at: AT.field, pos: [5.4, 3.6, 7.2], target: [0, 0, 0] },
  { at: AT.shader, pos: [0, 0.3, 5.8], target: [0, 0, 0] },
  { at: AT.outro, pos: [0, 1.8, 9.5], target: [0, 0, 0] },
];

export const Remotion3D: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#07080d" }}>
      <Audio src={staticFile("audio/showreel-bed.mp3")} volume={0.55} />
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 42, position: [0, 0.45, 6.6], near: 0.1, far: 80 }}
        style={{ backgroundColor: "#07080d" }}
      >
        <color attach="background" args={["#07080d"]} />
        <fog attach="fog" args={["#07080d", 9, 22]} />
        <StudioEnvironment />
        <CameraRig beats={CAMERAS} />
        <StageLights orbit />
        <Ground />

        <Sequence from={AT.title} durationInFrames={SCENE.title} layout="none">
          <HeroKnot />
        </Sequence>
        <Sequence
          from={AT.primitives}
          durationInFrames={SCENE.primitives}
          layout="none"
        >
          <PrimitiveRow />
        </Sequence>
        <Sequence
          from={AT.materials}
          durationInFrames={SCENE.materials}
          layout="none"
        >
          <MaterialLine />
        </Sequence>
        <Sequence
          from={AT.lights}
          durationInFrames={SCENE.lights}
          layout="none"
        >
          <LightSubject />
        </Sequence>
        <Sequence
          from={AT.camera}
          durationInFrames={SCENE.camera}
          layout="none"
        >
          <CameraSubject />
        </Sequence>
        <Sequence from={AT.orbit} durationInFrames={SCENE.orbit} layout="none">
          <SolarSystem />
        </Sequence>
        <Sequence from={AT.field} durationInFrames={SCENE.field} layout="none">
          <InstanceField />
        </Sequence>
        <Sequence
          from={AT.shader}
          durationInFrames={SCENE.shader + SCENE.outro}
          layout="none"
        >
          <ShaderOrb />
        </Sequence>
      </ThreeCanvas>
      <Overlay chapters={CHAPTERS} />
    </AbsoluteFill>
  );
};
