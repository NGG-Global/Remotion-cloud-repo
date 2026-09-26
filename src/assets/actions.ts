/**
 * Every pose name the library understands.
 *
 * A character may implement only a subset. Do not pass a name that the
 * character's `actions` list does not include.
 */
export const CHARACTER_ACTIONS = [
  "idle",
  "walk",
  "run",
  "talk",
  "lookLeft",
  "lookRight",
  "point",
  "sit",
  "scared",
  "surprised",
  "crouch",
] as const;

export type CharacterAction = (typeof CHARACTER_ACTIONS)[number];

/** Poses the vector rig actually draws. Kept in lockstep with the switch in `pose.ts`. */
export const IMPLEMENTED_VECTOR_ACTIONS = [
  "idle",
  "walk",
  "run",
  "talk",
  "lookLeft",
  "lookRight",
  "point",
  "sit",
  "scared",
  "surprised",
  "crouch",
] as const satisfies readonly CharacterAction[];
