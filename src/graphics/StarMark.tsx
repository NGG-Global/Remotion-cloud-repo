import React from "react";
import type { StarPose } from "../motion/starReveal";
import { burstChips } from "../motion/starReveal";

/** TinyTempo workshop palette, as CSS hex. */
export const WORKSHOP = {
  paper: "#eee8d8",
  ink: "#243e35",
  coral: "#cf5134",
  puck: "#f6ead0",
  cream: "#fff4dc",
  sun: "#dfc37f",
  brass: "#e0b34a",
  brassLit: "#ffe7a0",
  brassShade: "#8a5f24",
  brassEdge: "#3d2910",
  empty: "#c9c0a8",
} as const;

const TINTS = [
  WORKSHOP.coral,
  WORKSHOP.sun,
  WORKSHOP.cream,
  WORKSHOP.brass,
] as const;

export const starPath = (
  cx: number,
  cy: number,
  radius: number,
  inner = 0.45,
): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? radius * inner : radius;
    const angle = -Math.PI / 2 + i * (Math.PI / 5);
    pts.push(`${cx + Math.cos(angle) * r} ${cy + Math.sin(angle) * r}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
};

const mixHex = (a: string, b: string, t: number): string => {
  const k = Math.max(0, Math.min(1, t));
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${h(ar + (br - ar) * k)}${h(ag + (bg - ag) * k)}${h(ab + (bb - ab) * k)}`;
};

type StarMarkProps = {
  readonly index: number;
  readonly radius: number;
  readonly pose: StarPose;
  readonly impactAge: number;
  readonly chorus?: number;
};

/**
 * Workshop enamel star: thick outline, upper-left key light, prize brass when
 * earned, recessed silhouette when empty. Motion comes entirely from `pose`.
 */
export const StarMark: React.FC<StarMarkProps> = ({
  index,
  radius,
  pose,
  impactAge,
  chorus = 0,
}) => {
  const size = radius * 5.4;
  const cx = size / 2;
  const cy = size / 2;
  const uid = `sm${index}`;
  const fill = mixHex(WORKSHOP.empty, WORKSHOP.brass, pose.fill);
  const lit = mixHex(fill, WORKSHOP.brassLit, 0.62 * pose.fill);
  const shade = mixHex(fill, WORKSHOP.brassShade, 0.42);
  const edge = mixHex(fill, WORKSHOP.brassEdge, 0.72);
  const glow = pose.glow + chorus * 0.7;
  const burst = burstChips(impactAge, index + 7, 22);
  const ring = impactAge >= 0 && impactAge < 0.38;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        display: "block",
        overflow: "visible",
        opacity: pose.alpha,
      }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor={WORKSHOP.brassLit} stopOpacity={0.95} />
          <stop offset="42%" stopColor={WORKSHOP.sun} stopOpacity={0.4} />
          <stop offset="100%" stopColor={WORKSHOP.sun} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${uid}-face`} x1="22%" y1="8%" x2="78%" y2="92%">
          <stop offset="0%" stopColor={lit} />
          <stop offset="46%" stopColor={fill} />
          <stop offset="100%" stopColor={shade} />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0%" y1="0%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="48%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={radius * 0.07} />
        </filter>
      </defs>

      <g
        transform={`translate(${cx} ${cy + pose.drop * radius}) rotate(${(pose.spin * 180) / Math.PI}) scale(${pose.scaleX} ${pose.scaleY}) translate(${-cx} ${-cy})`}
      >
        {glow > 0.04 ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius * (1.22 + glow * 0.28)}
            fill={`url(#${uid}-glow)`}
            opacity={Math.min(0.7, glow * 0.5)}
          />
        ) : null}

        <path
          d={starPath(
            cx + radius * 0.05,
            cy + radius * (0.12 + pose.lift * 0.2),
            radius,
          )}
          fill={edge}
          opacity={0.28}
          filter={`url(#${uid}-soft)`}
        />
        <path
          d={starPath(cx, cy + radius * (0.07 + pose.lift * 0.14), radius)}
          fill={shade}
        />
        <path d={starPath(cx, cy, radius)} fill={`url(#${uid}-face)`} />
        <path
          d={starPath(cx, cy, radius)}
          fill="none"
          stroke={edge}
          strokeWidth={Math.max(3.2, radius * 0.2)}
          strokeLinejoin="round"
        />
        <path
          d={starPath(
            cx - radius * 0.07,
            cy - radius * 0.11,
            radius * 0.5,
            0.42,
          )}
          fill={`url(#${uid}-shine)`}
          opacity={pose.fill * (0.18 + pose.shine * 0.5 + pose.twinkle * 0.1)}
        />
        <ellipse
          cx={cx - radius * 0.16}
          cy={cy - radius * 0.26}
          rx={radius * 0.13}
          ry={radius * 0.08}
          fill="#ffffff"
          opacity={pose.fill * (0.22 + pose.shine * 0.38 + pose.twinkle * 0.14)}
          transform={`rotate(-28 ${cx - radius * 0.16} ${cy - radius * 0.26})`}
        />
        {pose.twinkle > 0.55
          ? [0, 1, 4].map((tip) => {
              const angle = -Math.PI / 2 + tip * ((Math.PI * 2) / 5);
              const tx = cx + Math.cos(angle) * radius * 0.94;
              const ty = cy + Math.sin(angle) * radius * 0.94;
              const spark = 0.45 + ((tip + index) % 3) * 0.18;
              return (
                <g
                  key={tip}
                  transform={`translate(${tx} ${ty})`}
                  opacity={pose.twinkle * spark}
                >
                  <path
                    d={`M 0 ${-radius * 0.16} L ${radius * 0.035} 0 L 0 ${radius * 0.16} L ${-radius * 0.035} 0 Z`}
                    fill="#ffffff"
                  />
                  <path
                    d={`M ${-radius * 0.16} 0 L 0 ${radius * 0.035} L ${radius * 0.16} 0 L 0 ${-radius * 0.035} Z`}
                    fill="#ffffff"
                  />
                </g>
              );
            })
          : null}
      </g>

      {burst.map((chip, i) => (
        <rect
          key={i}
          x={cx + chip.x * radius - 8 * chip.scale}
          y={cy + pose.drop * radius + chip.y * radius - 4 * chip.scale}
          width={16 * chip.scale}
          height={8 * chip.scale}
          rx={1.4}
          fill={TINTS[chip.tint] ?? WORKSHOP.sun}
          opacity={chip.alpha}
          transform={`rotate(${(chip.rotation * 180) / Math.PI} ${cx + chip.x * radius} ${cy + pose.drop * radius + chip.y * radius})`}
        />
      ))}

      {ring ? (
        <circle
          cx={cx}
          cy={cy + pose.drop * radius}
          r={radius * (1.05 + impactAge * 3.8)}
          fill="none"
          stroke={WORKSHOP.brassLit}
          strokeWidth={Math.max(2, 6 - impactAge * 14)}
          opacity={Math.max(0, 0.65 - impactAge * 1.7)}
        />
      ) : null}
    </svg>
  );
};
