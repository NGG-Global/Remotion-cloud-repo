import type React from "react";

/**
 * The contract every portrait act honours, mirroring the game's own `Vignette`:
 * the act is told when the action happens and when the round resolves, and decides
 * everything else itself.
 */
export type ActProps = {
  /** Contact instants in scene-local seconds. Contact is the beat, not the wind-up. */
  readonly hits: readonly number[];
  /** Scene-local second the payoff plays, if the shot runs long enough to show one. */
  readonly finish?: number;
};

/** An act as the montage and the mosaic consume it. */
export type ActEntry = {
  readonly id: string;
  readonly title: string;
  readonly line: string;
  readonly paper: string;
  readonly Graphic: React.FC<ActProps>;
};
