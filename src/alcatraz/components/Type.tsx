import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../../doc/fonts";
import "../../fonts";
import {
  AZ,
  easeOut,
  FPS,
  ramp,
  SANS,
  SERIF,
  SERIF_LATIN,
} from "../theme";

const isLatin = (s: string): boolean => !/[֐-׿]/.test(s);

/** Fade/rise envelope for type that arrives at `at` and leaves at `until` (seconds, shot-local). */
const useEnvelope = (at: number, until?: number, rise = 0.6) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inT = easeOut(ramp(t, at, at + rise));
  const outT = until === undefined ? 1 : 1 - ramp(t, until - 0.4, until);
  return { o: inT * outT, y: (1 - inT) * 16 };
};

/**
 * Lower-third: a name or a place and, under it, what it is. Sits on the
 * right in Hebrew reading order with a hairline that draws in first.
 */
export const Label: React.FC<{
  readonly title: string;
  readonly sub?: string;
  readonly at?: number;
  readonly until?: number;
  readonly side?: "right" | "left";
  readonly bottom?: number;
}> = ({ title, sub, at = 0.4, until, side = "right", bottom = 120 }) => {
  const { o, y } = useEnvelope(at, until);
  const frame = useCurrentFrame();
  const line = easeOut(ramp(frame / FPS, at - 0.2, at + 0.5));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          bottom,
          [side]: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: side === "right" ? "flex-end" : "flex-start",
          gap: 10,
          opacity: o,
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            width: 90 * line,
            height: 3,
            background: AZ.red,
            boxShadow: "0 0 12px rgba(0,0,0,0.8)",
          }}
        />
        <div
          style={{
            fontFamily: isLatin(title) ? SERIF_LATIN : SERIF,
            direction: isLatin(title) ? "ltr" : "rtl",
            fontSize: 58,
            fontWeight: 600,
            color: AZ.text,
            textShadow: "0 2px 18px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: isLatin(sub) ? SERIF_LATIN : SANS,
              direction: isLatin(sub) ? "ltr" : "rtl",
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: isLatin(sub) ? 3 : 0.5,
              color: AZ.paperDark,
              textShadow: "0 2px 14px rgba(0,0,0,0.95)",
              whiteSpace: "nowrap",
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** Large centred date or title over the picture, for the turns of the story. */
export const DateCard: React.FC<{
  readonly date: string;
  readonly sub?: string;
  readonly at?: number;
  readonly until?: number;
  readonly size?: number;
}> = ({ date, sub, at = 0.2, until, size = 110 }) => {
  const { o, y } = useEnvelope(at, until, 0.9);
  const frame = useCurrentFrame();
  const rule = easeOut(ramp(frame / FPS, at + 0.3, at + 1.2));
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 22,
        opacity: o,
        transform: `translateY(${y}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: isLatin(date) ? SERIF_LATIN : SERIF,
          direction: isLatin(date) ? "ltr" : "rtl",
          fontSize: size,
          fontWeight: 500,
          color: AZ.text,
          letterSpacing: isLatin(date) ? 6 : 1,
          textShadow: "0 4px 40px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)",
          whiteSpace: "nowrap",
        }}
      >
        {date}
      </div>
      <div
        style={{
          width: 420 * rule,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${AZ.red} 30%, ${AZ.red} 70%, transparent)`,
        }}
      />
      {sub ? (
        <div
          style={{
            fontFamily: SERIF,
            direction: "rtl",
            fontSize: 44,
            fontWeight: 400,
            color: AZ.paper,
            textShadow: "0 2px 24px rgba(0,0,0,0.95)",
            whiteSpace: "nowrap",
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Subtitle line for archival sound, bottom centre. */
export const Subtitle: React.FC<{
  readonly text: string;
  readonly from: number;
  readonly to: number;
}> = ({ text, from, to }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = ramp(t, from, from + 0.15) * (1 - ramp(t, to - 0.15, to));
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 70,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          fontFamily: SANS,
          direction: "rtl",
          textAlign: "center",
          fontSize: 44,
          lineHeight: 1.35,
          fontWeight: 500,
          color: "#ffffff",
          opacity: o,
          padding: "10px 26px",
          background: "rgba(0,0,0,0.62)",
          borderRadius: 6,
          textShadow: "0 1px 3px rgba(0,0,0,0.9)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Words that land one at a time on a beat of the narration: the four parts of
 * an empire, the three kinds of prisoner. Each takes its own line.
 */
export const Beats: React.FC<{
  readonly items: readonly { readonly at: number; readonly text: string }[];
  readonly until?: number;
  readonly align?: "center" | "right";
  readonly size?: number;
}> = ({ items, until, align = "center", size = 64 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const out = until === undefined ? 1 : 1 - ramp(t, until - 0.5, until);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: align === "center" ? "center" : "flex-end",
        paddingRight: align === "right" ? 150 : 0,
        flexDirection: "column",
        gap: 18,
        opacity: out,
        pointerEvents: "none",
      }}
    >
      {items.map((it, i) => {
        const o = easeOut(ramp(t, it.at, it.at + 0.45));
        return (
          <div
            key={i}
            style={{
              fontFamily: SERIF,
              direction: "rtl",
              fontSize: size,
              fontWeight: 500,
              color: AZ.text,
              opacity: o,
              transform: `translateX(${(1 - o) * -30}px)`,
              textShadow: "0 3px 30px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            {it.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
