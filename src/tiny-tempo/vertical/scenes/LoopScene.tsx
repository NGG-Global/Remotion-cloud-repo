import React from "react";
import { AbsoluteFill } from "remotion";
import { useClock } from "../../clock";
import { BodyCopy, StampType } from "../../components/type";
import { TT } from "../../theme";
import { HammerTall } from "../acts/HammerTall";
import { beats } from "../frame";
import {
  BeatTrack,
  PhaseCue,
  TapRipple,
  Verdict,
  type Mark,
} from "../hud/GameHud";

/** The level-one phrase: three quarter notes and a rest, at the music's 120 BPM. */
const PHRASE = [beats(0), beats(1), beats(2)];

type LoopSceneProps = {
  /** `watch` is the demonstration; `play` is the response the player owns. */
  readonly phase: "watch" | "play";
};

/**
 * The loop itself, in the two halves the game plays it in: a demonstration phrase,
 * then the player's response, back to back on the bar line.
 *
 * Nothing waits between them in the game, so nothing waits between them here. The
 * two bars are separate scenes only so the cue can turn over on the downbeat, and
 * they are dressed differently on purpose — the demonstration is titled, the
 * response is scored, which is the difference the player is being taught.
 */
export const LoopScene: React.FC<LoopSceneProps> = ({ phase }) => {
  const { time } = useClock();
  const playing = phase === "play";

  const marks: Mark[] = PHRASE.map((hit) =>
    time < hit ? "pending" : playing ? "perfect" : "lit",
  );

  return (
    <AbsoluteFill>
      <HammerTall hits={PHRASE} />

      {playing ? (
        <>
          <PhaseCue phase="play" y={286} />
          <TapRipple hits={PHRASE} x={690} y={968} />
          <Verdict hits={PHRASE} x={540} y={1508} size={96} />
        </>
      ) : (
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 196,
          }}
        >
          <StampType text="WATCH IT." size={148} delay={2} fill={TT.cream} />
        </AbsoluteFill>
      )}

      <BeatTrack hits={PHRASE} marks={marks} y={1684} />

      {playing ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 96,
          }}
        >
          <BodyCopy
            text="Perfect is ±55 ms."
            size={44}
            weight={800}
            color={TT.ink}
            delay={16}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
