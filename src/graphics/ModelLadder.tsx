import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

/**
 * The four models, in the order the picker lists them, with the picker's own
 * one-line descriptions translated.
 *
 * Descriptions are taken from the interface rather than written here, so the
 * video cannot claim more about a model than the product does. `depth` is only
 * a relative position on the axis drawn below — not a measured score.
 */
type Model = {
  readonly name: string;
  readonly note: string;
  /** Relative position on the axis drawn below. Not a measured score. */
  readonly depth: number;
  /** Marks the model the picker currently has selected. */
  readonly current?: boolean;
};

const MODELS: readonly Model[] = [
  { name: "Fable 5.1", note: "לאתגרים הקשים ביותר", depth: 1.0 },
  { name: "Opus 5", note: "למשימות מורכבות", depth: 0.78 },
  {
    name: "Sonnet 5",
    note: "היעיל ביותר ליום-יום",
    depth: 0.52,
    current: true,
  },
  { name: "Haiku 4.5", note: "המהיר ביותר לתשובות קצרות", depth: 0.26 },
];

type ModelLadderProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * The model line-up placed on a speed-to-depth axis.
 *
 * A list of four names and four blurbs tells you nothing about how to choose.
 * Putting them on one axis, with the everyday default marked, turns the same
 * information into a decision.
 */
export const ModelLadder: React.FC<ModelLadderProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const rowH = height * 0.19;
  const gap = height * 0.045;
  const labelW = width * 0.42;

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {MODELS.map((model, i) => {
        const pop = spring({
          frame: local - i * 8,
          fps,
          config: { damping: 200 },
        });
        const grow = spring({
          frame: local - 8 - i * 8,
          fps,
          config: { damping: 200, stiffness: 80 },
        });

        return (
          <div
            key={model.name}
            style={{
              position: "absolute",
              top: i * (rowH + gap),
              right: 0,
              left: 0,
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: width * 0.03,
              opacity: pop,
              transform: `translateX(${interpolate(pop, [0, 1], [40, 0])}px)`,
            }}
          >
            <div style={{ width: labelW, flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily,
                  fontSize: rowH * 0.36,
                  fontWeight: 700,
                  color: model.current ? COLORS.accent : COLORS.text,
                }}
              >
                {model.name}
                {model.current ? (
                  <span
                    style={{
                      fontSize: rowH * 0.2,
                      fontWeight: 600,
                      color: COLORS.ink,
                      backgroundColor: COLORS.accent,
                      borderRadius: 999,
                      padding: `${rowH * 0.04}px ${rowH * 0.13}px`,
                    }}
                  >
                    ברירת המחדל
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  marginTop: rowH * 0.09,
                  fontFamily,
                  fontSize: rowH * 0.22,
                  fontWeight: 400,
                  color: COLORS.textMuted,
                }}
              >
                {model.note}
              </div>
            </div>

            {/* Depth bar. Grows from the right, matching the reading direction. */}
            <div
              style={{
                flex: 1,
                height: rowH * 0.3,
                borderRadius: rowH * 0.15,
                backgroundColor: "rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${model.depth * grow * 100}%`,
                  borderRadius: rowH * 0.15,
                  background: model.current
                    ? COLORS.accent
                    : `linear-gradient(270deg, ${COLORS.accent}b3, ${COLORS.accent}4d)`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* The axis the bars are read against. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: labelW + width * 0.03,
          left: 0,
          display: "flex",
          justifyContent: "space-between",
          fontFamily,
          fontSize: height * 0.05,
          fontWeight: 600,
          color: COLORS.textMuted,
          opacity: interpolate(local, [34, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span>מהיר</span>
        <span>מעמיק</span>
      </div>
    </div>
  );
};
