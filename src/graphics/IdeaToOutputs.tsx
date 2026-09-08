import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

const OUTPUTS: { icon: IconName; label: string }[] = [
  { icon: "doc", label: "מסמך" },
  { icon: "table", label: "טבלה" },
  { icon: "slides", label: "מצגת" },
];

type IdeaToOutputsProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * One idea branching into three finished outputs.
 *
 * Illustrates describing an idea and getting a document, a table or a deck
 * back. The connectors draw outward from the idea so the three outputs read as
 * coming from it, rather than as a list that happens to sit nearby.
 */
export const IdeaToOutputs: React.FC<IdeaToOutputsProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const cardW = width * 0.2;
  const cardH = cardW * 0.86;
  const bulbSize = width * 0.13;

  const bulbIn = spring({
    frame: local,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  // Idea sits on the right, outputs fan to the left: the reading direction of
  // the narration this illustrates.
  const bulbX = width * 0.82;
  const bulbY = height * 0.5;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        aria-hidden
      >
        {OUTPUTS.map((_, i) => {
          const targetX = width * 0.34;
          const targetY = height * (0.2 + i * 0.3);
          const draw = interpolate(local - 16 - i * 7, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const midX = (bulbX + targetX) / 2;

          return (
            <path
              key={i}
              d={`M ${bulbX - bulbSize * 0.55} ${bulbY} C ${midX} ${bulbY}, ${midX} ${targetY}, ${targetX + cardW * 0.5} ${targetY}`}
              pathLength={1}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={2}
              strokeOpacity={0.75}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          );
        })}
      </svg>

      {/* The idea. */}
      <div
        style={{
          position: "absolute",
          left: bulbX,
          top: bulbY,
          transform: `translate(-50%, -50%) scale(${bulbIn})`,
          width: bulbSize * 1.7,
          height: bulbSize * 1.7,
          borderRadius: "50%",
          backgroundColor: `${COLORS.accent}1f`,
          border: `2px solid ${COLORS.accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LineIcon name="bulb" size={bulbSize} delay={delay + 3} />
      </div>

      {/* The outputs. */}
      {OUTPUTS.map((o, i) => {
        const pop = spring({
          frame: local - 26 - i * 7,
          fps,
          config: { damping: 15, stiffness: 160 },
        });

        return (
          <div
            key={o.label}
            style={{
              position: "absolute",
              left: width * 0.34,
              top: height * (0.2 + i * 0.3),
              transform: `translate(-50%, -50%) scale(${pop})`,
              width: cardW,
              height: cardH,
              borderRadius: 16,
              backgroundColor: COLORS.surface,
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: cardH * 0.1,
              opacity: pop,
            }}
          >
            <LineIcon
              name={o.icon}
              size={cardW * 0.3}
              delay={delay + 28 + i * 7}
            />
            <div
              style={{
                fontFamily,
                fontSize: cardW * 0.155,
                fontWeight: 600,
                color: COLORS.text,
                direction: "rtl",
              }}
            >
              {o.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
