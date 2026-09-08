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

export type StageStep = {
  /** Frame, relative to the scene, at which this stage takes over. */
  readonly at: number;
  /** Illustration for this stage, sized by the render callback's arguments. */
  readonly graphic: (size: {
    width: number;
    height: number;
  }) => React.ReactNode;
  readonly caption: string;
  /** Words in the caption to pick out in the accent colour. */
  readonly emphasise?: readonly string[];
};

type StagedSceneProps = {
  readonly heading?: string;
  readonly steps: readonly StageStep[];
  /** Panel size for the illustrations, in canvas pixels. */
  readonly panel?: { width: number; height: number };
};

/**
 * One illustration at a time, swapped in step with the narration.
 *
 * Built for the stretches of voice-over that walk through several examples in
 * a row. A list would put them all on screen at once and leave the viewer
 * reading ahead of the voice; showing only the current one keeps the picture
 * and the sentence together.
 */
export const StagedScene: React.FC<StagedSceneProps> = ({
  heading,
  steps,
  panel = { width: 720, height: 470 },
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.35), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const SWAP = seconds(0.3);

  return (
    <Stage glow={0.6}>
      <AbsoluteFill style={{ opacity: exit, direction: "rtl" }}>
        {heading ? (
          <div style={{ position: "absolute", top: 96, right: 150, left: 150 }}>
            <KineticText
              text={heading}
              fontSize={FONT_SIZE.subheading}
              fontWeight={800}
              stagger={2}
            />
          </div>
        ) : null}

        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 80,
            padding: "0 120px",
            marginTop: heading ? 60 : 0,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 620,
              flexShrink: 0,
              minHeight: 220,
            }}
          >
            {steps.map((step, i) => {
              const next = steps[i + 1];
              const inT = interpolate(
                frame,
                [step.at, step.at + SWAP],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );
              const outT = next
                ? interpolate(frame, [next.at, next.at + SWAP], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : 1;
              const opacity = inT * outT;
              if (opacity <= 0.001) {
                return null;
              }

              return (
                <div
                  key={`c${i}`}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    left: 0,
                    transform: "translateY(-50%)",
                    opacity,
                  }}
                >
                  <KineticText
                    text={step.caption}
                    delay={step.at}
                    fontSize={FONT_SIZE.body * 1.15}
                    fontWeight={700}
                    color={COLORS.text}
                    emphasise={step.emphasise}
                    stagger={1.6}
                  />
                </div>
              );
            })}
          </div>
          {/* The illustration. In an RTL row this is the second child, so it
              sits to the left of the caption that leads the eye. */}
          <div
            style={{
              position: "relative",
              width: panel.width,
              height: panel.height,
              flexShrink: 0,
            }}
          >
            {steps.map((step, i) => {
              const next = steps[i + 1];
              const inT = interpolate(
                frame,
                [step.at, step.at + SWAP],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );
              const outT = next
                ? interpolate(frame, [next.at, next.at + SWAP], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : 1;

              const opacity = inT * outT;
              if (opacity <= 0.001) {
                return null;
              }

              return (
                <div
                  key={`g${i}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity,
                    transform: `scale(${0.97 + opacity * 0.03})`,
                  }}
                >
                  {step.graphic(panel)}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </Stage>
  );
};
