import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BRAND } from "./brand";
import { BrandResolve } from "./BrandResolve";
import { ConfidenceScene, HabitScene } from "./RoadScenes";
import {
  MontageLabels,
  ShowcaseClipA,
  ShowcaseClipB,
  ShowcaseClipC,
} from "./Showcase";
import { NARRATION, sec, SCENE, TOTAL_FRAMES } from "./timing";

export const LEFT_LANE_DURATION = TOTAL_FRAMES;

/**
 * Left Lane - product commercial, 1920x1080 at 30 fps.
 *
 * One continuous journey: an abstract road where a right-hand habit shows
 * (1), which tilts into the real simulator (2), the practice montage and the
 * browser reveal (3, 4), the same road driven correctly (5), and the official
 * end card (6). All pacing constants live in ./timing.ts.
 */
export const LeftLaneCommercial: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BRAND.canvas }}>
      <Sequence from={SCENE.habit.start} durationInFrames={SCENE.habit.end}>
        <HabitScene />
      </Sequence>

      <Sequence
        from={SCENE.clipA.start}
        durationInFrames={SCENE.clipA.end - SCENE.clipA.start}
        premountFor={sec(1.5)}
      >
        <ShowcaseClipA />
        <MontageLabels startFrame={SCENE.clipA.start} />
      </Sequence>

      <Sequence
        from={SCENE.clipB.start}
        durationInFrames={SCENE.clipB.end - SCENE.clipB.start}
        premountFor={sec(1.5)}
      >
        <ShowcaseClipB />
        <MontageLabels startFrame={SCENE.clipB.start} />
      </Sequence>

      <Sequence
        from={SCENE.clipC.start}
        durationInFrames={SCENE.clipC.end - SCENE.clipC.start}
        premountFor={sec(1.5)}
      >
        <ShowcaseClipC />
      </Sequence>

      <Sequence
        from={SCENE.confidence.start}
        durationInFrames={SCENE.confidence.end - SCENE.confidence.start}
      >
        <ConfidenceScene />
      </Sequence>

      <BrandResolve />

      {/* Narration: the untouched master, played in segments with silence
          inserted purely by timeline spacing. See timing.ts. */}
      {NARRATION.map((segment) => (
        <Sequence
          key={segment.id}
          from={sec(segment.at)}
          durationInFrames={sec(segment.to) - sec(segment.from)}
        >
          <Audio
            src={staticFile("leftlane/narration-master.mp3")}
            trimBefore={sec(segment.from)}
            trimAfter={sec(segment.to)}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
