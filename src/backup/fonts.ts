import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONT } from "./theme";

/**
 * Self-hosted, like every other video in the repo, so a render never depends
 * on a font host. Registered under their own family names: the layout reads
 * glyph widths from data/metrics.ts, which were taken from these exact files.
 *
 * A function rather than a side-effect import: package.json declares only
 * CSS as having side effects, so the bundler drops `import "./fonts"`.
 */
let loaded = false;

export const loadBackupFonts = (): void => {
  if (loaded) return;
  loaded = true;

  const HEBREW =
    "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F";
  const LATIN =
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

  void loadFont({
    family: FONT.display,
    url: staticFile("fonts/karantina/Karantina-Bold.ttf"),
    weight: "700",
    format: "truetype",
  });

  void loadFont({
    family: FONT.sans,
    url: staticFile("fonts/Rubik-hebrew-variable.woff2"),
    weight: "300 900",
    format: "woff2",
    unicodeRange: HEBREW,
  });

  void loadFont({
    family: FONT.sans,
    url: staticFile("fonts/Rubik-latin-variable.woff2"),
    weight: "300 900",
    format: "woff2",
    unicodeRange: LATIN,
  });

  void loadFont({
    family: FONT.serif,
    url: staticFile("fonts/FrankRuhlLibre-hebrew-variable.woff2"),
    weight: "300 900",
    format: "woff2",
    unicodeRange: HEBREW,
  });

  void loadFont({
    family: FONT.serif,
    url: staticFile("fonts/FrankRuhlLibre-latin-variable.woff2"),
    weight: "300 900",
    format: "woff2",
    unicodeRange: LATIN,
  });
};
