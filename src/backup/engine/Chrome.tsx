import React from "react";
import { CHAPTERS } from "../data/script";
import { Pixel } from "../pixel/Pixel";
import { C, FONT, ToneColors, clamp01, easeOut, ramp } from "../theme";
import { Segments } from "./kit";

/**
 * The frame around the whole piece once it has "booted": a folder path at
 * the top naming the chapter, and a backup progress bar at the bottom that
 * fills across the video and completes on the last line. The opening line
 * asks for a backup; the video is one.
 */

/** Backup runs from the title to the last spoken word. */
export const BACKUP_FROM = 26.5;
export const BACKUP_TO = 476.9;

export const backupProgress = (now: number): number =>
  clamp01((now - BACKUP_FROM) / (BACKUP_TO - BACKUP_FROM));

export const Chrome: React.FC<{
  readonly now: number;
  readonly tone: ToneColors;
  readonly chapter: number;
  readonly chapterStart: number;
  /** Fades the chrome in after the title. */
  readonly appear: number;
  readonly files: number;
}> = ({ now, tone, chapter, chapterStart, appear, files }) => {
  if (appear <= 0) return null;
  const p = backupProgress(now);
  const done = now >= BACKUP_TO;
  const swap = easeOut(ramp(now, chapterStart, chapterStart + 0.4));
  const ink = tone.sub;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: appear }}>
      {/* Path, top. */}
      <div
        style={{
          position: "absolute",
          top: 150,
          right: 72,
          left: 72,
          display: "flex",
          direction: "rtl",
          alignItems: "center",
          gap: 16,
          fontFamily: FONT.sans,
          fontWeight: 600,
          fontSize: 32,
          color: ink,
          transform: `translateY(${(1 - appear) * -30}px)`,
        }}
      >
        <Pixel name="folder" px={3.2} shadow={false} />
        <span>גיבוי</span>
        <span style={{ opacity: 0.6 }}>‹</span>
        <span
          style={{
            display: "inline-block",
            opacity: swap,
            transform: `translateY(${(1 - swap) * 18}px)`,
          }}
        >
          {String(chapter).padStart(2, "0")} {CHAPTERS[chapter]}
        </span>
      </div>

      {/* Progress, bottom. */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1652,
          direction: "rtl",
          fontFamily: FONT.sans,
          fontWeight: 600,
          fontSize: 28,
          color: ink,
          transform: `translateY(${(1 - appear) * 30}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span>{done ? "הגיבוי הושלם" : "מגבה זיכרונות…"}</span>
          <span>
            {files.toLocaleString("en-US")} קבצים · {Math.floor(p * 100)}%
          </span>
        </div>
        <Segments
          p={p}
          w={900}
          h={38}
          color={done ? C.green : tone.accent}
          track={tone.card}
          line={tone.line === C.amber ? C.amber : tone.sub}
          seg={18}
        />
      </div>
    </div>
  );
};
