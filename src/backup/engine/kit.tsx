import React from "react";
import { C, FONT, clamp01, easeOut, pop, ramp } from "../theme";

/**
 * The parts the illustrations are built from. Everything is a sticker: a
 * flat fill, a heavy ink outline and a hard offset shadow, so photo prints,
 * system windows and pixel icons read as one set.
 */

export const OUTLINE = 6;
export const SHADOW = 12;

/** Scales in from its centre at `at`, and out again at `out`. */
export const Pop: React.FC<{
  readonly at: number;
  readonly now: number;
  readonly x: number;
  readonly y: number;
  readonly out?: number;
  readonly dur?: number;
  readonly from?: number;
  readonly rot?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({
  at,
  now,
  x,
  y,
  out,
  dur = 0.42,
  from = 0.3,
  rot = 0,
  children,
  style,
}) => {
  const p = pop(now - at, dur, 0.34);
  if (p <= 0) return null;
  const o = out === undefined ? 0 : easeOut(ramp(now, out, out + 0.22));
  if (o >= 1) return null;
  const s = (from + (1 - from) * p) * (1 - o * 0.4);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s}) rotate(${rot + (1 - Math.min(1, p)) * -8}deg)`,
        opacity: clamp01((now - at) / 0.06) * (1 - o),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

type Tail = "bottom-left" | "bottom-right" | "top-left" | "top-right" | "none";

/** Speech bubble with a hard shadow, drawn to the size it is given. */
export const Bubble: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly fill: string;
  readonly stroke: string;
  readonly tail?: Tail;
  readonly radius?: number;
  readonly shadow?: string;
}> = ({
  w,
  h,
  fill,
  stroke,
  tail = "bottom-left",
  radius = 44,
  shadow = "rgba(0,0,0,0.22)",
}) => {
  const r = Math.min(radius, h / 2);
  const tw = 50;
  const th = 50;
  const left = tail.endsWith("left");
  const bx = left ? w * 0.24 : w * 0.76;
  const tip = left ? bx - tw * 0.8 : bx + tw * 0.8;
  // One outline around body and tail together, so there is no seam.
  const bottomEdge = tail.startsWith("bottom")
    ? left
      ? `H ${bx + tw / 2} L ${tip} ${h + th} L ${bx - tw / 2} ${h} H ${r}`
      : `H ${bx + tw / 2} L ${tip} ${h + th} L ${bx - tw / 2} ${h} H ${r}`
    : `H ${r}`;
  const topEdge = tail.startsWith("top")
    ? `H ${bx - tw / 2} L ${tip} ${-th} L ${bx + tw / 2} 0 H ${w - r}`
    : `H ${w - r}`;
  const d = `M ${r} 0 ${topEdge} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} ${bottomEdge} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      <path d={d} fill={shadow} transform={`translate(${SHADOW} ${SHADOW})`} />
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** A chat or speech bubble with its text, sized from the text. */
export const TextBubble: React.FC<{
  readonly text: string;
  readonly size?: number;
  readonly fill?: string;
  readonly ink?: string;
  readonly stroke?: string;
  readonly tail?: Tail;
  readonly font?: string;
  readonly weight?: number;
  readonly maxWidth?: number;
}> = ({
  text,
  size = 48,
  fill = C.white,
  ink = C.ink,
  stroke = C.ink,
  tail = "bottom-left",
  font = FONT.sans,
  weight = 700,
  maxWidth = 640,
}) => {
  return (
    <div style={{ position: "relative", display: "inline-block", maxWidth }}>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: `${size * 0.42}px ${size * 0.62}px`,
          fontFamily: font,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.18,
          color: ink,
          direction: "rtl",
          whiteSpace: "pre-wrap",
          background: fill,
          border: `${OUTLINE}px solid ${stroke}`,
          borderRadius: size * 0.7,
          boxShadow: `${SHADOW}px ${SHADOW}px 0 rgba(0,0,0,0.22)`,
        }}
      >
        {text}
      </div>
      {tail !== "none" ? (
        <BubbleTail tail={tail} fill={fill} stroke={stroke} />
      ) : null}
    </div>
  );
};

