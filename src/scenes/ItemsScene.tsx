import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KineticText } from "../components/KineticText";
import { Stage } from "../components/Stage";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";

export type Item = {
  readonly text: string;
  /** Optional leading marker: a numeral, or a short glyph. */
  readonly marker?: string;
  /** Frames after the scene start at which this row appears. */
  readonly at?: number;
};

type ItemsSceneProps = {
  readonly kicker?: string;
  readonly heading?: string;
  readonly items: readonly Item[];
  /** Frames between rows when an item has no explicit `at`. */
  readonly stagger?: number;
  readonly accent?: string;
  /** Draw rows as boxed cards rather than a plain list. */
  readonly variant?: "list" | "cards";
  /**
   * Fixed width for the text block, in pixels.
   *
   * By default the block shrinks onto its widest row, which centres each
   * scene's own mass. Give a run of consecutive scenes the same width instead,
   * so the heading does not jump sideways from one cut to the next.
   */
  readonly blockWidth?: number;
};

const Row: React.FC<{
  readonly item: Item;
  readonly delay: number;
  readonly accent: string;
  readonly boxed: boolean;
}> = ({ item, delay, accent, boxed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        opacity: progress,
        // Rows arrive from the right, matching the reading direction.
        transform: `translateX(${interpolate(progress, [0, 1], [56, 0])}px)`,
        backgroundColor: boxed ? COLORS.surface : undefined,
        border: boxed ? `1px solid rgba(255,255,255,0.07)` : undefined,
        borderRadius: boxed ? 20 : undefined,
        padding: boxed ? "26px 34px" : undefined,
      }}
    >
      {item.marker ? (
        <div
          style={{
            flexShrink: 0,
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: `${accent}22`,
            border: `2px solid ${accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontSize: 32,
            fontWeight: 700,
            color: accent,
          }}
        >
          {item.marker}
        </div>
      ) : (
        <div
          style={{
            flexShrink: 0,
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: accent,
          }}
        />
      )}

      <div
        style={{
          fontFamily,
          fontSize: FONT_SIZE.body,
          fontWeight: 500,
          lineHeight: 1.35,
          color: COLORS.text,
        }}
      >
        {item.text}
      </div>
    </div>
  );
};

/**
 * Heading with a staggered list underneath.
 *
 * Carries the enumerated stretches of the narration — the four task types and
 * their examples, and the three cautions.
 */
export const ItemsScene: React.FC<ItemsSceneProps> = ({
  kicker,
  heading,
  items,
  stagger = 12,
  accent = COLORS.accent,
  variant = "list",
  blockWidth,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.35), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const headingDelay = kicker ? seconds(0.3) : 0;
  const firstRow = headingDelay + (heading ? seconds(0.55) : seconds(0.15));

  return (
    <Stage glow={0.6}>
      <AbsoluteFill
        style={{
          opacity: exit,
          direction: "rtl",
          justifyContent: "center",
          padding: "0 140px",
        }}
      >
        {/* `fit-content` collapses the block onto its widest row, so `margin:
            auto` centres the text's actual mass. Padding alone would pin a
            short list against the right edge and leave the frame lopsided. */}
        <div
          style={{
            width: blockWidth ?? "fit-content",
            maxWidth: 1560,
            margin: "0 auto",
          }}
        >
          {kicker ? (
            <div style={{ marginBottom: 22 }}>
              <KineticText
                text={kicker}
                fontSize={FONT_SIZE.caption}
                fontWeight={600}
                color={accent}
                stagger={1.4}
              />
            </div>
          ) : null}

          {heading ? (
            <KineticText
              text={heading}
              delay={headingDelay}
              fontSize={FONT_SIZE.subheading}
              fontWeight={800}
              maxWidth={1500}
              stagger={2}
            />
          ) : null}

          <div
            style={{
              marginTop: heading ? 52 : 0,
              display: "flex",
              flexDirection: "column",
              gap: variant === "cards" ? 22 : 30,
            }}
          >
            {items.map((item, index) => (
              <Row
                key={`${item.text}-${index}`}
                item={item}
                delay={item.at ?? firstRow + index * stagger}
                accent={accent}
                boxed={variant === "cards"}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
