import {
  PROJECT_ATTRIBUTION,
  PROJECT_LICENSE,
  RIVE_SAMPLE_LICENSE,
} from "./meta";
import type {
  AudioAssetDefinition,
  CharacterAsset,
  ImageRendererAsset,
  LottieAssetDefinition,
  RiveAssetDefinition,
  VideoAssetDefinition,
} from "./types";

/**
 * File-backed assets. `scripts/add-asset.ts` inserts new entries above the
 * matching `// @insert <group>` marker. Keep those markers.
 */

export const backgrounds = {
  suburbanExterior: {
    id: "suburban-exterior",
    type: "background",
    renderer: "image",
    src: "assets/backgrounds/suburban-exterior.svg",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    anchor: "center",
    defaultScale: 1,
    tags: ["house", "day", "exterior", "suburban"],
    description:
      "Daytime suburban house, lawn, and street. Full-frame illustration.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  suburbanHouseNight: {
    id: "suburban-house-night",
    type: "background",
    renderer: "image",
    src: "assets/backgrounds/suburban-house-night.svg",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    anchor: "center",
    defaultScale: 1,
    tags: ["house", "night", "exterior", "suburban"],
    description: "The same suburban house at night, with lit windows.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  livingRoom: {
    id: "living-room",
    type: "background",
    renderer: "image",
    src: "assets/backgrounds/living-room.svg",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    anchor: "center",
    defaultScale: 1,
    tags: ["interior", "day", "living-room", "house"],
    description: "Living room with a sofa, window, and wooden floor.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  houseInteriorNight: {
    id: "house-interior-night",
    type: "background",
    renderer: "image",
    src: "assets/backgrounds/house-interior-night.svg",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    anchor: "center",
    defaultScale: 1,
    tags: ["interior", "night", "living-room", "house"],
    description: "Living room at night, lit by a lamp, with a dark window.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  // @insert backgrounds
} as const satisfies Record<string, ImageRendererAsset>;

export const props = {
  telephone: {
    id: "telephone",
    type: "prop",
    renderer: "image",
    src: "assets/props/telephone.svg",
    width: 280,
    height: 200,
    aspectRatio: 280 / 200,
    anchor: "bottom-center",
    defaultScale: 1,
    tags: ["phone", "desk", "prop"],
    description:
      "Desktop telephone. Anchor is the bottom center, so y is where it sits.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  woodenTable: {
    id: "wooden-table",
    type: "prop",
    renderer: "image",
    src: "assets/props/wooden-table.svg",
    width: 560,
    height: 300,
    aspectRatio: 560 / 300,
    anchor: "bottom-center",
    defaultScale: 1,
    tags: ["table", "wood", "furniture", "prop"],
    description: "Wooden table. Anchor is the bottom of the legs.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  // @insert props
} as const satisfies Record<string, ImageRendererAsset>;

export const lottie = {
  dustParticles: {
    id: "dust-particles",
    type: "lottie",
    renderer: "lottie",
    src: "assets/lottie/dust-particles.json",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    anchor: "center",
    defaultScale: 1,
    animations: ["drift"],
    placement: "fullscreen",
    defaultLoop: true,
    tags: ["dust", "particles", "lottie", "overlay"],
    description: "Local Lottie of drifting dust motes. No network fetch.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  // @insert lottie
} as const satisfies Record<string, LottieAssetDefinition>;

export const rive = {
  vehicles: {
    id: "vehicles",
    type: "rive",
    renderer: "rive",
    src: "assets/rive/vehicles.riv",
    width: 640,
    height: 480,
    aspectRatio: 640 / 480,
    anchor: "center",
    defaultScale: 1,
    artboard: "Truck",
    animations: ["idle", "bouncing", "windshield_wipers", "broken"],
    stateMachines: ["bumpy"],
    placement: "anchored",
    tags: ["rive", "vehicle", "sample", "truck"],
    description:
      "Rive sample of a truck. Not a person. State machine 'bumpy' is listed but this wrapper plays linear animations only.",
    variants: [],
    attribution: {
      creator: "unknown",
      sourceUrl: "https://cdn.rive.app/animations/vehicles.riv",
    },
    license: RIVE_SAMPLE_LICENSE,
    optional: false,
  },
  // @insert rive
} as const satisfies Record<string, RiveAssetDefinition>;

export const overlays = {
  vignette: {
    id: "vignette",
    type: "overlay",
    renderer: "image",
    src: "assets/overlays/vignette.svg",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    anchor: "center",
    defaultScale: 1,
    tags: ["overlay", "vignette", "grade"],
    description: "Soft full-frame vignette. Place it above the scene.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  // @insert overlays
} as const satisfies Record<string, ImageRendererAsset>;

export const textures = {
  dotGrid: {
    id: "dot-grid",
    type: "texture",
    renderer: "image",
    src: "assets/textures/dot-grid.svg",
    width: 256,
    height: 256,
    aspectRatio: 1,
    anchor: "center",
    defaultScale: 1,
    tags: ["texture", "grid", "tile"],
    description: "Tileable dot grid for floors or graphic backgrounds.",
    variants: [],
    attribution: PROJECT_ATTRIBUTION,
    license: PROJECT_LICENSE,
    optional: false,
  },
  // @insert textures
} as const satisfies Record<string, ImageRendererAsset>;

export const fileCharacters = {
  // @insert characters
} as const satisfies Record<string, CharacterAsset>;

export const audio = {
  // @insert audio
} as const satisfies Record<string, AudioAssetDefinition>;

export const videos = {
  // @insert videos
} as const satisfies Record<string, VideoAssetDefinition>;
