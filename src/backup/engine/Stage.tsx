import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ToneColors, beatPulse, rand } from "../theme";

/**
 * The paper the video is printed on: the tone's colour, a soft light behind
 * the text that breathes with the music, film grain, and on the cold open
 * the scanlines and curvature of an old monitor.
 */
export const Stage: React.FC<{
  readonly tone: ToneColors;
  readonly now: number;
  readonly frame: number;
  /** 0 = paper, 1 = amber monitor. */
  readonly crt: number;
}> = ({ tone, now, frame, crt }) => {
  const pulse = beatPulse(now);
  // Grain moves every other frame, like film, not every frame like noise.
  const step = Math.floor(frame / 2);
  const gx = Math.floor(rand(step) * 512);
  const gy = Math.floor(rand(step + 991) * 512);
  return (
    <AbsoluteFill style={{ background: tone.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 45% at 50% 38%, ${tone.bg2} 0%, ${tone.bg2}00 100%)`,
          opacity: 0.85 + pulse * 0.15,
        }}
      />
      <AbsoluteFill
        style={{
          overflow: "hidden",
          opacity: tone.grain,
          mixBlendMode: "overlay",
        }}
      >
        {/* Tiled with <Img> so the render waits for the file, offset per step. */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Img
            key={i}
            src={staticFile("backup/grain.png")}
            style={{
              position: "absolute",
              left: (i % 4) * 512 - gx,
              top: Math.floor(i / 4) * 512 - gy,
              width: 512,
              height: 512,
            }}
          />
        ))}
      </AbsoluteFill>
      {crt > 0 ? (
        <AbsoluteFill
          style={{
            opacity: crt,
            background:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)",
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.16 + crt * 0.5}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
