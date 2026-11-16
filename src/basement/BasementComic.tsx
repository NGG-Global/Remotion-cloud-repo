import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { FPS, Finish, ShotView } from "./engine";
import { DURATION_S, SHOTS } from "./timeline";

/**
 * "The Basement": a horror motion comic over the Hebrew narration.
 * 1280x720, 24 fps. The narration is the only clock: every shot starts at a
 * second of the MP3 (src/basement/timeline.ts).
 */
export const BASEMENT_FRAMES = Math.ceil(DURATION_S * FPS);

/**
 * The only sound added to the voice: a low room tone (public/basement/drone.mp3,
 * synthesised brown noise and two beating sines) from the moment the boys
 * enter the house until the police arrive, about 18-20 dB under the
 * narration. It drops out completely for "and then... silence".
 */
const DRONE_FROM = 328.6;
const DRONE_TO = 1069.3;
const droneVolume = (f: number): number => {
  const t = DRONE_FROM + f / FPS;
  const base = 0.15;
  const duck = interpolate(t, [1037.4, 1038.4, 1042.4, 1046], [1, 0, 0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const end = interpolate(t, [DRONE_TO - 4, DRONE_TO], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return base * duck * end;
};

export const BasementComic: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SHOTS.map((shot, i) => {
      const end = i + 1 < SHOTS.length ? SHOTS[i + 1].at : DURATION_S;
      const lead = shot.tr === "xfade" ? shot.trd ?? 0.8 : 0;
      const from = Math.round((shot.at - lead) * FPS);
      const to = i + 1 < SHOTS.length ? Math.round(end * FPS) : BASEMENT_FRAMES;
      return (
        <Sequence key={i} from={from} durationInFrames={to - from} name={`${i + 1} ${shot.plate} @${shot.at}s`}>
          <ShotView shot={shot} dur={end - shot.at} lead={lead} />
        </Sequence>
      );
    })}
    <Finish />
    <Audio src={staticFile("basement/narration.mp3")} />
    <Sequence from={Math.round(DRONE_FROM * FPS)} durationInFrames={Math.round((DRONE_TO - DRONE_FROM) * FPS)} name="room tone">
      <Audio src={staticFile("basement/drone.mp3")} volume={droneVolume} />
    </Sequence>
  </AbsoluteFill>
);
