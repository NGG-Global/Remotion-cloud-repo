import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../motion";
import { C, DISPLAY } from "../theme";

export type Chapter = { readonly title: string; readonly start: number };

/**
 * Persistent top bar: which part of the video this is, and a thin progress
 * line so a long vertical video always says how far along it is. Rendered at
 * the top level, so the progress reads the whole video's length.
 */
export const Header: React.FC<{ readonly chapters: readonly Chapter[] }> = ({
  chapters,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const progress = frame / Math.max(1, durationInFrames - 1);

  let idx = 0;
  chapters.forEach((ch, i) => {
    if (t >= ch.start) idx = i;
  });
  const chapter = chapters[idx];
  const swap = interpolate(
    t,
    [chapter.start, chapter.start + 0.4],
    [0, 1],
    CLAMP,
  );
  const parts = chapters.length - 1;

  return (
    <div
      style={{ position: "absolute", left: 0, right: 0, top: 0, height: 200 }}
    >
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 92,
          height: 10,
          borderRadius: 5,
          background: "rgba(255,255,255,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            // Hebrew reads right to left, so progress fills from the right.
            position: "absolute",
            right: 0,
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 5,
            background: `linear-gradient(270deg, ${C.sky}, ${C.purple}, ${C.pink})`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 124,
          display: "flex",
          direction: "rtl",
          alignItems: "center",
          gap: 16,
          fontFamily: DISPLAY,
          fontWeight: 600,
          fontSize: 36,
          color: C.text,
          opacity: swap,
          transform: `translateY(${(1 - swap) * 10}px)`,
        }}
      >
        <span
          style={{
            background: C.yellow,
            color: C.ink,
            borderRadius: 999,
            padding: "4px 18px",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {idx === 0 ? "פתיחה" : `חלק ${idx}/${parts}`}
        </span>
        <span>{chapter.title}</span>
      </div>
    </div>
  );
};
