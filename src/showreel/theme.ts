/**
 * Palette and timing for the Remotion capability showreel.
 *
 * Distinct from the Claude explainer tokens so this film reads as a
 * product-capability piece rather than another episode of that series.
 */

export const REEL = {
  bg: "#07080d",
  bgRaised: "#10131b",
  ink: "#f5f7fb",
  muted: "#8b93a7",
  blue: "#0B84F3",
  blueSoft: "#5eb1ff",
  orange: "#fd511d",
  line: "rgba(245,247,251,0.12)",
} as const;

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
