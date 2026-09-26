import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, ramp } from "./time";

/**
 * A shot's local clock.
 *
 * A shot is placed at its narration start (`at`). When it dissolves in, its
 * Sequence begins a little earlier, but `t` still reads 0 at `at`, so
 * every beat inside the shot stays written against the voice.
 */

type ShotClock = { lead: number; len: number };

const ShotCtx = createContext<ShotClock>({ lead: 0, len: 1 });

export const ShotClockProvider: React.FC<{
  readonly lead: number;
  readonly len: number;
  readonly children: React.ReactNode;
}> = ({ lead, len, children }) => (
  <ShotCtx.Provider value={{ lead, len }}>{children}</ShotCtx.Provider>
);

/**
 * `t`: seconds since the shot's narration start (negative during a lead-in).
 * `dur`: seconds from that start to the next shot's start.
 */
export const useShot = (): { t: number; dur: number; frame: number; fps: number } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { lead, len } = useContext(ShotCtx);
  return { t: frame / fps - lead, dur: len, frame, fps };
};

export type Enter =
  | { readonly kind: "cut" }
  /** Cross-dissolve over `s` seconds, centred on the cut. */
  | { readonly kind: "dissolve"; readonly s: number }
  /** Fade up from black over `s` seconds, starting at the cut. */
  | { readonly kind: "fromBlack"; readonly s: number };

export type Exit =
  | { readonly kind: "cut" }
  /** Fade to black over the last `s` seconds. */
  | { readonly kind: "toBlack"; readonly s: number };

/** Wraps a shot's picture with its entrance and exit. */
export const ShotFrame: React.FC<{
  readonly enter: Enter;
  readonly exit: Exit;
  readonly children: React.ReactNode;
}> = ({ enter, exit, children }) => {
  const { t, dur } = useShot();
  let opacity = 1;
  if (enter.kind === "dissolve") {
    opacity = ramp(t, -enter.s / 2, enter.s / 2, EASE.inOut);
  }
  let black = 0;
  if (enter.kind === "fromBlack") {
    black = Math.max(black, 1 - ramp(t, 0, enter.s, EASE.out));
  }
  if (exit.kind === "toBlack") {
    black = Math.max(black, ramp(t, dur - exit.s, dur, EASE.in));
  }
  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
      {black > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: black }} /> : null}
    </AbsoluteFill>
  );
};
