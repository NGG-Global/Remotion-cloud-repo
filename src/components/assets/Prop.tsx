import React from "react";
import { getProp } from "../../assets/lookup";
import type { PropId } from "../../assets/registry";
import { ImageAsset } from "./ImageAsset";

type PropProps = {
  readonly asset: PropId;
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly rotation?: number;
  readonly opacity?: number;
  readonly zIndex?: number;
};

/** `x` and `y` are the anchor declared on the asset, usually bottom-center. */
export const Prop: React.FC<PropProps> = ({
  asset,
  x = 0,
  y = 0,
  scale,
  rotation = 0,
  opacity = 1,
  zIndex = 0,
}) => {
  const definition = getProp(asset);
  const resolvedScale = scale ?? definition.defaultScale;
  const width = definition.width * resolvedScale;
  const height = definition.height * resolvedScale;
  const offset = anchorOffset(definition.anchor, width, height);

  return (
    <div
      style={{
        position: "absolute",
        left: x - offset.x,
        top: y - offset.y,
        width,
        height,
        opacity,
        zIndex,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: originFor(definition.anchor),
      }}
    >
      <ImageAsset
        src={definition.src}
        assetId={definition.id}
        component="Prop"
        optional={definition.optional}
        objectFit="contain"
      />
    </div>
  );
};

const anchorOffset = (
  anchor: string,
  width: number,
  height: number,
): { x: number; y: number } => {
  switch (anchor) {
    case "bottom-center":
      return { x: width / 2, y: height };
    case "bottom-left":
      return { x: 0, y: height };
    case "bottom-right":
      return { x: width, y: height };
    case "top-left":
      return { x: 0, y: 0 };
    case "top-center":
      return { x: width / 2, y: 0 };
    default:
      return { x: width / 2, y: height / 2 };
  }
};

const originFor = (anchor: string): string => {
  switch (anchor) {
    case "bottom-center":
      return "50% 100%";
    case "bottom-left":
      return "0% 100%";
    case "bottom-right":
      return "100% 100%";
    case "top-left":
      return "0% 0%";
    case "top-center":
      return "50% 0%";
    default:
      return "50% 50%";
  }
};
