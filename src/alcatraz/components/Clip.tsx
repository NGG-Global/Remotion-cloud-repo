import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLIP_SECONDS, type ClipId } from "../data/clips";
import { AZ, FPS } from "../theme";

export const clipSrc = (id: ClipId): string =>
  staticFile(`alcatraz/clips/${id}.mp4`);

export type ClipTone = "bw" | "washed" | "dim" | "color" | "night" | "dark";

const FILTERS: Record<ClipTone, string> = {
  bw: "grayscale(1) contrast(1.1) brightness(0.92)",
  // The 1946 outtakes are a dupe of a dupe: lifted blacks, no contrast.
  washed: "grayscale(1) contrast(1.55) brightness(0.78)",
  // The other 1946 reel is underexposed and heavily vignetted.
  dim: "grayscale(1) contrast(1.2) brightness(1.25)",
  color: "saturate(0.85) contrast(1.04) brightness(0.95)",
  night: "grayscale(1) contrast(1.25) brightness(0.42) sepia(0.2) hue-rotate(170deg) saturate(1.6)",
  dark: "grayscale(1) contrast(1.2) brightness(0.62)",
};

type ClipProps = {
  readonly id: ClipId;
  readonly tone?: ClipTone;
  /** Scale at the first and last frame: a slow push gives held footage some life. */
  readonly push?: readonly [number, number];
  /** Transform origin of the push, as CSS percentages. */
  readonly origin?: string;
  /** Seconds into the clip to start from. */
  readonly offset?: number;
};

/**
 * One prepared piece of archival footage, full frame and silent.
 *
 * Clips are cut to the shot in tools/alcatraz-media.json with a little spare.
 * When a shot runs longer than its clip, the clip is slowed to fit rather than
 * freezing on its last frame; archival film at 80% speed reads as deliberate,
 * a held frame reads as a mistake.
 */
export const Clip: React.FC<ClipProps> = ({
  id,
  tone = "bw",
  push = [1.0, 1.06],
  origin = "50% 50%",
  offset = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const available = CLIP_SECONDS[id] - offset - 0.05;
  const needed = durationInFrames / FPS;
  const rate = Math.min(1, Math.max(0.45, available / needed));
  const s = interpolate(frame, [0, durationInFrames - 1], push, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: AZ.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `scale(${s})`, transformOrigin: origin }}
      >
        <Video
          src={clipSrc(id)}
          muted
          playbackRate={rate}
          trimBefore={Math.round(offset * FPS)}
          objectFit="cover"
          style={{ width: "100%", height: "100%", filter: FILTERS[tone] }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
