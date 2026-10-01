import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useClock } from "../../clock";
import { TT } from "../../theme";
import { Landscape } from "../Landscape";
import { Act, FRAMING } from "./ActV";

type Cell = {
  readonly act: Act;
  readonly hits: readonly number[];
  /** Seconds into the scene the cell pops in. */
  readonly enter: number;
};

type GridVProps = {
  readonly cells: readonly Cell[];
  readonly columns: number;
  readonly top: number;
  readonly bottom: number;
  readonly gap?: number;
  readonly background?: string;
  /** Slow scale of the whole wall over the scene, so a held grid still moves. */
  readonly drift?: number;
};

/**
 * A wall of acts, each cell a tight crop of one stage, popping in on its own
 * beat and hitting on the music with the rest. Used for the fill bar (four
 * cells, one per quarter note) and the closing wall (six at once).
 */
export const GridV: React.FC<GridVProps> = ({
  cells,
  columns,
  top,
  bottom,
  gap = 22,
  background = TT.inkDeep,
  drift = 0.03,
}) => {
  const { frame, fps, durationInFrames } = useClock();
  const rows = Math.ceil(cells.length / columns);
  const margin = gap;
  const cellW = (1080 - margin * 2 - gap * (columns - 1)) / columns;
  const cellH = (1920 - top - bottom - gap * (rows - 1)) / rows;
  const cellScale = cellH / 1080;
  const wall = 1 + interpolate(frame, [0, durationInFrames], [0, drift]);

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <AbsoluteFill
        style={{ transform: `scale(${wall})`, transformOrigin: "50% 50%" }}
      >
        {cells.map((cell, i) => {
          const col = i % columns;
          const row = Math.floor(i / columns);
          const enter = spring({
            frame: frame - Math.round(cell.enter * fps),
            fps,
            config: { damping: 11, mass: 0.7, stiffness: 190 },
          });
          const framing = FRAMING[cell.act];
          const Graphic = framing.Graphic;
          return (
            <div
              key={`${cell.act}-${i}`}
              style={{
                position: "absolute",
                left: margin + col * (cellW + gap),
                top: top + row * (cellH + gap),
                width: cellW,
                height: cellH,
                borderRadius: 36,
                overflow: "hidden",
                border: `7px solid ${TT.inkDeep}`,
                boxShadow: `0 10px 0 ${TT.coral}`,
                background: TT.paper,
                opacity: interpolate(enter, [0, 0.3], [0, 1], {
                  extrapolateRight: "clamp",
                }),
                transform: `scale(${0.7 + enter * 0.3})`,
              }}
            >
              <Landscape
                width={cellW - 14}
                height={cellH - 14}
                scale={cellScale * 1.02}
                focusX={framing.focusX}
                focusY={framing.focusY}
              >
                <Graphic hits={cell.hits} />
              </Landscape>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
