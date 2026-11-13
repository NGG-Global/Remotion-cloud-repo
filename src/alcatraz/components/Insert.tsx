import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ClipId } from "../data/clips";
import type { Insert as InsertSpec } from "../edit";
import { AZ, easeOut, FPS, ramp, SERIF_LATIN } from "../theme";
import { clipSrc } from "./Clip";
import { Subtitle } from "./Type";

/**
 * A newsreel playing with its own sound, while the narration waits.
 *
 * Shown whole, 4:3 inside the 16:9 frame, as the document it is: the
 * pillarbox is part of the statement that this is the archive talking, not
 * the film. The source sits in the corner and the English commentary is
 * subtitled in Hebrew.
 */
export const Insert: React.FC<{ readonly spec: InsertSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width: W } = useVideoConfig();
  const t = frame / FPS;
  const fadeFrames = 4;
  const volume = (f: number) =>
    spec.gain *
    interpolate(
      f,
      [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames - 1],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  const tag = easeOut(ramp(t, 0.3, 1.0)) * (1 - ramp(t, spec.dur - 0.6, spec.dur - 0.1));
  const pic = 1440;
  const side = (W - pic) / 2;

  return (
    <AbsoluteFill style={{ background: AZ.black }}>
      <div
        style={{
          position: "absolute",
          left: side,
          top: 0,
          width: pic,
          height: 1080,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,0,0,0.9)",
        }}
      >
        <Video
          src={clipSrc(spec.clip as ClipId)}
          volume={volume}
          objectFit="cover"
          style={{
            width: "100%",
            height: "100%",
            filter: "grayscale(1) contrast(1.08) brightness(0.95)",
          }}
        />
      </div>
      {/* Film edge on the pillarbox, so the frame reads as a reel. */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: i === 0 ? side - 3 : side + pic,
            width: 3,
            background: "rgba(220,220,220,0.12)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: 54,
          left: side + pic + 34,
          width: side - 68,
          height: 900,
          display: "flex",
          justifyContent: "flex-start",
          opacity: tag,
        }}
      >
        <div
          style={{
            writingMode: "vertical-rl",
            fontFamily: SERIF_LATIN,
            fontSize: 22,
            letterSpacing: 6,
            color: AZ.textMuted,
            whiteSpace: "nowrap",
          }}
        >
          {spec.tag}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 54,
          right: side + pic + 30,
          opacity: tag,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: AZ.red,
          }}
        />
        <div
          style={{
            fontFamily: SERIF_LATIN,
            fontSize: 20,
            letterSpacing: 5,
            color: AZ.textMuted,
          }}
        >
          ARCHIVE
        </div>
      </div>
      {spec.subs.map((s, i) => (
        <Subtitle key={i} text={s.he} from={s.from} to={s.to} />
      ))}
    </AbsoluteFill>
  );
};
