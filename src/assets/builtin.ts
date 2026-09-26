import { IMPLEMENTED_VECTOR_ACTIONS } from "./actions";
import { PROJECT_ATTRIBUTION, PROJECT_LICENSE } from "./meta";
import type {
  CharacterAsset,
  DoorAnimationAsset,
  OverlayFogAsset,
} from "./types";

const vectorActions = IMPLEMENTED_VECTOR_ACTIONS;

export const vectorCharacters = {
  genericMan: {
    id: "generic-male",
    type: "character",
    renderer: "vector",
    costume: "civilian",
    src: null,
    width: 240,
    height: 420,
    aspectRatio: 240 / 420,
    anchor: "bottom-center",
    defaultScale: 1,
    actions: vectorActions,
    animations: vectorActions,
    states: [],
    tags: ["person", "male", "civilian", "vector"],
    description:
      "Original vector man. Feet are the anchor. Actions are poses on this rig, not a separate clip.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  policeOfficer: {
    id: "police-officer",
    type: "character",
    renderer: "vector",
    costume: "police",
    src: null,
    width: 240,
    height: 420,
    aspectRatio: 240 / 420,
    anchor: "bottom-center",
    defaultScale: 1,
    actions: vectorActions,
    animations: vectorActions,
    states: [],
    tags: ["person", "police", "uniform", "vector"],
    description:
      "Same vector rig as generic-male, with a police uniform, hat, and badge. Supports the same poses because the rig draws them.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
} as const satisfies Record<string, CharacterAsset>;

export const fogAnimation = {
  id: "fog",
  type: "animation",
  renderer: "overlay-fog",
  src: "fog/cloud-0.png",
  sources: ["fog/cloud-0.png", "fog/cloud-1.png", "fog/cloud-2.png"],
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
  anchor: "center",
  defaultScale: 1,
  animations: ["drift"],
  placement: "fullscreen",
  tags: ["fog", "overlay", "foreground", "weather"],
  description:
    "Foreground fog made from the local cloud tiles in public/fog. Place it in a high layer over a scene.",
  variants: [],
  attribution: {
    creator: "Project original",
    sourceUrl: undefined,
  },
  license: {
    name: "Original",
    notes:
      "Cloud tiles already in public/fog, generated as periodic value noise for this repository.",
  },
  optional: false,
} as const satisfies OverlayFogAsset;

export const doorAnimation = {
  id: "door-opening",
  type: "animation",
  renderer: "procedural-door",
  src: null,
  width: 420,
  height: 480,
  aspectRatio: 420 / 480,
  anchor: "bottom-center",
  defaultScale: 1,
  animations: ["open"],
  placement: "anchored",
  tags: ["door", "prop", "procedural"],
  description:
    "A door swinging open on its hinge. Drawn with @remotion/shapes and @remotion/paths. Anchor is the bottom center of the frame.",
  variants: [],
  attribution: PROJECT_ATTRIBUTION,
  license: PROJECT_LICENSE,
  optional: false,
} as const satisfies DoorAnimationAsset;
