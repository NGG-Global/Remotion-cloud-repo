import { useEffect, useState } from "react";
import { loadFont } from "@remotion/fonts";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import { BODY, DISPLAY } from "./theme";

/**
 * Fredoka and Nunito, the game's own faces, from `public/fonts` (OFL files beside them).
 *
 * Loaded through a hook rather than a side-effect import: `package.json` declares
 * `"sideEffects": ["*.css"]`, so the bundler drops any TypeScript module imported only
 * for what it does on load — and a bare `import "./fonts"` rendered every word in the
 * browser's fallback serif. Each frame waits until both faces are in.
 */
let loading: Promise<unknown> | null = null;

const loadFaces = (): Promise<unknown> => {
  loading ??= Promise.all([
    loadFont({
      family: DISPLAY,
      url: staticFile("fonts/fredoka/Fredoka.ttf"),
      weight: "300 700",
      format: "truetype",
    }),
    loadFont({
      family: BODY,
      url: staticFile("fonts/nunito/Nunito.ttf"),
      weight: "200 1000",
      format: "truetype",
    }),
  ]);
  return loading;
};

export const useTrailerFonts = (): void => {
  const [handle] = useState(() => delayRender("Loading Fredoka and Nunito"));
  useEffect(() => {
    loadFaces().then(
      () => continueRender(handle),
      (error: unknown) => cancelRender(error),
    );
  }, [handle]);
};
