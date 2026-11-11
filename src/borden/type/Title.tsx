import React from "react";
import { AbsoluteFill } from "remotion";
import { EASE, ramp } from "../../gacy/engine/time";
import { TYPE } from "../theme";

/** The episode title. Used once, over the opening. */
export const BordenTitle: React.FC<{
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
          ליזי בורדן
        </div>
      </div>
    </AbsoluteFill>
  );
};
