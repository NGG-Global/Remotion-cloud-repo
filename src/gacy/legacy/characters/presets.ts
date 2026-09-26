/**
 * Character appearance lives here.
 *
 * Scenes spread these objects into `<Character />`. Change a palette, a
 * hairline, or a body type once and every shot that uses the preset follows.
 * Gacy stays an ordinary heavyset man. The clown outfit is a separate preset
 * and should stay rare.
 */
import type { ComponentProps } from "react";
import { Character } from "./Character";

type Look = Partial<ComponentProps<typeof Character>>;

export const GACY: Look = {
  hair: "gacy",
  hairColor: "#241910",
  body: "stocky",
  skin: "#e0b08a",
  outfit: "casual70s",
  outfitColor: "#5c5348",
  expression: "smile",
};

export const GACY_SUIT: Look = {
  ...GACY,
  outfit: "suit",
  outfitColor: "#3a403c",
  expression: "neutral",
};

export const GACY_WORK: Look = {
  ...GACY,
  outfit: "work",
  outfitColor: "#8a5e38",
};

export const GACY_POGO: Look = {
  ...GACY,
  outfit: "pogo",
  expression: "smile",
};

export const WORKER: Look = {
  hair: "teen",
  hairColor: "#3a2a1c",
  body: "slim",
  skin: "#d7a67e",
  outfit: "work",
  outfitColor: "#6e533c",
  expression: "neutral",
};

export const PIEST: Look = {
  hair: "teen",
  hairColor: "#6a4a30",
  body: "slim",
  skin: "#e6bc98",
  outfit: "apron",
  expression: "neutral",
};

export const MOTHER: Look = {
  hair: "long",
  hairColor: "#3a2c24",
  body: "average",
  presentation: "fem",
  skin: "#e4b896",
  outfit: "coat",
  outfitColor: "#6a403c",
  expression: "uneasy",
};

export const DETECTIVE: Look = {
  hair: "side",
  hairColor: "#2a241c",
  body: "average",
  skin: "#c99674",
  outfit: "detective",
  expression: "serious",
};

export const OFFICER: Look = {
  hair: "buzz",
  hairColor: "#1c1814",
  body: "average",
  skin: "#d2a484",
  outfit: "police",
  expression: "serious",
};

export const NEIGHBOR: Look = {
  hair: "short",
  hairColor: "#3a3028",
  body: "average",
  skin: "#e0b48e",
  outfit: "neighbor",
  expression: "smile",
};

export const ATTORNEY: Look = {
  hair: "side",
  hairColor: "#2c241c",
  body: "average",
  skin: "#d7b094",
  outfit: "suit",
  expression: "serious",
};

export const JUDGE: Look = {
  hair: "gray",
  hairColor: "#8a8680",
  body: "average",
  skin: "#d2b09a",
  outfit: "robe",
  expression: "serious",
};
