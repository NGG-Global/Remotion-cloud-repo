import React from "react";
import { IconName } from "../pixel/icons";
import { Pixel, iconSize } from "../pixel/Pixel";
import { OUTLINE, SHADOW } from "../engine/kit";
import { BEAT, BEAT0, C, FONT, clamp01, easeOut, pop, ramp } from "../theme";

/** Gentle float, phase-locked to the music so idle motion breathes with it. */
export const bob = (now: number, amp = 8, seed = 0): number =>
  Math.sin(((now - BEAT0) / BEAT) * Math.PI + seed) * amp;

/** Decaying shake after an event at `at`. */
export const shake = (
  now: number,
  at: number,
  dur = 0.5,
  amp = 10,
  freq = 38,
): number => {
  const age = now - at;
  if (age < 0 || age > dur) return 0;
  return Math.sin(age * freq) * amp * (1 - age / dur);
};

/** A pixel icon, centred on (x, y), popping in at `at`. */
export const Ico: React.FC<{
  readonly name: IconName;
  readonly px: number;
  readonly x: number;
  readonly y: number;
  readonly at: number;
  readonly now: number;
  readonly out?: number;
  readonly mono?: string;
  readonly colors?: Partial<Record<string, string>>;
  readonly flip?: boolean;
  readonly float?: number;
  readonly rot?: number;
  readonly build?: boolean;
}> = ({
  name,
  px,
  x,
  y,
  at,
  now,
  out,
  mono,
  colors,
  flip,
  float = 0,
  rot = 0,
  build,
}) => {
  const p = pop(now - at, 0.45, 0.35);
  if (p <= 0) return null;
  const o = out === undefined ? 0 : easeOut(ramp(now, out, out + 0.25));
  if (o >= 1) return null;
  const { w, h } = iconSize(name);
  const s = (0.3 + 0.7 * p) * (1 - o * 0.5);
  return (
    <div
      style={{
        position: "absolute",
        left: x - (w * px) / 2,
        top: y - (h * px) / 2 + (float ? bob(now, float, x * 0.01) : 0),
        transform: `scale(${s}) rotate(${rot + (1 - Math.min(1, p)) * -10}deg)`,
        opacity: clamp01((now - at) / 0.05) * (1 - o),
      }}
    >
      <Pixel
        name={name}
        px={px}
        mono={mono}
        colors={colors}
        flip={flip}
        build={build ? clamp01((now - at) / 0.5) : 1}
      />
    </div>
  );
};

/** Sticker card: a flat panel with the house outline and hard shadow. */
export const Panel: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly fill?: string;
  readonly radius?: number;
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly line?: string;
}> = ({
  x,
  y,
  w,
  h,
  fill = C.white,
  radius = 28,
  children,
  style,
  line = C.ink,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      background: fill,
      border: `${OUTLINE}px solid ${line}`,
      borderRadius: radius,
      boxShadow: `${SHADOW}px ${SHADOW}px 0 rgba(0,0,0,0.22)`,
      boxSizing: "border-box",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Absolutely positioned centred text. */
export const Txt: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly children: React.ReactNode;
  readonly size?: number;
  readonly color?: string;
  readonly font?: string;
  readonly weight?: number;
  readonly opacity?: number;
  readonly rot?: number;
  readonly scale?: number;
  readonly style?: React.CSSProperties;
}> = ({
  x,
  y,
  children,
  size = 44,
  color = C.ink,
  font = FONT.sans,
  weight = 700,
  opacity = 1,
  rot = 0,
  scale = 1,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
      fontFamily: font,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.1,
      color,
      direction: "rtl",
      whiteSpace: "nowrap",
      opacity,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pop scale for an element appearing at `at` (0 before, ~1 after). */
export const popAt = (now: number, at: number, dur = 0.42): number =>
  pop(now - at, dur, 0.34);

/** 0..1 visibility between `at` and `out`, with short fades. */
export const live = (
  now: number,
  at: number,
  out = Infinity,
  fade = 0.18,
): number => clamp01((now - at) / fade) * (1 - clamp01((now - out) / fade));

/** A hand-drawn marker line, drawn on along its length. */
export const DrawPath: React.FC<{
  readonly d: string;
  readonly p: number;
  readonly color?: string;
  readonly width?: number;
  readonly dash?: string;
}> = ({ d, p, color = C.ink, width = 10, dash }) =>
  p <= 0 ? null : (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={dash ? undefined : 1}
      strokeDashoffset={dash ? undefined : 1 - clamp01(p)}
      style={dash ? { strokeDasharray: dash } : undefined}
    />
  );

/** Full-frame SVG layer in frame coordinates. */
export const Svg: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      overflow: "visible",
      ...style,
    }}
  >
    {children}
  </svg>
);

/** Little sparkles bursting from a point at `at`. */
export const Burst: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly at: number;
  readonly now: number;
  readonly color?: string;
  readonly n?: number;
  readonly r?: number;
}> = ({ x, y, at, now, color = C.yellow, n = 8, r = 120 }) => {
  const age = now - at;
  if (age < 0 || age > 0.7) return null;
  const p = easeOut(age / 0.7);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = r * (0.4 + 0.6 * p);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - 9,
              top: y + Math.sin(a) * d - 9,
              width: 18,
              height: 18,
              background: color,
              border: `4px solid ${C.ink}`,
              transform: `rotate(45deg) scale(${1 - p})`,
            }}
          />
        );
      })}
    </>
  );
};
