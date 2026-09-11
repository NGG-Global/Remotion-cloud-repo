import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { DISSOLVE, seconds } from "../theme";

export type SeriesItem = {
  /** Seconds into the beat at which this shot starts. */
  readonly at: number;
  readonly node: React.ReactNode;
};

/**
 * Several shots inside one beat, each dissolving into the next. Shots are
 * given in order; each runs until the next begins, the last to the end.
 */
export const Series: React.FC<{
  readonly shots: readonly SeriesItem[];
  /** Seconds the whole beat runs, so the last shot knows when to stop. */
  readonly total: number;
  readonly dissolve?: number;
}> = ({ shots, total, dissolve = DISSOLVE }) => (
  <AbsoluteFill>
    {shots.map((shot, i) => {
      const end = shots[i + 1]?.at ?? total;
      const from = seconds(shot.at);
      const length = Math.max(
        1,
        seconds(end - shot.at) + (i < shots.length - 1 ? dissolve : 0),
      );
      return (
        <Sequence
          key={i}
          from={from}
          durationInFrames={length}
          name={`shot-${i}`}
        >
          <FadeIn frames={i === 0 ? 0 : dissolve}>{shot.node}</FadeIn>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

const FadeIn: React.FC<{ frames: number; children: React.ReactNode }> = ({
  frames,
  children,
}) => {
  const frame = useCurrentFrame();
  const o =
    frames > 0
      ? interpolate(frame, [0, frames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
