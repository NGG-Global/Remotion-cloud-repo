import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../theme";
import { narrAt } from "./timeline";

type ShotInfo = {
  /** Film second the shot starts at. */
  readonly start: number;
  /** Film seconds the shot is on screen (including any overlap). */
  readonly dur: number;
};

const Ctx = createContext<ShotInfo>({ start: 0, dur: 1 });

export const ShotProvider: React.FC<
  ShotInfo & { readonly children: React.ReactNode }
> = ({ start, dur, children }) => (
  <Ctx.Provider value={{ start, dur }}>{children}</Ctx.Provider>
);

/**
 * Inside a shot: `t` is film seconds since the shot started, `n` is the
 * narration time being heard right now. Graphics key their beats to `n`, so
 * a label lands on the word that names it, e.g. `ramp(n, 349.6, 350.1)`.
 */
export const useShot = (): {
  t: number;
  n: number;
  dur: number;
  film: number;
  frame: number;
} => {
  const { start, dur } = useContext(Ctx);
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const film = start + t;
  return { t, n: narrAt(film), dur, film, frame };
};
