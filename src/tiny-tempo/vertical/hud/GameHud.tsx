import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { clamp01, lastHitAge, settle, useClock } from "../../clock";
import { DISPLAY, faces, TT } from "../../theme";

/** What one bead is showing, mirroring the game's own `Mark` in `game/beatTrack.ts`. */
export type Mark = "pending" | "lit" | "perfect" | "good" | "miss";

const MARK_FILL: Record<Mark, string> = {
  pending: "#00000000",
  lit: TT.cream,
  perfect: TT.brass,
  good: "#7fa286",
  miss: "#b9b1a3",
};

type BeatTrackProps = {
  readonly hits: readonly number[];
  /** How each beat has been judged. Shorter than `hits` while the round is running. */
  readonly marks: readonly Mark[];
  readonly y: number;
  readonly plate?: boolean;
};

/**
 * The row of beads under the action.
 *
 * The game added this because a tap that landed perfectly looked exactly like one
 * that missed by 120 ms: the track is the only thing on screen that records the
 * verdict, so it earns its place in the ad for the same reason.
 */
export const BeatTrack: React.FC<BeatTrackProps> = ({
  hits,
  marks,
  y,
  plate = true,
}) => {
  const { time } = useClock();
  const gap = Math.min(128, 760 / Math.max(1, hits.length - 1));
  const radius = Math.min(30, gap * 0.31);
  const shake = settle(lastHitAge(time, hits), 62, 16) * 4;
  const width = gap * (hits.length - 1) + radius * 2 + 96;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        transform: `translate(-50%, -50%) translateX(${shake}px)`,
      }}
    >
      {plate ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width,
            height: 108,
            borderRadius: 42,
            background: TT.puck,
            border: `7px solid ${TT.inkDeep}`,
            boxShadow: `0 10px 0 ${TT.inkDeep}`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: gap - radius * 2,
          height: 108,
          padding: "0 48px",
        }}
      >
        {hits.map((hit, i) => {
          const mark = marks[i] ?? "pending";
          const age = time - hit;
          const pulse =
            age >= 0 && age < 0.2
              ? 1 + Math.sin((age / 0.2) * Math.PI) * 0.42
              : 1;
          return (
            <div
              key={i}
              style={{
                width: radius * 2,
                height: radius * 2,
                borderRadius: "50%",
                boxSizing: "border-box",
                background: MARK_FILL[mark],
                border: `6px solid ${TT.inkDeep}`,
                transform: `scale(${mark === "pending" ? 1 : pulse})`,
                boxShadow:
                  mark === "perfect" ? `0 0 26px ${TT.brassLit}` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

type PhaseCueProps = {
  /** `watch` is the demonstration; `play` is the response. */
  readonly phase: "watch" | "play";
  readonly y: number;
  readonly delay?: number;
};

/**
 * The phase cue. Watch is a timber plaque and Your turn is the coral block, so the
 * two phases are different objects rather than the same object in another colour —
 * the distinction a player reads at arm's length.
 */
export const PhaseCue: React.FC<PhaseCueProps> = ({ phase, y, delay = 0 }) => {
  const { frame, fps, time } = useClock();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 170 },
  });
  const playing = phase === "play";
  const surface = faces(playing ? TT.coral : TT.wood);
  const beat = (time * 2) % 1;
  const breathe = playing ? 1 + Math.max(0, 0.06 - beat * 0.12) : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        transform: `translate(-50%, -50%) scale(${interpolate(enter, [0, 1], [0.72, 1]) * breathe})`,
        opacity: interpolate(enter, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        }),
        padding: "22px 66px",
        borderRadius: 40,
        background: surface.face,
        borderTop: `10px solid ${surface.lit}`,
        border: `8px solid ${TT.inkDeep}`,
        boxShadow: `0 14px 0 ${TT.inkDeep}`,
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 76,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        color: TT.cream,
        WebkitTextStroke: `6px ${TT.inkDeep}`,
        paintOrder: "stroke fill",
        whiteSpace: "nowrap",
      }}
    >
      {playing ? "Your turn" : "Watch"}
    </div>
  );
};

type TapRippleProps = {
  readonly hits: readonly number[];
  readonly x: number;
  readonly y: number;
};

/**
 * The touch acknowledgement. The game answers every touch before anything moves,
 * so the ad shows the ring the thumb actually gets rather than implying the tap.
 */
export const TapRipple: React.FC<TapRippleProps> = ({ hits, x, y }) => {
  const { time } = useClock();
  const age = lastHitAge(time, hits);
  if (!Number.isFinite(age) || age > 0.42) return null;
  const p = clamp01(age / 0.42);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" aria-hidden>
        <circle
          cx={x}
          cy={y}
          r={52 + p * 130}
          fill="none"
          stroke={TT.cream}
          strokeWidth={10 * (1 - p)}
          opacity={0.85 * (1 - p)}
        />
        <circle
          cx={x}
          cy={y}
          r={44 * (1 - p)}
          fill={TT.cream}
          opacity={0.3 * (1 - p)}
        />
      </svg>
    </AbsoluteFill>
  );
};

type VerdictProps = {
  readonly hits: readonly number[];
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly label?: string;
};

/**
 * The verdict stamp, at the size a rhythm player expects it.
 *
 * The judgement is the feedback the whole genre turns on, so it gets the frame
 * rather than a corner — a small one in the margin reads as debris on the art.
 */
export const Verdict: React.FC<VerdictProps> = ({
  hits,
  x,
  y,
  size = 108,
  label = "PERFECT",
}) => {
  const { time } = useClock();
  const age = lastHitAge(time, hits);
  if (!Number.isFinite(age) || age > 0.46) return null;

  const pop = 1 + Math.sin(Math.min(1, age / 0.11) * Math.PI) * 0.3;
  const fade =
    age < 0.06 ? age / 0.06 : age > 0.32 ? 1 - (age - 0.32) / 0.14 : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${-age * 96}px) scale(${pop}) rotate(-4deg)`,
        opacity: Math.max(0, fade),
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.01em",
        lineHeight: 1,
        color: TT.brassLit,
        WebkitTextStroke: `${Math.max(6, size * 0.1)}px ${TT.inkDeep}`,
        paintOrder: "stroke fill",
        textShadow: `0 ${Math.round(size * 0.09)}px 0 ${TT.inkDeep}`,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
};
