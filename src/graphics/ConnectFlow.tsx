import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

type Step = {
  readonly label: string;
  readonly icon: IconName;
};

/**
 * The four actions the narration walks through.
 *
 * Drawn rather than screenshotted on purpose: the sign-in and consent screens
 * carry a real organisational address and tenant name, which should not travel
 * in a video that may be shared onward.
 */
const STEPS: readonly Step[] = [
  { label: "הגדרות", icon: "framework" },
  { label: "חיבורים", icon: "flow" },
  { label: "Microsoft 365", icon: "files" },
  { label: "התחברות ואישור", icon: "check" },
];

type ConnectFlowProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Frames between steps. */
  readonly stagger?: number;
};

/**
 * The connection as four steps, each landing in turn.
 *
 * A single still of the connector page would not carry a sequence; showing the
 * steps arrive one after another is what makes it read as a procedure the
 * viewer can follow.
 */
export const ConnectFlow: React.FC<ConnectFlowProps> = ({
  width,
  height,
  delay = 0,
  stagger = 22,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const rowH = height * 0.19;
  const gap = height * 0.075;
  const railX = width * 0.87;

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The rail the steps hang off, drawn top to bottom. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        <path
          d={`M ${railX} ${rowH / 2} L ${railX} ${height - rowH / 2}`}
          pathLength={1}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={2.5}
          strokeOpacity={0.45}
          strokeDasharray={1}
          strokeDashoffset={
            1 -
            interpolate(local, [0, STEPS.length * stagger], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </svg>

      {STEPS.map((step, i) => {
        const pop = spring({
          frame: local - i * stagger,
          fps,
          config: { damping: 15, stiffness: 160 },
        });
        const done = local > (i + 1) * stagger;
        const top = i * (rowH + gap);

        return (
          <div
            key={step.label}
            style={{
              position: "absolute",
              top,
              right: 0,
              left: 0,
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: width * 0.035,
              opacity: pop,
              transform: `translateX(${interpolate(pop, [0, 1], [34, 0])}px)`,
            }}
          >
            {/* Number on the rail. */}
            <div
              style={{
                position: "absolute",
                // `left`, matching the SVG rail's left-origin coordinates.
                // CSS `right` in an RTL container mirrors against it and the
                // numbers end up on the opposite side from their rail.
                left: railX - rowH * 0.29,
                width: rowH * 0.58,
                height: rowH * 0.58,
                borderRadius: "50%",
                backgroundColor: done ? COLORS.accent : COLORS.surface,
                border: `2px solid ${COLORS.accent}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontSize: rowH * 0.28,
                fontWeight: 800,
                color: done ? COLORS.ink : COLORS.accent,
              }}
            >
              {i + 1}
            </div>

            <div
              style={{
                marginRight: width * 0.19,
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: rowH * 0.28,
                backgroundColor: COLORS.surface,
                border: `1px solid ${done ? `${COLORS.accent}66` : "rgba(255,255,255,0.09)"}`,
                borderRadius: 18,
                padding: `${rowH * 0.2}px ${rowH * 0.3}px`,
              }}
            >
              <LineIcon
                name={step.icon}
                size={rowH * 0.44}
                delay={delay + i * stagger + 3}
                idle={false}
              />
              <div
                style={{
                  fontFamily,
                  fontSize: rowH * 0.3,
                  fontWeight: 600,
                  color: COLORS.text,
                  // The product name stays LTR inside the RTL row.
                  direction: step.label === "Microsoft 365" ? "ltr" : "rtl",
                }}
              >
                {step.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
