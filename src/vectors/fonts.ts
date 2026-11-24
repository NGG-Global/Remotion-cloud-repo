import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { EMOJI } from "./theme";

// Rubik (Hebrew + Latin) and Inter are registered by the project-wide loader.
import "../fonts";

/**
 * The emoji face is a subset of Noto Color Emoji (SIL OFL 1.1) holding only
 * the glyphs this video draws. Bundling it, rather than relying on whatever
 * emoji font the render machine happens to have, keeps a CI render identical
 * to a local one. Regenerate with tools/subset-emoji.sh after adding a glyph.
 */
void loadFont({
  family: EMOJI,
  url: staticFile("fonts/emoji/VectorsEmoji.ttf"),
  format: "truetype",
});