const BubbleTail: React.FC<{ tail: Tail; fill: string; stroke: string }> = ({
  tail,
  fill,
  stroke,
}) => {
  const bottom = tail.startsWith("bottom");
  const left = tail.endsWith("left");
  return (
    <svg
      width={60}
      height={44}
      viewBox="0 0 60 44"
      style={{
        position: "absolute",
        zIndex: 2,
        [left ? "left" : "right"]: 36,
        [bottom ? "bottom" : "top"]: -36,
        transform: `${bottom ? "" : "scaleY(-1)"} ${left ? "" : "scaleX(-1)"}`,
      }}
    >
      <path
        d="M 8 0 L 4 40 L 40 0 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <rect x={0} y={-8} width={60} height={OUTLINE + 6} fill={fill} />
    </svg>
  );
};

/** A system window from the turn of the century, mirrored for Hebrew. */
export const Win: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly title: string;
  readonly crt?: boolean;
  readonly bar?: string;
  readonly body?: string;
  readonly children?: React.ReactNode;
  readonly icon?: React.ReactNode;
}> = ({ w, h, title, crt, bar = C.blue, body = "#ece8df", children, icon }) => {
  const line = crt ? C.amber : C.ink;
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        background: crt ? "#140d04" : body,
        border: `${OUTLINE}px solid ${line}`,
        borderRadius: 10,
        boxShadow: crt
          ? `0 0 26px ${C.amber}55`
          : `${SHADOW}px ${SHADOW}px 0 rgba(0,0,0,0.22)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 64,
          background: crt
            ? "#3a2508"
            : `linear-gradient(270deg, ${bar}, ${mixHex(bar, "#ffffff", 0.25)})`,
          borderBottom: `${OUTLINE}px solid ${line}`,
          display: "flex",
          alignItems: "center",
          direction: "rtl",
          padding: "0 18px",
          gap: 14,
          color: crt ? C.amber : C.white,
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 32,
        }}
      >
        {icon}
        <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
          {title}
        </div>
        {["_", "□", "✕"].map((g) => (
          <div
            key={g}
            style={{
              width: 40,
              height: 36,
              background: crt ? "#140d04" : "#ece8df",
              border: `4px solid ${line}`,
              color: line,
              fontSize: 24,
              lineHeight: "26px",
              textAlign: "center",
              fontFamily: FONT.sans,
              fontWeight: 800,
            }}
          >
            {g}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", height: h - 64 - OUTLINE * 3 }}>
        {children}
      </div>
    </div>
  );
};

/** A raised system button that presses in at `press`. */
export const SysButton: React.FC<{
  readonly label: string;
  readonly now: number;
  readonly press?: number;
  readonly crt?: boolean;
  readonly w?: number;
}> = ({ label, now, press, crt, w = 190 }) => {
  const down = press !== undefined && now >= press && now < press + 0.18;
  const line = crt ? C.amber : C.ink;
  return (
    <div
      style={{
        width: w,
        height: 72,
        border: `5px solid ${line}`,
        background: crt
          ? down
            ? "#3a2508"
            : "#140d04"
          : down
            ? "#d6d1c6"
            : "#f4f1ea",
        boxShadow: down
          ? "none"
          : `5px 5px 0 ${crt ? "#3a2508" : "rgba(0,0,0,0.35)"}`,
        transform: down ? "translate(4px, 4px)" : undefined,
        color: line,
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: 34,
        lineHeight: "62px",
        textAlign: "center",
        direction: "rtl",
      }}
    >
      {label}
    </div>
  );
};

/** Segmented progress bar, the way a 2001 installer drew one. */
export const Segments: React.FC<{
  readonly p: number;
  readonly w: number;
  readonly h: number;
  readonly color: string;
  readonly track?: string;
  readonly line?: string;
  readonly seg?: number;
}> = ({ p, w, h, color, track = "#ffffff", line = C.ink, seg = 22 }) => {
  const inner = w - 16;
  const count = Math.floor(inner / (seg + 6));
  const lit = Math.round(clamp01(p) * count);
  return (
    <div
      style={{
        width: w,
        height: h,
        border: `5px solid ${line}`,
        background: track,
        padding: 3,
        display: "flex",
        // Hebrew progress fills from the right.
        flexDirection: "row-reverse",
        gap: 6,
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: lit }).map((_, i) => (
        <div
          key={i}
          style={{ width: seg, height: "100%", background: color }}
        />
      ))}
    </div>
  );
};

/** A rubber stamp that lands at `at`. */
export const Stamp: React.FC<{
  readonly text: string;
  readonly at: number;
  readonly now: number;
  readonly color?: string;
  readonly size?: number;
  readonly rot?: number;
}> = ({ text, at, now, color = C.red, size = 64, rot = -8 }) => {
  const age = now - at;
  if (age < 0) return null;
  const p = easeOut(ramp(age, 0, 0.16));
  return (
    <div
      style={{
        display: "inline-block",
        padding: `${size * 0.12}px ${size * 0.36}px`,
        border: `${size * 0.09}px solid ${color}`,
        borderRadius: size * 0.18,
        color,
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        direction: "rtl",
        whiteSpace: "nowrap",
        transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * p})`,
        opacity: p,
        mixBlendMode: "multiply",
      }}
    >
      {text}
    </div>
  );
};

