import React from "react";
import { C, MONO } from "../theme";
import { clamp01, rand } from "../motion";

/**
 * A vector written out as a bracketed column of numbers. Entries land one
 * after another; before an entry lands it flickers through random digits, the
 * way a value looks while it is still being worked out.
 */
export const NumberVector: React.FC<{
  readonly values: readonly number[];
  /** 0 -> 1: how many entries have landed. */
  readonly progress: number;
  readonly t: number;
  readonly color?: string;
  readonly fontSize?: number;
  /** Entry index to highlight, if any. */
  readonly highlight?: number;
  readonly dots?: boolean;
  readonly horizontal?: boolean;
}> = ({
  values,
  progress,
  t,
  color = C.sky,
  fontSize = 46,
  highlight,
  dots = false,
  horizontal = false,
}) => {
  const landed = progress * values.length;
  const items = values.map((v, i) => {
    const local = clamp01(landed - i);
    const settled = local >= 1;
    const shown = settled
      ? v
      : Math.round((rand(i * 31 + Math.floor(t * 18)) * 2 - 1) * 100) / 100;
    const text = `${shown >= 0 ? " " : "-"}${Math.abs(shown).toFixed(2)}`;
    const isHi = highlight === i;
    return (
      <div
        key={i}
        style={{
          opacity: local > 0 ? 0.35 + 0.65 * local : 0,
          color: isHi ? C.ink : settled ? C.text : color,
          background: isHi ? C.yellow : "transparent",
          borderRadius: 10,
          padding: horizontal ? "2px 10px" : "0 14px",
          transform: `scale(${isHi ? 1.08 : 1})`,
          whiteSpace: "pre",
        }}
      >
        {text}
      </div>
    );
  });

  const bracket = (side: "left" | "right") => (
    <div
      style={{
        alignSelf: "stretch",
        width: 18,
        border: `6px solid ${color}`,
        borderLeft: side === "right" ? "none" : undefined,
        borderRight: side === "left" ? "none" : undefined,
        borderRadius: side === "left" ? "10px 0 0 10px" : "0 10px 10px 0",
      }}
    />
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {bracket("left")}
      <div
        style={{
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          gap: horizontal ? 4 : 2,
          fontFamily: MONO,
          fontWeight: 600,
          fontSize,
          fontVariantNumeric: "tabular-nums",
          padding: horizontal ? "8px 0" : "10px 0",
        }}
      >
        {items}
        {dots ? (
          <div
            style={{
              color: C.textMuted,
              textAlign: "center",
              opacity: clamp01(landed - values.length + 1),
            }}
          >
            {horizontal ? "…" : "⋮"}
          </div>
        ) : null}
      </div>
      {bracket("right")}
    </div>
  );
};
