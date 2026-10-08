/**
 * Format and design tokens for "Back up your photos" — a vertical kinetic
 * typography piece over a Hebrew monologue.
 *
 * The look is the generation the voice talks to: born analog, raised digital.
 * Warm photo-print paper and marker for the analog half; pixel icons, system
 * dialogs and a backup progress bar for the digital half. The cold open runs
 * on an amber monochrome monitor and the rest of the video "boots" from it.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Length of public/audio/backup-narration.mp3. */
export const AUDIO_SECONDS = 490.15;
export const DURATION = Math.ceil(AUDIO_SECONDS * FPS);

/**
 * The music bed is a steady loop: its first downbeat lands at 23.87 s and
 * the grid holds to within a frame or two to the last bar. Measured with
 * librosa on the intro and outro, where nothing is spoken over it.
 */
export const BEAT0 = 23.87;
export const BEAT = 0.87357;

export const FONT = {
  /** Karantina Bold: tall, condensed Hebrew display face for hero words. */
  display: "BK Display",
  /** Rubik: the running text, heavy weights. */
  sans: "BK Sans",
  /** Frank Ruhl Libre: quoted speech and the "analog" voice. */
  serif: "BK Serif",
} as const;

export type ToneColors = {
  readonly bg: string;
  /** Second background colour, for the soft radial light behind the text. */
  readonly bg2: string;
  readonly ink: string;
  readonly sub: string;
  readonly accent: string;
  readonly accent2: string;
  /** Highlighter behind *marked* words. */
  readonly hi: string;
  /** Window and card surfaces. */
  readonly card: string;
  readonly line: string;
  readonly grain: number;
};

export const C = {
  paper: "#f3ecdf",
  paperDeep: "#e7dcc8",
  ink: "#17161c",
  inkSoft: "#57534d",
  blue: "#2f55e4",
  blueDeep: "#1d3aa8",
  blueSky: "#8fb4ff",
  yellow: "#ffcf33",
  orange: "#ff8a2a",
  red: "#f0533a",
  green: "#22b573",
  teal: "#0e7c7b",
  pink: "#ff8fb1",
  violet: "#7a5cff",
  white: "#fffdf7",
  amber: "#ffb23f",
  amberDim: "#9a5a12",
  crt: "#0b0907",
  night: "#14183a",
  nightDeep: "#0b0e26",
  dusk: "#3a2f6b",
} as const;

export const TONES: Record<
  "crt" | "paper" | "dusk" | "night" | "sun" | "blue" | "warm",
  ToneColors
> = {
  crt: {
    bg: C.crt,
    bg2: "#1e1408",
    ink: C.amber,
    sub: C.amberDim,
    accent: "#ffd27a",
    accent2: C.amber,
    hi: "#5a3606",
    card: "#120c05",
    line: C.amber,
    grain: 0.1,
  },
  paper: {
    bg: C.paper,
    bg2: "#fbf6ec",
    ink: C.ink,
    sub: C.inkSoft,
    accent: C.blue,
    accent2: C.red,
    hi: C.yellow,
    card: C.white,
    line: C.ink,
    grain: 0.08,
  },
  warm: {
    bg: "#f6dfc4",
    bg2: "#fbeedd",
    ink: "#2a1a12",
    sub: "#7a5a44",
    accent: "#d9482b",
    accent2: C.blue,
    hi: "#ffc24a",
    card: C.white,
    line: "#2a1a12",
    grain: 0.09,
  },
  sun: {
    bg: C.yellow,
    bg2: "#ffe07a",
    ink: C.ink,
    sub: "#6b5310",
    accent: C.blue,
    accent2: C.red,
    hi: C.white,
    card: C.white,
    line: C.ink,
    grain: 0.07,
  },
  blue: {
    bg: C.blue,
    bg2: "#4a6df0",
    ink: C.white,
    sub: "#c3d2ff",
    accent: C.yellow,
    accent2: "#9ff0c9",
    hi: C.blueDeep,
    card: C.white,
    line: C.ink,
    grain: 0.08,
  },
  dusk: {
    bg: C.dusk,
    bg2: "#5a3f7d",
    ink: "#fff1dc",
    sub: "#c9b6e8",
    accent: C.yellow,
    accent2: C.orange,
    hi: "#7b4fa8",
    card: "#fff6e6",
    line: C.ink,
    grain: 0.09,
  },
  night: {
    bg: C.night,
    bg2: "#232a5c",
    ink: "#f4efe4",
    sub: "#9aa3d6",
    accent: C.yellow,
    accent2: C.pink,
    hi: "#3a4390",
    card: "#fff6e6",
    line: C.ink,
    grain: 0.1,
  },
};

// ---- helpers --------------------------------------------------------------

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Linear ramp from a to b, clamped to 0..1. */
export const ramp = (t: number, a: number, b: number): number =>
  clamp01((t - a) / (b - a));

export const easeOut = (t: number): number => 1 - (1 - clamp01(t)) ** 3;
export const easeIn = (t: number): number => clamp01(t) ** 3;
export const easeInOut = (t: number): number => {
  const p = clamp01(t);
  return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
};

/** Overshooting ease for pop-ins. */
export const easeBack = (t: number, s = 1.7): number => {
  const p = clamp01(t) - 1;
  return 1 + p * p * ((s + 1) * p + s);
};

/**
 * Damped-spring pop, evaluated from time alone so any frame can be rendered
 * on its own. 0 before `age` reaches 0, settling on 1.
 */
export const pop = (age: number, duration = 0.42, bounce = 0.32): number => {
  if (age <= 0) return 0;
  const p = age / duration;
  if (p >= 1.6) return 1;
  return 1 - Math.exp(-5.2 * p) * Math.cos(p * Math.PI * (1 + bounce * 2.2));
};

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const mix = (a: string, b: string, t: number): string => {
  const k = clamp01(t);
  const [ar, ag, ab] = hex(a);
  const [br, bg, bb] = hex(b);
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * k)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
};

export const mixTone = (
  a: ToneColors,
  b: ToneColors,
  t: number,
): ToneColors => ({
  bg: mix(a.bg, b.bg, t),
  bg2: mix(a.bg2, b.bg2, t),
  ink: mix(a.ink, b.ink, t),
  sub: mix(a.sub, b.sub, t),
  accent: mix(a.accent, b.accent, t),
  accent2: mix(a.accent2, b.accent2, t),
  hi: mix(a.hi, b.hi, t),
  card: mix(a.card, b.card, t),
  line: mix(a.line, b.line, t),
  grain: a.grain + (b.grain - a.grain) * clamp01(t),
});

/** Deterministic pseudo-random in 0..1 from an integer seed. */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Phase within the music's beat, 0 on the downbeat. */
export const beatPhase = (t: number): number => {
  const b = (t - BEAT0) / BEAT;
  return b - Math.floor(b);
};

/** A soft pulse that peaks on every beat of the music bed. */
export const beatPulse = (t: number): number => {
  if (t < BEAT0) return 0;
  return Math.exp(-beatPhase(t) * 6);
};
