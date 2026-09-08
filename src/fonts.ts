import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Typography is self-hosted from `public/fonts` on purpose.
 *
 * `@remotion/google-fonts` fetches the font files over the network while the
 * frame is being rendered. That makes every render depend on an outside host
 * being reachable, and a renderer behind a proxy or an offline CI runner either
 * fails outright or silently falls back to a different face — which changes the
 * output. Serving the files from `public/` keeps renders deterministic and
 * network-free.
 *
 * `loadFont()` registers a `delayRender()` internally and releases it once the
 * face is ready, so no frame is captured before the font is available.
 */

/** Hebrew and Latin display face. Carries the narration's on-screen text. */
export const fontFamily = "Rubik";

/** Latin-only face, used for UI chrome labels quoted from the Claude interface. */
export const uiFontFamily = "Inter";

/**
 * Rubik ships one file per script. Both are registered under the same family
 * with the unicode range they cover, so the browser picks the right file per
 * character — the same arrangement Google Fonts serves. Without the Hebrew
 * file, Hebrew text falls back to a system face and the design breaks.
 */
void loadFont({
  family: fontFamily,
  url: staticFile("fonts/Rubik-hebrew-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F",
});

void loadFont({
  family: fontFamily,
  url: staticFile("fonts/Rubik-latin-variable.woff2"),
  weight: "300 900",
  format: "woff2",
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
});

void loadFont({
  family: uiFontFamily,
  url: staticFile("fonts/Inter-latin-variable.woff2"),
  weight: "100 900",
  format: "woff2",
});
