export { ASSETS } from "./assets/registry";
export type {
  ActionsFor,
  AnimationId,
  BackgroundId,
  CharacterId,
  CharacterKey,
  LottieId,
  OverlayId,
  PropId,
  RiveAnimationsFor,
  RiveId,
  TextureId,
} from "./assets/registry";

export { Animation } from "./components/assets/Animation";
export { Background } from "./components/assets/Background";
export { Character } from "./components/assets/Character";
export { ImageAsset } from "./components/assets/ImageAsset";
export { LottieAsset } from "./components/assets/LottieAsset";
export { Prop } from "./components/assets/Prop";
export { RiveAsset } from "./components/assets/RiveAsset";

export { Camera } from "./scene/Camera";
export { Layer } from "./scene/Layer";
export { Scene } from "./scene/Scene";

export {
  cameraMotion,
  cameraPresets,
  entrances,
  exits,
  movement,
} from "./animation/presets";
export type { CameraPresetName, CameraVector } from "./animation/presets";
