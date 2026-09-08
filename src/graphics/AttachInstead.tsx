import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type AttachedFile = {
  readonly name: string;
  readonly icon: IconName;
  /** Frame at which the file docks into the conversation. */
  readonly at: number;
  /** Mark it as the thing the output should stay close to. */
  readonly anchor?: boolean;
  /** Frame at which that mark appears. Defaults to shortly after arrival. */
  readonly anchorAt?: number;
};

type AttachInsteadProps = {
  readonly width: number;
  readonly height: number;
  readonly files: readonly AttachedFile[];
  /** Frame at which describing-in-words is ruled out. */
  readonly strikeAt?: number;
  /** Label on the pin that marks the reference deliverable. */
  readonly anchorLabel?: string;
};

/**
 * Describing a document, next to handing one over.
 *
 * Both sides are on screen at once because the line is a substitution — one
 * for the other — and a substitution needs the thing being replaced to still
 * be visible. The paragraph on the right keeps growing while the files dock
 * on the left, which is the whole argument without a word of on-screen text.
 */
export const AttachInstead: React.FC<AttachInsteadProps> = ({
  width,
  height,
  files,
  strikeAt = 46,
  anchorLabel = "להישאר קרוב לזה",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COL = width * 0.42;
  const rightLeft = width - COL;
  const leftLeft = width * 0.045;
  const panelHeight = height * 0.84;
  const panelTop = (height - panelHeight) / 2;

  const struck = interpolate(frame - strikeAt, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Describing it. Bars keep accumulating, and none of them is the thing. */}
      <div
        style={{
          position: "absolute",
          left: rightLeft,
          top: panelTop,
          width: COL,
          height: panelHeight,
          borderRadius: 22,
          background: COLORS.surface,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 30px",
          boxSizing: "border-box",
          direction: "rtl",
          opacity: 1 - struck * 0.5,
          filter: `saturate(${1 - struck * 0.85})`,
        }}
      >
        <Heading text="להסביר מסמך" muted={struck > 0.4} />
        {Array.from({ length: 11 }, (_, i) => {
          const show = interpolate(frame - (6 + i * 5), [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (show <= 0) {
            return null;
          }
          const widths = [
            0.94, 0.88, 0.96, 0.8, 0.92, 0.86, 0.97, 0.74, 0.9, 0.83, 0.6,
          ];
          return (
            <div
              key={i}
              style={{
                height: 13,
                width: `${widths[i] * 100 * show}%`,
                marginBottom: 17,
                borderRadius: 7,
                background: COLORS.textMuted,
                opacity: 0.4,
              }}
            />
          );
        })}
        {struck > 0 ? (
          <svg
            width={COL}
            height={panelHeight}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <line
              x1={COL - 30}
              y1={panelHeight - 34}
              x2={COL - 30 - (COL - 60) * struck}
              y2={panelHeight - 34 - (panelHeight - 80) * struck}
              stroke={COLORS.warn}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.9}
            />
          </svg>
        ) : null}
      </div>

      {/* Giving it. Each file docks as a chip above the composer. */}
      <div
        style={{
          position: "absolute",
          left: leftLeft,
          top: panelTop,
          width: COL,
          height: panelHeight,
          borderRadius: 22,
          background: COLORS.backgroundDeep,
          border: `1px solid ${COLORS.frameEdge}`,
          padding: "24px 30px",
          boxSizing: "border-box",
          direction: "rtl",
        }}
      >
        <Heading text="לתת את המסמך" accent />

        {files.map((file, i) => {
          const pop = spring({
            frame: frame - file.at,
            fps,
            config: { damping: 62, stiffness: 150 },
          });
          if (frame < file.at - 2) {
            return null;
          }
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                marginTop: i === 0 ? 22 : 18,
                padding: "14px 18px",
                borderRadius: 14,
                background: COLORS.surfaceRaised,
                border: `1px solid ${
                  file.anchor ? COLORS.accent : "rgba(255,255,255,0.07)"
                }`,
                opacity: pop,
                // Chips arrive from the composer below, the way an attachment
                // does in the interface itself.
                transform: `translateY(${(1 - pop) * 34}px)`,
              }}
            >
              <LineIcon
                name={file.icon}
                size={40}
                delay={file.at}
                drawFrames={18}
                color={file.anchor ? COLORS.accent : COLORS.accentSoft}
              />
              <span
                style={{
                  fontFamily,
                  fontSize: 30,
                  fontWeight: 700,
                  color: COLORS.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {file.name}
              </span>
              {file.anchor ? (
                <span
                  style={{
                    marginRight: "auto",
                    fontFamily,
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.ink,
                    background: COLORS.accent,
                    padding: "5px 12px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    opacity: interpolate(
                      frame - (file.anchorAt ?? file.at + 14),
                      [0, 12],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    ),
                  }}
                >
                  {anchorLabel}
                </span>
              ) : null}
            </div>
          );
        })}

        {/* The composer the files came from. */}
        <div
          style={{
            position: "absolute",
            right: 30,
            left: 30,
            bottom: 26,
            height: 62,
            borderRadius: 16,
            background: COLORS.surface,
            border: "1px solid rgba(255,255,255,0.09)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "0 18px",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28, color: COLORS.accent }}>+</span>
          <span
            style={{
              fontFamily,
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.textMuted,
            }}
          >
            צירוף קבצים לשיחה
          </span>
        </div>
      </div>
    </div>
  );
};

const Heading: React.FC<{
  readonly text: string;
  readonly accent?: boolean;
  readonly muted?: boolean;
}> = ({ text, accent, muted }) => (
  <div
    style={{
      fontFamily,
      fontSize: 30,
      fontWeight: 800,
      letterSpacing: "0.02em",
      marginBottom: 22,
      color: accent ? COLORS.accent : muted ? "#6b6259" : COLORS.text,
    }}
  >
    {text}
  </div>
);
