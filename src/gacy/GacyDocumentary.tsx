import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./fonts";
import {
  FPS,
  LABELS,
  REBUILT_UNTIL,
  SHOTS,
  TOTAL_FRAMES,
  WIPES,
  shotEnd,
} from "./data/timeline";
import { ShotClockProvider, ShotFrame } from "./engine/shot";
import { Wipe } from "./engine/wipes";
import { Label } from "./type/Label";
import { useShot } from "./engine/shot";
import { SCENES, sceneFrames, type SceneId } from "./legacy/data/timeline";
import { Business, Pogo } from "./legacy/scenes/PublicLife";
import { Chicago } from "./legacy/scenes/Chicago";
import { Crawl, Suburb } from "./legacy/scenes/CrawlSpace";
import { Disappearances } from "./legacy/scenes/Disappearances";
import { Ending, Names } from "./legacy/scenes/Ending";
import { Execution, People, Search2, Trial } from "./legacy/scenes/Court";
import { Iowa } from "./legacy/scenes/Iowa";
import { Opening } from "./legacy/scenes/Opening";
import { Piest, Police, Subscribe, Watch } from "./legacy/scenes/Investigation";

export const GACY_DURATION = TOTAL_FRAMES;

const LEGACY: Record<SceneId, React.FC> = {
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

const f = (s: number) => Math.round(s * FPS);

const LabelOverlay: React.FC<{ line: string; sub?: string }> = ({ line, sub }) => {
  const { t, dur } = useShot();
  return <Label t={t} from={0} to={dur} line={line} sub={sub} />;
};

/**
 * "Behind the Nightmare: John Wayne Gacy."
 *
 * One narration track, one timeline (data/timeline.ts). Shots are placed at
 * measured pauses in the voice; wipes and labels float above them.
 */
export const GacyDocumentary: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("audio/gacy-narration.mp3")} />
      {SHOTS.map((shot, i) => {
        const lead = shot.enter?.kind === "dissolve" ? shot.enter.s / 2 : 0;
        const next = SHOTS[i + 1];
        const tail = next?.enter?.kind === "dissolve" ? next.enter.s / 2 : 0;
        const start = f(shot.at - lead);
        const end = f(shotEnd(i) + tail);
        const C = shot.C;
        return (
          <Sequence key={shot.id} name={shot.id} from={start} durationInFrames={Math.max(1, end - start)}>
            <ShotClockProvider lead={lead} len={shotEnd(i) - shot.at}>
              <ShotFrame enter={shot.enter ?? { kind: "cut" }} exit={shot.exit ?? { kind: "cut" }}>
                <C />
              </ShotFrame>
            </ShotClockProvider>
          </Sequence>
        );
      })}
      {SCENES.filter((s) => s.end > REBUILT_UNTIL).map((scene) => {
        const start = Math.max(scene.start, REBUILT_UNTIL);
        const timing = sceneFrames(start, scene.end);
        const View = LEGACY[scene.id];
        return (
          <Sequence key={scene.id} from={timing.from} durationInFrames={timing.durationInFrames} name={`draft-${scene.id}`}>
            <View />
          </Sequence>
        );
      })}
      {WIPES.map((w, i) => (
        <Sequence key={`w${i}`} name={`wipe-${w.kind}`} from={f(w.at - w.dur / 2)} durationInFrames={Math.max(1, f(w.dur))}>
          <ShotClockProvider lead={0} len={w.dur}>
            <Wipe kind={w.kind} dir={w.dir} tone={w.tone} />
          </ShotClockProvider>
        </Sequence>
      ))}
      {LABELS.map((l, i) => (
        <Sequence key={`l${i}`} name={`label-${i}`} from={f(l.from)} durationInFrames={Math.max(1, f(l.to - l.from))}>
          <ShotClockProvider lead={0} len={l.to - l.from}>
            <LabelOverlay line={l.line} sub={l.sub} />
          </ShotClockProvider>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