/** A marker stroke drawn across, right to left. */
export const Strike: React.FC<{
  readonly at: number;
  readonly now: number;
  readonly w: number;
  readonly color?: string;
  readonly thick?: number;
  readonly rot?: number;
}> = ({ at, now, w, color = C.red, thick = 14, rot = -4 }) => {
  const p = easeOut(ramp(now, at, at + 0.22));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "50%",
        width: w * p,
        height: thick,
        marginTop: -thick / 2,
        background: color,
        borderRadius: thick,
        transform: `rotate(${rot}deg)`,
        transformOrigin: "100% 50%",
      }}
    />
  );
};

/** A tick that draws itself into a box. */
export const CheckBox: React.FC<{
  readonly at: number;
  readonly now: number;
  readonly size?: number;
  readonly color?: string;
  readonly line?: string;
  readonly fill?: string;
}> = ({
  at,
  now,
  size = 64,
  color = C.green,
  line = C.ink,
  fill = C.white,
}) => {
  const p = easeOut(ramp(now, at, at + 0.2));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{ overflow: "visible" }}
    >
      <rect
        x={3}
        y={3}
        width={58}
        height={58}
        rx={10}
        fill={fill}
        stroke={line}
        strokeWidth={6}
      />
      {p > 0 ? (
        <path
          d="M 14 34 L 27 47 L 52 14"
          fill="none"
          stroke={color}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
        />
      ) : null}
    </svg>
  );
};

/** Photo print with a white border, a caption and the camera's date stamp. */
export const Polaroid: React.FC<{
  readonly w: number;
  readonly children?: React.ReactNode;
  readonly caption?: string;
  readonly date?: string;
  readonly photo?: string;
  readonly blur?: number;
}> = ({ w, children, caption, date, photo = "#7fa7d8", blur = 0 }) => {
  const pad = w * 0.07;
  const inner = w - pad * 2;
  return (
    <div
      style={{
        width: w,
        padding: pad,
        paddingBottom: pad * 3.4,
        background: C.white,
        border: `${OUTLINE}px solid ${C.ink}`,
        boxShadow: `${SHADOW}px ${SHADOW}px 0 rgba(0,0,0,0.22)`,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: inner - OUTLINE * 2,
          height: inner - OUTLINE * 2,
          background: photo,
          position: "relative",
          overflow: "hidden",
          border: `4px solid ${C.ink}`,
          filter: blur ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
        {date ? (
          <div
            style={{
              position: "absolute",
              left: inner * 0.06,
              bottom: inner * 0.04,
              color: "#ff8a2a",
              fontFamily: FONT.sans,
              fontWeight: 600,
              fontSize: inner * 0.075,
              letterSpacing: "0.08em",
              textShadow: "0 0 6px #ff6a00",
              direction: "ltr",
            }}
          >
            {date}
          </div>
        ) : null}
      </div>
      {caption ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: pad * 0.75,
            textAlign: "center",
            fontFamily: FONT.serif,
            fontWeight: 700,
            fontSize: w * 0.085,
            color: C.ink,
            direction: "rtl",
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};

/** Plain label in the running face. */
export const Label: React.FC<{
  readonly children: React.ReactNode;
  readonly size?: number;
  readonly color?: string;
  readonly weight?: number;
  readonly font?: string;
  readonly style?: React.CSSProperties;
}> = ({
  children,
  size = 40,
  color = C.ink,
  weight = 700,
  font = FONT.sans,
  style,
}) => (
  <div
    style={{
      fontFamily: font,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.15,
      color,
      direction: "rtl",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const mixHex = (a: string, b: string, t: number): string => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const x = (pa >> shift) & 255;
    const y = (pb >> shift) & 255;
    return Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
