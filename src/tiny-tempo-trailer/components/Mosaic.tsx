import React from "react";
import { useCurrentFrame } from "remotion";
import type { ClipData } from "../clipData";
import { GameClip, type Rect } from "./GameClip";

type MosaicProps = {
  readonly tiles: readonly { readonly clip: ClipData; readonly at: number }[];
  readonly cols: number;
  readonly box: Rect;
  readonly gap: number;
  /** Frames between one tile landing and the next: an eighth note. */
  readonly every: number;
  readonly radius?: number;
};

/**
 * Several acts at once, each a recording of one task, landing one per eighth note in
 * reading order. Each tile is cut from the act's own stage; nothing is a thumbnail of
 * something larger.
 */
export const Mosaic: React.FC<MosaicProps> = ({
  tiles,
  cols,
  box,
  gap,
  every,
  radius,
}) => {
  const frame = useCurrentFrame();
  const rows = Math.ceil(tiles.length / cols);
  const w = (box.w - gap * (cols - 1)) / cols;
  const h = (box.h - gap * (rows - 1)) / rows;
  return (
    <>
      {tiles.map((tile, i) => {
        const age = frame - i * every;
        if (age < 0) return null;
        const p = Math.min(1, age / 4);
        const scale = 1 + 0.12 * (1 - p) ** 2;
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <div
            key={tile.clip.id}
            style={{
              position: "absolute",
              left: box.x + col * (w + gap),
              top: box.y + row * (h + gap),
              width: w,
              height: h,
              transform: `scale(${scale})`,
              opacity: Math.min(1, age / 2 + 0.5),
            }}
          >
            <GameClip
              clip={tile.clip}
              at={tile.at}
              box={{ x: 0, y: 0, w, h }}
              plate
              {...(radius !== undefined ? { radius } : {})}
            />
          </div>
        );
      })}
    </>
  );
};
