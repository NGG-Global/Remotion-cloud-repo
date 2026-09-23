import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";
import { DocSheet, STRUCTURED_LINES } from "./parts/DocSheet";

type SameWayAnySubjectProps = {
  readonly width: number;
  readonly height: number;
  /** Who the work happens to be for. Right to left in the order given. */
  readonly subjects: readonly string[];
  /** Frame at which the subjects are ruled out as the thing that matters. */
  readonly dismissAt: number;
  /** The skill in the middle. */
  readonly skillName: string;
  readonly skillAt: number;
  /** What comes out: different deliverables, identical shape. */
  readonly outputs: readonly {
    readonly tag: string;
    readonly icon: IconName;
  }[];
  readonly outputsAt: number;
};

/**
 * Different subjects, the same way of working.
 *
 * The narration's sharpest line about skills is that one does not need to know
 * who the client is. That is a negative claim, and negatives are hard to draw
 * — so the subjects are drawn first and then struck, and what comes out below
 * is three different deliverables with visibly identical structure. The shape
 * of the output is the argument: the subject changed, the way did not.
 */
export const SameWayAnySubject: React.FC<SameWayAnySubjectProps> = ({
  width,
  height,
  subjects,
  dismissAt,
  skillName,
  skillAt,
  outputs,
  outputsAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chipH = height * 0.11;
  const chipGap = width * 0.02;
  const chipW = Math.min(width * 0.2, 320);
  const chipSpan = chipW * subjects.length + chipGap * (subjects.length - 1);
  const chipLeft = (i: number) =>
    (width - chipSpan) / 2 + chipSpan - (i + 1) * chipW - i * chipGap;

  const skillTop = height * 0.2;
  const skillH = height * 0.15;
  const skillW = Math.min(width * 0.52, 900);
  const skillLeft = (width - skillW) / 2;

  const outTop = skillTop + skillH + height * 0.1;
  const outH = height * 0.44;
  const outGap = width * 0.03;
  const outW = Math.min(width * 0.24, 380);
  const outSpan = outW * outputs.length + outGap * (outputs.length - 1);
  const outLeft = (i: number) =>
    (width - outSpan) / 2 + outSpan - (i + 1) * outW - i * outGap;

  const dismiss = interpolate(frame - dismissAt, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const skillIn = spring({
    frame: frame - skillAt,
    fps,
    config: { damping: 200 },
  });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {subjects.map((subject, i) => {
        const on = spring({
          frame: frame - i * 6,
          fps,
          config: { damping: 200 },
        });
        return (
          <div
            key={subject}
            style={{
              position: "absolute",
              left: chipLeft(i),
              top: height * 0.02,
              width: chipW,
              height: chipH,
              borderRadius: chipH * 0.38,
              background: COLORS.surface,
              border: `1px solid rgba(255,255,255,0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: on * interpolate(dismiss, [0, 1], [1, 0.3]),
              fontFamily,
              fontSize: chipH * 0.32,
              fontWeight: 600,
              color: COLORS.textMuted,
            }}
          >
            <span style={{ position: "relative" }}>
              {subject}
              <span
                style={{
                  position: "absolute",
                  top: "54%",
                  right: -chipW * 0.02,
                  left: -chipW * 0.02,
                  height: 3,
                  borderRadius: 2,
                  background: COLORS.warn,
                  transform: `scaleX(${dismiss})`,
                  transformOrigin: "right center",
                }}
              />
            </span>
          </div>
        );
      })}

      {/* The skill, which never asked. */}
      <div
        style={{
          position: "absolute",
          left: skillLeft,
          top: skillTop,
          width: skillW,
          height: skillH,
          borderRadius: 22,
          background: COLORS.surfaceRaised,
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `0 0 60px ${COLORS.accent}2e`,
          opacity: skillIn,
          transform: `scale(${interpolate(skillIn, [0, 1], [0.93, 1])})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: skillW * 0.03,
        }}
      >
        <LineIcon
          name="repeat"
          size={skillH * 0.42}
          color={COLORS.accent}
          delay={skillAt + 4}
        />
        <div
          style={{
            direction: "ltr",
            fontFamily,
            fontSize: skillH * 0.3,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {skillName}
        </div>
      </div>

      {/* Three deliverables, drawn to the same structure on purpose. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {outputs.map((_, i) => {
          const t = interpolate(frame - outputsAt - i * 6, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (t <= 0.01) {
            return null;
          }
          const x1 = width / 2;
          const y1 = skillTop + skillH;
          const x2 = outLeft(i) + outW / 2;
          const y2 = outTop;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1} ${y1 + (y2 - y1) * 0.6}, ${x2} ${y2 - (y2 - y1) * 0.6}, ${x2} ${y2}`}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={2.5}
              strokeOpacity={0.45}
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset={1 - t}
            />
          );
        })}
      </svg>

      {outputs.map((output, i) => {
        const on = spring({
          frame: frame - outputsAt - 14 - i * 6,
          fps,
          config: { damping: 200 },
        });
        if (on <= 0.001) {
          return null;
        }
        return (
          <div
            key={output.tag}
            style={{
              position: "absolute",
              left: outLeft(i),
              top: outTop,
              width: outW,
              height: outH,
              opacity: on,
              transform: `translateY(${interpolate(on, [0, 1], [22, 0])}px)`,
            }}
          >
            <DocSheet
              width={outW}
              height={outH}
              lines={STRUCTURED_LINES}
              progress={interpolate(
                frame - outputsAt - 18 - i * 6,
                [0, 26],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )}
              tag={output.tag}
              tagColor={COLORS.accent}
            />
          </div>
        );
      })}
    </div>
  );
};
