import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import cues from "./data/subtitles.json";
import type { Cue } from "./data/types";

/**
 * English subtitles, set where the Hebrew ones were burned in: centred,
 * white, with a soft dark shadow, on the same cue timings.
 */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cue = (cues as Cue[]).find((c) => t >= c.from && t < c.to);
  if (!cue) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 985,
          textAlign: "center",
          fontFamily,
          fontWeight: 500,
          fontSize: 40,
          lineHeight: 1.15,
          color: "#ffffff",
          textShadow: "0 2px 6px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
          direction: "ltr",
        }}
      >
        {cue.en}
      </div>
    </AbsoluteFill>
  );
};
