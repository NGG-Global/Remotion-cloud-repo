import React from "react";
import { AbsoluteFill } from "remotion";
import { useShot } from "./shot";
import { clamp, EASE, lerp, ramp } from "./time";

/**
 * Transitions made of things, not effects.
 *
 * Each wipe is an object passing close to the lens. It covers the whole
 * frame at its midpoint, which is exactly the cut, so the outgoing and
 * incoming shots never have to render together. Placed on the master
 * timeline centred on a cut (see data/timeline.ts).
 */

export type WipeKind =
  | "van"
  | "passerby"
  | "trunk"
  | "folder"
  | "flash"
  | "floor"
  | "door"
  | "beam"
  | "dark";

const Blurred: React.FC<{ readonly blur: number; readonly children: React.ReactNode }> = ({ blur, children }) => (
  <AbsoluteFill style={{ filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined }}>{children}</AbsoluteFill>
);

export const Wipe: React.FC<{
  readonly kind: WipeKind;
  /** 1 = moves left→right, -1 = right→left. */
  readonly dir?: 1 | -1;
  readonly tone?: string;
}> = ({ kind, dir = 1, tone }) => {
  const { t, dur } = useShot();
  const p = clamp(t / dur);
  if (kind === "flash") {
    const k = p < 0.5 ? ramp(p, 0.25, 0.5, EASE.in) : 1 - ramp(p, 0.5, 1, EASE.out);
    return <AbsoluteFill style={{ backgroundColor: tone ?? "#fffaf0", opacity: k }} />;
  }
  if (kind === "dark") {
    const k = p < 0.5 ? ramp(p, 0, 0.5, EASE.in) : 1 - ramp(p, 0.5, 1, EASE.out);
    return <AbsoluteFill style={{ backgroundColor: tone ?? "#000", opacity: k }} />;
  }
  if (kind === "beam") {
    const k = p < 0.5 ? ramp(p, 0.1, 0.5, EASE.in) : 1 - ramp(p, 0.5, 1, EASE.out);
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${lerp(30, 70, p)}% 50%, rgba(255,246,220,${k}) ${k * 60}%, rgba(255,236,190,${k * 0.8}) ${20 + k * 70}%, rgba(255,230,180,0) 100%)`,
        }}
      />
    );
  }
  if (kind === "floor") {
    // Floorboards rise past the lens: the camera is going under the house.
    const y = lerp(1180, -2300, EASE.inOut(p));
    return (
      <Blurred blur={6}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(0 ${y})`}>
            <rect x={-40} y={0} width={2000} height={2200} fill="#2a1f17" />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-40} y={i * 180} width={2000} height={10} fill="#1a130e" />
            ))}
            <rect x={-40} y={0} width={2000} height={60} fill="#7a5a3e" />
            <rect x={-40} y={2140} width={2000} height={60} fill="#120e0a" />
          </g>
        </svg>
      </Blurred>
    );
  }
  if (kind === "door") {
    // A door swings shut toward the lens; black holds at the cut.
    const k = p < 0.5 ? ramp(p, 0, 0.5, EASE.in) : 1;
    const out = p < 0.5 ? 0 : ramp(p, 0.5, 1, EASE.out);
    const w = 1920 * k;
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={dir === 1 ? 0 : 1920 - w} y={0} width={w} height={1080} fill={tone ?? "#1e1812"} />
          <rect x={dir === 1 ? w - 30 : 1920 - w} y={0} width={30} height={1080} fill="#000" opacity={0.4} />
        </svg>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: Math.max(k > 0.98 ? 1 : 0, 0) * (1 - out) }} />
      </AbsoluteFill>
    );
  }
  // Lateral wipes: an object 2600 px wide crosses; centred at p = 0.5.
  const W = 2700;
  const x = dir === 1 ? lerp(-W, 1920, EASE.inOut(p)) : lerp(1920, -W, EASE.inOut(p));
  const fill = tone ?? (kind === "folder" ? "#c8ae7a" : kind === "van" ? "#3a3a36" : "#0c0b0a");
  return (
    <Blurred blur={kind === "folder" ? 4 : 10}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${x} 0)`}>
          {kind === "van" ? (
            <g>
              <rect x={0} y={-60} width={W} height={1200} rx={120} fill={fill} />
              <rect x={W * 0.12} y={120} width={W * 0.3} height={300} rx={30} fill="#1a2028" />
              <rect x={W * 0.5} y={560} width={W * 0.4} height={60} fill="#5a5a52" />
              <circle cx={W * 0.25} cy={1120} r={220} fill="#0a0a0a" />
              <circle cx={W * 0.8} cy={1120} r={220} fill="#0a0a0a" />
            </g>
          ) : kind === "passerby" ? (
            <g>
              <path d={`M200 1200 L200 420 Q200 160 ${W / 2} 120 Q${W - 200} 160 ${W - 200} 420 L${W - 200} 1200 Z`} fill={fill} />
              <ellipse cx={W / 2} cy={-40} rx={420} ry={380} fill={fill} />
            </g>
          ) : kind === "trunk" ? (
            <g>
              <path d={`M300 -40 Q${W / 2} 60 ${W - 300} -40 L${W - 200} 1120 L200 1120 Z`} fill={fill} />
              {Array.from({ length: 9 }, (_, i) => (
                <path key={i} d={`M${400 + i * 220} -40 Q${420 + i * 220} 540 ${380 + i * 220} 1120`} stroke="#000" strokeWidth={18} opacity={0.3} fill="none" />
              ))}
            </g>
          ) : (
            <g>
              <path d={`M0 -40 L${W - 160} -40 L${W} 120 L${W} 1120 L0 1120 Z`} fill={fill} />
              <path d={`M${W - 160} -40 L${W - 160} 120 L${W} 120`} fill="#a08a5e" />
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x={200} y={180 + i * 80} width={W - 700 - (i % 3) * 200} height={16} fill="#9a8458" opacity={0.5} />
              ))}
            </g>
          )}
        </g>
      </svg>
    </Blurred>
  );
};
