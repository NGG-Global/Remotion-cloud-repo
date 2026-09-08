import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KineticText } from "../components/KineticText";
import { Spark } from "../components/Spark";
import { Stage } from "../components/Stage";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";

type TitleSceneProps = {
  /** Small line above the title, e.g. a series name. */
  readonly kicker?: string;
  readonly title: string;
  readonly subtitle?: string;
};

/** Opening card: the mark blooms, then the title rises under it. */
export const TitleScene: React.FC<TitleSceneProps> = ({
  kicker,
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Hold the last beat on a fade so the cut into the first chapter is soft.
  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // The mark drifts up slightly as the text arrives, so the composition
  // settles instead of sitting still.
  const lift = interpolate(frame, [0, seconds(2.2)], [0, -26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage>
      <AbsoluteFill
        style={{
          opacity: exit,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ transform: `translateY(${lift}px)` }}>
          <Spark size={210} delay={4} />
        </div>

        <div
          style={{
            marginTop: 54,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
            direction: "rtl",
            textAlign: "center",
          }}
        >
          {kicker ? (
            <Sequence from={seconds(0.7)} layout="none">
              <KineticText
                text={kicker}
                fontSize={FONT_SIZE.caption}
                fontWeight={500}
                color={COLORS.accentSoft}
                align="center"
                stagger={1.5}
              />
            </Sequence>
          ) : null}

          <Sequence from={seconds(1)} layout="none">
            <KineticText
              text={title}
              fontSize={FONT_SIZE.display}
              fontWeight={800}
              align="center"
              maxWidth={1500}
              stagger={3}
            />
          </Sequence>

          {subtitle ? (
            <Sequence from={seconds(1.9)} layout="none">
              <div style={{ marginTop: 8 }}>
                <KineticText
                  text={subtitle}
                  fontSize={FONT_SIZE.body}
                  fontWeight={400}
                  color={COLORS.textMuted}
                  align="center"
                  maxWidth={1300}
                  stagger={1.2}
                />
              </div>
            </Sequence>
          ) : null}
        </div>

        {/* Accent rule, wiping out from the centre. */}
        <div
          style={{
            marginTop: 56,
            width: 260,
            height: 4,
            borderRadius: 2,
            backgroundColor: COLORS.accent,
            transform: `scaleX(${interpolate(
              frame,
              [seconds(1.4), seconds(2.4)],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )})`,
            fontFamily,
          }}
        />
      </AbsoluteFill>
    </Stage>
  );
};
