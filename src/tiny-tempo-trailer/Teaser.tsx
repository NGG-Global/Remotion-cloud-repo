import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Curtain } from "./components/Curtain";
import { GameClip } from "./components/GameClip";
import { Hits } from "./components/Hits";
import { LaunchCard } from "./components/LaunchCard";
import { Paper } from "./components/Paper";
import { Stamp } from "./components/Stamp";
import { bars, beats, fadeOutVolume, FPS, inBars, MUSIC_FILE } from "./music";
import { CLIPS, demoAt, first, hitFrames, responseAt } from "./shots";
import { SPACE, TYPE } from "./theme";
import { useTrailerFonts } from "./fonts";

/**
 * The eight-second 9:16 teaser: four bars from the fill at bar 8 into the drop. The
 * demonstration under the fill, the answer on the drop, a 136 BPM phrase, the title.
 * Built to be understood with the sound off and no context.
 */
const W = 1080;
const H = 1920;
export const TEASER_WIDTH = W;
export const TEASER_HEIGHT = H;
export const TEASER_DURATION = bars(4);
const MUSIC_IN = inBars(8);
const FULL = { x: 0, y: 0, w: W, h: H };
const G = SPACE.gutterTall;
const HEADROOM = { top: 190, height: 420 };

const T = {
  demo: 0,
  answer: bars(1),
  hard: bars(2),
  launch: bars(3),
  cta: bars(3) + beats(1),
} as const;

const Words: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: G,
      right: G,
      top: HEADROOM.top,
      height: HEADROOM.height,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export const Teaser: React.FC = () => {
  useTrailerFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#eee8d8" }}>
      <Audio
        src={staticFile(MUSIC_FILE)}
        trimBefore={Math.round(MUSIC_IN * FPS)}
        volume={(f) => fadeOutVolume(TEASER_DURATION, beats(2.5), 0.9)(f)}
      />
      <Paper />
      <Hits
        src="tiny-tempo/sfx/hammer-hit.wav"
        at={hitFrames(CLIPS.level1, first(CLIPS.level1), T.demo)}
        volume={0.42}
      />

      <Sequence
        from={T.demo}
        durationInFrames={T.answer - T.demo}
        name="Demonstration"
      >
        <GameClip
          clip={CLIPS.level1}
          at={demoAt(CLIPS.level1, first(CLIPS.level1))}
          box={FULL}
        />
        <Words>
          <Stamp
            text="WATCH."
            size={TYPE.stampTall}
            at={beats(0.5)}
            lean={-1}
          />
        </Words>
      </Sequence>
      <Sequence
        from={T.answer}
        durationInFrames={T.hard - T.answer}
        name="The answer"
      >
        <GameClip
          clip={CLIPS.level1}
          at={responseAt(CLIPS.level1, first(CLIPS.level1))}
          box={FULL}
        />
        <Words>
          <Stamp text="TAP." size={TYPE.stampTall} at={0} lean={1} />
        </Words>
      </Sequence>
      <Sequence
        from={T.hard}
        durationInFrames={T.launch - T.hard}
        name="132 BPM"
      >
        <GameClip
          clip={CLIPS.level28}
          at={responseAt(CLIPS.level28, first(CLIPS.level28))}
          box={FULL}
        />
        <Words>
          <Stamp text="KEEP UP." size={TYPE.stampTall} at={0} lean={-1} />
        </Words>
      </Sequence>
      <Sequence
        from={T.launch}
        durationInFrames={TEASER_DURATION - T.launch}
        name="Launch card"
      >
        <LaunchCard
          menu={CLIPS.menuClean}
          at={0.5}
          ctaAt={T.cta - T.launch}
          layout="tall"
        />
      </Sequence>

      <Curtain coverAt={T.launch} />
    </AbsoluteFill>
  );
};
