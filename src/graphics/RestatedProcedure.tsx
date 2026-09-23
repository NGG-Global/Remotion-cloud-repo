import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type Restatement = {
  /** What this week's conversation was called. */
  readonly label: string;
  /** The same procedure, worded the way it came out that time. */
  readonly steps: readonly string[];
  readonly at: number;
};

type RestatedProcedureProps = {
  readonly width: number;
  readonly height: number;
  /** Right to left in the order given. Every entry needs the same step count. */
  readonly rounds: readonly Restatement[];
  /**
   * Frame at which the equivalent steps are shown to be the same step, row by
   * row. Omit to leave the picture on the restating.
   */
  readonly alignAt?: number;
};

/**
 * The same procedure, explained again from scratch every week.
 *
 * The narration's opening is not that the work is hard, it is that the
 * *explaining* repeats: same format, same rules, near enough the same request,
 * only ever reworded. Three conversations side by side make the rewording
 * visible, and then the rows light across all three at once — which is the
 * moment the viewer sees that three different-looking asks were one procedure
 * the whole time. Written as a sentence this is a complaint; drawn this way it
 * is an observation the viewer makes for themselves.
 */
export const RestatedProcedure: React.FC<RestatedProcedureProps> = ({
  width,
  height,
  rounds,
  alignAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const n = rounds.length;
  const gap = width * 0.028;
  const cardW = (width - gap * (n - 1)) / n;
  const cardH = height * 0.86;
  const cardTop = height * 0.02;
  // Right to left: the first round named sits rightmost.
  const cardLeft = (i: number) => width - (i + 1) * cardW - i * gap;

  const stepCount = rounds[0].steps.length;
  const headH = cardH * 0.17;
  const stepH = (cardH - headH - cardH * 0.1) / stepCount;

  /** How lit step `s` is, once the rows are shown to line up. */
  const rowLight = (s: number) =>
    alignAt === undefined
      ? 0
      : interpolate(frame - alignAt - s * 8, [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* Rails joining each row across the three conversations, drawn once the
          rows have been shown to be the same row. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {Array.from({ length: stepCount }, (_, s) => {
          const light = rowLight(s);
          if (light <= 0.02) {
            return null;
          }
          const y = cardTop + headH + stepH * (s + 0.5);
          const x1 = cardLeft(n - 1) + cardW * 0.5;
          const x2 = cardLeft(0) + cardW * 0.5;
          return (
            <line
              key={s}
              x1={x2}
              y1={y}
              x2={interpolate(light, [0, 1], [x2, x1])}
              y2={y}
              stroke={COLORS.accent}
              strokeWidth={2.5}
              strokeOpacity={0.45 * light}
              strokeDasharray="7 9"
            />
          );
        })}
      </svg>

      {rounds.map((round, i) => {
        const open = spring({
          frame: frame - round.at,
          fps,
          config: { damping: 200 },
        });
        if (open <= 0.001) {
          return null;
        }

        return (
          <div
            key={round.label}
            style={{
              position: "absolute",
              left: cardLeft(i),
              top: cardTop,
              width: cardW,
              height: cardH,
              borderRadius: 24,
              background: COLORS.surface,
              border: `1px solid rgba(255,255,255,0.08)`,
              opacity: open,
              transform: `translateY(${interpolate(open, [0, 1], [26, 0])}px)`,
              padding: `${cardH * 0.05}px ${cardW * 0.07}px`,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                height: headH,
                display: "flex",
                alignItems: "center",
                gap: cardW * 0.04,
              }}
            >
              <div
                style={{
                  width: headH * 0.22,
                  height: headH * 0.22,
                  borderRadius: "50%",
                  background: COLORS.textMuted,
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  fontFamily,
                  fontSize: headH * 0.34,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: COLORS.textMuted,
                }}
              >
                {round.label}
              </div>
            </div>

            {round.steps.map((step, s) => {
              const light = rowLight(s);
              const arrive = interpolate(
                frame - round.at - 8 - s * 5,
                [0, 12],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );

              return (
                <div
                  key={s}
                  style={{
                    height: stepH,
                    display: "flex",
                    alignItems: "center",
                    gap: cardW * 0.045,
                    opacity: arrive,
                  }}
                >
                  <div
                    style={{
                      width: stepH * 0.3,
                      height: stepH * 0.3,
                      borderRadius: 8,
                      flexShrink: 0,
                      background:
                        light > 0.1 ? COLORS.accent : "rgba(255,255,255,0.12)",
                      opacity: 0.3 + light * 0.7,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      padding: `${stepH * 0.1}px ${cardW * 0.04}px`,
                      background: `rgba(217,119,87,${0.15 * light})`,
                      border: `1px solid rgba(217,119,87,${0.5 * light})`,
                      fontFamily,
                      fontSize: stepH * 0.27,
                      fontWeight: light > 0.4 ? 600 : 400,
                      lineHeight: 1.3,
                      color: light > 0.4 ? COLORS.text : COLORS.textMuted,
                    }}
                  >
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
