import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { bob, pop, ramp } from "../motion";
import { C, DISPLAY, EMOJI, PALETTE } from "../theme";

/**
 * Chapter divider: a big numeral stamped in, the chapter's emoji bouncing on
 * it, and the title sliding up underneath.
 */
export const ChapterScene: React.FC<{
  readonly n: number;
  readonly title: string;
  readonly emoji: string;
}> = ({ n, title, emoji }) => {
  const { t, fps } = useScene();
  const color = PALETTE[(n - 1) % PALETTE.length];
  const stamp = pop(t, 0.05, fps, 9);
  const glyph = pop(t, 0.35, fps, 8);
  const label = ramp(t, 0.2, 0.6);
  const titleIn = ramp(t, 0.45, 0.95);

  return (
    <Stage>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 46,
            color,
            letterSpacing: 2,
            opacity: label,
            transform: `translateY(${(1 - label) * 20}px)`,
          }}
        >
          חלק {HEB_ORDINAL[n - 1] ?? n}
        </div>
        <div
          style={{
            position: "relative",
            width: 420,
            height: 420,
            marginTop: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: color,
              transform: `scale(${stamp}) rotate(${(1 - stamp) * -30}deg)`,
              boxShadow: `0 24px 0 rgba(0,0,0,0.25)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 300,
              color: C.ink,
              lineHeight: 1,
            }}
          >
            {n}
          </div>
          <div
            style={{
              position: "absolute",
              left: -10,
              top: -30,
              fontFamily: EMOJI,
              fontSize: 170,
              transform: `translateY(${bob(t, n, 12, 2.4)}px) scale(${glyph}) rotate(${-12 + bob(t, n + 2, 6, 1.7)}deg)`,
            }}
          >
            {emoji}
          </div>
        </div>
        <div
          style={{
            marginTop: 60,
            padding: "0 70px",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 84,
            lineHeight: 1.12,
            color: C.text,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
          }}
        >
          {title}
        </div>
      </div>
    </Stage>
  );
};

const HEB_ORDINAL = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שביעי",
];
