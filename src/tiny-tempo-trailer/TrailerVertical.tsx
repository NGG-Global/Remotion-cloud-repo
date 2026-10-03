import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Chip } from "./components/Chip";
import { Curtain } from "./components/Curtain";
import { GameClip } from "./components/GameClip";
import { Hits } from "./components/Hits";
import { LaunchCard } from "./components/LaunchCard";
import { Mosaic } from "./components/Mosaic";
import { Paper } from "./components/Paper";
import { Stamp } from "./components/Stamp";
import { bars, beats, fadeOutVolume, FPS, inBars, MUSIC_FILE } from "./music";
import {
  bpmOf,
  CLIPS,
  demoAt,
  hitFrames,
  REGION,
  responseAt,
  first,
} from "./shots";
import { SPACE, TYPE } from "./theme";
import { useTrailerFonts } from "./fonts";

/**
 * The 9:16 launch trailer. Same music, same fourteen bars, same order of ideas as the
 * wide cut — but composed for the phone: the recordings are 9:16 themselves, so gameplay
 * fills the canvas edge to edge, and the words live in the paper above the act, where
 * the game leaves room, never over the block the thumb reads.
 */
const W = 1080;
const H = 1920;
export const VERTICAL_WIDTH = W;
export const VERTICAL_HEIGHT = H;
export const VERTICAL_DURATION = bars(14);
const MUSIC_IN = inBars(7);
const FULL = { x: 0, y: 0, w: W, h: H };
const G = SPACE.gutterTall;

const T = {
  hookAct: 0,
  hookPlay: bars(1),
  teach: bars(2),
  paper: bars(5),
  scratch: bars(6),
  bug: bars(7),
  mosaic: bars(8),
  map: bars(9),
  finale: bars(10),
  plaque: bars(11),
  launch: bars(12),
  cta: bars(13),
} as const;

/** The paper above the act on the recorded screen, in canvas pixels, where words can sit. */
const HEADROOM = { top: 190, height: 420 };

const MOSAIC_TILES = [
  CLIPS.tileBongos,
  CLIPS.tilePopcorn,
  CLIPS.tileBarber,
  CLIPS.tileSlushy,
  CLIPS.tileBell,
  CLIPS.tileDoorbell,
].map((clip) => ({ clip, at: 0 }));

/**
 * Between a finale's bunting and its act: the headroom is the bunting's, and the paper
 * under the block is where Shorts and Reels lay their captions.
 */
const UNDER_BUNTING = { top: 322, height: 205 };

