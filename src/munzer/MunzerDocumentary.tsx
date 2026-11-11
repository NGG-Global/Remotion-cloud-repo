import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import "./fonts";
import { ANIMS } from "./anim";
import { SFX, LABELS, SUBTITLES } from "./data/overlays";
import { SHOTS } from "./data/edl";
import type { Shot } from "./data/types";
import { ShotProvider, useShot } from "./engine/shot";
import {
  FILM_FRAMES,
  INSERTS,
  NARRATION_PIECES,
  insertStart,
  resolve,
  toFrames,
} from "./engine/timeline";
import { EASE, ramp } from "./engine/time";
import { Finish } from "./look/Finish";
import { NARRATION, clipSrc } from "./media";
import { Clip } from "./shots/Clip";
import { Photo } from "./shots/Photo";
import { FPS, INK } from "./theme";
import { Label, Subtitle } from "./type/Label";

export const MUNZER_DURATION = FILM_FRAMES;

/** Shot placement in frames: start, and how long it stays on screen. */
const layout = (() => {
  const starts = SHOTS.map((s) => toFrames(resolve(s.at)));
  return SHOTS.map((s, i) => {
    const start = starts[i];
    const nextStart = i + 1 < SHOTS.length ? starts[i + 1] : FILM_FRAMES;
    const next = SHOTS[i + 1];
    // A dissolve into the next shot keeps this one under it until it lands.
    const overlap = next?.enter?.kind === "fade" ? toFrames(next.enter.d) : 0;
    const len = Math.max(1, Math.min(FILM_FRAMES, nextStart + overlap) - start);
    return { shot: s, start, len };
  });
})();

const ShotBody: React.FC<{ readonly shot: Shot }> = ({ shot }) => {
  const { t, dur } = useShot();
  let opacity = 1;
  if (shot.enter && shot.enter.kind !== "flash") {
    opacity = ramp(t, 0, shot.enter.d, EASE.inOut);
  }
  if (shot.exit) {
    opacity = Math.min(opacity, 1 - ramp(t, dur - shot.exit.d, dur, EASE.inOut));
  }
  const flash =
    shot.enter?.kind === "flash" ? 1 - ramp(t, 0, shot.enter.d, EASE.out) : 0;
  let body: React.ReactNode = null;
  if (shot.kind === "clip") {
    body = <Clip {...shot} />;
  } else if (shot.kind === "photo") {
    body = <Photo {...shot} />;
  } else {
    const A = ANIMS[shot.anim];
    if (!A) {
      throw new Error(`Unknown scene ${shot.anim} in shot ${shot.id}`);
    }
    body = <A {...(shot.props ?? {})} />;
  }
  return (
    <AbsoluteFill style={{ opacity }}>
      {body}
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

const LabelLayer: React.FC = () => (
  <>
    {LABELS.map((l, i) => {
      const a = resolve(l.at);
      const b = resolve(l.until);
      const from = toFrames(a);
      const len = Math.max(1, toFrames(b) - from);
      return (
        <Sequence key={`l${i}`} from={from} durationInFrames={len} layout="none">
          <LabelAt line={l.line} sub={l.sub} corner={l.corner} dur={len / FPS} />
        </Sequence>
      );
    })}
    {SUBTITLES.map((s, i) => {
      const from = toFrames(resolve(s.at));
      const len = Math.max(1, toFrames(resolve(s.until)) - from);
      return (
        <Sequence key={`s${i}`} from={from} durationInFrames={len} layout="none">
          <SubAt text={s.text} source={s.source} dur={len / FPS} />
        </Sequence>
      );
    })}
  </>
);

const LabelAt: React.FC<{
  readonly line: string;
  readonly sub?: string;
  readonly corner?: "br" | "bl" | "tr" | "tl";
  readonly dur: number;
}> = (p) => {
  const { t } = useShot();
  return <Label t={t} {...p} />;
};

const SubAt: React.FC<{ readonly text: string; readonly source?: string; readonly dur: number }> = (
  p,
) => {
  const { t } = useShot();
  return <Subtitle t={t} {...p} />;
};

/** A short ramp at both ends of a sound, in frames, so no edit clicks. */
const edges =
  (len: number, gain: number, fadeIn = 3, fadeOut = 3) =>
  (f: number): number =>
    gain * Math.min(1, (f + 1) / fadeIn, Math.max(0, (len - f) / fadeOut));

const SoundLayer: React.FC = () => (
  <>
    {NARRATION_PIECES.map((p, i) => {
      const from = toFrames(p.start);
      const len = toFrames(p.to - p.from);
      return (
        <Sequence key={`n${i}`} from={from} durationInFrames={len} layout="none">
          <Audio
            src={NARRATION}
            trimBefore={toFrames(p.from)}
            trimAfter={toFrames(p.to)}
            volume={(f) => edges(len, 1, 2, 2)(f)}
          />
        </Sequence>
      );
    })}
    {INSERTS.filter((i) => i.sound).map((ins) => {
      const from = toFrames(insertStart(ins.id));
      const len = toFrames(ins.dur);
      const s = ins.sound!;
      return (
        <Sequence key={ins.id} from={from} durationInFrames={len} layout="none">
          <Audio
            src={clipSrc(s.clip)}
            trimBefore={toFrames(s.from)}
            trimAfter={toFrames(s.from + ins.dur)}
            volume={(f) => edges(len, s.gain ?? 1, 4, 9)(f)}
          />
        </Sequence>
      );
    })}
    {SFX.map((s, i) => (
      <Sequence key={`fx${i}`} from={toFrames(resolve(s.at))} layout="none">
        <Audio src={staticFile(`munzer/sfx/${s.file}`)} volume={() => s.gain ?? 1} />
      </Sequence>
    ))}
  </>
);

/**
 * "מאחורי הסיוט": Andreas Münzer.
 *
 * The narration is the master clock (see engine/timeline.ts). Shots are in
 * data/edl.ts, labels, subtitles and sound effects in data/overlays.ts.
 */
export const MunzerDocumentary: React.FC = () => (
  <AbsoluteFill style={{ background: INK.void }}>
    {layout.map(({ shot, start, len }) => (
      <Sequence
        key={shot.id}
        from={start}
        durationInFrames={len}
        premountFor={30}
        name={shot.id}
      >
        <ShotProvider start={start / FPS} dur={len / FPS}>
          <ShotBody shot={shot} />
        </ShotProvider>
      </Sequence>
    ))}
    <Finish />
    <ShotProvider start={0} dur={FILM_FRAMES / FPS}>
      <LabelLayer />
    </ShotProvider>
    <SoundLayer />
  </AbsoluteFill>
);
