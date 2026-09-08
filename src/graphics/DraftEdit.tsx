import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

/** Which lines get rewritten, and when, as a fraction of the shot. */
const EDITS = [
  { row: 1, at: 0.3 },
  { row: 4, at: 0.5 },
  { row: 6, at: 0.68 },
] as const;

const ROWS = 9;

type DraftEditProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Frames the whole edit pass takes. */
  readonly span?: number;
};

/**
 * A draft being marked up: lines struck through and replaced.
 *
 * Illustrates handing over a draft and getting it edited. The replacement
 * lines come in accent-coloured so the change is legible at a glance, the way
 * tracked changes read in a document.
 */
export const DraftEdit: React.FC<DraftEditProps> = ({
  width,
  height,
  delay = 0,
  span = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const pageW = width * 0.7;
  const pageH = pageW * 1.1;

  const enter = spring({ frame: local, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: pageW,
          height: pageH,
          borderRadius: 12,
          backgroundColor: "#f7f4ee",
          border: "1px solid rgba(0,0,0,0.14)",
          boxShadow: "0 20px 48px -14px rgba(0,0,0,0.62)",
          padding: pageW * 0.09,
          display: "flex",
          flexDirection: "column",
          gap: pageH * 0.055,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px)`,
        }}
      >
        {Array.from({ length: ROWS }, (_, r) => {
          const edit = EDITS.find((e) => e.row === r);
          const editT = edit
            ? interpolate(
                local,
                [edit.at * span, edit.at * span + 16],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              )
            : 0;

          const lineWidth = r === 0 ? 46 : 68 + ((r * 17) % 26);

          return (
            <div
              key={r}
              style={{
                position: "relative",
                height: Math.max(4, pageH * 0.026),
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${lineWidth}%`,
                  borderRadius: 3,
                  backgroundColor: r === 0 ? COLORS.ink : "rgba(26,23,20,0.3)",
                  opacity: edit ? 1 - editT : 1,
                }}
              />

              {edit ? (
                <>
                  {/* The rewritten line, taking the old one's place. */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${lineWidth}%`,
                      borderRadius: 3,
                      backgroundColor: COLORS.accent,
                      opacity: interpolate(editT, [0.55, 1], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  />
                  {/* The strike that crosses the old line out first, then
                      clears once the replacement has landed. */}
                  <div
                    style={{
                      position: "absolute",
                      top: "42%",
                      left: 0,
                      height: 2,
                      width: `${lineWidth * Math.min(1, editT / 0.55)}%`,
                      backgroundColor: "#c0563c",
                      opacity: interpolate(editT, [0.6, 0.95], [1, 0], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
