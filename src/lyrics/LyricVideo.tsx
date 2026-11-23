import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { FORMAT } from "../theme";
import {
  LYRICS,
  SONG_DURATION_SECONDS,
  type LyricLine,
} from "./alTishkechiOti";

export const LYRIC_VIDEO_DURATION = Math.ceil(
  SONG_DURATION_SECONDS * FORMAT.fps,
);

/** A line appears this much before it is sung, so the eye is there first. */
const LEAD_SECONDS = 0.15;

/**
 * A line stays up until the next one starts. Only when the singer pauses for
 * longer than this does the screen go back to black between lines.
 */
const MAX_GAP_SECONDS = 1.5;

/** How long a line lingers after it was sung, before a long pause. */
const HOLD_SECONDS = 0.6;

const lineAt = (t: number, lines: LyricLine[]): LyricLine | null => {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (t < line.start - LEAD_SECONDS) continue;

    const next = lines[i + 1];
    const gapToNext = next ? next.start - line.end : Infinity;
    const hideAt =
      gapToNext > MAX_GAP_SECONDS
        ? line.end + HOLD_SECONDS
        : next.start - LEAD_SECONDS;

    return t < hideAt ? line : null;
  }
  return null;
};

/**
 * Plain lyric video: black background, one line at a time, centred.
 * Lines cut in and out with no animation.
 */
export const LyricVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = lineAt(frame / fps, LYRICS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("audio/al-tishkechi-oti.mp3")} />
      {line ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 160px",
          }}
        >
          <div
            dir="rtl"
            style={{
              fontFamily,
              fontWeight: 500,
              fontSize: 92,
              lineHeight: 1.3,
              color: "#fff",
              textAlign: "center",
            }}
          >
            {line.text}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
