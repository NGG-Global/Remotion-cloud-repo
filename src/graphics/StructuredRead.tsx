import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, uiFontFamily } from "../fonts";
import { COLORS } from "../theme";

type StructuredReadProps = {
  readonly width: number;
  readonly height: number;
  /** What each slide of the deck turns out to hold. */
  readonly slides: readonly { readonly label: string; readonly at: number }[];
  /** Frame at which the deck gives way to the spreadsheet. */
  readonly sheetAt: number;
  /** Parts of the table that get recognised, in order. */
  readonly parts: readonly { readonly label: string; readonly at: number }[];
  /** Frame at which the alternative reading is ruled out. */
  readonly heapAt: number;
};

const COLS = 5;
const ROWS = 6;

/**
 * A deck read as slides, and a sheet read as a table.
 *
 * The claim is about structure rather than content, so both halves are drawn
 * as the structure being recognised: a scan crossing the deck and naming what
 * sits on each slide, then the table's own header row, column and formula
 * cells lighting up. The heap of loose numbers beside it is what the claim is
 * denying, and it is easier to deny something the viewer can see.
 */
export const StructuredRead: React.FC<StructuredReadProps> = ({
  width,
  height,
  slides,
  sheetAt,
  parts,
  heapAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SWAP = 20;
  const toSheet = interpolate(frame, [sheetAt, sheetAt + SWAP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {toSheet < 1 ? (
        <div style={{ opacity: 1 - toSheet, position: "absolute", inset: 0 }}>
          <Deck
            width={width}
            height={height}
            slides={slides}
            frame={frame}
            fps={fps}
          />
        </div>
      ) : null}
      {toSheet > 0 ? (
        <div style={{ opacity: toSheet, position: "absolute", inset: 0 }}>
          <Sheet
            width={width}
            height={height}
            parts={parts}
            heapAt={heapAt}
            frame={frame}
          />
        </div>
      ) : null}
    </div>
  );
};

/** The deck: four slides, each one's contents named as a scan reaches it. */
const Deck: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly slides: readonly { readonly label: string; readonly at: number }[];
  readonly frame: number;
  readonly fps: number;
}> = ({ width, height, slides, frame, fps }) => {
  const SLIDE = { width: width * 0.19, height: height * 0.34 };
  const gap = width * 0.025;
  const total = slides.length * SLIDE.width + (slides.length - 1) * gap;
  const startRight = width - (width - total) / 2;
  const top = height * 0.28;

  return (
    <>
      {slides.map((slide, i) => {
        // The first slide named sits rightmost: this is a Hebrew frame.
        const left = startRight - (i + 1) * SLIDE.width - i * gap;
        const pop = spring({
          frame: frame - (6 + i * 5),
          fps,
          config: { damping: 90 },
        });
        const read = interpolate(frame - slide.at, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left,
                top,
                width: SLIDE.width,
                height: SLIDE.height,
                borderRadius: 10,
                background: "#faf9f5",
                border: `2px solid ${read > 0.4 ? COLORS.accent : "transparent"}`,
                opacity: pop,
                transform: `translateY(${(1 - pop) * 18}px)`,
                overflow: "hidden",
              }}
            >
              {/* A slide's worth of content, so "what sits on each" has
                  something to refer to. */}
              <div
                style={{
                  position: "absolute",
                  right: SLIDE.width * 0.09,
                  top: SLIDE.height * 0.12,
                  width: SLIDE.width * 0.55,
                  height: 11,
                  borderRadius: 6,
                  background: read > 0.4 ? COLORS.accent : "#b8b1a5",
                }}
              />
              {[0.72, 0.6, 0.66].map((w, l) => (
                <div
                  key={l}
                  style={{
                    position: "absolute",
                    right: SLIDE.width * 0.09,
                    top: SLIDE.height * (0.34 + l * 0.16),
                    width: SLIDE.width * 0.82 * w,
                    height: 7,
                    borderRadius: 4,
                    background: "#cfc9bd",
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  left: SLIDE.width * 0.07,
                  bottom: SLIDE.height * 0.08,
                  fontFamily: uiFontFamily,
                  fontSize: SLIDE.height * 0.09,
                  fontWeight: 700,
                  color: "#8a8175",
                }}
              >
                {i + 1}
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                left,
                top: top + SLIDE.height + 18,
                width: SLIDE.width,
                textAlign: "center",
                direction: "rtl",
                fontFamily,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.accent,
                opacity: read,
                transform: `translateY(${(1 - read) * 10}px)`,
              }}
            >
              {slide.label}
            </div>
          </React.Fragment>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * 0.1,
          textAlign: "center",
          direction: "rtl",
          fontFamily,
          fontSize: 40,
          fontWeight: 800,
          color: COLORS.text,
          opacity: interpolate(frame, [4, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        במצגת הוא רואה שקפים
      </div>
    </>
  );
};

/** The sheet: a table recognised as a table, beside the reading it is not. */
const Sheet: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly parts: readonly { readonly label: string; readonly at: number }[];
  readonly heapAt: number;
  readonly frame: number;
}> = ({ width, height, parts, heapAt, frame }) => {
  const GRID = { width: width * 0.42, height: height * 0.6 };
  const gridLeft = width * 0.5;
  const gridTop = height * 0.22;
  const cw = GRID.width / COLS;
  const ch = GRID.height / ROWS;

  const at = (i: number) =>
    parts[i]
      ? interpolate(frame - parts[i].at, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const cols = at(0);
  const rows = at(1);
  const formulas = at(2);

  const heap = interpolate(frame - heapAt, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /** Fixed digits, so the heap is the same heap on every frame. */
  const DIGITS = [
    "1,240",
    "88",
    "17.5%",
    "9,310",
    "42",
    "6.2",
    "311",
    "0.94",
    "2,005",
    "73",
    "1.8%",
    "460",
  ];
  const SPOTS = [
    [0.1, 0.18],
    [0.42, 0.1],
    [0.72, 0.22],
    [0.2, 0.42],
    [0.55, 0.38],
    [0.82, 0.5],
    [0.08, 0.62],
    [0.38, 0.66],
    [0.68, 0.74],
    [0.16, 0.84],
    [0.5, 0.9],
    [0.85, 0.86],
  ];

  return (
    <>
      {/* The table. Header row, then a column and the formula cells. */}
      <div
        style={{
          position: "absolute",
          left: gridLeft,
          top: gridTop,
          width: GRID.width,
          height: GRID.height,
        }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const header = r === 0;
          // In a Hebrew sheet the first column sits at the right.
          const firstCol = c === COLS - 1;
          const formulaCell = r === ROWS - 1 && c < COLS - 1;

          const lit = header
            ? cols
            : firstCol
              ? rows
              : formulaCell
                ? formulas
                : 0;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c * cw,
                top: r * ch,
                width: cw - 3,
                height: ch - 3,
                borderRadius: 4,
                background:
                  lit > 0.4
                    ? header
                      ? COLORS.accent
                      : "rgba(217,119,87,0.22)"
                    : COLORS.surface,
                border: `1px solid ${
                  lit > 0.4 ? COLORS.accent : "rgba(255,255,255,0.09)"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: uiFontFamily,
                fontSize: ch * 0.3,
                fontWeight: 600,
                color:
                  header && lit > 0.4 ? COLORS.background : COLORS.textMuted,
                direction: "ltr",
              }}
            >
              {formulaCell && formulas > 0.4 ? "=SUM" : null}
            </div>
          );
        })}
      </div>

      {/* What was recognised, listed beside the table as it happens. */}
      {parts.map((part, i) => {
        const show = interpolate(frame - part.at, [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (show <= 0) {
          return null;
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: gridLeft + GRID.width + 26,
              top: gridTop + 10 + i * 66,
              direction: "rtl",
              fontFamily,
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.accent,
              opacity: show,
              transform: `translateX(${(1 - show) * -16}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {`✓ ${part.label}`}
          </div>
        );
      })}

      {/* And the reading it is not: the same figures with the structure gone. */}
      {heap > 0 ? (
        <div
          style={{
            position: "absolute",
            left: width * 0.05,
            top: gridTop,
            width: width * 0.34,
            height: GRID.height,
            opacity: heap,
          }}
        >
          {DIGITS.map((d, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${SPOTS[i][0] * 100}%`,
                top: `${SPOTS[i][1] * 100}%`,
                fontFamily: uiFontFamily,
                fontSize: 30,
                fontWeight: 600,
                color: COLORS.textMuted,
                opacity: 0.55,
                direction: "ltr",
              }}
            >
              {d}
            </span>
          ))}
          <svg
            width={width * 0.34}
            height={GRID.height}
            style={{ position: "absolute", inset: 0 }}
          >
            <line
              x1={10}
              y1={GRID.height - 10}
              x2={10 + (width * 0.34 - 20) * Math.min(1, heap * 1.6)}
              y2={
                GRID.height - 10 - (GRID.height - 20) * Math.min(1, heap * 1.6)
              }
              stroke={COLORS.warn}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.9}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: GRID.height + 18,
              textAlign: "center",
              direction: "rtl",
              fontFamily,
              fontSize: 30,
              fontWeight: 700,
              color: COLORS.warn,
            }}
          >
            לא ערמת מספרים
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * 0.06,
          textAlign: "center",
          direction: "rtl",
          fontFamily,
          fontSize: 40,
          fontWeight: 800,
          color: COLORS.text,
        }}
      >
        באקסל הוא קורא טבלה כטבלה
      </div>
    </>
  );
};
