import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { Region } from "./regions";
import { regionCenter } from "./regions";

/** Native pixel size of `public/img/claude-home.jpg`. */
export const SCREENSHOT_WIDTH = 2959;
export const SCREENSHOT_HEIGHT = 1766;

/** Screenshot aspect ratio. */
export const SCREENSHOT_ASPECT = SCREENSHOT_WIDTH / SCREENSHOT_HEIGHT;

export type FocusStep = {
  /** Frame at which the move towards this target begins. */
  readonly at: number;
  /** Region to centre on. Omit for the whole interface. */
  readonly region?: Region;
  /**
   * Wider region for the camera to frame, when `region` is a small control.
   * Framing its container and ringing the control itself keeps the shot sharp
   * and keeps the viewer oriented in the layout.
   */
  readonly frameOn?: Region;
  /**
   * Fraction of the screen the region should occupy once the move settles.
   * Smaller means a tighter push-in. Ignored when `region` is omitted.
   */
  readonly fill?: number;
  /** Length of the move in frames. */
  readonly duration?: number;
};

export type FocusTransform = {
  /** Horizontal centre of the view, as a fraction of the screenshot. */
  readonly cx: number;
  /** Vertical centre of the view, as a fraction of the screenshot. */
  readonly cy: number;
  /** Magnification, where 1 fits the whole screenshot. */
  readonly scale: number;
};

const FULL_VIEW: FocusTransform = { cx: 0.5, cy: 0.5, scale: 1 };

/**
 * Scale needed for `region` to take up `fill` of the screen's shorter
 * constraint. Both axes are considered so a wide region is not cropped.
 */
const scaleForRegion = (region: Region, fill: number): number =>
  Math.min(fill / region.w, fill / region.h);

const toTransform = (step: FocusStep, maxScale: number): FocusTransform => {
  const target = step.frameOn ?? step.region;
  if (!target) {
    return FULL_VIEW;
  }
  const { x, y } = regionCenter(target);
  return {
    cx: x,
    cy: y,
    // Capped so a small control never pushes the camera past the source
    // image's own resolution: a blurred close-up costs more than it gains.
    scale: Math.min(maxScale, scaleForRegion(target, step.fill ?? 0.55)),
  };
};

/**
 * Camera easing. A slow start and a slow finish reads as a deliberate camera
 * move; a linear ramp looks mechanical on a push-in.
 */
const EASE = Easing.bezier(0.4, 0, 0.2, 1);

const DEFAULT_DURATION = 26;

/**
 * Interpolates a camera move across an ordered list of focus targets.
 *
 * Each step's `at` is when the move towards it starts, so the view holds on
 * the previous target until then. Returning a plain object rather than a
 * style keeps this reusable for anything that needs to follow the camera.
 */
export const useFocus = (
  steps: readonly FocusStep[],
  maxScale = Number.POSITIVE_INFINITY,
): FocusTransform => {
  const frame = useCurrentFrame();

  if (steps.length === 0) {
    return FULL_VIEW;
  }

  // Find the move that is active or most recently completed.
  let index = 0;
  for (let i = 0; i < steps.length; i++) {
    if (frame >= steps[i].at) {
      index = i;
    }
  }

  const target = toTransform(steps[index], maxScale);
  if (index === 0) {
    return target;
  }

  const previous = toTransform(steps[index - 1], maxScale);
  const step = steps[index];
  const duration = step.duration ?? DEFAULT_DURATION;

  const t = interpolate(frame, [step.at, step.at + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return {
    cx: previous.cx + (target.cx - previous.cx) * t,
    cy: previous.cy + (target.cy - previous.cy) * t,
    // Scale is interpolated geometrically: a linear ramp between 1x and 4x
    // spends most of its time already zoomed in and feels like a lurch.
    scale: previous.scale * (target.scale / previous.scale) ** t,
  };
};
