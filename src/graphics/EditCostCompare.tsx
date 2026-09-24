import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon } from "./LineIcon";

type EditCostCompareProps = {
  readonly width: number;
  readonly height: number;
  readonly cheap: {
    readonly label: string;
    readonly note: string;
    readonly at: number;
  };
  readonly dear: {
    readonly label: string;
    readonly note: string;
    readonly at: number;
  };
};

/**
 * Changing a line in a list, against taking a built deck apart — to scale.
 *
 * Two bars, because the narration's claim is a ratio: seconds against a slog.
 * The short one is finished before the long one has properly started.
 */
export const EditCostCompare: React.FC<EditCostCompareProps> = ({
  width,
  height,
  cheap,
  dear,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { ...cheap, len: 0.14, tone: COLORS.accent, icon: "text" as const },
    { ...dear, len: 0.92, tone: COLORS.warn, icon: "slides" as const },
  ];
  const rowH = height * 0.3;
  const top = (height - rowH * 2 - height * 0.1) / 2;

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {rows.map((row, i) => {
        const on = spring({
          frame: frame - row.at,
          fps,
          config: { damping: 200 },
        });
        const grow = interpolate(
          frame - row.at - 8,
          [0, i === 0 ? 14 : 70],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        if (on <= 0.001) return null;
        return (
          <div
            key={row.label}
            style={{
              position: "absolute",
              right: 0,
              left: 0,
              top: top + i * (rowH + height * 0.1),
              height: rowH,
              opacity: on,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: width * 0.02,
                marginBottom: rowH * 0.18,
              }}
            >
              <LineIcon
                name={row.icon}
                size={rowH * 0.28}
                color={row.tone}
                delay={row.at + 3}
              />
              <div
                style={{
                  fontFamily,
                  fontSize: rowH * 0.24,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: rowH * 0.18,
                  color: row.tone,
                  marginRight: "auto",
                  opacity: interpolate(grow, [0.9, 1], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {row.note}
              </div>
            </div>
            <div
              style={{
                height: rowH * 0.34,
                borderRadius: rowH * 0.17,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${row.len * grow * 100}%`,
                  borderRadius: rowH * 0.17,
                  background: row.tone,
                  opacity: 0.9,
                  marginRight: 0,
                  marginLeft: "auto",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
