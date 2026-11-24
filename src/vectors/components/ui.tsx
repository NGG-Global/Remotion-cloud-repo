import React from "react";
import { C, DISPLAY, EMOJI } from "../theme";
import { clamp01 } from "../motion";

type Pos = { readonly x: number; readonly y: number };

/** Anything absolutely placed by its centre, in stage pixels. */
export const At: React.FC<
  Pos & {
    readonly children: React.ReactNode;
    readonly scale?: number;
    readonly rotate?: number;
    readonly opacity?: number;
  }
> = ({ x, y, children, scale = 1, rotate = 0, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      // Without this an absolutely placed box shrinks to the space left
      // between x and the frame edge, and text near the edge wraps.
      width: "max-content",
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
      opacity,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export const Emoji: React.FC<{
  readonly char: string;
  readonly size: number;
}> = ({ char, size }) => (
  <span style={{ fontFamily: EMOJI, fontSize: size, lineHeight: 1 }}>
    {char}
  </span>
);

/** A coloured disc with an emoji on it: the "token" for a concept. */
export const Disc: React.FC<{
  readonly char: string;
  readonly size: number;
  readonly color: string;
  readonly ring?: boolean;
}> = ({ char, size, color, ring }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 ${size * 0.06}px 0 rgba(0,0,0,0.28)${ring ? `, 0 0 0 ${size * 0.05}px ${C.yellow}` : ""}`,
    }}
  >
    <Emoji char={char} size={size * 0.58} />
  </div>
);

/** Hebrew text label. */
export const Label: React.FC<{
  readonly children: React.ReactNode;
  readonly size?: number;
  readonly color?: string;
  readonly weight?: number;
  readonly width?: number;
  readonly align?: "center" | "right" | "left";
}> = ({
  children,
  size = 44,
  color = C.text,
  weight = 700,
  width,
  align = "center",
}) => (
  <div
    style={{
      direction: "rtl",
      fontFamily: DISPLAY,
      fontWeight: weight,
      fontSize: size,
      color,
      lineHeight: 1.15,
      textAlign: align,
      width,
      whiteSpace: width ? "normal" : "nowrap",
    }}
  >
    {children}
  </div>
);

/** Rounded pill with a label, optionally led by an emoji. */
export const Pill: React.FC<{
  readonly children: React.ReactNode;
  readonly color: string;
  readonly ink?: string;
  readonly size?: number;
  readonly emoji?: string;
}> = ({ children, color, ink = C.ink, size = 40, emoji }) => (
  <div
    style={{
      direction: "rtl",
      display: "flex",
      alignItems: "center",
      gap: size * 0.35,
      background: color,
      color: ink,
      borderRadius: 999,
      padding: `${size * 0.22}px ${size * 0.6}px`,
      fontFamily: DISPLAY,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
    }}
  >
    {emoji ? <Emoji char={emoji} size={size * 1.05} /> : null}
    <span>{children}</span>
  </div>
);

/** Card with a soft lift, content laid out RTL. */
export const Card: React.FC<{
  readonly children: React.ReactNode;
  readonly width: number;
  readonly height?: number;
  readonly color?: string;
  readonly border?: string;
  readonly pad?: number;
}> = ({ children, width, height, color = C.bgLift, border, pad = 32 }) => (
  <div
    style={{
      direction: "rtl",
      width,
      height,
      boxSizing: "border-box",
      padding: pad,
      borderRadius: 36,
      background: color,
      border: border ? `5px solid ${border}` : "none",
      boxShadow: "0 18px 0 rgba(0,0,0,0.25)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
    }}
  >
    {children}
  </div>
);

/** A red slash drawn across whatever sits under it. */
export const Strike: React.FC<{
  readonly progress: number;
  readonly width: number;
  readonly height: number;
  readonly color?: string;
}> = ({ progress, width, height, color = C.coral }) => {
  const p = clamp01(progress);
  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <line
        x1={width * 0.08}
        y1={height * 0.9}
        x2={width * 0.08 + width * 0.84 * p}
        y2={height * 0.9 - height * 0.8 * p}
        stroke={color}
        strokeWidth={Math.max(10, Math.min(width, height) * 0.07)}
        strokeLinecap="round"
        opacity={p > 0 ? 1 : 0}
      />
    </svg>
  );
};

/** Round tick or cross badge. */
export const Verdict: React.FC<{
  readonly ok: boolean;
  readonly size?: number;
}> = ({ ok, size = 90 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: ok ? C.mint : C.coral,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
    }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 10 10">
      {ok ? (
        <polyline
          points="1.5,5.4 4,7.8 8.6,2.4"
          fill="none"
          stroke={C.ink}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <g stroke={C.ink} strokeWidth={1.7} strokeLinecap="round">
          <line x1={2.2} y1={2.2} x2={7.8} y2={7.8} />
          <line x1={7.8} y1={2.2} x2={2.2} y2={7.8} />
        </g>
      )}
    </svg>
  </div>
);
