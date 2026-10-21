import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** Hebrew and Latin text. Rubik's rounded forms suit the playful tone. */
export const HEBREW = "Rubik";
/** Latin display for the big English words (R, Python, RStudio). */
export const DISPLAY = "Fredoka";
/** Monospace for code, self-hosted (Apache 2.0, see public/fonts/jetbrains-mono). */
export const MONO =
  '"JetBrains Mono", "Fira Mono", "DejaVu Sans Mono", "Menlo", monospace';

void loadFont({
  family: HEBREW,
  url: staticFile("fonts/Rubik-hebrew-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F",
});

void loadFont({
  family: HEBREW,
  url: staticFile("fonts/Rubik-latin-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
});

void loadFont({
  family: DISPLAY,
  url: staticFile("fonts/fredoka/Fredoka.ttf"),
  weight: "300 700",
  format: "truetype",
});

void loadFont({
  family: "JetBrains Mono",
  url: staticFile("fonts/jetbrains-mono/JetBrainsMono-Regular.ttf"),
  weight: "400",
  format: "truetype",
});

void loadFont({
  family: "JetBrains Mono",
  url: staticFile("fonts/jetbrains-mono/JetBrainsMono-Bold.ttf"),
  weight: "700",
  format: "truetype",
});
