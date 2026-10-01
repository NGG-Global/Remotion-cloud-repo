import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { TT } from "../theme";
import "../fonts";
import { AbsoluteFrameProvider, useMusic } from "./AbsoluteFrame";
import { CurtainPass, PulseBeads, Vignette } from "./chrome";
import { bar, beats, sec } from "./format";
import { ActV } from "./scenes/ActV";
import { GridV } from "./scenes/GridV";
import { HookV } from "./scenes/HookV";
import { MechanicV } from "./scenes/MechanicV";
import { OutroV } from "./scenes/OutroV";
import { RoadV } from "./scenes/RoadV";

/**
 * Tiny Tempo, vertical teaser. 1080x1920, 64 seconds, cut to the home-page
 * theme bar for bar.
 *
 * The theme at 120 BPM, as measured:
 *
 *   bars  0-1   intro stabs                      hook
 *   bar   2     stop on the downbeat, crash on the "and" of two
 *   bars  3-7   drums alone, a two-bar figure played twice   premise
 *   bars  8-23  full groove, hats on the off-beats           montage
 *   bar  12     four-on-the-floor fill                       split screen
 *   bars 24-29  second theme, syncopated bars alternating    map, wall
 *   bar  30     drop-out, crash on the "and" of four         outro
 *   bar  31     three closing hits
 *
 * Every scene boundary below is a bar line, and every hit list inside a
 * scene is the kick pattern of those bars, so the picture plays the drum part.
 */
export const TINY_TEMPO_TEASER_DURATION = bar(32);

/** The kick figure of a regular groove bar: 1, 2, 3, rest. */
const GROOVE = beats(0, 1, 2);
/** Two groove bars. */
const GROOVE_2 = beats(0, 1, 2, 4, 5, 6);
/** Bar 8 keeps every quarter; bar 9 drops the last. */
const DROP_BARS = beats(0, 1, 2, 3, 4, 5, 6);
/** Bars 27-29 under the wall: groove, syncopated bar, groove. */
const WALL = beats(0, 1, 2, 4, 7, 8, 9, 10);

const CUTS = [
  { at: 0, len: bar(4), name: "Hook" },
  { at: bar(4), len: bar(4), name: "Premise" },
  { at: bar(8), len: bar(2), name: "Tomato" },
  { at: bar(10), len: bar(2), name: "Bug" },
  { at: bar(12), len: bar(1), name: "Fill" },
  { at: bar(13), len: bar(2), name: "Window" },
  { at: bar(15), len: bar(2), name: "Saw" },
  { at: bar(17), len: bar(1), name: "Paper" },
  { at: bar(18), len: bar(1), name: "Curl" },
  { at: bar(19), len: bar(1), name: "Hammer" },
  { at: bar(20), len: bar(4), name: "Rush" },
  { at: bar(24), len: bar(3), name: "Road" },
  { at: bar(27), len: bar(3), name: "Wall" },
  { at: bar(30), len: bar(2), name: "Outro" },
] as const;

const cut = (name: (typeof CUTS)[number]["name"]) =>
  CUTS.find((c) => c.name === name)!;

/** Bars 20-23: one act per half bar, every cut on a kick. */
const RUSH = [
  { act: "tomato", hits: beats(0, 1), tilt: -1.6 },
  { act: "bug", hits: beats(0), tilt: 1.6 },
  { act: "window", hits: beats(0, 1), tilt: -1.6 },
  { act: "saw", hits: beats(0), tilt: 1.6 },
  { act: "paper", hits: beats(0, 1), tilt: -1.6 },
  { act: "curl", hits: beats(0), tilt: 1.6 },
  { act: "hammer", hits: beats(0, 1), tilt: -1.6 },
  { act: "tomato", hits: beats(0), tilt: 1.6 },
] as const;

