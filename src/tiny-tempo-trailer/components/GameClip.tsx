import React from "react";
import { OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import type { ClipData } from "../clipData";
import { PANEL, shade, TT } from "../theme";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

type GameClipProps = {
  readonly clip: ClipData;
  /** Clip seconds shown on this sequence's first frame. */
  readonly at: number;
  /** Where the shot sits on the canvas. */
  readonly box: Rect;
  /** The region of the recording to show, in its own pixels. Defaults to the whole frame. */
  readonly crop?: Rect;
  readonly fit?: "cover" | "contain";
  /** A multiplier on the fitted scale, for a slow push; the crop's centre stays put. */
  readonly scale?: number;
  /** Dress the shot as one of the game's slabs: rounded, ink-edged, with thickness. */
  readonly plate?: boolean;
  readonly radius?: number;
  readonly opacity?: number;
};

/**
 * A piece of recorded gameplay, framed. The recordings are the game drawn by the game,
 * so this never redraws anything: it crops, scales and places. `at` is in clip seconds
 * so a shot can be written as "the demonstration downbeat of task 3 lands on bar 9".
 */
export const GameClip: React.FC<GameClipProps> = ({
  clip,
  at,
  box,
  crop,
  fit = "cover",
  scale = 1,
  plate = false,
  radius = PANEL.radius,
  opacity = 1,
}) => {
  const { fps } = useVideoConfig();
  if (at < 0) {
    throw new Error(
      `${clip.id}: a shot cannot start ${(-at).toFixed(2)} s before the recording`,
    );
  }
  const region = crop ?? { x: 0, y: 0, w: clip.width, h: clip.height };
  const base =
    fit === "cover"
      ? Math.max(box.w / region.w, box.h / region.h)
      : Math.min(box.w / region.w, box.h / region.h);
  const s = base * scale;
  const left = box.w / 2 - (region.x + region.w / 2) * s;
  const top = box.h / 2 - (region.y + region.h / 2) * s;

  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        overflow: "hidden",
        borderRadius: plate ? radius : 0,
        backgroundColor: TT.paper,
        opacity,
        boxShadow: plate
          ? `0 0 0 ${PANEL.outline}px ${TT.inkDeep}, 0 ${PANEL.depth}px 0 ${PANEL.outline}px ${shade(TT.inkDeep, -0.25)}`
          : "none",
      }}
    >
      <OffthreadVideo
        src={staticFile(clip.file)}
        trimBefore={Math.round(at * fps)}
        muted
        style={{
          position: "absolute",
          left,
          top,
          width: clip.width * s,
          height: clip.height * s,
          // Tailwind's preflight caps every img at its container's width, which shrank
          // any shot pushed in past its own box.
          maxWidth: "none",
          maxHeight: "none",
        }}
      />
    </div>
  );
};
