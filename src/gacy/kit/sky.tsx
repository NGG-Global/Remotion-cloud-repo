import React from "react";
import { useCam } from "../engine/camera";
import { hash } from "../engine/time";

/**
 * Screen-space skies. They sit behind every plane, so they do not need to be
 * built at world scale; a slow vertical offset follows the camera height so
 * a crane move still reads against the sky.
 */

export type SkyMode = "night" | "dusk" | "day" | "overcast" | "winterDay" | "predawn";

const SKY: Record<SkyMode, readonly [string, string, string]> = {
  night: ["#070b14", "#101a2b", "#1d2a3c"],
  predawn: ["#0c1220", "#1d2638", "#3a3f4c"],
  dusk: ["#141a2a", "#3b3444", "#a0685a"],
  day: ["#6f8ea8", "#9fb4c2", "#d8d4c4"],
  overcast: ["#6d7580", "#8f959c", "#b9b6ac"],
  winterDay: ["#8593a0", "#a9b2b8", "#d4d2cc"],
};

export const Sky: React.FC<{
  readonly mode?: SkyMode;
  readonly t?: number;
  readonly stars?: boolean;
  readonly moon?: { x: number; y: number } | null;
  readonly clouds?: number;
}> = ({ mode = "night", t = 0, stars = mode === "night", moon = null, clouds = 0 }) => {
  const cam = useCam();
  const [a, b, c] = SKY[mode];
  const id = `sky-${mode}`;
  // Sky drifts a little with the camera so crane moves register.
  const dy = -(cam.y + 300) * 0.04;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.55" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id="moon-halo">
          <stop offset="0" stopColor="#e9eef6" stopOpacity={0.35} />
          <stop offset="1" stopColor="#e9eef6" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-200} y={-200 + dy} width={2320} height={1480} fill={`url(#${id})`} />
      {stars
        ? Array.from({ length: 70 }, (_, i) => {
            const x = hash(i * 3.17) * 1920;
            const y = hash(i * 5.71) * 520 + dy;
            const tw = 0.35 + Math.sin(t * (0.6 + hash(i) * 1.4) + i) * 0.25;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={hash(i + 40) > 0.9 ? 1.6 : 0.9}
                fill="#e8ecf2"
                opacity={tw * (1 - y / 700)}
              />
            );
          })
        : null}
      {moon ? (
        <g transform={`translate(${moon.x} ${moon.y + dy})`}>
          <circle r={130} fill="url(#moon-halo)" />
          <circle r={26} fill="#e6e8e2" />
          <circle cx={-7} cy={-5} r={5} fill="#cfd2cc" />
          <circle cx={8} cy={7} r={3.5} fill="#d4d6d0" />
        </g>
      ) : null}
      {clouds > 0
        ? Array.from({ length: 5 }, (_, i) => {
            const speed = 6 + hash(i + 3) * 8;
            const x = ((hash(i * 9) * 2400 + t * speed) % 2600) - 340;
            const y = 90 + hash(i * 13) * 260 + dy;
            const w = 260 + hash(i * 7) * 320;
            const tone =
              mode === "night" || mode === "predawn"
                ? "#1f2a3b"
                : mode === "dusk"
                  ? "#5a4a54"
                  : "#e8e6e0";
            return (
              <g key={i} opacity={clouds * (mode === "night" ? 0.7 : 0.5)}>
                <ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.08} fill={tone} />
                <ellipse cx={x + w * 0.15} cy={y - w * 0.05} rx={w * 0.25} ry={w * 0.07} fill={tone} />
              </g>
            );
          })
        : null}
    </g>
  );
};

/**
 * Falling snow in screen space, three depth bands. Deterministic: each
 * flake's position is a pure function of time.
 */
export const Snow: React.FC<{
  readonly t: number;
  readonly density?: number;
  readonly wind?: number;
  readonly opacity?: number;
}> = ({ t, density = 1, wind = 20, opacity = 1 }) => {
  const n = Math.round(140 * density);
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const band = i % 3;
        const size = [1.4, 2.3, 3.6][band];
        const fall = [38, 62, 110][band] * (0.8 + hash(i) * 0.4);
        const x0 = hash(i * 1.37) * 2100 - 90;
        const y = (((hash(i * 2.91) * 1180 + t * fall) % 1180) + 1180) % 1180 - 50;
        const x =
          ((x0 + t * wind * (band + 1) * 0.6 + Math.sin(t * 0.8 + i) * 8) % 2100 + 2100) % 2100 - 90;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={size}
            fill="#eef2f6"
            opacity={[0.35, 0.55, 0.8][band]}
          />
        );
      })}
    </g>
  );
};

/** Dust motes drifting in a lit volume, in world space. */
export const Motes: React.FC<{
  readonly t: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly n?: number;
  readonly color?: string;
  readonly opacity?: number;
}> = ({ t, x, y, w, h, n = 30, color = "#f3e3c0", opacity = 0.5 }) => (
  <g opacity={opacity}>
    {Array.from({ length: n }, (_, i) => {
      const px = x + ((hash(i * 3.3) * w + Math.sin(t * 0.3 + i) * 14 + t * 3) % w);
      const py = y + ((((hash(i * 7.7) * h - t * (4 + hash(i) * 6)) % h) + h) % h);
      return <circle key={i} cx={px} cy={py} r={1.2 + hash(i + 5) * 1.6} fill={color} opacity={0.3 + hash(i + 9) * 0.5} />;
    })}
  </g>
);
