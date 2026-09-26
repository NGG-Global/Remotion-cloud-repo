import React from "react";
import { PAL, TYPE } from "../theme";

/** Short on-screen label. Hebrew by default, a few words, never a paragraph. */
export const Caption: React.FC<{
  readonly text: string;
  readonly x?: number;
  readonly y?: number;
  readonly size?: number;
  readonly align?: "right" | "center" | "left";
  readonly opacity?: number;
  readonly latin?: boolean;
  readonly tone?: "paper" | "ink" | "amber";
}> = ({
  text,
  x = 96,
  y = 86,
  size = 42,
  align = "right",
  opacity = 1,
  latin = false,
  tone = "paper",
}) => {
  const color =
    tone === "ink" ? PAL.ink : tone === "amber" ? PAL.amber : PAL.text;
  return (
    <div
      style={{
        position: "absolute",
        left: align === "left" || align === "center" ? x : undefined,
        right: align === "right" ? x : undefined,
        top: y,
        transform: align === "center" ? "translateX(-50%)" : undefined,
        opacity,
        color,
        fontFamily: latin ? TYPE.latin : TYPE.hebrew,
        fontWeight: latin ? 600 : 560,
        fontSize: size,
        letterSpacing: latin ? 0.4 : 0,
        lineHeight: 1.15,
        direction: latin ? "ltr" : "rtl",
        textShadow: tone === "ink" ? "none" : "0 2px 18px rgba(0,0,0,0.55)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
