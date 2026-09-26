import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE, ramp } from "../engine/time";
import { TYPE } from "../theme";

/**
 * The only on-screen type style in the film: a quiet documentary label.
 * A place, a date, a name. Never a sentence.
 *
 * Right-aligned for Hebrew, bottom corner, inside the title-safe area, with
 * a thin rule. It slides 12 px and fades; it never pops.
 */
export const Label: React.FC<{
  readonly t: number;
  /** Seconds (shot-local) the label comes in and goes out. */
  readonly from: number;
  readonly to: number;
  readonly line: string;
  readonly sub?: string;
  readonly corner?: "br" | "bl" | "tr";
  readonly tone?: "light" | "dark";
}> = ({ t, from, to, line, sub, corner = "br", tone = "light" }) => {
  const k = Math.min(ramp(t, from, from + 0.7, EASE.out), 1 - ramp(t, to - 0.6, to, EASE.in));
  if (k <= 0) {
    return null;
  }
  const color = tone === "light" ? "#f2ece0" : "#1c1712";
  const rule = tone === "light" ? "#d9a45a" : "#8a5a2a";
  const pos: React.CSSProperties =
    corner === "br"
      ? { right: 132, bottom: 118, alignItems: "flex-end" }
      : corner === "bl"
        ? { left: 132, bottom: 118, alignItems: "flex-start" }
        : { right: 132, top: 104, alignItems: "flex-end" };
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
        <div style={{ width: 64 * k + 24, height: 2, background: rule, opacity: 0.9 }} />
        <div
          style={{
            fontFamily: TYPE.serif,
            fontWeight: 500,
            fontSize: 50,
            color,
            direction: "rtl",
            lineHeight: 1.05,
            textShadow: tone === "light" ? "0 2px 20px rgba(0,0,0,0.6)" : "none",
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
              letterSpacing: 2,
              color,
              opacity: 0.78,
              direction: "rtl",
              textShadow: tone === "light" ? "0 2px 16px rgba(0,0,0,0.6)" : "none",
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

/** The episode title. Used once, over the opening. */
export const Title: React.FC<{
  readonly t: number;
  readonly from: number;
  readonly to: number;
}> = ({ t, from, to }) => {
  const k = Math.min(ramp(t, from, from + 1.4, EASE.out), 1 - ramp(t, to - 1.2, to, EASE.in));
  const k2 = Math.min(ramp(t, from + 0.9, from + 2.2, EASE.out), 1 - ramp(t, to - 1.2, to, EASE.in));
  if (k <= 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, translate: `0px ${-70 + (1 - k) * 10}px` }}>
        <div
          style={{
            fontFamily: TYPE.serif,
            fontWeight: 400,
            fontSize: 30,
            letterSpacing: 10,
            color: "#d9c9a8",
            opacity: k2 * 0.85,
            direction: "rtl",
            textShadow: "0 2px 24px rgba(0,0,0,0.7)",
          }}
        >
          מאחורי הסיוט
        </div>
        <div style={{ width: 120 * k2, height: 1.5, background: "#c89a5a", opacity: 0.8 }} />
        <div
          style={{
            fontFamily: TYPE.serif,
            fontWeight: 600,
            fontSize: 96,
            color: "#f4eee2",
            opacity: k,
            direction: "rtl",
            letterSpacing: 1,
            textShadow: "0 4px 40px rgba(0,0,0,0.75)",
          }}
        >
          ג׳ון וויין גייסי
        </div>
      </div>
    </AbsoluteFill>
  );
};
