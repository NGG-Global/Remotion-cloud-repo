import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

const INPUTS: { icon: IconName; label: string }[] = [
  { icon: "text", label: "טקסט" },
  { icon: "table", label: "נתונים" },
  { icon: "bulb", label: "רעיון" },
];

type FunnelRuleProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * Three kinds of input dropping into a funnel that returns a tick.
 *
 * Illustrates the rule of thumb: a task starting from text, from data or from
 * an idea probably suits Claude. Showing the three inputs converging is what
 * makes it read as a rule rather than as three separate examples.
 */
export const FunnelRule: React.FC<FunnelRuleProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const chipW = width * 0.235;
  const funnelW = width * 0.34;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Inputs across the top. */}
      {INPUTS.map((input, i) => {
        const pop = spring({
          frame: local - i * 8,
          fps,
          config: { damping: 15, stiffness: 160 },
        });

        // Each chip slides down into the funnel mouth after it arrives, and
        // fades out on the way in so it never sits on top of the funnel.
        const drop = interpolate(local - 34 - i * 6, [0, 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fade = interpolate(drop, [0.4, 0.92], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={input.label}
            style={{
              position: "absolute",
              left: width * (0.06 + i * 0.315),
              top: height * 0.03 + drop * height * 0.22,
              width: chipW,
              opacity: pop * fade,
              transform: `scale(${pop * (1 - drop * 0.22)})`,
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.accent}44`,
              borderRadius: 16,
              padding: `${height * 0.035}px 0`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: height * 0.022,
            }}
          >
            <LineIcon
              name={input.icon}
              size={chipW * 0.3}
              delay={delay + i * 8 + 3}
            />
            <div
              style={{
                fontFamily,
                fontSize: chipW * 0.155,
                fontWeight: 600,
                color: COLORS.text,
                direction: "rtl",
              }}
            >
              {input.label}
            </div>
          </div>
        );
      })}

      {/* The funnel. */}
      <div
        style={{
          position: "absolute",
          left: (width - funnelW) / 2,
          top: height * 0.44,
          width: funnelW,
          opacity: interpolate(local, [20, 36], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <svg
          width={funnelW}
          height={funnelW * 0.82}
          viewBox="0 0 100 82"
          aria-hidden
        >
          <path
            d="M4 6 h92 l-34 40 v30 l-24 10 v-40 z"
            pathLength={1}
            fill={`${COLORS.accent}12`}
            stroke={COLORS.accent}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={
              1 -
              interpolate(local - 20, [0, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </svg>
      </div>

      {/* The verdict. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: height * 0.87,
          transform: `translate(-50%, -50%) scale(${spring({
            frame: local - 62,
            fps,
            config: { damping: 12, stiffness: 150 },
          })})`,
          width: height * 0.2,
          height: height * 0.2,
          borderRadius: "50%",
          backgroundColor: COLORS.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LineIcon
          name="check"
          size={height * 0.11}
          delay={delay + 66}
          color={COLORS.ink}
          idle={false}
        />
      </div>
    </div>
  );
};
