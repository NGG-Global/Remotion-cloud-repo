import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../engine/camera";
import { Suburb } from "../kit/suburb";
import { Car } from "../kit/vehicles";
import { Plane } from "../engine/camera";
import { lightFor, SUBURB } from "../kit/suburb";

/** Maintainer's set check: the street from four camera positions. */
export const SetTest: React.FC = () => {
  const frame = useCurrentFrame();
  const views = [
    { x: 0, y: -330, zoom: 0.42, mode: "night" as const },
    { x: 600, y: -330, zoom: 0.9, mode: "night" as const },
    { x: -800, y: -300, zoom: 0.5, mode: "day" as const },
    { x: 0, y: -330, zoom: 0.45, mode: "winterNight" as const },
  ];
  const v = views[Math.min(3, Math.floor(frame / 10))];
  return (
    <AbsoluteFill>
      <Stage cam={v}>
        <Suburb t={frame / 30} mode={v.mode} gacyLit={0.9} porch={1} tv snow={v.mode === "winterNight" ? 1 : 0}
          onRoad={<Plane d={SUBURB.roadMid}><Car x={-2600} kind="sedan" color="#4a5a6a" light={lightFor(v.mode)} /><Car x={2600} kind="van" color="#8a8676" light={lightFor(v.mode)} facing={-1} /></Plane>}
        />
      </Stage>
    </AbsoluteFill>
  );
};
