import { AssetError, knownIds } from "./errors";
import {
  ASSETS,
  type AnimationId,
  type BackgroundId,
  type CharacterId,
  type LottieId,
  type PropId,
  type RiveId,
} from "./registry";

const findById = <T extends { readonly id: string }>(
  group: Record<string, T>,
  id: string,
): T | undefined => Object.values(group).find((asset) => asset.id === id);

export const getCharacter = (id: CharacterId) => {
  const asset = findById(ASSETS.characters, id);
  if (!asset) {
    throw new AssetError(
      "Character",
      id,
      `unknown character. Known ids: ${knownIds(ASSETS.characters)}`,
    );
  }
  return asset;
};

export const getBackground = (id: BackgroundId) => {
  const asset = findById(ASSETS.backgrounds, id);
  if (!asset) {
    throw new AssetError(
      "Background",
      id,
      `unknown background. Known ids: ${knownIds(ASSETS.backgrounds)}`,
    );
  }
  return asset;
};

export const getProp = (id: PropId) => {
  const asset = findById(ASSETS.props, id);
  if (!asset) {
    throw new AssetError(
      "Prop",
      id,
      `unknown prop. Known ids: ${knownIds(ASSETS.props)}`,
    );
  }
  return asset;
};

export const getLottie = (id: LottieId) => {
  const asset = findById(ASSETS.lottie, id);
  if (!asset) {
    throw new AssetError(
      "LottieAsset",
      id,
      `unknown Lottie animation. Known ids: ${knownIds(ASSETS.lottie)}`,
    );
  }
  return asset;
};

export const getRive = (id: RiveId) => {
  const asset = findById(ASSETS.rive, id);
  if (!asset) {
    throw new AssetError(
      "RiveAsset",
      id,
      `unknown Rive file. Known ids: ${knownIds(ASSETS.rive)}`,
    );
  }
  return asset;
};

export const getAnimation = (id: AnimationId) => {
  const asset = findById(ASSETS.animations, id);
  if (!asset) {
    throw new AssetError(
      "Animation",
      id,
      `unknown animation. Known ids: ${knownIds(ASSETS.animations)}`,
    );
  }
  return asset;
};
