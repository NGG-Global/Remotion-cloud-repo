import React from "react";
import { useCurrentFrame } from "remotion";
import type { ClipData } from "../clipData";
import { GameClip, type Rect } from "./GameClip";

type MosaicProps = {
  readonly tiles: readonly { readonly clip: ClipData; readonly at: number }[];
  readonly cols: number;
  /** The area the grid may use; the grid is fitted inside it and centred. */
  readonly box: Rect;
  readonly gap: number;
  /** The part of each recording to show, in its own pixels. */
  readonly crop: Rect;
  /** Frames between one tile landing and the next: an eighth note. */
  readonly every: number;
  readonly radius?: number;
};

/**
 * Several acts at once, landing one per eighth note in reading order. The tiles are the
 * game's website recordings, one task of each act, and are shown whole at the crop's own
 * aspect rather than cropped to fill, so no act loses its subject to the grid.
 */
export const Mosaic: React.FC<MosaicProps> = ({
  tiles,
  cols,
  box,
  gap,
  crop,
  every,
  radius,
}) => {
  const frame = useCurrentFrame();
  const rows = Math.ceil(tiles.length / cols);
  const aspect = crop.w / crop.h;
  const w = Math.min(
    (box.w - gap * (cols - 1)) / cols,
    ((box.h - gap * (rows - 1)) / rows) * aspect,
  );
  const h = w / aspect;
  const left = box.x + (box.w - (w * cols + gap * (cols - 1))) / 2;
  const top = box.y + (box.h - (h * rows + gap * (rows - 1))) / 2;
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
              left: left + col * (w + gap),
              top: top + row * (h + gap),
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
              crop={crop}
              plate
              {...(radius !== undefined ? { radius } : {})}
            />
          </div>
        );
      })}
    </>
  );
};
