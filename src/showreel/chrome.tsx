import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { uiFontFamily } from "../fonts";
import { REEL, clamp } from "./theme";

export type Chapter = {
  readonly at: number;
  readonly dur: number;
  readonly title: string;
  readonly pack: string;
};

export const Chrome: React.FC<{
  readonly chapters: readonly Chapter[];
}> = ({ chapters }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const chapter =
    [...chapters].reverse().find((c) => frame >= c.at) ?? chapters[0];
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          display: "flex",
          gap: 16,
          alignItems: "baseline",
          fontFamily: uiFontFamily,
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
          Showreel
        </span>
        <span style={{ fontSize: 18, color: REEL.muted }}>{chapter.title}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 48,
          fontFamily: uiFontFamily,
          fontSize: 16,
          fontWeight: 500,
          color: REEL.muted,
          letterSpacing: "0.04em",
        }}
      >
        {chapter.pack}
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

export const Stage: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: REEL.bg, color: REEL.ink }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(90% 70% at 50% 18%, rgba(11,132,243,0.18) 0%, transparent 58%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

export const Kicker: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      fontFamily: uiFontFamily,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: REEL.blue,
      marginBottom: 18,
    }}
  >
    {children}
  </div>
);
