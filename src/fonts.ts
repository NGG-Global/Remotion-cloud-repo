import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Typography is self-hosted from `public/fonts` on purpose.
 *
 * `@remotion/google-fonts` fetches the font files over the network while the
 * frame is being rendered. That makes every render depend on an outside host
 * being reachable, and a renderer behind a proxy or an offline CI runner either
 * fails outright or silently falls back to a different face — which changes the
 * output. Serving the file from `public/` keeps renders deterministic and
 * network-free.
 *
 * `loadFont()` registers a `delayRender()` internally and releases it once the
 * face is ready, so no frame is captured before the font is available.
 */
export const fontFamily = "Inter";

void loadFont({
  family: fontFamily,
  url: staticFile("fonts/Inter-latin-variable.woff2"),
  // Inter is a variable font, so a single file covers the whole axis.
  // Declaring the range lets the browser serve 400, 600 and 800 from it.
  weight: "100 900",
  format: "woff2",
});
