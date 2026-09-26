import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./fonts";
import { sceneFrames, SCENES, TOTAL_FRAMES, type SceneId } from "./data/timeline";
import { Business, Pogo } from "./scenes/PublicLife";
import { Chicago } from "./scenes/Chicago";
import { Crawl, Suburb } from "./scenes/CrawlSpace";
import { Disappearances } from "./scenes/Disappearances";
import { Ending, Names } from "./scenes/Ending";
import { Execution, People, Search2, Trial } from "./scenes/Court";
import { Iowa } from "./scenes/Iowa";
import { Opening } from "./scenes/Opening";
import { Piest, Police, Subscribe, Watch } from "./scenes/Investigation";

export const GACY_DURATION = TOTAL_FRAMES;

const SCENE: Record<SceneId, React.FC> = {
  opening: Opening,
  chicago: Chicago,
  iowa: Iowa,
  business: Business,
  pogo: Pogo,
  missing: Disappearances,
  crawl: Crawl,
  suburb: Suburb,
  piest: Piest,
  police: Police,
  watch: Watch,
  subscribe: Subscribe,
  search2: Search2,
  people: People,
  trial: Trial,
  execution: Execution,
  names: Names,
  ending: Ending,
};

/**
 * "Behind the Nightmare: John Wayne Gacy."
 *
 * An illustrated documentary cut to the Hebrew narration. The picture follows
 * the voice: ordinary rooms, then the floor beneath them. No bodies, no
 * blood, no clown-horror poster treatment. Text is limited to names, years,
 * and a few words.
 */
export const GacyDocumentary: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080c" }}>
      <Audio src={staticFile("audio/gacy-narration.mp3")} />
      {SCENES.map((scene) => {
        const timing = sceneFrames(scene.start, scene.end);
        const View = SCENE[scene.id];
        return (
          <Sequence
            key={scene.id}
            from={timing.from}
            durationInFrames={timing.durationInFrames}
            name={scene.id}
          >
            <View />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
