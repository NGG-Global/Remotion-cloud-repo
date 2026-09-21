import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { uiFontFamily } from "../fonts";
import { clamp, REEL } from "../showreel/theme";

export type Chapter = {
  readonly at: number;
  readonly dur: number;
  readonly title: string;
  readonly pack: string;
};

export const Overlay: React.FC<{
  readonly chapters: readonly Chapter[];
}> = ({ chapters }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const chapter =
    [...chapters].reverse().find((c) => frame >= c.at) ?? chapters[0];
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: uiFontFamily }}>
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          display: "flex",
          gap: 16,
          alignItems: "baseline",
          color: REEL.ink,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: REEL.blue,
          }}
        >
          Remotion 3D
        </span>
        <span style={{ fontSize: 18, color: REEL.muted }}>{chapter.title}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 48,
          fontSize: 16,
          fontWeight: 500,
          color: REEL.muted,
        }}
      >
        {chapter.pack}
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 120,
          maxWidth: 1100,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: REEL.blue,
            marginBottom: 12,
          }}
        >
          @remotion/three · react three fiber
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            color: REEL.ink,
          }}
        >
          {chapter.title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 28,
          height: 3,
          background: REEL.line,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: REEL.blue,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