const WordColumn: React.FC<{
  readonly children: React.ReactNode;
  readonly zone?: { readonly top: number; readonly height: number };
}> = ({ children, zone = HEADROOM }) => (
  <div
    style={{
      position: "absolute",
      left: G,
      right: G,
      top: zone.top,
      height: zone.height,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export const TrailerVertical: React.FC = () => {
  useTrailerFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#eee8d8" }}>
      <Audio
        src={staticFile(MUSIC_FILE)}
        trimBefore={Math.round(MUSIC_IN * FPS)}
        volume={(f) => fadeOutVolume(VERTICAL_DURATION, beats(3), 0.9)(f)}
      />
      <Paper />
      {/* The hammer on its six beats, the knife on its own: the game's voices, under the music. */}
      <Hits
        src="tiny-tempo/sfx/hammer-hit.wav"
        at={hitFrames(CLIPS.level1, first(CLIPS.level1), T.hookAct)}
        volume={0.42}
      />
      <Hits
        src="tiny-tempo/sfx/tomato-action.wav"
        at={hitFrames(CLIPS.level5, first(CLIPS.level5), T.teach)}
        volume={0.34}
      />

      {/* Hook: pushed in on the hammer, then the whole screen for the answer. */}
      <Sequence
        from={T.hookAct}
        durationInFrames={T.hookPlay - T.hookAct}
        name="Hook: demonstration"
      >
        <GameClip
          clip={CLIPS.level1}
          at={demoAt(CLIPS.level1, first(CLIPS.level1))}
          box={FULL}
          crop={REGION.hookTall}
        />
      </Sequence>
      <Sequence
        from={T.hookPlay}
        durationInFrames={T.teach - T.hookPlay}
        name="Hook: the answer"
      >
        <GameClip
          clip={CLIPS.level1}
          at={responseAt(CLIPS.level1, first(CLIPS.level1))}
          box={FULL}
        />
      </Sequence>
      <Sequence durationInFrames={T.teach} name="Hook words">
        <WordColumn>
          <div style={{ height: TYPE.stampTall * 1.06 }}>
            <Stamp
              text="WATCH."
              size={TYPE.stampTall}
              at={beats(1)}
              lean={-1}
            />
          </div>
          <div style={{ height: TYPE.stampTall * 1.06 }}>
            <Stamp
              text="REMEMBER."
              size={TYPE.stampTall}
              at={beats(3)}
              lean={1}
            />
          </div>
          <div style={{ height: TYPE.stampTall * 1.06 }}>
            <Stamp text="TAP." size={TYPE.stampTall} at={beats(4)} lean={-1} />
          </div>
        </WordColumn>
      </Sequence>

      {/* Teach: the whole loop on the tomato, full screen; a chip names whose turn it is. */}
      <Sequence
        from={T.teach}
        durationInFrames={T.paper - T.teach}
        name="Teach: knife and tomato"
      >
        <GameClip
          clip={CLIPS.level5}
          at={demoAt(CLIPS.level5, first(CLIPS.level5))}
          box={FULL}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: HEADROOM.top + 40,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Chip text="Watch" at={0} until={bars(1)} size={TYPE.chip + 10} />
          <Chip
            text="Tap"
            at={bars(1)}
            until={bars(2)}
            tone="coral"
            size={TYPE.chip + 10}
          />
        </div>
      </Sequence>

      {/* Escalation. */}
      <Sequence
        from={T.paper}
        durationInFrames={T.scratch - T.paper}
        name="Scissors, 125 BPM"
      >
        <GameClip
          clip={CLIPS.level9}
          at={responseAt(CLIPS.level9, first(CLIPS.level9))}
          box={FULL}
        />
      </Sequence>
      <Sequence
        from={T.scratch}
        durationInFrames={T.bug - T.scratch}
        name="DJ scratch, pushed in"
      >
        <GameClip
          clip={CLIPS.level19}
          at={responseAt(CLIPS.level19, first(CLIPS.level19))}
          box={FULL}
          crop={REGION.playTall}
        />
      </Sequence>
      <Sequence
        from={T.bug}
        durationInFrames={T.mosaic - T.bug}
        name="Bug and shoe, 132 BPM"
      >
        <GameClip
          clip={CLIPS.level28}
          at={responseAt(CLIPS.level28, first(CLIPS.level28))}
          box={FULL}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: HEADROOM.top + 40,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Chip
            text={`${bpmOf(CLIPS.level28, first(CLIPS.level28))} BPM`}
            at={0}
            tone="ink"
            size={TYPE.chip + 14}
          />
        </div>
      </Sequence>
      <Sequence
        from={T.mosaic}
        durationInFrames={T.map - T.mosaic}
        name="Six more acts"
      >
        <Mosaic
          tiles={MOSAIC_TILES}
          cols={2}
          box={{ x: G, y: 150, w: W - G * 2, h: H - 300 }}
          gap={32}
          crop={REGION.tile}
          every={Math.round(beats(0.5))}
        />
      </Sequence>
      <Sequence
        from={T.map}
        durationInFrames={T.finale - T.map}
        name="The road"
      >
        <GameClip clip={CLIPS.map} at={0.5} box={FULL} />
      </Sequence>

      {/* Payoff. */}
      <Sequence
        from={T.finale}
        durationInFrames={T.plaque - T.finale}
        name="Finale: trombone"
      >
        <GameClip
          clip={CLIPS.level20}
          at={responseAt(CLIPS.level20, first(CLIPS.level20))}
          box={FULL}
        />
        <WordColumn zone={UNDER_BUNTING}>
          <div style={{ height: TYPE.stampTall * 0.78 }}>
            <Stamp
              text="HOW FAR CAN"
              size={TYPE.stampTall * 0.72}
              at={0}
              lean={-1}
            />
          </div>
          <div style={{ height: TYPE.stampTall * 0.78 }}>
            <Stamp
              text="YOU KEEP UP?"
              size={TYPE.stampTall * 0.72}
              at={beats(1)}
              lean={1}
            />
          </div>
        </WordColumn>
      </Sequence>
      <Sequence
        from={T.plaque}
        durationInFrames={T.launch - T.plaque}
        name="Area complete"
      >
        <GameClip clip={CLIPS.plaque20} at={0.1} box={FULL} />
      </Sequence>

      {/* Launch card: the title screen, full, and the badge on its bench. */}
      <Sequence
        from={T.launch}
        durationInFrames={VERTICAL_DURATION - T.launch}
        name="Launch card"
      >
        <LaunchCard
          menu={CLIPS.menuClean}
          at={0.5}
          ctaAt={T.cta - T.launch}
          layout="tall"
        />
      </Sequence>

      <Curtain coverAt={T.teach} />
      <Curtain coverAt={T.launch} />
    </AbsoluteFill>
  );
};
