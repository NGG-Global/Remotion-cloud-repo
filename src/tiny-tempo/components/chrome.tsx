import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { squash, useClock } from "../clock";
import { BEAT, BODY, DISPLAY, faces, shade, TT } from "../theme";

type HangingSignProps = {
  readonly title?: string;
  readonly width?: number;
  readonly delay?: number;
};

/** The menu's hanging timber sign: ropes, brass eyes, cream paint, tempo beads. */
export const HangingSign: React.FC<HangingSignProps> = ({
  title = "Tiny\nTempo",
  width = 640,
  delay = 0,
}) => {
  const { frame, fps, time } = useClock();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 90 },
  });
  const swing = Math.sin(time * 1.35) * 2.4 * enter;
  const height = width * 0.58;
  const wood = faces(TT.wood);
  const cream = faces(TT.cream);
  const beadR = 14;
  const beadGap = 46;
  const beads = 4;
  const beatPhase = (time / BEAT) % 1;

  return (
    <div
      style={{
        position: "relative",
        width,
        height: height + 90,
        transform: `translateY(${interpolate(enter, [0, 1], [-80, 0])}px) rotate(${swing}deg)`,
        transformOrigin: "50% 0%",
        opacity: interpolate(enter, [0, 0.2], [0, 1], {
          extrapolateRight: "clamp",
        }),
      }}
    >
      <svg
        width={width}
        height={height + 90}
        viewBox={`0 0 ${width} ${height + 90}`}
        aria-hidden
      >
        <line
          x1={width * 0.22}
          y1={0}
          x2={width * 0.22}
          y2={78}
          stroke={shade(TT.rope, -0.45)}
          strokeWidth={16}
          strokeLinecap="round"
        />
        <line
          x1={width * 0.22}
          y1={0}
          x2={width * 0.22}
          y2={78}
          stroke={TT.rope}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <line
          x1={width * 0.78}
          y1={0}
          x2={width * 0.78}
          y2={78}
          stroke={shade(TT.rope, -0.45)}
          strokeWidth={16}
          strokeLinecap="round"
        />
        <line
          x1={width * 0.78}
          y1={0}
          x2={width * 0.78}
          y2={78}
          stroke={TT.rope}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <circle
          cx={width * 0.22}
          cy={82}
          r={11}
          fill={TT.brass}
          stroke={shade(TT.brass, -0.4)}
          strokeWidth={3}
        />
        <circle
          cx={width * 0.78}
          cy={82}
          r={11}
          fill={TT.brass}
          stroke={shade(TT.brass, -0.4)}
          strokeWidth={3}
        />
        <circle cx={width * 0.22} cy={82} r={4} fill={wood.edge} />
        <circle cx={width * 0.78} cy={82} r={4} fill={wood.edge} />

        <rect
          x={8}
          y={92}
          width={width - 16}
          height={height - 8}
          rx={28}
          fill={wood.edge}
        />
        <rect
          x={18}
          y={84}
          width={width - 36}
          height={height - 16}
          rx={24}
          fill={wood.shade}
        />
        <rect
          x={18}
          y={84}
          width={width - 36}
          height={height - 36}
          rx={24}
          fill={wood.face}
        />
        <rect
          x={18}
          y={84}
          width={width - 36}
          height={18}
          rx={10}
          fill={wood.lit}
        />

        <rect
          x={42}
          y={108}
          width={width - 84}
          height={height - 64}
          rx={18}
          fill={cream.shade}
        />
        <rect
          x={42}
          y={108}
          width={width - 84}
          height={height - 78}
          rx={18}
          fill={cream.face}
        />
        <rect
          x={54}
          y={118}
          width={width - 108}
          height={10}
          rx={5}
          fill={cream.lit}
          opacity={0.7}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 128,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: width * 0.168,
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
          textAlign: "center",
          color: TT.cream,
          WebkitTextStroke: `${Math.max(6, width * 0.012)}px ${TT.inkDeep}`,
          paintOrder: "stroke fill",
          textShadow: `0 ${width * 0.012}px 0 ${TT.inkDeep}`,
          whiteSpace: "pre-line",
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 28,
          display: "flex",
          justifyContent: "center",
          gap: beadGap - beadR * 2,
        }}
      >
        {Array.from({ length: beads }, (_, i) => {
          const active =
            (time / BEAT + 0.02) % beads >= i &&
            (time / BEAT + 0.02) % beads < i + 1;
          const pulse = active ? 1 + Math.sin(beatPhase * Math.PI) * 0.28 : 1;
          return (
            <div
              key={i}
              style={{
                width: beadR * 2 * pulse,
                height: beadR * 2 * pulse,
                borderRadius: "50%",
                background: active ? TT.coral : shade(TT.cream, -0.12),
                border: `4px solid ${TT.inkDeep}`,
                boxShadow: active
                  ? `0 4px 0 ${TT.inkDeep}, 0 0 18px ${TT.coral}88`
                  : `0 4px 0 ${TT.inkDeep}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

type PlayBlockProps = {
  readonly label?: string;
  readonly width?: number;
  readonly delay?: number;
};

export const PlayBlock: React.FC<PlayBlockProps> = ({
  label = "Play",
  width = 420,
  delay = 0,
}) => {
  const { frame, fps, time } = useClock();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 150 },
  });
  const press = squash((time % 2) - 1.55, 0.18, 0.08);
  const coral = faces(TT.coral);
  const height = 110;

  return (
    <div
      style={{
        position: "relative",
        width,
        height: height + 18,
        opacity: interpolate(enter, [0, 0.2], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px) scale(${1 + press * 0.4}, ${1 - press})`,
        transformOrigin: "center bottom",
      }}
    >
      <svg width={width} height={height + 18} aria-hidden>
        <rect
          x={6}
          y={18}
          width={width - 12}
          height={height}
          rx={22}
          fill={coral.edge}
        />
        <rect
          x={6}
          y={6}
          width={width - 12}
          height={height}
          rx={22}
          fill={coral.shade}
        />
        <rect
          x={6}
          y={6}
          width={width - 12}
          height={height - 16}
          rx={22}
          fill={coral.face}
        />
        <rect
          x={22}
          y={14}
          width={width - 44}
          height={14}
          rx={7}
          fill={coral.lit}
          opacity={0.85}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: "6px 0 auto",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 44,
          color: TT.cream,
          WebkitTextStroke: `4px ${TT.inkDeep}`,
          paintOrder: "stroke fill",
          letterSpacing: "-0.02em",
        }}
      >
        <svg width="36" height="40" viewBox="0 0 36 40" aria-hidden>
          <path
            d="M4 4 L32 20 L4 36 Z"
            fill={TT.cream}
            stroke={TT.inkDeep}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </div>
    </div>
  );
};

