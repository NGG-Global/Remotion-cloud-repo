import { Easing, interpolate } from "remotion";
import { FPS } from "./timing";

/**
 * Motion plan for the abstract top-down scenes. The road runs vertically and
 * the vehicle drives up it; `laneX` is its lateral position in 1920 space and
 * `speed` its forward speed in px/s, both as functions of scene-local seconds.
 */
export type DrivePlan = {
  readonly laneX: (t: number) => number;
  readonly speed: (t: number) => number;
  /**
   * Scene-local second at which the camera stops following the vehicle and
   * eases to a halt, letting the vehicle drive out of the top of the frame.
   */
  readonly cameraRelease?: number;
  /** How long the camera takes to come to rest after release, seconds. */
  readonly cameraSettle?: number;
};

export type DriveState = {
  /** Lateral position of the vehicle, 1920 space. */
  readonly x: number;
  /** Vertical screen position of the vehicle centre. */
  readonly y: number;
  /** Heading in degrees; positive turns the nose to the right. */
  readonly heading: number;
  /** How far the camera has travelled up the road, px. Scrolls the dashes. */
  readonly camera: number;
  readonly speed: number;
};

/**
 * A map marker reads better when it yaws less than the pure geometry says;
 * this scales the heading derived from lateral versus forward speed.
 */
const HEADING_GAIN = 0.7;

/** Vehicle centre sits here once the camera is following. */
export const CAMERA_ANCHOR_Y = 610;
/** The vehicle starts this far below the top of the frame (off-screen). */
const ENTRY_Y = 1230;

const smooth = Easing.inOut(Easing.cubic);

/**
 * Integrates the plan frame by frame up to `frame`. Deterministic and cheap
 * (a few hundred steps), which keeps every frame independent of render order.
 */
export const drive = (plan: DrivePlan, frame: number): DriveState => {
  const dt = 1 / FPS;
  let distance = 0;
  let camera = 0;
  let cameraSpeedAtRelease = 0;
  let x = plan.laneX(0);
  let prevX = x;
  let speed = 0;

  for (let i = 0; i <= frame; i++) {
    const t = i / FPS;
    speed = plan.speed(t);
    distance += speed * dt;
    prevX = x;
    x = plan.laneX(t);

    const released =
      plan.cameraRelease !== undefined && t >= plan.cameraRelease;
    if (!released) {
      camera = Math.max(camera, distance - (ENTRY_Y - CAMERA_ANCHOR_Y));
      cameraSpeedAtRelease = camera > 0 ? speed : 0;
    } else {
      const settle = plan.cameraSettle ?? 1;
      const progress = interpolate(
        t - (plan.cameraRelease ?? 0),
        [0, settle],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      camera += cameraSpeedAtRelease * (1 - smooth(progress)) * dt;
    }
  }

  const lateralSpeed = (x - prevX) / dt;
  const heading =
    speed > 1
      ? (HEADING_GAIN * Math.atan2(lateralSpeed, speed) * 180) / Math.PI
      : 0;

  return {
    x,
    y: ENTRY_Y - distance + camera,
    heading,
    camera,
    speed,
  };
};

/** Piecewise-linear helper with a smooth ease between the two given times. */
export const ease = (
  t: number,
  from: number,
  to: number,
  a: number,
  b: number,
  easing: (v: number) => number = smooth,
): number =>
  interpolate(t, [from, to], [a, b], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
