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

type OutroSceneProps = {
  readonly statement: string;
  readonly emphasise?: readonly string[];
  /** Teaser for the next episode. */
  readonly nextUp?: string;
  readonly nextLabel?: string;
};

/** Closing card: the takeaway, then what the next video covers. */
export const OutroScene: React.FC<OutroSceneProps> = ({
  statement,
  emphasise,
  nextUp,
  nextLabel = "בסרטון הבא",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade the whole card out at the end so the video does not cut to black on
  // a hard frame.
  const exit = interpolate(
    frame,
    [durationInFrames - seconds(1), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Stage glow={0.8}>
      <AbsoluteFill
        style={{
          opacity: exit,
          direction: "rtl",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 170px",
          textAlign: "center",
        }}
      >
        <KineticText
          text={statement}
          fontSize={FONT_SIZE.heading}
          fontWeight={800}
          emphasise={emphasise}
          align="center"
          maxWidth={1500}
          stagger={2.4}
        />

        {nextUp ? (
          <Sequence from={seconds(2.2)} layout="none">
            <div
              style={{
                marginTop: 74,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontFamily,
                  fontSize: FONT_SIZE.caption,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: COLORS.accent,
                }}
              >
                <Spark size={34} spokes={8} delay={2} />
                {nextLabel}
              </div>

              <KineticText
                text={nextUp}
                delay={seconds(0.35)}
                fontSize={FONT_SIZE.body}
                fontWeight={500}
                color={COLORS.textMuted}
                align="center"
                maxWidth={1200}
                stagger={1.1}
              />
            </div>
          </Sequence>
        ) : null}
      </AbsoluteFill>
    </Stage>
  );
};
