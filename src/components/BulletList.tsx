import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE } from "../theme";

type BulletListProps = {
  readonly items: readonly string[];
  /** Frames to wait before the first item appears. */
  readonly delay?: number;
  readonly accentColor?: string;
};

/** Frames between consecutive bullets. */
const ITEM_STAGGER = 8;

/** Bullet list where each row slides in from the left, one after another. */
export const BulletList: React.FC<BulletListProps> = ({
  items,
  delay = 0,
  accentColor = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {items.map((item, index) => {
        const progress = spring({
          frame: frame - delay - index * ITEM_STAGGER,
          fps,
          config: { damping: 200 },
        });

        return (
          <li
            key={`${item}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              fontFamily,
              fontSize: FONT_SIZE.body,
              fontWeight: 400,
              color: COLORS.text,
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [-48, 0])}px)`,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                flexShrink: 0,
                borderRadius: "50%",
                backgroundColor: accentColor,
              }}
            />
            {item}
          </li>
        );
      })}
    </ul>
  );
};
