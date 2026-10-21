import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Paper } from "./components/Paper";
import { CommentsScene } from "./scenes/CommentsScene";
import { DataFrameScene } from "./scenes/DataFrameScene";
import { HistoryScene } from "./scenes/HistoryScene";
import { HookScene } from "./scenes/HookScene";
import { ObjectsScene } from "./scenes/ObjectsScene";
import { OutroScene } from "./scenes/OutroScene";
import { PackagesScene } from "./scenes/PackagesScene";
import { PanesScene } from "./scenes/PanesScene";
import { ProjectsScene } from "./scenes/ProjectsScene";
import { PythonScene } from "./scenes/PythonScene";
import { RStudioScene } from "./scenes/RStudioScene";
import { SavingScene } from "./scenes/SavingScene";
import { VectorsScene } from "./scenes/VectorsScene";
import { EP, R_INTRO_SECONDS, type RBeatId } from "./script";
import { R, sec } from "./theme";
import "./fonts";

/** The narration plus a breath of air at the end. */
export const R_INTRO_DURATION = sec(R_INTRO_SECONDS + 1.5);

/**
 * Each scene owns a run of consecutive beats, from `from` up to the beat the
 * next scene starts on. Scenes keep their own internal timing through
 * `sceneClock`, so the only thing decided here is which scene owns which beat.
 */
const SCENES: readonly {
  readonly from: RBeatId;
  readonly tint: string;
  readonly alt: string;
  readonly scene: React.FC;
}[] = [
  { from: "hook", tint: R.sky, alt: R.yellowLit, scene: HookScene },
  { from: "start", tint: R.yellowLit, alt: R.sky, scene: HistoryScene },
  { from: "python-q", tint: "#fde7a8", alt: R.sky, scene: PythonScene },
  { from: "rstudio", tint: R.sky, alt: "#f7d6cf", scene: RStudioScene },
  { from: "four-panes", tint: "#dcefe4", alt: R.sky, scene: PanesScene },
  {
    from: "packages-q",
    tint: R.yellowLit,
    alt: "#e6dcf5",
    scene: PackagesScene,
  },
  { from: "projects", tint: R.sky, alt: R.yellowLit, scene: ProjectsScene },
  { from: "objects-q", tint: "#f7d6cf", alt: R.sky, scene: ObjectsScene },
  { from: "vectors-q", tint: R.sky, alt: "#dcefe4", scene: VectorsScene },
  {
    from: "df-intro",
    tint: "#dcefe4",
    alt: R.yellowLit,
    scene: DataFrameScene,
  },
  { from: "saving-q", tint: R.yellowLit, alt: R.sky, scene: SavingScene },
  { from: "comments-intro", tint: "#e6dcf5", alt: R.sky, scene: CommentsScene },
  { from: "outro", tint: R.sky, alt: R.yellowLit, scene: OutroScene },
];

/** Week one of R, recapped: a vertical explainer cut to the narration. */
export const RIntro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: R.paper }}>
      <Audio src={staticFile("audio/r-intro-narration.mp3")} />
      {SCENES.map((entry, i) => {
        const start = EP.frames(entry.from);
        const next = SCENES[i + 1];
        const end = next ? EP.frames(next.from) : R_INTRO_DURATION;
        const Scene = entry.scene;
        return (
          <Sequence
            key={entry.from}
            from={start}
            durationInFrames={end - start}
            name={entry.from}
          >
            <Paper tint={entry.tint} tintAlt={entry.alt}>
              <Scene />
            </Paper>
          </Sequence>
        );
      })}
      {/* Progress along the narration, a thin bar at the top edge. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 14,
          width: `${(100 * frame) / R_INTRO_DURATION}%`,
          background: R.blue,
          borderRadius: "0 7px 7px 0",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * The same video at 720x1280, for a lighter file. The scenes are laid out in
 * 1080x1920 pixels, so the full composition is drawn at that size and scaled
 * down by two thirds rather than re-laid out.
 */
export const RIntro720: React.FC = () => (
  <AbsoluteFill style={{ background: R.paper }}>
    <div
      style={{
        width: 1080,
        height: 1920,
        transform: "scale(0.6666667)",
        transformOrigin: "top left",
        position: "absolute",
        left: 0,
        top: 0,
      }}
    >
      <RIntro />
    </div>
  </AbsoluteFill>
);
