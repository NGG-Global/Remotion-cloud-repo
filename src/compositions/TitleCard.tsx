import { zColor } from "@remotion/zod-types";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { Backdrop } from "../components/Backdrop";
import { FadeIn } from "../components/FadeIn";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";

/**
 * Zod schema for the composition props.
 *
 * Passing this as `schema` to `<Composition>` gives two things: an editable
 * props form in the Studio's right-hand panel, and validation of any
 * `--props` payload handed to `remotion render`. `zColor()` renders as a
 * colour picker rather than a plain text field.
 */
export const titleCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accentColor: zColor(),
});

export type TitleCardProps = z.infer<typeof titleCardSchema>;

export const titleCardDefaultProps: TitleCardProps = {
  title: "Programmatic video, in React",
  subtitle: "Every frame is a component. Every timing is data.",
  accentColor: COLORS.accent,
};

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Accent rule wipes out from the left once the headline has settled.
  const ruleProgress = spring({
    frame: frame - seconds(0.6),
    fps,
    config: { damping: 200 },
  });

  // Hold the last half second on a fade to black so the card can be cut
  // against other footage without a hard jump.
  const outro = interpolate(
    frame,
    [durationInFrames - seconds(0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: outro }}>
      <Backdrop accentColor={accentColor} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 160px",
        }}
      >
        <AnimatedHeadline text={title} fontSize={FONT_SIZE.display} />

        <div
          style={{
            marginTop: 48,
            height: 6,
            borderRadius: 3,
            backgroundColor: accentColor,
            // scaleX from a left origin keeps the wipe anchored to the text.
            transform: `scaleX(${ruleProgress})`,
            transformOrigin: "left center",
            width: 240,
          }}
        />

        {/* Sequence shifts the child's own frame counter, so FadeIn can stay
            delay-free and still start a beat after the rule. */}
        <Sequence from={seconds(0.9)} layout="none">
          <FadeIn>
            <p
              style={{
                margin: "40px 0 0",
                fontFamily,
                fontSize: FONT_SIZE.body,
                fontWeight: 400,
                color: COLORS.textMuted,
                maxWidth: 1100,
              }}
            >
              {subtitle}
            </p>
          </FadeIn>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
