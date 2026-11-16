import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Video } from "@remotion/media";
import { Label } from "./components/Label";
import timelineJson from "./data/timeline.json";
import "./fonts";
import type { Shot, Timeline } from "./types";

export const TIMELINE = timelineJson as unknown as Timeline;
export const DI_FPS = TIMELINE.fps;
export const DI_WIDTH = TIMELINE.width;
export const DI_HEIGHT = TIMELINE.height;
export const DI_DURATION = Math.round((TIMELINE.narration + TIMELINE.tail) * DI_FPS);

const f = (seconds: number) => Math.round(seconds * DI_FPS);

/** Levels. The narration is untouched; everything else sits well beneath it. */
const MUSIC_LEVEL = 0.8;

const ShotLayer: React.FC<{ readonly shot: Shot; readonly fadeIn: number }> = ({
  shot,
  fadeIn,
}) => {
  const frame = useCurrentFrame();
  const opacity =
    fadeIn > 0
      ? interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const nat = shot.nat ?? 0;
  return (
    <AbsoluteFill style={{ opacity }}>
      <Video
        src={staticFile(`deadisland/clips/${shot.id}.mp4`)}
        muted={nat === 0}
        volume={nat}
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};

export const DeadIslandDocumentary: React.FC = () => {
  const frame = useCurrentFrame();
  const { shots, labels } = TIMELINE;
  // Picture fades out over the last second of the tail, after the voice ends.
  const out = interpolate(frame, [DI_DURATION - 45, DI_DURATION - 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: out }}>
        {shots.map((shot, i) => {
          const next = shots[i + 1];
          const from = f(shot.at);
          const end = next ? f(next.at) : DI_DURATION;
          // A shot that is dissolved out of keeps playing under the incoming shot.
          const overlap =
            next && next.transition === "dissolve" ? f(next.transitionDur ?? 0.5) : 0;
          const fadeIn =
            shot.transition === "dissolve" || shot.transition === "fadeFromBlack"
              ? f(shot.transitionDur ?? 0.5)
              : 0;
          return (
            <Sequence
              key={shot.id}
              from={from}
              durationInFrames={end - from + overlap}
              name={`${shot.id} · ${shot.subject}`}
              premountFor={30}
            >
              {/* A fade from black needs black beneath it, not the previous shot. */}
              {shot.transition === "fadeFromBlack" ? (
                <AbsoluteFill style={{ backgroundColor: "black" }} />
              ) : null}
              <ShotLayer shot={shot} fadeIn={fadeIn} />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {labels.map((label) => (
        <Sequence
          key={`${label.at}-${label.line}`}
          from={f(label.at)}
          durationInFrames={f(label.dur)}
          name={`label · ${label.line}`}
        >
          <Label line={label.line} sub={label.sub} />
        </Sequence>
      ))}

      {TIMELINE.beds.map((bed) => (
        <Sequence key={bed.id} from={f(bed.at)} durationInFrames={f(bed.dur)} name={`bed · ${bed.src}`}>
          <Audio src={staticFile(`deadisland/audio/beds/${bed.id}.m4a`)} volume={() => bed.volume} />
        </Sequence>
      ))}

      <Audio src={staticFile("deadisland/audio/music-bed.m4a")} volume={MUSIC_LEVEL} />
      <Audio src={staticFile("deadisland/audio/narration.mp3")} />
    </AbsoluteFill>
  );
};
