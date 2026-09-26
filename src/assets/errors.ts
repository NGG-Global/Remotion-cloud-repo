import type { CharacterAction } from "./actions";

export class AssetError extends Error {
  readonly component: string;
  readonly assetId: string;

  constructor(component: string, assetId: string, detail: string) {
    super(`[${component}] ${detail} (asset: "${assetId}")`);
    this.name = "AssetError";
    this.component = component;
    this.assetId = assetId;
  }
}

/** Loud in development. Production still receives the Error when the caller throws. */
export const warnAsset = (error: AssetError): void => {
  if (process.env.NODE_ENV !== "production") {
    console.error(error.message);
  }
};

export const assertAction = (
  component: string,
  assetId: string,
  action: string,
  available: readonly string[],
): void => {
  if (available.includes(action)) {
    return;
  }
  throw new AssetError(
    component,
    assetId,
    `does not support action "${action}". Available: ${available.join(", ") || "(none)"}`,
  );
};

export const assertAnimation = (
  component: string,
  assetId: string,
  animation: string,
  available: readonly string[],
): void => {
  if (available.includes(animation)) {
    return;
  }
  throw new AssetError(
    component,
    assetId,
    `does not include animation "${animation}". Available: ${available.join(", ") || "(none)"}`,
  );
};

export const knownIds = (
  group: Record<string, { readonly id: string }>,
): string =>
  Object.values(group)
    .map((asset) => asset.id)
    .join(", ") || "(none)";

export const isCharacterAction = (value: string): value is CharacterAction =>
  (
    [
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
    ] as readonly string[]
  ).includes(value);
