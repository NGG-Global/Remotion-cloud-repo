import type { CharacterAction } from "./actions";

export type LicenseInfo = {
  readonly name: string;
  readonly url?: string;
  readonly notes?: string;
};

export type Attribution = {
  readonly creator: string;
  readonly sourceUrl?: string;
};

export type AssetVariant = {
  readonly id: string;
  readonly description: string;
  readonly src?: string;
};

export type Anchor =
  | "center"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-center";

type AssetBase = {
  readonly id: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly attribution: Attribution;
  readonly license: LicenseInfo;
  readonly optional?: boolean;
  readonly variants: readonly AssetVariant[];
};

export type ImageRendererAsset = AssetBase & {
  readonly type: "background" | "prop" | "overlay" | "texture";
  readonly renderer: "image";
  readonly src: string;
  readonly sources?: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly anchor: Anchor;
  readonly defaultScale: number;
};

export type CharacterAsset = AssetBase & {
  readonly type: "character";
  readonly renderer: "vector" | "rive";
  readonly costume: "civilian" | "police";
  readonly src: string | null;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly anchor: "bottom-center";
  readonly defaultScale: number;
  readonly actions: readonly CharacterAction[];
  readonly animations: readonly string[];
  readonly states: readonly string[];
  readonly artboard?: string;
  readonly stateMachines?: readonly string[];
};

export type LottieAssetDefinition = AssetBase & {
  readonly type: "lottie";
  readonly renderer: "lottie";
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly anchor: Anchor;
  readonly defaultScale: number;
  readonly animations: readonly string[];
  readonly placement: "fullscreen" | "anchored";
  readonly defaultLoop: boolean;
};

export type RiveAssetDefinition = AssetBase & {
  readonly type: "rive";
  readonly renderer: "rive";
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly anchor: Anchor;
  readonly defaultScale: number;
  readonly artboard: string;
  readonly animations: readonly string[];
  readonly stateMachines: readonly string[];
  readonly placement: "fullscreen" | "anchored";
};

export type OverlayFogAsset = AssetBase & {
  readonly type: "animation";
  readonly renderer: "overlay-fog";
  readonly src: string;
  readonly sources: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly anchor: "center";
  readonly defaultScale: number;
  readonly animations: readonly string[];
  readonly placement: "fullscreen";
};

export type DoorAnimationAsset = AssetBase & {
  readonly type: "animation";
  readonly renderer: "procedural-door";
  readonly src: null;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly anchor: "bottom-center";
  readonly defaultScale: number;
  readonly animations: readonly string[];
  readonly placement: "anchored";
};

export type AudioAssetDefinition = AssetBase & {
  readonly type: "audio";
  readonly renderer: "audio";
  readonly src: string;
  readonly width: null;
  readonly height: null;
  readonly aspectRatio: null;
};

export type VideoAssetDefinition = AssetBase & {
  readonly type: "video";
  readonly renderer: "video";
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly anchor: Anchor;
  readonly defaultScale: number;
};

export type LibraryAsset =
  | ImageRendererAsset
  | CharacterAsset
  | LottieAssetDefinition
  | RiveAssetDefinition
  | OverlayFogAsset
  | DoorAnimationAsset
  | AudioAssetDefinition
  | VideoAssetDefinition;
