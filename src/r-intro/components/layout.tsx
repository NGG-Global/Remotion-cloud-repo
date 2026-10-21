import React from "react";

/** Absolutely positioned block, the layout primitive every scene uses. */
export const At: React.FC<{
  readonly x?: number;
  readonly y: number;
  readonly w?: number;
  readonly center?: boolean;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ x = 72, y, w = 936, center = true, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      display: "flex",
      flexDirection: "column",
      alignItems: center ? "center" : "flex-start",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Horizontal row of stickers, centred, wrapping. */
export const Row: React.FC<{
  readonly children: React.ReactNode;
  readonly gap?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, gap = 28, style }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap,
      direction: "rtl",
      ...style,
    }}
  >
    {children}
  </div>
);
