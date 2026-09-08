import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KineticText } from "../components/KineticText";
import { Stage } from "../components/Stage";
import { COLORS, FONT_SIZE, seconds } from "../theme";

type StatementSceneProps = {
  /** Small line above the statement. */
  readonly kicker?: string;
  readonly statement: string;
  /** Words in the statement to pick out in the accent colour. */
  readonly emphasise?: readonly string[];
  readonly footnote?: string;
  readonly align?: "start" | "center";
  readonly fontSize?: number;
};

/**
 * A single line of narration given the whole frame.
 *
 * Used for the beats where the voice is making one point and any additional
 * element on screen would only pull attention away from it.
 */
export const StatementScene: React.FC<StatementSceneProps> = ({
  kicker,
  statement,
  emphasise,
  footnote,
  align = "start",
  fontSize = FONT_SIZE.heading,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.35), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Very slow push in, so a long hold on one line never feels static.
  const push = interpolate(frame, [0, durationInFrames], [1, 1.035]);

  return (
    <Stage glow={0.7}>
      <AbsoluteFill
        style={{
          opacity: exit,
          transform: `scale(${push})`,
          direction: "rtl",
          justifyContent: "center",
          alignItems: align === "center" ? "center" : "flex-start",
          padding: "0 170px",
        }}
      >
        {kicker ? (
          <div style={{ marginBottom: 30 }}>
            <KineticText
              text={kicker}
              fontSize={FONT_SIZE.caption}
              fontWeight={600}
              color={COLORS.accentSoft}
              align={align === "center" ? "center" : "start"}
              stagger={1.4}
            />
          </div>
        ) : null}

        <KineticText
          text={statement}
          delay={kicker ? seconds(0.25) : 0}
          fontSize={fontSize}
          fontWeight={800}
          emphasise={emphasise}
          align={align === "center" ? "center" : "start"}
          maxWidth={1520}
          stagger={2.2}
        />

        {footnote ? (
          <div style={{ marginTop: 40 }}>
            <KineticText
              text={footnote}
              delay={seconds(0.9)}
              fontSize={FONT_SIZE.body}
              fontWeight={400}
              color={COLORS.textMuted}
              align={align === "center" ? "center" : "start"}
              maxWidth={1300}
              stagger={1}
            />
          </div>
        ) : null}
      </AbsoluteFill>
    </Stage>
  );
};