/** The whole picture breathes with the kick drum. */
const Pulse: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => {
  const { low } = useMusic();
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + low * 0.014})`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const TinyTempoTeaser: React.FC = () => {
  const hook = cut("Hook");
  const premise = cut("Premise");
  const fill = cut("Fill");
  const rush = cut("Rush");
  const road = cut("Road");
  const wall = cut("Wall");
  const outro = cut("Outro");

  return (
    <AbsoluteFill style={{ backgroundColor: TT.paper }}>
      <Audio src={staticFile("audio/tiny-tempo-home.wav")} volume={0.95} />

      <AbsoluteFrameProvider>
        <Pulse>
          <Sequence from={hook.at} durationInFrames={hook.len} name="Hook">
            <HookV />
          </Sequence>

          <Sequence
            from={premise.at}
            durationInFrames={premise.len}
            name="Premise"
          >
            <MechanicV />
          </Sequence>

          <Sequence from={bar(8)} durationInFrames={bar(2)} name="Tomato">
            <ActV act="tomato" hits={DROP_BARS} punch={0.12} />
          </Sequence>
          <Sequence from={bar(10)} durationInFrames={bar(2)} name="Bug">
            <ActV act="bug" hits={GROOVE_2} />
          </Sequence>

          <Sequence from={fill.at} durationInFrames={fill.len} name="Fill">
            <GridV
              columns={2}
              top={330}
              bottom={330}
              cells={[
                { act: "window", hits: beats(0), enter: 0 },
                { act: "saw", hits: beats(1), enter: 0.5 },
                { act: "paper", hits: beats(2), enter: 1.0 },
                { act: "curl", hits: beats(3), enter: 1.5 },
              ]}
            />
          </Sequence>

          <Sequence from={bar(13)} durationInFrames={bar(2)} name="Window">
            <ActV act="window" hits={GROOVE_2} />
          </Sequence>
          <Sequence from={bar(15)} durationInFrames={bar(2)} name="Saw">
            <ActV act="saw" hits={GROOVE_2} />
          </Sequence>
          <Sequence from={bar(17)} durationInFrames={bar(1)} name="Paper">
            <ActV act="paper" hits={GROOVE} punch={0.1} />
          </Sequence>
          <Sequence from={bar(18)} durationInFrames={bar(1)} name="Curl">
            <ActV act="curl" hits={GROOVE} punch={0.1} />
          </Sequence>
          <Sequence from={bar(19)} durationInFrames={bar(1)} name="Hammer">
            <ActV act="hammer" hits={GROOVE} punch={0.1} />
          </Sequence>

          {RUSH.map((shot, i) => (
            <Sequence
              key={i}
              from={rush.at + i * sec(1)}
              durationInFrames={sec(1)}
              name={`Rush ${i + 1}`}
            >
              <ActV
                act={shot.act}
                hits={shot.hits}
                punch={0.14}
                drift={60}
                tilt={shot.tilt}
                popY={420 + (i % 2) * 60}
              />
            </Sequence>
          ))}

          <Sequence from={road.at} durationInFrames={road.len} name="Road">
            <RoadV />
          </Sequence>

          <Sequence from={wall.at} durationInFrames={wall.len} name="Wall">
            <GridV
              columns={2}
              top={60}
              bottom={60}
              gap={20}
              drift={0.05}
              cells={[
                { act: "tomato", hits: WALL, enter: 0 },
                { act: "bug", hits: WALL, enter: 0.08 },
                { act: "window", hits: WALL, enter: 0.16 },
                { act: "saw", hits: WALL, enter: 0.24 },
                { act: "paper", hits: WALL, enter: 0.32 },
                { act: "curl", hits: WALL, enter: 0.4 },
              ]}
            />
          </Sequence>

          <Sequence from={outro.at} durationInFrames={outro.len} name="Outro">
            <OutroV />
          </Sequence>

          <Sequence from={bar(8)} durationInFrames={bar(16)} name="Beads">
            <PulseBeads />
          </Sequence>
        </Pulse>

        <Vignette />

        <CurtainPass at={premise.at} />
        <CurtainPass at={bar(8)} />
        <CurtainPass at={road.at} />
        <CurtainPass at={outro.at} />
      </AbsoluteFrameProvider>
    </AbsoluteFill>
  );
};
