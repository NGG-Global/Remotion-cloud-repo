import { getInputProps } from "remotion";
import { planeScale, type Cam } from "./camera";

/**
 * Framing check (development only). Render with the input prop
 * `{ "framingDebug": true }` and every character on a stage plane logs where
 * its head and feet land on screen. `tools/stills.mjs` collects the log, and
 * a head sliced by the frame edge shows up as a number instead of relying on
 * someone to spot it on a contact sheet. Off by default: nothing is logged.
 */
let enabled: boolean | null = null;

export const framingDebug = (): boolean => {
  if (enabled === null) {
    enabled = (getInputProps() as { framingDebug?: boolean }).framingDebug === true;
  }
  return enabled;
};

export const logFraming = (
  frame: number,
  cam: Cam,
  d: number,
  head: { x: number; y: number; r: number },
  feetY: number,
  who: string,
) => {
  const s = planeScale(cam, d);
  if (s <= 0) {
    return;
  }
  const sx = (x: number) => 960 + (x - cam.x) * s;
  const sy = (y: number) => 540 + (cam.shiftY ?? 0) + (y - cam.y) * s;
  console.log(
    `FRAMING ${JSON.stringify({ local: frame, who, d, hx: Math.round(sx(head.x)), hy: Math.round(sy(head.y)), hr: Math.round(head.r * s), fy: Math.round(sy(feetY)) })}`,
  );
};
