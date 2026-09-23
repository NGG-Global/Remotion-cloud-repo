import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type MatchSkill = {
  readonly name: string;
  /** The description line — the part that decides. */
  readonly description: string;
  readonly icon: IconName;
};

type SkillMatchProps = {
  readonly width: number;
  readonly height: number;
  /** The request, as the user types it. */
  readonly request: string;
  /** The installed skills, right to left in the order given. */
  readonly skills: readonly MatchSkill[];
  /** Which one the request turns out to match. */
  readonly matchIndex: number;
  /** Frame at which the request starts reading across the descriptions. */
  readonly scanAt: number;
  /** Frame at which the match is settled. */
  readonly matchAt: number;
  /** The procedure the matched skill carries, revealed after the match. */
  readonly steps?: readonly string[];
  readonly stepsAt?: number;
};

/**
 * A request finding its skill.
 *
 * The narration's claim is that nobody invokes a skill: you ask for what you
 * want, and Claude works out that one of the installed skills applies. Said in
 * a sentence that is easy to nod at and hard to picture; drawn, it has a
 * mechanism — the request travels along the row reading each description in
 * turn, one of them answers, and the procedure inside it unfolds. The reading
 * is the point, so the descriptions are what light up as the request passes,
 * not the names.
 */
export const SkillMatch: React.FC<SkillMatchProps> = ({
  width,
  height,
  request,
  skills,
  matchIndex,
  scanAt,
  matchAt,
  steps,
  stepsAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const n = skills.length;
  const gap = width * 0.028;
  const cardW = (width - gap * (n - 1)) / n;
  const cardH = height * (steps ? 0.4 : 0.46);
  const cardTop = height * 0.185;

  // Right to left: the first skill named sits rightmost, and the request
  // therefore reads from the right — the direction the language runs.
  const cardLeft = (i: number) => width - (i + 1) * cardW - i * gap;

  const askIn = spring({
    frame: frame - (scanAt - 22),
    fps,
    config: { damping: 200 },
  });

  /** How far the request has travelled across the row, 0-1. */
  const scan = interpolate(frame, [scanAt, matchAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settled = spring({
    frame: frame - matchAt,
    fps,
    config: { damping: 40, stiffness: 100 },
  });

  /** The reading head's x, sweeping right to left across the whole row. */
  const headX = interpolate(
    scan,
    [0, 1],
    [width, cardLeft(matchIndex) + cardW / 2],
  );

  /** A card is lit while the head is over it, and the match stays lit. */
  const litness = (i: number) => {
    const cx = cardLeft(i) + cardW / 2;
    const near = 1 - Math.min(1, Math.abs(headX - cx) / (cardW * 0.75));
    // Includes the frame the head lands on: excluding it leaves a beat where
    // the sweep has finished and the spring has not started, and nothing on
    // screen is lit.
    const passing = scan > 0 ? near : 0;
    return i === matchIndex
      ? Math.max(passing, settled)
      : passing * (1 - settled);
  };

  const stepIn = (i: number) =>
    stepsAt === undefined
      ? 0
      : spring({
          frame: frame - stepsAt - i * 9,
          fps,
          config: { damping: 200 },
        });

  const stepTop = cardTop + cardH + height * 0.075;
  const stepH = height * 0.14;

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The request. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          opacity: askIn,
          transform: `translateY(${interpolate(askIn, [0, 1], [-16, 0])}px)`,
        }}
      >
        <div
          style={{
            maxWidth: "84%",
            fontFamily,
            fontSize: height * 0.056,
            fontWeight: 600,
            lineHeight: 1.3,
            color: COLORS.ink,
            backgroundColor: COLORS.labelBg,
            borderRadius: height * 0.06,
            padding: `${height * 0.028}px ${height * 0.05}px`,
            textAlign: "center",
          }}
        >
          {request}
        </div>
      </div>

      {/* The reading head, travelling from the request down across the row. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {scan > 0 && scan < 1 ? (
          <>
            <line
              x1={headX}
              y1={cardTop - height * 0.04}
              x2={headX}
              y2={cardTop + cardH + height * 0.02}
              stroke={COLORS.accent}
              strokeWidth={3}
              strokeOpacity={0.5}
              strokeDasharray="8 8"
            />
            <circle
              cx={headX}
              cy={cardTop - height * 0.05}
              r={height * 0.016}
              fill={COLORS.accent}
            />
          </>
        ) : null}

        {/* Once settled, a solid tether from the request to the answer. */}
        {settled > 0.02 ? (
          <path
            d={`M ${width / 2} ${height * 0.14} C ${width / 2} ${height * 0.17}, ${
              cardLeft(matchIndex) + cardW / 2
            } ${height * 0.16}, ${cardLeft(matchIndex) + cardW / 2} ${cardTop}`}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={3}
            strokeOpacity={0.6 * settled}
          />
        ) : null}
      </svg>

      {/* The installed skills. */}
      {skills.map((skill, i) => {
        const lit = litness(i);
        const matched = i === matchIndex;
        const recede = matched ? 0 : settled;

        return (
          <div
            key={skill.name}
            style={{
              position: "absolute",
              left: cardLeft(i),
              top: cardTop,
              width: cardW,
              height: cardH,
              borderRadius: 24,
              background: COLORS.surface,
              border: `${matched && settled > 0.3 ? 2.5 : 1}px solid ${
                lit > 0.05 ? COLORS.accent : "rgba(255,255,255,0.08)"
              }`,
              boxShadow:
                lit > 0.2
                  ? `0 0 ${height * 0.06}px ${COLORS.accent}33`
                  : undefined,
              opacity: interpolate(recede, [0, 1], [1, 0.26]),
              transform: `scale(${interpolate(recede, [0, 1], [1, 0.94])})`,
              padding: `${cardH * 0.1}px ${cardW * 0.075}px`,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: cardH * 0.08,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardW * 0.05,
              }}
            >
              <LineIcon
                name={skill.icon}
                size={cardH * 0.17}
                color={lit > 0.3 ? COLORS.accent : COLORS.textMuted}
                delay={scanAt - 26 + i * 4}
              />
              {/* A skill's name is a Latin identifier. Left to itself in an
                  RTL row it still reads left to right, but the ellipsis lands
                  on the front of the word and eats the part that identifies
                  it — so the span carries its own direction. */}
              <div
                style={{
                  direction: "ltr",
                  fontFamily,
                  fontSize: cardH * 0.105,
                  fontWeight: 700,
                  color: COLORS.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {skill.name}
              </div>
            </div>

            {/* The description. This is what is being read, so it is the part
                that lights rather than the card as a whole. */}
            <div
              style={{
                flex: 1,
                borderRadius: 14,
                padding: `${cardH * 0.06}px ${cardW * 0.05}px`,
                background: `rgba(217,119,87,${0.16 * lit})`,
                border: `1px solid rgba(217,119,87,${0.55 * lit})`,
                fontFamily,
                fontSize: cardH * 0.095,
                fontWeight: 400,
                lineHeight: 1.4,
                color: lit > 0.3 ? COLORS.text : COLORS.textMuted,
              }}
            >
              {skill.description}
            </div>
          </div>
        );
      })}

      {/* The procedure that was inside the match all along. */}
      {steps && stepsAt !== undefined
        ? steps.map((step, i) => {
            const on = stepIn(i);
            if (on <= 0.001) {
              return null;
            }
            const sGap = width * 0.02;
            const sW = (width * 0.9 - sGap * (steps.length - 1)) / steps.length;
            const left = width * 0.05 + (width * 0.9 - (i + 1) * sW - i * sGap);

            return (
              <div
                key={step}
                style={{
                  position: "absolute",
                  left,
                  top: stepTop,
                  width: sW,
                  height: stepH,
                  borderRadius: 16,
                  background: `${COLORS.accent}1c`,
                  border: `1.5px solid ${COLORS.accent}66`,
                  display: "flex",
                  alignItems: "center",
                  gap: sW * 0.05,
                  padding: `0 ${sW * 0.07}px`,
                  boxSizing: "border-box",
                  opacity: on,
                  transform: `translateY(${interpolate(on, [0, 1], [18, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: stepH * 0.42,
                    height: stepH * 0.42,
                    borderRadius: "50%",
                    background: COLORS.accent,
                    color: COLORS.ink,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily,
                    fontSize: stepH * 0.26,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    fontFamily,
                    fontSize: stepH * 0.25,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    color: COLORS.text,
                  }}
                >
                  {step}
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
};
