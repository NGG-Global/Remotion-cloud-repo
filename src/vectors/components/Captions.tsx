import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { buildPages, pageAt, type Word } from "../captions";
import { C, DISPLAY, LAYOUT } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Word-synced Hebrew captions. Direction is set on the flex container only,
 * so words stay in logical order and the first one sits rightmost.
 *
 * The whole page is set at once so the eye can read
 * ahead; the spoken word lights up and pops, so the voice and the text stay
 * locked even at narration speed.
 */
export const Captions: React.FC<{ readonly words: readonly Word[] }> = ({
  words,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pages = useMemo(() => buildPages(words), [words]);
  const page = pageAt(pages, t);
  if (!page) return null;

  const enter = interpolate(
    t,
    [page.start - 0.05, page.start + 0.12],
    [0, 1],
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: LAYOUT.captionTop,
        height: LAYOUT.captionHeight,
        display: "flex",
        direction: "rtl",
        flexWrap: "wrap",
        alignContent: "center",
        justifyContent: "center",
        columnGap: 22,
        rowGap: 4,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 24}px)`,
      }}
    >
      {page.words.map((word, i) => {
        const active =
          t >= word.start && t < Math.max(word.end, word.start + 0.12);
        const spoken = t >= word.start;
        const pop = interpolate(
          t,
          [word.start, word.start + 0.08, word.start + 0.22],
          [1, 1.14, 1.06],
          clamp,
        );
        const scale = active ? pop : 1;
        return (
          <span
            key={`${word.start}-${i}`}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 80,
              lineHeight: 1.12,
              color: active
                ? C.yellow
                : spoken
                  ? C.text
                  : "rgba(251,248,255,0.42)",
              transform: `scale(${scale})`,
              display: "inline-block",
              textShadow:
                "0 6px 0 rgba(8,6,30,0.55), 0 0 30px rgba(8,6,30,0.6)",
              WebkitTextStroke: "2px rgba(13,11,39,0.6)",
              paintOrder: "stroke fill",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
