import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { HI, LOW, RMS } from "./envelope";

/**
 * Sequences rebase `useCurrentFrame()` to their own start, which is what the
 * scenes want. The music, though, runs on the composition clock, so anything
 * that listens to it (the kick pulse, the hat shimmer) reads the absolute
 * frame from this context instead.
 */
const AbsoluteFrameContext = createContext<number>(0);

export const AbsoluteFrameProvider: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFrameContext.Provider value={frame}>
      {children}
    </AbsoluteFrameContext.Provider>
  );
};

export const useAbsoluteFrame = (): number => useContext(AbsoluteFrameContext);

const at = (table: readonly number[], frame: number): number =>
  table[Math.max(0, Math.min(table.length - 1, Math.round(frame)))] ?? 0;

/** Loudness of the music at the current composition frame, 0..1. */
export const useMusic = () => {
  const frame = useAbsoluteFrame();
  return {
    frame,
    time: frame / 30,
    low: at(LOW, frame),
    rms: at(RMS, frame),
    hi: at(HI, frame),
  };
};
