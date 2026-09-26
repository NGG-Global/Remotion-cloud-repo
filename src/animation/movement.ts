import { Easing, interpolate } from "remotion";

export const movement = {
  drift: (
    frame: number,
    options: { readonly speed?: number; readonly ySpeed?: number } = {},
  ): { readonly x: number; readonly y: number } => ({
    x: frame * (options.speed ?? 0.4),
    y: frame * (options.ySpeed ?? 0),
  }),
  float: (
    frame: number,
    options: { readonly amplitude?: number; readonly period?: number } = {},
  ): { readonly y: number } => {
    const period = options.period ?? 45;
    const amplitude = options.amplitude ?? 8;
    return { y: Math.sin((frame / period) * Math.PI * 2) * amplitude };
  },
  walkAcross: (
    frame: number,
    options: {
      readonly fromX: number;
      readonly toX: number;
      readonly durationInFrames: number;
      readonly delay?: number;
    },
  ): { readonly x: number } => ({
    x: interpolate(
      frame - (options.delay ?? 0),
      [0, Math.max(1, options.durationInFrames)],
      [options.fromX, options.toX],
      {
        easing: Easing.inOut(Easing.quad),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  }),
  bob: (
    frame: number,
    options: { readonly amplitude?: number; readonly period?: number } = {},
  ): { readonly y: number } => {
    const period = options.period ?? 12;
    const amplitude = options.amplitude ?? 6;
    return {
      y: Math.abs(Math.sin((frame / period) * Math.PI * 2)) * -amplitude,
    };
  },
};
