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
 * The 16:9 launch trailer: fourteen bars of the title theme from its bar 7 — the two-bar
 * build and fill, the drop, eight bars of groove, and the two bars where the lead comes in
 * — 28 seconds. Every cut is on a bar or a beat, and every gameplay shot is placed so the
 * game's own downbeat (the demonstration's, or the player's) falls on the music's.
 */
const W = 1920;
const H = 1080;
export const TRAILER_FPS = FPS;
export const TRAILER_WIDTH = W;
export const TRAILER_HEIGHT = H;
export const TRAILER_DURATION = bars(14);
const MUSIC_IN = inBars(7);

/** Where a full-height phone recording sits on the wide canvas: 1000 px tall, centred. */
const PHONE_H = 1000;
const PHONE_W = Math.round(
  (PHONE_H * CLIPS.level1.width) / CLIPS.level1.height,
);
const PHONE = {
  x: Math.round((W - PHONE_W) / 2),
  y: Math.round((H - PHONE_H) / 2),
  w: PHONE_W,
  h: PHONE_H,
};
const FULL = { x: 0, y: 0, w: W, h: H };
/** The result standing as one slab, the crop's own aspect, the height of the phone. */
const PLAQUE_W = Math.round((PHONE_H * 1212) / 1680);
const PLAQUE = {
  x: Math.round((W - PLAQUE_W) / 2),
  y: PHONE.y,
  w: PLAQUE_W,
  h: PHONE_H,
};

/** The cut, in frames from the first bar. */
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

const SIDE = { left: SPACE.gutterWide, width: PHONE.x - SPACE.gutterWide * 2 };
/**
 * Where the phone stands when the shot carries words: right of centre, so a stamped
 * line as long as "REMEMBER." has the left half of the canvas to itself.
 */
/**
 * The hook's words sit in the top-left corner, the one part of the opening shot the
 * hammer never reaches, at a size that keeps "REMEMBER." left of its head even while
 * the stamp's landing overshoots.
 */
const HOOK_WORD = 104;
const PHONE_RIGHT = { ...PHONE, x: W - 220 - PHONE.w };
const WORDS = {
  left: SPACE.gutterWide,
  width: PHONE_RIGHT.x - SPACE.gutterWide - 80,
};

const MOSAIC_TILES = [
  CLIPS.tileBongos,
  CLIPS.tilePopcorn,
  CLIPS.tileBarber,
  CLIPS.tileSlushy,
  CLIPS.tileBell,
  CLIPS.tileDoorbell,
].map((clip) => ({ clip, at: 0 }));

