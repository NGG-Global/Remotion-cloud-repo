import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

/** How far a thing reaches across the grid of conversations. */
export type Reach = "one" | "row" | "all";

export type ScopeColumn = {
  readonly title: string;
  readonly note: string;
  readonly icon: IconName;
  readonly reach: Reach;
  /** Frame at which this column arrives. */
  readonly at: number;
  /** Frame at which its reach lights up on the grid. */
  readonly lightAt: number;
};

type ScopeCompareProps = {
  readonly width: number;
  readonly height: number;
  /** Right to left in the order given. */
  readonly columns: readonly ScopeColumn[];
  /** Caption under every grid, naming what a cell is. */
  readonly gridLabel?: string;
};

/** Conversations, laid out as two subjects of three conversations each. */
const ROWS = 2;
const COLS = 3;

/**
 * Three things that sound alike, told apart by how far each one reaches.
 *
 * A chat request, a project and a skill are all "things you set up for
 * Claude", and the narration says outright that this is where people get
 * confused. Definitions side by side do not fix that — they are three more
 * sentences to hold. What separates them is scope, so each column gets the
 * same grid of conversations underneath it and lights the part it covers: one
 * cell, one subject's row, or every cell on the board. The difference stops
 * being a claim and becomes something you can see at a glance.
 */
export const ScopeCompare: React.FC<ScopeCompareProps> = ({
  width,
  height,
  columns,
  gridLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const n = columns.length;
  const gap = width * 0.03;
  const colW = (width - gap * (n - 1)) / n;
  // Right to left: the first column named sits rightmost.
  const colLeft = (i: number) => width - (i + 1) * colW - i * gap;

  const cardH = height * 0.44;
  const gridTop = cardH + height * 0.08;
  const gridH = height * (gridLabel ? 0.34 : 0.42);

  const cellGap = colW * 0.045;
  const cellW = (colW * 0.82 - cellGap * (COLS - 1)) / COLS;
  const cellH = (gridH - cellGap * (ROWS - 1)) / ROWS;
  const gridLeft = (colW - (cellW * COLS + cellGap * (COLS - 1))) / 2;

  /** Whether a cell is covered, for each kind of reach. */
  const covered = (reach: Reach, row: number, col: number) => {
    if (reach === "one") {
      return row === 0 && col === 0;
    }
    if (reach === "row") {
      return row === 0;
    }
    return true;
  };

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {columns.map((column, i) => {
        const arrive = spring({
          frame: frame - column.at,
          fps,
          config: { damping: 200 },
        });
        if (arrive <= 0.001) {
          return null;
        }

        return (
          <React.Fragment key={column.title}>
            <div
              style={{
                position: "absolute",
                left: colLeft(i),
                top: 0,
                width: colW,
                height: cardH,
                borderRadius: 26,
                background: COLORS.surface,
                border: `1px solid rgba(255,255,255,0.08)`,
                opacity: arrive,
                transform: `translateY(${interpolate(arrive, [0, 1], [30, 0])}px)`,
                padding: `${cardH * 0.11}px ${colW * 0.08}px`,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: cardH * 0.09,
              }}
            >
              <LineIcon
                name={column.icon}
                size={cardH * 0.2}
                color={COLORS.accent}
                delay={column.at + 4}
              />
              <div
                style={{
                  fontFamily,
                  fontSize: cardH * 0.155,
                  fontWeight: 800,
                  color: COLORS.text,
                }}
              >
                {column.title}
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: cardH * 0.1,
                  fontWeight: 400,
                  lineHeight: 1.35,
                  color: COLORS.textMuted,
                }}
              >
                {column.note}
              </div>
            </div>

            {/* The same board under every column; only the lit part differs. */}
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: COLS }, (_, col) => {
                const isOn = covered(column.reach, row, col);
                const order = row * COLS + col;
                const light = isOn
                  ? interpolate(
                      frame - column.lightAt - order * 3,
                      [0, 12],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    )
                  : 0;

                return (
                  <div
                    key={`${i}-${row}-${col}`}
                    style={{
                      position: "absolute",
                      left:
                        colLeft(i) +
                        gridLeft +
                        (COLS - 1 - col) * (cellW + cellGap),
                      top: gridTop + row * (cellH + cellGap),
                      width: cellW,
                      height: cellH,
                      borderRadius: 12,
                      background: `rgba(217,119,87,${0.2 * light})`,
                      border: `1.5px solid ${
                        light > 0.05
                          ? `rgba(217,119,87,${0.4 + 0.5 * light})`
                          : "rgba(255,255,255,0.09)"
                      }`,
                      opacity: arrive,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: cellH * 0.1,
                      flexDirection: "column",
                    }}
                  >
                    {/* A conversation, drawn as two short lines. */}
                    {[0.62, 0.42].map((w, b) => (
                      <div
                        key={b}
                        style={{
                          width: `${w * 100}%`,
                          height: Math.max(2, cellH * 0.07),
                          borderRadius: 999,
                          background:
                            light > 0.4
                              ? COLORS.accentSoft
                              : "rgba(255,255,255,0.16)",
                        }}
                      />
                    ))}
                  </div>
                );
              }),
            )}
          </React.Fragment>
        );
      })}

      {gridLabel ? (
        <div
          style={{
            position: "absolute",
            top: gridTop + gridH + height * 0.03,
            right: 0,
            left: 0,
            textAlign: "center",
            fontFamily,
            fontSize: height * 0.042,
            fontWeight: 500,
            color: COLORS.textMuted,
            opacity: interpolate(frame - columns[0].lightAt, [0, 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {gridLabel}
        </div>
      ) : null}
    </div>
  );
};
