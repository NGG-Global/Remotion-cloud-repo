import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { BODY, DISPLAY } from "./theme";

/**
 * Fredoka and Nunito are the game's own faces, bundled under the OFL beside
 * the files. Loaded from `public/` so a render never fetches a font host.
 */
void loadFont({
  family: DISPLAY,
  url: staticFile("fonts/fredoka/Fredoka.ttf"),
  weight: "300 700",
  format: "truetype",
});

void loadFont({
  family: BODY,
  url: staticFile("fonts/nunito/Nunito.ttf"),
  weight: "200 1000",
  format: "truetype",
});
