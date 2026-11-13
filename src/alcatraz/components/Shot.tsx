import React from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../theme";

/**
 * The narration second at which the current shot begins. Shots never span an
 * insert, so inside a shot narration time advances with the frame and a
 * graphic can cue its beats by the second of the voice they belong to.
 */
export const ShotClock = React.createContext<number>(0);

/** Current narration second. */
export const useNarr = (): number => {
  const at = React.useContext(ShotClock);
  const frame = useCurrentFrame();
  return at + frame / FPS;
};