type BeatBeadsProps = {
  readonly pattern: readonly boolean[];
  readonly time: number;
  readonly startBeat?: number;
  readonly size?: number;
};

/**
 * Tutorial beads: filled on a hit, hollow WAIT on a rest, the current one
 * glowing. Pattern is one bar of hits (`true`) and rests (`false`).
 */
export const BeatBeads: React.FC<BeatBeadsProps> = ({
  pattern,
  time,
  startBeat = 0,
  size = 54,
}) => {
  const beat = time / BEAT;
  return (
    <div style={{ display: "flex", gap: size * 0.42, alignItems: "center" }}>
      {pattern.map((hit, i) => {
        const index = startBeat + i;
        const passed = beat >= index;
        const current = beat >= index && beat < index + 1;
        const glow = current ? 1 + Math.sin((beat - index) * Math.PI) * 0.2 : 1;
        const fill = hit ? (passed ? TT.coral : TT.cream) : "transparent";
        const border = hit ? TT.ink : TT.muted;
        return (
          <div
            key={i}
            style={{
              width: size * glow,
              height: size * glow,
              borderRadius: "50%",
              background: fill,
              border: `${hit ? 6 : 5}px ${hit ? "solid" : "dashed"} ${border}`,
              boxShadow: current
                ? `0 0 0 6px ${TT.coral}33, 0 5px 0 ${TT.inkDeep}`
                : `0 5px 0 ${TT.inkDeep}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: size * 0.22,
              color: TT.muted,
              opacity: passed || current ? 1 : 0.55,
            }}
          >
            {hit ? null : passed ? "" : "WAIT"}
          </div>
        );
      })}
    </div>
  );
};

type PaperCurtainProps = {
  readonly progress: number;
};

/**
 * The game's scene curtain: a sheared paper card with an ink edge and a coral
 * edge, sliding across the bench. `progress` 0 is off-left, 1 covers, 2 is
 * off-right.
 */
export const PaperCurtain: React.FC<PaperCurtainProps> = ({ progress }) => {
  const p = progress;
  const w = 1920;
  const h = 1080;
  const shear = h * 0.12;
  const span = w + shear;
  const edge = p <= 1 ? (1 - p) * span - shear : -(p - 1) * span - shear;
  const right = p <= 1 ? w + shear : w - (p - 1) * span;
  const ink = 8;
  const coral = 16;

  const band = (offset: number) => {
    const x1 = edge - offset;
    const x2 = right;
    return `${x1},0 ${x2},0 ${x2 + shear},${h} ${x1 + shear},${h}`;
  };

  if (p <= 0 || p >= 2) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <polygon points={band(ink + coral)} fill={shade(TT.ink, -0.2)} />
        <polygon points={band(coral)} fill={TT.coral} />
        <polygon points={band(0)} fill={TT.paperLift} />
      </svg>
    </AbsoluteFill>
  );
};
