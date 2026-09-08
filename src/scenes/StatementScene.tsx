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
  /**
   * Illustration to sit alongside the statement. Given the panel size it may
   * draw into. When present the scene lays out as a row, text first — which
   * in RTL puts the words on the right and the picture on the left.
   */
  readonly graphic?: (size: {
    width: number;
    height: number;
  }) => React.ReactNode;
  readonly panel?: { width: number; height: number };
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
  graphic,
  panel = { width: 760, height: 480 },
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
          flexDirection: graphic ? "row" : "column",
          justifyContent: "center",
          alignItems: graphic
            ? "center"
            : align === "center"
              ? "center"
              : "flex-start",
          gap: graphic ? 84 : 0,
          padding: graphic ? "0 130px" : "0 170px",
        }}
      >
        <div
          style={{
            flex: graphic ? 1 : undefined,
            display: "flex",
            flexDirection: "column",
            alignItems:
              align === "center" && !graphic ? "center" : "flex-start",
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
            align={align === "center" && !graphic ? "center" : "start"}
            maxWidth={graphic ? 780 : 1520}
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
        </div>

        {graphic ? (
          <div
            style={{ width: panel.width, height: panel.height, flexShrink: 0 }}
          >
            {graphic(panel)}
          </div>
        ) : null}
      </AbsoluteFill>
    </Stage>
  );
};
