import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { clamp01, lastHitAge, settle, squash, useClock } from "../clock";
import { PaperCurtain } from "../components/chrome";
import { BEAT, DISPLAY, faces, shade, TT } from "../theme";
import { useMusic } from "./AbsoluteFrame";
import { TEASER_FORMAT } from "./format";

/**
 * The ad's paper curtain, turned on its side. The landscape curtain crosses
 * left to right with a vertical shear; rotated a quarter turn it crosses top
 * to bottom with a horizontal one, which is the direction a thumb scrolls.
 */
export const CurtainV: React.FC<{ readonly progress: number }> = ({
  progress,
}) => {
  const { width, height } = TEASER_FORMAT;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: height,
          height: width,
          left: (width - height) / 2,
          top: (height - width) / 2,
          transform: "rotate(90deg)",
        }}
      >
        <PaperCurtain progress={progress} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * A curtain pass centred on composition frame `at`: covers over the first
 * 0.32 s, clears over the next. Mounted once at the root so it rides above
 * both the outgoing and the incoming scene.
 */
export const CurtainPass: React.FC<{ readonly at: number }> = ({ at }) => {
  const { frame, fps } = useClock();
  const local = (frame - at) / fps;
  if (local < -0.02 || local > 0.7) return null;
  const progress = local < 0.32 ? local / 0.32 : 1 + (local - 0.32) / 0.32;
  return <CurtainV progress={progress} />;
};

type PulseBeadsProps = {
  readonly size?: number;
  readonly y?: number;
};

/**
 * Four beads for the four beats of the bar, the current one lit coral and
 * swelling with the kick. Runs on the composition clock so it stays locked to
 * the music whichever scene is under it.
 */
export const PulseBeads: React.FC<PulseBeadsProps> = ({
  size = 34,
  y = 1700,
}) => {
  const { time, low } = useMusic();
  const beat = time / BEAT;
  const phase = beat % 1;
  const current = Math.floor(beat) % 4;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
        gap: size * 0.8,
        pointerEvents: "none",
      }}
    >
      {[0, 1, 2, 3].map((i) => {
        const active = i === current;
        const pulse = active ? 1 + (1 - phase) * 0.25 + low * 0.15 : 1;
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: active ? TT.coral : shade(TT.cream, -0.08),
              border: `4px solid ${TT.inkDeep}`,
              boxShadow: active
                ? `0 4px 0 ${TT.inkDeep}, 0 0 ${18 + low * 20}px ${TT.coral}99`
                : `0 4px 0 ${TT.inkDeep}`,
              transform: `scale(${pulse})`,
            }}
          />
        );
      })}
    </div>
  );
};

type TapTargetProps = {
  readonly hits: readonly number[];
  readonly x: number;
  readonly y: number;
  readonly radius?: number;
  readonly delay?: number;
};

/**
 * The thumb's target: a coral puck that gets pressed on each hit and throws a
 * ring. Where the ad showed a Play button, the teaser shows the one input the
 * game has.
 */
export const TapTarget: React.FC<TapTargetProps> = ({
  hits,
  x,
  y,
  radius = 92,
  delay = 0,
}) => {
  const { frame, fps, time } = useClock();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 150 },
  });
  const age = lastHitAge(time, hits);
  const press = squash(age, 0.16, 1);
  const ring = Number.isFinite(age) && age < 0.42 ? age / 0.42 : null;
  const coral = faces(TT.coral);
  const wobble = settle(age, 40, 9) * 3;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity: interpolate(enter, [0, 0.2], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `scale(${interpolate(enter, [0, 1], [0.6, 1])})`,
      }}
    >
      <svg
        width={radius * 5}
        height={radius * 5}
        viewBox={`${-radius * 2.5} ${-radius * 2.5} ${radius * 5} ${radius * 5}`}
        style={{
          position: "absolute",
          left: -radius * 2.5,
          top: -radius * 2.5,
          overflow: "visible",
        }}
        aria-hidden
      >
        {ring !== null ? (
          <circle
            r={radius * (1.1 + ring * 1.2)}
            fill="none"
            stroke={TT.coral}
            strokeWidth={10 * (1 - ring)}
            opacity={1 - ring}
          />
        ) : null}
        <ellipse
          cy={radius * 0.18}
          rx={radius * 1.04}
          ry={radius * 0.95}
          fill={TT.inkDeep}
          opacity={0.18}
        />
        <g
          transform={`translate(${wobble} ${press * radius * 0.12}) scale(${1 + press * 0.08}, ${1 - press * 0.12})`}
        >
          <circle r={radius} fill={coral.edge} />
          <circle cy={-radius * 0.08} r={radius} fill={coral.shade} />
          <circle cy={-radius * 0.16} r={radius} fill={coral.face} />
          <ellipse
            cx={-radius * 0.2}
            cy={-radius * 0.5}
            rx={radius * 0.4}
            ry={radius * 0.2}
            fill={coral.lit}
            opacity={0.9}
          />
        </g>
      </svg>
    </div>
  );
};

type PopProps = {
  readonly hits: readonly number[];
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly label?: string;
  readonly rotate?: number;
};

/**
 * PERFECT, as the game stamps it. Each hit restarts the burst; the stamp
 * drifts up and fades so a run of hits reads as a drumroll of stamps.
 */
export const Pop: React.FC<PopProps> = ({
  hits,
  x,
  y,
  size = 72,
  label = "PERFECT",
  rotate = -6,
}) => {
  const { time } = useClock();
  const age = lastHitAge(time, hits);
  if (!Number.isFinite(age) || age > 0.5) return null;
  const pop = 1 + Math.sin(clamp01(age / 0.1) * Math.PI) * 0.28;
  const opacity = interpolate(age, [0, 0.06, 0.34, 0.5], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(age, [0, 0.5], [12, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${lift}px) rotate(${rotate}deg) scale(${pop})`,
        opacity,
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.03em",
        color: TT.brassLit,
        WebkitTextStroke: `${Math.max(4, size * 0.085)}px ${TT.inkDeep}`,
        paintOrder: "stroke fill",
        textShadow: `0 ${Math.max(4, size * 0.09)}px 0 ${TT.inkDeep}`,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
};

/**
 * Soft edge darkening that deepens on the kick, so the whole frame breathes
 * with the drum even when the scene under it is holding still.
 */
export const Vignette: React.FC = () => {
  const { low } = useMusic();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 48%, transparent 55%, rgba(26,46,40,${0.12 + low * 0.12}) 100%)`,
      }}
    />
  );
};
