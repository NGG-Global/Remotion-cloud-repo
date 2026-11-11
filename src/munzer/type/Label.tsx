import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE, dirOf, ramp } from "../engine/time";
import { INK, TYPE } from "../theme";

/**
 * The documentary label: a place, a date, a name. Same treatment as the
 * Gacy episode of the series: serif, amber rule, bottom corner, inside
 * title-safe, slides 12 px and fades. Never a sentence.
 */
export const Label: React.FC<{
  readonly t: number;
  readonly dur: number;
  readonly line: string;
  readonly sub?: string;
  readonly corner?: "br" | "bl" | "tr" | "tl";
}> = ({ t, dur, line, sub, corner = "br" }) => {
  const k = Math.min(ramp(t, 0, 0.7, EASE.out), 1 - ramp(t, dur - 0.6, dur, EASE.in));
  if (k <= 0) {
    return null;
  }
  const right = corner === "br" || corner === "tr";
  const top = corner === "tr" || corner === "tl";
  const pos: React.CSSProperties = {
    ...(right ? { right: 132 } : { left: 132 }),
    ...(top ? { top: 100 } : { bottom: 112 }),
    alignItems: right ? "flex-end" : "flex-start",
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          ...pos,
          opacity: k,
          translate: `0px ${(1 - k) * 12}px`,
        }}
      >
        <div style={{ width: 64 * k + 24, height: 2, background: INK.amber, opacity: 0.9 }} />
        <div
          style={{
            fontFamily: TYPE.serif,
            fontWeight: 500,
            fontSize: 50,
            color: INK.text,
            direction: dirOf(line),
            lineHeight: 1.05,
            textShadow: "0 2px 20px rgba(0,0,0,0.75)",
            whiteSpace: "nowrap",
          }}
        >
          {line}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: TYPE.serif,
              fontWeight: 400,
              fontSize: 30,
              letterSpacing: 1.5,
              color: INK.text,
              opacity: 0.8,
              direction: dirOf(sub),
              textShadow: "0 2px 16px rgba(0,0,0,0.75)",
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

/**
 * Hebrew subtitle for an archive sound bite. Only used where the film lets
 * the archive speak in another language; the narration itself is never
 * subtitled.
 */
export const Subtitle: React.FC<{
  readonly t: number;
  readonly dur: number;
  readonly text: string;
  readonly source?: string;
}> = ({ t, dur, text, source }) => {
  const k = Math.min(ramp(t, 0, 0.25, EASE.out), 1 - ramp(t, dur - 0.25, dur, EASE.in));
  if (k <= 0) {
    return null;
  }
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 86,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: k,
          maxWidth: 1500,
        }}
      >
        {source ? (
          <div
            style={{
              fontFamily: TYPE.hebrew,
              fontWeight: 400,
              fontSize: 24,
              letterSpacing: 1,
              color: INK.amber,
              direction: "rtl",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            {source}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: TYPE.hebrew,
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.3,
            color: "#fbf7ef",
            direction: "rtl",
            textAlign: "center",
            textShadow: "0 0 6px rgba(0,0,0,0.95), 0 3px 18px rgba(0,0,0,0.9)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
