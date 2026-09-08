import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

export type EditSection = {
  /** Share of the page's content height this section takes. */
  readonly weight: number;
  /** Body lines under the heading. Fractional values draw a part line. */
  readonly lines: number;
};

export type EditStage = {
  /** Frame at which the instruction is given. */
  readonly at: number;
  /** What you say, in the words you would actually type. */
  readonly instruction: string;
  /** The page after the instruction has been applied. */
  readonly sections: readonly EditSection[];
  /** Content height as a share of the page. Below 1 the page has been cut. */
  readonly fill?: number;
  /** Index of the section that splits into alternatives. */
  readonly fork?: number;
  /** Frame at which one of the alternatives is picked. */
  readonly chooseAt?: number;
  /** Which alternative is picked. */
  readonly chosen?: number;
  /** Who the page is for. Shown as a chip above it. */
  readonly audience?: string;
  /** Short annotation beside the page, for a change worth measuring. */
  readonly measure?: string;
};

type LiveEditsProps = {
  readonly width: number;
  readonly height: number;
  /** The page before anything is asked of it. */
  readonly initial: {
    readonly sections: readonly EditSection[];
    readonly audience: string;
  };
  readonly stages: readonly EditStage[];
  /** Closing note, once the round of corrections is done. */
  readonly note?: string;
  readonly noteAt?: number;
};

const FORK_LABELS = ["א", "ב", "ג"] as const;

/**
 * Corrections applied to the page, in front of the viewer.
 *
 * This is the passage the episode turns on: the instructions are short and
 * blunt, and what makes them land is seeing the artifact answer each one.
 * The page is never replaced — sections grow, the content is cut, the opening
 * splits into alternatives, the audience changes — so the whole run reads as
 * one document being worked on rather than a series of outputs.
 */
