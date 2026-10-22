/**
 * Real gameplay, captured from the game itself.
 *
 * Every clip in `public/footage/` is the shipped game running headless on its
 * own dev server, driven by its development replay (every tap landing on the
 * beat), screencast at 1080x1920 and resampled to 30 fps — see
 * `tools/tiny-tempo-capture.mjs`. Each file is then cut by
 * `tools/tiny-tempo-trim.mjs` so that it begins `HANDLE` seconds before the
 * beat the ad lands it on: a level's downbeat, the plaque's drop, the first
 * flick of the road.
 */

/** Seconds of lead each trimmed file carries before its in-point. */
export const HANDLE = 0.5;

export type Shot = {
  readonly file: string;
  /** What the sticker says: the act's own title from the game's registry. */
  readonly title: string;
};

export const SHOTS = {
  hammer: { file: "footage/hammer.mp4", title: "Hammer & nail" },
  result: { file: "footage/result.mp4", title: "Cleared" },
  road: { file: "footage/road.mp4", title: "The road" },
  gate: { file: "footage/gate.mp4", title: "Area gate" },
} as const satisfies Record<string, Shot>;

/**
 * The montage, in the order it cuts. Each clip starts `HANDLE` seconds before the
 * act's response downbeat, so cutting on an ad bar line lands on a judged hit.
 */
export const MONTAGE: readonly Shot[] = [
  { file: "footage/tomato.mp4", title: "Knife & tomato" },
  { file: "footage/bubble.mp4", title: "Bubble wrap" },
  { file: "footage/trombone.mp4", title: "Trombone" },
  { file: "footage/popcorn.mp4", title: "Popcorn" },
  { file: "footage/scratch.mp4", title: "DJ scratch" },
  { file: "footage/frog.mp4", title: "Frog & lily pad" },
  { file: "footage/icecream.mp4", title: "Ice cream" },
  { file: "footage/camera.mp4", title: "Snapshot" },
  { file: "footage/scissors.mp4", title: "Scissors & paper" },
];

/** The fourteen areas, in road order, as the map names them. */
export const AREAS = [
  "Grass",
  "Pavement",
  "Sand",
  "Snow",
  "Dusk",
  "Garden",
  "Swamp",
  "Village",
  "Castle",
  "Space",
  "Candy",
  "Haunted",
  "Hollywood",
  "Art Deco",
] as const;
