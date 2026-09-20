import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { PaperCurtain } from "./components/chrome";
import { useClock } from "./clock";
import { ActScene } from "./scenes/ActScene";
import { HookScene } from "./scenes/HookScene";
import { MechanicScene } from "./scenes/MechanicScene";
import { MosaicScene } from "./scenes/MosaicScene";
import { OutroScene } from "./scenes/OutroScene";
import { PromiseScene } from "./scenes/PromiseScene";
import { seconds } from "../theme";
import "./fonts";

/**
 * Scene timings in seconds, locked to 120 BPM so every cut lands on a bar line.
 * Twelve bars, 24 seconds — drums and keys for the hook, synth arriving in the
 * montage, bass under the promise, the way the track itself is arranged.
 */
const SCENE = {
  hook: seconds(4),
  mechanic: seconds(4),
  hammer: seconds(2),
  tomato: seconds(2),
  bug: seconds(2),
  mosaic: seconds(4),
  promise: seconds(3),
  outro: seconds(3),
} as const;

export const TINY_TEMPO_AD_DURATION =
  SCENE.hook +
  SCENE.mechanic +
  SCENE.hammer +
  SCENE.tomato +
  SCENE.bug +
  SCENE.mosaic +
  SCENE.promise +
  SCENE.outro;

const AT = {
  hook: 0,
  mechanic: SCENE.hook,
  hammer: SCENE.hook + SCENE.mechanic,
  tomato: SCENE.hook + SCENE.mechanic + SCENE.hammer,
  bug: SCENE.hook + SCENE.mechanic + SCENE.hammer + SCENE.tomato,
  mosaic: SCENE.hook + SCENE.mechanic + SCENE.hammer + SCENE.tomato + SCENE.bug,
  promise:
    SCENE.hook +
    SCENE.mechanic +
    SCENE.hammer +
    SCENE.tomato +
    SCENE.bug +
    SCENE.mosaic,
  outro:
    SCENE.hook +
    SCENE.mechanic +
    SCENE.hammer +
    SCENE.tomato +
    SCENE.bug +
    SCENE.mosaic +
    SCENE.promise,
};

/**
 * The shipped mix has ~182 ms of encoder lead-in before the first downbeat.
 * Skip it so visual beat 0 is the first drum hit.
 */
const MUSIC_LEAD_FRAMES = 5;

const CurtainPass: React.FC<{ readonly at: number }> = ({ at }) => {
  const { time, fps } = useClock();
  const local = time - at / fps;
  if (local < -0.02 || local > 0.7) return null;
  const progress = local < 0.32 ? local / 0.32 : 1 + (local - 0.32) / 0.32;
  return <PaperCurtain progress={progress} />;
};

export const TinyTempoAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#eee8d8" }}>
      <Audio
        src={staticFile("audio/tiny-tempo.mp3")}
        trimBefore={MUSIC_LEAD_FRAMES}
        volume={0.82}
      />

      <Sequence from={AT.hook} durationInFrames={SCENE.hook} name="Hook">
        <HookScene />
      </Sequence>
      <Sequence
        from={AT.mechanic}
        durationInFrames={SCENE.mechanic}
        name="Mechanic"
      >
        <MechanicScene />
      </Sequence>
      <Sequence from={AT.hammer} durationInFrames={SCENE.hammer} name="Hammer">
        <ActScene act="hammer" />
      </Sequence>
      <Sequence from={AT.tomato} durationInFrames={SCENE.tomato} name="Tomato">
        <ActScene act="tomato" />
      </Sequence>
      <Sequence from={AT.bug} durationInFrames={SCENE.bug} name="Bug">
        <ActScene act="bug" />
      </Sequence>
      <Sequence from={AT.mosaic} durationInFrames={SCENE.mosaic} name="Mosaic">
        <MosaicScene />
      </Sequence>
      <Sequence
        from={AT.promise}
        durationInFrames={SCENE.promise}
        name="Promise"
      >
        <PromiseScene />
      </Sequence>
      <Sequence from={AT.outro} durationInFrames={SCENE.outro} name="Outro">
        <OutroScene />
      </Sequence>

      <CurtainPass at={AT.mechanic} />
      <CurtainPass at={AT.mosaic} />
      <CurtainPass at={AT.outro} />
    </AbsoluteFill>
  );
};
