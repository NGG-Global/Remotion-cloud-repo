import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
// Frank Ruhl Libre (Hebrew serif) and Playfair Display are registered by the
// documentary series' font module; Rubik by the project's.
import "../doc/fonts";
import "../fonts";

export const JAPANESE = "Noto Serif JP";

/**
 * A subset of Noto Serif JP carrying only the eleven glyphs the film shows
 * (黒い雨, 被爆者, 山口 彊, 二重). Self-hosted like every other face here, so
 * a render never depends on a system CJK font being installed.
 */
void loadFont({
  family: JAPANESE,
  url: staticFile("fonts/NotoSerifJP-subset.woff2"),
  weight: "600",
  format: "woff2",
});
