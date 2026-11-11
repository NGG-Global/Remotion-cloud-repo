/**
 * Visual identity for the Münzer episode of "מאחורי הסיוט".
 *
 * The archive carries the colour: stage lights, oiled skin, 1990s video.
 * Everything drawn for the film is restrained around it: near-black ground,
 * a cold clinical teal for the medical material, amber for documentary
 * labels, one red for damage.
 */

export const TYPE = {
  hebrew: "Rubik",
  serif: "Frank Ruhl Libre",
  latin: "Playfair Display",
} as const;

export const INK = {
  void: "#050607",
  ground: "#0a0c0e",
  panel: "#11161a",
  paper: "#ece4d3",
  paperShade: "#d6ccb6",
  ink: "#1b1814",
  text: "#f2ece0",
  textDim: "#b9b1a3",
  amber: "#d9a45a",
  clinic: "#7fb8b3",
  clinicDim: "#3e6461",
  clinicGlow: "#a9e0da",
  damage: "#c8402e",
  damageGlow: "#ff6a4d",
  fat: "#d8b25a",
  muscle: "#9c3b33",
  skin: "#d9a184",
} as const;

export const FPS = 30;
export const W = 1920;
export const H = 1080;
