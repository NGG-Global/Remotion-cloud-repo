import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

type PdfHuntProps = {
  readonly width: number;
  readonly height: number;
  /** How many pages the document has. */
  readonly pages?: number;
  /** Frame at which the scrolling starts. */
  readonly scrollAt: number;
  /** Frame at which the wanted paragraph is finally found. */
  readonly foundAt: number;
  /** Frame at which it is copied out into the other document. */
  readonly copyAt: number;
};

/** Line widths per page, so every page looks written without looking alike. */
const PAGE_LINES = [0.94, 0.86, 0.97, 0.8, 0.91, 0.72, 0.88, 0.63] as const;

/**
 * The hunt through a long PDF for the one paragraph that matters.
 *
 * The hook is about tedium, so the animation has to cost the viewer something
 * too: the page counter runs away, the scrollbar thumb shrinks to a sliver,
 * and the paragraph is not found until the counter has nearly run out. A
 * tidy diagram of "PDF to Word" would describe the task without conveying
 * why anyone would want to stop doing it.
 */
export const PdfHunt: React.FC<PdfHuntProps> = ({
  width,
  height,
  pages = 40,
  scrollAt,
  foundAt,
  copyAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const VIEW = { width: width * 0.36, height: height * 0.88 };
  const viewLeft = width * 0.56;
  const viewTop = (height - VIEW.height) / 2;

  const DOC = { width: width * 0.32, height: height * 0.7 };
  const docLeft = width * 0.07;
  const docTop = (height - DOC.height) / 2;

  const pageHeight = VIEW.height * 0.82;
  const pageGap = VIEW.height * 0.07;

  // Position in the document, 0-1. Eased so it starts fast and lands on the
  // paragraph rather than stopping arbitrarily.
  const through = interpolate(frame, [scrollAt, foundAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.18, 0.7, 0.3, 1),
  });
  const pageNumber = Math.min(
    pages,
    Math.max(1, Math.round(1 + through * (pages - 1))),
  );
  const offset = through * (pages - 1) * (pageHeight + pageGap);

  const found = interpolate(frame - foundAt, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const copy = interpolate(frame - copyAt, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const appear = spring({ frame, fps, config: { damping: 90 } });

  // Only the pages within the viewport are drawn: forty of them would be
  // forty subtrees per frame for no visible gain.
  const first = Math.max(0, Math.floor(through * (pages - 1)) - 1);
  const visible = [first, first + 1, first + 2].filter((n) => n < pages);

  const wantedLine = 4;
  const foundTopInPage =
    (pageHeight / PAGE_LINES.length) * wantedLine + pageHeight * 0.06;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* The document being written into. Nearly empty: that is the point. */}
      <div
        style={{
          position: "absolute",
          left: docLeft,
          top: docTop,
          width: DOC.width,
          height: DOC.height,
          borderRadius: 14,
          background: "#faf9f5",
          opacity: appear * (0.35 + copy * 0.65),
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 22,
            direction: "rtl",
            fontFamily,
            fontSize: 26,
            fontWeight: 700,
            color: "#8a8175",
          }}
        >
          מסמך חדש
        </div>
        {/* The pasted paragraph, arriving at the end. */}
        {copy > 0.55 ? (
          <div
            style={{
              position: "absolute",
              right: 22,
              left: 22,
              top: DOC.height * 0.24,
              height: 14,
              borderRadius: 7,
              background: COLORS.warn,
              opacity: interpolate(copy, [0.55, 0.85], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        ) : null}
      </div>

      {/* The PDF viewport. */}
      <div
        style={{
          position: "absolute",
          left: viewLeft,
          top: viewTop,
          width: VIEW.width,
          height: VIEW.height,
          borderRadius: 16,
          background: COLORS.surface,
          border: `1px solid rgba(255,255,255,0.1)`,
          overflow: "hidden",
          opacity: appear,
        }}
      >
        {visible.map((n) => {
          const top = VIEW.height * 0.09 + n * (pageHeight + pageGap) - offset;
          const isLast = n === pages - 1;
          return (
            <div
              key={n}
              style={{
                position: "absolute",
                left: VIEW.width * 0.07,
                top,
                width: VIEW.width * 0.8,
                height: pageHeight,
                borderRadius: 8,
                background: "#faf9f5",
                overflow: "hidden",
              }}
            >
              {PAGE_LINES.map((w, l) => {
                const wanted = isLast && l === wantedLine;
                return (
                  <div
                    key={l}
                    style={{
                      position: "absolute",
                      right: VIEW.width * 0.06,
                      top:
                        pageHeight * 0.06 +
                        (l * pageHeight) / PAGE_LINES.length,
                      width: VIEW.width * 0.68 * w,
                      height: 9,
                      borderRadius: 5,
                      background:
                        wanted && found > 0.3 ? COLORS.warn : "#cfc9bd",
                      opacity: wanted && found > 0.3 ? 1 : 0.85,
                    }}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Scrollbar. The thumb is a sliver from the start, which says how
            long the document is before the counter has to. */}
        <div
          style={{
            position: "absolute",
            left: VIEW.width * 0.94,
            top: VIEW.height * 0.06,
            width: 8,
            height: VIEW.height * 0.88,
            borderRadius: 4,
            background: "rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 8,
              height: VIEW.height * 0.055,
              borderRadius: 4,
              background: COLORS.textMuted,
              top: through * (VIEW.height * 0.88 - VIEW.height * 0.055),
            }}
          />
        </div>

        {/* Page counter. */}
        <div
          style={{
            position: "absolute",
            left: VIEW.width * 0.07,
            top: VIEW.height * 0.025,
            direction: "ltr",
            fontFamily,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.textMuted,
            background: "rgba(12,10,8,0.72)",
            padding: "4px 14px",
            borderRadius: 999,
          }}
        >
          {`${pageNumber} / ${pages}`}
        </div>
      </div>

      {/* The ring on the paragraph, and its flight across to the document. */}
      {found > 0 ? (
        <div
          style={{
            position: "absolute",
            left: interpolate(
              copy,
              [0, 1],
              [viewLeft + VIEW.width * 0.13, docLeft + 22],
            ),
            top: interpolate(
              copy,
              [0, 1],
              [
                viewTop + VIEW.height * 0.09 + foundTopInPage,
                docTop + DOC.height * 0.24,
              ],
            ),
            width: interpolate(
              copy,
              [0, 1],
              [VIEW.width * 0.6, DOC.width - 44],
            ),
            height: 30,
            borderRadius: 8,
            border: `3px solid ${COLORS.warn}`,
            background: `rgba(224,163,74,${0.16 + copy * 0.12})`,
            opacity: found * (1 - Math.max(0, (copy - 0.7) / 0.3)),
          }}
        />
      ) : null}
    </div>
  );
};
