import React from "react";
import { AssetError, assertAction } from "../../assets/errors";
import { VectorCharacter } from "../../assets/characters/VectorCharacter";
import { getCharacter } from "../../assets/lookup";
import { type ActionsFor, type CharacterId } from "../../assets/registry";
import { RivePlayback } from "./RivePlayback";

type CharacterProps<Id extends CharacterId> = {
  readonly character: Id;
  readonly action: ActionsFor<Id>;
  readonly direction?: "left" | "right";
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly rotation?: number;
  readonly opacity?: number;
  readonly startFrame?: number;
  readonly speed?: number;
  readonly zIndex?: number;
};

/**
 * Places a registered character. `x` and `y` are the feet.
 * `action` is checked against that character's declared actions.
 */
export function Character<Id extends CharacterId>({
  character,
  action,
  direction = "right",
  x = 0,
  y = 0,
  scale,
  rotation = 0,
  opacity = 1,
  startFrame = 0,
  speed = 1,
  zIndex = 0,
}: CharacterProps<Id>): React.ReactElement {
  const asset = getCharacter(character);
  const actionName = String(action);
  assertAction("Character", asset.id, actionName, asset.actions);

  if (startFrame < 0) {
    throw new AssetError(
      "Character",
      asset.id,
      `startFrame must be >= 0 (received ${startFrame})`,
    );
  }
  if (!(speed > 0)) {
    throw new AssetError(
      "Character",
      asset.id,
      `speed must be greater than 0 (received ${speed})`,
    );
  }

  const resolvedScale = scale ?? asset.defaultScale;
  const width = asset.width * resolvedScale;
  const height = asset.height * resolvedScale;
  const flip = direction === "left" ? -1 : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height,
        width,
        height,
        opacity,
        zIndex,
        transform: `scaleX(${flip}) rotate(${rotation}deg)`,
        transformOrigin: "50% 100%",
      }}
    >
      {asset.renderer === "vector" ? (
        <VectorCharacter
          action={action}
          costume={asset.costume}
          startFrame={startFrame}
          speed={speed}
        />
      ) : asset.renderer === "rive" && asset.src ? (
        <RiveCharacter
          src={asset.src}
          artboard={
            "artboard" in asset && typeof asset.artboard === "string"
              ? asset.artboard
              : ""
          }
          animation={actionName}
          animations={asset.animations}
          assetId={asset.id}
          width={asset.width}
          height={asset.height}
          startFrame={startFrame}
          speed={speed}
        />
      ) : (
        <MissingRenderer assetId={asset.id} />
      )}
    </div>
  );
}

const RiveCharacter: React.FC<{
  readonly src: string;
  readonly artboard: string;
  readonly animation: string;
  readonly animations: readonly string[];
  readonly assetId: string;
  readonly width: number;
  readonly height: number;
  readonly startFrame: number;
  readonly speed: number;
}> = ({
  src,
  artboard,
  animation,
  animations,
  assetId,
  width,
  height,
  startFrame,
  speed,
}) => {
  if (!animations.includes(animation)) {
    throw new AssetError(
      "Character",
      assetId,
      `Rive animation "${animation}" is not declared. Declared animations: ${animations.join(", ")}`,
    );
  }
  return (
    <RivePlayback
      src={src}
      artboard={artboard}
      animation={animation}
      assetId={assetId}
      width={width}
      height={height}
      startFrame={startFrame}
      speed={speed}
      loop
    />
  );
};

const MissingRenderer: React.FC<{ readonly assetId: string }> = ({
  assetId,
}) => {
  throw new AssetError(
    "Character",
    assetId,
    "has no renderer. Expected vector or rive with a local .riv path",
  );
};
