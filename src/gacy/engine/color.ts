/**
 * Small colour math so a scene can light its characters and props without
 * SVG filters. Filters re-rasterise every frame; mixing hex values in
 * JavaScript costs nothing at render time.
 */

const parse = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (r: number, g: number, b: number): string => {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
};

/** Linear mix of two hex colours. `k = 0` is `a`, `k = 1` is `b`. */
export const mix = (a: string, b: string, k: number): string => {
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return toHex(r1 + (r2 - r1) * k, g1 + (g2 - g1) * k, b1 + (b2 - b1) * k);
};

/** Multiply a colour toward black. `k` is how much darker (0–1). */
export const darken = (c: string, k: number): string => mix(c, "#000000", k);

/** Toward white. */
export const lighten = (c: string, k: number): string => mix(c, "#ffffff", k);

/** Channel-wise multiply, like light of colour `light` falling on `c`. */
export const multiply = (c: string, light: string): string => {
  const [r1, g1, b1] = parse(c);
  const [r2, g2, b2] = parse(light);
  return toHex((r1 * r2) / 255, (g1 * g2) / 255, (b1 * b2) / 255);
};

/** Luminance-preserving desaturation, `k = 1` is grey. */
export const desaturate = (c: string, k: number): string => {
  const [r, g, b] = parse(c);
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  return toHex(r + (y - r) * k, g + (y - g) * k, b + (y - b) * k);
};

/**
 * Scene light applied to a base colour: tinted by the key light, pulled
 * toward the ambient colour by `amb`. One function, used by every prop and
 * every person, is what makes a set read as one place.
 */
export type Light = {
  /** Colour of the dominant light falling on the plane. */
  readonly key: string;
  /** Colour the shadows sink toward. */
  readonly ambient: string;
  /** 0 = fully lit by key, 1 = fully in ambient. */
  readonly amb: number;
  /** Optional desaturation for night scenes. */
  readonly desat?: number;
};

export const NEUTRAL: Light = { key: "#ffffff", ambient: "#000000", amb: 0 };

export const lit = (c: string, light: Light = NEUTRAL): string => {
  const keyed = multiply(c, light.key);
  const base = light.desat ? desaturate(keyed, light.desat) : keyed;
  return mix(base, light.ambient, light.amb);
};
