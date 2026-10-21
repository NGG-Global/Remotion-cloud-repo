import { sec } from "./theme";

export type Beat<Id extends string = string> = {
  readonly at: number;
  readonly id: Id;
};

/**
 * Looks up scene placement on the narration. Lengths are derived from the gap
 * to the next beat, so retiming one beat never leaves two scenes overlapping.
 */
export const timeline = <const B extends readonly Beat[]>(
  beats: B,
  totalSeconds: number,
) => {
  type Id = B[number]["id"];
  const index = (id: Id) => {
    const i = beats.findIndex((b) => b.id === id);
    if (i < 0) throw new Error(`Unknown beat: ${id}`);
    return i;
  };
  return {
    totalSeconds,
    at: (id: Id) => beats[index(id)].at,
    length: (id: Id) => {
      const i = index(id);
      const next = beats[i + 1]?.at ?? totalSeconds;
      return next - beats[i].at;
    },
    frames: (id: Id) => sec(beats[index(id)].at),
  };
};
