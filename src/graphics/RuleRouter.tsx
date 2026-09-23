import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type RouterTarget = {
  readonly label: string;
  readonly icon: IconName;
};

export type RouterQuestion = {
  readonly text: string;
  /** Index of the target it belongs to. */
  readonly to: number;
  readonly at: number;
};

type RuleRouterProps = {
  readonly width: number;
  readonly height: number;
  /** Two boxes, right to left in the order given. */
  readonly targets: readonly RouterTarget[];
  /** The questions, asked one at a time. */
  readonly questions: readonly RouterQuestion[];
};

/**
 * The rule of thumb, as a fork rather than a sentence.
 *
 * The narration gives a test with two outcomes: ask what the question is
 * about, and the answer tells you which of the two you want. A pair of
 * sentences on screen would be the voice-over again; a question that travels
 * down one branch and lights the box at the end of it makes the test something
 * the viewer performs rather than hears. The second question reuses the same
 * fork, so the only thing that differs between the two runs is the branch —
 * which is the whole rule.
 */
export const RuleRouter: React.FC<RuleRouterProps> = ({
  width,
  height,
  targets,
  questions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const boxW = Math.min(width * 0.3, 520);
  const boxH = height * 0.26;
  const boxGap = width * 0.1;
  const span = boxW * targets.length + boxGap * (targets.length - 1);
  // Right to left: the first target named sits rightmost.
  const boxLeft = (i: number) =>
    (width - span) / 2 + span - (i + 1) * boxW - i * boxGap;
  const boxTop = height * 0.66;

  const askTop = height * 0.04;
  const askH = height * 0.16;

  /** The live question: the last one that has started. */
  let liveIndex = -1;
  for (let i = 0; i < questions.length; i++) {
    if (frame >= questions[i].at) {
      liveIndex = i;
    }
  }

  /** How lit a target is: whichever question is live points at exactly one. */
  const litness = (t: number) => {
    if (liveIndex < 0) {
      return 0;
    }
    const q = questions[liveIndex];
    if (q.to !== t) {
      return 0;
    }
    return interpolate(frame - q.at, [26, 44], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The branch the live question travels down. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {targets.map((_, t) => {
          const x2 = boxLeft(t) + boxW / 2;
          const x1 = width / 2;
          const y1 = askTop + askH;
          const y2 = boxTop;
          const d = `M ${x1} ${y1} C ${x1} ${y1 + (y2 - y1) * 0.55}, ${x2} ${y2 - (y2 - y1) * 0.55}, ${x2} ${y2}`;

          const live = liveIndex >= 0 && questions[liveIndex].to === t;
          const travel = live
            ? interpolate(frame - questions[liveIndex].at, [8, 32], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

          return (
            <g key={t}>
              <path
                d={d}
                fill="none"
                stroke={COLORS.textMuted}
                strokeWidth={2}
                strokeOpacity={0.2}
                strokeDasharray="7 9"
              />
              {travel > 0 ? (
                <path
                  d={d}
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth={3.5}
                  strokeOpacity={0.75}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - travel}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* One question at a time, in the same place, so only the branch differs. */}
      {questions.map((question, i) => {
        const next = questions[i + 1];
        const inT = spring({
          frame: frame - question.at,
          fps,
          config: { damping: 200 },
        });
        const outT = next
          ? interpolate(frame - next.at, [0, 8], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 1;
        const opacity = inT * outT;
        if (opacity <= 0.001) {
          return null;
        }

        return (
          <div
            key={question.text}
            style={{
              position: "absolute",
              top: askTop,
              right: 0,
              left: 0,
              height: askH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity,
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                fontFamily,
                fontSize: height * 0.062,
                fontWeight: 700,
                lineHeight: 1.25,
                color: COLORS.ink,
                backgroundColor: COLORS.labelBg,
                borderRadius: askH * 0.4,
                padding: `${height * 0.03}px ${height * 0.055}px`,
                textAlign: "center",
                transform: `translateY(${interpolate(inT, [0, 1], [-16, 0])}px)`,
              }}
            >
              {question.text}
            </div>
          </div>
        );
      })}

      {targets.map((target, t) => {
        const lit = litness(t);
        return (
          <div
            key={target.label}
            style={{
              position: "absolute",
              left: boxLeft(t),
              top: boxTop,
              width: boxW,
              height: boxH,
              borderRadius: 24,
              background: lit > 0.1 ? COLORS.surfaceRaised : COLORS.surface,
              border: `${lit > 0.1 ? 2.5 : 1}px solid ${
                lit > 0.1 ? COLORS.accent : "rgba(255,255,255,0.1)"
              }`,
              boxShadow:
                lit > 0.2
                  ? `0 0 ${height * 0.09}px ${COLORS.accent}44`
                  : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: boxW * 0.06,
              transform: `scale(${interpolate(lit, [0, 1], [1, 1.04])})`,
            }}
          >
            <LineIcon
              name={target.icon}
              size={boxH * 0.34}
              color={lit > 0.3 ? COLORS.accent : COLORS.textMuted}
              delay={6 + t * 4}
            />
            <div
              style={{
                fontFamily,
                fontSize: boxH * 0.26,
                fontWeight: 800,
                color: lit > 0.3 ? COLORS.text : COLORS.textMuted,
              }}
            >
              {target.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
