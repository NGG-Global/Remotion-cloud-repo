import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KineticText } from "../components/KineticText";
import { Spark } from "../components/Spark";
import { Stage } from "../components/Stage";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";

type ChapterCardProps = {
  /** Chapter number, shown as an oversized ghosted numeral. */
  readonly index: number;
  readonly title: string;
  readonly note?: string;
};

/**
 * Section divider. The numeral sits behind the title as a watermark, which
 * gives the card depth without another element competing for attention.
 */
export const ChapterCard: React.FC<ChapterCardProps> = ({
  index,
  title,
  note,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enter = interpolate(frame, [0, seconds(0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.4), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Numeral slides slowly across the card behind the text.
  const numeralShift = interpolate(frame, [0, durationInFrames], [40, -40]);

  return (
    <Stage glow={0.5}>
      <AbsoluteFill style={{ opacity: enter * exit }}>
        <div
          style={{
            position: "absolute",
            left: 120,
            top: "50%",
            transform: `translateY(-50%) translateX(${numeralShift}px)`,
            fontFamily,
            fontSize: 620,
            fontWeight: 800,
            lineHeight: 0.8,
            color: COLORS.accent,
            opacity: 0.09,
            userSelect: "none",
          }}
        >
          {index}
        </div>

        <AbsoluteFill
          style={{
            justifyContent: "center",
            padding: "0 170px",
            direction: "rtl",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <Spark size={78} delay={2} spokes={10} />
            <div
              style={{
                fontFamily,
                fontSize: FONT_SIZE.caption,
                fontWeight: 600,
                letterSpacing: "0.16em",
                color: COLORS.accentSoft,
              }}
            >
              {`פרק ${index}`}
            </div>
          </div>

          <div style={{ marginTop: 34 }}>
            <KineticText
              text={title}
              delay={seconds(0.3)}
              fontSize={FONT_SIZE.heading}
              fontWeight={800}
              maxWidth={1450}
              stagger={2.5}
            />
          </div>

          {note ? (
            <div style={{ marginTop: 30 }}>
              <KineticText
                text={note}
                delay={seconds(0.75)}
                fontSize={FONT_SIZE.body}
                fontWeight={400}
                color={COLORS.textMuted}
                maxWidth={1300}
                stagger={1.1}
              />
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
    </Stage>
  );
};
