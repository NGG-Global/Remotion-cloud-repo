import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type NextFile = {
  readonly label: string;
  readonly icon: IconName;
  /** Frame at which this kind of file settles onto the conversation. */
  readonly at: number;
};

type NextLayerProps = {
  readonly width: number;
  readonly height: number;
  readonly files: readonly NextFile[];
  /** Frame at which the work moves onto the files themselves. */
  readonly workAt: number;
  /** Frame at which the blank page is set aside. */
  readonly blankAt: number;
};

/**
 * The next layer, settling onto the conversation.
 *
 * The teaser describes an addition rather than a change of subject, so the
 * files land as planes stacking on the same conversation panel that carried
 * the episode. The blank page is pushed out of frame at the end, which is the
 * one thing the next episode promises to remove.
 */
export const NextLayer: React.FC<NextLayerProps> = ({
  width,
  height,
  files,
  workAt,
  blankAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PANEL = { width: Math.min(620, width * 0.36), height: height * 0.5 };
  const cx = width * 0.44;
  const cy = height * 0.52;
  const panelLeft = cx - PANEL.width / 2;
  const panelTop = cy - PANEL.height / 2;

  const base = spring({ frame, fps, config: { damping: 90 } });
  const work = interpolate(frame - workAt, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blank = interpolate(frame - blankAt, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {/* The conversation the whole episode has been about. */}
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop,
          width: PANEL.width,
          height: PANEL.height,
          borderRadius: 22,
          background: COLORS.backgroundDeep,
          border: `1px solid rgba(217,119,87,0.32)`,
          direction: "rtl",
          padding: "22px 26px",
          boxSizing: "border-box",
          opacity: base,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.accent,
            marginBottom: 18,
          }}
        >
          השיחה
        </div>
      </div>

      {/* Each file type as a plane settling onto it. */}
      {files.map((file, i) => {
        const land = spring({
          frame: frame - file.at,
          fps,
          config: { damping: 52, stiffness: 140, mass: 0.9 },
        });
        if (frame < file.at - 2) {
          return null;
        }
        const ROW = 74;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: panelLeft + 34 + i * 22,
              // Each plane settles onto its own line inside the panel, coming
              // in from above so the arrival reads as landing rather than
              // fading up.
              top: panelTop + 92 + i * (ROW + 16) + (1 - land) * -150,
              width: PANEL.width - 68,
              height: ROW,
              borderRadius: 14,
              background: COLORS.surfaceRaised,
              border: `1px solid rgba(217,119,87,${0.3 + work * 0.35})`,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: "0 20px",
              boxSizing: "border-box",
              direction: "rtl",
              opacity: Math.min(1, land * 1.3),
              boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
            }}
          >
            <LineIcon
              name={file.icon}
              size={40}
              delay={file.at}
              drawFrames={18}
              color={COLORS.accent}
            />
            <span
              style={{
                fontFamily,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.text,
                whiteSpace: "nowrap",
              }}
            >
              {file.label}
            </span>
            {work > 0.3 && i === files.length - 1 ? (
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
                  opacity: work,
                  whiteSpace: "nowrap",
                }}
              >
                עובדים עליו
              </span>
            ) : null}
          </div>
        );
      })}

      {/* The blank page, on its way out. */}
      {frame >= blankAt - 90 ? (
        <div
          style={{
            position: "absolute",
            left: width * 0.8 + blank * width * 0.24,
            top: cy - height * 0.24,
            width: width * 0.15,
            height: height * 0.48,
            borderRadius: 14,
            background: COLORS.surface,
            border: "2px dashed rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.textMuted,
            textAlign: "center",
            padding: 18,
            boxSizing: "border-box",
            opacity:
              interpolate(frame - (blankAt - 90), [0, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }) *
              (1 - blank * 0.85),
            transform: `rotate(${blank * 8}deg)`,
          }}
        >
          דף ריק
        </div>
      ) : null}
    </div>
  );
};
