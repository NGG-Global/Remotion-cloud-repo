/**
 * Design tokens for "Faces of Evil: Ted Bundy". The Hiroshima film's tokens
 * with a colder accent: a muted red used for the maps' markers, the chapter
 * rule and the few figures that matter.
 */
import { H } from "../hiroshima/theme";

export {
  clamp01,
  DISSOLVE,
  easeIn,
  easeInOut,
  easeOut,
  FORMAT,
  hash,
  mix,
  ramp,
  SANS,
  seconds,
  SERIF,
  SERIF_LATIN,
} from "../hiroshima/theme";

export const B = {
  ...H,
  ember: "#c9483b",
  emberHot: "#ff8f78",
  emberDeep: "#5a1a14",
  sea: "#0b0d10",
  land: "#22211f",
  coast: "#6f6a60",
  state: "rgba(239,232,218,0.14)",
} as const;
