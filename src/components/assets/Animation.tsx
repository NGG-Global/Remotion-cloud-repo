import React from "react";
import { DoorOpening } from "../../assets/animations/DoorOpening";
import { ForegroundFog } from "../../assets/animations/ForegroundFog";
import { getAnimation } from "../../assets/lookup";
import type { AnimationId } from "../../assets/registry";
import { LottieAsset } from "./LottieAsset";

type AnimationProps = {
  readonly asset: AnimationId;
  readonly loop?: boolean;
  readonly opacity?: number;
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly zIndex?: number;
};

/** Dispatches a registered animation id to the player that asset declares. */
export const Animation: React.FC<AnimationProps> = ({
  asset,
  loop,
  opacity = 1,
  x = 960,
  y = 900,
  scale = 1,
  zIndex = 0,
}) => {
  const definition = getAnimation(asset);

  if (definition.renderer === "lottie") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity, zIndex }}>
        <LottieAsset asset={definition.id} loop={loop} opacity={1} />
      </div>
    );
  }

  if (definition.renderer === "overlay-fog") {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex }}>
        <ForegroundFog opacity={opacity} />
      </div>
    );
  }

  if (definition.renderer === "procedural-door") {
    const width = definition.width * scale;
    const height = definition.height * scale;
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
        }}
      >
        <DoorOpening />
      </div>
    );
  }
};
