import React from "react";
import { AssetError, assertAnimation } from "../../assets/errors";
import { getRive } from "../../assets/lookup";
import { type RiveAnimationsFor, type RiveId } from "../../assets/registry";
import { RivePlayback } from "./RivePlayback";

type RiveAssetProps<Id extends RiveId> = {
  readonly asset: Id;
  readonly animation?: RiveAnimationsFor<Id>;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly startFrame?: number;
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly opacity?: number;
  readonly zIndex?: number;
};

/**
 * Registered `.riv` file. `animation` must be one of the names in the registry.
 * State machine names are documented on the asset and rejected here on purpose.
 */
export function RiveAsset<Id extends RiveId>({
  asset,
  animation,
  loop = true,
  speed = 1,
  startFrame = 0,
  x,
  y,
  scale,
  opacity = 1,
  zIndex = 0,
}: RiveAssetProps<Id>): React.ReactElement {
  const definition = getRive(asset);
  const animationName = animation ?? definition.animations[0];
  if (!animationName) {
    throw new AssetError(
      "RiveAsset",
      definition.id,
      "has no linear animations declared in the registry",
    );
  }
  assertAnimation(
    "RiveAsset",
    definition.id,
    animationName,
    definition.animations,
  );
  const machines = definition.stateMachines as readonly string[];
  if (machines.includes(animationName)) {
    throw new AssetError(
      "RiveAsset",
      definition.id,
      `"${animationName}" is declared as a state machine. Pass a linear animation instead: ${definition.animations.join(", ")}`,
    );
  }

  const resolvedScale = scale ?? definition.defaultScale;
  const width = definition.width * resolvedScale;
  const height = definition.height * resolvedScale;
  const positioned = x !== undefined || y !== undefined;

  const player = (
    <RivePlayback
      src={definition.src}
      artboard={definition.artboard}
      animation={animationName}
      assetId={definition.id}
      width={definition.width}
      height={definition.height}
      startFrame={startFrame}
      speed={speed}
      loop={loop}
    />
  );

  const placement = definition.placement as string;
  if (!positioned && placement === "fullscreen") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity, zIndex }}>
        {player}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: (x ?? 0) - width / 2,
        top: (y ?? 0) - height / 2,
        width,
        height,
        opacity,
        zIndex,
      }}
    >
      {player}
    </div>
  );
}
