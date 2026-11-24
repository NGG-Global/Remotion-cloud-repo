import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { buildBeats, CHAPTERS, VIDEO_END } from "./beats";
import { Backdrop } from "./components/Backdrop";
import { Captions } from "./components/Captions";
import { Header } from "./components/Header";
import { WORDS } from "./cues";
import { VERTICAL } from "./theme";
import "./fonts";

const BEATS = buildBeats();

export const VECTORS_DURATION = Math.ceil(VIDEO_END * VERTICAL.fps);

const frameOf = (s: number) => Math.round(s * VERTICAL.fps);

/**
 * "Why concepts are vectors" — a vertical (9:16) explainer cut to a Hebrew
 * narration. Every scene is placed by a phrase in the voice-over (see
 * beats.ts), captions are word-synced, and the narration track is the slowed
 * version produced by tools/slow-narration.py.
 */
export const VectorsExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#15123a" }}>
      <Backdrop />
      {/* The MP3 decodes about 68 ms late in the renderer (measured against
          ffmpeg's decode, which the word timings are aligned to), so start
          it 2 frames in to keep captions and voice locked. */}
      <Audio src={staticFile("audio/vectors-narration.mp3")} trimBefore={2} />

      {BEATS.map((beat, i) => {
        const from = frameOf(beat.start);
        const to =
          i + 1 < BEATS.length ? frameOf(BEATS[i + 1].start) : VECTORS_DURATION;
        return (
          <Sequence
            key={beat.id}
            from={from}
            durationInFrames={Math.max(1, to - from)}
            name={beat.id}
          >
            {beat.node}
          </Sequence>
        );
      })}

      <Header chapters={CHAPTERS} />

      <Captions words={WORDS} />
    </AbsoluteFill>
  );
};
