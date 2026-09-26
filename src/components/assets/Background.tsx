import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { getBackground } from "../../assets/lookup";
import type { BackgroundId } from "../../assets/registry";
import { ImageAsset } from "./ImageAsset";

export type BackgroundScaleMode = "cover" | "contain";

type BackgroundProps = {
  readonly asset: BackgroundId;
  readonly scaleMode?: BackgroundScaleMode;
  /** Extra pixels of position, applied on top of pan. */
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  /** Drift across the composition, in pixels from frame 0 to the last frame. */
  readonly pan?: { readonly x?: number; readonly y?: number };
  /** End scale relative to the start. 1.04 is a subtle zoom. */
  readonly zoom?: number;
  readonly blur?: number;
  /** 1 is unchanged. 0.8 darkens, 1.2 brightens. */
  readonly brightness?: number;
  readonly opacity?: number;
};

export const Background: React.FC<BackgroundProps> = ({
  asset,
  scaleMode = "cover",
  x = 0,
  y = 0,
  scale = 1,
  pan,
  zoom = 1,
  blur = 0,
  brightness = 1,
  opacity = 1,
}) => {
  const definition = getBackground(asset);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);
  const panX = (pan?.x ?? 0) * progress;
  const panY = (pan?.y ?? 0) * progress;
  const zoomScale = 1 + (zoom - 1) * progress;
  const fitted = scale * zoomScale;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "100%",
          height: "100%",
          transform: `translate(-50%, -50%) translate(${x + panX}px, ${y + panY}px) scale(${fitted})`,
          filter: `blur(${blur}px) brightness(${brightness})`,
        }}
      >
        <ImageAsset
          src={definition.src}
          assetId={definition.id}
          component="Background"
          optional={definition.optional}
          objectFit={scaleMode}
        />
      </div>
    </div>
  );
};
