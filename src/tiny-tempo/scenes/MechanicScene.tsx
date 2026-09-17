import React from "react";
import { AbsoluteFill } from "remotion";
import { useClock } from "../clock";
import { BeatBeads, PlayBlock } from "../components/chrome";
import { JudgementPop, PhasePill } from "../components/feedback";
import { PaperField } from "../components/stage";
import { BodyCopy, StampType } from "../components/type";
import { HammerNail } from "../graphics/HammerNail";
import { BEAT, TT } from "../theme";
import { seconds } from "../../theme";

const DEMO = [BEAT, BEAT * 2, BEAT * 3];
const PLAY = [BEAT * 5, BEAT * 6, BEAT * 7];

export const MechanicScene: React.FC = () => {
  const { time } = useClock();
  const yourTurn = time >= BEAT * 4;
  const hits = yourTurn ? PLAY : DEMO;

  return (
    <PaperField sunX={72} sunY={18}>
      <AbsoluteFill style={{ flexDirection: "row" }}>
        <div
          style={{
            width: "42%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px 0 96px",
            gap: 28,
          }}
        >
          <PhasePill
            label={yourTurn ? "Your turn" : "Watch"}
            accent={yourTurn}
          />
          <StampType
            text={yourTurn ? "Tap it\nback." : "Watch it."}
            size={92}
            fill={TT.ink}
            stroke={TT.cream}
            shadow={false}
            align="left"
            delay={yourTurn ? seconds(0) : seconds(0.1)}
          />
          <BodyCopy
            text="One tap. Arcade windows. Everyday acts."
            color={TT.muted}
            align="left"
            size={32}
            delay={seconds(0.45)}
          />
          <div style={{ marginTop: 12 }}>
            <BeatBeads
              pattern={[true, true, true, false]}
              time={time % (BEAT * 4)}
              size={48}
            />
          </div>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              inset: "48px 72px 48px 0",
              borderRadius: 48,
              overflow: "hidden",
              border: `8px solid ${TT.inkDeep}`,
              boxShadow: `0 18px 0 ${TT.inkDeep}22, 0 0 0 2px ${TT.cream}`,
            }}
          >
            <HammerNail hits={hits} scale={1.22} />
            {yourTurn ? <JudgementPop hits={PLAY} x={980} y={280} /> : null}
          </div>
        </div>
      </AbsoluteFill>
      {yourTurn ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: "0 0 48px 96px",
          }}
        >
          <PlayBlock width={280} delay={seconds(0.15)} label="TAP" />
        </AbsoluteFill>
      ) : null}
    </PaperField>
  );
};
