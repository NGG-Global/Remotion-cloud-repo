/**
 * Tiny Tempo's workshop tokens, brought across for the ad.
 *
 * The game keys everything to four colours and a single key light. The ad
 * uses the same values so a still from the video can sit next to a screenshot
 * without a palette jump.
 */

export const TT = {
  paper: "#eee8d8",
  paperLift: "#f6f0e2",
  ink: "#243e35",
  inkDeep: "#1a2e28",
  muted: "#4e5a52",
  coral: "#cf5134",
  coralLit: "#e07358",
  coralDeep: "#a33c26",
  cream: "#fff4dc",
  creamSoft: "#fff9e8",
  wood: "#d98a48",
  woodDark: "#936542",
  woodLit: "#e8a85c",
  rope: "#6b4a2e",
  puck: "#f6ead0",
  bench: "#e6dcc4",
  sun: "#dfc37f",
  sunSoft: "#f0d9a0",
  brass: "#e0b34a",
  brassLit: "#f0d07a",
  white: "#fffdf6",
} as const;

export const WORKSHOP = {
  paper: TT.paper,
  ink: TT.ink,
  muted: "#788074",
  sun: TT.sun,
  wood: "#c99460",
  woodDark: TT.woodDark,
  red: TT.coral,
  cream: TT.creamSoft,
} as const;

export const GARDEN = {
  paper: "#e4e7ce",
  ink: "#303f43",
  tile: "#b8c2a0",
  plum: "#8b6085",
  plumLit: "#b68da2",
  cream: "#fff5dc",
  coral: "#d87d62",
  upper: "#303f43",
} as const;

export const KITCHEN = {
  paper: "#f6f7f2",
  ink: "#33402f",
  grout: "#c9d8cc",
  counter: "#9fb3a6",
  board: "#e3cfa6",
  boardEdge: "#b8965f",
  tomato: "#d94a3a",
  tomatoLit: "#ee7c6a",
  flesh: "#e35f4a",
  seed: "#f5d98a",
  stem: "#4d7c3a",
  steel: "#d3dadd",
  steelLit: "#f4f7f8",
  handle: "#2b2b30",
} as const;

export const GLASS = {
  paper: "#e9e4e7",
  ink: "#49394e",
  frame: "#82718a",
  blue: "#b7d9db",
  light: "#fff5df",
  glove: "#dc9775",
  sill: "#d1c1cd",
  sky: "#8ec5d4",
  hill: "#6aa08a",
} as const;

export const TIMBER = {
  paper: "#e6e9e4",
  ink: "#22303a",
  sapwood: "#cbb999",
  lit: "#e4d8c0",
  grain: "#a89070",
  kerf: "#544a39",
  steel: "#aab6bd",
  grip: "#3f5a63",
  sawdust: "#d8a24a",
  glove: "#6b7f88",
} as const;

export const CRAFT = {
  paper: "#eee8d8",
  ink: "#30493f",
  mat: "#8fa996",
  grid: "#b9cbb5",
  coral: TT.coral,
  steel: "#c7d4d2",
  star: "#f0ce7e",
} as const;

export const GYM = {
  paper: "#dad4cb",
  ink: "#2b2733",
  wall: "#cbc3b7",
  lamp: "#fff1d6",
  mat: "#4c4954",
  iron: "#3b3e47",
  chrome: "#bcc3ca",
  chalk: "#f4eddc",
  kit: "#2e9c8e",
  kitLit: "#4eb5a6",
  skin: "#d8945f",
  hair: "#2b2733",
} as const;

/** 120 BPM — the game's own pulse, and the music's measured tempo. */
export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;

export const DISPLAY = "Fredoka";
export const BODY = "Nunito";

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const hexToRgb = (hex: string): readonly [number, number, number] => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const byte = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
};

/** Positive lightens toward white, negative darkens toward black. */
export const shade = (hex: string, amount: number): string => {
  const [r, g, b] = hexToRgb(hex);
  const t = clamp01(Math.abs(amount));
  if (amount >= 0) {
    return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
  }
  return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t));
};

export const mix = (a: string, b: string, t: number): string => {
  const k = clamp01(t);
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * k, ag + (bg - ag) * k, ab + (bb - ab) * k);
};

/** Lit / face / shade / edge / rim — the game's one-light solid. */
export const faces = (colour: string) => ({
  lit: shade(colour, 0.14),
  face: colour,
  shade: shade(colour, -0.28),
  edge: shade(colour, -0.45),
  rim: mix(shade(colour, 0.35), "#ffffff", 0.35),
});
