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

type Panel = {
  readonly label: string;
  readonly lines: readonly string[];
};

type ContrastSceneProps = {
  readonly heading?: string;
  /** The thing it is not. Rendered muted, and struck through on arrival. */
  readonly not: Panel;
  /** The thing it is. Rendered in the accent colour. */
  readonly but: Panel;
  /** Frame at which the second panel arrives. */
  readonly butAt?: number;
};

const PanelBlock: React.FC<{
  readonly panel: Panel;
  readonly delay: number;
  readonly tone: "muted" | "accent";
}> = ({ panel, delay, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  const muted = tone === "muted";

  // Each rejected item is struck through in turn once the accent panel lands.
  // The strike belongs on the items, not on the "he is not" label: crossing
  // out the label would negate the negation and read backwards.
  const strikeAt = (index: number) =>
    muted
      ? interpolate(
          frame - delay - seconds(1.1) - index * seconds(0.28),
          [0, seconds(0.4)],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 0;

  return (
    <div
      style={{
        flex: 1,
        opacity: progress * (muted ? 0.62 : 1),
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
        backgroundColor: muted ? "rgba(255,255,255,0.03)" : COLORS.surface,
        border: `1px solid ${muted ? "rgba(255,255,255,0.07)" : COLORS.accent}`,
        borderRadius: 26,
        padding: "44px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: FONT_SIZE.caption,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: muted ? COLORS.textMuted : COLORS.accent,
        }}
      >
        {panel.label}
      </div>

      <div
        style={{
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          fontFamily,
          fontSize: FONT_SIZE.body,
          fontWeight: 500,
          lineHeight: 1.35,
          color: muted ? COLORS.textMuted : COLORS.text,
        }}
      >
        {panel.lines.map((line, i) => (
          <div
            key={`${line}-${i}`}
            style={{ position: "relative", display: "inline-block" }}
          >
            {line}
            {muted ? (
              <div
                style={{
                  position: "absolute",
                  top: "54%",
                  right: 0,
                  height: 3,
                  width: `${strikeAt(i) * 100}%`,
                  backgroundColor: COLORS.accent,
                  opacity: 0.85,
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Side-by-side "not this, but that".
 *
 * Built for the stretch of narration that defines Claude by what it is not —
 * showing both halves at once makes the distinction land faster than saying it
 * twice in sequence.
 */
export const ContrastScene: React.FC<ContrastSceneProps> = ({
  heading,
  not,
  but,
  butAt = seconds(1.6),
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.35), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Stage glow={0.6}>
      <AbsoluteFill
        style={{
          opacity: exit,
          direction: "rtl",
          justifyContent: "center",
          padding: "0 150px",
        }}
      >
        {heading ? (
          <div style={{ marginBottom: 56 }}>
            <KineticText
              text={heading}
              fontSize={FONT_SIZE.subheading}
              fontWeight={800}
              maxWidth={1500}
              stagger={2}
            />
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
          <PanelBlock panel={not} delay={seconds(0.4)} tone="muted" />
          <PanelBlock panel={but} delay={butAt} tone="accent" />
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
