import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Chapter, Chrome } from "./chrome";
import { seconds } from "../theme";
import {
  AudioScene,
  CaptionsScene,
  DataScene,
  EffectsScene,
  MediaScene,
  NoiseScene,
  OutroScene,
  ShapesScene,
  SpringsScene,
  ThreeScene,
  TitleScene,
  TrailsScene,
  TransitionsScene,
  TypeScene,
} from "./visuals";
import "../fonts";

const SCENE = {
  title: seconds(12),
  springs: seconds(12),
  transitions: seconds(14),
  shapes: seconds(12),
  noise: seconds(12),
  trails: seconds(10),
  three: seconds(14),
  effects: seconds(12),
  data: seconds(12),
  type: seconds(12),
  captions: seconds(12),
  audio: seconds(12),
  media: seconds(12),
  outro: seconds(10),
} as const;

const order = [
  "title",
  "springs",
  "transitions",
  "shapes",
  "noise",
  "trails",
  "three",
  "effects",
  "data",
  "type",
  "captions",
  "audio",
  "media",
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

export const REMOTION_SHOWREEL_DURATION = AT._end;

const CHAPTERS: Chapter[] = [
  {
    at: AT.title,
    dur: SCENE.title,
    title: "React is the timeline",
    pack: "remotion",
  },
  {
    at: AT.springs,
    dur: SCENE.springs,
    title: "Frame as a function",
    pack: "spring · interpolate · Easing",
  },
  {
    at: AT.transitions,
    dur: SCENE.transitions,
    title: "Presentations",
    pack: "@remotion/transitions",
  },
  {
    at: AT.shapes,
    dur: SCENE.shapes,
    title: "SVG actors",
    pack: "@remotion/shapes · @remotion/paths",
  },
  {
    at: AT.noise,
    dur: SCENE.noise,
    title: "Seeded fields",
    pack: "@remotion/noise",
  },
  {
    at: AT.trails,
    dur: SCENE.trails,
    title: "Time trails",
    pack: "@remotion/motion-blur",
  },
  {
    at: AT.three,
    dur: SCENE.three,
    title: "Real depth",
    pack: "@remotion/three",
  },
  {
    at: AT.effects,
    dur: SCENE.effects,
    title: "WebGL plates",
    pack: "@remotion/effects",
  },
  {
    at: AT.data,
    dur: SCENE.data,
    title: "Data as motion",
    pack: "programmatic charts",
  },
  {
    at: AT.type,
    dur: SCENE.type,
    title: "Type that fits",
    pack: "@remotion/layout-utils",
  },
  {
    at: AT.captions,
    dur: SCENE.captions,
    title: "Captions as data",
    pack: "@remotion/captions",
  },
  {
    at: AT.audio,
    dur: SCENE.audio,
    title: "Hear it, draw it",
    pack: "@remotion/media-utils",
  },
  {
    at: AT.media,
    dur: SCENE.media,
    title: "Lottie, GIF, stills",
    pack: "@remotion/lottie · @remotion/gif",
  },
  { at: AT.outro, dur: SCENE.outro, title: "Now you", pack: "npm run dev" },
];

export const RemotionShowreel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080d" }}>
      <Audio src={staticFile("audio/showreel-bed.mp3")} volume={0.72} />

      <Sequence from={AT.title} durationInFrames={SCENE.title} name="Title">
        <TitleScene />
      </Sequence>
      <Sequence
        from={AT.springs}
        durationInFrames={SCENE.springs}
        name="Springs"
      >
        <SpringsScene />
      </Sequence>
      <Sequence
        from={AT.transitions}
        durationInFrames={SCENE.transitions}
        name="Transitions"
      >
        <TransitionsScene />
      </Sequence>
      <Sequence from={AT.shapes} durationInFrames={SCENE.shapes} name="Shapes">
        <ShapesScene />
      </Sequence>
      <Sequence from={AT.noise} durationInFrames={SCENE.noise} name="Noise">
        <NoiseScene />
      </Sequence>
      <Sequence from={AT.trails} durationInFrames={SCENE.trails} name="Trails">
        <TrailsScene />
      </Sequence>
      <Sequence from={AT.three} durationInFrames={SCENE.three} name="Three">
        <ThreeScene />
      </Sequence>
      <Sequence
        from={AT.effects}
        durationInFrames={SCENE.effects}
        name="Effects"
      >
        <EffectsScene />
      </Sequence>
      <Sequence from={AT.data} durationInFrames={SCENE.data} name="Data">
        <DataScene />
      </Sequence>
      <Sequence from={AT.type} durationInFrames={SCENE.type} name="Type">
        <TypeScene />
      </Sequence>
      <Sequence
        from={AT.captions}
        durationInFrames={SCENE.captions}
        name="Captions"
      >
        <CaptionsScene />
      </Sequence>
      <Sequence from={AT.audio} durationInFrames={SCENE.audio} name="Audio">
        <AudioScene />
      </Sequence>
      <Sequence from={AT.media} durationInFrames={SCENE.media} name="Media">
        <MediaScene />
      </Sequence>
      <Sequence from={AT.outro} durationInFrames={SCENE.outro} name="Outro">
        <OutroScene />
      </Sequence>

      <Chrome chapters={CHAPTERS} />
    </AbsoluteFill>
  );
};