export const LiveEdits: React.FC<LiveEditsProps> = ({
  width,
  height,
  initial,
  stages,
  note,
  noteAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PAGE = { width: Math.min(600, width * 0.34), height: height * 0.94 };
  const pageLeft = width * 0.06;
  const pageTop = (height - PAGE.height) / 2;

  const ease = Easing.bezier(0.35, 0, 0.2, 1);
  const SETTLE = 24;

  // The stage in force, and how far the page has moved into it.
  let index = -1;
  for (let i = 0; i < stages.length; i++) {
    if (frame >= stages[i].at) {
      index = i;
    }
  }
  const stage = index >= 0 ? stages[index] : undefined;
  const before =
    index > 0
      ? stages[index - 1]
      : { sections: initial.sections, audience: initial.audience, fill: 1 };

  const t = stage
    ? interpolate(frame, [stage.at, stage.at + SETTLE], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease,
      })
    : 0;

  // Section geometry is interpolated rather than swapped, so a change is
  // something the viewer watches happen.
  const sections = (stage?.sections ?? initial.sections).map((to, i) => {
    const from = before.sections[i] ?? to;
    return {
      weight: interpolate(t, [0, 1], [from.weight, to.weight]),
      lines: interpolate(t, [0, 1], [from.lines, to.lines]),
    };
  });
  const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
  const fill = interpolate(t, [0, 1], [before.fill ?? 1, stage?.fill ?? 1]);

  const audience =
    t > 0.5
      ? (stage?.audience ?? initial.audience)
      : (before.audience ?? initial.audience);
  const audienceChanged =
    stage?.audience !== undefined && stage.audience !== before.audience;

  const HEAD = 54;
  const contentTop = pageTop + HEAD + 46;
  const contentHeight = (PAGE.height - HEAD - 76) * fill;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* The page. */}
      <div
        style={{
          position: "absolute",
          left: pageLeft,
          top: pageTop,
          width: PAGE.width,
          height: PAGE.height,
          borderRadius: 20,
          background: COLORS.surface,
          border: "1px solid rgba(255,255,255,0.09)",
          overflow: "hidden",
        }}
      />

      {/* Who it is for. The one field an instruction can change outright. */}
      <div
        style={{
          position: "absolute",
          left: pageLeft + 24,
          top: pageTop + 20,
          direction: "rtl",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.textMuted,
          }}
        >
          קהל
        </span>
        <span
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 800,
            padding: "5px 16px",
            borderRadius: 999,
            color: audienceChanged && t > 0.5 ? COLORS.background : COLORS.text,
            background:
              audienceChanged && t > 0.5
                ? COLORS.accent
                : "rgba(255,255,255,0.08)",
            whiteSpace: "nowrap",
          }}
        >
          {audience}
        </span>
      </div>

      {/* Sections. */}
      {sections.map((section, i) => {
        const above = sections
          .slice(0, i)
          .reduce((sum, s) => sum + s.weight, 0);
        const top = contentTop + (above / totalWeight) * contentHeight;
        const h = (section.weight / totalWeight) * contentHeight;
        const forked = stage?.fork === i && t > 0.15;

        if (forked) {
          const spread = interpolate(t, [0.15, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const colWidth = (PAGE.width - 48 - 24) / 3;
          const chosen =
            stage?.chooseAt !== undefined && frame >= stage.chooseAt
              ? stage.chosen
              : undefined;
          const pick =
            stage?.chooseAt !== undefined
              ? interpolate(frame - stage.chooseAt, [0, 16], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0;

          return (
            <React.Fragment key={i}>
              {[0, 1, 2].map((c) => {
                const isChosen = chosen === c;
                return (
                  <div
                    key={c}
                    style={{
                      position: "absolute",
                      // Alternative one sits rightmost, with the language.
                      left: pageLeft + 24 + c * (colWidth + 12),
                      top,
                      width: colWidth,
                      height: h - 12,
                      borderRadius: 10,
                      border: `2px solid ${
                        isChosen ? COLORS.accent : "rgba(255,255,255,0.14)"
                      }`,
                      background: isChosen
                        ? "rgba(217,119,87,0.16)"
                        : "rgba(255,255,255,0.03)",
                      opacity:
                        spread *
                        (chosen === undefined
                          ? 1
                          : isChosen
                            ? 1
                            : 1 - pick * 0.6),
                      padding: "10px 12px",
                      boxSizing: "border-box",
                      direction: "rtl",
                    }}
                  >
                    <div
                      style={{
                        fontFamily,
                        fontSize: 20,
                        fontWeight: 800,
                        color: isChosen ? COLORS.accent : COLORS.textMuted,
                        marginBottom: 8,
                      }}
                    >
                      {FORK_LABELS[c]}
                    </div>
                    {[0.9, 0.72, 0.84].map((w, l) => (
                      <div
                        key={l}
                        style={{
                          height: 7,
                          width: `${w * 100}%`,
                          marginBottom: 8,
                          borderRadius: 4,
                          background: isChosen
                            ? COLORS.accentSoft
                            : COLORS.textMuted,
                          opacity: isChosen ? 0.9 : 0.45,
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          );
        }

        const barGap = Math.max(
          12,
          (h - 26) / Math.max(1, Math.ceil(section.lines)),
        );

        return (
          <React.Fragment key={i}>
            {/* Heading. */}
            <div
              style={{
                position: "absolute",
                right: width - (pageLeft + PAGE.width) + 24,
                top,
                width: PAGE.width * 0.42,
                height: 16,
                borderRadius: 8,
                background: COLORS.accent,
                opacity: 0.92,
              }}
            />
            {Array.from({ length: Math.ceil(section.lines) }, (_, l) => {
              // The last line is drawn part-width when the count is
              // fractional, so growing a section reads as writing into it.
              const part = Math.max(0, Math.min(1, section.lines - l));
              const widths = [0.94, 0.86, 0.97, 0.78, 0.9, 0.83, 0.7];
              const w = widths[l % widths.length] * part;
              if (w <= 0.01) {
                return null;
              }
              return (
                <div
                  key={l}
                  style={{
                    position: "absolute",
                    right: width - (pageLeft + PAGE.width) + 24,
                    top: top + 30 + l * barGap,
                    width: (PAGE.width - 48) * w,
                    height: 9,
                    borderRadius: 5,
                    background: COLORS.text,
                    opacity: 0.42,
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}

      {/* A cut worth measuring, bracketed off the page. */}
      {stage?.measure ? (
        <div
          style={{
            position: "absolute",
            left: pageLeft + PAGE.width + 18,
            top: contentTop + contentHeight,
            direction: "rtl",
            fontFamily,
            fontSize: 30,
            fontWeight: 800,
            color: COLORS.accent,
            opacity: interpolate(t, [0.35, 0.85], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            whiteSpace: "nowrap",
          }}
        >
          {stage.measure}
        </div>
      ) : null}

      {/* What you said, kept in view so the run of corrections is countable. */}
      {stages.map((s, i) => {
        const pop = spring({
          frame: frame - s.at,
          fps,
          config: { damping: 70, stiffness: 150 },
        });
        if (frame < s.at - 2) {
          return null;
        }
        const live = i === index;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * 0.52,
              top: height * 0.1 + i * (height * 0.19),
              width: width * 0.44,
              direction: "rtl",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              opacity: pop * (live ? 1 : 0.42),
              transform: `translateX(${(1 - pop) * -26}px)`,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 26,
                fontWeight: 800,
                color: live ? COLORS.background : COLORS.textMuted,
                background: live ? COLORS.accent : "rgba(255,255,255,0.08)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontFamily,
                fontSize: 38,
                fontWeight: 700,
                lineHeight: 1.3,
                color: live ? COLORS.text : COLORS.textMuted,
              }}
            >
              {s.instruction}
            </span>
          </div>
        );
      })}

      {note && noteAt !== undefined && frame >= noteAt - 2 ? (
        <div
          style={{
            position: "absolute",
            left: width * 0.52,
            top: height * 0.88,
            width: width * 0.44,
            direction: "rtl",
            fontFamily,
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.accent,
            opacity: interpolate(frame - noteAt, [0, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
