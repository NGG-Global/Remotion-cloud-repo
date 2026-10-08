import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { ARTS } from "./arts";
import { Chrome } from "./engine/Chrome";
import { Phrase } from "./engine/Phrase";
import { Stage } from "./engine/Stage";
import { artZone, textZone } from "./engine/layout";
import { Scene, TIMELINE, sceneAt } from "./timeline";
import {
  FPS,
  TONES,
  ToneColors,
  easeIn,
  easeOut,
  mixTone,
  ramp,
} from "./theme";
import { loadBackupFonts } from "./fonts";

export { DURATION as BACKUP_DURATION } from "./theme";

loadBackupFonts();

/**
 * "Back up your photos" — vertical kinetic typography for a Hebrew
 * monologue to a generation born analog and raised digital.
 *
 * Everything is placed by the narration: each word appears on its measured
 * start (data/timing.ts), each card holds until the next one, each scene's
 * illustration keys its events to the words it illustrates.
 */

const TONE_FADE = 0.55;

const toneAt = (now: number, idx: number): ToneColors => {
  const scene = TIMELINE[idx];
  const prev = TIMELINE[idx - 1];
  const to = TONES[scene.tone];
  if (!prev || prev.tone === scene.tone) return to;
  return mixTone(
    TONES[prev.tone],
    to,
    easeOut(ramp(now, scene.start - 0.15, scene.start - 0.15 + TONE_FADE)),
  );
};

/** Words spoken so far: the "files" counter in the backup bar. */
const ALL_WORDS = TIMELINE.flatMap((s) =>
  s.cards.flatMap((c) => c.words.map((w) => w.s)),
);
const filesAt = (now: number): number => {
  let n = 0;
  for (const s of ALL_WORDS) if (s <= now) n++;
  return n * 7;
};

const SceneView: React.FC<{ scene: Scene; now: number; tone: ToneColors }> = ({
  scene,
  now,
  tone,
}) => {
  const ArtView = scene.art ? ARTS[scene.art] : undefined;
  const leave = easeIn(ramp(now, scene.end - 0.18, scene.end + 0.28));
  const crt = scene.tone === "crt";
  return (
    <>
      {ArtView && leave < 1 ? (
        <AbsoluteFill
          style={{
            opacity: 1 - leave,
            transform: `translateY(${-leave * 70}px) scale(${1 - leave * 0.05})`,
          }}
        >
          <ArtView
            scene={scene}
            now={now}
            tone={tone}
            zone={artZone(scene.layout)}
          />
        </AbsoluteFill>
      ) : null}
      {scene.cards.map((card) => (
        <Phrase
          key={card.id}
          card={card}
          zone={textZone(scene.layout)}
          tone={tone}
          now={now}
          crt={crt}
        />
      ))}
    </>
  );
};

export const BackupYourPhotos: React.FC = () => {
  const frame = useCurrentFrame();
  const now = frame / FPS;
  const idx = sceneAt(now);
  const scene = TIMELINE[idx];
  const tone = toneAt(now, idx);

  const crtAmount =
    scene.tone === "crt"
      ? 1
      : scene.id === "title"
        ? 1 - easeOut(ramp(now, scene.start, scene.start + 0.5))
        : 0;

  const chapterStart =
    TIMELINE.find((s) => s.chapter === scene.chapter)?.start ?? 0;
  // The frame arrives with the title and steps aside for the outro.
  const appear =
    easeOut(ramp(now, 29.1, 29.9)) * (1 - easeIn(ramp(now, 477.6, 478.4)));

  // The outgoing scene stays mounted while it leaves.
  const prev = TIMELINE[idx - 1];
  const showing = prev && now < prev.end + 0.3 ? [prev, scene] : [scene];

  return (
    <AbsoluteFill style={{ background: tone.bg, overflow: "hidden" }}>
      <Stage tone={tone} now={now} frame={frame} crt={crtAmount} />
      {showing.map((s) => (
        <SceneView key={s.id} scene={s} now={now} tone={tone} />
      ))}
      <Chrome
        now={now}
        tone={tone}
        chapter={scene.chapter}
        chapterStart={chapterStart}
        appear={appear}
        files={filesAt(now)}
      />
      <Audio src={staticFile("audio/backup-narration.mp3")} />
    </AbsoluteFill>
  );
};
