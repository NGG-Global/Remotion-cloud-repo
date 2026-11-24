/**
 * Design tokens for the vertical "Why Concepts Are Vectors" explainer.
 *
 * A deep-indigo stage with a bright, high-contrast palette: the subject is
 * arrows and points in space, so the background reads as the space itself and
 * every coloured mark reads as something living in it.
 */

export const VERTICAL = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const C = {
  bg: "#15123a",
  bgDeep: "#0d0b27",
  bgLift: "#211d52",
  grid: "rgba(160,150,255,0.10)",
  gridStrong: "rgba(160,150,255,0.22)",
  axis: "rgba(230,226,255,0.55)",

  text: "#fbf8ff",
  textMuted: "#aaa4d6",
  ink: "#15123a",

  yellow: "#ffd23f",
  coral: "#ff6b6b",
  mint: "#2ee6a6",
  sky: "#4cc9f0",
  purple: "#a979ff",
  pink: "#ff70c4",
  orange: "#ff9f43",

  card: "#ffffff",
  cardInk: "#1f1b4d",
} as const;

/** Cycled whenever a graphic needs "a different colour for each thing". */
export const PALETTE = [
  C.sky,
  C.coral,
  C.mint,
  C.yellow,
  C.purple,
  C.pink,
  C.orange,
] as const;

/** Rubik carries Hebrew and Latin; registered by src/fonts.ts. */
export const DISPLAY = "Rubik";
export const EMOJI = "VectorsEmoji";
/** Numbers inside vectors: tabular figures keep columns aligned. */
export const MONO = "Inter";

/** Layout bands, in pixels of the 1080x1920 frame. */
export const LAYOUT = {
  /** Illustration stage. */
  stageTop: 200,
  stageHeight: 1060,
  /** Caption block, kept above the bottom ~350px that Shorts/Reels/TikTok
   * cover with their own interface. */
  captionTop: 1285,
  captionHeight: 300,
} as const;
