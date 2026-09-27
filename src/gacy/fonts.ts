import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { TYPE } from "./theme";

/**
 * Same self-hosted faces as the rest of the repo. Rubik carries short Hebrew
 * labels (it stays legible at caption size); Frank Ruhl Libre is the
 * documentary serif; Playfair is for the few Latin names and years.
 */
void loadFont({
  family: TYPE.hebrew,
  url: staticFile("fonts/Rubik-hebrew-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F",
});

void loadFont({
  family: TYPE.hebrew,
  url: staticFile("fonts/Rubik-latin-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
});

void loadFont({
  family: TYPE.serif,
  url: staticFile("fonts/FrankRuhlLibre-hebrew-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F",
});

void loadFont({
  family: TYPE.serif,
  url: staticFile("fonts/FrankRuhlLibre-latin-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
});

void loadFont({
  family: TYPE.latin,
  url: staticFile("fonts/PlayfairDisplay-latin-variable.woff2"),
  weight: "400 900",
  format: "woff2",
});
