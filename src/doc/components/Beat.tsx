import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TL, type DocBeatId } from "../beats";
import { DISSOLVE, seconds } from "../theme";

type BeatProps = {
  readonly id: DocBeatId;
  /** Seconds to extend past the next beat, for a deliberate overlap. */
  readonly extend?: number;
  /** Seconds to start late, so a scene lands on a word rather than a beat boundary. */
  readonly offset?: number;
  /** Seconds to end early. */
  readonly trim?: number;
  /** Frames for the fade-in over the scene beneath. 0 is a hard cut. */
  readonly fadeIn?: number;
  /** Frames for the fade-out at the end. 0 is a hard cut. */
  readonly fadeOut?: number;
  /** Run this beat and the following ones as a single scene. */
  readonly through?: DocBeatId;
  readonly children: React.ReactNode;
};

/**
 * Places a scene on the narration's timeline by beat id.
 *
 * Scenes overlap their successor by one dissolve, and the successor fades in
 * on top: the outgoing scene is still fully present underneath, so a cut is a
 * dissolve rather than a dip to black. A hard cut (fadeIn = 0) is available
 * for the moments that need a jolt.
 */
export const Beat: React.FC<BeatProps> = ({
  id,
  extend = 0,
  offset = 0,
  trim = 0,
  fadeIn = DISSOLVE,
  fadeOut = 0,
  through,
  children,
}) => {
  const start = TL.at(id) + offset;
  const end =
    (through
      ? TL.at(through) + TL.length(through)
      : TL.at(id) + TL.length(id)) +
    extend -
    trim;
  const length = Math.max(1, seconds(end - start) + fadeIn);

  return (
    <Sequence from={seconds(start)} durationInFrames={length} name={id}>
      <Fade fadeIn={fadeIn} fadeOut={fadeOut}>
        {children}
      </Fade>
    </Sequence>
  );
};

const Fade: React.FC<{
  readonly fadeIn: number;
  readonly fadeOut: number;
  readonly children: React.ReactNode;
}> = ({ fadeIn, fadeOut, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inOpacity =
    fadeIn > 0
      ? interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const outOpacity =
    fadeOut > 0
      ? interpolate(
          frame,
          [durationInFrames - fadeOut, durationInFrames - 1],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;
  return (
    <AbsoluteFill style={{ opacity: inOpacity * outOpacity }}>
      {children}
    </AbsoluteFill>
  );
};

/** Seconds a beat runs for; handy for sizing a graphic's motion to the voice. */
export const beatSeconds = (id: DocBeatId): number => TL.length(id);
