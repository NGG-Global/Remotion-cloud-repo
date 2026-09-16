import React from "react";
import { interpolate, spring } from "remotion";
import { clamp01, lastHitAge, settle, squash, useClock } from "../clock";
import { DISPLAY, faces, TT } from "../theme";

type JudgementPopProps = {
  readonly hits: readonly number[];
  readonly label?: string;
  readonly x?: number;
  readonly y?: number;
};

/** PERFECT stamp that bursts on each hit, the way a rhythm player reads a window. */
export const JudgementPop: React.FC<JudgementPopProps> = ({
  hits,
  label = "PERFECT",
  x = 0,
  y = 0,
}) => {
  const { time } = useClock();
  const age = lastHitAge(time, hits);
  if (!Number.isFinite(age) || age > 0.55) return null;
  const pop = 1 + Math.sin(clamp01(age / 0.12) * Math.PI) * 0.22;
  const opacity = interpolate(age, [0, 0.08, 0.4, 0.55], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(age, [0, 0.55], [10, -28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${lift}px) scale(${pop})`,
        opacity,
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 54,
        letterSpacing: "0.04em",
        color: TT.brassLit,
        WebkitTextStroke: `5px ${TT.inkDeep}`,
        paintOrder: "stroke fill",
        textShadow: `0 5px 0 ${TT.inkDeep}`,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

type ImpactFlashProps = {
  readonly cx: number;
  readonly cy: number;
  readonly age: number;
  readonly color?: string;
  readonly scale?: number;
};

export const ImpactFlash: React.FC<ImpactFlashProps> = ({
  cx,
  cy,
  age,
  color = TT.cream,
  scale = 1,
}) => {
  if (!Number.isFinite(age) || age < 0 || age > 0.22) return null;
  const p = age / 0.22;
  const alpha = 1 - p;
  const ring = 40 + p * 70;

  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${scale})`}
      opacity={alpha}
      pointerEvents="none"
    >
      {age < 0.08 ? (
        <>
          <line
            x1={-48}
            y1={-10}
            x2={-72}
            y2={-28}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <line
            x1={48}
            y1={-10}
            x2={72}
            y2={-28}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <line
            x1={-20}
            y1={-36}
            x2={-28}
            y2={-58}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={20}
            y1={-36}
            x2={28}
            y2={-58}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </>
      ) : null}
      <ellipse
        cx={0}
        cy={6}
        rx={ring}
        ry={14 + p * 16}
        fill="none"
        stroke={color}
        strokeWidth={3}
      />
    </g>
  );
};

type ChipBurstProps = {
  readonly cx: number;
  readonly cy: number;
  readonly age: number;
  readonly colors?: readonly string[];
};

export const ChipBurst: React.FC<ChipBurstProps> = ({
  cx,
  cy,
  age,
  colors = [TT.cream, TT.sun, TT.wood],
}) => {
  if (!Number.isFinite(age) || age < 0 || age > 0.42) return null;
  const chips = [
    { a: -2.4, s: 1.1, r: 9, rot: 40 },
    { a: -0.9, s: 1.35, r: 7, rot: -25 },
    { a: -1.7, s: 0.95, r: 6, rot: 70 },
    { a: -0.4, s: 1.2, r: 8, rot: -55 },
    { a: -2.9, s: 0.8, r: 5, rot: 15 },
    { a: -1.2, s: 1.5, r: 6, rot: 110 },
  ];
  const p = age / 0.42;
  const opacity = interpolate(p, [0, 0.15, 1], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g
      transform={`translate(${cx} ${cy})`}
      opacity={opacity}
      pointerEvents="none"
    >
      {chips.map((chip, i) => {
        const dist = (40 + i * 14) * (0.25 + p * 1.1);
        const x = Math.cos(chip.a) * dist * chip.s;
        const y = Math.sin(chip.a) * dist * 0.55 - (1 - (2 * p - 1) ** 2) * 36;
        return (
          <rect
            key={i}
            x={-chip.r}
            y={-chip.r * 0.4}
            width={chip.r * 2}
            height={chip.r * 0.8}
            rx={2}
            fill={colors[i % colors.length]}
            transform={`translate(${x} ${y}) rotate(${chip.rot + p * 80})`}
          />
        );
      })}
    </g>
  );
};

type StarMedalProps = {
  readonly x: number;
  readonly y: number;
  readonly radius?: number;
  readonly delay?: number;
};

/** Result-screen star: brass medal that drops, stamps, and throws a bloom. */
export const StarMedal: React.FC<StarMedalProps> = ({
  x,
  y,
  radius = 70,
  delay = 0,
}) => {
  const { frame, fps, time } = useClock();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, mass: 0.7, stiffness: 140 },
  });
  const age = Math.max(0, time - delay / fps);
  const drop = interpolate(progress, [0, 1], [-radius * 1.8, 0]);
  const spin = interpolate(progress, [0, 1], [-18, 0]);
  const glow = squash(age, 0.55, 1);
  const shake = settle(age - 0.12, 28, 10) * 4;
  const f = faces(TT.brass);
  const points = starPath(0, 0, radius);

  return (
    <g
      transform={`translate(${x + shake} ${y + drop}) rotate(${spin})`}
      opacity={interpolate(progress, [0, 0.15], [0, 1], {
        extrapolateRight: "clamp",
      })}
    >
      {glow > 0.04 ? (
        <>
          <circle
            r={radius * (1.22 + glow * 0.28)}
            fill="#ffe7a0"
            opacity={glow * 0.28}
          />
          <circle r={radius * 0.7} fill={TT.sun} opacity={glow * 0.22} />
        </>
      ) : null}
      <polygon
        points={starPath(radius * 0.05, radius * 0.14, radius).join(" ")}
        fill={TT.inkDeep}
        opacity={0.22}
      />
      <polygon
        points={points.join(" ")}
        fill={f.shade}
        transform={`translate(0 ${radius * 0.07})`}
      />
      <polygon
        points={points.join(" ")}
        fill={TT.brass}
        stroke={f.edge}
        strokeWidth={radius * 0.2}
        strokeLinejoin="round"
      />
      <ellipse
        cx={-radius * 0.16}
        cy={-radius * 0.26}
        rx={radius * 0.26}
        ry={radius * 0.16}
        fill="#fff"
        opacity={0.35 + glow * 0.25}
      />
    </g>
  );
};

const starPath = (cx: number, cy: number, radius: number): string[] => {
  const inner = radius * 0.45;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return pts;
};

type PhasePillProps = {
  readonly label: string;
  readonly accent?: boolean;
};

export const PhasePill: React.FC<PhasePillProps> = ({
  label,
  accent = false,
}) => {
  const { frame, fps } = useClock();
  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160 },
  });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 28px",
        borderRadius: 999,
        background: accent ? TT.coral : TT.cream,
        color: accent ? TT.cream : TT.ink,
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 32,
        letterSpacing: "-0.02em",
        border: `5px solid ${TT.inkDeep}`,
        boxShadow: `0 6px 0 ${TT.inkDeep}`,
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.8, 1])})`,
      }}
    >
      {label}
    </div>
  );
};
