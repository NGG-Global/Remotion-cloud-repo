import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { APP, FitBox } from "./parts/ClaudeUI";
import {
  SectionHead,
  SkillRow,
  SkillsHeader,
  type SkillSection,
} from "./parts/SkillsUI";

type SkillsListProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  readonly sections: readonly SkillSection[];
  /** Total shown against the Yours tab. Omit to leave the header off. */
  readonly count?: number;
  /** Ring a row, by its position in the flattened list. */
  readonly ring?: readonly { readonly at: number; readonly index: number }[];
  /** Frame at which Turn on is pressed on the shared-but-off row. */
  readonly turnOnAt?: number;
  /**
   * Frame at which the descriptions come forward and the rest of each row
   * recedes — the beat about what Claude actually reads to choose.
   */
  readonly readAt?: number;
};

/**
 * The list is composed in real pixels and the card is sized to its contents,
 * rather than to a fixed design box that the rows then overflow. `FitBox`
 * scales whatever comes out, so a list with six rows simply lands smaller on
 * the frame than one with three — which is right: more rows, less room each.
 */
const CARD_W = 1580;
const PAD_X = 58;
const PAD_Y = 44;
const HEAD_H = 62;
const SECTION_H = 34;
/** Section heading band: the heading's own line plus its margins. */
const SECTION_BAND = SECTION_H * 2.3;
const ROW_H = 116;

export const SkillsList: React.FC<SkillsListProps> = ({
  width,
  height,
  delay = 0,
  sections,
  count,
  ring = [],
  turnOnAt,
  readAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const rowCount = sections.reduce((n, sec) => n + sec.entries.length, 0);
  const headerBand = count === undefined ? 0 : HEAD_H * 1.9;
  const design = {
    width: CARD_W,
    height:
      PAD_Y * 2 +
      headerBand +
      sections.length * SECTION_BAND +
      rowCount * ROW_H,
  };

  const read = readAt
    ? spring({
        frame: local - readAt,
        fps,
        config: { damping: 40, stiffness: 90 },
      })
    : 0;

  const activeIndex = ring.reduce<number | undefined>(
    (found, step) => (local >= step.at ? step.index : found),
    undefined,
  );
  const activeAt = ring.reduce<number>(
    (found, step) => (local >= step.at ? step.at : found),
    0,
  );
  const ringIn = spring({
    frame: local - activeAt,
    fps,
    config: { damping: 200 },
  });

  /**
   * Row tops, walked once so the ring and the rows agree. A section heading
   * takes its own band, so a ring cannot land half a heading out.
   */
  const tops: number[] = [];
  let y = PAD_Y + headerBand;
  const laid = sections.map((section) => {
    const headTop = y;
    y += SECTION_BAND;
    const rows = section.entries.map((entry) => {
      tops.push(y);
      const rowTop = y;
      y += ROW_H;
      return { entry, rowTop };
    });
    return { section, headTop, rows };
  });

  return (
    <FitBox width={width} height={height} design={design}>
      {/* The list sits on the interface's own white, not on the stage. Rows
          drawn straight onto the dark backdrop lose their text entirely — the
          panel is part of what makes this read as the product. */}
      <div
        style={{
          position: "relative",
          width: design.width,
          height: design.height,
          background: APP.panel,
          borderRadius: 22,
          boxShadow: "0 40px 110px rgba(0,0,0,0.5)",
        }}
      >
        {count !== undefined ? (
          <div
            style={{
              position: "absolute",
              top: PAD_Y,
              left: PAD_X,
              right: PAD_X,
            }}
          >
            <SkillsHeader h={HEAD_H} count={count} local={local} at={2} />
          </div>
        ) : null}

        {laid.map(({ section, headTop, rows }) => (
          <React.Fragment key={section.title}>
            <div
              style={{
                position: "absolute",
                top: headTop,
                left: PAD_X,
                right: PAD_X,
              }}
            >
              <SectionHead
                title={section.title}
                count={section.entries.length}
                h={SECTION_H}
                local={local}
                // Headings land early even when their rows are still to come:
                // a card sized for its final contents otherwise reads as
                // broken while the lower half waits.
                at={Math.min(Math.max(0, section.entries[0].at - 6), 16)}
              />
            </div>
            {rows.map(({ entry, rowTop }) => (
              <div
                key={entry.name}
                style={{
                  position: "absolute",
                  top: rowTop,
                  left: PAD_X,
                  right: PAD_X,
                }}
              >
                <SkillRow
                  entry={entry}
                  local={local}
                  h={ROW_H}
                  turnOnAt={entry.off ? turnOnAt : undefined}
                  readIt={read}
                />
              </div>
            ))}
          </React.Fragment>
        ))}

        {activeIndex !== undefined && tops[activeIndex] !== undefined ? (
          <div
            style={{
              position: "absolute",
              left: PAD_X * 0.5,
              top: tops[activeIndex] - ROW_H * 0.05,
              width: design.width - PAD_X,
              height: ROW_H * 1.04,
              borderRadius: 16,
              border: `4px solid ${APP.coral}`,
              boxShadow: `0 0 34px ${APP.coral}55`,
              opacity: ringIn,
              transform: `scale(${interpolate(ringIn, [0, 1], [1.03, 1])})`,
            }}
          />
        ) : null}
      </div>
    </FitBox>
  );
};
