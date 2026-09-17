import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { beats } from "./frame";
import { Curtain } from "./Curtain";
import { ActBeat } from "./scenes/ActBeat";
import { EndCardScene } from "./scenes/EndCardScene";
import { LoopScene } from "./scenes/LoopScene";
import { MosaicScene } from "./scenes/MosaicScene";
import { PayoffScene } from "./scenes/PayoffScene";
import { RoadScene } from "./scenes/RoadScene";
import { TT } from "../theme";
import "../fonts";

/** 1080x1920 at 30 fps. One bar of the track is 60 frames. */
export const VERTICAL_FORMAT = { width: 1080, height: 1920, fps: 30 } as const;

const BAR = 60;

/**
 * The cut list, in bars of the shipped track.
 *
 * Every cut lands on a bar or a half bar, because the audience for this game is an
 * audience that notices. Two bars at the front teach the whole mechanic — watch a
 * phrase, tap it back — and everything after them trades on it, so no bar is spent
 * explaining the game twice.
 */
const CUT = {
  watch: 0,
  play: BAR,
  tomato: BAR * 2,
  bubble: BAR * 3,
  window: BAR * 4,
  bug: BAR * 5,
  payoff: BAR * 6,
  mosaic: BAR * 7.5,
  road: BAR * 8.5,
  end: BAR * 9,
} as const;

export const TINY_TEMPO_VERTICAL_DURATION = BAR * 10;

/** Quarter notes, the level-one vocabulary the montage acts play. */
const QUARTERS = [beats(0), beats(1), beats(2), beats(3)];

/**
 * The shipped mix carries ~182 ms of encoder lead-in before the first downbeat.
 * Skipping it puts visual beat 0 on the first drum hit, which every cut depends on.
 */
const MUSIC_LEAD_FRAMES = 5;

/**
 * Tiny Tempo, cut vertical.
 *
 * The game is portrait-only and authored against a 720x1280 box, so the ad is
 * 1080x1920 and its acts are drawn in that same box: a frame of the video is framed
 * the way a frame of the game is, rather than a landscape composition cropped down.
 */
export const VerticalAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: TT.paper }}>
    <Audio
      src={staticFile("audio/tiny-tempo.mp3")}
      startFrom={MUSIC_LEAD_FRAMES}
      volume={0.86}
    />

    <Sequence from={CUT.watch} durationInFrames={BAR} name="Watch">
      <LoopScene phase="watch" />
    </Sequence>

    <Sequence from={CUT.play} durationInFrames={BAR} name="Your turn">
      <LoopScene phase="play" />
    </Sequence>

    <Sequence from={CUT.tomato} durationInFrames={BAR} name="Knife & tomato">
      <ActBeat act="tomato" hits={QUARTERS} />
    </Sequence>

    <Sequence from={CUT.bubble} durationInFrames={BAR} name="Bubble wrap">
      <ActBeat act="bubble" hits={QUARTERS} />
    </Sequence>

    <Sequence from={CUT.window} durationInFrames={BAR} name="Window cleaning">
      <ActBeat act="window" hits={QUARTERS} />
    </Sequence>

    <Sequence from={CUT.bug} durationInFrames={BAR} name="Bug & shoe">
      <ActBeat act="bug" hits={QUARTERS} />
    </Sequence>

    <Sequence
      from={CUT.payoff}
      durationInFrames={BAR * 1.5}
      name="Scissors & paper"
    >
      <PayoffScene />
    </Sequence>

    <Sequence from={CUT.mosaic} durationInFrames={BAR} name="Seventeen acts">
      <MosaicScene />
    </Sequence>

    <Sequence from={CUT.road} durationInFrames={BAR * 0.5} name="Endless road">
      <RoadScene />
    </Sequence>

    <Sequence from={CUT.end} durationInFrames={BAR} name="End card">
      <EndCardScene />
    </Sequence>

    {/* The game's own curtain hides each change of world; montage cuts stay hard. */}
    <Curtain at={CUT.tomato} />
    <Curtain at={CUT.bug} />
    <Curtain at={CUT.payoff} />
    <Curtain at={CUT.mosaic} />
    <Curtain at={CUT.end} />
  </AbsoluteFill>
);
