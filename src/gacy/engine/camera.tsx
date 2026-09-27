import React, { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";
import { fbm } from "./time";

/**
 * A multiplane camera.
 *
 * World units: 200 per metre on the character plane, so an adult is 360
 * units tall. Every set is built at that one scale, which is what keeps a
 * person, a car and a house in believable proportion.
 *
 * The camera is a pinhole looking straight ahead. `x, y` is where it is
 * (y up is negative, the ground is y = 0), `zoom` is how close it is:
 * zoom 1 puts the character plane 10 m away. Each <Plane> sits `d` metres
 * behind the character plane (negative = in front of it). Its scale falls
 * off with distance, so a pan moves the background less than the people and
 * a dolly-in swells the foreground faster than the back wall. That is the
 * parallax, and it is geometric rather than faked per layer.
 */

export const UNIT = 200;
const FOCAL_M = 10;

export type Cam = {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
  /** Lens shift in screen pixels. Frames lower or higher without perspective change. */
  readonly shiftY?: number;
  /** Roll in degrees. Keep tiny. */
  readonly rot?: number;
};

const CamCtx = createContext<Cam>({ x: 0, y: -300, zoom: 1 });

export const useCam = (): Cam => useContext(CamCtx);

/** Scale of a plane `d` metres behind the character plane. 0 when behind the lens. */
export const planeScale = (cam: Cam, d: number): number => {
  const dist = FOCAL_M / cam.zoom + d;
  if (dist <= 0.35) {
    return 0;
  }
  return FOCAL_M / dist;
};

/** Where a world point on a plane lands on screen. For aiming lights and labels. */
export const toScreen = (
  cam: Cam,
  x: number,
  y: number,
  d = 0,
): { x: number; y: number; s: number } => {
  const s = planeScale(cam, d);
  return {
    x: 960 + (x - cam.x) * s,
    y: 540 + (cam.shiftY ?? 0) + (y - cam.y) * s,
    s,
  };
};

export const Stage: React.FC<{
  readonly cam: Cam;
  /** Handheld amplitude in world units. 0 for a locked-off tripod. */
  readonly handheld?: number;
  /** Seconds, for the handheld noise. */
  readonly t?: number;
  readonly bg?: string;
  readonly children: React.ReactNode;
}> = ({ cam, handheld = 0, t = 0, bg = "#05060a", children }) => {
  const shaken: Cam =
    handheld > 0
      ? {
          ...cam,
          x: cam.x + fbm(t * 0.35, 3) * handheld,
          y: cam.y + fbm(t * 0.3, 7) * handheld * 0.6,
          rot: (cam.rot ?? 0) + fbm(t * 0.25, 11) * handheld * 0.004,
        }
      : cam;
  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <CamCtx.Provider value={shaken}>
        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", inset: 0 }}
        >
          <g transform={`rotate(${shaken.rot ?? 0} 960 540)`}>{children}</g>
        </svg>
      </CamCtx.Provider>
    </AbsoluteFill>
  );
};

/** A world layer at depth `d` metres (negative = between camera and people). */
export const Plane: React.FC<{
  readonly d?: number;
  readonly opacity?: number;
  readonly children: React.ReactNode;
}> = ({ d = 0, opacity = 1, children }) => {
  const cam = useCam();
  const s = planeScale(cam, d);
  if (s <= 0 || opacity <= 0) {
    return null;
  }
  return (
    <g
      opacity={opacity}
      transform={`translate(960 ${540 + (cam.shiftY ?? 0)}) scale(${s}) translate(${-cam.x} ${-cam.y})`}
    >
      {children}
    </g>
  );
};

/** Pixel-space layer inside the stage SVG: sky gradients, screen-wide light. */
export const Screen: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => <g>{children}</g>;
