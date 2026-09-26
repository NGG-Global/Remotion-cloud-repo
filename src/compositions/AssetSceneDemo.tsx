import {
  Animation,
  Background,
  Camera,
  Character,
  Layer,
  Prop,
  Scene,
} from "../library";
import { movement } from "../animation/presets";
import React from "react";
import { useCurrentFrame } from "remotion";

export const ASSET_SCENE_DEMO_DURATION = 180;

/**
 * Short scene built only from the asset library.
 * This is the shape future scenes should follow.
 */
export const AssetSceneDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const walk = movement.walkAcross(frame, {
    fromX: 280,
    toX: 780,
    durationInFrames: 140,
  });

  return (
    <Scene>
      <Background asset="house-interior-night" scaleMode="cover" />
      <Camera preset="slowPushIn">
        <Character
          character="generic-male"
          action="walk"
          direction="right"
          x={walk.x}
          y={900}
          scale={0.9}
        />
        <Prop asset="wooden-table" x={1280} y={900} />
        <Prop asset="telephone" x={1240} y={600} />
      </Camera>
      <Layer zIndex={8}>
        <Animation asset="fog" />
      </Layer>
    </Scene>
  );
};
