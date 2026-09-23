import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../theme";

export type SheetBlock = {
  /** What this part of the skill file answers. */
  readonly label: string;
  /** How many lines of body it gets. Content is bars: the labels are the point. */
  readonly lines: number;
  readonly at: number;
};

/**
 * A skill file, written section by section.
 *
 * The narration lists what goes in one — the process, the wanted format, what
 * is required and what is forbidden — and a bulleted list of those four would
 * be the video reading the voice-over back. Drawn as a document filling in,
 * the four are visibly parts of one artefact, and the body stays bars so the
 * labels carry it without inviting anyone to read past the narrator.
 */
export const SkillSheet: React.FC<{
  readonly width: number;
  readonly height: number;
  /** The skill's name, on the sheet's header. */
  readonly title: string;
  readonly blocks: readonly SheetBlock[];
  /** Corner tag, e.g. a draft marker. */
  readonly tag?: string;
  readonly delay?: number;
}> = ({ width, height, title, blocks, tag, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const open = spring({ frame: local, fps, config: { damping: 200 } });
  const padX = width * 0.075;
  const headH = height * 0.15;
  const bodyH = height - headH - height * 0.08;
  const blockH = bodyH / blocks.length;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 22,
        background: COLORS.surface,
        border: `2px solid ${COLORS.accent}`,
        boxShadow: `0 0 50px ${COLORS.accent}22`,
        opacity: open,
        transform: `scale(${interpolate(open, [0, 1], [0.94, 1])})`,
        direction: "rtl",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: headH,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${padX}px`,
          borderBottom: `1px solid rgba(255,255,255,0.09)`,
        }}
      >
        <div
          style={{
            direction: "ltr",
            fontFamily,
            fontSize: headH * 0.34,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {title}
        </div>
        {tag ? (
          <div
            style={{
              padding: `${headH * 0.1}px ${headH * 0.22}px`,
              borderRadius: 999,
              background: `${COLORS.accent}26`,
              border: `1px solid ${COLORS.accent}66`,
              fontFamily,
              fontSize: headH * 0.24,
              fontWeight: 700,
              color: COLORS.accentSoft,
            }}
          >
            {tag}
          </div>
        ) : null}
      </div>

      {blocks.map((block, i) => {
        const on = spring({
          frame: local - block.at,
          fps,
          config: { damping: 200 },
        });
        if (on <= 0.001) {
          return null;
        }

        return (
          <div
            key={block.label}
            style={{
              position: "absolute",
              top: headH + i * blockH + blockH * 0.1,
              right: padX,
              left: padX,
              height: blockH * 0.8,
              opacity: on,
              transform: `translateX(${interpolate(on, [0, 1], [16, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily,
                fontSize: blockH * 0.24,
                fontWeight: 700,
                color: COLORS.accent,
                marginBottom: blockH * 0.12,
              }}
            >
              {block.label}
            </div>
            {Array.from({ length: block.lines }, (_, l) => (
              <div
                key={l}
                style={{
                  width: `${88 - l * 17}%`,
                  height: Math.max(3, blockH * 0.075),
                  borderRadius: 999,
                  background: COLORS.textMuted,
                  opacity: interpolate(
                    local - block.at - 6 - l * 4,
                    [0, 10],
                    [0, 0.45],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                  marginBottom: blockH * 0.09,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
