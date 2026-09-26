import { doorAnimation, fogAnimation, vectorCharacters } from "./builtin";
import {
  audio,
  backgrounds,
  fileCharacters,
  lottie,
  overlays,
  props,
  rive,
  textures,
  videos,
} from "./file-assets";

const mergeAssets = <
  A extends Record<string, unknown>,
  B extends Record<string, unknown>,
>(
  left: A,
  right: B,
): A & B => ({ ...left, ...right });

export const characters = mergeAssets(vectorCharacters, fileCharacters);

/**
 * Animations agents should reach for by id.
 * Lottie and fog entries are the same objects as in their source groups.
 */
export const animations = {
  fog: fogAnimation,
  dustParticles: lottie.dustParticles,
  doorOpening: doorAnimation,
} as const;

export const ASSETS = {
  characters,
  backgrounds,
  props,
  animations,
  rive,
  lottie,
  textures,
  overlays,
  audio,
  videos,
} as const;

export type CharacterKey = keyof typeof characters;
export type CharacterId = (typeof characters)[CharacterKey]["id"];

type CharacterEntry<Id extends CharacterId> = Extract<
  (typeof characters)[CharacterKey],
  { readonly id: Id }
>;

export type ActionsFor<Id extends CharacterId> =
  CharacterEntry<Id>["actions"][number];

export type BackgroundId = (typeof backgrounds)[keyof typeof backgrounds]["id"];
export type PropId = (typeof props)[keyof typeof props]["id"];
export type LottieId = (typeof lottie)[keyof typeof lottie]["id"];
export type RiveId = (typeof rive)[keyof typeof rive]["id"];
export type AnimationId = (typeof animations)[keyof typeof animations]["id"];
export type OverlayId = (typeof overlays)[keyof typeof overlays]["id"];
export type TextureId = (typeof textures)[keyof typeof textures]["id"];

type RiveEntry<Id extends RiveId> = Extract<
  (typeof rive)[keyof typeof rive],
  { readonly id: Id }
>;

export type RiveAnimationsFor<Id extends RiveId> =
  RiveEntry<Id>["animations"][number];
