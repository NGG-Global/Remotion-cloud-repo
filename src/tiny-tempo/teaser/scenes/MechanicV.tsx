import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring } from "remotion";
import { useClock } from "../../clock";
import { BeatBeads } from "../../components/chrome";
import { PhasePill } from "../../components/feedback";
import { PaperField } from "../../components/stage";
import { HammerNail } from "../../graphics/HammerNail";
import { TT } from "../../theme";
import { bar, beats } from "../format";
import { Landscape } from "../Landscape";
import { Pop, TapTarget } from "../chrome";

/**
 * Bars 4-7: the premise in one phrase. The drums play a two-bar figure
 * (hit, rest, rest, hit | hit, hit, hit, rest) and then play it again. First
 * time through the hammer demonstrates it. Second time the player taps it
 * back, and every tap lands PERFECT.
 */
const PHRASE = beats(0, 3, 4, 5, 6);
const PATTERN = [true, false, false, true, true, true, true, false] as const;

const CARD = { x: 60, y: 430, w: 960, h: 980 } as const;

const Phase: React.FC<{ readonly playing: boolean }> = ({ playing }) => {
  const { frame, fps, time } = useClock();
  const enter = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 140 },
  });
  const slide = interpolate(enter, [0, 1], [playing ? 60 : 0, 0]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 290,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PhasePill label={playing ? "Your turn" : "Watch"} accent={playing} />
      </div>

      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 56,
          overflow: "hidden",
          border: `10px solid ${TT.inkDeep}`,
          boxShadow: `0 22px 0 ${TT.inkDeep}22, 0 0 0 3px ${TT.cream}`,
          transform: `translateY(${slide}px)`,
          background: TT.paper,
        }}
      >
        <Landscape
          width={CARD.w - 20}
          height={CARD.h - 20}
          scale={1.08}
          focusX={1010}
          focusY={560}
        >
          <HammerNail hits={PHRASE} scale={1.1} />
        </Landscape>
        {playing ? (
          <Pop hits={PHRASE} x={CARD.w / 2} y={190} size={84} />
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1470,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <BeatBeads pattern={PATTERN} time={time} size={58} />
      </div>

      {playing ? (
        <TapTarget hits={PHRASE} x={540} y={1660} radius={72} />
      ) : null}
    </AbsoluteFill>
  );
};

export const MechanicV: React.FC = () => {
  return (
    <PaperField sunX={50} sunY={30}>
      <Sequence durationInFrames={bar(2)} name="Watch">
        <Phase playing={false} />
      </Sequence>
      <Sequence from={bar(2)} durationInFrames={bar(2)} name="Your turn">
        <Phase playing />
      </Sequence>
    </PaperField>
  );
};
