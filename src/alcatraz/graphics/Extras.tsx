import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useNarr } from "../components/Shot";
import { useProjection } from "../components/Still";
import { Scene } from "../../doc/components/Scene";
import { Rise } from "../../doc/components/Type";
import { AZ, easeOut, hash, mix, ramp, SANS, SERIF_LATIN } from "../theme";

/** Muzzle flashes: a few frames of hard light on the given narration seconds. */
export const Flashes: React.FC<{ readonly at: readonly number[] }> = ({ at }) => {
  const n = useNarr();
  let o = 0;
  for (const a of at) {
    const d = n - a;
    if (d >= 0 && d < 0.2) o = Math.max(o, d < 0.04 ? 0.85 : 0.85 * (1 - (d - 0.04) / 0.16));
  }
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(70% 70% at 50% 45%, rgba(255,246,220,1) 0%, rgba(255,230,180,0.5) 50%, rgba(0,0,0,0) 100%)",
        opacity: o,
        mixBlendMode: "screen",
      }}
    />
  );
};

/** A box drawn round a region of a still, pinned to the picture as it moves. */
export const Highlight: React.FC<{
  readonly box: readonly [number, number, number, number];
  readonly at: number;
  readonly label?: string;
}> = ({ box, at, label }) => {
  const p = useProjection();
  const n = useNarr();
  const o = easeOut(ramp(n, at, at + 0.5));
  const [x0, y0, x1, y1] = box;
  const X = p.x(x0);
  const Y = p.y(y0);
  const W = p.x(x1) - X;
  const H = p.y(y1) - Y;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: X - 10,
          top: Y - 10,
          width: W + 20,
          height: H + 20,
          border: `4px solid ${AZ.red}`,
          boxShadow: "0 0 0 4000px rgba(0,0,0,0.45)",
          opacity: o,
          transform: `scale(${mix(1.15, 1, o)})`,
        }}
      />
      {label ? (
        <div
          style={{
            position: "absolute",
            left: X + W / 2,
            top: Y + H + 28,
            transform: "translateX(-50%)",
            fontFamily: SANS,
            fontSize: 44,
            fontWeight: 500,
            color: AZ.text,
            direction: "rtl",
            whiteSpace: "nowrap",
            opacity: o,
            textShadow: "0 2px 16px rgba(0,0,0,0.95)",
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Ghost stories, drawn as what they are: an empty corridor of cells, a lamp
 * that will not hold steady, and fog moving where nobody is walking.
 */
export const GhostCorridor: React.FC = () => {
  const frame = useCurrentFrame();
  const n = useNarr();
  const flicker = 0.55 + 0.45 * Math.max(0, Math.sin(frame * 0.9) * hash(Math.floor(frame / 3)));
  const drift = frame * 0.6;
  const voices = easeOut(ramp(n, 819.6, 820.4));
  return (
    <AbsoluteFill style={{ background: "#020304" }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="lamp" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="rgba(220,226,232,0.5)" />
            <stop offset="100%" stopColor="rgba(220,226,232,0)" />
          </radialGradient>
        </defs>
        {/* corridor in one-point perspective */}
        <polygon points="0,0 1920,0 1140,420 780,420" fill="#090b0d" />
        <polygon points="0,1080 1920,1080 1140,660 780,660" fill="#0d0f11" />
        <polygon points="0,0 780,420 780,660 0,1080" fill="#07090b" />
        <polygon points="1920,0 1140,420 1140,660 1920,1080" fill="#07090b" />
        {/* cell bars receding on both sides */}
        {Array.from({ length: 14 }).map((_, i) => {
          const t = i / 14;
          const xl = mix(40, 770, Math.pow(t, 0.7));
          const xr = 1920 - xl;
          const top = mix(30, 425, Math.pow(t, 0.7));
          const bot = 1080 - top;
          return (
            <g key={i} stroke="#1c2228" strokeWidth={mix(10, 1.5, t)}>
              <line x1={xl} y1={top} x2={xl} y2={bot} />
              <line x1={xr} y1={top} x2={xr} y2={bot} />
            </g>
          );
        })}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#lamp)" opacity={flicker * 0.8} />
        {/* fog bands moving through */}
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            cx={((drift * (1 + i * 0.4) + i * 700) % 2600) - 340}
            cy={600 + i * 60}
            rx={520}
            ry={70}
            fill="rgba(200,210,220,0.07)"
          />
        ))}
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
        <div style={{ fontFamily: SANS, fontSize: 40, color: AZ.fog, direction: "rtl", opacity: voices * 0.9, letterSpacing: 1 }}>
          קולות · צעדים · תחושות שאין להן הסבר
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * The programme's mark, in the series' manner (src/doc/scenes/Sting): the
 * name rising out of fog over a red hairline, then the episode. The grand
 * version, after the cold open, adds the place and the years.
 */
export const SeriesTitle: React.FC<{
  readonly episode: string;
  readonly line?: string;
  readonly grand?: boolean;
}> = ({ episode, line, grand = false }) => {
  const frame = useCurrentFrame();
  const rule = easeOut(ramp(frame, grand ? 30 : 12, grand ? 70 : 40));
  return (
    <Scene fog={grand ? 0.7 : 0.5} fogBand="full" flicker={0.2} vignette={0.9}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          transform: `translateY(${-frame * 0.05}px)`,
        }}
      >
        <Rise
          text="מאחורי הסיוט"
          delay={grand ? 14 : 4}
          duration={grand ? 40 : 22}
          fontSize={grand ? 128 : 104}
          weight={500}
          color={AZ.text}
          style={{ textShadow: "0 0 40px rgba(0,0,0,0.8)" }}
        />
        <div
          style={{
            marginTop: 26,
            width: 520 * rule,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${AZ.red} 30%, ${AZ.red} 70%, transparent)`,
          }}
        />
        <Rise
          text={episode}
          delay={grand ? 52 : 26}
          duration={grand ? 34 : 22}
          fontSize={grand ? 64 : 48}
          weight={400}
          color={AZ.paper}
          style={{ marginTop: 26, letterSpacing: 2 }}
        />
        {line ? (
          <div
            style={{
              marginTop: 34,
              fontFamily: SERIF_LATIN,
              fontSize: 26,
              letterSpacing: 8,
              color: AZ.textMuted,
              opacity: 0.75 * easeOut(ramp(frame, 80, 110)),
            }}
          >
            {line}
          </div>
        ) : null}
      </AbsoluteFill>
    </Scene>
  );
};
