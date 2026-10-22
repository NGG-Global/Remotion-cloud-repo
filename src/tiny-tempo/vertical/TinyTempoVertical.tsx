import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { seconds } from "../../theme";
import { BAR } from "../theme";
import "../fonts";
import { CurtainPass } from "./parts";
import {
  HookScene,
  MONTAGE_LENGTH,
  MontageScene,
  OutroScene,
  ResultScene,
  RoadScene,
} from "./scenes";

/**
 * The vertical cut: 1080x1920, thirteen bars at the game's own 120 BPM, every
 * cut on a bar line and every shot real gameplay. Hook, montage, result, road,
 * sign — the same arc as the landscape ad, with the footage carrying what that
 * one had to draw.
 */
const SCENE = {
  hook: seconds(BAR * 3),
  montage: seconds(MONTAGE_LENGTH),
  result: seconds(BAR * 2),
  road: seconds(BAR * 2),
  outro: seconds(BAR * 3),
} as const;

const AT = {
  hook: 0,
  montage: SCENE.hook,
  result: SCENE.hook + SCENE.montage,
  road: SCENE.hook + SCENE.montage + SCENE.result,
  outro: SCENE.hook + SCENE.montage + SCENE.result + SCENE.road,
} as const;

export const TINY_TEMPO_VERTICAL_DURATION = AT.outro + SCENE.outro;

/** The mix opens with ~182 ms of encoder lead-in; skip it so beat 0 is the first drum hit. */
const MUSIC_LEAD_FRAMES = 5;

export const TinyTempoVertical: React.FC = () => {
  const fadeFrom = TINY_TEMPO_VERTICAL_DURATION - seconds(1.4);
  return (
    <AbsoluteFill style={{ backgroundColor: "#eee8d8" }}>
      <Audio
        src={staticFile("audio/tiny-tempo.mp3")}
        trimBefore={MUSIC_LEAD_FRAMES}
        volume={(frame) =>
          interpolate(
            frame,
            [fadeFrom, TINY_TEMPO_VERTICAL_DURATION],
            [0.85, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
      />

      <Sequence from={AT.hook} durationInFrames={SCENE.hook} name="Hook">
        <HookScene />
      </Sequence>
      <Sequence
        from={AT.montage}
        durationInFrames={SCENE.montage}
        name="Montage"
      >
        <MontageScene />
      </Sequence>
      <Sequence from={AT.result} durationInFrames={SCENE.result} name="Result">
        <ResultScene />
      </Sequence>
      <Sequence from={AT.road} durationInFrames={SCENE.road} name="Road">
        <RoadScene />
      </Sequence>
      <Sequence from={AT.outro} durationInFrames={SCENE.outro} name="Outro">
        <OutroScene />
      </Sequence>

      <CurtainPass at={AT.montage / 30} />
      <CurtainPass at={AT.result / 30} />
      <CurtainPass at={AT.road / 30} />
      <CurtainPass at={AT.outro / 30} />
    </AbsoluteFill>
  );
};
