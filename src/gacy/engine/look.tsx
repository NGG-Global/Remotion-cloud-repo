import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { hash, noise } from "./time";

/**
 * Picture finishes laid over a shot.
 *
 * `Finish` is the house look: fine grain and a vignette. The grain is a
 * pre-baked tile with its own alpha (public/gacy/grain.png) composited
 * with normal blending: measured at about half the cost of an overlay-blend
 * grain on this renderer, and it looks the same at 1080p.
 *
 * `HomeMovie` turns a shot into 1970s Super 8: warm fade, gate weave,
 * flicker, dust. It is used only for "how people saw him" footage, so the
 * format itself tells the viewer this is the public image.
 */

const GRAIN = staticFile("gacy/grain.png");

const Grain: React.FC<{ readonly amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  const x = Math.floor(hash(frame) * 256);
  const y = Math.floor(hash(frame + 1000) * 256);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Preload through <Img> so no frame is captured before the tile exists. */}
      <Img src={GRAIN} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
      <AbsoluteFill
        style={{
          // The tile is loaded through the <Img> above, which holds the render
          // until it has arrived, so this reference never paints early.
          // eslint-disable-next-line @remotion/no-background-image
          backgroundImage: `url(${GRAIN})`,
          backgroundRepeat: "repeat",
          backgroundPosition: `${x}px ${y}px`,
          opacity: amount,
        }}
      />
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ readonly amount: number }> = ({ amount }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(80% 72% at 50% 46%, rgba(0,0,0,0) 48%, rgba(0,0,0,${0.9 * amount}) 100%)`,
    }}
  />
);

export const Finish: React.FC<{
  readonly grain?: number;
  readonly vignette?: number;
  /** Cool/warm grade: -1 cold night, 0 neutral, 1 warm. */
  readonly temp?: number;
}> = ({ grain = 0.36, vignette = 0.6, temp = 0 }) => (
  <>
    {temp !== 0 ? (
      <AbsoluteFill
        style={{
          backgroundColor: temp > 0 ? "#ffb060" : "#3a5a9a",
          opacity: Math.abs(temp) * 0.07,
          pointerEvents: "none",
        }}
      />
    ) : null}
    <Vignette amount={vignette} />
    <Grain amount={grain} />
  </>
);

export const HomeMovie: React.FC<{
  readonly children: React.ReactNode;
  readonly amount?: number;
}> = ({ children, amount = 1 }) => {
  const frame = useCurrentFrame();
  // Super 8 ran at 18 fps: step the weave so it reads as film, not shake.
  const step = Math.floor(frame / 1.67);
  const wx = (hash(step) - 0.5) * 5 * amount;
  const wy = (hash(step + 91) - 0.5) * 7 * amount;
  const flick = noise(frame * 0.7, 4) * 0.05 * amount;
  const scratch = hash(Math.floor(frame / 3) * 7) > 0.75 ? hash(Math.floor(frame / 3)) * 1920 : -10;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0906" }}>
      <AbsoluteFill style={{ translate: `${wx}px ${wy}px`, scale: "1.03" }}>{children}</AbsoluteFill>
      {/* faded warm stock: a lifted, sepia-leaning veil instead of a CSS filter */}
      <AbsoluteFill style={{ backgroundColor: "#c89a60", opacity: 0.16 * amount }} />
      <AbsoluteFill style={{ backgroundColor: flick > 0 ? "#fff4e0" : "#000", opacity: Math.abs(flick) }} />
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 ${140 * amount}px ${40 * amount}px rgba(10,6,2,0.85)`,
          borderRadius: 28 * amount,
        }}
      />
      {amount > 0.5 ? (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: scratch, width: 2, background: "#fff", opacity: 0.12 }} />
      ) : null}
      <Vignette amount={0.5 * amount} />
      <Grain amount={0.9 * amount} />
    </AbsoluteFill>
  );
};

/**
 * Low ground haze in screen space: a handful of soft gradient ellipses
 * drifting across the lower frame. Far cheaper than masked fog tiles.
 */
export const Haze: React.FC<{
  readonly t: number;
  readonly density?: number;
  readonly color?: string;
  readonly y?: number;
}> = ({ t, density = 0.3, color = "#6a7a94", y = 760 }) => {
  if (density <= 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080}>
        <defs>
          <radialGradient id={`haze-${color.replace("#", "")}`}>
            <stop offset="0" stopColor={color} stopOpacity={1} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>
        {Array.from({ length: 6 }, (_, i) => {
          const speed = 14 + hash(i + 3) * 18;
          const x = ((hash(i * 7) * 2600 + t * speed) % 2800) - 440;
          const yy = y + hash(i * 3) * 260 - 80;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={yy}
              rx={520 + hash(i) * 300}
              ry={90 + hash(i + 5) * 60}
              fill={`url(#haze-${color.replace("#", "")})`}
              opacity={density * 0.55}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
