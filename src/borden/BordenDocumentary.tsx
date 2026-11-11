import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import "./fonts";
import { FPS, LABELS, SHOTS, TOTAL_FRAMES, WIPES, shotEnd } from "./data/timeline";
import { ShotClockProvider, ShotFrame, useShot } from "../gacy/engine/shot";
import { Wipe } from "../gacy/engine/wipes";
import { Label } from "../gacy/type/Label";

export const BORDEN_DURATION = TOTAL_FRAMES;

const f = (s: number) => Math.round(s * FPS);

const LabelOverlay: React.FC<{ line: string; sub?: string }> = ({ line, sub }) => {
  const { t, dur } = useShot();
  return <Label t={t} from={0} to={dur} line={line} sub={sub} />;
};

/**
 * "Behind the Nightmare: Lizzie Borden."
 *
 * One narration track, one timeline (data/timeline.ts). Shots are placed at
 * measured pauses in the voice; wipes and labels float above them. The
 * machinery (shot clock, camera, rig, finishes) is shared with the Gacy
 * episode in src/gacy.
 */
export const BordenDocumentary: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("audio/lizzie-narration.mp3")} />
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