export const Trailer: React.FC = () => {
  useTrailerFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#eee8d8" }}>
      <Audio
        src={staticFile(MUSIC_FILE)}
        trimBefore={Math.round(MUSIC_IN * FPS)}
        volume={(f) => fadeOutVolume(TRAILER_DURATION, beats(3), 0.9)(f)}
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

      {/* Hook: the hammer's demonstration, big, its three blows on the first three beats. */}
      <Sequence
        from={T.hookAct}
        durationInFrames={T.hookPlay - T.hookAct}
        name="Hook: demonstration"
      >
        <GameClip
          clip={CLIPS.level1}
          at={demoAt(CLIPS.level1, first(CLIPS.level1))}
          box={FULL}
          crop={REGION.actWide}
        />
      </Sequence>
      {/* Then the whole screen: the player's three taps, three Perfects, on the fill. */}
      <Sequence
        from={T.hookPlay}
        durationInFrames={T.teach - T.hookPlay}
        name="Hook: the answer"
      >
        <GameClip
          clip={CLIPS.level1}
          at={responseAt(CLIPS.level1, first(CLIPS.level1))}
          box={PHONE_RIGHT}
          plate
        />
      </Sequence>
      <Sequence durationInFrames={T.teach} name="Hook words">
        <div
          style={{
            position: "absolute",
            left: WORDS.left,
            top: 90,
            width: WORDS.width,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ height: HOOK_WORD * 1.08 }}>
            <Stamp text="WATCH." size={HOOK_WORD} at={beats(1)} lean={-1} />
          </div>
          <div style={{ height: HOOK_WORD * 1.08 }}>
            <Stamp text="REMEMBER." size={HOOK_WORD} at={beats(3)} lean={1} />
          </div>
          <div style={{ height: HOOK_WORD * 1.08 }}>
            <Stamp text="TAP." size={HOOK_WORD} at={beats(4)} lean={-1} />
          </div>
        </div>
      </Sequence>

      {/* The drop: one whole loop on one act — shown, copied, rewarded — and the next one starting. */}
      <Sequence
        from={T.teach}
        durationInFrames={T.paper - T.teach}
        name="Teach: knife and tomato"
      >
        <GameClip
          clip={CLIPS.level5}
          at={demoAt(CLIPS.level5, first(CLIPS.level5))}
          box={PHONE}
          plate
        />
        <div
          style={{
            position: "absolute",
            left: SIDE.left,
            top: 0,
            bottom: 0,
            width: SIDE.width,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Chip text="Watch" at={0} until={bars(1)} size={TYPE.chip + 6} />
          <Chip
            text="Tap"
            at={bars(1)}
            until={bars(2)}
            tone="coral"
            size={TYPE.chip + 6}
          />
        </div>
      </Sequence>

      {/* Escalation: longer phrases, quicker tempos, other acts; the cuts tighten. */}
      <Sequence
        from={T.paper}
        durationInFrames={T.scratch - T.paper}
        name="Scissors, 125 BPM"
      >
        <GameClip
          clip={CLIPS.level9}
          at={responseAt(CLIPS.level9, first(CLIPS.level9))}
          box={PHONE}
          plate
        />
      </Sequence>
      <Sequence
        from={T.scratch}
        durationInFrames={T.bug - T.scratch}
        name="DJ scratch, the block"
      >
        <GameClip
          clip={CLIPS.level19}
          at={responseAt(CLIPS.level19, first(CLIPS.level19))}
          box={FULL}
          crop={REGION.blockWide}
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
          box={PHONE}
          plate
        />
        <div
          style={{
            position: "absolute",
            right: SIDE.left,
            top: 0,
            bottom: 0,
            width: SIDE.width,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Chip
            text={`${bpmOf(CLIPS.level28, first(CLIPS.level28))} BPM`}
            at={0}
            tone="ink"
            size={TYPE.chip + 10}
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
          cols={3}
          box={{ x: 210, y: 90, w: W - 420, h: H - 180 }}
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
        <GameClip clip={CLIPS.map} at={0.5} box={FULL} crop={REGION.mapStage} />
      </Sequence>

      {/* Payoff: the area finale's last task at 138 BPM, then the plaque and its ribbon. */}
      <Sequence
        from={T.finale}
        durationInFrames={T.plaque - T.finale}
        name="Finale: trombone"
      >
        <GameClip
          clip={CLIPS.level20}
          at={responseAt(CLIPS.level20, first(CLIPS.level20))}
          box={PHONE_RIGHT}
          plate
        />
        <div
          style={{
            position: "absolute",
            left: WORDS.left,
            top: 0,
            bottom: 0,
            width: WORDS.width,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ height: TYPE.stampWide * 0.86 }}>
            <Stamp
              text="HOW FAR"
              size={TYPE.stampWide * 0.8}
              at={0}
              lean={-1}
            />
          </div>
          <div style={{ height: TYPE.stampWide * 0.86 }}>
            <Stamp
              text="CAN YOU"
              size={TYPE.stampWide * 0.8}
              at={beats(0.5)}
              lean={1}
            />
          </div>
          <div style={{ height: TYPE.stampWide * 0.86 }}>
            <Stamp
              text="KEEP UP?"
              size={TYPE.stampWide * 0.8}
              at={beats(1)}
              lean={-1}
            />
          </div>
        </div>
      </Sequence>
      <Sequence
        from={T.plaque}
        durationInFrames={T.launch - T.plaque}
        name="Area complete"
      >
        <GameClip
          clip={CLIPS.plaque20}
          at={0.1}
          box={PLAQUE}
          crop={REGION.plaque}
          plate
        />
      </Sequence>

      {/* Launch card: the title screen itself, and the badge. */}
      <Sequence
        from={T.launch}
        durationInFrames={TRAILER_DURATION - T.launch}
        name="Launch card"
      >
        <LaunchCard
          menu={CLIPS.menuClean}
          at={0.5}
          ctaAt={T.cta - T.launch}
          layout="wide"
        />
      </Sequence>

      <Curtain coverAt={T.teach} />
      <Curtain coverAt={T.launch} />
    </AbsoluteFill>
  );
};
