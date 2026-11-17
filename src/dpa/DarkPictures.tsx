import { Audio, Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CLIPS, DPA_NARRATION, SHOTS, TimedShot } from "./edl";

/**
 * One prepared clip, full frame.
 *
 * The clip was trimmed to this shot's exact length by tools/dpa/prep.mjs,
 * including any dissolve lead-in, so its first frame is the shot's first frame
 * and nothing is seeked, scaled or re-timed at render.
 */
const ShotLayer: React.FC<{ shot: TimedShot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const length = shot.to - shot.mount;
  const clip = CLIPS[shot.id];
  if (!clip) {
    return null;
  }

  const fadeIn =
    shot.fadeIn > 0
      ? interpolate(frame, [0, shot.fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const fadeOut =
    shot.fadeOut > 0
      ? interpolate(frame, [length - shot.fadeOut, length], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Video
        src={staticFile(clip.file)}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};

/** Frames a shot is mounted ahead of its cut, so Studio playback does not stall. */
const PREMOUNT = 30;

/**
 * The Dark Pictures Anthology documentary.
 *
 * Picture only: game footage cut to the narration, no titles or graphics. The
 * narration is included for Studio preview; the delivery render is muted and
 * tools/dpa/render.mjs muxes the audio once, so the voice is encoded a single
 * time and never split across segment joins.
 */
export const DarkPictures: React.FC = () => {
  const frame = useCurrentFrame();
  // Only the shots near the playhead are mounted. A half-hour timeline has a
  // few hundred shots and at most two are ever visible.
  const live = SHOTS.filter(
    (shot) => frame >= shot.mount - PREMOUNT && frame < shot.to,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {live.map((shot) => (
        <Sequence
          key={shot.id}
          from={shot.mount}
          durationInFrames={shot.to - shot.mount}
          premountFor={PREMOUNT}
        >
          <ShotLayer shot={shot} />
        </Sequence>
      ))}
      <Audio src={staticFile(DPA_NARRATION)} />
    </AbsoluteFill>
  );
};
